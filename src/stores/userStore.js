import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "boot/axios";

export const useUserStore = defineStore("user", () => {
  // ---------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------
  const users = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  const total = ref(0);

  // ---------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------

  async function fetchUsers({ page = 1, perPage = 10, search = "" } = {}) {
    isLoading.value = true;
    error.value = null;

    try {
      const { data } = await api.get("/user/index", {
        params: { page, per_page: perPage, search },
      });

      if (data.success) {
        users.value = data.data.data; // array ng users
        total.value = data.data.total;
      } else {
        users.value = [];
        total.value = 0;
      }

      return { success: data.success, message: data.message };
    } catch (err) {
      error.value = err.response?.data?.message || "Unable to load users.";
      return { success: false, message: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  async function createUser(payload) {
    isLoading.value = true;
    error.value = null;

    try {
      const { data } = await api.post("/user/register", payload);

      if (!data.success) {
        error.value = data.message || "Failed to create user.";
        return { success: false, message: error.value };
      }

      await fetchUsers();
      return { success: true, message: data.message };
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to create user.";
      return { success: false, message: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  async function updateUser(userId, payload) {
    isLoading.value = true;
    error.value = null;

    try {
      const { data } = await api.put(`/user/edit/${userId}`, payload);

      if (!data.success) {
        error.value = data.message || "Failed to update user.";
        return { success: false, message: error.value };
      }

      await fetchUsers();
      return { success: true, message: data.message };
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to update user.";
      return { success: false, message: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteUser(userId) {
    isLoading.value = true;
    error.value = null;

    try {
      const { data } = await api.delete(`/user/delete/${userId}`);

      if (!data.success) {
        error.value = data.message || "Failed to delete user.";
        return { success: false, message: error.value };
      }

      users.value = users.value.filter((user) => user.id !== userId);
      return { success: true, message: data.message };
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to delete user.";
      return { success: false, message: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  function clearError() {
    error.value = null;
  }

  return {
    // state
    users,
    total,
    isLoading,
    error,
    // actions
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    clearError,
  };
});
