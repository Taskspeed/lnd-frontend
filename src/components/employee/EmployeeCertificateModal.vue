<template>
  <q-dialog v-model="show" maximized-mobile>
    <q-card class="qs-modal">
      <q-card-section class="qs-header">
        <div class="qs-title">Employee list of Certificate</div>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-card-section>

      <div class="qs-body">
        <!-- LEFT PROFILE PANEL -->
        <div class="qs-profile-panel">
          <q-avatar square size="100px" class="qs-avatar">
            <img :src="employee.photo_url || 'https://cdn.quasar.dev/img/avatar.png'" />
          </q-avatar>

          <div class="qs-name">{{ employee.name }}</div>
          <div class="qs-designation">{{ employee.position }}</div>

          <q-badge class="qs-status-badge" :class="'status-' + (employee.status || '').toLowerCase()">
            {{ employee.status }}
          </q-badge>

          <q-separator class="qs-divider" />

          <div class="qs-info-list">
            <div class="qs-info-row">
              <span class="qs-info-label">Control No.</span>
              <span class="qs-info-value">{{ employee.ControlNo || employee.control_no || " " }}</span>
            </div>
          </div>
        </div>

        <!-- RIGHT CONTENT: CERTIFICATE LIST -->
        <div class="qs-content">
          <div class="qs-content-header">
            <div class="qs-section-title">Certificates</div>
          </div>

          <q-separator class="q-mb-md" />

          <div class="filter-row">
            <q-input v-model="search" outlined dense clearable placeholder="Search by title..." class="search-input"
              @update:model-value="onSearchInput">
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <q-table flat :rows="certificateStore.certificateList" :columns="columns" row-key="event_id"
            v-model:pagination="pagination" :loading="certificateStore.loadingCertificates" @request="onRequest"
            class="qs-table">
            <template #body-cell-certificate_issued="props">
              <q-td :props="props">
                <q-badge :class="props.row.certificate_issued ? 'status-approved' : 'status-pending'">
                  {{ props.row.certificate_issued ? 'Issued' : 'Not Issued' }}
                </q-badge>
              </q-td>
            </template>

            <template #body-cell-learning_intervention="props">
              <q-td :props="props">
                {{ props.row.learning_intervention || " " }}
              </q-td>
            </template>
            <template #body-cell-actions="props">
              <q-td :props="props">
                <div class="action-buttons">

                  <q-btn flat dense round icon="workspace_premium" color="blue"
                    :loading="isLoading(props.row.nominated_employee_id)" :disable="isAnyLoading()"
                    @click.stop="certificatePreview(props.row)">
                    <q-tooltip>View Details</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </template>

            <template #no-data>
              <div class="qs-empty">No certificates found.</div>
            </template>
          </q-table>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCertificationStore } from 'src/stores/administrator/certification/certificateStore'
import { useRowLoading } from 'src/composables/useRowLoading'

const props = defineProps({
  modelValue: Boolean,
  employeeData: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:modelValue'])

const certificateStore = useCertificationStore()
const { isLoading, isAnyLoading, run } = useRowLoading();

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const employee = computed(() => props.employeeData || {})

const search = ref('')
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

const columns = [
  { name: 'title_name', label: 'Training Title', field: 'title_name', align: 'left' },
  { name: 'learning_intervention', label: 'Learning Intervention', field: 'learning_intervention', align: 'left' },
  { name: 'type_name', label: 'Type', field: 'type_name', align: 'center' },
  // { name: 'certificate_issued', label: 'Certificate', field: 'certificate_issued', align: 'center' },
  { name: 'actions', label: 'Actions', field: 'action', align: 'center' },
]

async function loadCertificates() {
  const controlNo = employee.value.ControlNo || employee.value.control_no
  if (!controlNo) return

  const result = await certificateStore.fetchEmployeeListCertificate(controlNo, {
    page: pagination.value.page,
    per_page: pagination.value.rowsPerPage,
    search: search.value || undefined,
  })

  if (result.success) {
    pagination.value.rowsNumber = certificateStore.certificatePagination?.total ?? 0
  }
}

function onRequest(requestProp) {
  pagination.value.page = requestProp.pagination.page
  pagination.value.rowsPerPage = requestProp.pagination.rowsPerPage
  loadCertificates()
}

let searchTimeout = null
function onSearchInput() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1
    loadCertificates()
  }, 400)
}

async function certificatePreview(row) {
  return run(row.nominated_employee_id, async () => {
    const result = await certificateStore.fetchCertificate(row.nominated_employee_id);

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

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      search.value = ''
      pagination.value.page = 1
      loadCertificates()
    }
  }
)

</script>

<style scoped>
.qs-modal {
  width: 70%;
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
  min-height: 400px;
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
  margin-top: 20px;
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
</style>