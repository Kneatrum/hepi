"use client"

import type React from "react"

import { useState, type ChangeEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  ThemeProvider,
  createTheme,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
} from "@mui/material"
import CustomField from "../CustomFields/CustomField"
import SubmitButton from "../CustomButtons/SubmitButton"
import { useSession } from "@/app/context/SessionContext"
import { getUserRole } from "../../../utils/authUtils"

const darkYellowTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#000000",
    },
    secondary: {
      main: "#FFEB3B",
    },
    background: {
      default: "#000000",
      paper: "#1a1a1a",
    },
    text: {
      primary: "#ffffff",
      secondary: "#FFEB3B",
    },
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#1a1a1a",
          border: "1px solid #333",
          borderRadius: "16px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.8)",
          width: "100%",
          maxWidth: "400px",
          margin: "16px",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: "#000000",
          color: "#FFEB3B",
          borderBottom: "2px solid #FFEB3B",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#2a2a2a",
            borderRadius: "8px",
            "& fieldset": {
              borderColor: "#444",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#FFEB3B",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#FFEB3B",
            "&.Mui-focused": {
              color: "#FFEB3B",
            },
          },
          "& .MuiOutlinedInput-input": {
            color: "#ffffff",
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          "& .MuiTabs-indicator": {
            backgroundColor: "#FFEB3B",
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: "#ffffff",
          "&.Mui-selected": {
            color: "#FFEB3B",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: "#FFEB3B",
          color: "#000000",
          fontWeight: 600,
          "&:hover": {
            backgroundColor: "#FDD835",
          },
        },
        outlined: {
          borderColor: "#FFEB3B",
          color: "#FFEB3B",
          "&:hover": {
            borderColor: "#FDD835",
            backgroundColor: "rgba(255, 235, 59, 0.1)",
          },
        },
      },
    },
  },
})

interface SignupFormData {
  userFirstname: string
  userLastname: string
  userEmail: string
  userPhone: string
  userPassword: string
  confirmPassword: string
  roleId: number
}

interface AuthDialogProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function AuthDialog({ open, onClose, onSuccess }: AuthDialogProps) {
  const { setTokens, accessToken } = useSession()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const [activeTab, setActiveTab] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")

  // Signup form state
  const [signupFormData, setSignupFormData] = useState<SignupFormData>({
    userFirstname: "",
    userLastname: "",
    userEmail: "",
    userPhone: "",
    userPassword: "",
    confirmPassword: "",
    roleId: 1,
  })
  const [signupError, setSignupError] = useState("")
  const [signupSuccess, setSignupSuccess] = useState("")

  useEffect(() => {
    if (accessToken) {
      onClose()
    }
  }, [accessToken, onClose])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
    // Clear errors when switching tabs
    setLoginError("")
    setSignupError("")
    setSignupSuccess("")
  }

  const resetForms = () => {
    setLoginEmail("")
    setLoginPassword("")
    setLoginError("")
    setSignupFormData({
      userFirstname: "",
      userLastname: "",
      userEmail: "",
      userPhone: "",
      userPassword: "",
      confirmPassword: "",
      roleId: 1,
    })
    setSignupError("")
    setSignupSuccess("")
    setActiveTab(0)
  }

  const handleClose = () => {
    if (!isSubmitting) {
      resetForms()
      onClose()
    }
  }

  const handleLogin = async () => {
    setLoginError("")
    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter both email and password.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("https://music-backend-production-99a.up.railway.app/api/v1/auth/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await response.json()

      if (response.ok && data.access_token && data.refresh_token) {
        setTokens(data.access_token, data.refresh_token)
        const userRole = getUserRole(data.access_token)
        if (onSuccess) onSuccess()
        setTimeout(() => {
          if (userRole === "SUPERADMIN") {
            router.push("/admin/artists")
          } else if (userRole === "USER") {
            router.push("/")
          } else {
            router.push("/")
          }
          onClose()
        }, 1000)
      } else {
        const message = data?.message || "Login failed. Please check your credentials."
        setLoginError(message)
      }
    } catch (err) {
      console.error("Login error:", err)
      setLoginError("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignupChange = (field: keyof SignupFormData) => (e: ChangeEvent<HTMLInputElement>) => {
    setSignupFormData({ ...signupFormData, [field]: e.target.value })
  }

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleSignup = async () => {
    setSignupError("")
    setSignupSuccess("")

    if (!validateEmail(signupFormData.userEmail)) {
      setSignupError("Invalid email format.")
      return
    }

    if (signupFormData.userPassword !== signupFormData.confirmPassword) {
      setSignupError("Passwords do not match.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("https://music-backend-production-99a.up.railway.app/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupFormData),
      })
      const data = await response.json()

      if (response.ok && data.access_token && data.refresh_token) {
        setTokens(data.access_token, data.refresh_token)
        setSignupSuccess("Signup successful!")
        if (onSuccess) onSuccess()
        setTimeout(() => {
          router.push("/")
          onClose()
        }, 1000)
      } else {
        setSignupError("Signup failed. Try again.")
      }
    } catch (err) {
      console.error("ERROR", err)
      setSignupError("Network error.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ThemeProvider theme={darkYellowTheme}>
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={false}
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 1,
            // minHeight: "400px",
            borderColor: "yellow",
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 0, display: "flex", flexDirection: "column", borderBottom: "1px solid #333" }}>
          <Box sx={{ display: "flex",   p: 0, m: 0 }}>
           
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Login" />
                <Tab label="Sign Up" />
              </Tabs>
     
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2, sm: 3 }, backgroundColor: 'black' }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-around",
              alignContent: "center",
              gap: { xs: 3, sm: 4 },
              pt: 1,
              mt: 3,
              mb: 3,
            }}
          >
            {/* Login Tab */}
            {activeTab === 0 && (
              <>
                <CustomField
                  label="Email"
                  placeholder="johndoe@gmail.com"
                  type="email"
                  value={loginEmail}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setLoginEmail(e.target.value)}
                />
                <CustomField
                  label="Password"
                  type="password"
                  value={loginPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setLoginPassword(e.target.value)}
                />
                {loginError && (
                  <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                    {loginError}
                  </Typography>
                )}
              </>
            )}

            {/* Signup Tab */}
            {activeTab === 1 && (
              <>
                <CustomField
                  label="First name"
                  placeholder="John"
                  type="text"
                  value={signupFormData.userFirstname}
                  onChange={handleSignupChange("userFirstname")}
                />
                <CustomField
                  label="Last name"
                  placeholder="Doe"
                  type="text"
                  value={signupFormData.userLastname}
                  onChange={handleSignupChange("userLastname")}
                />
                <CustomField
                  label="Email"
                  placeholder="johndoe@gmail.com"
                  type="email"
                  value={signupFormData.userEmail}
                  onChange={handleSignupChange("userEmail")}
                />
                <CustomField
                  label="Phone number"
                  placeholder="+1234567890"
                  type="text"
                  value={signupFormData.userPhone}
                  onChange={handleSignupChange("userPhone")}
                />
                <CustomField
                  label="Password"
                  type="password"
                  value={signupFormData.userPassword}
                  onChange={handleSignupChange("userPassword")}
                />
                <CustomField
                  label="Confirm Password"
                  type="password"
                  value={signupFormData.confirmPassword}
                  onChange={handleSignupChange("confirmPassword")}
                />
                {signupError && (
                  <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                    {signupError}
                  </Typography>
                )}
                {signupSuccess && (
                  <Typography color="success.main" variant="body2" sx={{ mt: 1 }}>
                    {signupSuccess}
                  </Typography>
                )}
              </>
            )}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            borderTop: "1px solid #333",
            p: { xs: 2, sm: 3 },
            justifyContent: "flex-end",
            gap: 1,
            backgroundColor: 'black'
          }}
        >
          <Button
            variant="outlined"
            onClick={handleClose}
            disabled={isSubmitting}
            sx={{ height: "44px", width: "120px", borderRadius: "8px" }}
          >
            Cancel
          </Button>

          <Box sx={{ display: "flex", alignItems: "center", width: "120px", height: "44px" }}>
            <SubmitButton
              label={
                isSubmitting
                  ? activeTab === 0
                    ? "Logging in..."
                    : "Signing up..."
                  : activeTab === 0
                    ? "Login"
                    : "Register"
              }
              onClick={activeTab === 0 ? handleLogin : handleSignup}
              disabled={isSubmitting}
            />
          </Box>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  )
}
