"use client"

import AdminDashboard from "@/app/components/layout/AdminDashboard";
import { Box, Typography ,Button} from "@mui/material";
import styles from "../../../../styles/page.module.css";
import CreateArtistForm from "@/app/components/common/forms/CreateArtistForm";
import { useRouter } from "next/navigation";
 
export default function Page() {
  const router = useRouter();

  const handleBackToArtistsClick = () => {
    router.push("/admin/artists");
  };

  return (
    <AdminDashboard>
        <Box sx={{display:"flex", flexDirection:"column", gap:"20px"}}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography className={styles.layerTopIntroTextInfo}>
                Create Artist Management
            </Typography>
            <Button 
              className="callToActionButton"
              onClick={handleBackToArtistsClick}
            >
              Create Artists
            </Button>
          </Box>
          
          <Box sx={{width:"50%"}}>
            <CreateArtistForm />
          </Box>
        </Box>
    </AdminDashboard>
  );
}
