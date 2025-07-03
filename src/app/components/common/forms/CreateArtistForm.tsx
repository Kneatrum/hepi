"use client";
import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "../../../styles/page.module.css";
import { Box, Card, CardContent, Typography } from "@mui/material";
import CustomField from "../CustomFields/CustomField";
import SubmitButton from "../CustomButtons/SubmitButton";
import { useSession } from "@/app/context/SessionContext";

interface ArtistFormData {
  name: string;
  biography: string;
  thumbnailUrl: string;
  countryId: string;
  tribeId: string;
}

export default function CreateArtistForm() {
  const { accessToken } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState<ArtistFormData>({
    name: "",
    biography: "",
    thumbnailUrl: "",
    countryId: "",
    tribeId: "",
  });

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleChange = (field: keyof ArtistFormData) => (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!formData.name || !formData.thumbnailUrl) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      const response = await fetch(
        "https://music-backend-production-99a.up.railway.app/api/v1/artists",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
          body: JSON.stringify(formData),
        }
      );
      console.log("response>>>",response)
      const data = await response.json();

      if (response.ok) {
        setSuccess("Artist successfully created!");
        setTimeout(() => {
          router.push("/admin");
        }, 1000);
      } else {
        setError(data.message || "Artist creation failed.");
      }
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
            label="Full Name"
            placeholder="John Doe"
            type="text"
            value={formData.name}
            onChange={handleChange("name")}
          />
          <CustomField
            label="Biography"
            placeholder="Short bio about the artist"
            type="text"
            value={formData.biography}
            onChange={handleChange("biography")}
          />
          <CustomField
            label="Thumbnail URL"
            placeholder="https://..."
            type="url"
            value={formData.thumbnailUrl}
            onChange={handleChange("thumbnailUrl")}
          />
          <CustomField
            label="Country ID"
            placeholder="Country ID (e.g., 1)"
            type="text"
            value={formData.countryId}
            onChange={handleChange("countryId")}
          />
          <CustomField
            label="Tribe ID"
            placeholder="Tribe ID (e.g., 3)"
            type="text"
            value={formData.tribeId}
            onChange={handleChange("tribeId")}
          />

          <SubmitButton label="Register Artist" onClick={handleSubmit} />

          {error && <Typography color="error" mt={2}>{error}</Typography>}
          {success && <Typography color="success.main" mt={2}>{success}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
}
