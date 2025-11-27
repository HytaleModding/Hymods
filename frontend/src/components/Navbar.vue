<!-- src/components/Navbar.vue -->
<template>
    <header class="navbar">
        <div class="nav-inner">
            <!-- Left: Logo (Home button) -->
            <router-link to="/" class="brand" aria-label="Go to home">
                <img
                    src="../assets/images/logo.png"
                    alt="CreateHT"
                    class="brand-logo"
                />
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
    position: sticky; /* keeps navbar locked at top on scroll */
    top: 0;
    left: 0;
    right: 0;
    z-index: var(--nav-z-index, 50);
    background: color-mix(
        in srgb,
        var(--navbar-bg, var(--color-surface)) 92%,
        transparent
    );
    backdrop-filter: blur(var(--nav-blur, 8px));
    border-bottom: 1px solid
        var(--border-subtle-strong, rgba(255, 255, 255, 0.06));
}

.nav-inner {
    max-width: var(--layout-max-width, 1250px);
    margin: 0 auto;
    padding: var(--nav-padding-y, 12px) var(--nav-padding-x, 18px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--nav-gap, 12px);
}

.brand-logo {
    height: 40px; /* scale the image */
    width: auto; /* keep proportions */
}

/* Brand as home button */
.brand {
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    padding: var(--brand-padding-y, 4px) var(--brand-padding-x, 6px);
    border-radius: var(--radius-sm, 8px);
    transition: background var(--transition-fast, 0.15s ease);
    height: 36px;
}
.brand:hover {
    background: var(--brand-hover-bg, rgba(255, 255, 255, 0.06));
}
.logo {
    margin: 0;
    font-size: var(--logo-font-size, 1.3rem);
    letter-spacing: var(--logo-letter-spacing, 0.4px);
    color: var(--color-accent);
    font-weight: var(--logo-font-weight, 800);
}

/* Encapsulated center group */
.center-cluster {
    display: flex;
    align-items: center;
    gap: var(--nav-center-gap, 10px);
    padding: var(--nav-center-padding, 6px);
    border-radius: var(--radius-lg, 12px);
    background: var(--nav-center-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--nav-center-border, rgba(255, 255, 255, 0.06));
    margin: 0 auto;
}

/* Tabs */
.type-tabs {
    display: flex;
    gap: var(--tab-gap, 6px);
    padding-right: var(--tab-group-padding-right, 8px);
    border-right: 1px solid
        var(--border-subtle-strong, rgba(255, 255, 255, 0.1));
}

.tab {
    position: relative;
    text-decoration: none;
    color: var(--tab-fg, rgba(255, 255, 255, 0.8));
    font-size: var(--tab-font-size, 0.92rem);
    padding: var(--tab-padding-y, 7px) var(--tab-padding-x, 12px);
    border-radius: var(--tab-radius, 9px);
    font-weight: var(--tab-font-weight, 600);
    letter-spacing: var(--tab-letter-spacing, 0.2px);
    transition:
        background var(--transition-fast, 0.15s ease),
        color var(--transition-fast, 0.15s ease),
        transform var(--transition-ultra-fast, 0.05s ease);
}

.tab:hover {
    color: var(--tab-hover-fg, #ffffff);
    background: var(--tab-hover-bg, rgba(255, 255, 255, 0.06));
}

/* Obvious active state (only on browse pages) */
.tab.active {
    color: var(--tab-active-fg, #ffffff);
    font-weight: var(--tab-active-font-weight, 800);
    background: var(
        --tab-active-bg,
        linear-gradient(180deg, var(--color-accent2), var(--color-accent3))
    );
    box-shadow:
        var(--tab-active-shadow, 0 6px 16px rgba(0, 0, 0, 0.35)),
        inset 0 0 0 1px
            var(--tab-active-inner-border, rgba(255, 255, 255, 0.22));
    transform: translateY(var(--tab-active-translate-y, -1px));
}

/* glow underline */
.tab.active::after {
    content: "";
    position: absolute;
    left: var(--tab-underline-inset, 10px);
    right: var(--tab-underline-inset, 10px);
    bottom: var(--tab-underline-offset, -6px);
    height: var(--tab-underline-height, 3px);
    border-radius: 999px;
    background: var(
        --tab-underline-bg,
        linear-gradient(90deg, var(--color-accent2), var(--color-accent3))
    );
    opacity: var(--tab-underline-opacity, 0.9);
}

/* Search */
.search-wrap {
    display: flex;
    align-items: center;
    width: min(var(--search-max-width, 340px), 38vw);
    background: var(--search-bg, rgba(0, 0, 0, 0.2));
    border: 1px solid var(--search-border, rgba(255, 255, 255, 0.06));
    border-radius: var(--radius-md, 9px);
    overflow: hidden;
}

.search-input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--search-fg, #ffffff);
    padding: var(--search-padding-y, 8px) var(--search-padding-x, 10px);
    font-size: var(--search-font-size, 0.95rem);
    outline: none;
}

.search-input::placeholder {
    color: var(--search-placeholder, rgba(255, 255, 255, 0.55));
}

.search-btn {
    height: 100%;
    padding: var(--search-btn-padding-y, 8px) var(--search-btn-padding-x, 10px);
    background: transparent;
    border: none;
    color: var(--search-icon-color, var(--color-accent2));
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: background var(--transition-fast, 0.15s ease);
}
.search-btn:hover {
    background: var(--search-btn-hover-bg, rgba(255, 255, 255, 0.06));
}

/* Right actions */
.right {
    display: flex;
    align-items: center;
    gap: var(--nav-right-gap, 10px);
}
.actions {
    display: flex;
    gap: var(--nav-actions-gap, 6px);
}

.icon-btn {
    display: grid;
    place-items: center;
    width: var(--icon-btn-size, 34px);
    height: var(--icon-btn-size, 34px);
    border-radius: var(--radius-md, 9px);
    background: var(--icon-btn-bg, rgba(255, 255, 255, 0.06));
    border: 1px solid var(--icon-btn-border, rgba(255, 255, 255, 0.08));
    color: var(--icon-btn-color, var(--color-accent2));
    cursor: pointer;
    transition:
        background var(--transition-fast, 0.15s ease),
        transform var(--transition-ultra-fast, 0.05s ease);
}
.icon-btn:hover {
    background: var(--icon-btn-hover-bg, rgba(255, 255, 255, 0.1));
}
.icon-btn:active {
    transform: translateY(var(--icon-btn-active-translate-y, 1px));
}

/* Mobile */
@media (max-width: 760px) {
    .type-tabs {
        display: none;
    }
    .search-wrap {
        width: var(--search-width-mobile, 60vw);
    }
}
</style>
