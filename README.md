# Bongkar Canvas Builder (HTML-First Visual Page Builder)

**Version 1.2.2 (Production Release)**  
Plugin WordPress modern, ultra-ringan, dan *zero-bloat* yang dirancang khusus untuk mengimpor desain AI (HTML/CSS/JS dari Claude, v0, ChatGPT, atau Figma Export) dan mengeditnya secara visual di atas **Standalone Canvas Editor** (seperti Elementor tapi jauh lebih bersih, responsif, dan berkecepatan tinggi).

---

## Filosofi & Arsitektur Utama

Bongkar Canvas Builder dibangun dengan pendekatan **HTML-First & Clean DOM Architecture**. Tidak seperti page builder konvensional yang membungkus setiap elemen dengan 4 hingga 8 lapis tag `<div>` ekstra, Bongkar Builder menghasilkan markup HTML semantik asli tanpa wrapper yang tidak perlu.

1. **Zero DOM Bloat:** Menghasilkan kode bersih setara buatan tangan developer senior (`<section>`, `<header>`, `<h2>`, `<p>`).
2. **PageSpeed Core Web Vitals Hijau:** Bobot aset frontend halaman rata-rata di bawah 50 KB, menjaga skor Google PageSpeed stabil di angka 95-100.
3. **Pemisahan Draf & Tampilan Publik:** Memiliki engine draft mandiri berstandar Elementor. Seluruh pengeditan disimpan aman sebagai draft hingga Anda mengeklik tombol *Perbarui* untuk mempublikasikannya.

---

## Fitur Utama & Kemampuan Sistem

### 1. Dual Canvas Interaction Engine
Editor kanvas dilengkapi dua mode kerja terintegrasi:
- **Mode Desain:** Menyeleksi, mengatur posisi, mengubah tipografi, mengganti gambar, dan mengedit konten visual dengan bantuan floating toolbar kontekstual.
- **Mode Interaktif LIVE (Shortcut: `Ctrl + I`):** Menjalankan slider Swiper, modal pop-up, menu hamburger, kalkulator, accordion, dan form WhatsApp secara langsung seperti diakses pengunjung asli tanpa gangguan selektor editor.

### 2. Smart Pop-up & Modal Engine
Sistem pengelolaan pop-up dan modal tanpa merusak alur desain:
- **Hover Trigger Pill di Kanvas:** Mengarahkan kursor mouse ke arah elemen pemicu (seperti floating chat widget, tombol WhatsApp, atau CTA pendaftaran) memunculkan tombol melayang pintar **[ Edit Pop-up ]**.
- **Mode Edit Modal Terkunci & Stabil:** Pop-up akan tetap terbuka selama proses editing sehingga teks judul, form konsultasi, dan foto avatar dapat dimodifikasi dengan nyaman tanpa risiko modal menutup sendiri.
- **Event Interception di Mode Desain:** Tombol pemicu pop-up dapat diklik untuk diubah teks atau warnanya tanpa terpental membuka modal.

### 3. Inspector 4 Sub-Tab Profesional
Panel kontrol samping tertata rapi dalam 4 sub-tab intuitif:
- **Sub-Tab Konten (Content):** Penggantian tag semantik (H1-H6, P, DIV, SPAN), edit teks instan, pengaturan gambar & alt text SEO, tujuan tautan, serta integrasi tombol WhatsApp dan webhook Google Sheets.
- **Sub-Tab Gaya (Style):** Katalog Google Fonts terintegrasi, kontrol ukuran font (PX / Slider), ketebalan (300-900), perataan teks, palet warna teks/latar, border radius, dan box shadow.
- **Sub-Tab Tata Letak (Layout):** Dimensi universal (Width & Height dengan opsi %, PX, EM, AUTO) untuk seluruh elemen, kontrol Flexbox (arah kolom/baris, alignment), preset proporsi kolom instan (50:50, 60:40, 70:30, 40:60, 3 Kolom), serta kontrol padding dan margin responsif.
- **Sub-Tab Logika & Skrip (Logic & Script):** Editor script JavaScript mandiri per-elemen, preset algoritma siap pakai (Swiper slider, FAQ Accordion, Tab Navigasi, Countdown Timer, Form Webhook), deteksi event inline (`onclick`, `oninput`, `onsubmit`), dan konsol eksekusi.

### 4. Presisi Gambar & Media Antar Protokol
- **Normalisasi Otomatis HTTPS (Anti Mixed-Content):** Otomatis menyelaraskan URL media berawalan HTTP ke HTTPS pada website ber-SSL, menjamin logo dan avatar tidak diblokir browser.
- **Deteksi Fleksibel Gambar & Tag Pembungkus:** Mendukung seleksi gambar baik yang berdiri sendiri (`<img>`), terbungkus tautan logo (`<a>`), maupun kontainer kartu (`<div>`).
- **Klik Ganda Kanvas (Quick Media Picker):** Melakukan *double-click* pada elemen gambar di kanvas langsung membuka WordPress Media Library.

### 5. In-Place Section Structure Dropzone
Menyisipkan section baru secara presisi tepat di antara section yang diinginkan melalui dropzone pemilih struktur kolom instan (1 Kolom, 2 Kolom 50:50, 2 Kolom 66:33, 3 Kolom, 4 Kolom) tanpa perlu melompat ke ujung bawah halaman.

### 6. Universal Cross-Site Clipboard (Portabilitas Lintas Domain)
Fitur salin-tempel mandiri berbasis HTML comment wrapper:
- Salin (*Copy / Ctrl+C*) elemen, kolom, maupun seluruh section dari **Website A**.
- Buka kanvas editor di **Website B** (domain berbeda) lalu tempel (*Paste / Ctrl+V*).
- Seluruh struktur layout, class CSS, dan inline style berpindah sempurna secara instan.

### 7. Live Google SEO Intelligence & Score
Audit real-time berstandar Google:
- Memantau keunikan tag H1, panjang Meta Title, deskripsi Meta Description, Open Graph kartu media sosial, dan kelengkapan Alt Text gambar.
- Skor SEO dinamis (0-100) langsung terpantau di header studio.

### 8. Native GitHub Auto-Updater (Pembaruan 1-Klik)
Terhubung langsung ke repositori resmi GitHub:
- WordPress akan otomatis menampilkan notifikasi ketika rilis pembaruan tersedia.
- Pembaruan dapat dilakukan hanya dengan 1 klik via menu **Plugins** tanpa perlu mengunduh dan mengunggah ulang file zip secara manual.

---

## Perbandingan: Bongkar Builder vs Elementor

| Parameter | Elementor | **Bongkar Canvas Builder** |
| :--- | :--- | :--- |
| **Beban DOM** | Tiap elemen dibungkus 4-8 lapis `<div>` (`elementor-widget-wrap`) | **Zero Wrapper** (Tag semantik asli `<section>`, `<h2>`, `<p>`) |
| **Ukuran Aset Frontend** | > 1.5 MB - 3 MB CSS & JS bawaan | **Hanya memuat CSS & JS halaman itu sendiri (< 50 KB)** |
| **Alur Desain AI / Figma** | Sulit, harus menyusun ulang widget satu per satu | **Tempel kode HTML+CSS+JS, seketika jadi visual canvas** |
| **Google PageSpeed Score** | Sering turun ke skor 50-70 | **Stabil di skor 95-100 (Core Web Vitals Hijau)** |
| **Dimensi Universal Elemen** | Terbatas pada container/kolom tertentu | **Width & Height aktif untuk SEMUA elemen (teks/gambar/box)** |
| **Organisasi Panel** | Menumpuk dalam satu scroll panjang | **4 Sub-Tab Rapi (Konten, Gaya, Tata Letak, Logika)** |
| **Lisensi & Auto Update** | Lisensi berbayar per-domain | **Native GitHub Auto-Updater bawaan (1-Klik via GitHub Releases)** |

---

## Cara Memasang di Website WordPress Lain

### Metode 1: Upload File ZIP via WordPress Admin (Paling Praktis)
1. Unduh paket rilis file `bongkar-builder.zip` dari [GitHub Releases](https://github.com/kadeksrd/Bongkar-Builder/releases).
2. Masuk ke **WP Admin** di website target (`namadomain.com/wp-admin`).
3. Buka menu **Plugins** -> **Add New (Tambah Baru)** -> klik tombol **Upload Plugin**.
4. Pilih file `bongkar-builder.zip` lalu klik **Install Now**.
5. Klik **Activate Plugin**. Menu **Bongkar Builder** akan langsung aktif di sidebar dashboard WordPress.

### Metode 2: Upload via FTP / File Manager (cPanel / VPS / Cloudways)
1. Ekstrak file zip sehingga menghasilkan folder `bongkar-builder`.
2. Masuk ke direktori: `wp-content/plugins/` di server hosting.
3. Upload folder `bongkar-builder` ke direktori tersebut.
4. Masuk ke **WP Admin** -> **Plugins** -> klik **Activate** pada *Bongkar Canvas Builder*.

---

## Persyaratan Sistem (System Requirements)
- **WordPress**: Versi 5.8 atau lebih baru (kompatibel penuh dengan WP 6.0 hingga 6.7+).
- **PHP**: Versi 7.4, 8.0, 8.1, 8.2, atau 8.3+.
- **Web Server**: Apache, Nginx, LiteSpeed, atau Cloudflare (kompatibel 100%).
- **Browser**: Chrome, Edge, Safari, Firefox versi modern.

---

## Keamanan & Lisensi
- Berlisensi **GPL-2.0-or-later**. Bebas digunakan, didistribusikan, dan dimodifikasi untuk proyek pribadi maupun klien komersial.
- Dilengkapi verifikasi keamanan WordPress Nonce (`wp_verify_nonce`), sanitasi hak akses (`current_user_can('edit_pages')`), dan Content Shield.
