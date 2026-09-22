<template>
    <q-page class="submission-page">
        <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
        <section class="page-header">
            <div>
                <h5>Submission of Forms</h5>
                <p>Track employee form submissions and certificate release status.</p>
            </div>
        </section>

        <!-- =====================================================
         SUBMISSION CARD
    ====================================================== -->
        <q-card flat class="submission-card">
            <!-- ===================================================
           FILTERS
      ==================================================== -->
            <div class="filter-section">
                <!-- <q-input v-model="search" outlined dense clearable
                    placeholder="Search by name, control no., or status..." class="search-input">
                    <template #prepend>
                        <q-icon name="search" />
                    </template>
                </q-input> -->
                <q-input v-model="search" outlined dense clearable
                placeholder="Search by name..." class="search-input"
                @update:model-value="onSearchInput">
                <template #prepend>
                    <q-icon name="search" />
                </template>
            </q-input>

                <q-btn flat no-caps icon="filter_alt_off" label="Clear" class="clear-btn" @click="clearFilters" />
            </div>

            <!-- ===================================================
           TABLE
      ==================================================== -->
            <div class="table-wrapper">
             <q-table flat :rows="submissionStore.list" :columns="columns" row-key="control_no"
    v-model:pagination="pagination" :loading="submissionStore.loading" class="submission-table"
    @request="onRequest">
    <!-- FULL NAME -->
    <template #body-cell-full_name="props">
        <q-td :props="props">
            <div class="employee-name">{{ props.row.full_name }}</div>
            <div class="employee-meta">{{ props.row.control_no }}</div>
        </q-td>
    </template>

    <!-- APPROVALS PROGRESS -->
    <template #body-cell-approved="props">
        <q-td :props="props">
            <span class="approval-count">
                {{ props.row.approved }} / {{ props.row.required_approvals }}
            </span>
        </q-td>
    </template>

    <!-- CERTIFICATE STATUS -->
    <template #body-cell-certificate_status="props">
        <q-td :props="props">
            <span class="status-badge" :class="statusClass(props.row.certificate_status)">
                {{ props.row.certificate_status }}
            </span>
        </q-td>
    </template>

    <!-- ACTIONS -->
    <template #body-cell-actions="props">
        <q-td :props="props">
            <div class="action-buttons">
                <q-btn flat dense round icon="visibility" color="primary"
                    @click.stop="viewEmployeeInformation(props.row)">
                    <q-tooltip>View Details</q-tooltip>
                </q-btn>
                <q-btn flat dense round icon="workspace_premium" color="blue"
                    @click.stop="certificatePreview(props.row)">
                    <q-tooltip>Preview</q-tooltip>
                </q-btn>
            </div>
        </q-td>
    </template>

    <!-- EMPTY STATE -->
    <template #no-data>
        <div class="table-empty">No submissions found.</div>
    </template>
</q-table>
            </div>

            <!-- ===================================================
           TABLE FOOTER
      ==================================================== -->
        </q-card>

        <!-- =====================================================
            CERTIFICATE PREVIEW DIALOG
        ==================================================== -->
        <q-dialog v-model="showCertificateModal" @hide="closeCertificatePreview">
            <q-card class="certificate-preview-dialog">
                <q-card-section class="dialog-header">
                    <div class="dialog-title">Certificate Preview</div>
                    <q-btn flat round dense icon="close" v-close-popup />
                </q-card-section>

                <q-separator />

                <!-- <q-card-section class="q-pa-none">
                    <q-inner-loading :showing="loadingCertificate" color="primary" />

                    <iframe v-if="certificateUrl" :src="certificateUrl" class="certificate-frame" title="Certificate Preview">
                    </iframe>
                </q-card-section> -->
                <q-card-section class="q-pa-none certificate-body">
                    <q-inner-loading :showing="loadingCertificate" color="primary" />
                    <iframe v-if="certificateUrl" :src="certificateUrl" class="certificate-frame"
                        title="Certificate Preview"></iframe>
                </q-card-section>

                <q-separator />

                <q-card-actions align="right" class="dialog-actions">
                    <q-btn flat no-caps label="Close" v-close-popup />
                    <q-btn unelevated no-caps label="Send Certificate" icon="send" class="send-cert-btn"
                        :loading="sendingCertificate" :disable="!certificateUrl" @click="sendCertificate" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- =====================================================
         VIEW SUBMISSION DIALOG
    ====================================================== -->
        <!-- import -->
        <EmployeeInformationModal v-model="showEmployeeModal" :employee-data="EmployeeInformation"
            :loading="loadingEmployeeInfo" @view-submission="handleViewSubmission" />
    </q-page>
</template>

<script>
import { defineComponent, onMounted, ref } from "vue";
import Swal from "sweetalert2";
import { useEmployeeSubmissionStore } from "src/stores/administrator/employee/employeeSubmissionStore";
import { useEmployeeInformationStore } from "src/stores/administrator/employee/employeeInformationStore";
import EmployeeInformationModal from "src/components/employee/EmployeeInformationModal.vue";
import { useCertificationStore } from "src/stores/administrator/certification/certificateStore";

export default defineComponent({
    name: "EmployeeSubmissionPage",
    components: { EmployeeInformationModal },

    setup() {
        const submissionStore = useEmployeeSubmissionStore();
        const employeeInformationStore = useEmployeeInformationStore();
        const certificationStore = useCertificationStore();
        const search = ref("");

        // ---------------------------------------------------------------
        // Table
        // ---------------------------------------------------------------
        const columns = [
            { name: "full_name", label: "Employee", field: "full_name", align: "left", sortable: true },
            { name: "pending", label: "Pending", field: "pending", align: "center" },
            { name: "returned", label: "Returned", field: "returned", align: "center" },
            { name: "approved", label: "Approved", field: "approved", align: "center" },
            { name: "certificate_status", label: "Status", field: "certificate_status", align: "center" },
            { name: "actions", label: "Action", field: "actions", align: "center" },
        ];
        const pagination = ref({
            page: 1,
            rowsPerPage: 10,
            rowsNumber: 0,   // kailangan ito para malaman ng q-table ang total count mula sa server
        });

     
          async function loadSubmissions() {
        const result = await submissionStore.fetchEmployeeSubmission({
            page: pagination.value.page,
            per_page: pagination.value.rowsPerPage,
            search: search.value || undefined,
        });

        if (result.success) {
            pagination.value.rowsNumber = submissionStore.pagination.total;
        }
    }

    // tinatawag ito ng q-table mismo tuwing magpapalit ng page/rows-per-page/sort
    function onRequest(requestProp) {
        pagination.value.page = requestProp.pagination.page;
        pagination.value.rowsPerPage = requestProp.pagination.rowsPerPage;
        loadSubmissions();
    }

    // debounce ang search — hintayin munang tumigil sa pag-type ng 400ms
    // bago mag-request, para hindi umapak ng API call sa bawat letrang type
    let searchTimeout = null;
    function onSearchInput() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            pagination.value.page = 1;   // balik sa page 1 tuwing may bagong search
            loadSubmissions();
        }, 400);
    }

    function clearFilters() {
        search.value = "";
        pagination.value.page = 1;
        loadSubmissions();
    }

    function statusClass(status) {
        switch (status) {
            case "Complete":
                return "status-releasing";
            case "Incomplete":
                return "status-incomplete";
            default:
                return "status-incomplete";
        }
    }

        // ---------------------------------------------------------------
        // VIEW EMPLOYEE INFORMATION
        // ---------------------------------------------------------------
        const showEmployeeModal = ref(false);
        const EmployeeInformation = ref({});
        const loadingEmployeeInfo = ref(false);

        async function viewEmployeeInformation(row) {
            loadingEmployeeInfo.value = true;

            const result = await employeeInformationStore.fetchEmployeeInformation(row.nominated_employee_id);

            loadingEmployeeInfo.value = false;

            if (result.success) {
                EmployeeInformation.value = result.data;
                showEmployeeModal.value = true;
            } else {
                Swal.fire({
                    title: "Failed",
                    text: result.message || "Unable to fetch employee information.",
                    icon: "error",
                    scrollbarPadding: false,
                });
            }
        }

        function handleViewSubmission(row) {
            Swal.fire({
                title: "No preview available",
                text: `Walang naka-registered na view para sa form: "${row.form_name}".`,
                icon: "info",
                scrollbarPadding: false,
            });
        }
        // ---------------------------------------------------------------
        // CERTIFICATE PREVIEW
        // ---------------------------------------------------------------
        const showCertificateModal = ref(false);
        const certificateUrl = ref(null);
        const loadingCertificate = ref(false);
        const previewingRow = ref(null);   // 👈 bagong ref — itatago kung sinong employee ang preview
        const sendingCertificate = ref(false);   // 👈 idagdag — dating wala


        async function certificatePreview(row) {
            previewingRow.value = row;       // 👈 itago muna
            showCertificateModal.value = true;
            loadingCertificate.value = true;

            const result = await certificationStore.fetchCertificate(row.nominated_employee_id);

            loadingCertificate.value = false;

            if (result.success) {
                const rawUrl = window.URL.createObjectURL(
                    new Blob([result.blob], { type: "application/pdf" })
                );
                certificateUrl.value = `${rawUrl}#zoom=60`;   // 👈 idagdag ang fragment
            }
            else {
                showCertificateModal.value = false;
                Swal.fire({
                    title: "Failed",
                    text: result.message || "Unable to preview certificate.",
                    icon: "error",
                    scrollbarPadding: false,
                });
            }
        }

        async function sendCertificate() {
            if (!previewingRow.value) return;

            const row = previewingRow.value;

            const confirm = await Swal.fire({
                title: "Certificate",
                text: `Are you want to send Certificate ${row.full_name}?`,
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Send",
                cancelButtonText: "Cancel",
                confirmButtonColor: "#18b64d",
                cancelButtonColor: "#9e9e9e",
                reverseButtons: true,
                scrollbarPadding: false,
                heightAuto: false,
            });

            if (!confirm.isConfirmed) return;

            sendingCertificate.value = true;

            const result = await certificationStore.sendCertificate(row.nominated_employee_id);

            sendingCertificate.value = false;

            if (result.success) {
                showCertificateModal.value = false;

                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "success",
                    title: "Certificate sent successfully.",
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                    scrollbarPadding: false,
                });

                // i-refresh ang listahan para ma-update yung certificate_status
                await submissionStore.fetchEmployeeSubmission();
            } else {
                Swal.fire({
                    title: "Failed",
                    text: result.message || "Unable to send certificate.",
                    icon: "error",
                    scrollbarPadding: false,
                });
            }
        }

        function closeCertificatePreview() {
            if (certificateUrl.value) {
                window.URL.revokeObjectURL(certificateUrl.value);
                certificateUrl.value = null;
            }
            previewingRow.value = null;
        }

        // ---------------------------------------------------------------
        // FETCH ON MOUNT
        // ---------------------------------------------------------------
         onMounted(() => {
            loadSubmissions();
        });


        return {
            submissionStore,

            search,
            columns,
                 pagination,
                       onRequest,
        onSearchInput,
        
            clearFilters,
            statusClass,

            viewEmployeeInformation,
            handleViewSubmission,
            showEmployeeModal,
            EmployeeInformation,
            loadingEmployeeInfo,


            certificatePreview,
            showCertificateModal,
            certificateUrl,
            loadingCertificate,
            closeCertificatePreview,

            sendCertificate,        // 👈 idagdag
            sendingCertificate,     // 👈 idagdag
        };
    },
});
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */

.submission-page {
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

.page-header p {
    margin: 0;

    color: #718089;
    font-size: 12px;
}

/* =========================================================
   CARD
========================================================= */

.submission-card {
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

.submission-table {
    box-shadow: none;
}

.submission-table :deep(th) {
    height: 48px;

    color: #819097;

    background: #ffffff;

    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.3px;
}

.submission-table :deep(td) {
    height: 68px;

    color: #425b68;

    border-color: #edf1ef;

    font-size: 11px;
}

.submission-table :deep(tbody tr:hover) {
    background: #fafffb;
}

.table-empty {
    padding: 30px 0;

    text-align: center;

    color: #8a989e;

    font-size: 12px;
}

/* =========================================================
   EMPLOYEE NAME CELL
========================================================= */

.employee-name {
    color: #19354a;

    font-size: 11px;
    font-weight: 700;
}

.employee-meta {
    margin-top: 3px;

    color: #8a989e;

    font-size: 9px;
}

/* =========================================================
   APPROVAL COUNT
========================================================= */

.approval-count {
    color: #405967;

    font-size: 11px;
    font-weight: 700;
}

/* =========================================================
   STATUS BADGE
========================================================= */

.status-badge {
    display: inline-flex;
    align-items: center;

    padding: 4px 10px;

    border-radius: 20px;

    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.2px;
    text-transform: uppercase;
}

.status-releasing {
    color: #087c42;
    background: #e1f7e7;
}

.status-incomplete {
    color: #b7791f;
    background: #fdf3e0;
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

.submission-dialog {
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
   APPROVAL SUMMARY
========================================================= */

.approval-summary {
    display: grid;

    grid-template-columns: repeat(4, 1fr);

    gap: 10px;

    margin-bottom: 4px;
}

.approval-item {
    padding: 12px 8px;

    border-radius: 10px;

    background: #f8fafb;

    text-align: center;
}

.approval-value {
    font-size: 20px;
    font-weight: 750;
}

.approval-value.pending {
    color: #b7791f;
}

.approval-value.approved {
    color: #087c42;
}

.approval-value.returned {
    color: #c73f3f;
}

.approval-value.required {
    color: #405967;
}

.approval-label {
    margin-top: 4px;

    color: #8a989e;

    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.3px;
    text-transform: uppercase;
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
    .submission-page {
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

    .submission-table {
        min-width: 700px;
    }

    .approval-summary {
        grid-template-columns: repeat(2, 1fr);
    }
}

.certificate-preview-dialog {
    width: 1500px;
    max-width: 95vw;
    height: 85vh;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.certificate-preview-dialog :deep(.certificate-body) {
    flex: 1;
    min-height: 0;
    /* kailangan ito para gumana nang tama ang flex sa loob ng scroll container */
    overflow: hidden;
}

.certificate-frame {
    width: 100%;
    height: 100%;
    /* 👈 dating 78vh, palitan ng 100% para sumunod na lang sa parent nito */
    border: none;
    display: block;
}

.dialog-actions {
    padding: 12px 16px;
    background: #fcfdfc;
}

.send-cert-btn {
    background: linear-gradient(135deg, #18b64d, #0ca344);
    color: #ffffff;
    border-radius: 8px;
    padding: 0 16px;
}
</style>