import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthForm from "../components/AuthForm";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        setIsChecking(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BASIC_API_URL}/auth/me`,
          {
            withCredentials: true,
          }
        );

        // If the request succeeds, user is logged in
        if (response.data && response.data._id) {
          // Check if user is admin and redirect accordingly
          if (response.data.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/dashboard");
          }
        }
      } catch (err) {
        // If request fails, user is not logged in, stay on login page
        console.log("User not logged in");
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <AuthForm type="login" />;
}
