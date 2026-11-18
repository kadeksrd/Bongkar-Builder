# Bongkar Canvas Builder v1.2.4 Release Notes

## Ringkasan Rilis
Versi 1.2.4 mengembalikan stabilitas penuh ke basis kode stabil teruji (identik dengan rilis beta v1.2.3), serta menambahkan dua fitur utama yang terisolasi secara aman tanpa merusak fungsi yang sudah ada:

### 1. Restorasi Penuh Stabilitas Baseline (Zero Regression)
- Menghapus seluruh injeksi CSS global agresif (`!important`) yang sebelumnya mengganggu tata letak kustom, heading, dan grid pengguna.
- Menghilangkan global click interceptor pada tombol WhatsApp di level dokumen, sehingga tombol WhatsApp mengambang (floating button), tombol kontak header, dan tautan luar lainnya berfungsi 100% normal.
- Mengembalikan logika seleksi elemen dan klik layout kanvas ke alur murni tanpa konflik inline editing atau override berlebih.

### 2. Viewport Desktop Autentik & Scroll Pendek
- Mengembalikan konfigurasi kanvas desktop teruji: `width: 100%; min-width: 1024px; max-width: 100%; margin: 0;`.
- Tampilan kanvas tetap luas dan nyaman untuk desain desktop tanpa adanya ruang kosong hampa di sisi kanan (*ghost margins*).
- Bilah scroll horizontal di kanvas pendek dan proporsional sesuai kebutuhan layar.

### 3. Update HTML Per Section dengan Auto-Check
- Tersedia tombol pada bilah aksi mengambang dan klik kanan (context menu) untuk memperbarui kode HTML khusus pada section terpilih.
- Mekanisme Auto-Check cerdas: Jika pengguna menempelkan kode lengkap (mengandung `<!DOCTYPE>`, `<html>`, `<head>`, `<body>`), sistem secara otomatis mengekstrak blok section dan style-nya saja, mencegah kebocoran tag dokumen ke kanvas.
- Hanya section yang dipilih yang diperbarui; seluruh section lain pada halaman tetap utuh 100%.

### 4. Mesin Formulir Dinamis & WhatsApp
- Pengumpulan field formulir dinamis saat event submit pada form (mengambil label, placeholder, dan nilai input/select/textarea).
- Menghasilkan pesan WhatsApp yang rapi dan terstruktur secara otomatis tanpa kehilangan data masukan pengguna.
- Intersepsi hanya aktif pada event pengiriman `<form>`, tidak mengganggu tautan atau tombol mandiri di luar form.
