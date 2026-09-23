import { api } from "src/boot/axios";

export const suggested_employees = (office, titleName) => {
  return api.get(
    `hr/employee/list/suggested/training/${encodeURIComponent(office)}`,{
        params: { title: titleName },
    }
    
  );
};
// nominated employee
export const nominated_employee = (eventId, scheduleId) => {
  return api.get(
    `event/nominated-employee/${eventId}/${scheduleId}`,
  );
};

// for approval 
export const nomination_approval = (nominatedEmployeeId,payload) => {
  return api.put(
    `event/employee/nomination/approval/${nominatedEmployeeId}`,payload);
};


