import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Search, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, profile } = useAuth();

  const categories = [
    { name: 'Politik', slug: 'politik' },
    { name: 'Ekonomi', slug: 'ekonomi' },
    { name: 'Olahraga', slug: 'olahraga' },
    { name: 'Teknologi', slug: 'teknologi' },
    { name: 'Hiburan', slug: 'hiburan' }
  ];

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-red-600 text-white py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <span>{new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          <div className="flex items-center space-x-4">
            {user && profile ? (
              <Link to="/admin" className="hover:text-red-200 flex items-center space-x-1">
                <User size={16} />
                <span>{profile.full_name}</span>
              </Link>
            ) : (
              <Link to="/login" className="hover:text-red-200">Login</Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              O
            </div>
            <div className="text-2xl font-bold text-gray-800">
              OPINIKU<span className="text-red-600">.ID</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-red-600 font-medium">
              Beranda
            </Link>
            {categories.map(category => (
              <Link
                key={category.slug}
                to={`/kategori/${category.slug}`}
                className="text-gray-700 hover:text-red-600 font-medium"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Search and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2">
              <Search size={20} className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Cari berita..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-sm w-48"
              />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col space-y-3">
              <Link to="/" className="text-gray-700 hover:text-red-600 font-medium py-2">
                Beranda
              </Link>
              {categories.map(category => (
                <Link
                  key={category.slug}
                  to={`/kategori/${category.slug}`}
                  className="text-gray-700 hover:text-red-600 font-medium py-2"
                >
                  {category.name}
                </Link>
              ))}
              
              {/* Mobile Search */}
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 mt-4">
                <Search size={20} className="text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Cari berita..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none text-sm flex-1"
                />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;