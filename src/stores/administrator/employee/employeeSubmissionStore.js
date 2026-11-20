import { defineStore } from "pinia";
import {
  employee_documents_submission,
  event_participant_certificate,
  employee_form_submission,
  employee_view_documents_submission,
  preview_image_signed,
} from "src/service/administrator/event/employeeService";

const FORM_SLUG = {
  "Learner Progress Report": "learner-progress",
  "Learning Application Plan": "learning-application-plan",
  "Learning Implementation Report": "learning-implementation",
  "Learning Application Monitoring Report": "learning-application-monitoring",
  "Resources Speaker Evaluation Form": "resource-speaker-evaluation",
  "Level 1 Evaluation Instrument": "evaluation-instrument",
};
export const useEmployeeSubmissionStore = defineStore("employeeSubmission", {
  state: () => ({
    list: [],
    document: null, // 👈 idagdag
    pagination: null, // 👈 idagdag
    loading: false,
    error: null,
    summary: {
      total_employees: 0,
      certificate_issued: 0,
      certificate_pending: 0,
      form_complete: 0,
      form_incomplete: 0,
    },
  }),

  actions: {
    clearError() {
      this.error = null;
    },

    async fetchEmployeeSubmission(scheduleId, params = {}) {
      this.loading = true;
      this.error = null;

      try {
        const response = await employee_form_submission(scheduleId, params);

        if (response.data.success) {
          const payload = response.data.data;
          const paginator = payload?.list; // 👈 dating payload mismo

          this.list = Array.isArray(paginator?.data) ? paginator.data : [];

          this.pagination = {
            page: paginator?.current_page ?? 1,
            per_page: paginator?.per_page ?? 10,
            total: paginator?.total ?? 0,
            last_page: paginator?.last_page ?? 1,
          };

          // 👈 bago: summary counts
          this.summary = {
            total_employees: payload?.summary?.total_employees ?? 0,
            certificate_issued: payload?.summary?.certificate_issued ?? 0,
            certificate_pending: payload?.summary?.certificate_pending ?? 0,
            form_complete: payload?.summary?.form_complete ?? 0,
            form_incomplete: payload?.summary?.form_incomplete ?? 0,
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

    async fetchDocument(
      eventId,
      scheduleId,
      controlNo,
      page = 1,
      perPage = 10
    ) {
      this.error = null;
      this.document = null;

      try {
        const response = await employee_documents_submission(
          eventId,
          scheduleId,
          controlNo,
          page,
          perPage
        );

        if (response.data.success) {
          this.document = response.data.data;
          return { success: true, data: this.document };
        }

        this.error = response.data.message;
        return { success: false, message: response.data.message };
      } catch (err) {
        this.error = err.response?.data?.message || "Failed to fetch document";
        console.error("Error fetching document:", err);
        return { success: false, message: this.error };
      }
    },

    async fetchFileBlob(documentId) {
      try {
        const response = await employee_view_documents_submission(documentId);
        return response.data;
      } catch (err) {
        this.error = "Failed to view document";
        console.error("Error view document:", err);
        return null;
      }
    },

    async fetchEventParticipantCertificate(params) {
      this.loading = true;
      this.error = null;

      try {
        const response = await event_participant_certificate(params);

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

      async previewImage(formName, formRecordId) {
        const slug = FORM_SLUG[formName];
        if (!slug) {
          this.error = "Preview Image is not available.";
          return null;
        }

        this.error = null;
        try {
          const { data } = await preview_image_signed(formRecordId, slug);
          return data;
        } catch (e) {
          this.error = "Failed to load Image";
          return null;
        }
      },
  },
});
