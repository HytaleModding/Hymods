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
    gap: var(--gap-xs);

    font-family: var(--ui-font-body);
    font-size: var(--ui-label-size);
    font-weight: var(--ui-label-weight);
    line-height: 1;

    padding: var(--ui-padding-xs);
    border-radius: var(--ui-radius-sm);

    background: var(--ui-surface-alt);
    border: 1px solid var(--ui-border);
    color: var(--ui-blue-bright);
    opacity: 0.9;

    white-space: nowrap;
    user-select: none;
}

/* ---------------- Sizes ---------------- */
.tag--sm {
    font-size: var(--font-xs);
    padding: 2px var(--space-2);
    border-radius: var(--ui-radius-xs);
}

.tag--md {
    font-size: var(--ui-label-size);
    padding: var(--ui-padding-xs);
    border-radius: var(--ui-radius-sm);
}

.tag--lg {
    font-size: var(--font-md);
    padding: 4px var(--space-3);
    border-radius: var(--ui-radius-md);
}

/* ---------------- Clickable hover/active ---------------- */
.tag--clickable {
    cursor: pointer;
    transition:
        background-color 0.15s ease,
        border-color 0.15s ease,
        opacity 0.15s ease,
        transform 0.05s ease,
        box-shadow 0.15s ease;
}

.tag--clickable:hover {
    opacity: 1;
    background: var(--ui-blue-soft);
    border-color: var(--ui-blue-bright);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.04);
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
    /* global button baseline already nukes default styles */
    color: inherit;
    cursor: pointer;
    font-size: var(--font-sm);
    padding: 0;
    opacity: 0.75;
    line-height: 1;
}

.tag__x:hover {
    opacity: 1;
}
</style>
