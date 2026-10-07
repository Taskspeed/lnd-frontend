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

};