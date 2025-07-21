import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DatabaseService, Category } from '../lib/supabase';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  imageUrl: string;
  publishedAt: string;
  createdAt: string;
  views: number;
  featured: boolean;
  status: 'draft' | 'pending' | 'approved' | 'published' | 'rejected';
  category_name?: string;
  category_slug?: string;
  category_color?: string;
  author_role?: string;
  engagement_score?: number;
  tags?: string;
}

interface NewsContextType {
  articles: Article[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshArticles: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  updateArticleStatus: (id: string, status: string, comment?: string) => void;
  addArticle: (article: Omit<Article, 'id' | 'views' | 'createdAt'>) => void;
  getArticlesByCategory: (categorySlug: string) => Article[];
  getFeaturedArticles: () => Article[];
  getTrendingArticles: () => Article[];
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export const useNews = () => {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};

interface NewsProviderProps {
  children: ReactNode;
}

export const NewsProvider: React.FC<NewsProviderProps> = ({ children }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    await Promise.all([refreshArticles(), refreshCategories()]);
  };

  const refreshArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await DatabaseService.getArticles({ limit: 50 });
      
      if (fetchError) {
        throw fetchError;
      }

      // Transform database data to match component interface
      const transformedArticles: Article[] = data.map((article: any) => ({
        id: article.id,
        title: article.title || 'Untitled',
        excerpt: article.excerpt || '',
        content: article.content || '',
        author: article.author_name || 'Unknown Author',
        category: article.category_name || 'Uncategorized',
        imageUrl: article.featured_image_url || 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=800',
        publishedAt: article.published_at ? new Date(article.published_at).toLocaleDateString('id-ID') : '',
        createdAt: article.created_at ? new Date(article.created_at).toLocaleDateString('id-ID') : '',
        views: article.view_count || 0,
        featured: article.is_featured || false,
        status: article.status || 'draft',
        category_name: article.category_name,
        category_slug: article.category_slug,
        category_color: article.category_color,
        author_role: article.author_role,
        engagement_score: article.engagement_score,
        tags: article.tags
      }));
      
      setArticles(transformedArticles);
    } catch (err: any) {
      console.error('Error fetching articles:', err);
      setError(err.message || 'Failed to fetch articles');
      
      // Fallback to mock data if database fails
      setArticles(getMockArticles());
    } finally {
      setLoading(false);
    }
  };

  const refreshCategories = async () => {
    try {
      const { data, error: fetchError } = await DatabaseService.getCategories();
      
      if (fetchError) {
        throw fetchError;
      }
      
      setCategories(data);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      
      // Fallback to mock categories
      setCategories(getMockCategories());
    }
  };

  const updateArticleStatus = (id: string, status: string, comment?: string) => {
    setArticles(prevArticles =>
      prevArticles.map(article =>
        article.id === id
          ? { 
              ...article, 
              status: status as Article['status'],
              publishedAt: status === 'approved' || status === 'published' 
                ? new Date().toLocaleDateString('id-ID') 
                : article.publishedAt
            }
          : article
      )
    );
  };

  const addArticle = (articleData: Omit<Article, 'id' | 'views' | 'createdAt'>) => {
    const newArticle: Article = {
      ...articleData,
      id: Date.now().toString(),
      views: 0,
      createdAt: new Date().toLocaleDateString('id-ID')
    };
    setArticles(prevArticles => [newArticle, ...prevArticles]);
  };

  const getArticlesByCategory = (categorySlug: string): Article[] => {
    return articles.filter(article => 
      article.category_slug?.toLowerCase() === categorySlug.toLowerCase() &&
      article.status === 'published'
    );
  };

  const getFeaturedArticles = (): Article[] => {
    return articles.filter(article => 
      article.featured && article.status === 'published'
    ).slice(0, 4);
  };

  const getTrendingArticles = (): Article[] => {
    return articles
      .filter(article => article.views > 100 && article.status === 'published')
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
  };

  // Mock data fallbacks
  const getMockArticles = (): Article[] => [
    {
      id: '1',
      title: 'Presiden Jokowi Umumkan Kebijakan Ekonomi Baru untuk Tahun 2025',
      excerpt: 'Presiden Joko Widodo mengumumkan serangkaian kebijakan ekonomi baru yang akan diterapkan mulai tahun 2025 untuk mendorong pertumbuhan ekonomi nasional.',
      content: 'Dalam konferensi pers di Istana Negara, Presiden Jokowi memaparkan detail kebijakan ekonomi yang mencakup reformasi struktural, peningkatan investasi, dan pengembangan sektor digital.',
      author: 'Ahmad Sutrisno',
      category: 'Politik',
      imageUrl: 'https://images.pexels.com/photos/6077326/pexels-photo-6077326.jpeg?auto=compress&cs=tinysrgb&w=800',
      publishedAt: '2 jam yang lalu',
      createdAt: new Date().toLocaleDateString('id-ID'),
      views: 1250,
      featured: true,
      status: 'published',
      category_slug: 'politik',
      category_color: '#3B82F6'
    },
    {
      id: '2',
      title: 'Indonesia Raih Medali Emas di Kejuaraan Badminton Asia',
      excerpt: 'Tim badminton Indonesia berhasil meraih medali emas dalam kejuaraan badminton Asia yang berlangsung di Bangkok, Thailand.',
      content: 'Prestasi gemilang ini diraih setelah pertandingan sengit melawan tim Malaysia di final dengan skor 3-1.',
      author: 'Sari Dewi',
      category: 'Olahraga',
      imageUrl: 'https://images.pexels.com/photos/1103829/pexels-photo-1103829.jpeg?auto=compress&cs=tinysrgb&w=800',
      publishedAt: '4 jam yang lalu',
      createdAt: new Date().toLocaleDateString('id-ID'),
      views: 890,
      featured: true,
      status: 'published',
      category_slug: 'olahraga',
      category_color: '#F97316'
    },
    {
      id: '3',
      title: 'Teknologi AI Mulai Diterapkan di Sektor Pendidikan Nasional',
      excerpt: 'Kementerian Pendidikan meluncurkan program pilot penerapan teknologi artificial intelligence dalam sistem pembelajaran di sekolah-sekolah.',
      content: 'Program ini bertujuan untuk meningkatkan kualitas pendidikan dan mempersiapkan siswa menghadapi era digital.',
      author: 'Budi Santoso',
      category: 'Teknologi',
      imageUrl: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
      publishedAt: '6 jam yang lalu',
      createdAt: new Date().toLocaleDateString('id-ID'),
      views: 650,
      featured: false,
      status: 'published',
      category_slug: 'teknologi',
      category_color: '#8B5CF6'
    }
  ];

  const getMockCategories = (): Category[] => [
    {
      id: '1',
      name: 'Politik',
      slug: 'politik',
      description: 'Berita politik terkini',
      color_code: '#3B82F6',
      sort_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Ekonomi',
      slug: 'ekonomi',
      description: 'Berita ekonomi dan bisnis',
      color_code: '#10B981',
      sort_order: 2,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Olahraga',
      slug: 'olahraga',
      description: 'Berita olahraga',
      color_code: '#F97316',
      sort_order: 3,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Teknologi',
      slug: 'teknologi',
      description: 'Berita teknologi',
      color_code: '#8B5CF6',
      sort_order: 4,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  return (
    <NewsContext.Provider value={{ 
      articles, 
      categories,
      loading,
      error,
      refreshArticles,
      refreshCategories,
      updateArticleStatus, 
      addArticle,
      getArticlesByCategory,
      getFeaturedArticles,
      getTrendingArticles
    }}>
      {children}
    </NewsContext.Provider>
  );
};