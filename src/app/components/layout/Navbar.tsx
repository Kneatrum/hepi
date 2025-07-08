"use client";
import styles from "../../styles/navbar.module.css";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppBar, Box, Toolbar, IconButton, Typography, Menu, Container, Button, MenuItem } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import FlagIcon from "@mui/icons-material/Flag";
import PersonPinCircleIcon from "@mui/icons-material/PersonPinCircle";
import GroupIcon from "@mui/icons-material/Group";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import CategoryIcon from "@mui/icons-material/Category";
import SecurityIcon from "@mui/icons-material/Security";
import AlbumIcon from "@mui/icons-material/Album";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Link from "next/link"; 
import Image from "next/image";
import ColorToggleButton from '../common/ui/ColorToggleButton';
import { getUserRole } from "../../utils/authUtils";
import { useSession } from "@/app/context/SessionContext";

const adminPageObjects = [
  { text: "Dashboard", icon: <DashboardIcon sx={{ width: "20px", height: "20px" }} />, path: "/admin" },
  { text: "Artists", icon: <PersonIcon sx={{ width: "20px", height: "20px" }} />, path: "/admin/artists" },
  { text: "Country", icon: <FlagIcon sx={{ width: "20px", height: "20px" }} />, path: "/admin/country" },
  { text: "Tribe", icon: <PersonPinCircleIcon sx={{ width: "20px", height: "20px" }} />, path: "/admin/tribe" },
  { text: "Users", icon: <GroupIcon sx={{ width: "20px", height: "20px" }} />, path: "/admin/users" },
  { text: "Songs", icon: <MusicNoteIcon sx={{ width: "20px", height: "20px" }} />, path: "/admin/songs" },
  { text: "Albums", icon: <AlbumIcon sx={{ width: "20px", height: "20px" }} />, path: "/admin/albums" },
  { text: "Library", icon: <VideoLibraryIcon sx={{ width: "20px", height: "20px" }} />, path: "/admin/library" },
  { text: "Charts", icon: <TrendingUpIcon sx={{ width: "20px", height: "20px" }} />, path: "/admin/charts" },
  { text: "Genre", icon: <CategoryIcon sx={{ width: "20px", height: "20px" }} />, path: "/admin/genre" },
  { text: "Roles & Permissions", icon: <SecurityIcon sx={{ width: "20px", height: "20px" }} />, path: "/admin/roles" },
];

const ResponsiveAppBar = () => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [isAdmin, setIsAdmin] = useState(true);
  const [isUser, setIsUser] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { accessToken, clearTokens, isAuthenticated } = useSession();

  useEffect(() => {
    if (!accessToken) {
      setIsAdmin(false);
      setIsUser(false);
      return;
    }

    const role = getUserRole(accessToken);

    setIsAdmin(role === "SUPERADMIN");
    setIsUser(role === "USER");
  }, [accessToken]);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElNav(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);



  const handleLogout = () => {
    clearTokens();
    router.push("/login");
  };

  return (
    <AppBar className={styles.appBar}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Link href="/">
            <Image src="/images/hepi_logo.jpg" height={60} width={60} alt="hepi logo" />
          </Link>

          {/* Mobile Navigation */}
          {isAuthenticated&& (
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton size="large" onClick={handleOpenNavMenu} color="inherit">
                <MenuIcon />
              </IconButton>
              <Menu anchorEl={anchorElNav} open={Boolean(anchorElNav)} onClose={handleCloseNavMenu}>
                {adminPageObjects.map(({ text, path }) => (
                  <MenuItem key={text} onClick={handleCloseNavMenu}>
                    <Link href={path} className={pathname === path ? styles.navbarButtonActive : ""}>
                      <Typography>{text}</Typography>
                    </Link>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}
          

          {/* Desktop Navigation */}
          {/* { isAuthenticated && (
             <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {adminPageObjects.map(({ text, icon, path }) => {
                const isActive = pathname === path;
                return (
                  <Link href={path} key={text} className={isActive ? styles.navbarButtonActive : ""}>
                    <Button onClick={handleCloseNavMenu} className={styles.navbarButton}>
                      <Box className={styles.navbarButtonBox}>
                        {React.cloneElement(icon, {
                          className: isActive ? styles.navbarIconsActive : styles.navbarIcons,
                        })}
                        <Typography className={isActive ? styles.pageLinkActive : styles.pageLink}>{text}</Typography>
                      </Box>
                    </Button>
                  </Link>
                );
              })}
            </Box>
 
          )} */}
         
          {/* User Profile Menu or Login */}
          <Box sx={{ flexGrow: 0, ml: "auto", display: "flex", alignItems: "center" }}>
            {isAuthenticated ?  (
              <Box sx={{display:"flex", gap:"5px"}}>
                {isAdmin && <ColorToggleButton />}
                {isUser && ''}
                <Button className="callToActionButton" onClick={handleLogout}>Logout</Button>
                </Box>
            ) : (
              <Box sx={{display:"flex", gap:"5px"}}>
                <Link href="/login">
                  <Button className="callToActionButton">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button className="callToActionButton">Signup</Button>
                </Link>
              </Box>
            )}
          </Box>

        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default ResponsiveAppBar;
