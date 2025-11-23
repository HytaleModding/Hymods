<!-- src/components/FiltersModal.vue -->
<template>
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="open" class="backdrop" @click="onBackdrop">
                <Transition name="pop">
                    <div
                        class="modal"
                        @click.stop
                        role="dialog"
                        aria-modal="true"
                        aria-label="Filters"
                    >
                        <header class="modal-header">
                            <h3>Filters</h3>
                            <button class="icon-btn" @click="$emit('close')">
                                ✕
                            </button>
                        </header>

                        <div class="modal-body">
                            <!-- type -->
                            <section class="section">
                                <label class="label">Type</label>
                                <div class="row">
                                    <label class="pill">
                                        <input
                                            type="radio"
                                            value="all"
                                            v-model="local.type"
                                        />
                                        All
                                    </label>
                                    <label class="pill">
                                        <input
                                            type="radio"
                                            value="plugin"
                                            v-model="local.type"
                                        />
                                        Plugins
                                    </label>
                                    <label class="pill">
                                        <input
                                            type="radio"
                                            value="asset"
                                            v-model="local.type"
                                        />
                                        Assets
                                    </label>
                                </div>
                            </section>

                            <!-- tags -->
                            <section class="section">
                                <label class="label">Tags</label>
                                <div class="chips">
                                    <button
                                        v-for="tag in allTags"
                                        :key="tag"
                                        class="chip"
                                        :class="{
                                            active: local.tags.includes(tag),
                                        }"
                                        @click="toggleTag(tag)"
                                        type="button"
                                    >
                                        {{ tag }}
                                    </button>
                                </div>
                            </section>

                            <!-- updated -->
                            <section class="section">
                                <label class="label">Updated within</label>
                                <select
                                    v-model="local.updatedWithin"
                                    class="select"
                                >
                                    <option value="any">Any time</option>
                                    <option value="3d">Last 3 days</option>
                                    <option value="1w">Last week</option>
                                    <option value="1m">Last month</option>
                                    <option value="3m">Last 3 months</option>
                                </select>
                            </section>

                            <!-- downloads -->
                            <section class="section">
                                <label class="label">Min downloads</label>
                                <input
                                    v-model.number="local.minDownloads"
                                    type="number"
                                    min="0"
                                    class="input"
                                    placeholder="0"
                                />
                            </section>

                            <!-- sort -->
                            <section class="section">
                                <label class="label">Sort by</label>
                                <select v-model="local.sort" class="select">
                                    <option value="downloads">
                                        Most downloads
                                    </option>
                                    <option value="updated">
                                        Recently updated
                                    </option>
                                    <option value="title">Title (A–Z)</option>
                                </select>
                            </section>
                        </div>

                        <footer class="modal-footer">
                            <button class="ghost" @click="reset">Reset</button>
                            <div class="spacer"></div>
                            <button class="ghost" @click="$emit('close')">
                                Cancel
                            </button>
                            <button class="primary" @click="apply">
                                Apply
                            </button>
                        </footer>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";

export type FiltersState = {
    type: "all" | "plugin" | "asset";
    tags: string[];
    updatedWithin: "any" | "3d" | "1w" | "1m" | "3m";
    minDownloads: number;
    sort: "downloads" | "updated" | "title";
};

const props = defineProps<{
    open: boolean;
    modelValue: FiltersState;
    allTags: string[];
}>();

const emit = defineEmits<{
    (e: "close"): void;
    (e: "update:modelValue", v: FiltersState): void;
    (e: "apply", v: FiltersState): void;
}>();

const local = reactive<FiltersState>({ ...props.modelValue });

watch(
    () => props.modelValue,
    (v) => Object.assign(local, v),
    { deep: true },
);

function toggleTag(tag: string) {
    const i = local.tags.indexOf(tag);
    if (i === -1) local.tags.push(tag);
    else local.tags.splice(i, 1);
}

function reset() {
    const next: FiltersState = {
        type: "all",
        tags: [],
        updatedWithin: "any",
        minDownloads: 0,
        sort: "downloads",
    };
    Object.assign(local, next);
    emit("update:modelValue", { ...next });
}

function apply() {
    const next = { ...local, tags: [...local.tags] };
    emit("update:modelValue", next);
    emit("apply", next);
    emit("close");
}

function onBackdrop() {
    emit("close");
}
</script>

<style scoped>
.backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: grid;
    place-items: center;
    z-index: 1000;
}

.modal {
    width: min(560px, calc(100vw - 24px));
    background: var(--color-surface);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
    overflow: hidden;
}

.modal-header {
    display: flex;
    align-items: center;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.modal-header h3 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 800;
}
.icon-btn {
    margin-left: auto;
    background: transparent;
    border: 0;
    color: white;
    opacity: 0.8;
    font-size: 1.1rem;
    cursor: pointer;
}

.modal-body {
    padding: 14px 16px;
    display: grid;
    gap: 14px;
}

.section {
    display: grid;
    gap: 8px;
}
.label {
    font-size: 0.85rem;
    opacity: 0.8;
    font-weight: 700;
}

.row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 999px;
    font-size: 0.82rem;
    cursor: pointer;
}
.pill input {
    accent-color: var(--color-accent2);
}

.chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}
.chip {
    padding: 5px 9px;
    border-radius: 999px;
    font-size: 0.78rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.06);
    color: white;
    opacity: 0.85;
    cursor: pointer;
}
.chip.active {
    background: rgba(100, 150, 255, 0.18);
    border-color: rgba(100, 150, 255, 0.45);
    opacity: 1;
}

.input,
.select {
    width: 100%;
    padding: 8px 10px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: white;
    outline: none;
}

.modal-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.spacer {
    flex: 1;
}

.ghost,
.primary {
    padding: 7px 12px;
    border-radius: 8px;
    font-weight: 800;
    font-size: 0.85rem;
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.1);
}
.ghost {
    background: transparent;
    color: white;
    opacity: 0.9;
}
.primary {
    background: rgba(100, 150, 255, 0.22);
    border-color: rgba(100, 150, 255, 0.45);
    color: white;
}

/* transitions */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.12s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.pop-enter-active {
    transition:
        transform 0.12s ease,
        opacity 0.12s ease;
}
.pop-enter-from {
    transform: translateY(6px) scale(0.98);
    opacity: 0;
}
.pop-leave-active {
    transition:
        transform 0.1s ease,
        opacity 0.1s ease;
}
.pop-leave-to {
    transform: translateY(6px) scale(0.98);
    opacity: 0;
}
</style>
