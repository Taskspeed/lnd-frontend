<template>
    <q-page class="Title-page">
        <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
        <section class="page-header">
            <div>
                <h5>Title Management</h5>

                <!-- <p>Manage learning and development Titles and their schedules.</p> -->
            </div>

            <q-btn unelevated no-caps icon="add" label="Add Title" class="add-Title-btn" @click="openAddTitle" />
        </section>

        <!-- =====================================================
         TitleS CARD
    ====================================================== -->
        <q-card flat class="Titles-card">
            <!-- ===================================================
           FILTERS
      ==================================================== -->
            <div class="filter-section">
                <q-input v-model="search" outlined dense clearable
                    placeholder="Search by Title name, venue, or status..." class="search-input">
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
                <q-table flat :rows="filteredRows" :columns="columns" row-key="Title_id" hide-pagination
                    :rows-per-page-options="[0]" :loading="TitleStore.loading" class="app-table">
                    <!-- Title NAME -->
                    <template #body-cell-Title="props">
                        <q-td :props="props">
                            <div class="app-table-cell-title">{{ props.row.title_name }}</div>

                        </q-td>
                    </template>

                    <!-- STATUS -->
                    <template #body-cell-status="props">
                        <q-td :props="props">
                            <span class="status-badge" :class="statusClass(props.row.status)">
                                {{ props.row.status }}
                            </span>
                        </q-td>
                    </template>

                    <!-- ACTIONS -->
                    <template #body-cell-actions="props">
                        <q-td :props="props">
                            <div class="action-buttons">
                                <q-btn flat round dense icon="visibility" class="action-view"
                                    @click="viewTitle(props.row.titleId)">
                                    <q-tooltip>View Title</q-tooltip>
                                </q-btn>

                                <q-btn flat round dense icon="edit" class="action-edit"
                                    @click="editTitle(props.row.titleId)">
                                    <q-tooltip>Edit Title</q-tooltip>
                                </q-btn>

                                <q-btn flat round dense icon="delete" class="action-delete"
                                    @click="confirmDeleteTitle(props.row.titleId)">
                                    <q-tooltip>Delete Title</q-tooltip>
                                </q-btn>
                            </div>
                        </q-td>
                    </template>

                    <!-- EMPTY STATE -->
                    <template #no-data>
                        <div class="app-table-empty">No Titles found.</div>
                    </template>
                </q-table>
            </div>

            <!-- ===================================================
           TABLE FOOTER
      ==================================================== -->
            <div class="table-footer">
                <span>
                    Showing
                    <strong>{{ filteredRows.length }}</strong>
                    of
                    <strong>{{ TitleStore.Titles.length }}</strong>
                    Titles
                </span>
            </div>
        </q-card>

        <!-- =====================================================
         EDIT Title DIALOG
    ====================================================== -->
        <!-- =====================================================
     EDIT Title DIALOG
====================================================== -->
        <q-dialog v-model="showEditDialog">
            <q-card class="Title-dialog">
                <q-card-section class="dialog-header">
                    <div>
                        <div class="dialog-title">Edit</div>
                        <div class="dialog-subtitle">Edit this Title name</div>
                    </div>

                    <q-btn flat round dense icon="close" v-close-popup />
                </q-card-section>

                <q-separator />

                <q-card-section class="dialog-body">
                    <q-banner v-if="TitleStore.error" dense rounded class="bg-red-2 text-red-9 q-mb-sm">
                        {{ TitleStore.error }}
                    </q-banner>

                    <div class="section-label">Title Details</div>

                    <div class="form-grid">
                        <q-input v-model="editForm.title_name" outlined dense label="Title Name" class="col-span-2" />
                    </div>
                </q-card-section>

                <q-card-actions align="right" class="dialog-actions">
                    <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />

                    <q-btn unelevated no-caps label="Save Changes" class="save-btn" :loading="TitleStore.loading"
                        @click="updateTitleSubmit" />
                </q-card-actions>
            </q-card>
        </q-dialog>
        <!-- =====================================================
     VIEW Title DIALOG
====================================================== -->
        <q-dialog v-model="showViewDialog">
            <q-card class="Title-dialog">
                <q-card-section class="dialog-header">
                    <div>
                        <div class="dialog-title">Title Details</div>
                        <div class="dialog-subtitle">
                            View information for this title.
                        </div>
                    </div>

                    <q-btn flat round dense icon="close" v-close-popup />
                </q-card-section>

                <q-separator />

                <q-card-section class="dialog-body">
                    <div class="section-label">Title Details</div>

                    <div class="form-grid">
                        <q-input :model-value="viewingTitle?.title_name" outlined dense readonly label="Title Name"
                            class="col-span-2" />

                        <q-input :model-value="viewingTitle?.created_at" outlined dense readonly label="Created At"
                            class="col-span-2" />
                    </div>
                </q-card-section>

                <q-card-actions align="right" class="dialog-actions">
                    <q-btn flat no-caps label="Close" class="cancel-btn" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- =====================================================
         DELETE CONFIRMATION DIALOG
    ====================================================== -->
        <q-dialog v-model="showDeleteDialog">
            <q-card class="delete-dialog">
                <q-card-section class="dialog-body">
                    <div class="delete-title">Delete Title</div>
                    <div class="delete-message">
                        Are you sure you want to delete
                        <strong>{{ TitleToDelete?.title_name }}</strong>? This action cannot be undone.
                    </div>
                </q-card-section>

                <q-card-actions align="right" class="dialog-actions">
                    <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />

                    <q-btn unelevated no-caps label="Delete" class="delete-btn" :loading="TitleStore.loading"
                        @click="deleteTitle" />
                </q-card-actions>
            </q-card>
        </q-dialog>
        <!-- =====================================================
     ADD Title DIALOG
====================================================== -->
        <q-dialog v-model="showAddDialog">
            <q-card class="Title-dialog">
                <q-card-section class="dialog-header">
                    <div>
                        <div class="dialog-title">Add Title</div>
                        <div class="dialog-subtitle">Create a new Title</div>
                    </div>

                    <q-btn flat round dense icon="close" v-close-popup />
                </q-card-section>

                <q-separator />

                <q-card-section class="dialog-body">
                    <q-banner v-if="TitleStore.error" dense rounded class="bg-red-2 text-red-9 q-mb-sm">
                        {{ TitleStore.error }}
                    </q-banner>

                    <div class="section-label">Title Details</div>

                    <div class="form-grid">
                        <q-input v-model="addForm.title_name" outlined dense label="Title Name" class="col-span-2" />
                    </div>
                </q-card-section>

                <q-card-actions align="right" class="dialog-actions">
                    <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />

                    <q-btn unelevated no-caps label="Create Title" class="save-btn" :loading="TitleStore.loading"
                        @click="createTitleSubmit" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>
<script>
import { defineComponent, computed, onMounted, ref } from "vue";

import { useQuasar } from "quasar";
import { useTitleStore } from "src/stores/library/event/titleStore";
export default defineComponent({
    name: "TitlePage",

    setup() {
        const $q = useQuasar();
        const TitleStore = useTitleStore();
        const search = ref("");

        // ---------------------------------------------------------------
        // Table
        // ---------------------------------------------------------------
        const columns = [
            // { name: "titleId", label: "id", field: "titleId", align: "left" },
            {
                name: "title",
                label: "Title Name",
                field: "title_name",
                align: "left",
                sortable: true,
            },
            {
                name: "create_at",
                label: "Created At",
                field: "create_at",
                align: "left",
            },
            { name: "actions", label: "action", field: "actions", align: "center" },
        ];

        // Flattens each Title into a row the table can use
        const tableRows = computed(() =>
            TitleStore.Titles.map((title) => ({
                // no: index + 1,
                titleId: title.titleId,
                title_name: title.title_name,
                create_at: title.created_at,
                raw: title,
            }))
        );

        const filteredRows = computed(() => {
            const keyword = search.value.toLowerCase().trim();
            if (!keyword) return tableRows.value;

            return tableRows.value.filter((row) =>
                row.title_name?.toLowerCase().includes(keyword)
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

        // heplper function titleId
        function findTitleById(titleId) {
            return TitleStore.Titles.find((t) => t.titleId === titleId);
        }

        // ---------------------------------------------------------------
        // VIEW Title
        // ---------------------------------------------------------------
        const showViewDialog = ref(false);
        const viewingTitle = ref(null);

        function viewTitle(titleId) {
            viewingTitle.value = findTitleById(titleId);
            showViewDialog.value = true;
        }
        // ---------------------------------------------------------------
        // ADD / EDIT Title
        // ---------------------------------------------------------------
        // ---------------------------------------------------------------
        // ADD Title
        // ---------------------------------------------------------------
        const showAddDialog = ref(false);
        const addForm = ref({ title_name: "" });

        function openAddTitle() {
            addForm.value = { title_name: "" };
            TitleStore.clearError();
            showAddDialog.value = true;
        }

        async function createTitleSubmit() {
            TitleStore.clearError();

            const payload = { title_name: addForm.value.title_name };
            const result = await TitleStore.createTitle(payload);

            if (result.success) {
                showAddDialog.value = false;
                notify("success", result.message || "Title created successfully.");
            } else {
                notify("error", result.message || "Failed to create title.");
            }
        }

        // ---------------------------------------------------------------
        // EDIT Title
        // ---------------------------------------------------------------
        const showEditDialog = ref(false);
        const editingTitle = ref(null);
        const editForm = ref({ title_name: "" });

        function editTitle(titleId) {
            const title = findTitleById(titleId);
            if (!title) return;

            editingTitle.value = title;
            editForm.value = { title_name: title.title_name || "" };
            TitleStore.clearError();
            showEditDialog.value = true;
        }

        async function updateTitleSubmit() {
            TitleStore.clearError();

            const payload = { title_name: editForm.value.title_name };
            const result = await TitleStore.updateTitle(editingTitle.value.titleId, payload);

            if (result.success) {
                showEditDialog.value = false;
                notify("success", result.message || "Title updated successfully.");
            } else {
                notify("error", result.message || "Failed to update title.");
            }
        }

        // ---------------------------------------------------------------
        // DELETE Title
        // ---------------------------------------------------------------
        const showDeleteDialog = ref(false);
        const TitleToDelete = ref(null);

        function confirmDeleteTitle(titleId) {
            TitleToDelete.value = findTitleById(titleId);
            showDeleteDialog.value = true;
        }

        async function deleteTitle() {
            if (!TitleToDelete.value) return;

            const result = await TitleStore.deleteTitle(TitleToDelete.value.titleId);

            if (result.success) {
                showDeleteDialog.value = false;
                notify("success", result.message || "Title deleted successfully.");
            } else {
                notify("error", result.message || "Failed to delete title.");
            }
        }

        // ---------------------------------------------------------------
        // FETCH ON MOUNT
        // ---------------------------------------------------------------
        onMounted(() => {
            TitleStore.fetchTitles();
        });

        return {
            TitleStore,

            search,
            columns,
            filteredRows,
            clearFilters,

            // View
            showViewDialog,
            viewingTitle,
            viewTitle,

            // Add
            showAddDialog,
            addForm,
            openAddTitle,
            createTitleSubmit,

            // Edit
            showEditDialog,
            editForm,
            editTitle,
            updateTitleSubmit,

            // Delete
            showDeleteDialog,
            TitleToDelete,
            confirmDeleteTitle,
            deleteTitle,
        };
    },
});
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */

.Title-page {
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

.add-Title-btn {
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
   TitleS CARD
========================================================= */

.Titles-card {
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

.status-created {
    color: #2b6cb0;
    background: #e7f0fb;
}

.status-ongoing {
    color: #087c42;
    background: #e1f7e7;
}

.status-completed {
    color: #5c6b73;
    background: #eef1f2;
}

.status-cancelled {
    color: #c73f3f;
    background: #fbe9e9;
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

.action-edit {
    color: #16a84a;
}

.action-delete {
    color: #d35d5d;
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

.Title-dialog {
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

.delete-btn {
    min-height: 35px;

    padding: 0 16px;

    border-radius: 8px;

    color: #ffffff;

    background: linear-gradient(135deg, #e05353, #c73f3f);

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
   DELETE DIALOG
========================================================= */

.delete-dialog {
    width: 400px;
    max-width: 92vw;

    border-radius: 14px;
}

.delete-title {
    color: #19354a;

    font-size: 15px;
    font-weight: 750;
}

.delete-message {
    margin-top: 6px;

    color: #5c6b73;

    font-size: 12px;
    line-height: 1.5;
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
    .Title-page {
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
