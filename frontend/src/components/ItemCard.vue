<template>
    <div class="item-card">
        <div v-if="thumbnail" class="thumb-wrap">
            <img :src="thumbnail" class="thumb" />
        </div>

        <div class="info">
            <h3 class="title">{{ title }}</h3>
            <p class="author">by {{ author }}</p>

            <p class="desc" v-if="description">
                {{ description }}
            </p>

            <div class="tags" v-if="tags?.length">
                <span v-for="tag in tags" :key="tag" class="tag">
                    {{ tag }}
                </span>
            </div>

            <div class="stats">
                <span>{{ downloads.toLocaleString() }} downloads</span>
                <span>•</span>
                <span>Updated {{ updated }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    type: "plugin" | "asset";
    title: string;
    author: string;
    downloads: number;
    updated: string;
    tags?: string[];
    thumbnail?: string;
    description?: string;
}>();
</script>

<style scoped>
.item-card {
    display: flex;
    flex-direction: column;

    background: var(--color-surface);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    overflow: hidden;

    box-shadow:
        0 10px 26px rgba(0, 0, 0, 0.35),
        inset 0 1px 0 rgba(255, 255, 255, 0.02);

    cursor: pointer;
    transition:
        transform 0.12s ease,
        box-shadow 0.12s ease,
        border-color 0.12s ease;
}

.item-card:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.14);
    box-shadow:
        0 14px 34px rgba(0, 0, 0, 0.45),
        inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.thumb-wrap {
    width: 100%;
    height: 170px;
    background: rgba(255, 255, 255, 0.02);
}

.thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.info {
    padding: 14px 16px 16px;
}

.title {
    font-size: 1.05rem;
    margin: 0 0 2px;
    font-weight: 700;
}

.author {
    opacity: 0.7;
    font-size: 0.85rem;
    margin: 0;
}

.desc {
    margin-top: 6px;
    opacity: 0.85;
    font-size: 0.88rem;
}

.tags {
    margin-top: 8px;
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.tag {
    background: rgba(255, 255, 255, 0.1);
    padding: 3px 7px;
    border-radius: 6px;
    font-size: 0.75rem;
}

.stats {
    margin-top: 12px;
    font-size: 0.75rem;
    opacity: 0.8;
    display: flex;
    gap: 6px;
}
</style>
