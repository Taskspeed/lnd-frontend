
import { api } from "src/boot/axios";

export const attendance_store = (payload) => {
  return api.post(`event/employee/attendance/present`,payload);
};
