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
            'seo.preview_google': 'Pratinjau Hasil Pencarian Google',
            'seo.preview_social': 'Pratinjau Berbagi Media Sosial (OpenGraph)',

            // Settings Panel
            'settings.page_title': 'Pengaturan Halaman',
            'settings.custom_css': 'Custom CSS Halaman',
            'settings.head_scripts': 'Header Scripts (<head>):',
            'settings.footer_scripts': 'Footer Scripts (sebelum </body>):',

            // Toasts & Alerts
            'toast.page_updated': 'Halaman berhasil diperbarui!',
            'toast.draft_saved': 'Draft berhasil disimpan!',
            'toast.save_error': 'Terjadi kesalahan saat menyimpan.',
            'toast.interactive_active': 'Mode Interaktif Aktif: Uji slider, modal & form live.',
            'toast.design_active': 'Mode Desain Aktif: Edit elemen visual kanvas.',
            'toast.html_copied': 'Kode HTML berhasil disalin ke clipboard!',
            'toast.lang_switched': 'Bahasa studio dialihkan ke Bahasa Indonesia.'
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
            'seo.preview_google': 'Google Search Snippet Preview',
            'seo.preview_social': 'Social Media Card Preview (OpenGraph)',

            // Settings Panel
            'settings.page_title': 'Page Settings',
            'settings.custom_css': 'Custom Page CSS',
            'settings.head_scripts': 'Header Scripts (<head>):',
            'settings.footer_scripts': 'Footer Scripts (before </body>):',

            // Toasts & Alerts
            'toast.page_updated': 'Page updated successfully!',
            'toast.draft_saved': 'Draft saved successfully!',
            'toast.save_error': 'An error occurred while saving.',
            'toast.interactive_active': 'Interactive Mode Active: Test sliders, modals & live forms.',
            'toast.design_active': 'Design Mode Active: Visually edit canvas elements.',
            'toast.html_copied': 'HTML code copied to clipboard!',
            'toast.lang_switched': 'Studio language switched to English.'
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
            const frame = document.getElementById('bongkar-canvas-frame');
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
            const frame = document.getElementById('bongkar-canvas-frame');
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
