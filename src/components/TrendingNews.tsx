import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Eye } from 'lucide-react';
import { useNews } from '../contexts/NewsContext';

const TrendingNews: React.FC = () => {
  const { articles } = useNews();
  const trendingArticles = articles
    .filter(article => article.views > 1000)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-24">
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4">
        <div className="flex items-center space-x-2">
          <TrendingUp size={20} />
          <h2 className="text-lg font-bold">Trending</h2>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {trendingArticles.map((article, index) => (
          <Link
            key={article.id}
            to={`/artikel/${article.id}`}
            className="group block"
          >
            <div className="flex space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200">
              <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-800 group-hover:text-red-600 transition-colors duration-200 line-clamp-3">
                  {article.title}
                </h3>
                
                <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                  <Eye size={12} />
                  <span>{article.views.toLocaleString()} views</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Newsletter Signup */}
      <div className="border-t border-gray-200 p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Newsletter</h3>
        <p className="text-sm text-gray-600 mb-3">
          Dapatkan berita terbaru langsung di email Anda
        </p>
        <div className="space-y-2">
          <input
            type="email"
            placeholder="Email Anda"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button className="w-full bg-red-600 text-white py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors duration-200">
            Berlangganan
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrendingNews;