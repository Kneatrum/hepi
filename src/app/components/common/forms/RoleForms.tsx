"use client";
import { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
// import Image from "next/image";
import styles from "../../../styles/page.module.css";
import { Box, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import CustomField from "../CustomFields/CustomField";
import SubmitButton from "../CustomButtons/SubmitButton";
import { useSession } from "@/app/context/SessionContext";
// import CustomTextareaField from "../CustomFields/CustomTextAreaField";
import CustomSelect from "../CustomFields/CustomSelect";  // Import the CustomSelect component

interface FormData {
  RoleName: string;
  RoleDescription: string;
  RoleShortDescription: string;
  RoleStatus: "ACTIVE" | "INACTIVE";
}

export default function RoleForm() {
  const { accessToken } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    RoleName: "",
    RoleDescription: "",
    RoleShortDescription: "",
    RoleStatus: "ACTIVE", // Default to ACTIVE
  });

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (field: keyof FormData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { value: unknown }>) => {
      setFormData({ ...formData, [field]: e.target.value });
    };

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, router]);

  const validateForm = () => {
    if (!formData.RoleName || !formData.RoleDescription) {
      setError("Please fill in all fields.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        "https://music-backend-production-99a.up.railway.app/api/v1/Roles",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      setIsSubmitting(false);

      if (response.ok) {
        setSuccess("Role created successfully!");
        router.push("/admin/roles"); // Redirect immediately after success
      } else {
        const message = data?.message || "Role creation failed.";
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
       

        <Box className={styles.authCardInputBox} sx={{display:"flex", flexDirection:"column", gap:"10px"}}>
          <CustomField
            label="Role Name"
            placeholder="Enter Role Name"
            type="text"
            value={formData.RoleName}
            onChange={handleChange("RoleName")}
          />
           <CustomField
            label="Role Short Description"
            placeholder="Role Short Description"
            type="text"
            value={formData.RoleDescription}
            onChange={handleChange("RoleDescription")}
          />

          <CustomField
            label="Role Description"
            placeholder="Role Description"
            type="text"
            value={formData.RoleDescription}
            onChange={handleChange("RoleDescription")}
          />
          
          {/* Replaced the original dropdown with CustomSelect */}
          <CustomSelect
            label="Role Status"
            value={formData.RoleStatus}
            onChange={handleChange("RoleStatus")}
            options={[
              { value: "ACTIVE", label: "ACTIVE" },
              { value: "INACTIVE", label: "INACTIVE" },
            ]}
          />

          {/* Submit Button with Spinner */}
          <SubmitButton
            label={isSubmitting ? "Creating..." : "Create Role"}
            onClick={handleSubmit}
            disabled={isSubmitting}
            endIcon={isSubmitting && <CircularProgress size={20} color="inherit" />}
          />

          {error && <Typography color="error" mt={2}>{error}</Typography>}
          {success && <Typography color="success.main" mt={2}>{success}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
}
