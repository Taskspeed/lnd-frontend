import { defineStore } from "pinia";
import { dashboard_event_calendar } from "src/service/event/dashboardService";

export const useDashboardStore = defineStore("dashboard", {
  state: () => ({
    loading: false,
    error: null,
  }),

  actions: {
    async fetchCalendar(year,month) {
      this.loading = true;
      this.error = null;

      try {
        const response = await dashboard_event_calendar(year,month);

        if (response.data.success) {
          return {
            success: true,
            message: response.data.message || "Data fetched successfully",
            data: response.data.data,
          };
        } else {
          this.error = response.data.message;
          return { success: false, message: response.data.message };
        }
      } catch (err) {
        const message = err.response?.data?.message || "Failed to fetch data";
        this.error = message;
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

   
  }, 
});