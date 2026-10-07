<template>
  <q-dialog v-model="show" maximized-mobile>
    <q-card class="lir-modal">
      <!-- HEADER -->
      <q-card-section class="lir-header">
        <img src="/public/image/header.png" alt="" class="lpr-header-img" />
        <q-btn flat round dense icon="close" v-close-popup class="lir-close-btn" />
      </q-card-section>

      <q-card-section class="lir-body">
        <div class="lir-title">Resource Speaker Evaluation Form</div>

        <div v-if="submission?.status === 'Returned'" class="lap-remarks-box">
          <div class="lap-remarks-label">Remarks (Returned):</div>
          <div class="lap-remarks-text">{{ submission.remarks }}</div>
        </div>

        <!-- BASIC INFO -->
        <div class="lir-field-row">
          <span class="lir-field-label">Name of L&amp;D Course/Program/Training:</span>
          <span class="lir-field-line">{{ eventName }}</span>
        </div>
        <div class="lir-field-row">
          <span class="lir-field-label">Date:</span>
          <span class="lir-field-line">{{ date }}</span>
        </div>
        <div class="lir-field-row">
          <span class="lir-field-label">Venue/Platform:</span>
          <span class="lir-field-line">{{ venue }}</span>
        </div>
        <div class="lir-field-row">
          <span class="lir-field-label">Learning Service Provider:</span>
          <span class="lir-field-line">{{ provider }}</span>
        </div>

        <div class="lir-instruction">
          Rating scale: 1 - Poor &nbsp; 2 - Unsatisfactory &nbsp; 3 - Satisfactory &nbsp;
          4 - Very Satisfactory &nbsp; 5 - Excellent
        </div>

        <!-- RATING TABLE -->
        <div class="lir-box lir-box-full spk-scroll">
   <table class="spk-table" :style="{ minWidth: tableMinWidth }">
            <thead>
              <tr>
                <th class="spk-factor-head">Factors</th>
             <th v-for="(s, i) in speakers" :key="i" class="spk-speaker-head">
            Speaker {{ i + 1 }}:
            <div v-if="s.speaker_name" class="spk-speaker-name">{{ s.speaker_name }}</div>
          </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in factors" :key="f.key">
                <td class="spk-factor">{{ f.label }}</td>
                <td v-for="(s, i) in speakers" :key="i" class="spk-rating-cell">
                  <span v-for="n in 5" :key="n" class="spk-num" :class="{ 'spk-num-active': Number(s[f.key]) === n }">
                    {{ n }}
                  </span>
                </td>
              </tr>
              <tr>
                <td class="spk-factor spk-comment-label">Other comments:</td>
                <td v-for="(s, i) in speakers" :key="i" class="spk-comment-cell">
                  {{ s.comments || '' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- PARTICIPANT -->
        <div class="lir-sig-single">
          <div class="lir-sig-line spk-sig-name">{{ participant }}</div>
          <div class="lir-sig-caption">Participant (Signature over printed name)</div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="lir-footer">
        <q-btn flat label="Close" color="grey-8" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  formData: { type: Object, default: () => null },
  submission: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue'])

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const factors = [
  { key: 'mastery_of_subject', label: '1. Mastery of the subject matter' },
  { key: 'ability_to_involve', label: '2. Ability to involve and interact with participants' },
  { key: 'session_interest', label: '3. Ability to make sessions interesting' },
  { key: 'handling_questions', label: "4. Ability to handle participants' questions" },
  { key: 'voice_projection', label: '5. Voice projection' },
  { key: 'communication', label: '6. Ability to communicate ideas clearly and effectively' },
  {
    key: 'practical_relevance',
    label: '7. Ability to relate principles and concepts to practical and on-the-job situations and issues',
  },
  { key: 'over_all_rating', label: 'Overall Rating' },
]

const data = computed(() => props.formData || {})

const eventName = computed(() => data.value.event || '')
const date = computed(() => data.value.date || '')
const venue = computed(() => data.value.venue || '')
const provider = computed(() => data.value.learning_service_provider || '')
// Optional — wala pang column para dito sa training_evaluation_speakers
const participant = computed(() => data.value.name_of_participant || props.submission?.employee_name || '')

// hasOne -> object, hasMany -> array. I-normalize para laging array (max 5 ayon sa form).
const speakers = computed(() => {
  const rel = data.value.speaker_evaluation ?? data.value.speaker_evaluations ?? null
  const list = Array.isArray(rel) ? rel : rel ? [rel] : []

  // Kung walang laman, magpakita pa rin ng 1 blangkong column para hindi mukhang sira ang table
  return list.length ? list : [{}]
})

// Dynamic na min-width para hindi sumisiksik kapag marami ang speaker
const tableMinWidth = computed(() => `${200 + speakers.value.length * 110}px`)
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

.lpr-header-img {
  width: 100%;
  height: auto;
  display: block;
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

.lir-instruction {
  font-size: 12px;
  font-weight: 650;
  margin: 14px 0 10px;
  color: #1a1a1a;
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
  min-height: 16px;
  font-size: 12px;
  color: #1a1a1a;
  padding-bottom: 2px;
}

.lir-box {
  border: 1px solid #333;
  border-radius: 4px;
  padding: 10px 12px;
}

.lir-box-full {
  margin-bottom: 10px;
}

/* Wide table scrolls inside its own box on small screens */
.spk-scroll {
  overflow-x: auto;
}

.spk-table {
  width: 100%;
  /* alisin ang min-width: 560px; */
  border-collapse: collapse;
  font-size: 12px;
  color: #1a1a1a;
}

.spk-table th,
.spk-table td {
  border: 1px solid #333;          /* dati: border-bottom: 1px solid #ddd */
  padding: 6px 4px;
  vertical-align: middle;
}

/* Sa Word, ang header row ay mas mataas at nasa taas ang "SPEAKER 1:" */
.spk-speaker-head {
  text-align: center;
  font-size: 11px;
  font-weight: 750;
  text-transform: uppercase;
  vertical-align: top;
  height: 70px;
}

.spk-factor-head {
  text-align: left;
  font-size: 11px;
  font-weight: 750;
  width: 36%;
}

.spk-speaker-head {
  text-align: center;
  font-size: 11px;
  font-weight: 750;
}

.spk-speaker-name {
  font-weight: 400;
  font-size: 11px;
}

.spk-factor {
  line-height: 1.3;
  padding-right: 8px;
}

.spk-rating-cell {
  text-align: center;
  white-space: nowrap;
}

.spk-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin: 0 1px;
  font-size: 11px;
  color: #666;
  border-radius: 50%;
}

.spk-num-active {
  border: 1.5px solid #1a1a1a;
  color: #1a1a1a;
  font-weight: 750;
}

.spk-comment-label {
  vertical-align: top;
}

.spk-comment-cell {
  vertical-align: top;
  height: 90px;
  font-size: 11px;
}

.lir-sig-single {
  width: 45%;
  margin: 24px auto 0;
  text-align: center;
}

.lir-sig-line {
  border-bottom: 1px solid #333;
  min-height: 24px;
}

.spk-sig-name {
  font-size: 12px;
  font-weight: 750;
  text-transform: uppercase;
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
.lir-box.spk-scroll {
  padding: 0;
}
.spk-table tr > :first-child {
  border-left: none;
}
.spk-table tr > :last-child {
  border-right: none;
}
.spk-table thead tr:first-child > th {
  border-top: none;
}
.spk-table tbody tr:last-child > td {
  border-bottom: none;
}
</style>