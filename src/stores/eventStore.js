import { defineStore } from "pinia";
import { api } from "boot/axios";
import {
  nominated_employee,
  suggested_employees,
  nomination_approval,
} from "src/service/administrator/event/eventService";
import { employee_update_form_submission } from "src/service/administrator/event/employeeService";

export const useEventStore = defineStore("event", {
  state: () => ({
    events: [],
    selectedEvent: null,
    loading: false,
    error: null,
    employees: [],
    nominated_employee: [],
  }),

  actions: {
    async fetchEvents() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get("/event/index");

        if (response.data.success) {
          this.events = response.data.data;
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

    async fetchEventById(eventId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/event/view/${eventId}`);
        if (response.data.success) {
          this.selectedEvent = response.data.data;
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
    async fetchSuggested(office, titleName) {
      this.loading = true;
      this.error = null;
      try {
        const response = await suggested_employees(office, titleName);
        this.employees = response.data.data || response.data || [];
      } catch (err) {
        this.error = err.response?.data?.message || "Failed to load employees.";
        this.employees = [];
      } finally {
        this.loading = false;
      }
    },

    async fetchNominatedEmployee(eventId, scheduleId) {
      this.loading = true;
      this.error = null;
      try {
        const response = await nominated_employee(eventId, scheduleId);
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
