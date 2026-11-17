<?php
/**
 * Frontend Renderer for Bongkar Builder
 * Delivers zero-bloat canvas output with optional Header & Footer and full theme compatibility
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('Bongkar_Builder_Renderer')) {

class Bongkar_Builder_Renderer {

    private static $instance = null;

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_filter('template_include', [$this, 'override_frontend_template'], 999);
        add_action('wp_enqueue_scripts', [$this, 'neutralize_conflicting_theme_styles'], 9999);
    }

    /**
     * Dequeue conflicting theme styles on Bongkar pages to prevent CSS bleed and layout breakage
     */
    public function neutralize_conflicting_theme_styles() {
        if (!is_singular()) {
            return;
        }

        $post_id = get_the_ID();
        $is_enabled = get_post_meta($post_id, '_bongkar_builder_enabled', true) === '1';

        if (!$is_enabled) {
            return;
        }

        // Dequeue known intrusive theme stylesheets that disrupt custom layout
        $conflicting_handles = [
            'hello-elementor',
            'hello-elementor-theme-style',
            'hello-elementor-header-footer',
            'twenty-twenty-four-style',
            'twentytwentyfour-style',
            'twentytwentyfive-style',
            'astra-theme-css',
            'generatepress-style',
            'oceanwp-style',
        ];

        foreach ($conflicting_handles as $handle) {
            if (wp_style_is($handle, 'enqueued')) {
                wp_dequeue_style($handle);
            }
        }
    }

    /**
     * Override page template when Bongkar Builder is enabled
     */
    public function override_frontend_template($template) {
        if (!is_singular()) {
            return $template;
        }

        $post_id = get_the_ID();
        $is_enabled = get_post_meta($post_id, '_bongkar_builder_enabled', true) === '1';

        if ($is_enabled) {
            $canvas_template = BONGKAR_BUILDER_PATH . 'templates/frontend-canvas.php';
            if (file_exists($canvas_template)) {
                return $canvas_template;
            }
        }

        return $template;
    }

    /**
     * Resolve Layout Data (Canvas vs Header & Footer) for a post
     */
    public static function get_resolved_layout_data($post_id, $is_draft_preview = false) {
        $layout = get_post_meta($post_id, $is_draft_preview ? '_bongkar_draft_page_layout' : '_bongkar_page_layout', true);
        if (empty($layout)) {
            $layout = get_post_meta($post_id, '_bongkar_page_layout', true) ?: 'canvas';
        }

        $header_id = get_post_meta($post_id, $is_draft_preview ? '_bongkar_draft_header_template_id' : '_bongkar_header_template_id', true);
        if (empty($header_id)) {
            $header_id = get_post_meta($post_id, '_bongkar_header_template_id', true);
        }

        $footer_id = get_post_meta($post_id, $is_draft_preview ? '_bongkar_draft_footer_template_id' : '_bongkar_footer_template_id', true);
        if (empty($footer_id)) {
            $footer_id = get_post_meta($post_id, '_bongkar_footer_template_id', true);
        }

        // If 'header_footer' layout is selected and no template is explicitly assigned, fallback to Display Conditions & Global Defaults
        if ($layout === 'header_footer') {
            if (empty($header_id) && class_exists('Bongkar_Builder_Templates')) {
                $header_id = Bongkar_Builder_Templates::get_template_for_context('header');
            }
            if (empty($footer_id) && class_exists('Bongkar_Builder_Templates')) {
                $footer_id = Bongkar_Builder_Templates::get_template_for_context('footer');
            }
        }

        $header_html = '';
        $header_css  = '';
        $footer_html = '';
        $footer_css  = '';

        if ($layout === 'header_footer') {
            // Load Header
            if ($header_id && get_post_status($header_id) === 'publish') {
                $header_html = get_post_meta($header_id, '_bongkar_canvas_html', true);
                $header_css  = get_post_meta($header_id, '_bongkar_canvas_css', true);
                $menu_id     = get_post_meta($header_id, '_bongkar_template_menu_id', true);

                if (!empty($menu_id) && class_exists('Bongkar_Builder_Menu')) {
                    $header_html = Bongkar_Builder_Menu::inject_dynamic_menu($header_html, $menu_id);
                }
            }

            // Load Footer
            if ($footer_id && get_post_status($footer_id) === 'publish') {
                $footer_html = get_post_meta($footer_id, '_bongkar_canvas_html', true);
                $footer_css  = get_post_meta($footer_id, '_bongkar_canvas_css', true);
            }
        }

        return [
            'layout'      => $layout,
            'header_id'   => $header_id,
            'footer_id'   => $footer_id,
            'header_html' => $header_html,
            'header_css'  => $header_css,
            'footer_html' => $footer_html,
            'footer_css'  => $footer_css,
        ];
    }

    /**
     * Render Dynamic WordPress Blog / Post Grids within HTML
     */
    public static function render_dynamic_post_grids($html) {
        if (empty($html) || (strpos($html, 'bongkar-dynamic-posts-grid') === false && strpos($html, 'data-bongkar-dynamic-posts') === false)) {
            return $html;
        }

        // Match container: <div ... class="...bongkar-dynamic-posts-grid..." ...>(.*?)</div>
        $pattern = '/<div\b([^>]*\b(?:class=["\'][^"\']*\bbongkar-dynamic-posts-grid\b[^"\']*["\']|data-bongkar-dynamic-posts=["\']true["\'])[^>]*)>(.*?)<\/div>/is';

        $html = preg_replace_callback($pattern, function($matches) {
            $attrs_str = $matches[1];
            
            // Extract data attributes
            $filter_type = 'recent';
            if (preg_match('/data-post-filter=["\']([^"\']+)["\']/i', $attrs_str, $m)) {
                $filter_type = $m[1];
            }

            $cat_id = 0;
            if (preg_match('/data-category-id=["\']([0-9]+)["\']/i', $attrs_str, $m)) {
                $cat_id = absint($m[1]);
            }

            $count = 6;
            if (preg_match('/data-post-count=["\']([0-9]+)["\']/i', $attrs_str, $m)) {
                $count = min(24, max(1, absint($m[1])));
            }

            $cols = 3;
            if (preg_match('/data-post-cols=["\']([1-4])["\']/i', $attrs_str, $m)) {
                $cols = absint($m[1]);
            }

            $post_ids_raw = '';
            if (preg_match('/data-post-ids=["\']([^"\']*)["\']/i', $attrs_str, $m)) {
                $post_ids_raw = trim($m[1]);
            }

            $btn_text = 'Baca Selengkapnya';
            if (preg_match('/data-btn-text=["\']([^"\']*)["\']/i', $attrs_str, $m)) {
                $btn_text = esc_html($m[1]);
            }

            // Build WP_Query
            $query_args = [
                'post_type'      => 'post',
                'post_status'    => 'publish',
                'posts_per_page' => $count,
                'orderby'        => 'date',
                'order'          => 'DESC'
            ];

            if ($filter_type === 'category' && $cat_id > 0) {
                $query_args['cat'] = $cat_id;
            } elseif ($filter_type === 'handpicked' && !empty($post_ids_raw)) {
                $parsed_ids = array_filter(array_map('absint', explode(',', $post_ids_raw)));
                if (!empty($parsed_ids)) {
                    $query_args['post__in'] = $parsed_ids;
                    $query_args['orderby']  = 'post__in';
                    $query_args['posts_per_page'] = count($parsed_ids);
                }
            }

            $query = new WP_Query($query_args);
            $cards_html = '';

            if ($query->have_posts()) {
                while ($query->have_posts()) {
                    $query->the_post();
                    $pid = get_the_ID();
                    $title = get_the_title($pid);
                    $permalink = get_permalink($pid);
                    $date = get_the_date('d M Y', $pid);
                    $author = get_the_author();
                    $excerpt = wp_trim_words(get_the_excerpt($pid), 18, '...');
                    $thumb = get_the_post_thumbnail_url($pid, 'large');
                    if (!$thumb) {
                        $thumb = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80';
                    }
                    $cats = get_the_category($pid);
                    $cat_name = !empty($cats) ? $cats[0]->name : __('Artikel', 'bongkar-builder');

                    $cards_html .= '
                    <article class="bongkar-blog-card">
                        <div class="bongkar-blog-thumb-wrap">
                            <a href="' . esc_url($permalink) . '" tabindex="-1" aria-hidden="true">
                                <img src="' . esc_url($thumb) . '" alt="' . esc_attr($title) . '" class="bongkar-blog-thumb" loading="lazy" />
                            </a>
                            <span class="bongkar-blog-cat-badge">' . esc_html($cat_name) . '</span>
                        </div>
                        <div class="bongkar-blog-content">
                            <div class="bongkar-blog-meta">
                                <span><i class="fa-regular fa-calendar"></i> ' . esc_html($date) . '</span>
                                <span><i class="fa-regular fa-user"></i> ' . esc_html($author) . '</span>
                            </div>
                            <h3 class="bongkar-blog-title">
                                <a href="' . esc_url($permalink) . '">' . esc_html($title) . '</a>
                            </h3>
                            <p class="bongkar-blog-excerpt">' . esc_html($excerpt) . '</p>
                            <a href="' . esc_url($permalink) . '" class="bongkar-blog-readmore">
                                ' . $btn_text . ' <i class="fa-solid fa-arrow-right"></i>
                            </a>
                        </div>
                    </article>';
                }
                wp_reset_postdata();
            } else {
                $cards_html = '<div class="bongkar-blog-empty"><p>' . __('Belum ada artikel yang dipublikasikan pada kategori ini.', 'bongkar-builder') . '</p></div>';
            }

            // Return container with modern CSS grid
            return '<div ' . $attrs_str . ' style="display: grid; grid-template-columns: repeat(' . $cols . ', minmax(0, 1fr)); gap: 28px; width: 100%; box-sizing: border-box;">' . $cards_html . '</div>';
        }, $html);

        return $html;
    }

    /**
     * Generate Content Protection / Anti-Theft Script (Elementor-Style Source Shield)
     */
    public static function get_shield_script($settings = []) {
        $enabled = !empty($settings['content_shield']) && ($settings['content_shield'] === true || $settings['content_shield'] === 'true' || $settings['content_shield'] === '1' || $settings['content_shield'] === 1);
        if (!$enabled) {
            return '';
        }

        $anti_inspect = !empty($settings['shield_anti_inspect']) && ($settings['shield_anti_inspect'] === true || $settings['shield_anti_inspect'] === 'true' || $settings['shield_anti_inspect'] === '1' || $settings['shield_anti_inspect'] === 1);
        $copy_mode    = !empty($settings['shield_copy_mode']) ? $settings['shield_copy_mode'] : 'smart_watermark';
        $watermark    = !empty($settings['shield_watermark_text']) ? $settings['shield_watermark_text'] : '';

        ob_start();
        ?>
        <script id="bongkar-content-shield">
        (function() {
            var antiInspect = <?php echo json_encode($anti_inspect); ?>;
            var copyMode = <?php echo json_encode($copy_mode); ?>;
            var watermarkTpl = <?php echo json_encode($watermark); ?>;

            // 1. Anti-Inspect & DevTools Shortcuts Blocker
            if (antiInspect || copyMode === 'full_shield') {
                // Disable context menu
                document.addEventListener('contextmenu', function(e) {
                    if (copyMode === 'full_shield' || e.target.closest('#bongkar-page-content, img, .bongkar-blog-card')) {
                        e.preventDefault();
                        showShieldToast('Koleksi & konten website ini dilindungi hak cipta.');
                        return false;
                    }
                }, { passive: false });

                // Prevent image dragging/saving
                document.addEventListener('dragstart', function(e) {
                    if (e.target && e.target.tagName === 'IMG') {
                        e.preventDefault();
                        return false;
                    }
                });

                // Disable keyboard shortcuts (F12, Ctrl+U, Ctrl+S, Ctrl+Shift+I/J/C)
                document.addEventListener('keydown', function(e) {
                    // F12
                    if (e.key === 'F12' || e.keyCode === 123) {
                        e.preventDefault();
                        showShieldToast('Fitur inspeksi pengembang dinonaktifkan.');
                        return false;
                    }
                    // Ctrl+U (View Source)
                    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) {
                        e.preventDefault();
                        showShieldToast('Pemeriksaan kode sumber dinonaktifkan.');
                        return false;
                    }
                    // Ctrl+S (Save Page)
                    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
                        e.preventDefault();
                        return false;
                    }
                    // Ctrl+Shift+I or Ctrl+Shift+J or Ctrl+Shift+C (DevTools)
                    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c' || e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
                        e.preventDefault();
                        showShieldToast('Pemeriksaan elemen dinonaktifkan.');
                        return false;
                    }
                }, { passive: false });
            }

            // 2. Smart Copy Shield (Text is selectable, but copying is smartly protected)
            document.addEventListener('copy', function(e) {
                var selection = window.getSelection();
                if (!selection || selection.rangeCount === 0 || !selection.toString().trim()) {
                    return;
                }

                var selectedText = selection.toString();

                if (copyMode === 'block_copy' || copyMode === 'full_shield') {
                    // Prevent copying content into clipboard
                    e.preventDefault();
                    if (e.clipboardData) {
                        e.clipboardData.setData('text/plain', '');
                    }
                    showShieldToast('Penyalinan teks dibatasi untuk melindungi konten hak cipta.');
                    return false;
                } else if (copyMode === 'smart_watermark') {
                    // Keep selected text and append official citation watermark
                    e.preventDefault();
                    var pageTitle = document.title || 'Artikel';
                    var pageUrl = window.location.href;
                    var defaultNotice = '\n\n--- Dikutip dari: ' + pageTitle + ' (' + pageUrl + ') - Hak Cipta Dilindungi ---';
                    var finalNotice = watermarkTpl ? '\n\n--- ' + watermarkTpl.replace('{title}', pageTitle).replace('{url}', pageUrl) + ' ---' : defaultNotice;
                    var modifiedText = selectedText + finalNotice;

                    if (e.clipboardData) {
                        e.clipboardData.setData('text/plain', modifiedText);
                    } else if (window.clipboardData) {
                        window.clipboardData.setData('Text', modifiedText);
                    }
                }
            });

            // Toast helper
            function showShieldToast(msg) {
                var toast = document.getElementById('bongkar-shield-toast');
                if (!toast) {
                    toast = document.createElement('div');
                    toast.id = 'bongkar-shield-toast';
                    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0f172a;color:#ffffff;padding:10px 18px;border-radius:8px;font-size:12px;font-weight:600;box-shadow:0 10px 25px rgba(0,0,0,0.2);z-index:999999;pointer-events:none;transition:opacity 0.3s ease;opacity:0;display:flex;align-items:center;gap:8px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;';
                    document.body.appendChild(toast);
                }
                toast.innerHTML = '<i class="fa-solid fa-shield-halved" style="color:#818cf8;"></i> ' + msg;
                toast.style.opacity = '1';
                clearTimeout(toast._timer);
                toast._timer = setTimeout(function() {
                    toast.style.opacity = '0';
                }, 2800);
            }
        })();
        </script>
        <?php
        return ob_get_clean();
    }
}

} // End if !class_exists('Bongkar_Builder_Renderer')
