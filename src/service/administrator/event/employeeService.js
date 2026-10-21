
import { api } from "src/boot/axios";

export const employee_information = (nominatedEmployeeId) => {
  return api.get(
    `event/employee/information/${nominatedEmployeeId}`);
};


export const employee_submission = (controlNo, eventId, eventScheduleId) => {
  return api.get(`event/employee/list/forms`, {
    params: {
      control_no: controlNo,
      event_id: eventId,
      event_schedule_id: eventScheduleId,
    },
  });
};

export const employee_view_form_submission = (controlNo, form_name, eventScheduleId) => {
  return api.get(`event/employee/forms`, {
    params: {
      control_no: controlNo,
      form_name: form_name,
      event_schedule_id: eventScheduleId,
    },
  });
};


export const employee_update_form_submission= (nominatedEmployeeId,payload) => {
  return api.put(`event/employee/submission/update/${nominatedEmployeeId}`,payload);
};


export const employee_attendance = (nominatedEmployeeId) => {
  return api.get(`event/employee/attendance/employee/${nominatedEmployeeId}`);
};


export const employee_form_submission = (scheduleId, params = {}) => {
  return api.get(`event/employee/submission/list/schedule/${scheduleId}`, {
    params,
  });
};


export const employee_documents_submission = (eventId,scheduleId,controlNO, page = 1, perPage = 10) => {
  return api.get(`event/employee/documents/event/${eventId}/schedule/${scheduleId}/${controlNO}`,{
       params: { page, per_page: perPage },
  });
};


export const employee_view_documents_submission = (documentId) => {
  return api.get(`event/employee/documents/file/${documentId}`, { responseType: "blob" });
};


export const  event_participant_certificate = (params = {}) => {
  return api.get(`event/employee/submission/event/participants`,{ params });
};
