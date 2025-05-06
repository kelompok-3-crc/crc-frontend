"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, isLoading } = useAuth();
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(nip, password);
      
      // Get user data from cookies to check type
      const userData = Cookies.get('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.type === 'marketing') {
          router.push('/dashboard/marketing');
        } else if (user.type === 'bm') {
          router.push('/dashboard/manager');
        } else {
          throw new Error('Invalid user type');
        }
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      // Error is already handled by AuthContext
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-6xl w-full flex bg-white shadow-md rounded-lg overflow-hidden">
        <div className="w-full md:w-1/2 p-10">
          <div className="mb-8">
            <Image src="/Logo.png" alt="Logo" width={150} height={50} />
            <h2 className="text-2xl font-semibold mt-6">Sign In</h2>
            <p className="text-gray-500 mt-1">
              Welcome back! Please log in to your account with registered NIP
              and password.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSignIn}>
            <div>
              <label htmlFor="nip" className="block text-sm font-medium text-gray-700">
                NIP
              </label>
              <input
                id="nip"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                type="text"
                required
                placeholder="Enter your NIP"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                >
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye }
                  ></FontAwesomeIcon>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition disabled:opacity-50 mt-4"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>
        </div>

        <div className="hidden md:flex md:w-1/2 bg-white-100 items-center justify-center">
          <Image src="/login.png" alt="Login Illustration" width={400} height={400} />
        </div>
      </div>
    </div>
  );
}
