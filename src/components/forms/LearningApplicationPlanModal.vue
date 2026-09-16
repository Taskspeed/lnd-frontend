<template>
  <q-dialog v-model="show" maximized-mobile>
    <q-card class="lap-modal">
      <!-- HEADER -->
      <q-card-section class="lap-header">
        <img src="/public/image/header.png" alt="" class="lap-header-img" />
        <q-btn flat round dense icon="close" v-close-popup class="lap-close-btn" />
      </q-card-section>

      <q-card-section class="lap-body">
        <div class="lap-title">Learning Application Plan</div>
        <div class="lap-subtitle">(LAP Form)</div>

        <div v-if="submission?.status === 'Returned'" class="lap-remarks-box">
          <div class="lap-remarks-label">Remarks (Returned):</div>
          <div class="lap-remarks-text">{{ submission.remarks }}</div>
        </div>
        <!-- BASIC INFO -->
        <div class="lap-field-row">
          <span class="lap-field-label">Office:</span>
          <span class="lap-field-line">{{ office }}</span>
        </div>
        <div class="lap-field-row">
          <span class="lap-field-label">Learner:</span>
          <span class="lap-field-line">{{ learner }}</span>
        </div>
        <div class="lap-field-row">
          <span class="lap-field-label">Title of Intervention:</span>
          <span class="lap-field-line">{{ titleOfIntervention }}</span>
        </div>
        <div class="lap-field-row">
          <span class="lap-field-label">Date Conducted:</span>
          <span class="lap-field-line">{{ dateConducted }}</span>
        </div>
        <div class="lap-field-row">
          <span class="lap-field-label">Venue:</span>
          <span class="lap-field-line">{{ venue }}</span>
        </div>

        <!-- COMPETENCY CATEGORY -->
        <div class="lap-checkbox-line q-mt-sm">
          <span class="lap-field-label">Competency Category:</span>
          <q-checkbox dense :disable="readonly" val="Foundation" v-model="competencyCategory" label="Foundation" />
          <q-checkbox dense :disable="readonly" val="Technical" v-model="competencyCategory" label="Technical" />
          <q-checkbox dense :disable="readonly" val="Supervisory" v-model="competencyCategory" label="Supervisory" />
          <q-checkbox dense :disable="readonly" val="Managerial" v-model="competencyCategory" label="Managerial" />
        </div>
        <div class="lap-section-label">Competency Developed/Acquired</div>

        <!-- COMPETENCY BOXES -->
        <div class="lap-grid-2">
          <div class="lap-box">
            <div class="lap-box-title">Foundation Competencies</div>
            <q-checkbox dense :disable="readonly" v-model="foundation" val="Delivering Service Excellence"
              label="Delivering Service  Excellence" />
            <q-checkbox dense :disable="readonly" v-model="foundation" val="Exemplifying Integrity"
              label="Exemplifying Integrity" />
            <q-checkbox dense :disable="readonly" v-model="foundation" val="Interpersonal Skills"
              label="Interpersonal Skills" />
          </div>
          <div class="lap-box">
            <div class="lap-box-title">Technical Competencies</div>
            <q-checkbox dense :disable="readonly" v-model="technical" val="Planning and Organizing"
              label="Planning and Organizing" />
            <q-checkbox dense :disable="readonly" v-model="technical" val="Monitoring and Evaluation"
              label="Monitoring and Evaluation" />
            <q-checkbox dense :disable="readonly" v-model="technical" val="Records Management"
              label="Records Management" />
            <q-checkbox dense :disable="readonly" v-model="technical" val="Partnering and Networking"
              label="Partnering and Networking" />
            <q-checkbox dense :disable="readonly" v-model="technical" val="Process Management"
              label="Process Management" />
            <q-checkbox dense :disable="readonly" v-model="technical" val="Attention to Detail"
              label="Attention to Detail" />
          </div>
          <div class="lap-box">
            <div class="lap-box-title">Supervisory Competencies</div>
            <q-checkbox dense :disable="readonly" v-model="supervisory" val="Managing Performance and Coaching Results"
              label="Managing Performance and Coaching Results" />
            <q-checkbox dense :disable="readonly" v-model="supervisory"
              val="Building Collaborative and Inclusive Working Relationships"
              label="Building Collaborative and Inclusive Working Relationships" />
          </div>
          <div class="lap-box">
            <div class="lap-box-title">Managerial Competencies</div>
            <q-checkbox dense :disable="readonly" v-model="managerial" val="Managing Performance and Coaching Results"
              label="Managing Performance and Coaching Results" />
            <q-checkbox dense :disable="readonly" v-model="managerial"
              val="Building Collaborative and Inclusive Working Relationships"
              label="Building Collaborative and Inclusive Working Relationships" />
            <q-checkbox dense :disable="readonly" v-model="managerial" val="Thinking Strategically and Creatively"
              label="Thinking Strategically and Creatively" />
            <q-checkbox dense :disable="readonly" v-model="managerial" val="Problem Solving and Decision Making"
              label="Problem Solving and Decision Making" />
          </div>
        </div>

        <!-- SIGNIFICANT LEARNING -->
        <div class="lap-box lap-box-full">
          <div class="lap-box-title">Significant Learning/Insight:</div>
          <q-input dense borderless :readonly="readonly" type="textarea" v-model="insight" rows="3"
            class="lap-textarea" />
        </div>

        <!-- STRATEGIES / KPI -->
        <div class="lap-grid-2">
          <div class="lap-box">
            <div class="lap-box-title">Learning Strategies to be implemented</div>
            <q-checkbox dense :disable="readonly" v-model="strategies"
              val="Immediate Application of new skills acquired" label="Immediate Application of new skills acquired" />
            <q-checkbox dense :disable="readonly" v-model="strategies" val="Knowledge Sharing"
              label="Knowledge Sharing" />
            <q-checkbox dense :disable="readonly" v-model="strategies" val="Peer Coaching and Collaboration"
              label="Peer Coaching and Collaboration" />
            <q-checkbox dense :disable="readonly" v-model="strategies" val="Develop office policies and guidelines"
              label="Develop office policies and guidelines" />
            <q-checkbox dense :disable="readonly" v-model="strategies" val="Create a Pilot Project"
              label="Create a Pilot Project" />
            <q-checkbox dense :disable="readonly" v-model="strategies" val="Include in the IPCR"
              label="Include in the IPCR" />
          </div>
          <div class="lap-box">
            <div class="lap-box-title">Key Performance Indicator (based on the IPCR)</div>
            <q-checkbox dense :disable="readonly" v-model="kpi" val="Strategic Functions" label="Strategic Functions" />
            <q-checkbox dense :disable="readonly" v-model="kpi" val="Core Functions" label="Core Functions" />
            <q-checkbox dense :disable="readonly" v-model="kpi" val="Support Functions" label="Support Functions" />
          </div>
        </div>

        <!-- RESOURCES / BENEFICIARIES -->
        <div class="lap-grid-2">
          <div class="lap-box">
            <div class="lap-box-title">Resources to be utilized</div>
            <q-checkbox dense :disable="readonly" v-model="resources" val="Digital & Technologies"
              label="Digital & Technologies" />
            <q-checkbox dense :disable="readonly" v-model="resources" val="Physical & Printed Resources"
              label="Physical & Printed Resources" />
            <q-checkbox dense :disable="readonly" v-model="resources" val="Human Resources & Organizational Support"
              label="Human Resources & Organizational Support" />
            <q-checkbox dense :disable="readonly" v-model="resources" val="Financial & Logistical Support"
              label="Financial & Logistical Support" />
            <q-checkbox dense :disable="readonly" v-model="resources" val="Policy & Process Resources"
              label="Policy & Process Resources" />
          </div>
          <div class="lap-box">
            <div class="lap-box-title">Beneficiaries of the Strategies Applied</div>
            <q-checkbox dense :disable="readonly" v-model="beneficiaries" val="Employees and Staff"
              label="Employees and Staff" />
            <q-checkbox dense :disable="readonly" v-model="beneficiaries" val="Supervisors and Managers"
              label="Supervisors and Managers" />
            <q-checkbox dense :disable="readonly" v-model="beneficiaries" val="The Office/Department"
              label="The Office/Department" />
            <q-checkbox dense :disable="readonly" v-model="beneficiaries" val="The City Government/Organization"
              label="The City Government/Organization" />
            <q-checkbox dense :disable="readonly" v-model="beneficiaries"
              val="Clients, Stakeholders & the General Public" label="Clients, Stakeholders & the General Public" />
          </div>
        </div>

        <!-- TARGET DATE -->
        <div class="lap-box lap-box-full">
          <div class="lap-box-title lap-box-title-center">Target Date of Completion</div>
          <div class="lap-target-options">
            <q-checkbox dense :disable="readonly" v-model="targetDate" val="within2weeks"
              label="Within 2 weeks after the training" />
            <q-checkbox dense :disable="readonly" v-model="targetDate" val="within1month"
              label="Within 1 month after the training" />
            <q-checkbox dense :disable="readonly" v-model="targetDate" val="within2months"
              label="Within 2 months after the training" />
            <q-checkbox dense :disable="readonly" v-model="targetDate" val="within3months"
              label="Within 3 months after the training" />
          </div>
        </div>

        <!-- SIGNATURES -->
        <div class="lap-signature-row">
          <div class="lap-sig-block">
            <span class="lap-field-label">Signature:</span>
          </div>
        </div>
        <div class="lap-signature-grid">
          <div class="lap-sig-col">
            <div class="lap-sig-line"></div>
            <div class="lap-sig-caption">Learner</div>
          </div>
          <div class="lap-sig-col">
            <div class="lap-sig-line"></div>
            <div class="lap-sig-caption">Supervisor</div>
          </div>
          <div class="lap-sig-col">
            <div class="lap-sig-line"></div>
            <div class="lap-sig-caption">Head of Office</div>
          </div>
        </div>
        <div class="lap-field-row q-mt-md">
          <span class="lap-field-label">Date:</span>
          <span class="lap-field-line lap-field-line-short"></span>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="lap-footer">
        <q-btn flat label="Close" color="grey-8" v-close-popup />
        <q-btn v-if="!readonly" unelevated label="Save" color="primary" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  // Buong `form_data` object galing sa GET /event/employee/form response
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
const office = ref('')
const learner = ref('')
const titleOfIntervention = ref('')
const dateConducted = ref('')
const venue = ref('')

// Checkbox groups (arrays ng label strings — tugma sa `val` ng bawat q-checkbox)
const competencyCategory = ref([])
const foundation = ref([])
const technical = ref([])
const supervisory = ref([])
const managerial = ref([])
const insight = ref('')
const strategies = ref([])
const kpi = ref([])
const resources = ref([])
const beneficiaries = ref([])
const targetDate = ref([])

// --- Mapping: DB column name (boolean/"0"/"1") -> checkbox label ---
const FOUNDATION_KEYS = {
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
  attention_detail: 'Attention to Detail',
}
const SUPERVISORY_KEYS = {
  supervisory_managing_performance_coaching_results: 'Managing Performance and Coaching Results',
  supervisory_building_collaborative_inclusive_working_relationships:
    'Building Collaborative and Inclusive Working Relationships',
}
const MANAGERIAL_KEYS = {
  managing_performance_coaching_results: 'Managing Performance and Coaching Results',
  building_collaborative_inclusive_working_relationships:
    'Building Collaborative and Inclusive Working Relationships',
  thinking_strategically_creatively: 'Thinking Strategically and Creatively',
  problem_solving_decision_making: 'Problem Solving and Decision Making',
}
const STRATEGIES_KEYS = {
  immediate_application_skills: 'Immediate Application of new skills acquired',
  knowledge_sharing: 'Knowledge Sharing',
  peer_coaching_collaboration: 'Peer Coaching and Collaboration',
  develop_office_policies_guidelines: 'Develop office policies and guidelines',
  create_pilot_project: 'Create a Pilot Project',
  include_ipcr: 'Include in the IPCR',
}
const KPI_KEYS = {
  strategic_functions: 'Strategic Functions',
  core_functions: 'Core Functions',
  support_functions: 'Support Functions',
}
const RESOURCES_KEYS = {
  digital_technologies: 'Digital & Technologies',
  physical_printed_resources: 'Physical & Printed Resources',
  human_resources_organizational_support: 'Human Resources & Organizational Support',
  financial_logistical_support: 'Financial & Logistical Support',
  policy_process_resources: 'Policy & Process Resources',
}
const BENEFICIARIES_KEYS = {
  employees_staff: 'Employees and Staff',
  office_department: 'The Office/Department',
  city_government_organization: 'The City Government/Organization',
  clients_stakeholders_general_public: 'Clients, Stakeholders & the General Public',
}
const TARGET_KEYS = {
  within_2_weeks_after_training: 'within2weeks',
  within_1_month_after_training: 'within1month',
  within_2_months_after_training: 'within2months',
  within_3_months_after_training: 'within3months',
}

// SQL Server/Laravel kung minsan nagbabalik ng "1"/"0" string sa halip na tunay na boolean
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
  office.value = ''
  learner.value = ''
  titleOfIntervention.value = ''
  dateConducted.value = ''
  venue.value = ''
  competencyCategory.value = []
  foundation.value = []
  technical.value = []
  supervisory.value = []
  managerial.value = []
  insight.value = ''
  strategies.value = []
  kpi.value = []
  resources.value = []
  beneficiaries.value = []
  targetDate.value = []
}

function populateFromFormData(data) {
  if (!data) {
    resetForm()
    return
  }

  office.value = data.office || ''
  learner.value = data.learner || ''
  titleOfIntervention.value = data.title_of_intervention || ''
  dateConducted.value = data.date_conducted || ''
  venue.value = data.venue || ''

  // Detalyadong per-item checkboxes — galing sa mga RELATIONS (may "s" sa pangalan
  // para di magkasagupa sa boolean columns sa ibaba)
  foundation.value = toCheckedList(data.foundations, FOUNDATION_KEYS)
  technical.value = toCheckedList(data.technical, TECHNICAL_KEYS)
  supervisory.value = toCheckedList(data.supervisorys, SUPERVISORY_KEYS)
  managerial.value = toCheckedList(data.managerials, MANAGERIAL_KEYS)

  // "Competency Category" checkboxes sa itaas ng form — galing direkta sa boolean
  // columns ng parent table (foundation/techinal/supervisory/managerial)
  competencyCategory.value = [
    isChecked(data.foundation) ? 'Foundation' : null,
    isChecked(data.techinal) ? 'Technical' : null,
    isChecked(data.supervisory) ? 'Supervisory' : null,
    isChecked(data.managerial) ? 'Managerial' : null,
  ].filter(Boolean)

  insight.value = data.significant_learning_insight || ''

  strategies.value = toCheckedList(data.learning_strategies, STRATEGIES_KEYS)
  kpi.value = toCheckedList(data.performance_indicator, KPI_KEYS)
  resources.value = toCheckedList(data.resources, RESOURCES_KEYS)
  beneficiaries.value = toCheckedList(data.beneficiaries, BENEFICIARIES_KEYS)
  targetDate.value = toCheckedList(data.target_completion, TARGET_KEYS)
}

// Mag-populate agad kapag dumating ang formData (view mode), at ma-reset kapag inalis (create mode)
watch(() => props.formData, populateFromFormData, { immediate: true })
</script>

<style scoped>
.lap-modal {
  width: 100%;
  max-width: 850px;
  border-radius: 10px;
  overflow: hidden;
}

.lap-header {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 0;
  background: #fff;
  position: relative;
}

.lap-header-img {
  width: 100%;
  height: auto;
  display: block;
}

.lap-close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.lap-body {
  max-height: 70vh;
  overflow-y: auto;
  padding: 20px 24px;
}

.lap-title {
  text-align: center;
  font-weight: 750;
  font-size: 15px;
  color: #1a1a1a;
}

.lap-subtitle {
  text-align: center;
  font-size: 12px;
  color: #444;
  margin-bottom: 16px;
}

.lap-field-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 10px;
}

.lap-field-label {
  font-size: 12px;
  font-weight: 650;
  color: #1a1a1a;
  white-space: nowrap;
}

.lap-field-line {
  flex: 1;
  border-bottom: 1px solid #333;
  height: 16px;
  font-size: 12px;
  color: #1a1a1a;
}

.lap-field-line-short {
  max-width: 200px;
}

.lap-checkbox-line {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 12px;
}

.lap-section-label {
  font-size: 12px;
  font-weight: 700;
  margin: 10px 0 6px;
  color: #1a1a1a;
}

.lap-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}

.lap-box {
  border: 1px solid #333;
  border-radius: 4px;
  padding: 10px 12px;
}

.lap-box-full {
  margin-bottom: 14px;
}

.lap-box-title {
  font-size: 11px;
  font-weight: 750;
  text-align: center;
  margin-bottom: 8px;
  color: #1a1a1a;
}

.lap-box-title-center {
  text-align: center;
}

.lap-box :deep(.q-checkbox) {
  display: flex;
  font-size: 12px;
  margin-bottom: 2px;
}

.lap-box :deep(.q-checkbox__label) {
  font-size: 12px;
}

.lap-textarea :deep(textarea) {
  font-size: 12px;
}

.lap-target-options {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.lap-signature-row {
  margin-top: 20px;
}

.lap-signature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 30px;
  text-align: center;
}

.lap-sig-line {
  border-bottom: 1px solid #333;
  height: 24px;
}

.lap-sig-caption {
  font-size: 11px;
  font-weight: 650;
  margin-top: 4px;
  color: #1a1a1a;
}

.lap-footer {
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