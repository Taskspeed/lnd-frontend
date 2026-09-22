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
           1. SCHEDULE DETAILS
      ==================================================== -->
      <q-card flat bordered class="detail-card">
        <div class="section-head">
          <!-- <span class="section-badge">1</span> -->
          <div class="section-head-text">
            <div class="section-title">Schedule Details</div>
            <div class="section-sub">Event and schedule information</div>
          </div>
          <span class="status-badge" :class="'status-' + schedule.computedStatus">
            {{ schedule.computedStatus }}
          </span>
        </div>

        <div class="detail-body">
          <h6 class="event-title-lg">{{ eventInfo.title_name }}</h6>
          <!-- <div class="event-sub">Created {{ eventInfo.created_at }}</div> -->

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
            <!-- <div class="detail-item">
              <span class="detail-label">Qualifications</span>
              <span class="detail-value">{{ schedule.qualifications }}</span>
            </div> -->
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
            <!-- <div class="detail-item" v-if="offices.length">
              <span class="detail-label">Office</span>
              <span class="detail-value">{{ offices.join(", ") }}</span>
            </div> -->


          </div>


          <div class="section-label">Schedule Dates</div>
          <div class="date-list">
            <div v-for="d in scheduleDates" :key="d.id" class="date-item">
              <strong>{{ d.schedule_date }}</strong>
              <span>
                {{ d.morning_in }}–{{ d.morning_out }} ·
                {{ d.afternoon_in }}–{{ d.afternoon_out }}
              </span>
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
      </q-card>


    </template>
    <!-- ===================================================
     3. NOMINATION
==================================================== -->
    <q-card flat bordered class="detail-card">
      <div class="section-head">
        <!-- <span class="section-badge">3</span> -->
        <div class="section-head-text">
          <div class="section-title">Nomination</div>
          <div class="section-sub">Select employees to nominate for this schedule</div>
        </div>

      </div>

      <div class="detail-body" v-if="!nominatedEmployees.length">
        <div class="table-empty">No nominations yet for this schedule.</div>
      </div>
      <q-table v-else flat :rows="nominatedEmployees" :columns="nominatedColumns" row-key="nominated_employee_id"
        :rows-per-page-options="[0, 5, 10, 20, 50,]" class="detail-table">
        <template #body="props">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              <template v-if="col.name === 'is_attended'">
                <q-badge :color="props.row.is_attended ? 'green' : 'grey-6'">
                  {{ props.row.is_attended ? 'Yes' : 'No' }}
                </q-badge>
              </template>
              <!-- <template v-else-if="col.name === 'nominate_status'">
                <q-badge
                  :color="props.row.nominate_status === 'Approved' ? 'green' : (props.row.nominate_status === 'Disapproved' ? 'red' : 'orange')">
                  {{ props.row.nominate_status || 'Pending' }}
                </q-badge>
              </template> -->
              <template v-else-if="col.name === 'nominate_status'">
                <q-badge class="status-badge" :class="{
                  'status-approved': props.row.nominate_status === 'Approved',
                  'status-disapproved': props.row.nominate_status === 'Disapproved',
                  'status-pending': props.row.nominate_status === 'Pending'
                }">
                  {{ props.row.nominate_status }}
                </q-badge>
              </template>
              <!-- ✅ NEW: truncated reason with tooltip -->
              <!-- <template v-else-if="col.name === 'nominate_reason'">
                <span class="reason-cell">
                  {{ truncateText(props.row.nominate_reason, 24) }}
                  <q-tooltip max-width="300px" class="reason-tooltip">
                    {{ props.row.nominate_reason }}
                  </q-tooltip>
                </span>
              </template> -->
              <template v-else-if="col.name === 'action'">

                <div class="row-actions">
                  <q-btn flat dense round icon="visibility" color="primary"
                    @click.stop="viewEmployeeInformation(props.row)">
                    <q-tooltip>View Details</q-tooltip>
                  </q-btn>

                  <q-btn flat dense round icon="task_alt" color="positive" @click.stop="approveNomination(props.row)">
                    <q-tooltip>Approve</q-tooltip>
                  </q-btn>

                  <q-btn flat dense round icon="cancel" color="negative" @click.stop="disapproveNomination(props.row)">
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
    
    <q-dialog v-model="showNominationDetailsDialog">
      <q-card style="width: 500px; max-width: 90vw;">
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
            <div class="detail-item" style="grid-column: 1 / -1;">
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
    <q-dialog v-model="showEditReasonDialog">
      <q-card style="width: 480px; max-width: 90vw;">
        <q-card-section class="dialog-header">
          <div class="section-title">Edit Nomination Reason</div>
          <div class="section-sub">{{ editingReasonRow?.full_name }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div>Reason</div>
          <q-input v-model="editReasonText" outlined type="textarea" autogrow dense
            placeholder="Reason for nominating..." :rules="[val => !!val?.trim() || 'Reason is required']" />
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat no-caps label="Cancel" v-close-popup />
          <q-btn unelevated no-caps label="Save" color="green" class="save-dialog-btn" :loading="employeeStore.loading"
            @click="saveEditedReason" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- import -->
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
import { useEmployeeInformationStore } from "src/stores/event/employee/employeeInformationStore";
export default defineComponent({
  name: "EventNominatedEmployeePage",
  components: { LoadingState, EmployeeInformationModal },

  setup() {
    const eventStore = useEventStore();
    const employeeInformationStore = useEmployeeInformationStore(); // 👈 idagdag
    const route = useRoute();
    const eventId = route.params.eventId;       // confirm this param exists on the route
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

    const showEmployeeModal = ref(false)
    const EmployeeInformation = ref({})
    const loadingEmployeeInfo = ref(false); // optional, para may loading state ang modal

    async function viewEmployeeInformation(row) {
      loadingEmployeeInfo.value = true;

      const result = await employeeInformationStore.fetchEmployeeInformation(row.nominated_employee_id);

      loadingEmployeeInfo.value = false;

      if (result.success) {
        EmployeeInformation.value = result.data; // 👈 galing na sa API response
        showEmployeeModal.value = true;
        
      } else {
        Swal.fire({
          title: "Failed",
          text: result.message || "Unable to fetch employee information.",
          icon: "error",
          scrollbarPadding: false,
        });
      }
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
      //   { name: "controlNo", label: "Control No.", field: "control_no", align: "left" },
      { name: "name", label: "Name", field: "full_name", align: "left" },
      { name: "designation", label: "Position", field: "designation", align: "left" },
      { name: "office", label: "Office", field: "office", align: "left" },
      { name: "status", label: "Status", field: "status", align: "left" },
      { name: "nominate_status", label: "Nominate status", field: "nominate_status", align: "center" },
      //   { name: "nominate_reason", label: "Reason", field: "nominate_reason", align: "left", style: "max-width: 200px" },
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

    async function loadNominatedEmployees() {
      loading.value = true;
      errorMessage.value = "";
      const result = await eventStore.fetchNominatedEmployee(eventId, scheduleId);
      if (result.success) {
        eventDetail.value = eventStore.nominated_employee;
      } else {
        errorMessage.value = result.message || "Failed to load schedule.";
      }
      loading.value = false;
    }

    
 
    onMounted(async () => {
      await loadNominatedEmployees();
    });

    async function approveNomination(row) {
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
        await loadNominatedEmployees();
      } else {
        Swal.fire({
          title: "Failed",
          text: res.message || "Unable to approve nomination.",
          icon: "error",
          scrollbarPadding: false,
        });
      }
    }

    async function disapproveNomination(row) {
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
        await loadNominatedEmployees();
      } else {
        Swal.fire({
          title: "Failed",
          text: res.message || "Unable to disapprove nomination.",
          icon: "error",
          scrollbarPadding: false,
        });
      }
    }


    return {
      loading,
      errorMessage,
      eventInfo,
      schedule,
      scheduleDates,
      offices,
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
      loadingEmployeeInfo
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
  color: #718089;
  font-size: 11px;
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
   DETAIL CARD (shared shell for all 3 sections)
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

.section-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #19354a;
  color: #ffffff;
  font-size: 12px;
  font-weight: 750;
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
   SECTION 1 — SCHEDULE DETAILS
========================================================= */

.detail-body {
  padding: 20px 22px;
}

.event-title-lg {
  margin: 0;
  color: #172431;
  font-size: 17px;
  font-weight: 750;
  line-height: 1.4;
}

.event-sub {
  margin-top: 4px;
  color: #94a3ab;
  font-size: 10.5px;
  font-style: italic;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
   COMPETENCY GROUPS — hiwalay na bawat category
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

/* LEADERSHIP — orange/amber */
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

/* =========================================================
   STATUS BADGE
========================================================= */
/* 
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.2px;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-created {
  color: #2b6cb0;
  background: #e7f0fb;
}

.status-up-coming {
  color: #b8860b;
  background: #fbf3df;
}

.status-ongoing {
  color: #087c42;
  background: #e1f7e7;
}

.status-completed {
  color: #5c6b73;
  background: #eef1f2;
}

.status-cancelled {
  color: #c73f3f;
  background: #fbe9e9;
} */

/* =========================================================
   SECTIONS 2 & 3 — TABLES
========================================================= */

.detail-table {
  box-shadow: none;
  padding: 0 12px;
}

.detail-table :deep(th) {
  height: 44px;
  /* color: #819097; */
  background: #ffffff;
  /* font-size: 9px; */
  /* font-weight: 700; */
  letter-spacing: 0.3px;
}

.detail-table :deep(td) {
  height: 56px;
  /* color: #425b68; */
  border-color: #edf1ef;
  /* font-size: 11px; */
}

/* =========================================================
   NOMINATION ACTIONS
========================================================= */

.nominate-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 20px;
  border-top: 1px solid #edf1ef;
}

.selected-count {
  color: #87949a;
  font-size: 11px;
}

.nominate-btn {
  min-height: 36px;
  padding: 0 20px;
  border-radius: 8px;
  color: #ffffff;
  background: linear-gradient(135deg, #18b64d, #0ca344);
  font-size: 11px;
  font-weight: 650;
}

.nomination-dialog {
  width: 100%;
  max-width: 90vw;
  border-radius: 13px;
}

.dialog-header {
  padding: 16px 20px;
}

.nomination-stepper {
  box-shadow: none;
}

.reason-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.reason-item {
  padding: 10px 0;
  border-bottom: 1px solid #edf1ef;
}

.reason-emp-name {
  font-size: 12.5px;
  font-weight: 700;
  color: #19354a;
  margin-bottom: 6px;
}

.reason-emp-office {
  font-weight: 400;
  color: #8a989e;
}

.trained-row {
  background: #fbe9e9;
}

.trained-row:hover {
  background: #f8dede;
}

.dialog-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 13px 20px;
  border-top: 1px solid #edf1ef;
}

/* .save-dialog-btn{
  color: #000;
} */
.reason-cell {
  cursor: help;
}

.reason-tooltip {
  font-size: 11px;
  line-height: 1.5;
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

@media (max-width: 650px) {
  .event-page {
    padding: 14px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
