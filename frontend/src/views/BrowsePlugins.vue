<!-- src/views/BrowsePlugins.vue -->
<template>
    <section class="browse">
        <header class="browse-header">
            <div class="header-row">
                <div>
                    <h2>Browse Plugins</h2>
                    <p class="sub">Gameplay, systems, UI, tools, and more.</p>
                </div>

                <!-- Filter button (top right of main content) -->
                <button
                    class="filter-btn"
                    @click="showFilters = true"
                    aria-label="Open filters"
                >
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
                    <span v-if="activeFilterCount" class="filter-pill">
                        {{ activeFilterCount }}
                    </span>
                </button>
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

        <!-- Filters popup -->
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
    for (const p of plugins.value) {
        for (const t of p.tags ?? []) set.add(t);
    }
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

    // parses “2 days ago / 1 week ago / 3 months ago”
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

    // type filter
    if (filters.value.type !== "all") {
        list = list.filter((p) => p.type === filters.value.type);
    }

    // tags filter (must include all selected)
    if (filters.value.tags.length) {
        list = list.filter((p) =>
            filters.value.tags.every((t) => (p.tags ?? []).includes(t)),
        );
    }

    // updated within
    list = list.filter((p) =>
        updatedWithinPass(p.updated, filters.value.updatedWithin),
    );

    // min downloads
    list = list.filter((p) => p.downloads >= (filters.value.minDownloads || 0));

    // sorting
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

function onApplyFilters() {
    // optional hook (toast / analytics)
}

function openItem(p: PluginItem) {
    // later: route to /plugin/:id
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

/* small count badge next to Filters */
.filter-pill {
    margin-left: 4px;
    font-size: 0.72rem;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 999px;
    background: rgba(100, 150, 255, 0.18);
    border: 1px solid rgba(100, 150, 255, 0.5);
    color: white;
}
</style>
