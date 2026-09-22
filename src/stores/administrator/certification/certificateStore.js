import { defineStore } from "pinia";
import { certificate_preview,certificate_send } from "src/service/certification/certificateService";

export const useCertificationStore = defineStore("certification", {
  state: () => ({
    loading: false,
    error: null,
  }),

  actions: {
    async fetchCertificate(nominatedEmployeeId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await certificate_preview(nominatedEmployeeId);

        // Blob ang laman ng response.data dahil responseType: 'blob' —
        // hindi na ito JSON, kaya ibalik na lang direkta bilang blob
        return {
          success: true,
          blob: response.data,
        };
      } catch (err) {
        let message = "Failed to fetch certificate";

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

    async sendCertificate(nominatedEmployeeId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await certificate_send(nominatedEmployeeId); // gagawin mong service function ito
        return { success: true, message: response.data.message };
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to send certificate";
        this.error = message;
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },
  },
});
