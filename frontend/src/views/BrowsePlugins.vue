<!-- src/views/BrowsePlugins.vue -->
<template>
    <section class="browse">
        <header class="browse-header">
            <div class="header-row">
                <div>
                    <h2>Hytale Plugins</h2>
                    <p class="sub">Gameplay, systems, UI, tools, and more.</p>
                </div>

                <HeaderFilterBar
                    v-model:tags="filters.tags"
                    :allTags="allTags"
                    :activeCount="activeFilterCount"
                    @openFilters="showFilters = true"
                />
            </div>
        </header>

        <CardGrid :display_mode="display_mode">
            <ItemCard
                v-for="p in filteredPlugins"
                :key="p.title"
                v-bind="p"
                :display_mode="display_mode"
                @open="openItem(p)"
            />
        </CardGrid>

        <FiltersModal
            :open="showFilters"
            v-model="filters"
            :allTags="allTags"
            @close="showFilters = false"
            @apply="onApplyFilters"
        />
    </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import ItemCard from "../components/ItemCard.vue";
import CardGrid from "../components/CardGrid.vue";
import HeaderFilterBar from "../components/HeaderFilterBar.vue";
import FiltersModal, {
    type FiltersState,
} from "../components/FiltersModel.vue";
import pluginsJson from "../assets/data/plugins.json";

type PluginItem = {
    type: "plugin" | "asset";
    title: string;
    author: string;
    downloads: number;
    updated: string;
    tags: string[];
    thumbnail: string;
    description?: string;
};

const plugins = ref<PluginItem[]>(pluginsJson as PluginItem[]);
const display_mode = ref<"grid" | "list">("list");
const showFilters = ref(false);

const filters = ref<FiltersState>({
    type: "all",
    tags: [],
    updatedWithin: "any",
    minDownloads: 0,
    sort: "downloads",
});

const allTags = computed(() => {
    const set = new Set<string>();
    for (const p of plugins.value) for (const t of p.tags ?? []) set.add(t);
    return [...set].sort();
});

const activeFilterCount = computed(() => {
    let n = 0;
    if (filters.value.type !== "all") n++;
    if (filters.value.tags.length) n++;
    if (filters.value.updatedWithin !== "any") n++;
    if ((filters.value.minDownloads ?? 0) > 0) n++;
    return n;
});

function updatedWithinPass(
    updatedStr: string,
    range: FiltersState["updatedWithin"],
) {
    if (range === "any") return true;
    const m = updatedStr.match(/(\d+)\s+(day|week|month)/i);
    if (!m) return true;
    const n = Number(m[1]);
    const unit = m[2].toLowerCase();
    const days = unit.startsWith("day")
        ? n
        : unit.startsWith("week")
          ? n * 7
          : n * 30;
    const limit =
        range === "3d" ? 3 : range === "1w" ? 7 : range === "1m" ? 30 : 90;
    return days <= limit;
}

const filteredPlugins = computed(() => {
    let list = plugins.value.slice();

    if (filters.value.type !== "all") {
        list = list.filter((p) => p.type === filters.value.type);
    }

    if (filters.value.tags.length) {
        list = list.filter((p) =>
            filters.value.tags.every((t) => (p.tags ?? []).includes(t)),
        );
    }

    list = list.filter((p) =>
        updatedWithinPass(p.updated, filters.value.updatedWithin),
    );

    list = list.filter((p) => p.downloads >= (filters.value.minDownloads || 0));

    if (filters.value.sort === "downloads") {
        list.sort((a, b) => b.downloads - a.downloads);
    } else if (filters.value.sort === "title") {
        list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filters.value.sort === "updated") {
        const toDays = (s: string) => {
            const m = s.match(/(\d+)\s+(day|week|month)/i);
            if (!m) return 9999;
            const n = Number(m[1]);
            const unit = m[2].toLowerCase();
            return unit.startsWith("day")
                ? n
                : unit.startsWith("week")
                  ? n * 7
                  : n * 30;
        };
        list.sort((a, b) => toDays(a.updated) - toDays(b.updated));
    }

    return list;
});

function onApplyFilters() {}
function openItem(p: PluginItem) {
    console.log("open plugin", p.title);
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
</style>
