import React, { useState } from 'react';
import { 
  Clock, 
  User, 
  Eye, 
  Check, 
  X, 
  MessageSquare,
  Calendar
} from 'lucide-react';
import { useNews } from '../../contexts/NewsContext';
import { useAuth } from '../../contexts/AuthContext';

const ApprovalQueue: React.FC = () => {
  const { articles, updateArticleStatus } = useNews();
  const { user, profile } = useAuth();
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  const pendingArticles = articles.filter(article => article.status === 'pending');

  const handleApproval = (articleId: string, status: 'approved' | 'rejected') => {
    updateArticleStatus(articleId, status, comment);
    setComment('');
    setSelectedArticle(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Antrian Persetujuan</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock size={16} />
          <span>{pendingArticles.length} artikel menunggu review</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex flex-wrap items-center space-x-4">
          <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option>Semua Kategori</option>
            <option>Politik</option>
            <option>Ekonomi</option>
            <option>Olahraga</option>
            <option>Teknologi</option>
            <option>Hiburan</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option>Semua Penulis</option>
            <option>John Doe</option>
            <option>Jane Smith</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option>Terbaru</option>
            <option>Terlama</option>
            <option>Prioritas Tinggi</option>
          </select>
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        {pendingArticles.map(article => (
          <div key={article.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>
                      {article.status === 'pending' ? 'Menunggu Review' : article.status}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {article.category}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User size={14} />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{article.createdAt}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye size={14} />
                      <span>{article.views} views</span>
                    </div>
                  </div>
                </div>

                <div className="ml-6">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-32 h-24 object-cover rounded-lg"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => setSelectedArticle(
                    selectedArticle === article.id ? null : article.id
                  )}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <MessageSquare size={16} />
                  <span>Tambah Komentar</span>
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleApproval(article.id, 'rejected')}
                    className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <X size={16} />
                    <span>Tolak</span>
                  </button>
                  <button
                    onClick={() => handleApproval(article.id, 'approved')}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Check size={16} />
                    <span>Setujui</span>
                  </button>
                </div>
              </div>

              {/* Comment Section */}
              {selectedArticle === article.id && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Komentar Review
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tambahkan komentar untuk penulis..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {pendingArticles.length === 0 && (
          <div className="text-center py-12">
            <Clock size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Artikel Pending</h3>
            <p className="text-gray-600">Semua artikel telah direview.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalQueue;