import { defineStore } from "pinia";
import { assessment_get, assessment_print } from "src/service/administrator/event/assessmentService";

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

    async preview_assessment(assessmentId) {
          this.loading = true;
          this.error = null;
    
          try {
            const response = await assessment_print(
              assessmentId,
           
            );
    
            // Blob ang laman ng response.data dahil responseType: 'blob' —
            // hindi na ito JSON, kaya ibalik na lang direkta bilang blob
            return {
              success: true,
              blob: response.data,
            };
          } catch (err) {
            let message = "Failed to fetch assessment";
    
            // Kapag error/validation failure ang response (hal. 404 kasi walang
            // nominatedEmployeeId), naka-blob pa rin ang error body dahil sa
            // responseType, kaya kailangan i-decode muna bago ma-JSON.parse
            if (err.response?.data instanceof Blob) {
              try {
                const text = await err.response.data.text();
                const parsed = JSON.parse(text);
                message = parsed.message || message;
              } catch (_) {
                // hindi JSON ang laman, gamitin na lang ang default message
              }
            }
    
            this.error = message;
            return { success: false, message };
          } finally {
            this.loading = false;
          }
        },
  },
});
