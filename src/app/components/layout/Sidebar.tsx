"use client";
import { List, ListItem, ListItemText, ListItemIcon } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import SecurityIcon from "@mui/icons-material/Security";
import Link from "next/link";
import { usePathname } from "next/navigation";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import AlbumIcon from "@mui/icons-material/Album";
import PersonIcon from "@mui/icons-material/Person";
import CategoryIcon from "@mui/icons-material/Category"; // Genre icon
import FlagIcon from '@mui/icons-material/Flag';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';

const links = [
  { text: "Dashboard", href: "/admin", icon: <DashboardIcon /> },
  { text: "Artists", href: "/admin/artists", icon: <PersonIcon /> },
  { text: "Country", href: "/admin/country", icon: <FlagIcon /> },
  { text: "Tribe", href: "/admin/tribe", icon: <PersonPinCircleIcon /> },
  { text: "Users", href: "/admin/users", icon: <GroupIcon /> },
  { text: "Songs", href: "/admin/songs", icon: <MusicNoteIcon /> },
  { text: "Albums", href: "/admin/albums", icon: <AlbumIcon /> },
  { text: "Library", href: "/admin/library", icon: <VideoLibraryIcon /> },
  { text: "Charts", href: "/admin/charts", icon: <TrendingUpIcon /> },
  { text: "Genre", href: "/admin/genre", icon: <CategoryIcon /> },
  { text: "Roles & Permissions", href: "/admin/roles", icon: <SecurityIcon /> },
];


export default function Sidebar() {
  const pathname = usePathname();
  return (
    <List
      className="adminColumn"
      sx={{
        width: 180,
        minWidth: 180,
        p: 1,
        // Hide on extra-small/small screens, display as block on medium and up.
        display: { xs: 'none', md: 'block' },
        overflowY: "auto",
        height: "calc(100vh - 140px)",
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
