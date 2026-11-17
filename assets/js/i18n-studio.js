/**
 * Bongkar Studio - Internationalization (i18n) Engine
 * 
 * Provides seamless dual-language support (Bahasa Indonesia & English)
 * for Bongkar Canvas Builder Studio UI and synchronized Canvas components.
 * 
 * @package Bongkar_Builder
 * @version 1.2.3-beta
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'bongkar_studio_lang';

    const translations = {
        id: {
            // Topbar
            'brand.name': 'Bongkar Studio',
            'topbar.back_wp': 'Kembali ke Dashboard WordPress',
            'topbar.saved': 'Terpublikasi',
            'topbar.draft_saved': 'Draft tersimpan',
            'topbar.seo_title': 'Audit SEO Standar Google 2026 - Klik untuk Membuka Audit & Perbaikan',
            'topbar.mode_design': 'Desain',
            'topbar.mode_design_desc': 'Mode Desain: Edit elemen halaman secara visual',
            'topbar.mode_interactive': 'Interaktif',
            'topbar.mode_interactive_desc': 'Mode Interaktif (Live Testing): Jalankan slider, popup & form seperti web asli (Shortcut: Ctrl+I)',
            'topbar.device_desktop': 'Desktop',
            'topbar.device_tablet': 'Tablet',
            'topbar.device_mobile': 'Mobile',
            'topbar.undo': 'Undo (Ctrl+Z)',
            'topbar.redo': 'Redo (Ctrl+Y)',
            'topbar.preview': 'Preview',
            'topbar.preview_desc': 'Lihat Pratinjau Tampilan Live di Tab Baru',
            'topbar.export_html': 'Export HTML',
            'topbar.export_html_desc': 'Export Halaman ke File HTML Mandiri (.html)',
            'topbar.save_draft': 'Simpan Draft',
            'topbar.save_draft_desc': 'Simpan sebagai Draft (Hanya tersimpan di editor, tidak mengubah halaman live pengunjung)',
            'topbar.publish': 'Perbarui',
            'topbar.publish_new': 'Publish',
            'topbar.publish_desc': 'Publikasikan semua perubahan ke pengunjung live (Ctrl+S)',
            'topbar.exit': 'Keluar ke Dashboard WordPress',
            'topbar.lang_switcher': 'Pilih Bahasa Editor',

            // Sidebar Tabs
            'tab.inspector': 'Inspector',
            'tab.inspector_desc': 'Edit Elemen, CSS & Algoritma',
            'tab.add': 'Tambah',
            'tab.add_desc': 'Tambah Section & Elemen Baru',
            'tab.seo': 'SEO',
            'tab.seo_desc': 'Audit & Pengaturan SEO Standar Google 2026',
            'tab.icons': 'Icons',
            'tab.icons_desc': 'Font Awesome 6 Icon Picker',
            'tab.settings': 'Pengaturan',
            'tab.settings_desc': 'Pengaturan Halaman, Tracking & Custom CSS',
            'tab.collapse': 'Sembunyikan / Tampilkan Panel (Shortcut: Ctrl + \\)',

            // Add Elements Panel (tab-elements)
            'add.search_placeholder': 'Cari widget, tombol, video, section...',
            'add.inserting_to': 'Menyisipkan ke:',
            'add.target_column': 'Kolom',
            'add.cancel': 'Batal',
            'add.have_ai': 'Punya Desain AI / HTML?',
            'add.import_ai': 'Impor AI / Kode HTML',
            'add.cat_columns': 'Struktur Kolom Section',
            'add.col_1': '1 Kolom (100%)',
            'add.col_1_desc': 'Section 1 kolom penuh lebar',
            'add.col_2_50': '2 Kolom (50:50)',
            'add.col_2_50_desc': 'Section 2 kolom sejajar (50:50)',
            'add.col_2_66': '2 Kolom (66:33)',
            'add.col_2_66_desc': 'Section 2 kolom asimetris (66:33 Konten + Sidebar)',
            'add.col_2_33': '2 Kolom (33:66)',
            'add.col_2_33_desc': 'Section 2 kolom asimetris (33:66 Sidebar + Konten)',
            'add.col_3': '3 Kolom (33%)',
            'add.col_3_desc': 'Section 3 kolom sejajar',
            'add.col_4': '4 Kolom (25%)',
            'add.col_4_desc': 'Section 4 kolom baris statistik / fitur',
            'add.custom_html': 'HTML Sendiri',
            'add.custom_html_desc': 'Sisipkan Section Desain HTML Sendiri / AI',
            'add.cat_widgets': 'Elemen Dasar (Widgets)',
            'add.widget_heading': 'Heading Judul',
            'add.widget_heading_desc': 'Judul teks heading H2',
            'add.widget_paragraph': 'Paragraf Teks',
            'add.widget_paragraph_desc': 'Paragraf deskripsi teks panjang',
            'add.widget_button': 'Tombol / CTA',
            'add.widget_button_desc': 'Tombol link / Call to Action',
            'add.widget_image': 'Gambar / Foto',
            'add.widget_image_desc': 'Gambar responsif dengan media library',
            'add.widget_video': 'Video Player',
            'add.widget_video_desc': 'Player Video 16:9 YouTube / MP4',
            'add.widget_icon_box': 'Icon Box Fitur',
            'add.widget_icon_box_desc': 'Kotak fitur dengan Icon + Judul + Deskripsi',
            'add.widget_icon': 'Icon Mandiri',
            'add.widget_icon_desc': 'Ikon Font Awesome mandiri',
            'add.widget_card': 'Card Container',
            'add.widget_card_desc': 'Container kartu modern dengan border & bayangan',
            'add.widget_rating': 'Star Rating',
            'add.widget_rating_desc': 'Rating 5 Bintang & Review ulasan',
            'add.widget_divider': 'Pemisah Divider',
            'add.widget_divider_desc': 'Garis pemisah section estetik',
            'add.widget_spacer': 'Spacer Jarak',
            'add.widget_spacer_desc': 'Jarak spasi kosong vertikal antar elemen',
            'add.cat_conversion': 'Konversi & Form Penjualan',
            'add.form_lead': 'Form Pesanan WA',
            'add.form_lead_desc': 'Formulir pesanan lengkap ke WhatsApp & Google Sheets',
            'add.floating_wa': 'Floating WhatsApp',
            'add.floating_wa_desc': 'Tombol WhatsApp melayang di pojok kanan bawah',
            'add.countdown': 'Countdown Timer',
            'add.countdown_desc': 'Hitung mundur promo flash sale / urgensi',
            'add.trust_badges': 'Trust Badges',
            'add.trust_badges_desc': 'Badges Garansi 100%, Pengiriman Cepat, Produk Original',
            'add.input_text': 'Input Teks',
            'add.input_text_desc': 'Input teks formulir',
            'add.textarea': 'Textarea Catatan',
            'add.textarea_desc': 'Textarea catatan formulir',
            'add.select': 'Dropdown Opsi',
            'add.select_desc': 'Dropdown pilihan formulir',
            'add.submit': 'Tombol Kirim',
            'add.submit_desc': 'Tombol submit kirim formulir',
            'add.cat_templates': 'Template Section Siap Pakai',
            'add.template_hero': 'Hero Banner',
            'add.template_hero_desc': 'Section pembuka Hero Banner dengan judul & tombol ganda',
            'add.template_features': '3 Kartu Fitur',
            'add.template_features_desc': 'Section 3 kartu keunggulan fitur / fasilitas',
            'add.template_cta': 'CTA Promosi',
            'add.template_cta_desc': 'Banner ajakan beli / CTA promosi lebar',
            'add.template_gallery': 'Galeri Foto Grid',
            'add.template_gallery_desc': 'Grid galeri foto dan dokumentasi produk',
            'add.template_testimonials': 'Testimoni Klien',
            'add.template_testimonials_desc': 'Section ulasan dan testimoni pembeli puas',
            'add.template_faq': 'FAQ Accordion',
            'add.template_faq_desc': 'Section tanya jawab FAQ accordion buka-tutup',
            'add.template_blog': 'Blog & Post Grid',
            'add.template_blog_desc': 'Section Grid Blog / Artikel Dinamis dari WordPress',
            'add.template_pricing': 'Tabel Harga',
            'add.template_pricing_desc': 'Tabel perbandingan harga paket / unit',
            'add.template_footer': 'Footer Bersih',
            'add.template_footer_desc': 'Footer gelap dengan copyright dan link medsos',
            'add.cat_dynamic': 'Dinamis & Kode Khusus',
            'add.post_grid': 'Post Grid Feed',
            'add.post_grid_desc': 'Widget Grid Postingan Artikel Dinamis WordPress',
            'add.embed': 'HTML / Script Embed',
            'add.embed_desc': 'Widget kustom untuk memasukkan kode HTML / iframe Maps',
            'add.search_empty': 'Tidak ada widget yang cocok dengan pencarian.',

            // Icons Panel
            'icons.search_placeholder': 'Cari ikon Font Awesome (misal: phone, check, star, user)...',
            'icons.hint': 'Klik ikon untuk menyematkan ke elemen terpilih atau memasukkan ikon baru. 100% Font Awesome 6 vektor murni (Anti AI-Slop).',

            // Settings Panel
            'settings.layout_header': 'Tata Letak & Header Footer',
            'settings.layout_desc': 'Tentukan tata letak halaman: gunakan kanvas penuh mandiri atau sematkan template Header & Footer kustom.',
            'settings.page_layout_label': 'Tata Letak Halaman (Page Layout):',
            'settings.layout_canvas': 'Bongkar Canvas (Halaman Penuh)',
            'settings.layout_hf': 'Bongkar Header & Footer',
            'settings.header_label': 'Header Template:',
            'settings.footer_label': 'Footer Template:',
            'settings.header_default': '-- Default Global Header --',
            'settings.footer_default': '-- Default Global Footer --',

            // Inspector Empty State
            'empty.title': 'Pilih Elemen di Kanvas',
            'empty.desc': 'Klik elemen apa saja di dalam kanvas untuk mengubah teks, font, warna, ukuran, atau gambarnya.',
            'empty.btn_widgets': 'Buka Panel Widget',

            // Inspector Header & Subtabs
            'inspector.back_widgets': 'Kembali ke Widget',
            'inspector.subtab_content': 'Konten',
            'inspector.subtab_style': 'Gaya',
            'inspector.subtab_layout': 'Tata Letak',
            'inspector.subtab_logic': 'Logika',
            'inspector.wrap': 'Bungkus',
            'inspector.wrap_desc': 'Bungkus dalam Kontainer Baru',
            'inspector.parent': 'Induk',
            'inspector.parent_desc': 'Pilih Pembungkus / Parent Element (Alt+Up)',
            'inspector.hierarchy': 'Hierarki Pembungkus:',

            // Inspector Subtab Content
            'content.tag_semantic': 'Tag Semantik & Teks',
            'content.change_tag': 'Ubah HTML Tag:',
            'content.text_label': 'Teks / Konten:',
            'content.image_media': 'Gambar & Media',
            'content.change_wp_media': 'Ganti dari Media Library WP',
            'content.img_url': 'Image URL:',
            'content.img_alt': 'Alt Text (SEO):',
            'content.img_alt_placeholder': 'Deskripsi gambar untuk SEO',
            'content.img_fit': 'Object Fit:',
            'content.link_url': 'Link & URL',
            'content.link_href': 'Target URL (href):',
            'content.link_blank': 'Buka di Tab Baru:',

            // Inspector Subtab Style
            'style.typography': 'Tipografi',
            'style.font_family': 'Jenis Font:',
            'style.font_size': 'Ukuran Font:',
            'style.font_weight': 'Ketebalan Font:',
            'style.line_height': 'Tinggi Baris (Line Height):',
            'style.text_align': 'Rata Teks:',
            'style.color_bg': 'Warna & Latar Belakang',
            'style.text_color': 'Warna Teks:',
            'style.bg_color': 'Warna Latar (Background):',
            'style.spacing': 'Jarak & Margin',
            'style.padding': 'Padding (Jarak Dalam):',
            'style.margin': 'Margin (Jarak Luar):',
            'style.borders': 'Batas & Sudut Bulat',
            'style.radius': 'Radius Sudut:',
            'style.border_width': 'Tebal Garis:',
            'style.border_color': 'Warna Garis:',
            'style.shadow': 'Bayangan (Box Shadow)',

            // Inspector Subtab Layout
            'layout.dimensions': 'Dimensi & Ukuran',
            'layout.width': 'Lebar (Width):',
            'layout.max_width': 'Maksimal Lebar (Max Width):',
            'layout.height': 'Tinggi (Height):',
            'layout.flexbox': 'Pengaturan Kolom / Flexbox',
            'layout.direction': 'Arah Baris/Kolom:',
            'layout.align': 'Perataan (Align Items):',
            'layout.justify': 'Distribusi (Justify Content):',
            'layout.gap': 'Jarak Antar Kolom (Gap):',

            // Inspector Subtab Logic
            'logic.scripts': 'Skrip & Interaktivitas',
            'logic.presets': 'Preset Interaktivitas:',
            'logic.custom_js': 'Skrip Elemen Khusus:',

            // SEO Panel
            'seo.audit_title': 'Audit SEO Standar Google 2026',
            'seo.score_label': 'Skor SEO Keseluruhan',
            'seo.rescan': 'Pindai Ulang SEO',
            'seo.rescan_title': 'Pindai Ulang Seluruh Elemen Kanvas',
            'seo.focus_label': 'Kata Kunci Target (Focus Keyword)',
            'seo.focus_input_label': 'Keyword Utama Halaman:',
            'seo.focus_placeholder': 'Contoh: Jasa Landing Page Murah Tangerang',
            'seo.focus_hint': 'Sistem akan memeriksa kehadiran kata kunci ini di Judul, Deskripsi, H1, dan konten kanvas.',
            'seo.meta_title': 'Judul Halaman (Meta Title):',
            'seo.meta_desc': 'Deskripsi Penelusuran (Meta Description):',
            'seo.focus_keyword': 'Kata Kunci Utama (Focus Keyword):',
            'seo.serp_preview': 'Google SERP Preview 2026',
            'seo.preview_google': 'Pratinjau Hasil Pencarian Google',
            'seo.preview_social': 'Pratinjau Berbagi Media Sosial (OpenGraph)',
            'seo.meta_title_desc_header': 'Meta Title & Description',
            'seo.meta_title_label': 'SEO Meta Title:',
            'seo.meta_title_placeholder': 'Judul menarik dan relevan untuk Google',
            'seo.meta_desc_label': 'SEO Meta Description:',
            'seo.meta_desc_placeholder': 'Deskripsi ringkas yang memikat calon pengunjung...',
            'seo.og_header': 'Thumbnail Share WhatsApp & Medsos',
            'seo.og_desc': 'Tampilan kartu thumbnail visual saat link halaman dibagikan ke WhatsApp, Telegram, Facebook, & Twitter:',
            'seo.choose_image': 'Pilih Gambar',
            'seo.remove_image_title': 'Hapus Gambar',
            'seo.og_image_placeholder': 'URL Gambar Share (https://...)',
            'seo.og_hint': 'Ukuran rekomendasi: 1200 x 630 px (rasio 1.91:1) atau 1:1 kotak agar jernih di WhatsApp & Telegram.',
            'seo.checklist_header': 'Checklist Audit & Panduan Perbaikan',
            'seo.analyzing': 'Menganalisis elemen kanvas...',
            'seo.verdict_scanning': 'Memindai SEO...',
            'seo.verdict_scanning_desc': 'Standar Google 2026: Heading H1, Alt text gambar, relevansi keyword, & SERP snippet.',
            'seo.verdict_good': 'Optimal (Siap Peringkat Google 2026)',
            'seo.verdict_good_desc': 'Halaman telah memenuhi standar teknis SEO Google 2026. Lolos uji semantik dan relevansi.',
            'seo.verdict_warn': 'Cukup Baik (Ada Rekomendasi)',
            'seo.verdict_warn_desc': 'Struktur halaman cukup baik, namun masih ada ruang peningkatan seperti Alt gambar atau panjang teks.',
            'seo.verdict_danger': 'Kritis (Perlu Perbaikan Segera)',
            'seo.verdict_danger_desc': 'Ditemukan masalah mendasar seperti Heading H1 kosong atau Meta Tag yang belum diisi.',
            'seo.item_h1_pass_title': 'Heading 1 (H1) Ideal',
            'seo.item_h1_pass_desc': 'Tepat 1 tag H1 ditemukan: "<strong>{h1}</strong>". Memenuhi standar struktur Google 2026.',
            'seo.item_h1_action_highlight': 'Sorot H1',
            'seo.item_h1_fail_title': 'Heading 1 (H1) Tidak Ditemukan',
            'seo.item_h1_fail_desc': 'Google 2026 mewajibkan tepat 1 tag &lt;h1&gt; sebagai topik utama halaman. Gunakan tombol di samping untuk menetapkan judul utama.',
            'seo.item_h1_action_fix': 'Perbaiki & Jadikan H1',
            'seo.item_h1_warn_title': 'Terlalu Banyak Tag H1 ({count} H1 Ditemukan)',
            'seo.item_h1_warn_desc': 'Ditemukan lebih dari 1 tag H1. Disarankan hanya 1 H1 per halaman, turunkan judul lainnya menjadi H2.',
            'seo.item_h1_action_inspect': 'Periksa H1 Tambahan',
            'seo.item_title_pass_title': 'Panjang Meta Title Ideal',
            'seo.item_title_pass_desc': '{len} karakter (Ideal Google: 40–60 karakter). Tidak akan terpotong pada hasil pencarian desktop & mobile.',
            'seo.item_title_short': 'Meta Title Terlalu Pendek',
            'seo.item_title_long': 'Meta Title Terlalu Panjang',
            'seo.item_title_warn_desc': '{len} karakter. Disarankan antara 40–60 karakter agar relevan dan tidak terpotong di Google.',
            'seo.item_title_empty_title': 'Meta Title Masih Kosong',
            'seo.item_title_empty_desc': 'Meta title adalah faktor penentu peringkat tertinggi di Google Search.',
            'seo.item_title_action_write': 'Tulis Judul',
            'seo.item_title_action_edit': 'Edit Judul',
            'seo.item_desc_pass_title': 'Panjang Meta Description Sempurna',
            'seo.item_desc_pass_desc': '{len} karakter (Ideal Google: 120–160 karakter). Memberikan ringkasan yang menarik klik (CTR).',
            'seo.item_desc_short': 'Meta Description Terlalu Pendek',
            'seo.item_desc_long': 'Meta Description Terlalu Panjang',
            'seo.item_desc_warn_desc': '{len} karakter. Disarankan 120–160 karakter agar informatif dan tidak terpotong di Google.',
            'seo.item_desc_empty_title': 'Meta Description Masih Kosong',
            'seo.item_desc_empty_desc': 'Tambahkan ringkasan menarik agar Google tidak menampilkan cuplikan teks acak.',
            'seo.item_desc_action_write': 'Tulis Deskripsi',
            'seo.item_desc_action_edit': 'Edit Deskripsi',
            'seo.preview_title_tag': 'Judul',
            'seo.preview_desc_tag': 'Deskripsi',
            'seo.preview_content_tag': 'Konten',
            'seo.item_kw_found_title': 'Kehadiran Keyword: "{kw}"',
            'seo.item_kw_found_desc': 'Sebaran kata kunci target: [ {badges} ]. Membantu Google mengindeks topik utama landing page Anda.',
            'seo.item_kw_empty_title': 'Belum Menentukan Kata Kunci Target',
            'seo.item_kw_empty_desc': 'Tuliskan kata kunci target di kotak atas (misal: "Jasa Website Murah") untuk audit akurasi keyword Google.',
            'seo.item_kw_action_set': 'Isi Keyword',
            'seo.item_img_none_title': 'Audit Gambar Bersih',
            'seo.item_img_none_desc': 'Halaman tidak memiliki gambar atau semua aset berbentuk vektor murni (Font Awesome).',
            'seo.item_img_pass_title': 'Semua Gambar Memiliki Alt Text',
            'seo.item_img_pass_desc': '{count} gambar memiliki deskripsi teks (Alt) yang siap terindeks di Google Images & ramah aksesibilitas.',
            'seo.item_img_fail_title': '{count} Gambar Tidak Memiliki Alt Text',
            'seo.item_img_fail_desc': 'Google tidak dapat memahami isi gambar tanpa atribut Alt. Klik tombol di bawah untuk langsung menuju gambar dan mengisinya di Inspector:',
            'seo.item_img_chip': 'Gambar #{num}',
            'seo.item_links_pass_title': 'Semua Tautan Mengarah ke URL Valid',
            'seo.item_links_pass_desc': '{count} link anchor memiliki target href yang valid (Tidak ada tautan kosong/mati).',
            'seo.item_links_warn_title': '{count} Tautan Placeholder (href="#")',
            'seo.item_links_warn_desc': 'Ditemukan tombol atau link yang belum diisi URL target. Klik tautan untuk melengkapi URL di Inspector:',
            'seo.item_words_ideal_title': 'Kedalaman Konten Ideal ({count} Kata)',
            'seo.item_words_ideal_desc': 'Memenuhi standar Google 2026 untuk landing page yang berbobot dan bernilai tinggi bagi pengunjung.',
            'seo.item_words_ok_title': 'Panjang Konten Cukup ({count} Kata)',
            'seo.item_words_ok_desc': 'Disarankan minimal 300 kata (misal dengan menambahkan section FAQ atau penjelasan fitur) untuk meningkatkan otoritas SEO.',
            'seo.item_words_short_title': 'Konten Terlalu Singkat ({count} Kata)',
            'seo.item_words_short_desc': 'Google cenderung memprioritaskan halaman dengan konten informatif lengkap di atas 300 kata.',
            'seo.item_og_pass_title': 'Thumbnail Share WhatsApp & Medsos Siap',
            'seo.item_og_pass_desc': 'Tautan Anda akan menampilkan kartu visual saat dibagikan ke WhatsApp, Telegram, Facebook, dan Twitter.',
            'seo.item_og_warn_title': 'Belum Ada Thumbnail Share WhatsApp',
            'seo.item_og_warn_desc': 'Sebaiknya pasang thumbnail share (1200x630 px) agar link yang dibagikan memiliki preview kartu gambar di WhatsApp.',

            // Settings Panel
            'settings.page_title': 'Pengaturan Halaman',
            'settings.layout_header': 'Tata Letak & Header Footer',
            'settings.layout_desc': 'Tentukan tata letak halaman: gunakan kanvas penuh mandiri atau sematkan template Header & Footer kustom.',
            'settings.page_layout_label': 'Tata Letak Halaman (Page Layout):',
            'settings.layout_canvas': 'Bongkar Canvas (Halaman Penuh)',
            'settings.layout_hf': 'Bongkar Header & Footer',
            'settings.header_label': 'Header Template:',
            'settings.header_default': '-- Default Global Header --',
            'settings.footer_label': 'Footer Template:',
            'settings.footer_default': '-- Default Global Footer --',
            'settings.shield_header': 'Keamanan & Proteksi Konten',
            'settings.shield_desc': 'Lindungi teks, artikel, dan kode HTML Anda dari pencurian konten atau scraping tanpa merusak kenyamanan pembaca.',
            'settings.shield_enable': 'Aktifkan Proteksi Konten (Content Shield)',
            'settings.shield_mode_label': 'Mode Proteksi Salin (Copy Protection):',
            'settings.shield_mode_watermark': 'Smart Watermark (Teks bisa di-copy + atribusi link otomatis)',
            'settings.shield_mode_block': 'Blokir Clipboard (Bisa seleksi teks, tapi dilarang copy)',
            'settings.shield_mode_full': 'Proteksi Maksimal (Blokir copy total + anti inspect)',
            'settings.shield_mode_hint': 'Pengunjung tetap bisa menyeleksi teks dengan nyaman, namun isi salinan dilindungi secara pintar.',
            'settings.shield_anti_inspect': 'Kunci Inspect Element, F12, & View Source (Ctrl+U)',
            'settings.shield_watermark_label': 'Teks Atribusi Watermark Kustom (Opsional):',
            'settings.shield_watermark_placeholder': 'Contoh: Dikutip dari {title} ({url}) - Hak Cipta Dilindungi.',
            'settings.shield_watermark_hint': 'Variabel yang didukung: {title} (Judul) dan {url} (Tautan Halaman).',
            'settings.favicon_header': 'Favicon & Browser Tab Icon',
            'settings.favicon_desc': 'Ikon bulat/kotak di tab atas browser, bookmark, dan icon shortcut handphone (seperti di Elementor Site Settings):',
            'settings.favicon_choose': 'Pilih Favicon',
            'settings.favicon_reset_title': 'Reset ke Default WordPress',
            'settings.favicon_placeholder': 'URL Favicon (https://...)',
            'settings.favicon_hint': 'Format yang didukung: PNG, ICO, SVG (persegi 32x32, 64x64, atau 192x192 px).',
            'settings.tracking_header': 'Pelacakan & Analytics',
            'settings.tracking_desc': 'Integrasi tracking otomatis Google Tag (GA4/Ads), Meta Pixel (Facebook Ads), dan Microsoft Clarity:',
            'settings.gtag_label': 'Google Tag ID (GA4 / GTM / Ads):',
            'settings.gtag_placeholder': 'Contoh: G-XXXXXXXXXX atau AW-XXXXXXXXXX',
            'settings.pixel_label': 'Meta (Facebook) Pixel ID:',
            'settings.pixel_placeholder': 'Contoh: 123456789012345',
            'settings.clarity_label': 'Microsoft Clarity Project ID:',
            'settings.clarity_placeholder': 'Contoh: ab12cd34ef',
            'settings.custom_head_label': 'Custom Code <head> (Meta Verifikasi / Pixel Lain):',
            'settings.custom_footer_label': 'Custom Code <body> / Footer (Script Chat / Tracking):',
            'settings.custom_css_header': 'Custom Page CSS',
            'settings.custom_css': 'Custom CSS Halaman',
            'settings.custom_css_placeholder': '/* Tulis CSS khusus halaman di sini */',
            'settings.head_scripts': 'Header Scripts (<head>):',
            'settings.footer_scripts': 'Footer Scripts (sebelum </body>):',

            // Custom HTML Section Modal
            'modal_html.title': 'Desain HTML Sendiri',
            'modal_html.desc': 'Tempel kode HTML atau komponen UI hasil buatan sendiri / AI (Tailwind, Bootstrap, atau HTML murni) untuk disisipkan langsung ke posisi section ini.',
            'modal_html.code_label': 'Kode HTML Section:',
            'modal_html.placeholder': '<section class="py-12 px-4">\n  <div class="container mx-auto">\n    <h2>Judul Section Saya</h2>\n    <p>Deskripsi konten...</p>\n  </div>\n</section>',
            'modal_html.cancel': 'Batal',
            'modal_html.insert': 'Sisipkan Section',
            'modal_html.empty_alert': 'Silakan masukkan kode HTML terlebih dahulu.',

            // Toasts & Alerts
            'toast.page_updated': 'Halaman berhasil diperbarui!',
            'toast.draft_saved': 'Draft berhasil disimpan!',
            'toast.save_error': 'Terjadi kesalahan saat menyimpan.',
            'toast.interactive_active': 'Mode Interaktif Aktif: Uji slider, modal & form live.',
            'toast.design_active': 'Mode Desain Aktif: Edit elemen visual kanvas.',
            'toast.html_copied': 'Kode HTML berhasil disalin ke clipboard!',
            'toast.lang_switched': 'Bahasa studio dialihkan ke Bahasa Indonesia.',
            'toast.section_html_inserted': 'Section HTML berhasil disisipkan!',
            'toast.interactive_banner': '<strong>Mode Interaktif Aktif:</strong> Uji kalkulator, geser slider, buka accordion & popup modal seperti website asli.',
            'toast.exit_interactive_title': 'Kembali ke Mode Desain',
            'toast.exit_interactive': 'Kembali ke Mode Desain'
        },

        en: {
            // Topbar
            'brand.name': 'Bongkar Studio',
            'topbar.back_wp': 'Return to WordPress Dashboard',
            'topbar.saved': 'Published',
            'topbar.draft_saved': 'Draft saved',
            'topbar.seo_title': 'Google 2026 SEO Audit - Click to Open Audit & Recommendations',
            'topbar.mode_design': 'Design',
            'topbar.mode_design_desc': 'Design Mode: Visually edit page elements',
            'topbar.mode_interactive': 'Interactive',
            'topbar.mode_interactive_desc': 'Interactive Mode (Live Testing): Test sliders, popups & forms as live visitors (Shortcut: Ctrl+I)',
            'topbar.device_desktop': 'Desktop',
            'topbar.device_tablet': 'Tablet',
            'topbar.device_mobile': 'Mobile',
            'topbar.undo': 'Undo (Ctrl+Z)',
            'topbar.redo': 'Redo (Ctrl+Y)',
            'topbar.preview': 'Preview',
            'topbar.preview_desc': 'Preview Live Page in New Tab',
            'topbar.export_html': 'Export HTML',
            'topbar.export_html_desc': 'Export Page to Standalone HTML File (.html)',
            'topbar.save_draft': 'Save Draft',
            'topbar.save_draft_desc': 'Save as Draft (Editor-only, does not alter live page for visitors)',
            'topbar.publish': 'Update',
            'topbar.publish_new': 'Publish',
            'topbar.publish_desc': 'Publish all changes to live visitors (Ctrl+S)',
            'topbar.exit': 'Exit to WordPress Dashboard',
            'topbar.lang_switcher': 'Select Studio Language',

            // Sidebar Tabs
            'tab.inspector': 'Inspector',
            'tab.inspector_desc': 'Edit Elements, CSS & Layout',
            'tab.add': 'Add',
            'tab.add_desc': 'Add New Sections & Elements',
            'tab.seo': 'SEO',
            'tab.seo_desc': 'Google 2026 Standard SEO Audit & Settings',
            'tab.icons': 'Icons',
            'tab.icons_desc': 'Font Awesome 6 Icon Picker',
            'tab.settings': 'Settings',
            'tab.settings_desc': 'Page Settings, Tracking & Custom CSS',
            'tab.collapse': 'Collapse / Expand Sidebar (Shortcut: Ctrl + \\)',

            // Add Elements Panel (tab-elements)
            'add.search_placeholder': 'Search widgets, buttons, video, section...',
            'add.inserting_to': 'Inserting into:',
            'add.target_column': 'Column',
            'add.cancel': 'Cancel',
            'add.have_ai': 'Have AI / HTML Design?',
            'add.import_ai': 'Import AI / HTML Code',
            'add.cat_columns': 'Section Column Structure',
            'add.col_1': '1 Column (100%)',
            'add.col_1_desc': '1 full width column section',
            'add.col_2_50': '2 Columns (50:50)',
            'add.col_2_50_desc': '2 parallel columns section (50:50)',
            'add.col_2_66': '2 Columns (66:33)',
            'add.col_2_66_desc': '2 asymmetric columns (66:33 Content + Sidebar)',
            'add.col_2_33': '2 Columns (33:66)',
            'add.col_2_33_desc': '2 asymmetric columns (33:66 Sidebar + Content)',
            'add.col_3': '3 Columns (33%)',
            'add.col_3_desc': '3 parallel columns section',
            'add.col_4': '4 Columns (25%)',
            'add.col_4_desc': '4 column statistics / feature row section',
            'add.custom_html': 'Custom HTML',
            'add.custom_html_desc': 'Insert Custom HTML / AI Section',
            'add.cat_widgets': 'Basic Elements (Widgets)',
            'add.widget_heading': 'Heading Title',
            'add.widget_heading_desc': 'Heading H2 text title',
            'add.widget_paragraph': 'Paragraph Text',
            'add.widget_paragraph_desc': 'Long text description paragraph',
            'add.widget_button': 'Button / CTA',
            'add.widget_button_desc': 'Link button / Call to Action',
            'add.widget_image': 'Image / Photo',
            'add.widget_image_desc': 'Responsive image with media library',
            'add.widget_video': 'Video Player',
            'add.widget_video_desc': '16:9 YouTube / MP4 Video Player',
            'add.widget_icon_box': 'Feature Icon Box',
            'add.widget_icon_box_desc': 'Feature box with Icon + Title + Description',
            'add.widget_icon': 'Standalone Icon',
            'add.widget_icon_desc': 'Standalone Font Awesome icon',
            'add.widget_card': 'Card Container',
            'add.widget_card_desc': 'Modern card container with border & shadow',
            'add.widget_rating': 'Star Rating',
            'add.widget_rating_desc': '5-Star Rating & Review',
            'add.widget_divider': 'Divider Line',
            'add.widget_divider_desc': 'Aesthetic section divider line',
            'add.widget_spacer': 'Vertical Spacer',
            'add.widget_spacer_desc': 'Vertical empty spacing between elements',
            'add.cat_conversion': 'Conversion & Forms',
            'add.form_lead': 'WhatsApp Order Form',
            'add.form_lead_desc': 'Complete order form to WhatsApp & Google Sheets',
            'add.floating_wa': 'Floating WhatsApp',
            'add.floating_wa_desc': 'Floating WhatsApp button at bottom-right corner',
            'add.countdown': 'Countdown Timer',
            'add.countdown_desc': 'Flash sale / urgency countdown timer',
            'add.trust_badges': 'Trust Badges',
            'add.trust_badges_desc': '100% Guarantee, Fast Shipping, Original Badges',
            'add.input_text': 'Text Input',
            'add.input_text_desc': 'Form text input',
            'add.textarea': 'Textarea Notes',
            'add.textarea_desc': 'Form notes textarea',
            'add.select': 'Dropdown Options',
            'add.select_desc': 'Form dropdown options',
            'add.submit': 'Submit Button',
            'add.submit_desc': 'Form submit button',
            'add.cat_templates': 'Prebuilt Section Templates',
            'add.template_hero': 'Hero Banner',
            'add.template_hero_desc': 'Hero Banner opening section with headline & dual buttons',
            'add.template_features': '3 Feature Cards',
            'add.template_features_desc': '3 feature / facility highlight cards section',
            'add.template_cta': 'Promotional CTA',
            'add.template_cta_desc': 'Full-width promotional CTA banner',
            'add.template_gallery': 'Photo Gallery Grid',
            'add.template_gallery_desc': 'Photo gallery and product documentation grid',
            'add.template_testimonials': 'Client Testimonials',
            'add.template_testimonials_desc': 'Customer testimonials and satisfied review section',
            'add.template_faq': 'FAQ Accordion',
            'add.template_faq_desc': 'Collapsible FAQ accordion question & answer section',
            'add.template_blog': 'Blog & Post Grid',
            'add.template_blog_desc': 'Dynamic WordPress blog posts and article grid section',
            'add.template_pricing': 'Pricing Table',
            'add.template_pricing_desc': 'Package / unit pricing comparison table',
            'add.template_footer': 'Clean Footer',
            'add.template_footer_desc': 'Clean dark footer with copyright and social links',
            'add.cat_dynamic': 'Dynamic & Custom Code',
            'add.post_grid': 'Post Grid Feed',
            'add.post_grid_desc': 'Dynamic WordPress blog posts grid widget',
            'add.embed': 'HTML / Script Embed',
            'add.embed_desc': 'Custom widget for embedding HTML code / Google Maps',
            'add.search_empty': 'No widgets matched your search.',

            // Icons Panel
            'icons.search_placeholder': 'Search Font Awesome icons (e.g. phone, check, star, user)...',
            'icons.hint': 'Click an icon to attach it to the selected element or insert a new icon. 100% Font Awesome 6 pure vector.',

            // Settings Panel
            'settings.layout_header': 'Layout & Header / Footer',
            'settings.layout_desc': 'Configure page layout: use full standalone canvas or embed custom Header & Footer templates.',
            'settings.page_layout_label': 'Page Layout:',
            'settings.layout_canvas': 'Bongkar Canvas (Full Page)',
            'settings.layout_hf': 'Bongkar Header & Footer',
            'settings.header_label': 'Header Template:',
            'settings.footer_label': 'Footer Template:',
            'settings.header_default': '-- Default Global Header --',
            'settings.footer_default': '-- Default Global Footer --',

            // Inspector Empty State
            'empty.title': 'Select an Element on Canvas',
            'empty.desc': 'Click any element inside the canvas to edit its text, font, colors, dimensions, or media.',
            'empty.btn_widgets': 'Open Widget Panel',

            // Inspector Header & Subtabs
            'inspector.back_widgets': 'Back to Widgets',
            'inspector.subtab_content': 'Content',
            'inspector.subtab_style': 'Style',
            'inspector.subtab_layout': 'Layout',
            'inspector.subtab_logic': 'Logic',
            'inspector.wrap': 'Wrap',
            'inspector.wrap_desc': 'Wrap inside a New Container',
            'inspector.parent': 'Parent',
            'inspector.parent_desc': 'Select Parent Container (Alt+Up)',
            'inspector.hierarchy': 'Wrapper Hierarchy:',

            // Inspector Subtab Content
            'content.tag_semantic': 'Semantic Tag & Text',
            'content.change_tag': 'Change HTML Tag:',
            'content.text_label': 'Text / Content:',
            'content.image_media': 'Image & Media',
            'content.change_wp_media': 'Change from WP Media Library',
            'content.img_url': 'Image URL:',
            'content.img_alt': 'Alt Text (SEO):',
            'content.img_alt_placeholder': 'Image description for SEO',
            'content.img_fit': 'Object Fit:',
            'content.link_url': 'Link & URL',
            'content.link_href': 'Target URL (href):',
            'content.link_blank': 'Open in New Tab:',

            // Inspector Subtab Style
            'style.typography': 'Typography',
            'style.font_family': 'Font Family:',
            'style.font_size': 'Font Size:',
            'style.font_weight': 'Font Weight:',
            'style.line_height': 'Line Height:',
            'style.text_align': 'Text Align:',
            'style.color_bg': 'Colors & Background',
            'style.text_color': 'Text Color:',
            'style.bg_color': 'Background Color:',
            'style.spacing': 'Spacing & Margins',
            'style.padding': 'Padding (Inner Spacing):',
            'style.margin': 'Margin (Outer Spacing):',
            'style.borders': 'Borders & Corner Radius',
            'style.radius': 'Corner Radius:',
            'style.border_width': 'Border Width:',
            'style.border_color': 'Border Color:',
            'style.shadow': 'Box Shadow',

            // Inspector Subtab Layout
            'layout.dimensions': 'Dimensions & Sizing',
            'layout.width': 'Width:',
            'layout.max_width': 'Max Width:',
            'layout.height': 'Height:',
            'layout.flexbox': 'Column & Flexbox Settings',
            'layout.direction': 'Direction (Row/Col):',
            'layout.align': 'Alignment (Align Items):',
            'layout.justify': 'Distribution (Justify Content):',
            'layout.gap': 'Column Gap:',

            // Inspector Subtab Logic
            'logic.scripts': 'Scripts & Interactivity',
            'logic.presets': 'Interactivity Presets:',
            'logic.custom_js': 'Custom Element Script:',

            // SEO Panel
            'seo.audit_title': 'Google 2026 Standard SEO Audit',
            'seo.score_label': 'Overall SEO Score',
            'seo.rescan': 'Rescan SEO',
            'seo.rescan_title': 'Rescan all canvas elements',
            'seo.focus_label': 'Target Keyword (Focus Keyword)',
            'seo.focus_input_label': 'Primary Page Keyword:',
            'seo.focus_placeholder': 'e.g. Modern Architecture Services in New York',
            'seo.focus_hint': 'The system verifies this keyword inside Page Title, Meta Description, H1, and canvas content.',
            'seo.meta_title': 'Page Title (Meta Title):',
            'seo.meta_desc': 'Search Snippet (Meta Description):',
            'seo.focus_keyword': 'Primary Focus Keyword:',
            'seo.serp_preview': 'Google SERP Preview 2026',
            'seo.preview_google': 'Google Search Snippet Preview',
            'seo.preview_social': 'Social Media Card Preview (OpenGraph)',
            'seo.meta_title_desc_header': 'Meta Title & Description',
            'seo.meta_title_label': 'SEO Meta Title:',
            'seo.meta_title_placeholder': 'Catchy, relevant page title for Google',
            'seo.meta_desc_label': 'SEO Meta Description:',
            'seo.meta_desc_placeholder': 'Concise description that compels searchers to click...',
            'seo.og_header': 'WhatsApp & Social Share Thumbnail',
            'seo.og_desc': 'Visual preview card when the page link is shared on WhatsApp, Telegram, Facebook, & Twitter:',
            'seo.choose_image': 'Choose Image',
            'seo.remove_image_title': 'Remove Image',
            'seo.og_image_placeholder': 'Share Image URL (https://...)',
            'seo.og_hint': 'Recommended size: 1200 x 630 px (1.91:1 ratio) or 1:1 square for sharp display in WhatsApp & Telegram.',
            'seo.checklist_header': 'Audit Checklist & Action Plan',
            'seo.analyzing': 'Analyzing canvas elements...',
            'seo.verdict_scanning': 'Scanning SEO...',
            'seo.verdict_scanning_desc': 'Google 2026 Standards: H1 tag, Image Alt attributes, Keyword relevance, & SERP snippet.',
            'seo.verdict_good': 'Optimal (Ready for Google 2026 Ranking)',
            'seo.verdict_good_desc': 'Page satisfies Google 2026 technical SEO standards. Passed semantic & relevance checks.',
            'seo.verdict_warn': 'Good (Recommendations Available)',
            'seo.verdict_warn_desc': 'Page structure is solid, but there is room for improvement in Alt tags or content length.',
            'seo.verdict_danger': 'Critical (Immediate Fixes Needed)',
            'seo.verdict_danger_desc': 'Fundamental issues detected such as missing H1 heading or blank Meta Tags.',
            'seo.item_h1_pass_title': 'Optimal Heading 1 (H1)',
            'seo.item_h1_pass_desc': 'Exactly 1 H1 tag found: "<strong>{h1}</strong>". Meets Google 2026 hierarchy standards.',
            'seo.item_h1_action_highlight': 'Highlight H1',
            'seo.item_h1_fail_title': 'Heading 1 (H1) Not Found',
            'seo.item_h1_fail_desc': 'Google 2026 requires exactly 1 &lt;h1&gt; tag as the primary page topic. Use the action button to assign one.',
            'seo.item_h1_action_fix': 'Fix & Set as H1',
            'seo.item_h1_warn_title': 'Too Many H1 Tags ({count} H1 Found)',
            'seo.item_h1_warn_desc': 'More than one H1 tag detected. Keep only 1 H1 per page, demote others to H2.',
            'seo.item_h1_action_inspect': 'Inspect Extra H1',
            'seo.item_title_pass_title': 'Optimal Meta Title Length',
            'seo.item_title_pass_desc': '{len} characters (Google ideal: 40–60 chars). Will not be truncated in desktop & mobile search.',
            'seo.item_title_short': 'Meta Title Too Short',
            'seo.item_title_long': 'Meta Title Too Long',
            'seo.item_title_warn_desc': '{len} characters. Keep between 40–60 chars for best visibility.',
            'seo.item_title_empty_title': 'Meta Title Is Blank',
            'seo.item_title_empty_desc': 'Meta title is the most critical ranking factor in Google Search.',
            'seo.item_title_action_write': 'Write Title',
            'seo.item_title_action_edit': 'Edit Title',
            'seo.item_desc_pass_title': 'Optimal Meta Description Length',
            'seo.item_desc_pass_desc': '{len} characters (Google ideal: 120–160 chars). Compels higher click-through rate (CTR).',
            'seo.item_desc_short': 'Meta Description Too Short',
            'seo.item_desc_long': 'Meta Description Too Long',
            'seo.item_desc_warn_desc': '{len} characters. Keep between 120–160 chars to avoid clipping.',
            'seo.item_desc_empty_title': 'Meta Description Is Blank',
            'seo.item_desc_empty_desc': 'Add a concise summary so Google does not extract random page snippets.',
            'seo.item_desc_action_write': 'Write Description',
            'seo.item_desc_action_edit': 'Edit Description',
            'seo.preview_title_tag': 'Title',
            'seo.preview_desc_tag': 'Description',
            'seo.preview_content_tag': 'Content',
            'seo.item_kw_found_title': 'Keyword Presence: "{kw}"',
            'seo.item_kw_found_desc': 'Focus keyword distribution: [ {badges} ]. Helps search engines understand your landing page topic.',
            'seo.item_kw_empty_title': 'Target Keyword Not Defined',
            'seo.item_kw_empty_desc': 'Set a focus keyword in the input above to audit content relevance.',
            'seo.item_kw_action_set': 'Set Keyword',
            'seo.item_img_none_title': 'Image Audit Clean',
            'seo.item_img_none_desc': 'No raster images on page or all graphics are pure vector icons.',
            'seo.item_img_pass_title': 'All Images Have Alt Attributes',
            'seo.item_img_pass_desc': '{count} images have descriptive Alt tags, ready for Google Images & screen readers.',
            'seo.item_img_fail_title': '{count} Images Missing Alt Text',
            'seo.item_img_fail_desc': 'Search engines cannot interpret images without Alt attributes. Click below to inspect & fill Alt tags:',
            'seo.item_img_chip': 'Image #{num}',
            'seo.item_links_pass_title': 'All Links Have Valid Targets',
            'seo.item_links_pass_desc': '{count} links point to valid href destinations (no broken or blank anchors).',
            'seo.item_links_warn_title': '{count} Placeholder Links (href="#")',
            'seo.item_links_warn_desc': 'Buttons or links with placeholder hrefs detected. Click below to assign URLs in Inspector:',
            'seo.item_words_ideal_title': 'Optimal Content Depth ({count} Words)',
            'seo.item_words_ideal_desc': 'Meets Google 2026 standards for authoritative, high-value landing page content.',
            'seo.item_words_ok_title': 'Moderate Content Length ({count} Words)',
            'seo.item_words_ok_desc': 'Recommended 300+ words (e.g. by adding FAQ or feature breakdowns) for stronger authority.',
            'seo.item_words_short_title': 'Content Too Brief ({count} Words)',
            'seo.item_words_short_desc': 'Search engines prioritize comprehensive, informative pages with over 300 words.',
            'seo.item_og_pass_title': 'WhatsApp & Social Thumbnail Ready',
            'seo.item_og_pass_desc': 'Your link displays a rich visual card preview when shared across WhatsApp, Telegram, & social apps.',
            'seo.item_og_warn_title': 'No WhatsApp Share Thumbnail',
            'seo.item_og_warn_desc': 'Add a share image (1200x630 px) so link previews appear visually engaging in WhatsApp.',

            // Settings Panel
            'settings.page_title': 'Page Settings',
            'settings.layout_header': 'Layout & Header Footer',
            'settings.layout_desc': 'Choose page layout: use standalone full canvas or attach custom Header & Footer templates.',
            'settings.page_layout_label': 'Page Layout:',
            'settings.layout_canvas': 'Bongkar Canvas (Full Page)',
            'settings.layout_hf': 'Bongkar Header & Footer',
            'settings.header_label': 'Header Template:',
            'settings.header_default': '-- Default Global Header --',
            'settings.footer_label': 'Footer Template:',
            'settings.footer_default': '-- Default Global Footer --',
            'settings.shield_header': 'Security & Content Shield',
            'settings.shield_desc': 'Protect text, copy, and HTML code from content theft or scraping without hurting reader UX.',
            'settings.shield_enable': 'Enable Content Shield Protection',
            'settings.shield_mode_label': 'Copy Protection Mode:',
            'settings.shield_mode_watermark': 'Smart Watermark (Text copyable + auto backlink attribution)',
            'settings.shield_mode_block': 'Block Clipboard (Selection allowed, copy blocked)',
            'settings.shield_mode_full': 'Full Shield (Zero copy + anti-inspect protection)',
            'settings.shield_mode_hint': 'Visitors can highlight and read comfortably while copied content remains smart-protected.',
            'settings.shield_anti_inspect': 'Block Inspect Element, F12, & View Source (Ctrl+U)',
            'settings.shield_watermark_label': 'Custom Watermark Attribution Text (Optional):',
            'settings.shield_watermark_placeholder': 'e.g. Sourced from {title} ({url}) - All Rights Reserved.',
            'settings.shield_watermark_hint': 'Supported variables: {title} (Page Title) and {url} (Page Link).',
            'settings.favicon_header': 'Favicon & Browser Tab Icon',
            'settings.favicon_desc': 'Icon displayed on browser tabs, bookmarks, and mobile home screen shortcuts:',
            'settings.favicon_choose': 'Choose Favicon',
            'settings.favicon_reset_title': 'Reset to WordPress Default',
            'settings.favicon_placeholder': 'Favicon URL (https://...)',
            'settings.favicon_hint': 'Supported formats: PNG, ICO, SVG (square 32x32, 64x64, or 192x192 px).',
            'settings.tracking_header': 'Tracking & Analytics',
            'settings.tracking_desc': 'Direct tracking integration for Google Tag (GA4/Ads), Meta Pixel (Facebook Ads), & Microsoft Clarity:',
            'settings.gtag_label': 'Google Tag ID (GA4 / GTM / Ads):',
            'settings.gtag_placeholder': 'e.g. G-XXXXXXXXXX or AW-XXXXXXXXXX',
            'settings.pixel_label': 'Meta (Facebook) Pixel ID:',
            'settings.pixel_placeholder': 'e.g. 123456789012345',
            'settings.clarity_label': 'Microsoft Clarity Project ID:',
            'settings.clarity_placeholder': 'e.g. ab12cd34ef',
            'settings.custom_head_label': 'Custom Code <head> (Meta Verification / Custom Pixels):',
            'settings.custom_footer_label': 'Custom Code <body> / Footer (Chat Widgets / Tracking):',
            'settings.custom_css_header': 'Custom Page CSS',
            'settings.custom_css': 'Custom Page CSS',
            'settings.custom_css_placeholder': '/* Write custom page CSS rules here */',
            'settings.head_scripts': 'Header Scripts (<head>):',
            'settings.footer_scripts': 'Footer Scripts (before </body>):',

            // Custom HTML Section Modal
            'modal_html.title': 'Custom HTML Design',
            'modal_html.desc': 'Paste your custom or AI-generated HTML/UI components (Tailwind, Bootstrap, or pure HTML) to insert right at this section position.',
            'modal_html.code_label': 'Section HTML Code:',
            'modal_html.placeholder': '<section class="py-12 px-4">\n  <div class="container mx-auto">\n    <h2>My Custom Section</h2>\n    <p>Content description...</p>\n  </div>\n</section>',
            'modal_html.cancel': 'Cancel',
            'modal_html.insert': 'Insert Section',
            'modal_html.empty_alert': 'Please paste or enter HTML code first.',

            // Toasts & Alerts
            'toast.page_updated': 'Page updated successfully!',
            'toast.draft_saved': 'Draft saved successfully!',
            'toast.save_error': 'An error occurred while saving.',
            'toast.interactive_active': 'Interactive Mode Active: Test sliders, modals & live forms.',
            'toast.design_active': 'Design Mode Active: Visually edit canvas elements.',
            'toast.html_copied': 'HTML code copied to clipboard!',
            'toast.lang_switched': 'Studio language switched to English.',
            'toast.section_html_inserted': 'Custom HTML section successfully inserted!',
            'toast.interactive_banner': '<strong>Interactive Mode Active:</strong> Test calculators, sliders, accordions, and modals like real visitors.',
            'toast.exit_interactive_title': 'Return to Design Mode',
            'toast.exit_interactive': 'Return to Design Mode'
        }
    };

    const BongkarI18n = {
        currentLang: 'id',

        /**
         * Get current active language ('id' or 'en')
         */
        getLang: function () {
            let saved = null;
            try {
                saved = localStorage.getItem(STORAGE_KEY);
            } catch (e) {
                // Ignore storage restrictions
            }
            if (saved && (saved === 'en' || saved === 'id')) {
                this.currentLang = saved;
                return saved;
            }
            return this.currentLang;
        },

        /**
         * Translate key with optional fallback
         */
        t: function (key, fallback = '') {
            const lang = this.getLang();
            if (translations[lang] && translations[lang][key] !== undefined) {
                return translations[lang][key];
            }
            if (translations.id && translations.id[key] !== undefined) {
                return translations.id[key];
            }
            return fallback || key;
        },

        /**
         * Apply translations across the entire Studio DOM
         */
        applyToDOM: function () {
            const lang = this.getLang();

            // 1. Text elements
            document.querySelectorAll('[data-i18n]').forEach((el) => {
                const key = el.getAttribute('data-i18n');
                if (key) {
                    const text = this.t(key);
                    if (text) el.textContent = text;
                }
            });

            // 2. HTML elements
            document.querySelectorAll('[data-i18n-html]').forEach((el) => {
                const key = el.getAttribute('data-i18n-html');
                if (key) {
                    const html = this.t(key);
                    if (html) el.innerHTML = html;
                }
            });

            // 3. Titles / Tooltips
            document.querySelectorAll('[data-i18n-title]').forEach((el) => {
                const key = el.getAttribute('data-i18n-title');
                if (key) {
                    const title = this.t(key);
                    if (title) el.setAttribute('title', title);
                }
            });

            // 4. Input Placeholders
            document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
                const key = el.getAttribute('data-i18n-placeholder');
                if (key) {
                    const ph = this.t(key);
                    if (ph) el.setAttribute('placeholder', ph);
                }
            });

            // 5. Update save/publish button dynamically
            const saveBtnLabel = document.getElementById('btn-save-page-label');
            if (saveBtnLabel) {
                const isPublishNew = saveBtnLabel.dataset.isNew === 'true';
                if (isPublishNew) {
                    saveBtnLabel.textContent = this.t('topbar.publish_new');
                } else {
                    saveBtnLabel.textContent = this.t('topbar.publish');
                }
            }

            // 6. Synchronize dropdown select value
            const select = document.getElementById('studio-lang-switcher');
            if (select && select.value !== lang) {
                select.value = lang;
            }

            // 7. Update document lang attribute
            document.documentElement.lang = lang === 'id' ? 'id-ID' : 'en-US';

            // 8. Broadcast to canvas iframe
            this.broadcastToCanvas(lang);
        },

        /**
         * Send language change message to Canvas iframe
         */
        broadcastToCanvas: function (lang) {
            const frame = document.getElementById('bongkar-iframe-canvas') || document.getElementById('bongkar-canvas-frame');
            if (frame && frame.contentWindow) {
                frame.contentWindow.postMessage({
                    type: 'BONGKAR_CHANGE_LANG',
                    lang: lang
                }, '*');
            }
        },

        /**
         * Switch active language
         */
        setLang: function (lang, showToast = false) {
            if (lang !== 'id' && lang !== 'en') return;
            this.currentLang = lang;
            try {
                localStorage.setItem(STORAGE_KEY, lang);
            } catch (e) {
                console.warn('[Bongkar i18n] Failed to persist language to localStorage:', e);
            }

            this.applyToDOM();

            // Dispatch custom window event
            window.dispatchEvent(new CustomEvent('bongkar_lang_changed', { detail: { lang: lang } }));

            if (showToast && window.BongkarStudio && typeof window.BongkarStudio.showToast === 'function') {
                window.BongkarStudio.showToast(this.t('toast.lang_switched'), 'info');
            }
        },

        /**
         * Initialize i18n
         */
        init: function () {
            this.getLang();
            this.applyToDOM();

            // Setup language switcher dropdown listener
            const select = document.getElementById('studio-lang-switcher');
            if (select) {
                select.value = this.currentLang;
                select.addEventListener('change', (e) => {
                    this.setLang(e.target.value, true);
                });
            }

            // Also re-broadcast when canvas frame finishes loading
            const frame = document.getElementById('bongkar-iframe-canvas') || document.getElementById('bongkar-canvas-frame');
            if (frame) {
                frame.addEventListener('load', () => {
                    setTimeout(() => {
                        this.broadcastToCanvas(this.currentLang);
                    }, 300);
                });
            }

            // Re-apply whenever user switches tabs or subtabs in case any element was hidden or re-rendered
            document.addEventListener('click', (e) => {
                if (e.target.closest('.sidebar-tab-btn, .inspector-subtab-btn')) {
                    setTimeout(() => this.applyToDOM(), 30);
                }
            });
        }
    };

    // Expose to window
    window.BongkarI18n = BongkarI18n;

    // Auto-init on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => BongkarI18n.init());
    } else {
        BongkarI18n.init();
    }
})();
