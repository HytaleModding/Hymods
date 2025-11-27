<template>
  <div class="example-app">
    <h1>Plugin Data Manager Examples</h1>

    <!-- Navigation -->
    <nav class="example-nav">
      <button @click="activeExample = 'list'" :class="{ active: activeExample === 'list' }">
        Plugin List
      </button>
      <button @click="activeExample = 'search'" :class="{ active: activeExample === 'search' }">
        Search
      </button>
      <button @click="activeExample = 'details'" :class="{ active: activeExample === 'details' }">
        Details
      </button>
      <button @click="activeExample = 'filter'" :class="{ active: activeExample === 'filter' }">
        Filters
      </button>
      <button @click="activeExample = 'dashboard'" :class="{ active: activeExample === 'dashboard' }">
        Dashboard
      </button>
      <button @click="activeExample = 'user'" :class="{ active: activeExample === 'user' }">
        User Plugins
      </button>
      <button @click="activeExample = 'direct'" :class="{ active: activeExample === 'direct' }">
        Direct API
      </button>
    </nav>

    <hr />

    <!-- Active Example -->
    <div class="example-content">
      <PluginListExample v-if="activeExample === 'list'" />
      <PluginSearchExample v-if="activeExample === 'search'" />
      <PluginDetailsExample v-if="activeExample === 'details'" :plugin-id="'plugin-1'" />
      <PluginFilterExample v-if="activeExample === 'filter'" />
      <PluginDashboardExample v-if="activeExample === 'dashboard'" />
      <UserPluginsExample v-if="activeExample === 'user'" />
      <DirectAPIExample v-if="activeExample === 'direct'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Import all example components
import PluginListExample from './examples/PluginListExample.vue';
import PluginSearchExample from './examples/PluginSearchExample.vue';
import PluginDetailsExample from './examples/PluginDetailsExample.vue';
import PluginFilterExample from './examples/PluginFilterExample.vue';
import PluginDashboardExample from './examples/PluginDashboardExample.vue';
import UserPluginsExample from './examples/UserPluginsExample.vue';
import DirectAPIExample from './examples/DirectAPIExample.vue';

const activeExample = ref('list');
</script>

<!-- Example 1: Basic Plugin List with Pagination -->
<script lang="ts">
export const PluginListExample = {
  name: 'PluginListExample',
  template: `
    <div>
      <h2>Plugin List</h2>

      <!-- Sort Controls -->
      <div class="controls">
        <select @change="updateQuery({ sortBy: $event.target.value })">
          <option value="downloads">Downloads</option>
          <option value="updated">Recently Updated</option>
          <option value="title">Title</option>
          <option value="author">Author</option>
        </select>

        <button @click="toggleOrder">
          Toggle Order ({{ meta?.order || 'desc' }})
        </button>

        <button @click="refresh">Refresh</button>
      </div>

      <!-- Loading State -->
      <div v-if="loading">Loading plugins...</div>

      <!-- Error State -->
      <div v-else-if="error" class="error">Error: {{ error.message }}</div>

      <!-- Plugin List -->
      <ul v-else class="plugin-list">
        <li v-for="plugin in plugins" :key="plugin.id" class="plugin-item">
          <h3>{{ plugin.title }}</h3>
          <p>by {{ plugin.author }}</p>
          <p>{{ plugin.downloads.toLocaleString() }} downloads</p>
          <p>Updated: {{ plugin.updated }}</p>
          <div class="tags">
            <span v-for="tag in plugin.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </li>
      </ul>

      <!-- Pagination -->
      <div v-if="meta" class="pagination">
        <button @click="prevPage" :disabled="!meta.hasPrev">
          Previous
        </button>
        <span>
          Page {{ meta.currentPage }} of {{ meta.totalPages }}
        </span>
        <button @click="nextPage" :disabled="!meta.hasNext">
          Next
        </button>
      </div>
    </div>
  `,
  setup() {
    import { usePlugins } from '@/services/api';
    import { SortBy, SortOrder } from '@/services/api/types';

    const {
      plugins,
      loading,
      error,
      meta,
      updateQuery,
      nextPage,
      prevPage,
      refresh,
    } = usePlugins({
      limit: 10,
      sortBy: SortBy.DOWNLOADS,
      order: SortOrder.DESC,
    });

    const toggleOrder = () => {
      updateQuery({
        order: meta.value?.order === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC,
      });
    };

    return {
      plugins,
      loading,
      error,
      meta,
      updateQuery,
      nextPage,
      prevPage,
      refresh,
      toggleOrder,
    };
  },
};
</script>

<!-- Example 2: Plugin Search with Debouncing -->
<script lang="ts">
export const PluginSearchExample = {
  name: 'PluginSearchExample',
  template: `
    <div>
      <h2>Search Plugins</h2>
      <input
        type="text"
        v-model="searchTerm"
        placeholder="Search for plugins..."
        class="search-input"
      />

      <div v-if="loading">Searching...</div>
      <div v-else-if="error" class="error">Error: {{ error.message }}</div>

      <div v-else-if="searchTerm && results.length === 0">
        No plugins found for "{{ searchTerm }}"
      </div>

      <ul v-else class="search-results">
        <li v-for="plugin in results" :key="plugin.id">
          <strong>{{ plugin.title }}</strong> - {{ plugin.author }}
          <br />
          <small>{{ plugin.downloads.toLocaleString() }} downloads</small>
        </li>
      </ul>
    </div>
  `,
  setup() {
    import { usePluginSearch } from '@/services/api';

    const {
      searchTerm,
      results,
      loading,
      error,
    } = usePluginSearch(500); // 500ms debounce

    return {
      searchTerm,
      results,
      loading,
      error,
    };
  },
};
</script>

<!-- Example 3: Single Plugin Details with Actions -->
<script lang="ts">
export const PluginDetailsExample = {
  name: 'PluginDetailsExample',
  props: {
    pluginId: {
      type: String,
      required: true,
    },
  },
  template: `
    <div v-if="plugin" class="plugin-details">
      <h1>{{ plugin.title }}</h1>
      <img :src="plugin.thumbnail" :alt="plugin.title" class="plugin-thumbnail" />

      <div class="plugin-meta">
        <p><strong>Author:</strong> {{ plugin.author }}</p>
        <p><strong>Downloads:</strong> {{ plugin.downloads.toLocaleString() }}</p>
        <p><strong>Version:</strong> {{ plugin.version }}</p>
        <p><strong>Updated:</strong> {{ plugin.updated }}</p>
        <p v-if="plugin.rating">
          <strong>Rating:</strong> {{ plugin.rating.toFixed(1) }} ⭐ ({{ plugin.ratingCount }} reviews)
        </p>
      </div>

      <div class="plugin-description">
        <h3>Description</h3>
        <p>{{ plugin.description }}</p>
      </div>

      <div class="plugin-tags">
        <h3>Tags</h3>
        <span v-for="tag in plugin.tags" :key="tag" class="tag">
          #{{ tag }}
        </span>
      </div>

      <!-- Action Buttons -->
      <div class="plugin-actions">
        <button
          @click="handleInstallToggle"
          :disabled="installing"
          class="btn-primary"
        >
          {{ isInstalled(pluginId) ? 'Uninstall' : 'Install' }}
        </button>

        <button
          @click="() => toggleFavorite(pluginId)"
          class="btn-favorite"
        >
          {{ isFavorite(pluginId) ? '💔 Unfavorite' : '❤️ Favorite' }}
        </button>

        <button
          @click="handleDownload"
          :disabled="downloading"
          class="btn-download"
        >
          {{ downloading ? `Downloading... ${progress}%` : '📥 Download' }}
        </button>

        <button
          @click="showReportDialog = true"
          class="btn-report"
        >
          ⚠️ Report Plugin
        </button>
      </div>

      <!-- Rating -->
      <div class="plugin-rating">
        <h3>Rate this plugin</h3>
        <div class="star-rating">
          <button
            v-for="star in 5"
            :key="star"
            @click="() => ratePlugin(pluginId, star)"
            :class="{ active: getRating(pluginId) >= star }"
            class="star"
          >
            ★
          </button>
        </div>
      </div>

      <!-- Dependencies -->
      <div v-if="dependencies.length > 0" class="plugin-dependencies">
        <h3>Dependencies</h3>
        <ul>
          <li v-for="dep in dependencies" :key="dep.id">
            {{ dep.title }} v{{ dep.version }}
          </li>
        </ul>
      </div>

      <!-- Similar Plugins -->
      <div v-if="similarPlugins.length > 0" class="similar-plugins">
        <h3>Similar Plugins</h3>
        <ul>
          <li v-for="sim in similarPlugins" :key="sim.id">
            {{ sim.title }} by {{ sim.author }}
          </li>
        </ul>
      </div>

      <!-- Report Dialog (simplified) -->
      <div v-if="showReportDialog" class="dialog">
        <h3>Report Plugin</h3>
        <button @click="handleReport">Submit Report</button>
        <button @click="showReportDialog = false">Cancel</button>
        <div v-if="reportSuccess">Report submitted successfully!</div>
      </div>
    </div>

    <div v-else-if="loading">Loading plugin details...</div>
    <div v-else-if="error" class="error">Error: {{ error.message }}</div>
  `,
  setup(props) {
    import { ref, toRef } from 'vue';
    import {
      usePlugin,
      usePluginDependencies,
      useSimilarPlugins,
      useUserPluginData,
      usePluginDownload,
      useReportPlugin,
    } from '@/services/api';

    const { plugin, loading, error } = usePlugin(toRef(props, 'pluginId'));
    const { dependencies } = usePluginDependencies(toRef(props, 'pluginId'));
    const { plugins: similarPlugins } = useSimilarPlugins(toRef(props, 'pluginId'), 3);

    const {
      isInstalled,
      isFavorite,
      getRating,
      installPlugin,
      uninstallPlugin,
      toggleFavorite,
      ratePlugin,
    } = useUserPluginData();

    const { download, downloading, progress } = usePluginDownload();
    const { report, reporting: reportLoading, success: reportSuccess } = useReportPlugin();

    const installing = ref(false);
    const showReportDialog = ref(false);

    const handleInstallToggle = async () => {
      installing.value = true;
      if (isInstalled.value(props.pluginId)) {
        await uninstallPlugin(props.pluginId);
      } else {
        await installPlugin(props.pluginId);
      }
      installing.value = false;
    };

    const handleDownload = async () => {
      const url = await download(props.pluginId);
      if (url) {
        console.log('Download URL:', url);
      }
    };

    const handleReport = async () => {
      await report(props.pluginId, 'Malicious Code', 'This plugin contains harmful code');
    };

    return {
      plugin,
      loading,
      error,
      dependencies,
      similarPlugins,
      isInstalled,
      isFavorite,
      getRating,
      toggleFavorite,
      ratePlugin,
      handleInstallToggle,
      installing,
      download,
      downloading,
      progress,
      handleDownload,
      showReportDialog,
      reportSuccess,
      handleReport,
    };
  },
};
</script>

<style scoped>
.example-app {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.example-nav {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.example-nav button {
  padding: 8px 16px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  cursor: pointer;
  border-radius: 4px;
}

.example-nav button.active {
  background: #007bff;
  color: white;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.plugin-list {
  list-style: none;
  padding: 0;
}

.plugin-item {
  padding: 15px;
  border: 1px solid #ddd;
  margin-bottom: 10px;
  border-radius: 4px;
}

.tags {
  display: flex;
  gap: 5px;
  margin-top: 10px;
}

.tag {
  background: #e0e0e0;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
}

.pagination {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 20px;
}

.search-input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.plugin-thumbnail {
  width: 200px;
  height: auto;
  border-radius: 4px;
}

.plugin-actions {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.star-rating .star {
  background: none;
  border: none;
  font-size: 24px;
  color: #ccc;
  cursor: pointer;
}

.star-rating .star.active {
  color: gold;
}

.error {
  color: red;
  padding: 10px;
  background: #ffe0e0;
  border-radius: 4px;
}
</style>
