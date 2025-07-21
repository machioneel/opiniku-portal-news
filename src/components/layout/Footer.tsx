import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                O
              </div>
              <div className="text-2xl font-bold">
                OPINIKU<span className="text-red-600">.ID</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Portal berita terpercaya yang menyajikan informasi terkini dan akurat 
              dari berbagai bidang untuk masyarakat Indonesia.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Kategori</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/kategori/politik" className="text-gray-400 hover:text-white transition-colors">Politik</Link></li>
              <li><Link to="/kategori/ekonomi" className="text-gray-400 hover:text-white transition-colors">Ekonomi</Link></li>
              <li><Link to="/kategori/olahraga" className="text-gray-400 hover:text-white transition-colors">Olahraga</Link></li>
              <li><Link to="/kategori/teknologi" className="text-gray-400 hover:text-white transition-colors">Teknologi</Link></li>
              <li><Link to="/kategori/hiburan" className="text-gray-400 hover:text-white transition-colors">Hiburan</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Perusahaan</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/tentang" className="text-gray-400 hover:text-white transition-colors">Tentang Kami</Link></li>
              <li><Link to="/redaksi" className="text-gray-400 hover:text-white transition-colors">Tim Redaksi</Link></li>
              <li><Link to="/karir" className="text-gray-400 hover:text-white transition-colors">Karir</Link></li>
              <li><Link to="/kontak" className="text-gray-400 hover:text-white transition-colors">Kontak</Link></li>
              <li><Link to="/kebijakan-privasi" className="text-gray-400 hover:text-white transition-colors">Kebijakan Privasi</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Kontak Kami</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <MapPin size={16} className="text-red-500 flex-shrink-0" />
                <span className="text-gray-400">Jl. Sudirman No. 123, Jakarta Pusat</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-red-500 flex-shrink-0" />
                <span className="text-gray-400">+62 21 1234 5678</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-red-500 flex-shrink-0" />
                <span className="text-gray-400">redaksi@opiniku.id</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} OPINIKU.ID. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;