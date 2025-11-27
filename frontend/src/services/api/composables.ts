/**
 * Vue Composables for Plugin Data Manager
 * Provides easy-to-use composables for Vue components to interact with plugin data
 */

import { ref, isRef, computed, watch, onMounted, onUnmounted } from "vue";
import type { Ref, ComputedRef } from "vue";
import { pluginDataManager } from "./pluginDataManager";
import type {
  Plugin,
  PluginDetails,
  PluginQuery,
  PluginListResponse,
  ApiError,
  FilterOptions,
  PluginStatistics,
  UserPluginData,
  RequestState,
  SortBy,
  SortOrder,
} from "./types";

/**
 * Composable for managing request state
 */
function useRequestState<T = any>() {
  const state = ref<RequestState<T>>({
    loading: false,
    data: null,
    error: null,
    timestamp: null,
  });

  const setLoading = (loading: boolean) => {
    state.value = { ...state.value, loading, error: null };
  };

  const setData = (data: T | null) => {
    state.value = {
      loading: false,
      data,
      error: null,
      timestamp: Date.now(),
    };
  };

  const setError = (error: ApiError | null) => {
    state.value = {
      ...state.value,
      loading: false,
      error,
    };
  };

  const reset = () => {
    state.value = {
      loading: false,
      data: null,
      error: null,
      timestamp: null,
    };
  };

  return {
    state: computed(() => state.value),
    loading: computed(() => state.value.loading),
    data: computed(() => state.value.data),
    error: computed(() => state.value.error),
    setLoading,
    setData,
    setError,
    reset,
  };
}

/**
 * Composable for fetching plugins with query parameters
 */
export function usePlugins(initialQuery: PluginQuery = {}) {
  const query = ref<PluginQuery>(initialQuery);
  const { loading, data, error, setLoading, setData, setError } =
    useRequestState<PluginListResponse>();
  const abortController = ref<AbortController | null>(null);

  const fetchPlugins = async (newQuery?: PluginQuery) => {
    // Cancel previous request if exists
    if (abortController.value) {
      abortController.value.abort();
    }

    const currentQuery = newQuery || query.value;
    setLoading(true);

    try {
      abortController.value = new AbortController();
      const response = await pluginDataManager.getPlugins(currentQuery);
      setData(response);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        setError(error as ApiError);
      }
    }
  };

  const updateQuery = (newQuery: Partial<PluginQuery>) => {
    const updatedQuery = { ...query.value, ...newQuery };
    query.value = updatedQuery;
    fetchPlugins(updatedQuery);
  };

  const nextPage = () => {
    if (data.value?.meta.hasNext) {
      updateQuery({
        offset: (data.value.meta.offset || 0) + (data.value.meta.limit || 20),
      });
    }
  };

  const prevPage = () => {
    if (data.value?.meta.hasPrev) {
      updateQuery({
        offset: Math.max(
          0,
          (data.value.meta.offset || 0) - (data.value.meta.limit || 20),
        ),
      });
    }
  };

  const refresh = () => {
    fetchPlugins();
  };

  // Initial fetch
  onMounted(() => {
    fetchPlugins();
  });

  // Cleanup on unmount
  onUnmounted(() => {
    if (abortController.value) {
      abortController.value.abort();
    }
  });

  return {
    // State
    loading,
    error,
    data,

    // Computed values
    plugins: computed(() => data.value?.data || []),
    meta: computed(() => data.value?.meta || null),
    query: computed(() => query.value),

    // Methods
    updateQuery,
    nextPage,
    prevPage,
    refresh,
  };
}

/**
 * Composable for fetching a single plugin
 */
export function usePlugin(idSource: Ref<string | null> | string | null) {
  const { loading, data, error, setLoading, setData, setError } =
    useRequestState<PluginDetails>();

  const fetchPlugin = async (id: string) => {
    setLoading(true);
    try {
      const response = await pluginDataManager.getPlugin(id);
      setData(response.data);
    } catch (err) {
      setError(err as ApiError);
    }
  };

  // Normalized current ID: always string | null
  const pluginId = computed<string | null>(() => {
    const raw = isRef(idSource) ? idSource.value : idSource;
    return typeof raw === "string" ? raw : null;
  });

  // Watch for ID changes
  watch(
    pluginId,
    (newId) => {
      if (newId) {
        fetchPlugin(newId);
      } else {
        setData(null);
      }
    },
    { immediate: true },
  );

  return {
    plugin: data,
    loading,
    error,
    refresh: () => {
      const currentId = pluginId.value;
      if (currentId) fetchPlugin(currentId);
    },
  };
}

/**
 * Composable for plugin search with debouncing
 */
export function usePluginSearch(debounceMs: number = 300) {
  const searchTerm = ref("");
  const debouncedTerm = ref("");
  const { loading, data, error, setLoading, setData, setError } =
    useRequestState<PluginListResponse>();
  const debounceTimer = ref<NodeJS.Timeout | null>(null);

  // Watch search term and debounce
  watch(searchTerm, (newTerm) => {
    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value);
    }

    debounceTimer.value = setTimeout(() => {
      debouncedTerm.value = newTerm;
    }, debounceMs);
  });

  // Perform search when debounced term changes
  watch(debouncedTerm, async (term) => {
    if (!term) {
      setData(null);
      return;
    }

    setLoading(true);
    try {
      const response = await pluginDataManager.searchPlugins(term);
      setData(response);
    } catch (err) {
      setError(err as ApiError);
    }
  });

  onUnmounted(() => {
    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value);
    }
  });

  return {
    searchTerm,
    results: computed(() => data.value?.data || []),
    loading,
    error,
    data,
  };
}

/**
 * Composable for managing user plugin data
 */
export function useUserPluginData() {
  const { loading, data, error, setLoading, setData, setError } =
    useRequestState<UserPluginData>();
  const installedPlugins = ref<Plugin[]>([]);
  const favoritePlugins = ref<Plugin[]>([]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const userData = await pluginDataManager.getUserPluginData();
      setData(userData);

      // Fetch installed and favorite plugins
      const [installed, favorites] = await Promise.all([
        pluginDataManager.getInstalledPlugins(),
        pluginDataManager.getFavoritePlugins(),
      ]);

      installedPlugins.value = installed;
      favoritePlugins.value = favorites;
    } catch (err) {
      setError(err as ApiError);
    }
  };

  const installPlugin = async (id: string) => {
    try {
      await pluginDataManager.installPlugin(id);
      await fetchUserData(); // Refresh data
      return true;
    } catch (error) {
      console.error("Failed to install plugin:", error);
      return false;
    }
  };

  const uninstallPlugin = async (id: string) => {
    try {
      await pluginDataManager.uninstallPlugin(id);
      await fetchUserData(); // Refresh data
      return true;
    } catch (error) {
      console.error("Failed to uninstall plugin:", error);
      return false;
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      const isFavorite = data.value?.favorites?.includes(id);
      if (isFavorite) {
        await pluginDataManager.removeFromFavorites(id);
      } else {
        await pluginDataManager.addToFavorites(id);
      }
      await fetchUserData(); // Refresh data
      return true;
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      return false;
    }
  };

  const ratePlugin = async (id: string, rating: number) => {
    try {
      await pluginDataManager.ratePlugin(id, rating);
      await fetchUserData(); // Refresh data
      return true;
    } catch (error) {
      console.error("Failed to rate plugin:", error);
      return false;
    }
  };

  onMounted(() => {
    fetchUserData();
  });

  return {
    // State
    loading,
    error,
    data,
    installedPlugins: computed(() => installedPlugins.value),
    favoritePlugins: computed(() => favoritePlugins.value),

    // Computed helpers
    isInstalled: computed(
      () => (id: string) => data.value?.installed?.includes(id) || false,
    ),
    isFavorite: computed(
      () => (id: string) => data.value?.favorites?.includes(id) || false,
    ),
    getRating: computed(() => (id: string) => data.value?.ratings?.[id] || 0),

    // Methods
    installPlugin,
    uninstallPlugin,
    toggleFavorite,
    ratePlugin,
    refresh: fetchUserData,
  };
}

/**
 * Composable for fetching filter options
 */
export function useFilterOptions() {
  const { loading, data, error, setLoading, setData, setError } =
    useRequestState<FilterOptions>();

  onMounted(async () => {
    setLoading(true);
    try {
      const options = await pluginDataManager.getFilterOptions();
      setData(options);
    } catch (err) {
      setError(err as ApiError);
    }
  });

  return {
    filterOptions: data,
    loading,
    error,
  };
}

/**
 * Composable for fetching plugin statistics
 */
export function usePluginStatistics() {
  const { loading, data, error, setLoading, setData, setError } =
    useRequestState<PluginStatistics>();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const stats = await pluginDataManager.getStatistics();
      setData(stats);
    } catch (err) {
      setError(err as ApiError);
    }
  };

  onMounted(() => {
    fetchStats();
  });

  return {
    statistics: data,
    loading,
    error,
    refresh: fetchStats,
  };
}

/**
 * Composable for trending plugins
 */
export function useTrendingPlugins(limit: number = 10) {
  const { loading, data, error, setLoading, setData, setError } =
    useRequestState<Plugin[]>();

  onMounted(async () => {
    setLoading(true);
    try {
      const plugins = await pluginDataManager.getTrendingPlugins(limit);
      setData(plugins);
    } catch (err) {
      setError(err as ApiError);
    }
  });

  return {
    plugins: computed(() => data.value || []),
    loading,
    error,
  };
}

/**
 * Composable for featured plugins
 */
export function useFeaturedPlugins(limit: number = 10) {
  const { loading, data, error, setLoading, setData, setError } =
    useRequestState<Plugin[]>();

  onMounted(async () => {
    setLoading(true);
    try {
      const plugins = await pluginDataManager.getFeaturedPlugins(limit);
      setData(plugins);
    } catch (err) {
      setError(err as ApiError);
    }
  });

  return {
    plugins: computed(() => data.value || []),
    loading,
    error,
  };
}

/**
 * Composable for similar plugins
 */
export function useSimilarPlugins(
  pluginIdSource: Ref<string | null> | string | null,
  limit: number = 5,
) {
  const { loading, data, error, setLoading, setData, setError } =
    useRequestState<Plugin[]>();

  const fetchSimilar = async (currentId: string) => {
    setLoading(true);
    try {
      const plugins = await pluginDataManager.getSimilarPlugins(
        currentId,
        limit,
      );
      setData(plugins);
    } catch (err) {
      setError(err as ApiError);
    }
  };

  // Normalize pluginId into a plain string | null
  const resolvedId = computed<string | null>(() => {
    const raw = isRef(pluginIdSource) ? pluginIdSource.value : pluginIdSource;
    return typeof raw === "string" ? raw : null;
  });

  // Watch for ID changes
  watch(
    resolvedId,
    (newId) => {
      if (newId) {
        fetchSimilar(newId);
      } else {
        setData([]);
      }
    },
    { immediate: true },
  );

  return {
    plugins: computed(() => data.value || []),
    loading,
    error,
  };
}

/**
 * Composable for plugin dependencies
 */
export function usePluginDependencies(
  pluginIdSource: Ref<string | null> | string | null,
) {
  const { loading, data, error, setLoading, setData, setError } =
    useRequestState<Plugin[]>();

  const fetchDependencies = async (currentId: string) => {
    setLoading(true);
    try {
      const dependencies =
        await pluginDataManager.getPluginDependencies(currentId);
      setData(dependencies);
    } catch (err) {
      setError(err as ApiError);
    }
  };

  // Normalize pluginId into plain string | null
  const resolvedId = computed<string | null>(() => {
    const raw = isRef(pluginIdSource) ? pluginIdSource.value : pluginIdSource;
    return typeof raw === "string" ? raw : null;
  });

  watch(
    resolvedId,
    (newId) => {
      if (newId) {
        fetchDependencies(newId);
      } else {
        setData([]);
      }
    },
    { immediate: true },
  );

  return {
    dependencies: computed(() => data.value || []),
    loading,
    error,
  };
}

/**
 * Composable for checking plugin updates
 */
export function usePluginUpdates(installedIds: Ref<string[]> | string[]) {
  const updates = ref<
    Array<{ id: string; hasUpdate: boolean; latestVersion?: string }>
  >([]);
  const checking = ref(false);
  const error = ref<ApiError | null>(null);

  // Normalize installedIds into a plain string[]
  const resolvedIds = computed<string[]>(() =>
    isRef(installedIds) ? installedIds.value : installedIds,
  );

  const checkUpdates = async () => {
    const currentIds = resolvedIds.value;

    if (currentIds.length === 0) {
      updates.value = [];
      return;
    }

    checking.value = true;
    error.value = null;

    try {
      const updateInfo = await pluginDataManager.checkForUpdates(currentIds);
      updates.value = updateInfo;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      checking.value = false;
    }
  };

  // Watch for changes in installed IDs
  watch(
    resolvedIds,
    () => {
      checkUpdates();
    },
    { immediate: true, deep: true },
  );

  const hasUpdates = computed(() => updates.value.some((u) => u.hasUpdate));
  const updateCount = computed(
    () => updates.value.filter((u) => u.hasUpdate).length,
  );

  return {
    updates: computed(() => updates.value),
    checking: computed(() => checking.value),
    error: computed(() => error.value),
    hasUpdates,
    updateCount,
    checkUpdates,
  };
}

/**
 * Composable for downloading a plugin
 */
export function usePluginDownload() {
  const downloading = ref(false);
  const progress = ref(0);
  const error = ref<ApiError | null>(null);

  const download = async (id: string): Promise<string | null> => {
    downloading.value = true;
    progress.value = 0;
    error.value = null;

    try {
      // Simulate progress updates (in real implementation, this would come from the backend)
      const progressInterval = setInterval(() => {
        progress.value = Math.min(progress.value + 10, 90);
      }, 100);

      const result = await pluginDataManager.downloadPlugin(id);

      clearInterval(progressInterval);
      progress.value = 100;

      setTimeout(() => {
        downloading.value = false;
        progress.value = 0;
      }, 500);

      return result.downloadUrl;
    } catch (err) {
      error.value = err as ApiError;
      downloading.value = false;
      progress.value = 0;
      return null;
    }
  };

  return {
    download,
    downloading: computed(() => downloading.value),
    progress: computed(() => progress.value),
    error: computed(() => error.value),
  };
}

/**
 * Composable for reporting a plugin
 */
export function useReportPlugin() {
  const reporting = ref(false);
  const success = ref(false);
  const error = ref<ApiError | null>(null);

  const report = async (id: string, reason: string, details: string) => {
    reporting.value = true;
    success.value = false;
    error.value = null;

    try {
      await pluginDataManager.reportPlugin(id, reason, details);
      success.value = true;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      reporting.value = false;
    }
  };

  const reset = () => {
    success.value = false;
    error.value = null;
  };

  return {
    report,
    reporting: computed(() => reporting.value),
    success: computed(() => success.value),
    error: computed(() => error.value),
    reset,
  };
}

/**
 * Composable for batch plugin operations
 */
export function useBatchOperations() {
  const processing = ref(false);
  const progress = ref(0);
  const error = ref<ApiError | null>(null);

  const batchInstall = async (ids: string[]) => {
    processing.value = true;
    progress.value = 0;
    error.value = null;

    try {
      const result = await pluginDataManager.batchInstallPlugins(ids);
      progress.value = 100;
      return result;
    } catch (err) {
      error.value = err as ApiError;
      return null;
    } finally {
      processing.value = false;
    }
  };

  return {
    batchInstall,
    processing: computed(() => processing.value),
    progress: computed(() => progress.value),
    error: computed(() => error.value),
  };
}

/**
 * Composable for recently updated plugins
 */
export function useRecentlyUpdated(limit: number = 10) {
  const { loading, data, error, setLoading, setData, setError } =
    useRequestState<Plugin[]>();

  const fetchRecentlyUpdated = async () => {
    setLoading(true);
    try {
      const plugins = await pluginDataManager.getRecentlyUpdated(limit);
      setData(plugins);
    } catch (err) {
      setError(err as ApiError);
    }
  };

  onMounted(() => {
    fetchRecentlyUpdated();
  });

  return {
    plugins: computed(() => data.value || []),
    loading,
    error,
    refresh: fetchRecentlyUpdated,
  };
}

/**
 * Composable for plugins by tag
 */
export function usePluginsByTag(
  tagSource: Ref<string> | string,
  options: Partial<PluginQuery> = {},
) {
  const { loading, data, error, setLoading, setData, setError } =
    useRequestState<PluginListResponse>();

  const fetchByTag = async (currentTag: string) => {
    setLoading(true);
    try {
      const response = await pluginDataManager.getPluginsByTag(
        currentTag,
        options,
      );
      setData(response);
    } catch (err) {
      setError(err as ApiError);
    }
  };

  // Normalize tag into a plain string
  const resolvedTag = computed<string>(() =>
    isRef(tagSource) ? tagSource.value : tagSource,
  );

  watch(
    resolvedTag,
    (newTag) => {
      if (newTag) {
        fetchByTag(newTag);
      }
    },
    { immediate: true },
  );

  return {
    plugins: computed(() => data.value?.data || []),
    meta: computed(() => data.value?.meta || null),
    loading,
    error,
  };
}

/**
 * Composable for plugins by author
 */
export function usePluginsByAuthor(
  authorSource: Ref<string> | string,
  options: Partial<PluginQuery> = {},
) {
  const { loading, data, error, setLoading, setData, setError } =
    useRequestState<PluginListResponse>();

  const fetchByAuthor = async (currentAuthor: string) => {
    setLoading(true);
    try {
      const response = await pluginDataManager.getPluginsByAuthor(
        currentAuthor,
        options,
      );
      setData(response);
    } catch (err) {
      setError(err as ApiError);
    }
  };

  // Normalize author to always be a plain string
  const resolvedAuthor = computed<string>(() =>
    isRef(authorSource) ? authorSource.value : authorSource,
  );

  watch(
    resolvedAuthor,
    (newAuthor) => {
      if (newAuthor) {
        fetchByAuthor(newAuthor);
      }
    },
    { immediate: true },
  );

  return {
    plugins: computed(() => data.value?.data || []),
    meta: computed(() => data.value?.meta || null),
    loading,
    error,
  };
}
