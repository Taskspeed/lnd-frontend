// router/routes.js
const routes = [
  {
    path: "",
    component: () => import("layouts/AuthLayout.vue"),
    children: [
      {
        path: "",
        name: "login",
        component: () => import("pages/LoginPage.vue"),
        meta: { requiresAuth: false },
      },
    ],
  },

  {
    path: "/admin",
    component: () => import("layouts/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: "dashboard",
        component: () => import("pages/administrator/DashboardPage.vue"),
        meta: { requiresAuth: true, roles: ["hr_admin"] },
      },
      {
        path: "events",
        name: "events",
        component: () => import("pages/administrator/event/EventListPage.vue"),
        meta: { requiresAuth: true, roles: ["hr_admin"] },
      },
      {
        path: "create-events",
        name: "create events",
        component: () => import("pages/administrator/event/EventCreatePage.vue"),
        meta: { requiresAuth: true, roles: ["hr_admin"] },
      },
      {
        path: "view-events",
        name: "view events",
        component: () => import("pages/administrator/event/EventViewPage.vue"),
        meta: { requiresAuth: true, roles: ["hr_admin"] },
      },
      {
        path: "/events/:eventId/schedules/:scheduleId/nominated",
        name: "event-nominated-employee",
        component: () => import("pages/administrator/event/EventNominatedEmployeePage.vue"),
        meta: { requiresAuth: true, roles: ["hr_admin"] },
      },

      {
        path: "library",
        name: "library",
        component: () => import("pages/LibraryPage.vue"),
        meta: { requiresAuth: true, roles: ["hr_admin"] },
      },
      {
        path: "title",
        name: "title",
        component: () => import("pages/library/event/TitlePage.vue"),
        meta: { requiresAuth: true, roles: ["hr_admin"] },
      },
      {
        path: "mode",
        name: "mode",
        component: () => import("pages/library/event/ModePage.vue"),
        meta: { requiresAuth: true, roles: ["hr_admin"] },
      },
      {
        path: "venue",
        name: "venue",
        component: () => import("pages/library/event/VenuePage.vue"),
        meta: { requiresAuth: true, roles: ["hr_admin"] },
      },
      {
        path: "category",
        name: "category",
        component: () => import("pages/library/event/CategoryPage.vue"),
        meta: { requiresAuth: true, roles: ["hr_admin"] },
      },
      {
        path: "type",
        name: "type",
        component: () => import("pages/library/event/TypePage.vue"),
        meta: { requiresAuth: true, roles: ["hr_admin"] },
      },

      {
        path: "speaker",
        name: "speaker",
        component: () => import("pages/library/event/SpeakerPage.vue"),
        meta: { requiresAuth: true, roles: ["hr_admin"] },
      },
      {
        path: "reports",
        name: "reports",
        component: () => import("pages/ReportsPage.vue"),
        meta: { requiresAuth: true, roles: ["hr_admin"] },
      },
      {
        path: "users",
        name: "users",
        component: () => import("pages/UserPage.vue"),
        meta: { requiresAuth: true, roles: ["hr_admin"] },
      },
      {
        path: "",
        redirect: "dashboard",
      },

      // office_admin
      {
        path: "office/events",
        name: "office-events",
        component: () => import("pages/office/event/EventListPage.vue"),
        props: { officeView: true },
        meta: { requiresAuth: true, roles: ["office_admin"] },
      },
        {
        path: "office/events2",
        name: "office-events2",
        component: () => import("pages/CreateEventPage.vue"),
        props: { officeView: true },
        meta: { requiresAuth: true, roles: ["office_admin"] },
      },
      {
        path: "office/dashboard",
        name: "office-dashboard",
        component: () => import("pages/DashboardPage.vue"),
        props: { officeView: true },
        meta: { requiresAuth: true, roles: ["office_admin"] },
      },

      {
        path: "office/events/:scheduleId",
        name: "office-event-view",
        component: () => import("pages/office/event/EventViewPage.vue"),
      },
    ],
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
    meta: { requiresAuth: false },
  },
];

export default routes;
