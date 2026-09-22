
import { api } from "src/boot/axios";

export const dashboard_event_calendar = (year, month) => {
  return api.get(`hr/dashboard/calendar`, {
    params: {
      year: year,
      month: month,

    },
  });
};
