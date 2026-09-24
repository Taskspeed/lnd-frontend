import { defineStore } from "pinia";
import { profile_update, profile_view } from "src/service/auth/profileService";

export const useProfileStore = defineStore("profile", {
  state: () => ({
    profile: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchProfile() {
      this.loading = true;
      this.error = null;

      try {
        const response = await profile_view();

        if (response.data.success) {
          this.profile = response.data.data;
          return { success: true };
        }

        this.error = response.data.message;
        return { success: false, message: response.data.message };
      } catch (err) {
        this.error = "Failed to fetch profile";
        console.error("Error fetching profile:", err);
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    async updateProfile(payload) {
      this.error = null;

      try {
        const response = await profile_update(payload);

        if (response.data.success) {
          await this.fetchProfile();
          return {
            success: true,
            message: response.data.message || "Profile updated successfully",
          };
        }

        this.error = response.data.message;
        return { success: false, message: response.data.message };
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to update profile";
        this.error = message;
        return { success: false, message };
      }
    },
  },
});