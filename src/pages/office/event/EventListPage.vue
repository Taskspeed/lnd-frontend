<template>
  <q-page class="event-page">
    <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
    <section class="page-header">
      <div>
        <h5>Events</h5>
        <p>View learning and development events for your office</p>
      </div>
    </section>

    <!-- =====================================================
         EVENTS TABLE CARD
    ====================================================== -->
    <q-card flat class="events-card">
      <!-- ===================================================
           FILTERS
      ==================================================== -->
      <div class="filter-section">
        <q-input v-model="search" outlined dense clearable placeholder="Search by event name" class="search-input">
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <div class="status-filters">
          <q-checkbox v-for="option in STATUS_OPTIONS" :key="option.value" v-model="selectedStatuses"
            :val="option.value" :label="option.label" dense class="status-checkbox" />
        </div>

        <q-btn flat no-caps icon="filter_alt_off" label="Clear" class="clear-btn" @click="clearFilters" />
      </div>

      <!-- ===================================================
           TABLE
      ==================================================== -->
      <q-table flat :rows="filteredRows" :columns="columns" row-key="scheduleId" :loading="officeEventStore.loading"
        v-model:pagination="pagination" class="app-table events-table">
        <!-- Body rows -->
        <template #body="props">
          <q-tr :props="props" class="event-row">
            <q-td key="title_name" :props="props">
              <div class="app-table-cell-title">{{ props.row.title_name }}</div>
            </q-td>
            <q-td key="dateRange" :props="props">

              <div class="app-table-cell-title"> {{ props.row.dateRange }}</div>
            </q-td>

            <q-td key="hours" :props="props">
              <div class="app-table-cell-title"> {{ props.row.hours }}</div>

            </q-td>
            <q-td key="category_name" :props="props">
              <div class="app-table-cell-title"> {{ props.row.category_name }}</div>

            </q-td>


            <q-td key="computedStatus" :props="props">
              <span class="status-badge" :class="'status-' + props.row.computedStatus">
                {{ props.row.computedStatus }}
              </span>
            </q-td>

            <q-td key="action" :props="props">
              <q-btn dense flat no-caps color="green" icon="visibility" class="view-btn"
                @click="goToEvent(props.row.scheduleId)" />
            </q-td>
          </q-tr>
        </template>

        <!-- Empty state -->
        <template #no-data>
          <div class="app-table-empty">No events found.</div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { useOfficeEventStore } from "src/stores/office/event/eventStore";

// Status filter options — value must match the computedStatus values
// coming from the API (e.g. "up-coming", "ongoing", "completed").
const STATUS_OPTIONS = [
  { label: "Up-coming", value: "up-coming" },
  { label: "On-going", value: "ongoing" },
  { label: "Complete", value: "completed" },
];

// Table column definitions
const COLUMNS = [
  { name: "title_name", label: "Event", field: "title_name", align: "left", sortable: true },

  { name: "dateRange", label: "Date", field: "dateRange", align: "left" },
  { name: "hours", label: "Hours", field: "hours", align: "left", sortable: true },
  { name: "category_name", label: "Type of Training", field: "category_name", align: "left", sortable: true },
  { name: "computedStatus", label: "Status", field: "computedStatus", align: "left", sortable: true },
  { name: "action", label: "Action", field: "action", align: "left" },
];

export default defineComponent({
  name: "EventListPage",

  setup() {
    const officeEventStore = useOfficeEventStore();
    const router = useRouter();

    const search = ref("");
    const selectedStatuses = ref([]);

    const pagination = ref({
      sortBy: "title_name",
      descending: false,
      page: 1,
      rowsPerPage: 10,
    });

    // ---------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------
    function formatDateRange(dates) {
      if (!dates || !dates.length) return "—";
      if (dates.length === 1) return dates[0].schedule_date;
      return `${dates[0].schedule_date} – ${dates[dates.length - 1].schedule_date}`;
    }

    // ---------------------------------------------------------------
    // The API returns a FLAT array — one row per schedule, each with
    // its own nested `event` object. Rows can share the same event_id
    // (same event, different schedule) — but each is still its OWN
    // row, since the schedule details (dates, venue, fee, etc.)
    // differ per row.
    // ---------------------------------------------------------------
    const cardEvents = computed(() => {
      const rows = officeEventStore.officeEvents || [];

      return rows.map((row, index) => {
        const evt = row.event || {};

        return {
          no: index + 1,
          event_id: evt.event_id ?? row.event_id,
          scheduleId: row.scheduleId,
          title_name: evt.title_name || "—",
          created_at: evt.created_at || "—",

          venue: row.venue_name || "—",
          mode_name: row.mode_name || "—",
          fee: row.fee || "—",
          hours: row.hours || "—",
          qualifications: row.qualifications || "—",
          source_name: row.source_name || "—",
          conducted_by: row.conducted_by || "—",
          type_name: row.type_name || "—",
          category_name: row.category_name || "—",
          computedStatus: row.computedStatus || "—",

          dateRange: formatDateRange(row.schedule_date_time),
          offices: (row.office || []).map((o) => o.office_name),
        };
      });
    });

    // ---------------------------------------------------------------
    // Search + status filter
    // ---------------------------------------------------------------
    const filteredRows = computed(() => {
      const term = search.value?.toLowerCase().trim();

      return cardEvents.value.filter((row) => {
        const matchesStatus =
          !selectedStatuses.value.length ||
          selectedStatuses.value.includes(row.computedStatus);

        if (!matchesStatus) return false;
        if (!term) return true;

        return [row.title_name, row.venue, row.computedStatus, row.type_name]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(term));
      });
    });

    const totalCount = computed(() => cardEvents.value.length);

    function clearFilters() {
      search.value = "";
      selectedStatuses.value = [];
    }

    // ---------------------------------------------------------------
    // Navigation — adjust route name/params to match your router
    // ---------------------------------------------------------------
    function goToEvent(scheduleId) {
      router.push({ name: "office-event-view", params: { scheduleId } });
    }

    onMounted(() => {
      officeEventStore.fetchOfficeEvents();
    });

    return {
      officeEventStore,

      search,
      selectedStatuses,
      STATUS_OPTIONS,
      columns: COLUMNS,
      pagination,

      filteredRows,
      totalCount,
      clearFilters,

      goToEvent,
    };
  },
});
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */

.event-page {
  min-height: 100%;
  padding: 20px;
  color: #19354a;
}

/* =========================================================
   PAGE HEADER
========================================================= */

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.page-header h5 {
  margin: 5px 0 3px;
  color: #19354a;
  font-size: 18px;
  font-weight: 750;
}

.page-header p {
  margin: 0;
  color: #718089;
  font-size: 12px;
}

/* =========================================================
   EVENTS CARD (container)
========================================================= */

.events-card {
  overflow: hidden;
  border-radius: 13px;
  background: #ffffff;
  box-shadow: 0 3px 12px rgba(30, 70, 42, 0.055);
}

/* =========================================================
   FILTERS
========================================================= */

.filter-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 20px;
  border-bottom: 1px solid #edf1ef;
  background: #fcfdfc;
}

.search-input {
  flex: 1;
  max-width: 380px;
}

.search-input :deep(.q-field__control) {
  min-height: 38px;
  border-radius: 8px;
}

.search-input :deep(.q-field__native) {
  font-size: 11px;
}

.search-input :deep(.q-field__prepend) {
  color: #809097;
}

.clear-btn {
  color: #6f8087;
  font-size: 10px;
}

/* =========================================================
   STATUS CHECKBOX FILTERS
========================================================= */

.status-filters {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.status-checkbox :deep(.q-checkbox__label) {
  color: #425b68;
  font-size: 11px;
}

/* =========================================================
   TABLE
========================================================= */

.event-row {}

/* =========================================================
   ACTION / VIEW BUTTON
========================================================= */

.view-btn {
  color: #2b6cb0;
  font-size: 11px;
  font-weight: 650;
}

/* =========================================================
   STATUS BADGE
========================================================= */

/* .status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.2px;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-created {
  color: #2b6cb0;
  background: #e7f0fb;
}

.status-up-coming {
  color: #b8860b;
  background: #fbf3df;
}

.status-ongoing {
  color: #087c42;
  background: #e1f7e7;
}

.status-completed {
  color: #5c6b73;
  background: #eef1f2;
} */

/* .status-cancelled {
  color: #c73f3f;
  background: #fbe9e9;
} */

/* =========================================================
   RESPONSIVE
========================================================= */


@media (max-width: 900px) {
  .filter-section {
    flex-wrap: wrap;
  }

  .search-input {
    max-width: none;
    width: 100%;
    flex-basis: 100%;
  }
}

@media (max-width: 650px) {
  .event-page {
    padding: 14px;
  }

  .page-header {
    align-items: flex-start;
    gap: 15px;
    flex-direction: column;
  }
}
</style>