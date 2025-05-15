"use client";

import { useState ,useEffect} from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";



export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter(); 
  const [pageLoading, setPageLoading] = useState(true); 
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000); 
  
    return () => clearTimeout(timer);
  }, []);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.message || "Something went wrong.");
      }
    } catch (err) {
      toast.error("Network error. Try again.");
    } finally {
      setLoading(false);
    }
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
        <h2 className="text-2xl font-bold text-center text-yellow-400">
          Forgot Your Password?
        </h2>
        <p className="text-sm text-gray-300 text-center">
          We'll email you a reset link
        </p>
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 rounded-lg bg-gray-700 text-white text-sm"
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-1.5 mt-4 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold text-sm cursor-pointer"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-center text-sm mt-2">
          <span
            onClick={() => router.push("/login")}
            className="text-yellow-400 hover:underline cursor-pointer"
          >
            Back to Login
          </span>
        </p>
      </div>
    </main>
  );
}
