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
    position: relative;
    overflow: hidden;

    background:
        radial-gradient(
            1200px 700px at 50% -200px,
            rgba(255, 255, 255, 0.06),
            transparent 60%
        ),
        var(--color-bg);

    color: white;
}

/* background image that fades into page bg */
.layout::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;

    /* multiple layers stacked */
    background:
        /* 1. tint layer (optional) */
        linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.25) 0%,
            /* 25% dark overlay at top */ rgba(0, 0, 0, 0.45) 100%
                /* 45% at bottom */
        ),
        /* 2. fade-out mask */
            linear-gradient(
                to bottom,
                rgba(0, 0, 0, 0) 0%,
                /* fully transparent */ var(--color-bg) 90%
                    /* fade into page bg */
            ),
        /* 3. base image */ url("../assets/images/hytale.png");

    /* image handling */
    background-size: 100% auto; /* full width, natural height */
    background-repeat: no-repeat;
    background-position: top center;

    /* optional blur */
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);

    /* overall strength */
    opacity: 0.1; /* adjust from 0.05 to 0.25 */
}

/* ensure page content stays above the background image */
.layout > * {
    position: relative;
    z-index: 1;
}

.content {
    flex: 1;
    padding: clamp(16px, 4vw, 40px);
}

.container {
    width: 100%;
    max-width: clamp(700px, 80vw, 1200px);
    margin: 0 auto;
    background: transparent;
    padding: 0;
    border: none;
    box-shadow: none;
}

@media (max-width: 640px) {
    .content {
        padding: clamp(12px, 4vw, 20px);
    }
}
</style>
