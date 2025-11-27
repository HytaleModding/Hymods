/**
 * Base API Client with caching and mock data support
 * Provides a foundation for backend API integration
 */

import type { ApiConfig, ApiError, CacheConfig, CacheEntry } from "./types";

/**
 * Default API configuration
 */
const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: process.env.REACT_APP_API_URL || "http://localhost:3000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100,
    strategy: "lru",
  },
  retry: {
    attempts: 3,
    delay: 1000,
    backoff: true,
  },
};

/**
 * Simple in-memory cache implementation
 */
class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private accessOrder: string[] = [];
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  /**
   * Get cached data if valid
   */
  get<T>(key: string): T | null {
    if (!this.config.enabled) return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.delete(key);
      return null;
    }

    // Update access order for LRU
    if (this.config.strategy === "lru") {
      this.updateAccessOrder(key);
    }

    // Update hit count for LFU
    if (this.config.strategy === "lfu" && entry.hits !== undefined) {
      entry.hits++;
    }

    return entry.data as T;
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T, ttl?: number): void {
    if (!this.config.enabled) return;

    // Check cache size limit
    if (this.config.maxSize && this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
      hits: 1,
    };

    this.cache.set(key, entry);
    this.accessOrder.push(key);
  }

  /**
   * Delete cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Update access order for LRU strategy
   */
  private updateAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  /**
   * Evict cache based on strategy
   */
  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToEvict: string | undefined;

    switch (this.config.strategy) {
      case "lru":
        keyToEvict = this.accessOrder[0];
        break;
      case "fifo":
        keyToEvict = this.cache.keys().next().value;
        break;
      case "lfu":
        let minHits = Infinity;
        this.cache.forEach((entry, key) => {
          if (entry.hits !== undefined && entry.hits < minHits) {
            minHits = entry.hits;
            keyToEvict = key;
          }
        });
        break;
      default:
        keyToEvict = this.cache.keys().next().value;
    }

    if (keyToEvict) {
      this.delete(keyToEvict);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  } {
    let totalHits = 0;
    this.cache.forEach((entry) => {
      totalHits += entry.hits || 0;
    });

    return {
      size: this.cache.size,
      hits: totalHits,
      misses: 0, // Would need to track this separately
      hitRate: 0, // Would need to track hits vs misses
    };
  }
}

/**
 * Main API Client class
 */
export class ApiClient {
  private config: ApiConfig;
  private cache: CacheManager;
  private useMockData: boolean = true; // Flag for using local JSON data
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = new CacheManager(this.config.cache || DEFAULT_CONFIG.cache!);

    // Check if we should use mock data (no backend URL or development mode)
    this.useMockData =
      !this.config.baseUrl ||
      this.config.baseUrl.includes("localhost") ||
      process.env.REACT_APP_USE_MOCK_DATA === "true";
  }

  /**
   * Generate cache key from request parameters
   */
  private getCacheKey(url: string, params?: any): string {
    const paramStr = params ? JSON.stringify(params) : "";
    return `${url}:${paramStr}`;
  }

  /**
   * Sleep utility for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Perform HTTP request with retry logic
   */
  private async performRequest<T>(
    url: string,
    options: RequestInit = {},
    retryCount: number = 0,
  ): Promise<T> {
    const controller = new AbortController();
    const requestId = `${url}-${Date.now()}`;
    this.abortControllers.set(requestId, controller);

    try {
      const timeout = setTimeout(() => {
        controller.abort();
      }, this.config.timeout || 30000);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...this.config.headers,
          ...options.headers,
        },
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      const data = await response.json();
      return data as T;
    } catch (error: any) {
      // Handle retry logic
      if (this.config.retry && retryCount < this.config.retry.attempts) {
        const delay = this.config.retry.backoff
          ? this.config.retry.delay * Math.pow(2, retryCount)
          : this.config.retry.delay;

        await this.sleep(delay);
        return this.performRequest<T>(url, options, retryCount + 1);
      }

      throw this.normalizeError(error);
    } finally {
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * Handle error responses
   */
  private async handleErrorResponse(response: Response): Promise<ApiError> {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    return {
      code: `HTTP_${response.status}`,
      message:
        errorData.message || `Request failed with status ${response.status}`,
      details: errorData,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Normalize various error types to ApiError
   */
  private normalizeError(error: any): ApiError {
    if (error.name === "AbortError") {
      return {
        code: "REQUEST_ABORTED",
        message: "Request was aborted",
        timestamp: new Date().toISOString(),
      };
    }

    if (error.code && error.message) {
      return error as ApiError;
    }

    return {
      code: "UNKNOWN_ERROR",
      message: error.message || "An unknown error occurred",
      details: error,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.config.baseUrl);

    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => url.searchParams.append(key, String(v)));
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }

    return url.toString();
  }

  /**
   * GET request with caching
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    options: RequestInit = {},
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    const cacheKey = this.getCacheKey(url, params);

    // Check cache first
    const cachedData = this.cache.get<T>(cacheKey);
    if (cachedData !== null) {
      return cachedData;
    }

    // If using mock data, handle it separately
    if (this.useMockData) {
      return this.getMockData<T>(endpoint, params);
    }

    // Perform actual request
    const data = await this.performRequest<T>(url, {
      ...options,
      method: "GET",
    });

    // Cache the response
    this.cache.set(cacheKey, data);

    return data;
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: any,
    options: RequestInit = {},
  ): Promise<T> {
    if (this.useMockData) {
      return this.handleMockMutation<T>("POST", endpoint, body);
    }

    const url = this.buildUrl(endpoint);
    return this.performRequest<T>(url, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: any,
    options: RequestInit = {},
  ): Promise<T> {
    if (this.useMockData) {
      return this.handleMockMutation<T>("PUT", endpoint, body);
    }

    const url = this.buildUrl(endpoint);
    return this.performRequest<T>(url, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (this.useMockData) {
      return this.handleMockMutation<T>("DELETE", endpoint);
    }

    const url = this.buildUrl(endpoint);
    return this.performRequest<T>(url, {
      ...options,
      method: "DELETE",
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    body?: any,
    options: RequestInit = {},
  ): Promise<T> {
    if (this.useMockData) {
      return this.handleMockMutation<T>("PATCH", endpoint, body);
    }

    const url = this.buildUrl(endpoint);
    return this.performRequest<T>(url, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Get mock data (temporary implementation for local JSON)
   */
  private async getMockData<T>(
    endpoint: string,
    params?: Record<string, any>,
  ): Promise<T> {
    // This will be replaced with actual mock data handling in pluginDataManager.ts
    // For now, return a placeholder
    await this.sleep(100); // Simulate network delay
    return {} as T;
  }

  /**
   * Handle mock mutations (temporary implementation)
   */
  private async handleMockMutation<T>(
    method: string,
    endpoint: string,
    body?: any,
  ): Promise<T> {
    // This will be replaced with actual mock mutation handling in pluginDataManager.ts
    await this.sleep(200); // Simulate network delay
    return {} as T;
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void {
    this.abortControllers.forEach((controller) => {
      controller.abort();
    });
    this.abortControllers.clear();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.cache) {
      this.cache = new CacheManager(config.cache);
    }
  }

  /**
   * Toggle between mock and real API
   */
  setUseMockData(useMock: boolean): void {
    this.useMockData = useMock;
    this.clearCache(); // Clear cache when switching modes
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
