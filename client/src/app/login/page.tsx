"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Lock, Mail } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { useEffect } from "react";


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000); 
  
    return () => clearTimeout(timer);
  }, []);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError("Both email and password are required.");
      return toast.error("Both email and password are required.");
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return toast.error("Please enter a valid email address.");
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: normalizedEmail, password }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Login successful!", {
          style: { backgroundColor: "#6a0dad", color: "#fffff1" },
        });
        setTimeout(() => {
          router.push("/arena");
        }, 2000);
      } else {
        toast.error(data?.message || "Login failed. Invalid credentials.", {
          style: {
            backgroundColor: "#f44336",
            color: "#ffffff",
          },
        });
      }
    } catch (error) {
      toast.error("Login failed. Please try again later.", {
        style: {
          backgroundColor: "#f44334",
          color: "#fff",
        },
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: "google" | "github") => {
    window.location.href = `http://localhost:5000/auth/${provider}`;
  };

  if (pageLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin border-4 border-t-4 border-purple-500 rounded-full w-10 h-10"></div>
          <p className="text-sm">Loading...</p>
        </div>
      </main>
    );
  }
  

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-purple-900 text-white py-8">
      <ToastContainer />
      <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md space-y-4 border border-purple-700">
        <div className="flex flex-col items-center mb-4">
          <div className="flex items-center justify-center">
            <img
              src="/logo.png"
              alt="DSARENA logo"
              width={40}
              height={40}
              className="mr-12"
            />
            <h1 className="text-2xl font-semibold text-yellow-400 animate-pulse">
              Welcome Back
            </h1>
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="relative">
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full pl-10 pr-4 py-1.5 rounded-lg bg-gray-700 text-white text-sm"
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>

          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 pr-4 py-1.5 mt-4 rounded-lg bg-gray-700 text-white text-sm"
            />
            <Lock className="absolute left-3 top-[58%] transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`cursor-pointer w-full py-1.5 mt-6 rounded-lg font-semibold text-gray-900 text-sm transition-all duration-300 transform ${
              loading
                ? "bg-yellow-500 cursor-not-allowed"
                : "bg-yellow-400 hover:bg-yellow-500 hover:scale-105"
            }`}
          >
            {loading ? (
              <span className="flex justify-center items-center space-x-2">
                <div className="animate-spin border-2 border-t-2 border-yellow-900 w-4 h-4 rounded-full"></div>
                <span>Submitting...</span>
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="flex justify-between space-x-3 pt-1">
          <button
            type="button"
            onClick={() => handleOAuth("google")}
            className="cursor-pointer flex-1 text-white py-1.5 text-sm rounded-lg transition-transform transform hover:scale-105 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-700 to-gray-700"
          >
            <Image
              src="/icons8-google-48.png"
              alt="Google"
              width={18}
              height={18}
            />
            <span className="text-white font-medium">Google</span>
          </button>
          <button
            type="button"
            onClick={() => handleOAuth("github")}
            className="cursor-pointer flex-1 text-white py-1.5 text-sm rounded-lg transition-transform transform hover:scale-105 flex items-center justify-center space-x-2 bg-gradient-to-r from-gray-700 to-purple-700"
          >
            <Image
              src="/icons8-github-logo-50.png"
              alt="GitHub"
              width={18}
              height={18}
            />
            <span>GitHub</span>
          </button>
        </div>

        {/* Centered forgot password */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => router.push("/forgot-password")}
            className="text-yellow-400 hover:text-yellow-300 font-medium underline transition-all duration-200 cursor-pointer "
          >
            Forgot Password?
          </button>
        </div>
        <div>
          
        </div>
      </div>
    </main>
  );
}
