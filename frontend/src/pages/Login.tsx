"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthForm from "../components/AuthForm";

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        await axios.get(`${import.meta.env.VITE_BASIC_API_URL}/auth/me`, {
          withCredentials: true,
        });
        // If the request succeeds, user is logged in, redirect to products page
        navigate("/products");
      } catch (err) {
        // If request fails, user is not logged in, stay on login page
        console.log("User not logged in");
      }
    };

    checkAuth();
  }, [navigate]);

  return <AuthForm type="login" />;
}
