<!-- src/components/CardGrid.vue -->
<template>
    <div class="card-grid-wrapper">
        <!-- TOP pagination bar -->
        <div v-if="total > 0" class="pagination-bar">
            <div class="pagination-info">
                <span>
                    <strong>{{ startIndex }}</strong
                    >–<strong>{{ endIndex }}</strong>
                    of
                    <strong>{{ total }}</strong>
                </span>
            </div>

            <div class="pagination-controls">
                <!-- per-page selector -->
                <label class="page-size">
                    <span class="page-size-label">Per page</span>
                    <select
                        class="page-size-select"
                        v-model.number="localPageSize"
                        @change="onPageSizeChange"
                    >
                        <option
                            v-for="opt in normalizedPageSizeOptions"
                            :key="opt"
                            :value="opt"
                        >
                            {{ opt }}
                        </option>
                    </select>
                </label>

                <!-- prev / next -->
                <button
                    class="pager-btn"
                    type="button"
                    :disabled="page <= 1"
                    @click="changePage(page - 1)"
                    aria-label="Previous page"
                >
                    ‹
                </button>

                <span class="page-indicator">
                    Page {{ page }} / {{ totalPages }}
                </span>

                <button
                    class="pager-btn"
                    type="button"
                    :disabled="page >= totalPages"
                    @click="changePage(page + 1)"
                    aria-label="Next page"
                >
                    ›
                </button>
            </div>
        </div>

        <!-- cards -->
        <div :class="['card-grid', display_mode ?? 'grid']">
            <slot />
        </div>

        <!-- BOTTOM pagination bar -->
        <div v-if="total > 0" class="pagination-bar">
            <div class="pagination-info">
                <span>
                    Showing
                    <strong>{{ startIndex }}</strong
                    >–<strong>{{ endIndex }}</strong>
                    of
                    <strong>{{ total }}</strong>
                </span>
            </div>

            <div class="pagination-controls">
                <!-- per-page selector -->
                <label class="page-size">
                    <span class="page-size-label">Per page</span>
                    <select
                        class="page-size-select"
                        v-model.number="localPageSize"
                        @change="onPageSizeChange"
                    >
                        <option
                            v-for="opt in normalizedPageSizeOptions"
                            :key="opt"
                            :value="opt"
                        >
                            {{ opt }}
                        </option>
                    </select>
                </label>

                <!-- prev / next -->
                <button
                    class="pager-btn"
                    type="button"
                    :disabled="page <= 1"
                    @click="changePage(page - 1)"
                    aria-label="Previous page"
                >
                    ‹
                </button>

                <span class="page-indicator">
                    Page {{ page }} / {{ totalPages }}
                </span>

                <button
                    class="pager-btn"
                    type="button"
                    :disabled="page >= totalPages"
                    @click="changePage(page + 1)"
                    aria-label="Next page"
                >
                    ›
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

const props = defineProps<{
    display_mode?: "grid" | "list";
    page: number;
    pageSize: number;
    total: number; // total number of filtered results
    pageSizeOptions?: number[];
}>();

const emit = defineEmits<{
    (e: "update:page", v: number): void;
    (e: "update:pageSize", v: number): void;
}>();

const localPageSize = ref(props.pageSize);

watch(
    () => props.pageSize,
    (v) => {
        if (v !== localPageSize.value) localPageSize.value = v;
    },
);

const normalizedPageSizeOptions = computed(() => {
    const base = props.pageSizeOptions?.length
        ? props.pageSizeOptions
        : [8, 16, 32];
    // make sure current pageSize is included
    return base.includes(props.pageSize)
        ? base
        : [...base, props.pageSize].sort((a, b) => a - b);
});

const totalPages = computed(() => {
    if (!props.total || !props.pageSize) return 1;
    return Math.max(1, Math.ceil(props.total / props.pageSize));
});

const startIndex = computed(() => {
    if (!props.total) return 0;
    return (props.page - 1) * props.pageSize + 1;
});

const endIndex = computed(() => {
    if (!props.total) return 0;
    return Math.min(props.total, props.page * props.pageSize);
});

function changePage(next: number) {
    const clamped = Math.min(Math.max(next, 1), totalPages.value);
    if (clamped !== props.page) {
        emit("update:page", clamped);
    }
}

function onPageSizeChange() {
    if (!localPageSize.value) return;
    if (localPageSize.value === props.pageSize) return;

    emit("update:pageSize", localPageSize.value);
    // usually reset to first page when page size changes
    emit("update:page", 1);
}
</script>

<style scoped>
.card-grid-wrapper {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* GRID MODE = cap at 2 columns */
.card-grid.grid {
    display: grid;
    gap: 22px;
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

/* pagination */
.pagination-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: 0.85rem;
    opacity: 0.9;
}

.pagination-info strong {
    font-weight: 700;
}

.pagination-controls {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.page-size {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.page-size-label {
    opacity: 0.8;
}

.page-size-select {
    padding: 4px 8px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    background: rgba(255, 255, 255, 0.06);
    color: white;
    font-size: 0.85rem;
    cursor: pointer;
}

.pager-btn {
    min-width: 28px;
    height: 28px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.06);
    color: white;
    font-size: 0.9rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
.pager-btn:disabled {
    opacity: 0.4;
    cursor: default;
}
.pager-btn:not(:disabled):active {
    transform: translateY(1px);
}

.page-indicator {
    font-variant-numeric: tabular-nums;
    opacity: 0.9;
}
</style>
