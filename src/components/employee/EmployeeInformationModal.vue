<template>
  <q-dialog v-model="show" maximized-mobile>
    <q-card class="qs-modal">
      <!-- HEADER -->
      <q-card-section class="qs-header">
        <div>
          <div class="qs-title">Employee Information</div>
        </div>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-card-section>

      <div class="qs-body">
        <!-- LEFT PROFILE PANEL -->
        <div class="qs-profile-panel">
          <template v-if="loading">
            <q-spinner color="green" size="40px" />
          </template>
          <template v-else>
          <q-avatar square size="100px" class="qs-avatar">
          <q-spinner v-if="photoLoading" color="green" size="30px" />
          <img v-else :src="photoSrc || 'https://cdn.quasar.dev/img/avatar.png'" />
        </q-avatar>

            <div class="qs-name">{{ employee.full_name }}</div>
            <div class="qs-designation">{{ employee.designation }}</div>

            <q-badge class="qs-status-badge" :class="'status-' + (employee.status || '').toLowerCase()">
              {{ employee.status }}
            </q-badge>

            <q-separator class="qs-divider" />

            <div class="qs-info-list">
              <div class="qs-info-row">
                <span class="qs-info-label">Control No.</span>
                <span class="qs-info-value">{{ employee.control_no || " " }}</span>
              </div>
              <div class="qs-info-row">
                <span class="qs-info-label">Office</span>
                <span class="qs-info-value">{{ employee.office_abbr || " " }}</span>
              </div>
              <div class="qs-info-row">
                <span class="qs-info-label">SG</span>
                <span class="qs-info-value">{{ employee.sg ?? " " }}</span>
              </div>
              <div class="qs-info-row">
                <span class="qs-info-label">Level</span>
                <span class="qs-info-value">{{ employee.level ?? " " }}</span>
              </div>
            </div>

            <q-separator class="qs-divider" />

            <div class="qs-nomination-block">
              <div class="qs-info-label">Nomination Status</div>
              <q-badge class="qs-nominate-badge" :class="{
                'nominate-approved': employee.nominate_status === 'Approved',
                'nominate-disapproved': employee.nominate_status === 'Disapproved',
                'nominate-pending': employee.nominate_status === 'Pending',
              }">
                {{ employee.nominate_status || "Pending" }}
              </q-badge>
            </div>
          </template>
        </div>

        <!-- RIGHT CONTENT — TABS: FORM SUBMISSIONS / ATTENDANCE -->
        <div class="qs-content">
          <q-tabs v-model="activeTab" dense class="qs-tabs" active-color="primary" indicator-color="primary"
            align="left">
            <q-tab name="forms" label="Form Submissions" />
            <q-tab name="attendance" label="Attendance" />
          </q-tabs>

          <q-separator class="q-mb-md" />

          <q-tab-panels v-model="activeTab" animated class="qs-tab-panels">
            <!-- ================= FORM SUBMISSIONS TAB ================= -->
            <q-tab-panel name="forms" class="q-pa-none">
              <div class="qs-content-header">
                <div>
                  <div class="qs-section-title">Form Submissions</div>
                  <div class="qs-section-sub">L&D forms submitted by employee</div>
                </div>
              </div>

              <q-separator class="q-mb-md" />

              <q-table flat :rows="submissions" :columns="submissionColumns" row-key="employee_form_submission_id"
                :loading="loadingSubmissions" :rows-per-page-options="[0, 2, 10, 20]" class="qs-table">
                <template #body-cell-status="props">
                  <q-td :props="props">
                    <q-badge class="qs-status-pill" :class="{
                      'status-approved': props.row.status === 'Approved',
                      'status-returned': props.row.status === 'Returned',
                      'status-pending': props.row.status === 'Pending',
                    }">
                      {{ props.row.status }}
                    </q-badge>
                  </q-td>
                </template>

                <template #body-cell-remarks="props">
                  <q-td :props="props">
                    {{ props.row.remarks || " " }}
                  </q-td>
                </template>

                <template #body-cell-action="props">
                  <q-td :props="props">
                    <q-btn flat dense round icon="visibility" color="primary"
                      :loading="loadingFormData && activeRowId === props.row.employee_form_submission_id"
                      @click="openSubmission(props.row)">
                      <q-tooltip>View Submission</q-tooltip>
                    </q-btn>
                    <q-btn flat dense round icon="task_alt" color="positive" @click.stop="approved(props.row)">
                      <q-tooltip>Approved</q-tooltip>
                    </q-btn>

                    <q-btn flat dense round icon="cancel" color="negative" @click.stop="returned(props.row)">
                      <q-tooltip>Returned</q-tooltip>
                    </q-btn>
                  </q-td>
                </template>

                <template #no-data>
                  <div class="qs-empty">No form submissions found.</div>
                </template>
              </q-table>

              <q-separator class="qs-divider" />
              <div class="qs-info-label q-mt-md">Reason</div>
              <div class="qs-reason-text">{{ employee.nominate_reason || " " }}</div>
            </q-tab-panel>

            <!-- ================= ATTENDANCE TAB ================= -->
            <q-tab-panel name="attendance" class="q-pa-none">
              <div class="qs-content-header">
                <div>
                  <div class="qs-section-title">Attendance</div>
                  <div class="qs-section-sub">Scheduled vs. actual time-in / time-out per day</div>
                </div>
              </div>

              <q-separator class="q-mb-md" />

              <q-table flat :rows="attendance" :columns="attendanceColumns" row-key="schedule_date"
                :loading="loadingAttendance" :rows-per-page-options="[0, 5, 10, 20]" class="qs-table">
                <template #body-cell-status="props">
                  <q-td :props="props">
                    <q-badge class="qs-status-pill" :class="{
                      'status-approved': props.row.status === 'present',
                      'status-returned': props.row.status === 'absent',
                    }">
                      {{ props.row.status }}
                    </q-badge>
                  </q-td>
                </template>

                <template #body-cell-morning="props">
                  <q-td :props="props">
                    <div class="qs-time-cell">
                      <span class="qs-time-scheduled">{{ props.row.scheduled.morning_in }} – {{
                        props.row.scheduled.morning_out }}</span>
                      <span v-if="props.row.actual" class="qs-time-actual">
                        {{ props.row.actual.morning_in }} – {{ props.row.actual.morning_out }}
                      </span>
                      <span v-else class="qs-time-actual qs-time-none">—</span>
                    </div>
                  </q-td>
                </template>

                <template #body-cell-afternoon="props">
                  <q-td :props="props">
                    <div class="qs-time-cell">
                      <span class="qs-time-scheduled">{{ props.row.scheduled.afternoon_in }} – {{
                        props.row.scheduled.afternoon_out }}</span>
                      <span v-if="props.row.actual" class="qs-time-actual">
                        {{ props.row.actual.afternoon_in }} – {{ props.row.actual.afternoon_out }}
                      </span>
                      <span v-else class="qs-time-actual qs-time-none">—</span>
                    </div>
                  </q-td>
                </template>

                <template #body-cell-late="props">
                  <q-td :props="props">
                    <div class="qs-late-cell">
                      <q-badge v-if="props.row.is_late_morning" class="qs-late-pill">
                        AM +{{ props.row.late_minutes_morning }}m
                      </q-badge>
                      <q-badge v-if="props.row.is_late_afternoon" class="qs-late-pill">
                        PM +{{ props.row.late_minutes_afternoon }}m
                      </q-badge>
                      <span
                        v-if="props.row.status === 'present' && !props.row.is_late_morning && !props.row.is_late_afternoon"
                        class="qs-ontime-pill">
                        On time
                      </span>
                    </div>
                  </q-td>
                </template>
                <template #body-cell-action="props">
                    <q-td :props="props">
                     <q-btn dense unelevated no-caps color="positive" label="Present"
                        class="present-btn" @click.stop="present(props.row)" />
                    </q-td>
                  </template>

                <template #no-data>
                  <div class="qs-empty">No attendance records found.</div>
                </template>
              </q-table>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>
    </q-card>

    <!-- Dynamic form-view modal — resolved based on the clicked row's form_name -->
    <component :is="activeFormComponent" v-if="activeFormComponent" v-model="showFormModal" :form-data="activeFormData"
      :submission="activeSubmission" readonly />
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch} from 'vue'
import { useEmployeeInformationStore } from 'src/stores/administrator/employee/employeeInformationStore'
import { getFormModalComponent } from 'src/composables/useFormsModal'
import Swal from 'sweetalert2'
import { useEmployeeImage } from 'src/composables/useEmployeeImage'
import { useAttendanceStore } from 'src/stores/administrator/attendance/attendanceStore'

const props = defineProps({
  modelValue: Boolean,
  employeeData: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'view-submission'])

const employeeInformationStore = useEmployeeInformationStore()
const attendanceStore = useAttendanceStore()

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const employee = computed(() => props.employeeData || {})

// --- Tabs ---
const activeTab = ref('forms')

// --- Form submissions state ---
const submissions = ref([])
const loadingSubmissions = ref(false)

// --- Attendance state ---
const attendance = ref([])
const loadingAttendance = ref(false)

// --- Dynamic form-view state ---
const activeFormComponent = ref(null)
const activeFormData = ref(null)
const activeSubmission = ref(null)
const showFormModal = ref(false)
const loadingFormData = ref(false)
const activeRowId = ref(null)

const submissionColumns = [
  { name: 'form_name', label: 'Form', field: 'form_name', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'submitted_at', label: 'Submitted', field: 'submitted_at', align: 'center' },
  { name: 'action', label: 'Action', field: 'action', align: 'center' },
]

const attendanceColumns = [
  { name: 'schedule_date', label: 'Date', field: 'schedule_date', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'morning', label: 'Morning (Sched / Actual)', field: 'morning', align: 'left' },
  { name: 'afternoon', label: 'Afternoon (Sched / Actual)', field: 'afternoon', align: 'left' },
  { name: 'late', label: 'Status', field: 'late', align: 'center' },
  { name: 'action', label: 'Action', field: 'action', align: 'center' },
]

async function loadSubmissions() {
  if (!employee.value.control_no || !employee.value.event_id || !employee.value.event_schedule_id) {
    submissions.value = []
    return
  }

  loadingSubmissions.value = true

  const result = await employeeInformationStore.fetchEmployeeSubmissionForms(
    employee.value.control_no,
    employee.value.event_id,
    employee.value.event_schedule_id
  )

  if (result.success) {
    submissions.value = result.data || []
  } else {
    submissions.value = []
  }

  loadingSubmissions.value = false
}

async function loadAttendance() {
  // Palitan mo ang employee.value.id kung ibang field pala ang tamang
  // nominated_employee_id sa employeeData mo (hal. employee.value.nominated_employee_id)
  // if (!employee.value.id) {
  //   attendance.value = []
  //   return
  // }

  loadingAttendance.value = true

  const result = await employeeInformationStore.fetchEmployeeAttendance(employee.value.nominated_employee_id)

  if (result.success) {
    attendance.value = result.data?.attendance_summary || []
  } else {
    attendance.value = []
  }

  loadingAttendance.value = false
}

async function openSubmission(row) {
  // 1. Alamin kung anong modal ang tugma sa form_name ng row na ito
  const component = getFormModalComponent(row.form_name)

  if (!component) {
    // Walang naka-map na modal para dito — i-log lang, wag basta mag-open ng LAP
    console.warn(`No modal registered for form_name: "${row.form_name}"`)
    emit('view-submission', row)
    return
  }

  activeRowId.value = row.employee_form_submission_id
  loadingFormData.value = true

  // 2. Kunin ang aktwal na sagot ng employee para sa form na ito, sa pamamagitan ng store
  const result = await employeeInformationStore.fetchEmployeeViewFormSubmission(
    employee.value.control_no,
    row.form_name,
    employee.value.event_schedule_id
  )

  if (result.success) {
    // 3. I-set ang component + data, saka pa lang buksan ang modal
    activeFormData.value = result.data?.form_data || null
    activeSubmission.value = result.data?.submission || null   // 👈 idagdag
    activeFormComponent.value = component

    showFormModal.value = true
  } else {
    console.error('Failed to load form submission:', result.message)
  }

  loadingFormData.value = false
  // emit('view-submission', row)
}
async function approved(row) {
  const result = await Swal.fire({
    title: "Approve Form Submission",
    text: `Approve "${row.form_name}" submitted by ${employee.value.full_name}?`,
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

  const res = await employeeInformationStore.approvalEmployeeFormSubmission(
    row.employee_form_submission_id, // ID ng specific form submission na ito, hindi ng buong nomination
    { status: "Approved" }
  );

  if (res.success) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Form submission approved.",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      scrollbarPadding: false,

    });
    await loadSubmissions();
  } else {
    Swal.fire({
      title: "Failed",
      text: res.message || "Unable to approve this form submission.",
      icon: "error",
      scrollbarPadding: false,

    });
  }
}

async function returned(row) {
  const result = await Swal.fire({
    title: "Return Form Submission",
    text: `Return "${row.form_name}" submitted by ${employee.value.full_name}?`,
    icon: "warning",

    input: "textarea",
    inputLabel: "Reason for return",
    inputPlaceholder: "Ilagay ang dahilan ng pagbalik...",
    inputAttributes: {
      "aria-label": "Reason for return",
      autocapitalize: "off",
      autocorrect: "off",
    },

    showCancelButton: true,
    confirmButtonText: "Return",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#d83d3d",
    cancelButtonColor: "#9e9e9e",
    reverseButtons: true,

    scrollbarPadding: false,
    heightAuto: false,

    didOpen: () => {
      const textarea = Swal.getInput();

      if (textarea) {
        textarea.focus();
      }
    },

    inputValidator: (value) => {
      if (!value || !value.trim()) {
        return "Kailangan ng remarks bago i-return.";
      }

      return undefined;
    },
  });

  if (!result.isConfirmed) return;

  const res = await employeeInformationStore.approvalEmployeeFormSubmission(
    row.employee_form_submission_id,
    {
      status: "Returned",
      remarks: result.value.trim(),
    }
  );

  if (res.success) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Form submission returned.",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      scrollbarPadding: false,
    });

    await loadSubmissions();
  } else {
    Swal.fire({
      title: "Failed",
      text: res.message || "Unable to return this form submission.",
      icon: "error",
      scrollbarPadding: false,
    });
  }
}

const { src: photoSrc, loading: photoLoading } = useEmployeeImage(
  () => employee.value.photo_url
)

// gawing HH:mm:ss ang oras (hal. "08:00" -> "08:00:00")
function toTime(value) {
  if (!value) return null

  const match = String(value).trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])?$/)
  if (!match) return null

  let hours = parseInt(match[1], 10)
  const minutes = match[2]
  const seconds = match[3] ?? '00'
  const meridiem = match[4]?.toLowerCase()

  if (meridiem === 'pm' && hours < 12) hours += 12
  if (meridiem === 'am' && hours === 12) hours = 0

  return `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`
}
async function present(row) {
  const result = await Swal.fire({
    title: 'Mark as Present',
    text: `Are you sure you want to mark ${employee.value.full_name} as present on ${row.schedule_date}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, present',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#18b64d',
    cancelButtonColor: '#9e9e9e',
    reverseButtons: true,
    scrollbarPadding: false,
    heightAuto: false,
  })

  if (!result.isConfirmed) return

  const payload = {
    nominated_employee_id: employee.value.nominated_employee_id,
    scan_date: row.schedule_date,
    morning_in: toTime(row.scheduled.morning_in),
    morning_out: toTime(row.scheduled.morning_out),
    afternoon_in: toTime(row.scheduled.afternoon_in),
    afternoon_out: toTime(row.scheduled.afternoon_out),
  }

  const res = await attendanceStore.storeAttendance(payload)

  if (res.success) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: res.message || 'Marked as present.',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      scrollbarPadding: false,
    })

    await loadAttendance()
  } else {
    Swal.fire({
      title: 'Failed',
      text: res.message || 'Unable to mark as present.',
      icon: 'error',
      scrollbarPadding: false,
    })
  }
}

// Kapag nagbukas ang modal (o nagbago ang employee), i-fetch ang parehong tabs' data
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      activeTab.value = 'forms'
      loadSubmissions()
      loadAttendance()
    }
  }
)
</script>

<style scoped>
.qs-modal {
  width: 100%;
  max-width: 95vw;
  border-radius: 10px;
  overflow: hidden;
}

.qs-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 20px;
  background: #f5f6f7;
  border-bottom: 1px solid #e6e9ea;
}

.qs-title {
  font-size: 17px;
  font-weight: 750;
  color: #1a1a1a;
}

.qs-body {
  display: flex;
  min-height: 500px;
}

.qs-profile-panel {
  width: 280px;
  flex-shrink: 0;
  padding: 28px 20px;
  border-right: 1px solid #eef1ef;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: #fafcfb;
}

.qs-avatar {
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.qs-name {
  font-size: 14px;
  font-weight: 750;
  color: #1a1a1a;
  line-height: 1.3;
}

.qs-designation {
  margin-top: 3px;
  font-size: 11px;
  color: #000000;
  line-height: 1.5;
  font-weight: 480;
}

.qs-status-badge {
  margin-top: 10px;
  padding: 4px 14px;
  border-radius: 14px;
  background: #2e9e4f;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.qs-divider {
  width: 100%;
  margin: 18px 0;
}

.qs-info-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.qs-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
}

.qs-info-label {
  font-size: 11px;
  font-weight: 700;
  color: #0f1314;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.qs-info-value {
  font-size: 12px;
  font-weight: 650;
  color: #1a1a1a;
  text-align: right;
}

.qs-nomination-block {
  width: 100%;
  text-align: left;
}

.qs-nominate-badge {
  margin-top: 6px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.nominate-approved {
  background: #e1f7e7;
  color: #087c42;
}

.nominate-disapproved {
  background: #fbe9e9;
  color: #c73f3f;
}

.nominate-pending {
  background: #fbf3df;
  color: #b8860b;
}

.qs-reason-text {
  margin-top: 4px;
  font-size: 12px;
  color: #000000;
  line-height: 1.5;
  font-weight: 480;
}

.qs-content {
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;
}

.qs-tabs {
  min-height: 32px;
}

.qs-tab-panels {
  background: transparent;
}

.qs-content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.qs-section-title {
  font-size: 14px;
  font-weight: 750;
  color: #1a1a1a;
}

.qs-section-sub {
  margin-top: 2px;
  font-size: 11px;
  color: #8a989e;
}

.qs-table {
  box-shadow: none;
}

.qs-table :deep(th) {
  font-size: 11px;
  font-weight: 700;
  color: #1a1a1a;
  background: #fafcfb;
}

.qs-table :deep(td) {
  font-size: 11px;
  color: #000000;
  font-weight: 600;
}

.qs-status-pill {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.status-approved {
  background: #e1f7e7;
  color: #087c42;
}

.status-returned {
  background: #fbe9e9;
  color: #c73f3f;
}

.status-pending {
  background: #fbf3df;
  color: #b8860b;
}

.qs-time-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.qs-time-scheduled {
  color: #8a989e;
  font-size: 10.5px;
}

.qs-time-actual {
  color: #1a1a1a;
  font-weight: 700;
}

.qs-time-none {
  color: #c73f3f;
  font-weight: 600;
}

.qs-late-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.qs-late-pill {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  background: #fbe9e9;
  color: #c73f3f;
}

.qs-ontime-pill {
  font-size: 10px;
  font-weight: 700;
  color: #087c42;
}

.qs-empty {
  padding: 40px 0;
  text-align: center;
  color: #9aa5aa;
  font-size: 12px;
}
.present-btn {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  min-height: 24px;
  border-radius: 4px;
}
</style>