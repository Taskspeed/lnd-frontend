
import { api } from "src/boot/axios";

export const assessment_get = (assessmentId) =>
  api.get(`event/assessment/${assessmentId}`,);
