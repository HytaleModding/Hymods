<!-- src/components/HeaderFilterBar.vue -->
<template>
    <div class="filters-cluster">
        <!-- TAG SEARCH WITH CHIPS + SUGGESTIONS -->
        <div ref="tagSearchEl" class="tag-search" @click="focusTagInput">
            <!-- active tag chips -->
            <Tag
                v-for="t in tags"
                :key="t"
                :label="t"
                size="lg"
                removable
                @remove="removeTag(t)"
            />

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

            <!-- CLEAR BUTTON -->
            <button
                v-if="tagQuery.trim().length || tags.length"
                class="clear-btn"
                type="button"
                aria-label="Clear tags and query"
                @click.stop="clearAll"
            >
                Clear
            </button>

            <!-- suggestions dropdown: LEFT-TO-RIGHT CHIP LIST -->
            <div v-if="showSuggestions" class="suggestions" role="listbox">
                <Tag
                    v-for="(s, i) in filteredSuggestions"
                    :key="s"
                    class="suggestion-chip"
                    :class="{ active: i === activeIndex }"
                    role="option"
                    size="lg"
                    clickable
                    @mousedown.prevent="addTag(s)"
                    @mousemove="activeIndex = i"
                    @click="addTag(s)"
                    :label="s"
                />

                <div
                    v-if="!filteredSuggestions.length"
                    class="suggestion-empty"
                    aria-disabled="true"
                >
                    No matches
                </div>
            </div>
        </div>

        <!-- SORT DROPDOWN (fully custom, matches tags dropdown) -->
        <div ref="sortRootEl" class="sort-wrap">
            <button
                type="button"
                class="sort-trigger"
                @click="toggleSort"
                aria-haspopup="listbox"
                :aria-expanded="isSortOpen ? 'true' : 'false'"
            >
                <span class="sort-label">Sort by</span>
                <span class="sort-value">{{ currentSortLabel }}</span>
                <span class="sort-chevron">▾</span>
            </button>

            <div v-if="isSortOpen" class="sort-menu" role="listbox">
                <button
                    v-for="opt in sortOptions"
                    :key="opt.value"
                    type="button"
                    class="sort-option"
                    :class="{ active: opt.value === localSort }"
                    role="option"
                    @click="pickSort(opt.value)"
                >
                    {{ opt.label }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
} from "vue";
import Tag from "./Tag.vue";

type SortValue = "downloads" | "updated" | "title";

const props = defineProps<{
    tags: string[];
    allTags: string[];
    sort: SortValue;
}>();

const emit = defineEmits<{
    (e: "update:tags", v: string[]): void;
    (e: "update:sort", v: SortValue): void;
}>();

/* ---- SORT STATE ---- */
const localSort = ref<SortValue>(props.sort);
const isSortOpen = ref(false);
const sortRootEl = ref<HTMLElement | null>(null);

const sortOptions: { value: SortValue; label: string }[] = [
    { value: "downloads", label: "Most downloads" },
    { value: "updated", label: "Recently updated" },
    { value: "title", label: "Title (A–Z)" },
];

watch(
    () => props.sort,
    (v) => {
        if (v !== localSort.value) localSort.value = v;
    },
);

const currentSortLabel = computed(() => {
    return (
        sortOptions.find((o) => o.value === localSort.value)?.label ??
        "Most downloads"
    );
});

function toggleSort() {
    isSortOpen.value = !isSortOpen.value;
}

function pickSort(v: SortValue) {
    if (localSort.value !== v) {
        localSort.value = v;
        emit("update:sort", v);
    }
    isSortOpen.value = false;
}

/* ---- TAG SEARCH STATE ---- */
const tagQuery = ref("");
const isTagFocus = ref(false);
const activeIndex = ref(0);
const tagInputEl = ref<HTMLInputElement | null>(null);
const tagSearchEl = ref<HTMLElement | null>(null);

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

/* ---- TAG HANDLERS ---- */
function focusTagInput() {
    nextTick(() => tagInputEl.value?.focus());
}

function onTagBlur() {
    setTimeout(() => {
        if (tagSearchEl.value?.contains(document.activeElement)) return;
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

function clearAll() {
    emit("update:tags", []);
    tagQuery.value = "";
    activeIndex.value = 0;
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

    const choice = list[activeIndex.value] ?? list[0];
    if (!choice) return;
    addTag(choice);
}

/* ---- OUTSIDE CLICK HANDLER ---- */
function onDocPointerDown(e: PointerEvent) {
    const target = e.target as Node;
    const tagRoot = tagSearchEl.value;
    const sortRoot = sortRootEl.value;

    if (tagRoot && !tagRoot.contains(target)) {
        closeSuggestions();
    }
    if (sortRoot && !sortRoot.contains(target)) {
        isSortOpen.value = false;
    }
}

onMounted(() => {
    document.addEventListener("pointerdown", onDocPointerDown);
});

onBeforeUnmount(() => {
    document.removeEventListener("pointerdown", onDocPointerDown);
});
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

    width: 500px;
    max-width: 500px;
    box-sizing: border-box;
    min-width: 0;
}

.tag-search input {
    flex: 1 1 140px;
    min-width: 140px;
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

/* Clear button styled like tag */
.clear-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    width: auto;
    height: auto;

    padding: 4px 10px;
    border-radius: 999px;

    background: rgba(100, 150, 255, 0.18);
    border: 1px solid rgba(100, 150, 255, 0.35);
    color: white;

    font-size: 0.9rem;
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;

    cursor: pointer;
    opacity: 0.9;

    transition:
        background 0.15s ease,
        border-color 0.15s ease,
        opacity 0.15s ease,
        transform 0.05s ease;
}
.clear-btn:hover {
    background: rgba(140, 180, 255, 0.28);
    border-color: rgba(140, 180, 255, 0.55);
    opacity: 1;
}
.clear-btn:active {
    transform: translateY(1px);
}

/* suggestions: horizontal chip grid */
.suggestions {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: 20;

    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    margin: 0;
    padding: 12px;

    background: var(--color-surface);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;

    box-shadow:
        0 14px 40px rgba(0, 0, 0, 0.55),
        inset 0 1px 0 rgba(255, 255, 255, 0.04);

    max-height: none;
    overflow: visible;
}

.suggestion-chip.active :deep(.tag),
.suggestion-chip.active {
    background: rgba(100, 150, 255, 0.22);
    opacity: 1;
}

.suggestion-empty {
    padding: 6px 8px;
    opacity: 0.6;
    font-size: 0.9rem;
}

/* ---- SORT DROPDOWN (custom, matches tag menu) ---- */
.sort-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
}

/* trigger pill */
.sort-trigger {
    display: inline-flex;
    align-items: center;
    gap: 6px;

    padding: 4px 10px;
    border-radius: 9px;

    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;

    font-size: 0.9rem;
    cursor: pointer;

    outline: none;
    border-width: 1px;

    transition:
        background 0.15s ease,
        border-color 0.15s ease,
        transform 0.05s ease;
}

.sort-trigger:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.16);
}

.sort-label {
    font-size: 0.8rem;
    opacity: 0.8;
}

.sort-value {
    font-weight: 600;
}

.sort-chevron {
    font-size: 0.75rem;
    opacity: 0.7;
}

/* dropdown menu, styled like tag suggestions */
.sort-menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    z-index: 22;

    min-width: 210px;
    padding: 8px;

    background: var(--color-surface);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;

    box-shadow:
        0 14px 40px rgba(0, 0, 0, 0.55),
        inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

/* individual sort options, same feel as chips list */
.sort-option {
    display: block;
    width: 100%;
    text-align: left;

    padding: 6px 8px;
    border-radius: 6px;

    background: transparent;
    border: none;
    color: white;
    font-size: 0.85rem;

    cursor: pointer;

    transition:
        background 0.12s ease,
        transform 0.05s ease,
        opacity 0.12s ease;
}

.sort-option:hover {
    background: rgba(100, 150, 255, 0.16);
    opacity: 1;
}

.sort-option.active {
    background: rgba(100, 150, 255, 0.24);
    opacity: 1;
}
</style>
