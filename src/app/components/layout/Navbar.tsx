"use client";
import styles from "../../styles/navbar.module.css";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppBar, Box, Toolbar, IconButton, Typography, Menu, Container, Button, MenuItem } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AlbumIcon from "@mui/icons-material/Album";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Link from "next/link"; 
import Image from "next/image";
import ColorToggleButton from '../common/ui/ColorToggleButton';
import { getUserRole } from "../../utils/authUtils";
import { useSession } from "@/app/context/SessionContext";

const pageObjects = [
  { name: "Library", icon: <VideoLibraryIcon sx={{ width: "20px", height: "20px" }} />, path: "/library" },
  { name: "Charts", icon: <ShowChartIcon sx={{ width: "20px", height: "20px" }} />, path: "/charts" },
  { name: "Albums", icon: <AlbumIcon sx={{ width: "20px", height: "20px" }} />, path: "/albums" },
  { name: "Favorites", icon: <FavoriteBorderIcon sx={{ width: "20px", height: "20px" }} />, path: "/favorites" },
  { name: "Trending", icon: <TrendingUpIcon sx={{ width: "20px", height: "20px" }} />, path: "/trending" },
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
                {pageObjects.map(({ name, path }) => (
                  <MenuItem key={name} onClick={handleCloseNavMenu}>
                    <Link href={path} className={pathname === path ? styles.navbarButtonActive : ""}>
                      <Typography>{name}</Typography>
                    </Link>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}
          

          {/* Desktop Navigation */}
          { isAuthenticated && (
             <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {pageObjects.map(({ name, icon, path }) => {
                const isActive = pathname === path;
                return (
                  <Link href={path} key={name} className={isActive ? styles.navbarButtonActive : ""}>
                    <Button onClick={handleCloseNavMenu} className={styles.navbarButton}>
                      <Box className={styles.navbarButtonBox}>
                        {React.cloneElement(icon, {
                          className: isActive ? styles.navbarIconsActive : styles.navbarIcons,
                        })}
                        <Typography className={isActive ? styles.pageLinkActive : styles.pageLink}>{name}</Typography>
                      </Box>
                    </Button>
                  </Link>
                );
              })}
            </Box>
 
          )}
         
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
