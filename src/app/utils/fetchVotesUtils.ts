// types.ts - Define your types
export type VoteType = 'UPVOTE' | 'DOWNVOTE' | null;

export interface VotesState {
  [songId: number]: VoteType;
}

export interface Vote {
  id: number;
  voteType: VoteType;
  user: any; // You can define a proper User interface if needed
  song: {
    songId: number;
    [key: string]: any;
  };
}

export interface ApiResponse {
  responseCode: string;
  message: string;
  timestamp: string;
  requestId: string;
  data: {
    content: Vote[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: any;
      offset: number;
      paged: boolean;
      unpaged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: any;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
  };
}

export interface PaginationOptions {
  baseUrl: string;
  pageSize?: number;
  maxConcurrentRequests?: number;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
}

export interface PaginationResult {
  votesMap: VotesState;
  totalElements: number;
  totalPages: number;
}

/**
 * Fetches a single page of votes
 */
async function fetchVotesPage(
  url: string, 
  page: number, 
  options: PaginationOptions
): Promise<ApiResponse> {
  const searchParams = new URLSearchParams({
    page: page.toString(),
    size: (options.pageSize || 20).toString(),
    ...options.queryParams
  });

  const response = await fetch(`${url}?${searchParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page ${page}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Converts votes array to votes map
 */
function votesToMap(votes: Vote[]): VotesState {
  const votesMap: VotesState = {};
  
  votes.forEach(vote => {
    if (vote.song?.songId && vote.voteType) {
      votesMap[vote.song.songId] = vote.voteType;
    }
  });

  return votesMap;
}

/**
 * Fetches all pages in parallel batches and returns a consolidated votes map
 */
export async function fetchAllVotesPaginated(
  options: PaginationOptions
): Promise<PaginationResult> {
  const { baseUrl, maxConcurrentRequests = 5 } = options;

  try {
    // First, fetch the first page to get pagination info
    const firstPageResponse = await fetchVotesPage(baseUrl, 0, options);
    
    if (firstPageResponse.responseCode !== '200') {
      throw new Error(`API Error: ${firstPageResponse.message}`);
    }

    const { totalPages, totalElements } = firstPageResponse.data;
    
    // If there's only one page, return immediately
    if (totalPages <= 1) {
      return {
        votesMap: votesToMap(firstPageResponse.data.content),
        totalElements,
        totalPages
      };
    }

    // Create array of page numbers to fetch (excluding page 0 which we already have)
    const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 1);
    
    // Process pages in batches to avoid overwhelming the server
    const allVotes: Vote[] = [...firstPageResponse.data.content];
    
    for (let i = 0; i < remainingPages.length; i += maxConcurrentRequests) {
      const batch = remainingPages.slice(i, i + maxConcurrentRequests);
      
      const batchPromises = batch.map(pageNum => 
        fetchVotesPage(baseUrl, pageNum, options)
      );

      const batchResults = await Promise.all(batchPromises);
      
      // Collect all votes from this batch
      batchResults.forEach(response => {
        if (response.responseCode === '200') {
          allVotes.push(...response.data.content);
        }
      });
    }

    return {
      votesMap: votesToMap(allVotes),
      totalElements,
      totalPages
    };

  } catch (error) {
    console.error('Error fetching paginated votes:', error);
    throw error;
  }
}

/**
 * React hook-friendly wrapper for use in useEffect
 */
export async function fetchVotesForEffect(
  options: PaginationOptions,
  onSuccess?: (result: PaginationResult) => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    const result = await fetchAllVotesPaginated(options);
    onSuccess?.(result);
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error occurred');
    onError?.(err);
  }
}

/**
 * Utility function to merge votes maps (useful for incremental updates)
 */
export function mergeVotesMaps(existing: VotesState, incoming: VotesState): VotesState {
  return {
    ...existing,
    ...incoming
  };
}

/**
 * Utility function to get vote statistics from votes map
 */
export function getVoteStats(votesMap: VotesState): {
  upvotes: number;
  downvotes: number;
  total: number;
} {
  let upvotes = 0;
  let downvotes = 0;

  Object.values(votesMap).forEach(vote => {
    if (vote === 'UPVOTE') upvotes++;
    else if (vote === 'DOWNVOTE') downvotes++;
  });

  return {
    upvotes,
    downvotes,
    total: upvotes + downvotes
  };
}