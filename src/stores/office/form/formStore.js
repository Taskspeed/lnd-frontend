import { defineStore } from "pinia";
import { preview_inhouse_nomination } from "src/service/office/form/nomination";

export const useFormStore = defineStore("form", {
  state: () => ({
    loading: false,
    error: null,
  }),

  actions: {
    async fetchInhouseNomination(eventId, eventScheduleId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await preview_inhouse_nomination(
          eventId,
          eventScheduleId
        );

        // Blob ang laman ng response.data dahil responseType: 'blob' —
        // hindi na ito JSON, kaya ibalik na lang direkta bilang blob
        return {
          success: true,
          blob: response.data,
        };
      } catch (err) {
        let message = "Failed to fetch inhouse nomination";

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
