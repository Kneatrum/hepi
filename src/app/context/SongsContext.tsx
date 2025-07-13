"use client";

import { createContext, useContext, useEffect, useState, ReactNode,  } from "react";
import { ParsedSong,  } from "@/app/utils/fetchSongsUtils";
import { fetchAllSongsParallel } from "@/app/utils/fetchSongsUtils";
import { fetchAllVotesPaginated } from "@/app/utils/fetchVotesUtils";
import { PaginationOptions } from "@/app/utils/fetchVotesUtils"; // For votes
import { useCommentPagination, IndexedComments, PaginationConfig } from "../utils/fetchCommentsUtils";
import { fetchFavoriteSongsWithPagination } from '@/app/utils/fetchFavoriteSongsByUser';

import { getUserId } from "@/app/utils/authUtils";

import { VotesState } from "@/app/utils/fetchVotesUtils";
import { useSession } from "@/app/context/SessionContext";
import { useRouter } from "next/navigation";


interface SongsContextType {
  songs: ParsedSong[];
  // setSongs: (songs: ParsedSong[]) => void;
  songsLoading: boolean;
  // setLoading: (loading: boolean) => void;
  error: string | null;
  votes: VotesState;
  setVotes: React.Dispatch<React.SetStateAction<VotesState>>;
  commentsData: IndexedComments | null;
  favoriteSongs: ParsedSong[];
  // setFavoriteSongs: (songs: ParsedSong[]) => void;
  // loading: boolean;
  // commentsError: string | null;
  // setError: (error: string | null) => void;
  // searchQuery: string;
  // setSearchQuery: (query: string) => void;
  // filteredSongs: ParsedSong[];
}


const songsApiUrl = "https://music-backend-production-99a.up.railway.app/api/v1/songs";
const votesApiUrl = 'https://music-backend-production-99a.up.railway.app/api/v1/votes';
const commentsApiUrl = 'https://music-backend-production-99a.up.railway.app/api/v1/comments/getComments';
const favoritesApiUrl = 'https://music-backend-production-99a.up.railway.app/api/v1/favorites';


const SongsContext = createContext<SongsContextType | undefined>(undefined);

export const SongsProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated , accessToken } = useSession();
  const [ songs, setSongs ] = useState<ParsedSong[]>([]);
  const [ votes, setVotes ] = useState<VotesState>({});
  const [ songsLoading, setSongsLoading ] = useState<boolean>(true);
  const [ error, setError] = useState<string | null>(null);
  const [commentServiceConfig, setCommentServiceConfig] = useState<PaginationConfig | null>(null);
  const { commentsData, fetchAllComments } = useCommentPagination(commentServiceConfig ?? undefined);
  const [favoriteSongs, setFavoriteSongs] = useState<ParsedSong[]>([]);

  const router = useRouter();

  // First set the comments service configuration ( Requires Authentication )
  useEffect(() => {
    if (isAuthenticated) {
      setCommentServiceConfig({
        baseUrl: commentsApiUrl,
        pageSize: 20,
        maxConcurrentRequests: 5,
        requestHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }
  }, [isAuthenticated]);


 
  // Then use the comments service configuration to fetch all comments  ( Requires Authentication )
  useEffect(() => {
    if (commentServiceConfig) {
      fetchAllComments();
    }
  }, [commentServiceConfig, fetchAllComments]);


  
  // Fetch all votes ( Requires Authentication )
  useEffect(() => {
    const fetchVotes = async () => {
      
      if (!accessToken) {
        return;
      }

      const options: PaginationOptions = {
        baseUrl: votesApiUrl,
        pageSize: 20, // Adjust based on your API's optimal page size
        maxConcurrentRequests: 3, // Limit concurrent requests
        headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
        queryParams: {
          // Add any additional query parameters here
          // sortBy: 'createdAt',
          // order: 'desc'
        }
      };

    
      try {
        const result = await fetchAllVotesPaginated(options);
        setVotes(result.votesMap);
      } catch (err) {
        // setError(err instanceof Error ? err.message : 'Failed to fetch votes');
        console.error('Error fetching votes:', err);
      } finally {
        // setLoading(false);
      }
      
    };
  
    fetchVotes();
  }, [ accessToken, router]);
    


// Fetch all favorite songs by user ( Requires Authentication )
useEffect(() => {
  const abortController = new AbortController();

  if (!accessToken) {
    return;
  }

  const userID = getUserId(accessToken);

  const config = {
    baseUrl: `${favoritesApiUrl}/${userID}`,
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    queryParams: {
      sort: 'createdAt,desc' 
    },
    maxConcurrentRequests: 3,
    pageSize: 20
  };

  
  async function fetchData() {
    // setLoading(true);
    try {
 
      const songs = await fetchFavoriteSongsWithPagination(config, (current, total) => {
        // setProgress({ current, total });
        console.log(`Loaded page ${current} of ${total}`);
      });
      
      if (!abortController.signal.aborted) {
        console.log()
        setFavoriteSongs(songs);
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        setError(`Failed to fetch favorites: ${errorMessage}`);
      }
    } finally {
      if (!abortController.signal.aborted) {
        // setLoading(false);
      }
    }
  }
  
  fetchData();
  
  return () => abortController.abort();
}, [isAuthenticated, router]);



  useEffect(() => {
    async function fetchSongs() {
      try {
        const result = await fetchAllSongsParallel({
          baseUrl: songsApiUrl,
          pageSize: 20,
          maxConcurrentRequests: 5,
          queryParams: {
            'sort': 'title'
          }
        });

        if (result.error) {
          console.error("Error fetching songs:", result.error);
        } else {
          console.log(`Loaded ${result.data.length} songs`);
          setSongs(result.data);
          setSongsLoading(false);
        }

      } catch (error) {
        console.error("Failed to fetch songs:", error);
        setError("Something went wrong while fetching songs: " + error);
        setSongsLoading(false);
      } finally {
        setSongsLoading(false);
      }
    }
  
    fetchSongs();
  }, []);


  // if (commentsLoading) return <div>Loading... {progress.current}/{progress.total}</div>;
  // if (commentsError) return <div>Error: {commentsError.message}</div>;
  // if (!commentsData) return <div>No data</div>;

  // // Fast lookups
  // const userComments = CommentUtils.getUserComments(commentsData, 11);
  // const songComments = CommentUtils.getSongComments(commentsData, 39);
  // const userCommentsOnSong = CommentUtils.getUserCommentsOnSong(commentsData, 11, 39);

  // console.log("User comments: ", userComments);
  // console.log("Song comments: ", songComments);
  // console.log("User comments on song: ", userCommentsOnSong);


  return (
    <SongsContext.Provider
      value={{
        songs,
        songsLoading,
        error,
        votes,
        setVotes,
        commentsData,
        favoriteSongs
        // loading,
        // commentsError,
        // progress,
      }}
    >
      {children}
    </SongsContext.Provider>
  );
};

export const useSongsContext = () => {
  const context = useContext(SongsContext);
  if (!context) {
    throw new Error("useSongsContext must be used within a SongsProvider");
  }
  return context;
};
