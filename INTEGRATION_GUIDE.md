# Panduan Integrasi Database dan Autentikasi OPINIKU.ID

## 1. Setup Environment

### Langkah 1: Konfigurasi Environment Variables
```bash
# Copy file .env.example ke .env
cp .env.example .env

# Edit file .env dengan kredensial Supabase Anda
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Langkah 2: Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-react bcryptjs
```

## 2. Struktur Database

### Tabel Utama:
- **profiles**: Data pengguna dengan role-based access
- **articles**: Artikel dengan workflow approval
- **categories**: Kategori berita
- **comments**: Sistem komentar dengan moderasi
- **analytics**: Tracking views dan engagement
- **notifications**: Sistem notifikasi

### Views yang Tersedia:
- **article_summary**: Data artikel lengkap dengan join
- **popular_articles**: Artikel berdasarkan engagement
- **dashboard_metrics**: Metrics untuk dashboard admin
- **pending_approvals**: Artikel menunggu approval

## 3. Sistem Autentikasi

### Role Hierarchy:
1. **Super Admin** (Level 5): Akses penuh sistem
2. **Editor** (Level 4): Approve artikel, manage users
3. **Journalist** (Level 3): Buat artikel, tidak bisa publish langsung
4. **Contributor** (Level 2): Submit artikel untuk review
5. **Subscriber** (Level 1): Akses basic

### Login Credentials (Demo):
```
Super Admin: admin@opiniku.id / password123
Editor: editor@opiniku.id / password123
Journalist: journalist@opiniku.id / password123
```

## 4. Fitur Keamanan

### Implementasi:
- **Row Level Security (RLS)** pada semua tabel
- **Password hashing** dengan bcrypt
- **Session management** otomatis via Supabase
- **CSRF protection** untuk form submissions
- **Input validation** dan sanitization
- **Rate limiting** untuk API calls

### Contoh Penggunaan:
```typescript
// Check user permission
import { hasMinimumRole } from './utils/security';

if (hasMinimumRole(profile.role, 'editor')) {
  // User dapat approve artikel
}

// Sanitize input
import { sanitizeInput } from './utils/security';
const cleanInput = sanitizeInput(userInput);
```

## 5. API Database Service

### Contoh Penggunaan:
```typescript
import { DatabaseService } from './lib/supabase';

// Get articles
const articles = await DatabaseService.getArticles({
  status: 'published',
  category: 'teknologi',
  limit: 10
});

// Create article
const newArticle = await DatabaseService.createArticle({
  title: 'Judul Artikel',
  content: 'Konten artikel...',
  author_id: userId,
  category_id: categoryId,
  status: 'draft'
});

// Approve article
await DatabaseService.approveArticle(articleId, approverId, 'Artikel bagus!');
```

## 6. Custom Hooks

### Tersedia:
- `useArticles()`: Fetch dan manage artikel
- `useCategories()`: Fetch kategori
- `useDashboardMetrics()`: Dashboard statistics
- `usePendingApprovals()`: Approval workflow

### Contoh:
```typescript
import { useArticles } from './hooks/useDatabase';

const { articles, loading, error } = useArticles({
  status: 'published',
  limit: 20
});
```

## 7. Workflow Approval

### Proses:
1. Journalist buat artikel → Status: "draft"
2. Submit untuk review → Status: "pending"
3. Editor review → Status: "approved"/"rejected"
4. Auto-publish jika approved → Status: "published"
5. Notifikasi otomatis di setiap tahap

### Implementasi:
```typescript
// Approve artikel
const handleApprove = async (articleId: string) => {
  await DatabaseService.approveArticle(
    articleId, 
    profile.id, 
    'Artikel disetujui untuk publikasi'
  );
};
```

## 8. Monitoring & Analytics

### Fitur:
- **Page view tracking** otomatis
- **User engagement metrics**
- **Article performance analytics**
- **Dashboard metrics** real-time

### Implementasi:
```typescript
// Track page view
await DatabaseService.trackPageView(articleId, userId);

// Get dashboard metrics
const metrics = await DatabaseService.getDashboardMetrics();
```

## 9. Error Handling

### Best Practices:
```typescript
try {
  const result = await DatabaseService.createArticle(articleData);
  // Success handling
} catch (error) {
  console.error('Database error:', error);
  // Error handling - show user-friendly message
}
```

## 10. Performance Optimization

### Implementasi:
- **Lazy loading** untuk komponen besar
- **Pagination** untuk list artikel
- **Caching** dengan React Query (opsional)
- **Image optimization** dengan lazy loading
- **Database indexing** untuk query cepat

## 11. Deployment Checklist

### Sebelum Production:
- [ ] Set environment variables production
- [ ] Enable RLS pada semua tabel
- [ ] Setup backup database otomatis
- [ ] Configure CORS settings
- [ ] Enable SSL/HTTPS
- [ ] Setup monitoring dan logging
- [ ] Test semua user roles
- [ ] Verify approval workflow
- [ ] Test responsive design

## 12. Troubleshooting

### Common Issues:
1. **Connection Error**: Check environment variables
2. **Permission Denied**: Verify RLS policies
3. **Slow Queries**: Check database indexes
4. **Auth Issues**: Clear browser cache/localStorage

### Debug Commands:
```typescript
// Check current user
console.log('Current user:', supabase.auth.getUser());

// Check database connection
console.log('Supabase client:', supabase);

// Test query
const { data, error } = await supabase.from('articles').select('*').limit(1);
console.log('Test query:', { data, error });
```

## Support

Untuk bantuan teknis atau pertanyaan implementasi, silakan hubungi tim development atau buat issue di repository project.