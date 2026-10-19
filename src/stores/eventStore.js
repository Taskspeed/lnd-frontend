import { defineStore } from "pinia";
import { api } from "boot/axios";
import {
  nominated_employee,
  suggested_employees,
  nomination_approval,
} from "src/service/administrator/event/eventService";

export const useEventStore = defineStore("event", {
  state: () => ({
    events: [],
    selectedEvent: null,
    loading: false,
    error: null,
    employees: [],
    nominated_employee: [],
    pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 },

  }),

  actions: {
   async fetchEvents(params = {}) {
    this.loading = true;
    this.error = null;

    try {
      const response = await api.get("/event/index", { params });

      if (response.data.success) {
        const paginator = response.data.data;

        this.events = paginator.data;
        this.pagination = {
          page: paginator.current_page,
          rowsPerPage: paginator.per_page,
          rowsNumber: paginator.total,
        };
      } else {
        this.error = response.data.message;
      }
    } catch (err) {
      this.error = "Failed to fetch events";
      console.error("Error fetching events:", err);
    } finally {
      this.loading = false;
    }
  },

    async createEvent(eventData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post("/event/store", eventData);
        if (response.data.success) {
          await this.fetchEvents();
          return { success: true, message: response.data.message };
        } else {
          this.error = response.data.message;
          return { success: false, message: response.data.message };
        }
      } catch (err) {
        const message = err.response?.data?.message || "Failed to create event";
        this.error = message;
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    async updateEvent(eventId, eventData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.put(`/event/edit/${eventId}`, eventData);
        if (response.data.success) {
          await this.fetchEvents();
          return {
            success: true,
            message: response.data.message || "Event updated successfully",
          };
        } else {
          this.error = response.data.message;
          return { success: false, message: response.data.message };
        }
      } catch (err) {
        const message = err.response?.data?.message || "Failed to update event";
        this.error = message;
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    async deleteEvent(eventId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.delete(`/event/delete/${eventId}`);
        if (response.data.success) {
          this.events = this.events.filter(
            (event) => event.event_id !== eventId
          );
          return { success: true, message: response.data.message };
        } else {
          this.error = response.data.message;
          return { success: false, message: response.data.message };
        }
      } catch (err) {
        const message = err.response?.data?.message || "Failed to delete event";
        this.error = message;
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    async fetchEventById(eventId,params = {}) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/event/view/${eventId}`,{ params });
        if (response.data.success) {
          this.selectedEvent = response.data.data;
          const s = this.selectedEvent.schedule;
          this.pagination = {
            page: s.current_page,
            rowsPerPage: s.per_page,
            rowsNumber: s.total,
          };
          return { success: true, data: response.data.data };
          
        } else {
          this.error = response.data.message;
          return { success: false, message: response.data.message };
        }
      } catch (err) {
        const message = err.response?.data?.message || "Failed to fetch event";
        this.error = message;
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },

    clearSelectedEvent() {
      this.selectedEvent = null;
    },
    async fetchSuggested(office, titleName,sg = null) {
      this.loading = true;
      this.error = null;
      try {
        const response = await suggested_employees(office, titleName, sg);
        this.employees = response.data.data || response.data || [];
      } catch (err) {
        this.error = err.response?.data?.message || "Failed to load employees.";
        this.employees = [];
      } finally {
        this.loading = false;
      }
    },

    async fetchNominatedEmployee(eventId, scheduleId, page = 1, perPage = 10, office = null) {
      this.loading = true;
      this.error = null;
      try {
        const response = await nominated_employee(eventId, scheduleId, page, perPage, office);
        this.nominated_employee = response.data.data || response.data || null;
        return { success: true };
      } catch (err) {
        this.error = err.response?.data?.message || "Failed to load employees.";
        this.nominated_employee = null;
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },
    
    async approvalNominatedEmployee(nominatedEmployeeId, payload) {
      this.loading = true;
      this.error = null;
      try {
        const response = await nomination_approval(
          nominatedEmployeeId,
          payload
        );
        return { success: true, data: response.data.data || response.data };
      } catch (err) {
        this.error =
          err.response?.data?.message || "Failed to update nomination status.";
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },
  },
});
