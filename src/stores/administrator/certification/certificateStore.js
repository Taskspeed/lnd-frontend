import { defineStore } from "pinia";
import {
  certificate_list,
  certificate_preview,
  certificate_release,
  certificate_send,
} from "src/service/certification/certificateService";

export const useCertificationStore = defineStore("certification", {
  state: () => ({
    loading: false,
    error: null,
     list: [],  
         pagination: {                // 👈 idagdag
        page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
    },
    loadingCertificates: false,
    certificateList: [],
    certificatePagination: { page: 1, per_page: 10, total: 0, last_page: 1 },
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
    
    async fetchEmployeeReleaseCertificate(params = {}) {
      this.loading = true;
      this.error = null;

      try {
        const response = await certificate_release(params);

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
              "Employee  fetched successfully",
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

    async fetchEmployeeListCertificate(controlNo, params = {}) {
      this.loadingCertificates = true;
      this.error = null;

      try {
        const response = await certificate_list(controlNo, params);

        if (response.data.success) {
          const paginator = response.data.data;

          this.certificateList = Array.isArray(paginator?.data) ? paginator.data : [];
          this.certificatePagination = {
            page: paginator?.current_page ?? 1,
            per_page: paginator?.per_page ?? 10,
            total: paginator?.total ?? 0,
            last_page: paginator?.last_page ?? 1,
          };

          return {
            success: true,
            message: response.data.message || "Certificates fetched successfully",
            data: paginator,
          };
        } else {
          this.error = response.data.message;
          return { success: false, message: response.data.message };
        }
      } catch (err) {
        const message = err.response?.data?.message || "Failed to fetch certificates";
        this.error = message;
        return { success: false, message };
      } finally {
        this.loadingCertificates = false;
      }
    },
  },
});
