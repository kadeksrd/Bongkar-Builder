<?php
/**
 * Bongkar Canvas Studio - Standalone Fullscreen Editor Template
 */

if (!defined('ABSPATH')) {
    exit;
}

$post_id = isset($_GET['post_id']) ? absint($_GET['post_id']) : 0;
$post = get_post($post_id);
if (!$post) {
    wp_die(__('Post not found.', 'bongkar-builder'));
}

// Fetch stored page data (Elementor-Style Draft & Live Separation)
$has_draft = get_post_meta($post_id, '_bongkar_has_draft', true) === '1';
$draft_updated_at = get_post_meta($post_id, '_bongkar_draft_updated_at', true);
$post_status = get_post_status($post_id);

// Layout & Template Resolutions
$current_page_layout = get_post_meta($post_id, '_bongkar_draft_page_layout', true) ?: (get_post_meta($post_id, '_bongkar_page_layout', true) ?: 'canvas');
$current_header_id   = get_post_meta($post_id, '_bongkar_draft_header_template_id', true) ?: get_post_meta($post_id, '_bongkar_header_template_id', true);
$current_footer_id   = get_post_meta($post_id, '_bongkar_draft_footer_template_id', true) ?: get_post_meta($post_id, '_bongkar_footer_template_id', true);

$available_headers   = class_exists('Bongkar_Builder_Templates') ? Bongkar_Builder_Templates::get_templates('header') : [];
$available_footers   = class_exists('Bongkar_Builder_Templates') ? Bongkar_Builder_Templates::get_templates('footer') : [];
$global_header_id    = class_exists('Bongkar_Builder_Templates') ? Bongkar_Builder_Templates::get_global_template_id('header') : 0;
$global_footer_id    = class_exists('Bongkar_Builder_Templates') ? Bongkar_Builder_Templates::get_global_template_id('footer') : 0;

if ($has_draft) {
    $current_html        = get_post_meta($post_id, '_bongkar_draft_html', true) ?: (get_post_meta($post_id, '_bongkar_canvas_html', true) ?: '');
    $current_js          = get_post_meta($post_id, '_bongkar_draft_js', true) ?: (get_post_meta($post_id, '_bongkar_canvas_js', true) ?: '');
    $current_css         = get_post_meta($post_id, '_bongkar_draft_css', true) ?: (get_post_meta($post_id, '_bongkar_canvas_css', true) ?: '');
    $current_ext_scripts = get_post_meta($post_id, '_bongkar_draft_external_scripts', true) ?: get_post_meta($post_id, '_bongkar_external_scripts', true);
    $current_ext_styles  = get_post_meta($post_id, '_bongkar_draft_external_styles', true) ?: get_post_meta($post_id, '_bongkar_external_styles', true);
    $current_settings    = get_post_meta($post_id, '_bongkar_draft_settings', true) ?: get_post_meta($post_id, '_bongkar_page_settings', true);
} else {
    $current_html        = get_post_meta($post_id, '_bongkar_canvas_html', true) ?: '';
    $current_js          = get_post_meta($post_id, '_bongkar_canvas_js', true) ?: '';
    $current_css         = get_post_meta($post_id, '_bongkar_canvas_css', true) ?: '';
    $current_ext_scripts = get_post_meta($post_id, '_bongkar_external_scripts', true);
    $current_ext_styles  = get_post_meta($post_id, '_bongkar_external_styles', true);
    $current_settings    = get_post_meta($post_id, '_bongkar_page_settings', true);
}

$parsed_settings = !empty($current_settings) ? json_decode($current_settings, true) : [];
$meta_title = !empty($parsed_settings['meta_title']) ? $parsed_settings['meta_title'] : $post->post_title;
$meta_desc = !empty($parsed_settings['meta_description']) ? $parsed_settings['meta_description'] : '';
$focus_keyword = !empty($parsed_settings['focus_keyword']) ? $parsed_settings['focus_keyword'] : '';
$gtag_id = !empty($parsed_settings['gtag_id']) ? $parsed_settings['gtag_id'] : '';
$meta_pixel_id = !empty($parsed_settings['meta_pixel_id']) ? $parsed_settings['meta_pixel_id'] : '';
$clarity_id = !empty($parsed_settings['clarity_id']) ? $parsed_settings['clarity_id'] : '';
$custom_head = !empty($parsed_settings['custom_head']) ? $parsed_settings['custom_head'] : '';
$custom_footer = !empty($parsed_settings['custom_footer']) ? $parsed_settings['custom_footer'] : '';
$favicon_url = !empty($parsed_settings['favicon_url']) ? $parsed_settings['favicon_url'] : get_site_icon_url(192);
$og_image_url = !empty($parsed_settings['og_image_url']) ? $parsed_settings['og_image_url'] : get_the_post_thumbnail_url($post_id, 'full');

// Auto-detect tracking & meta tags from existing HTML / JS if not yet explicitly saved
$combined_for_detect = ($current_html ?: '') . "\n" . ($current_js ?: '');
if (empty($gtag_id)) {
    if (preg_match('/googletagmanager\.com\/(?:gtag\/js|gtm\.js)\?id=([a-zA-Z0-9_-]+)/i', $combined_for_detect, $m)) {
        $gtag_id = $m[1];
    } elseif (preg_match('/gtag\(\s*[\'"]config[\'"]\s*,\s*[\'"]([a-zA-Z0-9_-]+)[\'"]/i', $combined_for_detect, $m)) {
        $gtag_id = $m[1];
    } elseif (preg_match('/[\'"](G-[A-Za-z0-9_-]{5,20}|GTM-[A-Za-z0-9_-]{5,20}|AW-[0-9]{6,15}|UA-[0-9]{5,12}-[0-9]{1,3})[\'"]/i', $combined_for_detect, $m)) {
        $gtag_id = $m[1];
    }
}
if (empty($meta_pixel_id)) {
    if (preg_match('/fbq\(\s*[\'"]init[\'"]\s*,\s*[\'"]([0-9]{8,25})[\'"]/i', $combined_for_detect, $m)) {
        $meta_pixel_id = $m[1];
    } elseif (preg_match('/connect\.facebook\.net\/[^"\']+\/fbevents\.js.*?id=([0-9]{8,25})/i', $combined_for_detect, $m)) {
        $meta_pixel_id = $m[1];
    }
}
if (empty($clarity_id)) {
    if (preg_match('/clarity\.ms\/tag\/([a-zA-Z0-9_-]+)/i', $combined_for_detect, $m)) {
        $clarity_id = $m[1];
    } elseif (preg_match('/clarity\(\s*[\'"](?:init|tag)[\'"]\s*,\s*[\'"]([a-zA-Z0-9_-]+)[\'"]/i', $combined_for_detect, $m)) {
        $clarity_id = $m[1];
    }
}
if (empty($meta_desc)) {
    if (preg_match('/<meta\b[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\']/is', $combined_for_detect, $m) ||
        preg_match('/<meta\b[^>]*content=["\']([^"\']*)["\'][^>]*name=["\']description["\']/is', $combined_for_detect, $m) ||
        preg_match('/<meta\b[^>]*property=["\']og:description["\'][^>]*content=["\']([^"\']*)["\']/is', $combined_for_detect, $m)) {
        $meta_desc = $m[1];
    }
}
if (empty($focus_keyword)) {
    if (preg_match('/<meta\b[^>]*name=["\']keywords["\'][^>]*content=["\']([^"\']*)["\']/is', $combined_for_detect, $m) ||
        preg_match('/<meta\b[^>]*content=["\']([^"\']*)["\'][^>]*name=["\']keywords["\']/is', $combined_for_detect, $m)) {
        $focus_keyword = $m[1];
    }
}
if (empty($og_image_url)) {
    if (preg_match('/<meta\b[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']*)["\']/is', $combined_for_detect, $m) ||
        preg_match('/<meta\b[^>]*name=["\']twitter:image["\'][^>]*content=["\']([^"\']*)["\']/is', $combined_for_detect, $m)) {
        $og_image_url = $m[1];
    }
}
if (empty($favicon_url)) {
    if (preg_match('/<link\b[^>]*rel=["\'](?:shortcut )?icon["\'][^>]*href=["\']([^"\']*)["\']/is', $combined_for_detect, $m) ||
        preg_match('/<link\b[^>]*href=["\']([^"\']*)["\'][^>]*rel=["\'](?:shortcut )?icon["\']/is', $combined_for_detect, $m)) {
        $favicon_url = $m[1];
    }
}

// Enqueue WordPress Media Library
wp_enqueue_media();

// Nonce for AJAX
$ajax_nonce = wp_create_nonce('bongkar_builder_nonce');
$popular_fonts = Bongkar_Builder_Google_Fonts::get_popular_fonts();
$canvas_frame_url = admin_url('admin.php?action=bongkar_canvas_frame&post_id=' . $post_id);
$permalink = get_permalink($post_id);
$preview_url = add_query_arg(['preview' => 'true', 'bongkar_preview' => '1'], $permalink);
?>
<!DOCTYPE html>
<html lang="<?php echo get_locale(); ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo sprintf(__('Bongkar Studio - %s', 'bongkar-builder'), esc_html($post->post_title)); ?></title>

    <!-- Font Awesome 6 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />

    <!-- Google Fonts for UI -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">

    <!-- WordPress Admin Styles minimal (for wp.media modal) -->
    <?php wp_print_head_scripts(); ?>
    <link rel="stylesheet" href="<?php echo esc_url(includes_url('css/dashicons.min.css')); ?>">
    <link rel="stylesheet" href="<?php echo esc_url(admin_url('css/media.min.css')); ?>">

    <!-- Editor Studio CSS -->
    <link rel="stylesheet" href="<?php echo esc_url(BONGKAR_BUILDER_URL . 'assets/css/editor-studio.css?v=' . BONGKAR_BUILDER_VERSION); ?>">
</head>
<body>

<div id="bongkar-studio-app">

    <!-- Top Navigation Bar -->
    <header class="studio-topbar">
        <div class="topbar-left">
            <a href="<?php echo esc_url(admin_url('admin.php?page=bongkar-builder')); ?>" class="brand-badge" title="<?php _e('Kembali ke Dashboard WordPress', 'bongkar-builder'); ?>">
                <div class="brand-icon"><i class="fa-solid fa-bolt"></i></div>
                <span class="brand-name">Bongkar Studio</span>
            </a>

            <div class="topbar-divider"></div>

            <div class="doc-info">
                <span class="doc-title" title="<?php echo esc_attr($post->post_title); ?>"><?php echo esc_html($post->post_title); ?></span>
                <span id="bongkar-save-status" class="save-status <?php echo $has_draft ? 'unsaved' : 'saved'; ?>">
                    <span class="status-dot"></span>
                    <span class="status-text"><?php echo $has_draft ? sprintf(__('Draft tersimpan (%s)', 'bongkar-builder'), esc_html(date_i18n('H:i', strtotime($draft_updated_at ?: 'now')))) : __('Terpublikasi', 'bongkar-builder'); ?></span>
                </span>
            </div>

            <div class="topbar-divider"></div>

            <!-- Topbar SEO Score Pill (Google 2026 Live Audit) -->
            <button type="button" id="topbar-seo-badge" class="topbar-seo-badge" title="Audit SEO Standar Google 2026 - Klik untuk Membuka Audit & Perbaikan">
                <i class="fa-solid fa-gauge-high"></i>
                <span class="seo-label">SEO</span>
                <span class="seo-divider"></span>
                <strong id="topbar-seo-score-num">--</strong>
            </button>
        </div>

        <!-- Topbar Center: Mode Switcher & Device Switcher -->
        <div class="topbar-center">
            <!-- Mode Switcher (Desain vs Interaktif) -->
            <div class="mode-switcher-pill">
                <button type="button" id="btn-mode-design" class="mode-btn active" data-i18n-title="topbar.mode_design_desc" title="Mode Desain: Edit elemen halaman secara visual">
                    <i class="fa-solid fa-paintbrush"></i>
                    <span data-i18n="topbar.mode_design">Desain</span>
                </button>
                <button type="button" id="btn-mode-interactive" class="mode-btn" data-i18n-title="topbar.mode_interactive_desc" title="Mode Interaktif (Live Testing): Jalankan slider, popup & form seperti web asli (Shortcut: Ctrl+I)">
                    <i class="fa-solid fa-bolt"></i>
                    <span data-i18n="topbar.mode_interactive">Interaktif</span>
                    <span class="mode-live-indicator">LIVE</span>
                </button>
            </div>

            <div class="topbar-subdivider"></div>

            <!-- Responsive Device Switcher -->
            <div class="device-switcher-pill">
                <button type="button" class="device-btn active" data-device="desktop" title="Desktop View (Fit / Scale)">
                    <i class="fa-solid fa-desktop"></i>
                    <span data-i18n="topbar.device_desktop">Desktop</span>
                    <span class="device-res-badge" id="badge-device-desktop">100%</span>
                </button>
                <button type="button" class="device-btn" data-device="tablet" title="Tablet View (768px)">
                    <i class="fa-solid fa-tablet-screen-button"></i>
                    <span data-i18n="topbar.device_tablet">Tablet</span>
                    <span class="device-res-badge">768px</span>
                </button>
                <button type="button" class="device-btn" data-device="mobile" title="Mobile View (390px - iPhone & Android Flagship)">
                    <i class="fa-solid fa-mobile-screen"></i>
                    <span data-i18n="topbar.device_mobile">Mobile</span>
                    <span class="device-res-badge">390px</span>
                </button>
            </div>
        </div>

        <!-- Topbar Right Actions -->
        <div class="topbar-right">
            <button type="button" id="btn-undo" class="btn-studio-action" data-i18n-title="topbar.undo" title="Undo (Ctrl+Z)">
                <i class="fa-solid fa-rotate-left"></i>
            </button>
            <button type="button" id="btn-redo" class="btn-studio-action" data-i18n-title="topbar.redo" title="Redo (Ctrl+Y)">
                <i class="fa-solid fa-rotate-right"></i>
            </button>

            <!-- Preview Link -->
            <a href="<?php echo esc_url($preview_url); ?>" id="btn-preview-link" target="_blank" class="btn-studio-action" data-i18n-title="topbar.preview_desc" title="Lihat Pratinjau Tampilan Live di Tab Baru">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                <span data-i18n="topbar.preview">Preview</span>
            </a>

            <!-- Export HTML Button -->
            <button type="button" id="btn-open-exporter" class="btn-studio-action" data-i18n-title="topbar.export_html_desc" title="Export Halaman ke File HTML Mandiri (.html)">
                <i class="fa-solid fa-file-export"></i>
                <span data-i18n="topbar.export_html">Export HTML</span>
            </button>

            <!-- Simpan Draft Button -->
            <button type="button" id="btn-save-draft" class="btn-studio-action" data-i18n-title="topbar.save_draft_desc" title="Simpan sebagai Draft (Hanya tersimpan di editor, tidak mengubah halaman live pengunjung)">
                <i class="fa-solid fa-file-pen"></i>
                <span data-i18n="topbar.save_draft">Simpan Draft</span>
            </button>

            <!-- Save & Publish Button (Elementor-Style Publish/Perbarui) -->
            <button type="button" id="btn-save-page" class="btn-studio-action btn-save-publish" data-i18n-title="topbar.publish_desc" title="Publikasikan semua perubahan ke pengunjung live (Ctrl+S)">
                <i class="fa-solid fa-cloud-arrow-up"></i>
                <span id="btn-save-page-label" data-is-new="<?php echo ($post_status === 'publish') ? 'false' : 'true'; ?>"><?php echo ($post_status === 'publish') ? __('Perbarui', 'bongkar-builder') : __('Publish', 'bongkar-builder'); ?></span>
            </button>

            <!-- Language Switcher Dropdown (Bilingual ID / EN) -->
            <div class="studio-lang-dropdown-wrap" data-i18n-title="topbar.lang_switcher" title="Pilih Bahasa Editor">
                <i class="fa-solid fa-globe lang-icon"></i>
                <select id="studio-lang-switcher" class="studio-lang-select" aria-label="Editor Language">
                    <option value="id">ID</option>
                    <option value="en">EN</option>
                </select>
                <i class="fa-solid fa-chevron-down lang-chevron"></i>
            </div>

            <!-- Exit Button -->
            <a href="<?php echo esc_url(admin_url('admin.php?page=bongkar-builder')); ?>" class="btn-studio-action" data-i18n-title="topbar.exit" title="Keluar ke Dashboard WordPress">
                <i class="fa-solid fa-xmark"></i>
            </a>
        </div>
    </header>

    <!-- Master Workspace -->
    <main class="studio-workspace">

        <!-- Left Sidebar -->
        <aside class="studio-sidebar" id="studio-sidebar">
            <!-- Sidebar Collapse Toggle Button (Elementor Style) -->
            <button type="button" id="btn-toggle-sidebar" class="sidebar-collapse-toggle" title="Sembunyikan / Tampilkan Panel (Shortcut: Ctrl + \)">
                <i class="fa-solid fa-chevron-left"></i>
            </button>

            <!-- Navigation Tabs -->
            <nav class="sidebar-tabs">
                <button type="button" class="sidebar-tab-btn active" data-tab="inspector" data-i18n-title="tab.inspector_desc" title="Edit Elemen, CSS & Algoritma">
                    <i class="fa-solid fa-sliders"></i>
                    <span data-i18n="tab.inspector">Inspector</span>
                </button>
                <button type="button" class="sidebar-tab-btn" data-tab="elements" data-i18n-title="tab.add_desc" title="Tambah Section & Elemen Baru">
                    <i class="fa-solid fa-shapes"></i>
                    <span data-i18n="tab.add">Tambah</span>
                </button>
                <button type="button" class="sidebar-tab-btn" data-tab="seo" data-i18n-title="tab.seo_desc" title="Audit & Pengaturan SEO Standar Google 2026">
                    <i class="fa-solid fa-chart-line"></i>
                    <span data-i18n="tab.seo">SEO</span>
                </button>
                <button type="button" class="sidebar-tab-btn" data-tab="icons" data-i18n-title="tab.icons_desc" title="Font Awesome 6 Icon Picker">
                    <i class="fa-solid fa-icons"></i>
                    <span data-i18n="tab.icons">Icons</span>
                </button>
                <button type="button" class="sidebar-tab-btn" data-tab="settings" data-i18n-title="tab.settings_desc" title="Pengaturan Halaman, Tracking & Custom CSS">
                    <i class="fa-solid fa-gear"></i>
                    <span data-i18n="tab.settings">Pengaturan</span>
                </button>
            </nav>

            <!-- Sidebar Scrollable Content -->
            <div class="sidebar-content">

                <!-- 1. TAB: INSPECTOR (ELEMENT STYLES & CONTROLS) -->
                <div id="tab-inspector" class="sidebar-panel active">
                    <div id="inspector-empty-state" style="text-align: center; padding: 36px 12px; color: var(--text-muted);">
                        <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(99, 102, 241, 0.12); color: #818cf8; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 14px;">
                            <i class="fa-solid fa-arrow-pointer"></i>
                        </div>
                        <h4 data-i18n="empty.title" style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0 0 8px 0;">Pilih Elemen di Kanvas</h4>
                        <p data-i18n="empty.desc" style="font-size: 13px; line-height: 1.5; margin: 0 0 16px 0;">
                            Klik elemen apa saja di dalam kanvas untuk mengubah teks, font, warna, ukuran, atau gambarnya.
                        </p>
                        <button type="button" class="btn-studio-action btn-go-widgets" style="background: #4f46e5; color: #ffffff; border: none; padding: 9px 18px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);">
                            <i class="fa-solid fa-table-cells"></i> <span data-i18n="empty.btn_widgets">Buka Panel Widget</span>
                        </button>
                    </div>

                    <div id="inspector-active-content" style="display: none;">
                        <!-- Sticky Edge-to-Edge Header (Ala Elementor: Action Bar & Subtabs) -->
                        <div class="inspector-sticky-header">
                            <div class="inspector-sticky-header-top">
                                <button type="button" id="btn-back-to-widgets" class="btn-studio-action btn-back-widgets-header" data-i18n-title="inspector.back_widgets" title="Kembali ke Panel Widget">
                                    <i class="fa-solid fa-arrow-left"></i> <span data-i18n="inspector.back_widgets">Kembali ke Widget</span>
                                </button>
                                <div class="inspector-quick-pill" title="Elemen aktif">
                                    <span id="selected-element-badge-header">--</span>
                                </div>
                            </div>

                            <!-- 4 Modern Sub-Tabs (Content, Style, Layout, Logic) -->
                            <div class="inspector-subtabs">
                                <button type="button" class="inspector-subtab-btn active" data-subtab="content" title="Pengaturan Konten & Teks">
                                    <i class="fa-solid fa-pen-to-square"></i> <span data-i18n="inspector.subtab_content">Konten</span>
                                </button>
                                <button type="button" class="inspector-subtab-btn" data-subtab="style" title="Pengaturan Tipografi, Warna & Gaya">
                                    <i class="fa-solid fa-palette"></i> <span data-i18n="inspector.subtab_style">Gaya</span>
                                </button>
                                <button type="button" class="inspector-subtab-btn" data-subtab="layout" title="Pengaturan Dimensi Lebar, Tinggi & Flexbox">
                                    <i class="fa-solid fa-cubes"></i> <span data-i18n="inspector.subtab_layout">Tata Letak</span>
                                </button>
                                <button type="button" class="inspector-subtab-btn" data-subtab="logic" title="Pengaturan Skrip & Interaktivitas Elemen">
                                    <i class="fa-solid fa-bolt"></i> <span data-i18n="inspector.subtab_logic">Logika</span>
                                </button>
                            </div>
                        </div>

                        <!-- Element Selector Header with Dynamic Role Indicator -->
                        <div id="inspector-element-header" style="margin-bottom: 14px; padding: 12px; background: var(--bg-surface-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-md);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <div id="inspector-role-pill" style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3);">
                                    <i class="fa-solid fa-table-columns" id="inspector-role-icon"></i>
                                    <span id="inspector-role-text">Mode Kolom / Layout</span>
                                </div>
                                <div style="display: flex; gap: 4px; align-items: center;">
                                    <button type="button" id="btn-wrap-in-container" class="btn-studio-action" style="padding: 4px 8px; font-size: 11px;" title="Bungkus dalam Kontainer Baru">
                                        <i class="fa-solid fa-box-archive"></i> Bungkus
                                    </button>
                                    <button type="button" id="btn-parent-select" class="btn-studio-action" style="padding: 4px 8px; font-size: 11px;" title="Pilih Pembungkus / Parent Element (Alt+Up)">
                                        <i class="fa-solid fa-arrow-turn-up"></i> Induk
                                    </button>
                                </div>
                            </div>
                            <div style="display: flex; align-items: baseline; gap: 6px;">
                                <span style="font-size: 11px; color: var(--text-muted);">Tag:</span>
                                <span id="selected-element-badge" style="font-weight: 700; font-size: 13px; color: #ffffff; font-family: monospace;">
                                    H1.hero-title
                                </span>
                            </div>
                            <div id="inspector-role-hint" style="font-size: 11px; color: var(--text-muted); margin-top: 6px; line-height: 1.4;">
                                Mengatur struktur layout, padding, dan lebar kolom.
                            </div>

                            <!-- Interactive Breadcrumb Hierarchy Bar -->
                            <div id="inspector-breadcrumb-bar" style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed var(--border-light, #334155);">
                                <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
                                    <span><i class="fa-solid fa-sitemap" style="margin-right: 4px;"></i> Hierarki Pembungkus:</span>
                                    <span id="inspector-child-count-badge" style="display: none; font-size: 10px; background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 1px 6px; border-radius: 4px;">0 Elemen Anak</span>
                                </div>
                                <div id="inspector-breadcrumb-trail" class="inspector-breadcrumb-trail">
                                    <!-- Rendered dynamically via JS -->
                                </div>
                            </div>
                        </div>

                        <!-- SUBTAB PANEL 1: KONTEN (CONTENT) -->
                        <div id="subtab-panel-content" class="inspector-subtab-panel active">

                        <!-- 1.1 Tag Switcher & Content -->
                        <div class="control-group">
                            <div class="control-group-header">
                                <span><i class="fa-solid fa-code"></i> Tag Semantik & Teks</span>
                                <i class="fa-solid fa-chevron-down"></i>
                            </div>
                            <div class="control-group-body">
                                <div class="form-row">
                                    <label class="form-label">Ubah HTML Tag:</label>
                                    <select id="ctrl-tag-switcher" class="form-select">
                                        <option value="h1">Heading 1 (&lt;h1&gt;)</option>
                                        <option value="h2">Heading 2 (&lt;h2&gt;)</option>
                                        <option value="h3">Heading 3 (&lt;h3&gt;)</option>
                                        <option value="h4">Heading 4 (&lt;h4&gt;)</option>
                                        <option value="h5">Heading 5 (&lt;h5&gt;)</option>
                                        <option value="h6">Heading 6 (&lt;h6&gt;)</option>
                                        <option value="p">Paragraph (&lt;p&gt;)</option>
                                        <option value="span">Span Inline (&lt;span&gt;)</option>
                                        <option value="a">Link Anchor (&lt;a&gt;)</option>
                                        <option value="button">Button (&lt;button&gt;)</option>
                                        <option value="div">Div Container (&lt;div&gt;)</option>
                                    </select>
                                </div>
                                <div class="form-row" id="row-text-content">
                                    <label class="form-label">Teks / Konten:</label>
                                    <textarea id="ctrl-text-content" class="form-input" style="height: 70px; padding: 8px; resize: vertical;"></textarea>
                                </div>
                            </div>
                        </div>

                        <!-- 1.2 Image / Media Controls (Conditional) -->
                        <div class="control-group" id="group-image-controls" style="display: none;">
                            <div class="control-group-header">
                                <span><i class="fa-solid fa-image"></i> Gambar & Media</span>
                                <i class="fa-solid fa-chevron-down"></i>
                            </div>
                            <div class="control-group-body">
                                <button type="button" id="btn-wp-media-picker" class="btn-studio-action btn-import-ai" style="width: 100%; justify-content: center; height: 38px;">
                                    <i class="fa-solid fa-photo-film"></i> Ganti dari Media Library WP
                                </button>
                                <div class="form-row">
                                    <label class="form-label">Image URL:</label>
                                    <input type="text" id="ctrl-img-src" class="form-input">
                                </div>
                                <div class="form-row">
                                    <label class="form-label">Alt Text (SEO):</label>
                                    <input type="text" id="ctrl-img-alt" class="form-input" placeholder="Deskripsi gambar untuk SEO">
                                </div>
                                <div class="form-row">
                                    <label class="form-label">Object Fit:</label>
                                    <select id="ctrl-img-fit" class="form-select">
                                        <option value="">Default</option>
                                        <option value="cover">Cover</option>
                                        <option value="contain">Contain</option>
                                        <option value="fill">Fill</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- 1.3 Link Controls (Conditional) -->
                        <div class="control-group" id="group-link-controls" style="display: none;">
                            <div class="control-group-header">
                                <span><i class="fa-solid fa-link"></i> Link & URL</span>
                                <i class="fa-solid fa-chevron-down"></i>
                            </div>
                            <div class="control-group-body">
                                <div class="form-row">
                                    <label class="form-label">Target URL (href):</label>
                                    <input type="text" id="ctrl-link-href" class="form-input" placeholder="https:// atau #section">
                                </div>
                                <div class="form-row-horizontal">
                                    <label class="form-label">Buka di Tab Baru:</label>
                                    <input type="checkbox" id="ctrl-link-blank" style="accent-color: var(--primary); width: 18px; height: 18px;">
                                </div>
                            </div>
                        </div>

                        <!-- 1.3B Modal / Pop-up Quick Trigger Control -->
                        <div class="control-group" id="group-modal-trigger-controls" style="display: none;">
                            <div class="control-group-header">
                                <span><i class="fa-solid fa-window-restore" style="color: #818cf8;"></i> Pop-up / Modal Terhubung</span>
                                <i class="fa-solid fa-chevron-down"></i>
                            </div>
                            <div class="control-group-body">
                                <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 10px; line-height: 1.4;">
                                    Tombol ini membuka kotak pop-up/modal. Klik tombol di bawah untuk membuka dan mengedit isi pop-up secara langsung:
                                </p>
                                <button type="button" id="btn-quick-open-modal-edit" class="btn-studio-action" style="width: 100%; justify-content: center; height: 38px; background: #312e81; border: 1px solid #4f46e5; color: #e0e7ff; font-weight: 700;">
                                    <i class="fa-solid fa-window-restore"></i> Buka & Edit Isi Pop-up
                                </button>
                            </div>
                        </div>

                        <!-- 1.3A Form Integration Controls (Conditional - Form / Form Elements) -->
                        <div class="control-group" id="group-form-controls" style="display: none;">
                            <div class="control-group-header">
                                <span><i class="fa-solid fa-paper-plane" style="color: #22c55e;"></i> Integrasi Form (WA & Google Sheet)</span>
                                <i class="fa-solid fa-chevron-down"></i>
                            </div>
                            <div class="control-group-body">
                                <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 10px; line-height: 1.4;">
                                    Hubungkan formulir ini ke WhatsApp dan/atau Google Sheets Webhook. Keduanya dapat dicentang bersamaan!
                                </div>

                                <!-- WhatsApp Checkbox & Settings -->
                                <div style="background: rgba(37, 211, 102, 0.08); border: 1px solid rgba(37, 211, 102, 0.25); border-radius: var(--radius-md); padding: 12px; margin-bottom: 12px;">
                                    <label style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 13px; color: #4ade80; cursor: pointer; margin-bottom: 4px;">
                                        <input type="checkbox" id="ctrl-form-wa-enable" style="accent-color: #22c55e; width: 18px; height: 18px;">
                                        <span><i class="fa-brands fa-whatsapp"></i> Kirim ke WhatsApp</span>
                                    </label>
                                    <div id="row-form-wa-fields" style="display: none; flex-direction: column; gap: 8px; margin-top: 10px;">
                                        <div class="form-row">
                                            <label class="form-label" style="font-size: 11px;">Nomor WA Tujuan (Format 62...):</label>
                                            <input type="text" id="ctrl-form-wa-number" class="form-input" placeholder="Contoh: 628123456789">
                                        </div>
                                        <div class="form-row">
                                            <label class="form-label" style="font-size: 11px;">Template Pesan WhatsApp:</label>
                                            <textarea id="ctrl-form-wa-template" class="form-input" style="height: 75px; font-size: 11px; resize: vertical;" placeholder="Halo, saya *[nama]* tertarik dengan pesanan. No HP: [telepon]. Catatan: [pesan]"></textarea>
                                            <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">
                                                Gunakan tag <code>[nama]</code>, <code>[telepon]</code>, <code>[layanan]</code>, <code>[pesan]</code> sesuai atribut <code>name="..."</code> pada field formulir.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Google Sheets Checkbox & Settings -->
                                <div style="background: rgba(14, 165, 233, 0.08); border: 1px solid rgba(14, 165, 233, 0.25); border-radius: var(--radius-md); padding: 12px; margin-bottom: 12px;">
                                    <label style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 13px; color: #38bdf8; cursor: pointer; margin-bottom: 4px;">
                                        <input type="checkbox" id="ctrl-form-gsheet-enable" style="accent-color: #0ea5e9; width: 18px; height: 18px;">
                                        <span><i class="fa-solid fa-table"></i> Kirim ke Google Sheets</span>
                                    </label>
                                    <div id="row-form-gsheet-fields" style="display: none; flex-direction: column; gap: 8px; margin-top: 10px;">
                                        <div class="form-row">
                                            <label class="form-label" style="font-size: 11px;">Webhook URL Google Apps Script:</label>
                                            <input type="url" id="ctrl-form-gsheet-url" class="form-input" placeholder="https://script.google.com/macros/s/.../exec">
                                            <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">
                                                Data form otomatis masuk ke Google Spreadsheet tanpa perlu reload halaman!
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Form Success Feedback -->
                                <div class="form-row">
                                    <label class="form-label" style="font-size: 11px;">Pesan Sukses Formulir:</label>
                                    <input type="text" id="ctrl-form-success-msg" class="form-input" placeholder="Terima kasih! Pesanan Anda telah berhasil dikirim.">
                                </div>
                            </div>
                        </div>

                        <!-- 1.3B Video Controls (Conditional) -->
                        <div class="control-group" id="group-video-controls" style="display: none;">
                            <div class="control-group-header">
                                <span><i class="fa-brands fa-youtube" style="color: #ef4444;"></i> Pengaturan Video</span>
                                <i class="fa-solid fa-chevron-down"></i>
                            </div>
                            <div class="control-group-body">
                                <div class="form-row">
                                    <label class="form-label">Link / URL Video:</label>
                                    <input type="text" id="ctrl-video-url" class="form-input" placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/...">
                                    <div style="font-size: 10px; color: var(--text-muted); margin-top: 3px; line-height: 1.4;">
                                        Mendukung link YouTube biasa, YouTube Shorts, Vimeo, atau link video MP4 langsung.
                                    </div>
                                </div>
                                <div class="form-row">
                                    <label class="form-label">Rasio Aspek (Aspect Ratio):</label>
                                    <select id="ctrl-video-ratio" class="form-select">
                                        <option value="16:9">16:9 - Widescreen (YouTube / TV Standar)</option>
                                        <option value="9:16">9:16 - Vertikal (YouTube Shorts / Reels / TikTok)</option>
                                        <option value="4:3">4:3 - Klasik</option>
                                        <option value="1:1">1:1 - Persegi (Square)</option>
                                    </select>
                                </div>
                                <div class="form-row" style="display: flex; flex-direction: column; gap: 8px;">
                                    <label class="form-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                        <input type="checkbox" id="ctrl-video-autoplay" style="accent-color: var(--primary);">
                                        <span>Autoplay (Putar Otomatis)</span>
                                    </label>
                                    <label class="form-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                        <input type="checkbox" id="ctrl-video-mute" style="accent-color: var(--primary);">
                                        <span>Mute (Bisukan Suara - wajib untuk autoplay)</span>
                                    </label>
                                    <label class="form-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                        <input type="checkbox" id="ctrl-video-loop" style="accent-color: var(--primary);">
                                        <span>Loop (Putar Berulang)</span>
                                    </label>
                                </div>
                                <button type="button" id="btn-apply-video" class="btn-studio-action btn-save-publish" style="width: 100%; justify-content: center; height: 34px; margin-top: 6px;">
                                    <i class="fa-solid fa-check"></i> Perbarui Video
                                </button>
                            </div>
                        </div>

                        <!-- 1.3C Icon Controls (Conditional) -->
                        <div class="control-group" id="group-icon-controls" style="display: none;">
                            <div class="control-group-header">
                                <span><i class="fa-solid fa-icons" style="color: #f59e0b;"></i> Pengaturan Icon</span>
                                <i class="fa-solid fa-chevron-down"></i>
                            </div>
                            <div class="control-group-body">
                                <div class="form-row">
                                    <label class="form-label">Icon Aktif:</label>
                                    <div style="display: flex; gap: 10px; align-items: center;">
                                        <div id="inspector-icon-preview-box" style="width: 44px; height: 44px; border-radius: 8px; background: var(--bg-main); border: 1px solid var(--border-light); display: flex; align-items: center; justify-content: center; font-size: 22px; color: var(--primary); flex-shrink: 0;">
                                            <i id="ctrl-icon-preview-i" class="fa-solid fa-star"></i>
                                        </div>
                                        <div style="flex: 1; min-width: 0;">
                                            <code id="ctrl-icon-class-label" style="display: block; font-size: 11px; color: #a5b4fc; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; margin-bottom: 6px;">fa-solid fa-star</code>
                                            <button type="button" id="btn-open-icon-picker-inspector" class="btn-studio-action" style="width: 100%; justify-content: center; height: 30px; font-size: 11px; padding: 0 8px;">
                                                <i class="fa-solid fa-magnifying-glass"></i> Ganti Icon...
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <label class="form-label">Ukuran Icon (Icon Size):</label>
                                    <div class="form-slider-row">
                                        <input type="range" id="ctrl-icon-size-slider" class="form-slider" min="12" max="120" value="28">
                                        <input type="number" id="ctrl-icon-size-num" class="slider-val-box" value="28">
                                        <span style="font-size: 11px; color: var(--text-muted);">px</span>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <label class="form-label">Warna Icon:</label>
                                    <div style="display: flex; gap: 8px; align-items: center;">
                                        <input type="color" id="ctrl-icon-color-picker" style="border: none; width: 36px; height: 36px; border-radius: 6px; cursor: pointer; background: transparent;">
                                        <input type="text" id="ctrl-icon-color-hex" class="form-input" placeholder="#f59e0b" style="flex: 1;">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 1.3D Spacer Controls (Conditional) -->
                        <div class="control-group" id="group-spacer-controls" style="display: none;">
                            <div class="control-group-header">
                                <span><i class="fa-solid fa-arrows-up-down" style="color: #38bdf8;"></i> Ukuran Spacer (Jarak)</span>
                                <i class="fa-solid fa-chevron-down"></i>
                            </div>
                            <div class="control-group-body">
                                <div class="form-row">
                                    <label class="form-label">Tinggi Jarak Kosong (Height):</label>
                                    <div class="form-slider-row">
                                        <input type="range" id="ctrl-spacer-height-slider" class="form-slider" min="10" max="250" value="40">
                                        <input type="number" id="ctrl-spacer-height-num" class="slider-val-box" value="40">
                                        <span style="font-size: 11px; color: var(--text-muted);">px</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 1.3E Rating Controls (Conditional) -->
                        <div class="control-group" id="group-rating-controls" style="display: none;">
                            <div class="control-group-header">
                                <span><i class="fa-solid fa-star-half-stroke" style="color: #eab308;"></i> Rating Bintang & Review</span>
                                <i class="fa-solid fa-chevron-down"></i>
                            </div>
                            <div class="control-group-body">
                                <div class="form-row">
                                    <label class="form-label">Jumlah Bintang:</label>
                                    <select id="ctrl-rating-stars" class="form-select">
                                        <option value="5">5 Bintang (Penuh)</option>
                                        <option value="4.5">4.5 Bintang</option>
                                        <option value="4">4 Bintang</option>
                                        <option value="3.5">3.5 Bintang</option>
                                        <option value="3">3 Bintang</option>
                                    </select>
                                </div>
                                <div class="form-row">
                                    <label class="form-label">Teks Ulasan / Keterangan:</label>
                                    <input type="text" id="ctrl-rating-label" class="form-input" placeholder="4.9 / 5.0 (2,400+ Ulasan Puas)">
                                </div>
                                <button type="button" id="btn-apply-rating" class="btn-studio-action btn-save-publish" style="width: 100%; justify-content: center; height: 32px; margin-top: 4px;">
                                    <i class="fa-solid fa-check"></i> Perbarui Rating
                                </button>
                            </div>
                        </div>

                        <!-- 1.3F Dynamic Post Grid Controls (Elementor-Style Post Loop) -->
                        <div class="control-group" id="group-postgrid-controls" style="display: none;">
                            <div class="control-group-header">
                                <span><i class="fa-solid fa-newspaper" style="color: #6366f1;"></i> Pengaturan Feed Post WordPress</span>
                                <i class="fa-solid fa-chevron-down"></i>
                            </div>
                            <div class="control-group-body">
                                <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 10px; line-height: 1.4;">
                                    Tentukan artikel yang ingin ditampilkan di grid ini secara otomatis langsung dari database WordPress:
                                </div>

                                <div class="form-row" style="margin-bottom: 10px;">
                                    <label class="form-label" style="font-size: 11px;">Sumber Pengambilan Post:</label>
                                    <select id="ctrl-postgrid-filter" class="form-select">
                                        <option value="recent">Postingan Terbaru (Recent Posts)</option>
                                        <option value="category">Berdasarkan Kategori Tertentu</option>
                                        <option value="handpicked">Pilih Post Tertentu (ID Manual)</option>
                                    </select>
                                </div>

                                <div class="form-row" id="row-postgrid-category" style="display: none; margin-bottom: 10px;">
                                    <label class="form-label" style="font-size: 11px;">Pilih Kategori:</label>
                                    <select id="ctrl-postgrid-category" class="form-select">
                                        <option value="0">-- Semua Kategori --</option>
                                        <?php 
                                        $wp_cats = get_categories(['hide_empty' => false]);
                                        foreach ($wp_cats as $c): ?>
                                            <option value="<?php echo esc_attr($c->term_id); ?>">
                                                <?php echo esc_html($c->name); ?> (<?php echo esc_html($c->count); ?>)
                                            </option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>

                                <div class="form-row" id="row-postgrid-handpicked" style="display: none; margin-bottom: 10px;">
                                    <label class="form-label" style="font-size: 11px;">ID Postingan Tertentu (Pisahkan koma):</label>
                                    <input type="text" id="ctrl-postgrid-ids" class="form-input" placeholder="Contoh: 12, 18, 25">
                                    <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">
                                        Masukkan ID artikel WordPress yang ingin ditampilkan secara spesifik.
                                    </div>
                                </div>

                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                                    <div>
                                        <label class="form-label" style="font-size: 11px;">Jumlah Post:</label>
                                        <input type="number" id="ctrl-postgrid-count" class="form-input" min="1" max="24" value="6">
                                    </div>
                                    <div>
                                        <label class="form-label" style="font-size: 11px;">Jumlah Kolom:</label>
                                        <select id="ctrl-postgrid-cols" class="form-select">
                                            <option value="1">1 Kolom (List)</option>
                                            <option value="2">2 Kolom</option>
                                            <option value="3" selected>3 Kolom (Grid)</option>
                                            <option value="4">4 Kolom</option>
                                        </select>
                                    </div>
                                </div>

                                <button type="button" id="btn-apply-postgrid-settings" class="btn-studio-action btn-save-publish" style="width: 100%; justify-content: center; height: 34px;">
                                    <i class="fa-solid fa-rotate"></i> Terapkan Pengaturan Feed
                                </button>
                            </div>
                        </div>

                        <!-- 1.3F Custom Embed / HTML / Script Widget Controls (Conditional) -->
                        <div class="control-group" id="group-embed-controls" style="display: none;">
                            <div class="control-group-header">
                                <span><i class="fa-solid fa-code" style="color: #a78bfa;"></i> Kode Embed HTML / Script</span>
                                <i class="fa-solid fa-chevron-down"></i>
                            </div>
                            <div class="control-group-body">
                                <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px; line-height: 1.4;">
                                    Tuliskan kode HTML, iframe Google Maps / YouTube, atau widget embed seperti widget Elementor HTML:
                                </div>
                                <textarea id="ctrl-embed-html" class="form-input" style="height: 160px; font-family: monospace; font-size: 12px; resize: vertical;" placeholder="<div>Custom HTML / <iframe> / <script>...</div>"></textarea>
                                <button type="button" id="btn-apply-embed-html" class="btn-studio-action btn-save-publish" style="width: 100%; justify-content: center; height: 34px; margin-top: 8px;">
                                    <i class="fa-solid fa-check"></i> Terapkan Kode HTML
                                </button>
                            </div>
                        </div>
                        </div><!-- /#subtab-panel-content -->

                        <!-- SUBTAB PANEL 2: GAYA (STYLE) -->
                        <div id="subtab-panel-style" class="inspector-subtab-panel">

                        <!-- 1.4 Typography & Google Fonts -->
                        <div class="control-group">
                            <div class="control-group-header">
                                <span><i class="fa-solid fa-font"></i> Tipografi & Google Fonts</span>
                                <i class="fa-solid fa-chevron-down"></i>
                            </div>
                            <div class="control-group-body">
                                <!-- Google Font Dropdown -->
                                <div class="form-row">
                                    <label class="form-label">Google Font Family:</label>
                                    <select id="ctrl-font-family" class="form-select">
                                        <option value="">Default (Bawaan Desain)</option>
                                        <optgroup label="Google Fonts Populer">
                                            <?php foreach ($popular_fonts as $gf): ?>
                                                <option value="<?php echo esc_attr($gf['name']); ?>"><?php echo esc_html($gf['name']); ?></option>
                                            <?php endforeach; ?>
                                        </optgroup>
                                        <option value="__custom__">+ Ketik Nama Font Google Lainnya...</option>
                                    </select>
                                </div>

                                <!-- Custom Google Font Input (Hidden by default) -->
                                <div class="form-row" id="row-custom-google-font" style="display: none;">
                                    <label class="form-label">Ketik Nama Google Font:</label>
                                    <div style="display: flex; gap: 6px;">
                                        <input type="text" id="ctrl-custom-font-input" class="form-input" placeholder="Contoh: Space Grotesk, Syne, dsb.">
                                        <button type="button" id="btn-apply-custom-font" class="btn-studio-action" style="padding: 0 12px;">Pakai</button>
                                    </div>
                                </div>

                                <!-- Font Size -->
                                <div class="form-row">
                                    <label class="form-label">Ukuran Font (Font Size):</label>
                                    <div class="form-slider-row">
                                        <input type="range" id="ctrl-font-size-slider" class="form-slider" min="10" max="100" value="16">
                                        <input type="number" id="ctrl-font-size-num" class="slider-val-box" value="16">
                                        <span style="font-size: 11px; color: var(--text-muted);">px</span>
                                    </div>
                                </div>

                                <!-- Font Weight & Align -->
                                <div class="form-row">
                                    <label class="form-label">Ketebalan (Font Weight):</label>
                                    <select id="ctrl-font-weight" class="form-select">
                                        <option value="">Default</option>
                                        <option value="300">300 - Light</option>
                                        <option value="400">400 - Regular</option>
                                        <option value="500">500 - Medium</option>
                                        <option value="600">600 - Semi Bold</option>
                                        <option value="700">700 - Bold</option>
                                        <option value="800">800 - Extra Bold</option>
                                        <option value="900">900 - Black</option>
                                    </select>
                                </div>

                                <!-- Text Color -->
                                <div class="form-row">
                                    <label class="form-label">Warna Teks:</label>
                                    <div style="display: flex; gap: 8px; align-items: center;">
                                        <input type="color" id="ctrl-text-color-picker" style="border: none; width: 36px; height: 36px; border-radius: 6px; cursor: pointer; background: transparent;">
                                        <input type="text" id="ctrl-text-color-hex" class="form-input" placeholder="#000000" style="flex: 1;">
                                    </div>
                                </div>

                                <!-- Text Alignment -->
                                <div class="form-row">
                                    <label class="form-label">Rata Teks:</label>
                                    <div style="display: flex; gap: 4px;">
                                        <button type="button" class="btn-studio-action btn-align" data-align="left" style="flex: 1; justify-content: center;"><i class="fa-solid fa-align-left"></i></button>
                                        <button type="button" class="btn-studio-action btn-align" data-align="center" style="flex: 1; justify-content: center;"><i class="fa-solid fa-align-center"></i></button>
                                        <button type="button" class="btn-studio-action btn-align" data-align="right" style="flex: 1; justify-content: center;"><i class="fa-solid fa-align-right"></i></button>
                                        <button type="button" class="btn-studio-action btn-align" data-align="justify" style="flex: 1; justify-content: center;"><i class="fa-solid fa-align-justify"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 1.6 Background & Borders (Gaya) -->
                        <div class="control-group">
                            <div class="control-group-header">
                                <span><i class="fa-solid fa-palette"></i> Background & Border</span>
                                <i class="fa-solid fa-chevron-down"></i>
                            </div>
                            <div class="control-group-body">
                                <div class="form-row">
                                    <label class="form-label">Background Color:</label>
                                    <div style="display: flex; gap: 8px; align-items: center;">
                                        <input type="color" id="ctrl-bg-color-picker" style="border: none; width: 36px; height: 36px; border-radius: 6px; cursor: pointer; background: transparent;">
                                        <input type="text" id="ctrl-bg-color-hex" class="form-input" placeholder="transparent" style="flex: 1;">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <label class="form-label">Border Radius (px):</label>
                                    <div class="form-slider-row">
                                        <input type="range" id="ctrl-border-radius-slider" class="form-slider" min="0" max="60" value="0">
                                        <input type="number" id="ctrl-border-radius-num" class="slider-val-box" value="0">
                                        <span style="font-size: 11px; color: var(--text-muted);">px</span>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <label class="form-label">Border Width & Style:</label>
                                    <div style="display: flex; gap: 6px;">
                                        <input type="number" id="ctrl-border-width" class="form-input" placeholder="0" style="width: 70px;">
                                        <select id="ctrl-border-style" class="form-select" style="flex: 1;">
                                            <option value="none">None</option>
                                            <option value="solid">Solid</option>
                                            <option value="dashed">Dashed</option>
                                            <option value="dotted">Dotted</option>
                                        </select>
                                        <input type="color" id="ctrl-border-color" style="border: none; width: 36px; height: 36px; border-radius: 6px; cursor: pointer; background: transparent;">
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div><!-- /#subtab-panel-style -->

                        <!-- SUBTAB PANEL 3: TATA LETAK & DIMENSI (LAYOUT) -->
                        <div id="subtab-panel-layout" class="inspector-subtab-panel">

                        <!-- 1.4A Dimensions & Universal Size (Lebar & Tinggi untuk Semua Elemen) -->
                        <div class="control-group" id="group-dimension-controls">
                            <div class="control-group-header">
                                <span><i class="fa-solid fa-arrows-up-down-left-right" style="color: #06b6d4;"></i> Dimensi & Ukuran (Lebar & Tinggi)</span>
                                <i class="fa-solid fa-chevron-down"></i>
                            </div>
                            <div class="control-group-body">
                                <!-- Dynamic Helper Guide: Text vs Layout Column -->
                                <div id="dim-text-guide-box" style="display: none; margin-bottom: 12px; padding: 8px 10px; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.25); border-radius: 6px; font-size: 11px; color: #a5f3fc; line-height: 1.4;">
                                    <i class="fa-solid fa-circle-info" style="color: #06b6d4;"></i>
                                    <strong>Dimensi Teks / Elemen:</strong> Anda dapat mengatur batas lebar (width) dan tinggi (height) teks ini secara langsung, atau <button type="button" id="btn-select-parent-col-dim" style="background: none; border: none; color: #38bdf8; text-decoration: underline; cursor: pointer; padding: 0; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 3px;"><i class="fa-solid fa-arrow-up"></i> Pilih Kolom Induk</button> untuk mengatur kolom pembungkusnya.
                                </div>
                                <div id="dim-layout-guide-box" style="display: none; margin-bottom: 12px; padding: 8px 10px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 6px; font-size: 11px; color: #93c5fd; line-height: 1.4;">
                                    <i class="fa-solid fa-table-columns" style="color: #3b82f6;"></i>
                                    <strong>Mode Kolom / Layout:</strong> Atur lebar kolom ini atau pilih preset proporsi kiri-kanan di bawah.
                                </div>

                                <!-- Lebar Elemen (Universal Width) -->
                                <div class="form-row">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                        <label class="form-label" style="margin: 0;">Lebar Elemen / Kolom (Width):</label>
                                        <div class="unit-switcher" id="width-unit-switcher">
                                            <button type="button" class="unit-btn active" data-unit="%">%</button>
                                            <button type="button" class="unit-btn" data-unit="px">PX</button>
                                            <button type="button" class="unit-btn" data-unit="em">EM</button>
                                            <button type="button" class="unit-btn" data-unit="auto">Auto</button>
                                        </div>
                                    </div>
                                    <div style="display: flex; gap: 8px; align-items: center;">
                                        <input type="range" id="ctrl-elem-width-slider" class="form-slider" min="10" max="100" value="100" style="flex: 1;">
                                        <input type="number" id="ctrl-elem-width-num" class="slider-val-box" placeholder="100" style="width: 58px;">
                                        <span id="width-unit-display" style="font-size: 11px; color: var(--text-muted); min-width: 16px;">%</span>
                                    </div>
                                </div>

                                <!-- Tinggi Elemen (Universal Height) -->
                                <div class="form-row" style="margin-top: 12px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                        <label class="form-label" style="margin: 0;">Tinggi Elemen (Height):</label>
                                        <div class="unit-switcher" id="height-unit-switcher">
                                            <button type="button" class="unit-btn active" data-unit="px">PX</button>
                                            <button type="button" class="unit-btn" data-unit="vh">VH</button>
                                            <button type="button" class="unit-btn" data-unit="auto">Auto</button>
                                        </div>
                                    </div>
                                    <div style="display: flex; gap: 8px; align-items: center;">
                                        <input type="range" id="ctrl-elem-height-slider" class="form-slider" min="0" max="800" value="0" style="flex: 1;">
                                        <input type="number" id="ctrl-elem-height-num" class="slider-val-box" placeholder="auto" style="width: 58px;">
                                        <span id="height-unit-display" style="font-size: 11px; color: var(--text-muted); min-width: 16px;">px</span>
                                    </div>
                                    <div style="display: flex; gap: 6px; margin-top: 6px; align-items: center;">
                                        <label style="font-size: 11px; color: var(--text-muted); display: inline-flex; align-items: center; gap: 4px; cursor: pointer;">
                                            <input type="checkbox" id="ctrl-elem-min-height" style="accent-color: #06b6d4;"> Terapkan sebagai Tinggi Minimal (min-height)
                                        </label>
                                    </div>
                                </div>

                                <!-- Preset Proporsi Kolom Kiri - Kanan -->
                                <div class="form-row" id="row-column-presets" style="margin-top: 10px;">
                                    <label class="form-label" style="font-size: 11px; margin-bottom: 5px;">Preset Proporsi Kiri - Kanan:</label>
                                    <div class="col-preset-group">
                                        <button type="button" class="btn-col-preset" data-preset="50-50" title="Kiri 50% : Kanan 50%">
                                            <span class="preset-bar"><span style="width: 50%;"></span><span style="width: 50%;"></span></span>
                                            <span class="preset-text">50:50</span>
                                        </button>
                                        <button type="button" class="btn-col-preset" data-preset="60-40" title="Kiri 60% : Kanan 40%">
                                            <span class="preset-bar"><span style="width: 60%;"></span><span style="width: 40%;"></span></span>
                                            <span class="preset-text">60:40</span>
                                        </button>
                                        <button type="button" class="btn-col-preset" data-preset="70-30" title="Kiri 70% : Kanan 30%">
                                            <span class="preset-bar"><span style="width: 70%;"></span><span style="width: 30%;"></span></span>
                                            <span class="preset-text">70:30</span>
                                        </button>
                                        <button type="button" class="btn-col-preset" data-preset="33-66" title="Kiri 33% : Kanan 66%">
                                            <span class="preset-bar"><span style="width: 33%;"></span><span style="width: 67%;"></span></span>
                                            <span class="preset-text">33:66</span>
                                        </button>
                                        <button type="button" class="btn-col-preset" data-preset="100" title="Lebar Penuh 100%">
                                            <span class="preset-bar"><span style="width: 100%;"></span></span>
                                            <span class="preset-text">100%</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 1.4B Flexbox Container Layout (Elementor Style: Saling Samping / Atas-Bawah) -->
                        <div class="control-group" id="group-flex-direction-controls" style="display: none;">
                            <div class="control-group-header">
                                <span><i class="fa-solid fa-arrows-split-up-and-left" style="color: #38bdf8;"></i> Tata Letak Kontainer (Flexbox)</span>
                                <i class="fa-solid fa-chevron-down"></i>
                            </div>
                            <div class="control-group-body">
                                <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px; line-height: 1.4;">
                                    Atur susunan elemen di dalam kontainer ini secara fleksibel (saling samping atau atas-bawah):
                                </div>

                                <!-- Arah Susunan: Row vs Column (Elementor Container Direction) -->
                                <div class="form-row" style="margin-bottom: 12px;">
                                    <label class="form-label" style="font-size: 11px; margin-bottom: 6px;">Arah Susunan Elemen (Direction):</label>
                                    <div class="flex-direction-toggle-group">
                                        <button type="button" class="btn-flex-dir" id="btn-flex-dir-row" title="Elemen berjejer ke samping kanan (Row)">
                                            <i class="fa-solid fa-arrows-left-right"></i>
                                            <span>Saling Samping (Row)</span>
                                        </button>
                                        <button type="button" class="btn-flex-dir" id="btn-flex-dir-col" title="Elemen menumpuk ke bawah (Column)">
                                            <i class="fa-solid fa-arrows-up-down"></i>
                                            <span>Atas - Bawah (Col)</span>
                                        </button>
                                    </div>
                                </div>

                                <!-- Master Proporsi Anak (Child Column Proportions) -->
                                <div class="form-row" id="row-child-col-proportions" style="margin-bottom: 12px; padding: 10px; background: rgba(15, 23, 42, 0.5); border: 1px solid var(--border-light, #334155); border-radius: 6px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                        <label class="form-label" style="font-size: 11px; margin: 0; font-weight: 600; color: #e2e8f0;">
                                            <i class="fa-solid fa-table-columns" style="color: #38bdf8; margin-right: 4px;"></i> <span id="child-col-prop-title">Proporsi Kolom Anak (Master):</span>
                                        </label>
                                        <span id="child-col-count-text" style="font-size: 10px; color: #94a3b8;">2 Kolom</span>
                                    </div>
                                    <div id="child-col-prop-desc" style="font-size: 10px; color: var(--text-muted); margin-bottom: 8px; line-height: 1.3;">
                                        Terapkan pembagian lebar langsung dari pembungkus utama ini ke semua elemen di dalamnya:
                                    </div>
                                    <div class="col-preset-group master-child-presets">
                                        <button type="button" class="btn-col-preset btn-child-col-preset" data-preset="50-50" title="Bagi Rata (50% : 50%)">
                                            <span class="preset-bar"><span style="width: 50%;"></span><span style="width: 50%;"></span></span>
                                            <span class="preset-text">50:50</span>
                                        </button>
                                        <button type="button" class="btn-col-preset btn-child-col-preset" data-preset="60-40" title="Kiri 60% : Kanan 40%">
                                            <span class="preset-bar"><span style="width: 60%;"></span><span style="width: 40%;"></span></span>
                                            <span class="preset-text">60:40</span>
                                        </button>
                                        <button type="button" class="btn-col-preset btn-child-col-preset" data-preset="70-30" title="Kiri 70% : Kanan 30%">
                                            <span class="preset-bar"><span style="width: 70%;"></span><span style="width: 30%;"></span></span>
                                            <span class="preset-text">70:30</span>
                                        </button>
                                        <button type="button" class="btn-col-preset btn-child-col-preset" data-preset="40-60" title="Kiri 40% : Kanan 60%">
                                            <span class="preset-bar"><span style="width: 40%;"></span><span style="width: 60%;"></span></span>
                                            <span class="preset-text">40:60</span>
                                        </button>
                                        <button type="button" class="btn-col-preset btn-child-col-preset" data-preset="33-33-33" title="3 Kolom Rata (33% : 33% : 33%)">
                                            <span class="preset-bar"><span style="width: 33.3%;"></span><span style="width: 33.3%;"></span><span style="width: 33.3%;"></span></span>
                                            <span class="preset-text">3 Kolom</span>
                                        </button>
                                        <button type="button" class="btn-col-preset btn-child-col-preset" data-preset="100" title="Tumpuk Penuh (1 Kolom / 100%)">
                                            <span class="preset-bar"><span style="width: 100%;"></span></span>
                                            <span class="preset-text">100%</span>
                                        </button>
                                    </div>
                                </div>

                                <!-- Jarak Antar Elemen (Gap) -->
                                <div class="form-row" style="margin-bottom: 12px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                        <label class="form-label" style="margin: 0; font-size: 11px;">Jarak Antar Elemen (Gap):</label>
                                        <div class="flex-gap-presets">
                                            <button type="button" class="btn-gap-preset" data-gap="0">0</button>
                                            <button type="button" class="btn-gap-preset" data-gap="8">8px</button>
                                            <button type="button" class="btn-gap-preset active" data-gap="16">16px</button>
                                            <button type="button" class="btn-gap-preset" data-gap="24">24px</button>
                                            <button type="button" class="btn-gap-preset" data-gap="32">32px</button>
                                            <button type="button" class="btn-gap-preset" data-gap="48">48px</button>
                                        </div>
                                    </div>
                                    <div style="display: flex; gap: 8px; align-items: center;">
                                        <input type="range" id="ctrl-flex-gap-slider" class="form-slider" min="0" max="64" value="16" style="flex: 1;">
                                        <input type="number" id="ctrl-flex-gap-num" class="slider-val-box" value="16" min="0" max="120" style="width: 58px;">
                                        <span style="font-size: 11px; color: var(--text-muted); min-width: 16px;">px</span>
                                    </div>
                                </div>

                                <!-- Perataan Sejajar (Align Items) -->
                                <div class="form-row" style="margin-bottom: 12px;">
                                    <label class="form-label" style="font-size: 11px; margin-bottom: 6px;">Perataan Silang (Align Items):</label>
                                    <div class="flex-btn-group">
                                        <button type="button" class="btn-flex-opt btn-align-item" data-align="flex-start" title="Rata Awal / Atas">
                                            <i class="fa-solid fa-align-left"></i>
                                        </button>
                                        <button type="button" class="btn-flex-opt btn-align-item" data-align="center" title="Tengah Sejajar">
                                            <i class="fa-solid fa-align-center"></i>
                                        </button>
                                        <button type="button" class="btn-flex-opt btn-align-item" data-align="flex-end" title="Rata Akhir / Bawah">
                                            <i class="fa-solid fa-align-right"></i>
                                        </button>
                                        <button type="button" class="btn-flex-opt btn-align-item active" data-align="stretch" title="Regangkan Penuh (Stretch)">
                                            <i class="fa-solid fa-arrows-left-right-to-line"></i>
                                        </button>
                                    </div>
                                </div>

                                <!-- Distribusi Konten (Justify Content) -->
                                <div class="form-row" style="margin-bottom: 12px;">
                                    <label class="form-label" style="font-size: 11px; margin-bottom: 6px;">Distribusi Baris (Justify Content):</label>
                                    <div class="flex-btn-group">
                                        <button type="button" class="btn-flex-opt btn-justify-item active" data-justify="flex-start" title="Rata Kiri / Depan">
                                            <i class="fa-solid fa-grip-lines-vertical"></i>
                                        </button>
                                        <button type="button" class="btn-flex-opt btn-justify-item" data-justify="center" title="Tengah (Center)">
                                            <i class="fa-solid fa-arrows-to-dot"></i>
                                        </button>
                                        <button type="button" class="btn-flex-opt btn-justify-item" data-justify="space-between" title="Sebar Luas (Space Between)">
                                            <i class="fa-solid fa-arrows-split-up-and-left"></i>
                                        </button>
                                        <button type="button" class="btn-flex-opt btn-justify-item" data-justify="space-around" title="Jarak Rata (Space Around)">
                                            <i class="fa-solid fa-arrows-left-right"></i>
                                        </button>
                                    </div>
                                </div>

                                <!-- Wrap Checkbox (Responsive Safe) -->
                                <div class="form-row-horizontal" style="margin-top: 6px; padding: 8px 10px; background: rgba(15, 23, 42, 0.4); border-radius: 6px; border: 1px solid var(--border-light);">
                                    <label class="form-label" style="font-size: 11px; display: flex; align-items: center; gap: 8px; cursor: pointer; margin: 0; user-select: none;">
                                        <input type="checkbox" id="ctrl-flex-wrap" checked style="accent-color: #0284c7; width: 16px; height: 16px;">
                                        <span>Bungkus Otomatis (Wrap) agar aman & rapi di HP</span>
                                    </label>
                                </div>

                                <!-- Wrap Element Callout -->
                                <div id="box-wrap-element-callout" style="margin-top: 10px; padding: 10px; background: rgba(59, 130, 246, 0.08); border: 1px dashed rgba(59, 130, 246, 0.3); border-radius: 6px; display: flex; align-items: center; justify-content: space-between;">
                                    <div style="font-size: 11px; color: #94a3b8; line-height: 1.3;">
                                        <i class="fa-solid fa-box-archive" style="color: #60a5fa; margin-right: 4px;"></i> Jadikan elemen ini pembungkus baru
                                    </div>
                                    <button type="button" class="btn-studio-action btn-wrap-current-element" style="padding: 4px 10px; font-size: 11px; white-space: nowrap;">
                                        <i class="fa-solid fa-box-archive"></i> Bungkus
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- 1.5 Box Model (Margin & Padding) -->
                        <div class="control-group">
                            <div class="control-group-header">
                                <span><i class="fa-solid fa-cube"></i> Spacing (Padding & Margin)</span>
                                <i class="fa-solid fa-chevron-down"></i>
                            </div>
                            <div class="control-group-body">
                                <!-- Padding Section -->
                                <div class="spacing-control-block">
                                    <div class="spacing-header">
                                        <label class="form-label spacing-title">Padding</label>
                                        <div class="unit-switcher" id="pad-unit-switcher">
                                            <button type="button" class="unit-btn active" data-unit="px">PX</button>
                                            <button type="button" class="unit-btn" data-unit="%">%</button>
                                            <button type="button" class="unit-btn" data-unit="em">EM</button>
                                        </div>
                                    </div>
                                    <div class="spacing-row">
                                        <div class="spacing-input-col">
                                            <input type="number" id="ctrl-pad-top" class="spacing-input" placeholder="0">
                                            <span class="spacing-sublabel">Atas</span>
                                        </div>
                                        <div class="spacing-input-col">
                                            <input type="number" id="ctrl-pad-right" class="spacing-input" placeholder="0">
                                            <span class="spacing-sublabel">Kanan</span>
                                        </div>
                                        <div class="spacing-input-col">
                                            <input type="number" id="ctrl-pad-bottom" class="spacing-input" placeholder="0">
                                            <span class="spacing-sublabel">Bawah</span>
                                        </div>
                                        <div class="spacing-input-col">
                                            <input type="number" id="ctrl-pad-left" class="spacing-input" placeholder="0">
                                            <span class="spacing-sublabel">Kiri</span>
                                        </div>
                                        <div class="spacing-link-col">
                                            <button type="button" id="btn-pad-link" class="btn-spacing-link active" title="Tautkan nilai (semua sisi bersamaan)">
                                                <i class="fa-solid fa-link"></i>
                                            </button>
                                            <span class="spacing-sublabel">Taut</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Margin Section -->
                                <div class="spacing-control-block" style="margin-top: 14px;">
                                    <div class="spacing-header">
                                        <label class="form-label spacing-title">Margin</label>
                                        <div class="unit-switcher" id="mar-unit-switcher">
                                            <button type="button" class="unit-btn active" data-unit="px">PX</button>
                                            <button type="button" class="unit-btn" data-unit="%">%</button>
                                            <button type="button" class="unit-btn" data-unit="em">EM</button>
                                        </div>
                                    </div>
                                    <div class="spacing-row">
                                        <div class="spacing-input-col">
                                            <input type="number" id="ctrl-mar-top" class="spacing-input" placeholder="0">
                                            <span class="spacing-sublabel">Atas</span>
                                        </div>
                                        <div class="spacing-input-col">
                                            <input type="number" id="ctrl-mar-right" class="spacing-input" placeholder="0">
                                            <span class="spacing-sublabel">Kanan</span>
                                        </div>
                                        <div class="spacing-input-col">
                                            <input type="number" id="ctrl-mar-bottom" class="spacing-input" placeholder="0">
                                            <span class="spacing-sublabel">Bawah</span>
                                        </div>
                                        <div class="spacing-input-col">
                                            <input type="number" id="ctrl-mar-left" class="spacing-input" placeholder="0">
                                            <span class="spacing-sublabel">Kiri</span>
                                        </div>
                                        <div class="spacing-link-col">
                                            <button type="button" id="btn-mar-link" class="btn-spacing-link" title="Tautkan nilai (semua sisi bersamaan)">
                                                <i class="fa-solid fa-link-slash"></i>
                                            </button>
                                            <span class="spacing-sublabel">Taut</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div><!-- /#subtab-panel-layout -->

                        <!-- SUBTAB PANEL 4: LOGIKA & SCRIPT ELEMEN -->
                        <div id="subtab-panel-logic" class="inspector-subtab-panel">

                        <!-- 1.7 Algoritma & Logika JavaScript Elemen (Smart Per-Element Inspector - Elementor Advanced Style) -->
                        <div class="control-group" id="group-element-script">
                            <div class="control-group-header">
                                <span><i class="fa-solid fa-bolt" style="color: #facc15;"></i> Logika & Script Elemen</span>
                                <span id="algo-element-badge-status" class="algo-pill-status"><span class="status-dot"></span> <span id="algo-element-status-label">Standby</span></span>
                            </div>
                            <div class="control-group-body">
                                <!-- Scope Selector Tabs -->
                                <div class="algo-scope-switcher">
                                    <button type="button" class="algo-scope-tab active" data-scope="element" id="tab-scope-element" title="Lihat dan edit script yang khusus mengontrol elemen terpilih ini">
                                        <i class="fa-solid fa-bullseye"></i> Script Elemen Ini
                                    </button>
                                    <button type="button" class="algo-scope-tab" data-scope="all" id="tab-scope-all" title="Lihat dan edit seluruh script JavaScript halaman ini">
                                        <i class="fa-solid fa-code"></i> Seluruh Script
                                    </button>
                                </div>

                                <!-- Target Element Info Card (Shown in 'element' scope) -->
                                <div id="box-element-scope-info" class="algo-element-target-card">
                                    <div class="target-card-row">
                                        <div class="target-card-left">
                                            <span class="target-title">Target:</span>
                                            <code id="el-script-selector-label" class="target-selector-code">--</code>
                                        </div>
                                        <span id="el-script-match-indicator" class="target-badge-no-match">
                                            <i class="fa-solid fa-circle-question"></i> Belum ada script
                                        </span>
                                    </div>

                                    <!-- Quick 1-Click Event Generators for Element -->
                                    <div id="box-quick-event-generators" style="margin-top: 8px;">
                                        <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Pasang Interaksi Instan:</div>
                                        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                                            <button type="button" class="btn-quick-event" data-event="click" title="Pasang Event Klik untuk elemen ini">
                                                <i class="fa-solid fa-hand-pointer"></i> + Klik (Click)
                                            </button>
                                            <button type="button" class="btn-quick-event" data-event="input" title="Pasang Event Perubahan Nilai / Slider">
                                                <i class="fa-solid fa-sliders"></i> + Input / Slider
                                            </button>
                                            <button type="button" class="btn-quick-event" data-event="toggle" title="Pasang Logika Toggle Tampil / Sembunyikan">
                                                <i class="fa-solid fa-toggle-on"></i> + Toggle Show/Hide
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Page Presets & CDN (Shown in 'all' scope) -->
                                <div id="box-all-scope-helpers" style="display: none;">
                                    <!-- Quick Presets -->
                                    <div style="margin-bottom: 10px;">
                                        <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Template Script Cepat:</div>
                                        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                                            <button type="button" class="btn-preset-algo" data-preset="swiper" title="Tambahkan Script Slider Swiper.js">+ Swiper</button>
                                            <button type="button" class="btn-preset-algo" data-preset="accordion" title="Tambahkan Script FAQ Accordion">+ Accordion</button>
                                            <button type="button" class="btn-preset-algo" data-preset="mobile-menu" title="Tambahkan Script Menu Mobile">+ Menu</button>
                                            <button type="button" class="btn-preset-algo" data-preset="countdown" title="Tambahkan Script Countdown">+ Countdown</button>
                                        </div>
                                    </div>

                                    <!-- CDN Dependencies Quick Toggles -->
                                    <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 8px 10px; margin-bottom: 10px;">
                                        <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Library Eksternal (CDN):</div>
                                        <div style="display: flex; flex-direction: column; gap: 6px;">
                                            <label style="display: flex; align-items: center; gap: 6px; font-size: 11px; cursor: pointer; color: var(--text-primary);">
                                                <input type="checkbox" id="lib-swiper" style="accent-color: var(--primary);">
                                                <span>Swiper.js 11 (Slider)</span>
                                            </label>
                                            <label style="display: flex; align-items: center; gap: 6px; font-size: 11px; cursor: pointer; color: var(--text-primary);">
                                                <input type="checkbox" id="lib-gsap" style="accent-color: var(--primary);">
                                                <span>GSAP 3 (Animasi)</span>
                                            </label>
                                            <label style="display: flex; align-items: center; gap: 6px; font-size: 11px; cursor: pointer; color: var(--text-primary);">
                                                <input type="checkbox" id="lib-aos" style="accent-color: var(--primary);">
                                                <span>AOS (Animate on Scroll)</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <!-- Code Editor Header Actions -->
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px; margin-bottom: 4px;">
                                    <label id="algo-editor-label" class="form-label" style="margin: 0; font-size: 11px;">Script JavaScript Elemen Ini:</label>
                                    <div style="display: flex; gap: 6px;">
                                        <button type="button" id="btn-format-js" style="background: transparent; border: none; color: #a5b4fc; font-size: 10px; cursor: pointer; text-decoration: underline;">Format</button>
                                        <button type="button" id="btn-clear-js" style="background: transparent; border: none; color: #f87171; font-size: 10px; cursor: pointer; text-decoration: underline;">Bersihkan</button>
                                    </div>
                                </div>

                                <textarea id="algo-code-editor" class="form-input" style="height: 190px; font-family: 'Consolas', 'Monaco', monospace; font-size: 11px; line-height: 1.4; resize: vertical; white-space: pre;" placeholder="// Tulis script JavaScript untuk elemen atau halaman di sini..."><?php echo esc_textarea($current_js); ?></textarea>

                                <button type="button" id="btn-apply-run-algo" class="btn-studio-action btn-save-publish" style="width: 100%; justify-content: center; height: 34px; margin-top: 8px;">
                                    <i class="fa-solid fa-bolt"></i> Simpan & Jalankan di Kanvas
                                </button>

                                <!-- Console Log Mini -->
                                <div id="algo-console-log" style="background: #000000; border-radius: 6px; padding: 6px 8px; font-family: monospace; font-size: 10px; color: #4ade80; margin-top: 8px; max-height: 80px; overflow-y: auto; line-height: 1.4;">
                                    [Bongkar Engine] Siap dieksekusi.
                                </div>
                            </div>
                        </div>
                        </div><!-- /#subtab-panel-logic -->

                    </div>
                </div>

                <!-- 2. TAB: ADD ELEMENTS & SECTIONS (ELEMENTOR-STYLE VISUAL BUILDER) -->
                <div id="tab-elements" class="sidebar-panel">
                    <!-- Live Search Widget Input -->
                    <div class="elements-search-container" style="margin-bottom: 12px;">
                        <div style="position: relative;">
                            <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 13px;"></i>
                            <input type="text" id="elements-search-input" class="form-input" data-i18n-placeholder="add.search_placeholder" placeholder="Cari widget, tombol, video, section..." style="padding-left: 34px; height: 38px; border-radius: 8px;">
                            <button type="button" id="btn-clear-elements-search" style="display: none; position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px;"><i class="fa-solid fa-xmark"></i></button>
                        </div>
                    </div>

                    <!-- Target Insertion Indicator (Active When Context Selected) -->
                    <div id="elements-target-banner" style="display: none; margin-bottom: 14px; padding: 10px 12px; background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.35); border-radius: 8px; font-size: 11px; align-items: center; justify-content: space-between;">
                        <div style="display: flex; align-items: center; gap: 6px; color: #a5b4fc; font-weight: 600;">
                            <i class="fa-solid fa-location-crosshairs"></i>
                            <span><span data-i18n="add.inserting_to">Menyisipkan ke:</span> <strong id="elements-target-label" style="color: #ffffff;">Kolom</strong></span>
                        </div>
                        <button type="button" id="btn-cancel-target-insert" data-i18n="add.cancel" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 11px; text-decoration: underline;">Batal</button>
                    </div>

                    <!-- Quick AI/HTML Importer Option -->
                    <div class="elements-widget-category" style="margin-bottom: 16px; padding: 12px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12)); border: 1px dashed rgba(99, 102, 241, 0.45); border-radius: var(--radius-md); text-align: center;">
                        <div style="font-size: 11px; font-weight: 700; color: #a5b4fc; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> <span data-i18n="add.have_ai">Punya Desain AI / HTML?</span>
                        </div>
                        <button type="button" class="btn-studio-action btn-trigger-importer" style="width: 100%; justify-content: center; background: #4f46e5; color: #fff; border: none; font-size: 12px; font-weight: 700; padding: 8px 12px; border-radius: 6px; cursor: pointer;">
                            <i class="fa-solid fa-file-code"></i> <span data-i18n="add.import_ai">Impor AI / Kode HTML</span>
                        </button>
                    </div>

                    <!-- 1. Column Layouts -->
                    <div class="elements-widget-category">
                        <div class="elements-category-title"><i class="fa-solid fa-table-columns" style="color: #6366f1; margin-right: 4px;"></i> <span data-i18n="add.cat_columns">Struktur Kolom Section</span></div>
                        <div class="elements-grid">
                            <div class="element-card" draggable="true" data-insert="layout-1col" data-i18n-title="add.col_1_desc" title="Section 1 kolom penuh lebar">
                                <i class="fa-solid fa-square"></i>
                                <span data-i18n="add.col_1">1 Kolom (100%)</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="layout-2col" data-i18n-title="add.col_2_50_desc" title="Section 2 kolom sejajar (50:50)">
                                <i class="fa-solid fa-table-columns"></i>
                                <span data-i18n="add.col_2_50">2 Kolom (50:50)</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="layout-2col-asym-left" data-i18n-title="add.col_2_66_desc" title="Section 2 kolom asimetris (66:33 Konten + Sidebar)">
                                <i class="fa-solid fa-chart-bar"></i>
                                <span data-i18n="add.col_2_66">2 Kolom (66:33)</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="layout-2col-asym-right" data-i18n-title="add.col_2_33_desc" title="Section 2 kolom asimetris (33:66 Sidebar + Konten)">
                                <i class="fa-solid fa-bars-progress"></i>
                                <span data-i18n="add.col_2_33">2 Kolom (33:66)</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="layout-3col" data-i18n-title="add.col_3_desc" title="Section 3 kolom sejajar">
                                <i class="fa-solid fa-table-cells"></i>
                                <span data-i18n="add.col_3">3 Kolom (33%)</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="layout-4col" data-i18n-title="add.col_4_desc" title="Section 4 kolom baris statistik / fitur">
                                <i class="fa-solid fa-grip"></i>
                                <span data-i18n="add.col_4">4 Kolom (25%)</span>
                            </div>
                            <div class="element-card btn-trigger-custom-html-section" data-i18n-title="add.custom_html_desc" title="Sisipkan Section Desain HTML Sendiri / AI" style="cursor: pointer;">
                                <i class="fa-solid fa-code" style="color: #10b981;"></i>
                                <span data-i18n="add.custom_html">HTML Sendiri</span>
                            </div>
                        </div>
                    </div>

                    <!-- 2. Basic Elements -->
                    <div class="elements-widget-category">
                        <div class="elements-category-title"><i class="fa-solid fa-cube" style="color: #38bdf8; margin-right: 4px;"></i> <span data-i18n="add.cat_widgets">Elemen Dasar (Widgets)</span></div>
                        <div class="elements-grid">
                            <div class="element-card" draggable="true" data-insert="element-heading" data-i18n-title="add.widget_heading_desc" title="Judul teks heading H2">
                                <i class="fa-solid fa-heading"></i>
                                <span data-i18n="add.widget_heading">Heading Judul</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="element-paragraph" data-i18n-title="add.widget_paragraph_desc" title="Paragraf deskripsi teks panjang">
                                <i class="fa-solid fa-paragraph"></i>
                                <span data-i18n="add.widget_paragraph">Paragraf Teks</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="element-button" data-i18n-title="add.widget_button_desc" title="Tombol link / Call to Action">
                                <i class="fa-solid fa-hand-pointer" style="color: #6366f1;"></i>
                                <span data-i18n="add.widget_button">Tombol / CTA</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="element-image" data-i18n-title="add.widget_image_desc" title="Gambar responsif dengan media library">
                                <i class="fa-solid fa-image" style="color: #10b981;"></i>
                                <span data-i18n="add.widget_image">Gambar / Foto</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="element-video" data-i18n-title="add.widget_video_desc" title="Player Video 16:9 YouTube / MP4">
                                <i class="fa-brands fa-youtube" style="color: #ef4444;"></i>
                                <span data-i18n="add.widget_video">Video Player</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="element-icon-box" data-i18n-title="add.widget_icon_box_desc" title="Kotak fitur dengan Icon + Judul + Deskripsi">
                                <i class="fa-solid fa-box-open" style="color: #8b5cf6;"></i>
                                <span data-i18n="add.widget_icon_box">Icon Box Fitur</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="element-icon" data-i18n-title="add.widget_icon_desc" title="Ikon Font Awesome mandiri">
                                <i class="fa-solid fa-star" style="color: #f59e0b;"></i>
                                <span data-i18n="add.widget_icon">Icon Mandiri</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="element-card" data-i18n-title="add.widget_card_desc" title="Container kartu modern dengan border & bayangan">
                                <i class="fa-solid fa-id-card"></i>
                                <span data-i18n="add.widget_card">Card Container</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="element-rating" data-i18n-title="add.widget_rating_desc" title="Rating 5 Bintang & Review ulasan">
                                <i class="fa-solid fa-star-half-stroke" style="color: #eab308;"></i>
                                <span data-i18n="add.widget_rating">Star Rating</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="element-divider" data-i18n-title="add.widget_divider_desc" title="Garis pemisah section estetik">
                                <i class="fa-solid fa-minus"></i>
                                <span data-i18n="add.widget_divider">Pemisah Divider</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="element-spacer" data-i18n-title="add.widget_spacer_desc" title="Jarak spasi kosong vertikal antar elemen">
                                <i class="fa-solid fa-arrows-up-down"></i>
                                <span data-i18n="add.widget_spacer">Spacer Jarak</span>
                            </div>
                        </div>
                    </div>

                    <!-- 3. Conversion, Form & Sales Boost -->
                    <div class="elements-widget-category">
                        <div class="elements-category-title"><i class="fa-solid fa-bolt" style="color: #22c55e; margin-right: 4px;"></i> <span data-i18n="add.cat_conversion">Konversi &amp; Form Penjualan</span></div>
                        <div class="elements-grid">
                            <div class="element-card" draggable="true" data-insert="form-lead" data-i18n-title="add.form_lead_desc" title="Formulir pesanan lengkap ke WhatsApp & Google Sheets">
                                <i class="fa-solid fa-file-invoice" style="color: #22c55e;"></i>
                                <span data-i18n="add.form_lead">Form Pesanan WA</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="element-wa-floating" data-i18n-title="add.floating_wa_desc" title="Tombol WhatsApp melayang di pojok kanan bawah">
                                <i class="fa-brands fa-whatsapp" style="color: #25d366;"></i>
                                <span data-i18n="add.floating_wa">Floating WhatsApp</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="element-countdown" data-i18n-title="add.countdown_desc" title="Hitung mundur promo flash sale / urgensi">
                                <i class="fa-solid fa-stopwatch" style="color: #f59e0b;"></i>
                                <span data-i18n="add.countdown">Countdown Timer</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="element-trust-badges" data-i18n-title="add.trust_badges_desc" title="Badges Garansi 100%, Pengiriman Cepat, Produk Original">
                                <i class="fa-solid fa-shield-halved" style="color: #3b82f6;"></i>
                                <span data-i18n="add.trust_badges">Trust Badges</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="element-input" title="Input teks formulir">
                                <i class="fa-solid fa-font"></i>
                                <span data-i18n="add.input_text">Input Teks</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="element-textarea" title="Textarea catatan formulir">
                                <i class="fa-solid fa-align-left"></i>
                                <span data-i18n="add.textarea">Textarea Catatan</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="element-select" title="Dropdown pilihan formulir">
                                <i class="fa-solid fa-square-caret-down"></i>
                                <span data-i18n="add.select">Dropdown Opsi</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="element-submit" title="Tombol submit kirim formulir">
                                <i class="fa-solid fa-paper-plane" style="color: #4f46e5;"></i>
                                <span data-i18n="add.submit">Tombol Kirim</span>
                            </div>
                        </div>
                    </div>

                    <!-- 4. Prebuilt Clean Components -->
                    <div class="elements-widget-category">
                        <div class="elements-category-title"><i class="fa-solid fa-layer-group" style="color: #f43f5e; margin-right: 4px;"></i> <span data-i18n="add.cat_templates">Template Section Siap Pakai</span></div>
                        <div class="elements-grid">
                            <div class="element-card" draggable="true" data-insert="section-hero" title="Section pembuka Hero Banner dengan judul & tombol ganda">
                                <i class="fa-solid fa-star-of-life" style="color: #6366f1;"></i>
                                <span data-i18n="add.template_hero">Hero Banner</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="section-features" title="Section 3 kartu keunggulan fitur / fasilitas">
                                <i class="fa-solid fa-list-check" style="color: #06b6d4;"></i>
                                <span data-i18n="add.template_features">3 Kartu Fitur</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="section-cta" title="Banner ajakan beli / CTA promosi lebar">
                                <i class="fa-solid fa-bullhorn" style="color: #a855f7;"></i>
                                <span data-i18n="add.template_cta">CTA Promosi</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="section-gallery" title="Grid galeri foto dan dokumentasi produk">
                                <i class="fa-solid fa-images" style="color: #10b981;"></i>
                                <span data-i18n="add.template_gallery">Galeri Foto Grid</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="section-testimonials" title="Section ulasan dan testimoni pembeli puas">
                                <i class="fa-solid fa-quote-left" style="color: #f59e0b;"></i>
                                <span data-i18n="add.template_testimonials">Testimoni Klien</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="section-faq" title="Section tanya jawab FAQ accordion buka-tutup">
                                <i class="fa-solid fa-circle-question" style="color: #3b82f6;"></i>
                                <span data-i18n="add.template_faq">FAQ Accordion</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="section-blog" title="Section Grid Blog / Artikel Dinamis dari WordPress">
                                <i class="fa-solid fa-newspaper" style="color: #6366f1;"></i>
                                <span data-i18n="add.template_blog">Blog &amp; Post Grid</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="section-pricing" title="Tabel perbandingan harga paket / unit">
                                <i class="fa-solid fa-tags" style="color: #10b981;"></i>
                                <span data-i18n="add.template_pricing">Tabel Harga</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="section-footer" title="Footer gelap dengan copyright dan link medsos">
                                <i class="fa-solid fa-shoe-prints"></i>
                                <span data-i18n="add.template_footer">Footer Bersih</span>
                            </div>
                        </div>
                    </div>

                    <!-- 5. Custom HTML / Script Embed Widget & Dynamic Feeds -->
                    <div class="elements-widget-category">
                        <div class="elements-category-title"><i class="fa-solid fa-code" style="color: #a78bfa; margin-right: 4px;"></i> <span data-i18n="add.cat_dynamic">Dinamis &amp; Kode Khusus</span></div>
                        <div class="elements-grid">
                            <div class="element-card" draggable="true" data-insert="element-post-grid" title="Widget Grid Postingan Artikel Dinamis WordPress">
                                <i class="fa-solid fa-rss" style="color: #f97316;"></i>
                                <span data-i18n="add.post_grid">Post Grid Feed</span>
                            </div>
                            <div class="element-card" draggable="true" data-insert="element-embed" title="Widget kustom untuk memasukkan kode HTML / iframe Maps">
                                <i class="fa-solid fa-code" style="color: #a78bfa;"></i>
                                <span data-i18n="add.embed">HTML / Script Embed</span>
                            </div>
                        </div>
                    </div>

                    <!-- Empty Search State -->
                    <div id="elements-search-empty" style="display: none; text-align: center; padding: 30px 10px; color: var(--text-muted);">
                        <i class="fa-solid fa-box-open" style="font-size: 28px; margin-bottom: 10px; color: #475569;"></i>
                        <p data-i18n="add.search_empty" style="font-size: 13px; margin: 0;">Tidak ada widget yang cocok dengan pencarian.</p>
                    </div>
                </div>



                <!-- 4. TAB: SEO AUDIT & INTELLIGENCE (STANDAR GOOGLE 2026) -->
                <div id="tab-seo" class="sidebar-panel">

                    <!-- Score Header Card -->
                    <div class="seo-score-hero-card">
                        <div class="seo-score-flex">
                            <div class="seo-circle-gauge" id="seo-score-gauge">
                                <span id="seo-score-display">--</span>
                                <small>/100</small>
                            </div>
                            <div class="seo-score-info">
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <strong id="seo-verdict-title" style="font-size: 14px; color: #ffffff;">Memindai SEO...</strong>
                                </div>
                                <div id="seo-verdict-desc" style="font-size: 11px; color: var(--text-secondary); margin-top: 4px; line-height: 1.4;">
                                    Standar Google 2026: Heading H1, Alt text gambar, relevansi keyword, & SERP snippet.
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
                            <button type="button" id="btn-rescan-seo" class="btn-studio-action" data-i18n-title="seo.rescan_title" style="padding: 4px 10px; font-size: 11px; font-weight: 600; background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); color: #fff;" title="Pindai Ulang Seluruh Elemen Kanvas">
                                <i class="fa-solid fa-arrows-rotate"></i> <span data-i18n="seo.rescan">Pindai Ulang SEO</span>
                            </button>
                        </div>
                    </div>

                    <!-- Focus Keyword Control -->
                    <div class="control-group">
                        <div class="control-group-header">
                            <span><i class="fa-solid fa-key"></i> <span data-i18n="seo.focus_label">Kata Kunci Target (Focus Keyword)</span></span>
                            <i class="fa-solid fa-chevron-down"></i>
                        </div>
                        <div class="control-group-body">
                            <div class="form-row">
                                <label class="form-label" data-i18n="seo.focus_input_label">Keyword Utama Halaman:</label>
                                <input type="text" id="seo-focus-keyword" class="form-input" data-i18n-placeholder="seo.focus_placeholder" placeholder="Contoh: Jasa Landing Page Murah Tangerang" value="<?php echo esc_attr($focus_keyword); ?>">
                                <div data-i18n="seo.focus_hint" style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">
                                    Sistem akan memeriksa kehadiran kata kunci ini di Judul, Deskripsi, H1, dan konten kanvas.
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- SERP Simulation (Google Search Snippet Preview) -->
                    <div class="control-group">
                        <div class="control-group-header">
                            <span><i class="fa-brands fa-google"></i> <span data-i18n="seo.serp_preview">Google SERP Preview 2026</span></span>
                            <i class="fa-solid fa-chevron-down"></i>
                        </div>
                        <div class="control-group-body">
                            <div class="serp-preview-box">
                                <div class="serp-preview-url">
                                    <i class="fa-solid fa-globe" style="font-size: 10px; margin-right: 4px;"></i>
                                    <span id="serp-preview-url-text"><?php echo esc_html($permalink); ?></span>
                                </div>
                                <div class="serp-preview-title" id="serp-preview-title"><?php echo esc_html($meta_title ?: $post->post_title); ?></div>
                                <div class="serp-preview-desc" id="serp-preview-desc"><?php echo esc_html($meta_desc ?: 'Tambahkan meta deskripsi untuk melihat simulasi tampilan di Google Search.'); ?></div>
                            </div>
                        </div>
                    </div>

                    <!-- Meta Tags Editor (Title & Description) -->
                    <div class="control-group">
                        <div class="control-group-header">
                            <span><i class="fa-solid fa-pen-to-square"></i> <span data-i18n="seo.meta_title_desc_header">Meta Title &amp; Description</span></span>
                            <i class="fa-solid fa-chevron-down"></i>
                        </div>
                        <div class="control-group-body">
                            <div class="form-row">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                    <label class="form-label" data-i18n="seo.meta_title_label" style="margin: 0;">SEO Meta Title:</label>
                                    <span id="counter-meta-title" class="char-counter">0/60</span>
                                </div>
                                <input type="text" id="setting-meta-title" class="form-input" data-i18n-placeholder="seo.meta_title_placeholder" value="<?php echo esc_attr($meta_title); ?>" placeholder="Judul menarik dan relevan untuk Google">
                            </div>
                            <div class="form-row">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                    <label class="form-label" data-i18n="seo.meta_desc_label" style="margin: 0;">SEO Meta Description:</label>
                                    <span id="counter-meta-desc" class="char-counter">0/160</span>
                                </div>
                                <textarea id="setting-meta-desc" class="form-input" data-i18n-placeholder="seo.meta_desc_placeholder" style="height: 70px; resize: vertical;" placeholder="Deskripsi ringkas yang memikat calon pengunjung..."><?php echo esc_textarea($meta_desc); ?></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- WhatsApp & Social Media Sharing Preview & Image (Open Graph) -->
                    <div class="control-group">
                        <div class="control-group-header">
                            <span><i class="fa-brands fa-whatsapp" style="color: #25d366;"></i> <span data-i18n="seo.og_header">Thumbnail Share WhatsApp &amp; Medsos</span></span>
                            <i class="fa-solid fa-chevron-down"></i>
                        </div>
                        <div class="control-group-body">
                            <div data-i18n="seo.og_desc" style="font-size: 11px; color: var(--text-muted); margin-bottom: 10px; line-height: 1.4;">
                                Tampilan kartu thumbnail visual saat link halaman dibagikan ke WhatsApp, Telegram, Facebook, &amp; Twitter:
                            </div>

                            <!-- WhatsApp Card Live Simulation -->
                            <div class="whatsapp-preview-box" id="whatsapp-preview-box">
                                <div class="whatsapp-preview-img-wrap" id="whatsapp-preview-img-wrap">
                                    <img id="whatsapp-preview-img" src="<?php echo esc_url($og_image_url ?: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="160" viewBox="0 0 300 160"%3E%3Crect width="100%25" height="100%25" fill="%231f2c34"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="12" fill="%238696a0" dominant-baseline="middle" text-anchor="middle"%3EBelum Ada Thumbnail Share%3C/text%3E%3C/svg%3E'); ?>" alt="WhatsApp Preview">
                                </div>
                                <div class="whatsapp-preview-content">
                                    <div class="whatsapp-preview-domain" id="whatsapp-preview-domain"><?php echo esc_html(wp_parse_url($permalink, PHP_URL_HOST) ?: 'website.com'); ?></div>
                                    <div class="whatsapp-preview-title" id="whatsapp-preview-title"><?php echo esc_html($meta_title ?: $post->post_title); ?></div>
                                    <div class="whatsapp-preview-desc" id="whatsapp-preview-desc"><?php echo esc_html($meta_desc ?: 'Preview deskripsi halaman saat dibagikan ke WhatsApp.'); ?></div>
                                </div>
                            </div>

                            <!-- Media Picker Controls -->
                            <div class="image-upload-control-card" style="margin-top: 12px;">
                                <div class="image-upload-thumb-col">
                                    <div class="image-thumb-preview" id="og-thumb-container">
                                        <img id="og-image-thumb" src="<?php echo esc_url($og_image_url ?: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect width="100%25" height="100%25" fill="%23334155"/%3E%3Ccircle cx="30" cy="30" r="14" fill="%2364748b"/%3E%3C/svg%3E'); ?>" alt="OG Thumbnail">
                                    </div>
                                </div>
                                <div class="image-upload-actions-col">
                                    <div style="display: flex; gap: 6px; margin-bottom: 6px;">
                                        <button type="button" id="btn-upload-og-image" class="btn-studio-secondary" style="flex: 1; padding: 6px 10px; font-size: 11px;">
                                            <i class="fa-solid fa-cloud-arrow-up"></i>
                                            <span data-i18n="seo.choose_image">Pilih Gambar</span>
                                        </button>
                                        <button type="button" id="btn-remove-og-image" class="btn-studio-secondary btn-icon-only" data-i18n-title="seo.remove_image_title" title="Hapus Gambar" style="color: #f87171; padding: 6px 10px;">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                    <input type="text" id="setting-og-image-url" class="form-input" data-i18n-placeholder="seo.og_image_placeholder" style="font-size: 10px; padding: 4px 8px;" placeholder="URL Gambar Share (https://...)" value="<?php echo esc_attr($og_image_url); ?>">
                                </div>
                            </div>
                            <div data-i18n="seo.og_hint" style="font-size: 10px; color: var(--text-muted); margin-top: 6px;">
                                <i class="fa-solid fa-circle-info" style="color: #25d366;"></i> Ukuran rekomendasi: <strong>1200 x 630 px</strong> (rasio 1.91:1) atau <strong>1:1</strong> kotak agar jernih di WhatsApp &amp; Telegram.
                            </div>
                        </div>
                    </div>

                    <!-- Checklist Hasil Audit (Standar Google 2026) -->
                    <div class="control-group">
                        <div class="control-group-header">
                            <span><i class="fa-solid fa-list-check"></i> <span data-i18n="seo.checklist_header">Checklist Audit &amp; Panduan Perbaikan</span></span>
                            <i class="fa-solid fa-chevron-down"></i>
                        </div>
                        <div class="control-group-body" id="seo-audit-checklist" style="padding: 10px;">
                            <div style="text-align: center; color: var(--text-muted); font-size: 12px; padding: 12px;">
                                <i class="fa-solid fa-spinner fa-spin" style="margin-right: 6px;"></i> <span data-i18n="seo.analyzing">Menganalisis elemen kanvas...</span>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- 5. TAB: FONT AWESOME 6 ICONS -->
                <div id="tab-icons" class="sidebar-panel">
                    <input type="text" id="icon-search-input" class="icon-picker-search" data-i18n-placeholder="icons.search_placeholder" placeholder="Cari ikon Font Awesome (misal: phone, check, star, user)...">
                    <div data-i18n="icons.hint" style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
                        Klik ikon untuk menyematkan ke elemen terpilih atau memasukkan ikon baru. 100% Font Awesome 6 vektor murni (Anti AI-Slop).
                    </div>
                    <div id="sidebar-icon-grid" class="icon-grid">
                        <!-- Populated dynamically via JS -->
                    </div>
                </div>

                <!-- 6. TAB: PAGE SETTINGS & TRACKING -->
                <div id="tab-settings" class="sidebar-panel">
                    <!-- Page Layout & Header Footer Settings (Elementor-Style Theme Builder) -->
                    <div class="control-group">
                        <div class="control-group-header">
                            <span><i class="fa-solid fa-layer-group" style="color: #6366f1;"></i> <span data-i18n="settings.layout_header">Tata Letak &amp; Header Footer</span></span>
                            <i class="fa-solid fa-chevron-down"></i>
                        </div>
                        <div class="control-group-body">
                            <div data-i18n="settings.layout_desc" style="font-size: 11px; color: var(--text-muted); margin-bottom: 10px; line-height: 1.4;">
                                Tentukan tata letak halaman: gunakan kanvas penuh mandiri atau sematkan template Header &amp; Footer kustom.
                            </div>

                            <div class="form-row">
                                <label class="form-label" data-i18n="settings.page_layout_label" style="font-size: 11px;">Tata Letak Halaman (Page Layout):</label>
                                <select id="setting-page-layout" class="form-select">
                                    <option value="canvas" data-i18n="settings.layout_canvas" <?php selected($current_page_layout, 'canvas'); ?>>Bongkar Canvas (Halaman Penuh)</option>
                                    <option value="header_footer" data-i18n="settings.layout_hf" <?php selected($current_page_layout, 'header_footer'); ?>>Bongkar Header &amp; Footer</option>
                                </select>
                            </div>

                            <div id="setting-hf-options-wrap" style="display: <?php echo $current_page_layout === 'header_footer' ? 'block' : 'none'; ?>; margin-top: 10px; padding: 10px; background: var(--bg-surface-elevated); border: 1px solid var(--border-light); border-radius: var(--radius-sm);">
                                <div class="form-row" style="margin-bottom: 8px;">
                                    <label class="form-label" data-i18n="settings.header_label" style="font-size: 11px;">Header Template:</label>
                                    <select id="setting-header-id" class="form-select">
                                        <option value="0" data-i18n="settings.header_default" <?php selected(!$current_header_id); ?>>-- Default Global Header --</option>
                                        <?php foreach ($available_headers as $h): ?>
                                            <option value="<?php echo esc_attr($h->ID); ?>" <?php selected($current_header_id, $h->ID); ?>>
                                                <?php echo esc_html($h->post_title); ?><?php echo ($global_header_id === $h->ID) ? ' (Global)' : ''; ?>
                                            </option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>

                                <div class="form-row" style="margin-bottom: 8px;">
                                    <label class="form-label" data-i18n="settings.footer_label" style="font-size: 11px;">Footer Template:</label>
                                    <select id="setting-footer-id" class="form-select">
                                        <option value="0" data-i18n="settings.footer_default" <?php selected(!$current_footer_id); ?>>-- Default Global Footer --</option>
                                        <?php foreach ($available_footers as $f): ?>
                                            <option value="<?php echo esc_attr($f->ID); ?>" <?php selected($current_footer_id, $f->ID); ?>>
                                                <?php echo esc_html($f->post_title); ?><?php echo ($global_footer_id === $f->ID) ? ' (Global)' : ''; ?>
                                            </option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>

                                <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed var(--border-light); display: flex; justify-content: space-between; align-items: center;">
                                    <a href="<?php echo esc_url(admin_url('admin.php?page=bongkar-builder-templates')); ?>" target="_blank" class="btn-studio-action" style="font-size: 11px; text-decoration: none; width: 100%; text-align: center;">
                                        <i class="fa-solid fa-up-right-from-square"></i> Buka Kelola Header &amp; Footer
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Keamanan & Proteksi Konten (Content Shield & Anti-Theft) -->
                    <div class="control-group">
                        <div class="control-group-header">
                            <span><i class="fa-solid fa-shield-halved" style="color: #10b981;"></i> <span data-i18n="settings.shield_header">Keamanan &amp; Proteksi Konten</span></span>
                            <i class="fa-solid fa-chevron-down"></i>
                        </div>
                        <div class="control-group-body">
                            <div data-i18n="settings.shield_desc" style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px; line-height: 1.4;">
                                Lindungi teks, artikel, dan kode HTML Anda dari pencurian konten atau scraping tanpa merusak kenyamanan pembaca.
                            </div>

                            <div class="form-row" style="margin-bottom: 12px;">
                                <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; cursor: pointer; color: var(--text-primary);">
                                    <input type="checkbox" id="setting-content-shield" style="accent-color: #10b981; width: 16px; height: 16px;" <?php checked(!empty($parsed_settings['content_shield'])); ?>>
                                    <span data-i18n="settings.shield_enable">Aktifkan Proteksi Konten (Content Shield)</span>
                                </label>
                            </div>

                            <div id="setting-shield-options-wrap" style="display: <?php echo !empty($parsed_settings['content_shield']) ? 'block' : 'none'; ?>; padding: 12px; background: var(--bg-surface-elevated); border: 1px solid var(--border-light); border-radius: var(--radius-sm);">
                                <div class="form-row" style="margin-bottom: 12px;">
                                    <label class="form-label" data-i18n="settings.shield_mode_label" style="font-size: 11px; font-weight: 600;">Mode Proteksi Salin (Copy Protection):</label>
                                    <select id="setting-shield-copy-mode" class="form-select" style="font-size: 12px;">
                                        <option value="smart_watermark" data-i18n="settings.shield_mode_watermark" <?php selected(!isset($parsed_settings['shield_copy_mode']) || $parsed_settings['shield_copy_mode'] === 'smart_watermark'); ?>>Smart Watermark (Teks bisa di-copy + atribusi link otomatis)</option>
                                        <option value="block_copy" data-i18n="settings.shield_mode_block" <?php selected(isset($parsed_settings['shield_copy_mode']) && $parsed_settings['shield_copy_mode'] === 'block_copy'); ?>>Blokir Clipboard (Bisa seleksi teks, tapi dilarang copy)</option>
                                        <option value="full_shield" data-i18n="settings.shield_mode_full" <?php selected(isset($parsed_settings['shield_copy_mode']) && $parsed_settings['shield_copy_mode'] === 'full_shield'); ?>>Proteksi Maksimal (Blokir copy total + anti inspect)</option>
                                    </select>
                                    <div data-i18n="settings.shield_mode_hint" style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">
                                        Pengunjung tetap bisa menyeleksi teks dengan nyaman, namun isi salinan dilindungi secara pintar.
                                    </div>
                                </div>

                                <div class="form-row" style="margin-bottom: 12px;">
                                    <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer; color: var(--text-primary);">
                                        <input type="checkbox" id="setting-shield-anti-inspect" style="accent-color: #10b981; width: 15px; height: 15px;" <?php checked(!empty($parsed_settings['shield_anti_inspect'])); ?>>
                                        <span data-i18n="settings.shield_anti_inspect">Kunci Inspect Element, F12, &amp; View Source (Ctrl+U)</span>
                                    </label>
                                </div>

                                <div class="form-row" style="margin-bottom: 4px;">
                                    <label class="form-label" data-i18n="settings.shield_watermark_label" style="font-size: 11px;">Teks Atribusi Watermark Kustom (Opsional):</label>
                                    <input type="text" id="setting-shield-watermark" class="form-input" data-i18n-placeholder="settings.shield_watermark_placeholder" style="font-size: 12px;" value="<?php echo esc_attr(!empty($parsed_settings['shield_watermark_text']) ? $parsed_settings['shield_watermark_text'] : ''); ?>" placeholder="Contoh: Dikutip dari {title} ({url}) - Hak Cipta Dilindungi.">
                                    <div data-i18n="settings.shield_watermark_hint" style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">
                                        Variabel yang didukung: <code>{title}</code> (Judul) dan <code>{url}</code> (Tautan Halaman).
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Favicon & Site Identity (Elementor-Style Site Settings) -->
                    <div class="control-group">
                        <div class="control-group-header">
                            <span><i class="fa-solid fa-circle-dot" style="color: #a855f7;"></i> <span data-i18n="settings.favicon_header">Favicon &amp; Browser Tab Icon</span></span>
                            <i class="fa-solid fa-chevron-down"></i>
                        </div>
                        <div class="control-group-body">
                            <div data-i18n="settings.favicon_desc" style="font-size: 11px; color: var(--text-muted); margin-bottom: 10px; line-height: 1.4;">
                                Ikon bulat/kotak di tab atas browser, bookmark, dan icon shortcut handphone (seperti di Elementor Site Settings):
                            </div>

                            <!-- Browser Tab Mockup Simulation -->
                            <div class="browser-tab-simulation" id="browser-tab-simulation">
                                <div class="browser-tab-pill">
                                    <img id="browser-tab-favicon-img" src="<?php echo esc_url($favicon_url ?: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"%3E%3Ccircle cx="8" cy="8" r="7" fill="%236366f1"/%3E%3Ctext x="8" y="11" font-size="8" fill="white" font-family="Arial" font-weight="bold" text-anchor="middle"%3EB%3C/text%3E%3C/svg%3E'); ?>" alt="Favicon">
                                    <span id="browser-tab-title-text"><?php echo esc_html($meta_title ?: $post->post_title); ?></span>
                                    <i class="fa-solid fa-xmark browser-tab-close"></i>
                                </div>
                            </div>

                            <!-- Favicon Picker Controls -->
                            <div class="image-upload-control-card" style="margin-top: 12px;">
                                <div class="image-upload-thumb-col">
                                    <div class="image-thumb-preview favicon-thumb-preview" id="favicon-thumb-container">
                                        <img id="favicon-preview-thumb" src="<?php echo esc_url($favicon_url ?: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"%3E%3Ccircle cx="18" cy="18" r="16" fill="%236366f1"/%3E%3Ctext x="18" y="23" font-size="16" fill="white" font-family="Arial" font-weight="bold" text-anchor="middle"%3EB%3C/text%3E%3C/svg%3E'); ?>" alt="Favicon Thumbnail">
                                    </div>
                                </div>
                                <div class="image-upload-actions-col">
                                    <div style="display: flex; gap: 6px; margin-bottom: 6px;">
                                        <button type="button" id="btn-upload-favicon" class="btn-studio-secondary" style="flex: 1; padding: 6px 10px; font-size: 11px;">
                                            <i class="fa-solid fa-cloud-arrow-up"></i>
                                            <span data-i18n="settings.favicon_choose">Pilih Favicon</span>
                                        </button>
                                        <button type="button" id="btn-remove-favicon" class="btn-studio-secondary btn-icon-only" data-i18n-title="settings.favicon_reset_title" title="Reset ke Default WordPress" style="color: #f87171; padding: 6px 10px;">
                                            <i class="fa-solid fa-rotate-left"></i>
                                        </button>
                                    </div>
                                    <input type="text" id="setting-favicon-url" class="form-input" data-i18n-placeholder="settings.favicon_placeholder" style="font-size: 10px; padding: 4px 8px;" placeholder="URL Favicon (https://...)" value="<?php echo esc_attr($favicon_url); ?>">
                                </div>
                            </div>
                            <div data-i18n="settings.favicon_hint" style="font-size: 10px; color: var(--text-muted); margin-top: 6px;">
                                <i class="fa-solid fa-circle-info" style="color: #a855f7;"></i> Format yang didukung: <strong>PNG, ICO, SVG</strong> (persegi 32x32, 64x64, atau 192x192 px).
                            </div>
                        </div>
                    </div>

                    <!-- Tracking & Analytics Meta Tags -->
                    <div class="control-group">
                        <div class="control-group-header">
                            <span><i class="fa-solid fa-chart-pie" style="color: #38bdf8;"></i> <span data-i18n="settings.tracking_header">Pelacakan &amp; Analytics</span></span>
                            <i class="fa-solid fa-chevron-down"></i>
                        </div>
                        <div class="control-group-body">
                            <div data-i18n="settings.tracking_desc" style="font-size: 11px; color: var(--text-muted); margin-bottom: 10px; line-height: 1.4;">
                                Integrasi tracking otomatis Google Tag (GA4/Ads), Meta Pixel (Facebook Ads), dan Microsoft Clarity:
                            </div>

                            <!-- Google Tag ID -->
                            <div class="form-row">
                                <label class="form-label" data-i18n="settings.gtag_label" style="font-size: 11px;">Google Tag ID (GA4 / GTM / Ads):</label>
                                <input type="text" id="setting-gtag-id" class="form-input" data-i18n-placeholder="settings.gtag_placeholder" placeholder="Contoh: G-XXXXXXXXXX atau AW-XXXXXXXXXX" value="<?php echo esc_attr($gtag_id); ?>">
                            </div>

                            <!-- Meta Pixel ID -->
                            <div class="form-row">
                                <label class="form-label" data-i18n="settings.pixel_label" style="font-size: 11px;">Meta (Facebook) Pixel ID:</label>
                                <input type="text" id="setting-meta-pixel-id" class="form-input" data-i18n-placeholder="settings.pixel_placeholder" placeholder="Contoh: 123456789012345" value="<?php echo esc_attr($meta_pixel_id); ?>">
                            </div>

                            <!-- Microsoft Clarity ID -->
                            <div class="form-row">
                                <label class="form-label" data-i18n="settings.clarity_label" style="font-size: 11px;">Microsoft Clarity Project ID:</label>
                                <input type="text" id="setting-clarity-id" class="form-input" data-i18n-placeholder="settings.clarity_placeholder" placeholder="Contoh: ab12cd34ef" value="<?php echo esc_attr($clarity_id); ?>">
                            </div>

                            <!-- Custom Head Scripts -->
                            <div class="form-row">
                                <label class="form-label" data-i18n="settings.custom_head_label" style="font-size: 11px;">Custom Code &lt;head&gt; (Meta Verifikasi / Pixel Lain):</label>
                                <textarea id="setting-custom-head" class="form-input" style="height: 75px; font-family: monospace; font-size: 11px; resize: vertical;" placeholder="<meta name='google-site-verification' content='...'>"><?php echo esc_textarea($custom_head); ?></textarea>
                            </div>

                            <!-- Custom Footer Scripts -->
                            <div class="form-row">
                                <label class="form-label" data-i18n="settings.custom_footer_label" style="font-size: 11px;">Custom Code &lt;body&gt; / Footer (Script Chat / Tracking):</label>
                                <textarea id="setting-custom-footer" class="form-input" style="height: 75px; font-family: monospace; font-size: 11px; resize: vertical;" placeholder="<!-- Custom Footer Scripts -->"><?php echo esc_textarea($custom_footer); ?></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Custom CSS -->
                    <div class="control-group">
                        <div class="control-group-header">
                            <span><i class="fa-brands fa-css3"></i> <span data-i18n="settings.custom_css_header">Custom Page CSS</span></span>
                            <i class="fa-solid fa-chevron-down"></i>
                        </div>
                        <div class="control-group-body">
                            <textarea id="setting-custom-css" class="form-input" data-i18n-placeholder="settings.custom_css_placeholder" style="height: 180px; font-family: monospace; font-size: 12px; resize: vertical;" placeholder="/* Tulis CSS khusus halaman di sini */"><?php echo esc_textarea($current_css); ?></textarea>
                        </div>
                    </div>
                </div>

            </div>
        </aside>

        <!-- Center Canvas Area -->
        <section class="studio-canvas-area">
            <!-- Interactive Live Testing Banner / Toast -->
            <div id="canvas-interactive-toast" class="canvas-interactive-toast" style="display: none;">
                <div class="toast-content">
                    <i class="fa-solid fa-bolt toast-icon"></i>
                    <span data-i18n="toast.interactive_banner"><strong>Mode Interaktif Aktif:</strong> Uji kalkulator, geser slider, buka accordion &amp; popup modal seperti website asli.</span>
                </div>
                <button type="button" id="btn-exit-interactive-mode" class="toast-btn-exit" data-i18n-title="toast.exit_interactive_title" title="Kembali ke Mode Desain">
                    <i class="fa-solid fa-paintbrush"></i> <span data-i18n="toast.exit_interactive">Kembali ke Mode Desain</span>
                </button>
            </div>

            <div id="canvas-scaler" class="canvas-scaler">
                <div id="canvas-viewport" class="canvas-viewport-wrapper mode-desktop">
                    <iframe id="bongkar-iframe-canvas" src="<?php echo esc_url($canvas_frame_url); ?>" allow="clipboard-read; clipboard-write"></iframe>
                </div>
            </div>

            <!-- Floating Canvas Zoom Bar (Figma / Elementor / Canva Style) -->
            <div id="canvas-zoom-bar" class="canvas-zoom-bar">
                <button type="button" id="btn-zoom-out" class="zoom-bar-btn" data-i18n-title="zoom.out" title="Perkecil Kanvas (Ctrl -)">
                    <i class="fa-solid fa-minus"></i>
                </button>
                <div class="zoom-dropdown-wrap">
                    <button type="button" id="btn-zoom-preset" class="zoom-bar-btn zoom-preset-btn" data-i18n-title="topbar.zoom_title" title="Skala Pratinjau Kanvas">
                        <span id="canvas-zoom-display">Fit</span>
                        <i class="fa-solid fa-chevron-up"></i>
                    </button>
                    <div id="zoom-preset-menu" class="zoom-preset-menu" style="display: none;">
                        <button type="button" class="zoom-menu-item active" data-zoom="fit">
                            <i class="fa-solid fa-expand"></i>
                            <span data-i18n="zoom.fit">Pas Layar (Otomatis)</span>
                        </button>
                        <div class="zoom-menu-divider"></div>
                        <button type="button" class="zoom-menu-item" data-zoom="1">
                            <span data-i18n="zoom.original">100% (Ukuran Asli)</span>
                        </button>
                        <button type="button" class="zoom-menu-item" data-zoom="0.9">
                            <span>90%</span>
                        </button>
                        <button type="button" class="zoom-menu-item" data-zoom="0.85">
                            <span data-i18n="zoom.laptop">85% (Rekomendasi Laptop)</span>
                        </button>
                        <button type="button" class="zoom-menu-item" data-zoom="0.8">
                            <span>80%</span>
                        </button>
                        <button type="button" class="zoom-menu-item" data-zoom="0.75">
                            <span data-i18n="zoom.compact">75% (Kompak)</span>
                        </button>
                        <button type="button" class="zoom-menu-item" data-zoom="0.5">
                            <span>50%</span>
                        </button>
                    </div>
                </div>
                <button type="button" id="btn-zoom-in" class="zoom-bar-btn" data-i18n-title="zoom.in" title="Perbesar Kanvas (Ctrl +)">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
        </section>

    </main>

    <!-- Modal: AI & Code Importer -->
    <div id="modal-importer" class="studio-modal-backdrop">
        <div class="studio-modal">
            <div class="modal-header">
                <div class="modal-title">
                    <i class="fa-solid fa-wand-magic-sparkles" style="color: #818cf8;"></i>
                    Import Desain AI / HTML / Figma
                </div>
                <button type="button" class="modal-close" data-close-modal="importer">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="modal-body">
                <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.5;">
                    Punya kode dari AI (Claude, v0, ChatGPT) atau export Figma? Cukup paste seluruh kode HTML/CSS/JS (atau upload file <code>.html</code>). Sistem kami akan mem-parsingnya dan langsung memasukkannya ke kanvas editor!
                </p>

                <!-- File Upload Option -->
                <div style="margin-bottom: 16px; padding: 14px; background: var(--bg-surface-elevated); border: 1px dashed var(--border-light); border-radius: var(--radius-md); text-align: center;">
                    <label for="import-file-input" style="cursor: pointer; display: block;">
                        <i class="fa-solid fa-cloud-arrow-up" style="font-size: 24px; color: var(--primary); margin-bottom: 6px;"></i>
                        <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">Pilih atau Drop File HTML (.html)</div>
                        <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Contoh: index.html dari landing page Anda</div>
                    </label>
                    <input type="file" id="import-file-input" accept=".html,.htm" style="display: none;">
                </div>

                <div class="form-row">
                    <label class="form-label">Atau Paste Kode Lengkap (HTML + &lt;style&gt; + &lt;script&gt;):</label>
                    <textarea id="import-raw-textarea" class="form-input" style="height: 220px; font-family: monospace; font-size: 12px; resize: vertical;" placeholder="<!DOCTYPE html><html>..."></textarea>
                </div>

                <?php if ($post->post_type === 'bongkar_template'): 
                    $tmpl_type = get_post_meta($post_id, '_bongkar_template_type', true) ?: 'header';
                ?>
                    <div class="form-row" style="margin-top: 10px; padding: 12px; background: rgba(79, 70, 229, 0.1); border: 1px solid rgba(79, 70, 229, 0.3); border-radius: var(--radius-sm);">
                        <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: #818cf8;">
                            <i class="fa-solid fa-layer-group"></i>
                            <span>Target Template: <?php echo esc_html(strtoupper($tmpl_type)); ?></span>
                        </div>
                        <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px; line-height: 1.4;">
                            Sistem akan otomatis mengekstrak bagian <?php echo esc_html($tmpl_type === 'header' ? 'Header / Navigasi' : 'Footer'); ?> beserta CSS, Google Fonts, dan script dari kode yang di-import.
                        </div>
                        <input type="hidden" id="import-auto-extract-hf" value="0">
                    </div>
                <?php else: ?>
                    <div class="form-row" style="margin-top: 10px; padding: 12px; background: var(--bg-surface-elevated); border: 1px solid var(--border-light); border-radius: var(--radius-sm);">
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: var(--text-primary); cursor: pointer;">
                            <input type="checkbox" id="import-auto-extract-hf" checked style="accent-color: #6366f1; width: 16px; height: 16px;">
                            <span>Otomatis pisahkan &amp; buat template Header &amp; Footer jika ditemukan tag &lt;header&gt; / &lt;footer&gt;</span>
                        </label>
                        <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px; margin-left: 24px; line-height: 1.4;">
                            Sistem cerdas akan memindahkan header/footer menjadi template mandiri, mengaktifkan layout Header &amp; Footer, dan mengisi kanvas tengah dengan konten halaman.
                        </div>
                    </div>
                <?php endif; ?>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-studio-action" data-close-modal="importer">Batal</button>
                <button type="button" id="btn-execute-import" class="btn-studio-action btn-save-publish">
                    <i class="fa-solid fa-bolt"></i> Import ke Canvas
                </button>
            </div>
        </div>
    </div>

    <!-- Modal: Standalone HTML Exporter -->
    <div id="modal-exporter" class="studio-modal-backdrop">
        <div class="studio-modal" style="max-width: 660px;">
            <div class="modal-header">
                <div class="modal-title">
                    <i class="fa-solid fa-file-export" style="color: #6366f1;"></i>
                    Export HTML Mandiri (.html)
                </div>
                <button type="button" class="modal-close" data-close-modal="exporter">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="modal-body">
                <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.5;">
                    Download atau salin hasil pengubahan landing page ini sebagai satu file <code>.html</code> mandiri lengkap dengan CSS, script interaktif, font, SEO, dan rute formulir tanpa ketergantungan WordPress.
                </p>

                <!-- Pilihan Mode Preset Cepat -->
                <div class="export-preset-tabs" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
                    <button type="button" id="export-preset-clean" class="export-preset-btn active" style="padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid #6366f1; background: rgba(99, 102, 241, 0.12); color: var(--text-primary); text-align: left; cursor: pointer; transition: all 0.2s;">
                        <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 13px; color: #818cf8; margin-bottom: 3px;">
                            <i class="fa-solid fa-code"></i> Bersih &amp; Standar
                        </div>
                        <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.3;">
                            Kode rapi &amp; terbaca. Siap di-host di cPanel, Netlify, Vercel, atau diedit developer.
                        </div>
                    </button>

                    <button type="button" id="export-preset-protected" class="export-preset-btn" style="padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-surface-elevated); color: var(--text-primary); text-align: left; cursor: pointer; transition: all 0.2s;">
                        <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 13px; color: #22c55e; margin-bottom: 3px;">
                            <i class="fa-solid fa-shield-halved"></i> Terproteksi (Anti-Theft)
                        </div>
                        <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.3;">
                            Anti-Inspect, kunci Klik Kanan, F12, Ctrl+U &amp; enkripsi script anti-pembajakan.
                        </div>
                    </button>
                </div>

                <!-- Opsi Kustomisasi -->
                <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; margin-bottom: 14px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">
                            <i class="fa-solid fa-gear"></i> Konfigurasi File Export:
                        </span>
                        <span id="export-file-stats" style="font-size: 11px; color: #a5b4fc; font-weight: 600;">
                            Menghitung ukuran...
                        </span>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer; color: var(--text-primary);">
                            <input type="checkbox" id="export-opt-forms" checked style="accent-color: #6366f1;">
                            <span><strong>Formulir Otomatis (WhatsApp &amp; Google Sheets):</strong> Formulir tetap mengirim pesanan ke WA &amp; Sheet secara mandiri.</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer; color: var(--text-primary);">
                            <input type="checkbox" id="export-opt-tracking" checked style="accent-color: #6366f1;">
                            <span><strong>Sertakan SEO &amp; Tracking:</strong> Masukkan Meta Title, Open Graph WhatsApp/FB, GA4, Meta Pixel &amp; Clarity.</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer; color: var(--text-primary);">
                            <input type="checkbox" id="export-opt-shield" style="accent-color: #22c55e;">
                            <span><strong>Bongkar Source Shield:</strong> Kunci Klik Kanan, F12 (Inspect Element), Ctrl+U (View Source), Ctrl+S.</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer; color: var(--text-primary);">
                            <input type="checkbox" id="export-opt-obfuscate" style="accent-color: #22c55e;">
                            <span><strong>Obfuscasi JavaScript &amp; Anti-Debugger:</strong> Enkripsi script agar logika &amp; algoritma tidak bisa dicontek.</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer; color: var(--text-primary);">
                            <input type="checkbox" id="export-opt-compact" checked style="accent-color: #6366f1;">
                            <span><strong>Bersihkan Komentar &amp; Spasi Berlebih:</strong> Optimalkan struktur HTML agar ukuran file lebih ringan.</span>
                        </label>
                    </div>
                </div>

                <div class="form-row" style="margin-bottom: 12px;">
                    <label class="form-label" style="display: flex; justify-content: space-between;">
                        <span>Nama File Export:</span>
                        <a href="javascript:void(0)" id="btn-toggle-export-preview" style="color: #818cf8; text-decoration: none; font-size: 11px;">
                            <i class="fa-solid fa-eye"></i> <span id="export-preview-toggle-label">Lihat Pratinjau Kode</span>
                        </a>
                    </label>
                    <input type="text" id="export-filename" class="form-input" value="<?php echo esc_attr(sanitize_title($post->post_title) ?: 'landing-page'); ?>.html">
                </div>

                <!-- Collapsible Code Preview Box -->
                <div id="export-code-preview-wrap" style="display: none; margin-top: 10px;">
                    <textarea id="export-code-preview" readonly class="form-textarea" style="height: 140px; font-family: monospace; font-size: 11px; background: #0f172a; color: #e2e8f0; line-height: 1.4; resize: vertical;"></textarea>
                </div>
            </div>
            <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
                <button type="button" id="btn-export-copy" class="btn-studio-action" title="Salin seluruh kode HTML ke clipboard">
                    <i class="fa-solid fa-copy"></i> Salin Kode
                </button>
                <div style="display: flex; gap: 8px;">
                    <button type="button" class="btn-studio-action" data-close-modal="exporter">Tutup</button>
                    <button type="button" id="btn-export-download" class="btn-studio-action btn-save-publish" style="background: #4f46e5; border-color: #4338ca;">
                        <i class="fa-solid fa-download"></i> Download File .html
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal: Sisipkan Section Desain HTML Sendiri -->
    <div id="modal-section-html" class="studio-modal-backdrop">
        <div class="studio-modal" style="max-width: 640px;">
            <div class="modal-header">
                <div class="modal-title">
                    <i class="fa-solid fa-code" style="color: #6366f1;"></i>
                    <span data-i18n="modal_html.title">Desain HTML Sendiri</span>
                </div>
                <button type="button" class="modal-close" data-close-modal="section-html">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="modal-body">
                <p data-i18n="modal_html.desc" style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.5;">
                    Tempel kode HTML atau komponen UI hasil buatan sendiri / AI (Tailwind, Bootstrap, atau HTML murni) untuk disisipkan langsung ke posisi section ini.
                </p>
                <div class="form-row">
                    <label class="form-label" data-i18n="modal_html.code_label">Kode HTML Section:</label>
                    <textarea id="section-html-textarea" class="form-input" data-i18n-placeholder="modal_html.placeholder" style="height: 220px; font-family: monospace; font-size: 12px; resize: vertical;" placeholder="<section class='py-12 px-4'>&#10;  <div class='container mx-auto'>&#10;    <h2>Judul Section Saya</h2>&#10;    <p>Deskripsi konten...</p>&#10;  </div>&#10;</section>"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-studio-action" data-close-modal="section-html" data-i18n="modal_html.cancel">Batal</button>
                <button type="button" id="btn-submit-section-html" class="btn-studio-action btn-save-publish">
                    <i class="fa-solid fa-plus"></i> <span data-i18n="modal_html.insert">Sisipkan Section</span>
                </button>
            </div>
        </div>
    </div>

</div>

<!-- Data Localized for Studio JS -->
<script>
window.bongkarStudioConfig = {
    postId: <?php echo absint($post_id); ?>,
    postType: <?php echo json_encode($post->post_type); ?>,
    templateType: <?php echo json_encode(get_post_meta($post_id, '_bongkar_template_type', true) ?: ''); ?>,
    postStatus: <?php echo json_encode($post_status); ?>,
    hasDraft: <?php echo json_encode($has_draft); ?>,
    draftUpdatedAt: <?php echo json_encode($draft_updated_at); ?>,
    ajaxUrl: <?php echo json_encode(admin_url('admin-ajax.php')); ?>,
    nonce: <?php echo json_encode($ajax_nonce); ?>,
    popularFonts: <?php echo json_encode($popular_fonts); ?>,
    pluginUrl: <?php echo json_encode(BONGKAR_BUILDER_URL); ?>,
    permalink: <?php echo json_encode($permalink); ?>,
    initialHtml: <?php echo json_encode($current_html); ?>,
    initialJs: <?php echo json_encode($current_js); ?>,
    initialExtScripts: <?php echo !empty($current_ext_scripts) ? $current_ext_scripts : '[]'; ?>,
    initialExtStyles: <?php echo !empty($current_ext_styles) ? $current_ext_styles : '[]'; ?>,
    initialFocusKeyword: <?php echo json_encode($focus_keyword); ?>,
    initialFaviconUrl: <?php echo json_encode($favicon_url ?: ''); ?>,
    initialOgImageUrl: <?php echo json_encode($og_image_url ?: ''); ?>,
    defaultSiteIconUrl: <?php echo json_encode(get_site_icon_url(192) ?: ''); ?>,
    initialPageLayout: <?php echo json_encode($current_page_layout); ?>,
    initialHeaderId: <?php echo absint($current_header_id ?: 0); ?>,
    initialFooterId: <?php echo absint($current_footer_id ?: 0); ?>,
    wpCategories: <?php 
        $all_cats = get_categories(['hide_empty' => false]);
        $simple_cats = array_map(function($c) { return ['id' => $c->term_id, 'name' => $c->name, 'count' => $c->count]; }, $all_cats);
        echo json_encode($simple_cats);
    ?>,
    initialPageSettings: <?php echo json_encode($parsed_settings); ?>
};
</script>

<!-- Studio JavaScript Modules & Media Templates -->
<?php 
wp_print_media_templates();
wp_print_footer_scripts(); 
?>
<script src="<?php echo esc_url(BONGKAR_BUILDER_URL . 'assets/js/i18n-studio.js?v=' . BONGKAR_BUILDER_VERSION); ?>"></script>
<script src="<?php echo esc_url(BONGKAR_BUILDER_URL . 'assets/js/icon-picker.js?v=' . BONGKAR_BUILDER_VERSION); ?>"></script>
<script src="<?php echo esc_url(BONGKAR_BUILDER_URL . 'assets/js/section-manager.js?v=' . BONGKAR_BUILDER_VERSION); ?>"></script>
<script src="<?php echo esc_url(BONGKAR_BUILDER_URL . 'assets/js/inspector-typography.js?v=' . BONGKAR_BUILDER_VERSION); ?>"></script>
<script src="<?php echo esc_url(BONGKAR_BUILDER_URL . 'assets/js/script-manager.js?v=' . BONGKAR_BUILDER_VERSION); ?>"></script>
<script src="<?php echo esc_url(BONGKAR_BUILDER_URL . 'assets/js/seo-audit.js?v=' . BONGKAR_BUILDER_VERSION); ?>"></script>
<script src="<?php echo esc_url(BONGKAR_BUILDER_URL . 'assets/js/import-export.js?v=' . BONGKAR_BUILDER_VERSION); ?>"></script>
<script src="<?php echo esc_url(BONGKAR_BUILDER_URL . 'assets/js/editor-studio.js?v=' . BONGKAR_BUILDER_VERSION); ?>"></script>

</body>
</html>
