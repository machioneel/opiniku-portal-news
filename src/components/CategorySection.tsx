import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, User, ArrowRight } from 'lucide-react';
import { useNews } from '../contexts/NewsContext';

const CategorySection: React.FC = () => {
  const { articles } = useNews();
  
  const categories = [
    { name: 'Politik', slug: 'politik', color: 'bg-blue-600' },
    { name: 'Ekonomi', slug: 'ekonomi', color: 'bg-green-600' },
    { name: 'Olahraga', slug: 'olahraga', color: 'bg-orange-600' },
    { name: 'Teknologi', slug: 'teknologi', color: 'bg-purple-600' }
  ];

  const getArticlesByCategory = (category: string) => {
    return articles.filter(article => 
      article.category.toLowerCase() === category.toLowerCase()
    ).slice(0, 3);
  };

  return (
    <section className="space-y-8">
      {categories.map(category => {
        const categoryArticles = getArticlesByCategory(category.name);
        
        return (
          <div key={category.slug} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className={`${category.color} text-white p-4 flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{category.name}</h2>
              <Link 
                to={`/kategori/${category.slug}`}
                className="flex items-center space-x-1 text-sm hover:underline"
              >
                <span>Lihat Semua</span>
                <ArrowRight size={16} />
              </Link>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categoryArticles.map(article => (
                  <div key={article.id} className="group">
                    <Link to={`/artikel/${article.id}`}>
                      <div className="space-y-3">
                        <div className="relative overflow-hidden rounded-lg">
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        
                        <h3 className="font-semibold text-gray-800 group-hover:text-red-600 transition-colors duration-200 line-clamp-2">
                          {article.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {article.excerpt}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User size={12} />
                            <span>{article.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={12} />
                            <span>{article.publishedAt}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default CategorySection;