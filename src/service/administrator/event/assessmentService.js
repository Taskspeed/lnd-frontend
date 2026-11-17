
import { api } from "src/boot/axios";

export const assessment_get = (assessmentId) =>
  api.get(`event/assessment/${assessmentId}`,);

export const assessment_print = (assessmentId) =>
  api.get(`event/assessment/print/${assessmentId}`, { responseType: "blob" });

