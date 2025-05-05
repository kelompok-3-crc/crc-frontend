import React, { useState } from 'react';
import Image from 'next/image';
import TnCPopup from './TnCPopUp';

interface CardReccomendationProps {
  nomor: number;
  produk: string;
  maksimalPlafond: string;
  minimalPlafond: string;
  tenorMin: number;
  tenorMax: number;
  logo: string;
  onLihatPersyaratan?: () => void;
}

const CardReccomendation: React.FC<CardReccomendationProps> = ({
  nomor,
  produk,
  maksimalPlafond,
  minimalPlafond,
  tenorMin,
  tenorMax,
  logo,
}) => {
  const [showTnC, setShowTnC] = useState(false);

  return (
    <>
      <div className="w-full rounded-2xl border border-teal-500 p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">
          Rekomendasi {nomor}
        </h2>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 relative">
            <Image
              src={logo}
              alt={`Logo ${produk}`}
              width={56}
              height={56}
              className="object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold">{produk}</h3>
            <div className="space-y-1">
              <p className="text-sm text-gray-700">
                Plafond: Rp {minimalPlafond} - Rp {maksimalPlafond}
              </p>
              {(tenorMin > 0 || tenorMax > 0) && (
                <p className="text-sm text-gray-700">
                  Tenor: {tenorMin} - {tenorMax} bulan
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-auto">
          <button
            onClick={() => setShowTnC(true)}
            className="bg-teal-500 text-white text-sm font-medium py-2 px-4 rounded-full hover:bg-teal-600 transition"
          >
            Lihat Persyaratan
          </button>
        </div>
      </div>

      <TnCPopup 
        isOpen={showTnC} 
        onClose={() => setShowTnC(false)} 
      />
    </>
  );
};

export default CardReccomendation;
