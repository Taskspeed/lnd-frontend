<template>
  <q-page class="user-page">
    <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
    <section class="page-header">
      <div>
        <h5>User Management</h5>

        <p>Manage system users, roles, and account access.</p>
      </div>

      <q-btn unelevated no-caps icon="person_add" label="Add User" class="add-user-btn" @click="openAddUser" />
    </section>

    <!-- =====================================================
         USER MANAGEMENT CARD
    ====================================================== -->
    <q-card flat class="users-card">
      <!-- ===================================================
           FILTERS
      ==================================================== -->
      <div class="filter-section">
        <q-input v-model="search" outlined dense clearable
          placeholder="Search by name, username, office, or control no..." class="search-input">
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-btn flat no-caps icon="filter_alt_off" label="Clear" class="clear-btn" @click="clearFilters" />
      </div>

      <!-- ===================================================
           TABLE
      ==================================================== -->
      <div class="table-wrapper">
        <q-table flat :rows="filteredUsers" :columns="columns" row-key="id" hide-pagination :rows-per-page-options="[0]"
          :loading="userStore.isLoading" class="app-table users-table">
          <!-- USER -->
          <template #body-cell-user="props">
            <q-td :props="props">
              <div class="user-cell">
                <div class="user-info">
                  <div class="app-table-cell-title">
                    {{ props.row.name }}
                  </div>

                  <!-- <div class="app-table-cell-meta">@{{ props.row.username }}</div> -->
                </div>
              </div>
            </q-td>
          </template>

          <!-- ACTIONS -->
          <template #body-cell-actions="props">
            <q-td :props="props">
              <div class="action-buttons">
                <q-btn flat round dense icon="edit" class="action-edit" @click="editUser(props.row)">
                  <q-tooltip> Edit User </q-tooltip>
                </q-btn>

                <q-btn flat round dense icon="delete" class="action-delete" @click="confirmDeleteUser(props.row)">
                  <q-tooltip> Delete User </q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <!-- EMPTY STATE -->
          <template #no-data>
            <div class="app-table-empty">No users found.</div>
          </template>
        </q-table>
      </div>

      <!-- ===================================================
           TABLE FOOTER
      ==================================================== -->
      <div class="table-footer">
        <span>
          Showing
          <strong>{{ filteredUsers.length }}</strong>
          of
          <strong>{{ userStore.users.length }}</strong>
          users
        </span>
      </div>
    </q-card>

    <!-- =====================================================
         ADD USER DIALOG (Office + Employee -> Account)
    ====================================================== -->
    <q-dialog v-model="showAddDialog" @hide="resetAddFlow">
      <q-card class="user-dialog wizard-dialog">
        <q-card-section class="dialog-header">
          <div>
            <div class="dialog-title">Add New User</div>

            <div class="dialog-subtitle">
              {{ addStepSubtitle }}
            </div>
          </div>

          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-stepper v-model="addStep" flat animated header-nav class="wizard-stepper">
          <!-- STEP 1: OFFICE + EMPLOYEE -->
          <q-step :name="1" title="Employee" icon="badge" :done="addStep > 1">
            <q-banner v-if="officeStore.error" dense rounded class="bg-red-2 text-red-9 q-mb-sm">
              {{ officeStore.error }}
            </q-banner>

            <q-select v-model="selectedOffice" outlined dense use-input input-debounce="0"
              label="Search and select an office" :options="officeOptions" option-label="office_name"
              option-value="officeId" :loading="officeStore.loading" class="q-mb-sm" @filter="filterOffices"
              @update:model-value="onOfficeSelected" />

            <template v-if="selectedOffice">
              <q-input v-model="employeeSearch" outlined dense clearable
                placeholder="Search employees in this office..." class="q-mb-sm">
                <template #prepend>
                  <q-icon name="search" />
                </template>
              </q-input>

              <q-table flat :rows="filteredEmployees" :columns="employeeColumns" row-key="ControlNo" hide-pagination
                wrap-cells :rows-per-page-options="[0]" :loading="officeStore.loading" class="app-table employee-table">
                <template #body="props">
                  <q-tr :props="props" class="employee-row" :class="{
                    'employee-row--active':
                      selectedEmployee?.ControlNo === props.row.ControlNo,
                  }" @click="selectEmployee(props.row)">
                    <q-td v-for="col in props.cols" :key="col.name" :props="props">
                      <div v-if="col.name === 'name'" class="employee-name-cell">
                        <q-icon name="check_circle" size="16px" class="employee-check" />
                        <span>{{ col.value }}</span>
                      </div>
                      <template v-else>{{ col.value }}</template>
                    </q-td>
                  </q-tr>
                </template>

                <template #no-data>
                  <div class="app-table-empty">
                    No employees found for this office.
                  </div>
                </template>
              </q-table>
            </template>

            <div v-else class="empty-office-hint">
              <q-icon name="apartment" size="22px" />
              <span>Select an office above to view its employees.</span>
            </div>
          </q-step>

          <!-- STEP 2: ACCOUNT DETAILS -->
          <q-step :name="2" title="Account" icon="admin_panel_settings">
            <q-banner v-if="userStore.error" dense rounded class="bg-red-2 text-red-9 q-mb-sm">
              {{ userStore.error }}
            </q-banner>

            <div class="readonly-grid">
              <q-input :model-value="selectedEmployee?.name" outlined dense readonly label="Full Name" />

              <q-input :model-value="selectedOffice?.office_name" outlined dense readonly label="Office / Division" />
            </div>

            <div class="form-grid">
              <q-input v-model="form.username" outlined dense label="Username" />

              <q-input v-model="form.password" outlined dense type="password" label="Password" />

              <q-input v-model="form.control_no" outlined dense label="Control No." />

              <q-select v-model="form.role" outlined dense emit-value map-options label="Role"
                :options="rolePermissionStore.roles" option-label="name" option-value="name"
                :loading="rolePermissionStore.rolesLoading" />

              <q-select v-model="form.permissions" outlined dense multiple use-chips emit-value map-options
                label="Permissions" :options="rolePermissionStore.permissions" option-label="name" option-value="name"
                :loading="rolePermissionStore.permissionsLoading" class="col-span-2" />
            </div>
          </q-step>
        </q-stepper>

        <q-separator />

        <q-card-actions align="right" class="dialog-actions">
          <q-btn v-if="addStep > 1" flat no-caps label="Back" class="cancel-btn" @click="goBack" />

          <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />

          <q-btn v-if="addStep < 2" unelevated no-caps label="Continue" class="save-btn" :disable="!canContinue"
            :loading="officeStore.loading" @click="goNext" />

          <q-btn v-else unelevated no-caps label="Create User" class="save-btn" :loading="userStore.isLoading"
            @click="createUserFromWizard" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- =====================================================
         EDIT USER DIALOG
    ====================================================== -->
    <q-dialog v-model="showEditDialog">
      <q-card class="user-dialog">
        <q-card-section class="dialog-header">
          <div>
            <div class="dialog-title">Edit User</div>

            <div class="dialog-subtitle">Update user account information.</div>
          </div>

          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="dialog-body">
          <q-banner v-if="userStore.error" dense rounded class="bg-red-2 text-red-9 q-mb-sm">
            {{ userStore.error }}
          </q-banner>

          <div class="form-grid">
            <q-input v-model="form.name" outlined dense label="Full Name" />

            <q-input v-model="form.username" outlined dense label="Username" />

            <q-input v-model="form.password" outlined dense type="password" label="New Password (optional)" />

            <q-input v-model="form.control_no" outlined dense label="Control No." />

            <q-select v-model="form.role" outlined dense emit-value map-options label="Role"
              :options="rolePermissionStore.roles" option-label="name" option-value="name"
              :loading="rolePermissionStore.rolesLoading" />

            <q-select v-model="form.permissions" outlined dense multiple use-chips emit-value map-options
              label="Permissions" :options="rolePermissionStore.permissions" option-label="name" option-value="name"
              :loading="rolePermissionStore.permissionsLoading" class="col-span-2" />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />

          <q-btn unelevated no-caps label="Save Changes" class="save-btn" :loading="userStore.isLoading"
            @click="saveEditedUser" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- =====================================================
         DELETE CONFIRMATION DIALOG
    ====================================================== -->
    <q-dialog v-model="showDeleteDialog">
      <q-card class="delete-dialog">
        <q-card-section class="dialog-body">
          <div class="delete-title">Delete User</div>
          <div class="delete-message">
            Are you sure you want to delete
            <strong>{{ userToDelete?.name }}</strong>? This action cannot be undone.
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />

          <q-btn unelevated no-caps label="Delete" class="delete-btn" :loading="userStore.isLoading"
            @click="deleteUser" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, computed, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { useUserStore } from "stores/userStore";
import { useOfficeStore } from "stores/officeStore";
import { useRolePermissionStore } from "stores/rolePermissionStore";

export default defineComponent({
  name: "UserPage",

  setup() {
    const $q = useQuasar();
    const userStore = useUserStore();
    const officeStore = useOfficeStore();
    const rolePermissionStore = useRolePermissionStore();

    const search = ref("");

    // ---------------------------------------------------------------
    // Table columns
    // ---------------------------------------------------------------
    const columns = [
      {
        name: "user",
        label: "USER",
        field: "name",
        align: "left",
        sortable: true,
      },
      {
        name: "control_no",
        label: "CONTROL NO",
        field: "control_no",
        align: "left",
      },
      {
        name: "office",
        label: "OFFICE",
        field: "office",
        align: "left",
      },
      {
        name: "actions",
        label: "Action",
        field: "actions",
        align: "center",
      },
    ];

    const employeeColumns = [
      {
        name: "ControlNo",
        label: "CONTROL NO.",
        field: "ControlNo",
        align: "left",
      },
      {
        name: "name",
        label: "NAME",
        field: "name",
        align: "left",
        sortable: true,
      },
      {
        name: "position",
        label: "POSITION",
        field: "position",
        align: "left",
      },
    ];

    const filteredUsers = computed(() => {
      const keyword = search.value.toLowerCase().trim();
      if (!keyword) return userStore.users;

      return userStore.users.filter((user) => {
        return (
          user.name?.toLowerCase().includes(keyword) ||
          user.username?.toLowerCase().includes(keyword) ||
          user.office?.toLowerCase().includes(keyword) ||
          user.control_no?.toLowerCase().includes(keyword)
        );
      });
    });

    function getInitials(name) {
      return (name || "")
        .split(" ")
        .map((word) => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    }

    function clearFilters() {
      search.value = "";
    }

    function notify(type, message) {
      $q.notify({
        type: type === "success" ? "positive" : "negative",
        message,
        position: "top",
      });
    }

    // ---------------------------------------------------------------
    // ADD USER WIZARD (Office + Employee -> Account)
    // ---------------------------------------------------------------
    const showAddDialog = ref(false);
    const addStep = ref(1);

    const selectedOffice = ref(null);
    const selectedEmployee = ref(null);
    const officeOptions = ref([]);
    const employeeSearch = ref("");

    const emptyForm = () => ({
      name: "",
      username: "",
      password: "",
      control_no: "",
      office: "",
      role: "",
      permissions: [],
    });

    const form = ref(emptyForm());

    const addStepSubtitle = computed(() => {
      if (addStep.value === 1)
        return "Select the office, then pick the employee to create an account for.";
      return "Set the username, password, role, and permissions.";
    });

    const canContinue = computed(() => {
      if (addStep.value === 1)
        return !!selectedOffice.value && !!selectedEmployee.value;
      return true;
    });

    const filteredEmployees = computed(() => {
      const keyword = employeeSearch.value.toLowerCase().trim();
      if (!keyword) return officeStore.employees;

      return officeStore.employees.filter(
        (employee) =>
          employee.name?.toLowerCase().includes(keyword) ||
          employee.position?.toLowerCase().includes(keyword) ||
          employee.ControlNo?.toLowerCase().includes(keyword)
      );
    });

    function filterOffices(val, update) {
      update(() => {
        if (!val) {
          officeOptions.value = officeStore.offices;
          return;
        }

        const keyword = val.toLowerCase();
        officeOptions.value = officeStore.offices.filter((office) =>
          office.office_name?.toLowerCase().includes(keyword)
        );
      });
    }

    // Selecting/changing the office immediately loads its employees so the
    // admin sees the list without an extra "Continue" click.
    async function onOfficeSelected(office) {
      selectedEmployee.value = null;
      employeeSearch.value = "";
      officeStore.clearEmployees();

      if (office) {
        await officeStore.fetchEmployeesByOffice(office.office_name);
      }
    }

    // Clicking anywhere on a row selects that employee (toggle off if
    // the same row is clicked again).
    function selectEmployee(employee) {
      if (selectedEmployee.value?.ControlNo === employee.ControlNo) {
        selectedEmployee.value = null;
        return;
      }
      selectedEmployee.value = employee;
    }

    async function openAddUser() {
      resetAddFlow();
      showAddDialog.value = true;
      await officeStore.fetchOffices();
      officeOptions.value = officeStore.offices;

      // Roles/permissions rarely change mid-session; only fetch if empty.
      if (!rolePermissionStore.roles.length) {
        rolePermissionStore.fetchRoles();
      }
      if (!rolePermissionStore.permissions.length) {
        rolePermissionStore.fetchPermissions();
      }
    }

    function goNext() {
      if (
        addStep.value === 1 &&
        selectedOffice.value &&
        selectedEmployee.value
      ) {
        form.value.control_no = selectedEmployee.value.ControlNo || "";
        addStep.value = 2;
      }
    }

    function goBack() {
      if (addStep.value > 1) addStep.value -= 1;
    }

    function resetAddFlow() {
      addStep.value = 1;
      selectedOffice.value = null;
      selectedEmployee.value = null;
      employeeSearch.value = "";
      form.value = emptyForm();
      officeStore.clearEmployees();
      officeStore.clearError();
      userStore.clearError();
    }

    async function createUserFromWizard() {
      userStore.clearError();

      const result = await userStore.createUser({
        name: selectedEmployee.value.name,
        username: form.value.username,
        password: form.value.password,
        control_no: form.value.control_no,
        office: selectedOffice.value.office_name,
        role: form.value.role,
        permissions: form.value.permissions,
      });

      if (result.success) {
        showAddDialog.value = false;
        notify("success", result.message || "User created successfully.");
      }
    }

    // ---------------------------------------------------------------
    // EDIT USER
    // ---------------------------------------------------------------
    const showEditDialog = ref(false);
    const editingUser = ref(null);

    async function editUser(user) {
      editingUser.value = user;
      form.value = {
        name: user.name,
        username: user.username,
        password: "",
        control_no: user.control_no,
        office: user.office,
        role: user.role || "",
        permissions: user.permissions || [],
      };
      userStore.clearError();
      showEditDialog.value = true;

      if (!rolePermissionStore.roles.length) {
        rolePermissionStore.fetchRoles();
      }
      if (!rolePermissionStore.permissions.length) {
        rolePermissionStore.fetchPermissions();
      }
    }

    async function saveEditedUser() {
      userStore.clearError();

      const payload = {
        name: form.value.name,
        username: form.value.username,
        control_no: form.value.control_no,
        role: form.value.role,
        permissions: form.value.permissions,
      };

      // Only send a password if the admin actually typed a new one
      if (form.value.password) {
        payload.password = form.value.password;
      }

      const result = await userStore.updateUser(editingUser.value.id, payload);

      if (result.success) {
        showEditDialog.value = false;
        notify("success", result.message || "User updated successfully.");
      }
    }

    // ---------------------------------------------------------------
    // DELETE USER
    // ---------------------------------------------------------------
    const showDeleteDialog = ref(false);
    const userToDelete = ref(null);

    function confirmDeleteUser(user) {
      userToDelete.value = user;
      showDeleteDialog.value = true;
    }

    async function deleteUser() {
      if (!userToDelete.value) return;

      const result = await userStore.deleteUser(userToDelete.value.id);

      if (result.success) {
        showDeleteDialog.value = false;
        notify("success", result.message || "User deleted successfully.");
      } else {
        notify("error", result.message);
      }
    }

    onMounted(() => {
      userStore.fetchUsers();
      rolePermissionStore.fetchRoles();
      rolePermissionStore.fetchPermissions();
    });

    return {
      userStore,
      officeStore,
      rolePermissionStore,

      search,
      columns,
      employeeColumns,
      filteredUsers,

      // Add wizard
      showAddDialog,
      addStep,
      addStepSubtitle,
      canContinue,
      selectedOffice,
      selectedEmployee,
      officeOptions,
      employeeSearch,
      filteredEmployees,
      filterOffices,
      onOfficeSelected,
      selectEmployee,
      openAddUser,
      goNext,
      goBack,
      resetAddFlow,
      createUserFromWizard,

      // Edit
      showEditDialog,
      editingUser,
      form,
      editUser,
      saveEditedUser,

      // Delete
      showDeleteDialog,
      userToDelete,
      confirmDeleteUser,
      deleteUser,

      getInitials,
      clearFilters,
    };
  },
});
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */

.user-page {
  min-height: 100%;
  padding: 20px;
  color: #19354a;
}

/* =========================================================
   PAGE HEADER
========================================================= */

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 18px;
}

.page-header h5 {
  margin: 5px 0 3px;

  color: #19354a;
  font-size: 18px;
  font-weight: 750;
}

.page-header p {
  margin: 0;

  color: #718089;
  font-size: 12px;
}

.add-user-btn {
  min-height: 42px;

  padding: 0 18px;

  border-radius: 9px;

  color: #ffffff;
  background: linear-gradient(135deg, #18b64d, #0ca344);

  font-size: 12px;
  font-weight: 650;

  box-shadow: 0 4px 10px rgba(16, 167, 70, 0.18);
}

/* =========================================================
   USERS CARD
========================================================= */

.users-card {
  overflow: hidden;

  border-radius: 13px;

  background: #ffffff;

  box-shadow: 0 3px 12px rgba(30, 70, 42, 0.055);
}

/* =========================================================
   CARD HEADER
========================================================= */

.card-header {
  min-height: 68px;

  display: flex;
  align-items: center;

  padding: 14px 20px;
}

.card-title-wrapper {
  display: flex;
  align-items: center;

  gap: 11px;
}

.card-icon {
  width: 34px;
  height: 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 8px;
}

.card-icon.green {
  color: #078744;
  background: #eaf8ed;
}

.card-title-wrapper h2 {
  margin: 0;

  color: #19354a;

  font-size: 16px;
  font-weight: 700;
}

.card-subtitle {
  display: block;

  margin-top: 2px;

  color: #8a989e;

  font-size: 10px;
}

/* =========================================================
   FILTERS
========================================================= */

.filter-section {
  display: flex;
  align-items: center;

  gap: 10px;

  padding: 13px 20px;

  border-top: 1px solid #edf1ef;
  border-bottom: 1px solid #edf1ef;

  background: #fcfdfc;
}

.search-input {
  flex: 1;

  max-width: 380px;
}

.search-input :deep(.q-field__control) {
  min-height: 38px;

  border-radius: 8px;
}

.search-input :deep(.q-field__native) {
  font-size: 11px;
}

.search-input :deep(.q-field__prepend) {
  color: #809097;
}

.clear-btn {
  color: #6f8087;

  font-size: 10px;
}

/* =========================================================
   TABLE
========================================================= */

.table-wrapper {
  padding: 0 12px;
}

.users-table {
  box-shadow: none;
}

/* =========================================================
   USER CELL
========================================================= */

.user-cell {
  display: flex;
  align-items: center;

  gap: 10px;
}

.user-avatar {
  color: #087c42;

  background: #e1f7e7;

  font-size: 12px;
  font-weight: 700;
}

.user-info {
  min-width: 0;
}

/* =========================================================
   ACTIONS
========================================================= */

.action-buttons {
  display: flex;
  justify-content: center;

  gap: 2px;
}

.action-edit {
  color: #16a84a;
}

.action-delete {
  color: #d35d5d;
}

/* =========================================================
   TABLE FOOTER
========================================================= */

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 13px 20px;

  border-top: 1px solid #edf1ef;

  color: #87949a;

  font-size: 10px;
}

.table-footer strong {
  color: #405967;
}

/* =========================================================
   DIALOG
========================================================= */

.user-dialog {
  width: 560px;
  max-width: 92vw;

  border-radius: 14px;
}

.wizard-dialog {
  width: 620px;
}

.wizard-stepper {
  padding: 4px 16px 16px;
  box-shadow: none;
}

.wizard-stepper :deep(.q-stepper__step-inner) {
  padding-top: 10px;
}

.wizard-stepper :deep(.q-stepper__tab) {
  padding: 8px 12px;
  min-height: unset;
}

.employee-table {
  max-height: 280px;
}

/* Rows are clickable in place of a dedicated "select" column. */
.employee-table :deep(tbody tr.employee-row) {
  cursor: pointer;

  transition: background 0.15s ease, color 0.15s ease;
}

.employee-table :deep(tbody tr.employee-row:hover) {
  background: #f4fbf6;
}

.employee-table :deep(tbody tr.employee-row--active) {
  background: #e1f7e7;
}

.employee-table :deep(tbody tr.employee-row--active td) {
  color: #087c42;
  font-weight: 650;
}

.employee-name-cell {
  display: flex;
  align-items: center;

  gap: 8px;
}

.employee-check {
  color: #16a84a;

  opacity: 0;

  transition: opacity 0.15s ease;
}

.employee-row--active .employee-check {
  opacity: 1;
}

.empty-office-hint {
  display: flex;
  flex-direction: column;
  align-items: center;

  gap: 6px;

  padding: 24px 0;

  color: #9aa7ac;

  font-size: 12px;
  text-align: center;
}

.delete-dialog {
  width: 400px;
  max-width: 92vw;

  border-radius: 14px;
}

.delete-title {
  color: #19354a;

  font-size: 15px;
  font-weight: 750;
}

.delete-message {
  margin-top: 6px;

  color: #5c6b73;

  font-size: 12px;
  line-height: 1.5;
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  padding: 16px 18px;
}

.dialog-icon {
  width: 34px;
  height: 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 7px;

  border-radius: 9px;

  color: #087c42;
  background: #e5f8ea;
}

.dialog-title {
  color: #19354a;

  font-size: 16px;
  font-weight: 750;
}

.dialog-subtitle {
  margin-top: 2px;

  color: #839097;

  font-size: 10px;
}

.dialog-body {
  padding: 16px 18px;
}

/* Readonly employee/office summary shown at the top of Step 2. */
.readonly-grid {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 10px;

  margin-bottom: 10px;
}

.readonly-grid :deep(.q-field__control) {
  border-radius: 8px;
}

.form-grid {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 10px;
}

.form-grid .col-span-2 {
  grid-column: 1 / -1;
}

.form-grid :deep(.q-field__control) {
  border-radius: 8px;
}

.form-grid :deep(.q-field__native),
.form-grid :deep(.q-field__label) {
  font-size: 11px;
}

.dialog-actions {
  padding: 10px 18px;

  background: #fcfdfc;
}

.cancel-btn {
  color: #718089;

  font-size: 11px;
}

.save-btn {
  min-height: 35px;

  padding: 0 16px;

  border-radius: 8px;

  color: #ffffff;

  background: linear-gradient(135deg, #18b64d, #0ca344);

  font-size: 11px;
}

.delete-btn {
  min-height: 35px;

  padding: 0 16px;

  border-radius: 8px;

  color: #ffffff;

  background: linear-gradient(135deg, #e05353, #c73f3f);

  font-size: 11px;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 900px) {
  .filter-section {
    flex-wrap: wrap;
  }

  .search-input {
    max-width: none;

    width: 100%;
    flex-basis: 100%;
  }
}

@media (max-width: 650px) {
  .user-page {
    padding: 14px;
  }

  .page-header {
    align-items: flex-start;

    gap: 15px;

    flex-direction: column;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .users-table {
    min-width: 700px;
  }

  .form-grid,
  .readonly-grid {
    grid-template-columns: 1fr;
  }
}
</style>
