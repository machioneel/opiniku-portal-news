# Panduan Setup Supabase untuk OPINIKU.ID

## 1. Persiapan Supabase Project

### Langkah 1: Buat Project Supabase
1. Kunjungi [supabase.com](https://supabase.com)
2. Klik "Start your project" dan login/register
3. Klik "New Project"
4. Isi detail project:
   - **Name**: OPINIKU-ID
   - **Database Password**: Buat password yang kuat
   - **Region**: Southeast Asia (Singapore) untuk performa optimal
5. Tunggu project selesai dibuat (2-3 menit)

### Langkah 2: Dapatkan Kredensial
1. Di dashboard project, klik "Settings" → "API"
2. Copy nilai berikut:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Langkah 3: Konfigurasi Environment
1. Buat file `.env` di root project:
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 2. Setup Database Schema

### Langkah 1: Jalankan Migration
1. Di dashboard Supabase, klik "SQL Editor"
2. Copy dan jalankan script dari `supabase/migrations/create_complete_news_database.sql`
3. Jalankan script satu per satu sesuai urutan:
   - `create_complete_news_database.sql`
   - `insert_sample_data.sql`
   - `create_database_views.sql`
   - `create_stored_procedures.sql`

### Langkah 2: Verifikasi Database
1. Klik "Table Editor" di sidebar
2. Pastikan semua tabel telah dibuat:
   - profiles
   - categories
   - articles
   - tags
   - article_tags
   - comments
   - media_files
   - newsletters
   - analytics
   - notifications

## 3. Konfigurasi Authentication

### Langkah 1: Setup Auth Providers
1. Klik "Authentication" → "Settings"
2. Di "Site URL", masukkan: `http://localhost:5173`
3. Di "Redirect URLs", tambahkan:
   - `http://localhost:5173/admin`
   - `http://localhost:5173/login`

### Langkah 2: Disable Email Confirmation (untuk development)
1. Di "Authentication" → "Settings"
2. Scroll ke "Email Auth"
3. **Uncheck** "Enable email confirmations"
4. Klik "Save"

### Langkah 3: Buat User Demo
1. Klik "Authentication" → "Users"
2. Klik "Add user" dan buat user berikut:

**Super Admin:**
- Email: `admin@opiniku.id`
- Password: `password123`
- Confirm: Yes

**Editor:**
- Email: `editor@opiniku.id`
- Password: `password123`
- Confirm: Yes

**Journalist:**
- Email: `journalist@opiniku.id`
- Password: `password123`
- Confirm: Yes

## 4. Row Level Security (RLS) Setup

### Langkah 1: Enable RLS
1. Klik "Authentication" → "Policies"
2. Untuk setiap tabel, klik "Enable RLS"
3. Policies sudah dibuat otomatis via migration script

### Langkah 2: Test RLS Policies
1. Login sebagai user berbeda
2. Coba akses data yang tidak seharusnya bisa diakses
3. Pastikan error "insufficient privileges" muncul

## 5. Storage Configuration (Opsional)

### Setup File Storage
1. Klik "Storage" di sidebar
2. Klik "Create bucket"
3. Nama bucket: `media-files`
4. Set sebagai public bucket
5. Upload test image untuk verifikasi

## 6. Edge Functions (Opsional)

### Setup Serverless Functions
1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login ke Supabase:
```bash
supabase login
```

3. Link project:
```bash
supabase link --project-ref your-project-id
```

4. Deploy functions:
```bash
supabase functions deploy
```

## 7. Real-time Configuration

### Enable Real-time
1. Klik "Database" → "Replication"
2. Enable replication untuk tabel:
   - articles
   - comments
   - notifications

## 8. Testing & Verification

### Test Authentication
1. Buka aplikasi: `http://localhost:5173`
2. Klik "Login" dan gunakan kredensial demo
3. Pastikan redirect ke `/admin` berhasil
4. Test logout functionality

### Test Database Operations
1. Login sebagai Journalist
2. Buat artikel baru
3. Login sebagai Editor
4. Approve artikel tersebut
5. Verifikasi artikel muncul di homepage

### Test RBAC
1. Login sebagai Contributor
2. Coba akses `/admin/users`
3. Pastikan mendapat "Access Denied"
4. Login sebagai Editor
5. Pastikan bisa akses semua fitur

## 9. Production Setup

### Security Checklist
- [ ] Enable RLS pada semua tabel
- [ ] Set strong database password
- [ ] Configure proper CORS settings
- [ ] Enable email confirmation
- [ ] Setup custom domain
- [ ] Configure backup schedule
- [ ] Setup monitoring alerts

### Environment Variables Production
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_APP_ENV=production
```

## 10. Troubleshooting

### Common Issues

**1. "Invalid API Key" Error**
- Periksa `.env` file
- Pastikan tidak ada spasi di awal/akhir key
- Restart development server

**2. "Insufficient Privileges" Error**
- Periksa RLS policies
- Pastikan user memiliki profile dengan role yang benar
- Check authentication status

**3. "Network Error" atau Connection Issues**
- Periksa internet connection
- Verifikasi Supabase project status
- Check firewall settings

**4. Database Migration Errors**
- Jalankan migration satu per satu
- Periksa syntax SQL
- Check database logs di Supabase dashboard

### Debug Commands
```javascript
// Check current user
console.log(await supabase.auth.getUser());

// Test database connection
console.log(await supabase.from('profiles').select('*').limit(1));

// Check RLS policies
console.log(await supabase.from('articles').select('*').limit(1));
```

## Support

Jika mengalami masalah:
1. Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
2. Lihat logs di Supabase dashboard
3. Test dengan Postman/curl untuk isolasi masalah
4. Contact support atau buat issue di repository

---

**Selamat! Setup Supabase untuk OPINIKU.ID telah selesai.** 🎉

Aplikasi sekarang memiliki:
- ✅ Authentication system yang aman
- ✅ Role-based access control
- ✅ Database dengan RLS
- ✅ Real-time capabilities
- ✅ File storage (opsional)
- ✅ Serverless functions (opsional)