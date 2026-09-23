<template>
    <q-page class="Type-page">
        <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
        <section class="page-header">
            <div>
                <h5>Activity Management</h5>

                <!-- <p>Manage learning and development Types and their schedules.</p> -->
            </div>

            <q-btn unelevated no-caps icon="add" label="Add Activity" class="add-Type-btn" @click="openAddType" />
        </section>

        <!-- =====================================================
         TypeS CARD
    ====================================================== -->
        <q-card flat class="Types-card">
            <!-- ===================================================
           FILTERS
      ==================================================== -->
            <div class="filter-section">
                <q-input v-model="search" outlined dense clearable placeholder="Search" class="search-input">
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
                <q-table flat :rows="filteredRows" :columns="columns" row-key="Type_id" hide-pagination
                    :rows-per-page-options="[0]" :loading="TypeStore.loading" class="app-table">
                    <!-- Type NAME -->
                    <template #body-cell-Type="props">
                        <q-td :props="props">
                            <div class="app-table-cell-title">{{ props.row.type_name }}</div>

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
                                    @click="viewType(props.row.typeId)">
                                    <q-tooltip>View Activity</q-tooltip>
                                </q-btn>

                                <q-btn flat round dense icon="edit" class="action-edit"
                                    @click="editType(props.row.typeId)">
                                    <q-tooltip>Edit Activity</q-tooltip>
                                </q-btn>

                                <q-btn flat round dense icon="delete" class="action-delete"
                                    @click="confirmDeleteType(props.row.typeId)">
                                    <q-tooltip>Delete Activity</q-tooltip>
                                </q-btn>
                            </div>
                        </q-td>
                    </template>

                    <!-- EMPTY STATE -->
                    <template #no-data>
                        <div class="app-table-empty">No Activity found.</div>
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
                    <strong>{{ TypeStore.Types.length }}</strong>
                    Activity
                </span>
            </div>
        </q-card>

        <!-- =====================================================
         EDIT Type DIALOG
    ====================================================== -->
        <!-- =====================================================
     EDIT Type DIALOG
====================================================== -->
        <q-dialog v-model="showEditDialog">
            <q-card class="Type-dialog">
                <q-card-section class="dialog-header">
                    <div>
                        <div class="dialog-type">Edit</div>
                        <div class="dialog-subtype">Edit this Activity name</div>
                    </div>

                    <q-btn flat round dense icon="close" v-close-popup />
                </q-card-section>

                <q-separator />

                <q-card-section class="dialog-body">
                    <q-banner v-if="TypeStore.error" dense rounded class="bg-red-2 text-red-9 q-mb-sm">
                        {{ TypeStore.error }}
                    </q-banner>

                    <div class="section-label">Activity Details</div>

                    <div class="form-grid">
                        <q-input v-model="editForm.type_name" outlined dense label="Activity Name" class="col-span-2" />
                    </div>
                </q-card-section>

                <q-card-actions align="right" class="dialog-actions">
                    <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />

                    <q-btn unelevated no-caps label="Save Changes" class="save-btn" :loading="TypeStore.loading"
                        @click="updateTypeSubmit" />
                </q-card-actions>
            </q-card>
        </q-dialog>
        <!-- =====================================================
     VIEW Type DIALOG
====================================================== -->
        <q-dialog v-model="showViewDialog">
            <q-card class="Type-dialog">
                <q-card-section class="dialog-header">
                    <div>
                        <div class="dialog-type">Activity Details</div>
                        <div class="dialog-subtype">
                            View information for this Activity.
                        </div>
                    </div>

                    <q-btn flat round dense icon="close" v-close-popup />
                </q-card-section>

                <q-separator />

                <q-card-section class="dialog-body">
                    <div class="section-label">Activity Details</div>

                    <div class="form-grid">
                        <q-input :model-value="viewingType?.type_name" outlined dense readonly label="Activity Name"
                            class="col-span-2" />

                        <q-input :model-value="viewingType?.created_at" outlined dense readonly label="Created At"
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
                    <div class="delete-type">Delete Activity</div>
                    <div class="delete-message">
                        Are you sure you want to delete
                        <strong>{{ TypeToDelete?.type_name }}</strong>? This action cannot be undone.
                    </div>
                </q-card-section>

                <q-card-actions align="right" class="dialog-actions">
                    <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />

                    <q-btn unelevated no-caps label="Delete" class="delete-btn" :loading="TypeStore.loading"
                        @click="deleteType" />
                </q-card-actions>
            </q-card>
        </q-dialog>
        <!-- =====================================================
     ADD Type DIALOG
====================================================== -->
        <q-dialog v-model="showAddDialog">
            <q-card class="Type-dialog">
                <q-card-section class="dialog-header">
                    <div>
                        <div class="dialog-type">Add Activity</div>
                        <div class="dialog-subtype">Create a new Activity</div>
                    </div>

                    <q-btn flat round dense icon="close" v-close-popup />
                </q-card-section>

                <q-separator />

                <q-card-section class="dialog-body">
                    <q-banner v-if="TypeStore.error" dense rounded class="bg-red-2 text-red-9 q-mb-sm">
                        {{ TypeStore.error }}
                    </q-banner>

                    <div class="section-label">Activity Details</div>

                    <div class="form-grid">
                        <q-input v-model="addForm.type_name" outlined dense label="Activity Name" class="col-span-2" />
                    </div>
                </q-card-section>

                <q-card-actions align="right" class="dialog-actions">
                    <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />

                    <q-btn unelevated no-caps label="Create Activity" class="save-btn" :loading="TypeStore.loading"
                        @click="createTypeSubmit" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>
<script>
import { defineComponent, computed, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { useTypeStore } from "src/stores/library/event/typeStore";
export default defineComponent({
    name: "TypePage",

    setup() {
        const $q = useQuasar();
        const TypeStore = useTypeStore();
        const search = ref("");

        // ---------------------------------------------------------------
        // Table
        // ---------------------------------------------------------------
        const columns = [
            // { name: "typeId", label: "id", field: "typeId", align: "left" },
            {
                name: "type",
                label: "Activity",
                field: "type_name",
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

        // Flattens each Type into a row the table can use
        const tableRows = computed(() =>
            TypeStore.Types.map((type) => ({
                // no: index + 1,
                typeId: type.typeId,
                type_name: type.type_name,
                create_at: type.created_at,
                raw: type,
            }))
        );

        const filteredRows = computed(() => {
            const keyword = search.value.toLowerCase().trim();
            if (!keyword) return tableRows.value;

            return tableRows.value.filter((row) =>
                row.type_name?.toLowerCase().includes(keyword)
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

        // heplper function typeId
        function findTypeById(typeId) {
            return TypeStore.Types.find((t) => t.typeId === typeId);
        }

        // ---------------------------------------------------------------
        // VIEW Type
        // ---------------------------------------------------------------
        const showViewDialog = ref(false);
        const viewingType = ref(null);

        function viewType(typeId) {
            viewingType.value = findTypeById(typeId);
            showViewDialog.value = true;
        }
        // ---------------------------------------------------------------
        // ADD / EDIT Type
        // ---------------------------------------------------------------
        // ---------------------------------------------------------------
        // ADD Type
        // ---------------------------------------------------------------
        const showAddDialog = ref(false);
        const addForm = ref({ type_name: "" });

        function openAddType() {
            addForm.value = { type_name: "" };
            TypeStore.clearError();
            showAddDialog.value = true;
        }

        async function createTypeSubmit() {
            TypeStore.clearError();

            const payload = { type_name: addForm.value.type_name };
            const result = await TypeStore.createType(payload);

            if (result.success) {
                showAddDialog.value = false;
                notify("success", result.message || "Type created successfully.");
            } else {
                notify("error", result.message || "Failed to create type.");
            }
        }

        // ---------------------------------------------------------------
        // EDIT Type
        // ---------------------------------------------------------------
        const showEditDialog = ref(false);
        const editingType = ref(null);
        const editForm = ref({ type_name: "" });

        function editType(typeId) {
            const type = findTypeById(typeId);
            if (!type) return;

            editingType.value = type;
            editForm.value = { type_name: type.type_name || "" };
            TypeStore.clearError();
            showEditDialog.value = true;
        }

        async function updateTypeSubmit() {
            TypeStore.clearError();

            const payload = { type_name: editForm.value.type_name };
            const result = await TypeStore.updateType(editingType.value.typeId, payload);

            if (result.success) {
                showEditDialog.value = false;
                notify("success", result.message || "Type updated successfully.");
            } else {
                notify("error", result.message || "Failed to update type.");
            }
        }

        // ---------------------------------------------------------------
        // DELETE Type
        // ---------------------------------------------------------------
        const showDeleteDialog = ref(false);
        const TypeToDelete = ref(null);

        function confirmDeleteType(typeId) {
            TypeToDelete.value = findTypeById(typeId);
            showDeleteDialog.value = true;
        }

        async function deleteType() {
            if (!TypeToDelete.value) return;

            const result = await TypeStore.deleteType(TypeToDelete.value.typeId);

            if (result.success) {
                showDeleteDialog.value = false;
                notify("success", result.message || "Type deleted successfully.");
            } else {
                notify("error", result.message || "Failed to delete type.");
            }
        }

        // ---------------------------------------------------------------
        // FETCH ON MOUNT
        // ---------------------------------------------------------------
        onMounted(() => {
            TypeStore.fetchTypes();
        });

        return {
            TypeStore,

            search,
            columns,
            filteredRows,
            clearFilters,

            // View
            showViewDialog,
            viewingType,
            viewType,

            // Add
            showAddDialog,
            addForm,
            openAddType,
            createTypeSubmit,

            // Edit
            showEditDialog,
            editForm,
            editType,
            updateTypeSubmit,

            // Delete
            showDeleteDialog,
            TypeToDelete,
            confirmDeleteType,
            deleteType,
        };
    },
});
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */

.Type-page {
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

.add-Type-btn {
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
   TypeS CARD
========================================================= */

.Types-card {
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

.Type-dialog {
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

.dialog-type {
    color: #19354a;

    font-size: 16px;
    font-weight: 750;
}

.dialog-subtype {
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

.delete-type {
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
    .Type-page {
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
