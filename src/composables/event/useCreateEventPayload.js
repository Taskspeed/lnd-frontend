import { coreOptions, technicalOptions, leadershipOptions } from "src/constants/competency";
import { formsOptions, evaluationOptions } from "src/constants/form";

// competency
export function buildCompetenciesPayload(selectedValues) {
  const allOptions = [...coreOptions, ...technicalOptions, ...leadershipOptions];
  const result = {};

  allOptions.forEach((option) => {
    result[option.backendKey] = selectedValues.includes(option.value);
  });

  return result;
}

// forms + evaluation payload
export function buildFormsPayload(selectedForms = [], selectedEvaluations = []) {
  const selectedFormOptions = formsOptions.filter((option) =>
    selectedForms.includes(option.value)
  );

  const selectedEvaluationOptions = evaluationOptions.filter((option) =>
    selectedEvaluations.includes(option.value)
  );

  return {
    form: [...selectedFormOptions, ...selectedEvaluationOptions].map((option) => ({
      form_name: option.label,
    })),
  };
}