# Catatan Rilis Versi 1.2.2 (Release Notes)

Pembaruan v1.2.2 menghadirkan pengalaman visual editing yang lebih lapang, perbaikan penggantian gambar/logo komprehensif, serta integrasi hover pop-up pintar pada kanvas studio.

---

### Ringkasan Pembaruan di Versi 1.2.2:

1. **Badge Hover Edit Pop-up di Kanvas (Topbar Bersih & Ramping):**
   - Menghapus tombol Pop-up dari topbar studio agar area navigasi atas tetap luas, proporsional, dan bebas tumpang-tindih dengan skor SEO maupun mode switcher pada seluruh resolusi laptop (1366px, 1280px).
   - Menghadirkan pill melayang pintar **[ Edit Pop-up ]** yang otomatis muncul saat kursor mouse diarahkan (*hover*) ke elemen pemicu pop-up (seperti floating chat Pak Patrol, tombol WhatsApp, CTA form, atau backdrop modal).
   - Menambahkan tombol aksi cepat pop-up pada floating action toolbar dan inspector ketika elemen pemicu dipilih.

2. **Perbaikan Penggantian Gambar & Logo Antar Protokol (HTTPS Normalization):**
   - Mengatasi masalah gambar logo yang rusak (*broken image*) dengan otomatis menormalisasi URL media HTTP ke HTTPS pada situs WordPress ber-SSL agar tidak diblokir browser sebagai *Mixed Content*.
   - Menyempurnakan deteksi elemen gambar saat diklik: baik klik pada tag `<img>`, tautan pembungkus `<a>`, maupun kontainer `<div>`, sistem langsung membuka Media Library WordPress secara akurat.
   - Mengaktifkan fitur klik ganda (*double-click*) pada kanvas (termasuk avatar tim di dalam modal) untuk langsung memilih gambar dari Media Library.

3. **Event Interception pada Tombol Pemicu Pop-up di Mode Desain:**
   - Memastikan tombol yang memicu pop-up (seperti tombol Konsultasi WhatsApp) dapat diseleksi dan diubah teks/warnanya di mode desain tanpa terpental memicu aksi klik bawaan website.

4. **Penyempurnaan Auto-Updater WordPress:**
   - Deteksi nama folder dan slug plugin secara dinamis untuk menjamin kompatibilitas pembaruan otomatis di latar belakang (*background auto-updates*) pada WordPress 5.5+.
