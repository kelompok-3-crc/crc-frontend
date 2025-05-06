"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import CustomerTable from "@/app/components/CustomerTable";
import CardItem from "@/app/components/CardItem";
import Link from "next/link";
import Cookies from "js-cookie";
import { useAuth } from "@/app/context/AuthContext";
import { API_BASE_URL } from '@/app/constants/config';


interface ProfileData {
  type: string;
  branch_name: string;
  name: string;
  nip: string;
  total_target: number;
  achieved: number;
  percentage: number;
  products: any;
  target_month: number;
  target_year: number;
  target_setted: boolean;
}

interface MonitoringData {
  target_details: Array<{
    product_id: string;
    product_name: string;
    monthly_target: number;
    monthly_achieved: number;
  }>;
}

export default function DashboardMarketing() {
  const {logout} = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pipeline" | "kelolaan">(
    "pipeline"
  );

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("IDR", "Rp.")
      .trim();
  };

  // Helper function to get month name
  const getMonthName = (monthNumber: number): string => {
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return months[monthNumber - 1] || "";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token");
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Fetch both profile and monitoring data
        const [profileResponse, monitoringResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/profile/summary`, {
            headers,
          }),
          fetch(
            `${API_BASE_URL}/marketing/monitoring/target?month=5&year=2025`,
            { headers }
          ),
        ]);

        if (!profileResponse.ok || !monitoringResponse.ok) {
          console.log(profileResponse)
          if (profileResponse.status === 401){
            console.log(profileResponse.status)
            logout();
            
          }
          throw new Error("Failed to fetch data");
        }

        const profileData = await profileResponse.json();
        const monitoringData = await monitoringResponse.json();

        if (profileData.success && monitoringData.success) {
          setProfileData(profileData.data);
          setMonitoringData(monitoringData.data);
        } else {
          throw new Error("Failed to fetch data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);


  if (error) {
    return <div>Error: {error}</div>;
  }

  const getProductIcon = (productName: string): string => {
    const productIcons: Record<string, string> = {
      "Mitraguna Berkah": "/mitraguna.png",
      Griya: "/griya.png",
      Pensiun: "/pensiun.png",
      Prapensiun: "/prapensiun.png",
      OTO: "/oto.png",
      "Hasanah Card": "/hasanahcard.png",
    };
    return productIcons[productName] || "/default.png";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Informasi Pengguna dan Target */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
                {profileData?.branch_name}
              </h1>
              <p className="text-sm text-gray-500">
                {profileData?.name} ({profileData?.nip})
              </p>
            </div>
            <div className="text-left md:text-right">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                Target Marketing{" "}
                {formatCurrency(profileData?.total_target || 0)}
              </h2>
              <p className="text-sm text-gray-500">
                {profileData?.target_month
                  ? getMonthName(profileData.target_month)
                  : ""}{" "}
                {profileData?.target_year}
              </p>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-4">
              Dashboard
            </h3>
            <div className="overflow-x-auto pb-4">
              <div className="flex space-x-4 min-w-max">
                {monitoringData?.target_details.map((product) => (
                  <CardItem
                    key={product.product_id}
                    title={product.product_name}
                    iconSrc={getProductIcon(product.product_name)}
                    targetLabel="Target"
                    targetAmount={formatCurrency(product.monthly_target)}
                    achievedLabel="Tercapai"
                    achievedAmount={formatCurrency(product.monthly_achieved)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Tabel Nasabah dengan Button */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg md:text-xl font-semibold text-gray-700">
                Tabel Nasabah
              </h3>
              <Link href="/dashboard/marketing/inputnasabah">
                <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Masukan Nasabah Baru
                </button>
              </Link>
            </div>

            <div className="bg-white rounded-lg border p-4 shadow-sm overflow-x-auto">
              <CustomerTable tab={activeTab} onTabChange={setActiveTab} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
