<template>
  <q-dialog v-model="show" maximized-mobile>
    <q-card class="lamr-modal">
      <!-- HEADER -->
      <q-card-section class="lamr-header">
        <img src="/public/image/header.png" alt="" class="lamr-header-img" />
        <q-btn flat round dense icon="close" v-close-popup class="lamr-close-btn" />
      </q-card-section>

      <q-card-section class="lamr-body">
        <div class="lamr-title">Learning Application Monitoring Report</div>

        <div v-if="submission?.status === 'Returned'" class="lap-remarks-box">
          <div class="lap-remarks-label">Remarks (Returned):</div>
          <div class="lap-remarks-text">{{ submission.remarks }}</div>
        </div>

        <!-- BASIC INFO -->
        <div class="lamr-field-row">
          <span class="lamr-field-label">Learner:</span>
          <span class="lamr-field-line">{{ learner }}</span>
        </div>
        <div class="lamr-field-row">
          <span class="lamr-field-label">L&amp;D Attended:</span>
          <span class="lamr-field-line">{{ lndAttended }}</span>
        </div>
        <div class="lamr-field-row">
          <span class="lamr-field-label">Date of Attendance:</span>
          <span class="lamr-field-line">{{ dateOfAttendance }}</span>
        </div>
        <div class="lamr-field-row">
          <span class="lamr-field-label">Competency Developed/Acquired:</span>
          <span class="lamr-field-line">{{ competencyDeveloped }}</span>
        </div>

        <!-- COMPETENCY AREAS AND PROFICIENCY LEVELS -->
        <div class="lamr-section-label">Competency Areas and Proficiency Levels</div>
        <div class="lamr-grid-3">
          <div class="lamr-box">
            <div class="lamr-box-title">Core Areas</div>
            <q-checkbox dense :disable="readonly" v-model="coreAreas" val="Delivering Service Excellence"
              label="Delivering Service Excellence" />
            <q-checkbox dense :disable="readonly" v-model="coreAreas" val="Exemplifying Integrity"
              label="Exemplifying Integrity" />
            <q-checkbox dense :disable="readonly" v-model="coreAreas" val="Interpersonal Skills"
              label="Interpersonal Skills" />
          </div>
          <div class="lamr-box">
            <div class="lamr-box-title">Technical Areas</div>
            <q-checkbox dense :disable="readonly" v-model="technicalAreas" val="Planning and Organizing"
              label="Planning &amp; Organizing" />
            <q-checkbox dense :disable="readonly" v-model="technicalAreas" val="Monitoring and Evaluation"
              label="Monitoring &amp; Evaluation" />
            <q-checkbox dense :disable="readonly" v-model="technicalAreas" val="Records Management"
              label="Records Management" />
            <q-checkbox dense :disable="readonly" v-model="technicalAreas" val="Partnering and Networking"
              label="Partnering &amp; Networking" />
            <q-checkbox dense :disable="readonly" v-model="technicalAreas" val="Process Management"
              label="Process Management" />
          </div>
          <div class="lamr-box">
            <div class="lamr-box-title">Leadership Areas</div>
            <q-checkbox dense :disable="readonly" v-model="leadershipAreas" val="Thinking Strategically and Creativity"
              label="Thinking Strategically and Creativity" />
            <q-checkbox dense :disable="readonly" v-model="leadershipAreas" val="Problem Solving and Decision Making"
              label="Problem Solving &amp; Decision Making" />
            <q-checkbox dense :disable="readonly" v-model="leadershipAreas"
              val="Building Collaborative and Inclusive Working Relationships"
              label="Building Collaborative &amp; Inclusive Working Relationships" />
            <q-checkbox dense :disable="readonly" v-model="leadershipAreas"
              val="Managing Performance and Coaching for Results"
              label="Managing Performance &amp; Coaching for Results" />
          </div>
        </div>

        <!-- MONITORING FIELDS -->
        <div class="lamr-box lamr-box-full">
          <div class="lamr-box-title lamr-box-title-left">Goals</div>
          <q-input dense borderless :readonly="readonly" type="textarea" v-model="goals" rows="2"
            class="lamr-textarea" />
        </div>
        <div class="lamr-box lamr-box-full">
          <div class="lamr-box-title lamr-box-title-left">Key Performance Indicator</div>
          <q-input dense borderless :readonly="readonly" type="textarea" v-model="kpi" rows="2" class="lamr-textarea" />
        </div>
        <div class="lamr-box lamr-box-full">
          <div class="lamr-box-title lamr-box-title-left">Learning Strategies Applied</div>
          <q-input dense borderless :readonly="readonly" type="textarea" v-model="strategiesApplied" rows="2"
            class="lamr-textarea" />
        </div>
        <div class="lamr-box lamr-box-full">
          <div class="lamr-box-title lamr-box-title-left">Required Resources</div>
          <q-input dense borderless :readonly="readonly" type="textarea" v-model="requiredResources" rows="2"
            class="lamr-textarea" />
        </div>
        <div class="lamr-box lamr-box-full">
          <div class="lamr-box-title lamr-box-title-left">Target Date of Completion</div>
          <q-input dense borderless :readonly="readonly" v-model="targetDate" class="lamr-textarea" />
        </div>

        <!-- STATUS UPDATES -->
        <div v-for="(status, index) in statusUpdates" :key="index" class="lamr-box lamr-box-full">
          <div class="lamr-status-row">
            <span class="lamr-box-title lamr-box-title-left lamr-status-label">Status as of</span>
            <!-- <q-input dense borderless :readonly="readonly" v-model="status.date" class="lamr-status-date" /> -->
          </div>
          <q-input dense borderless :readonly="readonly" type="textarea" v-model="status.notes" rows="2"
            class="lamr-textarea" />
        </div>
        <div v-if="!readonly" class="lamr-add-status">
          <q-btn flat dense size="sm" icon="add" label="Add status update" color="primary" @click="addStatusUpdate" />
        </div>

        <!-- REMARKS -->
        <div class="lamr-box lamr-box-full">
          <div class="lamr-box-title lamr-box-title-left">Remarks</div>
          <q-input dense borderless :readonly="readonly" type="textarea" v-model="remarks" rows="3"
            class="lamr-textarea" />
        </div>

        <!-- SIGNATURES -->
        <div class="lamr-signature-grid">
          <div class="lamr-sig-col">
            <div class="lamr-sig-line"></div>
            <div class="lamr-sig-caption">Immediate Supervisor</div>
          </div>
          <div class="lamr-sig-col">
            <div class="lamr-sig-line"></div>
            <div class="lamr-sig-caption">Head of Office</div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="lamr-footer">
        <q-btn flat label="Close" color="grey-8" v-close-popup />
        <q-btn v-if="!readonly" unelevated label="Save" color="primary" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  // Buong `form_data` object galing sa GET /event/employee/form(s) response
  formData: {
    type: Object,
    default: null,
  },
    submission: {                 // 👈 bagong prop
    type: Object,
    default: null,
  },
  // true kapag "view submission" lang — hindi na pwedeng i-edit
  readonly: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['update:modelValue'])

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// Basic info
const learner = ref('')
const lndAttended = ref('')
const dateOfAttendance = ref('')
const competencyDeveloped = ref('')

const coreAreas = ref([])
const technicalAreas = ref([])
const leadershipAreas = ref([])

const goals = ref('')
const kpi = ref('')
const strategiesApplied = ref('')
const requiredResources = ref('')
const targetDate = ref('')
const remarks = ref('')

// Template has 2 "Status as of ___" blocks by default; dagdag pwede via addStatusUpdate
const statusUpdates = reactive([
  { date: '', notes: '' },
  { date: '', notes: '' },
])

function addStatusUpdate() {
  statusUpdates.push({ date: '', notes: '' })
}

// --- Mapping: DB relation key -> checkbox label ---
const CORE_KEYS = {
  delivering_service_excellence: 'Delivering Service Excellence',
  exemplifying_integrity: 'Exemplifying Integrity',
  interpersonal_skills: 'Interpersonal Skills',
}
const TECHNICAL_KEYS = {
  planning_organizing: 'Planning and Organizing',
  monitoring_evaluation: 'Monitoring and Evaluation',
  records_management: 'Records Management',
  partnering_networking: 'Partnering and Networking',
  process_management: 'Process Management',
}
const LEADERSHIP_KEYS = {
  thinking_strategically_creatively: 'Thinking Strategically and Creativity',
  problem_solving_decision_making: 'Problem Solving and Decision Making',
  building_collaborative_inclusive_working_relationships:
    'Building Collaborative and Inclusive Working Relationships',
  managing_performance_coaching_results: 'Managing Performance and Coaching for Results',
}

function isChecked(val) {
  return val === true || val === '1' || val === 1
}

function toCheckedList(group, keyLabelMap) {
  if (!group) return []
  return Object.entries(keyLabelMap)
    .filter(([key]) => isChecked(group[key]))
    .map(([, label]) => label)
}

function resetForm() {
  learner.value = ''
  lndAttended.value = ''
  dateOfAttendance.value = ''
  competencyDeveloped.value = ''
  coreAreas.value = []
  technicalAreas.value = []
  leadershipAreas.value = []
  goals.value = ''
  kpi.value = ''
  strategiesApplied.value = ''
  requiredResources.value = ''
  targetDate.value = ''
  remarks.value = ''
  statusUpdates.splice(0, statusUpdates.length, { date: '', notes: '' }, { date: '', notes: '' })
}

function populateFromFormData(data) {
  if (!data) {
    resetForm()
    return
  }

  learner.value = data.learner || ''
  lndAttended.value = data.lnd_attended || ''
  dateOfAttendance.value = data.date_of_attendance || ''
  competencyDeveloped.value = data.competency_developed_acquired || ''

  coreAreas.value = toCheckedList(data.core_monitoring, CORE_KEYS)
  technicalAreas.value = toCheckedList(data.technical_monitoring, TECHNICAL_KEYS)
  leadershipAreas.value = toCheckedList(data.leader_ship_monitoring, LEADERSHIP_KEYS)

  goals.value = data.goals || ''
  kpi.value = data.performance_indicator || ''
  strategiesApplied.value = data.learning_strategies_applied || ''
  requiredResources.value = data.required_resources || ''
  targetDate.value = data.target_date_completion || ''
  remarks.value = data.remarks || ''

  // NOTE: "status_as_of_v1/v2" ay text lang sa response na ito, walang hiwalay na
  // date field. I-populate muna sa "notes"; i-adjust kung may hiwalay palang date column.
  statusUpdates.splice(
    0,
    statusUpdates.length,
    { date: '', notes: data.status_as_of_v1 || '' },
    { date: '', notes: data.status_as_of_v2 || '' }
  )
}

watch(() => props.formData, populateFromFormData, { immediate: true })
</script>

<style scoped>
.lamr-modal {
  width: 100%;
  max-width: 850px;
  border-radius: 10px;
  overflow: hidden;
}

.lamr-header {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 0;
  background: #fff;
  position: relative;
}

.lamr-header-img {
  width: 100%;
  height: auto;
  display: block;
}

.lamr-close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.lamr-body {
  max-height: 70vh;
  overflow-y: auto;
  padding: 20px 24px;
}

.lamr-title {
  text-align: center;
  font-weight: 750;
  font-size: 15px;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.lamr-field-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 10px;
}

.lamr-field-label {
  font-size: 12px;
  font-weight: 650;
  color: #1a1a1a;
  white-space: nowrap;
}

.lamr-field-line {
  flex: 1;
  border-bottom: 1px solid #333;
  height: 16px;
  font-size: 12px;
  color: #1a1a1a;
}

.lamr-section-label {
  font-size: 12px;
  font-weight: 700;
  margin: 10px 0 8px;
  color: #1a1a1a;
  text-align: center;
}

.lamr-grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.lamr-box {
  border: 1px solid #333;
  border-radius: 4px;
  padding: 10px 12px;
}

.lamr-box-full {
  margin-bottom: 10px;
}

.lamr-box-title {
  font-size: 11px;
  font-weight: 750;
  text-align: center;
  margin-bottom: 8px;
  color: #1a1a1a;
}

.lamr-box-title-left {
  text-align: left;
}

.lamr-box :deep(.q-checkbox) {
  display: flex;
  font-size: 12px;
  margin-bottom: 2px;
}

.lamr-box :deep(.q-checkbox__label) {
  font-size: 12px;
}

.lamr-textarea :deep(textarea),
.lamr-textarea :deep(input) {
  font-size: 12px;
}

.lamr-status-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.lamr-status-label {
  margin-bottom: 0;
  white-space: nowrap;
}

.lamr-status-date {
  flex: 1;
  border-bottom: 1px solid #333;
}

.lamr-add-status {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 14px;
}

.lamr-signature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-top: 30px;
  text-align: center;
}

.lamr-sig-line {
  border-bottom: 1px solid #333;
  height: 24px;
}

.lamr-sig-caption {
  font-size: 11px;
  font-weight: 650;
  margin-top: 4px;
  color: #1a1a1a;
}

.lamr-footer {
  border-top: 1px solid #e6e9ea;
  padding: 10px 16px;
}

.lap-remarks-box {
  border: 1px solid #d83d3d;
  background: #fdecec;
  border-radius: 4px;
  padding: 10px 12px;
  margin-bottom: 14px;
}

.lap-remarks-label {
  font-size: 11px;
  font-weight: 750;
  color: #c73f3f;
  margin-bottom: 4px;
}

.lap-remarks-text {
  font-size: 12px;
  color: #1a1a1a;
}
</style>