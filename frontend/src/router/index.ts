import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { authService } from "../services/authService";
import { cartService } from "../services/cartService";
import { orderService } from "../services/orderService";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("../layouts/ConsumerLayout.vue"),
    children: [
      {
        path: "",
        name: "home",
        component: () => import("../views/HomeView.vue"),
      },
      {
        path: "products",
        name: "products",
        component: () => import("../views/ProductsView.vue"),
      },
      {
        path: "categoria/:slug",
        name: "category",
        component: () => import("../views/CategoryView.vue"),
        props: true,
      },
      {
        path: "product/:id",
        name: "product-detail",
        component: () => import("../views/ProductDetailView.vue"),
        props: true,
      },
      {
        path: "cart",
        name: "cart",
        component: () => import("../views/CartView.vue"),
      },
      {
        path: "checkout",
        name: "checkout",
        component: () => import("../views/CheckoutView.vue"),
        meta: { requiresCheckout: true },
      },
      {
        path: "order-success",
        name: "order-success",
        component: () => import("../views/OrderSuccessView.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "login",
        name: "login",
        component: () => import("../views/LoginView.vue"),
        meta: { guestOnly: true },
      },
      {
        path: "register",
        name: "register",
        component: () => import("../views/RegisterView.vue"),
        meta: { guestOnly: true },
      },
      {
        path: "profile",
        component: () => import("../layouts/ProfileLayout.vue"),
        meta: { requiresAuth: true },
        redirect: { name: "profile-edit" },
        children: [
          {
            path: "edit",
            name: "profile-edit",
            component: () => import("../views/ProfileEditView.vue"),
          },
          {
            path: "orders",
            name: "profile-orders",
            component: () => import("../views/ProfileOrdersView.vue"),
          },
          {
            path: "favorites",
            name: "profile-favorites",
            component: () => import("../views/ProfileFavoritesView.vue"),
            meta: { requiresAuth: true },
          },
          {
            path: "tracking",
            name: "profile-tracking",
            component: () => import("../views/ProfileTrackingView.vue"),
          },
        ],
      },
    ],
  },
  {
    path: "/admin",
    component: () => import("../layouts/AdminLayout.vue"),
    meta: { requiresAdmin: true },
    children: [
      {
        path: "",
        name: "admin-dashboard",
        component: () => import("../views/AdminDashboardView.vue"),
      },
      {
        path: "products",
        name: "admin-products",
        component: () => import("../views/AdminProductsView.vue"),
      },
      {
        path: "categories",
        name: "admin-categories",
        component: () => import("../views/AdminCategoriesView.vue"),
      },
      {
        path: "reports",
        name: "admin-reports",
        component: () => import("../views/AdminReportsView.vue"),
      },
      {
        path: "users",
        name: "admin-users",
        component: () => import("../views/AdminUsersView.vue"),
      },
      {
        path: "orders",
        name: "admin-orders",
        component: () => import("../views/AdminOrdersView.vue"),
      },
      {
        path: "settings",
        name: "admin-settings",
        component: () => import("../views/AdminSettingsView.vue"),
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("../views/NotFoundView.vue"),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to) => {
  if (to.meta.guestOnly && authService.isAuthenticated()) {
    return { name: "home" };
  }

  if (to.meta.requiresAdmin && !authService.isAdmin()) {
    return { name: "home" };
  }

  if (to.meta.requiresAuth && !authService.isAuthenticated()) {
    return {
      name: "login",
      query: { redirect: to.fullPath },
    };
  }

  if (to.name === "order-success" && authService.isAuthenticated()) {
    const oid = to.query.orderId;
    if (typeof oid !== "string" || !oid.trim()) {
      return { name: "home" };
    }
    const order = orderService.getById(oid);
    if (!order) {
      return { name: "home" };
    }
    const user = authService.getCurrentUser();
    if (!user) {
      return {
        name: "login",
        query: { redirect: to.fullPath },
      };
    }
    if (order.userId !== user.id && !authService.isAdmin()) {
      return { name: "home" };
    }
  }

  if (to.meta.requiresCheckout && authService.isAuthenticated()) {
    if (cartService.isEmpty()) {
      return { name: "cart" };
    }
  }

  return true;
});
