<!-- src/components/Navbar.vue -->
<template>
    <header class="navbar">
        <div class="nav-inner">
            <!-- Left: Logo (Home button) -->
            <router-link to="/" class="brand" aria-label="Go to home">
                <h1 class="logo">hytl.shop</h1>
            </router-link>

            <!-- Center cluster: Tabs + Search -->
            <div class="center-cluster" role="search">
                <nav class="type-tabs" aria-label="Content type">
                    <router-link
                        to="/browse/plugins"
                        class="tab"
                        :class="{ active: activeType === 'plugins' }"
                    >
                        Plugins
                    </router-link>

                    <router-link
                        to="/browse/assets"
                        class="tab"
                        :class="{ active: activeType === 'assets' }"
                    >
                        Assets
                    </router-link>
                </nav>

                <div class="search-wrap">
                    <input
                        v-model="q"
                        class="search-input"
                        type="search"
                        placeholder="Search..."
                        @keydown.enter="goSearch"
                        aria-label="Search assets or plugins"
                    />
                    <button
                        class="search-btn"
                        @click="goSearch"
                        aria-label="Search button"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            aria-hidden="true"
                        >
                            <path
                                fill="currentColor"
                                d="M10 4a6 6 0 104.47 10.03l4.25 4.25 1.41-1.41-4.25-4.25A6 6 0 0010 4zm0 2a4 4 0 110 8 4 4 0 010-8z"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Right: actions -->
            <div class="right">
                <div class="actions">
                    <button class="icon-btn" aria-label="Cart">
                        <svg
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            aria-hidden="true"
                        >
                            <path
                                fill="currentColor"
                                d="M7 18a2 2 0 11.001 3.999A2 2 0 017 18zm10 0a2 2 0 11.001 3.999A2 2 0 0117 18zM6.2 6l.6 3h10.9l1.1-5H6.1L5.7 2H2v2h2l2.2 11h11.5v-2H8L7.6 11h11.1a2 2 0 001.9-1.5l1.7-7.5H6.2z"
                            />
                        </svg>
                    </button>

                    <button class="icon-btn" aria-label="User">
                        <svg
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            aria-hidden="true"
                        >
                            <path
                                fill="currentColor"
                                d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const q = ref((route.query.q as string) ?? "");

// Active type is ONLY set on browse pages.
// On home ("/") this returns null -> no highlight.
const activeType = computed<"plugins" | "assets" | null>(() => {
    const p = route.path.toLowerCase();
    if (p.startsWith("/browse/plugins")) return "plugins";
    if (p.startsWith("/browse/assets")) return "assets";
    return null;
});

watch(
    () => route.query.q,
    (val) => {
        if (typeof val === "string") q.value = val;
        if (val == null) q.value = "";
    },
);

function goSearch() {
    const query = q.value.trim();
    if (!query) return;

    // If user is on home, default searches to plugins.
    const target =
        activeType.value === "assets" ? "/browse/assets" : "/browse/plugins";

    router.push({
        path: target,
        query: { ...route.query, q: query },
    });
}
</script>

<style scoped>
.navbar {
    position: sticky;
    top: 0;
    z-index: 50;
    background: color-mix(in srgb, var(--color-surface) 92%, transparent);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.nav-inner {
    max-width: 1300px;
    margin: 0 auto;
    padding: 12px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

/* Brand as home button */
.brand {
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    padding: 4px 6px;
    border-radius: 8px;
    transition: background 0.15s ease;
}
.brand:hover {
    background: rgba(255, 255, 255, 0.06);
}
.logo {
    margin: 0;
    font-size: 1.3rem;
    letter-spacing: 0.4px;
    color: var(--color-accent);
    font-weight: 800;
}

/* Encapsulated center group */
.center-cluster {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    margin: 0 auto;
}

/* Tabs */
.type-tabs {
    display: flex;
    gap: 6px;
    padding-right: 8px;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.tab {
    position: relative;
    text-decoration: none;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.92rem;
    padding: 7px 12px;
    border-radius: 9px;
    font-weight: 600;
    letter-spacing: 0.2px;
    transition:
        background 0.15s ease,
        color 0.15s ease,
        transform 0.05s ease;
}

.tab:hover {
    color: white;
    background: rgba(255, 255, 255, 0.06);
}

/* Obvious active state (only on browse pages) */
.tab.active {
    color: white;
    font-weight: 800;
    background: linear-gradient(
        180deg,
        var(--color-accent2),
        var(--color-accent3)
    );
    box-shadow:
        0 6px 16px rgba(0, 0, 0, 0.35),
        inset 0 0 0 1px rgba(255, 255, 255, 0.22);
    transform: translateY(-1px);
}

/* glow underline */
.tab.active::after {
    content: "";
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: -6px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(
        90deg,
        var(--color-accent2),
        var(--color-accent3)
    );
    opacity: 0.9;
}

/* Search (shorter) */
.search-wrap {
    display: flex;
    align-items: center;
    width: min(340px, 38vw);
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 9px;
    overflow: hidden;
}

.search-input {
    flex: 1;
    background: transparent;
    border: none;
    color: white;
    padding: 8px 10px;
    font-size: 0.95rem;
    outline: none;
}

.search-input::placeholder {
    color: rgba(255, 255, 255, 0.55);
}

.search-btn {
    height: 100%;
    padding: 8px 10px;
    background: transparent;
    border: none;
    color: var(--color-accent2);
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: background 0.15s ease;
}
.search-btn:hover {
    background: rgba(255, 255, 255, 0.06);
}

/* Right actions */
.right {
    display: flex;
    align-items: center;
    gap: 10px;
}
.actions {
    display: flex;
    gap: 6px;
}

.icon-btn {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 9px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--color-accent2);
    cursor: pointer;
    transition:
        background 0.15s ease,
        transform 0.05s ease;
}
.icon-btn:hover {
    background: rgba(255, 255, 255, 0.1);
}
.icon-btn:active {
    transform: translateY(1px);
}

/* Mobile */
@media (max-width: 760px) {
    .type-tabs {
        display: none;
    }
    .search-wrap {
        width: 60vw;
    }
}
</style>
