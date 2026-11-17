# Bongkar Canvas Builder (HTML-First Visual Page Builder)

**Version 1.1.0 (Production Release)**  
Plugin WordPress modern, ultra-ringan, dan *zero-bloat* yang dirancang khusus untuk mengimpor desain AI (HTML/CSS/JS dari Claude, v0, ChatGPT, atau Figma Export) dan mengeditnya secara visual di atas **Standalone Canvas Editor** (seperti Elementor tapi jauh lebih bersih, responsif & cepat).

---

## Cara Memasang di Website WordPress Lain (Tahap Produksi)

Plugin ini telah dirancang 100% portabel dan dapat langsung dipasang di website WordPress mana saja (Shared Hosting, VPS, cPanel, Cloudways, dll.):

### Metode 1: Upload File ZIP via WordPress Admin (Paling Mudah)
1. Unduh paket file `bongkar-builder.zip` (tersedia di root plugin atau hasil build produksi).
2. Masuk ke **WP Admin** di website target Anda (`namadomain.com/wp-admin`).
3. Buka menu **Plugins** -> **Add New (Tambah Baru)** -> klik tombol **Upload Plugin**.
4. Pilih file `bongkar-builder.zip` lalu klik **Install Now**.
5. Klik **Activate Plugin**.
6. Menu baru **Bongkar Builder** akan langsung muncul di sidebar dashboard WordPress Anda!

### Metode 2: Upload via FTP / File Manager (cPanel / Hostinger / Niagahoster)
1. Ekstrak folder `bongkar-builder` ke komputer Anda.
2. Buka File Manager atau FTP (FileZilla) ke website target.
3. Masuk ke direktori: `wp-content/plugins/`
4. Upload folder `bongkar-builder` ke lokasi tersebut.
5. Masuk ke **WP Admin** -> **Plugins** -> klik **Activate** pada *Bongkar Canvas Builder*.

---

## Persyaratan Sistem (System Requirements)
- **WordPress**: Versi 5.8 atau lebih baru (kompatibel penuh dengan WP 6.0 - 6.7+).
- **PHP**: Versi 7.4, 8.0, 8.1, 8.2, atau 8.3+.
- **Web Server**: Apache, Nginx, LiteSpeed, atau Cloudflare (kompatibel 100%).
- **SSL / HTTPS**: Sangat direkomendasikan untuk produksi.

---

## Perbandingan: Bongkar Builder vs Elementor

| Fitur | Elementor | **Bongkar Canvas Builder** |
| :--- | :--- | :--- |
| **Beban DOM** | Tiap elemen dibungkus 4-8 lapis `<div>` (`elementor-widget-wrap`, dll.) | **Zero Wrapper** (Murni tag asli seperti `<section>`, `<h2>`, `<p>`) |
| **Ukuran Aset Frontend** | > 1.5 MB - 3 MB CSS & JS bawaan | **Hanya memuat CSS & JS halaman itu sendiri (< 50 KB)** |
| **Workflow Desain AI / Figma** | Sulit, harus dibuat ulang satu per satu widgetnya | **Tinggal paste / upload HTML+CSS+JS, langsung jadi visual canvas** |
| **Google PageSpeed Score** | Sering turun ke 50-70 jika banyak widget | **Stabil di skor 95-100 (Core Web Vitals Hijau)** |
| **Script & Logika Interaktif** | Rumit / butuh add-on berbayar | **Smart Script Inspector bawaan (Kalkulator, Slider, Accordion berjalan native)** |
| **Ikon Vector** | Terkadang berat / bercampur | **Font Awesome 6 Native Picker (Tajam, Vektor Murni, Anti AI-Slop)** |

---

## Fitur Utama

1. **Dual Canvas Engine (Mode Desain vs Mode Interaktif LIVE)**
   - **Mode Desain (`Alt + Klik`)**: Klik elemen mana saja untuk mengedit teks, tipografi, warna, spacing, atau script.
   - **Mode Interaktif (`Ctrl + I`)**: Mengubah kanvas menjadi web hidup murni. Slider Swiper.js, kalkulator biaya, FAQ accordion, popup modal, dan form WhatsApp berfungsi 100% tanpa hambatan selektor editor.

2. **Smart Script & Algorithm Inspector (Elementor Advanced Style)**
   - Terintegrasi di sub-tab Logika & Skrip panel Inspector: mendeteksi otomatis fungsi JavaScript yang mengontrol tombol/slider yang dipilih (misal `pickPlanType()`, `syncAreaSlider()`).
   - Kode dieksekusi secara native di window global kanvas tanpa tertahan sandbox closure.

3. **In-Place Structure Picker & Dropzone Impor AI**
   - Di antara section mana pun dan di area bawah kanvas, tersedia tombol tambah section in-place dengan preset 1-4 kolom serta dropzone impor AI/HTML.
   - Cukup paste kode mentah dari Claude, v0, ChatGPT, atau Figma, dan landing page langsung ter-render utuh.

4. **Sleek Mobile & Responsive Silhouette (iPhone Flagship 390px)**
   - Viewport mobile modern 390px (standar iPhone 14/15/16 Pro) dengan bezel titanium tipis 6px, Dynamic Island, dan slim overlay scrollbar. Bebas terpotong dan tidak bulky.

5. **Live SEO Google Audit**
   - Mengaudit struktur H1 unik, meta title, meta description, Open Graph media sosial, alt text gambar, dan canonical tag secara real-time dengan skor 0-100.

6. **Integrasi Tracking & Analitik Lengkap**
   - Di tab **Pengaturan**, tersedia field siap pakai untuk Google Analytics (GA4 / GTM), Meta Pixel (Facebook Ads), Microsoft Clarity, serta Custom `<head>` & `<footer>` code.

7. **Zero-Conflict Script Execution Engine (Live & Editor Parity)**
   - Menjalankan seluruh script custom, logika kalkulator, slider Swiper.js, AOS, accordion FAQ, dan popup modal di scope `window` global murni pada halaman live.
   - Dilengkapi safe-tracking stubs (`fbq`, `gtag`, `clarity`, `dataLayer`) agar adblocker tidak menghentikan fungsi interaktif web, serta auto-inject Swiper/AOS CDN jika terdeteksi di markup.

---

## Panduan Singkat Pemakaian

1. **Membuat Halaman Baru**:
   - Masuk ke **Bongkar Builder** -> **Buat Kanvas Kosong** atau klik **Import HTML Langsung**.
   - Masukkan judul halaman lalu klik Simpan. Editor Fullscreen akan langsung terbuka.
2. **Mengimpor Desain**:
   - Di kanvas bawah, klik tombol **"Impor AI / HTML"**.
   - Paste kode HTML lengkap atau upload file `.html` hasil ekspor dari Claude / ChatGPT / Figma.
   - Klik **"Import ke Canvas"**.
3. **Mengedit Secara Visual**:
   - Klik teks langsung di kanvas untuk mengganti tulisan.
   - Gunakan panel kiri **Inspector** untuk memilih Google Font, ukuran font, margin/padding, dan warna.
   - Klik gambar untuk menggantinya via Media Library WordPress.
4. **Menyimpan**:
   - Tekan `Ctrl + S` atau klik tombol **[ Simpan Draft / Perbarui ]** di sudut kanan atas.
5. **Melihat Hasil**:
   - Klik tombol **"Preview"** untuk membuka halaman live di tab baru.

---

## Keamanan & Lisensi
- Berlisensi **GPL-2.0-or-later**. Bebas digunakan, didistribusikan, dan dimodifikasi untuk proyek pribadi maupun klien.
- Dilengkapi verifikasi keamanan WordPress Nonce (`wp_verify_nonce`) dan sanitasi hak akses (`current_user_can('edit_pages')`).
