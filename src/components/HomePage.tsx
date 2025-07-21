import React, { useState } from 'react';
import Header from './layout/Header';
import BreakingNews from './BreakingNews';
import FeaturedArticles from './FeaturedArticles';
import CategorySection from './CategorySection';
import TrendingNews from './TrendingNews';
import Footer from './layout/Footer';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <BreakingNews />
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <FeaturedArticles />
            <CategorySection />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <TrendingNews />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;