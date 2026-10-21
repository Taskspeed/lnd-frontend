<template>
    <q-page class="submission-page">
        <!-- PAGE HEADER -->
        <section class="page-header">
            <div>
                <h5>Submission of Forms</h5>
                <p>Track event participants and certificate release status.</p>
            </div>
        </section>

        <q-card flat class="submission-card">
            <!-- FILTERS -->
            <div class="filter-section">
                <q-input v-model="search" outlined dense clearable placeholder="Search by event title..."
                    class="search-input" @update:model-value="onSearchInput">
                    <template #prepend>
                        <q-icon name="search" />
                    </template>
                </q-input>

                <q-btn flat no-caps icon="filter_alt_off" label="Clear" class="clear-btn" @click="clearFilters" />
            </div>

            <!-- TABLE -->
            <div class="table-wrapper">
                <q-table flat :rows="rows" :columns="columns" row-key="scheduleId" v-model:pagination="pagination"
                    :loading="employeeSubmissionStore.loading" :rows-per-page-options="[10, 20, 50, 100]"
                    class="app-table submission-table" @request="onRequest">
                    <!-- EVENT TITLE -->
                    <template #body-cell-title="props">
                        <q-td :props="props">
                            <div class="app-table-cell-title">{{ props.row.event?.title_name }}</div>
                        </q-td>
                    </template>

                    <!-- EVENT STATUS -->
                    <template #body-cell-computedStatus="props">
                        <q-td :props="props">
                            <span class="status-badge" :class="'status-' +(props.row.computedStatus)">
                                {{ props.row.computedStatus }}
                            </span>
                        </q-td>
                    </template>
                       <!-- <template #body-cell-status="props">
            <q-td :props="props">
              <span class="status-badge" :class="'status-' + props.row.computedStatus">
                {{ props.row.computedStatus }}
              </span>
            </q-td>
          </template> -->

                    <!-- ACTIONS -->
                    <template #body-cell-actions="props">
                        <q-td :props="props">
                            <div class="action-buttons">
                                <!-- placeholder only, no function yet -->
                                 <q-btn flat round dense icon="visibility" color="green" class="action-btn"
                                        @click="viewSchedule(props.row)">
                                      
                                    </q-btn>
                                    
                                    <q-tooltip>View</q-tooltip>
                            
                            </div>
                        </q-td>
                    </template>

                    <!-- EMPTY STATE -->
                    <template #no-data>
                        <div class="app-table-empty">No events found.</div>
                    </template>
                </q-table>
            </div>
        </q-card>
    </q-page>
</template>

<script>
import { defineComponent, computed, onMounted, ref } from "vue";
import Swal from "sweetalert2";
import { useEmployeeSubmissionStore } from "src/stores/administrator/employee/employeeSubmissionStore";
import { useRouter} from "vue-router";

export default defineComponent({
    name: "EmployeeSubmissionPage",

    setup() {
        const employeeSubmissionStore = useEmployeeSubmissionStore();
        const search = ref("");
        const router = useRouter();
        const rows = computed(() => employeeSubmissionStore.list);

        const columns = [
            {
                name: "title",
                label: "Event",
                align: "left",
                field: (row) => row.event?.title_name,
                style: "white-space: normal; min-width: 320px;",
            },
            { name: "schedule_date_range", label: "Schedule", field: "schedule_date_range", align: "left" },
            { name: "computedStatus", label: "Status", field: "computedStatus", align: "center" },
            { name: "participants_count", label: "Participants", field: "participants_count", align: "center" },
            {
                name: "certificates_issued_count",
                label: "Certificates Issued",
                field: "certificates_issued_count",
                align: "center",
            },
            { name: "actions", label: "Action", field: "actions", align: "center" },
        ];

        const pagination = ref({
            page: 1,
            rowsPerPage: 10,
            rowsNumber: 0,
        });

        async function loadEvents() {
            const result = await employeeSubmissionStore.fetchEventParticipantCertificate({
                page: pagination.value.page,
                per_page: pagination.value.rowsPerPage,
                search: search.value || undefined,
            });

            if (result.success) {
                pagination.value.rowsNumber = employeeSubmissionStore.pagination.total;
            } else {
                Swal.fire({
                    title: "Failed",
                    text: result.message || "Unable to fetch events.",
                    icon: "error",
                    scrollbarPadding: false,
                });
            }
        }

        function onRequest(requestProp) {
            pagination.value.page = requestProp.pagination.page;
            pagination.value.rowsPerPage = requestProp.pagination.rowsPerPage;
            loadEvents();
        }

        let searchTimeout = null;
        function onSearchInput() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                pagination.value.page = 1;
                loadEvents();
            }, 400);
        }

        function clearFilters() {
            search.value = "";
            pagination.value.page = 1;
            loadEvents();
        }

            function viewSchedule(row) {
        router.push({
            name: "event-participant-submission", // palitan ng actual route name mo sa router/routes.js
            params: {
            eventId: row.event_id,
            scheduleId: row.scheduleId,
            },
        });
        }

        onMounted(() => {
            loadEvents();
        });

        return {
            employeeSubmissionStore,
            rows,
            search,
            columns,
            pagination,
            onRequest,
            onSearchInput,
            clearFilters,
            viewSchedule
            
        };
    },
});
</script>

<style scoped>
.submission-page {
    min-height: 100%;
    padding: 20px;
    color: #19354a;
}

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

.submission-card {
    overflow: hidden;
    border-radius: 13px;
    background: #ffffff;
    box-shadow: 0 3px 12px rgba(30, 70, 42, 0.055);
}

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

.table-wrapper {
    padding: 0 12px;
}

.submission-table {
    box-shadow: none;
}

/* STATUS BADGE */
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


.status-default {
    color: #6f8087;
    background: #eef2f3;
}

.action-buttons {
    display: flex;
    justify-content: center;
    gap: 2px;
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