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
/* ------------------------------------------------------------
   Root-variable-driven Layout Wrapper
------------------------------------------------------------ */
.layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;

    background:
        radial-gradient(
            var(--layout-radial-width, 1200px)
                var(--layout-radial-height, 700px) at
                var(--layout-radial-x, 50%) var(--layout-radial-y, -200px),
            rgba(255, 255, 255, var(--layout-radial-opacity, 0.06)),
            transparent var(--layout-radial-fade, 60%)
        ),
        var(--color-bg);

    color: var(--layout-fg, #ffffff);
}

/* ------------------------------------------------------------
   Decorative background image layers
------------------------------------------------------------ */
.layout::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;

    background:
        /* Tint layer */
        linear-gradient(
            to bottom,
            rgba(0, 0, 0, var(--layout-img-tint-top, 0.25)) 0%,
            rgba(0, 0, 0, var(--layout-img-tint-bottom, 0.45)) 100%
        ),
        /* Fade mask */
            linear-gradient(
                to bottom,
                rgba(0, 0, 0, 0) 0%,
                var(--color-bg) var(--layout-img-fade-stop, 90%)
            ),
        /* Base image */ url("../assets/images/hytale.png");

    background-size: var(--layout-img-size, 100% auto);
    background-repeat: no-repeat;
    background-position: var(--layout-img-position, top center);

    backdrop-filter: blur(var(--layout-img-blur, 2px));
    -webkit-backdrop-filter: blur(var(--layout-img-blur, 2px));

    opacity: var(--layout-img-opacity, 0.1);
}

/* Everything above fills over the background image */
.layout > * {
    position: relative;
    z-index: 1;
}

/* ------------------------------------------------------------
   Content
------------------------------------------------------------ */
.content {
    flex: 1;
    padding: var(--layout-content-padding, clamp(16px, 4vw, 40px));
}

/* ------------------------------------------------------------
   Container
------------------------------------------------------------ */
.container {
    width: 100%;
    max-width: var(--layout-container-max-width, clamp(700px, 80vw, 1200px));
    margin: 0 auto;

    background: var(--layout-container-bg, transparent);
    padding: var(--layout-container-padding, 0);
    border: none;
    box-shadow: none;
}

/* ------------------------------------------------------------
   Mobile
------------------------------------------------------------ */
@media (max-width: 640px) {
    .content {
        padding: var(--layout-content-padding-mobile, clamp(12px, 4vw, 20px));
    }
}
</style>
