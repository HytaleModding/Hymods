<!-- src/views/BrowsePlugins.vue -->
<template>
    <section class="browse">
        <header class="browse-header">
            <div class="header-row">
                <div>
                    <h2>Hytale Plugins</h2>
                    <p class="sub">Gameplay, systems, UI, tools, and more.</p>
                </div>

                <!-- New HeaderFilterBar: tags + sort -->
                <HeaderFilterBar
                    :tags="filters.tags"
                    :all-tags="allTags"
                    :sort="filters.sort"
                    @update:tags="onUpdateTags"
                    @update:sort="onUpdateSort"
                />
            </div>
            <div class="browse-separator"></div>
        </header>

        <CardGrid
            :display_mode="display_mode"
            :page="page"
            :page-size="pageSize"
            :total="filteredPlugins.length"
            :page-size-options="[10, 20, 50, 100]"
            @update:page="page = $event"
            @update:pageSize="pageSize = $event"
        >
            <ItemCard
                v-for="p in pagedPlugins"
                :key="p.title"
                v-bind="p"
                :display_mode="display_mode"
                @open="openItem(p)"
                @tag-click="addTagFilter"
            />
        </CardGrid>
    </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import ItemCard from "../components/ItemCard.vue";
import CardGrid from "../components/CardGrid.vue";
import HeaderFilterBar from "../components/HeaderFilterBar.vue";
import pluginsJson from "../assets/data/plugins.json";

type PluginItem = {
    type: "plugin" | "asset";
    title: string;
    author: string;
    downloads: number;
    updated: string; // e.g. "2 days ago"
    tags: string[];
    thumbnail: string;
    description?: string;
};

type SortKey = "downloads" | "updated" | "title";

const plugins = ref<PluginItem[]>(pluginsJson as PluginItem[]);
const display_mode = ref<"grid" | "list">("list");

/** New filters: tags + sort only (modal removed) */
const filters = ref<{
    tags: string[];
    sort: SortKey;
}>({
    tags: [],
    sort: "downloads",
});

/** Pagination state */
const page = ref(1);
const pageSize = ref(16);

/** All unique tags across plugins */
const allTags = computed(() => {
    const set = new Set<string>();
    for (const p of plugins.value) {
        for (const t of p.tags ?? []) set.add(t);
    }
    return [...set].sort();
});

/** Apply tag filter */
const tagFiltered = computed(() => {
    if (!filters.value.tags.length) return plugins.value.slice();

    return plugins.value.filter((p) =>
        filters.value.tags.every((t) => (p.tags ?? []).includes(t)),
    );
});

/** Sort helpers */
function toDays(s: string): number {
    const m = s.match(/(\d+)\s+(day|week|month)/i);
    if (!m) return 9999;
    const n = Number(m[1]);
    const unit = m[2].toLowerCase();
    return unit.startsWith("day")
        ? n
        : unit.startsWith("week")
          ? n * 7
          : n * 30;
}

/** Apply sorting */
const filteredPlugins = computed(() => {
    const list = tagFiltered.value.slice();

    switch (filters.value.sort) {
        case "title":
            return list.sort((a, b) => a.title.localeCompare(b.title));
        case "updated":
            return list.sort((a, b) => toDays(a.updated) - toDays(b.updated));
        case "downloads":
        default:
            return list.sort((a, b) => b.downloads - a.downloads);
    }
});

/** Slice for current page */
const pagedPlugins = computed(() => {
    const start = (page.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filteredPlugins.value.slice(start, end);
});

/** When tags or sort change, reset to first page */
watch(
    () => [filters.value.tags, filters.value.sort],
    () => {
        page.value = 1;
    },
    { deep: true },
);

/** HeaderFilterBar handlers */
function onUpdateTags(next: string[]) {
    filters.value.tags = next;
}
function onUpdateSort(next: SortKey) {
    filters.value.sort = next;
}

/** Tag clicked from an ItemCard */
function addTagFilter(tag: string) {
    if (filters.value.tags.includes(tag)) return;
    filters.value.tags = [...filters.value.tags, tag];
}

/** Open item action */
function openItem(p: PluginItem) {
    console.log("open plugin", p.title);
}
</script>

<style scoped>
.browse-header {
    margin-bottom: 14px;
}

.browse-separator {
    width: 100%;
    height: 1px;
    background: rgba(255, 255, 255, 0.06); /* subtle line */
    margin: 16px 0;
}

.header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1.75rem;
    gap: 12px;
    flex-wrap: wrap;
}

.sub {
    opacity: 0.7;
    margin-top: 4px;
    font-size: 0.95rem;
}
</style>
