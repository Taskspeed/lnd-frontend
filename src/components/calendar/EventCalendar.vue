<template>
  <div class="ec">
    <!-- HEADER -->
    <header class="ec-head">

      <h2 class="ec-title">Calendar</h2>

      <div class="ec-tools">
        <span v-if="loadError" class="ec-error">{{ loadError }}</span>

        <q-btn-toggle v-model="mode" no-caps unelevated dense class="ec-toggle" toggle-color="white"
          toggle-text-color="dark" color="grey-2" text-color="grey-7" :options="[
            { label: 'Default', value: 'default' },
            { label: 'Heat map', value: 'heat' },
          ]" />
        <q-btn outline no-caps dense class="ec-today" label="Today" @click="goToday" />
      </div>
    </header>

    <div class="ec-body">
      <!-- SIDEBAR -->
      <aside class="ec-side">
        <q-date v-model="selectedDate" mask="YYYY-MM-DD" minimal flat first-day-of-week="1" color="green-7"
          :events="eventDatesForPicker" event-color="green-5" class="ec-mini" @navigation="onMiniNavigate" />

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
        <q-calendar-month ref="calendar" v-model="selectedDate" bordered :weekdays="[1, 2, 3, 4, 5, 6, 0]"
          :day-min-height="120" :day-style="dayStyle" locale="en-PH">
          <!-- HEAT MAP: bilang ng events (kulay ng buong cell = dayStyle sa script)
               DEFAULT: spacer lang, para lumaki ang row kasya ang mga bar -->
          <template #day="{ scope: { timestamp, outside } }">
            <div v-if="mode === 'heat'" class="ec-heat" :class="{ 'ec-dim': outside }">
              <template v-if="countFor(timestamp.date)">
                <span class="ec-heat-label">Events</span>
                <span class="ec-heat-value">{{ countFor(timestamp.date) }}</span>
              </template>
            </div>
            <div v-else :style="{ height: spacerHeight(timestamp) }"></div>
          </template>

          <!-- DEFAULT MODE: tuloy-tuloy na bar para sa multi-day events -->
          <template #week="{ scope: { week } }">
            <div v-if="mode === 'default'" class="ec-week">
              <template v-for="layout in [weekLayout(week.map((d) => d.date))]" :key="layout.first">
                <div v-for="bar in layout.bars" :key="bar.seg.key" class="ec-bar"
                  :class="{ 'ec-bar--cl': bar.contLeft, 'ec-bar--cr': bar.contRight }" :style="{
                    gridColumn: `${bar.from + 1} / ${bar.to + 2}`,
                    gridRow: bar.lane + 1,
                    background: colorOf(bar.seg.status),
                  }" :title="bar.seg.tooltip" role="button" tabindex="0" @click.stop="openEvent(bar.seg)"
                  @keydown.enter.stop="openEvent(bar.seg)">
                  {{ bar.seg.title }}
                </div>
                <div v-for="m in layout.more" :key="`more-${m.idx}`" class="ec-more"
                  :style="{ gridColumn: m.idx + 1, gridRow: MAX_LANES + 1 }" role="button" tabindex="0"
                  @click.stop="openDay(layout.dates[m.idx])" @keydown.enter.stop="openDay(layout.dates[m.idx])">
                  +{{ m.count }} more
                </div>
              </template>
            </div>
          </template>
        </q-calendar-month>

        <q-inner-loading :showing="pending > 0" color="green-7" />
      </section>
    </div>

    <!-- DIALOG: detalye ng event / listahan ng events sa isang araw -->
    <q-dialog v-model="dialogOpen" @hide="resetDialog">
      <q-card class="ec-dialog">
        <q-card-section class="ec-dialog-head">
          <q-btn v-if="activeSeg && dayDate" flat round dense icon="arrow_back" @click="activeSeg = null" />
          <div class="ec-dialog-title">
            {{ activeSeg ? activeSeg.title : fmtLong(dayDate) }}
          </div>
          <q-space />
          <q-btn flat round dense icon="close" @click="dialogOpen = false" />
        </q-card-section>

        <!-- DETALYE -->
        <q-card-section v-if="activeSeg" class="ec-dialog-body">
          <span class="ec-chip" :style="{ color: colorOf(activeSeg.status), borderColor: colorOf(activeSeg.status) }">
            {{ statusLabel(activeSeg.status) }}
          </span>

          <div class="ec-info">
            <q-icon name="place" size="18px" />
            <span>{{ activeSeg.venue || 'No venue' }}</span>
          </div>
          <div class="ec-info">
            <q-icon name="event" size="18px" />
            <span>{{ rangeLabel(activeSeg) }}</span>
          </div>

          <div class="ec-days">
            <div v-for="d in activeSeg.days" :key="d.date" class="ec-day-row">
              <strong>{{ fmtLong(d.date) }}</strong>
              <span v-if="d.am">AM: {{ d.am }}</span>
              <span v-if="d.pm">PM: {{ d.pm }}</span>
            </div>
          </div>
        </q-card-section>

        <!-- LISTAHAN NG EVENTS SA ISANG ARAW -->
        <q-list v-else separator>
          <q-item v-for="seg in daySegments" :key="seg.key" clickable @click="openEvent(seg)">
            <q-item-section avatar>
              <span class="ec-dot" :style="{ background: colorOf(seg.status) }"></span>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ seg.title }}</q-item-label>
              <q-item-label caption>{{ seg.venue }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <!-- ACTIONS (detalye lang) -->
        <q-card-actions v-if="activeSeg" align="right" class="ec-dialog-actions">
          <!-- <q-btn flat no-caps label="Close" @click="dialogOpen = false" /> -->
          <q-btn unelevated no-caps color="green-7" label="View Details" @click="viewEvent" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { QCalendarMonth } from '@quasar/quasar-ui-qcalendar'
import '@quasar/quasar-ui-qcalendar/dist/index.css'
// Ayusin ang path kung iba ang lokasyon ng store mo
import { useDashboardStore } from 'src/stores/administrator/dashboard/dashboardStore'

const store = useDashboardStore()

// Lumalabas kapag may na-click na event (para magamit ng parent, hal. router.push)
const emit = defineEmits(['event-click', 'view-event'])

const calendar = ref(null)
const selectedDate = ref(new Date().toLocaleDateString('en-CA')) // YYYY-MM-DD (local)
const mode = ref('default') // 'default' | 'heat'

/* ---------- STATUS FILTERS ---------- */
const statuses = [
  { value: 'upcoming', label: 'Up-coming', color: '#b8860b' },
  { value: 'ongoing', label: 'On-going', color: '#087c42' },
  { value: 'completed', label: 'Complete', color: '#2b6cb0' },
]
const activeStatuses = ref(statuses.map((s) => s.value))
const colorOf = (status) => statuses.find((s) => s.value === status)?.color

// computedStatus mula sa API ("complete", atbp.) -> value ng filter
const normalizeStatus = (raw) => {
  const v = String(raw || '').toLowerCase()
  if (v.startsWith('complete')) return 'completed'
  if (v.includes('going')) return 'ongoing'
  return 'upcoming'
}

/* ---------- DATE HELPERS ---------- */
const pad = (n) => String(n).padStart(2, '0')

// "YYYY-MM-DD" + n araw -> "YYYY-MM-DD"
const addDays = (iso, n) => {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d + n)
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`
}
const fmtLong = (iso) =>
  iso
    ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-PH', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    : ''
const fmtShort = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })

const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
}

// "September 10, 2026" -> "2026-09-10"
const toIso = (str) => {
  const s = String(str || '').trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  const m = /^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/.exec(s)
  if (m) {
    const mon = MONTHS[m[1].toLowerCase()]
    if (mon) return `${m[3]}-${pad(mon)}-${pad(m[2])}`
  }
  return null
}

/* ---------- EVENTS (mula sa API) ---------- */
const eventMap = ref({}) // key: `${scheduleId}-${dateTimeId}` -> iwas duplicate
const events = computed(() => Object.values(eventMap.value))

const pending = ref(0)
const loadError = ref('')
const loadedKeys = new Set() // mga buwang na-fetch na ('YYYY-MM')

const loadMonth = async (year, month) => {
  const key = `${year}-${pad(month)}`
  if (loadedKeys.has(key)) return
  loadedKeys.add(key)

  pending.value++
  const res = await store.fetchCalendar(year, month)
  pending.value--

  if (!res.success) {
    loadedKeys.delete(key) // para ma-retry sa susunod
    loadError.value = res.message || 'Failed to load events'
    return
  }
  loadError.value = ''

  const next = { ...eventMap.value }
  const schedules = res.data || []
  schedules.forEach((s) => {
    const days = s.schedule_date_time || []
    days.forEach((d) => {
      const date = toIso(d.schedule_date)
      if (!date) return
      const title = s.event?.title_name || ' '
      next[`${s.scheduleId}-${d.id}`] = {
        id: `${s.scheduleId}-${d.id}`,
        scheduleId: s.scheduleId,
        title,
        date,
        status: normalizeStatus(s.computedStatus),
        eventId: s.event_id,
        venue: s.venue_name || '',
        am: d.morning_in && d.morning_out ? `${d.morning_in} - ${d.morning_out}` : '',
        pm: d.afternoon_in && d.afternoon_out ? `${d.afternoon_in} - ${d.afternoon_out}` : '',
      }
    })
  })
  eventMap.value = next
}

const viewEvent = () => {
  if (!activeSeg.value) return
  emit('view-event', activeSeg.value)
  dialogOpen.value = false
}
// Kukunin ang buwan na nakikita + nakaraan + susunod (para lumabas din ang
// mga araw ng kalapit na buwan sa grid). Naka-cache, kaya bago lang ang ifi-fetch.
watch(
  () => selectedDate.value.slice(0, 7),
  () => {
    const [y, m] = selectedDate.value.split('-').map(Number)
    loadMonth(y, m)
  },
  { immediate: true }
)

const visibleEvents = computed(() =>
  events.value.filter((e) => activeStatuses.value.includes(e.status))
)

const eventsFor = (date) => visibleEvents.value.filter((e) => e.date === date)
const countFor = (date) => eventsFor(date).length

const eventDatesForPicker = computed(() =>
  visibleEvents.value.map((e) => e.date.replace(/-/g, '/'))
)

/* ---------- MULTI-DAY BARS ----------
   Ang magkakasunod na araw ng iisang schedule ay ginagawang ISANG bar. */
const MAX_LANES = 3 // ilang bar ang nakikita bawat linggo, ang iba ay "+n more"

const segments = computed(() => {
  const groups = {}
  visibleEvents.value.forEach((e) => {
    if (!groups[e.scheduleId]) groups[e.scheduleId] = []
    groups[e.scheduleId].push(e)
  })

  const runs = []
  Object.values(groups).forEach((list) => {
    const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date))
    let run = null
    sorted.forEach((e) => {
      if (run && (e.date === run.end || e.date === addDays(run.end, 1))) {
        run.end = e.date
        if (!run.days.some((d) => d.date === e.date)) run.days.push(e)
      } else {
        run = {
          key: `${e.scheduleId}-${e.date}`,
          scheduleId: e.scheduleId,
          eventId: e.eventId,
          title: e.title,
          status: e.status,
          venue: e.venue,
          start: e.date,
          end: e.date,
          days: [e],
        }
        runs.push(run)
      }
    })
  })

  return runs.map((r) => ({
    ...r,
    tooltip: [
      r.title,
      r.venue,
      r.start === r.end ? fmtShort(r.start) : `${fmtShort(r.start)} - ${fmtShort(r.end)}`,
      'Click for details',
    ]
      .filter(Boolean)
      .join('\n'),
  }))
})

// dates = 7 na petsa (YYYY-MM-DD) ng isang linggo, Lunes-Linggo
const weekLayout = (dates) => {
  const first = dates[0]
  const last = dates[dates.length - 1]

  const items = []
  segments.value.forEach((seg) => {
    if (seg.end < first || seg.start > last) return
    const from = dates.findIndex((d) => d >= seg.start)
    const to = dates.reduce((acc, d, i) => (d <= seg.end ? i : acc), -1)
    items.push({ seg, from, to, contLeft: seg.start < first, contRight: seg.end > last })
  })

  items.sort(
    (a, b) =>
      a.from - b.from ||
      b.to - b.from - (a.to - a.from) ||
      a.seg.title.localeCompare(b.seg.title)
  )

  const laneEnds = []
  items.forEach((it) => {
    let lane = laneEnds.findIndex((end) => end < it.from)
    if (lane === -1) lane = laneEnds.length
    laneEnds[lane] = it.to
    it.lane = lane
  })

  const bars = items.filter((it) => it.lane < MAX_LANES)
  const counts = dates.map(() => 0)
  items
    .filter((it) => it.lane >= MAX_LANES)
    .forEach((it) => {
      for (let i = it.from; i <= it.to; i++) counts[i]++
    })
  const more = counts.map((count, idx) => ({ idx, count })).filter((m) => m.count > 0)
  const laneCount = bars.reduce((mx, b) => Math.max(mx, b.lane + 1), 0)

  return { first, dates, bars, more, laneCount }
}

// Ang 7 petsa ng linggo (Lunes-Linggo) na kinabibilangan ng isang araw
const weekDatesOf = (timestamp) => {
  const offset = (Number(timestamp.weekday) + 6) % 7
  const monday = addDays(timestamp.date, -offset)
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

// Taas na nire-reserve sa ilalim ng petsa para kasya ang mga bar
const spacerHeight = (timestamp) => {
  const layout = weekLayout(weekDatesOf(timestamp))
  const rows = layout.laneCount + (layout.more.length ? 1 : 0)
  return rows ? `${rows * 24 + 6}px` : '0px'
}

/* ---------- CLICK / DIALOG ---------- */
const dialogOpen = ref(false)
const activeSeg = ref(null) // napiling event (detalye)
const dayDate = ref(null) // napiling araw (listahan ng events)

const statusLabel = (status) => statuses.find((s) => s.value === status)?.label || status
const rangeLabel = (seg) =>
  seg.start === seg.end ? fmtLong(seg.start) : `${fmtLong(seg.start)} - ${fmtLong(seg.end)}`

const daySegments = computed(() =>
  dayDate.value
    ? segments.value.filter((seg) => seg.start <= dayDate.value && seg.end >= dayDate.value)
    : []
)

const openEvent = (seg) => {
  activeSeg.value = seg
  dialogOpen.value = true
  emit('event-click', seg)
}
const openDay = (date) => {
  activeSeg.value = null
  dayDate.value = date
  dialogOpen.value = true
}
const resetDialog = () => {
  activeSeg.value = null
  dayDate.value = null
}

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
// Kapag nag-next/prev ng buwan sa mini calendar, lilipat din ang malaking calendar
const onMiniNavigate = ({ year, month }) => {
  const [y, m, d] = selectedDate.value.split('-').map(Number)
  if (y === year && m === month) return // walang pagbabago, iwas loop

  // panatilihin ang araw kung kaya (hal. 31 -> 30 kapag 30 lang ang araw ng buwan)
  const lastDay = new Date(year, month, 0).getDate()
  const day = Math.min(d, lastDay)

  selectedDate.value = `${year}-${pad(month)}-${pad(day)}`
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

.ec-error {
  color: #c62828;
  font-size: 12px;
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
  height: 100%;
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
  display: inline-block;
  padding: 2px 10px;
  border: 1px solid;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

/* MAIN */
.ec-main {
  position: relative;
  /* para sa q-inner-loading */
  min-width: 0;
}

/* DAY CONTENT */
.ec-week {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  grid-auto-rows: 22px;
  row-gap: 2px;
  padding: 2px 0 4px;
}

.ec-bar {
  margin: 0 3px;
  padding: 0 8px;
  border-radius: 6px;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  line-height: 22px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: filter 0.15s;
}

.ec-bar:hover,
.ec-bar:focus-visible {
  filter: brightness(1.12);
  outline: none;
}

/* tuloy ang bar mula/papunta sa kalapit na linggo */
.ec-bar--cl {
  margin-left: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.ec-bar--cr {
  margin-right: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.ec-more {
  align-self: center;
  padding-left: 8px;
  color: var(--ec-muted);
  font-size: 10px;
  cursor: pointer;
}

.ec-more:hover {
  color: var(--ec-text);
  text-decoration: underline;
}

/* DIALOG */
.ec-dialog {
  width: 750px;
  max-width: 92vw;
  color: #243b4c;
}

.ec-dialog-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 4px;
}

.ec-dialog-title {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
}

.ec-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}

.ec-info {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
}

.ec-days {
  width: 100%;
  border-top: 1px solid #e8edea;
  padding-top: 8px;
}

.ec-day-row {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 6px 0;
  font-size: 12px;
}

.ec-day-row span {
  color: #687a83;
}

.ec-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
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