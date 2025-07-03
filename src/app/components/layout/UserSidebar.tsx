"use client";
import { List, ListItem, ListItemText, ListItemIcon, Box } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import AlbumIcon from "@mui/icons-material/Album";
import PersonIcon from "@mui/icons-material/Person";
import CategoryIcon from "@mui/icons-material/Category"; // Genre icon
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';

const links = [
  { text: "Favourites", href: "/user/favourites", icon: <FavoriteIcon /> },
  { text: "Library", href: "/user/library", icon: <VideoLibraryIcon /> },
  { text: "Artists", href: "/user/artists", icon: <PersonIcon /> },
  { text: "Albums", href: "/user/albums", icon: <AlbumIcon /> },
  { text: "Genres", href: "/user/genres", icon: <CategoryIcon /> },
  { text: "Tribes", href: "/user/tribes", icon: <PersonPinCircleIcon /> },
];


export default function UserSidebar() {
  const pathname = usePathname();
  return (

    <List
      className="adminColumn"
      sx={{
        width: 180,
        minWidth: 180,
        p: 1,
        display: { xs: 'none', md: 'block' },
      }}
    >
      {links.map(({ text, href, icon }, index) => {
        const isActive = pathname === href;

        return (
         
          <Link key={text} href={href} passHref>
            <ListItem
              component="a"
              className={isActive ? "callToActionButton" : ""}
              sx={{
                mt: index === 0 ? '90px' : 0,
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
