<!-- src/views/BrowseAssets.vue -->
<template>
    <section class="browse">
        <header class="browse-header">
            <div class="header-row">
                <div>
                    <h2>Hytale Assets</h2>
                    <p class="sub">
                        Models, textures, prefabs, VFX, and packs.
                    </p>
                </div>

                <button class="filter-btn" @click="" aria-label="Open filters">
                    <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        aria-hidden="true"
                    >
                        <path
                            fill="currentColor"
                            d="M3 5h18v2H3V5zm4 6h10v2H7v-2zm3 6h4v2h-4v-2z"
                        />
                    </svg>
                    Filters
                </button>
            </div>
        </header>

        <CardGrid :display_mode="display_mode">
            <ItemCard
                v-for="p in assets"
                :key="p.title"
                v-bind="p"
                display_mode="grid"
            />
        </CardGrid>
    </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ItemCard from "../components/ItemCard.vue";
import CardGrid from "../components/CardGrid.vue";
import assets_jason from "../assets/data/assets.json";

const assets = ref(assets_jason);
const display_mode = ref<"grid" | "list">("grid");

type AssetItem = {
    type: "asset";
    title: string;
    author: string;
    downloads: number;
    updated: string;
    tags: string[];
    thumbnail: string;
    description?: string;
};

function openItem(a: AssetItem) {
    // later: route to /asset/:id
    console.log("open asset", a.title);
}
</script>

<style scoped>
.browse-header {
    margin-bottom: var(--section-header-gap, 14px);
}

.header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: var(--browse-title-font-size, 1.75rem);
    gap: var(--browse-header-gap, 12px);
}

.sub {
    opacity: var(--text-muted-opacity, 0.7);
    margin-top: var(--browse-sub-margin-top, 4px);
    font-size: var(--browse-sub-font-size, 0.95rem);
}

.filter-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--btn-gap, 6px);
    height: var(--btn-height-sm, 34px);
    padding: 0 var(--btn-padding-x-sm, 12px);
    border-radius: var(--radius-md, 9px);

    background: var(--btn-secondary-bg, rgba(255, 255, 255, 0.06));
    border: 1px solid var(--btn-secondary-border, rgba(255, 255, 255, 0.1));
    color: var(--btn-secondary-fg, var(--color-accent2));
    font-weight: var(--btn-secondary-font-weight, 700);
    font-size: var(--btn-secondary-font-size, 0.9rem);

    cursor: pointer;
    transition:
        background var(--transition-fast, 0.15s ease),
        transform var(--transition-ultra-fast, 0.05s ease);
}

.filter-btn:hover {
    background: var(--btn-secondary-hover-bg, rgba(255, 255, 255, 0.1));
}

.filter-btn:active {
    transform: translateY(var(--btn-secondary-active-translate-y, 1px));
}
</style>
