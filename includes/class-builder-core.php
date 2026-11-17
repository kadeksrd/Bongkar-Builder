<?php
/**
 * Core Builder Controller
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('Bongkar_Builder_Core')) {

class Bongkar_Builder_Core {

    private static $instance = null;

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Post Meta registration
        add_action('init', [$this, 'register_meta_fields']);

        // Row Actions on Pages/Posts list
        add_filter('page_row_actions', [$this, 'add_builder_row_action'], 10, 2);
        add_filter('post_row_actions', [$this, 'add_builder_row_action'], 10, 2);

        // Meta box in edit screen
        add_action('add_meta_boxes', [$this, 'add_builder_meta_box']);
        add_action('save_post', [$this, 'save_builder_meta_box']);

        // Admin Bar button
        add_action('admin_bar_menu', [$this, 'add_admin_bar_button'], 999);

        // Catch full-screen editor route via admin_init and admin_action hooks
        add_action('admin_init', [$this, 'handle_editor_screen']);
        add_action('admin_action_bongkar_builder_app', [$this, 'render_editor_screen']);
        add_action('admin_action_bongkar_editor', [$this, 'render_editor_screen']);
        add_action('admin_action_bongkar_canvas_frame', [$this, 'render_canvas_frame']);
    }

    /**
     * Register meta fields
     */
    public function register_meta_fields() {
        $meta_keys = [
            '_bongkar_builder_enabled'          => 'string',
            '_bongkar_page_layout'              => 'string', // 'canvas' or 'header_footer'
            '_bongkar_header_template_id'       => 'integer',
            '_bongkar_footer_template_id'       => 'integer',
            '_bongkar_canvas_html'              => 'string',
            '_bongkar_canvas_css'               => 'string',
            '_bongkar_canvas_js'                => 'string',
            '_bongkar_external_scripts'         => 'string',
            '_bongkar_google_fonts'             => 'string',
            '_bongkar_page_settings'            => 'string',
            '_bongkar_draft_page_layout'        => 'string',
            '_bongkar_draft_header_template_id' => 'integer',
            '_bongkar_draft_footer_template_id' => 'integer',
        ];

        foreach ($meta_keys as $key => $type) {
            register_post_meta('', $key, [
                'show_in_rest'  => true,
                'single'        => true,
                'type'          => $type,
                'auth_callback' => function() {
                    return current_user_can('edit_posts');
                }
            ]);
        }
    }

    /**
     * Helper to get editor URL for a given post
     */
    public static function get_editor_url($post_id) {
        return admin_url('admin.php?action=bongkar_builder_app&post_id=' . absint($post_id));
    }

    /**
     * Add "Edit with Bongkar Builder" to row actions
     */
    public function add_builder_row_action($actions, $post) {
        if (!current_user_can('edit_post', $post->ID)) {
            return $actions;
        }

        $url = self::get_editor_url($post->ID);
        $actions['bongkar_builder'] = sprintf(
            '<a href="%s" style="color: #6366f1; font-weight: 600;"><span class="dashicons dashicons-art" style="font-size:14px; width:14px; height:14px; line-height:1.2; vertical-align:middle; margin-right:2px;"></span> Edit with Bongkar Builder</a>',
            esc_url($url)
        );

        return $actions;
    }

    /**
     * Add meta box in Page editor
     */
    public function add_builder_meta_box() {
        $screens = apply_filters('bongkar_builder_supported_screens', ['page', 'post']);
        foreach ($screens as $screen) {
            add_meta_box(
                'bongkar_builder_box',
                __('Bongkar Canvas Builder (HTML-First)', 'bongkar-builder'),
                [$this, 'render_meta_box'],
                $screen,
                'side',
                'high'
            );
        }
    }

    /**
     * Render Meta Box
     */
    public function render_meta_box($post) {
        $is_enabled = get_post_meta($post->ID, '_bongkar_builder_enabled', true) === '1';
        $layout = get_post_meta($post->ID, '_bongkar_page_layout', true) ?: 'canvas';
        $header_id = get_post_meta($post->ID, '_bongkar_header_template_id', true);
        $footer_id = get_post_meta($post->ID, '_bongkar_footer_template_id', true);

        $headers = class_exists('Bongkar_Builder_Templates') ? Bongkar_Builder_Templates::get_templates('header') : [];
        $footers = class_exists('Bongkar_Builder_Templates') ? Bongkar_Builder_Templates::get_templates('footer') : [];
        $global_header_id = class_exists('Bongkar_Builder_Templates') ? Bongkar_Builder_Templates::get_global_template_id('header') : 0;
        $global_footer_id = class_exists('Bongkar_Builder_Templates') ? Bongkar_Builder_Templates::get_global_template_id('footer') : 0;

        $editor_url = self::get_editor_url($post->ID);
        wp_nonce_field('bongkar_builder_meta_box_nonce', 'bongkar_builder_meta_box_nonce_field');
        ?>
        <div style="padding: 6px 0;">
            <p style="font-size: 13px; color: #64748b; margin-top: 0; line-height: 1.4;">
                <?php _e('Build and edit this page using lightweight canvas, Google Fonts, and zero-bloat HTML/CSS/JS.', 'bongkar-builder'); ?>
            </p>
            <a href="<?php echo esc_url($editor_url); ?>" class="button button-primary button-large" style="width: 100%; text-align: center; height: 38px; line-height: 36px; background: #4f46e5; border-color: #4338ca; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
                <span class="dashicons dashicons-art" style="margin-top: 8px; margin-right: 4px;"></span>
                <?php _e('Edit with Bongkar Builder', 'bongkar-builder'); ?>
            </a>
            <?php if ($is_enabled): ?>
                <div style="margin-top: 10px; font-size: 11px; color: #16a34a; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                    <span class="dashicons dashicons-yes-alt" style="font-size: 16px; width: 16px; height: 16px;"></span>
                    <?php _e('Bongkar Canvas is Active on this Page', 'bongkar-builder'); ?>
                </div>
            <?php endif; ?>

            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0 12px;">

            <!-- Elementor-Style Page Layout Options -->
            <div style="margin-bottom: 12px;">
                <label style="display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 4px;">
                    <?php _e('Tata Letak Halaman (Page Layout):', 'bongkar-builder'); ?>
                </label>
                <select name="bongkar_page_layout" id="bongkar-page-layout-select" style="width: 100%; font-size: 12px; border-radius: 4px; border-color: #cbd5e1;">
                    <option value="canvas" <?php selected($layout, 'canvas'); ?>>
                        <?php _e('Bongkar Canvas (Halaman Penuh / Tanpa Header Footer)', 'bongkar-builder'); ?>
                    </option>
                    <option value="header_footer" <?php selected($layout, 'header_footer'); ?>>
                        <?php _e('Bongkar Header & Footer (Dengan Header & Footer Kustom)', 'bongkar-builder'); ?>
                    </option>
                </select>
            </div>

            <div id="bongkar-hf-settings-group" style="display: <?php echo $layout === 'header_footer' ? 'block' : 'none'; ?>; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
                <!-- Header Template Selection -->
                <div style="margin-bottom: 10px;">
                    <label style="display: block; font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 4px;">
                        <?php _e('Pilih Header:', 'bongkar-builder'); ?>
                    </label>
                    <select name="bongkar_header_template_id" style="width: 100%; font-size: 12px; border-radius: 4px; border-color: #cbd5e1;">
                        <option value="0" <?php selected(!$header_id); ?>>
                            <?php _e('-- Default Global Header --', 'bongkar-builder'); ?>
                        </option>
                        <?php foreach ($headers as $h): ?>
                            <option value="<?php echo esc_attr($h->ID); ?>" <?php selected($header_id, $h->ID); ?>>
                                <?php echo esc_html($h->post_title); ?><?php echo ($global_header_id === $h->ID) ? ' (Global)' : ''; ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <!-- Footer Template Selection -->
                <div>
                    <label style="display: block; font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 4px;">
                        <?php _e('Pilih Footer:', 'bongkar-builder'); ?>
                    </label>
                    <select name="bongkar_footer_template_id" style="width: 100%; font-size: 12px; border-radius: 4px; border-color: #cbd5e1;">
                        <option value="0" <?php selected(!$footer_id); ?>>
                            <?php _e('-- Default Global Footer --', 'bongkar-builder'); ?>
                        </option>
                        <?php foreach ($footers as $f): ?>
                            <option value="<?php echo esc_attr($f->ID); ?>" <?php selected($footer_id, $f->ID); ?>>
                                <?php echo esc_html($f->post_title); ?><?php echo ($global_footer_id === $f->ID) ? ' (Global)' : ''; ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>

            <script>
            (function() {
                var select = document.getElementById('bongkar-page-layout-select');
                var group = document.getElementById('bongkar-hf-settings-group');
                if (select && group) {
                    select.addEventListener('change', function() {
                        group.style.display = this.value === 'header_footer' ? 'block' : 'none';
                    });
                }
            })();
            </script>
        </div>
        <?php
    }

    /**
     * Save Meta Box data from standard WP post save
     */
    public function save_builder_meta_box($post_id) {
        if (!isset($_POST['bongkar_builder_meta_box_nonce_field']) || !wp_verify_nonce($_POST['bongkar_builder_meta_box_nonce_field'], 'bongkar_builder_meta_box_nonce')) {
            return;
        }

        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        if (isset($_POST['bongkar_page_layout'])) {
            $layout = in_array($_POST['bongkar_page_layout'], ['canvas', 'header_footer'], true) ? $_POST['bongkar_page_layout'] : 'canvas';
            update_post_meta($post_id, '_bongkar_page_layout', $layout);
        }

        if (isset($_POST['bongkar_header_template_id'])) {
            update_post_meta($post_id, '_bongkar_header_template_id', absint($_POST['bongkar_header_template_id']));
        }

        if (isset($_POST['bongkar_footer_template_id'])) {
            update_post_meta($post_id, '_bongkar_footer_template_id', absint($_POST['bongkar_footer_template_id']));
        }
    }

    /**
     * Add button in Admin Bar when viewing single page
     */
    public function add_admin_bar_button($wp_admin_bar) {
        if (!is_singular() || !current_user_can('edit_post', get_the_ID())) {
            return;
        }

        $post_id = get_the_ID();
        $wp_admin_bar->add_node([
            'id'    => 'bongkar_builder_edit',
            'title' => '<span class="ab-icon dashicons dashicons-art" style="margin-top:2px;"></span> Edit with Bongkar Builder',
            'href'  => self::get_editor_url($post_id),
            'meta'  => [
                'target' => '_self',
                'title'  => __('Edit with Bongkar Builder', 'bongkar-builder')
            ]
        ]);
    }

    /**
     * Render standalone fullscreen editor studio
     */
    public function render_editor_screen() {
        $post_id = isset($_GET['post_id']) ? absint($_GET['post_id']) : (isset($_GET['post']) ? absint($_GET['post']) : 0);

        if (!$post_id || !current_user_can('edit_post', $post_id)) {
            wp_die(__('You do not have permission to edit this page.', 'bongkar-builder'));
        }

        // Render standalone editor template
        include BONGKAR_BUILDER_PATH . 'templates/app-editor.php';
        exit;
    }

    /**
     * Render canvas iframe document
     */
    public function render_canvas_frame() {
        $post_id = isset($_GET['post_id']) ? absint($_GET['post_id']) : (isset($_GET['post']) ? absint($_GET['post']) : 0);

        if (!$post_id || !current_user_can('edit_post', $post_id)) {
            wp_die(__('You do not have permission to preview this canvas.', 'bongkar-builder'));
        }

        include BONGKAR_BUILDER_PATH . 'templates/canvas-frame.php';
        exit;
    }

    /**
     * Export standalone HTML file for any post
     */
    public function export_standalone_html() {
        $post_id = isset($_GET['post_id']) ? absint($_GET['post_id']) : 0;
        check_admin_referer('bongkar_export_' . $post_id);

        if (!$post_id || !current_user_can('edit_post', $post_id)) {
            wp_die(__('You do not have permission to export this page.', 'bongkar-builder'));
        }

        $post = get_post($post_id);
        if (!$post) {
            wp_die(__('Post not found.', 'bongkar-builder'));
        }

        $has_draft = get_post_meta($post_id, '_bongkar_has_draft', true) === '1';

        // Layout Resolution (Canvas vs Header & Footer)
        $layout_data = class_exists('Bongkar_Builder_Renderer') ? Bongkar_Builder_Renderer::get_resolved_layout_data($post_id, $has_draft) : ['layout' => 'canvas', 'header_html' => '', 'header_css' => '', 'footer_html' => '', 'footer_css' => ''];
        $page_layout = $layout_data['layout'];
        $header_html = $layout_data['header_html'];
        $header_css  = $layout_data['header_css'];
        $footer_html = $layout_data['footer_html'];
        $footer_css  = $layout_data['footer_css'];

        if ($has_draft) {
            $html            = get_post_meta($post_id, '_bongkar_draft_html', true) ?: get_post_meta($post_id, '_bongkar_canvas_html', true);
            $css             = get_post_meta($post_id, '_bongkar_draft_css', true) ?: get_post_meta($post_id, '_bongkar_canvas_css', true);
            $js              = get_post_meta($post_id, '_bongkar_draft_js', true) ?: get_post_meta($post_id, '_bongkar_canvas_js', true);
            $fonts_raw       = get_post_meta($post_id, '_bongkar_draft_google_fonts', true) ?: get_post_meta($post_id, '_bongkar_google_fonts', true);
            $settings_raw    = get_post_meta($post_id, '_bongkar_draft_settings', true) ?: get_post_meta($post_id, '_bongkar_page_settings', true);
            $ext_scripts_raw = get_post_meta($post_id, '_bongkar_draft_external_scripts', true) ?: get_post_meta($post_id, '_bongkar_external_scripts', true);
            $ext_styles_raw  = get_post_meta($post_id, '_bongkar_draft_external_styles', true) ?: get_post_meta($post_id, '_bongkar_external_styles', true);
        } else {
            $html            = get_post_meta($post_id, '_bongkar_canvas_html', true);
            $css             = get_post_meta($post_id, '_bongkar_canvas_css', true);
            $js              = get_post_meta($post_id, '_bongkar_canvas_js', true);
            $fonts_raw       = get_post_meta($post_id, '_bongkar_google_fonts', true);
            $settings_raw    = get_post_meta($post_id, '_bongkar_page_settings', true);
            $ext_scripts_raw = get_post_meta($post_id, '_bongkar_external_scripts', true);
            $ext_styles_raw  = get_post_meta($post_id, '_bongkar_external_styles', true);
        }

        if (empty($html) && !empty($post->post_content)) {
            $html = $post->post_content;
        }

        $fonts       = !empty($fonts_raw) ? json_decode($fonts_raw, true) : [];
        $settings    = !empty($settings_raw) ? json_decode($settings_raw, true) : [];
        $ext_scripts = !empty($ext_scripts_raw) ? json_decode($ext_scripts_raw, true) : [];
        $ext_styles  = !empty($ext_styles_raw) ? json_decode($ext_styles_raw, true) : [];

        // Auto-detect Swiper & AOS
        $combined = ($html ?: '') . ' ' . ($js ?: '');
        if (stripos($combined, 'swiper') !== false) {
            if (!in_array('https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js', $ext_scripts, true)) {
                $ext_scripts[] = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
            }
            if (!in_array('https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css', $ext_styles, true)) {
                $ext_styles[] = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
            }
        }
        if (stripos($combined, 'data-aos') !== false || stripos($combined, 'AOS.init') !== false) {
            if (!in_array('https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js', $ext_scripts, true)) {
                $ext_scripts[] = 'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js';
            }
            if (!in_array('https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css', $ext_styles, true)) {
                $ext_styles[] = 'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css';
            }
        }

        $google_fonts_url = Bongkar_Builder_Google_Fonts::build_fonts_url($fonts);
        $page_title       = !empty($settings['meta_title']) ? $settings['meta_title'] : $post->post_title;
        $meta_desc        = !empty($settings['meta_description']) ? $settings['meta_description'] : '';
        $favicon_url      = !empty($settings['favicon_url']) ? $settings['favicon_url'] : get_site_icon_url(192);
        $og_image_url     = !empty($settings['og_image_url']) ? $settings['og_image_url'] : get_the_post_thumbnail_url($post_id, 'full');
        $has_form         = stripos($html, 'data-bongkar-form') !== false;
        $filename         = sanitize_title($post->post_title) ?: 'landing-page';

        header('Content-Type: text/html; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $filename . '.html"');
        header('Pragma: no-cache');
        header('Expires: 0');
        ?>
<!DOCTYPE html>
<html lang="<?php echo get_locale(); ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo esc_html($page_title); ?></title>
    <?php if (!empty($meta_desc)): ?>
    <meta name="description" content="<?php echo esc_attr($meta_desc); ?>">
    <?php endif; ?>
    <?php if (!empty($favicon_url)): ?>
    <link rel="icon" href="<?php echo esc_url($favicon_url); ?>" type="image/x-icon">
    <link rel="apple-touch-icon" href="<?php echo esc_url($favicon_url); ?>">
    <?php endif; ?>
    <meta property="og:type" content="website">
    <meta property="og:title" content="<?php echo esc_attr($page_title); ?>">
    <?php if (!empty($meta_desc)): ?>
    <meta property="og:description" content="<?php echo esc_attr($meta_desc); ?>">
    <?php endif; ?>
    <?php if (!empty($og_image_url)): ?>
    <meta property="og:image" content="<?php echo esc_url($og_image_url); ?>">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:image" content="<?php echo esc_url($og_image_url); ?>">
    <?php endif; ?>
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?php echo esc_attr($page_title); ?>">
    <?php if (!empty($meta_desc)): ?>
    <meta name="twitter:description" content="<?php echo esc_attr($meta_desc); ?>">
    <?php endif; ?>

    <!-- Font Awesome 6 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <?php if (!empty($google_fonts_url)): ?>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="<?php echo esc_url($google_fonts_url); ?>" rel="stylesheet">
    <?php endif; ?>
    <?php foreach ($ext_styles as $style_url): ?>
    <link rel="stylesheet" href="<?php echo esc_url($style_url); ?>">
    <?php endforeach; ?>

    <!-- Tracking Stubs -->
    <script>
        window.fbq = window.fbq || function() {};
        window.gtag = window.gtag || function() {};
        window.clarity = window.clarity || function() {};
        window.dataLayer = window.dataLayer || [];
    </script>
    <?php if (!empty($settings['gtag_id'])): ?>
    <script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo esc_attr($settings['gtag_id']); ?>"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '<?php echo esc_js($settings['gtag_id']); ?>');
    </script>
    <?php endif; ?>
    <?php if (!empty($settings['meta_pixel_id'])): ?>
    <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq && f.fbq.callMethod)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '<?php echo esc_js($settings['meta_pixel_id']); ?>');
    fbq('track', 'PageView');
    </script>
    <?php endif; ?>
    <?php if (!empty($settings['clarity_id'])): ?>
    <script type="text/javascript">
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "<?php echo esc_js($settings['clarity_id']); ?>");
    </script>
    <?php endif; ?>
    <?php if (!empty($settings['custom_head'])): echo $settings['custom_head']; endif; ?>

    <style id="bongkar-page-styles">
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; -webkit-font-smoothing: antialiased; overflow-x: hidden; word-wrap: break-word; }
        img, video, iframe, svg { max-width: 100%; height: auto; }
        html { scroll-behavior: smooth; }

        /* Modal & Popup Hidden Safeguard (Anti-popup auto show tanpa diminta) */
        dialog:not([open]),
        .modal:not(.show):not(.active):not(.is-open):not(.is-active):not([open]):not(.modal-open),
        .popup:not(.show):not(.active):not(.is-open):not(.is-active):not([open]):not(.popup-open),
        .popup-overlay:not(.show):not(.active):not(.is-open),
        .modal-backdrop:not(.show):not(.active):not(.is-open),
        [data-modal]:not(.show):not(.active):not(.is-open):not(.is-active),
        [data-popup]:not(.show):not(.active):not(.is-open):not(.is-active) {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
        }

        /* Header & Footer Custom CSS */
        <?php echo $header_css; ?>
        <?php echo $css; ?>
        <?php echo $footer_css; ?>
    </style>
</head>
<body class="bongkar-page-body">
    <?php if ($page_layout === 'header_footer' && !empty($header_html)): ?>
    <!-- Bongkar Custom Header -->
    <div id="bongkar-header-wrapper">
        <?php echo $header_html; ?>
    </div>
    <?php endif; ?>

    <div id="bongkar-page-content" class="bongkar-canvas-content">
        <?php echo $html; ?>
    </div>

    <?php if ($page_layout === 'header_footer' && !empty($footer_html)): ?>
    <!-- Bongkar Custom Footer -->
    <div id="bongkar-footer-wrapper">
        <?php echo $footer_html; ?>
    </div>
    <?php endif; ?>

    <?php if ($page_layout === 'header_footer' && class_exists('Bongkar_Builder_Menu')): ?>
        <?php echo Bongkar_Builder_Menu::get_mobile_nav_script(); ?>
    <?php endif; ?>
    <?php foreach ($ext_scripts as $script_url): ?>
    <script src="<?php echo esc_url($script_url); ?>"></script>
    <?php endforeach; ?>
    <?php if ($has_form): ?>
    <script id="bongkar-forms-engine">
    (function() {
        document.addEventListener('submit', function(e) {
            var form = e.target.closest('form[data-bongkar-form="true"]');
            if (!form) return;
            e.preventDefault();
            var submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
            var orig = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = 'Memproses...'; }
            var formData = new FormData(form);
            var fVals = {};
            formData.forEach(function(v, k) { fVals[k] = v; });
            var gsUrl = form.getAttribute('data-gsheet-url') || (form.getAttribute('action') && form.getAttribute('action').indexOf('script.google.com/macros/s') !== -1 ? form.getAttribute('action') : '');
            var gsEnabled = form.getAttribute('data-bongkar-gsheet') === 'true' || !!gsUrl;
            var waNum = form.getAttribute('data-wa-number') || '';
            var waTpl = form.getAttribute('data-wa-template') || '';
            var waEnabled = form.getAttribute('data-bongkar-wa') === 'true';
            if (!waNum) {
                var waLink = form.querySelector('a[href*="wa.me"], a[href*="whatsapp.com"], a.btn-whatsapp');
                var formAct = form.getAttribute('action') || '';
                var targetStr = (waLink ? waLink.getAttribute('href') : '') + ' ' + formAct;
                var wm = targetStr.match(/(?:wa\.me\/|phone=)([0-9+]+)/i);
                if (wm) {
                    waNum = wm[1].replace(/[^0-9]/g, '');
                    waEnabled = true;
                    var wtm = targetStr.match(/text=([^"'\s&<>]+)/i);
                    if (wtm && !waTpl) {
                        try { waTpl = decodeURIComponent(wtm[1].replace(/\+/g, ' ')); } catch(e) {}
                    }
                }
            }
            var succ = form.getAttribute('data-success-msg') || 'Terima kasih! Pesanan Anda telah berhasil dikirim.';
            var promises = [];
            if (gsEnabled && gsUrl) {
                promises.push(fetch(gsUrl, { method: 'POST', mode: 'no-cors', body: formData }).catch(function(){}));
            }
            Promise.all(promises).finally(function() {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = orig; }
                if (waEnabled && waNum) {
                    var clean = waNum.replace(/[^0-9]/g, '');
                    if (clean.indexOf('0') === 0) clean = '62' + clean.substring(1);
                    var msg = '';
                    if (!waTpl) {
                        msg = 'Halo Admin, saya ingin konsultasi:\n';
                        for (var k in fVals) { msg += '*' + k + '*: ' + fVals[k] + '\n'; }
                    } else {
                        msg = waTpl;
                        for (var k2 in fVals) { msg = msg.split('[' + k2 + ']').join(fVals[k2]); }
                    }
                    window.open('https://wa.me/' + clean + '?text=' + encodeURIComponent(msg), '_blank');
                }
                alert(succ);
                form.reset();
            });
        });
    })();
    </script>
    <?php endif; ?>
    <?php if (!empty(trim($js))): ?>
    <script>
    <?php echo $js; ?>
    </script>
    <?php endif; ?>
    <?php if (!empty($settings['custom_footer'])): echo $settings['custom_footer']; endif; ?>
</body>
</html>
        <?php
        exit;
    }

    /**
     * Catch standalone fullscreen editor and canvas iframe routes
     */
    public function handle_editor_screen() {
        // Handle iframe document
        if (isset($_GET['action']) && $_GET['action'] === 'bongkar_canvas_frame') {
            $this->render_canvas_frame();
        }

        // Handle standalone HTML file export
        if (isset($_GET['action']) && $_GET['action'] === 'bongkar_export_html') {
            $this->export_standalone_html();
        }

        // Handle main editor app
        if (isset($_GET['page']) && $_GET['page'] === 'bongkar-builder-app') {
            $this->render_editor_screen();
        }
    }
}

} // End if !class_exists('Bongkar_Builder_Core')
