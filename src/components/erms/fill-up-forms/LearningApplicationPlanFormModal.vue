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

        <!-- BASIC INFO -->
        <div class="lap-field-row">
          <span class="lap-field-label">Office:</span>
          <span class="lap-field-line"></span>
        </div>
        <div class="lap-field-row">
          <span class="lap-field-label">Learner:</span>
          <span class="lap-field-line"></span>
        </div>
        <div class="lap-field-row">
          <span class="lap-field-label">Title of Intervention:</span>
          <span class="lap-field-line"></span>
        </div>
        <div class="lap-field-row">
          <span class="lap-field-label">Date Conducted:</span>
          <span class="lap-field-line"></span>
        </div>
        <div class="lap-field-row">
          <span class="lap-field-label">Venue:</span>
          <span class="lap-field-line"></span>
        </div>

        <!-- COMPETENCY CATEGORY -->
        <div class="lap-checkbox-line q-mt-sm">
          <span class="lap-field-label">Competency Category:</span>
          <q-checkbox dense val="Foundation" v-model="competencyCategory" label="Foundation" />
          <q-checkbox dense val="Technical" v-model="competencyCategory" label="Technical" />
          <q-checkbox dense val="Supervisory" v-model="competencyCategory" label="Supervisory" />
          <q-checkbox dense val="Managerial" v-model="competencyCategory" label="Managerial" />
        </div>
        <div class="lap-section-label">Competency Developed/Acquired</div>

        <!-- COMPETENCY BOXES -->
        <div class="lap-grid-2">
          <div class="lap-box">
            <div class="lap-box-title">Foundation Competencies</div>
            <q-checkbox dense v-model="foundation" val="Delivering Service Excellence" label="Delivering Service  Excellence" />
            <q-checkbox dense v-model="foundation" val="Exemplifying Integrity" label="Exemplifying Integrity" />
            <q-checkbox dense v-model="foundation" val="Interpersonal Skills" label="Interpersonal Skills" />
          </div>
          <div class="lap-box">
            <div class="lap-box-title">Technical Competencies</div>
            <q-checkbox dense v-model="technical" val="Planning and Organizing" label="Planning and Organizing" />
            <q-checkbox dense v-model="technical" val="Monitoring and Evaluation" label="Monitoring and Evaluation" />
            <q-checkbox dense v-model="technical" val="Records Management" label="Records Management" />
            <q-checkbox dense v-model="technical" val="Partnering and Networking" label="Partnering and Networking" />
            <q-checkbox dense v-model="technical" val="Process Management" label="Process Management" />
            <q-checkbox dense v-model="technical" val="Attention to Detail" label="Attention to Detail" />
          </div>
          <div class="lap-box">
            <div class="lap-box-title">Supervisory Competencies</div>
            <q-checkbox dense v-model="supervisory" val="Managing Performance and Coaching Results" label="Managing Performance and Coaching Results" />
            <q-checkbox dense v-model="supervisory" val="Building Collaborative and Inclusive Working Relationships" label="Building Collaborative and Inclusive Working Relationships" />
          </div>
          <div class="lap-box">
            <div class="lap-box-title">Managerial Competencies</div>
            <q-checkbox dense v-model="managerial" val="Managing Performance and Coaching Results" label="Managing Performance and Coaching Results" />
            <q-checkbox dense v-model="managerial" val="Building Collaborative and Inclusive Working Relationships" label="Building Collaborative and Inclusive Working Relationships" />
            <q-checkbox dense v-model="managerial" val="Thinking Strategically and Creatively" label="Thinking Strategically and Creatively" />
            <q-checkbox dense v-model="managerial" val="Problem Solving and Decision Making" label="Problem Solving and Decision Making" />
          </div>
        </div>

        <!-- SIGNIFICANT LEARNING -->
        <div class="lap-box lap-box-full">
          <div class="lap-box-title">Significant Learning/Insight:</div>
          <q-input dense borderless type="textarea" v-model="insight" rows="3" class="lap-textarea" />
        </div>

        <!-- STRATEGIES / KPI -->
        <div class="lap-grid-2">
          <div class="lap-box">
            <div class="lap-box-title">Learning Strategies to be implemented</div>
            <q-checkbox dense v-model="strategies" val="Immediate Application of new skills acquired" label="Immediate Application of new skills acquired" />
            <q-checkbox dense v-model="strategies" val="Knowledge Sharing" label="Knowledge Sharing" />
            <q-checkbox dense v-model="strategies" val="Peer Coaching and Collaboration" label="Peer Coaching and Collaboration" />
            <q-checkbox dense v-model="strategies" val="Develop office policies and guidelines" label="Develop office policies and guidelines" />
            <q-checkbox dense v-model="strategies" val="Create a Pilot Project" label="Create a Pilot Project" />
            <q-checkbox dense v-model="strategies" val="Include in the IPCR" label="Include in the IPCR" />
          </div>
          <div class="lap-box">
            <div class="lap-box-title">Key Performance Indicator (based on the IPCR)</div>
            <q-checkbox dense v-model="kpi" val="Strategic Functions" label="Strategic Functions" />
            <q-checkbox dense v-model="kpi" val="Core Functions" label="Core Functions" />
            <q-checkbox dense v-model="kpi" val="Support Functions" label="Support Functions" />
          </div>
        </div>

        <!-- RESOURCES / BENEFICIARIES -->
        <div class="lap-grid-2">
          <div class="lap-box">
            <div class="lap-box-title">Resources to be utilized</div>
            <q-checkbox dense v-model="resources" val="Digital & Technologies" label="Digital & Technologies" />
            <q-checkbox dense v-model="resources" val="Physical & Printed Resources" label="Physical & Printed Resources" />
            <q-checkbox dense v-model="resources" val="Human Resources & Organizational Support" label="Human Resources & Organizational Support" />
            <q-checkbox dense v-model="resources" val="Financial & Logistical Support" label="Financial & Logistical Support" />
            <q-checkbox dense v-model="resources" val="Policy & Process Resources" label="Policy & Process Resources" />
          </div>
          <div class="lap-box">
            <div class="lap-box-title">Beneficiaries of the Strategies Applied</div>
            <q-checkbox dense v-model="beneficiaries" val="Employees and Staff" label="Employees and Staff" />
            <q-checkbox dense v-model="beneficiaries" val="Supervisors and Managers" label="Supervisors and Managers" />
            <q-checkbox dense v-model="beneficiaries" val="The Office/Department" label="The Office/Department" />
            <q-checkbox dense v-model="beneficiaries" val="The City Government/Organization" label="The City Government/Organization" />
            <q-checkbox dense v-model="beneficiaries" val="Clients, Stakeholders & the General Public" label="Clients, Stakeholders & the General Public" />
          </div>
        </div>

        <!-- TARGET DATE -->
        <div class="lap-box lap-box-full">
          <div class="lap-box-title lap-box-title-center">Target Date of Completion</div>
          <div class="lap-target-options">
            <q-checkbox dense v-model="targetDate" val="within2weeks" label="Within 2 weeks after the training" />
            <q-checkbox dense v-model="targetDate" val="within1month" label="Within 1 month after the training" />
            <q-checkbox dense v-model="targetDate" val="within2months" label="Within 2 months after the training" />
            <q-checkbox dense v-model="targetDate" val="within3months" label="Within 3 months after the training" />
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
        <q-btn unelevated label="Save" color="primary" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import ReportHeader from '../report/ReportHeader.vue'

const props = defineProps({
  modelValue: Boolean,
})
const emit = defineEmits(['update:modelValue'])

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// Static/local state lang muna — walang API binding pa
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
  /* border-bottom: 1px solid #e6e9ea; */
  position: relative;
}

.lap-header-img {
  width: 100%;
  height: auto;
  display: block;
}
.lap-header-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.lap-logo {
  width: 48px;
  height: 48px;
}
.lap-agency {
  font-size: 10px;
  font-weight: 700;
  color: #1a1a1a;
}
.lap-agency-sub {
  font-size: 9px;
  color: #555;
}
.lap-city {
  font-size: 15px;
  font-weight: 800;
  color: #0b6b2c;
  letter-spacing: 0.5px;
}
.lap-form-no {
  font-size: 10px;
  text-align: right;
  color: #333;
  line-height: 1.4;
  margin-right: 30px;
}
.lap-close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.lap-banner {
  background: #0b6b2c;
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.5px;
  padding: 8px 20px;
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
</style>