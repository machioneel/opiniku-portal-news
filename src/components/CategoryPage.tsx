import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, User, ArrowLeft } from 'lucide-react';
import { useNews } from '../contexts/NewsContext';
import Header from './layout/Header';
import Footer from './layout/Footer';

const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const { articles } = useNews();
  
  const categoryArticles = articles.filter(article => 
    article.category.toLowerCase() === category?.toLowerCase() && 
    article.status === 'published'
  );

  const categoryName = category?.charAt(0).toUpperCase() + category?.slice(1);

  const getCategoryColor = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case 'politik':
        return 'bg-blue-600';
      case 'ekonomi':
        return 'bg-green-600';
      case 'olahraga':
        return 'bg-orange-600';
      case 'teknologi':
        return 'bg-purple-600';
      case 'hiburan':
        return 'bg-pink-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-red-600">Beranda</Link>
          <span>/</span>
          <span className="text-gray-800">{categoryName}</span>
        </nav>

        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-red-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Kembali ke Beranda</span>
        </Link>

        {/* Category Header */}
        <div className={`${getCategoryColor(category)} text-white rounded-lg p-8 mb-8`}>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Berita {categoryName}
          </h1>
          <p className="text-lg opacity-90">
            {categoryArticles.length} artikel tersedia dalam kategori ini
          </p>
        </div>

        {/* Articles Grid */}
        {categoryArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryArticles.map(article => (
              <div key={article.id} className="group">
                <Link to={`/artikel/${article.id}`}>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="relative">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`${getCategoryColor(category)} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                          {article.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="font-bold text-gray-800 group-hover:text-red-600 transition-colors duration-200 line-clamp-2 text-lg mb-3">
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
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Belum Ada Artikel
            </h3>
            <p className="text-gray-600">
              Belum ada artikel yang dipublikasi dalam kategori {categoryName}.
            </p>
          </div>
        )}

        {/* Load More Button */}
        {categoryArticles.length > 9 && (
          <div className="text-center mt-12">
            <button className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium">
              Muat Lebih Banyak
            </button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default CategoryPage;