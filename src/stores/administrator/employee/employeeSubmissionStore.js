import { defineStore } from "pinia";
import { employee_form_submission } from "src/service/event/employeeService";
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

    async fetchEmployeeSubmission() {
      this.loading = true;
      this.error = null;

      try {
        const response = await employee_form_submission();

        if (response.data.success) {
          this.list = response.data.data;

          return {
            success: true,
            message: response.data.message || "Employee submission fetched successfully",
            data: response.data.data,
          };
        } else {
          this.error = response.data.message;
          return { success: false, message: response.data.message };
        }
      } catch (err) {
        const message = err.response?.data?.message || "Failed to fetch employee";
        this.error = message;
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },
  },
});