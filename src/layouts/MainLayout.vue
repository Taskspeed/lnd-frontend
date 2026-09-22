<template>
  <q-layout view="lHh Lpr lFf" class="app-layout">
    <!-- =====================================================
         HEADER
    ====================================================== -->
    <q-header class="app-header">
      <q-toolbar class="app-toolbar">
        <q-btn flat round dense icon="menu" class="menu-btn" @click="toggleLeftDrawer" />

        <div class="header-office">
          <div class="office-name">{{ officeName }}</div>
        </div>

        <!-- NOTIFICATION BELL -->
        <q-btn flat round dense icon="notifications" class="notification-btn">
          <q-badge v-if="notificationCount > 0" color="red" floating rounded>
            {{ notificationCount }}
          </q-badge>

          <q-menu anchor="bottom right" self="top right" max-width="360px">
            <q-list class="notification-list">
              <q-item-label header class="notification-header">Notifications</q-item-label>

              <template v-if="notifications.length">
                <q-item v-for="n in notifications" :key="n.id" clickable v-close-popup @click="goToNotification(n)"
                  :class="{ 'notification-unread': !n.read_at }">
                  <q-item-section avatar>
                    <q-icon :name="n.data.title?.includes('Disapproved') ? 'cancel' : 'notifications'"
                      :color="n.data.title?.includes('Disapproved') ? 'negative' : 'primary'" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="notification-title">{{ n.data.title }}</q-item-label>
                    <q-item-label caption lines="2">{{ n.data.message }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>

              <q-item v-else>
                <q-item-section class="text-center text-grey-6">No notifications yet.</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <!-- User -->
        <q-btn flat no-caps class="header-user q-px-md">
          <q-avatar class="header-avatar">
            {{ userInitials }}
          </q-avatar>

          <div class="header-user-info">
            <div class="header-user-name">
              {{ userName }}
            </div>

            <div class="header-user-role">
              {{ userRole }}
            </div>
          </div>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- =====================================================
         SIDEBAR
    ====================================================== -->
    <q-drawer v-model="leftDrawerOpen" :width="260" :breakpoint="900" show-if-above bordered class="app-drawer">
      <div class="drawer-wrapper">
        <!-- =================================================
             BRAND
        ================================================== -->
        <div class="sidebar-brand">
          <img src="/image/LD.png" alt="L&D Logo" class="sidebar-logo" loading="lazy" />

          <div class="sidebar-brand-text">
            <div class="sidebar-title">Learning & Development</div>
            <div class="sidebar-subtitle">Management System</div>
          </div>
        </div>

        <!-- =================================================
             NAVIGATION for hr_admin
        ================================================== -->
        <q-scroll-area class="navigation-scroll">
          <div class="navigation">

            <template v-if="isOfficeAdmin">
              <div class="nav-section">OFFICE</div>


              <q-item clickable v-ripple :to="{ name: 'office-dashboard' }" class="nav-item"
                active-class="nav-item-active">
                <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
                <q-item-section>Dashboard</q-item-section>
              </q-item>


              <div class="nav-section">LEARNING</div>
              <q-item clickable v-ripple :to="{ name: 'office-events' }" class="nav-item"
                active-class="nav-item-active">
                <q-item-section avatar><q-icon name="event" /></q-item-section>
                <q-item-section>Events</q-item-section>
              </q-item>

              <q-item clickable v-ripple :to="{ name: 'bpm' }" class="nav-item" active-class="nav-item-active">
                <q-item-section avatar>
                  <q-icon name="account_tree" />
                </q-item-section>

                <q-item-section> BPM </q-item-section>
              </q-item>

               <!-- <q-item clickable v-ripple :to="{ name: 'office-events2' }" class="nav-item"
                active-class="nav-item-active">
                <q-item-section avatar><q-icon name="event" /></q-item-section>
                <q-item-section>Events2</q-item-section>
              </q-item> -->
            </template>


            <template v-if="isHrAdmin">
              <!-- Overview -->
              <div class="nav-section">OVERVIEW</div>

              <q-item clickable v-ripple :to="{ name: dashboardRoute }" exact class="nav-item"
                active-class="nav-item-active">
                <q-item-section avatar>
                  <q-icon name="dashboard" />
                </q-item-section>

                <q-item-section> Dashboard </q-item-section>
              </q-item>

              <!-- Learning -->
              <div class="nav-section">LEARNING</div>

              <q-item clickable v-ripple :to="{ name: eventsRoute }" class="nav-item" active-class="nav-item-active">
                <q-item-section avatar>
                  <q-icon name="event" />
                </q-item-section>

                <q-item-section> Events </q-item-section>
              </q-item>

              <!-- <q-item clickable v-ripple :to="{ name: 'bpm' }" class="nav-item" active-class="nav-item-active">
                <q-item-section avatar>
                  <q-icon name="account_tree" />
                </q-item-section>

                <q-item-section> BPM </q-item-section>
              </q-item> -->

              <!-- <q-item clickable v-ripple :to="{ name: 'assessment' }" class="nav-item" active-class="nav-item-active">
                <q-item-section avatar>
                  <q-icon name="assignment" />
                </q-item-section>

                <q-item-section> Assessment </q-item-section>
              </q-item> -->

              <q-item clickable v-ripple :to="{ name: 'certification' }" class="nav-item"
                active-class="nav-item-active">
                <q-item-section avatar>
                  <q-icon name="workspace_premium" />
                </q-item-section>

                <q-item-section> Certification </q-item-section>
              </q-item>
              <!-- Management -->
              <div class="nav-section">MANAGEMENT</div>

              <q-item clickable v-ripple :to="{ name: 'reports' }" class="nav-item" active-class="nav-item-active">
                <q-item-section avatar>
                  <q-icon name="bar_chart" />
                </q-item-section>

                <q-item-section> Reports </q-item-section>
              </q-item>

              <!-- <q-item
              clickable
              v-ripple
              :to="{ name: 'library' }"
              class="nav-item"
              active-class="nav-item-active"
            >
              <q-item-section avatar>
                <q-icon name="library_books" />
              </q-item-section>

              <q-item-section> Library </q-item-section>
            </q-item> -->
              <q-expansion-item v-model="libraryExpanded" dense-toggle class="nav-expansion"
                header-class="nav-item nav-expansion-header" expand-icon-class="nav-expansion-icon">
                <template #header>
                  <q-item-section avatar>
                    <q-icon name="library_books" />
                  </q-item-section>

                  <q-item-section> Library </q-item-section>
                </template>

                <q-item clickable v-ripple :to="{ name: 'title' }" class="nav-item nav-subitem"
                  active-class="nav-item-active">
                  <q-item-section avatar>
                    <q-icon name="title" />
                  </q-item-section>

                  <q-item-section> Title </q-item-section>
                </q-item>

                <q-item clickable v-ripple :to="{ name: 'mode' }" class="nav-item nav-subitem"
                  active-class="nav-item-active">
                  <q-item-section avatar>
                    <q-icon name="tune" />
                  </q-item-section>

                  <q-item-section> Mode </q-item-section>
                </q-item>

                <q-item clickable v-ripple :to="{ name: 'venue' }" class="nav-item nav-subitem"
                  active-class="nav-item-active">
                  <q-item-section avatar>
                    <q-icon name="place" />
                  </q-item-section>

                  <q-item-section> Venue </q-item-section>
                </q-item>

                <q-item clickable v-ripple :to="{ name: 'category' }" class="nav-item nav-subitem"
                  active-class="nav-item-active">
                  <q-item-section avatar>
                    <q-icon name="category" />
                  </q-item-section>

                  <q-item-section> Competency </q-item-section>
                </q-item>

                <q-item clickable v-ripple :to="{ name: 'type' }" class="nav-item nav-subitem"
                  active-class="nav-item-active">
                  <q-item-section avatar>
                    <q-icon name="event_note" />
                  </q-item-section>

                  <q-item-section> Activity </q-item-section>
                </q-item>



                <q-item clickable v-ripple :to="{ name: 'speaker' }" class="nav-item nav-subitem"
                  active-class="nav-item-active">
                  <q-item-section avatar>
                    <q-icon name="person" />
                  </q-item-section>
                  <q-item-section> Speaker </q-item-section>
                </q-item>
              </q-expansion-item>


              <q-item clickable v-ripple :to="{ name: 'users' }" class="nav-item" active-class="nav-item-active">
                <q-item-section avatar>
                  <q-icon name="manage_accounts" />
                </q-item-section>

                <q-item-section> User </q-item-section>
              </q-item>
            </template>

          </div>

        </q-scroll-area>

        <!-- =================================================
             USER CARD & FOOTER
        ================================================== -->
        <div class="sidebar-footer">
          <!-- Sign Out -->
          <q-btn flat no-caps align="left" class="sidebar-signout" @click="logout">
            <q-icon name="logout" size="21px" />

            <span> Sign Out </span>
          </q-btn>

          <div class="sidebar-credit">Developed by CICTMO · SPM Section</div>
        </div>
      </div>
    </q-drawer>

    <!-- =====================================================
         CONTENT
    ====================================================== -->
    <q-page-container class="page-container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted } from "vue";

import { useRouter } from "vue-router";
import { useAuthStore } from "stores/authStore";
import { useNotificationStore } from "src/stores/notificationStore";
import { notificationRoutes } from "src/constants/notification";

export default defineComponent({
  name: "MainLayout",

  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const libraryExpanded = ref(false);
    const leftDrawerOpen = ref(false);
    const notificationStore = useNotificationStore(); // idagdag

    // Pulled live from the auth store
    const userName = computed(() => authStore.fullName || "User");
    const officeName = computed(() => authStore.office || "No Office Assigned");

    const userRole = computed(() => {
      const role = authStore.roles?.[0];
      return role ? role.charAt(0).toUpperCase() + role.slice(1) : "Employee";
    });


    const isOfficeAdmin = computed(() => authStore.roles?.includes("office_admin"));
    const isHrAdmin = computed(() => authStore.roles?.includes("hr_admin"));
    const dashboardRoute = computed(() =>
      isOfficeAdmin.value ? "office-dashboard" : "dashboard"
    );
    const eventsRoute = computed(() =>
      isOfficeAdmin.value ? "office-events" : "events"
    );

    const notificationCount = computed(() => notificationStore.unreadCount);
    const notifications = computed(() => notificationStore.notifications);
    let pollInterval = null;

  function goToNotification(n) {
    if (!n.read_at) notificationStore.markAsRead(n.id);

    const data = n.data || {};
    const buildRoute = notificationRoutes[data.type];

    if (buildRoute) {
      router.push(buildRoute(data));
    } else {
      console.warn("Unknown notification type:", data.type);
    }
  }
    onMounted(() => {
      notificationStore.fetchNotifications();
      pollInterval = setInterval(() => {
        notificationStore.fetchNotifications();
      }, 30000); // every 30s
    });

    onUnmounted(() => {
      if (pollInterval) clearInterval(pollInterval);
    });
    const userInitials = computed(() => {
      return userName.value
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();
    });

    function toggleLeftDrawer() {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    }

    function goToProfile() {
      router.push({
        name: "profile",
      });
    }

    function goToSettings() {
      router.push({
        name: "settings",
      });
    }

    async function logout() {
      await authStore.logout();
      router.push({
        name: "login",
      });
    }

    return {
      leftDrawerOpen,

      userName,
      userRole,
      userInitials,
      officeName,

      notificationCount,
      libraryExpanded,
      toggleLeftDrawer,
      dashboardRoute,
      eventsRoute,

      goToProfile,
      goToSettings,

      isOfficeAdmin,
      isHrAdmin,
      logout,
      notifications,
      goToNotification,
    };
  },
});
</script>

<style scoped>
/* =========================================================
   MAIN LAYOUT
========================================================= */

.app-layout {
  background: #f3f9f4;
}

/* =========================================================
   HEADER
========================================================= */

/* .app-header {
  background: #ffffff;
  color: #172b3a;
  border-bottom: 1px solid #e6eee8;
  box-shadow: 0 2px 12px rgba(24, 67, 40, 0.05);
} */
.app-header {
  background: #ffffff;
  color: #172b3a;
  border-bottom: 1px solid #e6eee8;
  box-shadow: 0 2px 12px rgba(24, 67, 40, 0.05);
  /* TANGGALIN: position: fixed; top: 0; left: 0; right: 0; width: 100vw; */
}

.app-toolbar {
  min-height: 72px;
  padding: 8px 22px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
}

.menu-btn {
  color: #16364a;
  flex-shrink: 0;
}

/* =========================================================
   HEADER OFFICE - Full display without ellipsis
========================================================= */

.header-office {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.office-name {
  font-size: 14px;
  font-weight: 700;
  color: #172b3a;
  line-height: 1.4;
  /* Removed: white-space: nowrap, overflow: hidden, text-overflow: ellipsis */
  word-wrap: break-word;
  word-break: break-word;
  width: 100%;
}

/* =========================================================
   NOTIFICATION BUTTON
========================================================= */

.notification-btn {
  color: #61727a;
  flex-shrink: 0;
}

.notification-btn:hover {
  color: #168c45;
  background: #eff9f1;
}

/* =========================================================
   HEADER USER
========================================================= */

.header-user {
  min-height: 48px;
  padding: 4px 6px;
  border-radius: 10px;
  flex-shrink: 0;
}

.header-user:hover {
  background: #f4f9f5;
}

.header-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #0b9b4b, #08763d);
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
  flex-shrink: 0;
}

.header-user-info {
  margin-left: 10px;
  text-align: left;
  line-height: 1;
}

.header-user-name {
  font-size: 12px;
  font-weight: 700;
  color: #172b3a;
  line-height: 1.2;
}

.header-user-role {
  margin-top: 1px;
  font-size: 10px;
  color: #7c898f;
  line-height: 1.2;
}

/* =========================================================
   SIDEBAR
========================================================= */

.app-drawer {
  background: #ffffff;
  color: #33434b;
}

.drawer-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* =========================================================
   SIDEBAR BRAND
========================================================= */

.sidebar-brand {
  display: flex;
  align-items: center;
  padding: 20px 16px 16px;
  border-bottom: 1px solid #e6eee8;
}

.sidebar-logo {
  width: 50px;
  height: 50px;
  object-fit: contain;
  flex-shrink: 0;
}

.sidebar-brand-text {
  margin-left: 10px;
  min-width: 0;
}

.sidebar-title {
  font-size: 13px;
  font-weight: 750;
  color: #172b3a;
  line-height: 1.2;
}

.sidebar-subtitle {
  margin-top: 2px;
  font-size: 10px;
  color: #73818a;
}

/* =========================================================
   NAVIGATION
========================================================= */

.navigation-scroll {
  flex: 1;
}

.navigation {
  padding: 5px 13px 20px;
}

.nav-section {
  padding: 17px 12px 8px;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.7px;
  color: #292929;
}

.nav-item {
  min-height: 40px;
  margin: 0;
  padding: 0 10px;
  font-size: 12px;
  border-radius: 10px;
  color: #282828;
  transition: all 0.18s ease;
}

.nav-item:hover {
  background: #f0f8f2;
  color: #087a3f;
}

.nav-item .q-item__section--avatar {
  min-width: 40px;
  color: #668087;
}

.nav-item-active {
  background: linear-gradient(90deg, #51d878 0%, #47d16e 100%) !important;
  color: #ffffff !important;
  font-weight: 650;
  box-shadow: 0 5px 12px rgba(57, 181, 74, 0.18);
}

.nav-item-active .q-item__section--avatar {
  color: #ffffff !important;
}

/* =========================================================
   SIDEBAR FOOTER
========================================================= */

.sidebar-footer {
  padding: 14px 14px 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fcf9 100%);
}

.sidebar-signout {
  width: 100%;
  margin-top: 8px;
  font-size: 12px;
  min-height: 42px;
  border-radius: 10px;
  color: #65757b;
  justify-content: flex-start;
}

.sidebar-signout:hover {
  background: #f7eeee;
  color: #c62828;
}

.sidebar-signout .q-icon {
  margin-right: 12px;
}

.sidebar-credit {
  padding-top: 12px;
  text-align: center;
  font-size: 8px;
  color: #a0aaa5;
}

/* =========================================================
   PAGE CONTAINER
========================================================= */

.page-container {
  min-height: calc(100vh - 72px);
  background: #f8f9fa;
}

/* =========================================================
   RESPONSIVE - TABLET
========================================================= */

@media (max-width: 900px) {
  .app-toolbar {
    min-height: 64px;
    padding: 6px 14px;
    gap: 8px;
  }

  .office-name {
    font-size: 12px;
    line-height: 1.3;
  }

  .header-user-info {
    display: none;
  }

  .header-avatar {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .page-container {
    min-height: calc(100vh - 64px);
  }
}

/* =========================================================
   RESPONSIVE - MOBILE
========================================================= */

@media (max-width: 600px) {
  .app-toolbar {
    padding: 4px 8px;
    gap: 6px;
    flex-wrap: wrap;
  }

  .menu-btn {
    margin-right: 0;
  }

  .office-name {
    font-size: 11px;
    font-weight: 700;
    line-height: 1.2;
  }

  .header-avatar {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .notification-btn {
    margin-right: 0;
  }
}

/* =========================================================
   RESPONSIVE - EXTRA SMALL
========================================================= */

@media (max-width: 400px) {
  .app-toolbar {
    padding: 4px 6px;
    gap: 4px;
  }

  .office-name {
    font-size: 10px;
    line-height: 1.2;
  }

  .header-user {
    padding: 2px 4px;
    min-height: 36px;
  }

  .header-avatar {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}

.nav-expansion {
  border-radius: 10px;
  overflow: hidden;
}

.nav-expansion-header {
  min-height: 40px;
  padding: 0 10px;
  border-radius: 10px;
}

.nav-expansion :deep(.q-item__section--avatar) {
  min-width: 40px;
  color: #668087;
}

.nav-subitem {
  padding-left: 20px;
}

.notification-list {
  min-width: 300px;
  max-height: 400px;
  overflow-y: auto;
}

.notification-header {
  font-size: 11px;
  font-weight: 700;
  color: #7c898f;
}

.notification-title {
  font-size: 12px;
  font-weight: 650;
  color: #172b3a;
}

.notification-unread {
  background: #f0f8f2;
}
</style>
