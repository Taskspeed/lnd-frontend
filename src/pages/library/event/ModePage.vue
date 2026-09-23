<template>
    <q-page class="Mode-page">
        <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
        <section class="page-header">
            <div>
                <h5>Mode Management</h5>

                <!-- <p>Manage learning and development Modes and their schedules.</p> -->
            </div>

            <q-btn unelevated no-caps icon="add" label="Add Mode" class="add-Mode-btn" @click="openAddMode" />
        </section>

        <!-- =====================================================
         ModeS CARD
    ====================================================== -->
        <q-card flat class="Modes-card">
            <!-- ===================================================
           FILTERS
      ==================================================== -->
            <div class="filter-section">
                <q-input v-model="search" outlined dense clearable
                    placeholder="Search by Mode name, venue, or status..." class="search-input">
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
                <q-table flat :rows="filteredRows" :columns="columns" row-key="Mode_id" hide-pagination
                    :rows-per-page-options="[0]" :loading="modeStore.loading" class="app-table">
                    <!-- Mode NAME -->
                    <template #body-cell-Mode="props">
                        <q-td :props="props">
                            <div class="app-table-cell-title">{{ props.row.mode_name }}</div>

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
                                    @click="viewMode(props.row.modeId)">
                                    <q-tooltip>View Mode</q-tooltip>
                                </q-btn>

                                <q-btn flat round dense icon="edit" class="action-edit"
                                    @click="editMode(props.row.modeId)">
                                    <q-tooltip>Edit Mode</q-tooltip>
                                </q-btn>

                                <q-btn flat round dense icon="delete" class="action-delete"
                                    @click="confirmDeleteMode(props.row.modeId)">
                                    <q-tooltip>Delete Mode</q-tooltip>
                                </q-btn>
                            </div>
                        </q-td>
                    </template>

                    <!-- EMPTY STATE -->
                    <template #no-data>
                        <div class="app-table-empty">No Modes found.</div>
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
                    <strong>{{ modeStore.modes.length }}</strong>
                    Modes
                </span>
            </div>
        </q-card>

        <!-- =====================================================
         EDIT Mode DIALOG
    ====================================================== -->
        <!-- =====================================================
     EDIT Mode DIALOG
====================================================== -->
        <q-dialog v-model="showEditDialog">
            <q-card class="Mode-dialog">
                <q-card-section class="dialog-header">
                    <div>
                        <div class="dialog-mode">Edit</div>
                        <div class="dialog-submode">Edit this Mode name</div>
                    </div>

                    <q-btn flat round dense icon="close" v-close-popup />
                </q-card-section>

                <q-separator />

                <q-card-section class="dialog-body">
                    <q-banner v-if="modeStore.error" dense rounded class="bg-red-2 text-red-9 q-mb-sm">
                        {{ modeStore.error }}
                    </q-banner>

                    <div class="section-label">Mode Details</div>

                    <div class="form-grid">
                        <q-input v-model="editForm.mode_name" outlined dense label="Mode Name" class="col-span-2" />
                    </div>
                </q-card-section>

                <q-card-actions align="right" class="dialog-actions">
                    <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />

                    <q-btn unelevated no-caps label="Save Changes" class="save-btn" :loading="modeStore.loading"
                        @click="updateModeSubmit" />
                </q-card-actions>
            </q-card>
        </q-dialog>
        <!-- =====================================================
     VIEW Mode DIALOG
====================================================== -->
        <q-dialog v-model="showViewDialog">
            <q-card class="Mode-dialog">
                <q-card-section class="dialog-header">
                    <div>
                        <div class="dialog-mode">Mode Details</div>
                        <div class="dialog-submode">
                            View information for this mode.
                        </div>
                    </div>

                    <q-btn flat round dense icon="close" v-close-popup />
                </q-card-section>

                <q-separator />

                <q-card-section class="dialog-body">
                    <div class="section-label">Mode Details</div>

                    <div class="form-grid">
                        <q-input :model-value="viewingMode?.mode_name" outlined dense readonly label="Mode Name"
                            class="col-span-2" />

                        <q-input :model-value="viewingMode?.created_at" outlined dense readonly label="Created At"
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
                    <div class="delete-mode">Delete Mode</div>
                    <div class="delete-message">
                        Are you sure you want to delete
                        <strong>{{ ModeToDelete?.mode_name }}</strong>? This action cannot be undone.
                    </div>
                </q-card-section>

                <q-card-actions align="right" class="dialog-actions">
                    <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />

                    <q-btn unelevated no-caps label="Delete" class="delete-btn" :loading="modeStore.loading"
                        @click="deleteMode" />
                </q-card-actions>
            </q-card>
        </q-dialog>
        <!-- =====================================================
     ADD Mode DIALOG
====================================================== -->
        <q-dialog v-model="showAddDialog">
            <q-card class="Mode-dialog">
                <q-card-section class="dialog-header">
                    <div>
                        <div class="dialog-mode">Add Mode</div>
                        <div class="dialog-submode">Create a new Mode</div>
                    </div>

                    <q-btn flat round dense icon="close" v-close-popup />
                </q-card-section>

                <q-separator />

                <q-card-section class="dialog-body">
                    <q-banner v-if="modeStore.error" dense rounded class="bg-red-2 text-red-9 q-mb-sm">
                        {{ modeStore.error }}
                    </q-banner>

                    <div class="section-label">Mode Details</div>

                    <div class="form-grid">
                        <q-input v-model="addForm.mode_name" outlined dense label="Mode Name" class="col-span-2" />
                    </div>
                </q-card-section>

                <q-card-actions align="right" class="dialog-actions">
                    <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />

                    <q-btn unelevated no-caps label="Create Mode" class="save-btn" :loading="modeStore.loading"
                        @click="createModeSubmit" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>
<script>
import { defineComponent, computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useModeStore } from "src/stores/library/event/modeStore";
export default defineComponent({
    name: "ModePage",

    setup() {
        const $q = useQuasar();
        const router = useRouter();
        const modeStore = useModeStore();
        const search = ref("");

        // ---------------------------------------------------------------
        // Table
        // ---------------------------------------------------------------
        const columns = [
            // { name: "modeId", label: "id", field: "modeId", align: "left" },
            {
                name: "mode",
                label: "Mode Name",
                field: "mode_name",
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

        // Flattens each Mode into a row the table can use
        const tableRows = computed(() =>
            modeStore.modes.map((mode) => ({
                // no: index + 1,
                modeId: mode.modeId,
                mode_name: mode.mode_name,
                create_at: mode.created_at,
                raw: mode,
            }))
        );

        const filteredRows = computed(() => {
            const keyword = search.value.toLowerCase().trim();
            if (!keyword) return tableRows.value;

            return tableRows.value.filter((row) =>
                row.mode_name?.toLowerCase().includes(keyword)
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

        // heplper function modeId
        function findModeById(modeId) {
            return modeStore.modes.find((t) => t.modeId === modeId);
        }

        // ---------------------------------------------------------------
        // VIEW Mode
        // ---------------------------------------------------------------
        const showViewDialog = ref(false);
        const viewingMode = ref(null);

        function viewMode(modeId) {
            viewingMode.value = findModeById(modeId);
            showViewDialog.value = true;
        }
        // ---------------------------------------------------------------
        // ADD / EDIT Mode
        // ---------------------------------------------------------------
        // ---------------------------------------------------------------
        // ADD Mode
        // ---------------------------------------------------------------
        const showAddDialog = ref(false);
        const addForm = ref({ mode_name: "" });

        function openAddMode() {
            addForm.value = { mode_name: "" };
            modeStore.clearError();
            showAddDialog.value = true;
        }

        async function createModeSubmit() {
            modeStore.clearError();

            const payload = { mode_name: addForm.value.mode_name };
            const result = await modeStore.createMode(payload);

            if (result.success) {
                showAddDialog.value = false;
                notify("success", result.message || "Mode created successfully.");
            } else {
                notify("error", result.message || "Failed to create mode.");
            }
        }

        // ---------------------------------------------------------------
        // EDIT Mode
        // ---------------------------------------------------------------
        const showEditDialog = ref(false);
        const editingMode = ref(null);
        const editForm = ref({ mode_name: "" });

        function editMode(modeId) {
            const mode = findModeById(modeId);
            if (!mode) return;

            editingMode.value = mode;
            editForm.value = { mode_name: mode.mode_name || "" };
            modeStore.clearError();
            showEditDialog.value = true;
        }

        async function updateModeSubmit() {
            modeStore.clearError();

            const payload = { mode_name: editForm.value.mode_name };
            const result = await modeStore.updateMode(editingMode.value.modeId, payload);

            if (result.success) {
                showEditDialog.value = false;
                notify("success", result.message || "Mode updated successfully.");
            } else {
                notify("error", result.message || "Failed to update mode.");
            }
        }

        // ---------------------------------------------------------------
        // DELETE Mode
        // ---------------------------------------------------------------
        const showDeleteDialog = ref(false);
        const ModeToDelete = ref(null);

        function confirmDeleteMode(modeId) {
            ModeToDelete.value = findModeById(modeId);
            showDeleteDialog.value = true;
        }

        async function deleteMode() {
            if (!ModeToDelete.value) return;

            const result = await modeStore.deleteMode(ModeToDelete.value.modeId);

            if (result.success) {
                showDeleteDialog.value = false;
                notify("success", result.message || "Mode deleted successfully.");
            } else {
                notify("error", result.message || "Failed to delete mode.");
            }
        }

        // ---------------------------------------------------------------
        // FETCH ON MOUNT
        // ---------------------------------------------------------------
        onMounted(() => {
            modeStore.fetchModes();
        });

        return {
            modeStore,

            search,
            columns,
            filteredRows,
            clearFilters,

            // View
            showViewDialog,
            viewingMode,
            viewMode,

            // Add
            showAddDialog,
            addForm,
            openAddMode,
            createModeSubmit,

            // Edit
            showEditDialog,
            editForm,
            editMode,
            updateModeSubmit,

            // Delete
            showDeleteDialog,
            ModeToDelete,
            confirmDeleteMode,
            deleteMode,
        };
    },
});
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */

.Mode-page {
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

.add-Mode-btn {
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
   ModeS CARD
========================================================= */

.Modes-card {
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

.Mode-dialog {
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

.dialog-mode {
    color: #19354a;

    font-size: 16px;
    font-weight: 750;
}

.dialog-submode {
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

.delete-mode {
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
    .Mode-page {
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
