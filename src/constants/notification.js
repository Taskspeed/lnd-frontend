export const notificationRoutes = {
  event_created: (data) => ({
    name: "office-event-view",
    params: { scheduleId: data.event_schedule_id },
  }),
  nomination_status_updated: (data) => ({
    name: "office-event-view",
    params: {
      scheduleId: data.event_schedule_id,
    },
  }),
  employees_nominated: (data) => ({
    name: "event-nominated-employee",
    params: {
      eventId: data.event_id,
      scheduleId: data.schedule_id,
    },
  }),

  form_submitted: (data) => ({
    name: "list_of_submission", // <-- palitan ng tamang route name ng Submission page mo
    query: { nominated_employee_id: data.nominated_employee_id },
  }),
};


// icons
export const notificationIcons = {
  event_created: { icon: "event", color: "indigo" },
  nomination_status_updated: { icon: "how_to_reg", color: "primary" },
  employees_nominated: { icon: "groups", color: "primary" },
  form_submitted: { icon: "fact_check", color: "teal" },

  
};

export const defaultNotificationIcon = { icon: "notifications", color: "primary" };
