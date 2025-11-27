/**
 * Plugin Data Manager
 * Manages all plugin-related data operations with backend API preparation
 * Currently uses local JSON data but structured for easy backend integration
 */

import { ApiClient, apiClient } from "./apiClient";
import type {
  Plugin,
  PluginDetails,
  PluginQuery,
  PluginListResponse,
  PluginResponse,
  ApiError,
  FilterOptions,
  PluginStatistics,
  UserPluginData,
  BatchOperationResult,
  RequestState,
  PaginationMeta,
} from "./types";

import { SortBy, SortOrder, PluginStatus } from "./types";

// Import local JSON data (temporary until backend is ready)
import pluginsData from "../../assets/data/plugins.json";

/**
 * Plugin Data Manager class
 * Handles all plugin-related data operations
 */
export class PluginDataManager {
  private apiClient: ApiClient;
  private mockData: Plugin[] = [];
  private userDataCache: UserPluginData = {
    installed: [],
    favorites: [],
    ratings: {},
    downloads: [],
  };

  constructor(client?: ApiClient) {
    this.apiClient = client || apiClient;
    this.loadMockData();
  }

  /**
   * Load mock data from local JSON file
   */
  private loadMockData(): void {
    // Add IDs to the mock data for easier management
    this.mockData = pluginsData.map((plugin, index) => ({
      ...plugin,
      id: `plugin-${index + 1}`,
      status: PluginStatus.ACTIVE,
      createdAt: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      rating: 4 + Math.random(),
      ratingCount: Math.floor(Math.random() * 1000) + 10,
      version: `1.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 100)}`,
      verified: Math.random() > 0.3,
      size: Math.floor(Math.random() * 50000000) + 1000000, // 1MB to 50MB
    }));
  }

  /**
   * Parse relative time strings to dates
   */
  private parseRelativeTime(timeStr: string): Date {
    const now = new Date();
    const parts = timeStr.toLowerCase().split(" ");
    if (parts.length < 2) throw new Error("Invalid relative time string");

    const [amountStr, unit] = parts as [string, string];
    const amount = parseInt(amountStr, 10);

    switch (unit) {
      case "day":
      case "days":
        return new Date(now.getTime() - amount * 24 * 60 * 60 * 1000);
      case "week":
      case "weeks":
        return new Date(now.getTime() - amount * 7 * 24 * 60 * 60 * 1000);
      case "month":
      case "months":
        return new Date(now.getTime() - amount * 30 * 24 * 60 * 60 * 1000);
      default:
        return now;
    }
  }

  /**
   * Apply filters to plugin list
   */
  private applyFilters(plugins: Plugin[], query: PluginQuery): Plugin[] {
    let filtered = [...plugins];

    // Text search
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.author.toLowerCase().includes(searchLower) ||
          p.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      );
    }

    // Tag filter
    if (query.tags && query.tags.length > 0) {
      filtered = filtered.filter((p) =>
        query.tags!.some((tag) => p.tags.includes(tag)),
      );
    }

    // Type filter
    if (query.type) {
      filtered = filtered.filter((p) => p.type === query.type);
    }

    // Author filter
    if (query.author) {
      filtered = filtered.filter(
        (p) => p.author.toLowerCase() === query.author!.toLowerCase(),
      );
    }

    // Download range filter
    if (query.minDownloads !== undefined) {
      filtered = filtered.filter((p) => p.downloads >= query.minDownloads!);
    }
    if (query.maxDownloads !== undefined) {
      filtered = filtered.filter((p) => p.downloads <= query.maxDownloads!);
    }

    // Updated since filter
    if (query.updatedSince) {
      const sinceDate = new Date(query.updatedSince);
      filtered = filtered.filter((p) => {
        const updateDate = this.parseRelativeTime(p.updated);
        return updateDate >= sinceDate;
      });
    }

    // Status filter
    if (query.status) {
      filtered = filtered.filter((p) => p.status === query.status);
    }

    // Verified filter
    if (query.verified !== undefined) {
      filtered = filtered.filter((p) => p.verified === query.verified);
    }

    return filtered;
  }

  /**
   * Sort plugins
   */
  private sortPlugins(
    plugins: Plugin[],
    sortBy: SortBy,
    order: SortOrder,
  ): Plugin[] {
    const sorted = [...plugins];

    sorted.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case SortBy.DOWNLOADS:
          compareValue = a.downloads - b.downloads;
          break;
        case SortBy.UPDATED:
          const dateA = this.parseRelativeTime(a.updated).getTime();
          const dateB = this.parseRelativeTime(b.updated).getTime();
          compareValue = dateA - dateB;
          break;
        case SortBy.TITLE:
          compareValue = a.title.localeCompare(b.title);
          break;
        case SortBy.AUTHOR:
          compareValue = a.author.localeCompare(b.author);
          break;
        case SortBy.CREATED:
          const createdA = new Date(a.createdAt || 0).getTime();
          const createdB = new Date(b.createdAt || 0).getTime();
          compareValue = createdA - createdB;
          break;
      }

      return order === SortOrder.DESC ? -compareValue : compareValue;
    });

    return sorted;
  }

  /**
   * Apply pagination
   */
  private paginate<T>(
    items: T[],
    limit: number,
    offset: number,
  ): {
    items: T[];
    meta: PaginationMeta;
  } {
    const total = items.length;
    const paginatedItems = items.slice(offset, offset + limit);
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return {
      items: paginatedItems,
      meta: {
        total,
        limit,
        offset,
        currentPage,
        totalPages,
        hasNext: offset + limit < total,
        hasPrev: offset > 0,
      },
    };
  }

  /**
   * Fetch plugins with query parameters
   * This is the main method for getting plugin lists
   */
  async getPlugins(query: PluginQuery = {}): Promise<PluginListResponse> {
    // Set defaults
    const finalQuery: PluginQuery = {
      sortBy: SortBy.DOWNLOADS,
      order: SortOrder.DESC,
      limit: 20,
      offset: 0,
      ...query,
    };

    // If using mock data
    if (this.apiClient["useMockData"]) {
      // Simulate async delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Apply filters
      let filtered = this.applyFilters(this.mockData, finalQuery);

      // Apply sorting
      filtered = this.sortPlugins(
        filtered,
        finalQuery.sortBy!,
        finalQuery.order!,
      );

      // Apply pagination
      const { items, meta } = this.paginate(
        filtered,
        finalQuery.limit!,
        finalQuery.offset!,
      );

      return {
        data: items,
        meta,
        timestamp: new Date().toISOString(),
      };
    }

    // When backend is ready, make actual API call
    return this.apiClient.get<PluginListResponse>("/plugins", finalQuery);
  }

  /**
   * Get single plugin by ID
   */
  async getPlugin(id: string): Promise<PluginResponse> {
    if (this.apiClient["useMockData"]) {
      await new Promise((resolve) => setTimeout(resolve, 50));

      const plugin = this.mockData.find((p) => p.id === id);
      if (!plugin) {
        throw {
          code: "PLUGIN_NOT_FOUND",
          message: `Plugin with ID ${id} not found`,
          timestamp: new Date().toISOString(),
        } as ApiError;
      }

      // Create extended details
      const details: PluginDetails = {
        ...plugin,
        changelog: `## Version ${plugin.version}\n- Bug fixes and improvements\n- Performance optimizations`,
        documentation: "https://docs.example.com/plugins/" + id,
        repository:
          "https://github.com/example/" +
          plugin.title.toLowerCase().replace(/\s+/g, "-"),
        license: "MIT",
        supportUrl: "https://support.example.com",
        screenshots: [plugin.thumbnail],
        requirements: {
          minVersion: "1.0.0",
          maxVersion: "2.0.0",
        },
        stats: {
          dailyDownloads: Math.floor(plugin.downloads / 365),
          weeklyDownloads: Math.floor(plugin.downloads / 52),
          monthlyDownloads: Math.floor(plugin.downloads / 12),
          installCount: Math.floor(plugin.downloads * 0.7),
        },
      };

      return {
        data: details,
        timestamp: new Date().toISOString(),
      };
    }

    return this.apiClient.get<PluginResponse>(`/plugins/${id}`);
  }

  /**
   * Search plugins with advanced options
   */
  async searchPlugins(
    searchTerm: string,
    options: Partial<PluginQuery> = {},
  ): Promise<PluginListResponse> {
    return this.getPlugins({
      search: searchTerm,
      ...options,
    });
  }

  /**
   * Get plugins by specific tag
   */
  async getPluginsByTag(
    tag: string,
    options: Partial<PluginQuery> = {},
  ): Promise<PluginListResponse> {
    return this.getPlugins({
      tags: [tag],
      ...options,
    });
  }

  /**
   * Get plugins by author
   */
  async getPluginsByAuthor(
    author: string,
    options: Partial<PluginQuery> = {},
  ): Promise<PluginListResponse> {
    return this.getPlugins({
      author,
      ...options,
    });
  }

  /**
   * Get trending plugins
   */
  async getTrendingPlugins(limit: number = 10): Promise<Plugin[]> {
    if (this.apiClient["useMockData"]) {
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Simulate trending by getting recently updated high-download plugins
      const sorted = [...this.mockData].sort((a, b) => {
        const scoreA =
          a.downloads /
          (this.parseRelativeTime(a.updated).getTime() / 1000000000);
        const scoreB =
          b.downloads /
          (this.parseRelativeTime(b.updated).getTime() / 1000000000);
        return scoreB - scoreA;
      });

      return sorted.slice(0, limit);
    }

    const response = await this.apiClient.get<PluginListResponse>(
      "/plugins/trending",
      { limit },
    );
    return response.data;
  }

  /**
   * Get featured plugins
   */
  async getFeaturedPlugins(limit: number = 10): Promise<Plugin[]> {
    if (this.apiClient["useMockData"]) {
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Simulate featured by getting top verified plugins
      const featured = this.mockData
        .filter((p) => p.verified)
        .sort((a, b) => b.downloads - a.downloads)
        .slice(0, limit);

      return featured;
    }

    const response = await this.apiClient.get<PluginListResponse>(
      "/plugins/featured",
      { limit },
    );
    return response.data;
  }

  /**
   * Get recently updated plugins
   */
  async getRecentlyUpdated(limit: number = 10): Promise<Plugin[]> {
    const response = await this.getPlugins({
      sortBy: SortBy.UPDATED,
      order: SortOrder.DESC,
      limit,
    });
    return response.data;
  }

  /**
   * Get filter options for UI
   */
  async getFilterOptions(): Promise<FilterOptions> {
    if (this.apiClient["useMockData"]) {
      await new Promise((resolve) => setTimeout(resolve, 50));

      const tags = new Set<string>();
      const types = new Set<string>();
      const authors = new Set<string>();

      this.mockData.forEach((plugin) => {
        plugin.tags.forEach((tag) => tags.add(tag));
        types.add(plugin.type);
        authors.add(plugin.author);
      });

      return {
        tags: Array.from(tags).sort(),
        types: Array.from(types).sort(),
        authors: Array.from(authors).sort(),
        downloadRanges: [
          { label: "Any", min: 0 },
          { label: "1K+", min: 1000 },
          { label: "10K+", min: 10000 },
          { label: "50K+", min: 50000 },
          { label: "100K+", min: 100000 },
        ],
      };
    }

    return this.apiClient.get<FilterOptions>("/plugins/filters");
  }

  /**
   * Get plugin statistics
   */
  async getStatistics(): Promise<PluginStatistics> {
    if (this.apiClient["useMockData"]) {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const tagCounts: Record<string, number> = {};
      let totalDownloads = 0;
      const authors = new Set<string>();

      this.mockData.forEach((plugin) => {
        totalDownloads += plugin.downloads;
        authors.add(plugin.author);
        plugin.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      const topTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalPlugins: this.mockData.length,
        totalDownloads,
        totalAuthors: authors.size,
        topTags,
        recentlyUpdated: await this.getRecentlyUpdated(5),
        trending: await this.getTrendingPlugins(5),
        featured: await this.getFeaturedPlugins(5),
      };
    }

    return this.apiClient.get<PluginStatistics>("/plugins/statistics");
  }

  /**
   * Download a plugin (backend integration)
   */
  async downloadPlugin(id: string): Promise<{ downloadUrl: string }> {
    if (this.apiClient["useMockData"]) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Update mock download count
      const plugin = this.mockData.find((p) => p.id === id);
      if (plugin) {
        plugin.downloads++;
      }

      // Track in user data
      this.userDataCache.downloads = this.userDataCache.downloads || [];
      this.userDataCache.downloads.push({
        pluginId: id,
        downloadedAt: new Date().toISOString(),
        version: plugin?.version || "1.0.0",
      });

      return {
        downloadUrl: `https://downloads.example.com/plugins/${id}`,
      };
    }

    return this.apiClient.post(`/plugins/${id}/download`);
  }

  /**
   * Install a plugin (track installation)
   */
  async installPlugin(id: string): Promise<void> {
    if (this.apiClient["useMockData"]) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      this.userDataCache.installed = this.userDataCache.installed || [];
      if (!this.userDataCache.installed.includes(id)) {
        this.userDataCache.installed.push(id);
      }
      return;
    }

    await this.apiClient.post(`/plugins/${id}/install`);
  }

  /**
   * Uninstall a plugin
   */
  async uninstallPlugin(id: string): Promise<void> {
    if (this.apiClient["useMockData"]) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      this.userDataCache.installed =
        this.userDataCache.installed?.filter((pid) => pid !== id) || [];
      return;
    }

    await this.apiClient.delete(`/plugins/${id}/install`);
  }

  /**
   * Add plugin to favorites
   */
  async addToFavorites(id: string): Promise<void> {
    if (this.apiClient["useMockData"]) {
      await new Promise((resolve) => setTimeout(resolve, 100));

      this.userDataCache.favorites = this.userDataCache.favorites || [];
      if (!this.userDataCache.favorites.includes(id)) {
        this.userDataCache.favorites.push(id);
      }
      return;
    }

    await this.apiClient.post(`/plugins/${id}/favorite`);
  }

  /**
   * Remove plugin from favorites
   */
  async removeFromFavorites(id: string): Promise<void> {
    if (this.apiClient["useMockData"]) {
      await new Promise((resolve) => setTimeout(resolve, 100));

      this.userDataCache.favorites =
        this.userDataCache.favorites?.filter((pid) => pid !== id) || [];
      return;
    }

    await this.apiClient.delete(`/plugins/${id}/favorite`);
  }

  /**
   * Rate a plugin
   */
  async ratePlugin(id: string, rating: number): Promise<void> {
    if (rating < 1 || rating > 5) {
      throw {
        code: "INVALID_RATING",
        message: "Rating must be between 1 and 5",
        timestamp: new Date().toISOString(),
      } as ApiError;
    }

    if (this.apiClient["useMockData"]) {
      await new Promise((resolve) => setTimeout(resolve, 150));

      this.userDataCache.ratings = this.userDataCache.ratings || {};
      this.userDataCache.ratings[id] = rating;

      // Update mock plugin rating
      const plugin = this.mockData.find((p) => p.id === id);
      if (plugin && plugin.rating && plugin.ratingCount) {
        const totalRating = plugin.rating * plugin.ratingCount;
        plugin.ratingCount++;
        plugin.rating = (totalRating + rating) / plugin.ratingCount;
      }
      return;
    }

    await this.apiClient.post(`/plugins/${id}/rate`, { rating });
  }

  /**
   * Get user's plugin data
   */
  async getUserPluginData(): Promise<UserPluginData> {
    if (this.apiClient["useMockData"]) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return this.userDataCache;
    }

    return this.apiClient.get<UserPluginData>("/user/plugins");
  }

  /**
   * Get user's installed plugins
   */
  async getInstalledPlugins(): Promise<Plugin[]> {
    const userData = await this.getUserPluginData();
    if (!userData.installed || userData.installed.length === 0) {
      return [];
    }

    if (this.apiClient["useMockData"]) {
      return this.mockData.filter((p) => userData.installed?.includes(p.id!));
    }

    const response = await this.apiClient.get<PluginListResponse>(
      "/user/plugins/installed",
    );
    return response.data;
  }

  /**
   * Get user's favorite plugins
   */
  async getFavoritePlugins(): Promise<Plugin[]> {
    const userData = await this.getUserPluginData();
    if (!userData.favorites || userData.favorites.length === 0) {
      return [];
    }

    if (this.apiClient["useMockData"]) {
      return this.mockData.filter((p) => userData.favorites?.includes(p.id!));
    }

    const response = await this.apiClient.get<PluginListResponse>(
      "/user/plugins/favorites",
    );
    return response.data;
  }

  /**
   * Batch install plugins
   */
  async batchInstallPlugins(
    ids: string[],
  ): Promise<BatchOperationResult<string>> {
    const results: BatchOperationResult<string> = {
      successful: [],
      failed: [],
      total: ids.length,
      successCount: 0,
      failureCount: 0,
    };

    for (const id of ids) {
      try {
        await this.installPlugin(id);
        results.successful.push(id);
        results.successCount++;
      } catch (error) {
        results.failed.push({
          item: id,
          error: error as ApiError,
        });
        results.failureCount++;
      }
    }

    return results;
  }

  /**
   * Check for plugin updates
   */
  async checkForUpdates(
    installedIds: string[],
  ): Promise<
    Array<{ id: string; hasUpdate: boolean; latestVersion?: string }>
  > {
    if (this.apiClient["useMockData"]) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      return installedIds.map((id) => ({
        id,
        hasUpdate: Math.random() > 0.7, // Randomly simulate some plugins having updates
        latestVersion: `1.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 100)}`,
      }));
    }

    return this.apiClient.post("/plugins/check-updates", { ids: installedIds });
  }

  /**
   * Get similar plugins
   */
  async getSimilarPlugins(id: string, limit: number = 5): Promise<Plugin[]> {
    if (this.apiClient["useMockData"]) {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const plugin = this.mockData.find((p) => p.id === id);
      if (!plugin) {
        return [];
      }

      // Find plugins with similar tags
      const similar = this.mockData
        .filter((p) => p.id !== id)
        .map((p) => ({
          plugin: p,
          score: p.tags.filter((tag) => plugin.tags.includes(tag)).length,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((item) => item.plugin);

      return similar;
    }

    const response = await this.apiClient.get<PluginListResponse>(
      `/plugins/${id}/similar`,
      { limit },
    );
    return response.data;
  }

  /**
   * Report a plugin
   */
  async reportPlugin(
    id: string,
    reason: string,
    details: string,
  ): Promise<void> {
    if (this.apiClient["useMockData"]) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      console.log(`Plugin ${id} reported: ${reason} - ${details}`);
      return;
    }

    await this.apiClient.post(`/plugins/${id}/report`, { reason, details });
  }

  /**
   * Get plugin dependencies
   */
  async getPluginDependencies(id: string): Promise<Plugin[]> {
    if (this.apiClient["useMockData"]) {
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Simulate some plugins having dependencies
      const numDeps = Math.floor(Math.random() * 3);
      const deps: Plugin[] = [];

      for (let i = 0; i < numDeps; i++) {
        const index = Math.floor(Math.random() * this.mockData.length);
        const randomPlugin = this.mockData[index];

        if (
          !randomPlugin || // guard undefined
          randomPlugin.id === id || // no self-deps
          deps.some((d) => d.id === randomPlugin.id) // no duplicates
        ) {
          continue;
        }

        deps.push(randomPlugin);
      }

      return deps;
    }

    // Real API call: this endpoint returns just Plugin[]
    const response = await this.apiClient.get<Plugin[]>(
      `/plugins/${id}/dependencies`,
    );
    return response;
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.apiClient.clearCache();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.apiClient.getCacheStats();
  }
}

// Export singleton instance
export const pluginDataManager = new PluginDataManager();

// Export for custom instances
export default PluginDataManager;
