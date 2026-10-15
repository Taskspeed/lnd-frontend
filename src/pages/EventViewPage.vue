<template>
  <q-page class="event-view-page">
    <!-- =========================================================
         LOADING
    ========================================================== -->
    <div v-if="eventStore.loading && !event" class="state-message">
      <q-spinner
          size="40px"
          color="primary"
        />
      <span>Loading schedule event...</span>
    </div>

    <!-- =========================================================
         NOT FOUND
    ========================================================== -->
    <div v-else-if="!event" class="state-message">
      <q-icon name="event_busy" size="40px" />
      <div>Event not found.</div>
      <q-btn
        flat
        no-caps
        label="Back to Events"
        class="back-link"
        @click="goBack"
      />
    </div>

    <!-- =========================================================
         EVENT PAGE
    ========================================================== -->
    <template v-else>
      <!-- =======================================================
           PAGE HEADER
      ======================================================== -->
      <EventPageHeader
        title="Event Information"
        :subtitle="event.title_name || 'Untitled Event'"
        @back="goBack"
      />

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
            <q-input
              :model-value="event.title_name"
              outlined
              dense
              readonly
              placeholder="—"
              class="custom-input"
            />
          </LabeledField>

          <!-- CATEGORY -->
          <LabeledField label="Category">
            <q-input
              :model-value="event.category_name"
              outlined
              dense
              readonly
              placeholder="—"
              class="custom-input"
            />
          </LabeledField>

          <!-- TYPE -->
          <LabeledField label="Type">
            <q-input
              :model-value="event.type_name"
              outlined
              dense
              readonly
              placeholder="—"
              class="custom-input"
            />
          </LabeledField>

          <!-- SOURCE -->
          <LabeledField label="Source">
            <q-input
              :model-value="event.source_name"
              outlined
              dense
              readonly
              placeholder="—"
              class="custom-input"
            />
          </LabeledField>

          <!-- FORMS -->
          <div class="section-divider"></div>

          <div class="section-title forms-title">Forms</div>

          <div v-if="event.form && event.form.length" class="forms-list">
            <q-checkbox
              v-for="form in event.form"
              :key="form.formId"
              model-value
              disable
              :label="form.form_name"
              color="green"
              dense
            />
          </div>

          <div v-else class="empty-section">No forms assigned.</div>

          <!-- ASSESSMENT -->
          <div class="section-title subsection-title">Assessment</div>

          <q-input
            :model-value="event.pre_test"
            outlined
            dense
            readonly
            placeholder="Pre Test"
            class="custom-input assessment-input"
          />

          <q-input
            :model-value="event.post_test"
            outlined
            dense
            readonly
            placeholder="Post Test"
            class="custom-input assessment-input"
          />

          <!-- CERTIFICATE -->
          <div class="section-title subsection-title">Certificate</div>

          <q-input
            :model-value="
              event.certificate?.name ||
              event.certificate?.title ||
              event.certificate
            "
            outlined
            dense
            readonly
            placeholder="Certificate"
            class="custom-input"
          />
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
              <q-btn
                outline
                no-caps
                icon="calendar_month"
                label="Add Schedule"
                class="add-schedule-btn"
                @click="openAddSchedule"
              />
            </div>

            <!-- Schedule Table using q-table -->
            <div class="schedule-table-container">
              <q-table
                :rows="event.schedule || []"
                :columns="scheduleColumns"
                row-key="scheduleId"
                :rows-per-page-options="[5, 10, 25]"
                v-model:pagination="schedulePagination"
                class="schedule-table"
                flat
                bordered
              >
                <!-- Date Column -->
                <template #body-cell-date="props">
                  <q-td :props="props">
                    <div class="schedule-date-cell">
                      <q-icon
                        name="calendar_today"
                        size="15px"
                        class="q-mr-sm"
                      />
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

                <!-- Status Column -->
                <template #body-cell-status="props">
                  <q-td :props="props">
                    <q-badge
                      :class="[
                        'status-badge',
                        statusBadgeClass(props.row.status),
                      ]"
                    >
                      {{ props.row.status || "—" }}
                    </q-badge>
                  </q-td>
                </template>

                <!-- Action Column -->
                <template #body-cell-action="props">
                  <q-td :props="props">
                    <div class="schedule-actions">
                      <q-btn
                        flat
                        round
                        dense
                        icon="edit"
                        class="action-btn"
                        @click="editSchedule(props.row)"
                      >
                        <q-tooltip>Edit Schedule</q-tooltip>
                      </q-btn>

                      <q-btn
                        flat
                        round
                        dense
                        icon="delete_outline"
                        class="action-btn delete-action"
                        @click="deleteSchedule(props.row)"
                      >
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
                    <q-btn
                      flat
                      no-caps
                      label="Add Schedule"
                      icon="add"
                      class="empty-add-btn"
                      @click="openAddSchedule"
                    />
                  </div>
                </template>
              </q-table>
            </div>
          </template>

          <!-- ============================================
               SCHEDULE FORM VIEW
          ============================================= -->
          <template v-else>
            <div class="form-header">
              <q-btn
                flat
                round
                dense
                icon="arrow_back"
                class="back-btn"
                @click="backToScheduleList"
              >
                <q-tooltip>Back to Schedules</q-tooltip>
              </q-btn>
              <div class="section-title form-title">
                {{ editingSchedule ? "Edit Schedule" : "Add Schedule" }}
              </div>
            </div>

            <!-- ERROR -->
            <q-banner
              v-if="eventStore.error"
              dense
              rounded
              class="bg-red-2 text-red-9 error-banner"
            >
              {{ eventStore.error }}
            </q-banner>

            <!-- VENUE + MODE -->
            <div class="two-column-fields">
              <LabeledField label="Venue">
                <q-input
                  v-model="eventForm.venue_name"
                  outlined
                  dense
                  placeholder="Enter venue"
                  class="custom-input"
                />
              </LabeledField>

              <LabeledField label="Mode">
                <q-select
                  v-model="eventForm.mode_name"
                  outlined
                  dense
                  emit-value
                  map-options
                  :options="modeOptions"
                  placeholder="Select mode"
                  class="custom-input"
                  :display-value="
                    eventForm.mode_name ? undefined : 'Select Mode'
                  "
                />
              </LabeledField>
            </div>

            <!-- RESOURCE SPEAKER -->
            <LabeledField label="Resource Speaker" class="speaker-group">
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
            </LabeledField>

            <!-- TABS: SCHEDULE DATE & DEPARTMENT -->
            <q-tabs
              v-model="activeTab"
              dense
              class="tab-navigation"
              active-color="green"
              indicator-color="green"
              align="left"
              narrow-indicator
            >
              <q-tab name="schedule" label="Schedule Date" />
              <q-tab name="department" label="Department" />
            </q-tabs>

            <q-separator />

            <!-- TAB PANELS -->
            <q-tab-panels v-model="activeTab" animated class="tab-panels">
              <!-- SCHEDULE TAB -->
              <q-tab-panel name="schedule" class="tab-panel">
                <div class="schedule-heading-row">
                  <div>
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

                <!-- Schedule Table (Form View) -->
                <div class="schedule-table-container form-schedule-table">
                  <q-table
                    :rows="eventForm.schedules"
                    :columns="formScheduleColumns"
                    row-key="id"
                    :rows-per-page-options="[5, 10, 25]"
                    v-model:pagination="formSchedulePagination"
                    class="schedule-table"
                    flat
                    bordered
                  >
                    <!-- Date Column -->
                    <template #body-cell-date="props">
                      <q-td :props="props">
                        <div class="schedule-date-cell">
                          <q-icon
                            name="calendar_today"
                            size="15px"
                            class="q-mr-sm"
                          />
                          <span>{{ props.row.date || "—" }}</span>
                        </div>
                      </q-td>
                    </template>

                    <!-- Hours Column -->
                    <template #body-cell-hours="props">
                      <q-td :props="props">
                        <q-input
                          v-model.number="props.row.hours"
                          type="number"
                          min="0"
                          outlined
                          dense
                          placeholder="0"
                          class="hours-input"
                        />
                      </q-td>
                    </template>

                    <!-- Action Column -->
                    <template #body-cell-action="props">
                      <q-td :props="props">
                        <q-btn
                          flat
                          round
                          dense
                          icon="delete_outline"
                          class="delete-btn"
                          @click="removeScheduleRow(props.rowIndex)"
                        >
                          <q-tooltip>Remove Date</q-tooltip>
                        </q-btn>
                      </q-td>
                    </template>

                    <!-- No Data State -->
                    <template #no-data>
                      <div class="schedule-empty">
                        <q-icon name="calendar_month" size="28px" />
                        <span>Select a date to create a schedule</span>
                      </div>
                    </template>
                  </q-table>
                </div>
              </q-tab-panel>

              <!-- DEPARTMENT TAB -->
              <q-tab-panel name="department" class="tab-panel">
                <div class="department-header">
                  <div class="attendee-count-wrapper">
                    <div class="attendee-count">
                      Total of Attendees:
                      <strong>{{ totalAttendees }}</strong>
                    </div>
                  </div>
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

                <q-input
                  v-model="departmentSearch"
                  outlined
                  dense
                  clearable
                  placeholder="Search departments..."
                  class="department-search"
                >
                  <template #prepend>
                    <q-icon name="search" size="17px" />
                  </template>
                </q-input>

                <!-- Department Table -->
                <div class="department-table-container">
                  <q-table
                    :rows="filteredDepartments"
                    :columns="departmentColumns"
                    row-key="id"
                    :rows-per-page-options="[5, 10, 25]"
                    v-model:pagination="departmentPagination"
                    class="department-table"
                    flat
                    bordered
                  >
                    <!-- Department Name Column -->
                    <template #body-cell-name="props">
                      <q-td :props="props">
                        <div class="department-name-cell">
                          {{ props.row.name }}
                        </div>
                      </q-td>
                    </template>

                    <!-- Attendees Column -->
                    <template #body-cell-attendees="props">
                      <q-td :props="props">
                        <q-input
                          v-model.number="props.row.attendees"
                          type="number"
                          min="0"
                          outlined
                          dense
                          class="attendee-input-main"
                        />
                      </q-td>
                    </template>

                    <!-- Action Column -->
                    <template #body-cell-action="props">
                      <q-td :props="props">
                        <q-btn
                          flat
                          round
                          dense
                          icon="delete_outline"
                          class="delete-btn"
                          @click="removeDepartment(props.rowIndex)"
                        >
                          <q-tooltip>Remove Department</q-tooltip>
                        </q-btn>
                      </q-td>
                    </template>

                    <!-- No Data State -->
                    <template #no-data>
                      <div class="empty-state">
                        <q-icon name="business" size="32px" color="grey-4" />
                        <div>No departments added.</div>
                      </div>
                    </template>
                  </q-table>
                </div>
              </q-tab-panel>
            </q-tab-panels>

            <!-- FORM ACTIONS -->
            <div class="page-actions">
              <q-btn
                flat
                no-caps
                label="Cancel"
                class="cancel-btn"
                @click="backToScheduleList"
              />

              <q-btn
                unelevated
                no-caps
                :label="editingSchedule ? 'Save Changes' : 'Add Schedule'"
                class="create-btn"
                :loading="saving"
                @click="saveSchedule"
              />
            </div>
          </template>
        </template>
      </EventTwoColumnLayout>
    </template>

    <!-- =========================================================
         DATE DIALOG
    ========================================================== -->
    <q-dialog v-model="showDateDialog">
      <q-card class="date-dialog">
        <EventDialogHeader
          title="Select Schedule Dates"
          subtitle="Select one or multiple dates for this schedule."
        />

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
    <q-dialog
      v-model="showDepartmentDialog"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="department-dialog">
        <EventDialogHeader
          title="Add Departments"
          subtitle="Select departments and specify the number of attendees for each."
        />

        <q-separator />

        <q-card-section class="department-dialog-body">
          <!-- Search Bar -->
          <q-input
            v-model="officeSearch"
            outlined
            dense
            clearable
            placeholder="Search departments..."
            class="office-search"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <!-- Quick Actions Row -->
          <div class="quick-actions-row">
            <div class="selected-badge" v-if="selectedOffices.length > 0">
              <q-badge color="green" text-color="white" rounded>
                {{ selectedOffices.length }} department{{
                  selectedOffices.length > 1 ? "s" : ""
                }}
                selected
              </q-badge>
            </div>

            <div class="bulk-attendee-wrapper">
              <q-input
                v-model.number="bulkAttendeeCount"
                type="number"
                min="0"
                outlined
                dense
                placeholder="Set all to"
                class="bulk-input"
                style="width: 120px"
              />
              <q-btn
                flat
                no-caps
                color="green"
                label="Apply to All Selected"
                :disable="
                  selectedOffices.length === 0 ||
                  bulkAttendeeCount === null ||
                  bulkAttendeeCount === ''
                "
                @click="applyBulkAttendees"
                class="apply-bulk-btn"
              />
            </div>
          </div>

          <!-- Offices Table -->
          <div class="offices-table-container">
            <q-table
              :rows="filteredOffices"
              :columns="officeColumns"
              row-key="officeId"
              :loading="officeStore.loading"
              :rows-per-page-options="[5, 10, 25, 50]"
              v-model:pagination="officePagination"
              binary-state-sort
              selection="multiple"
              v-model:selected="selectedOffices"
              class="offices-table"
              flat
              bordered
            >
              <!-- Office Name Column -->
              <template #body-cell-office_name="props">
                <q-td :props="props">
                  <div class="office-name-cell">
                    {{ props.row.office_name }}
                  </div>
                </q-td>
              </template>

              <!-- Attendees Column -->
              <template #body-cell-attendees="props">
                <q-td :props="props">
                  <q-input
                    v-model.number="props.row._attendees"
                    type="number"
                    min="0"
                    outlined
                    dense
                    placeholder="0"
                    class="attendee-input-cell"
                    @update:model-value="updateAttendeeValue(props.row)"
                  >
                    <template #append>
                      <q-icon name="people" color="grey-6" size="18px" />
                    </template>
                  </q-input>
                </q-td>
              </template>

              <!-- Loading State -->
              <template #loading>
                <div class="loading-state">
                  <q-spinner-dots color="green" size="40px" />
                  <div>Loading departments...</div>
                </div>
              </template>

              <!-- No Data State -->
              <template #no-data>
                <div class="no-data-state">
                  <q-icon name="business" size="40px" color="grey-4" />
                  <div>No departments available</div>
                </div>
              </template>
            </q-table>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat no-caps label="Cancel" v-close-popup />
          <q-btn
            unelevated
            no-caps
            label="Add Selected"
            class="save-dialog-btn"
            :disable="selectedOffices.length === 0"
            @click="addSelectedDepartments"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, computed, ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useEventStore } from "stores/eventStore";
import { useOfficeStore } from "stores/officeStore";

import EventPageHeader from "components/events/EventPageHeader.vue";
import EventTwoColumnLayout from "components/events/EventTwoColumnLayout.vue";
import EventDialogHeader from "components/events/EventDialogHeader.vue";
import LabeledField from "components/events/LabeledField.vue";

export default defineComponent({
  name: "EventViewPage",

  components: {
    EventPageHeader,
    EventTwoColumnLayout,
    EventDialogHeader,
    LabeledField,
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
    // LOADING
    // =========================================================
    const saving = ref(false);
    const activeTab = ref("schedule");

    // =========================================================
    // OPTIONS
    // =========================================================
    const modeOptions = [
      { label: "Face to Face", value: "Face to Face" },
      { label: "Online", value: "Online" },
      { label: "Hybrid", value: "Hybrid" },
    ];

    const statusOptions = [
      { label: "Created", value: "Created" },
      { label: "Ongoing", value: "Ongoing" },
      { label: "Approved", value: "Approved" },
      { label: "Completed", value: "Completed" },
      { label: "Cancelled", value: "Cancelled" },
    ];

    function statusBadgeClass(status) {
      switch (status) {
        case "Approved":
          return "status-approved";
        case "Completed":
          return "status-completed";
        case "Ongoing":
          return "status-ongoing";
        case "Cancelled":
          return "status-cancelled";
        case "Created":
        default:
          return "status-created";
      }
    }

    // =========================================================
    // SCHEDULE TABLE (List View)
    // =========================================================
    const schedulePagination = ref({
      sortBy: "schedule_date_range",
      descending: false,
      rowsPerPage: 5,
      page: 1,
    });

    const scheduleColumns = [
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
        field: "status",
        align: "center",
        sortable: true,
        style: "min-width: 130px;",
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
    // SCHEDULE FORM TABLE (Form View)
    // =========================================================
    const formSchedulePagination = ref({
      sortBy: "date",
      descending: false,
      rowsPerPage: 5,
      page: 1,
    });

    const formScheduleColumns = [
      {
        name: "date",
        label: "Date",
        field: "date",
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
        style: "min-width: 150px;",
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
    // SCHEDULE VIEW STATE
    // =========================================================
    const scheduleView = ref("list");
    const editingSchedule = ref(false);
    const editingScheduleId = ref(null);

    const emptyEventForm = () => ({
      venue_name: "",
      mode_name: null,
      speakers: [{ id: Date.now(), name: "" }],
      schedules: [],
      departments: [],
    });

    const eventForm = ref(emptyEventForm());

    function openAddSchedule() {
      editingSchedule.value = false;
      editingScheduleId.value = null;
      eventForm.value = emptyEventForm();
      activeTab.value = "schedule";
      eventStore.clearError();
      scheduleView.value = "form";
    }

    function editSchedule(item) {
      editingSchedule.value = true;
      editingScheduleId.value = item.scheduleId;
      eventForm.value = {
        venue_name: item.venue_name === "—" ? "" : item.venue_name || "",
        mode_name: item.mode_name || null,
        speakers: [{ id: Date.now(), name: "" }],
        schedules: [
          {
            id: item.scheduleId || Date.now(),
            rawDate: null,
            date: item.schedule_date_range || "—",
            hours: item.hours ?? 0,
          },
        ],
        departments: [],
      };
      activeTab.value = "schedule";
      eventStore.clearError();
      scheduleView.value = "form";
    }

    function backToScheduleList() {
      eventStore.clearError();
      scheduleView.value = "list";
    }

    // =========================================================
    // DEPARTMENT TABLE (MAIN)
    // =========================================================
    const departmentSearch = ref("");
    const departmentPagination = ref({
      sortBy: "name",
      descending: false,
      rowsPerPage: 5,
      page: 1,
    });

    const departmentColumns = [
      {
        name: "name",
        label: "Department",
        field: "name",
        align: "left",
        sortable: true,
        style: "min-width: 200px;",
      },
      {
        name: "attendees",
        label: "No. of Attendees",
        field: "attendees",
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
        style: "width: 60px;",
      },
    ];

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
    // OFFICE TABLE (DIALOG)
    // =========================================================
    const officeSearch = ref("");
    const selectedOffices = ref([]);
    const bulkAttendeeCount = ref(null);
    const officePagination = ref({
      sortBy: "office_name",
      descending: false,
      rowsPerPage: 9,
      page: 1,
    });

    const officeColumns = [
      {
        name: "office_name",
        required: true,
        label: "Department / Office",
        field: "office_name",
        align: "left",
        sortable: true,
        style: "min-width: 280px;",
      },
      {
        name: "attendees",
        label: "No. of Attendee/s",
        field: "attendees",
        align: "center",
        sortable: false,
        style: "min-width: 160px;",
      },
    ];

    const initializeSelectedOffices = (offices) => {
      return offices.map((office) => ({
        ...office,
        _attendees: office._attendees || 0,
      }));
    };

    const filteredOffices = computed(() => {
      const offices = officeStore.offices.map((office) => {
        const existing = selectedOffices.value.find(
          (o) => o.officeId === office.officeId
        );
        return {
          ...office,
          _attendees: existing?._attendees ?? 0,
        };
      });

      if (!officeSearch.value) return offices;

      const search = officeSearch.value.toLowerCase().trim();
      return offices.filter((office) =>
        office.office_name.toLowerCase().includes(search)
      );
    });

    watch(
      selectedOffices,
      (newVal) => {
        newVal.forEach((office) => {
          if (
            office._attendees === undefined ||
            office._attendees === null ||
            isNaN(office._attendees)
          ) {
            office._attendees = 0;
          }
        });
      },
      { deep: true }
    );

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
      selectedDates.value = eventForm.value.schedules
        .map((schedule) => schedule.rawDate)
        .filter(Boolean);
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
          hours: existing?.hours ?? 0,
        };
      });

      showDateDialog.value = false;
    }

    function removeScheduleRow(index) {
      eventForm.value.schedules.splice(index, 1);
    }

    // =========================================================
    // DATE RANGE
    // =========================================================
    const selectedDateRange = computed(() => {
      const schedules = eventForm.value.schedules;

      if (!schedules.length) return "";

      const dates = schedules
        .map((schedule) => schedule.rawDate)
        .filter(Boolean)
        .sort();

      if (!dates.length) {
        return schedules[0]?.date || "";
      }

      if (dates.length === 1) {
        return formatDate(dates[0]);
      }

      return `${formatDate(dates[0])} - ${formatDate(dates[dates.length - 1])}`;
    });

    // =========================================================
    // DEPARTMENT DIALOG
    // =========================================================
    const showDepartmentDialog = ref(false);

    function openDepartmentDialog() {
      officeSearch.value = "";
      bulkAttendeeCount.value = null;

      const existingOfficeIds = eventForm.value.departments.map((d) => d.id);
      const preselectedOffices = officeStore.offices
        .filter((office) => existingOfficeIds.includes(office.officeId))
        .map((office) => {
          const existingDept = eventForm.value.departments.find(
            (d) => d.id === office.officeId
          );
          return {
            ...office,
            _attendees: existingDept?.attendees || 0,
          };
        });

      selectedOffices.value = initializeSelectedOffices(preselectedOffices);
      showDepartmentDialog.value = true;
    }

    function updateAttendeeValue(row) {
      const index = selectedOffices.value.findIndex(
        (o) => o.officeId === row.officeId
      );
      if (index !== -1) {
        const value = Number(row._attendees);
        selectedOffices.value[index]._attendees = isNaN(value) ? 0 : value;
      }
    }

    function applyBulkAttendees() {
      if (
        selectedOffices.value.length === 0 ||
        bulkAttendeeCount.value === null
      ) {
        return;
      }

      const count = Number(bulkAttendeeCount.value);
      selectedOffices.value.forEach((office) => {
        office._attendees = isNaN(count) ? 0 : count;
      });

      $q.notify({
        type: "positive",
        message: `Applied ${count} attendee${count > 1 ? "s" : ""} to ${
          selectedOffices.value.length
        } department(s).`,
        position: "top",
        timeout: 1500,
      });
    }

    function addSelectedDepartments() {
      eventForm.value.departments = selectedOffices.value.map((office) => ({
        id: office.officeId,
        name: office.office_name,
        attendees: Number(office._attendees) || 0,
      }));

      showDepartmentDialog.value = false;

      if (selectedOffices.value.length > 0) {
        $q.notify({
          type: "positive",
          message: `${selectedOffices.value.length} department(s) added successfully.`,
          position: "top",
          timeout: 2000,
        });
      }
    }

    function removeDepartment(index) {
      eventForm.value.departments.splice(index, 1);
    }

    // =========================================================
    // SAVE SCHEDULE
    // =========================================================
    async function saveSchedule() {
      eventStore.clearError();

      if (!eventForm.value.schedules.length) {
        $q.notify({
          type: "warning",
          message: "Please add at least one schedule date.",
          position: "top",
        });
        return;
      }

      const payload = {
        venue_name: eventForm.value.venue_name,
        mode_name: eventForm.value.mode_name,
        speakers: eventForm.value.speakers
          .filter((speaker) => speaker.name.trim())
          .map((speaker) => speaker.name),
        schedules: eventForm.value.schedules.map((schedule) => ({
          schedule_date: schedule.rawDate,
          hours: Number(schedule.hours) || 0,
        })),
        departments: eventForm.value.departments.map((department) => ({
          department_id: department.id,
          attendees: Number(department.attendees),
        })),
      };

      saving.value = true;

      try {
        const result = editingSchedule.value
          ? await eventStore.updateSchedule(editingScheduleId.value, payload)
          : await eventStore.addSchedule(eventId.value, payload);

        if (!result?.success) {
          throw new Error(result?.message || "Unable to save schedule.");
        }

        $q.notify({
          type: "positive",
          message: result.message || "Schedule saved successfully.",
          position: "top",
        });

        await eventStore.fetchEventById(eventId.value);
        backToScheduleList();
      } catch (error) {
        console.error(error);
        $q.notify({
          type: "negative",
          message: error?.message || "Unable to save schedule.",
          position: "top",
        });
      } finally {
        saving.value = false;
      }
    }

    // =========================================================
    // DELETE SCHEDULE
    // =========================================================
    function deleteSchedule(item) {
      $q.dialog({
        title: "Delete Schedule",
        message: "Are you sure you want to delete this schedule?",
        cancel: true,
        persistent: true,
        ok: {
          label: "Delete",
          color: "negative",
          unelevated: true,
          noCaps: true,
        },
      }).onOk(async () => {
        try {
          const result = await eventStore.deleteSchedule(item.scheduleId);

          if (result?.success) {
            $q.notify({
              type: "positive",
              message: "Schedule deleted successfully.",
              position: "top",
            });
            await eventStore.fetchEventById(eventId.value);
          }
        } catch (error) {
          console.error(error);
          $q.notify({
            type: "negative",
            message: error?.message || "Unable to delete schedule.",
            position: "top",
          });
        }
      });
    }

    // =========================================================
    // LOAD OFFICES + EVENT
    // =========================================================
    onMounted(async () => {
      try {
        await officeStore.fetchOffices();
      } catch (error) {
        console.error("Failed to load offices:", error);
        $q.notify({
          type: "negative",
          message: "Failed to load departments. Please refresh the page.",
          position: "top",
        });
      }

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
      saving,
      activeTab,
      modeOptions,
      statusOptions,
      statusBadgeClass,
      // Schedule list view
      scheduleView,
      schedulePagination,
      scheduleColumns,
      // Schedule form view
      editingSchedule,
      eventForm,
      formSchedulePagination,
      formScheduleColumns,
      openAddSchedule,
      editSchedule,
      backToScheduleList,
      deleteSchedule,
      saveSchedule,
      // Department table (main)
      departmentSearch,
      filteredDepartments,
      departmentColumns,
      departmentPagination,
      // Office table (dialog)
      officeSearch,
      selectedOffices,
      filteredOffices,
      officeColumns,
      officePagination,
      bulkAttendeeCount,
      totalAttendees,
      // Speakers
      addSpeaker,
      removeSpeaker,
      // Date dialog
      showDateDialog,
      selectedDates,
      openDateDialog,
      applyDates,
      removeScheduleRow,
      selectedDateRange,
      // Department dialog
      showDepartmentDialog,
      openDepartmentDialog,
      updateAttendeeValue,
      applyBulkAttendees,
      addSelectedDepartments,
      removeDepartment,
      // Page nav
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
   ASSESSMENT (left panel)
========================================================= */
.subsection-title {
  margin-top: 16px;
  margin-bottom: 7px;
}

.assessment-input {
  margin-bottom: 7px;
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
  font-size: 11px;
  font-weight: 600;
  color: #555555;
  padding: 8px 12px;
  border-bottom: 2px solid #e0e0e0;
}

.schedule-table :deep(.q-table td) {
  padding: 8px 12px;
  font-size: 12px;
}

.schedule-date-cell {
  display: flex;
  align-items: center;
  color: #333333;
  font-size: 12px;
}

.schedule-hours-cell {
  color: #333333;
  font-size: 12px;
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
   STATUS BADGE
========================================================= */
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
}

.status-created {
  color: #6b6b6b;
  background: #eeeeee;
}

.status-ongoing {
  color: #a9760a;
  background: #fdf1d8;
}

.status-approved {
  color: #18823f;
  background: #e1f7e9;
}

.status-completed {
  color: #1b6ecf;
  background: #e2effd;
}

.status-cancelled {
  color: #c73737;
  background: #fbe4e4;
}

/* =========================================================
   SCHEDULE FORM VIEW
========================================================= */
.form-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.back-btn {
  color: #333333;
}

.form-title {
  margin-bottom: 0;
}

.error-banner {
  margin-bottom: 14px;
  font-size: 12px;
}

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
  margin-bottom: 12px;
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
   TABS
========================================================= */
.tab-navigation {
  margin-top: 16px;
  margin-bottom: 4px;
  border-bottom: 1px solid #e8e8e8;
}

.tab-navigation :deep(.q-tab) {
  font-size: 12px;
  text-transform: none;
  padding: 0 16px;
  min-height: 36px;
}

.tab-panels {
  background: transparent;
}

.tab-panel {
  padding: 12px 0 0 0;
}

/* =========================================================
   SCHEDULE DATE ROW
========================================================= */
.schedule-heading-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 12px;
}

.selected-date-range {
  color: #333333;
  font-size: 12px;
  font-weight: 500;
}

.selected-date-range.empty {
  color: #aaaaaa;
  font-weight: 400;
}

.select-date-btn {
  min-height: 36px;
  padding: 0 15px;
  border-color: #d6d6d6;
  border-radius: 8px;
  color: #18bd4f;
  font-size: 11px;
  flex-shrink: 0;
}

/* =========================================================
   FORM SCHEDULE TABLE
========================================================= */
.form-schedule-table .schedule-table :deep(.q-table td) {
  padding: 4px 8px;
}

.hours-input {
  max-width: 100px;
  margin: 0 auto;
}

.hours-input :deep(.q-field__control) {
  min-height: 32px;
  height: 32px;
  border-radius: 6px;
}

.hours-input :deep(.q-field__native) {
  font-size: 12px;
  text-align: center;
}

.delete-btn {
  color: #999999;
}

.delete-btn:hover {
  color: #d83d3d;
}

.schedule-empty {
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #aaaaaa;
  font-size: 12px;
  padding: 20px;
}

/* =========================================================
   DEPARTMENT SECTION
========================================================= */
.department-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 16px;
  width: 100%;
}

.attendee-count-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
}

.attendee-count {
  color: #555555;
  font-size: 12px;
  padding: 4px 0;
}

.attendee-count strong {
  color: #18bd4f;
  font-size: 14px;
}

.add-department-wrapper {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.add-department-btn {
  min-height: 31px;
  padding: 0 16px;
  border-color: #18bd4f;
  border-radius: 7px;
  color: #18bd4f;
  font-size: 10px;
  white-space: nowrap;
}

.department-search {
  margin-bottom: 12px;
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
.department-table-container {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.department-table {
  width: 100%;
}

.department-table :deep(.q-table__top) {
  padding: 6px 12px;
  background: #f8f9fa;
}

.department-table :deep(.q-table thead tr) {
  background: #f5f5f5;
}

.department-table :deep(.q-table th) {
  font-size: 11px;
  font-weight: 600;
  color: #555555;
  padding: 8px 12px;
  border-bottom: 2px solid #e0e0e0;
}

.department-table :deep(.q-table td) {
  padding: 6px 12px;
  font-size: 12px;
}

.department-name-cell {
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  line-height: 1.4;
  font-size: 11px;
}

.attendee-input-main {
  max-width: 90px;
  margin: 0 auto;
}

.attendee-input-main :deep(.q-field__control) {
  min-height: 30px;
  height: 30px;
  border-radius: 6px;
}

.attendee-input-main :deep(.q-field__native) {
  font-size: 11px;
  text-align: center;
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
   PAGE ACTIONS
========================================================= */
.page-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
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

.create-btn:hover {
  background: #16a844;
}

/* =========================================================
   DIALOGS
========================================================= */
.date-dialog {
  width: 470px;
  max-width: 92vw;
  border-radius: 13px;
}

.date-dialog-body {
  padding: 18px;
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

.save-dialog-btn:disabled {
  opacity: 0.5;
}

/* =========================================================
   DEPARTMENT DIALOG
========================================================= */
.department-dialog {
  width: 100%;
  max-width: 900px;
  height: 90vh;
  max-height: 90vh;
  border-radius: 13px;
  display: flex;
  flex-direction: column;
}

.department-dialog-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 18px 20px;
  overflow: hidden;
}

.office-search {
  margin-bottom: 12px;
  flex-shrink: 0;
}

.office-search :deep(.q-field__control) {
  border-radius: 8px;
}

.quick-actions-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.selected-badge {
  flex-shrink: 0;
}

.bulk-attendee-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bulk-input :deep(.q-field__control) {
  border-radius: 8px;
  min-height: 36px;
  height: 36px;
}

.bulk-input :deep(.q-field__native) {
  font-size: 12px;
}

.apply-bulk-btn {
  font-size: 11px;
  padding: 0 12px;
  height: 36px;
  text-transform: none;
  border: 1px solid #18bd4f;
  border-radius: 8px;
}

.apply-bulk-btn:disabled {
  opacity: 0.4;
}

.offices-table-container {
  flex: 1;
  overflow: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.offices-table {
  width: 100%;
}

.offices-table :deep(.q-table__top) {
  padding: 6px 12px;
  background: #f8f9fa;
}

.offices-table :deep(.q-table thead tr) {
  background: #f5f5f5;
}

.offices-table :deep(.q-table th) {
  font-size: 11px;
  font-weight: 600;
  color: #555555;
  padding: 8px 12px;
  border-bottom: 2px solid #e0e0e0;
}

.offices-table :deep(.q-table td) {
  padding: 6px 12px;
  font-size: 12px;
}

.office-name-cell {
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  line-height: 1.4;
  font-size: 12px;
}

.attendee-input-cell {
  max-width: 140px;
  margin: 0 auto;
}

.attendee-input-cell :deep(.q-field__control) {
  min-height: 32px;
  height: 32px;
  border-radius: 6px;
}

.attendee-input-cell :deep(.q-field__native) {
  font-size: 12px;
  text-align: center;
}

.attendee-input-cell :deep(.q-field__append) {
  padding-left: 4px;
}

.loading-state {
  padding: 40px;
  text-align: center;
  color: #999999;
}

.loading-state > div {
  margin-top: 10px;
}

.no-data-state {
  padding: 40px;
  text-align: center;
  color: #b0b0b0;
}

.no-data-state > div {
  margin-top: 8px;
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

  .two-column-fields {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .schedule-heading-row {
    flex-direction: column;
    align-items: stretch;
  }

  .select-date-btn {
    width: 100%;
  }

  .page-actions {
    justify-content: stretch;
  }

  .page-actions .cancel-btn,
  .page-actions .create-btn {
    flex: 1;
  }

  .department-header {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .add-department-wrapper {
    width: 100%;
  }

  .add-department-btn {
    width: 100%;
  }

  .department-dialog {
    max-width: 100%;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }

  .quick-actions-row {
    flex-direction: column;
    align-items: stretch;
  }

  .bulk-attendee-wrapper {
    width: 100%;
  }

  .bulk-input {
    width: 100% !important;
  }

  .apply-bulk-btn {
    flex: 1;
  }

  .offices-table :deep(.q-table td),
  .offices-table :deep(.q-table th) {
    padding: 4px 8px;
    font-size: 11px;
  }

  .office-name-cell {
    font-size: 11px;
  }

  .attendee-input-cell {
    max-width: 100px;
  }

  .attendee-input-cell :deep(.q-field__native) {
    font-size: 11px;
  }

  .department-table :deep(.q-table td),
  .department-table :deep(.q-table th) {
    padding: 4px 8px;
    font-size: 11px;
  }

  .department-name-cell {
    font-size: 10px;
  }

  .attendee-input-main {
    max-width: 70px;
  }

  .tab-navigation :deep(.q-tab) {
    font-size: 11px;
    padding: 0 12px;
    min-height: 32px;
  }

  .hours-input {
    max-width: 70px;
  }
}
</style>
