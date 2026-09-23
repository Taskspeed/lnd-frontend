<template>
    <q-page class="submission-page">
        <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
        <section class="page-header">
            <div>
                <h5>Certificate</h5>
                <p>Employees who have already been issued a certificate.</p>
            </div>
        </section>

        <!-- =====================================================
         LIST CARD
    ====================================================== -->
        <q-card flat class="submission-card">
            <!-- ===================================================
           FILTERS
      ==================================================== -->
            <div class="filter-section">
                <q-input v-model="search" outlined dense clearable placeholder="Search by name..." class="search-input"
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
                <q-table flat :rows="certificateStore.list" :columns="columns" row-key="ControlNo"
                    v-model:pagination="pagination" :loading="certificateStore.loading"
                    class="app-table submission-table" @request="onRequest">
                    <!-- EMPLOYEE NAME -->
                    <template #body-cell-name="props">
                        <q-td :props="props">
                            <div class="app-table-cell-title">{{ props.row.name }}</div>
                            <!-- <div class="app-table-cell-meta">{{ props.row.ControlNo }}</div> -->
                        </q-td>
                    </template>
                    <!-- ACTIONS -->
                    <template #body-cell-actions="props">
                        <q-td :props="props">
                            <div class="action-buttons">

                                <q-btn flat dense round icon="visibility" color="primary"
                                    :loading="isLoading(props.row.ControlNo)" :disable="isAnyLoading()"
                                    @click.stop="viewEmployeeListCertification(props.row)">
                                    <q-tooltip>View Details</q-tooltip>
                                </q-btn>
                            </div>
                        </q-td>
                    </template>


                    <!-- EMPTY STATE -->
                    <template #no-data>
                        <div class="app-table-empty">No employees found.</div>
                    </template>
                </q-table>
            </div>
        </q-card>
        <EmployeeCertificateModal v-model="showEmployeeModal" :employee-data="EmployeeInformation" />
    </q-page>
</template>

<script>
import { defineComponent, onMounted, ref } from "vue";
import { useCertificationStore } from "src/stores/administrator/certification/certificateStore";
import EmployeeCertificateModal from "src/components/employee/EmployeeCertificateModal.vue";
import Swal from "sweetalert2";
import { useRowLoading } from "src/composables/useRowLoading";

export default defineComponent({
    name: "EmployeeCertificateReleasePage",
    components: {
        EmployeeCertificateModal,   // 👈 idagdag ito
    },
    setup() {
        const certificateStore = useCertificationStore();
        const search = ref("");
        const { isLoading, isAnyLoading, run } = useRowLoading();

        // ---------------------------------------------------------------
        // Table + Server-side Pagination
        // ---------------------------------------------------------------
        const columns = [
            { name: "name", label: "Employee", field: "name", align: "left", sortable: true },
            { name: "position", label: "Position", field: "position", align: "left" },
            { name: "status", label: "Status", field: "status", align: "center" },
            { name: "actions", label: "Action", field: "action", align: "center" },
        ];

        const pagination = ref({
            page: 1,
            rowsPerPage: 10,
            rowsNumber: 0,
        });

        async function loadEmployees() {
            const result = await certificateStore.fetchEmployeeReleaseCertificate({
                page: pagination.value.page,
                per_page: pagination.value.rowsPerPage,
                search: search.value || undefined,
            });

            if (result.success) {
                pagination.value.rowsNumber = certificateStore.pagination?.total ?? 0;
            }
        }

        function onRequest(requestProp) {
            pagination.value.page = requestProp.pagination.page;
            pagination.value.rowsPerPage = requestProp.pagination.rowsPerPage;
            loadEmployees();
        }

        let searchTimeout = null;
        function onSearchInput() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                pagination.value.page = 1;
                loadEmployees();
            }, 400);
        }

        function clearFilters() {
            search.value = "";
            pagination.value.page = 1;
            loadEmployees();
        }

        const showEmployeeModal = ref(false);
        const EmployeeInformation = ref({});

        async function viewEmployeeListCertification(row) {
            return run(row.ControlNo, async () => {
                const result = await certificateStore.fetchEmployeeListCertificate(row.ControlNo);

                if (result.success) {
                    EmployeeInformation.value = row;
                    showEmployeeModal.value = true;
                } else {
                    Swal.fire({
                        title: "Failed",
                        text: result.message || "Unable to fetch employee information.",
                        icon: "error",
                        scrollbarPadding: false,
                    });
                }
            });
        }




        onMounted(() => {
            loadEmployees();
        });

        return {
            certificateStore,
            search,
            columns,
            pagination,
            onRequest,
            onSearchInput,
            clearFilters,
            viewEmployeeListCertification,
            showEmployeeModal,
            isLoading,
            isAnyLoading,
            EmployeeInformation,
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
}
</style>