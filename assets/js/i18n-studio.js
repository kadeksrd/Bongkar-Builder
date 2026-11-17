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
