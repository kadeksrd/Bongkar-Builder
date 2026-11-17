<?php
/**
 * Header & Footer Template Manager for Bongkar Builder
 * Elementor-style Theme Builder for standalone Headers & Footers with Display Conditions
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('Bongkar_Builder_Templates')) {

class Bongkar_Builder_Templates {

    private static $instance = null;
    const POST_TYPE = 'bongkar_template';

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('init', [$this, 'register_template_post_type']);
        add_action('init', [$this, 'handle_legacy_url_fallback']);
        add_action('admin_action_bongkar_create_template', [$this, 'handle_create_template']);
        add_action('admin_action_bongkar_import_template', [$this, 'handle_import_template']);
        add_action('admin_action_bongkar_save_template_settings', [$this, 'handle_save_template_settings']);
        add_action('admin_action_bongkar_delete_template', [$this, 'handle_delete_template']);
        add_action('admin_action_bongkar_update_template_condition', [$this, 'handle_update_template_condition']);
        add_filter('bongkar_builder_supported_screens', [$this, 'add_supported_screen']);
    }

    /**
     * Fallback redirect for direct /wp-admin/bongkar-builder-templates URLs
     */
    public function handle_legacy_url_fallback() {
        if (isset($_SERVER['REQUEST_URI']) && strpos($_SERVER['REQUEST_URI'], 'bongkar-builder-templates') !== false) {
            if (!isset($_GET['page']) || $_GET['page'] !== 'bongkar-builder-templates') {
                wp_safe_redirect(admin_url('admin.php?page=bongkar-builder-templates'));
                exit;
            }
        }
    }

    /**
     * Add template post type to Bongkar Builder supported screens
     */
    public function add_supported_screen($screens) {
        $screens[] = self::POST_TYPE;
        return $screens;
    }

    /**
     * Register Custom Post Type for Header & Footer templates
     */
    public function register_template_post_type() {
        $labels = [
            'name'               => __('Header & Footer', 'bongkar-builder'),
            'singular_name'      => __('Template Bongkar', 'bongkar-builder'),
            'menu_name'          => __('Header & Footer', 'bongkar-builder'),
            'add_new'            => __('Tambah Template Baru', 'bongkar-builder'),
            'add_new_item'       => __('Tambah Template Baru', 'bongkar-builder'),
            'edit_item'          => __('Edit Template', 'bongkar-builder'),
            'new_item'           => __('Template Baru', 'bongkar-builder'),
            'view_item'          => __('Lihat Template', 'bongkar-builder'),
            'search_items'       => __('Cari Template', 'bongkar-builder'),
            'not_found'          => __('Tidak ada template ditemukan', 'bongkar-builder'),
            'not_found_in_trash' => __('Tidak ada template di kotak sampah', 'bongkar-builder')
        ];

        $args = [
            'labels'              => $labels,
            'public'              => false,
            'show_ui'             => true,
            'show_in_menu'        => false, // Handled via Bongkar Builder menu
            'publicly_queryable'  => false,
            'exclude_from_search' => true,
            'hierarchical'        => false,
            'supports'            => ['title'],
            'capability_type'     => 'page',
            'show_in_rest'        => true
        ];

        register_post_type(self::POST_TYPE, $args);

        // Register Meta Fields
        $meta_fields = [
            '_bongkar_template_type'      => 'string',  // 'header' or 'footer'
            '_bongkar_template_menu_id'   => 'integer', // Selected WP Menu ID
            '_bongkar_display_condition'  => 'string',  // 'entire_site', 'front_page', 'all_pages', 'all_posts', 'manual'
            '_bongkar_is_global'          => 'string',  // '1' = default global
            '_bongkar_template_sticky'    => 'string',  // '1' = sticky header
        ];

        foreach ($meta_fields as $meta_key => $type) {
            register_post_meta(self::POST_TYPE, $meta_key, [
                'show_in_rest'  => true,
                'single'        => true,
                'type'          => $type,
                'auth_callback' => function() {
                    return current_user_can('edit_pages');
                }
            ]);
        }
    }

    /**
     * Supported Display Conditions (Elementor-Style Theme Builder)
     */
    public static function get_condition_options() {
        return [
            'entire_site' => __('Seluruh Website (Entire Site)', 'bongkar-builder'),
            'front_page'  => __('Halaman Beranda (Front Page)', 'bongkar-builder'),
            'all_pages'   => __('Semua Halaman (All Pages)', 'bongkar-builder'),
            'all_posts'   => __('Semua Post / Artikel (All Posts)', 'bongkar-builder'),
            'manual'      => __('Manual (Dipilih di Pengaturan Halaman)', 'bongkar-builder'),
        ];
    }

    /**
     * Get all templates by type ('header' or 'footer')
     */
    public static function get_templates($type = 'header') {
        $query = new WP_Query([
            'post_type'      => self::POST_TYPE,
            'post_status'    => 'publish',
            'posts_per_page' => -1,
            'meta_query'     => [
                [
                    'key'   => '_bongkar_template_type',
                    'value' => $type
                ]
            ],
            'orderby'        => 'title',
            'order'          => 'ASC'
        ]);

        return $query->posts;
    }

    /**
     * Resolve active template for current viewing context (Elementor-Style Target Access)
     */
    public static function get_template_for_context($type = 'header') {
        $matched_id = 0;

        // 1. Front page check
        if (is_front_page() || is_home()) {
            $matched_id = self::query_template_by_condition($type, 'front_page');
        }

        // 2. Single Post check
        if (!$matched_id && is_singular('post')) {
            $matched_id = self::query_template_by_condition($type, 'all_posts');
        }

        // 3. Single Page check
        if (!$matched_id && is_page()) {
            $matched_id = self::query_template_by_condition($type, 'all_pages');
        }

        // 4. Fallback to Entire Site condition
        if (!$matched_id) {
            $matched_id = self::query_template_by_condition($type, 'entire_site');
        }

        // 5. Fallback to Global Template ID
        if (!$matched_id) {
            $matched_id = self::get_global_template_id($type);
        }

        return absint($matched_id);
    }

    /**
     * Query template by type and display condition
     */
    public static function query_template_by_condition($type, $condition) {
        $query = new WP_Query([
            'post_type'      => self::POST_TYPE,
            'post_status'    => 'publish',
            'posts_per_page' => 1,
            'meta_query'     => [
                [
                    'key'   => '_bongkar_template_type',
                    'value' => $type
                ],
                [
                    'key'   => '_bongkar_display_condition',
                    'value' => $condition
                ]
            ],
            'orderby'        => 'ID',
            'order'          => 'DESC'
        ]);

        if (!empty($query->posts)) {
            return $query->posts[0]->ID;
        }

        return 0;
    }

    /**
     * Get Global Template ID for a type ('header' or 'footer')
     */
    public static function get_global_template_id($type = 'header') {
        $global_option_key = 'bongkar_global_' . $type . '_id';
        $global_id = get_option($global_option_key, 0);

        if ($global_id && get_post_status($global_id) === 'publish') {
            return absint($global_id);
        }

        // Fallback: look for post meta _bongkar_is_global = '1'
        $query = new WP_Query([
            'post_type'      => self::POST_TYPE,
            'post_status'    => 'publish',
            'posts_per_page' => 1,
            'meta_query'     => [
                [
                    'key'   => '_bongkar_template_type',
                    'value' => $type
                ],
                [
                    'key'   => '_bongkar_is_global',
                    'value' => '1'
                ]
            ]
        ]);

        if (!empty($query->posts)) {
            update_option($global_option_key, $query->posts[0]->ID);
            return $query->posts[0]->ID;
        }

        return 0;
    }

    /**
     * Set Global Template ID
     */
    public static function set_global_template_id($type, $template_id) {
        $global_option_key = 'bongkar_global_' . $type . '_id';
        update_option($global_option_key, absint($template_id));

        // Sync post meta
        $templates = self::get_templates($type);
        foreach ($templates as $tmpl) {
            if ($tmpl->ID === absint($template_id)) {
                update_post_meta($tmpl->ID, '_bongkar_is_global', '1');
            } else {
                update_post_meta($tmpl->ID, '_bongkar_is_global', '0');
            }
        }
    }

    /**
     * Handle Template Creation from Admin Page
     */
    public function handle_create_template() {
        check_admin_referer('bongkar_create_template_nonce');

        if (!current_user_can('edit_pages')) {
            wp_die(__('Unauthorized access.', 'bongkar-builder'));
        }

        $title = isset($_POST['template_title']) && !empty(trim($_POST['template_title']))
            ? sanitize_text_field($_POST['template_title'])
            : __('Template Baru', 'bongkar-builder');

        $type = isset($_POST['template_type']) && in_array($_POST['template_type'], ['header', 'footer'], true)
            ? $_POST['template_type']
            : 'header';

        $display_condition = isset($_POST['display_condition']) && array_key_exists($_POST['display_condition'], self::get_condition_options())
            ? sanitize_text_field($_POST['display_condition'])
            : 'entire_site';

        $is_global = (isset($_POST['is_global']) && $_POST['is_global'] === '1') || $display_condition === 'entire_site' ? '1' : '0';
        $menu_id = isset($_POST['template_menu_id']) ? absint($_POST['template_menu_id']) : 0;
        $html_preset = isset($_POST['html_preset']) ? wp_unslash($_POST['html_preset']) : '';
        $css_preset = isset($_POST['css_preset']) ? wp_unslash($_POST['css_preset']) : '';

        // Default skeleton if empty
        if (empty(trim($html_preset))) {
            if ($type === 'header') {
                $html_preset = self::get_default_header_html();
                $css_preset  = self::get_default_header_css();
            } else {
                $html_preset = self::get_default_footer_html();
                $css_preset  = self::get_default_footer_css();
            }
        }

        $post_id = wp_insert_post([
            'post_title'   => $title,
            'post_type'    => self::POST_TYPE,
            'post_status'  => 'publish',
            'post_author'  => get_current_user_id()
        ]);

        if (is_wp_error($post_id)) {
            wp_die($post_id->get_error_message());
        }

        // Set Metadata
        update_post_meta($post_id, '_bongkar_template_type', $type);
        update_post_meta($post_id, '_bongkar_template_menu_id', $menu_id);
        update_post_meta($post_id, '_bongkar_display_condition', $display_condition);
        update_post_meta($post_id, '_bongkar_is_global', $is_global);
        update_post_meta($post_id, '_bongkar_builder_enabled', '1');
        update_post_meta($post_id, '_bongkar_canvas_html', $html_preset);
        update_post_meta($post_id, '_bongkar_canvas_css', $css_preset);
        update_post_meta($post_id, '_bongkar_has_draft', '0');

        if ($is_global === '1' || $display_condition === 'entire_site') {
            self::set_global_template_id($type, $post_id);
        }

        // Redirect directly to Bongkar Studio Editor
        $editor_url = Bongkar_Builder_Core::get_editor_url($post_id);
        wp_safe_redirect($editor_url);
        exit;
    }

    /**
     * Handle Direct HTML Template Import from Dashboard (Outside Studio)
     */
    public function handle_import_template() {
        check_admin_referer('bongkar_import_template_nonce');

        if (!current_user_can('edit_pages')) {
            wp_die(__('Unauthorized access.', 'bongkar-builder'));
        }

        $title = isset($_POST['template_title']) && !empty(trim($_POST['template_title']))
            ? sanitize_text_field($_POST['template_title'])
            : __('Template Import', 'bongkar-builder');

        $type = isset($_POST['template_type']) && in_array($_POST['template_type'], ['header', 'footer'], true)
            ? $_POST['template_type']
            : 'header';

        $display_condition = isset($_POST['display_condition']) && array_key_exists($_POST['display_condition'], self::get_condition_options())
            ? sanitize_text_field($_POST['display_condition'])
            : 'entire_site';

        $is_global = (isset($_POST['is_global']) && $_POST['is_global'] === '1') || $display_condition === 'entire_site' ? '1' : '0';
        $menu_id = isset($_POST['template_menu_id']) ? absint($_POST['template_menu_id']) : 0;

        // Retrieve raw HTML from file upload OR textarea
        $raw_html = '';
        if (!empty($_FILES['import_file']['tmp_name']) && is_uploaded_file($_FILES['import_file']['tmp_name'])) {
            $raw_html = file_get_contents($_FILES['import_file']['tmp_name']);
        } elseif (!empty($_POST['raw_html_code'])) {
            $raw_html = wp_unslash($_POST['raw_html_code']);
        }

        if (empty(trim($raw_html))) {
            if ($type === 'header') {
                $raw_html = self::get_default_header_html();
            } else {
                $raw_html = self::get_default_footer_html();
            }
        }

        // Parse with Bongkar_Builder_Ajax
        $parsed = class_exists('Bongkar_Builder_Ajax') ? Bongkar_Builder_Ajax::parse_html_payload($raw_html, $type) : [
            'html' => $raw_html,
            'css' => '',
            'js' => '',
            'external_scripts' => [],
            'external_styles' => [],
            'google_fonts' => [],
            'header_html' => '',
            'footer_html' => ''
        ];

        // Isolate content based on template type
        if ($type === 'header') {
            $extracted_html = !empty($parsed['header_html']) ? $parsed['header_html'] : $parsed['html'];
            $css_content = !empty($parsed['css']) ? $parsed['css'] : self::get_default_header_css();
        } else {
            $extracted_html = !empty($parsed['footer_html']) ? $parsed['footer_html'] : $parsed['html'];
            $css_content = !empty($parsed['css']) ? $parsed['css'] : self::get_default_footer_css();
        }

        $post_id = wp_insert_post([
            'post_title'   => $title,
            'post_type'    => self::POST_TYPE,
            'post_status'  => 'publish',
            'post_author'  => get_current_user_id()
        ]);

        if (is_wp_error($post_id)) {
            wp_die($post_id->get_error_message());
        }

        // Set Metadata
        update_post_meta($post_id, '_bongkar_template_type', $type);
        update_post_meta($post_id, '_bongkar_template_menu_id', $menu_id);
        update_post_meta($post_id, '_bongkar_display_condition', $display_condition);
        update_post_meta($post_id, '_bongkar_is_global', $is_global);
        update_post_meta($post_id, '_bongkar_builder_enabled', '1');
        update_post_meta($post_id, '_bongkar_canvas_html', $extracted_html);
        update_post_meta($post_id, '_bongkar_canvas_css', $css_content);
        update_post_meta($post_id, '_bongkar_canvas_js', $parsed['js']);
        update_post_meta($post_id, '_bongkar_external_scripts', wp_json_encode($parsed['external_scripts']));
        update_post_meta($post_id, '_bongkar_external_styles', wp_json_encode($parsed['external_styles']));
        update_post_meta($post_id, '_bongkar_google_fonts', wp_json_encode($parsed['google_fonts']));
        update_post_meta($post_id, '_bongkar_has_draft', '0');

        if ($is_global === '1' || $display_condition === 'entire_site') {
            self::set_global_template_id($type, $post_id);
        }

        // Redirect directly to Bongkar Studio Editor
        $editor_url = Bongkar_Builder_Core::get_editor_url($post_id);
        wp_safe_redirect($editor_url);
        exit;
    }

    /**
     * Handle Settings Save (Global templates)
     */
    public function handle_save_template_settings() {
        check_admin_referer('bongkar_save_template_settings_nonce');

        if (!current_user_can('edit_pages')) {
            wp_die(__('Unauthorized access.', 'bongkar-builder'));
        }

        $global_header = isset($_POST['global_header_id']) ? absint($_POST['global_header_id']) : 0;
        $global_footer = isset($_POST['global_footer_id']) ? absint($_POST['global_footer_id']) : 0;

        self::set_global_template_id('header', $global_header);
        self::set_global_template_id('footer', $global_footer);

        wp_safe_redirect(admin_url('admin.php?page=bongkar-builder-templates&updated=1'));
        exit;
    }

    /**
     * Handle Quick Update for Template Condition & Menu
     */
    public function handle_update_template_condition() {
        check_admin_referer('bongkar_update_template_condition_nonce');

        if (!current_user_can('edit_pages')) {
            wp_die(__('Unauthorized access.', 'bongkar-builder'));
        }

        $template_id = isset($_POST['template_id']) ? absint($_POST['template_id']) : 0;
        if ($template_id) {
            if (isset($_POST['display_condition'])) {
                $cond = sanitize_text_field($_POST['display_condition']);
                if (array_key_exists($cond, self::get_condition_options())) {
                    update_post_meta($template_id, '_bongkar_display_condition', $cond);
                    $type = get_post_meta($template_id, '_bongkar_template_type', true);
                    if ($cond === 'entire_site') {
                        self::set_global_template_id($type, $template_id);
                    }
                }
            }
            if (isset($_POST['template_menu_id'])) {
                update_post_meta($template_id, '_bongkar_template_menu_id', absint($_POST['template_menu_id']));
            }
        }

        wp_safe_redirect(admin_url('admin.php?page=bongkar-builder-templates&updated=1'));
        exit;
    }

    /**
     * Handle Template Deletion
     */
    public function handle_delete_template() {
        $template_id = isset($_GET['template_id']) ? absint($_GET['template_id']) : 0;
        check_admin_referer('bongkar_delete_template_' . $template_id);

        if (!current_user_can('edit_pages')) {
            wp_die(__('Unauthorized access.', 'bongkar-builder'));
        }

        if ($template_id) {
            $type = get_post_meta($template_id, '_bongkar_template_type', true);
            $global_id = self::get_global_template_id($type);
            if ($global_id === $template_id) {
                update_option('bongkar_global_' . $type . '_id', 0);
            }
            wp_delete_post($template_id, true);
        }

        wp_safe_redirect(admin_url('admin.php?page=bongkar-builder-templates&deleted=1'));
        exit;
    }

    /**
     * Render the Header & Footer Management Screen
     */
    public function render_templates_admin_page() {
        $current_tab = isset($_GET['tab']) && in_array($_GET['tab'], ['footers', 'create'], true) ? $_GET['tab'] : 'headers';
        $headers = self::get_templates('header');
        $footers = self::get_templates('footer');
        $global_header_id = self::get_global_template_id('header');
        $global_footer_id = self::get_global_template_id('footer');
        $wp_menus = wp_get_nav_menus();
        $condition_options = self::get_condition_options();
        ?>
        <div class="wrap bongkar-admin-wrap" style="max-width: 1200px; margin-top: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            
            <!-- Page Title & Header Actions -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; display: flex; align-items: center; gap: 10px;">
                        <span class="dashicons dashicons-layout" style="font-size: 26px; width: 26px; height: 26px; color: #4f46e5;"></span>
                        Header &amp; Footer Builder
                    </h1>
                    <p style="margin: 0; color: #64748b; font-size: 13px;">
                        Bangun header &amp; footer kustom responsif (kompatibel ke semua tema WordPress) dengan Display Conditions &amp; Menu dinamis.
                    </p>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <a href="#modal-import-template" class="button button-primary" id="btn-open-import-modal" style="background: #10b981; border-color: #059669; height: 38px; line-height: 36px; padding: 0 16px; font-weight: 600; font-size: 13px; color: #ffffff;">
                        <span class="dashicons dashicons-upload" style="margin-top: 8px; margin-right: 4px;"></span>
                        Import HTML Langsung
                    </a>
                    <a href="#modal-create-template" class="button button-secondary" id="btn-open-create-modal" style="height: 38px; line-height: 36px; padding: 0 16px; font-weight: 600; font-size: 13px;">
                        <span class="dashicons dashicons-plus-alt2" style="margin-top: 8px; margin-right: 4px;"></span>
                        Buat Template Baru
                    </a>
                </div>
            </div>

            <?php if (isset($_GET['updated'])): ?>
                <div class="notice notice-success is-dismissible" style="border-left-color: #10b981;">
                    <p style="font-weight: 600; color: #065f46;">Pengaturan Header &amp; Footer berhasil diperbarui.</p>
                </div>
            <?php endif; ?>

            <?php if (isset($_GET['deleted'])): ?>
                <div class="notice notice-warning is-dismissible" style="border-left-color: #f59e0b;">
                    <p style="font-weight: 600; color: #92400e;">Template telah berhasil dihapus.</p>
                </div>
            <?php endif; ?>

            <!-- Global Assignments Bar -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                    <span class="dashicons dashicons-admin-settings" style="font-size: 20px; width: 20px; height: 20px; color: #4f46e5;"></span>
                    <h2 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0;">
                        Status Global Default (Layout "Header &amp; Footer")
                    </h2>
                </div>
                <p style="font-size: 12px; color: #64748b; margin: 0 0 16px 0;">
                    Pilih template header dan footer default yang akan tampil otomatis di seluruh halaman website.
                </p>
                <form method="POST" action="<?php echo esc_url(admin_url('admin.php')); ?>" style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end;">
                    <input type="hidden" name="action" value="bongkar_save_template_settings">
                    <?php wp_nonce_field('bongkar_save_template_settings_nonce'); ?>

                    <div style="flex: 1; min-width: 260px;">
                        <label style="display: block; font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 6px;">
                            Global Header Default:
                        </label>
                        <select name="global_header_id" style="width: 100%; height: 38px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 13px; color: #1e293b;">
                            <option value="0">-- Berdasarkan Display Conditions / Pilih Manual --</option>
                            <?php foreach ($headers as $h): ?>
                                <option value="<?php echo esc_attr($h->ID); ?>" <?php selected($global_header_id, $h->ID); ?>>
                                    <?php echo esc_html($h->post_title); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div style="flex: 1; min-width: 260px;">
                        <label style="display: block; font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 6px;">
                            Global Footer Default:
                        </label>
                        <select name="global_footer_id" style="width: 100%; height: 38px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 13px; color: #1e293b;">
                            <option value="0">-- Berdasarkan Display Conditions / Pilih Manual --</option>
                            <?php foreach ($footers as $f): ?>
                                <option value="<?php echo esc_attr($f->ID); ?>" <?php selected($global_footer_id, $f->ID); ?>>
                                    <?php echo esc_html($f->post_title); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div>
                        <button type="submit" class="button button-primary" style="height: 38px; line-height: 36px; padding: 0 18px; font-weight: 600; font-size: 13px; background: #4f46e5; border-color: #4338ca; border-radius: 6px; color: #ffffff;">
                            Simpan Default Global
                        </button>
                    </div>
                </form>
            </div>

            <!-- Tab Navigation -->
            <div style="border-bottom: 1px solid #e2e8f0; margin-bottom: 20px; display: flex; gap: 12px;">
                <a href="<?php echo esc_url(admin_url('admin.php?page=bongkar-builder-templates&tab=headers')); ?>" 
                   style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 18px; text-decoration: none; font-weight: 700; font-size: 14px; border-bottom: 3px solid <?php echo $current_tab === 'headers' ? '#4f46e5' : 'transparent'; ?>; color: <?php echo $current_tab === 'headers' ? '#4f46e5' : '#64748b'; ?>;">
                    <span class="dashicons dashicons-arrow-up-alt2" style="font-size: 16px; line-height: 1.4;"></span>
                    Header Templates
                    <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; background: <?php echo $current_tab === 'headers' ? '#e0e7ff; color: #4338ca;' : '#f1f5f9; color: #64748b;'; ?>">
                        <?php echo count($headers); ?>
                    </span>
                </a>
                <a href="<?php echo esc_url(admin_url('admin.php?page=bongkar-builder-templates&tab=footers')); ?>" 
                   style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 18px; text-decoration: none; font-weight: 700; font-size: 14px; border-bottom: 3px solid <?php echo $current_tab === 'footers' ? '#4f46e5' : 'transparent'; ?>; color: <?php echo $current_tab === 'footers' ? '#4f46e5' : '#64748b'; ?>;">
                    <span class="dashicons dashicons-arrow-down-alt2" style="font-size: 16px; line-height: 1.4;"></span>
                    Footer Templates
                    <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; background: <?php echo $current_tab === 'footers' ? '#e0e7ff; color: #4338ca;' : '#f1f5f9; color: #64748b;'; ?>">
                        <?php echo count($footers); ?>
                    </span>
                </a>
            </div>

            <!-- Templates List -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow-x: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                    <thead>
                        <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                            <th style="padding: 14px 20px; font-weight: 700; color: #334155; white-space: nowrap; min-width: 220px;">Nama Template</th>
                            <th style="padding: 14px 16px; font-weight: 700; color: #334155; white-space: nowrap; width: 90px;">Tipe</th>
                            <th style="padding: 14px 16px; font-weight: 700; color: #334155; white-space: nowrap; width: 220px;">Kondisi Tampilan (Display Conditions)</th>
                            <th style="padding: 14px 16px; font-weight: 700; color: #334155; white-space: nowrap; width: 170px;">Menu WP Terhubung</th>
                            <th style="padding: 14px 16px; font-weight: 700; color: #334155; white-space: nowrap; width: 130px;">Status Global</th>
                            <th style="padding: 14px 20px; font-weight: 700; color: #334155; white-space: nowrap; width: 180px; text-align: right;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php 
                        $items = ($current_tab === 'footers') ? $footers : $headers;
                        if (empty($items)): 
                        ?>
                            <tr>
                                <td colspan="6" style="padding: 48px 20px; text-align: center; color: #94a3b8; font-size: 14px;">
                                    Belum ada template <?php echo $current_tab === 'footers' ? 'Footer' : 'Header'; ?> yang dibuat. Klik tombol <strong>"Import HTML Langsung"</strong> atau <strong>"Buat Template Baru"</strong> di atas.
                                </td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($items as $item): 
                                $type = get_post_meta($item->ID, '_bongkar_template_type', true);
                                $menu_id = get_post_meta($item->ID, '_bongkar_template_menu_id', true);
                                $condition = get_post_meta($item->ID, '_bongkar_display_condition', true) ?: 'entire_site';
                                $is_item_global = ($type === 'header' && $global_header_id === $item->ID) || ($type === 'footer' && $global_footer_id === $item->ID) || $condition === 'entire_site';
                                $editor_url = Bongkar_Builder_Core::get_editor_url($item->ID);
                                $del_nonce_url = wp_nonce_url(admin_url('admin.php?action=bongkar_delete_template&template_id=' . $item->ID), 'bongkar_delete_template_' . $item->ID);

                                // Condition Badge Styling
                                $badge_style = 'background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd;';
                                $badge_icon  = 'dashicons-admin-site';
                                if ($condition === 'front_page') {
                                    $badge_style = 'background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;';
                                    $badge_icon  = 'dashicons-admin-home';
                                } elseif ($condition === 'all_pages') {
                                    $badge_style = 'background: #ede9fe; color: #6d28d9; border: 1px solid #ddd6fe;';
                                    $badge_icon  = 'dashicons-admin-page';
                                } elseif ($condition === 'all_posts') {
                                    $badge_style = 'background: #fef3c7; color: #92400e; border: 1px solid #fde68a;';
                                    $badge_icon  = 'dashicons-admin-post';
                                } elseif ($condition === 'manual') {
                                    $badge_style = 'background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;';
                                    $badge_icon  = 'dashicons-admin-generic';
                                }
                                $cond_text = isset($condition_options[$condition]) ? $condition_options[$condition] : $condition_options['entire_site'];
                            ?>
                                <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.15s ease;">
                                    <td style="padding: 16px 20px; font-weight: 600; color: #1e293b;">
                                        <a href="<?php echo esc_url($editor_url); ?>" style="color: #4f46e5; text-decoration: none; font-size: 14px; font-weight: 700; display: inline-block;">
                                            <?php echo esc_html($item->post_title); ?>
                                        </a>
                                        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px; display: flex; align-items: center; gap: 8px;">
                                            <span>ID: <?php echo esc_html($item->ID); ?></span>
                                            <span>&bull;</span>
                                            <span>Dibuat: <?php echo get_the_date('d M Y, H:i', $item->ID); ?></span>
                                        </div>
                                    </td>
                                    <td style="padding: 16px 16px; white-space: nowrap;">
                                        <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: <?php echo $type === 'header' ? '#e0e7ff; color: #4338ca;' : '#fef3c7; color: #92400e;'; ?>">
                                            <?php echo esc_html($type); ?>
                                        </span>
                                    </td>
                                    <td style="padding: 16px 16px; white-space: nowrap;">
                                        <span style="display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; <?php echo $badge_style; ?>">
                                            <span class="dashicons <?php echo $badge_icon; ?>" style="font-size: 14px; width: 14px; height: 14px;"></span>
                                            <?php echo esc_html($cond_text); ?>
                                        </span>
                                    </td>
                                    <td style="padding: 16px 16px; color: #475569; font-size: 13px; white-space: nowrap;">
                                        <?php 
                                        if ($menu_id) {
                                            $term = get_term($menu_id, 'nav_menu');
                                            echo $term && !is_wp_error($term) ? esc_html($term->name) : '<span style="color:#94a3b8;">Menu tidak valid</span>';
                                        } else {
                                            echo '<span style="color:#94a3b8;">-- Tanpa Menu WP --</span>';
                                        }
                                        ?>
                                    </td>
                                    <td style="padding: 16px 16px; white-space: nowrap;">
                                        <?php if ($is_item_global): ?>
                                            <span style="display: inline-flex; align-items: center; gap: 4px; color: #16a34a; font-weight: 700; font-size: 12px;">
                                                <span class="dashicons dashicons-yes-alt" style="font-size: 16px; width: 16px; height: 16px;"></span>
                                                Global Default
                                            </span>
                                        <?php else: ?>
                                            <span style="color: #94a3b8; font-size: 12px; font-weight: 500;">Spesifik Target</span>
                                        <?php endif; ?>
                                    </td>
                                    <td style="padding: 16px 20px; text-align: right; white-space: nowrap;">
                                        <div style="display: inline-flex; align-items: center; gap: 6px; justify-content: flex-end;">
                                            <a href="<?php echo esc_url($editor_url); ?>" class="button button-small button-primary" style="background: #4f46e5; border-color: #4338ca; font-weight: 600; border-radius: 6px; padding: 0 10px; height: 30px; line-height: 28px; display: inline-flex; align-items: center; gap: 4px;">
                                                <span class="dashicons dashicons-art" style="font-size: 13px; width: 13px; height: 13px;"></span>
                                                Buka Studio
                                            </a>
                                            <a href="<?php echo esc_url($del_nonce_url); ?>" class="button button-small" style="color: #dc2626; border-color: #fca5a5; border-radius: 6px; height: 30px; line-height: 28px; padding: 0 10px;" onclick="return confirm('Yakin ingin menghapus template ini?');">
                                                Hapus
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>

            <!-- Modal: Import HTML Langsung (Outside Studio) -->
            <div id="modal-import-template" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); z-index: 99999; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
                <div style="background: #ffffff; border-radius: 12px; width: 100%; max-width: 600px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    <div style="padding: 18px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
                        <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                            <span class="dashicons dashicons-upload" style="color: #10b981;"></span>
                            Import HTML Header / Footer Langsung
                        </h3>
                        <button type="button" id="btn-close-import-modal" style="background: none; border: none; font-size: 20px; line-height: 1; color: #94a3b8; cursor: pointer;">&times;</button>
                    </div>

                    <form method="POST" action="<?php echo esc_url(admin_url('admin.php')); ?>" enctype="multipart/form-data" style="padding: 24px; overflow-y: auto;">
                        <input type="hidden" name="action" value="bongkar_import_template">
                        <?php wp_nonce_field('bongkar_import_template_nonce'); ?>

                        <div style="margin-bottom: 16px;">
                            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">
                                Judul Template:
                            </label>
                            <input type="text" name="template_title" required placeholder="Contoh: Main Navbar Modern 2026, Footer Global" style="width: 100%; height: 38px; border-radius: 6px; border: 1px solid #cbd5e1; padding: 0 12px; font-size: 13px;">
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
                            <div>
                                <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">
                                    Tipe Template:
                                </label>
                                <select name="template_type" id="import-template-type-select" style="width: 100%; height: 38px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 13px;">
                                    <option value="header" <?php selected($current_tab, 'headers'); ?>>Header (Bagian Atas)</option>
                                    <option value="footer" <?php selected($current_tab, 'footers'); ?>>Footer (Bagian Bawah)</option>
                                </select>
                            </div>
                            <div>
                                <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">
                                    Hubungkan Menu WP:
                                </label>
                                <select name="template_menu_id" style="width: 100%; height: 38px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 13px;">
                                    <option value="0">-- Tanpa Menu WP --</option>
                                    <?php foreach ($wp_menus as $menu_obj): ?>
                                        <option value="<?php echo esc_attr($menu_obj->term_id); ?>">
                                            <?php echo esc_html($menu_obj->name); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                        </div>

                        <div style="margin-bottom: 16px;">
                            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">
                                Kondisi Tampilan (Display Conditions / Target Akses):
                            </label>
                            <select name="display_condition" style="width: 100%; height: 38px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 13px;">
                                <?php foreach ($condition_options as $cond_key => $cond_label): ?>
                                    <option value="<?php echo esc_attr($cond_key); ?>" <?php selected($cond_key, 'entire_site'); ?>>
                                        <?php echo esc_html($cond_label); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                                Mirip Elementor Theme Builder: Template otomatis aktif pada target halaman atau artikel yang Anda tentukan.
                            </div>
                        </div>

                        <div style="margin-bottom: 16px;">
                            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">
                                Upload File .html ATAU Paste Kode:
                            </label>
                            <input type="file" name="import_file" accept=".html,.htm,.txt" style="display: block; width: 100%; font-size: 12px; margin-bottom: 8px;">
                            <textarea name="raw_html_code" rows="7" placeholder="Paste kode HTML (lengkap beserta &lt;style&gt; atau &lt;header&gt;/&lt;footer&gt;) di sini..." style="width: 100%; border-radius: 6px; border: 1px solid #cbd5e1; padding: 10px; font-family: monospace; font-size: 12px; line-height: 1.4; resize: vertical;"></textarea>
                            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                                Sistem akan otomatis mengisolasi bagian header / footer secara presisi, mengekstrak CSS, font Google, dan script eksternal.
                            </div>
                        </div>

                        <div style="margin-bottom: 20px; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
                            <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #1e293b; cursor: pointer;">
                                <input type="checkbox" name="is_global" value="1" checked style="width: 16px; height: 16px;">
                                Jadikan Default Global untuk Seluruh Situs
                            </label>
                        </div>

                        <div style="display: flex; justify-content: flex-end; gap: 10px;">
                            <button type="button" id="btn-cancel-import-modal" class="button" style="height: 38px; padding: 0 16px;">
                                Batal
                            </button>
                            <button type="submit" class="button button-primary" style="background: #10b981; border-color: #059669; height: 38px; padding: 0 20px; font-weight: 600; color: #ffffff;">
                                Import &amp; Buka di Studio &rarr;
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Modal: Buat Template Baru -->
            <div id="modal-create-template" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); z-index: 99999; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
                <div style="background: #ffffff; border-radius: 12px; width: 100%; max-width: 540px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    <div style="padding: 18px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
                        <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #0f172a;">
                            Buat Template Header / Footer Baru
                        </h3>
                        <button type="button" id="btn-close-create-modal" style="background: none; border: none; font-size: 20px; line-height: 1; color: #94a3b8; cursor: pointer;">&times;</button>
                    </div>

                    <form method="POST" action="<?php echo esc_url(admin_url('admin.php')); ?>" style="padding: 24px;">
                        <input type="hidden" name="action" value="bongkar_create_template">
                        <?php wp_nonce_field('bongkar_create_template_nonce'); ?>

                        <div style="margin-bottom: 16px;">
                            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">
                                Judul Template:
                            </label>
                            <input type="text" name="template_title" required placeholder="Contoh: Main Header Responsif, Footer Modern" style="width: 100%; height: 38px; border-radius: 6px; border: 1px solid #cbd5e1; padding: 0 12px; font-size: 13px;">
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
                            <div>
                                <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">
                                    Tipe Template:
                                </label>
                                <select name="template_type" id="new-template-type-select" style="width: 100%; height: 38px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 13px;">
                                    <option value="header" <?php selected($current_tab, 'headers'); ?>>Header (Bagian Atas)</option>
                                    <option value="footer" <?php selected($current_tab, 'footers'); ?>>Footer (Bagian Bawah)</option>
                                </select>
                            </div>
                            <div>
                                <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">
                                    Hubungkan Menu WP:
                                </label>
                                <select name="template_menu_id" style="width: 100%; height: 38px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 13px;">
                                    <option value="0">-- Tanpa Menu WP --</option>
                                    <?php foreach ($wp_menus as $menu_obj): ?>
                                        <option value="<?php echo esc_attr($menu_obj->term_id); ?>">
                                            <?php echo esc_html($menu_obj->name); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                        </div>

                        <div style="margin-bottom: 16px;">
                            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">
                                Kondisi Tampilan (Display Conditions):
                            </label>
                            <select name="display_condition" style="width: 100%; height: 38px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 13px;">
                                <?php foreach ($condition_options as $cond_key => $cond_label): ?>
                                    <option value="<?php echo esc_attr($cond_key); ?>" <?php selected($cond_key, 'entire_site'); ?>>
                                        <?php echo esc_html($cond_label); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <div style="margin-bottom: 24px; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
                            <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #1e293b; cursor: pointer;">
                                <input type="checkbox" name="is_global" value="1" checked style="width: 16px; height: 16px;">
                                Jadikan Template ini sebagai Default Global
                            </label>
                            <div style="font-size: 11px; color: #64748b; margin-top: 4px; margin-left: 24px;">
                                Jika dicentang, semua halaman yang menggunakan mode layout "Header &amp; Footer" akan otomatis memuat template ini.
                            </div>
                        </div>

                        <div style="display: flex; justify-content: flex-end; gap: 10px;">
                            <button type="button" id="btn-cancel-create-modal" class="button" style="height: 38px; padding: 0 16px;">
                                Batal
                            </button>
                            <button type="submit" class="button button-primary" style="background: #4f46e5; border-color: #4338ca; height: 38px; padding: 0 20px; font-weight: 600;">
                                Buat &amp; Edit di Studio
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <script>
            (function() {
                // Modal Create
                var createModal = document.getElementById('modal-create-template');
                var openCreateBtn = document.getElementById('btn-open-create-modal');
                var closeCreateBtn = document.getElementById('btn-close-create-modal');
                var cancelCreateBtn = document.getElementById('btn-cancel-create-modal');

                if (openCreateBtn && createModal) {
                    openCreateBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        createModal.style.display = 'flex';
                    });
                }
                function closeCreate() {
                    if (createModal) createModal.style.display = 'none';
                }
                if (closeCreateBtn) closeCreateBtn.addEventListener('click', closeCreate);
                if (cancelCreateBtn) cancelCreateBtn.addEventListener('click', closeCreate);

                // Modal Import
                var importModal = document.getElementById('modal-import-template');
                var openImportBtn = document.getElementById('btn-open-import-modal');
                var closeImportBtn = document.getElementById('btn-close-import-modal');
                var cancelImportBtn = document.getElementById('btn-cancel-import-modal');

                if (openImportBtn && importModal) {
                    openImportBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        importModal.style.display = 'flex';
                    });
                }
                function closeImport() {
                    if (importModal) importModal.style.display = 'none';
                }
                if (closeImportBtn) closeImportBtn.addEventListener('click', closeImport);
                if (cancelImportBtn) cancelImportBtn.addEventListener('click', closeImport);

                window.addEventListener('click', function(e) {
                    if (e.target === createModal) closeCreate();
                    if (e.target === importModal) closeImport();
                });

                document.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape') {
                        closeCreate();
                        closeImport();
                    }
                });
            })();
            </script>

        </div>
        <?php
    }

    /**
     * Default skeleton HTML for modern responsive header
     */
    public static function get_default_header_html() {
        $site_name = get_bloginfo('name');
        return '<header class="bongkar-header-root">
    <div class="bongkar-header-container">
        <!-- Site Logo / Brand -->
        <a href="' . esc_url(home_url('/')) . '" class="bongkar-brand-logo">
            <span class="brand-text">' . esc_html($site_name) . '</span>
        </a>

        <!-- WordPress Dynamic Navigation Placeholder -->
        <nav class="bongkar-nav-container" data-bongkar-nav="primary">
            <ul class="bongkar-menu-list">
                <li class="menu-item"><a href="' . esc_url(home_url('/')) . '">Beranda</a></li>
                <li class="menu-item"><a href="#tentang">Tentang</a></li>
                <li class="menu-item"><a href="#layanan">Layanan</a></li>
                <li class="menu-item"><a href="#kontak">Kontak</a></li>
            </ul>
        </nav>

        <!-- Header Action CTA Button -->
        <div class="bongkar-header-actions">
            <a href="#hubungi" class="btn-header-cta">
                Hubungi Kami
            </a>
            <!-- Mobile Toggle Button (Font Awesome) -->
            <button type="button" class="bongkar-mobile-toggle" aria-label="Buka Menu Navigasi">
                <i class="fa-solid fa-bars icon-bars"></i>
                <i class="fa-solid fa-xmark icon-close" style="display: none;"></i>
            </button>
        </div>
    </div>
</header>';
    }

    /**
     * Default skeleton CSS for modern responsive header
     */
    public static function get_default_header_css() {
        return '/* Bongkar Header Base Styles - 100% Fluid & Responsive */
.bongkar-header-root {
    width: 100%;
    background-color: #ffffff;
    border-bottom: 1px solid #f1f5f9;
    position: sticky;
    top: 0;
    z-index: 999;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.bongkar-header-container {
    max-width: 1240px;
    margin: 0 auto;
    padding: 14px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
}
.bongkar-brand-logo {
    text-decoration: none;
    font-size: clamp(18px, 2.5vw, 22px);
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
}
.bongkar-nav-container {
    display: flex;
    align-items: center;
}
.bongkar-menu-list {
    display: flex;
    align-items: center;
    gap: 28px;
    list-style: none;
    margin: 0;
    padding: 0;
}
.bongkar-menu-list a {
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    color: #475569;
    transition: color 0.2s ease;
}
.bongkar-menu-list a:hover {
    color: #4f46e5;
}
.bongkar-header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}
.btn-header-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 18px;
    background-color: #4f46e5;
    color: #ffffff;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    border-radius: 6px;
    transition: background 0.2s ease;
}
.btn-header-cta:hover {
    background-color: #4338ca;
}
.bongkar-mobile-toggle {
    display: none;
    background: transparent;
    border: none;
    font-size: 20px;
    color: #0f172a;
    cursor: pointer;
    padding: 8px;
    line-height: 1;
}

/* Tablet & Mobile Breakpoints */
@media (max-width: 900px) {
    .bongkar-mobile-toggle {
        display: block;
    }
    .btn-header-cta {
        display: none;
    }
    .bongkar-nav-container {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #ffffff;
        border-bottom: 1px solid #e2e8f0;
        padding: 20px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
        display: none;
    }
    .bongkar-nav-container.active {
        display: block;
    }
    .bongkar-menu-list {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
    .bongkar-menu-list a {
        font-size: 16px;
        padding: 6px 0;
        display: block;
        width: 100%;
    }
}';
    }

    /**
     * Default skeleton HTML for modern responsive footer
     */
    public static function get_default_footer_html() {
        $site_name = get_bloginfo('name');
        return '<footer class="bongkar-footer-root">
    <div class="bongkar-footer-container">
        <div class="bongkar-footer-grid">
            <div class="footer-col brand-col">
                <div class="footer-brand-title">' . esc_html($site_name) . '</div>
                <p class="footer-brand-desc">Platform website modern, super ringan, dan ultra cepat tanpa bloatware.</p>
            </div>
            <div class="footer-col">
                <div class="footer-heading">Navigasi</div>
                <ul class="footer-links">
                    <li><a href="' . esc_url(home_url('/')) . '">Beranda</a></li>
                    <li><a href="#tentang">Tentang Kami</a></li>
                    <li><a href="#layanan">Layanan</a></li>
                    <li><a href="#kontak">Kontak</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <div class="footer-heading">Hubungi</div>
                <ul class="footer-links">
                    <li><span>Email: info@bongkar.id</span></li>
                    <li><span>WhatsApp: +62 812-3456-7890</span></li>
                    <li><span>Indonesia</span></li>
                </ul>
            </div>
        </div>
        <div class="bongkar-footer-bottom">
            <div>&copy; ' . date('Y') . ' ' . esc_html($site_name) . '. Hak Cipta Dilindungi.</div>
        </div>
    </div>
</footer>';
    }

    /**
     * Default skeleton CSS for modern responsive footer
     */
    public static function get_default_footer_css() {
        return '/* Bongkar Footer Base Styles */
.bongkar-footer-root {
    width: 100%;
    background-color: #0f172a;
    color: #94a3b8;
    padding: 50px 20px 24px;
    box-sizing: border-box;
}
.bongkar-footer-container {
    max-width: 1240px;
    margin: 0 auto;
}
.bongkar-footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 40px;
    margin-bottom: 40px;
}
.footer-brand-title {
    font-size: 20px;
    font-weight: 800;
    color: #ffffff;
    margin-bottom: 12px;
}
.footer-brand-desc {
    font-size: 14px;
    line-height: 1.6;
    margin: 0;
    max-width: 320px;
}
.footer-heading {
    font-size: 15px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 16px;
    letter-spacing: -0.01em;
}
.footer-links {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.footer-links a, .footer-links span {
    color: #94a3b8;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.2s ease;
}
.footer-links a:hover {
    color: #818cf8;
}
.bongkar-footer-bottom {
    padding-top: 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    text-align: center;
    font-size: 13px;
    color: #64748b;
}

@media (max-width: 768px) {
    .bongkar-footer-grid {
        grid-template-columns: 1fr;
        gap: 30px;
    }
}';
    }
}

} // End if !class_exists('Bongkar_Builder_Templates')
