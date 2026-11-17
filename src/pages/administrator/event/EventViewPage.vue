<template>
  <q-page class="event-view-page">
    <!-- LOADING -->
    <div v-if="eventStore.loading && !event" class="state-message">
      <q-spinner size="40px" color="primary" />
      <span>Loading schedule event...</span>
    </div>

    <!-- NOT FOUND -->
    <div v-else-if="!event" class="state-message">
      <q-icon name="event_busy" size="40px" />
      <div>Event not found.</div>
      <q-btn flat no-caps label="Back to Events" class="back-link" @click="goBack" />
    </div>

    <!-- EVENT PAGE -->
    <template v-else>
      <EventPageHeader title="Event Information" :subtitle="event.title_name || 'Untitled Event'" @back="goBack" />

      <EventTwoColumnLayout>
        <!-- LEFT: EVENT INFORMATION -->
        <template #left>
          <div class="section-title">Event</div>

          <!-- TITLE -->
          <LabeledField label="Title">
            <q-input :model-value="event.title_name" type="textarea" autogrow outlined dense readonly placeholder="—"
              class="custom-input title-input" />
          </LabeledField>

          <template v-if="scheduleView === 'form'">
            <div class="section-divider"></div>

            <!-- FORM SCHEDULE (open / due) -->
            <div class="form-schedule">
              <LabeledField label="Form Open Time">
                <q-input :model-value="formatFormDate(formOpenDate)" outlined dense readonly
                  placeholder="Select open date & time" class="custom-input">
                  <template #append>
                    <q-icon v-if="formOpenDate" name="close" class="time-picker-icon"
                      @click.stop="formOpenDate = null" />
                    <q-icon v-else name="event" class="time-picker-icon">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <div class="row no-wrap">
                          <q-date v-model="formOpenDate" mask="YYYY-MM-DD HH:mm" color="green" />
                          <q-time v-model="formOpenDate" mask="YYYY-MM-DD HH:mm" color="green" />
                        </div>
                        <div class="row items-center justify-end q-pa-sm">
                          <q-btn v-close-popup label="Done" color="green" flat no-caps />
                        </div>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </LabeledField>

              <LabeledField label="Form Due Time">
                <q-input :model-value="formatFormDate(formDueDate)" outlined dense readonly
                  placeholder="Select due date & time" class="custom-input">
                  <template #append>
                    <q-icon v-if="formDueDate" name="close" class="time-picker-icon" @click.stop="formDueDate = null" />
                    <q-icon v-else name="event" class="time-picker-icon">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <div class="row no-wrap">
                          <q-date v-model="formDueDate" mask="YYYY-MM-DD HH:mm" color="green" />
                          <q-time v-model="formDueDate" mask="YYYY-MM-DD HH:mm" color="green" />
                        </div>
                        <div class="row items-center justify-end q-pa-sm">
                          <q-btn v-close-popup label="Done" color="green" flat no-caps />
                        </div>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </LabeledField>
            </div>

            <!-- FORMS -->
            <div class="section-title forms-title">Forms</div>
            <div class="competency-group">
              <div class="forms-list">
                <q-checkbox v-for="option in formsOptions" :key="option.value" v-model="forms" :val="option.value"
                  :label="option.label" color="green" keep-color dense class="competency-checkbox" />
              </div>
            </div>

            <div class="section-divider"></div>

            <!-- EVALUATION -->
            <div class="section-title forms-title">Evaluation</div>
            <div class="competency-group">
              <div class="forms-list">
                <q-checkbox v-for="option in evaluationOptions" :key="option.value" v-model="evaluations"
                  :val="option.value" :label="option.label" color="green" keep-color dense
                  class="competency-checkbox" />
              </div>
            </div>

            <div class="section-divider"></div>

            <!-- ARMS -->
            <div class="section-title forms-title">ARMS</div>
            <div class="arms-card" :class="{ 'arms-card--on': syncToArms }">
              <div class="arms-card-info">
                <q-icon name="sync_alt" size="20px" class="arms-card-icon" />
                <div>
                  <div class="arms-card-title">Create event on ARMS</div>
                  <div class="arms-card-desc">
                    When turned on, this event will also be created on ARMS once it is saved.
                  </div>
                </div>
              </div>
              <q-toggle v-model="syncToArms" color="green" keep-color />
            </div>

            <div v-if="syncToArms" class="arms-hint">
              <q-icon name="info" size="20px" color="blue-7" />
              <span class="arms-hint-text">
                Make sure the Venue, Schedule Date, and Department are complete.
              </span>
            </div>

            <div class="section-divider"></div>

            <!-- ASSESSMENT (summary lang dito, ang setup ay nasa modal) -->
            <!-- ASSESSMENT -->
            <div class="assessment-header">
              <div class="section-title forms-title">Assessment</div>

              <div class="assessment-header-actions">
                <q-btn v-if="assessmentCount === 0" outline no-caps icon="add" label="Create Assessment"
                  class="create-assessment-btn" @click="openAssessmentDialog" />
                <template v-else>
                  <q-btn outline no-caps dense icon="edit" label="Edit Assessment" class="create-assessment-btn"
                    @click="openAssessmentDialog" />
                  <q-btn flat no-caps dense icon="close" label="Remove" class="remove-assessment-btn"
                    @click="removeAllAssessments" />
                </template>
              </div>
            </div>

            <!-- OPEN / CLOSE TOGGLE (labas ng header at ng modal) -->
            <div v-if="assessmentCount > 0" class="arms-card assessment-toggle-card"
              :class="eventForm.is_assessment_open ? 'arms-card--on' : 'arms-card--off'">
              <div class="arms-card-info">
                <q-icon :name="eventForm.is_assessment_open ? 'lock_open' : 'lock'"
                  :color="eventForm.is_assessment_open ? 'green-7' : 'red-7'" size="20px" class="arms-card-icon" />
                <div class="arms-card-desc">
                  {{ eventForm.is_assessment_open
                    ? 'The assessment is open. Employees can now answer the tests.'
                    : 'The assessment is closed. Turn this on to make it available to employees.' }}
                </div>
              </div>
              <q-toggle v-model="eventForm.is_assessment_open" :color="eventForm.is_assessment_open ? 'green' : 'red'"
                keep-color />
            </div>

            <div v-if="assessmentCount > 0" class="assessment-summary">
              <div v-for="test in assessmentTests" :key="test.key" class="assessment-summary-row">
                <q-icon :name="eventForm[test.formKey] ? 'check_circle' : 'radio_button_unchecked'"
                  :color="eventForm[test.formKey] ? 'green-7' : 'grey-5'" size="18px" />
                <span class="assessment-summary-label">{{ test.label }}</span>
                <span class="assessment-summary-meta">{{ testStatus(test) }}</span>
              </div>
            </div>
            <!-- <div v-if="assessmentCount > 0" class="assessment-summary">
              <div class="assessment-summary-status"
                :class="eventForm.is_assessment_open ? 'assessment-summary-status--open' : 'assessment-summary-status--closed'">
                <q-icon :name="eventForm.is_assessment_open ? 'lock_open' : 'lock'" size="16px" />
                <span>{{ eventForm.is_assessment_open ? 'Open to employees' : 'Closed' }}</span>
              </div>

              <div v-for="test in assessmentTests" :key="test.key" class="assessment-summary-row">
                <q-icon
                  :name="eventForm[test.formKey] || eventForm[test.linkKey] ? 'check_circle' : 'radio_button_unchecked'"
                  :color="eventForm[test.formKey] || eventForm[test.linkKey] ? 'green-7' : 'grey-5'" size="18px" />
                <span class="assessment-summary-label">{{ test.label }}</span>
                <span class="assessment-summary-meta">{{ testStatus(test) }}</span>
              </div>
            </div> -->
          </template>
        </template>

        <!-- RIGHT: SCHEDULES -->
        <template #right>
          <!-- SCHEDULE LIST VIEW -->
          <template v-if="scheduleView === 'list'">
            <div class="schedule-header">
              <div class="schedule-title">Schedules</div>
              <q-btn outline no-caps icon="calendar_month" label="Add Schedule" class="add-schedule-btn"
                @click="openAddSchedule" />
            </div>

            <div class="schedule-table-container">
              <q-table :rows="scheduleRows" :columns="scheduleColumns" row-key="scheduleId"
                v-model:pagination="pagination" :rows-per-page-options="[10, 25, 50]" :loading="eventStore.loading"
                @request="onScheduleRequest" class="app-table schedule-table" flat bordered>

                <template #body-cell-venue_name="props">
                  <q-td :props="props">
                    <div class="schedule-date-cell">
                      <span>{{ props.row.venue_name || "—" }}</span>
                    </div>
                  </q-td>
                </template>

                <template #body-cell-date="props">
                  <q-td :props="props">
                    <div class="schedule-date-cell">
                      <q-icon name="calendar_today" size="15px" class="q-mr-sm" />
                      <span>{{ props.row.schedule_date_range || "—" }}</span>
                    </div>
                  </q-td>
                </template>

                <template #body-cell-hours="props">
                  <q-td :props="props">
                    <div class="schedule-hours-cell">
                      {{ props.row.hours != null ? `${props.row.hours} hrs` : "—" }}
                    </div>
                  </q-td>
                </template>

                <template #body-cell-status="props">
                  <q-td :props="props">
                    <div class="status-badge" :class="'status-' + props.row.computedStatus">
                      {{ props.row.computedStatus }}
                    </div>
                  </q-td>
                </template>

                <template #body-cell-action="props">
                  <q-td :props="props">
                    <div class="schedule-actions">
                      <q-btn flat round dense icon="visibility" color="green" class="action-btn"
                        :loading="isViewLoading(props.row.scheduleId)" :disable="isAnyViewLoading()"
                        @click.stop="viewSchedule(props.row)">
                        <q-tooltip>View</q-tooltip>
                      </q-btn>

                      <q-btn flat round dense icon="edit" color="orange" class="action-btn"
                        :loading="isEditLoading(props.row.scheduleId)" :disable="isAnyEditLoading()"
                        @click="editSchedule(props.row)">
                        <q-tooltip>Edit Schedule</q-tooltip>
                      </q-btn>
                      <q-btn flat round dense icon="delete" color="red" class="action-btn delete-action"
                        :loading="isDeleteLoading(props.row.scheduleId)" :disable="isAnyDeleteLoading()"
                        @click="deleteSchedule(props.row)">
                        <q-tooltip>Delete Schedule</q-tooltip>
                      </q-btn>
                    </div>
                  </q-td>
                </template>

                <template #no-data>
                  <div class="empty-state">
                    <q-icon name="event_busy" size="40px" color="grey-4" />
                    <div class="empty-title">No schedules yet</div>
                    <div class="empty-description">Add a schedule for this event.</div>
                    <q-btn flat no-caps label="Add Schedule" icon="add" class="empty-add-btn"
                      @click="openAddSchedule" />
                  </div>
                </template>
              </q-table>
            </div>
          </template>

          <!-- SCHEDULE FORM VIEW (Add / Edit) -->
          <ScheduleFormPanel v-else :event-id="eventId" :event-title="event.title_name" :schedule="editingScheduleData"
            v-model:sync-to-arms="syncToArms" v-model:form-open-date="formOpenDate" v-model:form-due-date="formDueDate"
            :forms="forms" :evaluations="evaluations" :is-assessment-open="eventForm.is_assessment_open"
            :pre-test-assessment="eventForm.pre_test_assessment || ''"
            :post-test-assessment="eventForm.post_test_assessment || ''" :assessment="assessmentPayload"
            @saved="onScheduleSaved" @cancel="backToScheduleList" />
        </template>
      </EventTwoColumnLayout>

      <!-- =========================================================
           ASSESSMENT DIALOG (left: setup, right: preview)
      ========================================================== -->
      <q-dialog v-model="showAssessmentDialog">
        <q-card class="assessment-dialog">
          <EventDialogHeader title="Create Assessment"
            subtitle="Set up the Pre Test and Post Test. Click a test to preview it on the right." />

          <q-separator />

          <q-card-section class="assessment-dialog-body">
            <div class="assessment-modal-grid">
              <!-- LEFT: SETUP -->
              <div class="assessment-modal-left">


                <div v-for="test in assessmentTests" :key="test.key" class="test-card test-card--clickable"
                  :class="{ 'test-card--active': previewTest && previewTest.key === test.key }"
                  @click="previewTestKey = test.key">
                <div class="test-card-header">
  <div class="test-card-title">{{ test.label }}</div>

  <div class="row items-center q-gutter-xs">
    <q-btn v-if="canCopyFromPre(test)" flat no-caps dense icon="content_copy"
      label="Copy from Pre-Test" class="copy-pre-btn" @click.stop="copyFromPreTest(test)" />

    <q-btn outline no-caps dense :icon="eventForm[test.formKey] ? 'edit' : 'add'"
      :label="eventForm[test.formKey] ? 'Edit Form' : 'Create Form'" class="create-assessment-btn"
      @click.stop="openFormBuilder(test.key)" />
  </div>
</div>

                  <div v-if="eventForm[test.formKey]" class="test-form-summary">
                    <q-icon name="description" size="18px" color="green-7" />
                    <div class="test-form-summary-text">
                      <div class="test-form-summary-title">{{ eventForm[test.formKey].title }}</div>
                      <div class="test-form-summary-meta">
                        {{ eventForm[test.formKey].questions.length }} question(s)
                      </div>
                    </div>
                    <q-btn flat round dense icon="delete" class="delete-btn" @click.stop="removeTestForm(test)">
                      <q-tooltip>Remove Form</q-tooltip>
                    </q-btn>
                  </div>

                  <LabeledField label="Passing Score">
                    <q-input :model-value="getPassingScore(test)" type="number" min="0" outlined dense
                      :disable="!eventForm[test.formKey]" placeholder="eg. 20" class="custom-input" @click.stop
                      @update:model-value="setPassingScore(test, $event)" />
                  </LabeledField>
                </div>

                <div v-if="assessmentCount < MAX_ASSESSMENTS" class="add-more-assessment">
                  <q-btn outline no-caps icon="add" :label="`Add Assessment ${assessmentCount + 1}`"
                    class="create-assessment-btn" @click="addAssessment" />
                </div>
                <div v-else-if="assessmentCount > 1" class="add-more-assessment">
                  <q-btn flat no-caps dense icon="close" label="Remove Last Assessment" class="remove-assessment-btn"
                    @click="removeAssessment" />
                </div>
              </div>

              <!-- RIGHT: PREVIEW -->
              <div class="assessment-modal-right">
                <div class="preview-label">Preview</div>

                <div class="preview-card">
                  <!-- <div class="preview-event">{{ event.title_name || 'Untitled Event' }}</div>
                  <div class="preview-test">{{ previewTest ? previewTest.label : '' }}</div> -->
                  <div class="preview-event">{{ previewTest ? previewTest.label : '' }}</div>
                  <div class="preview-test">{{ event.title_name || 'Untitled Event' }}</div>

                  <q-separator class="preview-separator" />

                  <template v-if="previewForm">
                    <!-- <div class="preview-form-title">{{ previewForm.title }}</div>
                    <div v-if="previewForm.description" class="preview-form-desc">{{ previewForm.description }}</div> -->

                    <div v-for="(q, qi) in previewForm.questions" :key="qi" class="preview-question">
                      <div class="preview-question-text">{{ qi + 1 }}. {{ questionText(q) }}</div>
                      <ul v-if="questionOptions(q).length" class="preview-options">
                        <li v-for="(opt, oi) in questionOptions(q)" :key="oi">{{ opt }}</li>
                      </ul>
                      <div v-else class="preview-answer-line">Short answer</div>
                    </div>
                  </template>

                  <div v-else-if="previewTest && eventForm[previewTest.linkKey]" class="preview-empty">
                    <q-icon name="link" size="28px" />
                    <span>Using Google Form link:</span>
                    <span class="preview-link">{{ eventForm[previewTest.linkKey] }}</span>
                  </div>

                  <div v-else class="preview-empty">
                    <q-icon name="description" size="28px" />
                    <span>No form yet. Click "Create Form" to build the {{ previewTest ? previewTest.label.trim() :
                      'test'
                    }}.</span>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="dialog-actions">
            <q-btn unelevated no-caps label="Done" class="save-dialog-btn" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- GOOGLE FORM BUILDER (Pre Test / Post Test) -->
      <GoogleFormBuilderDialog v-model="showGoogleFormDialog" :event-title="event.title_name || ''"
        :test-label="builderLabel" :initial-form="builderInitialForm" @save="onSaveGoogleForm" />
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
import EventDialogHeader from "components/events/EventDialogHeader.vue";
import LabeledField from "components/events/LabeledField.vue";
import ScheduleFormPanel from "components/events/ScheduleFormPanel.vue";
import GoogleFormBuilderDialog from "components/events/GoogleFormBuilderDialog.vue";

import { evaluationOptions, formsOptions } from "src/constants/form";

import { useScheduleStore } from "src/stores/event/schedule/scheduleStore";
import Swal from "sweetalert2";

import { coreOptions, technicalOptions, leadershipOptions } from "src/constants/competency";
import { useRowLoading } from "src/composables/useRowLoading";
import { formatFormDate, parseFormDate } from "src/composables/event/useFormDate";
import { useAssessmentStore } from "src/stores/event/assessmentStore";


export default defineComponent({
  name: "EventViewPage",

  components: {
    EventPageHeader,
    EventTwoColumnLayout,
    EventDialogHeader,
    LabeledField,
    ScheduleFormPanel,
    GoogleFormBuilderDialog,
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
    const assessmentStore = useAssessmentStore();
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

    const { isLoading: isViewLoading, isAnyLoading: isAnyViewLoading, run: runView } = useRowLoading();
    const { isLoading: isEditLoading, isAnyLoading: isAnyEditLoading, run: runEdit } = useRowLoading();
    const { isLoading: isDeleteLoading, isAnyLoading: isAnyDeleteLoading, run: runDelete } = useRowLoading();


    const scheduleView = ref("list");
    // null = Add mode. Row object = Edit mode.
    const editingScheduleData = ref(null);
    const syncToArms = ref(false);
    const selectedIntervention = ref("Formal Learning");

    // form schedule / forms (shared with ScheduleFormPanel)
    const formOpenDate = ref(null);   // "YYYY-MM-DD HH:mm" (24h) internally
    const formDueDate = ref(null);
    const forms = ref([]);
    const evaluations = ref([]);

    // =========================================================
    // ASSESSMENT STATE (same shape as EventCreatePage)
    // =========================================================
    function defaultAssessmentForm() {
      return {
        // // Assessment 1
        // pre_test_assessment: null,
        // post_test_assessment: null,
        // pre_test_form: null,
        // post_test_form: null,
        // // Assessment 2
        // pre_test_assessment_2: null,
        // post_test_assessment_2: null,
        // pre_test_form_2: null,
        // post_test_form_2: null,
        is_assessment_open: false,
      };
    }

    const eventForm = ref(defaultAssessmentForm());

    const MAX_ASSESSMENTS = 2;
    const assessmentCount = ref(0);

    function buildTests(n) {
      const suffix = n === 1 ? "" : `_${n}`;
      const num = n === 1 ? "" : ` ${n}`;
      return [
        {
          key: `pre${n}`,
          label: `Pre-Test Assessment${num}`,
          formKey: `pre_test_form${suffix}`,
          linkKey: `pre_test_assessment${suffix}`,
        },
        {
          key: `post${n}`,
          label: `Post-Test Assessment${num}`,
          formKey: `post_test_form${suffix}`,
          linkKey: `post_test_assessment${suffix}`,
        },
      ];
    }

    const assessmentTests = computed(() =>
      Array.from({ length: assessmentCount.value }, (_, i) => buildTests(i + 1)).flat()
    );

    function addAssessment() {
      if (assessmentCount.value < MAX_ASSESSMENTS) assessmentCount.value++;
    }

    // Tinatanggal ang pinaka-huling assessment set
    function removeAssessment() {
      const n = assessmentCount.value;
      if (!n) return;

      buildTests(n).forEach((t) => {
        eventForm.value[t.formKey] = null;
        eventForm.value[t.linkKey] = null;
      });

      assessmentCount.value--;
      if (assessmentCount.value === 0) {
        eventForm.value.is_assessment_open = false;
      }
    }

    function resetAssessment() {
      eventForm.value = defaultAssessmentForm();
      assessmentCount.value = 0;
      previewTestKey.value = null;
    }

    // payload na ipapasa sa ScheduleFormPanel
    const assessmentPayload = computed(() =>
      assessmentTests.value
        .map((test) => ({ test, form: eventForm.value[test.formKey] }))
        .filter(({ form }) => form)
        .map(({ test, form }) => ({
          type: test.key.startsWith("pre") ? "pre_test" : "post_test",
          title: `${event.value?.title_name || ""} - ${test.label.trim()}`,
          passing_score: form.passing_score,
          questions: form.questions,
        }))
    );

    // Google Form builder
    const showGoogleFormDialog = ref(false);
    const activeTest = ref(null); // "pre1" | "post1" | "pre2" | "post2"

    const activeTestConfig = computed(
      () => assessmentTests.value.find((t) => t.key === activeTest.value) || null
    );

    const builderInitialForm = computed(() =>
      activeTestConfig.value ? eventForm.value[activeTestConfig.value.formKey] : null
    );

    // default title ng form: "<Event Title> - Pre Test"
    const builderLabel = computed(() => activeTestConfig.value?.label?.trim() || "");

    function openFormBuilder(testKey) {
      activeTest.value = testKey;
      showGoogleFormDialog.value = true;
    }

    function onSaveGoogleForm(form) {
      const test = activeTestConfig.value;
      if (!test) return;

      eventForm.value[test.formKey] = form;

      $q.notify({
        type: "positive",
        message: `${test.label.trim()} form saved with ${form.questions.length} question(s).`,
        position: "top",
      });
    }

    function removeTestForm(test) {
      eventForm.value[test.formKey] = null;
    }
    // Pre-test na kapares ng post-test (post1 -> pre1, post2 -> pre2)
function getPairedPreTest(test) {
  if (!test.key.startsWith("post")) return null;
  const n = test.key.replace("post", "");
  return assessmentTests.value.find((t) => t.key === `pre${n}`) || null;
}

// Lalabas lang ang button kung post-test ito, may laman ang pre-test, at wala pang form ang post-test
function canCopyFromPre(test) {
  const pre = getPairedPreTest(test);
  return !!(pre && eventForm.value[pre.formKey] && !eventForm.value[test.formKey]);
}

function copyFromPreTest(test) {
  const pre = getPairedPreTest(test);
  const source = pre && eventForm.value[pre.formKey];
  if (!source) return;

  const copy = JSON.parse(JSON.stringify(source)); // deep copy

  // bagong record ito, kaya alisin ang mga id ng pre-test
  delete copy.assessmentId;
  copy.title = test.label.trim();
  copy.questions.forEach((q) => {
    delete q.id;
    (q.options || []).forEach((o) => delete o.id);
  });

  eventForm.value[test.formKey] = copy;

  // EventCreatePage: gamitin ang Notify.create
  // EventViewPage: gamitin ang $q.notify
  Notify.create({
    type: "positive",
    message: `Copied ${copy.questions.length} question(s) from ${pre.label.trim()}.`,
    position: "top",
  });
}

    function getPassingScore(test) {
      return eventForm.value[test.formKey]?.passing_score ?? "";
    }

    function setPassingScore(test, value) {
      const form = eventForm.value[test.formKey];
      if (!form) return;
      form.passing_score = value === "" || value === null ? null : Number(value);
    }

    // Assessment modal
    const showAssessmentDialog = ref(false);
    const previewTestKey = ref(null);

    const previewTest = computed(
      () =>
        assessmentTests.value.find((t) => t.key === previewTestKey.value) ||
        assessmentTests.value[0] ||
        null
    );

    const previewForm = computed(() =>
      previewTest.value ? eventForm.value[previewTest.value.formKey] : null
    );

    function openAssessmentDialog() {
      if (assessmentCount.value === 0) addAssessment();
      if (!previewTestKey.value) previewTestKey.value = assessmentTests.value[0]?.key || null;
      showAssessmentDialog.value = true;
    }

    function removeAllAssessments() {
      while (assessmentCount.value > 0) removeAssessment();
      previewTestKey.value = null;
    }

    function testStatus(test) {
      const form = eventForm.value[test.formKey];
      if (form) return `${form.title} · ${form.questions.length} question(s)`;
      if (eventForm.value[test.linkKey]) return "Google Form link added";
      return "Not set";
    }

    function questionText(q) {
      return q?.question ?? q?.title ?? q?.text ?? q?.label ?? "";
    }

    function questionOptions(q) {
      return (q?.options || []).map((o) =>
        typeof o === "string" ? o : o?.option_text ?? o?.label ?? o?.text ?? o?.value ?? ""
      );
    }

    // Galing sa API ang shape ng assessment; i-convert sa shape na gamit ng builder at preview
    function toFormShape(data) {
      return {
        assessmentId: data.assessmentId,
        title: data.title,
        description: "",
        passing_score: data.passing_score,
        questions: (data.questions || []).map((q) => ({
          id: q.id,
          question: q.question,
          question_type: q.question_type,
          points: q.points,
          options: (q.options || []).map((o) => ({
            id: o.id,
            option_text: o.option_text,
            is_correct: o.is_correct,
          })),
        })),
      };
    }

    // Edit mode: i-fetch ang bawat assessment gamit ang assessmentId
    async function loadAssessmentFromApi(data) {
      resetAssessment();

      const list = Array.isArray(data.assessments) ? data.assessments : [];
      eventForm.value.is_assessment_open = !!(
        list[0]?.is_assessment_open ?? data.is_assessment_open
      );
      if (!list.length) return;

      const results = await Promise.all(
        list.map((a) => assessmentStore.view_assessment(a.assessmentId))
      );

      let preCount = 0;
      let postCount = 0;

      results.forEach((res, i) => {
        if (!res?.success) {
          $q.notify({ type: "negative", message: res?.message || "Failed to load assessment.", position: "top" });
          return;
        }

        const title = res.data.title || list[i].title || "";
        const isPost = /post[-\s]?test/i.test(title);
        const setNo = isPost ? ++postCount : ++preCount;
        if (setNo > MAX_ASSESSMENTS) return;

        const [pre, post] = buildTests(setNo);
        eventForm.value[(isPost ? post : pre).formKey] = toFormShape(res.data);
        assessmentCount.value = Math.max(assessmentCount.value, setNo);
      });
    }


    const scheduleColumns = [
      {
        name: "venue_name",
        label: "Venue",
        field: "venue_name",
        align: "left",
        sortable: true,
        style: "min-width: 200px; max-width: 320px; white-space: normal; word-break: break-word;",
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
        name: "pending_count",
        label: "Pending",
        field: "pending_count",
        align: "center",
        sortable: true,
        style: "min-width: 120px;",
      },
      {
        name: "approved_count",
        label: "Approved",
        field: "approved_count",
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
      syncToArms.value = false;
      resetAssessment();
      formOpenDate.value = null;
      formDueDate.value = null;
      forms.value = [];
      evaluations.value = [];
      scheduleView.value = "form";
    }

    function mapCompetencyKeysToValues(sourceObj, optionsList) {
      if (!sourceObj) return [];
      return optionsList
        .filter((option) => sourceObj[option.backendKey] === true)
        .map((option) => option.value);
    }

    // Maps the API form list (with form_name) to the checkbox values
    function mapFormValues(list, options) {
      const names = (list || []).map((f) => f.form_name?.trim().toLowerCase());
      return options
        .filter((o) => names.includes(o.label.trim().toLowerCase()))
        .map((o) => o.value);
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
        learning_intervention: data.learning_intervention || null,
        sg_from: data.sg_from ?? null,
        sg_to: data.sg_to ?? null,

        departments: (data.office || []).map((o) => ({
          id: o.departmentId,
          name: o.office_name,
          attendees: Number(o.number_of_attendees ?? 0),
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
            id: schedule.schedule_date_time_id || schedule.id || `${data.scheduleId}-${index}`,
            rawDate,
            date: schedule.schedule_date || "—",
            morning_in: to24HourTime(schedule.morning_in),
            morning_out: to24HourTime(schedule.morning_out),
            afternoon_in: to24HourTime(schedule.afternoon_in),
            afternoon_out: to24HourTime(schedule.afternoon_out),
            speakers: (schedule.speakers || []).map((speaker) => ({
              id: speaker.speakerId ?? `${schedule.schedule_date_time_id}-${speaker.speaker_name}`,
              name: speaker.speaker_name || "",
              position: speaker.position || "",
              agency: speaker.agency || "",
            })),
          };
        }),
      };
    }

    async function editSchedule(item) {
      return runEdit(item.scheduleId, async () => {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        eventStore.clearError();

        const result = await scheduleStore.view_schedule(item.scheduleId);

        if (result?.success) {
          editingScheduleData.value = mapScheduleResponseToForm(result.data);
          syncToArms.value = !!result.data.sync_to_arms;

          await loadAssessmentFromApi(result.data);

          formOpenDate.value = parseFormDate(result.data.form_open_date);
          formDueDate.value = parseFormDate(result.data.form_due_date);

          const formList = result.data.form ?? event.value?.form ?? [];
          forms.value = mapFormValues(formList, formsOptions);
          evaluations.value = mapFormValues(formList, evaluationOptions);

          scheduleView.value = "form";
        } else {
          Swal.fire({
            title: "Failed",
            text: result?.message || "Unable to fetch schedule details.",
            icon: "error",
            scrollbarPadding: false,
          });
        }
      });
    }

    async function viewSchedule(item) {
      await runView(item.scheduleId, async () => {
        // Bigyan ang Vue ng isang render cycle para maipakita ang spinner.
        await new Promise((resolve) => setTimeout(resolve, 1500));

        await router.push({
          name: "event-nominated-employee",
          params: {
            eventId: eventId.value,
            scheduleId: item.scheduleId,
          },
        });
      });
    }

    function backToScheduleList() {
      eventStore.clearError();
      scheduleView.value = "list";
    }

    // =========================================================
    // DELETE SCHEDULE
    // =========================================================
    function deleteSchedule(item) {
      return Swal.fire({
        title: "Delete Schedule",
        text: "Are you sure you want to delete this schedule?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#d83d3d",
        cancelButtonColor: "#9e9e9e",
        reverseButtons: true,
        scrollbarPadding: false,
        heightAuto: false,
      }).then((result) => {
        if (!result.isConfirmed) return;

        return runDelete(item.scheduleId, async () => {
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
                scrollbarPadding: false,
              });
              const isLastOnPage = scheduleRows.value.length === 1 && pagination.value.page > 1;
              await loadEvent(isLastOnPage ? pagination.value.page - 1 : pagination.value.page);
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
      });
    }

    // =========================================================
    // L&D INTERVENTION / FORMS (left panel)
    // =========================================================
    const interventionOptions = [
      { label: "Formal Learning", value: "Formal Learning" },
    ];

    // =========================================================
    // GO BACK
    // =========================================================
    function goBack() {
      router.back();
    }
    const selectedFormNames = computed(() =>
      (event.value?.form || []).map((f) => f.form_name?.trim().toLowerCase())
    );

    function isFormSelected(option) {
      return selectedFormNames.value.includes(option.label.trim().toLowerCase());
    }

    // =========================================================
    // PAGINATION / LOAD
    // =========================================================
    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0,
    });

    const scheduleRows = computed(() => event.value?.schedule?.data || []);
    async function loadEvent(
      page = pagination.value.page,
      rowsPerPage = pagination.value.rowsPerPage
    ) {
      await eventStore.fetchEventById(eventId.value, {
        page,
        per_page: rowsPerPage,
      });
      pagination.value = {
        ...pagination.value,
        ...eventStore.pagination,
      };
    }

    function onScheduleRequest({ pagination: p }) {
      loadEvent(p.page, p.rowsPerPage);
    }
    onMounted(async () => {
      if (!eventId.value) return;
      await loadEvent(1);
    });

    async function onScheduleSaved() {
      await loadEvent(); // same page
      backToScheduleList();
    }

    function isValidUrl(value) {
      if (!value) return false;
      try {
        const url = new URL(value.trim());
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }

    return {
      eventStore,
      officeStore,
      event,
      eventId,
      // Schedule list view
      scheduleView,
      pagination,
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
      evaluationOptions,
      isFormSelected,
      // Page nav
      viewSchedule,
      goBack,
      scheduleRows,
      onScheduleRequest,
      syncToArms,
      isValidUrl,

      // form schedule / forms
      formOpenDate,
      formDueDate,
      forms,
      evaluations,
      formatFormDate,

      // assessment
      eventForm,
      MAX_ASSESSMENTS,
      assessmentCount,
      assessmentTests,
      assessmentPayload,
      addAssessment,
      removeAssessment,
      removeAllAssessments,
      removeTestForm,
      getPassingScore,
      setPassingScore,
      showAssessmentDialog,
      previewTestKey,
      previewTest,
      previewForm,
      openAssessmentDialog,
      testStatus,
      questionText,
      questionOptions,
      showGoogleFormDialog,
      builderInitialForm,
      builderLabel,
      openFormBuilder,
      onSaveGoogleForm,

      isViewLoading,
      isAnyViewLoading,

      isEditLoading,
      isAnyEditLoading,

      isDeleteLoading,
      isAnyDeleteLoading,
      canCopyFromPre,
      copyFromPreTest,
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

.custom-input.title-input :deep(.q-field__control) {
  height: auto;
  min-height: 35px;
}

.custom-input.title-input :deep(.q-field__native) {
  padding-top: 8px;
  padding-bottom: 8px;
  line-height: 1.4;
  resize: none;
  white-space: pre-wrap;
  word-break: break-word;
}

.assessment-link-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.assessment-url-input {
  flex: 1;
  min-width: 0;
}

.assessment-link-row :deep(.q-btn) {
  flex-shrink: 0;
}

.time-picker-icon {
  color: #18bd4f;
  cursor: pointer;
}

/* =========================================================
   FORM SCHEDULE (open / due)
========================================================= */
.form-schedule {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
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
  font-size: 13px;
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
}

.schedule-table :deep(.q-table td) {
  padding: 8px 12px;
}

.schedule-date-cell {
  display: flex;
  align-items: center;
  color: #0b0d0e;
  font-size: var(--app-table-data-font-size);
}

.schedule-hours-cell {
  color: #0b0d0e;
  font-size: var(--app-table-data-font-size);
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

  .form-schedule {
    grid-template-columns: 1fr;
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
  }

  .schedule-date-cell {
    font-size: var(--app-table-data-font-size);
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

/* =========================================================
   ARMS / ASSESSMENT CARDS
========================================================= */
.arms-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  background: #fafafa;
  transition: background 0.2s, border-color 0.2s;
}

.assessment-toggle-card {
  margin-bottom: 10px;
}

.arms-card--on {
  border-color: #18bd4f;
  background: #f0fbf4;
}

.arms-card-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.arms-card-icon {
  margin-top: 2px;
  color: #18bd4f;
}

.arms-card-title {
  color: #222222;
  font-size: 13px;
  font-weight: 650;
}

.arms-card-desc {
  margin-top: 2px;
  color: #777777;
  font-size: 12px;
  line-height: 1.35;
}

.arms-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  color: #666666;
  font-size: 12px;
}

.arms-hint-text {
  color: #666666;
  font-size: 12px;
}

.arms-card--off {
  background: #fdecea;
  border-color: #ef5350;
}

.arms-card--off .arms-card-title {
  color: #c62828;
}

.arms-card--off .arms-card-desc {
  color: #d32f2f;
}

.arms-card--off .arms-card-icon {
  color: #ef5350;
}

.header-subtitle {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
  word-break: break-word;
  overflow-wrap: anywhere;
}

/* =========================================================
   ASSESSMENT (summary + modal)  — galing sa EventCreatePage
========================================================= */
.assessment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.assessment-header .forms-title {
  margin-bottom: 0;
}

.assessment-header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.create-assessment-btn {
  min-height: 32px;
  padding: 0 18px;
  border-color: #18bd4f;
  border-radius: 8px;
  color: #18bd4f;
  font-size: 11px;
}

.remove-assessment-btn {
  color: #d83d3d;
  font-size: 11px;
}

.add-more-assessment {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

.assessment-summary {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 14px;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  background: #fafafa;
}

.assessment-summary-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.assessment-summary-status--open {
  background: #e6f7ec;
  color: #1b7f3b;
}

.assessment-summary-status--closed {
  background: #fdecea;
  color: #c62828;
}

.assessment-summary-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.assessment-summary-label {
  color: #222222;
  font-weight: 600;
  min-width: 80px;
}

.assessment-summary-meta {
  color: #777777;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.test-card {
  margin-top: 12px;
  padding: 12px 14px;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  background: #fff;
}

.test-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.test-card-title {
  color: #222222;
  font-size: 13px;
  font-weight: 650;
}

.test-form-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding: 8px 10px;
  border: 1px solid #18bd4f;
  border-radius: 8px;
  background: #f0fbf4;
}

.test-form-summary-text {
  flex: 1;
  min-width: 0;
}

.test-form-summary-title {
  color: #222222;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.test-form-summary-meta {
  color: #777777;
  font-size: 11px;
}

.test-card--clickable {
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.test-card--active {
  border-color: #18bd4f;
  box-shadow: 0 0 0 2px rgba(24, 189, 79, 0.15);
}

.delete-btn {
 color: #d83d3d;
}

.delete-btn:hover {
  color: #d83d3d;
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

.assessment-dialog {
  width: 1550px;
  max-width: 95vw;
  max-height: 90vh;
  border-radius: 13px;
  display: flex;
  flex-direction: column;
}

.assessment-dialog-body {
  flex: 1;
  padding: 18px;
  overflow-y: auto;
}

.assessment-modal-grid {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 20px;
  align-items: start;
}

.assessment-modal-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.assessment-modal-right {
  position: sticky;
  top: 0;
}

.preview-label {
  margin-bottom: 8px;
  color: #555555;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.preview-card {
  min-height: 320px;
  padding: 18px 20px;
  border: 1px solid #e0e0e0;
  border-top: 8px solid #18bd4f;
  border-radius: 10px;
  background: #ffffff;
}

.preview-event {
  color: #222222;
  font-size: 16px;
  font-weight: 700;
}

.preview-test {
  margin-top: 2px;
  font-size: 14px;
  color: #555;


}

.preview-separator {
  margin: 12px 0;
}

.preview-form-title {
  color: #222222;
  font-size: 14px;
  font-weight: 650;
}

.preview-form-desc {
  margin-top: 4px;
  color: #777777;
  font-size: 12px;
}

.preview-question {
  margin-top: 14px;
  padding: 10px 12px;
  border: 1px solid #eeeeee;
  border-radius: 8px;
}

.preview-question-text {
  color: #222222;
  font-size: 12px;
  font-weight: 600;
}

.preview-options {
  margin: 6px 0 0;
  padding-left: 18px;
  color: #555555;
  font-size: 12px;
}

.preview-answer-line {
  margin-top: 8px;
  padding-bottom: 4px;
  border-bottom: 1px dashed #cccccc;
  color: #aaaaaa;
  font-size: 11px;
}

.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 200px;
  color: #aaaaaa;
  font-size: 12px;
  text-align: center;
}

.preview-link {
  max-width: 100%;
  color: #18bd4f;
  word-break: break-all;
}

@media (max-width: 900px) {
  .assessment-modal-grid {
    grid-template-columns: 1fr;
  }

  .assessment-modal-right {
    position: static;
  }
}
.copy-pre-btn {
  color: #555555;
  font-size: 11px;
}
</style>