<template>
  <q-dialog v-model="show" maximized-mobile>
    <q-card class="lir-modal">
      <!-- HEADER -->
      <q-card-section class="lir-header">
        <img src="/public/image/header" alt="" class="lir-header-img" />
        <div class="lir-form-code">
          F-HRM-HRD-0006<br />
          Revision: 02<br />
          May 2022
        </div>
        <q-btn flat round dense icon="close" v-close-popup class="lir-close-btn" />
      </q-card-section>

      <q-card-section class="lir-body">
        <div class="lir-title">Learning Implementation Report</div>

        <!-- BASIC INFO -->
        <div class="lir-field-row">
          <span class="lir-field-label">Learner:</span>
          <span class="lir-field-line"></span>
        </div>
        <div class="lir-field-row">
          <span class="lir-field-label">L&amp;D Attended:</span>
          <span class="lir-field-line"></span>
        </div>
        <div class="lir-field-row">
          <span class="lir-field-label">Date of Attendance:</span>
          <span class="lir-field-line"></span>
        </div>
        <div class="lir-field-row">
          <span class="lir-field-label">Competency Developed/Acquired:</span>
          <span class="lir-field-line"></span>
        </div>

        <!-- COMPETENCY AREAS AND PROFICIENCY LEVELS -->
        <div class="lir-section-label">Competency Areas and Proficiency Levels</div>
        <div class="lir-grid-3">
          <div class="lir-box">
            <div class="lir-box-title">Core Areas</div>
            <q-checkbox dense v-model="coreAreas" val="Delivering Service Excellence" label="Delivering Service Excellence" />
            <q-checkbox dense v-model="coreAreas" val="Exemplifying Integrity" label="Exemplifying Integrity" />
            <q-checkbox dense v-model="coreAreas" val="Interpersonal Skills" label="Interpersonal Skills" />
          </div>
          <div class="lir-box">
            <div class="lir-box-title">Technical Areas</div>
            <q-checkbox dense v-model="technicalAreas" val="Planning and Organizing" label="Planning &amp; Organizing" />
            <q-checkbox dense v-model="technicalAreas" val="Monitoring and Evaluation" label="Monitoring &amp; Evaluation" />
            <q-checkbox dense v-model="technicalAreas" val="Records Management" label="Records Management" />
            <q-checkbox dense v-model="technicalAreas" val="Partnering and Networking" label="Partnering &amp; Networking" />
            <q-checkbox dense v-model="technicalAreas" val="Process Management" label="Process Management" />
          </div>
          <div class="lir-box">
            <div class="lir-box-title">Leadership Areas</div>
            <q-checkbox dense v-model="leadershipAreas" val="Thinking Strategically and Creativity" label="Thinking Strategically and Creativity" />
            <q-checkbox dense v-model="leadershipAreas" val="Problem Solving and Decision Making" label="Problem Solving &amp; Decision Making" />
            <q-checkbox dense v-model="leadershipAreas" val="Building Collaborative and Inclusive Working Relationships" label="Building Collaborative &amp; Inclusive Working Relationships" />
            <q-checkbox dense v-model="leadershipAreas" val="Managing Performance and Coaching for Results" label="Managing Performance &amp; Coaching for Results" />
          </div>
        </div>

        <!-- REFLECTION FIELDS -->
        <div class="lir-box lir-box-full" v-for="field in reflectionFields" :key="field.model">
          <div class="lir-box-title lir-box-title-left">
            {{ field.label }} <span class="lir-box-subtext">({{ field.question }})</span>
          </div>
          <q-input dense borderless type="textarea" v-model="form[field.model]" rows="2" class="lir-textarea" />
        </div>

        <!-- SIGNATURES -->
        <div class="lir-signature-grid">
          <div class="lir-sig-col">
            <div class="lir-sig-line"></div>
            <div class="lir-sig-caption">Learner's Name &amp; Signature</div>
          </div>
          <div class="lir-sig-col">
            <div class="lir-sig-line"></div>
            <div class="lir-sig-caption">Supervisor Name &amp; Signature</div>
          </div>
        </div>
        <div class="lir-sig-single">
          <div class="lir-sig-line"></div>
          <div class="lir-sig-caption">Head of Office Name &amp; Signature</div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="lir-footer">
        <q-btn flat label="Close" color="grey-8" v-close-popup />
        <q-btn unelevated label="Save" color="primary" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
})
const emit = defineEmits(['update:modelValue'])

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// Static/local state lang muna — walang API binding pa
const coreAreas = ref([])
const technicalAreas = ref([])
const leadershipAreas = ref([])

const reflectionFields = [
  {
    model: 'strategiesApplied',
    label: 'Learning Strategies Applied',
    question: 'What strategies did I apply to meet my learning goals?',
  },
  {
    model: 'resourcesUsed',
    label: 'Resources Used',
    question: 'What resources did I use to achieve the learning goal?',
  },
  {
    model: 'beneficiaries',
    label: 'Beneficiaries of the Strategies Applied',
    question: 'Who were the beneficiaries of the strategies applied?',
  },
  {
    model: 'kpiBehavior',
    label: 'Key Performance Indicators/Behavior Toward Work',
    question: 'How did I demonstrate to myself and others that I have achieved this learning goal?',
  },
  {
    model: 'financialAid',
    label: 'Financial Aid on the Training Attended',
    question: 'How much was spent for my attendance to the training?',
  },
  {
    model: 'returnOfFinancialAid',
    label: 'Return of Financial Aid',
    question:
      'How much was saved/gained by the office in relation to the training I attended, or what other benefits did the office enjoy aside from financial returns?',
  },
]

const form = reactive(
  Object.fromEntries(reflectionFields.map((f) => [f.model, '']))
)
</script>

<style scoped>
.lir-modal {
  width: 100%;
  max-width: 850px;
  border-radius: 10px;
  overflow: hidden;
}

.lir-header {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 0;
  background: #fff;
  border-bottom: 1px solid #e6e9ea;
  position: relative;
}
.lir-header-img {
  width: 100%;
  height: auto;
  display: block;
}
.lir-form-code {
  position: absolute;
  top: 6px;
  right: 44px;
  font-size: 9px;
  line-height: 1.3;
  color: #333;
  text-align: right;
}
.lir-close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.lir-body {
  max-height: 70vh;
  overflow-y: auto;
  padding: 20px 24px;
}

.lir-title {
  text-align: center;
  font-weight: 750;
  font-size: 15px;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.lir-field-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 10px;
}
.lir-field-label {
  font-size: 12px;
  font-weight: 650;
  color: #1a1a1a;
  white-space: nowrap;
}
.lir-field-line {
  flex: 1;
  border-bottom: 1px solid #333;
  height: 16px;
}

.lir-section-label {
  font-size: 12px;
  font-weight: 700;
  margin: 10px 0 8px;
  color: #1a1a1a;
  text-align: center;
}

.lir-grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.lir-box {
  border: 1px solid #333;
  border-radius: 4px;
  padding: 10px 12px;
}
.lir-box-full {
  margin-bottom: 10px;
}
.lir-box-title {
  font-size: 11px;
  font-weight: 750;
  text-align: center;
  margin-bottom: 8px;
  color: #1a1a1a;
}
.lir-box-title-left {
  text-align: left;
}
.lir-box-subtext {
  font-weight: 400;
  font-style: italic;
  color: #444;
}

.lir-box :deep(.q-checkbox) {
  display: flex;
  font-size: 12px;
  margin-bottom: 2px;
}
.lir-box :deep(.q-checkbox__label) {
  font-size: 12px;
}

.lir-textarea :deep(textarea) {
  font-size: 12px;
}

.lir-signature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-top: 30px;
  text-align: center;
}
.lir-sig-single {
  width: 45%;
  margin: 24px auto 0;
  text-align: center;
}
.lir-sig-line {
  border-bottom: 1px solid #333;
  height: 24px;
}
.lir-sig-caption {
  font-size: 11px;
  font-weight: 650;
  margin-top: 4px;
  color: #1a1a1a;
}

.lir-footer {
  border-top: 1px solid #e6e9ea;
  padding: 10px 16px;
}
</style>