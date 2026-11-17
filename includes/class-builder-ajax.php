<?php
/**
 * AJAX Handler for Bongkar Builder
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('Bongkar_Builder_Ajax')) {

class Bongkar_Builder_Ajax {

    private static $instance = null;

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('wp_ajax_bongkar_builder_save', [$this, 'save_page']);
        add_action('wp_ajax_bongkar_builder_autosave', [$this, 'autosave_page']);
        add_action('wp_ajax_bongkar_builder_discard_draft', [$this, 'discard_draft']);
        add_action('wp_ajax_bongkar_builder_load', [$this, 'load_page']);
        add_action('wp_ajax_bongkar_builder_import_code', [$this, 'import_code']);
        add_action('wp_ajax_bongkar_builder_toggle_status', [$this, 'toggle_status']);
        add_action('wp_ajax_bongkar_builder_get_posts', [$this, 'get_posts']);
        add_action('wp_ajax_bongkar_builder_get_categories', [$this, 'get_categories']);
    }

    /**
     * Save & Publish Page Data (Elementor-Style Publish/Update)
     * Commits all draft changes to the live visitor-facing canvas and synchronizes state.
     */
    public function save_page() {
        check_ajax_referer('bongkar_builder_nonce', 'nonce');

        $post_id = isset($_POST['post_id']) ? absint($_POST['post_id']) : 0;
        if (!$post_id || !current_user_can('edit_post', $post_id)) {
            wp_send_json_error(['message' => __('Unauthorized or invalid post ID.', 'bongkar-builder')], 403);
        }

        // We use wp_unslash to preserve valid HTML/CSS/JS without slash mangling
        $html        = isset($_POST['html']) ? wp_unslash($_POST['html']) : '';
        $css         = isset($_POST['css']) ? wp_unslash($_POST['css']) : '';
        $js          = isset($_POST['js']) ? wp_unslash($_POST['js']) : '';
        $ext_scripts = isset($_POST['external_scripts']) ? wp_unslash($_POST['external_scripts']) : '[]';
        $ext_styles  = isset($_POST['external_styles']) ? wp_unslash($_POST['external_styles']) : '[]';
        $fonts       = isset($_POST['google_fonts']) ? wp_unslash($_POST['google_fonts']) : '[]';
        $settings    = isset($_POST['page_settings']) ? wp_unslash($_POST['page_settings']) : '{}';
        $page_layout = isset($_POST['page_layout']) && in_array($_POST['page_layout'], ['canvas', 'header_footer'], true) ? $_POST['page_layout'] : 'canvas';
        $header_id   = isset($_POST['header_template_id']) ? absint($_POST['header_template_id']) : 0;
        $footer_id   = isset($_POST['footer_template_id']) ? absint($_POST['footer_template_id']) : 0;

        // Validate JSON fields for data integrity
        if (!json_decode($ext_scripts)) $ext_scripts = '[]';
        if (!json_decode($ext_styles)) $ext_styles = '[]';
        if (!json_decode($fonts)) $fonts = '[]';
        if (!json_decode($settings)) $settings = '{}';

        // Fail-safe: Prevent wiping canvas HTML if received payload is empty
        if (empty(trim($html))) {
            $existing_html = get_post_meta($post_id, '_bongkar_draft_html', true) ?: get_post_meta($post_id, '_bongkar_canvas_html', true);
            if (!empty($existing_html)) {
                $html = $existing_html;
            }
        }

        // 1. Commit to Live Canvas Post Meta
        update_post_meta($post_id, '_bongkar_builder_enabled', '1');
        update_post_meta($post_id, '_bongkar_page_layout', $page_layout);
        update_post_meta($post_id, '_bongkar_header_template_id', $header_id);
        update_post_meta($post_id, '_bongkar_footer_template_id', $footer_id);
        update_post_meta($post_id, '_bongkar_canvas_html', wp_slash($html));
        update_post_meta($post_id, '_bongkar_canvas_css', wp_slash($css));
        update_post_meta($post_id, '_bongkar_canvas_js', wp_slash($js));
        update_post_meta($post_id, '_bongkar_external_scripts', wp_slash($ext_scripts));
        update_post_meta($post_id, '_bongkar_external_styles', wp_slash($ext_styles));
        update_post_meta($post_id, '_bongkar_google_fonts', wp_slash($fonts));
        update_post_meta($post_id, '_bongkar_page_settings', wp_slash($settings));
        update_post_meta($post_id, '_bongkar_last_published', current_time('mysql'));

        // 2. Synchronize Draft Meta (Clear draft pending flag)
        update_post_meta($post_id, '_bongkar_has_draft', '0');
        update_post_meta($post_id, '_bongkar_draft_page_layout', $page_layout);
        update_post_meta($post_id, '_bongkar_draft_header_template_id', $header_id);
        update_post_meta($post_id, '_bongkar_draft_footer_template_id', $footer_id);
        update_post_meta($post_id, '_bongkar_draft_html', wp_slash($html));
        update_post_meta($post_id, '_bongkar_draft_css', wp_slash($css));
        update_post_meta($post_id, '_bongkar_draft_js', wp_slash($js));
        update_post_meta($post_id, '_bongkar_draft_external_scripts', wp_slash($ext_scripts));
        update_post_meta($post_id, '_bongkar_draft_external_styles', wp_slash($ext_styles));
        update_post_meta($post_id, '_bongkar_draft_google_fonts', wp_slash($fonts));
        update_post_meta($post_id, '_bongkar_draft_settings', wp_slash($settings));

        // 3. Update post_content for SEO / search indexing (strip script tags for clean indexation)
        $safe_content = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $html);
        $post_obj = get_post($post_id);
        $post_update = [
            'ID'           => $post_id,
            'post_content' => $safe_content,
        ];

        // Elementor-style: If the post was still a draft, publishing from the builder promotes it to 'publish'
        if ($post_obj && in_array($post_obj->post_status, ['draft', 'auto-draft', 'pending'], true)) {
            $post_update['post_status'] = 'publish';
        }

        wp_update_post($post_update);

        // 4. Synchronize Social Share Image with WordPress Post Featured Image
        $settings_data = json_decode($settings, true) ?: [];
        if (!empty($settings_data['og_image_url'])) {
            $attachment_id = attachment_url_to_postid($settings_data['og_image_url']);
            if ($attachment_id) {
                set_post_thumbnail($post_id, $attachment_id);
            }
        }

        wp_send_json_success([
            'message'     => __('Halaman & Algoritma berhasil dipublikasikan!', 'bongkar-builder'),
            'updated_at'  => current_time('H:i:s'),
            'post_status' => get_post_status($post_id),
            'has_draft'   => false,
        ]);
    }

    /**
     * Autosave Page to Draft Revision (Elementor-Style Autosave)
     * Keeps live visitor-facing canvas untouched while safely preserving draft.
     */
    public function autosave_page() {
        check_ajax_referer('bongkar_builder_nonce', 'nonce');

        $post_id = isset($_POST['post_id']) ? absint($_POST['post_id']) : 0;
        if (!$post_id || !current_user_can('edit_post', $post_id)) {
            wp_send_json_error(['message' => __('Unauthorized or invalid post ID.', 'bongkar-builder')], 403);
        }

        $html        = isset($_POST['html']) ? wp_unslash($_POST['html']) : '';
        $css         = isset($_POST['css']) ? wp_unslash($_POST['css']) : '';
        $js          = isset($_POST['js']) ? wp_unslash($_POST['js']) : '';
        $ext_scripts = isset($_POST['external_scripts']) ? wp_unslash($_POST['external_scripts']) : '[]';
        $ext_styles  = isset($_POST['external_styles']) ? wp_unslash($_POST['external_styles']) : '[]';
        $fonts       = isset($_POST['google_fonts']) ? wp_unslash($_POST['google_fonts']) : '[]';
        $settings    = isset($_POST['page_settings']) ? wp_unslash($_POST['page_settings']) : '{}';
        $page_layout = isset($_POST['page_layout']) && in_array($_POST['page_layout'], ['canvas', 'header_footer'], true) ? $_POST['page_layout'] : '';
        $header_id   = isset($_POST['header_template_id']) ? absint($_POST['header_template_id']) : null;
        $footer_id   = isset($_POST['footer_template_id']) ? absint($_POST['footer_template_id']) : null;

        // Validate JSON fields for data integrity
        if (!json_decode($ext_scripts)) $ext_scripts = '[]';
        if (!json_decode($ext_styles)) $ext_styles = '[]';
        if (!json_decode($fonts)) $fonts = '[]';
        if (!json_decode($settings)) $settings = '{}';

        // Fail-safe: Never overwrite existing draft/canvas with blank string during autosave
        if (empty(trim($html))) {
            $existing_html = get_post_meta($post_id, '_bongkar_draft_html', true) ?: get_post_meta($post_id, '_bongkar_canvas_html', true);
            if (!empty($existing_html)) {
                $html = $existing_html;
            }
        }

        // Update draft post meta only (live canvas remains untouched)
        update_post_meta($post_id, '_bongkar_builder_enabled', '1');
        update_post_meta($post_id, '_bongkar_has_draft', '1');
        if (!empty($page_layout)) {
            update_post_meta($post_id, '_bongkar_draft_page_layout', $page_layout);
        }
        if ($header_id !== null) {
            update_post_meta($post_id, '_bongkar_draft_header_template_id', $header_id);
        }
        if ($footer_id !== null) {
            update_post_meta($post_id, '_bongkar_draft_footer_template_id', $footer_id);
        }
        update_post_meta($post_id, '_bongkar_draft_html', wp_slash($html));
        update_post_meta($post_id, '_bongkar_draft_css', wp_slash($css));
        update_post_meta($post_id, '_bongkar_draft_js', wp_slash($js));
        update_post_meta($post_id, '_bongkar_draft_external_scripts', wp_slash($ext_scripts));
        update_post_meta($post_id, '_bongkar_draft_external_styles', wp_slash($ext_styles));
        update_post_meta($post_id, '_bongkar_draft_google_fonts', wp_slash($fonts));
        update_post_meta($post_id, '_bongkar_draft_settings', wp_slash($settings));
        update_post_meta($post_id, '_bongkar_draft_updated_at', current_time('mysql'));

        wp_send_json_success([
            'message'    => __('Draft tersimpan otomatis.', 'bongkar-builder'),
            'draft_time' => current_time('H:i:s'),
            'has_draft'  => true,
        ]);
    }

    /**
     * Discard Draft Revision
     * Reverts editor state to the live published version.
     */
    public function discard_draft() {
        check_ajax_referer('bongkar_builder_nonce', 'nonce');

        $post_id = isset($_POST['post_id']) ? absint($_POST['post_id']) : 0;
        if (!$post_id || !current_user_can('edit_post', $post_id)) {
            wp_send_json_error(['message' => __('Unauthorized or invalid post ID.', 'bongkar-builder')], 403);
        }

        update_post_meta($post_id, '_bongkar_has_draft', '0');
        delete_post_meta($post_id, '_bongkar_draft_html');
        delete_post_meta($post_id, '_bongkar_draft_css');
        delete_post_meta($post_id, '_bongkar_draft_js');
        delete_post_meta($post_id, '_bongkar_draft_external_scripts');
        delete_post_meta($post_id, '_bongkar_draft_external_styles');
        delete_post_meta($post_id, '_bongkar_draft_google_fonts');
        delete_post_meta($post_id, '_bongkar_draft_settings');
        delete_post_meta($post_id, '_bongkar_draft_updated_at');

        wp_send_json_success([
            'message' => __('Draft berhasil dibuang, kembali ke versi publikasi.', 'bongkar-builder'),
        ]);
    }

    /**
     * Load Page Data
     */
    public function load_page() {
        check_ajax_referer('bongkar_builder_nonce', 'nonce');

        $post_id = isset($_POST['post_id']) ? absint($_POST['post_id']) : 0;
        if (!$post_id || !current_user_can('edit_post', $post_id)) {
            wp_send_json_error(['message' => __('Unauthorized or invalid post ID.', 'bongkar-builder')], 403);
        }

        $has_draft = get_post_meta($post_id, '_bongkar_has_draft', true) === '1';

        if ($has_draft) {
            $html        = get_post_meta($post_id, '_bongkar_draft_html', true) ?: get_post_meta($post_id, '_bongkar_canvas_html', true);
            $css         = get_post_meta($post_id, '_bongkar_draft_css', true) ?: get_post_meta($post_id, '_bongkar_canvas_css', true);
            $js          = get_post_meta($post_id, '_bongkar_draft_js', true) ?: get_post_meta($post_id, '_bongkar_canvas_js', true);
            $ext_scripts = get_post_meta($post_id, '_bongkar_draft_external_scripts', true) ?: get_post_meta($post_id, '_bongkar_external_scripts', true);
            $ext_styles  = get_post_meta($post_id, '_bongkar_draft_external_styles', true) ?: get_post_meta($post_id, '_bongkar_external_styles', true);
            $fonts       = get_post_meta($post_id, '_bongkar_draft_google_fonts', true) ?: get_post_meta($post_id, '_bongkar_google_fonts', true);
            $settings    = get_post_meta($post_id, '_bongkar_draft_settings', true) ?: get_post_meta($post_id, '_bongkar_page_settings', true);
        } else {
            $html        = get_post_meta($post_id, '_bongkar_canvas_html', true);
            $css         = get_post_meta($post_id, '_bongkar_canvas_css', true);
            $js          = get_post_meta($post_id, '_bongkar_canvas_js', true);
            $ext_scripts = get_post_meta($post_id, '_bongkar_external_scripts', true);
            $ext_styles  = get_post_meta($post_id, '_bongkar_external_styles', true);
            $fonts       = get_post_meta($post_id, '_bongkar_google_fonts', true);
            $settings    = get_post_meta($post_id, '_bongkar_page_settings', true);
        }

        // If builder never ran on this page, populate with current post_content as initial HTML
        if (empty($html)) {
            $post = get_post($post_id);
            if ($post && !empty($post->post_content)) {
                $html = $post->post_content;
            }
        }

        wp_send_json_success([
            'post_id'          => $post_id,
            'post_title'       => get_the_title($post_id),
            'html'             => $html ?: '',
            'css'              => $css ?: '',
            'js'               => $js ?: '',
            'external_scripts' => $ext_scripts ? json_decode($ext_scripts, true) : [],
            'external_styles'  => $ext_styles ? json_decode($ext_styles, true) : [],
            'google_fonts'     => $fonts ? json_decode($fonts, true) : [],
            'settings'         => $settings ? json_decode($settings, true) : [],
            'has_draft'        => $has_draft,
            'post_status'      => get_post_status($post_id),
            'permalink'        => get_permalink($post_id),
        ]);
    }

    /**
     * Reusable HTML/CSS/JS parser for AI code and Figma export
     * Supports context-aware extraction (header, footer, or full page)
     */
    public static function parse_html_payload($raw_input, $context_type = '') {
        $extracted_css = '';
        $extracted_js = '';
        $extracted_fonts = [];
        $extracted_title = '';
        $extracted_external_scripts = [];
        $extracted_external_styles = [];

        // A. Extract <title> if present
        if (preg_match('/<title\b[^>]*>(.*?)<\/title>/is', $raw_input, $title_matches)) {
            $extracted_title = trim(strip_tags($title_matches[1]));
        }

        // B. Deep Auto-Scraping for SEO (Meta Description, Keywords, OG Tags, Twitter)
        $extracted_desc = '';
        $extracted_kw = '';
        $extracted_custom_head = '';

        // Meta Description: name="description" content="..." OR content="..." name="description"
        if (preg_match('/<meta\b[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\']/is', $raw_input, $desc_matches) ||
            preg_match('/<meta\b[^>]*content=["\']([^"\']*)["\'][^>]*name=["\']description["\']/is', $raw_input, $desc_matches)) {
            $extracted_desc = trim($desc_matches[1]);
        } elseif (preg_match('/<meta\b[^>]*property=["\']og:description["\'][^>]*content=["\']([^"\']*)["\']/is', $raw_input, $desc_matches) ||
                  preg_match('/<meta\b[^>]*content=["\']([^"\']*)["\'][^>]*property=["\']og:description["\']/is', $raw_input, $desc_matches)) {
            $extracted_desc = trim($desc_matches[1]);
        } elseif (preg_match('/<meta\b[^>]*name=["\']twitter:description["\'][^>]*content=["\']([^"\']*)["\']/is', $raw_input, $desc_matches) ||
                  preg_match('/<meta\b[^>]*content=["\']([^"\']*)["\'][^>]*name=["\']twitter:description["\']/is', $raw_input, $desc_matches)) {
            $extracted_desc = trim($desc_matches[1]);
        }

        // Meta Keywords
        if (preg_match('/<meta\b[^>]*name=["\']keywords["\'][^>]*content=["\']([^"\']*)["\']/is', $raw_input, $kw_matches) ||
            preg_match('/<meta\b[^>]*content=["\']([^"\']*)["\'][^>]*name=["\']keywords["\']/is', $raw_input, $kw_matches)) {
            $extracted_kw = trim($kw_matches[1]);
        }

        // Fallback for title if empty: og:title or twitter:title
        if (empty($extracted_title)) {
            if (preg_match('/<meta\b[^>]*property=["\']og:title["\'][^>]*content=["\']([^"\']*)["\']/is', $raw_input, $og_title_matches) ||
                preg_match('/<meta\b[^>]*content=["\']([^"\']*)["\'][^>]*property=["\']og:title["\']/is', $raw_input, $og_title_matches)) {
                $extracted_title = trim($og_title_matches[1]);
            } elseif (preg_match('/<meta\b[^>]*name=["\']twitter:title["\'][^>]*content=["\']([^"\']*)["\']/is', $raw_input, $tw_title_matches) ||
                      preg_match('/<meta\b[^>]*content=["\']([^"\']*)["\'][^>]*name=["\']twitter:title["\']/is', $raw_input, $tw_title_matches)) {
                $extracted_title = trim($tw_title_matches[1]);
            }
        }

        // C. Deep Auto-Scraping for SEM & Tracking Analytics (Google Tag / GA4 / GTM, Meta Pixel, Clarity)
        $extracted_gtag = '';
        $extracted_pixel = '';
        $extracted_clarity = '';

        // Google Tag / GA4 / Google Ads / GTM
        // Matches: G-XXXXXX, GTM-XXXXXX, AW-XXXXXX, UA-XXXXXX
        if (preg_match('/googletagmanager\.com\/gtag\/js\?id=([a-zA-Z0-9_-]+)/i', $raw_input, $gtag_match)) {
            $extracted_gtag = trim($gtag_match[1]);
        } elseif (preg_match('/googletagmanager\.com\/gtm\.js\?id=([a-zA-Z0-9_-]+)/i', $raw_input, $gtm_match)) {
            $extracted_gtag = trim($gtm_match[1]);
        } elseif (preg_match('/gtag\(\s*[\'"]config[\'"]\s*,\s*[\'"]([a-zA-Z0-9_-]+)[\'"]/i', $raw_input, $gtag_conf_match)) {
            $extracted_gtag = trim($gtag_conf_match[1]);
        } elseif (preg_match('/[\'"](G-[A-Za-z0-9_-]{5,20}|GTM-[A-Za-z0-9_-]{5,20}|AW-[0-9]{6,15})[\'"]/i', $raw_input, $generic_gtag_match)) {
            $extracted_gtag = trim($generic_gtag_match[1]);
        }

        // Meta Pixel / Facebook Pixel (fbq('init', '123456789'))
        if (preg_match('/fbq\(\s*[\'"]init[\'"]\s*,\s*[\'"]([0-9]{8,25})[\'"]/i', $raw_input, $pixel_match)) {
            $extracted_pixel = trim($pixel_match[1]);
        } elseif (preg_match('/connect\.facebook\.net\/[^"\']+\/fbevents\.js.*?id=([0-9]{8,25})/i', $raw_input, $pixel_url_match)) {
            $extracted_pixel = trim($pixel_url_match[1]);
        }

        // Microsoft Clarity: clarity("tag", "XXXX") or clarity.ms/tag/XXXX
        if (preg_match('/clarity\.ms\/tag\/([a-zA-Z0-9_-]+)/i', $raw_input, $clarity_match)) {
            $extracted_clarity = trim($clarity_match[1]);
        } elseif (preg_match('/clarity\(\s*[\'"](?:init|tag)[\'"]\s*,\s*[\'"]([a-zA-Z0-9_-]+)[\'"]/i', $raw_input, $clarity_call_match)) {
            $extracted_clarity = trim($clarity_call_match[1]);
        } elseif (preg_match('/\(window,\s*document,\s*[\'"]clarity[\'"],\s*[\'"]script[\'"],\s*[\'"]([a-zA-Z0-9_-]+)[\'"]\)/i', $raw_input, $clarity_snippet_match)) {
            $extracted_clarity = trim($clarity_snippet_match[1]);
        }

        // Extract any verification meta tags (Google Site Verification, Facebook Verification, etc.)
        if (preg_match_all('/<meta\b[^>]*name=["\'](?:google-site-verification|facebook-domain-verification|msvalidate\.01|yandex-verification)["\'][^>]*>/is', $raw_input, $verif_matches)) {
            foreach ($verif_matches[0] as $vm) {
                $extracted_custom_head .= trim($vm) . "\n";
            }
        }

        // 1. Extract external stylesheets <link rel="stylesheet" href="...">
        if (preg_match_all('/<link\b[^>]*href=["\']([^"\']+)["\'][^>]*>/is', $raw_input, $link_matches)) {
            foreach ($link_matches[0] as $idx => $full_link) {
                if (stripos($full_link, 'stylesheet') !== false) {
                    $href = $link_matches[1][$idx];
                    if (stripos($href, 'fonts.googleapis.com') === false && stripos($href, 'font-awesome') === false && stripos($href, 'fontawesome') === false) {
                        $extracted_external_styles[] = $href;
                    }
                }
            }
        }

        // 2. Extract <style> contents
        if (preg_match_all('/<style\b[^>]*>(.*?)<\/style>/is', $raw_input, $style_matches)) {
            foreach ($style_matches[1] as $style_content) {
                $extracted_css .= "\n" . trim($style_content);
            }
            $raw_input = preg_replace('/<style\b[^>]*>(.*?)<\/style>/is', '', $raw_input);
        }

        // 3. Extract JSON-LD structured data first (<script type="application/ld+json">)
        $extracted_json_ld = '';
        if (preg_match_all('/<script\b[^>]*type=["\']application\/ld\+json["\'][^>]*>(.*?)<\/script>/is', $raw_input, $jsonld_matches)) {
            foreach ($jsonld_matches[1] as $jsonld_content) {
                if (!empty(trim($jsonld_content))) {
                    $extracted_json_ld .= "\n" . trim($jsonld_content);
                }
            }
            $raw_input = preg_replace('/<script\b[^>]*type=["\']application\/ld\+json["\'][^>]*>(.*?)<\/script>/is', '', $raw_input);
        }

        // 4. Extract external script tags <script src="..."></script>
        if (preg_match_all('/<script\b[^>]*src=["\']([^"\']+)["\'][^>]*>\s*<\/script>/is', $raw_input, $src_script_matches)) {
            foreach ($src_script_matches[1] as $src_url) {
                if (!empty(trim($src_url))) {
                    $extracted_external_scripts[] = trim($src_url);
                }
            }
            $raw_input = preg_replace('/<script\b[^>]*src=["\']([^"\']+)["\'][^>]*>\s*<\/script>/is', '', $raw_input);
        }

        // 5. Extract inline <script> contents (only executable JavaScript, excluding json-ld)
        if (preg_match_all('/<script\b(?![^>]*src=)[^>]*>(.*?)<\/script>/is', $raw_input, $script_matches)) {
            foreach ($script_matches[1] as $script_content) {
                if (!empty(trim($script_content))) {
                    $extracted_js .= "\n" . trim($script_content);
                }
            }
            $raw_input = preg_replace('/<script\b(?![^>]*src=)[^>]*>(.*?)<\/script>/is', '', $raw_input);
        }

        // Auto-detect Swiper in markup or script and auto-inject CDN if missing
        $combined_code = $raw_input . ' ' . $extracted_js;
        if ((stripos($combined_code, 'swiper') !== false)) {
            $has_swiper = false;
            foreach ($extracted_external_scripts as $s) {
                if (stripos($s, 'swiper') !== false) { $has_swiper = true; break; }
            }
            if (!$has_swiper) {
                $extracted_external_scripts[] = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
                $extracted_external_styles[] = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
            }
        }

        // 5. Extract Google Fonts from <link> tags or @import
        if (preg_match_all('/fonts\.googleapis\.com\/css2\?family=([^&"\']+)/i', $raw_input . $extracted_css, $font_matches)) {
            foreach ($font_matches[1] as $font_query) {
                $font_names = explode('&family=', $font_query);
                foreach ($font_names as $fname) {
                    $parts = explode(':', $fname);
                    $clean_name = str_replace('+', ' ', urldecode($parts[0]));
                    $extracted_fonts[] = trim($clean_name);
                }
            }
        }
        $extracted_fonts = array_values(array_unique(array_filter($extracted_fonts)));

        // 6. Extract body content if a full HTML document is pasted
        if (preg_match('/<body\b[^>]*>(.*?)<\/body>/is', $raw_input, $body_matches)) {
            $extracted_html = trim($body_matches[1]);
        } else {
            // Remove <html>, <head>, <!DOCTYPE> wrappers if present
            $cleaned = preg_replace('/<!DOCTYPE[^>]*>/i', '', $raw_input);
            $cleaned = preg_replace('/<html\b[^>]*>/i', '', $cleaned);
            $cleaned = preg_replace('/<\/html>/i', '', $cleaned);
            $cleaned = preg_replace('/<head\b[^>]*>.*?<\/head>/is', '', $cleaned);
            $extracted_html = trim($cleaned);
        }

        // 7. Context-Aware Extraction (Header, Footer, or Elementor-Style Page Separation)
        $extracted_header = '';
        $extracted_footer = '';

        if ($context_type === 'header') {
            // When targeting Header: isolate <header> tag or navbar if present; otherwise use the whole markup
            if (preg_match('/<header\b[^>]*>(.*?)<\/header>/is', $raw_input, $header_matches)) {
                $extracted_html = trim($header_matches[0]);
            } elseif (preg_match('/<header\b[^>]*>(.*?)<\/header>/is', $extracted_html, $header_matches)) {
                $extracted_html = trim($header_matches[0]);
            } elseif (preg_match('/<nav\b[^>]*>(.*?)<\/nav>/is', $extracted_html, $nav_matches)) {
                $extracted_html = trim($nav_matches[0]);
            } elseif (preg_match('/<div\b[^>]*class=["\'][^"\']*(?:navbar|site-header|header-main|main-header)[^"\']*["\'][^>]*>(.*?)<\/div>/is', $extracted_html, $div_header_matches)) {
                $extracted_html = trim($div_header_matches[0]);
            }
            $extracted_header = $extracted_html;
        } elseif ($context_type === 'footer') {
            // When targeting Footer: isolate <footer> tag if present; otherwise use the whole markup
            if (preg_match('/<footer\b[^>]*>(.*?)<\/footer>/is', $raw_input, $footer_matches)) {
                $extracted_html = trim($footer_matches[0]);
            } elseif (preg_match('/<footer\b[^>]*>(.*?)<\/footer>/is', $extracted_html, $footer_matches)) {
                $extracted_html = trim($footer_matches[0]);
            } elseif (preg_match('/<div\b[^>]*class=["\'][^"\']*(?:site-footer|footer-main|main-footer)[^"\']*["\'][^>]*>(.*?)<\/div>/is', $extracted_html, $div_footer_matches)) {
                $extracted_html = trim($div_footer_matches[0]);
            }
            $extracted_footer = $extracted_html;
        } else {
            // Standard Page import: separate <header> and <footer>, and retain middle sections in $extracted_html
            if (preg_match('/<header\b[^>]*>(.*?)<\/header>/is', $extracted_html, $header_matches)) {
                $extracted_header = trim($header_matches[0]);
                // Strip from body so page content does not duplicate header
                $extracted_html = trim(preg_replace('/<header\b[^>]*>.*?<\/header>/is', '', $extracted_html, 1));
            }

            if (preg_match('/<footer\b[^>]*>(.*?)<\/footer>/is', $extracted_html, $footer_matches)) {
                $extracted_footer = trim($footer_matches[0]);
                // Strip from body so page content does not duplicate footer
                $extracted_html = trim(preg_replace('/<footer\b[^>]*>.*?<\/footer>/is', '', $extracted_html, 1));
            }
        }

        // Fallback for Meta Description from first paragraph if empty
        if (empty($extracted_desc)) {
            if (preg_match('/<p\b[^>]*>(.*?)<\/p>/is', $extracted_html, $p_match)) {
                $p_clean = trim(strip_tags($p_match[1]));
                if (strlen($p_clean) > 20) {
                    $extracted_desc = (function_exists('mb_substr') ? mb_substr($p_clean, 0, 150) : substr($p_clean, 0, 150)) . (strlen($p_clean) > 150 ? '...' : '');
                }
            }
        }

        // Fallback for Focus Keyword from Title if empty
        if (empty($extracted_kw) && !empty($extracted_title)) {
            $kw_clean = trim(preg_replace('/[-–|•].*$/', '', $extracted_title));
            if (!empty($kw_clean)) {
                $extracted_kw = $kw_clean;
            }
        }

        return [
            'html'              => $extracted_html,
            'css'               => $extracted_css,
            'js'                => $extracted_js,
            'json_ld'           => $extracted_json_ld,
            'header_html'       => $extracted_header,
            'footer_html'       => $extracted_footer,
            'has_header_footer' => (!empty($extracted_header) || !empty($extracted_footer)),
            'external_scripts'  => array_values(array_unique($extracted_external_scripts)),
            'external_styles'   => array_values(array_unique($extracted_external_styles)),
            'google_fonts'      => $extracted_fonts,
            'title'             => $extracted_title,
            'scraped_seo'       => [
                'meta_title'       => $extracted_title,
                'meta_description' => $extracted_desc,
                'focus_keyword'    => $extracted_kw,
                'gtag_id'          => $extracted_gtag,
                'meta_pixel_id'    => $extracted_pixel,
                'clarity_id'       => $extracted_clarity,
                'custom_head'      => trim($extracted_custom_head),
            ],
        ];
    }

    /**
     * Import raw AI HTML/CSS/JS via AJAX
     */
    public function import_code() {
        check_ajax_referer('bongkar_builder_nonce', 'nonce');

        if (!current_user_can('edit_posts')) {
            wp_send_json_error(['message' => __('Unauthorized', 'bongkar-builder')]);
        }

        $raw_input    = isset($_POST['raw_code']) ? wp_unslash($_POST['raw_code']) : '';
        $post_id      = isset($_POST['post_id']) ? absint($_POST['post_id']) : 0;
        $auto_hf      = isset($_POST['auto_extract_hf']) && $_POST['auto_extract_hf'] === '1';
        $context_type = isset($_POST['context_type']) ? sanitize_text_field($_POST['context_type']) : '';

        // Auto-detect context if post_id is a bongkar_template
        if (empty($context_type) && $post_id) {
            $post_type = get_post_type($post_id);
            if ($post_type === 'bongkar_template') {
                $context_type = get_post_meta($post_id, '_bongkar_template_type', true);
            }
        }

        if (empty(trim($raw_input))) {
            wp_send_json_error(['message' => __('Kode input tidak boleh kosong.', 'bongkar-builder')]);
        }

        $result = self::parse_html_payload($raw_input, $context_type);

        // Auto-create Header and Footer templates if detected and requested
        if ($auto_hf && $post_id && $result['has_header_footer'] && class_exists('Bongkar_Builder_Templates')) {
            $post_title = get_the_title($post_id) ?: 'Halaman';
            $created_header_id = 0;
            $created_footer_id = 0;

            if (!empty($result['header_html'])) {
                $created_header_id = wp_insert_post([
                    'post_title'   => 'Header - ' . $post_title,
                    'post_type'    => Bongkar_Builder_Templates::POST_TYPE,
                    'post_status'  => 'publish',
                    'post_author'  => get_current_user_id()
                ]);
                if ($created_header_id && !is_wp_error($created_header_id)) {
                    update_post_meta($created_header_id, '_bongkar_template_type', 'header');
                    update_post_meta($created_header_id, '_bongkar_canvas_html', $result['header_html']);
                    update_post_meta($created_header_id, '_bongkar_canvas_css', $result['css']);
                    update_post_meta($created_header_id, '_bongkar_builder_enabled', '1');
                    update_post_meta($post_id, '_bongkar_header_template_id', $created_header_id);
                    update_post_meta($post_id, '_bongkar_draft_header_template_id', $created_header_id);
                }
            }

            if (!empty($result['footer_html'])) {
                $created_footer_id = wp_insert_post([
                    'post_title'   => 'Footer - ' . $post_title,
                    'post_type'    => Bongkar_Builder_Templates::POST_TYPE,
                    'post_status'  => 'publish',
                    'post_author'  => get_current_user_id()
                ]);
                if ($created_footer_id && !is_wp_error($created_footer_id)) {
                    update_post_meta($created_footer_id, '_bongkar_template_type', 'footer');
                    update_post_meta($created_footer_id, '_bongkar_canvas_html', $result['footer_html']);
                    update_post_meta($created_footer_id, '_bongkar_canvas_css', $result['css']);
                    update_post_meta($created_footer_id, '_bongkar_builder_enabled', '1');
                    update_post_meta($post_id, '_bongkar_footer_template_id', $created_footer_id);
                    update_post_meta($post_id, '_bongkar_draft_footer_template_id', $created_footer_id);
                }
            }

            // Switch page layout to header_footer
            update_post_meta($post_id, '_bongkar_page_layout', 'header_footer');
            update_post_meta($post_id, '_bongkar_draft_page_layout', 'header_footer');

            $result['created_header_id'] = $created_header_id;
            $result['created_footer_id'] = $created_footer_id;
            $result['page_layout'] = 'header_footer';
        }

        $result['message'] = __('Kode AI/HTML berhasil di-parse dan siap diedit!', 'bongkar-builder');

        wp_send_json_success($result);
    }

    /**
     * Toggle builder active status
     */
    public function toggle_status() {
        check_ajax_referer('bongkar_builder_nonce', 'nonce');

        $post_id = isset($_POST['post_id']) ? absint($_POST['post_id']) : 0;
        $enable = isset($_POST['enable']) && $_POST['enable'] === '1' ? '1' : '0';

        if (!$post_id || !current_user_can('edit_post', $post_id)) {
            wp_send_json_error(['message' => __('Unauthorized', 'bongkar-builder')]);
        }

        update_post_meta($post_id, '_bongkar_builder_enabled', $enable);
        wp_send_json_success(['enabled' => $enable]);
    }

    /**
     * Fetch WordPress Posts for Dynamic Blog Grid & Picker
     */
    public function get_posts() {
        check_ajax_referer('bongkar_builder_nonce', 'nonce');

        if (!current_user_can('edit_posts')) {
            wp_send_json_error(['message' => __('Unauthorized', 'bongkar-builder')], 403);
        }

        $filter_type = isset($_POST['filter_type']) ? sanitize_text_field($_POST['filter_type']) : 'recent';
        $category_id = isset($_POST['category_id']) ? absint($_POST['category_id']) : 0;
        $count       = isset($_POST['count']) ? min(24, max(1, absint($_POST['count']))) : 6;
        $search      = isset($_POST['search']) ? sanitize_text_field($_POST['search']) : '';
        $post_ids_raw= isset($_POST['post_ids']) ? sanitize_text_field($_POST['post_ids']) : '';

        $query_args = [
            'post_type'      => 'post',
            'post_status'    => 'publish',
            'posts_per_page' => $count,
            'orderby'        => 'date',
            'order'          => 'DESC',
        ];

        if (!empty($search)) {
            $query_args['s'] = $search;
        }

        if ($filter_type === 'category' && $category_id > 0) {
            $query_args['cat'] = $category_id;
        } elseif ($filter_type === 'handpicked' && !empty($post_ids_raw)) {
            $parsed_ids = array_filter(array_map('absint', explode(',', $post_ids_raw)));
            if (!empty($parsed_ids)) {
                $query_args['post__in'] = $parsed_ids;
                $query_args['orderby']  = 'post__in';
                $query_args['posts_per_page'] = count($parsed_ids);
            }
        }

        $query = new WP_Query($query_args);
        $posts_data = [];

        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $pid = get_the_ID();
                $thumb = get_the_post_thumbnail_url($pid, 'large');
                if (!$thumb) {
                    $thumb = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80';
                }

                $cats = get_the_category($pid);
                $cat_name = !empty($cats) ? $cats[0]->name : __('Artikel', 'bongkar-builder');

                $posts_data[] = [
                    'id'            => $pid,
                    'title'         => get_the_title($pid),
                    'permalink'     => get_permalink($pid),
                    'date'          => get_the_date('d M Y', $pid),
                    'author'        => get_the_author(),
                    'excerpt'       => wp_trim_words(get_the_excerpt($pid), 18, '...'),
                    'thumbnail_url' => $thumb,
                    'category'      => $cat_name,
                ];
            }
            wp_reset_postdata();
        }

        wp_send_json_success(['posts' => $posts_data]);
    }

    /**
     * Get WordPress Categories for Post Filter
     */
    public function get_categories() {
        check_ajax_referer('bongkar_builder_nonce', 'nonce');

        if (!current_user_can('edit_posts')) {
            wp_send_json_error(['message' => __('Unauthorized', 'bongkar-builder')], 403);
        }

        $cats = get_categories(['hide_empty' => false]);
        $data = [];
        foreach ($cats as $cat) {
            $data[] = [
                'id'    => $cat->term_id,
                'name'  => $cat->name,
                'count' => $cat->count,
            ];
        }

        wp_send_json_success(['categories' => $data]);
    }
}

} // End if !class_exists('Bongkar_Builder_Ajax')
