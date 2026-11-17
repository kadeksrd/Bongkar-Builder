# Bongkar Canvas Builder (HTML-First Visual Page Builder)

**Version 1.2.2 (Production Release)**  
Plugin WordPress modern, ultra-ringan, dan *zero-bloat* yang dirancang khusus untuk mengimpor desain AI (HTML/CSS/JS dari Claude, v0, ChatGPT, atau Figma Export) dan mengeditnya secara visual di atas **Standalone Canvas Editor** (seperti Elementor tapi jauh lebih bersih, responsif, dan cepat).

---

## Fitur Baru Versi 1.2.2: Mode Edit Pop-up & Presisi Gambar

1. **Mode Edit Pop-up / Modal Khusus:**  
   - Menambahkan tombol dedicated **"Edit Pop-up"** di topbar studio dan banner kontrol kanvas.
   - Mengunci pop-up/modal agar tetap terbuka dan stabil selama proses desain, sehingga gambar avatar tim, judul modal, dan formulir konsultasi dapat diedit dengan mudah tanpa risiko pop-up menutup sendiri.
2. **Event Interception pada Tombol Pemicu Pop-up:**  
   - Menggunakan event capturing pada mode desain agar tombol pembuka modal (seperti tombol WhatsApp atau Konsultasi) dapat diklik untuk diubah teks, ukuran, atau warnanya tanpa terpental membuka pop-up.
3. **Perbaikan Penggantian Gambar & Logo Komprehensif:**  
   - Mendeteksi elemen gambar baik yang berdiri sendiri (`<img>`), terbungkus tautan logo (`<a>`), maupun pembungkus kontainer (`<div>`).
   - Menyuntikkan pembaruan URL langsung ke properti DOM browser untuk menjamin reload gambar seketika, serta otomatis membersihkan atribut `srcset` dan elemen `<picture><source>` lama agar tidak menimpa gambar baru.

---

## Portabilitas Penuh & Kompatibilitas Antar Website (Cross-Domain Ready)

Bongkar Canvas Builder dirancang **100% portabel** dan dapat langsung dipasang serta digunakan antar website WordPress mana saja tanpa batasan lisensi domain:

1. **Zero Hardcoded URLs & Path Dinamis:**  
   Seluruh aset, AJAX endpoint, canvas runner, dan font loader menggunakan fungsi dinamis WordPress (`plugin_dir_url`, `plugin_dir_path`, `home_url`). Plugin dapat dipindahkan antar localhost (Laragon/XAMPP), staging server, hingga domain live production tanpa perlu migrasi URL.
2. **Universal Cross-Site Clipboard (Copy-Paste Antar Website):**  
   Dilengkapi sistem clipboard mandiri berstandar HTML comment wrapper. Anda dapat menyalin (*Copy*) elemen, tombol, form, maupun seluruh section dari **Website A**, lalu langsung menempelkannya (*Paste*) di kanvas **Website B** tanpa kehilangan styling maupun struktur kolom.
3. **Standalone Canvas Tanpa Terikat Tema:**  
   Menghasilkan markup HTML asli yang disimpan ke dalam post meta. Tidak bergantung pada dependensi tema apa pun dan kompatibel penuh dengan Astra, GeneratePress, Hello Elementor, Kadence, Block themes, maupun instalasi WordPress polos.
4. **Native GitHub Auto-Updater (Pembaruan 1 Klik):**  
   Setiap website WordPress yang memasang plugin ini terhubung langsung ke rilis resmi GitHub. Ketika rilis versi baru diterbitkan, dashboard WordPress di website mana pun akan otomatis memunculkan notifikasi resmi dan dapat di-update hanya dengan mengklik tombol **"Update Now"**.

---

## Cara Memasang di Website WordPress Lain

### Metode 1: Upload File ZIP via WordPress Admin (Paling Praktis)
1. Unduh paket rilis file `bongkar-builder.zip` dari [GitHub Releases](https://github.com/kadeksrd/Bongkar-Builder/releases).
2. Masuk ke **WP Admin** di website target Anda (`namadomain.com/wp-admin`).
3. Buka menu **Plugins** -> **Add New (Tambah Baru)** -> klik tombol **Upload Plugin**.
4. Pilih file `bongkar-builder.zip` lalu klik **Install Now**.
5. Klik **Activate Plugin**.
6. Menu **Bongkar Builder** akan langsung aktif di sidebar dashboard WordPress Anda.

### Metode 2: Upload via FTP / File Manager (cPanel / VPS / Cloudways)
1. Ekstrak file zip sehingga menghasilkan folder `bongkar-builder`.
2. Masuk ke direktori: `wp-content/plugins/` di hosting tujuan.
3. Upload folder `bongkar-builder` ke direktori tersebut.
4. Masuk ke **WP Admin** -> **Plugins** -> klik **Activate** pada *Bongkar Canvas Builder*.

---

## Persyaratan Sistem (System Requirements)
- **WordPress**: Versi 5.8 atau lebih baru (kompatibel penuh dengan WP 6.0 hingga 6.7+).
- **PHP**: Versi 7.4, 8.0, 8.1, 8.2, atau 8.3+.
- **Web Server**: Apache, Nginx, LiteSpeed, atau Cloudflare (kompatibel 100%).
- **Browser**: Chrome, Edge, Safari, Firefox versi modern.

---

## Perbandingan: Bongkar Builder vs Elementor

| Fitur | Elementor | **Bongkar Canvas Builder** |
| :--- | :--- | :--- |
| **Beban DOM** | Tiap elemen dibungkus 4-8 lapis `<div>` (`elementor-widget-wrap`, dll.) | **Zero Wrapper** (Murni tag asli seperti `<section>`, `<h2>`, `<p>`) |
| **Ukuran Aset Frontend** | > 1.5 MB - 3 MB CSS & JS bawaan | **Hanya memuat CSS & JS halaman itu sendiri (< 50 KB)** |
| **Workflow Desain AI / Figma** | Sulit, harus dibuat ulang satu per satu widgetnya | **Tinggal paste / upload HTML+CSS+JS, langsung jadi visual canvas** |
| **Google PageSpeed Score** | Sering turun ke 50-70 jika banyak widget | **Stabil di skor 95-100 (Core Web Vitals Hijau)** |
| **Script & Logika Interaktif** | Rumit / butuh add-on berbayar | **Smart Script Inspector bawaan (Kalkulator, Slider, Accordion berjalan native)** |
| **Organisasi Panel Inspector** | Menumpuk dalam satu scroll panjang | **4 Sub-Tab Rapi (Konten, Gaya, Tata Letak, Logika)** |
| **Dimensi Universal Elemen** | Terbatas pada kolom/container tertentu | **Kontrol Lebar & Tinggi aktif untuk SEMUA elemen (teks/box/gambar)** |
| **Ikon Vector** | Terkadang berat / bercampur | **Font Awesome 6 Native Picker (Vektor murni, anti AI-slop)** |
| **Pembaruan Mandiri** | Terikat ekosistem berbayar | **Native GitHub Auto-Updater bawaan (1 Klik dari GitHub Releases)** |

---

## Fitur Unggulan

### 1. Organisasi Panel Inspector 4 Sub-Tab Modern
- **Sub-Tab Konten (Content):** Penggantian tag HTML (H1-H6, P, DIV, SPAN), edit teks langsung, pengaturan gambar & alt SEO, tujuan link, dan integrasi tombol WhatsApp / webhook Google Sheets.
- **Sub-Tab Gaya (Style):** Koleksi Google Fonts lengkap, ukuran font slider/PX, ketebalan teks (300-900), perataan teks (kiri, tengah, kanan, justify), warna teks, background color, border radius, dan box shadow.
- **Sub-Tab Tata Letak (Layout):** Dimensi universal (Width & Height dengan unit %, PX, EM, atau AUTO) untuk semua elemen (termasuk heading dan paragraf), flexbox direction, preset proporsi kolom (50:50, 60:40, 70:30, 40:60, 3 Kolom), serta kontrol padding dan margin.
- **Sub-Tab Logika & Skrip (Logic & Script):** Editor script JavaScript mandiri per-elemen, preset interaktif siap pakai (Swiper slider, Accordion FAQ, Tab Navigasi, Modal Popup, Timer Countdown), event triggers (`onclick`, `oninput`, `onsubmit`), dan live algorithm status.

### 2. In-Place Section Structure Picker (Elementor Style Dropzone)
Menyisipkan section baru langsung di posisi persis insert bar yang diklik (di tengah-tengah antar section maupun di bawah halaman) dengan pilihan struktur kolom instan (1 Kolom, 2 Kolom 50:50, 2 Kolom 66:33, 3 Kolom, 4 Kolom) tanpa melompat ke ujung bawah halaman.

### 3. Dual Canvas Engine (Desain vs Mode Interaktif LIVE)
- **Mode Desain (`Alt + Klik`)**: Menyeleksi dan mengedit elemen secara visual dengan floating toolbar kontekstual.
- **Mode Interaktif (`Ctrl + I`)**: Menguji langsung seluruh interaksi web secara nyata (slider berjalan, tombol kalkulator menghitung, form memicu webhook WhatsApp, accordion membuka) tanpa terhalang selektor editor.

### 4. Sleek Mobile & Responsive Silhouette (iPhone Flagship 390px)
Pratinjau viewport mobile proporsional 390px dengan bezel titanium modern 6px, dynamic island, dan slim overlay scrollbar. Bebas terpotong horizontal dan sudah fluid-responsive di semua ukuran layar.

### 5. Live SEO Google Audit
Audit langsung struktur H1 unik, meta title, meta description, Open Graph sosial media, alt text gambar, serta canonical tag secara real-time dengan indikator skor 0-100.

---

## Panduan Penggunaan Singkat

1. **Membuat Halaman Baru**:
   - Masuk ke menu **Bongkar Builder** -> **Buat Kanvas Kosong** atau klik **Import HTML Langsung**.
   - Berikan judul halaman lalu simpan. Editor kanvas layar penuh akan langsung terbuka.
2. **Mengimpor Desain AI / HTML**:
   - Klik tombol **"Impor AI / HTML"** di dropzone kanvas.
   - Tempel kode HTML lengkap atau unggah file `.html` hasil ekspor dari Claude / ChatGPT / Figma / v0.
   - Klik **"Import ke Canvas"**. Halaman langsung tampil utuh.
3. **Mengedit Elemen**:
   - Klik teks atau box di kanvas untuk membuka 4 Sub-Tab di panel Inspector.
   - Gunakan Sub-Tab **Konten** untuk teks, **Gaya** untuk tipografi/warna, **Tata Letak** untuk lebar/tinggi/kolom, dan **Logika** untuk script interaktif.
4. **Menyalin Elemen Lintas Website**:
   - Klik elemen yang ingin disalin -> tekan `Ctrl + C` (atau klik ikon Copy di toolbar).
   - Buka editor Bongkar Builder di website WordPress lain -> klik target kontainer -> tekan `Ctrl + V`.
5. **Menyimpan & Mempublikasikan**:
   - Tekan `Ctrl + S` atau klik tombol hijau **[ Perbarui / Simpan Draft ]**.
   - Klik tombol **Preview** untuk melihat halaman live di tab baru.

---

## Pembaruan Otomatis (Auto-Update Workflow)
Plugin ini mendukung sistem pembaruan otomatis dari repositori resmi GitHub:
1. Ketika ada versi baru yang dirilis di GitHub `kadeksrd/Bongkar-Builder`, WordPress akan otomatis memunculkan pemberitahuan rilis di halaman **Plugins**.
2. Klik tombol **"View version details"** untuk membaca changelog pembaruan, atau langsung klik **"Update Now"** untuk memperbarui plugin tanpa perlu upload ulang file zip secara manual.

---

## Keamanan & Lisensi
- Berlisensi **GPL-2.0-or-later**. Bebas digunakan, didistribusikan, dan dimodifikasi untuk proyek pribadi maupun klien komersial.
- Dilengkapi verifikasi keamanan WordPress Nonce (`wp_verify_nonce`), sanitasi hak akses (`current_user_can('edit_pages')`), dan perlindungan Content Shield.
