<template>
    <component :is="layoutComponent"><router-view /></component>
</template>

<script setup lang="ts">
import { computed, type Component } from "vue";
import { useRoute } from "vue-router";
import BaseLayout from "./layouts/BaseLayout.vue";

const route = useRoute();

const layouts: Record<string, Component> = {
    base: BaseLayout,
};

const layoutComponent = computed(() => {
    const layoutName = route.meta?.layout as string;
    return layouts[layoutName] || BaseLayout;
});
</script>
