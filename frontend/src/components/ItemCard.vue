<!-- src/components/ItemCard.vue -->
<template>
    <!-- LIST TEMPLATE -->
    <article
        v-if="display_mode === 'list'"
        class="item-card list"
        @click="$emit('open')"
    >
        <div class="thumb-wrap">
            <img v-if="thumbnail" :src="thumbnail" class="thumb" />
            <div v-else class="thumb-placeholder" aria-hidden="true"></div>
        </div>

        <div class="info list-info">
            <!-- Title row: older positioning (all left, inline) + icons -->
            <div class="title-row">
                <h3 class="title">{{ title }}</h3>

                <span class="type-badge">{{ type.toUpperCase() }}</span>

                <span class="creator">
                    <UserIcon class="icon sm" />
                    {{ author }}
                </span>

                <div class="tags-inline" v-if="tags?.length">
                    <span v-for="tag in tags" :key="tag" class="tag small">
                        {{ tag }}
                    </span>
                </div>
            </div>

            <p v-if="description" class="desc">
                {{ description }}
            </p>

            <!-- Stats bottom-left like older version, with icons from newer -->
            <div class="stats list-stats">
                <span class="stat">
                    <DownloadIcon class="icon sm" />
                    {{ downloads.toLocaleString() }} downloads
                </span>
                <span class="dot">•</span>
                <span class="stat">
                    <RotateCwIcon class="icon sm" />
                    Updated {{ updated }}
                </span>
            </div>
        </div>
    </article>

    <!-- GRID TEMPLATE -->
    <article v-else class="item-card grid" @click="$emit('open')">
        <div class="thumb-wrap">
            <img v-if="thumbnail" :src="thumbnail" class="thumb" />
            <div v-else class="thumb-placeholder" aria-hidden="true"></div>
        </div>

        <div class="info">
            <div class="top-line">
                <h3 class="title">{{ title }}</h3>
                <span class="type-badge">{{ type.toUpperCase() }}</span>
            </div>

            <span class="creator">by {{ author }}</span>

            <div class="tags" v-if="tags?.length">
                <span v-for="tag in tags" :key="tag" class="tag">
                    {{ tag }}
                </span>
            </div>

            <p v-if="description" class="desc grid-desc">
                {{ description }}
            </p>

            <div class="stats">
                <span>{{ downloads.toLocaleString() }} downloads</span>
                <span>•</span>
                <span>{{ updated }}</span>
            </div>
        </div>
    </article>
</template>

<script setup lang="ts">
import {
    Download as DownloadIcon,
    RotateCw as RotateCwIcon,
    User as UserIcon,
} from "lucide-vue-next";

withDefaults(
    defineProps<{
        type: "plugin" | "asset";
        display_mode?: "grid" | "list";
        title: string;
        author: string;
        downloads: number;
        updated: string;
        tags?: string[];
        thumbnail?: string;
        description?: string;
    }>(),
    {
        display_mode: "grid",
    },
);

defineEmits<{
    (e: "open"): void;
}>();
</script>

<style scoped>
/* ---------------- Shared card base ---------------- */
.item-card {
    background: var(--color-surface);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    display: flex;

    box-shadow:
        0 10px 24px rgba(0, 0, 0, 0.35),
        inset 0 1px 0 rgba(255, 255, 255, 0.02);

    transition:
        transform 0.12s ease,
        border-color 0.12s ease,
        box-shadow 0.12s ease;
}

.item-card:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.14);
    box-shadow:
        0 14px 32px rgba(0, 0, 0, 0.45),
        inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

/* ---------------- Thumbnail ---------------- */
.thumb-wrap {
    position: relative;
    background: rgba(255, 255, 255, 0.04);
}

.thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.thumb-placeholder {
    width: 100%;
    height: 100%;
    background:
        radial-gradient(
            120px 80px at 30% 20%,
            rgba(255, 255, 255, 0.05),
            transparent
        ),
        radial-gradient(
            140px 90px at 70% 60%,
            rgba(255, 255, 255, 0.04),
            transparent
        ),
        rgba(255, 255, 255, 0.03);
}

/* ---------------- Icon fixes ---------------- */
.icon {
    stroke-width: 2.2;
    opacity: 0.9;
    display: inline-block;
    vertical-align: middle;
    flex-shrink: 0;
    line-height: 0;
}
.icon.sm {
    width: 14px;
    height: 14px;
}
.icon.md {
    width: 16px;
    height: 16px;
}

/* ---------------- Shared content ---------------- */
.info {
    padding: 14px 18px 16px;
    display: flex;
    flex-direction: column;
}

.title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: white;
}

.creator {
    opacity: 0.75;
    font-size: 0.85rem;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    line-height: 1; /* keep svg from adding height */
}

.type-badge {
    font-size: 0.65rem;
    padding: 3px 7px;
    border-radius: 6px;
    background: rgba(100, 150, 255, 0.18);
    border: 1px solid rgba(100, 150, 255, 0.38);
    color: var(--color-accent2);
    font-weight: 700;
}

/* Tags (grid) */
.tags {
    margin-top: 6px;
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.tag {
    background: rgba(255, 255, 255, 0.1);
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 0.75rem;
    opacity: 0.85;
}

.tag.small {
    font-size: 0.7rem;
    padding: 2px 6px;
    opacity: 0.7;
}

/* Description */
.desc {
    margin-top: 8px;
    opacity: 0.9;
    font-size: 0.9rem;
    line-height: 1.3;
}

/* Stats base */
.stats {
    margin-top: 10px;
    font-size: 0.78rem;
    opacity: 0.8;
    display: flex;
    gap: 6px;
    align-items: center;
}

.stat {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.dot {
    opacity: 0.6;
}

/* ---------------- LIST MODE ---------------- */
.item-card.list {
    flex-direction: row;
    height: 150px;
}

.item-card.list .thumb-wrap {
    width: 230px; /* older layout size */
    height: 100%;
    flex: 0 0 230px;
    background: rgba(255, 255, 255, 0.04);
}

.list-info {
    justify-content: flex-start; /* top-align content */
}

/* title row inline (older positioning) */
.title-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    line-height: 1.15;
}

/* tags inline in list title row */
.tags-inline {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

/* keep stats at bottom-left */
.list-stats {
    margin-top: auto;
    padding-top: 8px;
}

/* ---------------- GRID MODE ---------------- */
.item-card.grid {
    flex-direction: column;
}

.item-card.grid .thumb-wrap {
    width: 100%;
    height: 170px;
}

.top-line {
    display: flex;
    align-items: center;
    gap: 10px;
}

.item-card.grid .grid-desc {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Mobile tweaks */
@media (max-width: 700px) {
    .item-card.list {
        flex-direction: column;
        height: auto;
    }

    .item-card.list .thumb-wrap {
        width: 100%;
        height: 170px;
        flex: 0 0 auto;
    }

    .list-stats {
        margin-top: 10px;
    }
}
</style>
