<!-- src/components/Footer.vue -->
<template>
    <footer class="footer">
        <div class="footer-inner">
            <span>© 2025 Hymods</span>
        </div>
    </footer>
</template>

<script setup lang="ts"></script>

<style scoped>
.footer {
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    background: var(--color-surface);
}

.footer-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 14px 20px;
    text-align: center;
    font-size: 0.85rem;
    opacity: 0.65;
}
</style>
