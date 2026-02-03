/**
 * DATA PROCESSOR UTILITIES
 * Tối ưu hóa việc xử lý dữ liệu tour từ file JSON lớn
 */

import { Tour } from '../types';

/**
 * Validate cấu trúc tour data
 */
export const validateTourData = (tour: any): boolean => {
  if (!tour) return false;
  
  const requiredFields = [
    'title',
    'destination',
    'duration',
    'processed_itinerary'
  ];
  
  for (const field of requiredFields) {
    if (!tour[field]) {
      console.warn(`Missing required field: ${field} in tour:`, tour.title || 'Unknown');
      return false;
    }
  }
  
  return true;
};

/**
 * Chuẩn hóa dữ liệu tour để tương thích với schema hiện tại
 */
export const normalizeTourData = (rawTour: any): Tour => {
  return {
    url: rawTour.url || '',
    title: rawTour.title || 'Untitled Tour',
    tour_code: rawTour.tour_code || '',
    departure_location: rawTour.departure_location || '',
    destination: rawTour.destination || '',
    duration: rawTour.duration || '',
    price_text: rawTour.price_text || '',
    price_value: rawTour.price_value || 0,
    original_price: rawTour.original_price || '',
    rating_score: rawTour.rating_score || '',
    review_count: rawTour.review_count || '',
    view_count: rawTour.view_count || '',
    vehicles: rawTour.vehicles || [],
    processed_itinerary: rawTour.processed_itinerary || [],
    overall_summary: rawTour.overall_summary || {
      total_cost_vnd: 0,
      total_cost_usd: 0,
      total_places: 0,
      places_cost_vnd: 0,
      places_cost_usd: 0,
      transport_cost_vnd: 0,
      transport_cost_usd: 0
    },
    feasibility_score: rawTour.feasibility_score || 0
  };
};

/**
 * Lọc tours theo tiêu chí
 */
export const filterTours = (
  tours: any[],
  filters: {
    destination?: string;
    minDays?: number;
    maxDays?: number;
    maxPrice?: number;
    minRating?: number;
  }
): any[] => {
  return tours.filter(tour => {
    // Filter by destination
    if (filters.destination && !tour.destination?.toLowerCase().includes(filters.destination.toLowerCase())) {
      return false;
    }
    
    // Filter by duration
    if (filters.minDays || filters.maxDays) {
      const days = parseInt(tour.duration?.match(/(\d+)/)?.[0] || '0');
      if (filters.minDays && days < filters.minDays) return false;
      if (filters.maxDays && days > filters.maxDays) return false;
    }
    
    // Filter by price
    if (filters.maxPrice && tour.price_value > filters.maxPrice) {
      return false;
    }
    
    // Filter by rating
    if (filters.minRating) {
      const rating = parseFloat(tour.rating_score?.split('/')[0] || '0');
      if (rating < filters.minRating) return false;
    }
    
    return true;
  });
};

/**
 * Sắp xếp tours
 */
export const sortTours = (
  tours: any[],
  sortBy: 'price' | 'rating' | 'duration' | 'title' = 'rating',
  order: 'asc' | 'desc' = 'desc'
): any[] => {
  return [...tours].sort((a, b) => {
    let compareA: any, compareB: any;
    
    switch (sortBy) {
      case 'price':
        compareA = a.price_value || 0;
        compareB = b.price_value || 0;
        break;
      case 'rating':
        compareA = parseFloat(a.rating_score?.split('/')[0] || '0');
        compareB = parseFloat(b.rating_score?.split('/')[0] || '0');
        break;
      case 'duration':
        compareA = parseInt(a.duration?.match(/(\d+)/)?.[0] || '0');
        compareB = parseInt(b.duration?.match(/(\d+)/)?.[0] || '0');
        break;
      case 'title':
        compareA = a.title || '';
        compareB = b.title || '';
        break;
      default:
        return 0;
    }
    
    if (order === 'asc') {
      return compareA > compareB ? 1 : -1;
    } else {
      return compareA < compareB ? 1 : -1;
    }
  });
};

/**
 * Batch processor - Xử lý tours theo batch để tránh blocking UI
 */
export const processToursBatch = async <T>(
  tours: any[],
  processor: (tour: any) => Promise<T>,
  batchSize: number = 5,
  onProgress?: (current: number, total: number) => void
): Promise<T[]> => {
  const results: T[] = [];
  
  for (let i = 0; i < tours.length; i += batchSize) {
    const batch = tours.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
    
    if (onProgress) {
      onProgress(Math.min(i + batchSize, tours.length), tours.length);
    }
    
    // Delay giữa các batch để tránh rate limit
    if (i + batchSize < tours.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
};

/**
 * Extract unique destinations từ danh sách tours
 */
export const extractDestinations = (tours: any[]): string[] => {
  const destinations = new Set<string>();
  tours.forEach(tour => {
    if (tour.destination) {
      destinations.add(tour.destination);
    }
  });
  return Array.from(destinations).sort();
};

/**
 * Thống kê tổng quan về dữ liệu tours
 */
export const getTourStats = (tours: any[]) => {
  const stats = {
    total: tours.length,
    destinations: extractDestinations(tours),
    priceRange: {
      min: Math.min(...tours.map(t => t.price_value || Infinity)),
      max: Math.max(...tours.map(t => t.price_value || 0)),
      avg: tours.reduce((sum, t) => sum + (t.price_value || 0), 0) / tours.length
    },
    durationRange: {
      min: Math.min(...tours.map(t => parseInt(t.duration?.match(/(\d+)/)?.[0] || '999'))),
      max: Math.max(...tours.map(t => parseInt(t.duration?.match(/(\d+)/)?.[0] || '0')))
    },
    avgRating: tours.reduce((sum, t) => {
      const rating = parseFloat(t.rating_score?.split('/')[0] || '0');
      return sum + rating;
    }, 0) / tours.length,
    vehicleTypes: [...new Set(tours.flatMap(t => t.vehicles || []))],
    totalDays: tours.reduce((sum, t) => sum + (t.processed_itinerary?.length || 0), 0)
  };
  
  return stats;
};

/**
 * Lazy load tours - chỉ load khi cần
 */
export const createTourLoader = (tours: any[]) => {
  let loadedTours: any[] = [];
  let currentIndex = 0;
  const pageSize = 20;
  
  return {
    hasMore: () => currentIndex < tours.length,
    loadMore: (count: number = pageSize) => {
      const end = Math.min(currentIndex + count, tours.length);
      const newTours = tours.slice(currentIndex, end);
      loadedTours.push(...newTours);
      currentIndex = end;
      return newTours;
    },
    getLoaded: () => loadedTours,
    reset: () => {
      loadedTours = [];
      currentIndex = 0;
    },
    getTotalCount: () => tours.length,
    getLoadedCount: () => loadedTours.length
  };
};

/**
 * Cache wrapper cho việc xử lý tours
 */
export const createTourCache = <T>() => {
  const cache = new Map<string, T>();
  
  return {
    get: (key: string): T | undefined => cache.get(key),
    set: (key: string, value: T): void => {
      cache.set(key, value);
    },
    has: (key: string): boolean => cache.has(key),
    clear: (): void => cache.clear(),
    size: (): number => cache.size
  };
};

/**
 * Generate cache key cho tour
 */
export const getTourCacheKey = (tour: any): string => {
  return `${tour.tour_code || tour.title}-${tour.destination}`;
};

/**
 * Chunked file reader - đọc file JSON lớn theo chunks
 */
export const readJSONInChunks = async (
  file: File,
  chunkSize: number = 1024 * 1024, // 1MB
  onChunk?: (data: any[]) => void
): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    let allData: any[] = [];
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        
        if (Array.isArray(data)) {
          // Process in chunks
          for (let i = 0; i < data.length; i += 50) {
            const chunk = data.slice(i, i + 50);
            allData.push(...chunk);
            if (onChunk) {
              onChunk(chunk);
            }
          }
        } else {
          allData = [data];
        }
        
        resolve(allData);
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};
