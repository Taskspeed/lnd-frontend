<template>
  <q-dialog v-model="show" maximized-mobile>
    <q-card class="lpr-modal">
      <!-- HEADER -->
      <q-card-section class="lpr-header">
        <img src="/public/image/header.png" alt="" class="lpr-header-img" />
        <q-btn flat round dense icon="close" v-close-popup class="lpr-close-btn" />
      </q-card-section>

      <q-card-section class="lpr-body">
        <div class="lpr-title">Learner's Progress Report</div>
        <div v-if="submission?.status === 'Returned'" class="lap-remarks-box">
          <div class="lap-remarks-label">Remarks (Returned):</div>
          <div class="lap-remarks-text">{{ submission.remarks }}</div>
        </div>

        <!-- BASIC INFO -->
        <div class="lpr-field-row">
          <span class="lpr-field-label">Learner:</span>
          <span class="lpr-field-line">{{ learner }}</span>
        </div>
        <div class="lpr-field-row">
          <span class="lpr-field-label">L&amp;D Attended:</span>
          <span class="lpr-field-line">{{ lndAttended }}</span>
        </div>
        <div class="lpr-field-row">
          <span class="lpr-field-label">Date of Attendance:</span>
          <span class="lpr-field-line">{{ dateOfAttendance }}</span>
        </div>

        <p class="lpr-intro">
          As a result of the training/seminar, the learner manifested improvement in the following
          areas: (As indicated in Learning Application Plan (LAP)).
        </p>

        <!-- COMPETENCY AREAS AND PROFICIENCY LEVELS -->
        <div class="lpr-section-label">Competency Areas and Proficiency Levels</div>
        <div class="lpr-grid-3">
          <div class="lpr-box">
            <div class="lpr-box-title">Core Areas</div>
            <q-checkbox dense :disable="readonly" v-model="coreAreas" val="Delivering Service Excellence"
              label="Delivering Service Excellence" />
            <q-checkbox dense :disable="readonly" v-model="coreAreas" val="Exemplifying Integrity"
              label="Exemplifying Integrity" />
            <q-checkbox dense :disable="readonly" v-model="coreAreas" val="Interpersonal Skills"
              label="Interpersonal Skills" />
          </div>
          <div class="lpr-box">
            <div class="lpr-box-title">Technical Areas</div>
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
            <q-checkbox dense :disable="readonly" v-model="technicalAreas" val="Attention to Detail"
              label="Attention to Detail" />
          </div>
          <div class="lpr-box">
            <div class="lpr-box-title">Leadership Areas</div>
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

        <!-- RATING INSTRUCTIONS -->
        <p class="lpr-instructions">
          Kindly indicate the learner's application of his/her acquired competency/ies based on the
          following rating; (Please check (/) the column that indicates your rating)
        </p>
        <ul class="lpr-rating-legend">
          <li><strong>5</strong> - Outstandingly contributed to the effective discharge of the learner's functions</li>
          <li><strong>4</strong> - Very satisfactorily contributed to the effective discharge of the learner's functions
          </li>
          <li><strong>3</strong> - Satisfactorily contributed to the effective discharge of the learner's functions</li>
          <li><strong>2</strong> - Is somehow helpful to the effective discharge of the learner's functions</li>
          <li><strong>1</strong> - Is of no significant effect to the effective discharge of the learner's functions
          </li>
        </ul>

        <!-- DEGREE OF APPLICATION TABLE -->
        <table class="lpr-rating-table">
          <thead>
            <tr>
              <th class="lpr-rating-competency-col">Competency</th>
              <th colspan="5">Degree of Application</th>
            </tr>
            <tr>
              <th></th>
              <th v-for="n in 5" :key="n">{{ 6 - n }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in competencyList" :key="item">
              <td class="lpr-rating-competency-col">{{ item }}</td>
              <td v-for="n in 5" :key="n" class="lpr-rating-cell">
                <q-checkbox dense :disable="readonly" :model-value="ratings[item] === 6 - n"
                  @update:model-value="(checked) => setRating(item, 6 - n, checked)" />
              </td>
            </tr>
          </tbody>
        </table>

        <!-- REMARKS -->
        <div class="lpr-box lpr-box-full q-mt-md">
          <div class="lpr-box-title">Remarks: (Observed learner's behavioral changes)</div>
          <q-input dense borderless :readonly="readonly" type="textarea" v-model="remarks" rows="4"
            class="lpr-textarea" />
        </div>

        <!-- SIGNATURES -->
        <div class="lpr-signature-grid">
          <div class="lpr-sig-col">
            <div class="lpr-field-label">Evaluated by:</div>
            <div class="lpr-sig-line"></div>
            <div class="lpr-sig-caption">Immediate Supervisor</div>
          </div>
          <div class="lpr-sig-col">
            <div class="lpr-field-label">Noted by:</div>
            <div class="lpr-sig-line"></div>
            <div class="lpr-sig-caption">Head of Office</div>
          </div>
        </div>
        <div class="lpr-field-row q-mt-md">
          <span class="lpr-field-label">Date of Evaluation:</span>
          <span class="lpr-field-line lpr-field-line-short"></span>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="lpr-footer">
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
const remarks = ref('')

// Checkbox groups
const coreAreas = ref([])
const technicalAreas = ref([])
const leadershipAreas = ref([])

// Order follows the "Degree of Application" table sa PDF
const competencyList = [
  'Delivering Service Excellence',
  'Exemplifying Integrity',
  'Interpersonal Skills',
  'Monitoring & Evaluation',
  'Records Management',
  'Attention To Detail',
  'Thinking Strategically and Creativity',
  'Problem Solving & Decision Making',
  'Building Collaborative & Inclusive Working Relationships',
  'Managing Performance & Coaching For Result',
  'Planning & Organizing',
  'Process Management',
  'Partnering & Networking',
]

// reactive map: { [competencyName]: 1-5 | null }
const ratings = reactive(
  Object.fromEntries(competencyList.map((item) => [item, null]))
)

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
  attention_to_detail: 'Attention to Detail',
}
const LEADERSHIP_KEYS = {
  thinking_strategically_creatively: 'Thinking Strategically and Creativity',
  problem_solving_decision_making: 'Problem Solving and Decision Making',
  building_collaborative_inclusive_working_relationships:
    'Building Collaborative and Inclusive Working Relationships',
  managing_performance_coaching_results: 'Managing Performance and Coaching for Results',
}

// Competency label -> ang `*_competency` field name sa root ng form_data
const RATING_FIELD_MAP = {
  'Delivering Service Excellence': 'delivering_service_excellence_competency',
  'Exemplifying Integrity': 'exemplifying_integrity_competency',
  'Interpersonal Skills': 'interpersonal_skills_competency',
  'Monitoring & Evaluation': 'monitoring_evaluation_competency',
  'Records Management': 'records_management_competency',
  'Attention To Detail': 'attention_detail_competency',
  'Thinking Strategically and Creativity': 'thinking_strategically_creatively_competency',
  'Problem Solving & Decision Making': 'problem_solving_decision_making_competency',
  'Building Collaborative & Inclusive Working Relationships':
    'building_collaborative_inclusive_working_relationships_competency',
  'Managing Performance & Coaching For Result': 'managing_performance_coaching_results_competency',
  'Planning & Organizing': 'planning_organizing_competency',
  'Process Management': 'process_management_competency',
  'Partnering & Networking': 'partnering_networking_competency',
}

function isChecked(val) {
  return val === true || val === '1' || val === 1
}

// Nagpapanatili ng "isa lang na rating bawat competency" kahit checkbox na ang itsura —
// pag pinili mo yung isa, awtomatikong nawawalan ng check yung dati mong napili sa row na yun.
function setRating(item, value, checked) {
  if (props.readonly) return
  ratings[item] = checked ? value : null
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
  remarks.value = ''
  coreAreas.value = []
  technicalAreas.value = []
  leadershipAreas.value = []
  competencyList.forEach((item) => {
    ratings[item] = null
  })
}

function populateFromFormData(data) {
  if (!data) {
    resetForm()
    return
  }

  learner.value = data.learner || ''
  lndAttended.value = data.lnd_attended || ''
  dateOfAttendance.value = data.date_of_attendance || ''
  remarks.value = data.remarks || ''

  coreAreas.value = toCheckedList(data.core_progress, CORE_KEYS)
  technicalAreas.value = toCheckedList(data.technical_progress, TECHNICAL_KEYS)
  leadershipAreas.value = toCheckedList(data.leader_ship_progress, LEADERSHIP_KEYS)

  competencyList.forEach((item) => {
    const fieldName = RATING_FIELD_MAP[item]
    const value = data[fieldName]
    ratings[item] = value === null || value === undefined ? null : Number(value)
  })
}

watch(() => props.formData, populateFromFormData, { immediate: true })
</script>

<style scoped>
.lpr-modal {
  width: 100%;
  max-width: 850px;
  border-radius: 10px;
  overflow: hidden;
}

.lpr-header {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 0;
  background: #fff;
  position: relative;

}

.lpr-header-img {
  width: 100%;
  height: auto;
  display: block;
}

.lpr-close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.lpr-body {
  max-height: 70vh;
  overflow-y: auto;
  padding: 20px 24px;
}

.lpr-title {
  text-align: center;
  font-weight: 750;
  font-size: 15px;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.lpr-field-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 10px;
}

.lpr-field-label {
  font-size: 12px;
  font-weight: 650;
  color: #1a1a1a;
  white-space: nowrap;
}

.lpr-field-line {
  flex: 1;
  border-bottom: 1px solid #333;
  height: 16px;
  font-size: 12px;
  color: #1a1a1a;
}

.lpr-field-line-short {
  max-width: 200px;
}

.lpr-intro {
  font-size: 12px;
  color: #1a1a1a;
  line-height: 1.5;
  margin: 4px 0 14px;
}

.lpr-section-label {
  font-size: 12px;
  font-weight: 700;
  margin: 4px 0 8px;
  color: #1a1a1a;
  text-align: center;
}

.lpr-grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.lpr-box {
  border: 1px solid #333;
  border-radius: 4px;
  padding: 10px 12px;
}

.lpr-box-full {
  margin-bottom: 14px;
}

.lpr-box-title {
  font-size: 11px;
  font-weight: 750;
  text-align: center;
  margin-bottom: 8px;
  color: #1a1a1a;
}

.lpr-box :deep(.q-checkbox) {
  display: flex;
  font-size: 12px;
  margin-bottom: 2px;
}

.lpr-box :deep(.q-checkbox__label) {
  font-size: 12px;
}

.lpr-instructions {
  font-size: 12px;
  color: #1a1a1a;
  margin: 10px 0 6px;
}

.lpr-rating-legend {
  font-size: 11px;
  color: #1a1a1a;
  margin: 0 0 14px;
  padding-left: 18px;
  line-height: 1.6;
}

.lpr-rating-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  margin-bottom: 8px;
}

.lpr-rating-table th,
.lpr-rating-table td {
  border: 1px solid #333;
  padding: 4px 6px;
  text-align: center;
}

.lpr-rating-competency-col {
  text-align: left !important;
  width: 45%;
}

.lpr-rating-cell {
  width: 11%;
}

.lpr-textarea :deep(textarea) {
  font-size: 12px;
}

.lpr-signature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-top: 24px;
  text-align: left;
}

.lpr-sig-line {
  border-bottom: 1px solid #333;
  height: 24px;
  margin-top: 24px;
}

.lpr-sig-caption {
  font-size: 11px;
  font-weight: 650;
  margin-top: 4px;
  color: #1a1a1a;
}

.lpr-footer {
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