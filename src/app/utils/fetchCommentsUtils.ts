// types/comment.types.ts
import { useState, useEffect, useCallback } from 'react';


export interface Country {
  createdAt: string;
  updatedAt: string | null;
  createdBy: string | null;
  lastModifiedBy: string | null;
  version: number;
  countryId: number;
  name: string;
  code: string;
  region: string;
}

export interface Tribe {
  tribeId: number;
  name: string;
  description: string;
}

export interface Artist {
  artistId: number;
  name: string;
  biography: string;
  thumbnailUrl: string;
  country: Country;
  tribe: Tribe;
}

export interface Genre {
  genreId: number;
  name: string;
  description: string;
  thumbnailUrl: string;
  popularityScore: number;
}

export interface Song {
  createdAt: string;
  updatedAt: string | null;
  createdBy: string | null;
  lastModifiedBy: string | null;
  version: number;
  songId: number;
  title: string;
  description: string;
  filePath: string;
  thumbnailPath: string;
  artist: Artist;
  genre: Genre;
  playCount: number;
  likeCount: number;
  shareCount: number;
  upvotes: number;
  downvotes: number;
}

export interface Role {
  roleCode: number;
  roleName: string;
  roleShortDesc: string;
  roleDescription: string;
  roleStatus: string;
  createDate: string;
  lastModified: string | null;
  createdBy: string | null;
  lastModifiedBy: string | null;
  permissions: string;
  version: number;
}

export interface Authority {
  authority: string;
}

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  userStatus: string;
  userPhoneNumber: string;
  userIdNumber: string | null;
  country: Country | null;
  role: Role;
  enabled: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
  accountNonExpired: boolean;
  username: string;
  authorities: Authority[];
}

export interface Comment {
  createdAt: string;
  updatedAt: string | null;
  createdBy: string | null;
  lastModifiedBy: string | null;
  version: number;
  id: number;
  song: Song;
  user: User;
  content: string;
}

export interface PageableResponse {
  content: Comment[];
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

// Indexed data structures for fast lookups
export interface CommentsByUser {
  userId: number;
  user: User;
  comments: Comment[];
  commentsBySong: Map<number, Comment[]>; // songId -> comments
}

export interface CommentsBySong {
  songId: number;
  song: Song;
  comments: Comment[];
  commentsByUser: Map<number, Comment[]>; // userId -> comments
}

export interface IndexedComments {
  userIndex: Map<number, CommentsByUser>; // userId -> user's comments
  songIndex: Map<number, CommentsBySong>; // songId -> song's comments
  allComments: Comment[];
}

// Configuration for pagination
export interface PaginationConfig {
  baseUrl: string;
  pageSize?: number;
  maxConcurrentRequests?: number;
  requestHeaders?: HeadersInit;
}

// Utility functions for data indexing
export class CommentIndexer {
  private userIndex = new Map<number, CommentsByUser>();
  private songIndex = new Map<number, CommentsBySong>();
  private allComments: Comment[] = [];

  addComments(comments: Comment[]): void {
    for (const comment of comments) {
      this.addComment(comment);
    }
  }

  private addComment(comment: Comment): void {
    this.allComments.push(comment);
    
    // Index by user
    const userId = comment.user.id;
    if (!this.userIndex.has(userId)) {
      this.userIndex.set(userId, {
        userId,
        user: comment.user,
        comments: [],
        commentsBySong: new Map()
      });
    }
    
    const userEntry = this.userIndex.get(userId)!;
    userEntry.comments.push(comment);
    
    // Add to user's songs map
    const songId = comment.song.songId;
    if (!userEntry.commentsBySong.has(songId)) {
      userEntry.commentsBySong.set(songId, []);
    }
    userEntry.commentsBySong.get(songId)!.push(comment);

    // Index by song
    if (!this.songIndex.has(songId)) {
      this.songIndex.set(songId, {
        songId,
        song: comment.song,
        comments: [],
        commentsByUser: new Map()
      });
    }
    
    const songEntry = this.songIndex.get(songId)!;
    songEntry.comments.push(comment);
    
    // Add to song's users map
    if (!songEntry.commentsByUser.has(userId)) {
      songEntry.commentsByUser.set(userId, []);
    }
    songEntry.commentsByUser.get(userId)!.push(comment);
  }

  getIndexedData(): IndexedComments {
    return {
      userIndex: this.userIndex,
      songIndex: this.songIndex,
      allComments: this.allComments
    };
  }

  // Fast lookup methods
  getCommentsByUser(userId: number): Comment[] {
    return this.userIndex.get(userId)?.comments || [];
  }

  getCommentsBySong(songId: number): Comment[] {
    return this.songIndex.get(songId)?.comments || [];
  }

  getUserCommentsOnSong(userId: number, songId: number): Comment[] {
    return this.userIndex.get(userId)?.commentsBySong.get(songId) || [];
  }

  getSongCommentsFromUser(songId: number, userId: number): Comment[] {
    return this.songIndex.get(songId)?.commentsByUser.get(userId) || [];
  }

  clear(): void {
    this.userIndex.clear();
    this.songIndex.clear();
    this.allComments = [];
  }
}

// Main pagination service
export class CommentPaginationService {
  private indexer = new CommentIndexer();
  private config: Required<PaginationConfig>;

  constructor(config: PaginationConfig) {
    this.config = {
      pageSize: 20,
      maxConcurrentRequests: 5,
      requestHeaders: {},
      ...config
    };
  }

  async fetchPage(page: number): Promise<PageableResponse> {
    const url = new URL(this.config.baseUrl);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('size', this.config.pageSize.toString());

    const response = await fetch(url.toString(), {
      headers: this.config.requestHeaders
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page ${page}: ${response.statusText}`);
    }

    return response.json();
  }

  async fetchAllPages(): Promise<IndexedComments> {
    this.indexer.clear();

    // Fetch first page to get total pages
    const firstPage = await this.fetchPage(0);
    this.indexer.addComments(firstPage.content);

    if (firstPage.totalPages <= 1) {
      return this.indexer.getIndexedData();
    }

    // Create array of remaining page numbers
    const remainingPages = Array.from(
      { length: firstPage.totalPages - 1 }, 
      (_, i) => i + 1
    );

    // Process pages in parallel batches
    const batchSize = this.config.maxConcurrentRequests;
    for (let i = 0; i < remainingPages.length; i += batchSize) {
      const batch = remainingPages.slice(i, i + batchSize);
      
      const batchPromises = batch.map(pageNum => 
        this.fetchPage(pageNum).catch(error => {
          console.error(`Error fetching page ${pageNum}:`, error);
          return null;
        })
      );

      const batchResults = await Promise.all(batchPromises);
      
      // Process successful responses
      batchResults.forEach(result => {
        if (result) {
          this.indexer.addComments(result.content);
        }
      });
    }

    return this.indexer.getIndexedData();
  }

  // Utility method for use in useEffect
  async fetchAllPagesWithCallback(
    onProgress?: (currentPage: number, totalPages: number) => void,
    onError?: (error: Error) => void
  ): Promise<IndexedComments> {
    try {
      this.indexer.clear();

      const firstPage = await this.fetchPage(0);
      this.indexer.addComments(firstPage.content);
      onProgress?.(1, firstPage.totalPages);

      if (firstPage.totalPages <= 1) {
        return this.indexer.getIndexedData();
      }

      const remainingPages = Array.from(
        { length: firstPage.totalPages - 1 }, 
        (_, i) => i + 1
      );

      const batchSize = this.config.maxConcurrentRequests;
      let processedPages = 1;

      for (let i = 0; i < remainingPages.length; i += batchSize) {
        const batch = remainingPages.slice(i, i + batchSize);
        
        const batchPromises = batch.map(pageNum => 
          this.fetchPage(pageNum).catch(error => {
            console.error(`Error fetching page ${pageNum}:`, error);
            return null;
          })
        );

        const batchResults = await Promise.all(batchPromises);
        
        batchResults.forEach(result => {
          if (result) {
            this.indexer.addComments(result.content);
            processedPages++;
            onProgress?.(processedPages, firstPage.totalPages);
          }
        });
      }

      return this.indexer.getIndexedData();
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  }

  getIndexer(): CommentIndexer {
    return this.indexer;
  }
}

// Hook for Next.js usage
export function useCommentPagination(config?: PaginationConfig) {
  const [service, setService] = useState<CommentPaginationService | null>(null);
  const [commentsData, setCommentsData] = useState<IndexedComments | null>(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<Error | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    if (config) {
      setService(new CommentPaginationService(config));
    }
  }, [config]);

  const fetchAllComments = useCallback(async () => {
    if (!service) return;

    setCommentsLoading(true);
    setCommentsError(null);
    setProgress({ current: 0, total: 0 });

    try {
      const result = await service.fetchAllPagesWithCallback(
        (current, total) => setProgress({ current, total }),
        (err) => setCommentsError(err)
      );
      setCommentsData(result);
    } catch (err) {
      setCommentsError(err as Error);
    } finally {
      setCommentsLoading(false);
    }
  }, [service]);


  return {
    commentsData,
    commentsLoading,
    commentsError,
    progress,
    fetchAllComments,
    service
  };
}

// Example usage helper functions
export const CommentUtils = {
  // Get all comments by a specific user
  getUserComments: (commentsData: IndexedComments, userId: number): Comment[] => {
    return commentsData.userIndex.get(userId)?.comments || [];
  },

  // Get all comments on a specific song
  getSongComments: (commentsData: IndexedComments, songId: number): Comment[] => {
    return commentsData.songIndex.get(songId)?.comments || [];
  },

  // Get comments by a specific user on a specific song
  getUserCommentsOnSong: (commentsData: IndexedComments, userId: number, songId: number): Comment[] => {
    return commentsData.userIndex.get(userId)?.commentsBySong.get(songId) || [];
  },

  // Get all users who commented on a specific song
  getSongCommenters: (commentsData: IndexedComments, songId: number): User[] => {
    const songData = commentsData.songIndex.get(songId);
    if (!songData) return [];
    
    const users: User[] = [];
    songData.commentsByUser.forEach((comments) => {
      if (comments.length > 0) {
        users.push(comments[0].user);
      }
    });
    return users;
  },

  // Get all songs a user has commented on
  getUserCommentedSongs: (commentsData: IndexedComments, userId: number): Song[] => {
    const userData = commentsData.userIndex.get(userId);
    if (!userData) return [];
    
    const songs: Song[] = [];
    userData.commentsBySong.forEach((comments) => {
      if (comments.length > 0) {
        songs.push(comments[0].song);
      }
    });
    return songs;
  },

  // Get comment statistics
  getStats: (commentsData: IndexedComments) => ({
    totalComments: commentsData.allComments.length,
    totalUsers: commentsData.userIndex.size,
    totalSongs: commentsData.songIndex.size,
    avgCommentsPerUser: commentsData.allComments.length / commentsData.userIndex.size,
    avgCommentsPerSong: commentsData.allComments.length / commentsData.songIndex.size
  })
};