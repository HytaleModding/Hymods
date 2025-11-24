<!-- src/components/HeaderFilterBar.vue -->
<template>
    <div class="filters-cluster">
        <!-- expanded tag search with chips + suggestions -->
        <div class="tag-search" @click="focusTagInput">
            <!-- active tag chips -->
            <span v-for="t in tags" :key="t" class="tag-chip">
                {{ t }}
                <button
                    class="chip-x"
                    @click.stop="removeTag(t)"
                    aria-label="Remove tag"
                >
                    ✕
                </button>
            </span>

            <!-- input lives inline after chips -->
            <input
                ref="tagInputEl"
                v-model="tagQuery"
                type="text"
                placeholder="Search tags…"
                aria-label="Search tags"
                @focus="isTagFocus = true"
                @blur="onTagBlur"
                @keydown.down.prevent="moveActive(1)"
                @keydown.up.prevent="moveActive(-1)"
                @keydown.enter.prevent="commitActive()"
                @keydown.esc.prevent="closeSuggestions()"
            />

            <!-- suggestions dropdown -->
            <ul v-if="showSuggestions" class="suggestions" role="listbox">
                <li
                    v-for="(s, i) in filteredSuggestions"
                    :key="s"
                    class="suggestion"
                    :class="{ active: i === activeIndex }"
                    role="option"
                    @mousedown.prevent="addTag(s)"
                    @mousemove="activeIndex = i"
                >
                    {{ s }}
                </li>

                <li
                    v-if="!filteredSuggestions.length"
                    class="suggestion empty"
                    aria-disabled="true"
                >
                    No matches
                </li>
            </ul>
        </div>

        <!-- Filter button -->
        <button
            class="filter-btn"
            @click="$emit('openFilters')"
            aria-label="Open filters"
        >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                    fill="currentColor"
                    d="M3 5h18v2H3V5zm4 6h10v2H7v-2zm3 6h4v2h-4v-2z"
                />
            </svg>
            Filters
            <span v-if="activeCount" class="filter-pill">
                {{ activeCount }}
            </span>
        </button>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue";

const props = defineProps<{
    tags: string[];
    allTags: string[];
    activeCount: number;
}>();

const emit = defineEmits<{
    (e: "update:tags", v: string[]): void;
    (e: "openFilters"): void;
}>();

/* local UI state */
const tagQuery = ref("");
const isTagFocus = ref(false);
const activeIndex = ref(0);
const tagInputEl = ref<HTMLInputElement | null>(null);

const filteredSuggestions = computed(() => {
    const q = tagQuery.value.trim().toLowerCase();
    const selected = new Set(props.tags.map((t) => t.toLowerCase()));

    let list = props.allTags.filter((t) => !selected.has(t.toLowerCase()));

    if (q) {
        list = list.filter((t) => t.toLowerCase().includes(q));
    }

    return list;
});

const showSuggestions = computed(() => {
    return (
        isTagFocus.value &&
        (tagQuery.value.trim().length > 0 ||
            filteredSuggestions.value.length > 0)
    );
});

function focusTagInput() {
    nextTick(() => tagInputEl.value?.focus());
}

function onTagBlur() {
    // delay so click on suggestion still lands
    setTimeout(() => {
        isTagFocus.value = false;
        activeIndex.value = 0;
        tagQuery.value = "";
    }, 120);
}

function closeSuggestions() {
    isTagFocus.value = false;
    activeIndex.value = 0;
}

function addTag(t: string) {
    if (props.tags.includes(t)) return;
    emit("update:tags", [...props.tags, t]);
    tagQuery.value = "";
    activeIndex.value = 0;
    focusTagInput();
}

function removeTag(t: string) {
    emit(
        "update:tags",
        props.tags.filter((x) => x !== t),
    );
    focusTagInput();
}

function moveActive(dir: 1 | -1) {
    const n = filteredSuggestions.value.length;
    if (!n) return;
    activeIndex.value = (activeIndex.value + dir + n) % n;
}

function commitActive() {
    const list = filteredSuggestions.value;
    if (!list.length) return;
    addTag(list[activeIndex.value] ?? list[0]);
}
</script>

<style scoped>
.filters-cluster {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 1rem;
}

/* ---- TAG MULTI-SEARCH ---- */
.tag-search {
    position: relative;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    min-height: 34px;
    padding: 4px 8px;
    border-radius: 9px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: text;
    max-width: 360px;
}

.tag-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 700;
    background: rgba(100, 150, 255, 0.18);
    border: 1px solid rgba(100, 150, 255, 0.5);
    color: white;
    white-space: nowrap;
}

.chip-x {
    background: transparent;
    border: none;
    color: white;
    opacity: 0.8;
    cursor: pointer;
    font-size: 0.8rem;
    line-height: 1;
    padding: 0;
}
.chip-x:hover {
    opacity: 1;
}

.tag-search input {
    flex: 1 1 120px;
    min-width: 120px;
    height: 24px;
    background: transparent;
    border: none;
    outline: none;
    color: white;
    font-size: 0.9rem;
}
.tag-search input::placeholder {
    opacity: 0.6;
}

.suggestions {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: 20;
    margin: 0;
    padding: 6px;
    list-style: none;
    background: rgba(20, 20, 25, 0.98);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
    max-height: 220px;
    overflow: auto;
}

.suggestion {
    padding: 6px 8px;
    border-radius: 7px;
    font-size: 0.9rem;
    cursor: pointer;
    color: white;
    opacity: 0.9;
}
.suggestion:hover,
.suggestion.active {
    background: rgba(255, 255, 255, 0.08);
    opacity: 1;
}
.suggestion.empty {
    cursor: default;
    opacity: 0.6;
}
/* ---- END TAG MULTI-SEARCH ---- */

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
