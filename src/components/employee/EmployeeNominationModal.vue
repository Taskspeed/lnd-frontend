<template>
  <q-dialog v-model="show" maximized-mobile>
    <q-card class="qs-modal">
      <!-- HEADER -->
      <q-card-section class="qs-header">
        <div class="qs-title">Employee Nomination</div>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-card-section>

      <q-card-section class="qs-content">
        <div v-if="loading" class="qs-loading">
          <q-spinner color="green" size="40px" />
        </div>

        <template v-else>
          <!-- TOP: 2 COLUMNS -->
          <div class="qs-top">
            <!-- LEFT: PROFILE -->
            <div class="qs-col qs-profile">
              <q-avatar square size="110px" class="qs-avatar">
                <q-spinner v-if="photoLoading" color="green" size="30px" />
                <img v-else :src="photoSrc || 'https://cdn.quasar.dev/img/avatar.png'" />
              </q-avatar>

              <div class="qs-name">{{ employee.full_name }}</div>
              <div class="qs-designation">{{ employee.designation }}</div>

              <q-badge class="qs-status-badge">
                {{ employee.status }}
              </q-badge>
            </div>

            <!-- RIGHT: INFO -->
            <div class="qs-col qs-info-list">
              <div class="qs-info-row">
                <span class="qs-info-label">Control No.</span>
                <span class="qs-info-value">{{ employee.control_no || "—" }}</span>
              </div>
              <div class="qs-info-row">
                <span class="qs-info-label">Office</span>
                <span class="qs-info-value">{{ employee.office_abbr || "—" }}</span>
              </div>
              <div class="qs-info-row">
                <span class="qs-info-label">SG</span>
                <span class="qs-info-value">{{ employee.sg ?? "—" }}</span>
              </div>
              <div class="qs-info-row">
                <span class="qs-info-label">Level</span>
                <span class="qs-info-value">{{ employee.level ?? "—" }}</span>
              </div>
              <div class="qs-info-row">
                <span class="qs-info-label">Nomination</span>
                <q-badge class="qs-nominate-badge" :class="nominateClass">
                  {{ employee.nominate_status || "Pending" }}
                </q-badge>
              </div>
            </div>
          </div>

          <!-- BOTTOM: REASON (FULL WIDTH) -->
          <div class="qs-reason-block">
            <div class="qs-info-label">Reason</div>
            <div class="qs-reason-box">
              <div class="qs-reason-text">{{ employee.nominate_reason || "—" }}</div>
            </div>
          </div>
        </template>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useEmployeeImage } from 'src/composables/useEmployeeImage'

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

const emit = defineEmits(['update:modelValue'])

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const employee = computed(() => props.employeeData || {})

const nominateClass = computed(() => {
  switch (employee.value.nominate_status) {
    case 'Approved':
      return 'nominate-approved'
    case 'Disapproved':
      return 'nominate-disapproved'
    default:
      return 'nominate-pending'
  }
})

const { src: photoSrc, loading: photoLoading } = useEmployeeImage(
  () => employee.value.photo_url
)
</script>

<style scoped>
.qs-modal {
  width: 100%;
  max-width: 720px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
}

.qs-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: #f5f6f7;
  border-bottom: 1px solid #e6e9ea;
}

.qs-title {
  font-size: 16px;
  font-weight: 750;
  color: #1a1a1a;
}

.qs-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px;
  background: #fafcfb;
}

.qs-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

/* TOP: 2 columns */
.qs-top {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.qs-col {
  min-width: 0;
  padding: 18px;
  border: 1px solid #e6ebee;
  border-radius: 12px;
  background: #ffffff;
}

/* LEFT: profile */
.qs-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.qs-avatar {
  flex-shrink: 0;
  margin-bottom: 14px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.qs-name {
  font-size: 15px;
  font-weight: 750;
  line-height: 1.3;
  color: #1a1a1a;
  overflow-wrap: anywhere;
}

.qs-designation {
  margin-top: 3px;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.5;
  color: #4a5a63;
  overflow-wrap: anywhere;
}

.qs-status-badge {
  margin-top: 10px;
  padding: 4px 14px;
  border-radius: 14px;
  background: #2e9e4f;
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

/* RIGHT: info rows */
.qs-info-list {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
}

.qs-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #e6ebee;
  text-align: left;
}

.qs-info-row:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.qs-info-label {
  flex-shrink: 0;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: #6b7a82;
}

.qs-info-value {
  min-width: 0;
  font-size: 12px;
  font-weight: 650;
  text-align: right;
  color: #1a1a1a;
  overflow-wrap: anywhere;
}

.qs-nominate-badge {
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

/* BOTTOM: reason, full width */
.qs-reason-block {
  margin-top: 14px;
  padding: 16px 18px;
  border: 1px solid #e6ebee;
  border-radius: 12px;
  background: #ffffff;
  text-align: left;
}

.qs-reason-box {
  margin-top: 8px;
  max-height: 120px;
  overflow-y: auto;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f8fafb;
}

.qs-reason-text {
  font-size: 12px;
  font-weight: 500;
  line-height: 1.55;
  color: #1a1a1a;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

/* MOBILE: stack columns */
@media (max-width: 600px) {
  .qs-top {
    grid-template-columns: 1fr;
  }
}
</style>