import { markRaw } from 'vue'
import LearningApplicationPlanModal from 'src/components/forms/LearningApplicationPlanModal.vue'
import LearnerProgressReportModal from 'src/components/forms/LearnerProgressReportModal.vue'
import LearningApplicationMonitoringReportModal from 'src/components/forms/LearningApplicationMonitoringReportModal.vue'
import LearningImplementationReportModal from 'src/components/forms/LearningImplementationReportModal.vue'

// Ang KEY dito dapat EXACT match sa `form_name` na ibinabalik ng backend/DB
// (yung parehong string na ipinapasa mo sa ?form_name= query param).
export const FORM_MODAL_REGISTRY = {
  'Learning Application Plan': markRaw(LearningApplicationPlanModal),
  "Learner Progress Report": markRaw(LearnerProgressReportModal),
  'Learning Application Monitoring Report': markRaw(LearningApplicationMonitoringReportModal),
  'Learning Implementation Report': markRaw(LearningImplementationReportModal),
}

export function getFormModalComponent(formName) {
  return FORM_MODAL_REGISTRY[formName] || null
}