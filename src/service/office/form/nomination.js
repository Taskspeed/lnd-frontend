
import { api } from "src/boot/axios";

export const preview_inhouse_nomination = (eventId, eventScheduleId) => {
  return api.get(
    `office/form/inhouse-nomination/${eventId}/${eventScheduleId}`,
    { responseType: "blob" }
  );
};