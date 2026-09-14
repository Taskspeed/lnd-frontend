import { defineStore } from "pinia";
import { get_notifications,mark_notification_read} from "src/service/notificationService";
export const useNotificationStore = defineStore("notification", {
  state: () => ({
    notifications: [],
    loading: false,
    error: null,
  }),

  getters: {
    unreadCount: (state) =>
      state.notifications.filter((n) => !n.read_at).length,
  },

  actions: {
    async fetchNotifications() {
      this.loading = true;
      this.error = null;
      try {
        const response = await get_notifications();
        this.notifications = response.data.data || [];
        return { success: true };
      } catch (err) {
        this.error = err.response?.data?.message || "Failed to load notifications.";
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    async markAsRead(id) {
      try {
        await mark_notification_read(id);
        const target = this.notifications.find((n) => n.id === id);
        if (target) target.read_at = new Date().toISOString();
        return { success: true };
      } catch (err) {
        return { success: false, message: err.response?.data?.message || "Failed to mark as read." };
      }
    },
  },
});