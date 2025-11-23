<!-- src/components/Navbar.vue -->
<template>
    <header class="navbar">
        <div class="nav-inner">
            <!-- Left: Logo / Brand -->
            <router-link to="/" class="brand">
                <h1 class="logo">Hymods</h1>
            </router-link>

            <!-- Center: Search -->
            <div class="search-wrap">
                <input
                    v-model="q"
                    class="search-input"
                    type="search"
                    placeholder="Search assets or plugins..."
                    @keydown.enter="goSearch"
                    aria-label="Search"
                />
                <button
                    class="search-btn"
                    @click="goSearch"
                    aria-label="Search button"
                >
                    <!-- simple magnifier svg -->
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

            <!-- Right: Nav links + actions -->
            <div class="right">
                <div class="actions">
                    <button class="icon-btn" aria-label="Cart">
                        <!-- cart svg -->
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
                        <!-- user svg -->
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
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

// keep current query in sync if already on a search/browse page
const q = ref((route.query.q as string) ?? "");

function goSearch() {
    const query = q.value.trim();
    if (!query) return;

    // send to your browse/search route (adjust path if needed)
    router.push({
        path: "/browse",
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
    position: relative;
    max-width: 1200px;
    margin: 0 auto;
    padding: 12px 18px;

    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* Brand */
.brand {
    text-decoration: none;
}
.logo {
    margin: 0;
    font-size: 1.3rem;
    letter-spacing: 0.4px;
    color: var(--color-accent);
    font-weight: 700;
}

/* Search */
.search-wrap {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);

    width: min(560px, 60vw);
    display: flex;
    align-items: center;

    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    overflow: hidden;
}

.search-input {
    flex: 1;
    background: transparent;
    border: none;
    color: white;
    padding: 9px 12px;
    font-size: 0.95rem;
    outline: none;
}

.search-input::placeholder {
    color: rgba(255, 255, 255, 0.55);
}

.search-btn {
    height: 100%;
    padding: 8px 10px;
    background: rgba(255, 255, 255, 0.06);
    border: none;
    color: white;
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: background 0.15s ease;
}

.search-btn:hover {
    background: rgba(255, 255, 255, 0.1);
}

/* Right side */
.right {
    display: flex;
    align-items: center;
    gap: 10px;
}

.nav-links {
    display: flex;
    gap: 6px;
}

.nav-links a {
    color: rgba(255, 255, 255, 0.85);
    text-decoration: none;
    padding: 6px 10px;
    border-radius: 8px;
    font-size: 0.95rem;
    transition:
        background 0.15s ease,
        color 0.15s ease;
}

.nav-links a:hover {
    color: white;
    background: rgba(255, 255, 255, 0.06);
}

.nav-links a.router-link-active {
    color: white;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
}

/* Actions */
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
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.04);
    color: white;
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

/* Mobile: stack + hide text links if needed */
@media (max-width: 760px) {
    .nav-inner {
        grid-template-columns: auto 1fr auto;
        gap: 10px;
    }

    .nav-links {
        display: none; /* keep navbar compact on mobile */
    }

    .search-wrap {
        max-width: 100%;
    }
}
</style>
