import { defineStore } from "pinia";
import { attendance_store } from "src/service/administrator/attendance/attendanceService";

export const useAttendanceStore = defineStore("attendance", {
  state: () => ({
    loading: false,
    error: null,
  }),

  actions: {
    async storeAttendance(payload) {
      this.loading = true;
      this.error = null;

      try {
        const response = await attendance_store(payload);

        if (response.data.success) {
          return {
            success: true,
            message: response.data.message || "Attendance added successfully",
            data: response.data.data,
          };
        }

        this.error = response.data.message;
        return { success: false, message: response.data.message };
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to add Attendance";
        this.error = message;
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },
  },
});
