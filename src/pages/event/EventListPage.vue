<template>
  <q-page class="event-page">
    <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
    <section class="page-header">
      <div>
        <h5>{{ "Event Management list" }}</h5>

        <p>{{"Manage learning and development events and their schedules." }}</p>
      </div>

      <q-btn
       
        unelevated
        no-caps
        icon="add"
        label="Add Event"
        class="add-event-btn"
        @click="openAddEvent"
      />
    </section>

    <!-- =====================================================
         EVENTS CARD
    ====================================================== -->
    <q-card flat class="events-card">
      <!-- ===================================================
           FILTERS
      ==================================================== -->
      <div class="filter-section">
        <q-input
          v-model="search"
          outlined
          dense
          clearable
          placeholder="Search by event name, venue, or status..."
          class="search-input"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-btn
          flat
          no-caps
          icon="filter_alt_off"
          label="Clear"
          class="clear-btn"
          @click="clearFilters"
        />
      </div>

      <!-- ===================================================
           TABLE
      ==================================================== -->
      <div class="table-wrapper">
        <q-table
          flat
          :rows="filteredRows"
          :columns="columns"
          row-key="event_id"
     
          :rows-per-page-options="[0,2,10,40,100]"
          :loading="eventStore.loading"
          class="events-table"
        >
          <!-- EVENT NAME -->
          <template #body-cell-event="props">
            <q-td :props="props">
              <div class="event-name">{{ props.row.title_name }}</div>
              <!-- <div class="event-meta">{{ props.row.type_name || "—" }} need to change LND type</div> -->  
            </q-td>
          </template>

        <template #body-cell-schedule="props">
      <q-td :props="props">
        <span class="event-name">{{ props.row.latest_schedule }}</span>
      </q-td>
    </template>

          <!-- STATUS -->
          <template #body-cell-status="props">
            <q-td :props="props">
                  <span class="status-badge" :class="'status-' + props.row.computedStatus">
                {{ props.row.computedStatus }}
              </span>
            </q-td>
          </template>

          <!-- ACTIONS -->
          <template #body-cell-actions="props">
            <q-td :props="props">
              <div class="action-buttons">
                <q-btn
                 
                  flat
                  round
                  dense
                  icon="visibility"
                  class="action-view"
                  color="green"
                  @click="goToEvent(props.row.event_id)"
                >
                  <q-tooltip>View Event</q-tooltip>
                </q-btn>

                <q-btn
                 
                  flat
                  round
                  dense
                  icon="edit"
                  class="action-edit"
                  color="orange"
                  @click="editEvent(props.row.raw)"
                >
                  <q-tooltip>Edit Event</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  class="action-delete"
                  @click="confirmDeleteEvent(props.row.raw)"
                >
                  <q-tooltip>Delete Event</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <!-- EMPTY STATE -->
          <template #no-data>
            <div class="table-empty">No events found.</div>
          </template>
        </q-table>
      </div>

      <!-- ===================================================
           TABLE FOOTER
      ==================================================== -->

    </q-card>

    <!-- =====================================================
         EDIT EVENT DIALOG
    ====================================================== -->
    <q-dialog v-model="showFormDialog">
      <q-card class="event-dialog">
        <q-card-section class="dialog-header">
          <div>
            <div class="dialog-title">Edit Event</div>
            <!-- <div class="dialog-subtitle">
              Update Event.
            </div> -->
          </div>

          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="dialog-body">
          <q-banner
            v-if="eventStore.error"
            dense
            rounded
            class="bg-red-2 text-red-9 q-mb-sm"
          >
            {{ eventStore.error }}
          </q-banner>

          <div class="section-label">Event</div>

          <div class="form-grid">
            <q-input
              v-model="form.title_name"
              outlined
              dense
              label="Event Name"
              class="col-span-2"
            />

          </div>

       
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />

          <q-btn
            unelevated
            no-caps
            label="Save Changes"
            class="save-btn"
            :loading="eventStore.loading"
            @click="saveEvent"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- =====================================================
         DELETE CONFIRMATION DIALOG
    ====================================================== -->
    <q-dialog v-model="showDeleteDialog">
      <q-card class="delete-dialog">
        <q-card-section class="dialog-body">
          <div class="delete-title">Delete Event</div>
          <div class="delete-message">
            Are you sure you want to delete
            <strong>{{ eventToDelete?.title_name }}</strong
            >? This action cannot be undone.
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />

          <q-btn
            unelevated
            no-caps
            label="Delete"
            class="delete-btn"
            :loading="eventStore.loading"
            @click="deleteEvent"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar, Notify } from "quasar";
import { useEventStore } from "stores/eventStore";

export default defineComponent({
  name: "EventPage",

  // props: {
  //   officeView: {
  //     type: Boolean,
  //     default: false,
  //   },
  // },

  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const eventStore = useEventStore();

    const search = ref("");

  

    // ---------------------------------------------------------------
    // Table
    // ---------------------------------------------------------------
    const columns = [
      // { name: "no", label: "NO.", field: "no", align: "left" },
      {
        name: "event",
        label: "EVENT NAME",
        field: "title_name",
        align: "left",
        sortable: true,
      },
      // { name: "venue", label: "VENUE", field: "venue", align: "left" },
      {
        name: "schedule",
        label: "LATEST SCHEDULE",
        field: "latest_schedule",
        align: "left",
      },
      { name: "status", label: "STATUS", field: "computedStatus", align: "left" },
      { name: "actions", label: "Action", field: "actions", align: "center" },
    ];

    // Flattens each event + its primary (first) schedule entry into one
    // row so the table only needs to deal with plain fields.
    const tableRows = computed(() =>
      eventStore.events.map((event, index) => {
        const primarySchedule = event.schedule?.[0] || {};

        return {
          no: index + 1,
          event_id: event.event_id,
          title_name: event.title_name,
          type_name: event.type_name,
          venue: primarySchedule.venue_name || "—",
          latest_schedule: primarySchedule.latest_schedule || "—",
          computedStatus: primarySchedule.computedStatus || "—",
          raw: event,
        };
      })
    );

    const filteredRows = computed(() => {
      const keyword = search.value.toLowerCase().trim();
      if (!keyword) return tableRows.value;

      return tableRows.value.filter((row) => {
        return (
          row.title_name?.toLowerCase().includes(keyword) ||
          row.venue?.toLowerCase().includes(keyword) ||
          row.computedStatus?.toLowerCase().includes(keyword)
        );
      });
    });

  

    function clearFilters() {
      search.value = "";
    }

    function notify(type, message) {
      $q.notify({
        type: type === "success" ? "positive" : "negative",
        message,
        position: "top",
      });
    }

    // ---------------------------------------------------------------
    // VIEW EVENT (navigates to its own page)
    // ---------------------------------------------------------------
    function goToEvent(eventId) {
      router.push({
        name: "view events",
        query: { id: eventId },
      });
    }

    // ---------------------------------------------------------------
    // ADD / EDIT EVENT (shared form + dialog)
    // ---------------------------------------------------------------
    const showFormDialog = ref(false);
    const isEditMode = ref(false);
    const editingEvent = ref(null);

    const emptyForm = () => ({
      title_name: "",
      source_name: "",
      type_name: "",
      hours: "",
      fee: "",
      qualifications: "",
      venue_name: "",
      mode_name: "",
      latest_schedule: "",
      computedStatus: "",
    });

    const form = ref(emptyForm());

    function openAddEvent() {
      router.push({ name: "create events" });
    }

    function editEvent(event) {
      const primarySchedule = event.schedule?.[0] || {};

      isEditMode.value = true;
      editingEvent.value = event;
      form.value = {
        title_name: event.title_name || "",
        // source_name: event.source_name || "",
        // type_name: event.type_name || "",
        // hours: event.hours || "",
        // fee: event.fee || "",
        // qualifications: event.qualifications || "",
        // venue_name: primarySchedule.venue_name || "",
        // mode_name: primarySchedule.mode_name || "",
        // latest_schedule: primarySchedule.latest_schedule || "",
        // status: primarySchedule.status || "Created",
      };
      eventStore.clearError();
      showFormDialog.value = true;
    }

    function buildPayload() {
      const primarySchedule = editingEvent.value?.schedule?.[0];

      return {
        title_name: form.value.title_name,
        // source_name: form.value.source_name,
        // type_name: form.value.type_name,
        // hours: form.value.hours,
        // fee: form.value.fee,
        // qualifications: form.value.qualifications,
        // schedule: [
        //   {
        //     scheduleId: primarySchedule?.scheduleId,
        //     venue_name: form.value.venue_name,
        //     mode_name: form.value.mode_name,
        //     latest_schedule: form.value.latest_schedule,
        //     // status: form.value.status,
        //   },
        // ],
      };
    }

    async function saveEvent() {
      eventStore.clearError();

      const payload = buildPayload();

      const result = isEditMode.value
        ? await eventStore.updateEvent(editingEvent.value.event_id, payload)
        : await eventStore.createEvent(payload);

      if (result.success) {
        showFormDialog.value = false;
        notify(
          "success",
          result.message ||
            (isEditMode.value
              ? "Event updated successfully."
              : "Event created successfully.")
        );
      }
    }

    // ---------------------------------------------------------------
    // DELETE EVENT
    // ---------------------------------------------------------------
    const showDeleteDialog = ref(false);
    const eventToDelete = ref(null);

    function confirmDeleteEvent(event) {
      eventToDelete.value = event;
      showDeleteDialog.value = true;
    }

    async function deleteEvent() {
      if (!eventToDelete.value) return;

      const result = await eventStore.deleteEvent(eventToDelete.value.event_id);

      if (result.success) {
        showDeleteDialog.value = false;
        notify("success", result.message || "Event deleted successfully.");
      } else {
        notify("error", result.message);
      }
    }

    onMounted(() => {
      eventStore.fetchEvents();
    });

    return {
      eventStore,

      search,
      columns,
      filteredRows,
    
      clearFilters,

      // View
      goToEvent,

      // Add / Edit
      showFormDialog,
      isEditMode,
      form,
   
      openAddEvent,
      editEvent,
      saveEvent,

      // Delete
      showDeleteDialog,
      eventToDelete,
      confirmDeleteEvent,
      deleteEvent,
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

.add-event-btn {
  min-height: 42px;

  padding: 0 18px;

  border-radius: 9px;

  color: #ffffff;
  background: linear-gradient(135deg, #18b64d, #0ca344);

  font-size: 12px;
  font-weight: 650;

  box-shadow: 0 4px 10px rgba(16, 167, 70, 0.18);
}

/* =========================================================
   EVENTS CARD
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

  border-top: 1px solid #edf1ef;
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
   TABLE
========================================================= */

.table-wrapper {
  padding: 0 12px;
}

.events-table {
  box-shadow: none;
}

.events-table :deep(th) {
  height: 48px;
  color: #2b2e31;
  background: #ffffff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.events-table :deep(td) {
  height: 68px;
  color: #425b68;
  border-color: #edf1ef;
  font-size: 11px;
}

.events-table :deep(tbody tr:hover) {
  background: #fafffb;
}

.table-empty {
  padding: 30px 0;

  text-align: center;

  color: #8a989e;

  font-size: 12px;
}

/* =========================================================
   EVENT NAME CELL
========================================================= */

.event-name {
  color: #0b0d0e;

  font-size: 11px;
  font-weight: 500;
}

.event-meta {
  margin-top: 3px;

  color: #8a989e;

  font-size: 9px;
}


/* =========================================================
   ACTIONS
========================================================= */

.action-buttons {
  display: flex;
  justify-content: center;

}

.action-view {
  color: #4b7c94;
}

.action-edit {
  color: #16a84a;
}

.action-delete {
  color: #d35d5d;
}

/* =========================================================
   TABLE FOOTER
========================================================= */

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 13px 20px;

  border-top: 1px solid #edf1ef;

  color: #87949a;

  font-size: 10px;
}

.table-footer strong {
  color: #405967;
}

/* =========================================================
   DIALOG
========================================================= */

.event-dialog {
  width: 560px;
  max-width: 92vw;

  border-radius: 14px;
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  padding: 16px 18px;
}

.dialog-title {
  color: #19354a;

  font-size: 16px;
  font-weight: 750;
}

.dialog-subtitle {
  margin-top: 2px;

  color: #839097;

  font-size: 10px;
}

.dialog-body {
  padding: 16px 18px;
}

.dialog-actions {
  padding: 10px 18px;

  background: #fcfdfc;
}

.cancel-btn {
  color: #718089;

  font-size: 11px;
}

.save-btn {
  min-height: 35px;

  padding: 0 16px;

  border-radius: 8px;

  color: #ffffff;

  background: linear-gradient(135deg, #18b64d, #0ca344);

  font-size: 11px;
}

.delete-btn {
  min-height: 35px;

  padding: 0 16px;

  border-radius: 8px;

  color: #ffffff;

  background: linear-gradient(135deg, #e05353, #c73f3f);

  font-size: 11px;
}

/* =========================================================
   FORM
========================================================= */

.section-label {
  margin: 14px 0 8px;

  color: #8a989e;

  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.section-label:first-of-type {
  margin-top: 0;
}

.form-grid {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 10px;
}

.form-grid .col-span-2 {
  grid-column: 1 / -1;
}

.form-grid :deep(.q-field__control) {
  border-radius: 8px;
}

.form-grid :deep(.q-field__native),
.form-grid :deep(.q-field__label) {
  font-size: 11px;
}

/* =========================================================
   DELETE DIALOG
========================================================= */

.delete-dialog {
  width: 400px;
  max-width: 92vw;

  border-radius: 14px;
}

.delete-title {
  color: #19354a;

  font-size: 15px;
  font-weight: 750;
}

.delete-message {
  margin-top: 6px;

  color: #5c6b73;

  font-size: 12px;
  line-height: 1.5;
}

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

  .table-wrapper {
    overflow-x: auto;
  }

  .events-table {
    min-width: 700px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
