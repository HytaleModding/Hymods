<template>
  <div class="plugin-dashboard">
    <h2>Plugin Dashboard</h2>

    <!-- Refresh Button -->
    <div class="dashboard-header">
      <button @click="refreshAll" class="btn-primary">
        🔄 Refresh All Data
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="statsLoading || trendingLoading || featuredLoading" class="loading">
      <div class="spinner"></div>
      <p>Loading dashboard data...</p>
    </div>

    <!-- Error State -->
    <div v-if="statsError || trendingError || featuredError" class="error">
      <strong>Error loading dashboard:</strong>
      {{ statsError?.message || trendingError?.message || featuredError?.message }}
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- Overview Stats -->
      <div v-if="statistics" class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-value">{{ statistics.totalPlugins }}</div>
          <div class="stat-label">Total Plugins</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📥</div>
          <div class="stat-value">{{ formatNumber(statistics.totalDownloads) }}</div>
          <div class="stat-label">Total Downloads</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-value">{{ statistics.totalAuthors }}</div>
          <div class="stat-label">Total Authors</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏷️</div>
          <div class="stat-value">{{ statistics.topTags.length }}</div>
          <div class="stat-label">Active Tags</div>
        </div>
      </div>

      <!-- Top Tags Chart -->
      <div v-if="statistics?.topTags" class="section">
        <h3>🏷️ Popular Tags</h3>
        <div class="tags-chart">
          <div
            v-for="tagData in statistics.topTags.slice(0, 8)"
            :key="tagData.tag"
            class="tag-bar"
          >
            <div class="tag-name">{{ tagData.tag }}</div>
            <div class="tag-bar-container">
              <div
                class="tag-bar-fill"
                :style="{
                  width: `${(tagData.count / statistics.topTags[0].count) * 100}%`
                }"
              ></div>
              <span class="tag-count">{{ tagData.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- Trending Plugins -->
        <div class="section">
          <h3>🔥 Trending Plugins</h3>
          <div v-if="trendingPlugins.length > 0" class="plugin-list">
            <div
              v-for="(plugin, index) in trendingPlugins"
              :key="plugin.id"
              class="plugin-item"
            >
              <span class="plugin-rank">{{ index + 1 }}</span>
              <img
                :src="plugin.thumbnail"
                :alt="plugin.title"
                class="plugin-thumb"
                @error="handleImageError"
              />
              <div class="plugin-info">
                <div class="plugin-title">{{ plugin.title }}</div>
                <div class="plugin-meta">
                  by {{ plugin.author }} • {{ formatNumber(plugin.downloads) }} downloads
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-message">No trending plugins available</div>
        </div>

        <!-- Featured Plugins -->
        <div class="section">
          <h3>⭐ Featured Plugins</h3>
          <div v-if="featuredPlugins.length > 0" class="plugin-list">
            <div
              v-for="(plugin, index) in featuredPlugins"
              :key="plugin.id"
              class="plugin-item"
            >
              <span class="plugin-rank featured">★</span>
              <img
                :src="plugin.thumbnail"
                :alt="plugin.title"
                class="plugin-thumb"
                @error="handleImageError"
              />
              <div class="plugin-info">
                <div class="plugin-title">{{ plugin.title }}</div>
                <div class="plugin-meta">
                  {{ plugin.tags.slice(0, 2).join(', ') }}
                  <span v-if="plugin.verified" class="verified">✓</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-message">No featured plugins available</div>
        </div>

        <!-- Recently Updated -->
        <div class="section">
          <h3>🕒 Recently Updated</h3>
          <div v-if="statistics?.recentlyUpdated && statistics.recentlyUpdated.length > 0" class="plugin-list">
            <div
              v-for="plugin in statistics.recentlyUpdated"
              :key="plugin.id"
              class="plugin-item"
            >
              <span class="plugin-rank time">🕐</span>
              <img
                :src="plugin.thumbnail"
                :alt="plugin.title"
                class="plugin-thumb"
                @error="handleImageError"
              />
              <div class="plugin-info">
                <div class="plugin-title">{{ plugin.title }}</div>
                <div class="plugin-meta">
                  Updated {{ plugin.updated }}
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-message">No recent updates</div>
        </div>

        <!-- Download Leaders -->
        <div class="section">
          <h3>📈 Most Downloaded</h3>
          <div v-if="recentPlugins.length > 0" class="download-leaders">
            <div
              v-for="(plugin, index) in topDownloaded"
              :key="plugin.id"
              class="download-item"
            >
              <div class="download-rank">
                <span class="rank-number">{{ index + 1 }}</span>
              </div>
              <div class="download-info">
                <div class="download-title">{{ plugin.title }}</div>
                <div class="download-bar">
                  <div
                    class="download-fill"
                    :style="{
                      width: `${(plugin.downloads / topDownloaded[0].downloads) * 100}%`
                    }"
                  ></div>
                </div>
                <div class="download-count">
                  {{ formatNumber(plugin.downloads) }} downloads
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-message">No download data available</div>
        </div>
      </div>

      <!-- Activity Timeline -->
      <div class="section activity-section">
        <h3>📊 Activity Overview</h3>
        <div class="activity-timeline">
          <div class="timeline-item">
            <div class="timeline-icon new">🆕</div>
            <div class="timeline-content">
              <strong>{{ newPluginsThisWeek }}</strong> new plugins added this week
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-icon update">🔄</div>
            <div class="timeline-content">
              <strong>{{ updatedThisWeek }}</strong> plugins updated this week
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-icon download">📥</div>
            <div class="timeline-content">
              Average of <strong>{{ averageDownloads }}</strong> downloads per plugin
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  usePluginStatistics,
  useTrendingPlugins,
  useFeaturedPlugins,
  useRecentlyUpdated,
} from '@/services/api/composables';

// Fetch dashboard data
const {
  statistics,
  loading: statsLoading,
  error: statsError,
  refresh: refreshStats,
} = usePluginStatistics();

const {
  plugins: trendingPlugins,
  loading: trendingLoading,
  error: trendingError,
} = useTrendingPlugins(5);

const {
  plugins: featuredPlugins,
  loading: featuredLoading,
  error: featuredError,
} = useFeaturedPlugins(5);

const {
  plugins: recentPlugins,
  refresh: refreshRecent,
} = useRecentlyUpdated(20);

// Computed properties
const topDownloaded = computed(() => {
  return [...recentPlugins.value]
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 5);
});

const newPluginsThisWeek = computed(() => {
  if (!statistics.value) return 0;
  // Simulated calculation
  return Math.floor(statistics.value.totalPlugins * 0.05);
});

const updatedThisWeek = computed(() => {
  if (!statistics.value?.recentlyUpdated) return 0;
  return statistics.value.recentlyUpdated.filter(p => {
    const updated = p.updated.toLowerCase();
    return updated.includes('day') || updated.includes('week');
  }).length;
});

const averageDownloads = computed(() => {
  if (!statistics.value) return '0';
  const avg = statistics.value.totalDownloads / statistics.value.totalPlugins;
  return formatNumber(Math.floor(avg));
});

// Helper functions
const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = 'https://via.placeholder.com/60x60?text=No+Image';
};

const refreshAll = async () => {
  await Promise.all([
    refreshStats(),
    refreshRecent(),
  ]);
};
</script>

<style scoped>
.plugin-dashboard {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.btn-primary {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #0056b3;
}

.loading {
  text-align: center;
  padding: 60px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  background: #fee;
  color: #c00;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  margin-bottom: 20px;
}

.section h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
}

.tags-chart {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tag-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tag-name {
  min-width: 100px;
  font-size: 14px;
  color: #666;
}

.tag-bar-container {
  flex: 1;
  background: #f0f0f0;
  border-radius: 10px;
  height: 24px;
  position: relative;
  overflow: hidden;
}

.tag-bar-fill {
  background: linear-gradient(90deg, #667eea, #764ba2);
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s;
}

.tag-count {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  font-weight: bold;
  color: #333;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.plugin-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.plugin-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: background 0.2s;
}

.plugin-item:hover {
  background: #e9ecef;
}

.plugin-rank {
  width: 28px;
  height: 28px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
}

.plugin-rank.featured {
  background: gold;
  color: #333;
}

.plugin-rank.time {
  background: #6c757d;
}

.plugin-thumb {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
}

.plugin-info {
  flex: 1;
  min-width: 0;
}

.plugin-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plugin-meta {
  font-size: 12px;
  color: #666;
}

.verified {
  color: #28a745;
  margin-left: 5px;
}

.download-leaders {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.download-item {
  display: flex;
  gap: 15px;
  align-items: center;
}

.download-rank {
  width: 32px;
  height: 32px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-number {
  font-weight: bold;
  color: #666;
}

.download-info {
  flex: 1;
}

.download-title {
  font-weight: 500;
  margin-bottom: 5px;
}

.download-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 5px;
}

.download-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  border-radius: 4px;
}

.download-count {
  font-size: 12px;
  color: #666;
}

.activity-section {
  margin-top: 30px;
}

.activity-timeline {
  display: flex;
  gap: 30px;
  justify-content: space-around;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.timeline-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.timeline-icon.new {
  background: #e8f5e9;
}

.timeline-icon.update {
  background: #fff3e0;
}

.timeline-icon.download {
  background: #e3f2fd;
}

.timeline-content {
  color: #666;
  font-size: 14px;
}

.timeline-content strong {
  color: #333;
  font-weight: 600;
}

.empty-message {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: 1fr 1fr;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .activity-timeline {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
