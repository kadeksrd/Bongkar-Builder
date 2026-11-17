<?php
/**
 * Admin Menu and Management Screen
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('Bongkar_Builder_Admin')) {

class Bongkar_Builder_Admin {

    private static $instance = null;

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('admin_menu', [$this, 'register_admin_menus']);
        add_action('admin_action_bongkar_create_landing_page', [$this, 'create_landing_page_action']);
        add_action('admin_action_bongkar_direct_import', [$this, 'handle_direct_import_action']);
    }

    /**
     * Register Admin Menus
     */
    public function register_admin_menus() {
        // Main Menu
        add_menu_page(
            __('Bongkar Builder', 'bongkar-builder'),
            __('Bongkar Builder', 'bongkar-builder'),
            'edit_pages',
            'bongkar-builder',
            [$this, 'render_admin_dashboard'],
            'dashicons-art',
            26
        );

        // Submenu: All Landing Pages
        add_submenu_page(
            'bongkar-builder',
            __('All Canvas Pages', 'bongkar-builder'),
            __('All Canvas Pages', 'bongkar-builder'),
            'edit_pages',
            'bongkar-builder',
            [$this, 'render_admin_dashboard']
        );

        // Submenu: Header & Footer Builder
        add_submenu_page(
            'bongkar-builder',
            __('Header & Footer Builder', 'bongkar-builder'),
            __('Header & Footer', 'bongkar-builder'),
            'edit_pages',
            'bongkar-builder-templates',
            [Bongkar_Builder_Templates::get_instance(), 'render_templates_admin_page']
        );

        // Submenu: Direct Import AI/HTML
        add_submenu_page(
            'bongkar-builder',
            __('Import HTML / AI', 'bongkar-builder'),
            __('Import HTML Langsung', 'bongkar-builder'),
            'edit_pages',
            'bongkar-builder-import',
            [$this, 'render_direct_import_page']
        );

        // Submenu: Create New Empty Page
        add_submenu_page(
            'bongkar-builder',
            __('Create New Page', 'bongkar-builder'),
            __('Buat Kanvas Kosong', 'bongkar-builder'),
            'edit_pages',
            'bongkar-builder-create',
            [$this, 'render_create_page']
        );

        // Hidden Submenu for Standalone Studio App
        add_submenu_page(
            null, // Hidden from WP navigation
            __('Bongkar Studio', 'bongkar-builder'),
            __('Bongkar Studio', 'bongkar-builder'),
            'edit_pages',
            'bongkar-builder-app',
            [Bongkar_Builder_Core::get_instance(), 'render_editor_screen']
        );
    }

    /**
     * Quick action to create a new page and redirect straight into editor
     */
    public function create_landing_page_action() {
        check_admin_referer('bongkar_create_landing_page_nonce');

        if (!current_user_can('edit_pages')) {
            wp_die(__('Unauthorized', 'bongkar-builder'));
        }

        $title = isset($_POST['page_title']) && !empty(trim($_POST['page_title'])) 
            ? sanitize_text_field($_POST['page_title']) 
            : __('Landing Page Baru', 'bongkar-builder');

        $new_post_id = wp_insert_post([
            'post_title'   => $title,
            'post_type'    => 'page',
            'post_status'  => 'publish',
            'post_content' => '',
        ]);

        if ($new_post_id && !is_wp_error($new_post_id)) {
            update_post_meta($new_post_id, '_bongkar_builder_enabled', '1');
            
            // Redirect straight to standalone canvas editor!
            wp_safe_redirect(Bongkar_Builder_Core::get_editor_url($new_post_id));
            exit;
        }

        wp_safe_redirect(admin_url('admin.php?page=bongkar-builder&error=create_failed'));
        exit;
    }

    /**
     * Handle Direct HTML / AI Import Action from Dashboard
     */
    public function handle_direct_import_action() {
        check_admin_referer('bongkar_direct_import_nonce');

        if (!current_user_can('edit_pages')) {
            wp_die(__('Unauthorized', 'bongkar-builder'));
        }

        $raw_content = '';

        // Security checks for file upload
        if (isset($_FILES['html_file']) && !empty($_FILES['html_file']['tmp_name'])) {
            $uploaded = $_FILES['html_file'];
            if (!is_uploaded_file($uploaded['tmp_name'])) {
                wp_die(__('Invalid uploaded file.', 'bongkar-builder'));
            }

            // Max file size: 5MB
            if ($uploaded['size'] > 5 * 1024 * 1024) {
                wp_safe_redirect(admin_url('admin.php?page=bongkar-builder&error=file_too_large'));
                exit;
            }

            // Verify extension
            $filename = sanitize_file_name($uploaded['name']);
            $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
            if (!in_array($ext, ['html', 'htm', 'txt'], true)) {
                wp_safe_redirect(admin_url('admin.php?page=bongkar-builder&error=invalid_file_type'));
                exit;
            }

            $raw_content = file_get_contents($uploaded['tmp_name']);
        } elseif (isset($_POST['raw_code']) && !empty(trim($_POST['raw_code']))) {
            $raw_content = wp_unslash($_POST['raw_code']);
        }

        if (empty(trim($raw_content))) {
            wp_safe_redirect(admin_url('admin.php?page=bongkar-builder&error=empty_import'));
            exit;
        }

        // Parse HTML/CSS/JS payload
        $parsed = Bongkar_Builder_Ajax::parse_html_payload($raw_content);

        // Determine title
        $title = !empty($_POST['page_title']) ? sanitize_text_field($_POST['page_title']) : '';
        if (empty($title) && !empty($parsed['title'])) {
            $title = sanitize_text_field($parsed['title']);
        }
        if (empty($title)) {
            $title = __('Landing Page AI - ' . date('d M Y H:i'), 'bongkar-builder');
        }

        // Create new WordPress page
        $new_post_id = wp_insert_post([
            'post_title'   => $title,
            'post_type'    => 'page',
            'post_status'  => 'publish',
            'post_content' => preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $parsed['html']),
        ]);

        if ($new_post_id && !is_wp_error($new_post_id)) {
            update_post_meta($new_post_id, '_bongkar_builder_enabled', '1');
            update_post_meta($new_post_id, '_bongkar_canvas_html', wp_slash($parsed['html']));
            update_post_meta($new_post_id, '_bongkar_canvas_css', wp_slash($parsed['css']));
            update_post_meta($new_post_id, '_bongkar_canvas_js', wp_slash($parsed['js']));
            update_post_meta($new_post_id, '_bongkar_external_scripts', wp_slash(json_encode($parsed['external_scripts'])));
            update_post_meta($new_post_id, '_bongkar_external_styles', wp_slash(json_encode($parsed['external_styles'])));
            update_post_meta($new_post_id, '_bongkar_google_fonts', wp_slash(json_encode($parsed['google_fonts'])));
            $scraped = $parsed['scraped_seo'] ?? [];
            update_post_meta($new_post_id, '_bongkar_page_settings', wp_slash(json_encode([
                'meta_title'       => !empty($scraped['meta_title']) ? $scraped['meta_title'] : $title,
                'meta_description' => !empty($scraped['meta_description']) ? $scraped['meta_description'] : '',
                'focus_keyword'    => !empty($scraped['focus_keyword']) ? $scraped['focus_keyword'] : '',
                'gtag_id'          => !empty($scraped['gtag_id']) ? $scraped['gtag_id'] : '',
                'meta_pixel_id'    => !empty($scraped['meta_pixel_id']) ? $scraped['meta_pixel_id'] : '',
                'clarity_id'       => !empty($scraped['clarity_id']) ? $scraped['clarity_id'] : '',
                'custom_head'      => !empty($scraped['custom_head']) ? $scraped['custom_head'] : '',
            ])));
            update_post_meta($new_post_id, '_bongkar_has_draft', '0');

            // Redirect IMMEDIATELY into the Studio Editor with design loaded!
            wp_safe_redirect(Bongkar_Builder_Core::get_editor_url($new_post_id));
            exit;
        }

        wp_safe_redirect(admin_url('admin.php?page=bongkar-builder&error=import_failed'));
        exit;
    }

    /**
     * Dedicated Direct Import Screen
     */
    public function render_direct_import_page() {
        ?>
        <div class="wrap" style="max-width: 760px; margin-top: 30px;">
            <div style="background: #ffffff; padding: 32px; border-radius: 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <span style="background: linear-gradient(135deg, #4f46e5, #06b6d4); color: white; border-radius: 10px; width: 42px; height: 42px; display: inline-flex; align-items: center; justify-content: center; font-size: 20px;">
                        <span class="dashicons dashicons-upload"></span>
                    </span>
                    <div>
                        <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0;">
                            Import Desain HTML / AI Langsung
                        </h1>
                        <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">
                            Upload file <code>.html</code> atau paste kode dari AI (Claude, v0, ChatGPT) / Figma untuk langsung membuka kanvas editor.
                        </p>
                    </div>
                </div>

                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;">

                <form method="post" action="<?php echo esc_url(admin_url('admin.php?action=bongkar_direct_import')); ?>" enctype="multipart/form-data">
                    <?php wp_nonce_field('bongkar_direct_import_nonce'); ?>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: #1e293b; font-size: 14px;">
                            Judul Landing Page (Opsional):
                        </label>
                        <input type="text" name="page_title" placeholder="Contoh: Landing Page Tangerang (Kosongkan untuk deteksi otomatis dari &lt;title&gt;)" style="width: 100%; height: 42px; font-size: 14px; border-radius: 8px; border: 1px solid #cbd5e1; padding: 0 14px;">
                    </div>

                    <!-- File Upload Box -->
                    <div style="margin-bottom: 20px; padding: 24px; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; text-align: center;">
                        <input type="file" name="html_file" id="direct-html-file" accept=".html,.htm" style="display: none;" onchange="document.getElementById('file-chosen-name').textContent = this.files[0] ? this.files[0].name : '';">
                        <label for="direct-html-file" style="cursor: pointer; display: inline-block;">
                            <span class="dashicons dashicons-upload" style="font-size: 36px; width: 36px; height: 36px; color: #4f46e5; margin-bottom: 6px;"></span>
                            <div style="font-weight: 700; font-size: 15px; color: #1e293b;">Pilih atau Drop File HTML (.html)</div>
                            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Contoh: <code>index.html</code> dari landing page Anda</div>
                        </label>
                        <div id="file-chosen-name" style="margin-top: 10px; font-weight: 700; color: #16a34a; font-size: 13px;"></div>
                    </div>

                    <!-- Paste Code Box -->
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: #1e293b; font-size: 14px;">
                            Atau Paste Kode Lengkap HTML + &lt;style&gt; + &lt;script&gt;:
                        </label>
                        <textarea name="raw_code" rows="9" placeholder="<!DOCTYPE html><html>... Paste kode mentah Anda di sini..." style="width: 100%; font-family: monospace; font-size: 12px; border-radius: 8px; border: 1px solid #cbd5e1; padding: 12px;"></textarea>
                    </div>

                    <div style="display: flex; align-items: center; gap: 14px;">
                        <button type="submit" class="button button-primary" style="height: 44px; padding: 0 28px; font-size: 15px; font-weight: 700; background: #4f46e5; border-color: #4338ca; border-radius: 8px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
                            <span class="dashicons dashicons-upload" style="margin-top: 4px; margin-right: 4px;"></span> Import &amp; Buka Canvas Studio &rarr;
                        </button>
                        <a href="<?php echo esc_url(admin_url('admin.php?page=bongkar-builder')); ?>" style="color: #64748b; text-decoration: none; font-size: 14px;">Kembali</a>
                    </div>
                </form>
            </div>
        </div>
        <?php
    }

    /**
     * Render Create Page helper
     */
    public function render_create_page() {
        ?>
        <div class="wrap" style="max-width: 600px; margin-top: 40px;">
            <div style="background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                <h1 style="font-size: 22px; font-weight: 800; color: #1e293b; margin-top: 0; display: flex; align-items: center; gap: 8px;">
                    <span class="dashicons dashicons-welcome-add-page" style="color: #4f46e5; font-size: 26px; width: 26px; height: 26px;"></span>
                    Buat Kanvas Kosong Baru
                </h1>
                <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">
                    Mulai dari halaman kosong atau template section.
                </p>

                <form method="post" action="<?php echo esc_url(admin_url('admin.php?action=bongkar_create_landing_page')); ?>">
                    <?php wp_nonce_field('bongkar_create_landing_page_nonce'); ?>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #334155;">
                            Judul Halaman:
                        </label>
                        <input type="text" name="page_title" placeholder="Contoh: Landing Page Tangerang, Promo Ramadhan, dsb." required style="width: 100%; height: 42px; font-size: 15px; border-radius: 8px; border: 1px solid #cbd5e1; padding: 0 12px;">
                    </div>

                    <button type="submit" class="button button-primary" style="height: 42px; padding: 0 24px; font-size: 15px; font-weight: 600; background: #4f46e5; border-color: #4338ca; border-radius: 8px;">
                        Lanjut ke Canvas Studio &rarr;
                    </button>
                    <a href="<?php echo esc_url(admin_url('admin.php?page=bongkar-builder')); ?>" style="margin-left: 14px; color: #64748b; text-decoration: none; font-size: 14px;">Batal</a>
                </form>
            </div>
        </div>
        <?php
    }

    /**
     * Render Admin Dashboard / Page List
     */
    public function render_admin_dashboard() {
        // Query pages that have Bongkar Builder enabled
        $args = [
            'post_type'      => 'page',
            'posts_per_page' => 50,
            'post_status'    => ['publish', 'draft', 'pending'],
            'orderby'        => 'modified',
            'order'          => 'DESC',
        ];
        $pages = get_posts($args);
        ?>
        <div class="wrap" style="max-width: 1200px; margin-top: 25px;">
            <!-- Header -->
            <div style="margin-bottom: 25px;">
                <h1 style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 10px;">
                    <span style="background: linear-gradient(135deg, #4f46e5, #06b6d4); color: white; border-radius: 10px; width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; font-size: 20px;">
                        <span class="dashicons dashicons-art"></span>
                    </span>
                    Bongkar Canvas Builder
                </h1>
                <p style="color: #64748b; margin: 6px 0 0 0; font-size: 14px;">
                    Visual HTML-First Page Builder. Ringan, cepat, integrasi Google Fonts, Font Awesome 6, dan impor AI langsung.
                </p>
            </div>

            <!-- Two Action Cards: Direct Import vs Create New -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px; margin-bottom: 30px;">
                
                <!-- Card 1: Direct Import AI / HTML (Highlighted) -->
                <div style="background: #ffffff; border: 1px solid #c7d2fe; border-radius: 14px; padding: 24px; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.08); display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <span style="background: #e0e7ff; color: #4338ca; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                                Fitur Utama
                            </span>
                            <span class="dashicons dashicons-upload" style="color: #4f46e5; font-size: 22px;"></span>
                        </div>
                        <h3 style="font-size: 17px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0;">
                            Import Desain HTML / AI Langsung
                        </h3>
                        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 16px 0;">
                            Punya file <code>index.html</code> dari AI (Claude/v0/ChatGPT) atau Figma? Upload sekarang dan sistem langsung membukanya di editor canvas.
                        </p>
                    </div>
                    <form method="post" action="<?php echo esc_url(admin_url('admin.php?action=bongkar_direct_import')); ?>" enctype="multipart/form-data" style="display: flex; flex-direction: column; gap: 10px;">
                        <?php wp_nonce_field('bongkar_direct_import_nonce'); ?>
                        <div style="display: flex; gap: 8px;">
                            <input type="text" name="page_title" placeholder="Judul Halaman (Opsional)" style="flex: 1; height: 38px; font-size: 13px; border-radius: 6px; border: 1px solid #cbd5e1; padding: 0 10px; color: #1e293b;">
                            <label style="cursor: pointer; background: #eef2ff; border: 1px solid #c7d2fe; color: #4338ca; font-size: 12px; font-weight: 700; border-radius: 6px; padding: 0 12px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">
                                <span class="dashicons dashicons-paperclip" style="font-size: 16px; width: 16px; height: 16px;"></span> File .html
                                <input type="file" name="html_file" accept=".html,.htm" style="display: none;" onchange="this.parentElement.style.background='#dcfce7'; this.parentElement.style.color='#15803d'; this.parentElement.textContent='File: ' + this.files[0].name;">
                            </label>
                        </div>
                        <button type="submit" class="button button-primary" style="height: 38px; line-height: 36px; font-weight: 700; font-size: 13px; background: #4f46e5; border-color: #4338ca; border-radius: 6px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <span class="dashicons dashicons-bolt" style="font-size: 16px; width: 16px; height: 16px;"></span> Import & Langsung Edit Canvas &rarr;
                        </button>
                    </form>
                </div>

                <!-- Card 2: Create Empty Canvas -->
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <span style="background: #f1f5f9; color: #475569; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">
                                Kanvas Baru
                            </span>
                            <span class="dashicons dashicons-welcome-add-page" style="color: #64748b; font-size: 22px;"></span>
                        </div>
                        <h3 style="font-size: 17px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0;">
                            Buat Kanvas Kosong
                        </h3>
                        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 16px 0;">
                            Mulai halaman dari awal dan susun komponen visual siap pakai (Hero, Fitur, Testimoni, FAQ, Harga).
                        </p>
                    </div>
                    <form method="post" action="<?php echo esc_url(admin_url('admin.php?action=bongkar_create_landing_page')); ?>" style="display: flex; flex-direction: column; gap: 10px;">
                        <?php wp_nonce_field('bongkar_create_landing_page_nonce'); ?>
                        <div>
                            <input type="text" name="page_title" placeholder="Nama Halaman Baru..." required style="width: 100%; height: 38px; font-size: 13px; border-radius: 6px; border: 1px solid #cbd5e1; padding: 0 10px; color: #1e293b;">
                        </div>
                        <button type="submit" class="button button-secondary" style="height: 38px; line-height: 36px; font-weight: 700; font-size: 13px; border-radius: 6px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <span class="dashicons dashicons-plus-alt2" style="font-size: 16px; width: 16px; height: 16px;"></span> Buat Halaman &amp; Buka Studio &rarr;
                        </button>
                    </form>
                </div>

            </div>

            <!-- Page Cards Table -->
            <div style="background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow-x: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="padding: 16px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                    <strong style="font-size: 14px; color: #1e293b;">Daftar Landing Page &amp; Kanvas</strong>
                    <span style="font-size: 12px; font-weight: 600; color: #64748b;"><?php echo count($pages); ?> Halaman Ditemukan</span>
                </div>
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                    <thead>
                        <tr style="background: #ffffff; border-bottom: 1px solid #e2e8f0;">
                            <th style="padding: 14px 20px; font-size: 12px; font-weight: 700; color: #475569; white-space: nowrap; min-width: 240px;">Judul Halaman</th>
                            <th style="padding: 14px 16px; font-size: 12px; font-weight: 700; color: #475569; white-space: nowrap; width: 170px;">Status Canvas</th>
                            <th style="padding: 14px 16px; font-size: 12px; font-weight: 700; color: #475569; white-space: nowrap; width: 150px;">Terakhir Diubah</th>
                            <th style="padding: 14px 20px; font-size: 12px; font-weight: 700; color: #475569; white-space: nowrap; width: 260px; text-align: right;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($pages)): ?>
                            <tr>
                                <td colspan="4" style="text-align: center; padding: 48px 20px; color: #94a3b8; font-size: 14px;">
                                    Belum ada halaman. Gunakan kotak <strong>"Import Desain HTML / AI Langsung"</strong> di atas.
                                </td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($pages as $p): 
                                $is_active = get_post_meta($p->ID, '_bongkar_builder_enabled', true) === '1';
                                $editor_url = Bongkar_Builder_Core::get_editor_url($p->ID);
                                $view_url = get_permalink($p->ID);
                            ?>
                                <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.15s ease;">
                                    <td style="padding: 16px 20px; vertical-align: middle;">
                                        <a href="<?php echo esc_url($editor_url); ?>" style="font-size: 14px; font-weight: 700; color: #1e293b; text-decoration: none;">
                                            <?php echo esc_html($p->post_title); ?>
                                        </a>
                                        <div style="font-size: 11px; color: #94a3b8; margin-top: 3px; display: flex; align-items: center; gap: 8px;">
                                            <span>Slug: /<?php echo esc_html($p->post_name); ?></span>
                                            <span>&bull;</span>
                                            <span>ID: <?php echo esc_html($p->ID); ?></span>
                                        </div>
                                    </td>
                                    <td style="padding: 16px 16px; vertical-align: middle; white-space: nowrap;">
                                        <?php if ($is_active): ?>
                                            <span style="background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 5px;">
                                                <span style="width: 6px; height: 6px; border-radius: 50%; background: #22c55e;"></span>
                                                Bongkar Canvas Active
                                            </span>
                                        <?php else: ?>
                                            <span style="background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;">
                                                Standar WP
                                            </span>
                                        <?php endif; ?>
                                    </td>
                                    <td style="padding: 16px 16px; vertical-align: middle; color: #64748b; font-size: 12px; white-space: nowrap;">
                                        <?php echo esc_html(get_the_modified_date('d M Y, H:i', $p->ID)); ?>
                                    </td>
                                    <td style="padding: 16px 20px; vertical-align: middle; text-align: right; white-space: nowrap;">
                                        <div style="display: inline-flex; align-items: center; gap: 6px; justify-content: flex-end;">
                                            <a href="<?php echo esc_url($editor_url); ?>" class="button button-primary" style="background: #4f46e5; border-color: #4338ca; font-weight: 600; border-radius: 6px; padding: 0 12px; height: 30px; line-height: 28px; font-size: 12px; display: inline-flex; align-items: center; gap: 4px;">
                                                <span class="dashicons dashicons-art" style="font-size: 13px; width: 13px; height: 13px;"></span>
                                                Edit Canvas
                                            </a>
                                            <?php if ($is_active): 
                                                $export_url = wp_nonce_url(admin_url('admin.php?action=bongkar_export_html&post_id=' . $p->ID), 'bongkar_export_' . $p->ID);
                                            ?>
                                                <a href="<?php echo esc_url($export_url); ?>" class="button" title="<?php esc_attr_e('Download file HTML mandiri', 'bongkar-builder'); ?>" style="border-radius: 6px; height: 30px; line-height: 28px; font-size: 12px; color: #4338ca; border-color: #c7d2fe; display: inline-flex; align-items: center; gap: 4px;">
                                                    <span class="dashicons dashicons-download" style="font-size: 13px; width: 13px; height: 13px;"></span>
                                                    Export HTML
                                                </a>
                                            <?php endif; ?>
                                            <a href="<?php echo esc_url($view_url); ?>" target="_blank" class="button" style="border-radius: 6px; height: 30px; line-height: 28px; font-size: 12px; display: inline-flex; align-items: center; gap: 2px;">
                                                Lihat Live &nearr;
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
        <?php
    }
}

} // End if !class_exists('Bongkar_Builder_Admin')
