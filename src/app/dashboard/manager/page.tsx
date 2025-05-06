"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import MarketingTable from "@/app/components/MarketingTable";
import ProductChart from "@/app/components/ProductChart";
import CardItem from "@/app/components/CardItem";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';
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

interface Dataset {
  data: number[];
  backgroundColor: string[];
  borderWidth: number;
}

interface ProductTarget {
  product_id: number;
  product_name: string;
  monthly_achieved: number;
  monthly_target: number;
  labels: string[];
  datasets: Dataset[];
}

interface MarketingData {
  marketing_nip: string;
  marketing_name: string;
  monthly_achieved: number;
  monthly_target: number;
  labels: string[];
  datasets: Dataset[];
  target_details: ProductTarget[];
}

export default function DashboardManager() {
  const router = useRouter();
  const {logout} = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [monitoringData, setMonitoringData] = useState<MarketingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get('token');
        const headers = {
          'Authorization': `Bearer ${token}`
        };

        // Fetch both profile and monitoring data
        const [profileResponse, monitoringResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/profile/summary`, { headers }),
          fetch(`${API_BASE_URL}/bm/monitoring/target?month=5&year=2025`, { headers })
        ]);

        if (!profileResponse.ok || !monitoringResponse.ok) {
          if (profileResponse.status === 401){
            logout();
            
          }
          throw new Error('Failed to fetch data');
        }

        const profileData = await profileResponse.json();
        const monitoringData = await monitoringResponse.json();

        if (profileData.success && monitoringData.success) {
          setProfileData(profileData.data);
          setMonitoringData(monitoringData.data);
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTargetMarketing = () => {
    router.push("/dashboard/manager/targetmarketing");
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Format currency helper function
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
    .replace('IDR', '')
    .trim();
  };

  // Get month name helper function
  const getMonthName = (monthNumber: number): string => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[monthNumber - 1] || '';
  };

  const getProductIcon = (productName: string): string => {
    const productIcons: Record<string, string> = {
      'Mitraguna Berkah': '/mitraguna.png',
      'Griya': '/griya.png',
      'Pensiun': '/pensiun.png',
      'Prapensiun': '/prapensiun.png',
      'OTO': '/oto.png',
      'Hasanah Card': '/hasanahcard.png'
    };
    return productIcons[productName] || '/default.png';
  };

  const getTopMarketers = (data: MarketingData[]) => {
    return data
      .sort((a, b) => b.monthly_achieved - a.monthly_achieved)
      .slice(0, 4); // Get top 4 marketers
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section with Title and Target */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1">
                {profileData?.branch_name}
              </h1>
              <p className="text-sm text-gray-600">
                {profileData?.name} - {profileData?.nip}
              </p>
            </div>
            <div className="text-left md:text-right">
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold">
                Target KC {formatCurrency(profileData?.total_target || 0)}
              </h2>
              <p className="text-sm text-gray-600">
                {profileData?.target_month ? getMonthName(profileData.target_month) : ''} {profileData?.target_year}
              </p>
            </div>
          </div>

          {/* Dashboard Title and Button */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl md:text-2xl font-bold">Dashboard Target Marketing</h2>
            <button
              className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-lg flex items-center"
              onClick={handleTargetMarketing}
            >
              <span className="mr-2">+</span>
              Masukan Target Marketing
            </button>
          </div>

          {/* Marketing Table, Terbaik & Chart Section */}
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            {/* Table Marketing */}
            <div className="lg:w-1/2">
              <h3 className="text-lg md:text-xl font-bold mb-4">Tabel Marketing</h3>
              <div className="bg-white rounded-lg border p-4 shadow-sm overflow-x-auto">
                <MarketingTable />
              </div>
            </div>

            {/* Marketing Terbaik dan Chart Produk */}
            <div className="lg:w-1/2 flex flex-col gap-6">
              {/* Marketing Terbaik */}
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-4">Marketing Terbaik</h3>
                <div className="overflow-x-auto pb-4">
                  <div className="flex space-x-4 min-w-max">
                    {getTopMarketers(monitoringData).map((marketing) => (
                      <CardItem
                        key={marketing.marketing_nip}
                        title={marketing.marketing_name}
                        iconSrc="/pensiun.png"
                        targetLabel="Target"
                        targetAmount={formatCurrency(marketing.monthly_target)}
                        achievedLabel="Tercapai"
                        achievedAmount={formatCurrency(marketing.monthly_achieved)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Chart Produk */}
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-4">Chart Produk</h3>
                <div className="bg-white rounded-lg border shadow-sm p-4">
                  <ProductChart />
                </div>
              </div>
            </div>
          </div>

          {/* Details Target Marketing */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-6">Details Target Marketing</h2>

            {monitoringData.map((marketing, idx) => (
              <div className="mb-8" key={marketing.marketing_nip}>
                <div className="mb-2">
                  <h3 className="text-lg font-semibold">{marketing.marketing_name}</h3>
                  <p className="text-teal-500 font-medium">
                    Target Total {formatCurrency(marketing.monthly_target)}
                  </p>
                </div>
                <div className="overflow-x-auto pb-4">
                  <div className="flex space-x-4 min-w-max">
                    {marketing.target_details.map((product) => (
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
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}