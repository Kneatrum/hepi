// types.ts - Type definitions

import { Song } from '../types';


export interface ApiResponse {
  content: Song[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface ParsedSong {
  songId: number;
  title: string;
  description: string;
  filePath: string;
  thumbnailPath: string;
  artistId: number;
  artistName: string;
  artistBiography: string;
  artistThumbnailUrl: string;
  countryId: number;
  countryName: string;
  code: string;
  region: string;
  tribeId: number;
  tribeName: string;
  tribeDescription: string;
  genreId: number;
  genreName: string;
  genreDescription: string;
  genreThumbnailUrl: string;
  popularityScore: number;
  playCount: number;
  likeCount: number;
  shareCount: number;
  upvotes: number;
  downvotes: number;
}

export interface PaginationOptions {
  baseUrl: string;
  pageSize?: number;
  maxConcurrentRequests?: number;
  requestHeaders?: Record<string, string>;
  queryParams?: Record<string, string | number>;
}

export interface PaginationResult {
  data: ParsedSong[];
  totalPages: number;
  totalElements: number;
  error?: string;
}

// pagination.ts - Main pagination utility
export class PaginationError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'PaginationError';
  }
}

/**
 * Transforms raw API song data into the required flattened format
 */
export function parseSongData(songs: Song[]): ParsedSong[] {
  return songs.map(song => ({
    songId: song.songId,
    title: song.title,
    description: song.description,
    filePath: song.filePath,
    thumbnailPath: song.thumbnailPath,
    artistId: song.artist.artistId,
    artistName: song.artist.name,
    artistBiography: song.artist.biography,
    artistThumbnailUrl: song.artist.thumbnailUrl,
    countryId: song.artist.country.countryId,
    countryName: song.artist.country.name,
    code: song.artist.country.code,
    region: song.artist.country.region,
    tribeId: song.artist.tribe.tribeId,
    tribeName: song.artist.tribe.name,
    tribeDescription: song.artist.tribe.description,
    genreId: song.genre.genreId,
    genreName: song.genre.name,
    genreDescription: song.genre.description,
    genreThumbnailUrl: song.genre.thumbnailUrl,
    popularityScore: song.genre.popularityScore,
    playCount: song.playCount,
    likeCount: song.likeCount,
    shareCount: song.shareCount,
    upvotes: song.upvotes,
    downvotes: song.downvotes
  }));
}

/**
 * Fetches a single page of data
 */
async function fetchPage(
  url: string, 
  page: number, 
  options: PaginationOptions
): Promise<ApiResponse> {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: (options.pageSize || 20).toString(),
    ...Object.fromEntries(
      Object.entries(options.queryParams || {}).map(([key, value]) => [key, value.toString()])
    )
  });

  const fullUrl = `${url}?${queryParams.toString()}`;
  
  const response = await fetch(fullUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.requestHeaders
    }
  });

  if (!response.ok) {
    throw new PaginationError(
      `HTTP error! status: ${response.status}`, 
      response.status
    );
  }

  return response.json();
}

/**
 * Fetches all pages with automatic pagination and parallel requests
 * @param options - Configuration options for pagination
 * @returns Promise resolving to all parsed song data
 */
export async function fetchAllSongsParallel(
  options: PaginationOptions
): Promise<PaginationResult> {
  const { 
    baseUrl, 
    maxConcurrentRequests = 5,
    pageSize = 20 
  } = options;

  try {
    // Fetch first page to get total pages info
    const firstPage = await fetchPage(baseUrl, 0, options);
    const totalPages = firstPage.totalPages;
    const totalElements = firstPage.totalElements;

    if (totalPages === 0) {
      return {
        data: [],
        totalPages: 0,
        totalElements: 0
      };
    }

    // Parse first page data
    let allParsedData = parseSongData(firstPage.content);

    // If there's only one page, return early
    if (totalPages === 1) {
      return {
        data: allParsedData,
        totalPages,
        totalElements
      };
    }

    // Create array of remaining page numbers
    const remainingPages = Array.from(
      { length: totalPages - 1 }, 
      (_, i) => i + 1
    );

    // Process pages in chunks to limit concurrent requests
    const processChunk = async (pageNumbers: number[]): Promise<ParsedSong[]> => {
      const promises = pageNumbers.map(pageNum => 
        fetchPage(baseUrl, pageNum, options)
          .then(response => parseSongData(response.content))
          .catch(error => {
            console.error(`Error fetching page ${pageNum}:`, error);
            throw error;
          })
      );

      const results = await Promise.all(promises);
      return results.flat();
    };

    // Split remaining pages into chunks
    const chunks: number[][] = [];
    for (let i = 0; i < remainingPages.length; i += maxConcurrentRequests) {
      chunks.push(remainingPages.slice(i, i + maxConcurrentRequests));
    }

    // Process all chunks sequentially (but pages within each chunk in parallel)
    for (const chunk of chunks) {
      const chunkData = await processChunk(chunk);
      allParsedData = allParsedData.concat(chunkData);
    }

    return {
      data: allParsedData,
      totalPages,
      totalElements
    };

  } catch (error) {
    console.error('Pagination error:', error);
    return {
      data: [],
      totalPages: 0,
      totalElements: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * React hook-friendly function for use in useEffect
 * @param options - Configuration options for pagination
 * @param onSuccess - Callback when data is successfully fetched
 * @param onError - Callback when an error occurs
 * @returns Cancel function to abort ongoing requests
 */
export function usePaginatedData(
  options: PaginationOptions,
  onSuccess: (result: PaginationResult) => void,
  onError?: (error: string) => void
): () => void {
  let isCancelled = false;

  const execute = async () => {
    try {
      const result = await fetchAllSongsParallel(options);
      
      if (!isCancelled) {
        if (result.error && onError) {
          onError(result.error);
        } else {
          onSuccess(result);
        }
      }
    } catch (error) {
      if (!isCancelled && onError) {
        onError(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    }
  };

  execute();

  // Return cancel function
  return () => {
    isCancelled = true;
  };
}

// Example usage:
/*
import React, { useEffect, useState } from 'react';
import { fetchAllSongsParallel, usePaginatedData, ParsedSong, PaginationResult } from './pagination';

function SongsComponent() {
  const [songs, setSongs] = useState<ParsedSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Method 1: Direct function call
    const fetchData = async () => {
      setLoading(true);
      const result = await fetchAllSongsParallel({
        baseUrl: 'https://api.example.com/songs',
        pageSize: 20,
        maxConcurrentRequests: 5,
        requestHeaders: {
          'Authorization': 'Bearer your-token'
        },
        queryParams: {
          'sort': 'title'
        }
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSongs(result.data);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  // Method 2: Using the hook-friendly function
  useEffect(() => {
    const cancel = usePaginatedData(
      {
        baseUrl: 'https://api.example.com/songs',
        pageSize: 20,
        maxConcurrentRequests: 5,
        requestHeaders: {
          'Authorization': 'Bearer your-token'
        }
      },
      (result: PaginationResult) => {
        setSongs(result.data);
        setLoading(false);
      },
      (error: string) => {
        setError(error);
        setLoading(false);
      }
    );

    return cancel; // Cleanup function
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {songs.map(song => (
        <div key={song.songId}>
          <h3>{song.title}</h3>
          <p>Artist: {song.name}</p>
          <p>Genre: {song.genreName}</p>
          <p>Country: {song.countryName}</p>
        </div>
      ))}
    </div>
  );
}
*/