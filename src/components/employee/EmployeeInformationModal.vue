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
              <img :src="employee.photo_url || 'https://cdn.quasar.dev/img/avatar.png'" />
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
              <q-badge
                class="qs-nominate-badge"
                :class="{
                  'nominate-approved': employee.nominate_status === 'Approved',
                  'nominate-disapproved': employee.nominate_status === 'Disapproved',
                  'nominate-pending': employee.nominate_status === 'Pending',
                }"
              >
                {{ employee.nominate_status || "Pending" }}
              </q-badge>
            </div>
          </template>
        </div>

        <!-- RIGHT CONTENT — SUBMISSIONS -->
        <div class="qs-content">
          <div class="qs-content-header">
            <div>
              <div class="qs-section-title">Form Submissions</div>
              <div class="qs-section-sub">L&D forms submitted by employee</div>
            </div>
          </div>

          <q-separator class="q-mb-md" />

          <q-table
            flat
            :rows="submissions"
            :columns="submissionColumns"
            row-key="employee_form_submission_id"
            :loading="loadingSubmissions"
            :rows-per-page-options="[0,2,10,20]"
            class="qs-table"
          >
            <template #body-cell-status="props">
              <q-td :props="props">
                <q-badge
                  class="qs-status-pill"
                  :class="{
                    'status-approved': props.row.status === 'Approved',
                    'status-returned': props.row.status === 'Returned',
                    'status-pending': props.row.status === 'Pending',
                  }"
                >
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
                <q-btn
                  flat
                  dense
                  round
                  icon="visibility"
                  color="primary"
                  :loading="loadingFormData && activeRowId === props.row.employee_form_submission_id"
                  @click="openSubmission(props.row)"
                >
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
        </div>
      </div>
    </q-card>

    <!-- Dynamic form-view modal — resolved based on the clicked row's form_name -->
    <component
      :is="activeFormComponent"
      v-if="activeFormComponent"
      v-model="showFormModal"
      :form-data="activeFormData"
      :submission="activeSubmission"
      readonly
    />
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useEmployeeInformationStore } from 'src/stores/event/employee/employeeInformationStore'
import { getFormModalComponent } from 'src/composables/useFormsModal'
import Swal from 'sweetalert2'

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

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const employee = computed(() => props.employeeData || {})


const submissions = ref([])
const loadingSubmissions = ref(false)

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
  emit('view-submission', row)
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



// Kapag nagbukas ang modal (o nagbago ang employee), i-fetch ang submissions
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      loadSubmissions()
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
.nominate-approved { background: #e1f7e7; color: #087c42; }
.nominate-disapproved { background: #fbe9e9; color: #c73f3f; }
.nominate-pending { background: #fbf3df; color: #b8860b; }

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
.status-approved { background: #e1f7e7; color: #087c42; }
.status-returned { background: #fbe9e9; color: #c73f3f; }
.status-pending { background: #fbf3df; color: #b8860b; }

.qs-empty {
  padding: 40px 0;
  text-align: center;
  color: #9aa5aa;
  font-size: 12px;
}
</style>