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
            <!-- Title row -->
            <div class="title-row">
                <span class="type-badge">{{ type.toUpperCase() }}</span>
                <h3 class="title">{{ title }}</h3>

                <span class="creator">
                    <UserIcon class="icon sm" />
                    {{ author }}
                </span>

                <!-- UPDATED: clickable Tag component + emits tag-click -->
                <div class="tags-inline" v-if="tags?.length">
                    <Tag
                        v-for="t in tags"
                        :key="t"
                        :label="t"
                        size="lg"
                        clickable
                        @click.stop="onTagClick(t)"
                    />
                </div>
            </div>

            <p v-if="description" class="desc">
                {{ truncatedDesc }}
            </p>

            <!-- Stats bottom-left -->
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

        <!-- RIGHT ACTIONS (heart + favorite star) -->
        <div class="actions-right" @click.stop>
            <button
                class="action-btn"
                type="button"
                aria-label="Like"
                @click.stop="$emit('toggle-like')"
            >
                <HeartIcon class="icon md" />
            </button>

            <button
                class="action-btn"
                type="button"
                aria-label="Favorite"
                @click.stop="$emit('toggle-favorite')"
            >
                <StarIcon class="icon md" />
            </button>
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

            <!-- UPDATED GRID TAGS: clickable + emits tag-click -->
            <div class="tags" v-if="tags?.length">
                <Tag
                    v-for="t in tags"
                    :key="t"
                    :label="t"
                    size="lg"
                    clickable
                    @click.stop="onTagClick(t)"
                />
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
import { computed } from "vue";
import {
    Download as DownloadIcon,
    RotateCw as RotateCwIcon,
    User as UserIcon,
    Heart as HeartIcon,
    Star as StarIcon,
} from "lucide-vue-next";
import Tag from "./Tag.vue";

const props = withDefaults(
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

const emit = defineEmits<{
    (e: "open"): void;
    (e: "toggle-like"): void;
    (e: "toggle-favorite"): void;
    (e: "tag-click", tag: string): void;
}>();

function onTagClick(tag: string) {
    emit("tag-click", tag);
}

// limit description to 128 chars in list view
const truncatedDesc = computed(() => {
    const d = props.description ?? "";
    if (props.display_mode !== "list") return d;
    return d.length > 128 ? d.slice(0, 128) + "…" : d;
});
</script>

<style scoped>
/* ---------------- Shared card base ---------------- */
.item-card {
    /* base intensity for cards */
    --surface-strength: 0.7;

    background: var(--surface-gradient);
    border: 2px solid var(--surface-border);
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    display: flex;
    position: relative;

    backdrop-filter: blur(64px);
    box-shadow: var(--surface-shadow);

    transition:
        transform 0.12s ease,
        border-color 0.12s ease,
        box-shadow 0.12s ease,
        background 0.15s ease;

    min-height: 170px;
}

.item-card:hover {
    /* slightly stronger lighting on hover */
    --surface-strength: 1;

    transform: translateY(-3px);

    /* keep the same gradient family so heart/star area stays consistent */
    background: var(--surface-gradient);

    border-color: rgba(255, 255, 255, 0.14);

    box-shadow:
        0 16px 32px rgba(0, 0, 0, 0.45),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
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

/* ---------------- Icon sizing / baseline fix ---------------- */
.icon {
    stroke-width: 2.2;
    opacity: 0.9;
    display: inline-block;
    vertical-align: middle;
    flex-shrink: 0;
    line-height: 0;
}
.icon.xs {
    width: 14px;
    height: 14px;
}
.icon.sm {
    width: 18px;
    height: 18px;
}
.icon.md {
    width: 22px;
    height: 22px;
}

/* ---------------- Shared content ---------------- */
.info {
    padding: 16px 20px 18px;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.title {
    font-size: 1.55rem;
    font-weight: 800;
    color: white;
    letter-spacing: -0.25px;
    margin: 0;
}

.creator {
    opacity: 0.75;
    font-size: 1rem;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    line-height: 1;
}

.type-badge {
    font-size: 1rem;
    padding: 8px 8px;
    border-radius: 6px;
    background: rgba(100, 150, 255, 0.18);
    border: 1px solid rgba(100, 150, 255, 0.38);
    color: var(--color-accent2);
    font-weight: 800;
}

/* Tags containers (keep) */
.tags,
.tags-inline {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.tags {
    margin-top: 8px;
}

/* Description */
.desc {
    margin-top: 10px;
    opacity: 0.92;
    font-size: 1.25rem;
    line-height: 1.45;
}

/* Stats */
.stats {
    margin-top: 14px;
    font-size: 0.95rem;
    opacity: 0.85;
    display: flex;
    gap: 10px;
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
    height: 180px;
    padding-right: 90px;
}

.item-card.list .thumb-wrap {
    width: 260px;
    height: 100%;
    flex: 0 0 260px;
    border-right: 1px solid rgba(255, 255, 255, 0.04);
}

.list-info {
    justify-content: flex-start;
}

.title-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    line-height: 1.15;
}

.list-stats {
    margin-top: auto;
    padding-top: 8px;
}

/* ---------------- Right-Side Actions ---------------- */
.actions-right {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.action-btn {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.16);
    color: white;
    cursor: pointer;
    transition:
        background 0.15s ease,
        border-color 0.15s ease,
        transform 0.05s ease;
}

.action-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.22);
}

.action-btn:active {
    transform: translateY(1px);
}

/* ---------------- GRID MODE ---------------- */
.item-card.grid {
    flex-direction: column;
}

.item-card.grid .thumb-wrap {
    width: 100%;
    height: 190px;
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

/* ---------------- Mobile ---------------- */
@media (max-width: 700px) {
    .item-card.list {
        flex-direction: column;
        height: auto;
        padding-right: 0;
    }

    .item-card.list .thumb-wrap {
        width: 100%;
        height: 190px;
        flex: 0 0 auto;
        border-right: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }

    .actions-right {
        position: static;
        transform: none;
        flex-direction: row;
        justify-content: flex-end;
        padding: 10px 14px 0;
        margin-left: auto;
        gap: 10px;
    }

    .title {
        font-size: 1.4rem;
    }

    .desc {
        font-size: 0.95rem;
    }

    .stats {
        font-size: 0.88rem;
    }
}
</style>
