import { defineStore } from "pinia";
import { ref } from "vue";
import {
  report_agency_learning_development_generate,
  report_list,
} from "src/service/administrator/report/reportService";

export const useReportStore = defineStore("report", () => {
  const reports = ref([]);
  const loading = ref(false);
  const error = ref(null);

  function clearError() {
    error.value = null;
  }

  async function fetchReports() {
    loading.value = true;
    error.value = null;

    try {
      const response = await report_list();
      reports.value = response.data.data || [];
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to load report.";
    } finally {
      loading.value = false;
    }
  }

  async function downloadAgencyLearningReport(year) {
    loading.value = true;
    error.value = null;

    try {
      const response = await report_agency_learning_development_generate(year);
      return { success: true, blob: response.data };
    } catch (err) {
      let message = "Failed to generate report.";

      // naka-blob pa rin ang error body dahil sa responseType, i-decode muna
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          message = JSON.parse(text).message || message;
        } catch (_) {
          // hindi JSON, gamitin ang default message
        }
      }

      error.value = message;
      return { success: false, message };
    } finally {
      loading.value = false;
    }
  }

  return {
    reports,
    loading,
    error,
    clearError,
    fetchReports,
    downloadAgencyLearningReport,
  };
});