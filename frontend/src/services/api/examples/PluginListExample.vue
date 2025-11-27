<template>
  <div class="plugin-list-example">
    <h2>Plugin List</h2>

    <!-- Sort Controls -->
    <div class="controls">
      <select @change="updateQuery({ sortBy: $event.target.value })" :value="query.sortBy">
        <option value="downloads">Downloads</option>
        <option value="updated">Recently Updated</option>
        <option value="title">Title</option>
        <option value="author">Author</option>
        <option value="created">Created</option>
      </select>

      <button @click="toggleOrder" class="btn-secondary">
        Order: {{ query.order === 'asc' ? '↑' : '↓' }}
      </button>

      <button @click="refresh" class="btn-primary">
        Refresh
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      Loading plugins...
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error">
      Error: {{ error.message }}
    </div>

    <!-- Plugin List -->
    <div v-else>
      <div class="plugin-grid">
        <div v-for="plugin in plugins" :key="plugin.id" class="plugin-card">
          <img :src="plugin.thumbnail" :alt="plugin.title" class="plugin-image" />
          <div class="plugin-content">
            <h3>{{ plugin.title }}</h3>
            <p class="plugin-author">by {{ plugin.author }}</p>
            <p class="plugin-downloads">
              <strong>{{ plugin.downloads.toLocaleString() }}</strong> downloads
            </p>
            <p class="plugin-updated">Updated {{ plugin.updated }}</p>
            <p class="plugin-description">{{ plugin.description.substring(0, 150) }}...</p>
            <div class="plugin-tags">
              <span v-for="tag in plugin.tags" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
            <div v-if="plugin.verified" class="verified-badge">
              ✓ Verified
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="meta" class="pagination">
        <button @click="prevPage" :disabled="!meta.hasPrev" class="btn-pagination">
          ← Previous
        </button>
        <span class="pagination-info">
          Page {{ meta.currentPage }} of {{ meta.totalPages }}
          ({{ meta.total }} total plugins)
        </span>
        <button @click="nextPage" :disabled="!meta.hasNext" class="btn-pagination">
          Next →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlugins } from '@/services/api/composables';
import { SortBy, SortOrder } from '@/services/api/types';

const {
  plugins,
  loading,
  error,
  meta,
  query,
  updateQuery,
  nextPage,
  prevPage,
  refresh,
} = usePlugins({
  limit: 12,
  sortBy: SortBy.DOWNLOADS,
  order: SortOrder.DESC,
});

const toggleOrder = () => {
  updateQuery({
    order: query.value.order === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC,
  });
};
</script>

<style scoped>
.plugin-list-example {
  padding: 20px;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.controls select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 14px;
}

.btn-primary,
.btn-secondary {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary:hover {
  background: #f5f5f5;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  color: #dc3545;
  padding: 15px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-bottom: 20px;
}

.plugin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.plugin-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  background: white;
  position: relative;
}

.plugin-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.plugin-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.plugin-content {
  padding: 15px;
}

.plugin-content h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}

.plugin-author {
  color: #666;
  font-size: 14px;
  margin: 5px 0;
}

.plugin-downloads {
  color: #333;
  font-size: 14px;
  margin: 5px 0;
}

.plugin-updated {
  color: #999;
  font-size: 12px;
  margin: 5px 0;
}

.plugin-description {
  color: #666;
  font-size: 14px;
  line-height: 1.4;
  margin: 10px 0;
}

.plugin-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 10px;
}

.tag {
  background: #e9ecef;
  color: #495057;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 12px;
}

.verified-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #28a745;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
  padding: 20px 0;
}

.btn-pagination {
  padding: 10px 20px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.btn-pagination:hover:not(:disabled) {
  background: #f5f5f5;
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: #666;
  font-size: 14px;
}
</style>
