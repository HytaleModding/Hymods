<!-- src/views/BrowseAssets.vue -->
<template>
    <section class="browse">
        <header class="browse-header">
            <div class="header-row">
                <div>
                    <h2>Browse Assets</h2>
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
        <CardGrid display_mode="grid">
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
    margin-bottom: 14px;
}

.header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1.75rem;
    gap: 12px;
}

.sub {
    opacity: 0.7;
    margin-top: 4px;
    font-size: 0.95rem;
}

.filter-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 34px;
    padding: 0 12px;
    border-radius: 9px;

    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--color-accent2);
    font-weight: 700;
    font-size: 0.9rem;

    cursor: pointer;
    transition:
        background 0.15s ease,
        transform 0.05s ease;
}

.filter-btn:hover {
    background: rgba(255, 255, 255, 0.1);
}

.filter-btn:active {
    transform: translateY(1px);
}
</style>
