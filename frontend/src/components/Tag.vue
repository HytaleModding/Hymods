<!-- src/components/Tag.vue -->
<template>
    <span
        class="tag"
        :class="[sizeClass, clickable && 'tag--clickable']"
        role="button"
        :tabindex="clickable ? 0 : undefined"
        @click="onClick"
        @keydown.enter.prevent="onClick"
        @keydown.space.prevent="onClick"
    >
        <!-- icon -->
        <component v-if="info.icon" :is="info.icon" class="tag-icon" />

        <span class="tag-label">{{ info.label }}</span>

        <!-- removable X (used in tag filters) -->
        <button
            v-if="removable"
            class="tag__x"
            type="button"
            @click.stop="emit('remove')"
            aria-label="Remove tag"
        >
            ✕
        </button>
    </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getTagInfo } from "../assets/data/tags";

const props = withDefaults(
    defineProps<{
        label: string;
        size?: "sm" | "md" | "lg";
        clickable?: boolean;
        removable?: boolean;
    }>(),
    {
        size: "md",
        variant: "accent",
        clickable: false,
        removable: false,
    },
);

const emit = defineEmits<{
    (e: "click"): void;
    (e: "remove"): void;
}>();

const info = computed(() => getTagInfo(props.label));

const sizeClass = computed(() => (props.size ? `tag--${props.size}` : ""));

function onClick() {
    if (props.clickable) emit("click");
}
</script>

<style scoped>
/* ---------------- Base ---------------- */
.tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;

    font-size: 0.9rem;
    padding: 4px 8px;
    border-radius: 6px;

    background: var(--color-surface);
    border: 1px solid rgba(255, 255, 255, 0.14);
    color: var(--color-accent2);
    font-weight: 800;
    opacity: 0.8;

    white-space: nowrap;
    line-height: 1;
    user-select: none;
}

/* ---------------- Sizes ---------------- */
.tag--sm {
    font-size: 0.82rem;
    padding: 3px 7px;
}

.tag--md {
    font-size: 0.9rem;
    padding: 4px 8px;
}

.tag--lg {
    font-size: 1.05rem;
    padding: 6px 12px;
}

/* ---------------- Clickable hover/active ---------------- */
.tag--clickable {
    cursor: pointer;
    transition:
        background 0.15s ease,
        border-color 0.15s ease,
        opacity 0.15s ease,
        transform 0.05s ease;
}

.tag--clickable:hover {
    opacity: 1;
    background: rgba(100, 150, 255, 0.22);
    border-color: rgba(100, 150, 255, 0.45);
}

.tag--clickable:active {
    transform: translateY(1px);
}

/* ---------------- Icon sizing ---------------- */
.tag-icon {
    width: 14px;
    height: 14px;
    opacity: 0.9;
    flex-shrink: 0;
}

.tag--lg .tag-icon {
    width: 16px;
    height: 16px;
}

.tag--sm .tag-icon {
    width: 12px;
    height: 12px;
}

/* ---------------- Removable X ---------------- */
.tag__x {
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font-size: 1rem;
    padding: 0;
    opacity: 0.75;
    line-height: 1;
}

.tag__x:hover {
    opacity: 1;
}
</style>
