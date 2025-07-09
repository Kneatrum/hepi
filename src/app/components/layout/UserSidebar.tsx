"use client";
import { List, ListItem, ListItemText, ListItemIcon } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import AlbumIcon from "@mui/icons-material/Album";
import PersonIcon from "@mui/icons-material/Person";
import CategoryIcon from "@mui/icons-material/Category"; // Genre icon
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import HomeIcon from '@mui/icons-material/Home';

const links = [
  { text: "Songs", href: "/", icon: <HomeIcon /> },
  { text: "Favourites", href: "/user/favourites", icon: <FavoriteIcon /> },
  { text: "Library", href: "/user/library", icon: <VideoLibraryIcon /> },
  { text: "Artists", href: "/user/artists", icon: <PersonIcon /> },
  { text: "Albums", href: "/user/albums", icon: <AlbumIcon /> },
  { text: "Genres", href: "/user/genres", icon: <CategoryIcon /> },
  { text: "Tribes", href: "/user/tribes", icon: <PersonPinCircleIcon /> },
];


export default function UserSidebar() {
  const pathname = usePathname();
  const isOnSongsPage = pathname === "/";
  const isOnFavsPage = pathname.startsWith("/user/favourites");

  return (

    <List
      className="adminColumn"
      sx={{
        width: 180,
        minWidth: 180,
        p: 1,
        display: { xs: 'none', md: 'block' },
        overflowY: "auto",
        height: isOnSongsPage || isOnFavsPage
          ? "calc(100dvh - 10rem)" : "calc(100dvh - 5.625rem)",
      }}
    >
      {links.map(({ text, href, icon }) => {
        const isActive = pathname === href;

        return (
         
          <Link key={text} href={href} passHref>
            <ListItem
              component="a"
              className={isActive ? "callToActionButton" : ""}
              sx={{
                bgcolor: isActive ? "yellow" : "transparent",
                borderRadius: 1,
                "&:hover": {
                  backgroundColor: isActive ? "yellow" : "#333",
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive ? "black" : "white" }}>
                {icon}
              </ListItemIcon>
              <ListItemText
                primary={text}
                sx={{ color: isActive ? "" : "white", fontWeight: isActive ? 600 : 400 }}
              />
            </ListItem>
          </Link>
          
        );
      })}
    </List>

  );
}
