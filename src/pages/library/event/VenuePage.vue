<template>
    <q-page class="Venue-page">
        <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
        <section class="page-header">
            <div>
                <h5>Venue Management</h5>

                <!-- <p>Manage learning and development Venues and their schedules.</p> -->
            </div>

            <q-btn unelevated no-caps icon="add" label="Add Venue" class="add-Venue-btn" @click="openAddVenue" />
        </section>

        <!-- =====================================================
         VenueS CARD
    ====================================================== -->
        <q-card flat class="Venues-card">
            <!-- ===================================================
           FILTERS
      ==================================================== -->
            <div class="filter-section">
                <q-input v-model="search" outlined dense clearable
                    placeholder="Search by Venue name, venue, or status..." class="search-input">
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
                <q-table flat :rows="filteredRows" :columns="columns" row-key="Venue_id" hide-pagination
                    :rows-per-page-options="[0]" :loading="VenueStore.loading" class="app-table">
                    <!-- Venue NAME -->
                    <template #body-cell-Venue="props">
                        <q-td :props="props">
                            <div class="app-table-cell-title">{{ props.row.venue_name }}</div>

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
                                    @click="viewVenue(props.row.venueId)">
                                    <q-tooltip>View Venue</q-tooltip>
                                </q-btn>

                                <q-btn flat round dense icon="edit" class="action-edit"
                                    @click="editVenue(props.row.venueId)">
                                    <q-tooltip>Edit Venue</q-tooltip>
                                </q-btn>

                                <q-btn flat round dense icon="delete" class="action-delete"
                                    @click="confirmDeleteVenue(props.row.venueId)">
                                    <q-tooltip>Delete Venue</q-tooltip>
                                </q-btn>
                            </div>
                        </q-td>
                    </template>

                    <!-- EMPTY STATE -->
                    <template #no-data>
                        <div class="app-table-empty">No Venues found.</div>
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
                    <strong>{{ VenueStore.Venues.length }}</strong>
                    Venues
                </span>
            </div>
        </q-card>

        <!-- =====================================================
         EDIT Venue DIALOG
    ====================================================== -->
        <!-- =====================================================
     EDIT Venue DIALOG
====================================================== -->
        <q-dialog v-model="showEditDialog">
            <q-card class="Venue-dialog">
                <q-card-section class="dialog-header">
                    <div>
                        <div class="dialog-venue">Edit</div>
                        <div class="dialog-subvenue">Edit this Venue name</div>
                    </div>

                    <q-btn flat round dense icon="close" v-close-popup />
                </q-card-section>

                <q-separator />

                <q-card-section class="dialog-body">
                    <q-banner v-if="VenueStore.error" dense rounded class="bg-red-2 text-red-9 q-mb-sm">
                        {{ VenueStore.error }}
                    </q-banner>

                    <div class="section-label">Venue Details</div>

                    <div class="form-grid">
                        <q-input v-model="editForm.venue_name" outlined dense label="Venue Name" class="col-span-2" />
                    </div>
                </q-card-section>

                <q-card-actions align="right" class="dialog-actions">
                    <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />

                    <q-btn unelevated no-caps label="Save Changes" class="save-btn" :loading="VenueStore.loading"
                        @click="updateVenueSubmit" />
                </q-card-actions>
            </q-card>
        </q-dialog>
        <!-- =====================================================
     VIEW Venue DIALOG
====================================================== -->
        <q-dialog v-model="showViewDialog">
            <q-card class="Venue-dialog">
                <q-card-section class="dialog-header">
                    <div>
                        <div class="dialog-venue">Venue Details</div>
                        <div class="dialog-subvenue">
                            View information for this venue.
                        </div>
                    </div>

                    <q-btn flat round dense icon="close" v-close-popup />
                </q-card-section>

                <q-separator />

                <q-card-section class="dialog-body">
                    <div class="section-label">Venue Details</div>

                    <div class="form-grid">
                        <q-input :model-value="viewingVenue?.venue_name" outlined dense readonly label="Venue Name"
                            class="col-span-2" />

                        <q-input :model-value="viewingVenue?.created_at" outlined dense readonly label="Created At"
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
                    <div class="delete-venue">Delete Venue</div>
                    <div class="delete-message">
                        Are you sure you want to delete
                        <strong>{{ VenueToDelete?.venue_name }}</strong>? This action cannot be undone.
                    </div>
                </q-card-section>

                <q-card-actions align="right" class="dialog-actions">
                    <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />

                    <q-btn unelevated no-caps label="Delete" class="delete-btn" :loading="VenueStore.loading"
                        @click="deleteVenue" />
                </q-card-actions>
            </q-card>
        </q-dialog>
        <!-- =====================================================
     ADD Venue DIALOG
====================================================== -->
        <q-dialog v-model="showAddDialog">
            <q-card class="Venue-dialog">
                <q-card-section class="dialog-header">
                    <div>
                        <div class="dialog-venue">Add Venue</div>
                        <div class="dialog-subvenue">Create a new Venue</div>
                    </div>

                    <q-btn flat round dense icon="close" v-close-popup />
                </q-card-section>

                <q-separator />

                <q-card-section class="dialog-body">
                    <q-banner v-if="VenueStore.error" dense rounded class="bg-red-2 text-red-9 q-mb-sm">
                        {{ VenueStore.error }}
                    </q-banner>

                    <div class="section-label">Venue Details</div>

                    <div class="form-grid">
                        <q-input v-model="addForm.venue_name" outlined dense label="Venue Name" class="col-span-2" />
                    </div>
                </q-card-section>

                <q-card-actions align="right" class="dialog-actions">
                    <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />

                    <q-btn unelevated no-caps label="Create Venue" class="save-btn" :loading="VenueStore.loading"
                        @click="createVenueSubmit" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>
<script>
import { defineComponent, computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useVenueStore } from "src/stores/library/event/venueStore";
export default defineComponent({
    name: "VenuePage",

    setup() {
        const $q = useQuasar();
        const VenueStore = useVenueStore();
        const search = ref("");

        // ---------------------------------------------------------------
        // Table
        // ---------------------------------------------------------------
        const columns = [
            // { name: "venueId", label: "id", field: "venueId", align: "left" },
            {
                name: "venue",
                label: "Venue Name",
                field: "venue_name",
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

        // Flattens each Venue into a row the table can use
        const tableRows = computed(() =>
            VenueStore.Venues.map((venue) => ({
                // no: index + 1,
                venueId: venue.venueId,
                venue_name: venue.venue_name,
                create_at: venue.created_at,
                raw: venue,
            }))
        );

        const filteredRows = computed(() => {
            const keyword = search.value.toLowerCase().trim();
            if (!keyword) return tableRows.value;

            return tableRows.value.filter((row) =>
                row.venue_name?.toLowerCase().includes(keyword)
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

        // heplper function venueId
        function findVenueById(venueId) {
            return VenueStore.Venues.find((t) => t.venueId === venueId);
        }

        // ---------------------------------------------------------------
        // VIEW Venue
        // ---------------------------------------------------------------
        const showViewDialog = ref(false);
        const viewingVenue = ref(null);

        function viewVenue(venueId) {
            viewingVenue.value = findVenueById(venueId);
            showViewDialog.value = true;
        }
        // ---------------------------------------------------------------
        // ADD / EDIT Venue
        // ---------------------------------------------------------------
        // ---------------------------------------------------------------
        // ADD Venue
        // ---------------------------------------------------------------
        const showAddDialog = ref(false);
        const addForm = ref({ venue_name: "" });

        function openAddVenue() {
            addForm.value = { venue_name: "" };
            VenueStore.clearError();
            showAddDialog.value = true;
        }

        async function createVenueSubmit() {
            VenueStore.clearError();

            const payload = { venue_name: addForm.value.venue_name };
            const result = await VenueStore.createVenue(payload);

            if (result.success) {
                showAddDialog.value = false;
                notify("success", result.message || "Venue created successfully.");
            } else {
                notify("error", result.message || "Failed to create venue.");
            }
        }

        // ---------------------------------------------------------------
        // EDIT Venue
        // ---------------------------------------------------------------
        const showEditDialog = ref(false);
        const editingVenue = ref(null);
        const editForm = ref({ venue_name: "" });

        function editVenue(venueId) {
            const venue = findVenueById(venueId);
            if (!venue) return;

            editingVenue.value = venue;
            editForm.value = { venue_name: venue.venue_name || "" };
            VenueStore.clearError();
            showEditDialog.value = true;
        }

        async function updateVenueSubmit() {
            VenueStore.clearError();

            const payload = { venue_name: editForm.value.venue_name };
            const result = await VenueStore.updateVenue(editingVenue.value.venueId, payload);

            if (result.success) {
                showEditDialog.value = false;
                notify("success", result.message || "Venue updated successfully.");
            } else {
                notify("error", result.message || "Failed to update venue.");
            }
        }

        // ---------------------------------------------------------------
        // DELETE Venue
        // ---------------------------------------------------------------
        const showDeleteDialog = ref(false);
        const VenueToDelete = ref(null);

        function confirmDeleteVenue(venueId) {
            VenueToDelete.value = findVenueById(venueId);
            showDeleteDialog.value = true;
        }

        async function deleteVenue() {
            if (!VenueToDelete.value) return;

            const result = await VenueStore.deleteVenue(VenueToDelete.value.venueId);

            if (result.success) {
                showDeleteDialog.value = false;
                notify("success", result.message || "Venue deleted successfully.");
            } else {
                notify("error", result.message || "Failed to delete venue.");
            }
        }

        // ---------------------------------------------------------------
        // FETCH ON MOUNT
        // ---------------------------------------------------------------
        onMounted(() => {
            VenueStore.fetchVenues();
        });

        return {
            VenueStore,

            search,
            columns,
            filteredRows,
            clearFilters,

            // View
            showViewDialog,
            viewingVenue,
            viewVenue,

            // Add
            showAddDialog,
            addForm,
            openAddVenue,
            createVenueSubmit,

            // Edit
            showEditDialog,
            editForm,
            editVenue,
            updateVenueSubmit,

            // Delete
            showDeleteDialog,
            VenueToDelete,
            confirmDeleteVenue,
            deleteVenue,
        };
    },
});
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */

.Venue-page {
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

.add-Venue-btn {
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
   VenueS CARD
========================================================= */

.Venues-card {
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

.Venue-dialog {
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

.dialog-venue {
    color: #19354a;

    font-size: 16px;
    font-weight: 750;
}

.dialog-subvenue {
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

.delete-venue {
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
    .Venue-page {
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
