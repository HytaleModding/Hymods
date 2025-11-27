<template>
  <div class="plugin-search-example">
    <h2>Search Plugins</h2>

    <!-- Search Input -->
    <div class="search-container">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search for plugins, authors, or tags..."
        class="search-input"
      />
      <span v-if="loading" class="search-spinner">🔍</span>
    </div>

    <!-- Search Info -->
    <div v-if="searchTerm" class="search-info">
      <p v-if="loading">Searching for "{{ searchTerm }}"...</p>
      <p v-else-if="results.length > 0">
        Found {{ results.length }} plugin(s) matching "{{ searchTerm }}"
      </p>
      <p v-else>No plugins found matching "{{ searchTerm }}"</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error">
      <strong>Error:</strong> {{ error.message }}
    </div>

    <!-- Results -->
    <div v-if="!loading && results.length > 0" class="search-results">
      <div v-for="plugin in results" :key="plugin.id" class="result-card">
        <div class="result-image-container">
          <img
            :src="plugin.thumbnail"
            :alt="plugin.title"
            class="result-image"
            @error="handleImageError"
          />
        </div>
        <div class="result-content">
          <h3 class="result-title">{{ plugin.title }}</h3>
          <p class="result-author">by {{ plugin.author }}</p>
          <p class="result-description">
            {{ truncateDescription(plugin.description, 120) }}
          </p>
          <div class="result-meta">
            <span class="result-downloads">
              📥 {{ formatNumber(plugin.downloads) }} downloads
            </span>
            <span class="result-updated">
              🕒 {{ plugin.updated }}
            </span>
          </div>
          <div class="result-tags">
            <span v-for="tag in plugin.tags.slice(0, 3)" :key="tag" class="tag">
              {{ tag }}
            </span>
            <span v-if="plugin.tags.length > 3" class="tag more">
              +{{ plugin.tags.length - 3 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && searchTerm && results.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>No plugins found</h3>
      <p>Try searching with different keywords or check your spelling</p>
      <div class="search-suggestions">
        <p>Popular searches:</p>
        <div class="suggestion-chips">
          <button
            v-for="suggestion in searchSuggestions"
            :key="suggestion"
            @click="searchTerm = suggestion"
            class="suggestion-chip"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>
    </div>

    <!-- Initial State -->
    <div v-else-if="!searchTerm && !loading" class="initial-state">
      <div class="initial-icon">🔎</div>
      <h3>Start searching</h3>
      <p>Type in the search box above to find plugins</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePluginSearch } from '@/services/api/composables';

// Use the search composable with 500ms debounce
const { searchTerm, results, loading, error } = usePluginSearch(500);

// Search suggestions for empty state
const searchSuggestions = ref([
  'Combat',
  'Quest',
  'UI',
  'Economy',
  'RPG',
  'Server'
]);

// Helper function to truncate description
const truncateDescription = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Helper function to format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Handle broken images
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = 'https://via.placeholder.com/400x200?text=No+Image';
};
</script>

<style scoped>
.plugin-search-example {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.search-container {
  position: relative;
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 15px 20px;
  padding-right: 50px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
}

.search-spinner {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.search-info {
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
}

.error {
  background-color: #fee;
  color: #c00;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.result-card {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s;
  cursor: pointer;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.result-image-container {
  flex-shrink: 0;
  width: 120px;
  height: 90px;
  overflow: hidden;
  border-radius: 6px;
}

.result-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #333;
}

.result-author {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

.result-description {
  margin: 0 0 10px 0;
  color: #777;
  font-size: 14px;
  line-height: 1.5;
}

.result-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
  font-size: 13px;
  color: #888;
}

.result-downloads {
  display: flex;
  align-items: center;
  gap: 5px;
}

.result-updated {
  display: flex;
  align-items: center;
  gap: 5px;
}

.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag {
  background: #f0f0f0;
  color: #555;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.tag.more {
  background: #e0e0e0;
  color: #777;
}

.empty-state,
.initial-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon,
.initial-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3,
.initial-state h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #333;
}

.empty-state p,
.initial-state p {
  margin: 0 0 20px 0;
  color: #777;
}

.search-suggestions {
  margin-top: 30px;
}

.search-suggestions p {
  margin-bottom: 15px;
  font-size: 14px;
  color: #999;
}

.suggestion-chips {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}

.suggestion-chip {
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #555;
}

.suggestion-chip:hover {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

/* Responsive Design */
@media (max-width: 600px) {
  .result-card {
    flex-direction: column;
  }

  .result-image-container {
    width: 100%;
    height: 150px;
  }

  .result-meta {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
