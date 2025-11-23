<script setup>
import ItemCard from "../components/ItemCard.vue";
import CardGrid from "../components/CardGrid.vue";

const popularPlugins = [
    {
        type: "plugin",
        title: "Quest Engine",
        author: "SparkDev",
        downloads: 123456,
        updated: "2 days ago",
        tags: ["Gameplay", "UI"],
        thumbnail:
            "https://static0.thegamerimages.com/wordpress/wp-content/uploads/2025/11/hytale-gameplay-raw-footage.jpg",
        description: "A full quest and dialogue framework.",
    },
    {
        type: "plugin",
        title: "Combat Overhaul",
        author: "Blocksmith",
        downloads: 98412,
        updated: "1 week ago",
        tags: ["Combat", "AI"],
        thumbnail:
            "https://static0.thegamerimages.com/wordpress/wp-content/uploads/2025/11/hytale-gameplay-raw-footage.jpg",
    },
    {
        type: "plugin",
        title: "Quest Engine",
        author: "SparkDev",
        downloads: 123456,
        updated: "2 days ago",
        tags: ["Gameplay", "UI"],
        thumbnail:
            "https://static0.thegamerimages.com/wordpress/wp-content/uploads/2025/11/hytale-gameplay-raw-footage.jpg",
        description: "A full quest and dialogue framework.",
    },
    {
        type: "plugin",
        title: "Combat Overhaul",
        author: "Blocksmith",
        downloads: 98412,
        updated: "1 week ago",
        tags: ["Combat", "AI"],
        thumbnail:
            "https://static0.thegamerimages.com/wordpress/wp-content/uploads/2025/11/hytale-gameplay-raw-footage.jpg",
    },
];

const popularAssets = [
    {
        type: "asset",
        title: "Forest Props Pack",
        author: "VoxelSmith",
        downloads: 67281,
        updated: "5 days ago",
        tags: ["Models", "Environment"],
        thumbnail:
            "https://static0.thegamerimages.com/wordpress/wp-content/uploads/2025/11/hytale-gameplay-raw-footage.jpg",
        description: "A detailed nature pack with 45 models.",
    },
    {
        type: "asset",
        title: "Forest Props Pack",
        author: "VoxelSmith",
        downloads: 67281,
        updated: "5 days ago",
        tags: ["Models", "Environment"],
        thumbnail:
            "https://static0.thegamerimages.com/wordpress/wp-content/uploads/2025/11/hytale-gameplay-raw-footage.jpg",
        description: "A detailed nature pack with 45 models.",
    },
    {
        type: "asset",
        title: "Forest Props Pack",
        author: "VoxelSmith",
        downloads: 67281,
        updated: "5 days ago",
        tags: ["Models", "Environment"],
        thumbnail:
            "https://static0.thegamerimages.com/wordpress/wp-content/uploads/2025/11/hytale-gameplay-raw-footage.jpg",
        description: "A detailed nature pack with 45 models.",
    },
    {
        type: "asset",
        title: "Forest Props Pack",
        author: "VoxelSmith",
        downloads: 67281,
        updated: "5 days ago",
        tags: ["Models", "Environment"],
        thumbnail:
            "https://static0.thegamerimages.com/wordpress/wp-content/uploads/2025/11/hytale-gameplay-raw-footage.jpg",
        description: "A detailed nature pack with 45 models.",
    },
];
</script>

<template>
    <div class="home">
        <h2>Popular Plugins</h2>
        <CardGrid>
            <ItemCard
                v-for="item in popularPlugins"
                :key="item.title"
                v-bind="item"
            />
        </CardGrid>

        <h2>Popular Assets</h2>
        <CardGrid>
            <ItemCard
                v-for="item in popularAssets"
                :key="item.title"
                v-bind="item"
            />
        </CardGrid>
    </div>
</template>

<style scoped>
.home {
    padding: 4px 0; /* the card container already has padding */
}

.spacer {
    height: 28px;
}
</style>
