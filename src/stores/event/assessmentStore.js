import { defineStore } from "pinia";
import { assessment_get } from "src/service/administrator/event/assessmentService";

export const useAssessmentStore = defineStore("assessment", {
  state: () => ({
    loading: false,
    error: null,
  }),

  actions: {
    async view_assessment(assessmentId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await assessment_get(assessmentId);

        if (response.data.success) {
          return {
            success: true,
            message: response.data.message || "Assessment fetched successfully",
            data: response.data.data,
          };
        } else {
          this.error = response.data.message;
          return { success: false, message: response.data.message };
        }
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to fetch assessment";
        this.error = message;
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },
  },
});
