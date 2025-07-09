"use client";
import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "../../../styles/page.module.css";
import { Box, Card, CardContent, Typography } from "@mui/material";
import CustomField from "../CustomFields/CustomField";
import SubmitButton from "../CustomButtons/SubmitButton";
import { useSession } from "@/app/context/SessionContext";
import { useEffect } from "react";


interface FormData {
  userFirstname: string;
  userLastname: string;
  userEmail: string;
  userPhone: string;
  userPassword: string;
  confirmPassword: string;
  roleId: number;
}

export default function SignupForm() {
    const { setTokens,accessToken } = useSession();
  
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    userFirstname: "",
    userLastname: "",
    userEmail: "",
    userPhone: "",
    userPassword: "",
    confirmPassword: "",
    roleId: 1,
  });

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleChange = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };


  useEffect(() => {
    if (accessToken) {
      router.replace("/");
    }
  }, [accessToken, router]);

  const validateEmail = (userEmail: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(userEmail);
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!validateEmail(formData.userEmail)) {
      setError("Invalid email format.");
      return;
    }

    if (formData.userPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(
        "https://music-backend-production-99a.up.railway.app/api/v1/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok && data.access_token && data.refresh_token) {
        setTokens(data.access_token, data.refresh_token);

        setSuccess("Signup successful!");

        // Optional delay for user feedback before redirect
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        setError("Signup failed. Try again.");
      }
    } catch (err) {
      console.error("ERROR", err);
      setError("Network error.");
    }
  };

  return (
    <Card className={styles.authCard}>
      <CardContent className={styles.authCardContent}>
        <Box
          className={styles.authCardTopImage}
          sx={{
            display: { xs: "none", sm: "block" }, // Hide on extra-small screens
          }}
        >
          <Image src="/images/hepi_logo.jpg" height={100} width={100} alt="hepi logo" />
        </Box>

        <Box className={styles.authCardInputBox}>
          <CustomField
            label="First name"
            placeholder="johndoe"
            type="text"
            value={formData.userFirstname}
            onChange={handleChange("userFirstname")}
          />
          <CustomField
            label="Last name"
            placeholder="johndoe"
            type="text"
            value={formData.userLastname}
            onChange={handleChange("userLastname")}
          />
          <CustomField
            label="Email"
            placeholder="johndoe@gmail.com"
            type="email"
            value={formData.userEmail}
            onChange={handleChange("userEmail")}
          />
          <CustomField
            label="Phone number"
            type="text"
            value={formData.userPhone}
            onChange={handleChange("userPhone")}
          />
          <CustomField
            label="Password"
            type="password"
            value={formData.userPassword}
            onChange={handleChange("userPassword")}
          />
          <CustomField
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange("confirmPassword")}
          />

          <SubmitButton label="Register" onClick={handleSubmit} />

          {error && <Typography color="error" mt={2}>{error}</Typography>}
          {success && <Typography color="success.main" mt={2}>{success}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
}
