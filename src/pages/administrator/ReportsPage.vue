<template>
  <q-page class="report-page">
    <!-- PAGE HEADER -->
    <section class="page-header">
      <div>
        <h5>Report Management</h5>
      </div>

 
    </section>

    <!-- REPORTS CARD -->
    <q-card flat class="reports-card">
      <!-- FILTERS -->
      <div class="filter-section">
        <q-input v-model="search" outlined dense clearable placeholder="Search by report name" class="search-input">
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-btn flat no-caps icon="filter_alt_off" label="Clear" class="clear-btn" @click="clearFilters" />
      </div>

      <!-- TABLE -->
      <div class="table-wrapper">
        <q-table flat :rows="filteredRows" :columns="columns" row-key="id" hide-pagination :rows-per-page-options="[0]"
          :loading="reportStore.loading" class="app-table">

          <!-- REPORT NAME -->
          <template #body-cell-report="props">
            <q-td :props="props">
              <div class="app-table-cell-title">{{ props.row.report_name }}</div>
            </q-td>
          </template>

          <!-- ACTIONS (view only) -->
          <template #body-cell-actions="props">
            <q-td :props="props">
              <div class="action-buttons">
                <q-btn flat round dense icon="visibility" class="action-view" @click="viewReport(props.row.id)">
                  <q-tooltip>View Report</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <!-- EMPTY STATE -->
          <template #no-data>
            <div class="app-table-empty">No reports found.</div>
          </template>
        </q-table>
      </div>

      <!-- TABLE FOOTER -->
      <div class="table-footer">
        <span>
          Showing
          <strong>{{ filteredRows.length }}</strong>
          of
          <strong>{{ reportStore.reports.length }}</strong>
          Reports
        </span>
      </div>
    </q-card>


    <!-- VIEW / GENERATE DIALOG -->
    <q-dialog v-model="showViewDialog">
      <q-card class="report-dialog">
        <q-card-section class="dialog-header">
          <div>
            <div class="dialog-title">Generate Report</div>
            <div class="dialog-subtitle">Select a year to generate the Excel file.</div>
          </div>

          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="dialog-body">
          <q-banner v-if="reportStore.error" dense rounded class="bg-red-2 text-red-9 q-mb-sm">
            {{ reportStore.error }}
          </q-banner>

          <div class="section-label">Report Details</div>

          <div class="form-grid">
            <q-input :model-value="viewingReport?.report_name" outlined dense readonly label="Report Name"
              class="col-span-2" />

            <q-select v-model="selectedYear" :options="yearOptions" outlined dense label="Year" class="col-span-2" />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat no-caps label="Close" class="cancel-btn" v-close-popup />

          <q-btn unelevated no-caps icon="download" label="Generate Excel" class="save-btn"
            :loading="reportStore.loading" @click="generateReport" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import { defineComponent, computed, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { useReportStore } from "src/stores/administrator/report/reportStore";

export default defineComponent({
  name: "ReportPage",

  setup() {
    const $q = useQuasar();
    const reportStore = useReportStore();
    const search = ref("");

    // ---------------------------------------------------------------
    // TABLE
    // ---------------------------------------------------------------
    const columns = [
      {
        name: "report",
        label: "Report name",
        field: "report_name",
        align: "left",
        sortable: true,
      },
      { name: "actions", label: "Action", field: "actions", align: "center" },
    ];

    // Response shape: { id, report_name }
    const tableRows = computed(() =>
      reportStore.reports.map((report) => ({
        id: report.id,
        report_name: report.report_name,
      }))
    );

    const filteredRows = computed(() => {
      const keyword = search.value.toLowerCase().trim();
      if (!keyword) return tableRows.value;

      return tableRows.value.filter((row) =>
        row.report_name?.toLowerCase().includes(keyword)
      );
    });

    function clearFilters() {
      search.value = "";
    }

    function notify(type, message) {
      $q.notify({
        type: type === "success" ? "positive" : "negative",
        message,
        position: "top",
      });
    }

    function findReportById(id) {
      return reportStore.reports.find((r) => r.id === id) || null;
    }

    // ---------------------------------------------------------------
    // VIEW
    // ---------------------------------------------------------------
    const showViewDialog = ref(false);
    const viewingReport = ref(null);

    function viewReport(id) {
      viewingReport.value = findReportById(id);
      showViewDialog.value = true;
    }
    const START_YEAR = 2025;
    const currentYear = new Date().getFullYear();

    const yearOptions = Array.from(
      { length: currentYear + 1 - START_YEAR + 1 },
      (_, i) => currentYear + 1 - i
    );
    const selectedYear = ref(currentYear);
    function viewReport(id) {
      viewingReport.value = findReportById(id);
      selectedYear.value = currentYear;
      reportStore.clearError();
      showViewDialog.value = true;
    }


    async function generateReport() {
      const year = selectedYear.value;
      const result = await reportStore.downloadAgencyLearningReport(year);

      if (!result.success) {
        notify("error", result.message);
        return;
      }

      const url = window.URL.createObjectURL(
        new Blob([result.blob], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `AGENCY_LEARNING_AND_DEVELOPMENT_MONITORING_REPORT_${year}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showViewDialog.value = false;
      notify("success", "Report generated successfully.");
    }






    // ---------------------------------------------------------------
    // FETCH ON MOUNT
    // ---------------------------------------------------------------
    onMounted(() => {
      reportStore.fetchReports();
    });

    return {
      reportStore,
      search,
      columns,
      filteredRows,
      clearFilters,

      showViewDialog,
      viewingReport,
      viewReport,
      yearOptions,
      selectedYear,
      generateReport,



    };
  },
});
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */

.report-page {
  min-height: 100%;
  padding: 20px;
  color: #19354a;
}

/* =========================================================
   PAGE HEADER
========================================================= */

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 18px;
}

.page-header h5 {
  margin: 5px 0 3px;

  color: #19354a;
  font-size: 18px;
  font-weight: 750;
}

.add-report-btn {
  min-height: 42px;

  padding: 0 18px;

  border-radius: 9px;

  color: #ffffff;
  background: linear-gradient(135deg, #18b64d, #0ca344);

  font-size: 12px;
  font-weight: 650;

  box-shadow: 0 4px 10px rgba(16, 167, 70, 0.18);
}

/* =========================================================
   REPORTS CARD
========================================================= */

.reports-card {
  overflow: hidden;

  border-radius: 13px;

  background: #ffffff;

  box-shadow: 0 3px 12px rgba(30, 70, 42, 0.055);
}

/* =========================================================
   FILTERS
========================================================= */

.filter-section {
  display: flex;
  align-items: center;

  gap: 10px;

  padding: 13px 20px;

  border-top: 1px solid #edf1ef;
  border-bottom: 1px solid #edf1ef;

  background: #fcfdfc;
}

.search-input {
  flex: 1;

  max-width: 380px;
}

.search-input :deep(.q-field__control) {
  min-height: 38px;

  border-radius: 8px;
}

.search-input :deep(.q-field__native) {
  font-size: 11px;
}

.search-input :deep(.q-field__prepend) {
  color: #809097;
}

.clear-btn {
  color: #6f8087;

  font-size: 10px;
}

/* =========================================================
   TABLE
========================================================= */

.table-wrapper {
  padding: 0 12px;
}

/* =========================================================
   ACTIONS
========================================================= */

.action-buttons {
  display: flex;
  justify-content: center;

  gap: 2px;
}

.action-view {
  color: #4b7c94;
}

/* =========================================================
   TABLE FOOTER
========================================================= */

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 13px 20px;

  border-top: 1px solid #edf1ef;

  color: #87949a;

  font-size: 10px;
}

.table-footer strong {
  color: #405967;
}

/* =========================================================
   DIALOG
========================================================= */

.report-dialog {
  width: 560px;
  max-width: 92vw;

  border-radius: 14px;
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  padding: 16px 18px;
}

.dialog-title {
  color: #19354a;

  font-size: 16px;
  font-weight: 750;
}

.dialog-subtitle {
  margin-top: 2px;

  color: #839097;

  font-size: 10px;
}

.dialog-body {
  padding: 16px 18px;
}

.dialog-actions {
  padding: 10px 18px;

  background: #fcfdfc;
}

.cancel-btn {
  color: #718089;

  font-size: 11px;
}

.save-btn {
  min-height: 35px;

  padding: 0 16px;

  border-radius: 8px;

  color: #ffffff;

  background: linear-gradient(135deg, #18b64d, #0ca344);

  font-size: 11px;
}

/* =========================================================
   FORM
========================================================= */

.section-label {
  margin: 14px 0 8px;

  color: #8a989e;

  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.section-label:first-of-type {
  margin-top: 0;
}

.form-grid {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 10px;
}

.form-grid .col-span-2 {
  grid-column: 1 / -1;
}

.form-grid :deep(.q-field__control) {
  border-radius: 8px;
}

.form-grid :deep(.q-field__native),
.form-grid :deep(.q-field__label) {
  font-size: 11px;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 900px) {
  .filter-section {
    flex-wrap: wrap;
  }

  .search-input {
    max-width: none;

    width: 100%;
    flex-basis: 100%;
  }
}

@media (max-width: 650px) {
  .report-page {
    padding: 14px;
  }

  .page-header {
    align-items: flex-start;

    gap: 15px;

    flex-direction: column;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .app-table {
    min-width: 700px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>