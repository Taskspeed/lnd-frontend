<template>
  <q-page class="event-page">
    <!-- PAGE HEADER -->
    <section class="page-header">
      <div class="page-heading">
        <div class="page-heading-copy">
          <div class="page-eyebrow">
            <q-icon name="event_note" />
            Training schedule
          </div>
          <h5>Event Schedule Details</h5>
          <p>Review schedule information, participating offices, and employee form submissions.</p>
        </div>
        <q-btn flat dense no-caps icon="arrow_back" label="Back" class="back-btn" @click="$router.back()" />
      </div>
    </section>

    <LoadingState v-if="loading" message="Loading schedule details..." full-page />
    <div v-else-if="errorMessage" class="error-state">{{ errorMessage }}</div>

    <template v-else>
      <!-- ===================== SCHEDULE DETAILS ===================== -->
      <q-card flat bordered class="detail-card">
        <div class="section-head">
          <div class="section-head-text">
            <div class="section-heading">
              <q-icon name="event" class="section-icon" />
              <div class="section-title">Schedule Details</div>
            </div>
            <div class="section-sub">Event and schedule information</div>
          </div>
          <span class="status-badge" :class="'status-' + schedule.computedStatus">
            {{ schedule.computedStatus }}
          </span>
        </div>

        <div class="detail-body">
          <div class="schedule-layout">
            <!-- LEFT: EVENT INFORMATION -->
            <div class="info-col">
              <span class="detail-label">Event</span>
              <h6 class="event-title-lg">{{ eventInfo.title_name }}</h6>

              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Venue</span>
                  <span class="detail-value">{{ schedule.venue_name }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Hours</span>
                  <span class="detail-value">{{ schedule.hours }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Mode</span>
                  <span class="detail-value">{{ schedule.mode_name }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Fee</span>
                  <span class="detail-value">{{ schedule.fee }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Type</span>
                  <span class="detail-value">{{ schedule.type_name }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Category</span>
                  <span class="detail-value">{{ schedule.category_name }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Source</span>
                  <span class="detail-value">{{ schedule.source_name }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Learning type</span>
                  <span class="detail-value">{{ schedule.learning_intervention }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Conducted by</span>
                  <span class="detail-value">{{ schedule.conducted_by || "—" }}</span>
                </div>
                <div class="detail-item detail-item-wide">
                  <span class="detail-label">Qualifications</span>
                  <span class="detail-value">{{ schedule.qualifications }}</span>
                </div>
              </div>

              <div class="section-label">Schedule Dates</div>
              <div class="date-list">
                <div v-for="d in scheduleDates" :key="d.schedule_date_time_id" class="date-item">
                  <strong>{{ d.schedule_date }}</strong>
                  <div class="date-right">
                    <span>
                      Morning: {{ d.morning_in }} – {{ d.morning_out }} | Afternoon:
                      {{ d.afternoon_in }} – {{ d.afternoon_out }}
                    </span>
                    <!-- <q-btn outline dense no-caps icon="print" label="Print Attendance" class="print-btn"
                      :loading="isAttendanceLoading(d.schedule_date_time_id)" :disable="isAnyAttendanceLoading()"
                      @click="printAttendance(d)" /> -->
                  </div>
                </div>
                <div v-if="!scheduleDates.length" class="table-empty">No schedule dates.</div>
              </div>

              <template v-if="speakers.length">
                <div class="section-label">Speakers</div>
                <div class="speaker-list">
                  <div v-for="sp in speakers" :key="sp.speakerId" class="speaker-item">
                    <strong>{{ sp.speaker_name }}</strong> — {{ sp.position }}, {{ sp.agency }}
                  </div>
                </div>
              </template>
              <!-- 
              <template v-if="competencyGroups.length">
                <div class="section-label">Competencies</div>
                <div class="competency-groups">
                  <div v-for="group in competencyGroups" :key="group.key" class="competency-group-block"
                    :class="'competency-' + group.color">
                    <div class="competency-group-title">{{ group.label }}</div>
                    <div class="tag-row">
                      <span v-for="(item, i) in group.items" :key="i" class="tag">{{ item }}</span>
                    </div>
                  </div>
                </div>
              </template> -->
            </div>

            <!-- RIGHT: OFFICES -->
            <aside class="office-col">
              <div class="office-head">
                <div class="office-heading">
                  <q-icon name="domain" class="section-icon" />
                  <div>
                    <div class="office-head-title">Offices</div>
                    <div class="office-head-count">
                      {{ officeList.length }} office{{ officeList.length === 1 ? "" : "s" }}
                    </div>
                  </div>
                </div>
                <!-- <q-btn outline dense no-caps icon="print" label="Print Nomination" class="print-btn"
                  :loading="isNominationLoading('nomination')" :disable="isAnyNominationLoading()"
                  @click="printNomination" /> -->
              </div>

              <div v-if="officeList.length" class="office-list">
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
                      <!-- <span class="office-pill pill-attendees">
                        <span class="pill-label">No. of Attendees</span>
                        <span class="pill-value">{{ o.attendees ?? "—" }}</span>
                      </span> -->
                      <span class="office-pill pill-nominees">
                        <span class="pill-label">Participants</span>
                        <span class="pill-value">{{ o.nominees }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="table-empty">No offices tagged.</div>
            </aside>
          </div>
        </div>
      </q-card>
    </template>

    <!-- ===================== PARTICIPANTS ===================== -->
    <q-card flat bordered class="detail-card">
      <div class="section-head">
        <div class="section-head-text">
          <div class="section-heading">
            <q-icon name="groups" class="section-icon" />
            <div class="section-title">Participants</div>
          </div>
          <div class="section-sub">Participants form submission progress</div>
        </div>

        <q-input v-model="search" dense outlined clearable placeholder="Search by name..." class="search-filter"
          @update:model-value="onSearchInput">
          <template #prepend><q-icon name="search" /></template>
        </q-input>

        <q-select :model-value="selectedOffice" :options="officeFilterOptions" label="Filter by office" dense outlined
          clearable class="office-filter" @update:model-value="applyOfficeFilter" />

        <q-select v-model="formStatusFilter" :options="formStatusOptions" emit-value map-options
          label="Filter by form status" dense outlined clearable class="office-filter"
          @update:model-value="applyFilters" />

        <q-select v-model="certificateFilter" :options="certificateOptions" emit-value map-options
          label="Filter by certificate status" dense outlined clearable class="office-filter"
          @update:model-value="applyFilters" />
          
      </div>

      <q-table flat :rows="participants" :columns="participantColumns" row-key="nominated_employee_id"
        v-model:pagination="pagination" :loading="employeeSubmissionStore.loading"
        :rows-per-page-options="[10, 20, 50, 100]" no-data-label="No participants found." class="app-table detail-table"
        @request="onRequest">
        <!-- approvals progress -->
        <template #body-cell-approved="props">
          <q-td :props="props">
            <span class="approval-count">{{ props.row.approved }} / {{ props.row.required_approvals }}</span>
          </q-td>
        </template>

        <!-- certificate status -->
        <template #body-cell-form_status="props">
          <q-td :props="props">
            <span class="status-badge" :class="'status-' + props.row.form_status">
              {{ props.row.form_status }}
            </span>
          </q-td>
        </template>

             <template #body-cell-certificate_issued="props">
          <q-td :props="props">
            <span class="status-badge" :class="'status-' + props.row.certificate_issued">
              {{ props.row.certificate_issued}}
            </span>
          </q-td>
        </template>

        <!-- action: button only, no function yet -->
        <template #body-cell-action="props">
          <q-td :props="props">
            <div class="action-buttons">
              <q-btn flat dense round icon="visibility" color="primary"
                :loading="isViewLoading(props.row.nominated_employee_id)" :disable="isAnyViewLoading()"
                @click.stop="viewEmployeeInformation(props.row)">
                <q-tooltip>View Details</q-tooltip>
              </q-btn>


              <q-btn flat dense round icon="workspace_premium" color="blue"
                :loading="isPreviewLoading(props.row.nominated_employee_id)" :disable="isAnyPreviewLoading()"
                @click.stop="certificatePreview(props.row)">
                <q-tooltip>Preview</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>
    <EmployeeInformationModal v-model="showEmployeeModal" :employee-data="EmployeeInformation"
      :loading="loadingEmployeeInfo" @view-submission="handleViewSubmission" />
  </q-page>
</template>

<script>
import { defineComponent, computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import Swal from "sweetalert2";
import LoadingState from "src/components/LoadingStatePage.vue";
import { useEventStore } from "src/stores/eventStore";
import { useEmployeeSubmissionStore } from "src/stores/administrator/employee/employeeSubmissionStore";
import { usePdfStore } from "src/stores/administrator/pdf/pdfStore";
import { useRowLoading } from "src/composables/useRowLoading";
import EmployeeInformationModal from "src/components/employee/EmployeeInformationModal.vue";
import { useEmployeeInformationStore } from "src/stores/administrator/employee/employeeInformationStore";

export default defineComponent({
  name: "EventNominatedEmployeePage",
  components: { LoadingState, EmployeeInformationModal },

  setup() {
    const eventStore = useEventStore();
    const employeeSubmissionStore = useEmployeeSubmissionStore();
    const employeeInformationStore = useEmployeeInformationStore();
    const pdfStore = usePdfStore();
    const route = useRoute();
    const eventId = route.params.eventId;
    const scheduleId = route.params.scheduleId;

    const { isLoading: isViewLoading, isAnyLoading: isAnyViewLoading, run: runView } = useRowLoading();
    const { isLoading: isPreviewLoading, isAnyLoading: isAnyPreviewLoading, run: runPreview } = useRowLoading();

    // ------------------------------------------------------------
    // EVENT DETAILS (no nominated employees anymore)
    // ------------------------------------------------------------
    const loading = ref(true);
    const errorMessage = ref("");

    const eventInfo = computed(() => eventStore.event_schedule || {});
    const schedule = computed(() => eventInfo.value.schedule?.[0] || {});
    const scheduleDates = computed(() => schedule.value.schedule_date_time || []);
    const speakers = computed(() => schedule.value.speaker || []);

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
    const search = ref("");
    const selectedOffice = ref(null);

    const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 });

    const participantColumns = [
      { name: "full_name", label: "Name", field: "full_name", align: "left" },
      { name: "office", label: "Office", field: "office", align: "left", style: "white-space: normal; min-width: 220px;" },
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

    // function certificateStatusClass(status) {
    //   return status === "Complete" ? "status-complete" : "status-incomplete";
    // }

    // ------------------------------------------------------------
    // PRINT
    // ------------------------------------------------------------
    async function printAttendance(dateRow) {
      return runAttendance(dateRow.schedule_date_time_id, async () => {
        const result = await pdfStore.fetchAttendanceSheet(eventId, scheduleId, dateRow.schedule_date_time_id);
        if (result.success) {
          const url = window.URL.createObjectURL(new Blob([result.blob], { type: "application/pdf" }));
          window.open(url, "_blank");
        } else {
          Swal.fire({
            title: "Failed",
            text: result.message || "Unable to print attendance.",
            icon: "error",
            scrollbarPadding: false,
          });
        }
      });
    }

    const showEmployeeModal = ref(false);
    const EmployeeInformation = ref({});
    const loadingEmployeeInfo = ref(false);

    async function viewEmployeeInformation(row) {
      // loadingEmployeeInfo.value = true;
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
      })

    }
    function handleViewSubmission(row) {
      Swal.fire({
        title: "No preview available",
        text: `Walang naka-registered na view para sa form: "${row.form_name}".`,
        icon: "info",
        scrollbarPadding: false,
      });
    }

    const formStatusFilter = ref(null);
    const certificateFilter = ref(null);

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
    onMounted(() => {
      loadEventDetails();
      loadParticipants();
    });

    return {
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

/* =========================================================
   PAGE HEADER
========================================================= */
.page-header {
  margin-bottom: 4px;
}

.back-btn {
  padding: 0;
  margin-bottom: 6px;
  color: #060707;
  font-size: 14px;
  font-weight: 410;
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
   LOADING / ERROR
========================================================= */
.loading-state,
.table-empty {
  padding: 30px 0;
  text-align: center;
  color: #8a989e;
  font-size: 12px;
}

.error-state {
  padding: 20px;
  border-radius: 10px;
  background: #fbe9e9;
  color: #c73f3f;
  font-size: 12px;
}

/* =========================================================
   DETAIL CARD (shared shell)
========================================================= */
.detail-card {
  overflow: hidden;
  border-radius: 13px;
  background: #ffffff;
  box-shadow: 0 3px 12px rgba(30, 70, 42, 0.055);
}

.section-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #edf1ef;
  background: #fcfdfc;
   flex-wrap: wrap;
}
/* .section-head {
  padding: 18px 22px;
  background: linear-gradient(110deg, #fbfdff 0%, #f6f9fb 100%);
} */
.section-head-text {
  flex: 1;
}

.section-title {
  color: #19354a;
  font-size: 16px;
  font-weight: 750;
}

.section-sub {
  margin-top: 3px;
  margin-left: 28px;
  font-size: 14px;
  color: #585c5e;
 flex-wrap: wrap;
}

/* =========================================================
   SCHEDULE DETAILS — TWO COLUMN LAYOUT
========================================================= */
.detail-body {
  padding: 20px 22px;
}

.schedule-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(280px, 1fr);
  gap: 28px;
  align-items: start;
}

.info-col {
  min-width: 0;
}

.event-title-lg {
  margin: 0;
  color: #172431;
  font-size: 17px;
  font-weight: 750;
  line-height: 1.4;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px 24px;
  margin-top: 20px;
  padding-bottom: 18px;
  border-bottom: 1px solid #eef2f1;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  color: #94a3ab;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.detail-value {
  color: #2c3e4a;
  font-size: 13px;
  font-weight: 550;
}

.section-label {
  margin: 22px 0 10px;
  color: #94a3ab;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* =========================================================
   OFFICES (right column)
========================================================= */
.office-col {
  position: sticky;
  top: 16px;
  padding: 14px;
  border: 1px solid #edf1ef;
  border-radius: 12px;
  background: #fcfdfc;
  margin-top: 99px;
}

.office-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

}

.office-head-title {
  color: #19354a;
  font-size: 13px;
  font-weight: 750;
}

.office-head-count {
  color: #94a3ab;
  font-size: 10.5px;
  margin-left: 10px;
}

.office-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 560px;
  overflow-y: auto;
  padding-right: 4px;
}

.office-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #e8eceb;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(30, 70, 42, 0.04);
}

.office-dot {
  flex-shrink: 0;
  width: 6px;
  height: 6px;
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
  font-size: 11px;
  font-weight: 600;
  line-height: 1.35;
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
  padding: 3px 4px 3px 10px;
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

/* attendees — neutral blue */
.pill-attendees {
  background: #e7f0fb;
  color: #2b6cb0;
}

.pill-attendees .pill-value {
  color: #2b6cb0;
}

/* office na may nominees */
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

/* office na puno na ang slots */
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

/* =========================================================
   COMPETENCY GROUPS
========================================================= */
.competency-groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.competency-group-block {
  padding: 12px 16px;
  border-radius: 10px;
  border-left: 3px solid transparent;
  background: #fafcfb;
}

.competency-group-title {
  margin-bottom: 9px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.competency-group-block .tag-row {
  margin-top: 0;
}

/* CORE — blue */
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

/* TECHNICAL — purple */
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

/* LEADERSHIP — amber */
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
   DATES / SPEAKERS / TAGS
========================================================= */
.date-list,
.speaker-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 20px;
}

.date-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #eef2f1;
  background: #fafcfb;
  color: #2c3e4a;
  font-size: 12px;
}

.date-item strong {
  color: #172431;
}

.speaker-item {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #eef2f1;
  background: #fafcfb;
  color: #2c3e4a;
  font-size: 12px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 4px 10px;
  border-radius: 6px;
  background: #f1f4f2;
  color: #121414;
  font-size: 10px;
  font-weight: 600;
}

.date-right {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.print-btn {
  padding: 4px 14px;
  border: 1px solid #d5d5d5;
  border-radius: 9px;
  background: #ffffff;
  color: #207fc9;
  font-size: 12px;
  font-weight: 600;
}

.print-btn :deep(.q-icon) {
  font-size: 16px;
  margin-right: 6px;
}

.print-btn:hover {
  background: #f5f7f6;
}

/* =========================================================
   NOMINATION TABLE
========================================================= */
.detail-table {
  box-shadow: none;
  padding: 0 12px;
}

.dialog-header {
  padding: 16px 20px;
}

.row-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  white-space: nowrap;
}

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 900px) {
  .schedule-layout {
    grid-template-columns: 1fr;
  }

  .office-col {
    position: static;
  }
}

@media (max-width: 650px) {
  .event-page {
    padding: 14px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}

.office-filter {
  min-width: 260px;
  max-width: 360px;
}

.office-item.is-clickable {
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.office-item.is-clickable:hover {
  box-shadow: 0 2px 8px rgba(30, 70, 42, 0.12);
}

.office-item.is-active {
  border-color: #2b6cb0;
  background: #f3f8fd;
  box-shadow: 0 0 0 1px #2b6cb0;
}

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
  color: #2b6cb0;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.page-eyebrow .q-icon {
  font-size: 15px;
}

.page-header h5 {
  margin: 6px 0 5px;
  font-size: 23px;
  line-height: 1.25;
}

.page-header p {
  max-width: 620px;
  font-size: 13px;
  line-height: 1.5;
}

.back-btn {
  flex: 0 0 auto;
  min-height: 38px;
  padding: 0 12px;
  margin: 0;
  border: 1px solid #dfe7ed;
  border-radius: 9px;
  background: #ffffff;
  color: #31546b;
  font-weight: 650;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.back-btn:hover {
  border-color: #bfd2e1;
  background: #f4f8fb;
}

.detail-card {
  border-color: #e3eaf0;
  border-radius: 16px;
  box-shadow: 0 5px 18px rgba(25, 53, 74, 0.05);
}



.section-heading,
.office-heading {
  display: flex;
  align-items: center;
  gap: 9px;
}

.section-icon {
  flex: 0 0 auto;
  color: #2b6cb0;
  font-size: 19px;
}




.detail-body {
  padding: 22px;
}

.schedule-layout {
  grid-template-columns: minmax(0, 1.65fr) minmax(290px, 1fr);
  gap: 24px;
}

.event-title-lg {
  margin-top: 4px;
  font-size: 20px;
  letter-spacing: -0.2px;
}

.detail-grid {
  gap: 10px;
  margin-top: 18px;
  padding-bottom: 20px;
}

.detail-item {
  min-width: 0;
  gap: 5px;
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
  font-size: 9px;
  letter-spacing: 0.65px;
}

.detail-value {
  overflow-wrap: anywhere;
  color: #263d4c;
  font-size: 13px;
  line-height: 1.45;
}

.section-label {
  margin-top: 24px;
  color: #607987;
}

.office-col {
  top: 20px;
  padding: 16px;
  border-color: #e3eaf0;
  border-radius: 14px;
  background: #f9fbfc;
}

.office-heading {
  gap: 8px;
}

.office-head-title {
  font-size: 14px;
}

.office-head-count {
  display: block;
  margin: 2px 0 0;
  font-size: 10px;
}

.office-list {
  max-height: 620px;
  gap: 9px;
}

.office-item {
  padding: 12px;
  border-color: #e4ebef;
  border-radius: 11px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.office-item.is-clickable:hover {
  transform: translateY(-1px);
}

.office-item.is-active {
  border-color: #8db8dc;
  background: #f1f7fc;
  box-shadow: 0 0 0 2px rgba(43, 108, 176, 0.12);
}

.office-name {
  font-size: 11.5px;
  line-height: 1.45;
}

.office-pill {
  padding: 4px 5px 4px 9px;
}

.date-list,
.speaker-list {
  margin-top: 10px;
}

.date-item,
.speaker-item {
  padding: 12px 14px;
  border-color: #e5ebef;
  border-radius: 10px;
  background: #fbfcfd;
}

.date-right {
  justify-content: flex-end;
}

.print-btn {
  min-height: 34px;
  border-color: #d5e1e9;
  color: #24699b;
}

.print-btn:hover {
  border-color: #b7d0e2;
  background: #f2f8fc;
}

.office-filter {
  min-width: 240px;
}

.detail-table {
  padding: 0 18px 12px;
}

.detail-table :deep(.q-table__middle) {
  overflow-x: auto;
}

.detail-table :deep(thead tr) {
  background: #f6f9fb;
}

.detail-table :deep(thead th) {

  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.45px;
  text-transform: uppercase;
}

.detail-table :deep(tbody td) {
  height: 54px;
  font-size: 12px;
}

.detail-table :deep(tbody tr:hover) {
  background: #f8fbfd;
}


@media (max-width: 900px) {
  .schedule-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .office-col {
    top: auto;
  }
}

@media (max-width: 650px) {
  .event-page {
    padding: 12px;
    gap: 12px;
  }

  .page-heading {
    align-items: flex-start;
    flex-direction: column-reverse;
    gap: 14px;
    padding: 18px;
  }

  .page-header h5 {
    font-size: 20px;
  }

  .back-btn {
    min-height: 34px;
  }

  .section-head {
    align-items: flex-start;
    flex-wrap: wrap;
    padding: 16px;
  }

  .section-sub {
    margin-left: 28px;
  }

  .detail-body {
    padding: 16px;
  }

  .detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .detail-item {
    padding: 10px;
  }

  .office-head {
    align-items: flex-start;
    gap: 10px;
  }

  .office-filter {
    width: 100%;
    max-width: none;
  }

  .detail-table {
    padding: 0 8px 8px;
  }
}

@media (max-width: 420px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-item-wide {
    grid-column: auto;
  }
}

.search-filter {
  min-width: 220px;
}

.approval-count {
  color: #405967;
  font-weight: 700;
}

/*  */
</style>