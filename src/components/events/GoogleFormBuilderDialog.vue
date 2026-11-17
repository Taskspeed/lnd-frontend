<template>
  <q-dialog :model-value="modelValue" maximized transition-show="slide-up" transition-hide="slide-down"
    @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="gf-dialog">
      <!-- TOP BAR -->
      <div class="gf-topbar">
        <div class="gf-topbar-title">Create Form</div>
        <div class="gf-topbar-actions">
          <q-btn flat no-caps label="Cancel" class="gf-cancel-btn" @click="close" />
          <q-btn unelevated no-caps label="Save Form" class="gf-save-btn" @click="save" />
        </div>
      </div>

      <div class="gf-body">
        <div class="gf-center">
          <!-- FORM HEADER -->
          <div class="gf-header-card">
            <div class="gf-header-bar"></div>
            <div class="gf-header-content">
          <div class="gf-title-text">{{ formTitle }}</div>
          <div class="gf-desc-text">{{ formDescription }}</div>
              <label class="gf-passing-score">Passing score
                <input v-model.number="passingScore" type="number" min="0" step="1" />
              </label>
            </div>
          </div>

          <!-- QUESTIONS (DRAGGABLE) -->
          <draggable v-model="questions" item-key="id" handle=".gf-drag-handle" :animation="200"
            ghost-class="gf-ghost" chosen-class="gf-chosen" class="gf-question-list">
            <template #item="{ element: q, index: qIndex }">
              <div class="gf-question-row">
                <div class="gf-question-card" :class="{ 'gf-question-card--active': activeId === q.id }"
                  @click="activeId = q.id">
                  <!-- DRAG HANDLE -->
                  <div class="gf-drag-handle">
                    <q-icon name="drag_indicator" size="20px" style="transform: rotate(90deg)" />

                  </div>

                  <!-- QUESTION + TYPE -->
                  <div class="gf-question-top">
                    <input v-model="q.text" class="gf-question-input" placeholder="Question" />

                    <q-select :model-value="q.type" outlined dense emit-value map-options :options="typeOptions"
                      class="gf-type-select" @update:model-value="changeType(q, $event)">
                      <template #selected-item="scope">
                        <q-icon :name="scope.opt.icon" size="18px" class="q-mr-sm" />
                        {{ scope.opt.label }}
                      </template>
                      <template #option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section avatar>
                            <q-icon :name="scope.opt.icon" size="20px" />
                          </q-item-section>
                          <q-item-section>{{ scope.opt.label }}</q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>

                  <!-- OPTIONS -->
                  <div class="gf-options">
                    <div v-for="(opt, oIndex) in q.options" :key="opt.id" class="gf-option-row">
                      <q-checkbox v-if="q.type === 'checkboxes'" v-model="q.correctOptionIds" :val="opt.id"
                        color="green" size="sm" />
                      <q-radio v-else v-model="q.correctOptionId" :val="opt.id" color="green" size="sm" />
                      <input v-model="opt.text" class="gf-option-input" :placeholder="`Option ${oIndex + 1}`" />
                      <q-btn v-if="q.options.length > 1" flat round dense icon="close" color="grey-7" size="sm"
                        @click.stop="removeOption(q, oIndex)" />
                    </div>

                    <div class="gf-option-row">
                      <q-icon :name="q.type === 'checkboxes' ? 'check_box_outline_blank' : 'radio_button_unchecked'"
                        size="20px" color="grey-5" />
                      <button type="button" class="gf-add-option" @click.stop="addOption(q)">
                        Add option
                      </button>
                    </div>
                  </div>

                  <q-separator class="q-mt-md" />

                  <div class="gf-points-row">
                    <span>Points</span>
                    <q-input v-model.number="q.points" type="number" min="1" step="1" dense outlined
                      class="gf-points-input" />
                  </div>

                  <!-- FOOTER -->
                  <div class="gf-question-footer">
                    <q-btn flat round dense icon="content_copy" color="grey-7"
                      @click.stop="duplicateQuestion(qIndex)">
                      <q-tooltip>Duplicate</q-tooltip>
                    </q-btn>
                    <q-btn flat round dense icon="delete_outline" color="grey-7" :disable="questions.length === 1"
                      @click.stop="removeQuestion(qIndex)">
                      <q-tooltip>Delete</q-tooltip>
                    </q-btn>

                    <q-separator vertical inset class="q-mx-md" />

                    <span class="gf-required-label">Required</span>
                    <q-toggle v-model="q.required" color="deep-purple" dense />
                  </div>
                </div>

                <!-- SIDE TOOLBAR (sumusunod sa active question) -->
                <div v-if="activeId === q.id" class="gf-side-toolbar">
                  <q-btn flat round dense icon="add_circle_outline" color="grey-8" @click="addQuestion(qIndex)">
                    <q-tooltip anchor="center left" self="center right">Add question</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, watch } from "vue";
import { Notify } from "quasar";
import draggable from "vuedraggable";

export default defineComponent({
  name: "GoogleFormBuilderDialog",

  components: { draggable },

props: {
  modelValue: { type: Boolean, default: false },
  eventTitle: { type: String, default: "" },   // event title -> description
  testLabel: { type: String, default: "" },    // "Pre-Test Assessment" -> title
  initialForm: { type: Object, default: null },
},
  emits: ["update:modelValue", "save"],

  setup(props, { emit }) {
    const typeOptions = [
      { label: "Multiple choice", value: "multiple_choice", icon: "radio_button_checked" },
      { label: "Checkboxes", value: "checkboxes", icon: "check_box" },
    ];

    const uid = () => Date.now() + Math.random();

    const createOption = (text = "") => ({ id: uid(), text });

    const createQuestion = () => ({
      id: uid(),
      text: "",
      type: "multiple_choice",
      required: false,
      points: 1,
      correctOptionId: null,   // para sa multiple_choice
      correctOptionIds: [],    // para sa checkboxes
      options: [createOption("Option 1")],
    });

    const formTitle = ref("");
    const formDescription = ref("");
    const passingScore = ref(1);
    const questions = ref([createQuestion()]);
    const activeId = ref(questions.value[0].id);

    // Tuwing bubukas ang dialog: i-load yung dating form, o mag-start ng bago
   watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;

    if (props.initialForm) {
      passingScore.value = props.initialForm.passing_score ?? 1;
      questions.value = props.initialForm.questions.map((question) => {
        const options = (question.options || []).map((option) => ({
          id: option.id ?? uid(),
          text: option.text ?? option.option_text ?? "",
          isCorrect: option.is_correct === true,
        }));
        const correctIds = options.filter((option) => option.isCorrect).map((option) => option.id);
        return {
          id: question.id ?? uid(),
          text: question.text ?? question.question ?? "",
          type: question.type ?? question.question_type ?? "multiple_choice",
          points: question.points ?? 1,
          required: question.required ?? false,
          correctOptionId: correctIds[0] ?? null,
          correctOptionIds: correctIds,
          options,
        };
      });
    } else {
      passingScore.value = 1;
      questions.value = [createQuestion()];
    }

    // fixed, hindi ine-edit ng user
    formTitle.value = props.testLabel || "";
    formDescription.value = props.eventTitle || "";
    activeId.value = questions.value[0].id;
  }
);
    // =========================================================
    // QUESTIONS
    // =========================================================
    function addQuestion(afterIndex = questions.value.length - 1) {
      const q = createQuestion();
      questions.value.splice(afterIndex + 1, 0, q);
      activeId.value = q.id;
    }

    function duplicateQuestion(index) {
      const source = questions.value[index];
      const copy = JSON.parse(JSON.stringify(source));
      copy.id = uid();

      // bagong id para sa bawat option, at i-remap yung mga tamang sagot
      const idMap = new Map();
      copy.options.forEach((o) => {
        const newId = uid();
        idMap.set(o.id, newId);
        o.id = newId;
      });
      copy.correctOptionId = idMap.get(source.correctOptionId) ?? null;
      copy.correctOptionIds = (source.correctOptionIds || [])
        .map((id) => idMap.get(id))
        .filter((id) => id !== undefined);

      questions.value.splice(index + 1, 0, copy);
      activeId.value = copy.id;
    }

    function removeQuestion(index) {
      if (questions.value.length === 1) return;
      questions.value.splice(index, 1);
      const next = questions.value[Math.min(index, questions.value.length - 1)];
      activeId.value = next.id;
    }

    // Kapag nagpalit ng type, dalhin ang tamang sagot sa kabilang format
    function changeType(question, type) {
      if (question.type === type) return;

      if (type === "checkboxes") {
        question.correctOptionIds = question.correctOptionId != null ? [question.correctOptionId] : [];
      } else {
        question.correctOptionId = question.correctOptionIds[0] ?? null;
        question.correctOptionIds = [];
      }
      question.type = type;
    }

    // =========================================================
    // OPTIONS
    // =========================================================
    function addOption(question) {
      question.options.push(createOption(`Option ${question.options.length + 1}`));
    }

    function removeOption(question, index) {
      const [removed] = question.options.splice(index, 1);
      if (question.correctOptionId === removed.id) question.correctOptionId = null;
      question.correctOptionIds = question.correctOptionIds.filter((id) => id !== removed.id);
    }

    // =========================================================
    // ACTIONS
    // =========================================================
    function close() {
      emit("update:modelValue", false);
    }

    function isCorrect(question, option) {
      return question.type === "checkboxes"
        ? question.correctOptionIds.includes(option.id)
        : option.id === question.correctOptionId;
    }

    function save() {
      if (!formTitle.value.trim()) {
        Notify.create({ type: "warning", message: "Please enter a form title.", position: "top" });
        return;
      }

      for (const [i, q] of questions.value.entries()) {
        if (!q.text.trim()) {
          Notify.create({ type: "warning", message: `Question ${i + 1} is empty.`, position: "top" });
          return;
        }
        const filled = q.options.filter((o) => o.text.trim());
        if (filled.length < 2) {
          Notify.create({
            type: "warning",
            message: `Question ${i + 1} needs at least 2 options.`,
            position: "top",
          });
          return;
        }
        if (!filled.some((option) => isCorrect(q, option))) {
          Notify.create({
            type: "warning",
            message:
              q.type === "checkboxes"
                ? `Select at least one correct answer for question ${i + 1}.`
                : `Select the correct answer for question ${i + 1}.`,
            position: "top",
          });
          return;
        }
      }

      const totalPoints = questions.value.reduce((total, question) => total + (Number(question.points) || 0), 0);
      if (!Number.isFinite(Number(passingScore.value)) || passingScore.value < 0 || passingScore.value > totalPoints) {
        Notify.create({ type: "warning", message: `Passing score must be between 0 and ${totalPoints}.`, position: "top" });
        return;
      }

      emit("save", {
        title: formTitle.value.trim(),
        description: formDescription.value.trim(),
        passing_score: Number(passingScore.value),
        questions: questions.value.map((q) => ({
          question: q.text.trim(),
          question_type: q.type,
          points: Number(q.points) || 1,
          options: q.options.filter((o) => o.text.trim()).map((option) => ({
            option_text: option.text.trim(),
            is_correct: isCorrect(q, option),
          })),
        })),
      });
      close();
    }

    return {
      typeOptions,
      formTitle,
      formDescription,
      passingScore,
      questions,
      activeId,
      addQuestion,
      duplicateQuestion,
      removeQuestion,
      changeType,
      addOption,
      removeOption,
      close,
      save,
    };
  },
});
</script>

<style scoped>
.gf-dialog {
  display: flex;
  flex-direction: column;
  background: #f4f0f9;
}

/* =========================================================
   TOP BAR
========================================================= */
.gf-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
}

.gf-topbar-title {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.gf-topbar-actions {
  display: flex;
  gap: 8px;
}

.gf-cancel-btn {
  color: #555;
  font-size: 12px;
}

.gf-save-btn {
  padding: 0 20px;
  border-radius: 8px;
  background: #18bd4f;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

/* =========================================================
   BODY
========================================================= */
.gf-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 72px 60px 16px;   /* ← dati: 24px 16px 60px */
}

.gf-center {
  max-width: 770px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* =========================================================
   HEADER CARD
========================================================= */
.gf-header-card {
  overflow: hidden;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #fff;
}

.gf-header-bar {
  height: 10px;
  background: #06b42c;
}

.gf-header-content {
  padding: 22px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 130px;
}

.gf-title-input[readonly] {
  border: none;
  border-bottom: 1px solid transparent;
  outline: none;
  font-size: 30px;
  color: #202124;
  padding: 4px 0;
  background: transparent;
}

.gf-title-input[readonly]:focus {
  border-bottom: 2px solid #542b2b;
}

.gf-desc-input[readonly] {
  border: none;
  border-bottom: 1px solid transparent;
  outline: none;
  font-size: 14px;
  color: #555;
  padding: 4px 0;
  background: transparent;
    cursor: default;
}

.gf-desc-input[readonly]:focus {
  border-bottom: 2px solid #542b2b;
    border-bottom: 1px solid transparent;
}

.gf-passing-score { display: flex; align-items: center; gap: 12px; color: #555; font-size: 14px; }
.gf-passing-score input { width: 90px; padding: 6px; border: 1px solid #dadce0; border-radius: 4px; }
.gf-points-row { display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding-top: 10px; color: #555; font-size: 13px; }
.gf-points-input { width: 90px; }

/* =========================================================
   QUESTION LIST (DRAGGABLE)
========================================================= */
.gf-question-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* dati: gap: 12px + flex na nagpapaliit sa card */
.gf-question-row {
  position: relative;
}

.gf-question-card {
  position: relative;
  width: 100%;              /* ← dati: flex: 1 */
  padding: 28px 22px 8px;
  border: 1px solid #dadce0;
  border-left: 6px solid transparent;
  border-radius: 8px;
  background: #fff;
  transition: box-shadow 0.15s;
}

.gf-question-card--active {
  border-left-color: #4285f4;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
}

/* drag handle: malaking hit area + grab cursor */
.gf-drag-handle {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  padding: 2px 40px 4px;
  color: #bdbdbd;
  line-height: 1;
  cursor: move;          /* ← dati: grab */
  user-select: none;
}

.gf-drag-handle:hover {
  color: #757575;
}

.gf-drag-handle:active {
  cursor: move;          /* ← dati: grabbing */
}

/* habang dina-drag */
.gf-ghost {
  opacity: 0.4;
}

.gf-chosen .gf-question-card {
  border-left-color: #4285f4;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.gf-question-top {
  display: flex;
  align-items: center;
  gap: 16px;
}

.gf-question-input {
  flex: 1;
  padding: 16px 14px;
  border: none;
  border-bottom: 1px solid #757575;
  outline: none;
  background: #f8f8f8;
  font-size: 15px;
  color: #202124;
}

.gf-question-input:focus {
  border-bottom: 2px solid #542b2b;
  background: #f1f1f1;
}

.gf-type-select {
  width: 200px;
  font-size: 13px;
}

/* =========================================================
   OPTIONS
========================================================= */
.gf-options {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.gf-option-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 38px;
}

.gf-option-input {
  flex: 1;
  border: none;
  border-bottom: 1px solid transparent;
  outline: none;
  padding: 6px 0;
  font-size: 13.5px;
  color: #202124;
  background: transparent;
}

.gf-option-input:hover {
  border-bottom-color: #dadce0;
}

.gf-option-input:focus {
  border-bottom: 2px solid #542b2b;
}

.gf-add-option {
  border: none;
  background: transparent;
  padding: 6px 0;
  color: #777;
  font-size: 13.5px;
  cursor: pointer;
}

.gf-add-option:hover {
  color: #4285f4;
}

/* =========================================================
   FOOTER
========================================================= */
.gf-question-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 8px 0;
}

.gf-required-label {
  margin-right: 8px;
  font-size: 13px;
  color: #202124;
}

/* =========================================================
   SIDE TOOLBAR (nasa labas ng card, hindi nakakaapekto sa lapad)
========================================================= */
.gf-side-toolbar {
  position: absolute;       /* ← dati: sticky */
  top: 0;
  left: calc(100% + 12px);  /* ← nasa kanan ng card */
  padding: 6px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  z-index: 1;
}
@media (max-width: 650px) {
  .gf-question-top {
    flex-wrap: wrap;
  }

  .gf-type-select {
    width: 100%;
  }
}
.gf-title-text {
  padding: 4px 0;
  font-size: 30px;
  color: #202124;
  cursor: default;
  user-select: none;
}

.gf-desc-text {
  padding: 4px 0;
  font-size: 14px;
  color: #555;
  cursor: default;
  user-select: none;
}
</style>