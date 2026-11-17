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
          <p>Review schedule information, participating offices, and employee form submissions.</p>
        </div>

        <div class="heading-actions">
          <span v-if="schedule.computedStatus" class="pill pill-status"
            :class="'status-' + String(schedule.computedStatus).toLowerCase()">
            {{ schedule.computedStatus }}
          </span>
          <q-btn flat dense no-caps icon="arrow_back" label="Back" class="back-btn" @click="$router.back()" />
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
           1. SCHEDULE DETAILS (DROPDOWN + STEPPER)
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
              <div class="section-sub">Event, sessions, and participating offices</div>
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
                  <div class="date-main">
                    <q-icon name="event" class="date-icon" />
                    <strong>{{ d.schedule_date }}</strong>
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
                      <div v-for="sp in d.speakers" :key="sp.speakerId" class="speaker-item">
                        <strong>{{ sp.speaker_name }}</strong> — {{ sp.position }}, {{ sp.agency }}
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
                      <span class="office-pill pill-nominees">
                        <span class="pill-label">Participants</span>
                        <span class="pill-value">{{ o.nominees }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-box">No offices tagged.</div>

              <div v-if="officeFilterOptions.length" class="office-hint">
                <q-icon name="info_outline" size="15px" />
                Select an office with participants to filter the table below.
              </div>
            </q-step>
          </q-stepper>
        </q-expansion-item>
      </q-card>

      <!-- =====================================================
           2. SUMMARY CARDS
      ====================================================== -->
      <section class="stat-grid">
        <div v-ripple class="stat-card stat-card-link" @click="filterByCard()">
          <div class="stat-icon tone-green">
            <q-icon name="groups" size="22px" />
          </div>
          <div>
            <div class="stat-value">{{ stats.total_employees }}</div>
            <div class="stat-label">Total employees</div>
          </div>
        </div>

        <div v-ripple class="stat-card stat-card-link" :class="{ 'is-active': certificateFilter === 'pending' }"
          @click="filterByCard({ certificate: 'pending' })">
          <div class="stat-icon tone-amber">
            <q-icon name="hourglass_empty" size="22px" />
          </div>
          <div>
            <div class="stat-value">{{ stats.certificate_pending }}</div>
            <div class="stat-label">Certificate pending</div>
          </div>
        </div>

        <div v-ripple class="stat-card stat-card-link" :class="{ 'is-active': certificateFilter === 'issued' }"
          @click="filterByCard({ certificate: 'issued' })">
          <div class="stat-icon tone-blue">
            <q-icon name="task_alt" size="22px" />
          </div>
          <div>
            <div class="stat-value">{{ stats.certificate_issued }}</div>
            <div class="stat-label">Certificate issued</div>
          </div>
        </div>

        <div v-ripple class="stat-card stat-card-link" :class="{ 'is-active': formStatusFilter === 'incomplete' }"
          @click="filterByCard({ form: 'incomplete' })">
          <div class="stat-icon tone-red">
            <q-icon name="cancel" size="22px" />
          </div>
          <div>
            <div class="stat-value">{{ stats.form_incomplete }}</div>
            <div class="stat-label">Incomplete form</div>
          </div>
        </div>
      </section>

      <!-- =====================================================
           3. PARTICIPANTS
      ====================================================== -->
      <q-card flat bordered class="detail-card">
        <div class="section-head">
          <q-icon name="groups" class="section-icon" />
          <div class="section-head-text">
            <div class="section-title">Participants</div>
            <div class="section-sub">Participants form submission progress</div>
          </div>
        </div>

        <div class="filter-bar">
          <q-input v-model="search" dense outlined clearable placeholder="Search by name..." class="search-filter"
            @update:model-value="onSearchInput">
            <template #prepend><q-icon name="search" /></template>
          </q-input>

          <q-select :model-value="selectedOffice" :options="officeFilterOptions" label="Filter by office" dense
            outlined clearable class="filter-select" @update:model-value="applyOfficeFilter" />

          <q-select v-model="formStatusFilter" :options="formStatusOptions" emit-value map-options
            label="Filter by form status" dense outlined clearable class="filter-select"
            @update:model-value="applyFilters" />

          <q-select v-model="certificateFilter" :options="certificateOptions" emit-value map-options
            label="Filter by certificate status" dense outlined clearable class="filter-select"
            @update:model-value="applyFilters" />
        </div>

        <q-table flat :rows="participants" :columns="participantColumns" row-key="nominated_employee_id"
          v-model:pagination="pagination" :loading="employeeSubmissionStore.loading"
          :rows-per-page-options="[10, 20, 50, 100]" no-data-label="No participants found." class="detail-table"
          @request="onRequest">
          <!-- approvals progress -->
          <template #body-cell-approved="props">
            <q-td :props="props">
              <span class="approval-count">{{ props.row.approved }} / {{ props.row.required_approvals }}</span>
            </q-td>
          </template>

          <!-- form status -->
          <template #body-cell-form_status="props">
            <q-td :props="props">
              <span class="badge-status" :class="'status-' + props.row.form_status">
                {{ props.row.form_status }}
              </span>
            </q-td>
          </template>

          <!-- certificate status -->
          <template #body-cell-certificate_issued="props">
            <q-td :props="props">
              <span class="badge-status" :class="'status-' + props.row.certificate_issued">
                {{ props.row.certificate_issued }}
              </span>
            </q-td>
          </template>

          <!-- actions -->
          <template #body-cell-action="props">
            <q-td :props="props">
              <div class="row-actions">
                <q-btn flat dense round icon="visibility" color="primary"
                  :loading="isViewLoading(props.row.nominated_employee_id)" :disable="isAnyViewLoading()"
                  @click.stop="viewEmployeeInformation(props.row)">
                  <q-tooltip>View Details</q-tooltip>
                </q-btn>

                <q-btn flat dense round icon="workspace_premium" color="blue"
                  :loading="isPreviewLoading(props.row.nominated_employee_id)" :disable="isAnyPreviewLoading()"
                  @click.stop="certificatePreview(props.row)">
                  <q-tooltip>Preview certificate</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- CERTIFICATE PREVIEW DIALOG -->
    <q-dialog v-model="showCertificateModal" @hide="closeCertificatePreview">
      <q-card class="certificate-preview-dialog">
        <q-card-section class="dialog-header">
          <div class="dialog-title">Certificate Preview</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-none certificate-body">
          <q-inner-loading :showing="loadingCertificate" color="primary" />
          <iframe v-if="certificateUrl" :src="certificateUrl" class="certificate-frame"
            title="Certificate Preview"></iframe>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat no-caps label="Close" v-close-popup />
          <q-btn unelevated no-caps label="Send Certificate" icon="send" class="send-cert-btn"
            :loading="sendingCertificate" :disable="!certificateUrl" @click="sendCertificate" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <EmployeeInformationModal v-model="showEmployeeModal" :employee-data="EmployeeInformation"
      :loading="loadingEmployeeInfo" @view-submission="handleViewSubmission" />
  </q-page>
</template>

<script>
import { defineComponent, computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";
import LoadingState from "src/components/LoadingStatePage.vue";
import { useEventStore } from "src/stores/eventStore";
import { useEmployeeSubmissionStore } from "src/stores/administrator/employee/employeeSubmissionStore";
import { useRowLoading } from "src/composables/useRowLoading";
import EmployeeInformationModal from "src/components/employee/EmployeeInformationModal.vue";
import { useEmployeeInformationStore } from "src/stores/administrator/employee/employeeInformationStore";
import { useCertificationStore } from "src/stores/administrator/certification/certificateStore";

export default defineComponent({
  name: "EventNominatedEmployeePage",
  components: { LoadingState, EmployeeInformationModal },

  setup() {
    const eventStore = useEventStore();
    const employeeSubmissionStore = useEmployeeSubmissionStore();
    const employeeInformationStore = useEmployeeInformationStore();
    const certificationStore = useCertificationStore();
    const route = useRoute();
    const router = useRouter();
    const eventId = route.params.eventId;
    const scheduleId = route.params.scheduleId;

    const { isLoading: isViewLoading, isAnyLoading: isAnyViewLoading, run: runView } = useRowLoading();
    const { isLoading: isPreviewLoading, isAnyLoading: isAnyPreviewLoading, run: runPreview } = useRowLoading();

    // active step ng Schedule Details stepper
    const tab = ref("overview");

    // Schedule Details dropdown: false = nakasara (nasa taas ang participants table)
    const detailsOpen = ref(false);

    const show = (value) => (value === null || value === undefined || value === "" ? "—" : value);

    // ------------------------------------------------------------
    // EVENT DETAILS
    // ------------------------------------------------------------
    const loading = ref(true);
    const errorMessage = ref("");

    const eventInfo = computed(() => eventStore.event_schedule || {});
    const schedule = computed(() => eventInfo.value.schedule?.[0] || {});

    function timeOrDefault(value, defaultValue = "00:00") {
      return value === null || value === undefined || value === "" ? defaultValue : value;
    }

    // bawat date ay may sariling speakers
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

    // unique na listahan ng lahat ng speakers (kung kailangan sa ibang bahagi)
    const speakers = computed(() => {
      const map = new Map();
      scheduleDates.value.forEach((d) =>
        d.speakers.forEach((sp) => map.set(sp.speakerId, sp))
      );
      return [...map.values()];
    });

    const officeList = computed(() =>
      (schedule.value.office || [])
        .map((o) => ({
          id: o.departmentId,
          name: o.office_name,
          nominees: o.employee_nominated ?? 0,
          attendees: o.number_of_attendees ?? null,
        }))
        .map((o) => ({
          ...o,
          isFull: o.attendees > 0 && o.nominees >= o.attendees,
        }))
        .sort((a, b) => b.nominees - a.nominees || a.name.localeCompare(b.name))
    );

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

    async function loadEventDetails() {
      loading.value = true;
      errorMessage.value = "";
      const result = await eventStore.fetchEventDetails(eventId, scheduleId);
      if (!result.success) {
        errorMessage.value = result.message || "Failed to load schedule.";
      }
      loading.value = false;
    }

    // ------------------------------------------------------------
    // PARTICIPANTS (separate endpoint, paginated)
    // ------------------------------------------------------------
    const participants = computed(() => employeeSubmissionStore.list);
    const stats = computed(() => employeeSubmissionStore.summary);
    const search = ref("");
    const selectedOffice = ref(null);
    const formStatusFilter = ref(null);
    const certificateFilter = ref(null);

    const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 });

    const participantColumns = [
      { name: "full_name", label: "Name", field: "full_name", align: "left" },
      { name: "designation", label: "Position", field: "designation", align: "left" },
      { name: "status", label: "Status", field: "status", align: "left" },
      { name: "office", label: "Office", field: "office_abbr", align: "left" },
      { name: "pending", label: "Pending", field: "pending", align: "center" },
      { name: "returned", label: "Returned", field: "returned", align: "center" },
      { name: "approved", label: "Approved", field: "approved", align: "center" },
      { name: "form_status", label: "Form Status", field: "form_status", align: "center" },
      { name: "certificate_issued", label: "Certificate Status", field: "certificate_issued", align: "center" },
      { name: "action", label: "Action", field: "action", align: "center" },
    ];

    async function loadParticipants() {
      const result = await employeeSubmissionStore.fetchEmployeeSubmission(scheduleId, {
        page: pagination.value.page,
        per_page: pagination.value.rowsPerPage,
        office: selectedOffice.value || undefined,
        search: search.value || undefined,
        form_status: formStatusFilter.value || undefined,
        certificate_issued: certificateFilter.value || undefined,
      });

      if (result.success) {
        pagination.value.rowsNumber = employeeSubmissionStore.pagination.total;
      } else {
        Swal.fire({
          title: "Failed",
          text: result.message || "Failed to load participants.",
          icon: "error",
          scrollbarPadding: false,
        });
      }
    }

    function onRequest({ pagination: p }) {
      const rowsChanged = p.rowsPerPage !== pagination.value.rowsPerPage;
      pagination.value.page = rowsChanged ? 1 : p.page;
      pagination.value.rowsPerPage = p.rowsPerPage;
      loadParticipants();
    }

    let searchTimeout = null;
    function onSearchInput() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        pagination.value.page = 1;
        loadParticipants();
      }, 400);
    }

    const officeFilterOptions = computed(() =>
      officeList.value.filter((o) => o.nominees > 0).map((o) => o.name)
    );

    function applyOfficeFilter(office) {
      selectedOffice.value = office || null;
      pagination.value.page = 1;
      return loadParticipants();
    }

    function toggleOffice(office) {
      return applyOfficeFilter(selectedOffice.value === office ? null : office);
    }

    const formStatusOptions = [
      { label: "Complete", value: "complete" },
      { label: "Incomplete", value: "incomplete" },
    ];

    const certificateOptions = [
      { label: "Issued", value: "issued" },
      { label: "Pending", value: "pending" },
    ];

    function applyFilters() {
      pagination.value.page = 1;
      return loadParticipants();
    }

    // click sa stat card: i-set ang filter
    function filterByCard({ form, certificate } = {}) {
      formStatusFilter.value = form ?? null;
      certificateFilter.value = certificate ?? null;
      return applyFilters();
    }

    // ------------------------------------------------------------
    // EMPLOYEE INFORMATION MODAL
    // ------------------------------------------------------------
    const showEmployeeModal = ref(false);
    const EmployeeInformation = ref({});
    const loadingEmployeeInfo = ref(false);

    async function viewEmployeeInformation(row) {
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

    function handleViewSubmission(row) {
      Swal.fire({
        title: "No preview available",
        text: `Walang naka-registered na view para sa form: "${row.form_name}".`,
        icon: "info",
        scrollbarPadding: false,
      });
    }

    // ------------------------------------------------------------
    // CERTIFICATE PREVIEW / SEND
    // ------------------------------------------------------------
    const showCertificateModal = ref(false);
    const certificateUrl = ref(null);
    const loadingCertificate = ref(false);
    const previewingRow = ref(null);
    const sendingCertificate = ref(false);

    async function certificatePreview(row) {
      previewingRow.value = row;
      showCertificateModal.value = true;

      return runPreview(row.nominated_employee_id, async () => {
        loadingCertificate.value = true;
        const result = await certificationStore.fetchCertificate(row.nominated_employee_id);

        loadingCertificate.value = false;

        if (result.success) {
          const rawUrl = window.URL.createObjectURL(
            new Blob([result.blob], { type: "application/pdf" })
          );
          certificateUrl.value = `${rawUrl}#zoom=60`;
        } else {
          showCertificateModal.value = false;
          Swal.fire({
            title: "Failed",
            text: result.message || "Unable to preview certificate.",
            icon: "error",
            scrollbarPadding: false,
          });
        }
      });
    }

    function closeCertificatePreview() {
      if (certificateUrl.value) {
        window.URL.revokeObjectURL(certificateUrl.value);
        certificateUrl.value = null;
      }
      previewingRow.value = null;
    }

    async function sendCertificate() {
      if (!previewingRow.value) return;

      const row = previewingRow.value;

      const confirm = await Swal.fire({
        title: "Certificate",
        text: `Are you want to send Certificate ${row.full_name}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Send",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#18b64d",
        cancelButtonColor: "#9e9e9e",
        reverseButtons: true,
        scrollbarPadding: false,
        heightAuto: false,
      });

      if (!confirm.isConfirmed) return;

      sendingCertificate.value = true;

      const result = await certificationStore.sendCertificate(row.nominated_employee_id);

      sendingCertificate.value = false;

      if (result.success) {
        showCertificateModal.value = false;

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Certificate sent successfully.",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          scrollbarPadding: false,
        });

        // i-refresh ang listahan at summary para ma-update ang certificate status
        await loadParticipants();
      } else {
        Swal.fire({
          title: "Failed",
          text: result.message || "Unable to send certificate.",
          icon: "error",
          scrollbarPadding: false,
        });
      }
    }

    // ------------------------------------------------------------
    // OPEN FROM NOTIFICATION
    // ------------------------------------------------------------
    async function openFromNotification() {
      const id = route.query.nominated_employee_id;
      if (!id) return;

      router.replace({ query: {} }); // linisin ang URL para hindi mag-reopen

      const nominatedId = Number(id);

      const row = employeeSubmissionStore.list.find(
        (r) => Number(r.nominated_employee_id) === nominatedId
      );

      await viewEmployeeInformation(row ?? { nominated_employee_id: nominatedId });
    }

    watch(() => route.query.nominated_employee_id, openFromNotification);

    onMounted(() => {
      loadEventDetails();
      loadParticipants();
      openFromNotification();
    });

    return {
      tab,
      detailsOpen,
      show,
      loading,
      errorMessage,
      eventInfo,
      schedule,
      scheduleDates,
      speakers,
      officeList,
      competencyGroups,

      employeeSubmissionStore,
      participants,
      participantColumns,
      pagination,
      onRequest,
      search,
      onSearchInput,

      selectedOffice,
      officeFilterOptions,
      applyOfficeFilter,
      toggleOffice,

      isViewLoading,
      isAnyViewLoading,
      isPreviewLoading,
      isAnyPreviewLoading,

      viewEmployeeInformation,
      handleViewSubmission,

      showEmployeeModal,
      EmployeeInformation,
      loadingEmployeeInfo,

      formStatusFilter,
      certificateFilter,
      formStatusOptions,
      certificateOptions,
      applyFilters,

      certificatePreview,
      closeCertificatePreview,
      showCertificateModal,
      certificateUrl,
      sendCertificate,
      sendingCertificate,
      loadingCertificate,

      stats,
      filterByCard,
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
  padding: 10px 13px;
  border: 1px solid #e9eef2;
  border-radius: 10px;
  background: #ffffff;
  color: #2c3e4a;
  font-size: 12.5px;
  line-height: 1.45;
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
   PARTICIPANTS: FILTERS + TABLE
========================================================= */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 14px 22px;
  border-bottom: 1px solid #edf1ef;
}

.search-filter {
  flex: 1 1 220px;
  min-width: 200px;
  max-width: 320px;
}

.filter-select {
  flex: 1 1 200px;
  min-width: 180px;
  max-width: 260px;
}

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

.approval-count {
  color: #405967;
  font-weight: 700;
}

.row-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  white-space: nowrap;
}

.badge-status {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  background: #eef1f2;
  color: #5c6b73;
  font-size: 10.5px;
  font-weight: 700;
  text-transform: capitalize;
}

.badge-status.status-complete,
.badge-status.status-issued {
  color: #087c42;
  background: #e1f7e7;
}

.badge-status.status-incomplete {
  color: #c73f3f;
  background: #fbe9e9;
}

.badge-status.status-pending {
  color: #b7791f;
  background: #fdf3dc;
}

/* =========================================================
   CERTIFICATE DIALOG
========================================================= */
.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 18px;
}

.certificate-preview-dialog {
  width: 1500px;
  max-width: 95vw;
  height: 85vh;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.certificate-preview-dialog :deep(.certificate-body) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.certificate-frame {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.dialog-title {
  color: #19354a;
  font-size: 16px;
  font-weight: 750;
}

.dialog-actions {
  padding: 12px 16px;
  background: #fcfdfc;
}

.send-cert-btn {
  background: linear-gradient(135deg, #18b64d, #0ca344);
  color: #ffffff;
  border-radius: 8px;
  padding: 0 16px;
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

  .filter-bar {
    padding: 12px 16px;
  }

  .search-filter,
  .filter-select {
    flex-basis: 100%;
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
</style>