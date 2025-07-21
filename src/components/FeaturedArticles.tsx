import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, User } from 'lucide-react';
import { useNews } from '../contexts/NewsContext';

const FeaturedArticles: React.FC = () => {
  const { articles } = useNews();
  const featuredArticles = articles.filter(article => article.featured).slice(0, 4);

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-red-600 pl-4">
        Berita Utama
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featuredArticles.map((article, index) => (
          <div
            key={article.id}
            className={`group cursor-pointer ${
              index === 0 ? 'md:col-span-2' : ''
            }`}
          >
            <Link to={`/artikel/${article.id}`}>
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                      index === 0 ? 'h-64 md:h-80' : 'h-48'
                    }`}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {article.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className={`font-bold text-gray-800 group-hover:text-red-600 transition-colors duration-200 line-clamp-2 ${
                    index === 0 ? 'text-xl md:text-2xl mb-3' : 'text-lg mb-2'
                  }`}>
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <User size={14} />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{article.publishedAt}</span>
                      </div>
                    </div>
                    <span className="text-red-600 font-medium">Baca Selengkapnya</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedArticles;