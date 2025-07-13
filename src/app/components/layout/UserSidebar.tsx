"use client";
import React, { useState } from "react";
import { useSession } from "@/app/context/SessionContext";
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
import AuthDialog from "@/app/components/common/dialogs/AuthDialog";

const links = [
  { text: "Songs", href: "/", icon: <HomeIcon />, protected: false },
  { text: "Favourites", href: "/user/favourites", icon: <FavoriteIcon />, protected: true },
  { text: "Library", href: "/user/library", icon: <VideoLibraryIcon />, protected: true },
  { text: "Artists", href: "/user/artists", icon: <PersonIcon />, protected: false },
  { text: "Albums", href: "/user/albums", icon: <AlbumIcon />, protected: false },
  { text: "Genres", href: "/user/genres", icon: <CategoryIcon />, protected: false },
  { text: "Tribes", href: "/user/tribes", icon: <PersonPinCircleIcon />, protected: true },
];


export default function UserSidebar() {
  const pathname = usePathname();
  const isOnSongsPage = pathname === "/";
  const isOnFavsPage = pathname.startsWith("/user/favourites");
  const [ showAuthDialog, setShowAuthDialog ] = useState(false);
  const { isAuthenticated } = useSession();

  return (
    <>
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
      {links.map(({ text, href, icon, protected: isProtectedRoute }) => {
        const isActive = pathname === href;

        const handleClick = (e: React.MouseEvent) => {
          if (isProtectedRoute && !isAuthenticated) {
            e.preventDefault();
            setShowAuthDialog(true);
          }
        };

        return (
          <Link key={text} href={href} passHref onClick={handleClick}>
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
              <ListItemIcon sx={{ color: isActive ? "#F3B007" : "white" }}>
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

    <AuthDialog
      open={showAuthDialog} 
      onClose={() => setShowAuthDialog(false)}
    />
    </>
  );
}
