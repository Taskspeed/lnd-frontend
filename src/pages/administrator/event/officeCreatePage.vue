<template>
  <q-page class="create-event-page">
    <!-- =========================================================
         PAGE HEADER
    ========================================================== -->
    <EventPageHeader
      title="Create Event"
      subtitle="Fill in the details to create a new event"
      @back="goBack"
    />

    <!-- =========================================================
         ERROR BANNER
    ========================================================== -->
    <q-banner
      v-if="eventStore.error"
      dense
      rounded
      class="bg-red-2 text-red-9 error-banner"
    >
      {{ eventStore.error }}
    </q-banner>

    <!-- =========================================================
         MAIN CONTENT
    ========================================================== -->
    <EventTwoColumnLayout>
      <!-- =======================================================
           LEFT PANEL
      ======================================================== -->
      <template #left>
        <div class="section-title">Event111</div>

        <!-- TITLE -->
       <LabeledField label="Title">
       <q-select
          v-model="eventForm.title_name"
          outlined
          dense
          use-input
          hide-selected
          fill-input
          input-debounce="400"
          new-value-mode="add-unique"
          :options="titleOptions"
          :loading="titleLoading"
          @filter="filterTitles"
          @input-value="onTitleInput"
          popup-content-class="title-dropdown-scroll"
          placeholder="Enter event title"
          class="custom-input"
        />
      </LabeledField>

        <!-- CATEGORY -->
        <LabeledField label="Category">
          <q-select
         v-model="eventForm.category_name"
          outlined
          dense
          use-input
          hide-selected
          fill-input
          input-debounce="400"
          new-value-mode="add-unique"
          :options="categoryOptions"
          :loading="categoryLoading"
          @filter="filterCategory"
          @input-value="onCategoryInput"
          popup-content-class="title-dropdown-scroll"
          placeholder="Enter event category"
          class="custom-input"
          />
        </LabeledField>

        <!-- SOURCE (RADIO) -->
        <LabeledField label="Source">
          <div class="source-radio-group">
            <q-radio
              v-for="option in sourceOptions"
              :key="option.value"
              v-model="eventForm.source_name"
              :val="option.value"
              :label="option.label"
              color="green"
              dense
            />
          </div>
        </LabeledField>

        <!-- L&D INTERVENTION -->
        <div class="section-divider"></div>

        <div class="section-title forms-title">L&amp;D Intervention</div>

        <!-- INTERVENTION -->
        <LabeledField label="Intervention">
          <q-select
            v-model="eventForm.intervention_name"
            outlined
            dense
            emit-value
            map-options
            :options="interventionOptions"
            placeholder="Select Intervention"
            class="custom-input"
            :display-value="
              eventForm.intervention_name ? undefined : 'Select Intervention'
            "
          />
        </LabeledField>

        <!-- TYPE -->
        <LabeledField label="Type">
          <q-select
            v-model="eventForm.type_name"
            outlined
            dense
            emit-value
            map-options
            :options="typeOptions"
            :disable="!eventForm.intervention_name"
            placeholder="Select Type"
            class="custom-input"
            :display-value="
              eventForm.type_name
                ? undefined
                : eventForm.intervention_name
                ? 'Select Type'
                : 'Select Intervention first'
            "
          />
        </LabeledField>
      </template>

      <!-- =======================================================
           RIGHT PANEL
      ======================================================== -->
      <template #right>
        <!-- =====================================================
             CATEGORY-SPECIFIC FORM
             Schedule Details is exclusive to Formal Learning.
             The other 3 Intervention categories show only their own
             form — no venue, speakers, or schedule/department tabs.
        ====================================================== -->
        <template
          v-if="
            eventForm.intervention_name &&
            eventForm.intervention_name !== 'Formal Learning'
          "
        >
          <div class="section-title">
            {{ eventForm.intervention_name }} Details
          </div>

          <!-- LEARNING BY DOING FORM -->
          <template v-if="eventForm.intervention_name === 'Learning by Doing'">
            <q-input
              v-model="eventForm.interventionForm.example"
              outlined
              dense
              placeholder="Example (e.g. specific project or task)"
              class="custom-input assessment-input"
            />
            <q-input
              v-model="eventForm.interventionForm.output"
              outlined
              dense
              placeholder="Output / Deliverable"
              class="custom-input assessment-input"
            />
            <q-input
              v-model="eventForm.interventionForm.supervisor"
              outlined
              dense
              placeholder="Assigned Supervisor / Mentor"
              class="custom-input"
            />
          </template>

          <!-- SOCIAL LEARNING FORM -->
          <template
            v-else-if="eventForm.intervention_name === 'Social Learning'"
          >
            <q-input
              v-model="eventForm.interventionForm.learning_partner"
              outlined
              dense
              placeholder="Learning Partner / Mentor"
              class="custom-input assessment-input"
            />
            <q-input
              v-model="eventForm.interventionForm.topic"
              outlined
              dense
              placeholder="Topic Covered"
              class="custom-input assessment-input"
            />
            <q-select
              v-model="eventForm.interventionForm.frequency"
              outlined
              dense
              emit-value
              map-options
              :options="frequencyOptions"
              placeholder="Frequency"
              class="custom-input"
              :display-value="
                eventForm.interventionForm.frequency
                  ? undefined
                  : 'Select Frequency'
              "
            />
          </template>

          <!-- SELF-DIRECTED LEARNING FORM -->
          <template
            v-else-if="eventForm.intervention_name === 'Self-Directed Learning'"
          >
            <q-input
              v-model="eventForm.interventionForm.resource"
              outlined
              dense
              placeholder="Learning Resource / Material"
              class="custom-input assessment-input"
            />
            <q-input
              v-model="eventForm.interventionForm.proof"
              outlined
              dense
              placeholder="Proof of Completion"
              class="custom-input assessment-input"
            />
            <q-input
              v-model="eventForm.interventionForm.objective"
              outlined
              dense
              placeholder="Learning Objective"
              class="custom-input"
            />
          </template>
        </template>

        <!-- SCHEDULE DETAILS — Formal Learning only (also shown as
             the default panel before an Intervention is chosen) -->
        <template v-else>
          <div class="section-title">Schedule Details</div>

          <!-- VENUE + MODE -->
          <div class="two-column-fields">
            <LabeledField label="Venue">
              <q-select
                v-model="eventForm.venue_name"
                outlined
                dense
                use-input
                hide-selected
                fill-input
                input-debounce="400"
                new-value-mode="add-unique"
                :options="venueOptions"
                :loading="venueLoading"
                @filter="filterVenues"
                @input-value="onVenuesInput"
                placeholder="Enter event venue"
                popup-content-class="title-dropdown-scroll"
                class="custom-input"
              />
           
            </LabeledField>

            <LabeledField label="Mode">
               <q-select
                v-model="eventForm.mode_name"
                outlined
                dense
                use-input
                hide-selected
                fill-input
                input-debounce="400"
                new-value-mode="add-unique"
                :options="modeOptions"
                :loading="modeLoading"
                @filter="filterModes"
                @input-value="onModesInput"
                placeholder="Enter event mode"
                popup-content-class="title-dropdown-scroll"
                class="custom-input"
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

              <q-input
                v-model="speaker.agency"
                outlined
                dense
                placeholder="Agency"
                class="custom-input speaker-agency-input"
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

                  <div
                    v-if="eventForm.schedules.length"
                    class="total-hours-label"
                  >
                    Total Hours: <strong>{{ totalScheduleHours }} hrs</strong>
                    <span class="lunch-note"
                      >(lunch break 12:00–1:00 excluded)</span
                    >
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

              <!-- SCHEDULE TABLE -->
              <div class="schedule-table">
                <div class="schedule-table-header">
                  <div class="date-column">Date</div>
                  <div class="time-column">Time</div>
                  <div class="hours-column">Hours</div>
                  <div class="action-column">Action</div>
                </div>

                <div
                  v-for="(schedule, index) in eventForm.schedules"
                  :key="schedule.id"
                  class="schedule-row"
                >
                  <div class="date-column schedule-date">
                    <q-icon name="calendar_today" size="15px" />
                    <span>{{ schedule.date }}</span>
                  </div>

                  <div class="time-column">
                    <div class="time-inputs">
                      <!-- START TIME (q-time picker, 24hr storage) -->
                      <q-input
                        :model-value="formatTimeDisplay(schedule.time_start)"
                        outlined
                        dense
                        readonly
                        placeholder="Start time"
                        class="time-input"
                      >
                        <template #append>
                          <q-icon name="access_time" class="time-picker-icon">
                            <q-popup-proxy
                              cover
                              transition-show="scale"
                              transition-hide="scale"
                            >
                              <q-time
                                v-model="schedule.time_start"
                                mask="HH:mm"
                                color="green"
                              >
                                <div class="row items-center justify-end">
                                  <q-btn
                                    v-close-popup
                                    label="Close"
                                    color="green"
                                    flat
                                    no-caps
                                  />
                                </div>
                              </q-time>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>

                      <span class="time-separator">-</span>

                      <!-- END TIME (q-time picker, 24hr storage) -->
                      <q-input
                        :model-value="formatTimeDisplay(schedule.time_end)"
                        outlined
                        dense
                        readonly
                        placeholder="End time"
                        class="time-input"
                      >
                        <template #append>
                          <q-icon name="access_time" class="time-picker-icon">
                            <q-popup-proxy
                              cover
                              transition-show="scale"
                              transition-hide="scale"
                            >
                              <q-time
                                v-model="schedule.time_end"
                                mask="HH:mm"
                                color="green"
                              >
                                <div class="row items-center justify-end">
                                  <q-btn
                                    v-close-popup
                                    label="Close"
                                    color="green"
                                    flat
                                    no-caps
                                  />
                                </div>
                              </q-time>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                  </div>

                  <div class="hours-column schedule-hours">
                    {{ getScheduleHours(schedule) }} hrs
                  </div>

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

                <div v-if="!eventForm.schedules.length" class="schedule-empty">
                  <q-icon name="calendar_month" size="28px" />
                  <span>Select a date to create a schedule</span>
                </div>
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
                placeholder="Search and add a department"
                class="department-search"
              >
                <template #prepend>
                  <q-icon name="search" size="17px" />
                </template>
              </q-input>

              <!-- Department Table with Pagination -->
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
        </template>
      </template>
    </EventTwoColumnLayout>

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
        <EventDialogHeader
          title="Select Schedule Dates"
          subtitle="Select one or multiple dates for this event."
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
         DEPARTMENT DIALOG (FIXED)
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
            <div class="selection-actions">
              <q-btn
                flat
                dense
                no-caps
                label="Select All"
                class="select-all-btn"
                :disable="!filteredOffices.length"
                @click="selectAllOffices"
              />
              <q-btn
                flat
                dense
                no-caps
                label="Clear All"
                class="clear-all-btn"
                :disable="!selectedOffices.length"
                @click="clearAllOffices"
              />

              <div class="selected-badge" v-if="selectedOffices.length > 0">
                <q-badge color="green" text-color="white" rounded>
                  {{ selectedOffices.length }} department{{
                    selectedOffices.length > 1 ? "s" : ""
                  }}
                  selected
                </q-badge>
              </div>
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

          <!-- Offices Table with Pagination -->
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
              <!-- Custom column for Office Name -->
              <template #body-cell-office_name="props">
                <q-td :props="props">
                  <div class="office-name-cell">
                    {{ props.row.office_name }}
                  </div>
                </q-td>
              </template>

              <!-- Custom column for Attendees -->
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
import { useRouter } from "vue-router";
import { useEventStore } from "stores/eventStore";
import { useOfficeStore } from "stores/officeStore";

import EventPageHeader from "components/events/EventPageHeader.vue";
import EventTwoColumnLayout from "components/events/EventTwoColumnLayout.vue";
import EventDialogHeader from "components/events/EventDialogHeader.vue";
import LabeledField from "components/events/LabeledField.vue";

import { useModeStore } from "src/stores/library/event/modeStore";
import { useTitleStore } from "src/stores/library/event/titleStore";
import { useVenueStore } from "src/stores/library/event/venueStore";
import { useCategoryStore } from "src/stores/library/event/categoryStore";

export default defineComponent({
  name: "CreateEventPage",

  components: {
    EventPageHeader,
    EventTwoColumnLayout,
    EventDialogHeader,
    LabeledField,
  },

  setup() {


    // event  component start

    // title
    const titleStore = useTitleStore();
    const titleOptions = ref([])
    const titleLoading = ref(false)


    // venue
    const venueStore = useVenueStore();
    const venueOptions = ref([])
    const venueLoading = ref(false)

    // mode 
    const modeStore = useModeStore();
    const modeOptions = ref([])
    const modeLoading = ref(false)

        // mode 
    const categoryStore = useCategoryStore();
    const categoryOptions = ref([])
    const categoryLoading = ref(false)
    // event component  end


    const router = useRouter();
    const eventStore = useEventStore();
    const officeStore = useOfficeStore();

    // =========================================================
    // LOADING
    // =========================================================
    const saving = ref(false);
    const activeTab = ref("schedule");

    // =========================================================
    // EVENT FORM
    // NOTE: schedule.time_start / time_end are stored as 24-hour
    // "HH:mm" strings (q-time's native format). This guarantees
    // the value is always parseable — no more free-typed "8am"
    // style strings that can silently break the hour calculation.
    // =========================================================
    const eventForm = ref({
      title_name: "",
      category_name: null,
      source_name: null, // "In-house" or "External"
      intervention_name: null,
      type_name: null,
      interventionForm: {
        // Learning by Doing
        example: "",
        output: "",
        supervisor: "",
        // Social Learning
        learning_partner: "",
        topic: "",
        frequency: null,
        // Self-Directed Learning
        resource: "",
        proof: "",
        objective: "",
      },
      venue_name: "",
      mode_name: null,
      speakers: [
        {
          id: Date.now(),
          name: "",
          agency: "",
        },
      ],
      schedules: [],
      departments: [],
    });

    // =========================================================
    // OPTIONS
    // =========================================================


    const sourceOptions = [
      { label: "In-house", value: "In-house" },
      { label: "External", value: "External" },
    ];



    const frequencyOptions = [
      { label: "One-time", value: "One-time" },
      { label: "Weekly", value: "Weekly" },
      { label: "Monthly", value: "Monthly" },
      { label: "Ongoing", value: "Ongoing" },
    ];

    // =========================================================
    // L&D INTERVENTION HIERARCHY
    // Intervention (top level) -> Type (sub-options)
    // =========================================================
    const interventionOptions = [
      { label: "Formal Learning", value: "Formal Learning" },
      { label: "Learning by Doing", value: "Learning by Doing" },
      { label: "Social Learning", value: "Social Learning" },
      { label: "Self-Directed Learning", value: "Self-Directed Learning" },
    ];

    const typeOptionsMap = {
      "Formal Learning": [
        "Seminar",
        "Workshop",
        "Conference",
        "Course",
        "Training",
      ],
      "Learning by Doing": [
        "Benchmarking",
        "Job Rotation",
        "Temporary Assignment",
        "Special Project",
        "Cross-Program Assignment",
        "Other Work-Based Learning",
      ],
      "Social Learning": [
        "Coaching",
        "Mentoring",
        "Knowledge Sharing",
        "Job Shadowing",
        "Peer Learning",
      ],
      "Self-Directed Learning": [
        "E-Learning",
        "Self-Study",
        "Reading",
        "Webinar",
        "Research",
      ],
    };

    // Fields that belong to each intervention's own form, used both
    // to reset state on category change and to build the payload.
    const interventionFormFieldsMap = {
      "Learning by Doing": [
        { key: "example", label: "Example" },
        { key: "output", label: "Output / Deliverable" },
        { key: "supervisor", label: "Assigned Supervisor / Mentor" },
      ],
      "Social Learning": [
        { key: "learning_partner", label: "Learning Partner / Mentor" },
        { key: "topic", label: "Topic Covered" },
        { key: "frequency", label: "Frequency" },
      ],
      "Self-Directed Learning": [
        { key: "resource", label: "Learning Resource / Material" },
        { key: "proof", label: "Proof of Completion" },
        { key: "objective", label: "Learning Objective" },
      ],
    };

    // Type options depend on the selected Intervention category.
    const typeOptions = computed(() => {
      const category = eventForm.value.intervention_name;
      if (!category) return [];

      return (typeOptionsMap[category] || []).map((type) => ({
        label: type,
        value: type,
      }));
    });

    function resetInterventionForm() {
      eventForm.value.interventionForm = {
        example: "",
        output: "",
        supervisor: "",
        learning_partner: "",
        topic: "",
        frequency: null,
        resource: "",
        proof: "",
        objective: "",
      };
    }

    // Reset Type + the intervention-specific form whenever the
    // Intervention category changes, so stale data from a previously
    // selected category never leaks into a different one.
    watch(
      () => eventForm.value.intervention_name,
      () => {
        eventForm.value.type_name = null;
        resetInterventionForm();
      }
    );

    // Builds only the payload entries relevant to the currently
    // selected Intervention category, skipping empty fields.
    function buildInterventionFormPayload() {
      const category = eventForm.value.intervention_name;
      const data = eventForm.value.interventionForm;
      const fields = interventionFormFieldsMap[category] || [];

      return fields
        .filter((field) => data[field.key])
        .map((field) => ({
          form_name: field.label,
          form_value: data[field.key],
        }));
    }

    // =========================================================
    // DEPARTMENT TABLE (MAIN)
    // =========================================================
    const departmentSearch = ref("");
    const departmentPagination = ref({
      sortBy: "name",
      descending: false,
      rowsPerPage: 4,
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

    // Initialize selected offices with _attendees property
    const initializeSelectedOffices = (offices) => {
      return offices.map((office) => ({
        ...office,
        _attendees: office._attendees || 0,
      }));
    };

    const filteredOffices = computed(() => {
      const offices = officeStore.offices.map((office) => {
        // Check if this office is already in selectedOffices
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

    // Watch selectedOffices to ensure _attendees is always a number
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
    // SELECT ALL / CLEAR ALL (OFFICE DIALOG)
    // =========================================================
    function selectAllOffices() {
      // Merge currently filtered offices into selection, preserving
      // any _attendees value already set.
      const merged = filteredOffices.value.map((office) => {
        const existing = selectedOffices.value.find(
          (o) => o.officeId === office.officeId
        );
        return {
          ...office,
          _attendees: existing?._attendees ?? office._attendees ?? 0,
        };
      });

      // Keep any previously selected offices that fall outside the
      // current filter/search results.
      const outsideFilter = selectedOffices.value.filter(
        (selected) =>
          !filteredOffices.value.some(
            (office) => office.officeId === selected.officeId
          )
      );

      selectedOffices.value = initializeSelectedOffices([
        ...outsideFilter,
        ...merged,
      ]);
    }

    function clearAllOffices() {
      selectedOffices.value = [];
    }

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
        agency: "",
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
          // Default to 08:00 - 17:00 (24hr "HH:mm"), matches q-time's mask
          time_start: existing?.time_start || "08:00",
          time_end: existing?.time_end || "17:00",
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
    // SCHEDULE HOURS (excludes 12:00–1:00 lunch break)
    // Times are always stored as valid "HH:mm" 24-hour strings
    // (set via q-time), so parsing here can't fail.
    // =========================================================
    function parseTimeToMinutes(timeStr) {
      if (!timeStr) return null;

      const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
      if (!match) return null;

      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);

      if (hours > 23 || minutes > 59) return null;

      return hours * 60 + minutes;
    }

    function formatTimeDisplay(timeStr) {
      const totalMinutes = parseTimeToMinutes(timeStr);
      if (totalMinutes === null) return "";

      let hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const period = hours >= 12 ? "PM" : "AM";

      hours = hours % 12;
      if (hours === 0) hours = 12;

      return `${hours}:${String(minutes).padStart(2, "0")} ${period}`;
    }

    function computeScheduleMinutes(schedule) {
      const start = parseTimeToMinutes(schedule.time_start);
      const end = parseTimeToMinutes(schedule.time_end);

      if (start === null || end === null || end <= start) return 0;

      let totalMinutes = end - start;

      // Lunch break: 12:00 pm (720) - 1:00 pm (780)
      const lunchStart = 12 * 60;
      const lunchEnd = 13 * 60;

      const overlapStart = Math.max(start, lunchStart);
      const overlapEnd = Math.min(end, lunchEnd);
      const overlap = Math.max(0, overlapEnd - overlapStart);

      totalMinutes -= overlap;

      return Math.max(0, totalMinutes);
    }

    function formatHours(minutes) {
      const hours = minutes / 60;
      const rounded = Math.round(hours * 10) / 10;
      return Number.isInteger(rounded) ? rounded : rounded.toFixed(1);
    }

    function getScheduleHours(schedule) {
      return formatHours(computeScheduleMinutes(schedule));
    }

    const totalScheduleHours = computed(() => {
      const totalMinutes = eventForm.value.schedules.reduce(
        (sum, schedule) => sum + computeScheduleMinutes(schedule),
        0
      );
      return formatHours(totalMinutes);
    });

    // =========================================================
    // DEPARTMENT DIALOG
    // =========================================================
    const showDepartmentDialog = ref(false);

    function openDepartmentDialog() {
      officeSearch.value = "";
      bulkAttendeeCount.value = null;

      // Pre-select offices that are already added
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

    // Update attendee value and ensure it persists
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

      showNotify({
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
        showNotify({
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
    // LOAD OFFICES
    // =========================================================
    onMounted(async () => {
      try {
        await officeStore.fetchOffices();
      } catch (error) {
        console.error("Failed to load offices:", error);
        showNotify({
          type: "negative",
          message: "Failed to load departments. Please refresh the page.",
          position: "top",
        });
      }
    });

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
      // Validation
      if (!eventForm.value.title_name) {
        showNotify({
          type: "warning",
          message: "Please enter an event title.",
          position: "top",
        });
        return;
      }

      if (!eventForm.value.intervention_name) {
        showNotify({
          type: "warning",
          message: "Please select an intervention.",
          position: "top",
        });
        return;
      }

      if (!eventForm.value.type_name) {
        showNotify({
          type: "warning",
          message: "Please select a type.",
          position: "top",
        });
        return;
      }

      if (!eventForm.value.source_name) {
        showNotify({
          type: "warning",
          message: "Please select at least one source.",
          position: "top",
        });
        return;
      }

      if (
        eventForm.value.intervention_name === "Formal Learning" &&
        !eventForm.value.schedules.length
      ) {
        showNotify({
          type: "warning",
          message: "Please add at least one schedule date.",
          position: "top",
        });
        return;
      }

      // Build payload according to API expectations
      const payload = {
        title_name: eventForm.value.title_name,
        category_name: eventForm.value.category_name,
        intervention_name: eventForm.value.intervention_name,
        type_name: eventForm.value.type_name,
        source_name: eventForm.value.source_name,
        qualifications: null,
        hours: totalScheduleHours.value,
        venue_name: eventForm.value.venue_name,
        mode_name: eventForm.value.mode_name,
        form: buildInterventionFormPayload(),
        office: eventForm.value.departments.map((department) => ({
          office_name: department.name,
        })),
        speaker: eventForm.value.speakers
          .filter((speaker) => speaker.name.trim())
          .map((speaker) => ({
            speaker_name: speaker.name,
            agency_name: speaker.agency,
          })),
        DateTime: eventForm.value.schedules.map((schedule) => ({
          schedule_date: schedule.rawDate,
          time_in: formatTimeDisplay(schedule.time_start), // "8:00 AM" instead of "08:00"
          time_out: formatTimeDisplay(schedule.time_end), // "5:00 PM" instead of "17:00"
          hours: getScheduleHours(schedule),
        })),
      };

      eventStore.clearError();
      saving.value = true;

      try {
        const result = await eventStore.createEvent(payload);

        if (!result.success) {
          throw new Error(result.message || "Unable to create event.");
        }

        showNotify({
          type: "positive",
          message: result.message || "Event created successfully.",
          position: "top",
        });

        router.back();
      } catch (error) {
        console.error(error);
        showNotify({
          type: "negative",
          message: error?.message || "Unable to create event.",
          position: "top",
        });
      } finally {
        saving.value = false;
      }
    }

    function onTitleInput(val) {
  eventForm.value.title_name = val;
}
async function filterTitles(val, update, abort) {
  titleLoading.value = true;
  try {
    await titleStore.fetchTitles(val);
    update(() => {
      titleOptions.value = titleStore.Titles.map((t) => t.title_name);
    });
  } catch (err) {
    abort();
    console.error(err);
  } finally {
    titleLoading.value = false;
  }
}

  function onVenuesInput(val) {
  eventForm.value.venue_name = val;
}
async function filterVenues(val, update, abort) {
   venueLoading.value = true;
  try {
    await venueStore.fetchVenues(val);
    update(() => {
      venueOptions.value = venueStore.Venues.map((v) => v.venue_name);
    });
  } catch (err) {
    abort();
    console.error(err);
  } finally {
    venueLoading.value = false;
  }
}

 function onModesInput(val) {
  eventForm.value.mode_name = val;
}
async function filterModes(val, update, abort) {
   modeLoading.value = true;
  try {
    await modeStore.fetchModes(val);
    update(() => {
       modeOptions.value = modeStore.modes.map((m) => m.mode_name);
    });
  } catch (err) {
    abort();
    console.error(err);
  } finally {
    modeLoading.value = false;
  }
}


 function onCategoryInput(val) {
  eventForm.value.category_name = val;
}
async function filterCategory(val, update, abort) {
   categoryLoading.value = true;
  try {
    await categoryStore.fetchCategorys(val);
    update(() => {
       categoryOptions.value = categoryStore.Categorys.map((c) => c.category_name);
    });
  } catch (err) {
    abort();
    console.error(err);
  } finally {
    categoryLoading.value = false;
  }
}
    
    

    // =========================================================
    // RETURN
    // =========================================================
    return {
      eventStore,
      officeStore,
      saving,
      activeTab,
      eventForm,
      sourceOptions,
   
      frequencyOptions,
      interventionOptions,
      typeOptions,
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
      selectAllOffices,
      clearAllOffices,
      // Functions
      totalAttendees,
      addSpeaker,
      removeSpeaker,
      showDateDialog,
      selectedDates,
      openDateDialog,
      applyDates,
      removeSchedule,
      selectedDateRange,
      formatTimeDisplay,
      getScheduleHours,
      totalScheduleHours,
      showDepartmentDialog,
      openDepartmentDialog,
      updateAttendeeValue,
      applyBulkAttendees,
      addSelectedDepartments,
      removeDepartment,
      goBack,
      cancelCreate,
      createEvent,

      //event component

      //title
      titleOptions,
      titleLoading,
      filterTitles,
      onTitleInput,

      //venue
      venueOptions,
      venueLoading,
      filterVenues,
      onVenuesInput,
    
      // mode
      modeOptions,
      modeLoading,
      filterModes,
      onModesInput,

      //category
      categoryLoading,
      categoryOptions,
      onCategoryInput,
      filterCategory

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
  padding: 10px 20px 5px;
  background: #ffffff;
  color: #151515;
}

/* =========================================================
   ERROR BANNER
========================================================= */
.error-banner {
  margin-bottom: 14px;
  font-size: 12px;
}

/* =========================================================
   SECTION TITLE
========================================================= */
.section-title {
  margin-bottom: 5px;
  color: #222222;
  font-size: 13px;
  font-weight: 650;
}

.forms-title {
  margin-bottom: 9px;
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
   SOURCE RADIO GROUP
========================================================= */
.source-radio-group {
  display: flex;
  align-items: center;
  gap: 20px;
  min-height: 35px;
}

.source-radio-group :deep(.q-radio__label) {
  color: #333333;
  font-size: 12px;
}

/* =========================================================
   ASSESSMENT / DYNAMIC INTERVENTION FORM
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
  margin-bottom: 12px;
}

.speaker-row {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 7px;
}

.speaker-input {
  flex: 1.2;
}

.speaker-agency-input {
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
   SCHEDULE
========================================================= */
.schedule-heading-row {
  display: flex;
  align-items: flex-start;
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

.total-hours-label {
  margin-top: 4px;
  color: #555555;
  font-size: 11px;
}

.total-hours-label strong {
  color: #18bd4f;
  font-size: 12px;
}

.lunch-note {
  margin-left: 4px;
  color: #aaaaaa;
  font-size: 10px;
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
   SCHEDULE TABLE
========================================================= */
.schedule-table {
  width: 100%;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.schedule-table-header,
.schedule-row {
  display: grid;
  grid-template-columns: minmax(130px, 1fr) minmax(200px, 1.4fr) 80px 65px;
  align-items: center;
}

.schedule-table-header {
  min-height: 31px;
  padding: 0 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #cccccc;
  color: #a0a0a0;
  font-size: 10px;
  font-weight: 600;
}

.schedule-row {
  min-height: 40px;
  padding: 0 12px;
  border-bottom: 1px solid #eeeeee;
}

.schedule-row:last-child {
  border-bottom: none;
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
  min-height: 40px;
  height: 40px;
  border-radius: 6px;
  cursor: pointer;
}

.time-input :deep(.q-field__native) {
  font-size: 10px;
  cursor: pointer;
}

.time-picker-icon {
  color: #18bd4f;
  cursor: pointer;
}

.time-separator {
  color: #888888;
  font-size: 10px;
}

/* =========================================================
   HOURS
========================================================= */
.hours-column {
  text-align: center;
}

.schedule-hours {
  color: #18bd4f;
  font-size: 11px;
  font-weight: 600;
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
  min-height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #aaaaaa;
  font-size: 10px;
  padding: 20px;
}

/* =========================================================
   DEPARTMENT SECTION (MAIN)
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
   DEPARTMENT TABLE (MAIN)
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

.selection-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.select-all-btn,
.clear-all-btn {
  min-height: 30px;
  padding: 0 10px;
  border-radius: 7px;
  font-size: 11px;
  text-transform: none;
}

.select-all-btn {
  color: #18bd4f;
}

.clear-all-btn {
  color: #d83d3d;
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

.no-data-state,
.empty-state {
  padding: 40px;
  text-align: center;
  color: #b0b0b0;
}

.no-data-state > div,
.empty-state > div {
  margin-top: 8px;
}

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 650px) {
  .create-event-page {
    padding: 20px 12px;
  }

  .two-column-fields {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .speaker-row {
    flex-wrap: wrap;
  }

  .speaker-input,
  .speaker-agency-input {
    flex: 1 1 100%;
  }

  .schedule-heading-row {
    flex-direction: column;
    align-items: stretch;
  }

  .select-date-btn {
    width: 100%;
  }

  .schedule-table-header,
  .schedule-row {
    grid-template-columns: 1fr 1fr 55px 40px;
  }

  .time-inputs {
    flex-direction: column;
    align-items: stretch;
    gap: 2px;
  }

  .time-separator {
    display: none;
  }

  .time-input {
    width: 100%;
  }

  .schedule-hours {
    font-size: 10px;
  }

  .page-actions {
    justify-content: stretch;
  }

  .page-actions .cancel-btn,
  .page-actions .create-btn {
    flex: 1;
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

  .selection-actions {
    justify-content: space-between;
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
  .title-dropdown-scroll {
  max-height: 250px;
  overflow-y: auto;
}
}
</style>
