<template>
    <q-page class="Category-page">
        <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
        <section class="page-header">
            <div>
                <h5>Competency Management</h5>

                <!-- <p>Manage learning and development Categorys and their schedules.</p> -->
            </div>

            <q-btn unelevated no-caps icon="add" label="Add Compentecy" class="add-Category-btn" @click="openAddCategory" />
        </section>

        <!-- =====================================================
         CategoryS CARD
    ====================================================== -->
        <q-card flat class="Categorys-card">
            <!-- ===================================================
           FILTERS
      ==================================================== -->
            <div class="filter-section">
                <q-input v-model="search" outlined dense clearable
                    placeholder="Search by compentecy" class="search-input">
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
                <q-table flat :rows="filteredRows" :columns="columns" row-key="Category_id" hide-pagination
                    :rows-per-page-options="[0]" :loading="CategoryStore.loading" class="Categorys-table">
                    <!-- Category NAME -->
                    <template #body-cell-Category="props">
                        <q-td :props="props">
                            <div class="Category-name">{{ props.row.category_name }}</div>
                        
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
                                    @click="viewCategory(props.row.categoryId)">
                                    <q-tooltip>View Compentecy</q-tooltip>
                                </q-btn>

                                <q-btn flat round dense icon="edit" class="action-edit"
                                    @click="editCategory(props.row.categoryId)">
                                    <q-tooltip>Edit Compentecy</q-tooltip>
                                </q-btn>

                                <q-btn flat round dense icon="delete" class="action-delete"
                                    @click="confirmDeleteCategory(props.row.categoryId)">
                                    <q-tooltip>Delete Compentecy</q-tooltip>
                                </q-btn>
                            </div>
                        </q-td>
                    </template>

                    <!-- EMPTY STATE -->
                    <template #no-data>
                        <div class="table-empty">No Categorys found.</div>
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
                    <strong>{{ CategoryStore.Categorys.length }}</strong>
                    Categorys
                </span>
            </div>
        </q-card>

        <!-- =====================================================
         EDIT Category DIALOG
    ====================================================== -->
        <!-- =====================================================
     EDIT Category DIALOG
====================================================== -->
        <q-dialog v-model="showEditDialog">
            <q-card class="Category-dialog">
                <q-card-section class="dialog-header">
                    <div>
                        <div class="dialog-category">Edit</div>
                        <div class="dialog-subcategory">Edit this Compentecy name</div>
                    </div>

                    <q-btn flat round dense icon="close" v-close-popup />
                </q-card-section>

                <q-separator />

                <q-card-section class="dialog-body">
                    <q-banner v-if="CategoryStore.error" dense rounded class="bg-red-2 text-red-9 q-mb-sm">
                        {{ CategoryStore.error }}
                    </q-banner>

                    <div class="section-label">Compentecy Details</div>

                    <div class="form-grid">
                        <q-input v-model="editForm.category_name" outlined dense label="Compentecy Name" class="col-span-2" />
                    </div>
                </q-card-section>

                <q-card-actions align="right" class="dialog-actions">
                    <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />

                    <q-btn unelevated no-caps label="Save Changes" class="save-btn" :loading="CategoryStore.loading"
                        @click="updateCategorySubmit" />
                </q-card-actions>
            </q-card>
        </q-dialog>
        <!-- =====================================================
     VIEW Category DIALOG
====================================================== -->
        <q-dialog v-model="showViewDialog">
            <q-card class="Category-dialog">
                <q-card-section class="dialog-header">
                    <div>
                        <div class="dialog-category">Compentecy Details</div>
                        <div class="dialog-subcategory">
                            View information for this Compentecy.
                        </div>
                    </div>

                    <q-btn flat round dense icon="close" v-close-popup />
                </q-card-section>

                <q-separator />

                <q-card-section class="dialog-body">
                    <div class="section-label">Compentecy Details</div>

                    <div class="form-grid">
                        <q-input :model-value="viewingCategory?.category_name" outlined dense readonly label="Compentecy Name"
                            class="col-span-2" />

                        <q-input :model-value="viewingCategory?.created_at" outlined dense readonly label="Created At"
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
                    <div class="delete-category">Delete Compentecy</div>
                    <div class="delete-message">
                        Are you sure you want to delete
                        <strong>{{ CategoryToDelete?.category_name }}</strong>? This action cannot be undone.
                    </div>
                </q-card-section>

                <q-card-actions align="right" class="dialog-actions">
                    <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />

                    <q-btn unelevated no-caps label="Delete" class="delete-btn" :loading="CategoryStore.loading"
                        @click="deleteCategory" />
                </q-card-actions>
            </q-card>
        </q-dialog>
        <!-- =====================================================
     ADD Category DIALOG
====================================================== -->
        <q-dialog v-model="showAddDialog">
            <q-card class="Category-dialog">
                <q-card-section class="dialog-header">
                    <div>
                        <div class="dialog-category">Add Compentecy</div>
                        <div class="dialog-subcategory">Create a new Compentecy</div>
                    </div>

                    <q-btn flat round dense icon="close" v-close-popup />
                </q-card-section>

                <q-separator />

                <q-card-section class="dialog-body">
                    <q-banner v-if="CategoryStore.error" dense rounded class="bg-red-2 text-red-9 q-mb-sm">
                        {{ CategoryStore.error }}
                    </q-banner>

                    <div class="section-label">Compentecy Details</div>

                    <div class="form-grid">
                        <q-input v-model="addForm.category_name" outlined dense label="Compentecy Name" class="col-span-2" />
                    </div>
                </q-card-section>

                <q-card-actions align="right" class="dialog-actions">
                    <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />

                    <q-btn unelevated no-caps label="Create Compentecy" class="save-btn" :loading="CategoryStore.loading"
                        @click="createCategorySubmit" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>
<script>
import { defineComponent, computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useCategoryStore } from "src/stores/library/event/categoryStore";
export default defineComponent({
    name: "CategoryPage",

    setup() {
        const $q = useQuasar();
        const router = useRouter();
        const CategoryStore = useCategoryStore();
        const search = ref("");

        // ---------------------------------------------------------------
        // Table
        // ---------------------------------------------------------------
        const columns = [
            { name: "categoryId", label: "id", field: "categoryId", align: "left" },
            {
                name: "category",
                label: "Competency",
                field: "category_name",
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

        // Flattens each Category into a row the table can use
        const tableRows = computed(() =>
            CategoryStore.Categorys.map((category) => ({
                // no: index + 1,
                categoryId: category.categoryId,
                category_name: category.category_name,
                create_at: category.created_at,
                raw: category,
            }))
        );

        const filteredRows = computed(() => {
            const keyword = search.value.toLowerCase().trim();
            if (!keyword) return tableRows.value;

            return tableRows.value.filter((row) =>
                row.category_name?.toLowerCase().includes(keyword)
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

        // heplper function categoryId
        function findCategoryById(categoryId) {
            return CategoryStore.Categorys.find((t) => t.categoryId === categoryId);
        }

        // ---------------------------------------------------------------
        // VIEW Category
        // ---------------------------------------------------------------
        const showViewDialog = ref(false);
        const viewingCategory = ref(null);

        function viewCategory(categoryId) {
            viewingCategory.value = findCategoryById(categoryId);
            showViewDialog.value = true;
        }
        // ---------------------------------------------------------------
        // ADD / EDIT Category
        // ---------------------------------------------------------------
        // ---------------------------------------------------------------
        // ADD Category
        // ---------------------------------------------------------------
        const showAddDialog = ref(false);
        const addForm = ref({ category_name: "" });

        function openAddCategory() {
            addForm.value = { category_name: "" };
            CategoryStore.clearError();
            showAddDialog.value = true;
        }

        async function createCategorySubmit() {
            CategoryStore.clearError();

            const payload = { category_name: addForm.value.category_name };
            const result = await CategoryStore.createCategory(payload);

            if (result.success) {
                showAddDialog.value = false;
                notify("success", result.message || "Category created successfully.");
            } else {
                notify("error", result.message || "Failed to create category.");
            }
        }

        // ---------------------------------------------------------------
        // EDIT Category
        // ---------------------------------------------------------------
        const showEditDialog = ref(false);
        const editingCategory = ref(null);
        const editForm = ref({ category_name: "" });

        function editCategory(categoryId) {
            const category = findCategoryById(categoryId);
            if (!category) return;

            editingCategory.value = category;
            editForm.value = { category_name: category.category_name || "" };
            CategoryStore.clearError();
            showEditDialog.value = true;
        }

        async function updateCategorySubmit() {
            CategoryStore.clearError();

            const payload = { category_name: editForm.value.category_name };
            const result = await CategoryStore.updateCategory(editingCategory.value.categoryId, payload);

            if (result.success) {
                showEditDialog.value = false;
                notify("success", result.message || "Category updated successfully.");
            } else {
                notify("error", result.message || "Failed to update category.");
            }
        }

        // ---------------------------------------------------------------
        // DELETE Category
        // ---------------------------------------------------------------
        const showDeleteDialog = ref(false);
        const CategoryToDelete = ref(null);

        function confirmDeleteCategory(categoryId) {
            CategoryToDelete.value = findCategoryById(categoryId);
            showDeleteDialog.value = true;
        }

        async function deleteCategory() {
            if (!CategoryToDelete.value) return;

            const result = await CategoryStore.deleteCategory(CategoryToDelete.value.categoryId);

            if (result.success) {
                showDeleteDialog.value = false;
                notify("success", result.message || "Category deleted successfully.");
            } else {
                notify("error", result.message || "Failed to delete category.");
            }
        }

        // ---------------------------------------------------------------
        // FETCH ON MOUNT
        // ---------------------------------------------------------------
        onMounted(() => {
            CategoryStore.fetchCategorys();
        });

        return {
            CategoryStore,

            search,
            columns,
            filteredRows,
            clearFilters,

            // View
            showViewDialog,
            viewingCategory,
            viewCategory,

            // Add
            showAddDialog,
            addForm,
            openAddCategory,
            createCategorySubmit,

            // Edit
            showEditDialog,
            editForm,
            editCategory,
            updateCategorySubmit,

            // Delete
            showDeleteDialog,
            CategoryToDelete,
            confirmDeleteCategory,
            deleteCategory,
        };
    },
});
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */

.Category-page {
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

.add-Category-btn {
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
   CategoryS CARD
========================================================= */

.Categorys-card {
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

.Categorys-table {
    box-shadow: none;
}

.Categorys-table :deep(th) {
    height: 48px;

    color: #819097;

    background: #ffffff;

    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.3px;
}

.Categorys-table :deep(td) {
    height: 68px;

    color: #425b68;

    border-color: #edf1ef;

    font-size: 11px;
}

.Categorys-table :deep(tbody tr:hover) {
    background: #fafffb;
}

.table-empty {
    padding: 30px 0;

    text-align: center;

    color: #8a989e;

    font-size: 12px;
}

/* =========================================================
   Category NAME CELL
========================================================= */

.Category-name {
    color: #19354a;

    font-size: 11px;
    font-weight: 700;
}

.Category-meta {
    margin-top: 3px;

    color: #8a989e;

    font-size: 9px;
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

.Category-dialog {
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

.dialog-category {
    color: #19354a;

    font-size: 16px;
    font-weight: 750;
}

.dialog-subcategory {
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

.delete-category {
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
    .Category-page {
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

    .Categorys-table {
        min-width: 700px;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }
}
</style>
