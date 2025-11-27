# Plugin Data Manager

A comprehensive data management system for handling plugin/mod database operations with seamless backend integration support. Currently uses local JSON data as a temporary source while providing a complete API structure ready for backend integration.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [React Hooks](#react-hooks)
- [Configuration](#configuration)
- [Backend Integration](#backend-integration)
- [Examples](#examples)
- [Type Definitions](#type-definitions)

## Overview

The Plugin Data Manager is a standalone service layer that provides:

- **Complete API abstraction** for plugin data operations
- **Vue composables** for easy component integration
- **Caching system** for performance optimization
- **Mock data support** for development
- **Type-safe interfaces** with TypeScript
- **Backend-ready architecture** for seamless transition

## Features

### Core Features
- ✅ Full CRUD operations for plugins
- ✅ Advanced search and filtering
- ✅ Pagination support
- ✅ Sort and order capabilities
- ✅ User data management (favorites, installs, ratings)
- ✅ Statistics and analytics
- ✅ Batch operations
- ✅ Dependency management
- ✅ Update checking

### Performance Features
- ✅ Request caching with configurable TTL
- ✅ Request debouncing for search
- ✅ Request cancellation
- ✅ Lazy loading support
- ✅ Optimistic updates

### Developer Features
- ✅ TypeScript support
- ✅ Comprehensive error handling
- ✅ Mock data for development
- ✅ Easy backend switching
- ✅ Extensive documentation

## Installation

The Plugin Data Manager is already integrated into the project structure at `frontend/src/services/api/`.

### Import Methods

```typescript
// Import everything
import * as PluginAPI from '@/services/api';

// Import specific items
import { pluginDataManager, usePlugins } from '@/services/api';

// Import composables only
import { usePlugins, usePlugin } from '@/services/api/composables';

// Import types only
import type { Plugin, PluginQuery } from '@/services/api/types';
```

## Quick Start

### Basic Usage with Composables

```vue
<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else>
      <div v-for="plugin in plugins" :key="plugin.id">
        <h3>{{ plugin.title }}</h3>
        <p>{{ plugin.description }}</p>
      </div>
      <button @click="prevPage">Previous</button>
      <button @click="nextPage">Next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlugins } from '@/services/api';

const { plugins, loading, error, nextPage, prevPage } = usePlugins({
  limit: 20,
  sortBy: 'downloads',
  order: 'desc'
});
</script>
```

### Direct API Usage

```typescript
import { pluginDataManager } from '@/services/api';

async function fetchTrendingPlugins() {
  try {
    const plugins = await pluginDataManager.getTrendingPlugins(10);
    console.log('Trending plugins:', plugins);
  } catch (error) {
    console.error('Error fetching plugins:', error);
  }
}
```

## API Reference

### PluginDataManager Methods

#### Query Methods
```typescript
// Get plugins with filters
getPlugins(query?: PluginQuery): Promise<PluginListResponse>

// Get single plugin
getPlugin(id: string): Promise<PluginResponse>

// Search plugins
searchPlugins(searchTerm: string, options?: PluginQuery): Promise<PluginListResponse>

// Get plugins by tag
getPluginsByTag(tag: string, options?: PluginQuery): Promise<PluginListResponse>

// Get plugins by author
getPluginsByAuthor(author: string, options?: PluginQuery): Promise<PluginListResponse>
```

#### Special Lists
```typescript
// Get trending plugins
getTrendingPlugins(limit?: number): Promise<Plugin[]>

// Get featured plugins
getFeaturedPlugins(limit?: number): Promise<Plugin[]>

// Get recently updated
getRecentlyUpdated(limit?: number): Promise<Plugin[]>

// Get similar plugins
getSimilarPlugins(id: string, limit?: number): Promise<Plugin[]>
```

#### User Operations
```typescript
// Install/uninstall
installPlugin(id: string): Promise<void>
uninstallPlugin(id: string): Promise<void>

// Favorites
addToFavorites(id: string): Promise<void>
removeFromFavorites(id: string): Promise<void>

// Rating
ratePlugin(id: string, rating: number): Promise<void>

// Download
downloadPlugin(id: string): Promise<{ downloadUrl: string }>
```

#### Metadata
```typescript
// Get filter options
getFilterOptions(): Promise<FilterOptions>

// Get statistics
getStatistics(): Promise<PluginStatistics>

// Check updates
checkForUpdates(installedIds: string[]): Promise<UpdateInfo[]>

// Get dependencies
getPluginDependencies(id: string): Promise<Plugin[]>
```

## Vue Composables

### Core Composables

#### usePlugins
```typescript
const {
  plugins,        // Computed<Plugin[]> - Plugin array
  loading,        // Computed<boolean> - Loading state
  error,          // Computed<ApiError | null> - Error state
  meta,           // Computed<PaginationMeta | null> - Pagination metadata
  query,          // Computed<PluginQuery> - Current query
  updateQuery,    // Function - Update query function
  nextPage,       // Function - Go to next page
  prevPage,       // Function - Go to previous page
  refresh         // Function - Refresh data
} = usePlugins(initialQuery);
```

#### usePlugin
```typescript
const {
  plugin,         // Computed<PluginDetails | null> - Plugin details
  loading,        // Computed<boolean> - Loading state
  error,          // Computed<ApiError | null> - Error state
  refresh         // Function - Refresh data
} = usePlugin(pluginId); // Can be Ref<string> or string
```

#### usePluginSearch
```typescript
const {
  searchTerm,     // Ref<string> - Current search term (v-model compatible)
  results,        // Computed<Plugin[]> - Search results
  loading,        // Computed<boolean> - Loading state
  error           // Computed<ApiError | null> - Error state
} = usePluginSearch(debounceMs);
```

### User Data Composables

#### useUserPluginData
```typescript
const {
  installedPlugins,   // Computed<Plugin[]> - Installed plugins array
  favoritePlugins,    // Computed<Plugin[]> - Favorite plugins array
  isInstalled,        // Computed<(id: string) => boolean> - Check if installed
  isFavorite,         // Computed<(id: string) => boolean> - Check if favorite
  getRating,          // Computed<(id: string) => number> - Get user's rating
  installPlugin,      // Function - Install plugin
  uninstallPlugin,    // Function - Uninstall plugin
  toggleFavorite,     // Function - Toggle favorite
  ratePlugin,         // Function - Rate plugin
  refresh             // Function - Refresh user data
} = useUserPluginData();
```

### Utility Composables

```typescript
// Filter options
const { filterOptions, loading, error } = useFilterOptions();

// Statistics
const { statistics, loading, error, refresh } = usePluginStatistics();

// Trending plugins
const { plugins, loading, error } = useTrendingPlugins(limit);

// Featured plugins
const { plugins, loading, error } = useFeaturedPlugins(limit);

// Plugin updates
const { updates, hasUpdates, updateCount } = usePluginUpdates(installedIds);

// Download management
const { download, downloading, progress } = usePluginDownload();
```

## Configuration

### Environment Variables

```bash
# Backend API URL (when backend is ready)
REACT_APP_API_URL=https://api.example.com

# Force mock data usage
REACT_APP_USE_MOCK_DATA=true
```

### Programmatic Configuration

```typescript
import { apiClient } from '@/services/api';

// Update configuration
apiClient.updateConfig({
  baseUrl: 'https://api.example.com',
  timeout: 60000,
  cache: {
    enabled: true,
    ttl: 300000, // 5 minutes
    maxSize: 100,
    strategy: 'lru'
  },
  retry: {
    attempts: 3,
    delay: 1000,
    backoff: true
  }
});

// Toggle mock data
apiClient.setUseMockData(false); // Use real backend
apiClient.setUseMockData(true);  // Use mock data
```

## Backend Integration

The system is designed for easy backend integration. When your backend is ready:

### 1. Update Environment Variable

```bash
REACT_APP_API_URL=https://your-backend-api.com/api
REACT_APP_USE_MOCK_DATA=false
```

### 2. Expected Backend Endpoints

The backend should implement these endpoints:

```
GET    /api/plugins              # List plugins with query params
GET    /api/plugins/:id          # Get single plugin
GET    /api/plugins/trending     # Get trending plugins
GET    /api/plugins/featured     # Get featured plugins
GET    /api/plugins/filters      # Get filter options
GET    /api/plugins/statistics   # Get statistics
GET    /api/plugins/:id/similar  # Get similar plugins
GET    /api/plugins/:id/dependencies # Get dependencies

POST   /api/plugins/:id/install  # Install plugin
DELETE /api/plugins/:id/install  # Uninstall plugin
POST   /api/plugins/:id/favorite # Add to favorites
DELETE /api/plugins/:id/favorite # Remove from favorites
POST   /api/plugins/:id/rate     # Rate plugin
POST   /api/plugins/:id/download # Download plugin
POST   /api/plugins/:id/report   # Report plugin
POST   /api/plugins/check-updates # Check for updates

GET    /api/user/plugins         # Get user plugin data
GET    /api/user/plugins/installed # Get installed plugins
GET    /api/user/plugins/favorites # Get favorite plugins
```

### 3. Response Format

#### List Response
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "currentPage": 1,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Single Item Response
```json
{
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Error Response
```json
{
  "code": "ERROR_CODE",
  "message": "Error message",
  "details": { ... },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Examples

See `exampleUsage.tsx` for comprehensive examples including:

- Basic plugin list with pagination
- Search with debouncing
- Plugin details with actions
- Advanced filtering
- Dashboard with statistics
- User plugin management
- Direct API usage

## Type Definitions

### Core Types

```typescript
interface Plugin {
  id?: string;
  type: string;
  title: string;
  author: string;
  downloads: number;
  updated: string;
  tags: string[];
  thumbnail: string;
  description: string;
  version?: string;
  status?: PluginStatus;
  rating?: number;
  verified?: boolean;
}

interface PluginQuery {
  search?: string;
  tags?: string[];
  type?: string;
  author?: string;
  sortBy?: SortBy;
  order?: SortOrder;
  limit?: number;
  offset?: number;
  status?: PluginStatus;
}
```

See `types.ts` for complete type definitions.

## Best Practices

1. **Use composables in Vue components** - They handle reactive state and lifecycle automatically
2. **Enable caching** - Reduces unnecessary API calls
3. **Implement error handling** - Handle errors gracefully in your templates
4. **Use TypeScript** - Get full type safety and IntelliSense support with Vue 3 + TypeScript
5. **Batch operations** - Use batch methods for multiple operations
6. **Debounce search** - Prevent excessive API calls during typing (built into usePluginSearch)
7. **Leverage Vue's reactivity** - Composables return reactive/computed values that update automatically

## Troubleshooting

### Common Issues

**Q: Data not updating after actions?**
A: Call the `refresh()` function provided by hooks or clear the cache with `pluginDataManager.clearCache()`.

**Q: Mock data not working?**
A: Ensure `REACT_APP_USE_MOCK_DATA=true` is set or the API URL is not configured.

**Q: TypeScript errors?**
A: Make sure to import types from `@/services/api/types`.

**Q: Performance issues?**
A: Check cache configuration and enable it if disabled. Consider increasing TTL for stable data.

## Support

For issues or questions about the Plugin Data Manager, please refer to:
- The example usage file for implementation patterns
- Type definitions for API contracts
- This README for configuration and setup

## License

This is part of the HyMods frontend project.