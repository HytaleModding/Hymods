<template>
    <div class="card-grid">
        <slot />
    </div>
</template>

<style scoped>
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 18px;
    padding: 10px 0;
}
</style>
