<template>
  <q-page class="event-page">
    <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
    <section class="page-header">
      <div>
        <q-btn flat dense no-caps icon="arrow_back" label="Back to Events" class="back-btn" @click="$router.back()" />
        <h5>Event Schedule Details</h5>
        <p>Full details of this training schedule, tagged employees, and nomination.</p>
      </div>
    </section>

    <!-- ===================================================
         LOADING / ERROR
    ==================================================== -->
    <LoadingState v-if="loading" message="Loading schedule details..." full-page />
    <div v-else-if="errorMessage" class="error-state">{{ errorMessage }}</div>

    <template v-else>
      <!-- ===================================================
           1. SCHEDULE DETAILS (2 columns: info | offices)
      ==================================================== -->
      <q-card flat bordered class="detail-card">
        <div class="section-head">
          <div class="section-head-text">
            <div class="section-title">Schedule Details</div>
            <div class="section-sub">Event and schedule information</div>
          </div>
          <span class="status-badge" :class="'status-' + schedule.computedStatus">
            {{ schedule.computedStatus }}
          </span>
        </div>

        <div class="detail-body">
          <div class="schedule-layout">
            <!-- ============ LEFT: EVENT INFORMATION ============ -->
            <div class="info-col">
              <h6 class="event-title-lg">{{ eventInfo.title_name }}</h6>

              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Venue</span>
                  <span class="detail-value">{{ schedule.venue_name }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Qualifications</span>
                  <span class="detail-value">{{ schedule.qualifications }}</span>
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
                  <span class="detail-label">Conducted by</span>
                  <span class="detail-value">{{ schedule.conducted_by || "—" }}</span>
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

                    <q-btn outline dense no-caps icon="print" label="Print Attendance" class="print-btn"
                      :loading="isAttendanceLoading(d.schedule_date_time_id)" :disable="isAnyAttendanceLoading()"
                      @click="printAttendance(d)" />



                  </div>
                </div>
                <div v-if="!scheduleDates.length" class="table-empty">
                  No schedule dates.
                </div>
              </div>

              <template v-if="speakers.length">
                <div class="section-label">Speakers</div>
                <div class="speaker-list">
                  <div v-for="sp in speakers" :key="sp.speakerId" class="speaker-item">
                    <strong>{{ sp.speaker_name }}</strong> — {{ sp.position }}, {{ sp.agency }}
                  </div>
                </div>
              </template>

              <template v-if="competencyGroups.length">
                <div class="section-label">Competencies</div>
                <div class="competency-groups">
                  <div v-for="group in competencyGroups" :key="group.key" class="competency-group-block"
                    :class="'competency-' + group.color">
                    <div class="competency-group-title">{{ group.label }}</div>
                    <div class="tag-row">
                      <span v-for="(item, i) in group.items" :key="i" class="tag">
                        {{ item }}
                      </span>
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <!-- ============ RIGHT: OFFICES ============ -->
            <aside class="office-col">
              <div class="office-head">
                <div class="office-head-title">Offices
                     <!-- <span class="office-head-count">
                  {{ officeList.length }} office{{ officeList.length === 1 ? "" : "s" }}
                </span> -->
                </div>

                <q-btn outline dense no-caps icon="print" label="Print Nomination" class="print-btn"
                  :loading="isNominationLoading('nomination')" :disable="isAnyNominationLoading()"
                  @click="printNomination" />
             
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
              <div v-else class="table-empty">No offices tagged.</div>
            </aside>
          </div>
        </div>
      </q-card>
    </template>

    <!-- ===================================================
         2. NOMINATION
    ==================================================== -->
    <q-card flat bordered class="detail-card">
      <div class="section-head">
        <div class="section-head-text">
          <div class="section-title">Nomination</div>
          <div class="section-sub">Select employees to nominate for this schedule</div>
        </div>
        <q-select :model-value="selectedOffice" :options="officeFilterOptions" label="Filter by office" dense outlined
          clearable class="office-filter" @update:model-value="applyOfficeFilter" />
      </div>

      <!-- <div class="detail-body" v-if="!nominatedEmployees.length">
        <div class="table-empty">No nominations yet for this schedule.</div>
      </div> -->
      <q-table flat :rows="nominatedEmployees" :columns="nominatedColumns" row-key="nominated_employee_id"
        v-model:pagination="pagination" :loading="tableLoading" :rows-per-page-options="[5, 10, 20, 50]"
        no-data-label="No nominations found." @request="onRequest" class="app-table detail-table">
        <template #body="props">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              <template v-if="col.name === 'is_attended'">
                <q-badge :color="props.row.is_attended ? 'green' : 'grey-6'">
                  {{ props.row.is_attended ? "Yes" : "No" }}
                </q-badge>
              </template>

              <template v-else-if="col.name === 'nominate_status'">
                <q-badge class="status-badge" :class="{
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

                  <q-btn flat dense round icon="task_alt" color="positive"
                    :loading="isApproveLoading(props.row.nominated_employee_id)" :disable="isAnyApproveLoading()"
                    @click.stop="approveNomination(props.row)">
                    <q-tooltip>Approve</q-tooltip>
                  </q-btn>

                  <q-btn flat dense round icon="cancel" color="negative"
                    :loading="isDisapproveLoading(props.row.nominated_employee_id)" :disable="isAnyDisapproveLoading()"
                    @click.stop="disapproveNomination(props.row)">
                    <q-tooltip>Disapprove</q-tooltip>
                  </q-btn>
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
            <div class="detail-item" style="grid-column: 1 / -1">
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

    <!-- EMPLOYEE INFORMATION MODAL -->
    <EmployeeInformationModal v-model="showEmployeeModal" :employee-data="EmployeeInformation"
      :loading="loadingEmployeeInfo" @view-submission="handleViewSubmission" />
  </q-page>
</template>

<script>
import { defineComponent, computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import LoadingState from "src/components/LoadingStatePage.vue";
import { useEventStore } from "src/stores/eventStore";
import Swal from "sweetalert2";

import EmployeeInformationModal from "src/components/employee/EmployeeInformationModal.vue";
import { useEmployeeInformationStore } from "src/stores/administrator/employee/employeeInformationStore";

import { useRowLoading } from "src/composables/useRowLoading";
import { usePdfStore } from "src/stores/administrator/pdf/pdfStore";

export default defineComponent({
  name: "EventNominatedEmployeePage",
  components: { LoadingState, EmployeeInformationModal },

  setup() {
    const eventStore = useEventStore();
    const employeeInformationStore = useEmployeeInformationStore();
    const route = useRoute();
    const eventId = route.params.eventId;
    const scheduleId = route.params.scheduleId;

    const loading = ref(true);
    const errorMessage = ref("");
    const eventDetail = ref(null);

    const eventInfo = computed(() => eventDetail.value || {});
    const schedule = computed(() => eventInfo.value.schedule?.[0] || {});
    const scheduleDates = computed(() => schedule.value.schedule_date_time || []);
    const offices = computed(() => (schedule.value.office || []).map((o) => o.office_name));
    const speakers = computed(() => schedule.value.speaker || []);
    const nominatedEmployees = computed(() => schedule.value.nominated_employee?.data || []);

    // Offices for the right column (with nominee counts)
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
    const { isLoading: isApproveLoading, isAnyLoading: isAnyApproveLoading, run: runApprove } = useRowLoading();
    const { isLoading: isDisapproveLoading, isAnyLoading: isAnyDisapproveLoading, run: runDisapprove } = useRowLoading();
    const { isLoading: isNominationLoading, isAnyLoading: isAnyNominationLoading, run: runNomination } = useRowLoading();
    const { isLoading: isAttendanceLoading, isAnyLoading: isAnyAttendanceLoading, run: runAttendance } = useRowLoading();


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
      { name: "office", label: "Office", field: "office", align: "left" },
      { name: "status", label: "Status", field: "status", align: "left" },
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

    // async function loadNominatedEmployees() {
    //   loading.value = true;
    //   errorMessage.value = "";
    //   const result = await eventStore.fetchNominatedEmployee(eventId, scheduleId);
    //   if (result.success) {
    //     eventDetail.value = eventStore.nominated_employee;
    //   } else {
    //     errorMessage.value = result.message || "Failed to load schedule.";
    //   }
    //   loading.value = false;
    // }

    async function loadNominatedEmployees(
      page = pagination.value.page,
      { silent = false, perPage = pagination.value.rowsPerPage, office = selectedOffice.value } = {}
    ) {
      if (silent) tableLoading.value = true;
      else loading.value = true;
      errorMessage.value = "";

      const result = await eventStore.fetchNominatedEmployee(eventId, scheduleId, page, perPage, office);


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

    async function approveNomination(row) {
      return runApprove(row.nominated_employee_id, async () => {
        const result = await Swal.fire({
          title: "Approve Nomination",
          text: `Approve nomination for ${row.full_name}?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Approve",
          cancelButtonText: "Cancel",
          confirmButtonColor: "#18b64d",
          cancelButtonColor: "#9e9e9e",
          reverseButtons: true,
          scrollbarPadding: false,
          heightAuto: false,
        });

        if (!result.isConfirmed) return;

        const res = await eventStore.approvalNominatedEmployee(row.nominated_employee_id, {
          nominate_status: "Approved",
        });

        if (res.success) {
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Nomination approved.",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            scrollbarPadding: false,
          });
          await loadNominatedEmployees(pagination.value.page, { silent: true });
        } else {
          Swal.fire({
            title: "Failed",
            text: res.message || "Unable to approve nomination.",
            icon: "error",
            scrollbarPadding: false,
          });
        }
      });
    }

    async function disapproveNomination(row) {
      return runDisapprove(row.nominated_employee_id, async () => {
        const result = await Swal.fire({
          title: "Disapprove Nomination",
          text: `Disapprove nomination for ${row.full_name}?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Disapproved",
          cancelButtonText: "Cancel",
          confirmButtonColor: "#d83d3d",
          cancelButtonColor: "#9e9e9e",
          reverseButtons: true,
          scrollbarPadding: false,
          heightAuto: false,
        });

        if (!result.isConfirmed) return;

        const res = await eventStore.approvalNominatedEmployee(row.nominated_employee_id, {
          nominate_status: "Disapproved",
        });

        if (res.success) {
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Nomination disapproved.",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            scrollbarPadding: false,
          });
          await loadNominatedEmployees(pagination.value.page, { silent: true });
        } else {
          Swal.fire({
            title: "Failed",
            text: res.message || "Unable to disapprove nomination.",
            icon: "error",
            scrollbarPadding: false,
          });
        }
      });
    }

    async function printAttendance(dateRow) {
      return runAttendance(dateRow.schedule_date_time_id, async () => {
        //   const win = window.open("", "_blank");
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
    return {
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
      approveNomination,
      disapproveNomination,
      viewEmployeeInformation,

      showEmployeeModal,
      EmployeeInformation,
      loadingEmployeeInfo,

      isViewLoading,
      isAnyViewLoading,

      isApproveLoading,
      isAnyApproveLoading,

      isDisapproveLoading,
      isAnyDisapproveLoading,

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
}

.section-head-text {
  flex: 1;
}

.section-title {
  color: #19354a;
  font-size: 13.5px;
  font-weight: 750;
}

.section-sub {
  margin-top: 2px;
  color: #8a989e;
  font-size: 10.5px;
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
</style>