<template>
    <q-page class="speaker-view-page">
        <!-- PAGE HEADER -->
        <section class="page-header">
            <div class="page-heading">
                <div class="page-heading-copy">
                    <div class="page-eyebrow">
                        <q-icon name="record_voice_over" />
                        Speaker profile
                    </div>
                    <h5>{{ speaker?.speaker_name || "Speaker" }}</h5>
                    <p>{{ editing ? "Editing speaker information." : "Personal, employment, and professional information." }}</p>
                </div>

                <div class="heading-actions">
                    <q-btn v-if="speaker && !editing" unelevated no-caps icon="edit" label="Edit Speaker"
                        class="edit-btn" @click="startEdit" />
                    <q-btn flat dense no-caps icon="arrow_back" label="Back to Speakers" class="back-btn"
                        @click="goBack" />
                </div>
            </div>
        </section>

        <!-- LOADING / ERROR -->
        <LoadingState v-if="SpeakerStore.loading && !speaker" message="Loading speaker..." full-page />
        <div v-else-if="SpeakerStore.error && !speaker" class="error-state">{{ SpeakerStore.error }}</div>

        <div v-else-if="speaker" class="details-col">
            <!-- =====================================================
           STEPPER: PERSONAL / EMPLOYMENT / PROFESSIONAL
      ====================================================== -->
            <q-card flat bordered class="detail-card">
                <q-banner v-if="editing && SpeakerStore.error" dense rounded class="bg-red-2 text-red-9 error-banner">
                    {{ SpeakerStore.error }}
                </q-banner>

                <q-stepper v-model="tab" flat animated header-nav color="green" class="speaker-stepper">
                    <!-- PERSONAL -->
                    <q-step name="personal" title="Personal" caption="Name and contact" icon="badge">
                        <div class="personal-layout">
                            <!-- PHOTO -->
                            <div class="photo-col">
                                <!-- EDIT: photo picker -->
                                <template v-if="editing">
                                    <button type="button" class="photo-picker" @click="fileRef?.pickFiles()">
                                        <img v-if="editPhotoSrc" :src="editPhotoSrc" alt="Speaker photo preview" />
                                        <span v-else class="photo-empty">
                                            <q-icon name="add_a_photo" size="28px" />
                                            <span>Add photo</span>
                                        </span>
                                    </button>

                                    <q-file ref="fileRef" v-model="photoFile" accept=".jpg,.jpeg,.png,.webp"
                                        :max-file-size="2097152" class="hidden" @rejected="onPhotoRejected" />

                                    <div class="photo-hint">JPG, PNG or WEBP, up to 2 MB</div>

                                    <q-btn v-if="editPhotoSrc" flat dense no-caps color="red" icon="delete"
                                        label="Remove" class="photo-remove" @click="removeEditPhoto" />
                                </template>

                                <!-- VIEW: photo -->
                                <div v-else class="photo-frame">
                                    <img v-if="speaker.profile_photo_url && !photoFailed"
                                        :src="speaker.profile_photo_url" :alt="speaker.speaker_name"
                                        @error="photoFailed = true" />
                                    <span v-else class="photo-initials">{{ initials }}</span>
                                </div>

                                <div class="pill-row">
                                    <span class="pill" :class="isActive ? 'pill-active' : 'pill-inactive'">
                                        {{ isActive ? "Active" : "Inactive" }}
                                    </span>
                                    <span v-if="speaker.employment?.employment_type" class="pill pill-type">
                                        {{ speaker.employment.employment_type }}
                                    </span>
                                </div>
                            </div>

                            <!-- EDIT: fields -->
                            <div v-if="editing" class="field-grid">
                                <q-input v-model="editForm.first_name" outlined dense label="First name *" lazy-rules
                                    :rules="[required]" class="span-2" />
                                <q-input v-model="editForm.middle_name" outlined dense label="Middle name"
                                    class="span-2" />
                                <q-input v-model="editForm.last_name" outlined dense label="Last name *" lazy-rules
                                    :rules="[required]" class="span-2" />

                                <q-select v-model="editForm.suffix" outlined dense clearable label="Suffix"
                                    :options="suffixOptions" class="span-2" />
                                <q-select v-model="editForm.gender" outlined dense label="Gender *"
                                    :options="genderOptions" lazy-rules :rules="[required]" class="span-2" />

                                <q-input v-model="editForm.birth_date" outlined dense label="Birth date *"
                                    mask="####-##-##" placeholder="YYYY-MM-DD" lazy-rules :rules="[required, validDate]"
                                    class="span-2">
                                    <template #append>
                                        <q-icon name="event" class="cursor-pointer">
                                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                                <q-date v-model="editForm.birth_date" mask="YYYY-MM-DD" color="green"
                                                    :options="notFuture">
                                                    <div class="row items-center justify-end">
                                                        <q-btn v-close-popup label="Done" color="green" flat no-caps />
                                                    </div>
                                                </q-date>
                                            </q-popup-proxy>
                                        </q-icon>
                                    </template>
                                </q-input>

                                <q-input v-model="editForm.email" outlined dense type="email" label="Email" lazy-rules
                                    :rules="[validEmail]" class="span-3">
                                    <template #prepend><q-icon name="mail_outline" size="18px" /></template>
                                </q-input>
                                <q-input v-model="editForm.contact_number" outlined dense label="Contact number"
                                    lazy-rules :rules="[validContact]" class="span-3">
                                    <template #prepend><q-icon name="call" size="18px" /></template>
                                </q-input>
                            </div>

                            <!-- VIEW: fields -->
                            <div v-else class="detail-grid">
                                <div class="detail-item detail-item-wide">
                                    <span class="detail-label">Full name</span>
                                    <span class="detail-value">{{ speaker.speaker_name }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Gender</span>
                                    <span class="detail-value">{{ show(speaker.gender) }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Birth date</span>
                                    <span class="detail-value">{{ birthDateLabel }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Email</span>
                                    <span class="detail-value">{{ show(speaker.email) }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Contact number</span>
                                    <span class="detail-value">{{ show(speaker.contact_number) }}</span>
                                </div>
                            </div>
                        </div>
                    </q-step>

                    <!-- EMPLOYMENT -->
                    <q-step name="employment" title="Employment" caption="Where they work" icon="work_outline">
                        <!-- EDIT -->
                        <div v-if="editing" class="field-grid">
                            <q-input v-model="editForm.position" outlined dense label="Position" class="span-3" />
                            <q-select v-model="editForm.employment_type" outlined dense clearable
                                label="Employment type" :options="employmentTypeOptions" class="span-3" />

                            <q-input v-model="editForm.office" outlined dense label="Office" class="span-4" />
                            <q-input v-model.number="editForm.salary_grade" outlined dense type="number" min="1"
                                max="33" label="Salary grade" hint="1 to 33" lazy-rules :rules="[validSg]"
                                class="span-2" />
                            <q-input v-model="editForm.agency" outlined dense label="Agency" class="span-6" />
                        </div>

                        <!-- VIEW -->
                        <div v-else class="detail-grid">
                            <div class="detail-item">
                                <span class="detail-label">Position</span>
                                <span class="detail-value">{{ show(speaker.employment?.position) }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Employment type</span>
                                <span class="detail-value">{{ show(speaker.employment?.employment_type) }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Agency</span>
                                <span class="detail-value">{{ show(speaker.employment?.agency) }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Office</span>
                                <span class="detail-value">{{ show(speaker.employment?.office) }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Salary grade</span>
                                <span class="detail-value">{{ salaryGradeLabel }}</span>
                            </div>
                        </div>
                    </q-step>

                    <!-- PROFESSIONAL -->
                    <q-step name="professional" title="Professional" caption="Expertise" icon="school">
                        <!-- EDIT -->
                        <div v-if="editing" class="field-grid">
                            <q-input v-model="editForm.professional_title" outlined dense label="Professional title"
                                hint="e.g. Engr., Dr., CPA" class="span-3" />
                            <q-input v-model.number="editForm.years_of_experience" outlined dense type="number" min="0"
                                max="80" label="Years of experience" lazy-rules :rules="[validYears]" class="span-3" />

                            <q-input v-model="editForm.specialization" outlined dense label="Specialization"
                                hint="Topics this speaker can handle" class="span-6" />

                            <q-input :model-value="show(speaker.professional_info?.educational_attainment)" outlined
                                dense readonly label="Educational attainment (read-only)" class="span-6" />

                            <q-input v-model="editForm.biography" outlined type="textarea" rows="5" counter
                                maxlength="1500" label="Biography" class="span-6" />
                        </div>

                        <!-- VIEW -->
                        <template v-else>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <span class="detail-label">Professional title</span>
                                    <span class="detail-value">{{ show(speaker.professional_info?.professional_title)
                                    }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Years of experience</span>
                                    <span class="detail-value">{{ experienceLabel }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Educational attainment</span>
                                    <span class="detail-value">{{
                                        show(speaker.professional_info?.educational_attainment) }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Specialization</span>
                                    <span class="detail-value">{{ show(speaker.professional_info?.specialization)
                                    }}</span>
                                </div>
                            </div>

                            <div class="bio-label">Biography</div>
                            <div v-if="speaker.professional_info?.biography" class="bio-text">
                                {{ speaker.professional_info.biography }}
                            </div>
                            <div v-else class="bio-empty">No biography added yet.</div>
                        </template>
                    </q-step>

                    <!-- NAVIGATION -->
                    <template #navigation>
                        <q-stepper-navigation class="tab-actions">
                            <q-btn v-if="editing" unelevated no-caps label="Cancel" class="cancel-btn"
                                :disable="SpeakerStore.loading" @click="cancelEdit" />
                            <q-space />
                            <q-btn v-if="tab !== 'personal'" flat no-caps icon="arrow_back" label="Back"
                                class="tab-back-btn" :disable="SpeakerStore.loading" @click="prevTab" />
                            <q-btn v-if="tab !== 'professional'" :flat="editing" :unelevated="!editing" no-caps
                                icon-right="arrow_forward" label="Next"
                                :class="editing ? 'next-btn-secondary' : 'next-btn'" @click="nextTab" />
                            <q-btn v-if="editing" unelevated no-caps icon="check" label="Save changes" class="save-btn"
                                :loading="SpeakerStore.loading" @click="saveChanges" />
                        </q-stepper-navigation>
                    </template>
                </q-stepper>
            </q-card>

            <!-- =====================================================
           EVENT ACTIVITY (HISTORY)
      ====================================================== -->
            <q-card flat bordered class="detail-card">
                <div class="section-head">
                    <q-icon name="event_note" class="section-icon" />
                    <div class="section-title">Event Activity</div>
                </div>

                <div class="detail-body">
                    <!-- STATS -->
                    <div class="stat-grid">
                        <div v-for="stat in eventStats" :key="stat.label" class="stat-card">
                            <div class="stat-icon" :class="stat.tone">
                                <q-icon :name="stat.icon" size="22px" />
                            </div>
                            <div>
                                <div class="stat-value">{{ stat.value }}</div>
                                <div class="stat-label">{{ stat.label }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- HISTORY -->
                    <div class="history-head">
                        <div class="bio-label history-label">Event History</div>
                        <q-input v-model="historySearch" outlined dense clearable debounce="400"
                            placeholder="Search event name..." class="history-search"
                            @update:model-value="loadHistory(1)">
                            <template #prepend><q-icon name="search" size="18px" /></template>
                        </q-input>
                    </div>

                    <div v-if="SpeakerStore.historyError" class="history-error">
                        {{ SpeakerStore.historyError }}
                    </div>

                    <div class="history-wrapper">
                        <q-table flat :rows="historyRows" :columns="historyColumns" row-key="schedule_id"
                            v-model:pagination="historyPagination" :loading="SpeakerStore.historyLoading"
                            :rows-per-page-options="[10,15,20]" class="history-table" @request="onHistoryRequest">
                            <template #body-cell-type_name="props">
                                <q-td :props="props">
                                    <span class="type-badge" :class="`type-${String(props.row.type_name).toLowerCase()}`">
                                        {{ props.row.type_name }}
                                    </span>
                                </q-td>
                            </template>

                            <template #no-data>
                                <div class="bio-empty history-empty">
                                    {{ historySearch ? "No events match your search." : "No event history yet." }}
                                </div>
                            </template>
                        </q-table>
                    </div>
                </div>
            </q-card>
        </div>
    </q-page>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import LoadingState from "src/components/LoadingStatePage.vue";
import { useSpeakerStore } from "src/stores/library/event/speakerStore";

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const SpeakerStore = useSpeakerStore();

const speaker = computed(() => SpeakerStore.speaker);
const photoFailed = ref(false);

/* ---------------------------------------------------------
   TABS
--------------------------------------------------------- */
const tabOrder = ["personal", "employment", "professional"];
const tab = ref("personal");
const editing = ref(false);   // <- dapat nandito, bago ang watch

// history state: dapat din nandito, bago ang watch (immediate ang watch,
// kaya tumatakbo agad at kailangan nang naka-declare ang mga ito)
const historySearch = ref("");
const historyPagination = ref({ page: 1, rowsPerPage: 5, rowsNumber: 0 });

function nextTab() {
    const i = tabOrder.indexOf(tab.value);
    if (i < tabOrder.length - 1) tab.value = tabOrder[i + 1];
}

function prevTab() {
    const i = tabOrder.indexOf(tab.value);
    if (i > 0) tab.value = tabOrder[i - 1];
}

// Maglo-load ulit kapag nagbago ang speaker_id sa URL
watch(
    () => route.params.speaker_id,
    async (speaker_id) => {
        if (!speaker_id) return;
        photoFailed.value = false;
        tab.value = "personal";
        editing.value = false;
        historySearch.value = "";
        SpeakerStore.clearError();
        SpeakerStore.clearHistory();

        // sabay na kinukuha ang profile at ang history
        await Promise.all([SpeakerStore.viewSpeaker(speaker_id), loadHistory(1)]);
    },
    { immediate: true }
);

function goBack() {
    router.back();
}

function notify(type, message) {
    $q.notify({
        type: type === "success" ? "positive" : "negative",
        message,
        position: "top",
    });
}

/* ---------------------------------------------------------
   EDIT MODE
--------------------------------------------------------- */
const fileRef = ref(null);

const emptyForm = () => ({
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: null,
    gender: null,
    birth_date: "",
    email: "",
    contact_number: "",

    position: "",
    office: "",
    employment_type: null,
    salary_grade: null,
    agency: "",

    professional_title: "",
    specialization: "",
    biography: "",
    years_of_experience: null,
});

const editForm = reactive(emptyForm());

const suffixOptions = ["Jr.", "Sr.", "II", "III", "IV", "V"];
const genderOptions = ["Male", "Female"];
const employmentTypeOptions = [
    "Permanent",
    "Casual",
    "Contractual",
    "Job Order",
    "Contract of Service",
    "Consultant",
    "Private",
];

// Kinokopya ang kasalukuyang data ng speaker papunta sa form
function fillForm() {
    const s = speaker.value || {};

    Object.assign(editForm, {
        first_name: s.first_name ?? "",
        middle_name: s.middle_name ?? "",
        last_name: s.last_name ?? "",
        suffix: s.suffix || null,
        gender: s.gender || null,
        birth_date: s.birth_date ? String(s.birth_date).slice(0, 10) : "",
        email: s.email ?? "",
        contact_number: s.contact_number ?? "",

        position: s.employment?.position ?? "",
        office: s.employment?.office ?? "",
        employment_type: s.employment?.employment_type || null,
        salary_grade: s.employment?.salary_grade ?? null,
        agency: s.employment?.agency ?? "",
        professional_title: s.professional_info?.professional_title ?? "",
        specialization: s.professional_info?.specialization ?? "",
        biography: s.professional_info?.biography ?? "",
        years_of_experience: s.professional_info?.years_of_experience ?? null,
    });
}

function startEdit() {
    SpeakerStore.clearError();
    fillForm();
    photoFile.value = null;
    removePhoto.value = false;
    editing.value = true;
}

function cancelEdit() {
    if (SpeakerStore.loading) return;
    SpeakerStore.clearError();
    photoFile.value = null;
    removePhoto.value = false;
    editing.value = false;
}

/* ---------------------------------------------------------
   PHOTO (EDIT)
--------------------------------------------------------- */
const photoFile = ref(null);
const photoPreview = ref("");
const removePhoto = ref(false);

watch(photoFile, (file) => {
    if (photoPreview.value) URL.revokeObjectURL(photoPreview.value);
    photoPreview.value = file ? URL.createObjectURL(file) : "";
    if (file) removePhoto.value = false;
});

// Larawang ipinapakita sa edit mode: bagong pili > dating litrato > wala
const editPhotoSrc = computed(() => {
    if (photoPreview.value) return photoPreview.value;
    if (removePhoto.value) return "";
    return speaker.value?.profile_photo_url && !photoFailed.value ? speaker.value.profile_photo_url : "";
});

function removeEditPhoto() {
    if (photoFile.value) {
        photoFile.value = null; // balik sa dating litrato
        return;
    }
    removePhoto.value = true; // buburahin ang dating litrato pag nag-save
}

function onPhotoRejected() {
    notify("error", "Photo must be a JPG, PNG or WEBP file up to 2 MB.");
}

onBeforeUnmount(() => {
    if (photoPreview.value) URL.revokeObjectURL(photoPreview.value);
});

/* ---------------------------------------------------------
   VALIDATION RULES
--------------------------------------------------------- */
const isBlank = (v) => v === null || v === undefined || v === "";

const required = (v) => (v !== null && v !== undefined && String(v).trim() !== "") || "This field is required";

const validEmail = (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Enter a valid email address";

const validContact = (v) => !v || /^[0-9+\-\s()]{7,20}$/.test(v) || "Enter a valid contact number";

const validDate = (v) => {
    if (!v) return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return "Use the format YYYY-MM-DD";
    const [y, m, d] = v.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const real = date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
    if (!real) return "Enter a real date";
    if (date > new Date()) return "Birth date cannot be in the future";
    return true;
};

const validSg = (v) =>
    isBlank(v) || (Number.isInteger(Number(v)) && v >= 1 && v <= 33) || "Salary grade must be 1 to 33";

const validYears = (v) =>
    isBlank(v) || (Number.isInteger(Number(v)) && v >= 0 && v <= 80) || "Enter 0 to 80 years";

// q-date uses YYYY/MM/DD in :options
function notFuture(dateStr) {
    const [y, m, d] = dateStr.split("/").map(Number);
    return new Date(y, m - 1, d) <= new Date();
}

// [step, field, rules]. Ginagamit sa pag-save para ma-check ang lahat ng step
const fieldRules = [
    ["personal", "first_name", [required]],
    ["personal", "last_name", [required]],
    ["personal", "gender", [required]],
    ["personal", "birth_date", [required, validDate]],
    ["personal", "email", [validEmail]],
    ["personal", "contact_number", [validContact]],
    ["employment", "salary_grade", [validSg]],
    ["professional", "years_of_experience", [validYears]],
];

const fieldLabels = {
    first_name: "First name",
    last_name: "Last name",
    gender: "Gender",
    birth_date: "Birth date",
    email: "Email",
    contact_number: "Contact number",
    salary_grade: "Salary grade",
    years_of_experience: "Years of experience",
};

function firstError() {
    for (const [step, key, rules] of fieldRules) {
        for (const rule of rules) {
            const result = rule(editForm[key]);
            if (result !== true) return { step, message: `${fieldLabels[key]}: ${result}` };
        }
    }
    return null;
}

/* ---------------------------------------------------------
   SAVE
--------------------------------------------------------- */
const clean = (v) => {
    if (typeof v === "string") {
        const t = v.trim();
        return t === "" ? null : t;
    }
    return isBlank(v) ? null : v;
};

function buildPayload() {
    return {
        first_name: clean(editForm.first_name),
        middle_name: clean(editForm.middle_name),
        last_name: clean(editForm.last_name),
        suffix: clean(editForm.suffix),
        gender: clean(editForm.gender),
        birth_date: clean(editForm.birth_date),
        email: clean(editForm.email),
        contact_number: clean(editForm.contact_number),

        position: clean(editForm.position),
        office: clean(editForm.office),
        employment_type: clean(editForm.employment_type),
        salary_grade: clean(editForm.salary_grade),
        agency: clean(editForm.agency),
        professional_title: clean(editForm.professional_title),
        specialization: clean(editForm.specialization),
        biography: clean(editForm.biography),
        years_of_experience: clean(editForm.years_of_experience),
    };
}

async function saveChanges() {
    const problem = firstError();
    if (problem) {
        tab.value = problem.step; // ilipat sa step na may mali
        notify("error", problem.message);
        return;
    }

    SpeakerStore.clearError();

    const speaker_id = route.params.speaker_id;
    const result = await SpeakerStore.updateSpeaker(
        speaker_id,
        buildPayload(),
        photoFile.value,
        removePhoto.value
    );

    if (!result.success) {
        notify("error", result.message || "Failed to update speaker.");
        return;
    }

    // i-refresh ang data ng view page nang walang loading flash
    photoFailed.value = false;
    await SpeakerStore.viewSpeaker(speaker_id, true);

    photoFile.value = null;
    removePhoto.value = false;
    editing.value = false;
    notify("success", result.message || "Speaker updated successfully.");
}

/* ---------------------------------------------------------
   EVENT HISTORY (galing sa API)
--------------------------------------------------------- */
const historyRows = computed(() => SpeakerStore.speakerHistory.events?.data || []);

async function loadHistory(page = 1, perPage = historyPagination.value.rowsPerPage) {
    const result = await SpeakerStore.historySpeaker(
        route.params.speaker_id,
        (historySearch.value || "").trim(),
        page,
        perPage
    );

    if (!result.success) return;

    const events = SpeakerStore.speakerHistory.events || {};
    historyPagination.value = {
        page: events.current_page ?? page,
        rowsPerPage: Number(events.per_page) || perPage,
        rowsNumber: events.total ?? 0,
    };
}

function onHistoryRequest({ pagination }) {
    // kapag nagpalit ng rows per page, bumalik sa page 1
    const perPageChanged = pagination.rowsPerPage !== historyPagination.value.rowsPerPage;
    return loadHistory(perPageChanged ? 1 : pagination.page, pagination.rowsPerPage);
}

const historyColumns = [
    { name: "title_name", label: "Title", field: "title_name", align: "left" },
    { name: "type_name", label: "Type", field: "type_name", align: "left" },
    { name: "date_range", label: "Date", field: "date_range", align: "left" },
    { name: "venue_name", label: "Venue", field: "venue_name", align: "left" },
    {
        name: "days",
        label: "Days",
        field: "days",
        align: "center",
        format: (val) => (val === null || val === undefined ? "—" : val),
    },
];

// icon at kulay kada type; may default para sa ibang type
const typeMeta = {
    Training: { icon: "model_training", tone: "tone-green" },
    Seminar: { icon: "co_present", tone: "tone-amber" },
    Event: { icon: "event_note", tone: "tone-blue" },
};

// "Number of Events" + isang card kada type na nasa by_type
const eventStats = computed(() => {
    const stats = SpeakerStore.speakerHistory.stats || {};

    const cards = [
        { label: "Events", value: stats.total_events ?? 0, icon: "event", tone: "tone-blue" },
    ];

    Object.entries(stats.by_type || {}).forEach(([type, count]) => {
        const meta = typeMeta[type] || { icon: "label", tone: "tone-purple" };
        cards.push({ label: `${type}s`, value: count, icon: meta.icon, tone: meta.tone });
    });

    return cards;
});

/* ---------------------------------------------------------
   DISPLAY HELPERS
--------------------------------------------------------- */
const show = (value) => (value === null || value === undefined || value === "" ? "—" : value);

const initials = computed(() => {
    const first = speaker.value?.first_name?.trim()?.[0] || "";
    const last = speaker.value?.last_name?.trim()?.[0] || "";
    return (first + last).toUpperCase() || "?";
});

const isActive = computed(() => [1, "1", true].includes(speaker.value?.is_active));

function parseDate(value) {
    if (!value) return null;
    const [y, m, d] = String(value).split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}

const age = computed(() => {
    const birth = parseDate(speaker.value?.birth_date);
    if (!birth) return null;

    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) years--;

    return years;
});

const birthDateLabel = computed(() => {
    const birth = parseDate(speaker.value?.birth_date);
    if (!birth) return "—";

    const formatted = birth.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    return age.value !== null ? `${formatted} (${age.value} years old)` : formatted;
});

const salaryGradeLabel = computed(() => {
    const sg = speaker.value?.employment?.salary_grade;
    return sg === null || sg === undefined || sg === "" ? "—" : `SG ${sg}`;
});

const experienceLabel = computed(() => {
    const raw = speaker.value?.professional_info?.years_of_experience;
    if (raw === null || raw === undefined || raw === "") return "—";

    const years = Number(raw);
    return `${years} year${years === 1 ? "" : "s"}`;
});
</script>

<style scoped>
/* PAGE */
.speaker-view-page {
    min-height: 100%;
    padding: 20px;
    color: #19354a;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* HEADER */
.page-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 22px 26px;
    border: 1px solid #e3eaf0;
    border-radius: 16px;
    background: linear-gradient(115deg, #ffffff 0%, #f5f9fc 100%);
    box-shadow: 0 5px 18px rgba(25, 53, 74, 0.045);
}

.page-heading-copy {
    min-width: 0;
}

.page-eyebrow {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #16a84a;
    font-size: 11px;
    font-weight: 750;
    letter-spacing: 0.8px;
    text-transform: uppercase;
}

.page-heading h5 {
    margin: 6px 0 5px;
    color: #19354a;
    font-size: 23px;
    font-weight: 750;
    line-height: 1.25;
}

.page-heading p {
    margin: 0;
    color: #718089;
    font-size: 13px;
}

.heading-actions {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    gap: 10px;
}

.back-btn {
    flex: 0 0 auto;
    min-height: 38px;
    padding: 0 12px;
    border: 1px solid #dfe7ed;
    border-radius: 9px;
    background: #ffffff;
    color: #31546b;
    font-size: 12px;
    font-weight: 650;
    transition: background-color 0.15s ease, border-color 0.15s ease;
}

.back-btn:hover {
    border-color: #bfd2e1;
    background: #f4f8fb;
}

.error-state {
    padding: 20px;
    border-radius: 10px;
    background: #fbe9e9;
    color: #c73f3f;
    font-size: 13px;
}

.error-banner {
    margin: 12px 22px 0;
    font-size: 12px;
}

/* LAYOUT */
.details-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
}

.detail-card {
    overflow: hidden;
    border: 1px solid #e3eaf0;
    border-radius: 16px;
    background: #ffffff;
    box-shadow: 0 5px 18px rgba(25, 53, 74, 0.05);
}

.section-head {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 16px 22px;
    border-bottom: 1px solid #edf1ef;
    background: linear-gradient(110deg, #fbfdff 0%, #f6f9fb 100%);
}

.section-icon {
    color: #16a84a;
    font-size: 20px;
}

.section-title {
    color: #19354a;
    font-size: 15px;
    font-weight: 750;
}

.detail-body {
    padding: 20px 22px;
}

/* STEPPER */
.speaker-stepper {
    background: transparent;
    box-shadow: none;
}

.speaker-stepper :deep(.q-stepper__header) {
    border-bottom: 1px solid #edf1f4;
}

.speaker-stepper :deep(.q-stepper__tab) {
    padding: 14px 18px;
}

.speaker-stepper :deep(.q-stepper__step-inner) {
    padding: 20px 22px 8px;
}

/* PERSONAL LAYOUT */
.personal-layout {
    display: grid;
    grid-template-columns: 170px minmax(0, 1fr);
    gap: 24px;
    align-items: start;
}

.photo-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.photo-frame {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 150px;
    height: 150px;
    overflow: hidden;
    border-radius: 14px;
    background: linear-gradient(135deg, #e1f7e7, #e7f0fb);
    box-shadow: 0 3px 12px rgba(25, 53, 74, 0.1);
}

.photo-frame img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.photo-initials {
    color: #31546b;
    font-size: 40px;
    font-weight: 750;
    letter-spacing: 1px;
}

/* PHOTO PICKER (EDIT) */
.photo-picker {
    width: 150px;
    height: 150px;
    padding: 0;
    overflow: hidden;
    border: 2px dashed #c9d6dd;
    border-radius: 14px;
    background: #f7fafb;
    color: #607987;
    cursor: pointer;
    transition: border-color 0.15s ease, background-color 0.15s ease;
}

.photo-picker:hover,
.photo-picker:focus-visible {
    border-color: #18b64d;
    background: #f1faf4;
    outline: none;
}

.photo-picker img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.photo-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    height: 100%;
    font-size: 12px;
    font-weight: 600;
}

.photo-hint {
    color: #8a989e;
    font-size: 11px;
    text-align: center;
}

.photo-remove {
    font-size: 11px;
}

.pill-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
}

.pill {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
}

.pill-active {
    color: #087c42;
    background: #e1f7e7;
}

.pill-inactive {
    color: #5c6b73;
    background: #eef1f2;
}

.pill-type {
    color: #2b6cb0;
    background: #e7f0fb;
}

/* FIELD GRID (EDIT): 6 columns so rows can mix 2/3/4/6 wide fields */
.field-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 6px 14px;
}

.span-2 {
    grid-column: span 2;
}

.span-3 {
    grid-column: span 3;
}

.span-4 {
    grid-column: span 4;
}

.span-6 {
    grid-column: 1 / -1;
}

.field-grid :deep(.q-field__control) {
    border-radius: 8px;
}

.field-grid :deep(.q-field__native),
.field-grid :deep(.q-field__label) {
    font-size: 12.5px;
}

/* DETAIL GRID (VIEW) */
.detail-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
    padding: 11px 13px;
    border: 1px solid #e9eef2;
    border-radius: 10px;
    background: #fbfcfd;
}

.detail-item-wide {
    grid-column: 1 / -1;
}

.detail-label {
    color: #8193a0;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
}

.detail-value {
    color: #263d4c;
    font-size: 13.5px;
    font-weight: 550;
    line-height: 1.45;
    overflow-wrap: anywhere;
}

/* BIOGRAPHY / SUB LABEL */
.bio-label {
    margin: 20px 0 8px;
    color: #8193a0;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
}

.bio-text {
    max-width: 75ch;
    color: #2c3e4a;
    font-size: 13.5px;
    line-height: 1.7;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
}

.bio-empty {
    padding: 16px;
    border: 1px dashed #dde5ea;
    border-radius: 10px;
    color: #aab5bb;
    font-size: 12.5px;
    text-align: center;
}

/* TAB ACTIONS */
.tab-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 22px 14px;
    border-top: 1px solid #edf1ef;
    background: #fcfdfc;
}

.tab-back-btn {
    color: #31546b;
    font-size: 12px;
}

.next-btn,
.edit-btn,
.save-btn,
.cancel-btn {
    min-height: 38px;
    padding: 0 20px;
    border-radius: 9px;
    color: #ffffff;
    font-size: 12px;
    font-weight: 650;
}

.next-btn,
.edit-btn,
.save-btn {
    background: linear-gradient(135deg, #18b64d, #0ca344);
}

.cancel-btn {
    background: linear-gradient(135deg, #e05353, #c73f3f);
}

.next-btn-secondary {
    min-height: 38px;
    padding: 0 18px;
    border: 1px solid #dfe7ed;
    border-radius: 9px;
    color: #31546b;
    font-size: 12px;
    font-weight: 650;
}

/* EVENT STATS */
.stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 12px;
}

.stat-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    border: 1px solid #e9eef2;
    border-radius: 12px;
    background: #fbfcfd;
}

.stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 44px;
    height: 44px;
    border-radius: 12px;
}

.tone-blue {
    color: #2b6cb0;
    background: #e7f0fb;
}

.tone-green {
    color: #087c42;
    background: #e1f7e7;
}

.tone-amber {
    color: #b7791f;
    background: #fdf3dc;
}

.tone-purple {
    color: #7c3aed;
    background: #f1e9fd;
}

.stat-value {
    color: #19354a;
    font-size: 22px;
    font-weight: 750;
    line-height: 1.1;
}

.stat-label {
    margin-top: 3px;
    color: #718089;
    font-size: 11.5px;
}

/* EVENT HISTORY */
.history-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
    margin-bottom: 8px;
}

.history-label {
    margin: 0;
}

.history-search {
    width: 280px;
    max-width: 100%;
}

.history-search :deep(.q-field__control) {
    border-radius: 9px;
}

.history-error {
    margin-bottom: 8px;
    padding: 10px 14px;
    border-radius: 9px;
    background: #fbe9e9;
    color: #c73f3f;
    font-size: 12px;
}

.history-wrapper {
    overflow-x: auto;
    border: 1px solid #e9eef2;
    border-radius: 12px;
}

.history-table {
    min-width: 640px;
    font-size: 12.5px;
}

.history-table :deep(th) {
    color: #8193a0;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    background: #fbfcfd;
}

.history-table :deep(td) {
    color: #263d4c;
}

.history-empty {
    border: none;
}

.type-badge {
    display: inline-flex;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.2px;
    text-transform: uppercase;
    color: #7c3aed;
    background: #f1e9fd;
}

.type-training {
    color: #087c42;
    background: #e1f7e7;
}

.type-seminar {
    color: #b7791f;
    background: #fdf3dc;
}

.type-event {
    color: #2b6cb0;
    background: #e7f0fb;
}

/* RESPONSIVE */
@media (max-width: 760px) {
    .personal-layout {
        grid-template-columns: minmax(0, 1fr);
        gap: 16px;
    }

    .stat-grid {
        grid-template-columns: minmax(0, 1fr);
    }

    .field-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .span-2,
    .span-3,
    .span-4 {
        grid-column: span 2;
    }

    .speaker-stepper :deep(.q-stepper__tab) {
        padding: 12px 10px;
    }

    .speaker-stepper :deep(.q-stepper__caption) {
        display: none;
    }

    .tab-actions {
        flex-wrap: wrap;
    }
}

@media (max-width: 650px) {
    .speaker-view-page {
        padding: 12px;
        gap: 12px;
    }

    .page-heading {
        flex-direction: column-reverse;
        align-items: flex-start;
        gap: 14px;
        padding: 18px;
    }

    .heading-actions {
        flex-wrap: wrap;
    }

    .page-heading h5 {
        font-size: 20px;
    }

    .detail-grid {
        grid-template-columns: minmax(0, 1fr);
    }

    .detail-body,
    .speaker-stepper :deep(.q-stepper__step-inner) {
        padding: 16px;
    }

    .history-search {
        width: 100%;
    }
}
</style>