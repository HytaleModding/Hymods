/**
 * Plugin Data Types and Interfaces
 * Defines the structure for plugin data and API responses
 */

/**
 * Plugin type enumeration
 */
export enum PluginType {
  PLUGIN = 'plugin',
  MOD = 'mod',
  ADDON = 'addon',
  RESOURCE = 'resource',
  TOOL = 'tool'
}

/**
 * Plugin status enumeration for future backend integration
 */
export enum PluginStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  DEPRECATED = 'deprecated',
  ARCHIVED = 'archived'
}

/**
 * Sort options for plugin queries
 */
export enum SortBy {
  DOWNLOADS = 'downloads',
  UPDATED = 'updated',
  TITLE = 'title',
  AUTHOR = 'author',
  CREATED = 'created'
}

/**
 * Sort order direction
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * Core Plugin interface matching the data structure
 */
export interface Plugin {
  id?: string; // Optional ID for future backend integration
  type: string;
  title: string;
  author: string;
  downloads: number;
  updated: string;
  tags: string[];
  thumbnail: string;
  description: string;
  version?: string; // Future field
  status?: PluginStatus; // Future field
  createdAt?: string; // Future field
  rating?: number; // Future field
  ratingCount?: number; // Future field
  dependencies?: string[]; // Future field
  size?: number; // Future field in bytes
  verified?: boolean; // Future field
}

/**
 * Extended plugin details for single plugin view
 */
export interface PluginDetails extends Plugin {
  changelog?: string;
  documentation?: string;
  repository?: string;
  license?: string;
  supportUrl?: string;
  donateUrl?: string;
  screenshots?: string[];
  videos?: string[];
  requirements?: {
    minVersion?: string;
    maxVersion?: string;
    requiredMods?: string[];
    incompatibleMods?: string[];
  };
  stats?: {
    dailyDownloads?: number;
    weeklyDownloads?: number;
    monthlyDownloads?: number;
    installCount?: number;
    updateCount?: number;
  };
}

/**
 * Query parameters for fetching plugins
 */
export interface PluginQuery {
  search?: string;
  tags?: string[];
  type?: string;
  author?: string;
  sortBy?: SortBy;
  order?: SortOrder;
  limit?: number;
  offset?: number;
  minDownloads?: number;
  maxDownloads?: number;
  updatedSince?: string;
  status?: PluginStatus;
  verified?: boolean;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * API response wrapper for plugin lists
 */
export interface PluginListResponse {
  data: Plugin[];
  meta: PaginationMeta;
  timestamp: string;
}

/**
 * API response wrapper for single plugin
 */
export interface PluginResponse {
  data: PluginDetails;
  timestamp: string;
}

/**
 * Error response structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

/**
 * Cache configuration interface
 */
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size in items
  strategy?: 'lru' | 'fifo' | 'lfu'; // Cache eviction strategy
}

/**
 * API configuration interface
 */
export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
  cache?: CacheConfig;
  retry?: {
    attempts: number;
    delay: number;
    backoff?: boolean;
  };
}

/**
 * Filter options for UI components
 */
export interface FilterOptions {
  tags: string[];
  types: string[];
  authors: string[];
  downloadRanges: Array<{
    label: string;
    min: number;
    max?: number;
  }>;
}

/**
 * Statistics for dashboard/analytics
 */
export interface PluginStatistics {
  totalPlugins: number;
  totalDownloads: number;
  totalAuthors: number;
  topTags: Array<{ tag: string; count: number }>;
  recentlyUpdated: Plugin[];
  trending: Plugin[];
  featured: Plugin[];
}

/**
 * User interaction data (for future backend integration)
 */
export interface UserPluginData {
  installed?: string[]; // Plugin IDs
  favorites?: string[]; // Plugin IDs
  ratings?: Record<string, number>; // Plugin ID to rating
  downloads?: Array<{
    pluginId: string;
    downloadedAt: string;
    version: string;
  }>;
}

/**
 * Batch operation results
 */
export interface BatchOperationResult<T = any> {
  successful: T[];
  failed: Array<{
    item: T;
    error: ApiError;
  }>;
  total: number;
  successCount: number;
  failureCount: number;
}

/**
 * Cache entry interface
 */
export interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
  hits?: number;
}

/**
 * Request state for tracking API calls
 */
export interface RequestState<T = any> {
  loading: boolean;
  data: T | null;
  error: ApiError | null;
  timestamp: number | null;
}
