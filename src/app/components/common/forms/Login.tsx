"use client";
import { useState, ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "../../../styles/page.module.css";
import { Box, Card, CardContent, Typography } from "@mui/material";
import CustomField from "../CustomFields/CustomField";
import SubmitButton from "../CustomButtons/SubmitButton";
import { useSession } from "@/app/context/SessionContext";
import { getUserRole } from "../../../utils/authUtils";



export default function LoginForm() {
  const { setTokens } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://music-backend-production-99a.up.railway.app/api/v1/auth/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok && data.access_token && data.refresh_token) {
        setTokens(data.access_token, data.refresh_token);
        const userRole = getUserRole(data.access_token);
        setTimeout(() => {
          if (userRole === "SUPERADMIN") {
            router.push("/admin/artists");
          } else if (userRole === "USER") {
            router.push("/");
          } else {
            router.push("/");
          }
        }, 1000);
      } else {
        const message = data?.message || "Login failed. Please check your credentials.";
        setError(message);
      }
    } catch (err) {
      console.error("Login error:", err);
      setIsLoading(false);
      setError("Network error. Please try again.");
    }
  };

  return (
    <Card className={styles.authCard}>
      <CardContent className={styles.authCardContent}>
        <Box className={styles.authCardTopImage}>
          <Image src="/images/hepi_logo.jpg" height={100} width={100} alt="hepi logo" />
        </Box>
        <Box className={styles.authCardInputBox}>
          <CustomField
            label="Email"
            placeholder="johndoe@gmail.com"
            type="email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          />
          <CustomField
            label="Password"
            type="password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          />
          <SubmitButton label={isLoading ? "Logging in..." : "Login"} onClick={handleLogin} disabled={isLoading} />
          {error && <Typography color="error" mt={2}>{error}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
}
