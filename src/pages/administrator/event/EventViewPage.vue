<template>
  <q-page class="event-view-page">
    <!-- =========================================================
         LOADING
    ========================================================== -->
    <div v-if="eventStore.loading && !event" class="state-message">
      <q-spinner-dots size="32px" />
      <span>Loading event...</span>
    </div>

    <!-- =========================================================
         NOT FOUND
    ========================================================== -->
    <div v-else-if="!event" class="state-message">
      <q-icon name="event_busy" size="40px" />
      <div>Event not found.</div>
      <q-btn flat no-caps label="Back to Events" class="back-link" @click="goBack" />
    </div>

    <!-- =========================================================
         EVENT PAGE
    ========================================================== -->
    <template v-else>
      <!-- =======================================================
           PAGE HEADER
      ======================================================== -->
      <EventPageHeader title="Event Information" :subtitle="event.title_name || 'Untitled Event'" @back="goBack" />

      <!-- =======================================================
           MAIN TWO-COLUMN CONTENT
      ======================================================== -->
      <EventTwoColumnLayout>
        <!-- =====================================================
             LEFT: EVENT INFORMATION
        ====================================================== -->
        <template #left>
          <div class="section-title">Event</div>

          <!-- TITLE -->
          <LabeledField label="Title">
            <q-input :model-value="event.title_name" outlined dense readonly placeholder="—" class="custom-input" />
          </LabeledField>

          <!-- L&D INTERVENTION -->
          <!-- <div class="section-divider"></div>

          <div class="section-title forms-title">L&amp;D Intervention</div>

          <LabeledField label="Intervention">
            <q-select :model-value="selectedIntervention" outlined dense readonly :options="interventionOptions"
              placeholder="Select Intervention" class="custom-input" />
          </LabeledField> -->

          <!-- FORMS -->
          <div class="section-divider"></div>

          <div class="section-title forms-title">Forms</div>
          <div class="competency-group">
            <div class="forms-list">
              <q-checkbox v-for="option in formsOptions" :key="option.value" :model-value="true" :val="option.value"
                :label="option.label" color="green" keep-color dense disable class="competency-checkbox" />
            </div>
          </div>
        </template>

        <!-- =====================================================
             RIGHT: SCHEDULES
        ====================================================== -->
        <template #right>
          <!-- ============================================
               SCHEDULE LIST VIEW
          ============================================= -->
          <template v-if="scheduleView === 'list'">
            <div class="schedule-header">
              <div class="schedule-title">Schedules</div>
              <q-btn outline no-caps icon="calendar_month" label="Add Schedule" class="add-schedule-btn"
                @click="openAddSchedule" />
            </div>

            <!-- Schedule Table using q-table -->
            <div class="schedule-table-container">
              <q-table :rows="event.schedule || []" :columns="scheduleColumns" row-key="scheduleId"
                :rows-per-page-options="[5, 10, 25]" v-model:pagination="schedulePagination" class="schedule-table" flat
                bordered>

                  <!-- venue -->
                <template #body-cell-venue_name="props">
                  <q-td :props="props">
                    <div class="schedule-date-cell">
                      <span>{{ props.row.venue_name || "—" }}</span>
                    </div>
                  </q-td>
                </template>

                <!-- Date Column -->
                <template #body-cell-date="props">
                  <q-td :props="props">
                    <div class="schedule-date-cell">
                      <q-icon name="calendar_today" size="15px" class="q-mr-sm" />
                      <span>{{ props.row.schedule_date_range || "—" }}</span>
                    </div>
                  </q-td>
                </template>

                <!-- Total Hours Column -->
                <template #body-cell-hours="props">
                  <q-td :props="props">
                    <div class="schedule-hours-cell">
                      {{
                        props.row.hours != null ? `${props.row.hours} hrs` : "—"
                      }}
                    </div>
                  </q-td>
                </template>

                 <template #body-cell-status="props">
                  <q-td :props="props">
                     <div class="status-badge" :class="'status-' + props.row.computedStatus">
                {{ props.row.computedStatus }}
                     </div>
                  </q-td>
                  
            <!-- <q-td key="computedStatus" :props="props">
              <span class="status-badge" :class="'status-' + props.row.computedStatus">
                {{ props.row.computedStatus }}
              </span>
            </q-td> -->
                </template>

                <!-- Action Column -->
                <template #body-cell-action="props">
                  <q-td :props="props">
                    <div class="schedule-actions">

                      <!-- view schedule-->
                      <q-btn flat round dense icon="visibility" color="green" class="action-btn"
                        @click="viewSchedule(props.row)">
                        <q-tooltip>View</q-tooltip>
                      </q-btn>

                      <q-btn flat round dense icon="edit" color="orange" class="action-btn"
                        @click="editSchedule(props.row)">
                        <q-tooltip>Edit Schedule</q-tooltip>
                      </q-btn>

                      <q-btn flat round dense icon="delete" color="red" class="action-btn delete-action"
                        @click="deleteSchedule(props.row)">
                        <q-tooltip>Delete Schedule</q-tooltip>
                      </q-btn>
                    </div>
                  </q-td>
                </template>

                <!-- No Data State -->
                <template #no-data>
                  <div class="empty-state">
                    <q-icon name="event_busy" size="40px" color="grey-4" />
                    <div class="empty-title">No schedules yet</div>
                    <div class="empty-description">
                      Add a schedule for this event.
                    </div>
                    <q-btn flat no-caps label="Add Schedule" icon="add" class="empty-add-btn"
                      @click="openAddSchedule" />
                  </div>
                </template>
              </q-table>
            </div>
          </template>

          <!-- ============================================
               SCHEDULE FORM VIEW (Add / Edit)
          ============================================= -->
          <ScheduleFormPanel v-else :event-id="eventId" :schedule="editingScheduleData" @saved="onScheduleSaved"
            @cancel="backToScheduleList" />
        </template>
      </EventTwoColumnLayout>
    </template>
  </q-page>
</template>

<script>
import { defineComponent, computed, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useEventStore } from "stores/eventStore";
import { useOfficeStore } from "stores/officeStore";

import EventPageHeader from "components/events/EventPageHeader.vue";
import EventTwoColumnLayout from "components/events/EventTwoColumnLayout.vue";
import LabeledField from "components/events/LabeledField.vue";
import ScheduleFormPanel from "components/events/ScheduleFormPanel.vue";

import { formsOptions } from "src/constants/form";

import { useScheduleStore } from "src/stores/event/schedule/scheduleStore";
import Swal from "sweetalert2";

import { coreOptions, technicalOptions, leadershipOptions } from "src/constants/competency";



export default defineComponent({
  name: "EventViewPage",

  components: {
    EventPageHeader,
    EventTwoColumnLayout,
    LabeledField,
    ScheduleFormPanel,
  },

  props: {
    id: {
      type: [String, Number],
      default: null,
    },
  },

  setup(props) {
    const $q = useQuasar();
    const route = useRoute();
    const router = useRouter();
    const eventStore = useEventStore();
    const officeStore = useOfficeStore();
    const scheduleStore = useScheduleStore();

    // =========================================================
    // EVENT ID
    // =========================================================
    const eventId = computed(() => {
      return props.id ?? route.query.id ?? route.params.id;
    });

    // =========================================================
    // EVENT (read-only source from the API)
    // =========================================================
    const event = computed(() => {
      return eventStore.selectedEvent;
    });

    // =========================================================
    // SCHEDULE TABLE (List View)
    // =========================================================
    const schedulePagination = ref({
      sortBy: "schedule_date_range",
      descending: false,
      rowsPerPage: 5,
      page: 1,
    });

    const scheduleView = ref("list");
    // null = Add mode. Row object = Edit mode.
    const editingScheduleData = ref(null);

    const selectedIntervention = ref("Formal Learning");


    const scheduleColumns = [
      {
        name: "venue_name",
        label: "Venue",
        field: "venue_name",
        align: "left",
        sortable: true,
        style: "min-width: 200px;",
      },
      {
        name: "date",
        label: "Date",
        field: "schedule_date_range",
        align: "left",
        sortable: true,
        style: "min-width: 200px;",
      },
      {
        name: "hours",
        label: "Total Hours",
        field: "hours",
        align: "center",
        sortable: true,
        style: "min-width: 120px;",
      },
        {
        name: "status",
        label: "Status",
        field: "computedStatus",
        align: "center",
        sortable: true,
        style: "min-width: 120px;",
      },
      {
        name: "action",
        label: "Action",
        field: "action",
        align: "center",
        sortable: false,
        style: "width: 80px;",
      },
    ];

    // =========================================================
    // SCHEDULE VIEW STATE (list <-> form toggle)
    // =========================================================

    function openAddSchedule() {
      editingScheduleData.value = null;
      eventStore.clearError();
      scheduleView.value = "form";
    }

    // function editSchedule(item) {
    //   editingScheduleData.value = item;
    //   eventStore.clearError();
    //   scheduleView.value = "form";
    // }
    function mapCompetencyKeysToValues(sourceObj, optionsList) {
      if (!sourceObj) return [];
      return optionsList
        .filter((option) => sourceObj[option.backendKey] === true)
        .map((option) => option.value);
    }

    // The API returns display values. The form needs ISO dates and 24-hour times.
    function toRawDate(dateValue) {
      if (!dateValue) return null;

      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) return null;

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    function to24HourTime(timeValue) {
      if (!timeValue) return null;

      const match = timeValue.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (!match) return timeValue;

      let hours = Number(match[1]);
      const minutes = match[2];
      const period = match[3].toUpperCase();

      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;

      return `${String(hours).padStart(2, "0")}:${minutes}`;
    }

    function mapScheduleResponseToForm(data) {
      return {
        scheduleId: data.scheduleId,
        venue_name: data.venue_name,
        mode_name: data.mode_name,
        category_name: data.category_name || null,
        type_name: data.type_name || null,
        conducted_by: data.conducted_by || "",
        source_name: data.source_name || null,
        hours: data.hours,
        qualifications: data.qualifications,
        fee: data.fee,

        speakers: (data.speaker || []).map((s) => ({
          name: s.speaker_name,
          agency: s.agency,
          position: s.position,
        })),

        departments: (data.office || []).map((o) => ({
          id: o.departmentId,
          name: o.office_name,
          attendees: (data.employee_tag || []).filter(
            (e) => e.office === o.office_name
          ).length,
          employees: (data.employee_tag || [])
            .filter((e) => e.office === o.office_name)
            .map((e) => ({
              control_no: e.control_no,
              name: e.name,
              position: e.position,
              status: e.status,
            })),
        })),

        employees: (data.employee_tag || []).map((e) => ({
          control_no: e.control_no,
          name: e.name,
          position: e.position,
          office: e.office,
          status: e.status,
        })),

        competencies: [
          ...mapCompetencyKeysToValues(data.event_core?.[0], coreOptions),
          ...mapCompetencyKeysToValues(data.event_technical?.[0], technicalOptions),
          ...mapCompetencyKeysToValues(data.event_leader_ship?.[0], leadershipOptions),
        ],
        schedules: (data.schedule_date_time || []).map((schedule, index) => {
          const rawDate = toRawDate(schedule.schedule_date);

          return {
            id: schedule.id || `${data.scheduleId}-${index}`,
            rawDate,
            date: schedule.schedule_date || "—",
            morning_in: to24HourTime(schedule.morning_in),
            morning_out: to24HourTime(schedule.morning_out),
            afternoon_in: to24HourTime(schedule.afternoon_in),
            afternoon_out: to24HourTime(schedule.afternoon_out),
          };
        }),
  
      };
    }
  
    async function editSchedule(item) {
      eventStore.clearError();

      const result = await scheduleStore.view_schedule(item.scheduleId);

      if (result?.success) {
        editingScheduleData.value = mapScheduleResponseToForm(result.data);
        scheduleView.value = "form";
      } else {
        Swal.fire({
          title: "Failed",
          text: result?.message || "Unable to fetch schedule details.",
          icon: "error",
          scrollbarPadding: false,
        });
      }
    }
    function viewSchedule(item) {
      router.push({
        name: "event-nominated-employee", // palitan ng actual route name mo sa router/routes.js
        params: {
          eventId: eventId.value,
          scheduleId: item.scheduleId,
        },
      });
    }


    function backToScheduleList() {
      eventStore.clearError();
      scheduleView.value = "list";
    }

    async function onScheduleSaved() {
      await eventStore.fetchEventById(eventId.value);
      backToScheduleList();
    }

    // =========================================================
    // DELETE SCHEDULE
    // =========================================================
    function deleteSchedule(item) {
      Swal.fire({
        title: "Delete Schedule",
        text: "Are you sure you want to delete this schedule?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#d83d3d",
        cancelButtonColor: "#9e9e9e",
        reverseButtons: true,
        scrollbarPadding: false, // 👈 ito yung fix para sa fixed header/drawer mo
        heightAuto: false, // 👈 idagdag ito
      }).then(async (result) => {
        if (!result.isConfirmed) return;

        try {
          const deleteResult = await scheduleStore.deleteSchedule(item.scheduleId);

          if (deleteResult?.success) {
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "Schedule deleted successfully.",
              showConfirmButton: false,
              timer: 2500,
              timerProgressBar: true,
              scrollbarPadding: false, // 👈 idagdag din dito para consistent
            });
            await eventStore.fetchEventById(eventId.value);
          } else {
            Swal.fire({
              title: "Failed",
              text: deleteResult?.message || "Unable to delete schedule.",
              icon: "error",
              scrollbarPadding: false,
            });
          }
        } catch (error) {
          console.error(error);
          Swal.fire({
            title: "Error",
            text: error?.message || "Unable to delete schedule.",
            icon: "error",
            scrollbarPadding: false,
          });
        }
      });
    }
    // =========================================================
    // L&D INTERVENTION / FORMS (left panel)
    // =========================================================
    const interventionOptions = [
      { label: "Formal Learning", value: "Formal Learning" },
      // { label: "Learning by Doing", value: "Learning by Doing" },
      // { label: "Social Learning", value: "Social Learning" },
      // { label: "Self-Directed Learning", value: "Self-Directed Learning" },
    ];


    // =========================================================
    // LOAD EVENT
    // =========================================================
    onMounted(async () => {
      if (!eventId.value) return;
      await eventStore.fetchEventById(eventId.value);
    });

    // =========================================================
    // GO BACK
    // =========================================================
    function goBack() {
      router.back();
    }

    // =========================================================
    // RETURN
    // =========================================================
    return {
      eventStore,
      officeStore,
      event,
      eventId,
      // Schedule list view
      scheduleView,
      schedulePagination,
      scheduleColumns,
      editingScheduleData,
      openAddSchedule,
      editSchedule,
      backToScheduleList,
      onScheduleSaved,
      deleteSchedule,
      // L&D Intervention / Forms
      interventionOptions,
      selectedIntervention,
      formsOptions,
      // Page nav
      viewSchedule,
      goBack,
    };
  },
});
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */
.event-view-page {
  min-height: 100%;
  padding: 15px 20px 40px;
  color: #171717;
  background: #ffffff;
}

/* =========================================================
   STATE
========================================================= */
.state-message {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #8a8a8a;
  font-size: 13px;
  text-align: center;
}

.back-link {
  margin-top: 5px;
  color: #16b94a;
  font-size: 12px;
}

/* =========================================================
   SECTION TITLE
========================================================= */
.section-title {
  margin-bottom: 14px;
  color: #222222;
  font-size: 13px;
  font-weight: 650;
}

.forms-title {
  margin-bottom: 10px;
}

/* =========================================================
   INPUT
========================================================= */
.custom-input :deep(.q-field__control) {
  min-height: 35px;
  height: 35px;
  border-radius: 7px;
}

.custom-input :deep(.q-field__native),
.custom-input :deep(.q-field__input),
.custom-input :deep(.q-field__label) {
  font-size: 12px;
}

/* =========================================================
   DIVIDER
========================================================= */
.section-divider {
  height: 1px;
  margin: 15px 0 11px;
  background: #cfcfcf;
}

/* =========================================================
   FORMS (left panel)
========================================================= */
.forms-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.forms-list :deep(.q-checkbox) {
  min-height: 30px;
}

.forms-list :deep(.q-checkbox__label) {
  color: #373737;
  font-size: 11px;
}

.empty-section {
  color: #999999;
  font-size: 11px;
}

/* =========================================================
   SCHEDULE HEADER (list view)
========================================================= */
.schedule-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.schedule-title {
  color: #222222;
  font-size: 14px;
  font-weight: 650;
}

.add-schedule-btn {
  min-height: 38px;
  padding: 0 15px;
  border: 1px solid #d5d5d5;
  border-radius: 9px;
  color: #18b94b;
  font-size: 11px;
  background: #ffffff;
}

.add-schedule-btn:hover {
  background: #f5fdf7;
}

/* =========================================================
   SCHEDULE TABLE (List View)
========================================================= */
.schedule-table-container {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.schedule-table {
  width: 100%;
}

.schedule-table :deep(.q-table__top) {
  padding: 8px 12px;
  background: #f8f9fa;
}

.schedule-table :deep(.q-table thead tr) {
  background: #f5f5f5;
}

.schedule-table :deep(.q-table th) {
  color: #2b2e31;
  background: #ffffff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.schedule-table :deep(.q-table td) {
  padding: 8px 12px;
  font-size: 12px;
  height: 68px;
}

.schedule-date-cell {
  display: flex;
  align-items: center;
  color: #0b0d0e;
   font-size: 11px;
  font-weight: 500;
}

.schedule-hours-cell {
  color: #0b0d0e;
  font-size: 11px;
  font-weight: 500;
  text-align: center;
}

.schedule-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.action-btn {
  color: #777777;
}

.action-btn:hover {
  color: #18b94b;
}

.delete-action:hover {
  color: #d83d3d;
}

/* =========================================================
   EMPTY STATE
========================================================= */
.empty-state {
  padding: 40px;
  text-align: center;
  color: #b0b0b0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  width: 100%;
}

.empty-state .q-icon {
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state .empty-title {
  color: #555555;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.empty-state .empty-description {
  font-size: 12px;
  color: #999999;
}

.empty-add-btn {
  margin-top: 12px;
  color: #18b94b;
  font-size: 12px;
}

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 650px) {
  .event-view-page {
    padding: 18px 12px 30px;
  }

  .schedule-header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .add-schedule-btn {
    width: 100%;
  }

  .schedule-table :deep(.q-table td),
  .schedule-table :deep(.q-table th) {
    padding: 4px 8px;
    font-size: 11px;
  }

  .schedule-date-cell {
    font-size: 11px;
  }
}

.competency-group {
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  padding: 10px 14px;
  background: #fafafa;
}

.competency-checkbox {
  margin-bottom: 0;
  font-size: 12px;
}

.competency-checkbox :deep(.q-checkbox__label) {
  font-size: 11.5px;
  line-height: 1.3;
}
</style>
