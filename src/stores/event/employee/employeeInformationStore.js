import { defineStore } from "pinia";
import { employee_information, employee_submission,employee_view_form_submission} from "src/service/event/employeeService";

export const useEmployeeInformationStore = defineStore("employeeInformation", {
  state: () => ({
    loading: false,
    error: null,
  }),

  actions: {
    async fetchEmployeeInformation(nominatedEmployeeId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await employee_information(nominatedEmployeeId);

        if (response.data.success) {
          return {
            success: true,
            message: response.data.message || "Employee fetched successfully",
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

    // 👇 dapat nasa LOOB ng "actions" ito, tulad nito
    async fetchEmployeeSubmissionForms(controlNo, eventId, eventScheduleId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await employee_submission(controlNo, eventId, eventScheduleId);

        if (response.data.success) {
          return {
            success: true,
            message: response.data.message || "Submissions fetched successfully",
            data: response.data.data,
          };
        } else {
          this.error = response.data.message;
          return { success: false, message: response.data.message };
        }
      } catch (err) {
        const message = err.response?.data?.message || "Failed to fetch submissions";
        this.error = message;
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

     async fetchEmployeeViewFormSubmission(controlNo, form_name, eventScheduleId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await employee_view_form_submission(controlNo, form_name, eventScheduleId);

        if (response.data.success) {
          return {
            success: true,
            message: response.data.message || "Submissions fetched successfully",
            data: response.data.data,
          };
        } else {
          this.error = response.data.message;
          return { success: false, message: response.data.message };
        }
      } catch (err) {
        const message = err.response?.data?.message || "Failed to fetch submissions";
        this.error = message;
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },
  }, // 👈 dito lang dapat mag-close ang buong actions object, pagkatapos ng LAHAT ng methods
});