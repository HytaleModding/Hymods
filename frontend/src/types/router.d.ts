// src/types/router.d.ts
declare module "vue-router" {
  interface RouteMeta {
    layout?: "base";
    requiresAuth?: boolean;
    title?: string;
  }
}
