import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  Eye, 
  Upload, 
  X, 
  Bold, 
  Italic, 
  List, 
  Link as LinkIcon,
  Image as ImageIcon
} from 'lucide-react';
import { useNews } from '../../contexts/NewsContext';
import { useAuth } from '../../contexts/AuthContext';

const CreateArticle: React.FC = () => {
  const navigate = useNavigate();
  const { addArticle } = useNews();
  const { user, profile } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    imageUrl: '',
    featured: false,
    status: 'draft' as const
  });

  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const categories = [
    { value: 'Politik', label: 'Politik' },
    { value: 'Ekonomi', label: 'Ekonomi' },
    { value: 'Olahraga', label: 'Olahraga' },
    { value: 'Teknologi', label: 'Teknologi' },
    { value: 'Hiburan', label: 'Hiburan' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSave = async (status: 'draft' | 'pending') => {
    if (!formData.title || !formData.content || !formData.category) {
      alert('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addArticle({
        ...formData,
        status,
        author: profile?.full_name || 'Unknown',
        publishedAt: status === 'pending' ? '' : new Date().toLocaleString('id-ID'),
        imageUrl: formData.imageUrl || 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=800'
      });

      if (status === 'draft') {
        alert('Artikel berhasil disimpan sebagai draft');
      } else {
        alert('Artikel berhasil dikirim untuk review');
      }
      
      navigate('/admin/articles');
    } catch (error) {
      alert('Terjadi kesalahan saat menyimpan artikel');
    } finally {
      setIsSaving(false);
    }
  };

  const insertFormatting = (format: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let replacement = '';
    switch (format) {
      case 'bold':
        replacement = `**${selectedText}**`;
        break;
      case 'italic':
        replacement = `*${selectedText}*`;
        break;
      case 'list':
        replacement = `\n- ${selectedText}`;
        break;
      default:
        replacement = selectedText;
    }

    const newContent = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));
    
    // Focus back to textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Buat Artikel Baru</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye size={16} />
            <span>{isPreview ? 'Edit' : 'Preview'}</span>
          </button>
          <button
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            <span>Simpan Draft</span>
          </button>
          <button
            onClick={() => handleSave('pending')}
            disabled={isSaving}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <Upload size={16} />
            <span>Kirim untuk Review</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {!isPreview ? (
              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Artikel *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Masukkan judul artikel yang menarik..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ringkasan Artikel
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    placeholder="Tulis ringkasan singkat artikel..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                {/* Content Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konten Artikel *
                  </label>
                  
                  {/* Formatting Toolbar */}
                  <div className="flex items-center space-x-2 p-3 border border-gray-300 border-b-0 rounded-t-lg bg-gray-50">
                    <button
                      type="button"
                      onClick={() => insertFormatting('bold')}
                      className="p-2 rounded hover:bg-gray-200 transition-colors"
                      title="Bold"
                    >
                      <Bold size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('italic')}
                      className="p-2 rounded hover:bg-gray-200 transition-colors"
                      title="Italic"
                    >
                      <Italic size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('list')}
                      className="p-2 rounded hover:bg-gray-200 transition-colors"
                      title="List"
                    >
                      <List size={16} />
                    </button>
                    <div className="w-px h-6 bg-gray-300"></div>
                    <button
                      type="button"
                      className="p-2 rounded hover:bg-gray-200 transition-colors"
                      title="Link"
                    >
                      <LinkIcon size={16} />
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded hover:bg-gray-200 transition-colors"
                      title="Image"
                    >
                      <ImageIcon size={16} />
                    </button>
                  </div>
                  
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Tulis konten artikel di sini..."
                    rows={20}
                    className="w-full px-4 py-3 border border-gray-300 border-t-0 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              </div>
            ) : (
              /* Preview Mode */
              <div className="p-6">
                <div className="prose prose-lg max-w-none">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {formData.title || 'Judul Artikel'}
                  </h1>
                  
                  {formData.excerpt && (
                    <p className="text-xl text-gray-600 mb-6 italic">
                      {formData.excerpt}
                    </p>
                  )}
                  
                  {formData.imageUrl && (
                    <img
                      src={formData.imageUrl}
                      alt="Article preview"
                      className="w-full h-64 object-cover rounded-lg mb-6"
                    />
                  )}
                  
                  <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {formData.content || 'Konten artikel akan muncul di sini...'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pengaturan Publikasi</h3>
            
            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Featured */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                  Artikel Unggulan
                </label>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gambar Utama</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Gambar
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              {formData.imageUrl && (
                <div className="relative">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=800';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              
              <button
                type="button"
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                <Upload size={16} />
                <span>Upload Gambar</span>
              </button>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  placeholder="Deskripsi singkat untuk mesin pencari..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  placeholder="tag1, tag2, tag3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateArticle;