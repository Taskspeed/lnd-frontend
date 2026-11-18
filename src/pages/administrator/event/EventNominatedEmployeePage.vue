<template>
  <q-page class="event-page">
    <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
    <section class="page-header">
      <div class="page-heading">
        <div class="page-heading-copy">
          <div class="page-eyebrow">
            <q-icon name="event_note" />
            Training schedule
          </div>
          <h5>{{ eventInfo.title_name || "Event Schedule Details" }}</h5>
          <p>Review schedule information, participating offices, and employee nominations.</p>
        </div>

        <div class="heading-actions">
          <span v-if="schedule.computedStatus" class="pill pill-status"
            :class="'status-' + String(schedule.computedStatus).toLowerCase()">
            {{ schedule.computedStatus }}
          </span>
          <q-btn flat dense no-caps icon="arrow_back" label="Back to Events" class="back-btn"
            @click="$router.back()" />
        </div>
      </div>
    </section>

    <!-- =====================================================
         LOADING / ERROR
    ====================================================== -->
    <LoadingState v-if="loading" message="Loading schedule details..." full-page />
    <div v-else-if="errorMessage" class="error-state">{{ errorMessage }}</div>

    <div v-else class="details-col">
      <!-- =====================================================
           1. SCHEDULE DETAILS (STEPPER)
      ====================================================== -->
      <q-card flat bordered class="detail-card">
        <q-expansion-item v-model="detailsOpen" class="details-expansion" header-class="details-header"
          expand-icon-class="details-expand-icon">
          <template #header>
            <q-item-section avatar class="details-avatar">
              <q-icon name="event" class="section-icon" />
            </q-item-section>
            <q-item-section>
              <div class="section-title">Schedule Details</div>
              <div class="section-sub">Event, sessions, offices, and assessment</div>
            </q-item-section>
            <q-item-section side class="details-hint">
              {{ detailsOpen ? "Hide details" : "Show details" }}
            </q-item-section>
          </template>

        <q-stepper v-model="tab" flat animated header-nav color="green" class="schedule-stepper">
          <!-- OVERVIEW -->
          <q-step name="overview" title="Overview" caption="Event information" icon="event">
            <div class="field-label">Event</div>
            <h6 class="event-title-lg">{{ eventInfo.title_name }}</h6>

            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Venue</span>
                <span class="detail-value">{{ show(schedule.venue_name) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Hours</span>
                <span class="detail-value">{{ show(schedule.hours) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Mode</span>
                <span class="detail-value">{{ show(schedule.mode_name) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Fee</span>
                <span class="detail-value">{{ show(schedule.fee) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Type</span>
                <span class="detail-value">{{ show(schedule.type_name) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Category</span>
                <span class="detail-value">{{ show(schedule.category_name) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Source</span>
                <span class="detail-value">{{ show(schedule.source_name) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Learning type</span>
                <span class="detail-value">{{ show(schedule.learning_intervention) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Conducted by</span>
                <span class="detail-value">{{ show(schedule.conducted_by) }}</span>
              </div>
              <div class="detail-item detail-item-wide">
                <span class="detail-label">Qualifications</span>
                <span class="detail-value">{{ show(schedule.qualifications) }}</span>
              </div>
            </div>

            <template v-if="competencyGroups.length">
              <div class="field-label field-label-spaced">Competencies</div>
              <div class="competency-groups">
                <div v-for="group in competencyGroups" :key="group.key" class="competency-group-block"
                  :class="'competency-' + group.color">
                  <div class="competency-group-title">{{ group.label }}</div>
                  <div class="tag-row">
                    <span v-for="(item, i) in group.items" :key="i" class="tag">{{ item }}</span>
                  </div>
                </div>
              </div>
            </template>
          </q-step>

          <!-- DATES & SPEAKERS -->
          <q-step name="dates" title="Sessions" caption="Dates and speakers" icon="calendar_month">
            <div class="date-list">
              <div v-for="d in scheduleDates" :key="d.schedule_date_time_id" class="date-card">
                <div class="date-card-head">
                  <div class="date-main">
                    <q-icon name="event" class="date-icon" />
                    <strong>{{ d.schedule_date }}</strong>
                  </div>

                  <q-btn outline dense no-caps icon="print" label="Print Attendance" class="print-btn"
                    :loading="isAttendanceLoading(d.schedule_date_time_id)" :disable="isAnyAttendanceLoading()"
                    @click="printAttendance(d)" />
                </div>

                <div class="time-row">
                  <span class="time-chip">
                    <q-icon name="wb_sunny" size="14px" />
                    Morning {{ d.morning_in }} – {{ d.morning_out }}
                  </span>
                  <span class="time-chip">
                    <q-icon name="wb_twilight" size="14px" />
                    Afternoon {{ d.afternoon_in }} – {{ d.afternoon_out }}
                  </span>
                </div>

                <div class="speaker-block">
                  <span class="detail-label">Speakers</span>
                 <div v-if="d.speakers.length" class="speaker-list">
  <div v-for="sp in d.speakers" :key="`${d.schedule_date_time_id}-${sp.speaker_id}`" class="speaker-item">
    <div class="speaker-info">
      <strong>{{ sp.speaker_name }}</strong>
      <span class="speaker-meta">
        {{ [sp.position, sp.agency].filter(Boolean).join(", ") || "—" }}
      </span>
    </div>

    <q-btn flat round dense icon="visibility" class="action-view"
      @click="viewSpeaker(sp.speaker_id)">
      <q-tooltip>View Speaker</q-tooltip>
    </q-btn>
  </div>
</div>
<span v-else class="muted-text">No speaker assigned</span>
                </div>
              </div>

              <div v-if="!scheduleDates.length" class="empty-box">No schedule dates.</div>
            </div>
          </q-step>

          <!-- OFFICES -->
          <q-step name="offices" title="Offices" caption="Participating offices" icon="domain">
            <div class="step-head">
              <div>
                <div class="step-title">Participating offices</div>
                <div class="step-sub">
                  {{ officeList.length }} office{{ officeList.length === 1 ? "" : "s" }}
                </div>
              </div>

              <q-btn outline dense no-caps icon="print" label="Print Nomination" class="print-btn"
                :loading="isNominationLoading('nomination')" :disable="isAnyNominationLoading()"
                @click="printNomination" />
            </div>

            <div v-if="officeList.length" class="office-grid">
              <div v-for="o in officeList" :key="o.id" class="office-item" :class="{
                'has-nominees': o.nominees > 0,
                'is-full': o.isFull,
                'is-clickable': o.nominees > 0,
                'is-active': selectedOffice === o.name,
              }" @click="o.nominees > 0 && toggleOffice(o.name)">
                <span class="office-dot"></span>
                <div class="office-main">
                  <span class="office-name">{{ o.name }}</span>
                  <div class="office-stats">
                    <span class="office-pill pill-attendees">
                      <span class="pill-label">No. of Attendees</span>
                      <span class="pill-value">{{ o.attendees ?? "—" }}</span>
                    </span>
                    <span class="office-pill pill-nominees">
                      <span class="pill-label">Nominees</span>
                      <span class="pill-value">{{ o.nominees }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-box">No offices tagged.</div>

            <div v-if="officeFilterOptions.length" class="office-hint">
              <q-icon name="info_outline" size="15px" />
              Select an office with nominees to filter the nominations table below.
            </div>
          </q-step>

          <!-- ASSESSMENT -->
          <q-step name="assessment" title="Assessment" caption="Pre and post test" icon="quiz">
            <div class="assessment-grid">
              <div v-for="item in assessmentItems" :key="item.assessmentId" class="assessment-item">
                <div class="assessment-info">
                  <span class="detail-label">{{ item.title }}</span>
                  <span class="assessment-meta">Passing score: {{ show(item.passing_score) }}</span>
                </div>

                <div class="assessment-actions">
                  <q-btn outline dense no-caps icon="visibility" label="View" class="print-btn"
                    :loading="isAssessmentLoading(item.assessmentId)" :disable="isAnyAssessmentLoading()"
                    @click="viewAssessment(item)" />

                  <q-btn outline dense no-caps icon="print" label="Print" class="print-btn"
                    :loading="isAssessmentPreviewLoading(item.assessmentId)"
                    :disable="isAnyAssessmentPreviewLoading()" @click="printAssessment(item)" />
                </div>
              </div>

              <div v-if="!assessmentItems.length" class="empty-box">No assessment added.</div>
            </div>
          </q-step>
        </q-stepper>
        </q-expansion-item>
      </q-card>

      <!-- =====================================================
           2. NOMINATION STATS
      ====================================================== -->
      <section class="stat-grid">
        <div class="stat-card">
          <div class="stat-icon tone-green">
            <q-icon name="groups" size="22px" />
          </div>
          <div>
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">Total employees for nomination</div>
          </div>
        </div>

        <div v-ripple class="stat-card stat-card-link" :class="{ 'is-active': selectedStatus === 'Pending' }"
          @click="toggleStatus('Pending')">
          <div class="stat-icon tone-amber">
            <q-icon name="hourglass_empty" size="22px" />
          </div>
          <div>
            <div class="stat-value">{{ stats.pending }}</div>
            <div class="stat-label">Pending</div>
          </div>
        </div>

        <div v-ripple class="stat-card stat-card-link" :class="{ 'is-active': selectedStatus === 'Approved' }"
          @click="toggleStatus('Approved')">
          <div class="stat-icon tone-blue">
            <q-icon name="task_alt" size="22px" />
          </div>
          <div>
            <div class="stat-value">{{ stats.approved }}</div>
            <div class="stat-label">Approved</div>
          </div>
        </div>

        <div v-ripple class="stat-card stat-card-link" :class="{ 'is-active': selectedStatus === 'Disapproved' }"
          @click="toggleStatus('Disapproved')">
          <div class="stat-icon tone-red">
            <q-icon name="cancel" size="22px" />
          </div>
          <div>
            <div class="stat-value">{{ stats.disapproved }}</div>
            <div class="stat-label">Disapproved</div>
          </div>
        </div>
      </section>

      <!-- =====================================================
           3. NOMINATIONS TABLE
      ====================================================== -->
      <q-card flat bordered class="detail-card">
        <div class="section-head section-head-wrap">
          <q-icon name="groups" class="section-icon" />
          <div class="section-head-text">
            <div class="section-title">Nominations</div>
            <div class="section-sub">Review and update nominated employees for this schedule</div>
          </div>

          <q-select :model-value="selectedStatus" :options="statusOptions" label="Filter by status" dense outlined
            clearable class="filter-select" @update:model-value="applyStatusFilter" />
          <q-select :model-value="selectedOffice" :options="officeFilterOptions" label="Filter by office" dense
            outlined clearable class="filter-select" @update:model-value="applyOfficeFilter" />
        </div>

        <q-table flat :rows="nominatedEmployees" :columns="nominatedColumns" row-key="nominated_employee_id"
          v-model:pagination="pagination" :loading="tableLoading" :rows-per-page-options="[5, 10, 20, 50]"
          no-data-label="No nominations found." class="detail-table" @request="onRequest">
          <template #body="props">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :props="props">
                <template v-if="col.name === 'is_attended'">
                  <q-badge :color="props.row.is_attended ? 'green' : 'grey-6'">
                    {{ props.row.is_attended ? "Yes" : "No" }}
                  </q-badge>
                </template>

                <template v-else-if="col.name === 'nominate_status'">
                  <q-badge class="badge-status" :class="{
                    'status-approved': props.row.nominate_status === 'Approved',
                    'status-disapproved': props.row.nominate_status === 'Disapproved',
                    'status-pending': props.row.nominate_status === 'Pending',
                  }">
                    {{ props.row.nominate_status }}
                  </q-badge>
                </template>

                <template v-else-if="col.name === 'action'">
                  <div class="row-actions">
                    <q-btn flat dense round icon="visibility" color="primary"
                      :loading="isViewLoading(props.row.nominated_employee_id)" :disable="isAnyViewLoading()"
                      @click.stop="viewEmployeeInformation(props.row)">
                      <q-tooltip>View Details</q-tooltip>
                    </q-btn>

                    <q-toggle :model-value="statusToModel(props.row.nominate_status)"
                      :class="'toggle-' + (props.row.nominate_status || 'Pending').toLowerCase()"
                      :disable="isReviewLoading(props.row.nominated_employee_id) || isAnyReviewLoading()"
                      toggle-indeterminate dense @update:model-value="reviewNomination(props.row)">
                      <q-tooltip>Review nomination</q-tooltip>
                    </q-toggle>
                  </div>
                </template>

                <template v-else>
                  {{ col.value }}
                </template>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- NOMINATION DETAILS DIALOG -->
    <q-dialog v-model="showNominationDetailsDialog">
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section class="dialog-header">
          <div class="section-title">{{ viewedNomination?.full_name }}</div>
          <div class="section-sub">
            {{ viewedNomination?.designation }} — {{ viewedNomination?.office }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Control No.</span>
              <span class="detail-value">{{ viewedNomination?.control_no }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status</span>
              <span class="detail-value">{{ viewedNomination?.status }}</span>
            </div>
            <div class="detail-item detail-item-wide">
              <span class="detail-label">Reason</span>
              <span class="detail-value">{{ viewedNomination?.nominate_reason || "—" }}</span>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat no-caps label="Close" color="blue" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ASSESSMENT QUESTIONS DIALOG -->
    <q-dialog v-model="showAssessmentDialog">
      <q-card style="width: 720px; max-width: 92vw">
        <q-card-section class="dialog-header row items-center no-wrap">
          <div class="col">
            <div class="section-title">{{ viewedAssessment?.title }}</div>
            <div class="section-sub">
              Passing score: {{ show(viewedAssessment?.passing_score) }} ·
              {{ (viewedAssessment?.questions || []).length }} questions ·
              {{ assessmentTotalPoints }} points
            </div>
          </div>
          <q-toggle v-model="showAnswers" dense label="Show correct answers" class="answer-toggle" />
        </q-card-section>

        <q-separator />

        <q-card-section class="assessment-dialog-body">
          <div v-for="(q, i) in viewedAssessment?.questions || []" :key="q.id" class="question-card">
            <div class="question-text">
              <span class="question-no">{{ i + 1 }}</span>
              <span>{{ q.question }}</span>
              <span class="question-points">({{ q.points }} {{ q.points > 1 ? "pts" : "pt" }})</span>
            </div>

            <div class="question-options">
              <div v-for="opt in q.options" :key="opt.id" class="question-option"
                :class="{ 'is-correct': showAnswers && opt.is_correct }">
                <q-icon :name="showAnswers && opt.is_correct
                  ? 'check_circle'
                  : q.question_type === 'checkboxes' ? 'check_box_outline_blank' : 'radio_button_unchecked'"
                  size="18px" />
                <span>{{ opt.option_text }}</span>
              </div>
            </div>
          </div>

          <div v-if="!(viewedAssessment?.questions || []).length" class="empty-box">
            No questions added yet.
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat no-caps label="Close" color="blue" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- EMPLOYEE INFORMATION MODAL -->
    <EmployeeNominationModal v-model="showEmployeeModal" :employee-data="EmployeeInformation"
      :loading="loadingEmployeeInfo" @view-submission="handleViewSubmission" />
  </q-page>
</template>

<script>
import { defineComponent, computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import LoadingState from "src/components/LoadingStatePage.vue";
import { useEventStore } from "src/stores/eventStore";
import Swal from "sweetalert2";
import { useEmployeeInformationStore } from "src/stores/administrator/employee/employeeInformationStore";
import { useRowLoading } from "src/composables/useRowLoading";
import { usePdfStore } from "src/stores/administrator/pdf/pdfStore";
import EmployeeNominationModal from "src/components/employee/EmployeeNominationModal.vue";
import { useAssessmentStore } from "src/stores/event/assessmentStore";
import { useRouter } from "vue-router";
export default defineComponent({
  name: "EventNominatedEmployeePage",
  components: { LoadingState, EmployeeNominationModal },

  setup() {
    const eventStore = useEventStore();
    const employeeInformationStore = useEmployeeInformationStore();
    const route = useRoute();
    const eventId = route.params.eventId;
    const scheduleId = route.params.scheduleId;
    const router = useRouter();
    const loading = ref(true);
    const errorMessage = ref("");
    const eventDetail = ref(null);

    // active step ng Schedule Details stepper
    const tab = ref("overview");

    // Schedule Details dropdown: false = nakasara (nasa taas ang nominations table)
    const detailsOpen = ref(false);

    const eventInfo = computed(() => eventDetail.value || {});
    const schedule = computed(() => eventInfo.value.schedule?.[0] || {});

    const offices = computed(() => (schedule.value.office || []).map((o) => o.office_name));
    const nominatedEmployees = computed(() => schedule.value.nominated_employee?.data || []);

    const show = (value) => (value === null || value === undefined || value === "" ? "—" : value);

    function timeOrDefault(value, defaultValue = "00:00") {
      return value === null || value === undefined || value === "" ? defaultValue : value;
    }

    const scheduleDates = computed(() =>
      (schedule.value.schedule_date_time || []).map((d) => ({
        ...d,
        morning_in: timeOrDefault(d.morning_in),
        morning_out: timeOrDefault(d.morning_out),
        afternoon_in: timeOrDefault(d.afternoon_in),
        afternoon_out: timeOrDefault(d.afternoon_out),
        speakers: d.speakers || [],
      }))
    );
    const speakers = computed(() => {
      const map = new Map();
      scheduleDates.value.forEach((d) =>
        d.speakers.forEach((sp) => map.set(sp.speaker_id, sp))
      );
      return [...map.values()];
    });

    // Offices (with nominee counts)
    const officeList = computed(() =>
      (schedule.value.office || [])
        .map((o) => ({
          id: o.departmentId,
          name: o.office_name,
          nominees: o.employee_nominated ?? 0,
          // null/undefined = walang slot limit na naka-set
          attendees: o.number_of_attendees ?? null,
        }))
        .map((o) => ({
          ...o,
          hasLimit: o.attendees !== null && o.attendees > 0,
          isFull: o.attendees > 0 && o.nominees >= o.attendees,
        }))
        // may nominees muna sa taas, tapos alphabetical
        .sort((a, b) => b.nominees - a.nominees || a.name.localeCompare(b.name))
    );

    const showEmployeeModal = ref(false);
    const EmployeeInformation = ref({});
    const loadingEmployeeInfo = ref(false);

    const { isLoading: isViewLoading, isAnyLoading: isAnyViewLoading, run: runView } = useRowLoading();
    const { isLoading: isNominationLoading, isAnyLoading: isAnyNominationLoading, run: runNomination } = useRowLoading();
    const { isLoading: isAttendanceLoading, isAnyLoading: isAnyAttendanceLoading, run: runAttendance } = useRowLoading();
    const { isLoading: isReviewLoading, isAnyLoading: isAnyReviewLoading, run: runReview } = useRowLoading();

    const pdfStore = usePdfStore();
    const printingDateId = ref(null);

    async function viewEmployeeInformation(row) {
      loadingEmployeeInfo.value = true;

      return runView(row.nominated_employee_id, async () => {
        const result = await employeeInformationStore.fetchEmployeeInformation(row.nominated_employee_id);

        loadingEmployeeInfo.value = false;

        if (result.success) {
          EmployeeInformation.value = result.data;
          showEmployeeModal.value = true;
        } else {
          Swal.fire({
            title: "Failed",
            text: result.message || "Unable to fetch employee information.",
            icon: "error",
            scrollbarPadding: false,
          });
        }
      });
    }

    function labelize(key) {
      return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }

    const competencyGroups = computed(() => {
      const groups = [
        { key: "event_core", label: "Core Competencies", color: "core" },
        { key: "event_technical", label: "Technical Competencies", color: "technical" },
        { key: "event_leadership", label: "Leadership Competencies", color: "leadership" },
      ];
      return groups
        .map((group) => {
          const entry = schedule.value[group.key]?.[0] || {};
          const items = Object.entries(entry)
            .filter(([, value]) => value === true)
            .map(([field]) => labelize(field));
          return { ...group, items };
        })
        .filter((group) => group.items.length);
    });

    const nominatedColumns = [
      { name: "name", label: "Name", field: "full_name", align: "left" },
      { name: "designation", label: "Position", field: "designation", align: "left" },
      { name: "office", label: "Office", field: (row) => row.office_abbr || row.office, align: "left" },
      { name: "status", label: "Status", field: "status", align: "left" },
      { name: "sg", label: "Salary Grade(SG)", field: "sg", align: "center" },
      { name: "nominate_status", label: "Nominate status", field: "nominate_status", align: "center" },
      { name: "action", label: "Action", field: "action", align: "center" },
    ];

    function truncateText(text, maxLength = 24) {
      if (!text) return "—";
      if (text.length <= maxLength) return text;
      return text.slice(0, maxLength).trim() + "...";
    }

    const showNominationDetailsDialog = ref(false);
    const viewedNomination = ref(null);

    function viewNominationDetails(row) {
      viewedNomination.value = row;
      showNominationDetailsDialog.value = true;
    }

    async function loadNominatedEmployees(
      page = pagination.value.page,
      { silent = false, perPage = pagination.value.rowsPerPage, office = selectedOffice.value, status = selectedStatus.value, } = {}
    ) {
      if (silent) tableLoading.value = true;
      else loading.value = true;
      errorMessage.value = "";

      const result = await eventStore.fetchNominatedEmployee(eventId, scheduleId, page, perPage, office, status);

      if (result.success) {
        eventDetail.value = eventStore.nominated_employee;

        const paginator = eventDetail.value?.schedule?.[0]?.nominated_employee || {};
        pagination.value = {
          page: paginator.current_page ?? page,
          rowsPerPage: paginator.per_page ?? perPage,
          rowsNumber: paginator.total ?? 0,
        };
      } else if (silent) {
        Swal.fire({
          title: "Failed",
          text: result.message || "Failed to load nominated employees.",
          icon: "error",
          scrollbarPadding: false,
        });
      } else {
        errorMessage.value = result.message || "Failed to load schedule.";
      }

      loading.value = false;
      tableLoading.value = false;
    }

    function onRequest({ pagination: p }) {
      // kapag nagpalit ng rows per page, bumalik sa page 1
      const pageToLoad = p.rowsPerPage !== pagination.value.rowsPerPage ? 1 : p.page;
      return loadNominatedEmployees(pageToLoad, { silent: true, perPage: p.rowsPerPage });
    }
    onMounted(async () => {
      await loadNominatedEmployees();
    });

    async function printAttendance(dateRow) {
      return runAttendance(dateRow.schedule_date_time_id, async () => {
        const result = await pdfStore.fetchAttendanceSheet(
          eventId,
          scheduleId,
          dateRow.schedule_date_time_id
        );

        if (result.success) {
          const url = window.URL.createObjectURL(
            new Blob([result.blob], { type: "application/pdf" })
          );
          window.open(url, "_blank");
        } else {
          Swal.fire({
            title: "Failed",
            text: result.message || "Unable to preview certificate.",
            icon: "error",
            scrollbarPadding: false,
          });
        }
      });
    }

    const printingNomination = ref(false);

    async function printNomination() {
      return runNomination("nomination", async () => {
        const result = await pdfStore.fetchNomination(eventId, scheduleId);

        if (result.success) {
          const url = window.URL.createObjectURL(
            new Blob([result.blob], { type: "application/pdf" })
          );
          window.open(url, "_blank");
        } else {
          Swal.fire({
            title: "Failed",
            text: result.message || "Unable to preview certificate.",
            icon: "error",
            scrollbarPadding: false,
          });
        }
      });
    }

    async function printAssessment(item) {
      return runAssessmentPreview(item.assessmentId, async () => {
        const result = await assessmentStore.preview_assessment(item.assessmentId);

        if (result.success) {
          const url = window.URL.createObjectURL(
            new Blob([result.blob], { type: "application/pdf" })
          );
          window.open(url, "_blank");
        } else {
          Swal.fire({
            title: "Failed",
            text: result.message || "Unable to preview assessment.",
            icon: "error",
            scrollbarPadding: false,
          });
        }
      });
    }

    const tableLoading = ref(false);
    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0,
    });

    const selectedOffice = ref(null);
    const officeFilterOptions = computed(() =>
      officeList.value.filter((o) => o.nominees > 0).map((o) => o.name)
    );

    function applyOfficeFilter(office) {
      selectedOffice.value = office || null;
      // laging bumalik sa page 1 kapag nagbago ang filter
      return loadNominatedEmployees(1, { silent: true, office: selectedOffice.value });
    }

    // click sa office card: i-toggle (click ulit para tanggalin ang filter)
    function toggleOffice(office) {
      return applyOfficeFilter(selectedOffice.value === office ? null : office);
    }

    // ASSESSMENT: listahan galing sa schedule.assessments (Pre-Test / Post-Test)
    const assessmentStore = useAssessmentStore();
    const assessmentItems = computed(() => schedule.value.assessments || []);

    const showAssessmentDialog = ref(false);
    const viewedAssessment = ref(null);
    const showAnswers = ref(false);

    const { isLoading: isAssessmentLoading, isAnyLoading: isAnyAssessmentLoading, run: runAssessment } = useRowLoading();
    const { isLoading: isAssessmentPreviewLoading, isAnyLoading: isAnyAssessmentPreviewLoading, run: runAssessmentPreview } = useRowLoading();

    const assessmentTotalPoints = computed(() =>
      (viewedAssessment.value?.questions || []).reduce((sum, q) => sum + (Number(q.points) || 0), 0)
    );

    // Kukunin ang buong assessment (questions + options) kapag na-click ang View questions
    async function viewAssessment(item) {
      return runAssessment(item.assessmentId, async () => {
        const result = await assessmentStore.view_assessment(item.assessmentId);

        if (result.success) {
          viewedAssessment.value = result.data;
          showAnswers.value = false;
          showAssessmentDialog.value = true;
        } else {
          Swal.fire({
            title: "Failed",
            text: result.message || "Unable to fetch assessment.",
            icon: "error",
            scrollbarPadding: false,
          });
        }
      });
    }

    async function reviewNomination(row) {
      // 1. Choose Approve / Disapprove
      const result = await Swal.fire({
        title: "Review Nomination",
        text: `Update the nomination status of ${row.full_name}?`,
        icon: "question",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Approve",
        denyButtonText: "Disapprove",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#18b64d",
        denyButtonColor: "#d83d3d",
        cancelButtonColor: "#9e9e9e",
        scrollbarPadding: false,
        heightAuto: false,
      });

      let status = null;
      let remarks = null;

      if (result.isConfirmed) {
        status = "Approved";
      } else if (result.isDenied) {
        status = "Disapproved";

        // 2. Required remarks for disapproval
        const remarksResult = await Swal.fire({
          title: "Disapprove Nomination",
          text: `Please provide the remarks for disapproving ${row.full_name}.`,
          icon: "warning",
          input: "textarea",
          inputLabel: "Remarks",
          inputPlaceholder: "Enter remarks...",
          inputAttributes: { "aria-label": "Remarks" },
          showCancelButton: true,
          confirmButtonText: "Disapprove",
          cancelButtonText: "Cancel",
          confirmButtonColor: "#d83d3d",
          cancelButtonColor: "#9e9e9e",
          reverseButtons: true,
          scrollbarPadding: false,
          heightAuto: false,
          inputValidator: (value) => {
            if (!value || !value.trim()) {
              return "Remarks are required when disapproving a nomination.";
            }
          },
        });

        if (!remarksResult.isConfirmed) return; // Cancel / close
        remarks = remarksResult.value.trim();
      } else {
        return; // Cancel / close
      }

      // 3. Loading while saving
      return runReview(row.nominated_employee_id, async () => {
        const payload = { nominate_status: status };
        if (status === "Disapproved") payload.nomination_remarks = remarks;

        const res = await eventStore.approvalNominatedEmployee(row.nominated_employee_id, payload);

        if (res.success) {
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: `Nomination ${status.toLowerCase()}.`,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            scrollbarPadding: false,
          });
          await loadNominatedEmployees(pagination.value.page, { silent: true });
        } else {
          Swal.fire({
            title: "Failed",
            text: res.message || "Unable to update nomination.",
            icon: "error",
            scrollbarPadding: false,
          });
        }
      });
    }

    const selectedStatus = ref(null);
    const statusOptions = ["Pending", "Approved", "Disapproved"];

    const stats = computed(
      () =>
        schedule.value.nomination_stats || { total: 0, approved: 0, pending: 0, disapproved: 0 }
    );
    function applyStatusFilter(status) {
      selectedStatus.value = status || null;
      return loadNominatedEmployees(1, { silent: true });
    }

    // click sa stat card: i-toggle ang status filter
    function toggleStatus(status) {
      return applyStatusFilter(selectedStatus.value === status ? null : status);
    }


       

      function viewSpeaker(speaker_id) {
  router.push({ name: "speaker-view", params: { speaker_id } });
}

    return {
      tab,
      detailsOpen,
      show,
      loading,
      errorMessage,
      eventInfo,
      schedule,
      scheduleDates,
      offices,
      officeList,
      speakers,
      competencyGroups,
      nominatedEmployees,
      nominatedColumns,
      truncateText,
      showNominationDetailsDialog,
      viewedNomination,
      viewNominationDetails,
      viewEmployeeInformation,

      showEmployeeModal,
      EmployeeInformation,
      loadingEmployeeInfo,

      isViewLoading,
      isAnyViewLoading,

      reviewNomination,
      isReviewLoading,
      isAnyReviewLoading,

      isNominationLoading,
      isAnyNominationLoading,

      isAttendanceLoading,
      isAnyAttendanceLoading,

      printAttendance,
      printingDateId,

      pagination,
      tableLoading,
      onRequest,

      selectedOffice,
      officeFilterOptions,
      applyOfficeFilter,
      toggleOffice,

      printNomination,
      printingNomination,

      assessmentItems,
      showAssessmentDialog,
      viewedAssessment,
      showAnswers,
      assessmentTotalPoints,
      viewAssessment,
      isAssessmentLoading,
      isAnyAssessmentLoading,
      printAssessment,
      isAssessmentPreviewLoading,
      isAnyAssessmentPreviewLoading,
      statusToModel,
      statusColor,

      stats,
      selectedStatus,
      statusOptions,
      applyStatusFilter,
      toggleStatus,
    viewSpeaker
    };
  },
});

function statusToModel(status) {
  if (status === "Approved") return true;
  if (status === "Disapproved") return false;
  return null; // Pending → gitna
}

function statusColor(status) {
  if (status === "Approved") return "positive";
  if (status === "Disapproved") return "negative";
  return "grey-6";
}
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */
.event-page {
  min-height: 100%;
  padding: 20px;
  color: #19354a;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.details-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

/* =========================================================
   HEADER
========================================================= */
.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 26px;
  border: 1px solid #e3eaf0;
  border-radius: 16px;
  background: linear-gradient(115deg, #ffffff 0%, #f5f9fc 100%);
  box-shadow: 0 5px 18px rgba(25, 53, 74, 0.045);
}

.page-heading-copy {
  min-width: 0;
}

.page-eyebrow {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #16a84a;
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.page-heading h5 {
  margin: 6px 0 5px;
  color: #19354a;
  font-size: 23px;
  font-weight: 750;
  line-height: 1.25;
}

.page-heading p {
  margin: 0;
  color: #718089;
  font-size: 13px;
}

.heading-actions {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 10px;
}

.back-btn {
  flex: 0 0 auto;
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid #dfe7ed;
  border-radius: 9px;
  background: #ffffff;
  color: #31546b;
  font-size: 12px;
  font-weight: 650;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.back-btn:hover {
  border-color: #bfd2e1;
  background: #f4f8fb;
}

.pill {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
}

.pill-status {
  color: #2b6cb0;
  background: #e7f0fb;
}

.pill-status.status-ongoing {
  color: #087c42;
  background: #e1f7e7;
}

.pill-status.status-completed {
  color: #5c6b73;
  background: #eef1f2;
}

.pill-status.status-cancelled {
  color: #c73f3f;
  background: #fbe9e9;
}

.error-state {
  padding: 20px;
  border-radius: 10px;
  background: #fbe9e9;
  color: #c73f3f;
  font-size: 13px;
}

/* =========================================================
   CARD + SECTION HEAD
========================================================= */
.detail-card {
  overflow: hidden;
  border: 1px solid #e3eaf0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 5px 18px rgba(25, 53, 74, 0.05);
}

.section-head {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 16px 22px;
  border-bottom: 1px solid #edf1ef;
  background: linear-gradient(110deg, #fbfdff 0%, #f6f9fb 100%);
}

.section-head-text {
  flex: 1;
  min-width: 0;
}

.section-icon {
  color: #16a84a;
  font-size: 20px;
}

.section-title {
  color: #19354a;
  font-size: 15px;
  font-weight: 750;
}

.section-sub {
  margin-top: 2px;
  color: #8a989e;
  font-size: 11.5px;
}

.filter-select {
  min-width: 220px;
  max-width: 320px;
}

/* =========================================================
   SCHEDULE DETAILS DROPDOWN
========================================================= */
.details-expansion :deep(.details-header) {
  padding: 14px 22px;
  background: linear-gradient(110deg, #fbfdff 0%, #f6f9fb 100%);
}

.details-expansion :deep(.details-header:hover) {
  background: #f3f7fa;
}

.details-expansion.q-expansion-item--expanded :deep(.details-header) {
  border-bottom: 1px solid #edf1ef;
}

.details-avatar {
  min-width: 0;
  padding-right: 4px;
}

.details-hint {
  color: #607987;
  font-size: 11.5px;
  font-weight: 600;
}

.details-expansion :deep(.details-expand-icon) {
  color: #607987;
}

/* =========================================================
   STEPPER
========================================================= */
.schedule-stepper {
  background: transparent;
  box-shadow: none;
}

.schedule-stepper :deep(.q-stepper__header) {
  border-bottom: 1px solid #edf1f4;
}

.schedule-stepper :deep(.q-stepper__tab) {
  padding: 14px 18px;
}

.schedule-stepper :deep(.q-stepper__step-inner) {
  padding: 20px 22px 22px;
}

/* =========================================================
   OVERVIEW
========================================================= */
.field-label {
  color: #8193a0;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.field-label-spaced {
  margin: 22px 0 10px;
}

.event-title-lg {
  margin: 4px 0 0;
  color: #172431;
  font-size: 19px;
  font-weight: 750;
  line-height: 1.4;
  letter-spacing: -0.2px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
  padding: 11px 13px;
  border: 1px solid #e9eef2;
  border-radius: 10px;
  background: #fbfcfd;
}

.detail-item-wide {
  grid-column: 1 / -1;
}

.detail-label {
  color: #8193a0;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.detail-value {
  color: #263d4c;
  font-size: 13.5px;
  font-weight: 550;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

/* COMPETENCIES */
.competency-groups {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.competency-group-block {
  padding: 12px 16px;
  border-left: 3px solid transparent;
  border-radius: 10px;
  background: #fbfcfd;
}

.competency-group-title {
  margin-bottom: 9px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 600;
}

.competency-core {
  border-left-color: #2b6cb0;
}

.competency-core .competency-group-title {
  color: #2b6cb0;
}

.competency-core .tag {
  background: #e7f0fb;
  color: #2b6cb0;
}

.competency-technical {
  border-left-color: #7c3aed;
}

.competency-technical .competency-group-title {
  color: #7c3aed;
}

.competency-technical .tag {
  background: #f1e9fd;
  color: #7c3aed;
}

.competency-leadership {
  border-left-color: #d97706;
}

.competency-leadership .competency-group-title {
  color: #d97706;
}

.competency-leadership .tag {
  background: #fdf3e0;
  color: #d97706;
}

/* =========================================================
   SESSIONS (DATES + SPEAKERS)
========================================================= */
.date-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.date-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid #e9eef2;
  border-radius: 12px;
  background: #fbfcfd;
}

.date-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.date-main {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #172431;
  font-size: 14px;
}

.date-icon {
  color: #16a84a;
  font-size: 18px;
}

.time-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.time-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  border-radius: 20px;
  background: #e7f0fb;
  color: #2b6cb0;
  font-size: 11.5px;
  font-weight: 600;
}

.speaker-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px dashed #e1e8ec;
}

.speaker-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.speaker-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 13px;
  border: 1px solid #e9eef2;
  border-radius: 10px;
  background: #ffffff;
  color: #2c3e4a;
  font-size: 12.5px;
  line-height: 1.45;
}

.speaker-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.speaker-meta {
  color: #718089;
  font-size: 11.5px;
}

.muted-text {
  color: #aab5bb;
  font-size: 12px;
}

.empty-box {
  padding: 16px;
  border: 1px dashed #dde5ea;
  border-radius: 10px;
  color: #aab5bb;
  font-size: 12.5px;
  text-align: center;
}

/* =========================================================
   OFFICES
========================================================= */
.step-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.step-title {
  color: #19354a;
  font-size: 14px;
  font-weight: 750;
}

.step-sub {
  margin-top: 2px;
  color: #8a989e;
  font-size: 11.5px;
}

.office-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  max-height: 520px;
  overflow-y: auto;
  padding: 2px 4px 2px 0;
}

.office-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border: 1px solid #e4ebef;
  border-radius: 11px;
  background: #ffffff;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.office-dot {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  margin-top: 5px;
  border-radius: 50%;
  background: #cfd6d9;
}

.office-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.office-name {
  color: #2c3e4a;
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.45;
  text-transform: uppercase;
}

.office-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.office-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 5px 4px 10px;
  border-radius: 20px;
  background: #eef1f2;
  color: #94a3ab;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.pill-value {
  min-width: 20px;
  padding: 1px 7px;
  border-radius: 20px;
  background: #ffffff;
  color: #5c6b73;
  text-align: center;
}

.pill-attendees {
  background: #e7f0fb;
  color: #2b6cb0;
}

.pill-attendees .pill-value {
  color: #2b6cb0;
}

.office-item.has-nominees {
  border-color: #cdeedb;
}

.office-item.has-nominees .office-dot {
  background: #18b64d;
}

.office-item.has-nominees .pill-nominees {
  background: #e1f7e7;
  color: #087c42;
}

.office-item.has-nominees .pill-nominees .pill-value {
  color: #087c42;
}

.office-item.is-full {
  border-color: #f3dcb0;
}

.office-item.is-full .office-dot {
  background: #d97706;
}

.office-item.is-full .pill-nominees {
  background: #fdf3e0;
  color: #b45f06;
}

.office-item.is-full .pill-nominees .pill-value {
  color: #b45f06;
}

.office-item.is-clickable {
  cursor: pointer;
}

.office-item.is-clickable:hover {
  box-shadow: 0 2px 8px rgba(30, 70, 42, 0.12);
  transform: translateY(-1px);
}

.office-item.is-active {
  border-color: #8db8dc;
  background: #f1f7fc;
  box-shadow: 0 0 0 2px rgba(43, 108, 176, 0.12);
}

.office-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  color: #8a989e;
  font-size: 11.5px;
}

/* =========================================================
   ASSESSMENT
========================================================= */
.assessment-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.assessment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid #e9eef2;
  border-radius: 11px;
  background: #fbfcfd;
}

.assessment-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.assessment-link {
  overflow: hidden;
  color: #24699b;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-decoration: none;
}

.assessment-link:hover {
  text-decoration: underline;
}

.assessment-meta {
  color: #263d4c;
  font-size: 13px;
  font-weight: 550;
}

.assessment-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.assessment-grid .empty-box {
  grid-column: 1 / -1;
}

/* ASSESSMENT DIALOG */
.assessment-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 60vh;
  overflow-y: auto;
  background: #fbfcfd;
}

.answer-toggle {
  color: #607987;
  font-size: 12px;
}

.question-card {
  padding: 12px 14px;
  border: 1px solid #e9eef2;
  border-radius: 11px;
  background: #ffffff;
}

.question-text {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #19354a;
  font-size: 13px;
  font-weight: 650;
  line-height: 1.45;
}

.question-no {
  flex: 0 0 auto;
  min-width: 22px;
  padding: 1px 0;
  border-radius: 6px;
  background: #e7f0fb;
  color: #2b6cb0;
  font-size: 11px;
  text-align: center;
}

.question-points {
  margin-left: auto;
  flex: 0 0 auto;
  color: #8a989e;
  font-size: 10.5px;
  font-weight: 500;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 10px 0 0 30px;
}

.question-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  color: #344b5a;
  font-size: 12.5px;
}

.question-option .q-icon {
  color: #aab5bb;
}

.question-option.is-correct {
  background: #e1f7e7;
  color: #087c42;
  font-weight: 600;
}

.question-option.is-correct .q-icon {
  color: #18b64d;
}

/* =========================================================
   BUTTONS
========================================================= */
.print-btn {
  min-height: 34px;
  padding: 4px 14px;
  border: 1px solid #d5e1e9;
  border-radius: 9px;
  background: #ffffff;
  color: #24699b;
  font-size: 12px;
  font-weight: 600;
}

.print-btn :deep(.q-icon) {
  font-size: 16px;
  margin-right: 6px;
}

.print-btn:hover {
  border-color: #b7d0e2;
  background: #f2f8fc;
}

/* =========================================================
   STAT CARDS
========================================================= */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid #e3eaf0;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 3px 12px rgba(25, 53, 74, 0.04);
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
}

.stat-card-link {
  cursor: pointer;
}

.stat-card-link:hover {
  box-shadow: 0 6px 16px rgba(25, 53, 74, 0.09);
}

.stat-card.is-active {
  border-color: #8db8dc;
  box-shadow: 0 0 0 2px rgba(43, 108, 176, 0.15);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  border-radius: 12px;
}

.tone-blue {
  color: #2b6cb0;
  background: #e7f0fb;
}

.tone-green {
  color: #087c42;
  background: #e1f7e7;
}

.tone-amber {
  color: #b7791f;
  background: #fdf3dc;
}

.tone-red {
  color: #c73f3f;
  background: #fbe9e9;
}

.stat-value {
  color: #19354a;
  font-size: 22px;
  font-weight: 750;
  line-height: 1.1;
}

.stat-label {
  margin-top: 3px;
  color: #718089;
  font-size: 11.5px;
}

/* =========================================================
   NOMINATIONS TABLE
========================================================= */
.detail-table {
  box-shadow: none;
  padding: 0 18px 12px;
}

.detail-table :deep(.q-table__middle) {
  overflow-x: auto;
}

.detail-table :deep(thead tr) {
  background: #f6f9fb;
}

.detail-table :deep(thead th) {
  color: #587080;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.45px;
  text-transform: uppercase;
}

.detail-table :deep(tbody td) {
  height: 54px;
  color: #344b5a;
  font-size: 12px;
}

.detail-table :deep(tbody tr:hover) {
  background: #f8fbfd;
}

.row-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
}

.badge-status {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 10.5px;
  font-weight: 700;
}

.badge-status.status-pending {
  color: #b7791f;
  background: #fdf3dc;
}

.badge-status.status-approved {
  color: #087c42;
  background: #e1f7e7;
}

.badge-status.status-disapproved {
  color: #c73f3f;
  background: #fbe9e9;
}

.toggle-approved :deep(.q-toggle__track) {
  background: #18b64d;
  opacity: 0.5;
}

.toggle-approved :deep(.q-toggle__thumb:after) {
  background: #18b64d;
}

.toggle-disapproved :deep(.q-toggle__track) {
  background: #d83d3d;
  opacity: 0.5;
}

.toggle-disapproved :deep(.q-toggle__thumb:after) {
  background: #d83d3d;
}

.dialog-header {
  padding: 16px 20px;
}

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 900px) {
  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {

  .office-grid,
  .assessment-grid,
  .speaker-list {
    grid-template-columns: minmax(0, 1fr);
  }

  .schedule-stepper :deep(.q-stepper__tab) {
    padding: 12px 10px;
  }

  .schedule-stepper :deep(.q-stepper__caption) {
    display: none;
  }
}

@media (max-width: 650px) {
  .event-page {
    padding: 12px;
    gap: 12px;
  }

  .page-heading {
    flex-direction: column-reverse;
    align-items: flex-start;
    gap: 14px;
    padding: 18px;
  }

  .heading-actions {
    flex-wrap: wrap;
  }

  .page-heading h5 {
    font-size: 20px;
  }

  .section-head-wrap {
    flex-wrap: wrap;
  }

  .filter-select {
    width: 100%;
    max-width: none;
  }

  .schedule-stepper :deep(.q-stepper__step-inner) {
    padding: 16px;
  }

  .detail-table {
    padding: 0 8px 8px;
  }
}

@media (max-width: 560px) {

  .stat-grid,
  .detail-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
.action-view {
  color: #587080;
}

</style>