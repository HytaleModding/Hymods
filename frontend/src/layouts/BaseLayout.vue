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

/* Main wrapper for spacing — adaptive padding */
.content {
    flex: 1;
    padding: clamp(16px, 4vw, 40px);
}

/* Core content container (the card) */
.container {
    width: 100%;
    max-width: clamp(700px, 80vw, 1100px); /* responsive max-width */
    margin: 0 auto;
    background: var(--color-surface);
    border-radius: 14px;
    padding: clamp(18px, 3vw, 32px); /* responsive padding */
    border: 1px solid rgba(255, 255, 255, 0.06);

    box-shadow:
        0 10px 30px rgba(0, 0, 0, 0.35),
        inset 0 1px 0 rgba(255, 255, 255, 0.02);
}

/* Small screens refinement */
@media (max-width: 640px) {
    .container {
        border-radius: 10px;
        padding: clamp(12px, 4vw, 20px);
    }
}
</style>
