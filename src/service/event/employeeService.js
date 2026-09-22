
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


export const employee_attendance= (nominatedEmployeeId) => {
  return api.get(`event/employee/attendance/employee/${nominatedEmployeeId}`);
};