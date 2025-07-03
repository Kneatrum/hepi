"use client";
import { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../../../styles/page.module.css";
import { Box, Card, CardContent, Typography } from "@mui/material";
import CustomField from "../CustomFields/CustomField";
import CustomAutocomplete from "../CustomFields/CustomAutocomplete";
import SubmitButton from "../CustomButtons/SubmitButton";
import { useSession } from "@/app/context/SessionContext";
import { Artist, Genre } from "@/app/types";

interface SongFormData {
  title: string;
  description: string;
  filePath: string;
  thumbnailPath: string;
  artistId: number; 
  genreId: number;
}

export default function AddSongsForm() {
  const { accessToken } = useSession();
  const router = useRouter();

  const [existingArtists, setExistingArtists] = useState<Artist[]>([]);
  const [existingGenres, setExistingGenres] = useState<Genre[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    async function fetchArtists() {
      try {
        const res = await fetch(
          "https://music-backend-production-99a.up.railway.app/api/v1/artists"
        );
        const data = await res.json();

        if (data?.content) {
          setExistingArtists(data.content);
          console.log("artists>>>", data.content);
        } else {
          setExistingArtists([]);
        }
       
      } catch (error) {
        console.error("Failed to fetch artists:", error);
      }
    }
  
    fetchArtists();
  }, []);

  useEffect(() => {
    async function fetchGenres() {
      try {
        const res = await fetch(
          "https://music-backend-production-99a.up.railway.app/api/v1/genres"
        );
        const data = await res.json();
        if (data) {
          setExistingGenres(data);
          console.log("genres>>>", data);
        }
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      }
    }
  
    fetchGenres();
  }, []);

  const [formData, setFormData] = useState<SongFormData>({
    title: "",
    description: "",
    filePath: "",
    thumbnailPath: "",
    artistId: 0,
    genreId: 0
  });

  const handleChange = (field: keyof SongFormData) => (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  // Handle artist selection
  const handleArtistChange = ( newValue: Artist | string | null) => {
    if (typeof newValue === 'string') {
      // User typed a custom value - you might want to handle this differently
      setSelectedArtist(null);
      setFormData({ ...formData, artistId: 0 });
    } else if (newValue) {
      // User selected an existing artist
      setSelectedArtist(newValue);
      setFormData({ ...formData, artistId: newValue.artistId });
    } else {
      // User cleared the selection
      setSelectedArtist(null);
      setFormData({ ...formData, artistId: 0 });
    }
  };

  // Handle genre selection
  const handleGenreChange = ( newValue: Genre | string | null) => {
    if (typeof newValue === 'string') {
      // User typed a custom value - you might want to handle this differently
      setSelectedGenre(null);
      setFormData({ ...formData, genreId: 0 });
    } else if (newValue) {
      // User selected an existing genre
      setSelectedGenre(newValue);
      setFormData({ ...formData, genreId: newValue.genreId });
    } else {
      // User cleared the selection
      setSelectedGenre(null);
      setFormData({ ...formData, genreId: 0 });
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!formData.title || !formData.filePath || !formData.artistId || !formData.genreId) {
      setError("Please fill all required fields including artist and genre.");
      return;
    }

    try {
      const response = await fetch(
        "https://music-backend-production-99a.up.railway.app/api/v1/songs", // Fixed endpoint
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
          body: JSON.stringify(formData),
        }
      );
      console.log("response>>>", response);
      const data = await response.json();

      if (response.ok) {
        setSuccess("Song successfully created!");
        setTimeout(() => {
          router.push("/admin/songs");
        }, 1000);
      } else {
        setError(data.message || "Song creation failed.");
      }
      // console.log("formData>>>", formData);
    } catch (err) {
      console.error("Error:", err);
      setError("Network error. Please try again.");
    }
  };

  return (
    <Card className={styles.authCard}>
      <CardContent className={styles.authCardContent}>
        <Box className={styles.authCardInputBox}>
          <CustomField
            label="Song Title"
            placeholder="Enter song title"
            type="text"
            value={formData.title}
            onChange={handleChange("title")}
          />
          <CustomField
            label="Description"
            placeholder="Short description of the song"
            type="text"
            value={formData.description}
            onChange={handleChange("description")}
          />
          <CustomField
            label="Song URL"
            placeholder="https://example.com/song.mp3"
            type="text"
            value={formData.filePath}
            onChange={handleChange("filePath")}
          />
          <CustomField
            label="Thumbnail URL"
            placeholder="https://..."
            type="url"
            value={formData.thumbnailPath}
            onChange={handleChange("thumbnailPath")}
          />
          
          {/* Artist Autocomplete */}
          <CustomAutocomplete
            label="Artist"
            placeholder="Select or type an artist"
            options={existingArtists}
            value={selectedArtist}
            onChange={handleArtistChange}
            getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
            freeSolo
          />

          {/* Genre Autocomplete */}
          <CustomAutocomplete
            label="Genre"
            placeholder="Select or type a genre"
            options={existingGenres}
            value={selectedGenre}
            onChange={handleGenreChange}
            getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
            freeSolo
          />

          <SubmitButton label="Create Song" onClick={handleSubmit} />

          {error && <Typography color="error" mt={2}>{error}</Typography>}
          {success && <Typography color="success.main" mt={2}>{success}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
}