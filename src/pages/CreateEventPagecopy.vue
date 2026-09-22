<template>
  <q-page class="create-event-page">
    <!-- =========================================================
         PAGE HEADER
    ========================================================== -->
    <section class="page-header">
      <div class="header-left">
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          class="back-btn"
          @click="goBack"
        />
        <div>
          <h5>Create Event</h5>
          <div class="header-subtitle">
            Fill in the details to create a new event
          </div>
        </div>
      </div>
    </section>

    <!-- =========================================================
         MAIN CONTENT
    ========================================================== -->
    <div class="event-layout">
      <!-- =======================================================
           LEFT PANEL
      ======================================================== -->
      <q-card flat bordered class="event-card event-information-card">
        <div class="section-title">Event</div>

        <!-- =====================================================
             TITLE
        ====================================================== -->
        <div class="field-group">
          <div class="field-label">Title</div>
          <q-input
            v-model="eventForm.title_name"
            outlined
            dense
            placeholder="Enter event title"
            class="custom-input"
          />
        </div>

        <div class="field-group">
          <div class="field-label">Category</div>
          <q-select
            v-model="eventForm.category_name"
            outlined
            dense
            emit-value
            map-options
            :options="categoryOptions"
            placeholder="Select category"
            class="custom-input"
          />
        </div>

        <!-- =====================================================
             TYPE
        ====================================================== -->
        <div class="field-group">
          <div class="field-label">Type</div>
          <q-select
            v-model="eventForm.type_name"
            outlined
            dense
            emit-value
            map-options
            :options="typeOptions"
            placeholder="Select type"
            class="custom-input"
          />
        </div>

        <!-- =====================================================
             SOURCE
        ====================================================== -->
        <div class="field-group">
          <div class="field-label">Source</div>
          <q-select
            v-model="eventForm.source_name"
            outlined
            dense
            emit-value
            map-options
            :options="sourceOptions"
            placeholder="Select source"
            class="custom-input"
          />
        </div>

        <!-- =====================================================
             FORMS
        ====================================================== -->
        <div class="section-divider"></div>

        <div class="section-title forms-title">Forms</div>

        <div class="forms-list">
          <q-checkbox
            v-for="form in formOptions"
            :key="form.id"
            v-model="eventForm.forms"
            :val="form.id"
            :label="form.name"
            color="green"
            dense
          />
        </div>

        <!-- =====================================================
             ASSESSMENT
        ====================================================== -->
        <div class="section-title subsection-title">Assessment</div>

        <q-input
          v-model="eventForm.pre_test"
          outlined
          dense
          placeholder="Pre Test"
          class="custom-input assessment-input"
        />

        <q-input
          v-model="eventForm.post_test"
          outlined
          dense
          placeholder="Post Test"
          class="custom-input assessment-input"
        />

        <!-- =====================================================
             CERTIFICATE
        ====================================================== -->
        <div class="section-title subsection-title">Certificate</div>

        <q-input
          v-model="eventForm.certificate"
          outlined
          dense
          placeholder="Certificate"
          class="custom-input"
        />
      </q-card>

      <!-- =======================================================
           RIGHT PANEL
      ======================================================== -->
      <q-card flat bordered class="event-card schedule-information-card">
        <div class="section-title">Schedule Details</div>

        <!-- =====================================================
             VENUE + MODE
        ====================================================== -->
        <div class="two-column-fields">
          <!-- VENUE -->
          <div class="field-group">
            <div class="field-label">Venue</div>
            <q-input
              v-model="eventForm.venue_name"
              outlined
              dense
              placeholder="Enter venue"
              class="custom-input"
            />
          </div>

          <!-- MODE -->
          <div class="field-group">
            <div class="field-label">Mode</div>
            <q-select
              v-model="eventForm.mode_name"
              outlined
              dense
              emit-value
              map-options
              :options="modeOptions"
              placeholder="Select mode"
              class="custom-input"
            />
          </div>
        </div>

        <!-- =====================================================
             RESOURCE SPEAKER
        ====================================================== -->
        <div class="field-group speaker-group">
          <div class="field-label">Resource Speaker</div>

          <div
            v-for="(speaker, index) in eventForm.speakers"
            :key="speaker.id"
            class="speaker-row"
          >
            <q-input
              v-model="speaker.name"
              outlined
              dense
              placeholder="Enter resource speaker"
              class="custom-input speaker-input"
            />

            <q-btn
              v-if="eventForm.speakers.length > 1"
              flat
              round
              dense
              icon="close"
              class="remove-speaker-btn"
              @click="removeSpeaker(index)"
            >
              <q-tooltip>Remove Speaker</q-tooltip>
            </q-btn>
          </div>

          <div class="speaker-action">
            <q-btn
              outline
              no-caps
              icon="add"
              label="Add Another Speaker"
              class="add-speaker-btn"
              @click="addSpeaker"
            />
          </div>
        </div>

        <!-- =====================================================
             SCHEDULE DATE
        ====================================================== -->
        <div class="schedule-section">
          <div class="schedule-heading-row">
            <div>
              <div class="field-label">Schedule Date</div>

              <div v-if="selectedDateRange" class="selected-date-range">
                {{ selectedDateRange }}
              </div>

              <div v-else class="selected-date-range empty">
                No dates selected
              </div>
            </div>

            <q-btn
              outline
              no-caps
              icon="calendar_month"
              label="Select Date"
              class="select-date-btn"
              @click="openDateDialog"
            />
          </div>

          <!-- ===================================================
               SCHEDULE TABLE
          ==================================================== -->
          <div class="schedule-table">
            <!-- HEADER -->
            <div class="schedule-table-header">
              <div class="date-column">Date</div>
              <div class="time-column">Time</div>
              <div class="action-column">Action</div>
            </div>

            <!-- ROWS -->
            <div
              v-for="(schedule, index) in eventForm.schedules"
              :key="schedule.id"
              class="schedule-row"
            >
              <!-- DATE -->
              <div class="date-column schedule-date">
                <q-icon name="calendar_today" size="15px" />
                <span>{{ schedule.date }}</span>
              </div>

              <!-- TIME -->
              <div class="time-column">
                <div class="time-inputs">
                  <q-input
                    v-model="schedule.time_start"
                    outlined
                    dense
                    placeholder="8:00 am"
                    class="time-input"
                  />
                  <span class="time-separator">-</span>
                  <q-input
                    v-model="schedule.time_end"
                    outlined
                    dense
                    placeholder="5:00 pm"
                    class="time-input"
                  />
                </div>
              </div>

              <!-- ACTION -->
              <div class="action-column">
                <q-btn
                  flat
                  round
                  dense
                  icon="delete_outline"
                  class="delete-btn"
                  @click="removeSchedule(index)"
                >
                  <q-tooltip>Remove Date</q-tooltip>
                </q-btn>
              </div>
            </div>

            <!-- EMPTY -->
            <div v-if="!eventForm.schedules.length" class="schedule-empty">
              <q-icon name="calendar_month" size="28px" />
              <span>Select a date to create a schedule</span>
            </div>
          </div>
        </div>

        <!-- =====================================================
             DEPARTMENT
        ====================================================== -->
        <div class="department-section">
          <div class="department-header">
            <div>
              <div class="field-label">Department</div>
              <div class="attendee-count">
                Total of Attendees:
                <strong>{{ totalAttendees }}</strong>
              </div>
            </div>
          </div>

          <!-- SEARCH -->
          <q-input
            v-model="departmentSearch"
            outlined
            dense
            clearable
            placeholder="Search and add a department"
            class="department-search"
          >
            <template #prepend>
              <q-icon name="search" size="17px" />
            </template>
          </q-input>

          <!-- DEPARTMENT TABLE -->
          <div class="department-table">
            <div class="department-table-header">
              <div>Department</div>
              <div>No of Attendees</div>
              <div>Action</div>
            </div>

            <div
              v-for="(department, index) in filteredDepartments"
              :key="department.id"
              class="department-row"
            >
              <div class="department-name">
                {{ department.name }}
              </div>

              <div class="attendee-input-wrapper">
                <q-input
                  v-model.number="department.attendees"
                  type="number"
                  min="0"
                  borderless
                  dense
                  class="attendee-input"
                />
              </div>

              <div class="department-action">
                <q-btn
                  flat
                  round
                  dense
                  icon="delete_outline"
                  class="delete-btn"
                  @click="removeDepartment(index)"
                />
              </div>
            </div>

            <div v-if="!filteredDepartments.length" class="department-empty">
              No departments added.
            </div>
          </div>

          <!-- ADD DEPARTMENT -->
          <div class="add-department-wrapper">
            <q-btn
              outline
              no-caps
              icon="add"
              label="Add Department"
              class="add-department-btn"
              @click="openDepartmentDialog"
            />
          </div>
        </div>
      </q-card>
    </div>

    <!-- =========================================================
         BOTTOM ACTIONS
    ========================================================== -->
    <div class="page-actions">
      <q-btn
        flat
        no-caps
        label="Cancel"
        class="cancel-btn"
        @click="cancelCreate"
      />

      <q-btn
        unelevated
        no-caps
        label="Create Event"
        class="create-btn"
        :loading="saving"
        @click="createEvent"
      />
    </div>

    <!-- =========================================================
         DATE DIALOG
    ========================================================== -->
    <q-dialog v-model="showDateDialog">
      <q-card class="date-dialog">
        <q-card-section class="dialog-header">
          <div>
            <div class="dialog-title">Select Schedule Dates</div>
            <div class="dialog-subtitle">
              Select one or multiple dates for this event.
            </div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="date-dialog-body">
          <q-date
            v-model="selectedDates"
            multiple
            today-btn
            mask="YYYY-MM-DD"
            color="green"
            minimal
            class="full-width"
          />
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat no-caps label="Cancel" v-close-popup />
          <q-btn
            unelevated
            no-caps
            label="Apply Dates"
            class="save-dialog-btn"
            @click="applyDates"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- =========================================================
         DEPARTMENT DIALOG
    ========================================================== -->
    <q-dialog v-model="showDepartmentDialog">
      <q-card class="department-dialog">
        <q-card-section class="dialog-header">
          <div>
            <div class="dialog-title">Add Department</div>
            <div class="dialog-subtitle">
              Select a department and specify the number of attendees.
            </div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-select
            v-model="newDepartment.department_id"
            outlined
            dense
            emit-value
            map-options
            :options="departmentOptions"
            label="Department"
            class="dialog-field"
          />

          <q-input
            v-model.number="newDepartment.attendees"
            outlined
            dense
            type="number"
            min="0"
            label="No. of Attendees"
            class="dialog-field"
          />
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat no-caps label="Cancel" v-close-popup />
          <q-btn
            unelevated
            no-caps
            label="Add Department"
            class="save-dialog-btn"
            @click="addDepartment"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useEventStore } from "stores/eventStore";

export default defineComponent({
  name: "CreateEventPage",

  setup() {
    const router = useRouter();
    const $q = useQuasar();
    const eventStore = useEventStore();

    // =========================================================
    // LOADING
    // =========================================================
    const saving = ref(false);

    // =========================================================
    // EVENT FORM
    // =========================================================
    const eventForm = ref({
      title_name: "",
      category_name: null,
      type_name: null,
      source_name: null,
      forms: [],
      pre_test: "",
      post_test: "",
      certificate: "",
      venue_name: "",
      mode_name: null,
      speakers: [
        {
          id: Date.now(),
          name: "",
        },
      ],
      schedules: [],
      departments: [],
    });

    const categoryOptions = [
      { label: "Technical", value: "Technical" },
      { label: "Leadership", value: "Leadership" },
      { label: "Managerial", value: "Managerial" },
      { label: "Supervisory", value: "Supervisory" },
      { label: "Behavioral", value: "Behavioral" },
      { label: "Administrative", value: "Administrative" },
      { label: "Professional Development", value: "Professional Development" },
      { label: "Personal Development", value: "Personal Development" },
      { label: "Customer Service", value: "Customer Service" },
      { label: "Compliance / Mandatory", value: "Compliance / Mandatory" },
    ];

    // =========================================================
    // OPTIONS
    // =========================================================
    const typeOptions = [
      { label: "Seminar", value: "Seminar" },
      { label: "Training", value: "Training" },
      { label: "Workshop", value: "Workshop" },
      { label: "Conference", value: "Conference" },
      { label: "Webinar", value: "Webinar" },
    ];

    const sourceOptions = [
      { label: "Internal", value: "Internal" },
      { label: "External", value: "External" },
      { label: "In-house", value: "In-house" },
    ];

    const modeOptions = [
      { label: "Face to Face", value: "Face to Face" },
      { label: "Online", value: "Online" },
      { label: "Hybrid", value: "Hybrid" },
    ];

    // =========================================================
    // FORM OPTIONS
    // =========================================================
    const formOptions = [
      { id: 1, name: "Learning Application Plan" },
      { id: 2, name: "Learning Application Monitoring Report" },
      { id: 3, name: "Learning Progress Report" },
      { id: 4, name: "Learning Implementation Report" },
      { id: 5, name: "Learning Application Plan" },
    ];

    // =========================================================
    // DEPARTMENT OPTIONS
    // =========================================================
    const departmentOptions = [
      { label: "Office of the City Mayor", value: 1 },
      { label: "Office of the City Accountant", value: 2 },
      { label: "Office of the City Treasurer", value: 3 },
      { label: "City Human Resource Management Office", value: 4 },
      { label: "City Planning and Development Office", value: 5 },
      { label: "City Engineering Office", value: 6 },
    ];

    // =========================================================
    // DEPARTMENT SEARCH
    // =========================================================
    const departmentSearch = ref("");

    const filteredDepartments = computed(() => {
      const search = departmentSearch.value?.toLowerCase().trim();

      if (!search) {
        return eventForm.value.departments;
      }

      return eventForm.value.departments.filter((department) =>
        department.name.toLowerCase().includes(search)
      );
    });

    // =========================================================
    // ATTENDEE TOTAL
    // =========================================================
    const totalAttendees = computed(() => {
      return eventForm.value.departments.reduce((total, department) => {
        return total + Number(department.attendees || 0);
      }, 0);
    });

    // =========================================================
    // SPEAKERS
    // =========================================================
    function addSpeaker() {
      eventForm.value.speakers.push({
        id: Date.now() + Math.random(),
        name: "",
      });
    }

    function removeSpeaker(index) {
      eventForm.value.speakers.splice(index, 1);
    }

    // =========================================================
    // DATE DIALOG
    // =========================================================
    const showDateDialog = ref(false);
    const selectedDates = ref([]);

    function openDateDialog() {
      selectedDates.value = eventForm.value.schedules.map(
        (schedule) => schedule.rawDate
      );
      showDateDialog.value = true;
    }

    function formatDate(date) {
      if (!date) return "";

      const [year, month, day] = date.split("-");
      const parsed = new Date(Number(year), Number(month) - 1, Number(day));

      return parsed.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    function applyDates() {
      const oldSchedules = eventForm.value.schedules;

      eventForm.value.schedules = selectedDates.value.map((date) => {
        const existing = oldSchedules.find(
          (schedule) => schedule.rawDate === date
        );

        return {
          id: existing?.id || Date.now() + Math.random(),
          rawDate: date,
          date: formatDate(date),
          time_start: existing?.time_start || "8:00 am",
          time_end: existing?.time_end || "5:00 pm",
        };
      });

      showDateDialog.value = false;
    }

    function removeSchedule(index) {
      eventForm.value.schedules.splice(index, 1);
    }

    // =========================================================
    // DATE RANGE
    // =========================================================
    const selectedDateRange = computed(() => {
      const schedules = eventForm.value.schedules;

      if (!schedules.length) return "";

      const dates = schedules.map((schedule) => schedule.rawDate).sort();

      if (dates.length === 1) {
        return formatDate(dates[0]);
      }

      return `${formatDate(dates[0])} - ${formatDate(dates[dates.length - 1])}`;
    });

    // =========================================================
    // DEPARTMENT DIALOG
    // =========================================================
    const showDepartmentDialog = ref(false);
    const newDepartment = ref({
      department_id: null,
      attendees: 0,
    });

    function openDepartmentDialog() {
      newDepartment.value = {
        department_id: null,
        attendees: 0,
      };
      showDepartmentDialog.value = true;
    }

    function addDepartment() {
      const selected = departmentOptions.find(
        (department) => department.value === newDepartment.value.department_id
      );

      if (!selected) {
        $q.notify({
          type: "warning",
          message: "Please select a department.",
          position: "top",
        });
        return;
      }

      const alreadyExists = eventForm.value.departments.some(
        (department) => department.id === selected.value
      );

      if (alreadyExists) {
        $q.notify({
          type: "warning",
          message: "This department has already been added.",
          position: "top",
        });
        return;
      }

      eventForm.value.departments.push({
        id: selected.value,
        name: selected.label,
        attendees: Number(newDepartment.value.attendees) || 0,
      });

      showDepartmentDialog.value = false;
    }

    function removeDepartment(index) {
      eventForm.value.departments.splice(index, 1);
    }

    // =========================================================
    // GO BACK
    // =========================================================
    function goBack() {
      if (window.history.state?.back || document.referrer) {
        router.back();
      } else {
        router.push({ name: "events" });
      }
    }

    // =========================================================
    // CANCEL
    // =========================================================
    function cancelCreate() {
      router.back();
    }

    // =========================================================
    // CREATE EVENT
    // =========================================================
    async function createEvent() {
      // -------------------------------------------------------
      // BASIC VALIDATION
      // -------------------------------------------------------
      if (!eventForm.value.title_name) {
        $q.notify({
          type: "warning",
          message: "Please enter an event title.",
          position: "top",
        });
        return;
      }

      if (!eventForm.value.type_name) {
        $q.notify({
          type: "warning",
          message: "Please select an event type.",
          position: "top",
        });
        return;
      }

      if (!eventForm.value.source_name) {
        $q.notify({
          type: "warning",
          message: "Please select an event source.",
          position: "top",
        });
        return;
      }

      if (!eventForm.value.schedules.length) {
        $q.notify({
          type: "warning",
          message: "Please add at least one schedule date.",
          position: "top",
        });
        return;
      }

      // -------------------------------------------------------
      // PAYLOAD
      // -------------------------------------------------------
      const payload = {
        title_name: eventForm.value.title_name,
        type_name: eventForm.value.type_name,
        source_name: eventForm.value.source_name,
        form_ids: eventForm.value.forms,
        pre_test: eventForm.value.pre_test,
        post_test: eventForm.value.post_test,
        certificate: eventForm.value.certificate,
        schedules: eventForm.value.schedules.map((schedule) => ({
          schedule_date: schedule.rawDate,
          time_start: schedule.time_start,
          time_end: schedule.time_end,
        })),
        venue_name: eventForm.value.venue_name,
        mode_name: eventForm.value.mode_name,
        speakers: eventForm.value.speakers
          .filter((speaker) => speaker.name.trim())
          .map((speaker) => speaker.name),
        departments: eventForm.value.departments.map((department) => ({
          department_id: department.id,
          attendees: Number(department.attendees),
        })),
      };

      // -------------------------------------------------------
      // SUBMIT VIA EVENT STORE
      // -------------------------------------------------------
      eventStore.clearError();
      saving.value = true;

      try {
        const result = await eventStore.createEvent(payload);

        if (!result.success) {
          throw new Error(result.message || "Unable to create event.");
        }

        $q.notify({
          type: "positive",
          message: result.message || "Event created successfully.",
          position: "top",
        });

        router.back();
      } catch (error) {
        console.error(error);
        $q.notify({
          type: "negative",
          message: error?.message || "Unable to create event.",
          position: "top",
        });
      } finally {
        saving.value = false;
      }
    }

    // =========================================================
    // RETURN
    // =========================================================
    return {
      eventStore,
      saving,
      eventForm,
      categoryOptions,
      typeOptions,
      sourceOptions,
      modeOptions,
      formOptions,
      departmentOptions,
      departmentSearch,
      filteredDepartments,
      totalAttendees,
      addSpeaker,
      removeSpeaker,
      showDateDialog,
      selectedDates,
      openDateDialog,
      applyDates,
      removeSchedule,
      selectedDateRange,
      showDepartmentDialog,
      newDepartment,
      openDepartmentDialog,
      addDepartment,
      removeDepartment,
      goBack,
      cancelCreate,
      createEvent,
    };
  },
});
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */
.create-event-page {
  min-height: 100%;
  padding: 32px 20px 24px;
  background: #ffffff;
  color: #151515;
}

/* =========================================================
   PAGE HEADER
========================================================= */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.back-btn {
  color: #202020;
}

.page-header h5 {
  margin: 0;
  color: #101044;
  font-size: 16px;
  font-weight: 650;
}

.header-subtitle {
  margin-top: 3px;
  color: #8b8b8b;
  font-size: 11px;
}

/* =========================================================
   ERROR BANNER
========================================================= */
.error-banner {
  margin-bottom: 14px;
  font-size: 12px;
}

/* =========================================================
   MAIN LAYOUT
========================================================= */
.event-layout {
  display: grid;
  grid-template-columns: 346px minmax(0, 1fr);
  gap: 12px;
  align-items: stretch;
}

/* =========================================================
   CARDS
========================================================= */
.event-card {
  border: 2px solid #f0f1f5;
  border-radius: 0;
  background: #ffffff;
  box-shadow: none;
}

/* =========================================================
   LEFT CARD
========================================================= */
.event-information-card {
  min-height: 680px;
  padding: 20px 22px;
}

/* =========================================================
   RIGHT CARD
========================================================= */
.schedule-information-card {
  min-height: 680px;
  padding: 20px 20px;
}

/* =========================================================
   SECTION TITLE
========================================================= */
.section-title {
  margin-bottom: 12px;
  color: #222222;
  font-size: 13px;
  font-weight: 650;
}

.forms-title {
  margin-bottom: 9px;
}

/* =========================================================
   FIELD
========================================================= */
.field-group {
  margin-bottom: 11px;
}

.field-label {
  margin-bottom: 6px;
  color: #292929;
  font-size: 12px;
  font-weight: 600;
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
  margin: 10px 0;
  background: #cccccc;
}

/* =========================================================
   FORMS
========================================================= */
.forms-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.forms-list :deep(.q-checkbox) {
  min-height: 30px;
}

.forms-list :deep(.q-checkbox__label) {
  color: #3b3b3b;
  font-size: 11px;
}

/* =========================================================
   ASSESSMENT
========================================================= */
.subsection-title {
  margin-top: 13px;
  margin-bottom: 7px;
}

.assessment-input {
  margin-bottom: 7px;
}

/* =========================================================
   TWO COLUMN
========================================================= */
.two-column-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

/* =========================================================
   SPEAKER
========================================================= */
.speaker-group {
  margin-top: 2px;
}

.speaker-row {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 7px;
}

.speaker-input {
  flex: 1;
}

.remove-speaker-btn {
  color: #999999;
}

.speaker-action {
  display: flex;
  justify-content: center;
  margin-top: 4px;
}

.add-speaker-btn {
  min-height: 32px;
  padding: 0 18px;
  border-color: #18bd4f;
  border-radius: 8px;
  color: #18bd4f;
  font-size: 11px;
}

/* =========================================================
   SCHEDULE
========================================================= */
.schedule-section {
  margin-top: 15px;
}

.schedule-heading-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 20px;
}

.selected-date-range {
  color: #333333;
  font-size: 10px;
}

.selected-date-range.empty {
  color: #aaaaaa;
}

.select-date-btn {
  min-height: 40px;
  padding: 0 15px;
  border-color: #d6d6d6;
  border-radius: 10px;
  color: #18bd4f;
  font-size: 11px;
}

/* =========================================================
   SCHEDULE TABLE
========================================================= */
.schedule-table {
  width: 100%;
}

.schedule-table-header,
.schedule-row {
  display: grid;
  grid-template-columns: minmax(190px, 1fr) minmax(250px, 1.4fr) 65px;
  align-items: center;
}

.schedule-table-header {
  min-height: 31px;
  padding: 0 12px;
  border-bottom: 1px solid #cccccc;
  color: #a0a0a0;
  font-size: 10px;
}

.schedule-row {
  min-height: 40px;
  padding: 0 12px;
  border-bottom: 1px solid #eeeeee;
}

.schedule-row:hover {
  background: #fbfdfb;
}

/* =========================================================
   DATE
========================================================= */
.schedule-date {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #333333;
  font-size: 11px;
}

.schedule-date .q-icon {
  color: #222222;
}

/* =========================================================
   TIME
========================================================= */
.time-inputs {
  display: flex;
  align-items: center;
  gap: 6px;
}

.time-input {
  width: 130px;
}

.time-input :deep(.q-field__control) {
  min-height: 29px;
  height: 29px;
  border-radius: 6px;
}

.time-input :deep(.q-field__native) {
  font-size: 10px;
}

.time-separator {
  color: #888888;
  font-size: 10px;
}

/* =========================================================
   ACTION
========================================================= */
.action-column {
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn {
  color: #999999;
}

.delete-btn:hover {
  color: #d83d3d;
}

/* =========================================================
   EMPTY SCHEDULE
========================================================= */
.schedule-empty {
  min-height: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #aaaaaa;
  font-size: 10px;
}

/* =========================================================
   DEPARTMENT
========================================================= */
.department-section {
  margin-top: 18px;
}

.department-header {
  display: flex;
  justify-content: space-between;
}

.attendee-count {
  margin-top: -2px;
  color: #777777;
  font-size: 9px;
}

.attendee-count strong {
  color: #444444;
}

/* =========================================================
   SEARCH
========================================================= */
.department-search {
  margin-top: 10px;
  margin-bottom: 15px;
}

.department-search :deep(.q-field__control) {
  min-height: 35px;
  height: 35px;
  border-radius: 8px;
}

.department-search :deep(.q-field__native) {
  font-size: 11px;
}

.department-search :deep(.q-field__prepend) {
  padding-right: 5px;
  color: #c8c8c8;
}

/* =========================================================
   DEPARTMENT TABLE
========================================================= */
.department-table-header,
.department-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr 55px;
  align-items: center;
}

.department-table-header {
  min-height: 30px;
  padding: 0 12px;
  border-bottom: 1px solid #cccccc;
  color: #aaaaaa;
  font-size: 10px;
}

.department-row {
  min-height: 40px;
  padding: 0 12px;
  border-bottom: 1px solid #eeeeee;
}

.department-name {
  color: #333333;
  font-size: 10px;
}

.attendee-input-wrapper {
  display: flex;
  align-items: center;
}

.attendee-input {
  width: 70px;
}

.attendee-input :deep(.q-field__native) {
  font-size: 10px;
}

.department-action {
  display: flex;
  justify-content: center;
}

.department-empty {
  padding: 20px;
  color: #aaaaaa;
  font-size: 10px;
  text-align: center;
}

/* =========================================================
   ADD DEPARTMENT
========================================================= */
.add-department-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.add-department-btn {
  min-height: 31px;
  border-color: #18bd4f;
  border-radius: 7px;
  color: #18bd4f;
  font-size: 10px;
}

/* =========================================================
   PAGE ACTIONS
========================================================= */
.page-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
}

.cancel-btn {
  color: #777777;
  font-size: 11px;
}

.create-btn {
  min-height: 38px;
  padding: 0 22px;
  border-radius: 8px;
  color: #ffffff;
  background: #18bd4f;
  font-size: 11px;
  font-weight: 600;
}

/* =========================================================
   DIALOG
========================================================= */
.date-dialog,
.department-dialog {
  width: 470px;
  max-width: 92vw;
  border-radius: 13px;
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 17px 19px;
}

.dialog-title {
  color: #222222;
  font-size: 15px;
  font-weight: 700;
}

.dialog-subtitle {
  margin-top: 3px;
  color: #999999;
  font-size: 10px;
}

.date-dialog-body {
  padding: 18px;
}

.dialog-field {
  margin-bottom: 13px;
}

.dialog-field :deep(.q-field__control) {
  border-radius: 8px;
}

.dialog-field :deep(.q-field__native),
.dialog-field :deep(.q-field__label) {
  font-size: 11px;
}

.dialog-actions {
  padding: 11px 18px;
  background: #fafafa;
}

.save-dialog-btn {
  min-height: 35px;
  padding: 0 17px;
  border-radius: 8px;
  color: white;
  background: #18bd4f;
  font-size: 11px;
}

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 1000px) {
  .event-layout {
    grid-template-columns: 1fr;
  }

  .event-information-card,
  .schedule-information-card {
    min-height: auto;
  }
}

@media (max-width: 650px) {
  .create-event-page {
    padding: 20px 12px;
  }

  .two-column-fields {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .schedule-heading-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .select-date-btn {
    width: 100%;
  }

  .schedule-table-header,
  .schedule-row {
    grid-template-columns: 1.2fr 1.2fr 45px;
  }

  .time-inputs {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .time-separator {
    display: none;
  }

  .time-input {
    width: 100%;
  }

  .department-table-header,
  .department-row {
    grid-template-columns: 1.3fr 0.8fr 40px;
  }

  .page-actions {
    justify-content: stretch;
  }

  .page-actions .cancel-btn,
  .page-actions .create-btn {
    flex: 1;
  }
}
</style>
