// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/Home.vue"),
  },
  {
    path: "/browse/plugins",
    name: "BrowsePlugins",
    component: () => import("../views/BrowsePlugins.vue"),
  },
  {
    path: "/browse/assets",
    name: "BrowseAssets",
    component: () => import("../views/BrowseAssets.vue"),
  },
  {
    path: "/about",
    name: "About",
    component: () => import("../views/About.vue"),
  },
  // Add more routes here
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
