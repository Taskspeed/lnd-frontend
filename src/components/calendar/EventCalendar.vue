<template>
  <div class="ec">
    <!-- HEADER -->
    <header class="ec-head">
      <h2 class="ec-title">Calendar</h2>

      <div class="ec-tools">
        <q-btn-toggle
          v-model="mode"
          no-caps
          unelevated
          dense
          class="ec-toggle"
          toggle-color="white"
          toggle-text-color="dark"
          color="grey-2"
          text-color="grey-7"
          :options="[
            { label: 'Default', value: 'default' },
            { label: 'Heat map', value: 'heat' },
          ]"
        />
        <q-btn outline no-caps dense class="ec-today" label="Today" @click="goToday" />
      </div>
    </header>

    <div class="ec-body">
      <!-- SIDEBAR -->
      <aside class="ec-side">
       <q-date
        v-model="selectedDate"
        mask="YYYY-MM-DD"
        minimal
        flat
        first-day-of-week="1"
        color="green-7"
        :events="eventDatesForPicker"
        event-color="green-5"
        class="ec-mini"
        @navigation="onMiniNavigate"
      />

        <div class="ec-filter-title">Status</div>
        <div v-for="s in statuses" :key="s.value" class="ec-filter">
          <q-checkbox v-model="activeStatuses" :val="s.value" dense color="green-7" />
          <span class="ec-chip" :style="{ color: s.color, borderColor: s.color }">
            {{ s.label }}
          </span>
        </div>
      </aside>

      <!-- MAIN CALENDAR -->
      <section class="ec-main">
        <!-- <div class="ec-nav">
          <q-btn flat round dense icon="chevron_left" @click="calendar.prev()" />
          <strong class="ec-month-label">{{ monthLabel }}</strong>
          <q-btn flat round dense icon="chevron_right" @click="calendar.next()" />
        </div> -->

        <q-calendar-month
          ref="calendar"
          v-model="selectedDate"
          bordered
          :weekdays="[1, 2, 3, 4, 5, 6, 0]"
          :day-min-height="104"
          :day-style="dayStyle"
          locale="en-PH"
        >
          <template #day="{ scope: { timestamp, outside } }">
            <!-- HEAT MAP MODE (kulay ng buong cell = dayStyle sa script) -->
            <div v-if="mode === 'heat'" class="ec-heat" :class="{ 'ec-dim': outside }">
              <template v-if="countFor(timestamp.date)">
                <span class="ec-heat-label">Events</span>
                <span class="ec-heat-value">{{ countFor(timestamp.date) }}</span>
              </template>
            </div>

            <!-- DEFAULT MODE -->
            <div v-else class="ec-events" :class="{ 'ec-dim': outside }">
              <div
                v-for="ev in eventsFor(timestamp.date).slice(0, 2)"
                :key="ev.id"
                class="ec-event"
                :style="{ background: colorOf(ev.status) }"
                :title="ev.title"
              >
                {{ ev.title }}
              </div>
              <div v-if="eventsFor(timestamp.date).length > 2" class="ec-more">
                +{{ eventsFor(timestamp.date).length - 2 }} more
              </div>
            </div>
          </template>
        </q-calendar-month>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { QCalendarMonth } from '@quasar/quasar-ui-qcalendar'
import '@quasar/quasar-ui-qcalendar/dist/index.css'

const calendar = ref(null)
const selectedDate = ref('2026-09-21')
const mode = ref('default') // 'default' | 'heat'

/* ---------- STATUS FILTERS ---------- */
const statuses = [
  { value: 'upcoming', label: 'Up-coming', color: '#b8860b' },
  { value: 'ongoing', label: 'On-going', color: '#087c42' },
  { value: 'completed', label: 'Complete', color: '#2b6cb0' },
]
const activeStatuses = ref(statuses.map((s) => s.value))
const colorOf = (status) => statuses.find((s) => s.value === status)?.color

/* ---------- EVENTS ----------
   Sample data lang ito. Palitan ng data mula sa Laravel API
   (fields: id, title, date 'YYYY-MM-DD', status).            */
const events = ref([
  { id: 1, title: 'Leadership Training', date: '2026-09-08', status: 'completed' },
  { id: 2, title: 'Records Mgmt Seminar', date: '2026-09-15', status: 'completed' },
  { id: 3, title: 'ERMS Orientation', date: '2026-09-21', status: 'ongoing' },
  { id: 4, title: 'Customer Service', date: '2026-09-21', status: 'ongoing' },
  { id: 5, title: 'Ethics Workshop', date: '2026-09-21', status: 'upcoming' },
  { id: 6, title: 'SPMS Refresher', date: '2026-09-24', status: 'upcoming' },
  { id: 7, title: 'Basic Excel', date: '2026-09-29', status: 'upcoming' },
])

const visibleEvents = computed(() =>
  events.value.filter((e) => activeStatuses.value.includes(e.status))
)

const eventsFor = (date) => visibleEvents.value.filter((e) => e.date === date)
const countFor = (date) => eventsFor(date).length

const eventDatesForPicker = computed(() =>
  visibleEvents.value.map((e) => e.date.replace(/-/g, '/'))
)

/* ---------- HEAT MAP ---------- */
const maxCount = computed(() => {
  const counts = {}
  visibleEvents.value.forEach((e) => (counts[e.date] = (counts[e.date] || 0) + 1))
  return Math.max(1, ...Object.values(counts))
})

const heatColor = (date) => {
  const n = countFor(date)
  if (!n) return 'transparent'
  const alpha = 0.12 + (n / maxCount.value) * 0.5
  return `rgba(22, 184, 77, ${alpha.toFixed(2)})`
}

// Ipinapasa sa QCalendar para ang BUONG cell ang makulayan, hindi lang ang loob
const dayStyle = ({ scope }) =>
  mode.value === 'heat' ? { background: heatColor(scope.timestamp.date) } : {}

/* ---------- NAVIGATION ---------- */
const monthLabel = computed(() =>
  new Date(selectedDate.value + 'T00:00:00').toLocaleDateString('en-PH', {
    month: 'long',
    year: 'numeric',
  })
)
// Kapag nag-next/prev ng buwan sa mini calendar, lilipat din ang malaking calendar
const onMiniNavigate = ({ year, month }) => {
  const [y, m, d] = selectedDate.value.split('-').map(Number)
  if (y === year && m === month) return // walang pagbabago, iwas loop

  // panatilihin ang araw kung kaya (hal. 31 → 30 kapag 30 lang ang araw ng buwan)
  const lastDay = new Date(year, month, 0).getDate()
  const day = Math.min(d, lastDay)

  selectedDate.value = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const goToday = () => calendar.value?.moveToToday()
</script>

<style scoped>
.ec {
  --ec-accent: #16b84d;
  --ec-border: #e8edea;
  --ec-text: #243b4c;
  --ec-muted: #8a969c;

  padding: 16px 20px 20px;
  color: var(--ec-text);
}

/* HEADER */
.ec-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.ec-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}
.ec-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ec-toggle {
  border: 1px solid var(--ec-border);
  border-radius: 8px;
}
.ec-today {
  border-color: var(--ec-border);
  border-radius: 8px;
  padding: 0 12px;
}

/* LAYOUT */
.ec-body {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

/* SIDEBAR */
.ec-side {
  border: 1px solid var(--ec-border);
  border-radius: 12px;
  padding: 12px;
}
/* q-date may minimum na 290px ang lapad, kaya 320px ang sidebar */
.ec-mini {
  width: 100%;
  max-width: 100%;
  box-shadow: none;
}
.ec-filter-title {
  margin: 14px 0 8px;
  padding-top: 12px;
  border-top: 1px solid var(--ec-border);
  font-weight: 600;
  font-size: 13px;
}
.ec-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.ec-chip {
  padding: 2px 10px;
  border: 1px solid;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

/* MAIN */
.ec-main {
  min-width: 0;
}
.ec-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.ec-month-label {
  min-width: 140px;
  text-align: center;
}

/* DAY CONTENT */
.ec-events {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 2px 4px 4px;
}
.ec-event {
  overflow: hidden;
  padding: 2px 6px;
  border-radius: 4px;
  color: #fff;
  font-size: 11px;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.ec-more {
  color: var(--ec-muted);
  font-size: 10px;
  padding-left: 4px;
}
.ec-heat {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  min-height: 70px;
  padding: 4px 8px 8px;
}
.ec-heat-label {
  color: var(--ec-muted);
  font-size: 10px;
}
.ec-heat-value {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.1;
}
.ec-dim {
  opacity: 0.45;
}

/* QCalendar overrides */
.ec-main :deep(.q-calendar-month) {
  border-radius: 12px;
  overflow: hidden;
  color: var(--ec-text);
}
.ec-main :deep(.q-calendar-month__day--label) {
  font-size: 12px;
}

/* RESPONSIVE */
@media (max-width: 1000px) {
  .ec-body {
    grid-template-columns: 1fr;
  }
  .ec-side {
    max-width: 320px;
  }
}
</style>