<template>
  <q-dialog v-model="show" persistent maximized-mobile>
    <q-card class="speaker-add-dialog">
      <!-- HEADER -->
      <q-card-section class="dialog-header">
        <div>
          <div class="dialog-title">Add Speaker</div>
          <div class="dialog-sub">Fill in the speaker's details. Fields marked * are required.</div>
        </div>
        <q-btn flat round dense icon="close" :disable="loading" @click="close" />
      </q-card-section>

      <q-separator />

      <q-banner v-if="error" dense rounded class="bg-red-2 text-red-9 error-banner">
        {{ error }}
      </q-banner>

      <q-stepper v-model="step" ref="stepper" flat animated color="green" class="speaker-stepper">
        <!-- =====================================================
             STEP 1: PERSONAL INFORMATION
        ====================================================== -->
        <q-step :name="1" title="Personal" caption="Name and contact" icon="badge" :done="step > 1">
          <q-form ref="form1" greedy @submit.prevent>
            <div class="personal-layout">
              <!-- PHOTO -->
              <div class="photo-col">
                <button type="button" class="photo-picker" @click="fileRef?.pickFiles()">
                  <img v-if="photoPreview" :src="photoPreview" alt="Speaker photo preview" />
                  <span v-else class="photo-empty">
                    <q-icon name="add_a_photo" size="28px" />
                    <span>Add photo</span>
                  </span>
                </button>

                <q-file ref="fileRef" v-model="photoFile" accept=".jpg,.jpeg,.png,.webp" :max-file-size="2097152"
                  class="hidden" @rejected="onPhotoRejected" />

                <div class="photo-hint">JPG, PNG or WEBP, up to 2 MB</div>

                <q-btn v-if="photoPreview" flat dense no-caps color="red" icon="delete" label="Remove"
                  class="photo-remove" @click="photoFile = null" />
              </div>

              <!-- FIELDS -->
              <div class="field-grid">
                <q-input v-model="form.first_name" outlined dense label="First name *" :rules="[required]"
                  class="span-2" />
                <q-input v-model="form.middle_name" outlined dense label="Middle name" class="span-2" />
                <q-input v-model="form.last_name" outlined dense label="Last name *" :rules="[required]"
                  class="span-2" />

                <q-select v-model="form.suffix" outlined dense clearable label="Suffix" :options="suffixOptions"
                  class="span-2" />
                <q-select v-model="form.gender" outlined dense label="Gender *" :options="genderOptions"
                  :rules="[required]" class="span-2" />

                <q-input v-model="form.birth_date" outlined dense label="Birth date *" mask="####-##-##"
                  placeholder="YYYY-MM-DD" :rules="[required, validDate]" class="span-2">
                  <template #append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.birth_date" mask="YYYY-MM-DD" color="green" :options="notFuture">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Done" color="green" flat no-caps />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>

                <q-input v-model="form.email" outlined dense type="email" label="Email" :rules="[validEmail]"
                  class="span-3">
                  <template #prepend><q-icon name="mail_outline" size="18px" /></template>
                </q-input>
                <q-input v-model="form.contact_number" outlined dense label="Contact number" :rules="[validContact]"
                  class="span-3">
                  <template #prepend><q-icon name="call" size="18px" /></template>
                </q-input>
              </div>
            </div>
          </q-form>
        </q-step>

        <!-- =====================================================
             STEP 2: EMPLOYMENT
        ====================================================== -->
        <q-step :name="2" title="Employment" caption="Where they work" icon="work_outline" :done="step > 2">
          <q-form ref="form2" greedy @submit.prevent>
            <div class="field-grid">
              <q-input v-model="form.position" outlined dense label="Position" class="span-3" />
              <q-select v-model="form.employment_type" outlined dense clearable label="Employment type"
                :options="employmentTypeOptions" class="span-3" />

              <q-input v-model="form.office" outlined dense label="Office / Agency" class="span-4" />
              <q-input v-model.number="form.salary_grade" outlined dense type="number" min="1" max="33"
                label="Salary grade" hint="1 to 33" :rules="[validSg]" class="span-2" />
            </div>
          </q-form>
        </q-step>

        <!-- =====================================================
             STEP 3: PROFESSIONAL
        ====================================================== -->
        <q-step :name="3" title="Professional" caption="Expertise" icon="school">
          <q-form ref="form3" greedy @submit.prevent>
            <div class="field-grid">
              <q-input v-model="form.professional_title" outlined dense label="Professional title"
                hint="e.g. Engr., Dr., CPA" class="span-3" />
              <q-input v-model.number="form.years_of_experience" outlined dense type="number" min="0" max="80"
                label="Years of experience" :rules="[validYears]" class="span-3" />

              <q-input v-model="form.specialization" outlined dense label="Specialization"
                hint="Topics this speaker can handle" class="span-6" />

              <q-input v-model="form.biography" outlined type="textarea" rows="5" counter maxlength="1500"
                label="Biography" class="span-6" />
            </div>
          </q-form>
        </q-step>

        <template #navigation>
          <q-stepper-navigation class="dialog-actions">
            <q-btn unelevated no-caps label="Cancel" class="cancel-btn" :disable="loading" @click="close" />
            <q-space />
            <q-btn v-if="step > 1" flat no-caps icon="arrow_back" label="Back" class="back-btn" :disable="loading"
              @click="step--" />
            <q-btn v-if="step < 3" unelevated no-caps icon-right="arrow_forward" label="Next" class="save-btn"
              @click="goNext" />
            <q-btn v-else unelevated no-caps icon="check" label="Save speaker" class="save-btn" :loading="loading"
              @click="submit" />
          </q-stepper-navigation>
        </template>
      </q-stepper>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch, onBeforeUnmount } from "vue";
import { useQuasar } from "quasar";

const props = defineProps({
  modelValue: Boolean,
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
});

// submit sends (payload, photoFile). Payload matches the Laravel request rules.
const emit = defineEmits(["update:modelValue", "submit"]);

const $q = useQuasar();

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

/* ---------------------------------------------------------
   STATE
--------------------------------------------------------- */
const step = ref(1);
const form1 = ref(null);
const form2 = ref(null);
const form3 = ref(null);
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

  professional_title: "",
  specialization: "",
  biography: "",
  years_of_experience: null,
});

const form = reactive(emptyForm());

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

/* ---------------------------------------------------------
   PHOTO
--------------------------------------------------------- */
const photoFile = ref(null);
const photoPreview = ref("");

watch(photoFile, (file) => {
  if (photoPreview.value) URL.revokeObjectURL(photoPreview.value);
  photoPreview.value = file ? URL.createObjectURL(file) : "";
});

function onPhotoRejected() {
  $q.notify({
    type: "negative",
    message: "Photo must be a JPG, PNG or WEBP file up to 2 MB.",
    position: "top",
  });
}

onBeforeUnmount(() => {
  if (photoPreview.value) URL.revokeObjectURL(photoPreview.value);
});

/* ---------------------------------------------------------
   VALIDATION RULES
--------------------------------------------------------- */
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

const isBlank = (v) => v === null || v === undefined || v === "";

const validSg = (v) =>
  isBlank(v) || (Number.isInteger(Number(v)) && v >= 1 && v <= 33) || "Salary grade must be 1 to 33";

const validYears = (v) =>
  isBlank(v) || (Number.isInteger(Number(v)) && v >= 0 && v <= 80) || "Enter 0 to 80 years";

// q-date uses YYYY/MM/DD in :options
function notFuture(dateStr) {
  const [y, m, d] = dateStr.split("/").map(Number);
  return new Date(y, m - 1, d) <= new Date();
}

/* ---------------------------------------------------------
   NAVIGATION
--------------------------------------------------------- */
function currentForm() {
  return [form1, form2, form3][step.value - 1].value;
}

async function goNext() {
  const ok = await currentForm()?.validate();
  if (ok) step.value++;
}

function close() {
  if (props.loading) return;
  show.value = false;
}

/* ---------------------------------------------------------
   SUBMIT
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
    first_name: clean(form.first_name),
    middle_name: clean(form.middle_name),
    last_name: clean(form.last_name),
    suffix: clean(form.suffix),
    gender: clean(form.gender),
    birth_date: clean(form.birth_date),
    email: clean(form.email),
    contact_number: clean(form.contact_number),

    position: clean(form.position),
    office: clean(form.office),
    employment_type: clean(form.employment_type),
    salary_grade: clean(form.salary_grade),

    professional_title: clean(form.professional_title),
    specialization: clean(form.specialization),
    biography: clean(form.biography),
    years_of_experience: clean(form.years_of_experience),
  };
}

async function submit() {
  const ok = await form3.value?.validate();
  if (!ok) return;

  emit("submit", buildPayload(), photoFile.value);
}

/* ---------------------------------------------------------
   RESET EVERY TIME THE DIALOG OPENS
--------------------------------------------------------- */
watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    Object.assign(form, emptyForm());
    photoFile.value = null;
    step.value = 1;
  }
);
</script>

<style scoped>
.speaker-add-dialog {
  width: 960px;
  max-width: 96vw;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  overflow: hidden;
}

/* HEADER */
.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 18px 22px;
  background: linear-gradient(110deg, #fbfdff 0%, #f3f8fb 100%);
}

.dialog-title {
  color: #19354a;
  font-size: 17px;
  font-weight: 750;
}

.dialog-sub {
  margin-top: 3px;
  color: #718089;
  font-size: 12px;
}

.error-banner {
  margin: 12px 22px 0;
  font-size: 12px;
}

/* STEPPER */
.speaker-stepper {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
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

/* FIELD GRID: 6 columns so rows can mix 2/3/4/6 wide fields */
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
  gap: 8px;
}

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

/* ACTIONS */
/* ACTIONS */
.dialog-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px 14px;
  /* dating 12px 0 14px */
  border-top: 1px solid #edf1ef;
}

.back-btn {
  color: #31546b;
  font-size: 12px;
}

.save-btn,
.cancel-btn {
  min-height: 38px;
  padding: 0 20px;
  border-radius: 9px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 650;
}

.save-btn {
  background: linear-gradient(135deg, #18b64d, #0ca344);
}

.cancel-btn {
  background: linear-gradient(135deg, #e05353, #c73f3f);
}

/* RESPONSIVE */
@media (max-width: 760px) {
  .personal-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .field-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .span-2,
  .span-3,
  .span-4 {
    grid-column: span 2;
  }

  .speaker-add-dialog {
    max-height: 100vh;
    border-radius: 0;
  }

  .speaker-stepper :deep(.q-stepper__tab) {
    padding: 12px 10px;
  }

  .speaker-stepper :deep(.q-stepper__caption) {
    display: none;
  }
}
</style>