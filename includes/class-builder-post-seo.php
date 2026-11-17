<?php
/**
 * Bongkar Post SEO Intelligence & Automation Suite
 * Specifically designed for WordPress Articles (Posts).
 * Delivers lightweight, zero-bloat SEO meta settings, real-time Google SERP simulation,
 * and automated content-driven recommendations with 1-click intelligence helpers.
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('Bongkar_Builder_Post_SEO')) {

class Bongkar_Builder_Post_SEO {

    private static $instance = null;

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Metabox specifically on 'post' (not page)
        add_action('add_meta_boxes_post', [$this, 'register_post_seo_metabox']);
        add_action('save_post_post', [$this, 'save_post_seo_meta'], 10, 2);

        // Enqueue Assets on post edit screen
        add_action('admin_enqueue_scripts', [$this, 'enqueue_post_seo_assets']);

        // Frontend Head Meta & Title Tags
        add_action('wp_head', [$this, 'render_frontend_meta_tags'], 1);
        add_filter('pre_get_document_title', [$this, 'filter_document_title'], 99);
        add_filter('document_title_parts', [$this, 'filter_document_title_parts'], 99);

        // Admin Posts List Column
        add_filter('manage_post_posts_columns', [$this, 'add_seo_column']);
        add_action('manage_post_posts_custom_column', [$this, 'render_seo_column'], 10, 2);
    }

    /**
     * Register SEO Metabox on Post Screen
     */
    public function register_post_seo_metabox() {
        // Main bottom metabox (Full Suite & Google SERP Simulator)
        add_meta_box(
            'bongkar_post_seo_metabox',
            __('Bongkar SEO Intelligence & Automation', 'bongkar-builder'),
            [$this, 'render_metabox_content'],
            'post',
            'normal',
            'high'
        );

        // Sidebar metabox (Quick status & live score di samping)
        add_meta_box(
            'bongkar_post_seo_sidebar',
            __('Skor & Ringkasan SEO', 'bongkar-builder'),
            [$this, 'render_sidebar_metabox_content'],
            'post',
            'side',
            'high'
        );
    }

    /**
     * Render the Compact Sidebar SEO Metabox Content (Di Samping)
     */
    public function render_sidebar_metabox_content($post) {
        wp_nonce_field('bongkar_post_seo_save_nonce_action', 'bongkar_post_seo_nonce');

        $focus_kw    = get_post_meta($post->ID, '_bongkar_seo_focus_kw', true);
        $seo_title   = get_post_meta($post->ID, '_bongkar_seo_title', true);
        $seo_desc    = get_post_meta($post->ID, '_bongkar_seo_desc', true);
        $saved_score = get_post_meta($post->ID, '_bongkar_seo_score', true);
        $saved_score = ($saved_score !== '') ? (int) $saved_score : 0;
        ?>
        <div class="bp-seo-side-wrapper">
            <!-- Sidebar Score Header -->
            <div class="bp-side-score-box">
                <div class="bp-side-score-top">
                    <span class="bp-side-score-label">Skor SEO Live</span>
                    <span class="bp-side-status-pill" id="bp-side-status-pill">Menganalisis...</span>
                </div>
                <div class="bp-side-score-display">
                    <div class="bp-side-score-badge" id="bp-side-score-badge">
                        <span class="bp-side-score-num" id="bp-side-score-num"><?php echo esc_html($saved_score ?: '--'); ?></span>
                        <span class="bp-side-score-max">/100</span>
                    </div>
                    <div class="bp-side-score-info">
                        <div class="bp-side-score-tip">Skor SEO otomatis dihitung saat Anda menulis.</div>
                    </div>
                </div>
            </div>

            <!-- Focus Keyword Field -->
            <div class="bp-side-field-group">
                <div class="bp-side-field-header">
                    <label for="bp_seo_side_focus_kw"><strong>Kata Kunci Utama:</strong></label>
                    <button type="button" class="bp-side-btn-auto" id="bp-side-btn-auto-kw" title="Deteksi kata kunci dari artikel">
                        Deteksi
                    </button>
                </div>
                <input type="text" id="bp_seo_side_focus_kw" name="bp_seo_side_focus_kw" 
                       value="<?php echo esc_attr($focus_kw); ?>" 
                       class="bp-side-input" 
                       placeholder="Target kata kunci...">
            </div>

            <!-- SEO Title Field -->
            <div class="bp-side-field-group">
                <div class="bp-side-field-header">
                    <label for="bp_seo_side_title"><strong>Judul SEO:</strong></label>
                    <div class="bp-side-header-actions">
                        <span class="bp-side-counter" id="bp-side-title-counter">0 / 60</span>
                        <button type="button" class="bp-side-btn-auto" id="bp-side-btn-auto-title" title="Ambil dari judul artikel">
                            Judul
                        </button>
                    </div>
                </div>
                <input type="text" id="bp_seo_side_title" name="bp_seo_side_title" 
                       value="<?php echo esc_attr($seo_title); ?>" 
                       class="bp-side-input" 
                       placeholder="Judul SEO Google...">
                <div class="bp-side-progress-bar"><div class="bp-side-progress-fill" id="bp-side-title-progress"></div></div>
            </div>

            <!-- SEO Meta Description Field -->
            <div class="bp-side-field-group">
                <div class="bp-side-field-header">
                    <label for="bp_seo_side_desc"><strong>Deskripsi (Snippet):</strong></label>
                    <div class="bp-side-header-actions">
                        <span class="bp-side-counter" id="bp-side-desc-counter">0 / 160</span>
                        <button type="button" class="bp-side-btn-auto" id="bp-side-btn-auto-desc" title="Ekstrak dari paragraf pertama">
                            Ekstrak
                        </button>
                    </div>
                </div>
                <textarea id="bp_seo_side_desc" name="bp_seo_side_desc" rows="2" 
                          class="bp-side-textarea" 
                          placeholder="Ringkasan artikel..."><?php echo esc_textarea($seo_desc); ?></textarea>
                <div class="bp-side-progress-bar"><div class="bp-side-progress-fill" id="bp-side-desc-progress"></div></div>
            </div>

            <!-- Mini Indicators Checklist -->
            <div class="bp-side-indicators">
                <span class="bp-side-ind-heading">Indikator Kunci Cepat:</span>
                <div class="bp-side-ind-list">
                    <div class="bp-side-ind-item">
                        <span class="bp-side-ind-label">Kata Kunci</span>
                        <span class="bp-side-ind-badge" id="bp-side-ind-kw">--</span>
                    </div>
                    <div class="bp-side-ind-item">
                        <span class="bp-side-ind-label">Judul SEO</span>
                        <span class="bp-side-ind-badge" id="bp-side-ind-title">--</span>
                    </div>
                    <div class="bp-side-ind-item">
                        <span class="bp-side-ind-label">Meta Deskripsi</span>
                        <span class="bp-side-ind-badge" id="bp-side-ind-desc">--</span>
                    </div>
                    <div class="bp-side-ind-item">
                        <span class="bp-side-ind-label">Panjang Artikel</span>
                        <span class="bp-side-ind-badge" id="bp-side-ind-words">--</span>
                    </div>
                </div>
            </div>

            <!-- Jump to Full Suite Button -->
            <div class="bp-side-actions">
                <button type="button" class="bp-side-btn-jump" id="bp-side-btn-jump-main">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    Lihat Analisis & SERP Lengkap ↓
                </button>
            </div>

            <!-- Hidden score for fallback form submission -->
            <input type="hidden" id="bp_seo_side_score" name="bp_seo_side_score" value="<?php echo esc_attr($saved_score); ?>">
        </div>
        <?php
    }

    /**
     * Enqueue CSS & JS only on post edit screen
     */
    public function enqueue_post_seo_assets($hook) {
        if (!in_array($hook, ['post.php', 'post-new.php'], true)) {
            return;
        }

        $screen = get_current_screen();
        if (!$screen || $screen->post_type !== 'post') {
            return;
        }

        // Enqueue Media for OG Image selection
        wp_enqueue_media();

        // Enqueue Post SEO CSS
        wp_enqueue_style(
            'bongkar-post-seo-style',
            BONGKAR_BUILDER_URL . 'assets/css/post-seo.css',
            [],
            BONGKAR_BUILDER_VERSION
        );

        // Enqueue Post SEO JS
        wp_enqueue_script(
            'bongkar-post-seo-script',
            BONGKAR_BUILDER_URL . 'assets/js/post-seo.js',
            ['jquery'],
            BONGKAR_BUILDER_VERSION,
            true
        );

        global $post;
        $site_name = get_bloginfo('name');
        $home_url = home_url('/');
        $post_url = $post ? get_permalink($post->ID) : $home_url;

        wp_localize_script('bongkar-post-seo-script', 'bongkarPostSEOData', [
            'siteName' => $site_name,
            'homeUrl'  => $home_url,
            'postUrl'  => $post_url,
            'postId'   => $post ? $post->ID : 0,
        ]);
    }

    /**
     * Render the SEO Metabox HTML Content
     */
    public function render_metabox_content($post) {
        wp_nonce_field('bongkar_post_seo_save_nonce_action', 'bongkar_post_seo_nonce');

        $focus_kw   = get_post_meta($post->ID, '_bongkar_seo_focus_kw', true);
        $seo_title  = get_post_meta($post->ID, '_bongkar_seo_title', true);
        $seo_desc   = get_post_meta($post->ID, '_bongkar_seo_desc', true);
        $og_image   = get_post_meta($post->ID, '_bongkar_seo_og_image', true);
        $noindex    = get_post_meta($post->ID, '_bongkar_seo_noindex', true);
        $canonical  = get_post_meta($post->ID, '_bongkar_seo_canonical', true);
        $saved_score = get_post_meta($post->ID, '_bongkar_seo_score', true);
        $saved_score = ($saved_score !== '') ? (int) $saved_score : 0;

        $post_permalink = get_permalink($post->ID);
        $parsed_url = parse_url($post_permalink);
        $display_url = ($parsed_url['host'] ?? 'domainanda.com') . ' › ' . ($post->post_name ?: 'judul-artikel-anda');
        ?>
        <div class="bp-seo-wrapper">
            <!-- Header Bar with Live Score -->
            <div class="bp-seo-topbar">
                <div class="bp-seo-brand">
                    <div class="bp-seo-logo">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                    </div>
                    <div>
                        <h4 class="bp-seo-heading">Bongkar SEO Intelligence</h4>
                        <span class="bp-seo-subheading">Panduan & Rekomendasi Penulisan Artikel Standar Google 2026</span>
                    </div>
                </div>

                <div class="bp-seo-score-widget">
                    <span class="bp-seo-score-text">Skor SEO:</span>
                    <div class="bp-seo-score-badge" id="bp-seo-badge">
                        <span class="bp-seo-score-num" id="bp-seo-score-num"><?php echo esc_html($saved_score ?: '--'); ?></span>
                        <span class="bp-seo-score-max">/100</span>
                    </div>
                    <span class="bp-seo-status-pill" id="bp-seo-status-pill">Menganalisis...</span>
                </div>
            </div>

            <!-- Tab Navigation -->
            <div class="bp-seo-tabs">
                <button type="button" class="bp-seo-tab-btn is-active" data-tab="general">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    Pengaturan & Snippet Google
                </button>
                <button type="button" class="bp-seo-tab-btn" data-tab="audit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    Rekomendasi Konten Otomatis (<span id="bp-recom-count">0</span>)
                </button>
                <button type="button" class="bp-seo-tab-btn" data-tab="social">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                    Preview Media Sosial (WhatsApp/FB)
                </button>
            </div>

            <!-- TAB 1: PENGATURAN UMUM & GOOGLE SERP PREVIEW -->
            <div class="bp-seo-tab-panel is-active" id="bp-tab-general">
                <div class="bp-seo-grid-layout">
                    <!-- Kolom Form Pengaturan -->
                    <div class="bp-seo-form-col">
                        <!-- Focus Keyword Field -->
                        <div class="bp-field-group">
                            <div class="bp-field-header">
                                <label for="bp_seo_focus_kw"><strong>Kata Kunci Utama (Focus Keyword):</strong></label>
                                <button type="button" class="bp-btn-auto" id="bp-btn-auto-keyword" title="Mendeteksi kata kunci terbaik dari artikel yang sedang ditulis">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                                    Deteksi dari Isi Artikel
                                </button>
                            </div>
                            <input type="text" id="bp_seo_focus_kw" name="bp_seo_focus_kw" 
                                   value="<?php echo esc_attr($focus_kw); ?>" 
                                   class="bp-input" 
                                   placeholder="Contoh: resep kopi gula aren">
                            <span class="bp-field-hint">Kata kunci yang ingin Anda targetkan agar artikel ini muncul di peringkat atas Google.</span>
                        </div>

                        <!-- SEO Meta Title Field -->
                        <div class="bp-field-group">
                            <div class="bp-field-header">
                                <label for="bp_seo_title"><strong>Judul SEO (Meta Title Google):</strong></label>
                                <div class="bp-header-actions">
                                    <span class="bp-char-counter" id="bp-title-counter">0 / 60</span>
                                    <button type="button" class="bp-btn-auto" id="bp-btn-auto-title" title="Gunakan judul artikel otomatis">
                                        Ambil dari Judul Post
                                    </button>
                                </div>
                            </div>
                            <input type="text" id="bp_seo_title" name="bp_seo_title" 
                                   value="<?php echo esc_attr($seo_title); ?>" 
                                   class="bp-input" 
                                   placeholder="Judul yang menarik dan ramah mesin pencari...">
                            <div class="bp-progress-bar"><div class="bp-progress-fill" id="bp-title-progress"></div></div>
                            <span class="bp-field-hint">Disarankan 40–60 karakter agar tidak terpotong (... ) di hasil pencarian Google.</span>
                        </div>

                        <!-- SEO Meta Description Field -->
                        <div class="bp-field-group">
                            <div class="bp-field-header">
                                <label for="bp_seo_desc"><strong>Deskripsi Penelusuran (Meta Description):</strong></label>
                                <div class="bp-header-actions">
                                    <span class="bp-char-counter" id="bp-desc-counter">0 / 160</span>
                                    <button type="button" class="bp-btn-auto" id="bp-btn-auto-desc" title="Ekstrak otomatis ringkasan dari paragraf pertama tulisan">
                                        Ekstrak dari Paragraf Pertama
                                    </button>
                                </div>
                            </div>
                            <textarea id="bp_seo_desc" name="bp_seo_desc" rows="3" 
                                      class="bp-textarea" 
                                      placeholder="Ringkasan singkat isi artikel yang memikat pembaca untuk mengklik..."><?php echo esc_textarea($seo_desc); ?></textarea>
                            <div class="bp-progress-bar"><div class="bp-progress-fill" id="bp-desc-progress"></div></div>
                            <span class="bp-field-hint">Disarankan 120–160 karakter dan memuat kata kunci utama secara natural.</span>
                        </div>

                        <!-- Opsi Lanjutan: Robot & Canonical -->
                        <div class="bp-advanced-box">
                            <details>
                                <summary class="bp-advanced-summary">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                    Pengaturan Robot & URL Canonical (Tingkat Lanjut)
                                </summary>
                                <div class="bp-advanced-content">
                                    <label class="bp-checkbox-label">
                                        <input type="checkbox" name="bp_seo_noindex" value="1" <?php checked($noindex, '1'); ?>>
                                        <span>Jangan indeks artikel ini di Google (noindex)</span>
                                    </label>
                                    <div class="bp-field-group" style="margin-top: 10px;">
                                        <label for="bp_seo_canonical">URL Canonical Kustom (Opsional):</label>
                                        <input type="url" id="bp_seo_canonical" name="bp_seo_canonical" 
                                               value="<?php echo esc_attr($canonical); ?>" 
                                               class="bp-input" 
                                               placeholder="<?php echo esc_url($post_permalink); ?>">
                                        <span class="bp-field-hint">Kosongkan jika artikel ini adalah konten asli utama.</span>
                                    </div>
                                </div>
                            </details>
                        </div>
                    </div>

                    <!-- Kolom Live SERP Preview -->
                    <div class="bp-seo-preview-col">
                        <div class="bp-preview-card">
                            <div class="bp-preview-card-header">
                                <span class="bp-preview-badge">Live Google SERP</span>
                                <div class="bp-preview-toggle">
                                    <button type="button" class="bp-device-btn is-active" data-device="mobile" title="Tampilan Ponsel">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                                        Mobile
                                    </button>
                                    <button type="button" class="bp-device-btn" data-device="desktop" title="Tampilan Desktop">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                                        Desktop
                                    </button>
                                </div>
                            </div>
                            <div class="bp-google-box" id="bp-google-box">
                                <div class="bp-google-site">
                                    <span class="bp-google-favicon">G</span>
                                    <div class="bp-google-site-info">
                                        <span class="bp-google-name"><?php echo esc_html(get_bloginfo('name')); ?></span>
                                        <span class="bp-google-url" id="bp-serp-url"><?php echo esc_html($display_url); ?></span>
                                    </div>
                                </div>
                                <h3 class="bp-google-title" id="bp-serp-title">
                                    <?php echo esc_html($seo_title ?: get_the_title($post->ID) ?: 'Judul Artikel Anda'); ?>
                                </h3>
                                <p class="bp-google-snippet" id="bp-serp-desc">
                                    <?php echo esc_html($seo_desc ?: 'Silakan ketik atau ekstrak meta deskripsi agar calon pengunjung tertarik mengklik artikel Anda di Google...'); ?>
                                </p>
                            </div>
                        </div>

                        <!-- Mini Score Summary Card -->
                        <div class="bp-metric-card">
                            <div class="bp-metric-row">
                                <span>Estimasi Waktu Baca:</span>
                                <strong id="bp-stat-reading-time">1 menit</strong>
                            </div>
                            <div class="bp-metric-row">
                                <span>Jumlah Kata:</span>
                                <strong id="bp-stat-word-count">0 kata</strong>
                            </div>
                            <div class="bp-metric-row">
                                <span>Kepadatan Kata Kunci:</span>
                                <strong id="bp-stat-kw-density">0%</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- TAB 2: AUDIT & REKOMENDASI OTOMATIS -->
            <div class="bp-seo-tab-panel" id="bp-tab-audit">
                <div class="bp-audit-dashboard">
                    <div class="bp-audit-intro">
                        <div class="bp-audit-badge-large">
                            <span id="bp-audit-score-gauge">0</span>%
                        </div>
                        <div>
                            <h4 id="bp-audit-verdict-title">Menghitung Kualitas SEO Tulisan...</h4>
                            <p id="bp-audit-verdict-desc">Sistem otomatis memeriksa struktur artikel, kepadatan kata kunci, dan keterbacaan artikel Anda.</p>
                        </div>
                        <button type="button" class="button button-secondary bp-btn-rescan" id="bp-btn-rescan">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                            Pindai Ulang
                        </button>
                    </div>

                    <!-- Checklist Rekomendasi Dinamis -->
                    <div class="bp-audit-checklist" id="bp-audit-checklist">
                        <!-- Items rendered dynamically via JavaScript -->
                    </div>
                </div>
            </div>

            <!-- TAB 3: SOCIAL SHARE PREVIEW (WHATSAPP / FACEBOOK) -->
            <div class="bp-seo-tab-panel" id="bp-tab-social">
                <div class="bp-social-grid">
                    <div class="bp-social-inputs">
                        <div class="bp-field-group">
                            <label><strong>Gambar Pratinjau Sosial (Open Graph Image):</strong></label>
                            <p class="bp-field-hint">Gambar yang muncul otomatis saat link artikel dibagikan ke WhatsApp, Telegram, Facebook, atau Twitter.</p>
                            <div class="bp-og-image-uploader">
                                <input type="hidden" id="bp_seo_og_image" name="bp_seo_og_image" value="<?php echo esc_attr($og_image); ?>">
                                <div class="bp-og-preview-thumb" id="bp-og-preview-thumb">
                                    <?php if (!empty($og_image)): ?>
                                        <img src="<?php echo esc_url($og_image); ?>" alt="Social Preview">
                                    <?php else: ?>
                                        <span class="bp-no-thumb">Belum ada gambar kustom (menggunakan Featured Image bawaan)</span>
                                    <?php endif; ?>
                                </div>
                                <div class="bp-og-btn-group">
                                    <button type="button" class="button button-secondary" id="bp-btn-select-og-image">
                                        Pilih Gambar dari Media
                                    </button>
                                    <button type="button" class="button button-link-delete" id="bp-btn-remove-og-image" style="<?php echo empty($og_image) ? 'display:none;' : ''; ?>">
                                        Hapus Gambar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bp-social-card-col">
                        <label><strong>Simulasi Tampilan WhatsApp / Facebook:</strong></label>
                        <div class="bp-social-card">
                            <div class="bp-social-image-box" id="bp-social-card-img">
                                <?php if (!empty($og_image)): ?>
                                    <img src="<?php echo esc_url($og_image); ?>" alt="Social Preview">
                                <?php else: ?>
                                    <div class="bp-social-img-placeholder">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                        <span>Gambar Unggulan / Open Graph</span>
                                    </div>
                                <?php endif; ?>
                            </div>
                            <div class="bp-social-meta-box">
                                <span class="bp-social-domain"><?php echo esc_html($_SERVER['HTTP_HOST'] ?? 'websiteanda.com'); ?></span>
                                <h4 class="bp-social-title" id="bp-social-title">
                                    <?php echo esc_html($seo_title ?: get_the_title($post->ID) ?: 'Judul Artikel Menarik'); ?>
                                </h4>
                                <p class="bp-social-desc" id="bp-social-desc">
                                    <?php echo esc_html($seo_desc ?: 'Ringkasan artikel yang akan dibaca oleh teman atau calon klien di WhatsApp...'); ?>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Hidden field for storing the computed SEO score -->
            <input type="hidden" id="bp_seo_score" name="bp_seo_score" value="<?php echo esc_attr($saved_score); ?>">
        </div>
        <?php
    }

    /**
     * Save SEO Meta on Post Save
     */
    public function save_post_seo_meta($post_id, $post) {
        if (!isset($_POST['bongkar_post_seo_nonce']) || !wp_verify_nonce($_POST['bongkar_post_seo_nonce'], 'bongkar_post_seo_save_nonce_action')) {
            return;
        }

        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        if ($post->post_type !== 'post') {
            return;
        }

        $focus_kw  = sanitize_text_field(!empty($_POST['bp_seo_focus_kw']) ? $_POST['bp_seo_focus_kw'] : ($_POST['bp_seo_side_focus_kw'] ?? ''));
        $seo_title = sanitize_text_field(!empty($_POST['bp_seo_title']) ? $_POST['bp_seo_title'] : ($_POST['bp_seo_side_title'] ?? ''));
        $seo_desc  = sanitize_textarea_field(!empty($_POST['bp_seo_desc']) ? $_POST['bp_seo_desc'] : ($_POST['bp_seo_side_desc'] ?? ''));
        $score     = isset($_POST['bp_seo_score']) && $_POST['bp_seo_score'] !== '' ? absint($_POST['bp_seo_score']) : absint($_POST['bp_seo_side_score'] ?? 0);

        $fields = [
            '_bongkar_seo_focus_kw'   => $focus_kw,
            '_bongkar_seo_title'      => $seo_title,
            '_bongkar_seo_desc'       => $seo_desc,
            '_bongkar_seo_og_image'   => esc_url_raw($_POST['bp_seo_og_image'] ?? ''),
            '_bongkar_seo_noindex'    => !empty($_POST['bp_seo_noindex']) ? '1' : '0',
            '_bongkar_seo_canonical'  => esc_url_raw($_POST['bp_seo_canonical'] ?? ''),
            '_bongkar_seo_score'      => $score,
        ];

        foreach ($fields as $meta_key => $value) {
            update_post_meta($post_id, $meta_key, $value);
        }
    }

    /**
     * Render Custom Title for Single Posts
     */
    public function filter_document_title($title) {
        if (is_single() && get_post_type() === 'post') {
            $post_id = get_the_ID();
            $custom_title = get_post_meta($post_id, '_bongkar_seo_title', true);
            if (!empty($custom_title)) {
                return esc_html($custom_title);
            }
        }
        return $title;
    }

    public function filter_document_title_parts($title_parts) {
        if (is_single() && get_post_type() === 'post') {
            $post_id = get_the_ID();
            $custom_title = get_post_meta($post_id, '_bongkar_seo_title', true);
            if (!empty($custom_title)) {
                $title_parts['title'] = esc_html($custom_title);
            }
        }
        return $title_parts;
    }

    /**
     * Render Meta Tags in <head> for Single Posts
     */
    public function render_frontend_meta_tags() {
        if (!is_single() || get_post_type() !== 'post') {
            return;
        }

        $post_id = get_the_ID();
        $seo_title = get_post_meta($post_id, '_bongkar_seo_title', true) ?: get_the_title($post_id);
        $seo_desc  = get_post_meta($post_id, '_bongkar_seo_desc', true);
        $og_image  = get_post_meta($post_id, '_bongkar_seo_og_image', true);
        $noindex   = get_post_meta($post_id, '_bongkar_seo_noindex', true);
        $canonical = get_post_meta($post_id, '_bongkar_seo_canonical', true) ?: get_permalink($post_id);

        if (empty($og_image) && has_post_thumbnail($post_id)) {
            $og_image = get_the_post_thumbnail_url($post_id, 'large');
        }

        echo "\n<!-- Bongkar SEO Meta Output -->\n";

        if ($noindex === '1') {
            echo '<meta name="robots" content="noindex, nofollow" />' . "\n";
        }

        if (!empty($seo_desc)) {
            echo '<meta name="description" content="' . esc_attr($seo_desc) . '" />' . "\n";
        }

        if (!empty($canonical)) {
            echo '<link rel="canonical" href="' . esc_url($canonical) . '" />' . "\n";
        }

        // Open Graph Meta
        echo '<meta property="og:type" content="article" />' . "\n";
        echo '<meta property="og:title" content="' . esc_attr($seo_title) . '" />' . "\n";
        if (!empty($seo_desc)) {
            echo '<meta property="og:description" content="' . esc_attr($seo_desc) . '" />' . "\n";
        }
        echo '<meta property="og:url" content="' . esc_url(get_permalink($post_id)) . '" />' . "\n";
        echo '<meta property="og:site_name" content="' . esc_attr(get_bloginfo('name')) . '" />' . "\n";
        if (!empty($og_image)) {
            echo '<meta property="og:image" content="' . esc_url($og_image) . '" />' . "\n";
        }

        // Twitter Card Meta
        echo '<meta name="twitter:card" content="summary_large_image" />' . "\n";
        echo '<meta name="twitter:title" content="' . esc_attr($seo_title) . '" />' . "\n";
        if (!empty($seo_desc)) {
            echo '<meta name="twitter:description" content="' . esc_attr($seo_desc) . '" />' . "\n";
        }
        if (!empty($og_image)) {
            echo '<meta name="twitter:image" content="' . esc_url($og_image) . '" />' . "\n";
        }

        echo "<!-- /Bongkar SEO Meta Output -->\n\n";
    }

    /**
     * Add SEO Score Column in Posts Table
     */
    public function add_seo_column($columns) {
        $new_cols = [];
        foreach ($columns as $key => $title) {
            $new_cols[$key] = $title;
            if ($key === 'title') {
                $new_cols['bongkar_seo'] = __('Skor SEO', 'bongkar-builder');
            }
        }
        return $new_cols;
    }

    /**
     * Render SEO Score Column Content
     */
    public function render_seo_column($column, $post_id) {
        if ($column !== 'bongkar_seo') {
            return;
        }

        $score = get_post_meta($post_id, '_bongkar_seo_score', true);
        $kw = get_post_meta($post_id, '_bongkar_seo_focus_kw', true);

        if ($score === '' || $score === false) {
            echo '<span style="color:#94a3b8; font-size:11px;">Belum dipindai</span>';
            return;
        }

        $score = (int) $score;
        $color = '#ef4444'; // Red
        $bg = '#fee2e2';

        if ($score >= 80) {
            $color = '#15803d'; // Green
            $bg = '#dcfce7';
        } elseif ($score >= 50) {
            $color = '#b45309'; // Amber
            $bg = '#fef3c7';
        }

        echo '<div style="display:inline-flex; align-items:center; gap:6px;">';
        echo '<span style="display:inline-block; padding:2px 8px; border-radius:12px; font-weight:700; font-size:11px; color:' . esc_attr($color) . '; background:' . esc_attr($bg) . ';">' . esc_html($score) . '/100</span>';
        if (!empty($kw)) {
            echo '<span style="color:#64748b; font-size:11px; max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="' . esc_attr($kw) . '">"' . esc_html($kw) . '"</span>';
        }
        echo '</div>';
    }
}

} // End if !class_exists('Bongkar_Builder_Post_SEO')
