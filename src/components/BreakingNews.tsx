import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const BreakingNews: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const breakingNews = [
    "Presiden Jokowi Umumkan Kebijakan Ekonomi Baru untuk Tahun 2025",
    "Indonesia Raih Medali Emas di Kejuaraan Badminton Asia",
    "Harga BBM Diprediksi Stabil hingga Akhir Tahun",
    "Teknologi AI Mulai Diterapkan di Sektor Pendidikan Nasional"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === breakingNews.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [breakingNews.length]);

  return (
    <div className="bg-red-600 text-white py-3 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center">
          <div className="flex items-center bg-red-700 px-4 py-2 rounded-full mr-4 flex-shrink-0">
            <AlertCircle size={18} className="mr-2" />
            <span className="font-bold text-sm">BREAKING NEWS</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {breakingNews.map((news, index) => (
                <div
                  key={index}
                  className="w-full flex-shrink-0 text-sm md:text-base font-medium"
                >
                  {news}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakingNews;