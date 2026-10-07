<template>
  <q-dialog v-model="show" maximized-mobile>
    <q-card class="lir-modal">
      <!-- HEADER -->
      <q-card-section class="lir-header">
        <img src="/public/image/header.png" alt="" class="lpr-header-img" />
        <q-btn flat round dense icon="close" v-close-popup class="lir-close-btn" />
      </q-card-section>

      <q-card-section class="lir-body">
        <div class="lir-title">Level I Evaluation Instrument</div>

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
          <span class="lir-field-label">Venue:</span>
          <span class="lir-field-line">{{ venueText }}</span>
        </div>
        <div class="lir-field-row">
          <span class="lir-field-label">Name of Participant:</span>
          <span class="lir-field-line">{{ participant }}</span>
        </div>

        <div class="lir-instruction">
          Please write a check (&#10003;) to indicate your impressions of the items listed below.
        </div>

        <!-- RATING SECTIONS -->
        <div v-for="section in sections" :key="section.key" class="lir-box lir-box-full">
          <table class="lev-table">
            <thead>
              <tr>
                <th class="lev-section-title">{{ section.title }}</th>
                <th v-for="c in choices" :key="c.key" class="lev-choice-head">{{ c.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in section.rows" :key="i">
                <td class="lev-question">{{ row.question }}</td>
                <td v-for="c in choices" :key="c.key" class="lev-cell">
                  <q-icon v-if="isTrue(row[c.key])" name="check" size="18px" color="dark" />
                  <span v-else class="lev-circle"></span>
                </td>
              </tr>
              <tr v-if="!section.rows.length">
                <td colspan="5" class="lev-empty">No ratings recorded.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ADDITIONAL FEEDBACK -->
        <div class="lir-box lir-box-full">
          <div class="lir-box-title lir-box-title-left">Additional Feedback</div>

          <div class="lev-feedback-q">How do you rate the training/briefing overall?</div>
          <div class="lev-feedback-row">
            <div v-for="o in overallOptions" :key="o.key" class="lev-feedback-item">
              <span class="lev-feedback-label">{{ o.label }}</span>
              <q-icon v-if="isTrue(feedback[o.key])" name="check" size="18px" color="dark" />
              <span v-else class="lev-circle"></span>
            </div>
          </div>

          <div class="lev-feedback-q">
            Will you recommend the same training/conference/seminar to other government employees?
          </div>
          <div class="lev-feedback-row lev-feedback-row-left">
            <div v-for="o in recommendOptions" :key="o.key" class="lev-feedback-item">
              <q-icon v-if="isTrue(feedback[o.key])" name="check" size="18px" color="dark" />
              <span v-else class="lev-circle"></span>
              <span class="lev-feedback-label">{{ o.label }}</span>
            </div>
          </div>
        </div>

        <!-- COMMENTS -->
        <div class="lir-box lir-box-full">
          <div class="lir-box-title lir-box-title-left">Comments/Suggestions</div>
          <q-input dense borderless readonly type="textarea" :model-value="comments" rows="3"
            class="lir-textarea" />
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

const choices = [
  { key: 'strongly_agree', label: 'Strongly Agree' },
  { key: 'agree', label: 'Agree' },
  { key: 'disagree', label: 'Disagree' },
  { key: 'strongly_disagree', label: 'Strongly Disagree' },
]

const overallOptions = [
  { key: 'excellent', label: 'Excellent' },
  { key: 'high_average', label: 'High Average' },
  { key: 'good', label: 'Good' },
  { key: 'poor', label: 'Poor' },
  { key: 'fair', label: 'Fair' },
]

const recommendOptions = [
  { key: 'highly_recommended', label: 'Highly Recommended' },
  { key: 'not_a_priority', label: 'Can be considered an option but not a Priority' },
]

// Handles true / 1 / '1' / 'true'
const isTrue = (v) => v === true || v === 1 || v === '1' || v === 'true'

const data = computed(() => props.formData || {})

const eventName = computed(() => data.value.event || '')
const date = computed(() => data.value.date || '')
const participant = computed(() => data.value.name_of_participant || '')
const comments = computed(() => data.value.comments_suggestions || '')
const feedback = computed(() => data.value.feedback || {})

// NOTE: kapag ang relation ay pinangalanang `venue()`, mao-overwrite nito ang
// `venue` column sa JSON. Kaya mas maganda i-rename ang relation sa `venueRatings()`
// (JSON key: venue_ratings). Sinusuportahan ng code na ito pareho.
const venueRows = computed(() => {
  const d = data.value
  if (Array.isArray(d.venue_ratings)) return d.venue_ratings
  if (Array.isArray(d.venue)) return d.venue
  return []
})

const venueText = computed(() => (typeof data.value.venue === 'string' ? data.value.venue : ''))

const QUESTIONS = {
  topic: [
    'The Training/Briefing contents met my expectations.',
    'Topics are relevant to my work/task.',
    'The contents were organized and easy to follow.',
  ],
  facilitator: [
    'The facilitators are able to disseminate the communication Pertaining to the L&D Intervention.',
    'The facilitators address queries and concern adequately.',
    'The facilitators appropriately provided the needs before, during and after the training.',
  ],
  venue: [
    'Venue is conducive for learning',
    'Time allotted is appropriate for learning',
  ],
}

// Ang tanong ay galing sa QUESTIONS; ang sagot ay galing sa saved row (kung meron)
const buildRows = (key, saved = []) =>
  QUESTIONS[key].map((question, i) => ({
    ...(saved[i] || {}),
    question: saved[i]?.question || question,
  }))

const sections = computed(() => [
  { key: 'topic', title: 'Topic', rows: buildRows('topic', data.value.topic || []) },
  {
    key: 'facilitator',
    title: 'Facilitators (Personnel Development Committee/CHRMO-HRD)',
    rows: buildRows('facilitator', data.value.facilitator || []),
  },
  { key: 'venue', title: 'Venue/Platform and Time/Duration', rows: buildRows('venue', venueRows.value) },
])
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
  font-style: italic;
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

.lir-textarea :deep(textarea) {
  font-size: 12px;
}

/* Rating table */
.lev-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  color: #1a1a1a;
}

.lev-section-title {
  text-align: left;
  font-size: 11px;
  font-weight: 750;
  padding-bottom: 6px;
}

.lev-choice-head {
  width: 70px;
  text-align: center;
  font-size: 10px;
  font-weight: 750;
  padding-bottom: 6px;
}

.lev-question {
  padding: 6px 8px 6px 0;
  line-height: 1.3;
}

.lev-cell {
  text-align: center;
  vertical-align: middle;
  height: 28px;
}

.lev-empty {
  font-style: italic;
  color: #666;
  padding: 6px 0;
}

.lev-circle {
  display: inline-block;
  width: 10px;
  height: 10px;
  border: 1px solid #555;
  border-radius: 50%;
}

/* Additional feedback */
.lev-feedback-q {
  font-size: 12px;
  margin: 6px 0;
}

.lev-feedback-row {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 10px;
}

.lev-feedback-row-left {
  justify-content: flex-start;
  gap: 24px;
}

.lev-feedback-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.lev-feedback-row:not(.lev-feedback-row-left) .lev-feedback-item {
  flex-direction: column;
}

.lev-feedback-label {
  font-size: 12px;
  font-weight: 700;
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
</style>