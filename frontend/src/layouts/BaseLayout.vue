<!-- src/layouts/Layout.vue -->
<template>
    <div class="layout">
        <Navbar />

        <main class="content">
            <div class="container">
                <slot />
            </div>
        </main>

        <Footer />
    </div>
</template>

<script setup lang="ts">
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";
</script>

<style scoped>
.layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background:
        radial-gradient(
            1200px 700px at 50% -200px,
            rgba(255, 255, 255, 0.06),
            transparent 60%
        ),
        var(--color-bg);
    color: white;
}

.content {
    flex: 1;
    padding: clamp(16px, 4vw, 40px);
}

/* container is now just a width wrapper, NOT a card */
.container {
    width: 100%;
    max-width: clamp(700px, 80vw, 1100px);
    margin: 0 auto;

    background: transparent;
    border: none;
    box-shadow: none;
    padding: 0;
    border-radius: 0;
}

@media (max-width: 640px) {
    .content {
        padding: clamp(12px, 4vw, 20px);
    }
}
</style>
