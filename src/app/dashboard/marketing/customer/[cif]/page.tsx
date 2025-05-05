"use client";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import DetailNasabah from "@/app/components/FormNasabah";
import { useState, useEffect } from "react";
import StatusNasabah from "@/app/components/StatusNasabah";
import CardReccomendation from "@/app/components/CardReccomendation";
import { useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '@/app/constants/config';


interface CustomerData {
  id: number;
  nama: string;
  cif: string;
  nomor_rekening: string;
  nama_perusahaan: string;
  produk_eksisting: string[];
  aktivitas_transaksi: string;
  nomor_hp: string;
  segmen: string;
  alamat: string;
  pekerjaan: string;
  email: string;
  penghasilan: number;
  umur: number;
  gender: string;
  status_perkawinan: boolean;
  payroll: boolean;
  status: "new" | "rejected" | "contacted" | "closed";
  catatan: string;
  marketing_customer_id: number;
  marketing_id: number;
  closed_amount: number;
  mc_created_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  produk: Array<{
    id: number;
    nama: string;
    ikon: string;
    prediksi: string;
    plafon_max: number;  // Add this field
    order: number;
  }>;
  closed_produk_id: number;
  closed_produk: {
    id: number;
    nama: string;
    prediksi: string;
    ikon: string;
    created_at: string;
    updated_at: string;
    deleted_at: null;
  };
}

export default function DetailCustomer() {
  const params = useParams();
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setIsLoading(true);
        const token = Cookies.get('token');
        const response = await fetch(`${API_BASE_URL}/marketing/customers/${params.cif}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch customer data');
        }

        const result = await response.json();
        if (result.success) {
          setCustomerData(result.data);
        } else {
          throw new Error(result.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching customer data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.cif) {
      fetchCustomerData();
    }
  }, [params.cif]);

  // Transform API data to match DetailNasabah component props
  const transformedData = customerData ? {
    cif: customerData.cif,
    fullName: customerData.nama,
    phoneNumber: customerData.nomor_hp,
    accountNumber: customerData.nomor_rekening,
    email: customerData.email,
    address: customerData.alamat,
    occupation: customerData.pekerjaan,
    companyName: customerData.nama_perusahaan,
    age: customerData.umur,
    income: customerData.penghasilan,
    payroll: customerData.payroll,
    gender: customerData.gender,
    maritalStatus: customerData.status_perkawinan,
    categorySegment: customerData.segmen,
    existingProduct: customerData.produk_eksisting || [],
    transactionActivity: customerData.aktivitas_transaksi,
    closedAmount: customerData.closed_amount,
    mcCreatedAt: customerData.mc_created_at
  } : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-6 flex-grow">
        <div className="flex items-center text-sm mb-6">
          <a href="/dashboard/marketing" className="text-gray-500 hover:text-teal-500">
            Dashboard
          </a>
          <span className="mx-2">/</span>
          <span className="text-teal-500 font-medium">Details Customers</span>
        </div>

        <h1 className="text-2xl font-bold mb-6">Details Customer</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : customerData && transformedData ? (
          <>
            <DetailNasabah data={transformedData} isLoading={isLoading} />

            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Produk Rekomendasi</h2>
              {customerData?.produk ? (
                customerData.produk
                  // First filter: remove products that customer already has and products with zero plafond
                  .filter(product => 
                    !customerData.produk_eksisting
                      ?.map(p => p.toLowerCase())
                      ?.includes(product.prediksi.toLowerCase()) && 
                    product.plafon_max > 0
                  ).length === 0 ? (
                  // Show message when no products to recommend
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-gray-600 text-lg">
                      Tidak ada rekomendasi produk yang tersedia
                    </p>
                  </div>
                ) : (
                  // Show product recommendations grid
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {customerData.produk
                      .filter(product => 
                        !customerData.produk_eksisting
                          ?.map(p => p.toLowerCase())
                          ?.includes(product.prediksi.toLowerCase()) &&
                        product.plafon_max > 0
                      )
                      .map((product, index) => (
                        <CardReccomendation
                          key={product.id}
                          logo={`/${product.ikon}.png`}
                          nomor={index + 1}
                          produk={product.nama}
                          maksimalPlafond={new Intl.NumberFormat('id-ID', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(product.plafon_max)
                            .replace(/\./g, ',')}
                          onLihatPersyaratan={() =>
                            console.log(`Lihat persyaratan ${product.nama} diklik`)
                          }
                        />
                      ))}
                  </div>
                )
              ) : (
                // Show loading state when produk data is not available
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-gray-600 text-lg">Loading product recommendations...</p>
                </div>
              )}
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Ubah Status</h2>
              <StatusNasabah currentStatus={customerData.status} />
            </div>
          </>
        ) : null}
      </div>

      <Footer />
    </div>
  );
}
