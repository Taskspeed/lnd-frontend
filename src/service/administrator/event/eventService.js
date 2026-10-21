import { api } from "src/boot/axios";

export const suggested_employees = (office, titleName, sg = null) => {
  const params = { title: titleName };
  if (sg) params.sg = sg; // optional, hindi isasama kung null

  return api.get(
    `hr/employee/list/suggested/training/${encodeURIComponent(office)}`,
    { params }
  );
};

// nominated employee
export const nominated_employee = (eventId, scheduleId, page = 1, perPage = 10, office = null) => {
  return api.get(`event/nominated-employee/${eventId}/${scheduleId}`, {
    params: {
      page,
      per_page: perPage,
      // kapag null/empty, hindi isasama ng axios sa URL
      office: office,
    },
  });
};

// for approval 
export const nomination_approval = (nominatedEmployeeId,payload) => {
  return api.put(
    `event/employee/nomination/approval/${nominatedEmployeeId}`,payload);
};

// event details for submission
export const event_details = (eventId, scheduleId,) => {
  return api.get(`event/employee/submission/event/${eventId}/schedule/${scheduleId}`, {
  
  });
};