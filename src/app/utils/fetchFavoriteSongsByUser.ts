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

// API Response interfaces
interface ApiResponse {
  timestamp: string;
  message: string;
  code: number;
  body: {
    content: ApiSong[];
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
  };
}

interface ApiSong {
  createdAt: string;
  updatedAt: string | null;
  createdBy: string | null;
  lastModifiedBy: string | null;
  version: number;
  id: number;
  user: string; // User object - not needed for parsing
  song: {
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    lastModifiedBy: string | null;
    version: number;
    songId: number;
    title: string;
    description: string;
    filePath: string;
    thumbnailPath: string;
    artist: {
      artistId: number;
      name: string;
      biography: string;
      thumbnailUrl: string;
      country: {
        createdAt: string;
        updatedAt: string | null;
        createdBy: string | null;
        lastModifiedBy: string | null;
        version: number;
        countryId: number;
        name: string;
        code: string;
        region: string;
      };
      tribe: {
        tribeId: number;
        name: string;
        description: string;
      };
    };
    genre: {
      genreId: number;
      name: string;
      description: string;
      thumbnailUrl: string;
      popularityScore: number;
    };
    playCount: number;
    likeCount: number;
    shareCount: number;
    upvotes: number;
    downvotes: number;
  };
}

type ApiResponseBody = ApiResponse['body'];

// Configuration interface
export interface PaginationConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string | number>;
  maxConcurrentRequests?: number;
  pageSize?: number;
}

// Error handling
export class PaginationError extends Error {
  constructor(message: string, public statusCode?: number, public response?: unknown) {
    super(message);
    this.name = 'PaginationError';
  }
}


/**
 * Fetches a single page of data
 */
async function fetchPage(
  config: PaginationConfig,
  pageNumber: number
): Promise<ApiResponseBody> {
  const url = new URL(config.baseUrl);
  
  // Add query parameters
  if (config.queryParams) {
  for (const [key, value] of Object.entries(config.queryParams)) {
    if (key === "sort" && typeof value === "string") {
      url.searchParams.append("sort", value); // expects: "createdAt,desc"
    } else {
      url.searchParams.append(key, value.toString());
    }
  }
}
  
  // Add pagination parameters
  url.searchParams.append('page', pageNumber.toString());
  if (config.pageSize) {
    url.searchParams.append('size', config.pageSize.toString());
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
  });

  console.log("URL ", url.toString())
  console.log("Headers: ", config.headers)


  if (!response.ok) {
    throw new PaginationError(
      `Failed to fetch page ${pageNumber}: ${response.statusText}`,
      response.status,
      await response.text()
    );
  }

  const data = await response.json();
//   console.log("#########################333333333333333333 Data: ", data.body)
//   console.log("#########################", data.code)


  if (data.code !== 200) {
    throw new PaginationError(
      `API returned error code ${data.code}: ${data.message}`,
      data.code,
      data
    );
  }

  return data.body;
}

/**
 * Parses API song data to ParsedSong format
 */
function parseApiSong(apiSong: ApiSong): ParsedSong {
  const { song } = apiSong;
  
  return {
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
    downvotes: song.downvotes,
  };
}

/**
 * Fetches all pages in parallel batches and returns parsed songs
 */
export async function fetchFavoriteSongsWithPagination(
  config: PaginationConfig,
  onProgress?: (current: number, total: number) => void
): Promise<ParsedSong[]> {
  const maxConcurrentRequests = config.maxConcurrentRequests || 5;
  
  try {
    // Fetch first page to get total page count
    const firstPageResponse = await fetchPage(config, 0);
    const totalPages = firstPageResponse.totalPages;
    
    if (totalPages === 0) {
      return [];
    }

    // If only one page, return the parsed results
    if (totalPages === 1) {
      onProgress?.(1, 1);
      return firstPageResponse.content.map(parseApiSong);
    }
    
    // Fetch remaining pages in parallel batches
    const allSongs: ParsedSong[] = [];
    
    // Add songs from first page
    allSongs.push(...firstPageResponse.content.map(parseApiSong));
    
    // Create array of remaining page numbers
    const remainingPages = Array.from(
      { length: totalPages - 1 }, 
      (_, i) => i + 1
    );
    
    // Process pages in batches
    for (let i = 0; i < remainingPages.length; i += maxConcurrentRequests) {
      const batch = remainingPages.slice(i, i + maxConcurrentRequests);
      
      // Fetch batch of pages in parallel
      const batchPromises = batch.map(pageNumber => 
        fetchPage(config, pageNumber)
      );
      
      const batchResults = await Promise.all(batchPromises);
      
      // Parse and add songs from batch
      for (const response of batchResults) {
        allSongs.push(...response.content.map(parseApiSong));
      }
      
      // Report progress
      const completedPages = Math.min(i + maxConcurrentRequests + 1, totalPages);
      onProgress?.(completedPages, totalPages);
    }
    
    return allSongs;
    
  } catch (error) {
    if (error instanceof PaginationError) {
      throw error;
    }
    throw new PaginationError(
      `Unexpected error during pagination: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      error
    );
  }
}

/**
 * Hook-friendly wrapper for use in useEffect
 */
export function createPaginationFetcher(config: PaginationConfig) {
  return {
    fetchAllSongs: (onProgress?: (current: number, total: number) => void) =>
      fetchFavoriteSongsWithPagination(config, onProgress),
    
    // Utility to create an AbortController for cancellation
    createAbortController: () => new AbortController(),
  };
}

/**
 * React hook example usage (for reference)
 */
// export function usePaginatedSongs(config: PaginationConfig) {
  // This is an example of how you might use this in a React component
  // You would typically implement this in your React component file
  
  /*
  const [songs, setSongs] = useState<ParsedSong[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    const abortController = new AbortController();
    
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      try {
        const fetcher = createPaginationFetcher(config);
        const allSongs = await fetcher.fetchAllSongs((current, total) => {
          setProgress({ current, total });
        });
        
        if (!abortController.signal.aborted) {
          setSongs(allSongs);
        }
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }
    
    fetchData();
    
    return () => {
      abortController.abort();
    };
  }, [config]);

  return { songs, loading, error, progress };
  */
// }