import React from 'react';
import { 
  FileText, 
  Users, 
  Eye, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useNews } from '../../contexts/NewsContext';
import { useAuth } from '../../contexts/AuthContext';

const DashboardHome: React.FC = () => {
  const { articles } = useNews();
  const { user, profile } = useAuth();

  const stats = [
    {
      icon: FileText,
      title: 'Total Artikel',
      value: articles.length,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      icon: Eye,
      title: 'Total Views',
      value: articles.reduce((sum, article) => sum + article.views, 0).toLocaleString(),
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      icon: Clock,
      title: 'Pending Review',
      value: articles.filter(a => a.status === 'pending').length,
      color: 'bg-yellow-500',
      change: '-5%'
    },
    {
      icon: Users,
      title: 'Total Penulis',
      value: new Set(articles.map(a => a.author)).size,
      color: 'bg-purple-500',
      change: '+3%'
    }
  ];

  const recentArticles = articles
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'pending':
        return <AlertCircle size={16} className="text-yellow-500" />;
      case 'rejected':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Dipublikasi';
      case 'pending':
        return 'Menunggu Review';
      case 'rejected':
        return 'Ditolak';
      default:
        return 'Draft';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Selamat Datang, {profile?.full_name}!
        </h2>
        <p className="opacity-90">
          Kelola konten dan pantau performa portal berita OPINIKU.ID
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">dari bulan lalu</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Articles */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Artikel Terbaru</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentArticles.map(article => (
              <div key={article.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {article.title}
                  </h4>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>{article.author}</span>
                    <span>{article.category}</span>
                    <span>{article.views} views</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(article.status)}
                  <span className="text-sm font-medium text-gray-700">
                    {getStatusText(article.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
          <div className="space-y-3">
            <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
              Buat Artikel Baru
            </button>
            <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
              Review Artikel
            </button>
            <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
              Kelola Pengguna
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Artikel Populer</h3>
          <div className="space-y-3">
            {articles
              .sort((a, b) => b.views - a.views)
              .slice(0, 3)
              .map((article, index) => (
                <div key={article.id} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {article.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {article.views.toLocaleString()} views
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Artikel "Breaking News" dipublikasi</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">Artikel baru menunggu review</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">User baru mendaftar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;