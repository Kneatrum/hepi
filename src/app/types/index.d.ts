export type Country = {
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

export type Tribe = {
  tribeId: number;
  name: string;
  description: string;
};

export type Artist = {
  artistId: number;
  name: string;
  biography: string;
  thumbnailUrl: string;
  country: Country;
  tribe: Tribe;
};

export type Genre = {
  genreId: number;
  name: string;
  description: string;
  thumbnailUrl: string;
  popularityScore: number;
};

export type Song = {
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
};

export type Comment = {
  id: number;
  songId: number;
  userId: number;
  content: string | null;
  createdAt: string | null;
};
