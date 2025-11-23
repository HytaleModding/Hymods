<!-- src/components/CardGrid.vue -->
<template>
    <div :class="['card-grid', display_mode ?? 'grid']">
        <slot />
    </div>
</template>

<script setup lang="ts">
defineProps<{
    display_mode?: "grid" | "list";
}>();
</script>

<style scoped>
/* GRID MODE = cap at 2 columns */
.card-grid.grid {
    display: grid;
    gap: 22px;

    /* default desktop: 2 columns */
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

/* tablets / narrow desktop: 1 column */
@media (max-width: 900px) {
    .card-grid.grid {
        grid-template-columns: 1fr;
    }
}

/* LIST MODE = always 1 column */
.card-grid.list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
}
</style>
