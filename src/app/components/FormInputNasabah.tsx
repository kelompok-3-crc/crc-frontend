"use client";

import React, { useState } from "react";
import VerifyPopup from "./VerifyPopup";
import SavePopUp from "./SavePopUp";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { API_BASE_URL } from '@/app/constants/config';
import toast from "react-hot-toast";

interface FormData {
  cif: string;
  fullName: string;
  phoneCode: string;
  phoneNumber: string;
  accountNumber: string;
  email: string;
  address: string;
  occupation: string;
  company_name: string;
  age: number;
  income: number;
  payroll: boolean;
  gender: string;
  maritalStatus: boolean;
  categorySegment: string;
  existingProduct: string[];
  transactionActivity: string;
}

interface Option {
  value: string;
  label: string;
}

const CustomerInfoForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    cif: "",
    fullName: "",
    phoneCode: "+62",
    phoneNumber: "",
    accountNumber: "",
    email: "",
    company_name: "",
    address: "",
    occupation: "",
    age: 0,
    income: 0,
    payroll: false,
    gender: "MALE", // Set default value
    maritalStatus: false,
    categorySegment: "RS",
    existingProduct: [],
    transactionActivity: "Active", // Set default value
  });

  // Add state for popups
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);
  const [showSavePopup, setShowSavePopup] = useState(false);

  // Add state for field errors
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value, 10) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleBoolChange = (name: string, value: boolean): void => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductChange = (product: string): void => {
    setFormData((prev) => {
      const updatedProducts = prev.existingProduct.includes(product)
        ? prev.existingProduct.filter((p) => p !== product)
        : [...prev.existingProduct, product];

      return {
        ...prev,
        existingProduct: updatedProducts,
      };
    });
  };

  const handleSubmit = () => {
    setShowVerifyPopup(true);
  };

  const handleVerifyConfirm = async () => {
    try {
      setFieldErrors({}); // Clear previous errors
      const token = Cookies.get("token");

      const apiPayload = {
        transaction_activity: formData.transactionActivity, // Convert to lowercase
        cif: formData.cif,
        nomor_rekening: formData.accountNumber,
        gender: formData.gender,
        name: formData.fullName,
        occupation: formData.occupation,
        email: formData.email,
        address: formData.address,
        nomor_hp: `${formData.phoneCode}${formData.phoneNumber.replace(/\s/g, '')}`,
        payroll: formData.payroll,
        income: formData.income,
        company_name: formData.company_name,
        existing_product: formData.existingProduct,
        category_segmen: formData.categorySegment,
        marital_status: formData.maritalStatus,
        umur: formData.age
      };

      // Add validation before sending
      if (!apiPayload.gender || !apiPayload.transaction_activity) {
        throw new Error("Please fill in all required fields");
      }

      const response = await fetch(`${API_BASE_URL}/predictions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(apiPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setFieldErrors(data.errors);
          if (data.message === "Kesalahan Validasi")
            toast.error("Form belum diisi dengan benar");
          return;
        }
        toast.error(data.message || "Failed to submit");
        throw new Error(data.message || "Failed to submit");
      }

      if (data.success) {
        setShowSavePopup(true);
        setTimeout(() => {
          router.push("/dashboard/marketing");
        }, 2000);
      } else {
        throw new Error(data.message || "Failed to submit");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setShowVerifyPopup(false);
    }
  };

  const handleSaveComplete = () => {
    setShowSavePopup(false);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Define option arrays with proper typing
  const genderOptions: Option[] = [
    { value: "MALE", label: "Laki-laki" },
    { value: "FEMALE", label: "Perempuan" },
  ];

  const categorySegmentOptions: Option[] = [
    { value: "BO2", label: "BO2" },
    { value: "Swasta", label: "Swasta" },
    { value: "Pendidikan", label: "Pendidikan" },
    { value: "BUMN", label: "BUMN" },
    { value: "Non Target Market", label: "Non Target Market" },
    { value: "Lembaga Negara", label: "Lembaga Negara" },
    { value: "Pensiun", label: "Pensiun" },
    { value: "RS", label: "RS" },
  ];

  const existingProductOptions: Option[] = [
    { value: "mitraguna", label: "Mitraguna" },
    { value: "hasanahcard", label: "Hasanah Card" },
    { value: "griya", label: "Griya" },
    { value: "oto", label: "OTO" },
    { value: "pensiun", label: "Pensiun" },
    { value: "prapensiun", label: "Prapensiun" },
  ];

  const transactionActivityOptions: Option[] = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 border border-gray-200 rounded-lg shadow-sm bg-white">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Informasi Nasabah
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* CIF */}
          <div>
            <label
              htmlFor="cif"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              CIF
            </label>
            <input
              type="text"
              id="cif"
              name="cif"
              value={formData.cif}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                fieldErrors.cif ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-1 ${
                fieldErrors.cif ? 'focus:ring-red-500' : 'focus:ring-teal-500'
              }`}
            />
            {fieldErrors.cif && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.cif}</p>
            )}
          </div>

          {/* Nama Lengkap */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nama Lengkap
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                fieldErrors.name ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-1 ${
                fieldErrors.name ? 'focus:ring-red-500' : 'focus:ring-teal-500'
              }`}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
            )}
          </div>

          {/* No Telephone */}
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              No Telephone
            </label>
            <div className="flex">
              <div className="flex-shrink-0">
                <input
                  type="text"
                  id="phoneCode"
                  name="phoneCode"
                  value={formData.phoneCode}
                  onChange={handleChange}
                  className="w-16 px-3 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="flex-1 px-4 py-2 rounded-r-lg border border-l-0 border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Nomor Rekening */}
          <div>
            <label
              htmlFor="accountNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nomor Rekening
            </label>
            <input
              type="text"
              id="accountNumber"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                fieldErrors.nomor_rekening ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-1 ${
                fieldErrors.nomor_rekening ? 'focus:ring-red-500' : 'focus:ring-teal-500'
              }`}
            />
            {fieldErrors.nomor_rekening && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.nomor_rekening}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                fieldErrors.email ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-1 ${
                fieldErrors.email ? 'focus:ring-red-500' : 'focus:ring-teal-500'
              }`}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          {/* Alamat */}
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Alamat
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                fieldErrors.address ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-1 ${
                fieldErrors.address ? 'focus:ring-red-500' : 'focus:ring-teal-500'
              }`}
            />
            {fieldErrors.address && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.address}</p>
            )}
          </div>

          {/* Gender (Dropdown) */}
          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Jenis Kelamin
            </label>
            <div className="relative">
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 appearance-none bg-white"
                required
              >
                <option value="">Select Gender</option>
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Payroll (Boolean Buttons) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payroll
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleBoolChange("payroll", true)}
                className={`px-4 py-2 rounded-lg ${
                  formData.payroll
                    ? "bg-teal-500 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                Ya
              </button>
              <button
                type="button"
                onClick={() => handleBoolChange("payroll", false)}
                className={`px-4 py-2 rounded-lg ${
                  !formData.payroll
                    ? "bg-teal-500 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                Tidak
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Category Segment (Dropdown) */}
          <div>
            <label
              htmlFor="categorySegment"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Kategori Segmen
            </label>
            <div className="relative">
              <select
                id="categorySegment"
                name="categorySegment"
                value={formData.categorySegment}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 appearance-none bg-white"
              >
                {categorySegmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pekerjaan */}
          <div>
            <label
              htmlFor="company_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nama Perusahaan
            </label>
            <input
              type="text"
              id="company_name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                fieldErrors.company_name ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-1 ${
                fieldErrors.company_name ? 'focus:ring-red-500' : 'focus:ring-teal-500'
              }`}
            />
            {fieldErrors.company_name && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.company_name}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="occupation"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Pekerjaan
            </label>
            <input
              type="text"
              id="occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                fieldErrors.occupation ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-1 ${
                fieldErrors.occupation ? 'focus:ring-red-500' : 'focus:ring-teal-500'
              }`}
            />
            {fieldErrors.occupation && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.occupation}</p>
            )}
          </div>

          {/* Age (Numeric) */}
          <div>
            <label
              htmlFor="age"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Umur
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                fieldErrors.umur ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-1 ${
                fieldErrors.umur ? 'focus:ring-red-500' : 'focus:ring-teal-500'
              }`}
            />
            {fieldErrors.umur && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.umur}</p>
            )}
          </div>

          {/* Income (Numeric with formatting) */}
          <div>
            <label
              htmlFor="income"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Penghasilan
            </label>
            <input
              type="text"
              id="income"
              name="income"
              value={formatCurrency(formData.income)}
              onChange={(e) => {
                const numericValue =
                  parseInt(e.target.value.replace(/\D/g, ""), 10) || 0;
                setFormData((prev) => ({ ...prev, income: numericValue }));
              }}
              className={`w-full px-4 py-2 rounded-lg border ${
                fieldErrors.income ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-1 ${
                fieldErrors.income ? 'focus:ring-red-500' : 'focus:ring-teal-500'
              }`}
            />
            {fieldErrors.income && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.income}</p>
            )}
          </div>

          {/* Marital Status (Boolean Buttons) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Pernikahan
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleBoolChange("maritalStatus", true)}
                className={`px-4 py-2 rounded-lg ${
                  formData.maritalStatus
                    ? "bg-teal-500 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                Ya
              </button>
              <button
                type="button"
                onClick={() => handleBoolChange("maritalStatus", false)}
                className={`px-4 py-2 rounded-lg ${
                  !formData.maritalStatus
                    ? "bg-teal-500 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                Tidak
              </button>
            </div>
          </div>

          {/* Transaction Activity (Dropdown) */}
          <div>
            <label
              htmlFor="transactionActivity"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Aktivitas Transaksi
            </label>
            <div className="relative">
              <select
                id="transactionActivity"
                name="transactionActivity"
                value={formData.transactionActivity}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 appearance-none bg-white"
                required
              >
                <option value="">Select Activity</option>
                {transactionActivityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Multiple Existing Products */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Produk Eksisting
            </label>
            <div className="grid grid-cols-2 gap-2">
              {existingProductOptions.map((option) => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`product-${option.value}`}
                    checked={formData.existingProduct.includes(option.value)}
                    onChange={() => handleProductChange(option.value)}
                    className="h-4 w-4 text-teal-500 focus:ring-teal-400 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`product-${option.value}`}
                    className="ml-2 block text-sm text-gray-700"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={handleSubmit}
          className="px-8 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          Submit
        </button>
      </div>

      {/* Add Popups */}
      <VerifyPopup
        isOpen={showVerifyPopup}
        onClose={() => setShowVerifyPopup(false)}
        onConfirm={handleVerifyConfirm}
      />

      <SavePopUp isOpen={showSavePopup} onClose={handleSaveComplete} />
    </div>
  );
};

export default CustomerInfoForm;
