import { api } from "src/boot/axios";

export const pdf_attendance_sheet = (eventId,eventSchduleId,scheduleDateTimeId) => {
  return api.get(`hr/pdf/attendance/${eventId}/${eventSchduleId}/${scheduleDateTimeId}`,{ responseType: "blob" });
};


export const pdf_nomination = (eventId,eventSchduleId) => {
  return api.get(`hr/pdf/nomination/${eventId}/${eventSchduleId}/`,{ responseType: "blob" });
};
