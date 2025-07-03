import { Box, Typography } from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import styles from "../../../styles/page.module.css"; 
import { Song } from "@/app/types";



interface MusicListItemProps {
  id: string;
  song: Song;
  isPlaying: boolean;
  onPlay: (songId: string) => void;
}

const MusicListItem = ({ id, song, isPlaying, onPlay }: MusicListItemProps) => {
  return (
    <Box className={styles.musicCard}>
      <Link href={`/songs/${id}`} passHref>
        <Box sx={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Image
              src={song.avatar}
              alt={song.title}
              width={49}
              height={49}
              style={{ objectFit: "cover", borderRadius: "8px" }}
            />
            <Box>
              <Typography className={styles.songMusicTitle}>{song.title}</Typography>
              <Typography className={styles.songMusicArtist}>{song.artist}</Typography>
            </Box>
          </Box>
        </Box>
      </Link>
      <Box onClick={() => onPlay(song.id)} style={{ cursor: "pointer" }}>
        {isPlaying ? <PauseOutlinedIcon /> : <PlayArrowOutlinedIcon />}
      </Box>
    </Box>
  );
};

export default MusicListItem;
