import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, User, Eye, Share2, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { useNews } from '../contexts/NewsContext';
import Header from './layout/Header';
import Footer from './layout/Footer';

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { articles } = useNews();
  
  const article = articles.find(a => a.id === id);
  
  if (!article) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Artikel Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-6">Artikel yang Anda cari tidak tersedia.</p>
          <Link to="/" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedArticles = articles
    .filter(a => a.category === article.category && a.id !== article.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link to="/" className="hover:text-red-600">Beranda</Link>
            <span>/</span>
            <Link to={`/kategori/${article.category.toLowerCase()}`} className="hover:text-red-600">
              {article.category}
            </Link>
            <span>/</span>
            <span className="text-gray-800">{article.title}</span>
          </nav>

          {/* Back Button */}
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-red-600 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Kembali</span>
          </Link>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {article.category}
              </span>
              <span className="text-sm text-gray-500">{article.publishedAt}</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>
            
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {article.excerpt}
            </p>
            
            <div className="flex items-center justify-between border-b border-gray-200 pb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User size={18} className="text-gray-500" />
                  <span className="font-medium text-gray-800">{article.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={18} className="text-gray-500" />
                  <span className="text-gray-600">{article.publishedAt}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye size={18} className="text-gray-500" />
                  <span className="text-gray-600">{article.views.toLocaleString()} views</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Bagikan:</span>
                <button className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  <Facebook size={16} />
                </button>
                <button className="p-2 rounded-full bg-blue-400 text-white hover:bg-blue-500 transition-colors">
                  <Twitter size={16} />
                </button>
                <button className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-700 transition-colors">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="mb-8">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-12">
            <div className="text-gray-800 leading-relaxed space-y-6">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
              </p>
              <p>
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
              </p>
            </div>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="border-t border-gray-200 pt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Artikel Terkait</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map(relatedArticle => (
                  <Link
                    key={relatedArticle.id}
                    to={`/artikel/${relatedArticle.id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <img
                        src={relatedArticle.imageUrl}
                        alt={relatedArticle.title}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
                          {relatedArticle.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {relatedArticle.excerpt}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ArticleDetail;