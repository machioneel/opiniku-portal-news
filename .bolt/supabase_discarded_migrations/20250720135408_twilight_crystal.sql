/*
  # Sample Data for OPINIKU.ID News Portal

  This script inserts comprehensive sample data for testing and demonstration purposes.
  
  ## Data Includes:
  - Sample categories (Politik, Ekonomi, Olahraga, Teknologi, Hiburan)
  - Sample tags for article organization
  - Sample user profiles with different roles
  - Sample articles with various statuses
  - Sample comments and interactions
  - Sample analytics data
  
  ## Note:
  This data is for development and testing purposes only.
  In production, real user data should be handled according to privacy regulations.
*/

-- Insert Categories
INSERT INTO categories (name, slug, description, color_code, icon, sort_order) VALUES
('Politik', 'politik', 'Berita politik dalam dan luar negeri', '#DC2626', 'building-2', 1),
('Ekonomi', 'ekonomi', 'Berita ekonomi, bisnis, dan keuangan', '#059669', 'trending-up', 2),
('Olahraga', 'olahraga', 'Berita olahraga nasional dan internasional', '#EA580C', 'trophy', 3),
('Teknologi', 'teknologi', 'Perkembangan teknologi dan inovasi', '#7C3AED', 'smartphone', 4),
('Hiburan', 'hiburan', 'Berita hiburan, selebriti, dan lifestyle', '#EC4899', 'music', 5),
('Kesehatan', 'kesehatan', 'Informasi kesehatan dan gaya hidup sehat', '#10B981', 'heart', 6),
('Pendidikan', 'pendidikan', 'Berita pendidikan dan pengembangan SDM', '#3B82F6', 'graduation-cap', 7);

-- Insert Tags
INSERT INTO tags (name, slug, description) VALUES
('breaking-news', 'breaking-news', 'Berita terbaru dan mendesak'),
('jakarta', 'jakarta', 'Berita seputar Jakarta'),
('indonesia', 'indonesia', 'Berita nasional Indonesia'),
('covid-19', 'covid-19', 'Berita terkait pandemi COVID-19'),
('pemilu', 'pemilu', 'Berita pemilihan umum'),
('sepak-bola', 'sepak-bola', 'Berita sepak bola'),
('startup', 'startup', 'Berita startup dan teknologi'),
('ekonomi-digital', 'ekonomi-digital', 'Ekonomi digital dan fintech'),
('pendidikan-online', 'pendidikan-online', 'Pembelajaran online dan edtech'),
('lingkungan', 'lingkungan', 'Isu lingkungan dan keberlanjutan');

-- Insert Sample Profiles (these would normally be created through auth)
-- Note: In real implementation, these would be linked to auth.users
INSERT INTO profiles (id, user_id, full_name, role, bio, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Admin OPINIKU', 'super_admin', 'Administrator sistem OPINIKU.ID', true),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Editor Utama', 'editor', 'Editor kepala dengan pengalaman 10 tahun di media', true),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Ahmad Sutrisno', 'journalist', 'Jurnalis politik dengan fokus pada pemerintahan daerah', true),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Sari Dewi', 'journalist', 'Jurnalis ekonomi dan bisnis', true),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'Budi Santoso', 'journalist', 'Jurnalis olahraga dengan spesialisasi sepak bola', true),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', 'Maya Indira', 'contributor', 'Kontributor teknologi dan startup', true),
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', 'Rina Puspita', 'contributor', 'Kontributor hiburan dan lifestyle', true);

-- Insert Sample Articles
INSERT INTO articles (
    id, title, slug, excerpt, content, featured_image_url, author_id, category_id, 
    status, is_featured, is_breaking_news, view_count, published_at, reading_time
) VALUES
(
    '660e8400-e29b-41d4-a716-446655440001',
    'Presiden Jokowi Resmikan Infrastruktur Baru di Jakarta',
    'presiden-jokowi-resmikan-infrastruktur-baru-jakarta',
    'Presiden Joko Widodo meresmikan pembangunan infrastruktur transportasi yang diharapkan dapat mengurangi kemacetan di Jakarta.',
    'Jakarta - Presiden Joko Widodo (Jokowi) meresmikan pembangunan infrastruktur transportasi baru di Jakarta pada hari ini. Infrastruktur ini diharapkan dapat mengurangi kemacetan yang selama ini menjadi masalah utama di ibu kota.

Dalam sambutannya, Presiden Jokowi menekankan pentingnya pembangunan infrastruktur yang berkelanjutan dan ramah lingkungan. "Pembangunan ini bukan hanya untuk mengatasi kemacetan, tetapi juga untuk meningkatkan kualitas hidup masyarakat Jakarta," ujar Presiden.

Proyek infrastruktur ini melibatkan pembangunan jalur transportasi massal yang terintegrasi dengan sistem transportasi yang sudah ada. Diharapkan dengan adanya infrastruktur baru ini, mobilitas masyarakat Jakarta akan semakin lancar dan efisien.

Gubernur DKI Jakarta juga menyambut baik pembangunan infrastruktur ini dan berkomitmen untuk mendukung penuh implementasinya. "Kami akan memastikan bahwa infrastruktur ini dapat dimanfaatkan secara optimal oleh masyarakat," kata Gubernur.

Pembangunan infrastruktur ini merupakan bagian dari program pemerintah untuk meningkatkan konektivitas dan mengurangi kesenjangan pembangunan antar wilayah.',
    'https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=800',
    '550e8400-e29b-41d4-a716-446655440003',
    (SELECT id FROM categories WHERE slug = 'politik'),
    'published',
    true,
    true,
    15420,
    now() - interval '2 hours',
    5
),
(
    '660e8400-e29b-41d4-a716-446655440002',
    'Ekonomi Indonesia Tumbuh 5.2% di Kuartal III 2024',
    'ekonomi-indonesia-tumbuh-52-persen-kuartal-3-2024',
    'Badan Pusat Statistik melaporkan pertumbuhan ekonomi Indonesia mencapai 5.2% pada kuartal ketiga tahun 2024.',
    'Jakarta - Badan Pusat Statistik (BPS) melaporkan bahwa ekonomi Indonesia mengalami pertumbuhan sebesar 5.2% pada kuartal ketiga tahun 2024. Angka ini menunjukkan peningkatan yang signifikan dibandingkan kuartal sebelumnya.

Kepala BPS menjelaskan bahwa pertumbuhan ini didorong oleh beberapa sektor utama, termasuk manufaktur, perdagangan, dan jasa. "Sektor manufaktur memberikan kontribusi terbesar dengan pertumbuhan 6.1%, diikuti oleh sektor perdagangan yang tumbuh 4.8%," ungkap Kepala BPS.

Pertumbuhan ekonomi ini juga didukung oleh meningkatnya konsumsi rumah tangga dan investasi. Konsumsi rumah tangga tumbuh 5.0%, sementara investasi atau pembentukan modal tetap bruto tumbuh 4.5%.

Dari sisi pengeluaran, konsumsi pemerintah juga mengalami peningkatan sebesar 3.2%. Hal ini menunjukkan komitmen pemerintah dalam mendorong pertumbuhan ekonomi melalui berbagai program pembangunan.

Meskipun mengalami pertumbuhan positif, BPS juga mencatat beberapa tantangan yang masih dihadapi, termasuk inflasi dan ketidakpastian ekonomi global. Namun, proyeksi untuk kuartal keempat tetap optimis dengan berbagai kebijakan stimulus yang telah disiapkan pemerintah.',
    'https://images.pexels.com/photos/164686/pexels-photo-164686.jpeg?auto=compress&cs=tinysrgb&w=800',
    '550e8400-e29b-41d4-a716-446655440004',
    (SELECT id FROM categories WHERE slug = 'ekonomi'),
    'published',
    true,
    false,
    8750,
    now() - interval '4 hours',
    4
),
(
    '660e8400-e29b-41d4-a716-446655440003',
    'Tim Nasional Indonesia Lolos ke Final Piala AFF 2024',
    'timnas-indonesia-lolos-final-piala-aff-2024',
    'Timnas Indonesia berhasil mengalahkan Thailand dengan skor 2-1 dan melaju ke partai final Piala AFF 2024.',
    'Bangkok - Tim Nasional Indonesia berhasil meraih kemenangan dramatis atas Thailand dengan skor 2-1 dalam pertandingan semifinal Piala AFF 2024. Kemenangan ini mengantarkan Garuda ke partai final untuk pertama kalinya dalam 10 tahun terakhir.

Pertandingan yang berlangsung di Stadion Rajamangala, Bangkok, berjalan sangat ketat sejak menit awal. Thailand sempat unggul lebih dulu melalui gol Chanathip Songkrasin di menit ke-23. Namun, Indonesia tidak menyerah dan terus melakukan tekanan.

Gol penyama kedudukan datang di menit ke-67 melalui aksi brilian Egy Maulana Vikri yang memanfaatkan umpan silang dari sayap kanan. Stadion yang didominasi suporter Thailand mendadak hening.

Gol kemenangan Indonesia datang di masa injury time melalui sundulan Marselino Ferdinan yang memanfaatkan bola muntah dari tendangan bebas. Gol ini membuat para pemain dan official Indonesia meledak dalam kegembiraan.

Pelatih Shin Tae-yong mengungkapkan rasa bangganya terhadap performa tim. "Para pemain telah menunjukkan mental juara dan kerja keras yang luar biasa. Kami akan mempersiapkan diri sebaik mungkin untuk final," ujar pelatih asal Korea Selatan itu.

Indonesia akan menghadapi Vietnam di partai final yang akan digelar di Stadion Gelora Bung Karno, Jakarta, pada Minggu mendatang.',
    'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=800',
    '550e8400-e29b-41d4-a716-446655440005',
    (SELECT id FROM categories WHERE slug = 'olahraga'),
    'published',
    true,
    false,
    12300,
    now() - interval '6 hours',
    3
),
(
    '660e8400-e29b-41d4-a716-446655440004',
    'Teknologi AI Mulai Diterapkan di Sektor Pendidikan',
    'teknologi-ai-diterapkan-sektor-pendidikan',
    'Kementerian Pendidikan mengumumkan pilot project penerapan kecerdasan buatan untuk meningkatkan kualitas pembelajaran.',
    'Jakarta - Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi (Kemendikbudristek) mengumumkan dimulainya pilot project penerapan teknologi kecerdasan buatan (AI) di sektor pendidikan. Program ini bertujuan untuk meningkatkan kualitas pembelajaran dan efektivitas proses belajar mengajar.

Menteri Pendidikan menjelaskan bahwa teknologi AI akan digunakan untuk personalisasi pembelajaran, dimana setiap siswa akan mendapatkan materi dan metode pembelajaran yang disesuaikan dengan kemampuan dan gaya belajar mereka. "AI akan membantu guru dalam mengidentifikasi kebutuhan belajar setiap siswa secara individual," ujar Menteri.

Pilot project ini akan dimulai di 100 sekolah pilihan di seluruh Indonesia, mencakup jenjang SD, SMP, dan SMA. Sekolah-sekolah yang terpilih akan mendapatkan pelatihan khusus untuk guru dan fasilitas teknologi yang memadai.

Beberapa fitur AI yang akan diterapkan antara lain sistem tutor virtual, analisis kemajuan belajar siswa secara real-time, dan rekomendasi materi pembelajaran yang adaptif. Sistem ini juga akan membantu guru dalam menyusun rencana pembelajaran yang lebih efektif.

Direktur Jenderal Pendidikan Dasar dan Menengah menekankan bahwa penerapan AI ini tidak akan menggantikan peran guru, melainkan memperkuat dan mendukung proses pembelajaran. "Guru tetap menjadi ujung tombak pendidikan, AI hanya alat bantu untuk meningkatkan efektivitas," tegasnya.

Program ini diharapkan dapat meningkatkan literasi digital siswa dan mempersiapkan mereka menghadapi era digital yang semakin berkembang.',
    'https://images.pexels.com/photos/8439093/pexels-photo-8439093.jpeg?auto=compress&cs=tinysrgb&w=800',
    '550e8400-e29b-41d4-a716-446655440006',
    (SELECT id FROM categories WHERE slug = 'teknologi'),
    'published',
    true,
    false,
    6420,
    now() - interval '8 hours',
    4
),
(
    '660e8400-e29b-41d4-a716-446655440005',
    'Film Indonesia Raih Penghargaan di Festival Cannes',
    'film-indonesia-raih-penghargaan-festival-cannes',
    'Sutradara muda Indonesia berhasil meraih penghargaan bergengsi di ajang Festival Film Cannes 2024.',
    'Cannes - Industri perfilman Indonesia kembali menorehkan prestasi membanggakan di kancah internasional. Film "Senja di Jakarta" karya sutradara muda Indonesia, Riri Riza, berhasil meraih penghargaan "Un Certain Regard" di Festival Film Cannes 2024.

Film yang mengangkat tema kehidupan urban Jakarta ini mendapat apresiasi tinggi dari juri internasional. Dalam film tersebut, Riri Riza berhasil menggambarkan dinamika kehidupan masyarakat Jakarta dengan pendekatan sinematografi yang unik dan narasi yang kuat.

"Saya sangat terharu dan bangga bisa membawa nama Indonesia di festival film paling bergengsi di dunia. Ini adalah pencapaian untuk seluruh insan perfilman Indonesia," ungkap Riri Riza dalam konferensi pers di Cannes.

Film "Senja di Jakarta" dibintangi oleh aktor dan aktris ternama Indonesia seperti Iqbaal Ramadhan, Marsha Timothy, dan Reza Rahadian. Cerita film ini mengikuti perjalanan tiga karakter yang berbeda latar belakang namun terhubung oleh takdir di tengah hiruk pikuk ibu kota.

Produser film, Mira Lesmana, mengatakan bahwa film ini merupakan hasil kolaborasi tim kreatif muda Indonesia yang ingin menunjukkan sisi lain Jakarta yang jarang terekspos. "Kami ingin menampilkan Jakarta bukan hanya sebagai kota metropolitan, tapi juga sebagai tempat bertemunya berbagai mimpi dan harapan," jelasnya.

Penghargaan ini diharapkan dapat membuka jalan bagi film-film Indonesia lainnya untuk lebih dikenal di pasar internasional.',
    'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800',
    '550e8400-e29b-41d4-a716-446655440007',
    (SELECT id FROM categories WHERE slug = 'hiburan'),
    'published',
    false,
    false,
    4850,
    now() - interval '10 hours',
    3
),
(
    '660e8400-e29b-41d4-a716-446655440006',
    'Kebijakan Baru Subsidi BBM Untuk Masyarakat Kurang Mampu',
    'kebijakan-baru-subsidi-bbm-masyarakat-kurang-mampu',
    'Pemerintah mengumumkan kebijakan subsidi BBM yang lebih terarah untuk membantu masyarakat berpenghasilan rendah.',
    'Jakarta - Pemerintah mengumumkan kebijakan baru terkait subsidi bahan bakar minyak (BBM) yang lebih terarah untuk masyarakat kurang mampu. Kebijakan ini merupakan bagian dari upaya pemerintah untuk mengurangi beban ekonomi masyarakat di tengah tekanan inflasi global.

Menteri Energi dan Sumber Daya Mineral menjelaskan bahwa subsidi BBM akan diberikan melalui sistem voucher digital yang dapat diakses melalui aplikasi khusus. "Sistem ini akan memastikan bahwa subsidi benar-benar sampai kepada yang berhak dan mengurangi penyalahgunaan," ujar Menteri.

Kriteria penerima subsidi BBM meliputi keluarga dengan penghasilan di bawah Rp 3 juta per bulan, pemilik kendaraan bermotor dengan kapasitas mesin di bawah 150cc, dan pelaku usaha mikro yang terdaftar. Data penerima akan diverifikasi melalui sistem terintegrasi dengan berbagai kementerian.

Setiap keluarga yang memenuhi kriteria akan mendapatkan kuota subsidi BBM sebesar 20 liter per bulan untuk Pertalite. Subsidi ini dapat digunakan di seluruh SPBU yang telah terintegrasi dengan sistem digital pemerintah.

Direktur Jenderal Migas menekankan bahwa implementasi kebijakan ini akan dilakukan secara bertahap, dimulai dari wilayah Jabodetabek pada bulan depan, kemudian diperluas ke seluruh Indonesia dalam waktu enam bulan.

Pemerintah juga menyiapkan program sosialisasi masif untuk memastikan masyarakat memahami mekanisme dan cara mengakses subsidi BBM baru ini. "Kami akan bekerja sama dengan berbagai pihak untuk memastikan program ini berjalan lancar," tambah Direktur Jenderal.',
    'https://images.pexels.com/photos/164684/pexels-photo-164684.jpeg?auto=compress&cs=tinysrgb&w=800',
    '550e8400-e29b-41d4-a716-446655440004',
    (SELECT id FROM categories WHERE slug = 'ekonomi'),
    'pending',
    false,
    false,
    0,
    NULL,
    4
),
(
    '660e8400-e29b-41d4-a716-446655440007',
    'Inovasi Startup Indonesia di Bidang FinTech',
    'inovasi-startup-indonesia-bidang-fintech',
    'Beberapa startup Indonesia menunjukkan inovasi menarik dalam sektor teknologi finansial yang mulai menarik perhatian investor global.',
    'Jakarta - Ekosistem startup Indonesia di bidang financial technology (fintech) terus menunjukkan perkembangan yang menggembirakan. Beberapa startup lokal berhasil mengembangkan inovasi yang tidak hanya menarik perhatian investor dalam negeri, tetapi juga investor global.

Salah satu inovasi yang menonjol adalah pengembangan sistem pembayaran digital yang terintegrasi dengan berbagai platform e-commerce dan layanan publik. Startup ini berhasil menciptakan solusi pembayaran yang lebih mudah dan aman bagi masyarakat Indonesia.

CEO salah satu startup fintech terkemuka menjelaskan bahwa fokus utama mereka adalah financial inclusion, yaitu memberikan akses layanan keuangan kepada masyarakat yang selama ini belum terjangkau oleh perbankan konvensional. "Kami ingin memastikan bahwa setiap orang Indonesia dapat mengakses layanan keuangan dengan mudah dan aman," ungkapnya.

Inovasi lain yang berkembang adalah sistem kredit scoring berbasis artificial intelligence yang dapat menilai kelayakan kredit seseorang berdasarkan data digital footprint. Sistem ini memungkinkan pemberian kredit yang lebih cepat dan akurat, terutama untuk UMKM yang selama ini kesulitan mengakses modal.

Asosiasi Fintech Indonesia mencatat bahwa jumlah pengguna layanan fintech di Indonesia telah mencapai 150 juta orang pada tahun 2024, meningkat 25% dibandingkan tahun sebelumnya. Pertumbuhan ini didorong oleh meningkatnya literasi digital dan kepercayaan masyarakat terhadap teknologi finansial.

Pemerintah juga mendukung perkembangan sektor fintech melalui berbagai regulasi yang mendukung inovasi namun tetap menjaga aspek perlindungan konsumen dan stabilitas sistem keuangan.',
    'https://images.pexels.com/photos/7567434/pexels-photo-7567434.jpeg?auto=compress&cs=tinysrgb&w=800',
    '550e8400-e29b-41d4-a716-446655440006',
    (SELECT id FROM categories WHERE slug = 'teknologi'),
    'pending',
    false,
    false,
    0,
    NULL,
    5
);

-- Link articles with tags
INSERT INTO article_tags (article_id, tag_id) VALUES
('660e8400-e29b-41d4-a716-446655440001', (SELECT id FROM tags WHERE slug = 'breaking-news')),
('660e8400-e29b-41d4-a716-446655440001', (SELECT id FROM tags WHERE slug = 'jakarta')),
('660e8400-e29b-41d4-a716-446655440001', (SELECT id FROM tags WHERE slug = 'indonesia')),
('660e8400-e29b-41d4-a716-446655440002', (SELECT id FROM tags WHERE slug = 'indonesia')),
('660e8400-e29b-41d4-a716-446655440002', (SELECT id FROM tags WHERE slug = 'ekonomi-digital')),
('660e8400-e29b-41d4-a716-446655440003', (SELECT id FROM tags WHERE slug = 'sepak-bola')),
('660e8400-e29b-41d4-a716-446655440003', (SELECT id FROM tags WHERE slug = 'indonesia')),
('660e8400-e29b-41d4-a716-446655440004', (SELECT id FROM tags WHERE slug = 'pendidikan-online')),
('660e8400-e29b-41d4-a716-446655440004', (SELECT id FROM tags WHERE slug = 'indonesia')),
('660e8400-e29b-41d4-a716-446655440006', (SELECT id FROM tags WHERE slug = 'ekonomi-digital')),
('660e8400-e29b-41d4-a716-446655440007', (SELECT id FROM tags WHERE slug = 'startup'));

-- Insert Sample Comments
INSERT INTO comments (article_id, author_id, content, status) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006', 'Semoga infrastruktur baru ini benar-benar dapat mengatasi masalah kemacetan di Jakarta. Sudah saatnya pemerintah fokus pada transportasi publik yang berkualitas.', 'approved'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440007', 'Pembangunan infrastruktur memang penting, tapi jangan lupa juga dengan pemeliharaan infrastruktur yang sudah ada.', 'approved'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'Pertumbuhan ekonomi yang positif ini harus diimbangi dengan pemerataan kesejahteraan. Semoga manfaatnya dapat dirasakan oleh seluruh lapisan masyarakat.', 'approved'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'Luar biasa! Timnas Indonesia akhirnya bisa lolos ke final lagi. Semoga bisa juara di kandang sendiri.', 'approved'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006', 'Permainan yang sangat menegangkan! Gol injury time Marselino benar-benar dramatis. Garuda memang hebat!', 'approved');

-- Insert Sample Article Approvals
INSERT INTO article_approvals (article_id, approver_id, status, comments, approved_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'approved', 'Artikel sangat informatif dan sesuai dengan standar editorial. Siap untuk dipublikasi.', now() - interval '2 hours'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'approved', 'Data ekonomi akurat dan analisis mendalam. Artikel berkualitas tinggi.', now() - interval '4 hours'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'approved', 'Liputan olahraga yang menarik dengan detail pertandingan yang lengkap.', now() - interval '6 hours'),
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'pending', 'Artikel menarik, namun perlu verifikasi lebih lanjut terkait data subsidi. Mohon tambahkan sumber resmi dari kementerian.', NULL);

-- Insert Sample Newsletter Subscriptions
INSERT INTO newsletters (email, full_name, is_verified) VALUES
('subscriber1@example.com', 'Andi Wijaya', true),
('subscriber2@example.com', 'Siti Nurhaliza', true),
('subscriber3@example.com', 'Budi Prasetyo', true),
('subscriber4@example.com', 'Dewi Sartika', false),
('subscriber5@example.com', 'Rudi Hermawan', true);

-- Insert Sample Analytics Data
INSERT INTO analytics (article_id, session_id, event_type, page_url) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'sess_001', 'view', '/artikel/presiden-jokowi-resmikan-infrastruktur-baru-jakarta'),
('660e8400-e29b-41d4-a716-446655440001', 'sess_002', 'view', '/artikel/presiden-jokowi-resmikan-infrastruktur-baru-jakarta'),
('660e8400-e29b-41d4-a716-446655440001', 'sess_003', 'like', '/artikel/presiden-jokowi-resmikan-infrastruktur-baru-jakarta'),
('660e8400-e29b-41d4-a716-446655440002', 'sess_004', 'view', '/artikel/ekonomi-indonesia-tumbuh-52-persen-kuartal-3-2024'),
('660e8400-e29b-41d4-a716-446655440002', 'sess_005', 'share', '/artikel/ekonomi-indonesia-tumbuh-52-persen-kuartal-3-2024'),
('660e8400-e29b-41d4-a716-446655440003', 'sess_006', 'view', '/artikel/timnas-indonesia-lolos-final-piala-aff-2024'),
('660e8400-e29b-41d4-a716-446655440003', 'sess_007', 'comment', '/artikel/timnas-indonesia-lolos-final-piala-aff-2024');

-- Insert Sample Notifications
INSERT INTO notifications (recipient_id, sender_id, type, title, message, data) VALUES
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'article_approved', 'Artikel Disetujui', 'Artikel "Presiden Jokowi Resmikan Infrastruktur Baru di Jakarta" telah disetujui dan dipublikasi.', '{"article_id": "660e8400-e29b-41d4-a716-446655440001"}'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'article_approved', 'Artikel Disetujui', 'Artikel "Ekonomi Indonesia Tumbuh 5.2% di Kuartal III 2024" telah disetujui dan dipublikasi.', '{"article_id": "660e8400-e29b-41d4-a716-446655440002"}'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'article_approved', 'Artikel Disetujui', 'Artikel "Tim Nasional Indonesia Lolos ke Final Piala AFF 2024" telah disetujui dan dipublikasi.', '{"article_id": "660e8400-e29b-41d4-a716-446655440003"}');

-- Update view counts to match the articles
UPDATE articles SET view_count = 15420 WHERE id = '660e8400-e29b-41d4-a716-446655440001';
UPDATE articles SET view_count = 8750 WHERE id = '660e8400-e29b-41d4-a716-446655440002';
UPDATE articles SET view_count = 12300 WHERE id = '660e8400-e29b-41d4-a716-446655440003';
UPDATE articles SET view_count = 6420 WHERE id = '660e8400-e29b-41d4-a716-446655440004';
UPDATE articles SET view_count = 4850 WHERE id = '660e8400-e29b-41d4-a716-446655440005';