import { defineStore } from "pinia";
import { employee_form_submission } from "src/service/administrator/event/employeeService";
export const useEmployeeSubmissionStore = defineStore("employeeSubmission", {
  state: () => ({
    list: [],
    loading: false,
    error: null,
  }),

  actions: {
    clearError() {
      this.error = null;
    },

    async fetchEmployeeSubmission(params = {}) {
      this.loading = true;
      this.error = null;

      try {
        const response = await employee_form_submission(params);

        if (response.data.success) {
          const paginator = response.data.data;

          // i-guard: kung hindi array ang laman, huwag basta i-assign
          this.list = Array.isArray(paginator?.data) ? paginator.data : [];

          this.pagination = {
            page: paginator?.current_page ?? 1,
            per_page: paginator?.per_page ?? 10,
            total: paginator?.total ?? 0,
            last_page: paginator?.last_page ?? 1,
          };

          if (!Array.isArray(paginator?.data)) {
            console.warn("Unexpected paginator shape:", paginator);
          }

          return {
            success: true,
            message:
              response.data.message ||
              "Employee submission fetched successfully",
            data: paginator,
          };
        } else {
          this.error = response.data.message;
          return { success: false, message: response.data.message };
        }
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to fetch employee";
        this.error = message;
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },
  },
});
