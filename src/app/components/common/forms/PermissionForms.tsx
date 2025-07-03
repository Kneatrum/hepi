"use client";
import { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "../../../styles/page.module.css";
import { Box, Card, CardContent, Typography } from "@mui/material";
import CustomField from "../CustomFields/CustomField";
import SubmitButton from "../CustomButtons/SubmitButton";
import { useSession } from "@/app/context/SessionContext";
import CustomTextareaField from "../CustomFields/CustomTextAreaField";

interface FormData {
  permissionName: string;
  permissionDescription: string;
}

export default function PermissionForm() {
  const { accessToken } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    permissionName: "",
    permissionDescription: "",
  });

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (field: keyof FormData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
    };

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, router]);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        "https://music-backend-production-99a.up.railway.app/api/v1/permissions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      setIsSubmitting(false);

      if (response.ok) {
        setSuccess("Permission created successfully!");
        setTimeout(() => {
          router.push("/admin/roles"); // Or your desired redirect
        }, 1000);
      } else {
        const message = data?.message || "Permission creation failed.";
        setError(message);
      }
    } catch (err) {
      console.error("ERROR", err);
      setIsSubmitting(false);
      setError("Network error.");
    }
  };

  return (
    <Card className={styles.authCard}>
      <CardContent className={styles.authCardContent}>
        <Box className={styles.authCardInputBox}>
          <CustomField
            label="Permission Name"
            placeholder="Read"
            type="text"
            value={formData.permissionName}
            onChange={handleChange("permissionName")}
          />

          <CustomField
            label="Permission Description"
            placeholder="Enter permission details..."
            type="text"
            value={formData.permissionDescription}
            onChange={handleChange("permissionDescription")}
          />
          {/* <CustomTextareaField
            label="Permission Description"
            placeholder="Enter permission details..."
            value={formData.permissionDescription}
            onChange={handleChange("permissionDescription")}
          /> */}

          <SubmitButton
            label={isSubmitting ? "Creating..." : "Create Permission"}
            onClick={handleSubmit}
            disabled={isSubmitting}
          />

          {error && <Typography color="error" mt={2}>{error}</Typography>}
          {success && <Typography color="success.main" mt={2}>{success}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
}
