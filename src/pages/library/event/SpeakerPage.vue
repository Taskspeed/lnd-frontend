<template>
    <q-page class="Speaker-page">
        <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
        <section class="page-header">
            <div>
                <h5>Speaker Management</h5>

                <!-- <p>Manage learning and development Speakers and their schedules.</p> -->
            </div>

            <q-btn unelevated no-caps icon="add" label="Add Speaker" class="add-Speaker-btn" @click="openAddSpeaker" />
        </section>

        <!-- =====================================================
         SpeakerS CARD
    ====================================================== -->
        <q-card flat class="Speakers-card">
            <!-- ===================================================
           FILTERS
      ==================================================== -->
            <div class="filter-section">
                <q-input v-model="search" outlined dense clearable
                    placeholder="Search by Speaker name, venue, or status..." class="search-input">
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
                <q-table flat :rows="filteredRows" :columns="columns" row-key="Speaker_id" hide-pagination
                    :rows-per-page-options="[0]" :loading="SpeakerStore.loading" class="app-table">
                    <!-- Speaker NAME -->
                    <template #body-cell-Speaker="props">
                        <q-td :props="props">
                            <div class="app-table-cell-title">{{ props.row.speaker_name }}</div>

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
                                    @click="viewSpeaker(props.row.speakerId)">
                                    <q-tooltip>View Speaker</q-tooltip>
                                </q-btn>

                                <q-btn flat round dense icon="edit" class="action-edit"
                                    @click="editSpeaker(props.row.speakerId)">
                                    <q-tooltip>Edit Speaker</q-tooltip>
                                </q-btn>

                                <q-btn flat round dense icon="delete" class="action-delete"
                                    @click="confirmDeleteSpeaker(props.row.speakerId)">
                                    <q-tooltip>Delete Speaker</q-tooltip>
                                </q-btn>
                            </div>
                        </q-td>
                    </template>

                    <!-- EMPTY STATE -->
                    <template #no-data>
                        <div class="app-table-empty">No Speakers found.</div>
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
                    <strong>{{ SpeakerStore.Speakers.length }}</strong>
                    Speakers
                </span>
            </div>
        </q-card>

        <!-- =====================================================
         EDIT Speaker DIALOG
    ====================================================== -->
        <!-- =====================================================
     EDIT Speaker DIALOG
====================================================== -->
        <q-dialog v-model="showEditDialog">
            <q-card class="Speaker-dialog">
                <q-card-section class="dialog-header">
                    <div>
                        <div class="dialog-speaker">Edit</div>
                        <div class="dialog-subspeaker">Edit this Speaker name</div>
                    </div>

                    <q-btn flat round dense icon="close" v-close-popup />
                </q-card-section>

                <q-separator />

                <q-card-section class="dialog-body">
                    <q-banner v-if="SpeakerStore.error" dense rounded class="bg-red-2 text-red-9 q-mb-sm">
                        {{ SpeakerStore.error }}
                    </q-banner>

                    <div class="section-label">Speaker Details</div>

                    <div class="form-grid">
                        <q-input v-model="editForm.speaker_name" outlined dense label="Speaker Name"
                            class="col-span-2" />
                    </div>
                </q-card-section>

                <q-card-actions align="right" class="dialog-actions">
                    <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />

                    <q-btn unelevated no-caps label="Save Changes" class="save-btn" :loading="SpeakerStore.loading"
                        @click="updateSpeakerSubmit" />
                </q-card-actions>
            </q-card>
        </q-dialog>
        <!-- =====================================================
     VIEW Speaker DIALOG
====================================================== -->
        <q-dialog v-model="showViewDialog">
            <q-card class="Speaker-dialog">
                <q-card-section class="dialog-header">
                    <div>
                        <div class="dialog-speaker">Speaker Details</div>
                        <div class="dialog-subspeaker">
                            View information for this speaker.
                        </div>
                    </div>

                    <q-btn flat round dense icon="close" v-close-popup />
                </q-card-section>

                <q-separator />

                <q-card-section class="dialog-body">
                    <div class="section-label">Speaker Details</div>

                    <div class="form-grid">
                        <q-input :model-value="viewingSpeaker?.speaker_name" outlined dense readonly
                            label="Speaker Name" class="col-span-2" />

                        <q-input :model-value="viewingSpeaker?.created_at" outlined dense readonly label="Created At"
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
                    <div class="delete-speaker">Delete Speaker</div>
                    <div class="delete-message">
                        Are you sure you want to delete
                        <strong>{{ SpeakerToDelete?.speaker_name }}</strong>? This action cannot be undone.
                    </div>
                </q-card-section>

                <q-card-actions align="right" class="dialog-actions">
                    <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />

                    <q-btn unelevated no-caps label="Delete" class="delete-btn" :loading="SpeakerStore.loading"
                        @click="deleteSpeaker" />
                </q-card-actions>
            </q-card>
        </q-dialog>
        <!-- =====================================================
     ADD Speaker DIALOG
====================================================== -->
        <q-dialog v-model="showAddDialog">
            <q-card class="Speaker-dialog">
                <q-card-section class="dialog-header">
                    <div>
                        <div class="dialog-speaker">Add Speaker</div>
                        <div class="dialog-subspeaker">Create a new Speaker</div>
                    </div>

                    <q-btn flat round dense icon="close" v-close-popup />
                </q-card-section>

                <q-separator />

                <q-card-section class="dialog-body">
                    <q-banner v-if="SpeakerStore.error" dense rounded class="bg-red-2 text-red-9 q-mb-sm">
                        {{ SpeakerStore.error }}
                    </q-banner>

                    <div class="section-label">Speaker Details</div>

                    <div class="form-grid">
                        <q-input v-model="addForm.speaker_name" outlined dense label="Speaker Name"
                            class="col-span-2" />
                    </div>
                </q-card-section>

                <q-card-actions align="right" class="dialog-actions">
                    <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />

                    <q-btn unelevated no-caps label="Create Speaker" class="save-btn" :loading="SpeakerStore.loading"
                        @click="createSpeakerSubmit" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>
<script>
import { defineComponent, computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useSpeakerStore } from "src/stores/library/event/speakerStore";
export default defineComponent({
    name: "SpeakerPage",

    setup() {
        const $q = useQuasar();
        const router = useRouter();
        const SpeakerStore = useSpeakerStore();
        const search = ref("");

        // ---------------------------------------------------------------
        // Table
        // ---------------------------------------------------------------
        const columns = [
            { name: "speakerId", label: "id", field: "speakerId", align: "left" },
            {
                name: "speaker",
                label: "Speaker Name",
                field: "speaker_name",
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

        // Flattens each Speaker into a row the table can use
        const tableRows = computed(() =>
            SpeakerStore.Speakers.map((speaker) => ({
                // no: index + 1,
                speakerId: speaker.speakerId,
                speaker_name: speaker.speaker_name,
                create_at: speaker.created_at,
                raw: speaker,
            }))
        );

        const filteredRows = computed(() => {
            const keyword = search.value.toLowerCase().trim();
            if (!keyword) return tableRows.value;

            return tableRows.value.filter((row) =>
                row.speaker_name?.toLowerCase().includes(keyword)
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

        // heplper function speakerId
        function findSpeakerById(speakerId) {
            return SpeakerStore.Speakers.find((t) => t.speakerId === speakerId);
        }

        // ---------------------------------------------------------------
        // VIEW Speaker
        // ---------------------------------------------------------------
        const showViewDialog = ref(false);
        const viewingSpeaker = ref(null);

        function viewSpeaker(speakerId) {
            viewingSpeaker.value = findSpeakerById(speakerId);
            showViewDialog.value = true;
        }
        // ---------------------------------------------------------------
        // ADD / EDIT Speaker
        // ---------------------------------------------------------------
        // ---------------------------------------------------------------
        // ADD Speaker
        // ---------------------------------------------------------------
        const showAddDialog = ref(false);
        const addForm = ref({ speaker_name: "" });

        function openAddSpeaker() {
            addForm.value = { speaker_name: "" };
            SpeakerStore.clearError();
            showAddDialog.value = true;
        }

        async function createSpeakerSubmit() {
            SpeakerStore.clearError();

            const payload = { speaker_name: addForm.value.speaker_name };
            const result = await SpeakerStore.createSpeaker(payload);

            if (result.success) {
                showAddDialog.value = false;
                notify("success", result.message || "Speaker created successfully.");
            } else {
                notify("error", result.message || "Failed to create speaker.");
            }
        }

        // ---------------------------------------------------------------
        // EDIT Speaker
        // ---------------------------------------------------------------
        const showEditDialog = ref(false);
        const editingSpeaker = ref(null);
        const editForm = ref({ speaker_name: "" });

        function editSpeaker(speakerId) {
            const speaker = findSpeakerById(speakerId);
            if (!speaker) return;

            editingSpeaker.value = speaker;
            editForm.value = { speaker_name: speaker.speaker_name || "" };
            SpeakerStore.clearError();
            showEditDialog.value = true;
        }

        async function updateSpeakerSubmit() {
            SpeakerStore.clearError();

            const payload = { speaker_name: editForm.value.speaker_name };
            const result = await SpeakerStore.updateSpeaker(editingSpeaker.value.speakerId, payload);

            if (result.success) {
                showEditDialog.value = false;
                notify("success", result.message || "Speaker updated successfully.");
            } else {
                notify("error", result.message || "Failed to update speaker.");
            }
        }

        // ---------------------------------------------------------------
        // DELETE Speaker
        // ---------------------------------------------------------------
        const showDeleteDialog = ref(false);
        const SpeakerToDelete = ref(null);

        function confirmDeleteSpeaker(speakerId) {
            SpeakerToDelete.value = findSpeakerById(speakerId);
            showDeleteDialog.value = true;
        }

        async function deleteSpeaker() {
            if (!SpeakerToDelete.value) return;

            const result = await SpeakerStore.deleteSpeaker(SpeakerToDelete.value.speakerId);

            if (result.success) {
                showDeleteDialog.value = false;
                notify("success", result.message || "Speaker deleted successfully.");
            } else {
                notify("error", result.message || "Failed to delete speaker.");
            }
        }

        // ---------------------------------------------------------------
        // FETCH ON MOUNT
        // ---------------------------------------------------------------
        onMounted(() => {
            SpeakerStore.fetchSpeakers();
        });

        return {
            SpeakerStore,

            search,
            columns,
            filteredRows,
            clearFilters,

            // View
            showViewDialog,
            viewingSpeaker,
            viewSpeaker,

            // Add
            showAddDialog,
            addForm,
            openAddSpeaker,
            createSpeakerSubmit,

            // Edit
            showEditDialog,
            editForm,
            editSpeaker,
            updateSpeakerSubmit,

            // Delete
            showDeleteDialog,
            SpeakerToDelete,
            confirmDeleteSpeaker,
            deleteSpeaker,
        };
    },
});
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */

.Speaker-page {
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

.add-Speaker-btn {
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
   SpeakerS CARD
========================================================= */

.Speakers-card {
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

.Speaker-dialog {
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

.dialog-speaker {
    color: #19354a;

    font-size: 16px;
    font-weight: 750;
}

.dialog-subspeaker {
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

.delete-speaker {
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
    .Speaker-page {
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
