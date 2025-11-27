/**
 * Plugin Data Manager API Services
 * Central export point for all plugin-related data management functionality
 */

// Bring concrete instances into local scope for default export
import { ApiClient, apiClient } from "./apiClient";
import { PluginDataManager, pluginDataManager } from "./pluginDataManager";

// Export all types
export * from "./types";

// Export API client
export { ApiClient, apiClient } from "./apiClient";

// Export Plugin Data Manager
export { PluginDataManager, pluginDataManager } from "./pluginDataManager";

// Export all composables
export {
  // Core plugin composables
  usePlugins,
  usePlugin,
  usePluginSearch,

  // User data composables
  useUserPluginData,

  // Filter and metadata composables
  useFilterOptions,
  usePluginStatistics,

  // Special plugin lists
  useTrendingPlugins,
  useFeaturedPlugins,
  useRecentlyUpdated,
  useSimilarPlugins,

  // Plugin relationships
  usePluginDependencies,
  usePluginUpdates,

  // Plugin by criteria
  usePluginsByTag,
  usePluginsByAuthor,

  // Actions
  usePluginDownload,
  useReportPlugin,
  useBatchOperations,
} from "./composables";

// Default export for convenience
export default {
  pluginDataManager,
  apiClient,
};

/**
 * Usage Examples:
 *
 * 1. Import everything:
 *    import * as PluginAPI from '@/services/api';
 *
 * 2. Import specific items:
 *    import { pluginDataManager, usePlugins } from '@/services/api';
 *
 * 3. Import composables only:
 *    import { usePlugins, usePlugin } from '@/services/api/composables';
 *
 * 4. Import types only:
 *    import type { Plugin, PluginQuery } from '@/services/api';
 *
 * 5. Use in components:
 *    const { plugins, loading, error } = usePlugins({ limit: 20 });
 *
 * 6. Direct API calls:
 *    const trending = await pluginDataManager.getTrendingPlugins();
 */

/**
 * Configuration:
 *
 * The API client can be configured through environment variables:
 * - REACT_APP_API_URL: Backend API base URL (default: http://localhost:3000/api)
 * - REACT_APP_USE_MOCK_DATA: Force use of mock data (default: auto-detect)
 *
 * Or programmatically:
 *
 * import { apiClient } from '@/services/api';
 *
 * apiClient.updateConfig({
 *   baseUrl: 'https://api.example.com',
 *   timeout: 60000,
 *   cache: { enabled: true, ttl: 300000 }
 * });
 */

/**
 * Mock Data Mode:
 *
 * The system automatically uses mock data when:
 * 1. No backend URL is configured
 * 2. Backend URL is localhost
 * 3. REACT_APP_USE_MOCK_DATA is set to 'true'
 *
 * To switch modes programmatically:
 *
 * import { apiClient } from '@/services/api';
 * apiClient.setUseMockData(false); // Use real backend
 * apiClient.setUseMockData(true);  // Use mock data
 */
