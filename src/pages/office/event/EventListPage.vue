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
      <q-table flat :rows="rows" :columns="columns" row-key="scheduleId" :loading="officeEventStore.loading"
        v-model:pagination="officeEventStore.pagination" :rows-per-page-options="[1, 10, 20, 50, 100]"
        @request="onRequest" class="app-table events-table">
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
            <q-td key="type_name" :props="props">
              <div class="app-table-cell-title"> {{ props.row.type_name }}</div>

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

<script>import { defineComponent, computed, onMounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { debounce } from "quasar";
import { useOfficeEventStore } from "src/stores/office/event/eventStore";

const STATUS_OPTIONS = [
  { label: "Up-coming", value: "up-coming" },
  { label: "On-going", value: "ongoing" },
  { label: "Complete", value: "complete" },
];

// Tinanggal ang sortable, kasi ang backend ay naka-order by id desc lang
const COLUMNS = [
  { name: "title_name", label: "Event", field: "title_name", align: "left" },
  { name: "dateRange", label: "Date", field: "dateRange", align: "left" },
  { name: "hours", label: "Hours", field: "hours", align: "left" },
  { name: "type_name", label: "Type of Training", field: "type_name", align: "left" },
  { name: "computedStatus", label: "Status", field: "computedStatus", align: "left" },
  { name: "action", label: "Action", field: "action", align: "left" },
];

export default defineComponent({
  name: "EventListPage",

  setup() {
    const officeEventStore = useOfficeEventStore();
    const router = useRouter();
    const route = useRoute();

    const search = ref("");
    const selectedStatuses = ref([]);

    const applyQueryStatus = () => {
      const s = route.query.status;
      const valid = STATUS_OPTIONS.map((o) => o.value);
      selectedStatuses.value = valid.includes(s) ? [s] : [];
    };

    // ---------------------------------------------------------------
    // Fetch (server-side)
    // ---------------------------------------------------------------
    async function fetchEvents() {
      await officeEventStore.fetchOfficeEvents({
        search: search.value?.trim(),
        status: selectedStatuses.value,
      });
    }

    // Tinatawag ng q-table kapag nag-change ng page o rows per page
    function onRequest({ pagination: p }) {
      officeEventStore.pagination.page = p.page;
      officeEventStore.pagination.rowsPerPage = p.rowsPerPage;
      fetchEvents();
    }


    function resetToFirstPageAndFetch() {
      officeEventStore.pagination.page = 1;
      fetchEvents();
    }
    const debouncedSearch = debounce(resetToFirstPageAndFetch, 400);

    // Initialize the URL filter before its watcher to avoid a duplicate
    // fetch during the initial page load.
    applyQueryStatus();

    watch(search, debouncedSearch);
    watch(selectedStatuses, resetToFirstPageAndFetch, { deep: true });

    // ---------------------------------------------------------------
    // Rows mapping
    // ---------------------------------------------------------------
    const rows = computed(() =>
      (officeEventStore.officeEvents || []).map((row) => {
        const evt = row.event || {};
        return {
          event_id: evt.event_id ?? row.event_id,
          scheduleId: row.scheduleId,
          title_name: evt.title_name || "—",
          venue: row.venue_name || "—",
          hours: row.hours || "—",
          type_name: row.type_name || "—",
          computedStatus: row.computedStatus || "—",
          dateRange: row.schedule_date_range || "—",
        };
      })
    );

    function clearFilters() {
      search.value = "";
      selectedStatuses.value = [];
    }

    function goToEvent(scheduleId) {
      router.push({ name: "office-event-view", params: { scheduleId } });
    }

    watch(() => route.query.status, applyQueryStatus);
    onMounted(() => {
      officeEventStore.pagination.page = 1;
      fetchEvents();
    });



    return {
      officeEventStore,
      search,
      selectedStatuses,
      STATUS_OPTIONS,
      columns: COLUMNS,
      rows,
      onRequest,
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


/* =========================================================
   ACTION / VIEW BUTTON
========================================================= */

.view-btn {
  color: #2b6cb0;
  font-size: 11px;
  font-weight: 650;
}


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
