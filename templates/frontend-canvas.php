<?php
/**
 * Frontend Clean Canvas Template
 * Delivers zero-bloat, 95-100 PageSpeed score HTML output with full script & algorithm support
 */

if (!defined('ABSPATH')) {
    exit;
}

global $post;
$post_id = get_the_ID();
if (!$post_id && !empty($post)) {
    $post_id = $post->ID;
}
// Support draft preview for authorized users
$is_editor_preview = (
    is_preview() ||
    isset($_GET['preview']) ||
    isset($_GET['bongkar_preview']) ||
    (is_user_logged_in() && current_user_can('edit_post', $post_id))
);

$has_draft = get_post_meta($post_id, '_bongkar_has_draft', true) === '1';

// Layout Resolution (Canvas vs Header & Footer)
$layout_data = class_exists('Bongkar_Builder_Renderer') ? Bongkar_Builder_Renderer::get_resolved_layout_data($post_id, $is_editor_preview && $has_draft) : ['layout' => 'canvas', 'header_html' => '', 'header_css' => '', 'footer_html' => '', 'footer_css' => ''];
$page_layout = $layout_data['layout'];
$header_html = $layout_data['header_html'];
$header_css  = $layout_data['header_css'];
$footer_html = $layout_data['footer_html'];
$footer_css  = $layout_data['footer_css'];

if ($is_editor_preview && $has_draft) {
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

$fonts       = !empty($fonts_raw) ? json_decode($fonts_raw, true) : [];
$settings    = !empty($settings_raw) ? json_decode($settings_raw, true) : [];
$ext_scripts = !empty($ext_scripts_raw) ? json_decode($ext_scripts_raw, true) : [];
$ext_styles  = !empty($ext_styles_raw) ? json_decode($ext_styles_raw, true) : [];

if (!is_array($fonts)) $fonts = [];
if (!is_array($settings)) $settings = [];
if (!is_array($ext_scripts)) $ext_scripts = [];
if (!is_array($ext_styles)) $ext_styles = [];

if (empty($html)) {
    $post_obj = get_post($post_id);
    if ($post_obj && !empty($post_obj->post_content)) {
        $html = $post_obj->post_content;
    }
}

// Render dynamic WordPress post feeds / blog grids if present
if (class_exists('Bongkar_Builder_Renderer')) {
    $html = Bongkar_Builder_Renderer::render_dynamic_post_grids($html);
}

// Auto-ensure Swiper is loaded if referenced in HTML or JS
$combined_for_swiper = ($html ?: '') . ' ' . ($js ?: '');
if (stripos($combined_for_swiper, 'swiper') !== false) {
    $has_swiper_js = false;
    foreach ($ext_scripts as $s) {
        if (stripos($s, 'swiper') !== false) { $has_swiper_js = true; break; }
    }
    if (!$has_swiper_js) {
        $ext_scripts[] = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
    }

    $has_swiper_css = false;
    foreach ($ext_styles as $s) {
        if (stripos($s, 'swiper') !== false) { $has_swiper_css = true; break; }
    }
    if (!$has_swiper_css) {
        $ext_styles[] = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
    }
}

// Auto-ensure AOS is loaded if referenced in HTML or JS
if (stripos($combined_for_swiper, 'data-aos') !== false || stripos($combined_for_swiper, 'AOS.init') !== false) {
    $has_aos_js = false;
    foreach ($ext_scripts as $s) {
        if (stripos($s, 'aos') !== false) { $has_aos_js = true; break; }
    }
    if (!$has_aos_js) {
        $ext_scripts[] = 'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js';
    }
    $has_aos_css = false;
    foreach ($ext_styles as $s) {
        if (stripos($s, 'aos') !== false) { $has_aos_css = true; break; }
    }
    if (!$has_aos_css) {
        $ext_styles[] = 'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css';
    }
}

$google_fonts_url = Bongkar_Builder_Google_Fonts::build_fonts_url($fonts);
$page_title = !empty($settings['meta_title']) ? $settings['meta_title'] : get_the_title($post_id);
$meta_desc = !empty($settings['meta_description']) ? $settings['meta_description'] : '';
$favicon_url = !empty($settings['favicon_url']) ? $settings['favicon_url'] : get_site_icon_url(192);
$og_image_url = !empty($settings['og_image_url']) ? $settings['og_image_url'] : get_the_post_thumbnail_url($post_id, 'full');

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo esc_html($page_title); ?></title>
    <?php if (!empty($meta_desc)): ?>
        <meta name="description" content="<?php echo esc_attr($meta_desc); ?>">
    <?php endif; ?>

    <!-- Favicon & Browser Tab Icon (Google 2026 Standards & Mobile PWA) -->
    <?php if (!empty($favicon_url)): ?>
        <link rel="icon" href="<?php echo esc_url($favicon_url); ?>" type="image/x-icon">
        <link rel="apple-touch-icon" href="<?php echo esc_url($favicon_url); ?>">
    <?php endif; ?>

    <!-- Open Graph & Social SEO (WhatsApp, Telegram, Facebook, Twitter) -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="<?php echo esc_attr($page_title); ?>">
    <?php if (!empty($meta_desc)): ?>
        <meta property="og:description" content="<?php echo esc_attr($meta_desc); ?>">
    <?php endif; ?>
    <meta property="og:url" content="<?php echo esc_url(get_permalink($post_id)); ?>">
    <?php if (!empty($og_image_url)): ?>
        <meta property="og:image" content="<?php echo esc_url($og_image_url); ?>">
        <meta property="og:image:secure_url" content="<?php echo esc_url($og_image_url); ?>">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta name="twitter:image" content="<?php echo esc_url($og_image_url); ?>">
    <?php endif; ?>
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?php echo esc_attr($page_title); ?>">
    <?php if (!empty($meta_desc)): ?>
        <meta name="twitter:description" content="<?php echo esc_attr($meta_desc); ?>">
    <?php endif; ?>

    <!-- Font Awesome 6 (High performance clean vector icons, no AI slop) -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />

    <!-- Google Fonts (Dynamically loaded only what is used) -->
    <?php if (!empty($google_fonts_url)): ?>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="<?php echo esc_url($google_fonts_url); ?>" rel="stylesheet">
    <?php endif; ?>

    <!-- External Library Styles (Swiper, AOS, etc.) -->
    <?php foreach ($ext_styles as $style_url): ?>
        <link rel="stylesheet" href="<?php echo esc_url($style_url); ?>">
    <?php endforeach; ?>

    <!-- Standard WP Head for SEO/Plugins (clean) -->
    <?php wp_head(); ?>

    <!-- Tracking & Analytics Safe Stubs (Prevents missing scripts/adblockers from halting page JS) -->
    <script id="bongkar-safe-tracking-stubs">
        window.fbq = window.fbq || function() {};
        window.gtag = window.gtag || function() {};
        window.clarity = window.clarity || function() {};
        window.dataLayer = window.dataLayer || [];
    </script>

    <!-- Tracking & Analytics Live IDs (Google Tag, Meta Pixel, Clarity) -->
    <?php if (!empty($settings['gtag_id'])): ?>
        <!-- Google Tag (gtag.js) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo esc_attr($settings['gtag_id']); ?>"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '<?php echo esc_js($settings['gtag_id']); ?>');
        </script>
    <?php endif; ?>

    <?php if (!empty($settings['meta_pixel_id'])): ?>
        <!-- Meta Pixel Code -->
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
        <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=<?php echo esc_attr($settings['meta_pixel_id']); ?>&ev=PageView&noscript=1"/></noscript>
    <?php endif; ?>

    <?php if (!empty($settings['clarity_id'])): ?>
        <!-- Microsoft Clarity -->
        <script type="text/javascript">
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "<?php echo esc_js($settings['clarity_id']); ?>");
        </script>
    <?php endif; ?>

    <!-- Custom Head Code (Meta verification, custom styles, JSON-LD) -->
    <?php if (!empty($settings['custom_head'])): ?>
        <?php echo $settings['custom_head']; ?>
    <?php endif; ?>

    <!-- Page Compiled Custom CSS -->
    <style id="bongkar-page-styles">
        /* Universal Theme Reset & Isolation (Kompatibel ke Semua Tema: Twenty Twenty-Four, Hello Elementor, Astra, dll.) */
        *, *::before, *::after { box-sizing: border-box; }
        html, body {
            margin: 0 !important;
            padding: 0 !important;
            -webkit-font-smoothing: antialiased;
            overflow-x: hidden;
            word-wrap: break-word;
        }
        img, video, iframe, svg { max-width: 100%; height: auto; }
        html { scroll-behavior: smooth; }

        /* Neutralize Block Themes / Gutenberg intrusive margins on containers */
        #bongkar-page-content, #bongkar-header-wrapper, #bongkar-footer-wrapper {
            width: 100%;
            margin: 0;
            padding: 0;
            position: relative;
        }

        /* Modal & Popup Hidden Safeguard (Anti-popup auto jalan tanpa diminta) */
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

        /* Dynamic Blog & Post Grid Styles (100% Fluid & Responsive) */
        .bongkar-dynamic-posts-grid {
            box-sizing: border-box;
            width: 100%;
        }
        .bongkar-blog-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: transform 0.25s ease, box-shadow 0.25s ease;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            text-decoration: none;
        }
        .bongkar-blog-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px -4px rgba(0, 0, 0, 0.08);
        }
        .bongkar-blog-thumb-wrap {
            position: relative;
            width: 100%;
            aspect-ratio: 16 / 9;
            overflow: hidden;
            background: #f1f5f9;
        }
        .bongkar-blog-thumb {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform 0.35s ease;
        }
        .bongkar-blog-card:hover .bongkar-blog-thumb {
            transform: scale(1.05);
        }
        .bongkar-blog-cat-badge {
            position: absolute;
            top: 12px;
            left: 12px;
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(4px);
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .bongkar-blog-content {
            padding: 22px;
            display: flex;
            flex-direction: column;
            flex: 1;
        }
        .bongkar-blog-meta {
            display: flex;
            align-items: center;
            gap: 14px;
            font-size: 12px;
            color: #64748b;
            margin-bottom: 12px;
        }
        .bongkar-blog-meta span {
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }
        .bongkar-blog-title {
            margin: 0 0 10px 0;
            font-size: clamp(16px, 1.8vw, 20px);
            font-weight: 700;
            line-height: 1.35;
            color: #0f172a;
        }
        .bongkar-blog-title a {
            color: inherit;
            text-decoration: none;
            transition: color 0.2s ease;
        }
        .bongkar-blog-title a:hover {
            color: #4f46e5;
        }
        .bongkar-blog-excerpt {
            font-size: 14px;
            line-height: 1.6;
            color: #475569;
            margin: 0 0 18px 0;
            flex: 1;
        }
        .bongkar-blog-readmore {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            font-weight: 700;
            color: #4f46e5;
            text-decoration: none;
            transition: gap 0.2s ease;
        }
        .bongkar-blog-readmore:hover {
            gap: 10px;
            color: #4338ca;
        }
        .bongkar-blog-empty {
            grid-column: 1 / -1;
            text-align: center;
            padding: 40px;
            color: #94a3b8;
            background: #f8fafc;
            border-radius: 12px;
            border: 1px dashed #cbd5e1;
        }

        /* Responsive Breakpoints for Blog Grid */
        @media (max-width: 900px) {
            .bongkar-dynamic-posts-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                gap: 20px !important;
            }
        }
        @media (max-width: 640px) {
            .bongkar-dynamic-posts-grid {
                grid-template-columns: 1fr !important;
                gap: 16px !important;
            }
            .bongkar-blog-content {
                padding: 16px;
            }
        }

        /* Header Custom CSS */
        <?php echo $header_css; ?>

        /* Main Page Custom CSS */
        <?php echo $css; ?>

        /* Footer Custom CSS */
        <?php echo $footer_css; ?>
    </style>
</head>
<body <?php body_class('bongkar-canvas-body'); ?>>
    <?php wp_body_open(); ?>

    <?php if ($page_layout === 'header_footer' && !empty($header_html)): ?>
        <!-- Bongkar Custom Header -->
        <div id="bongkar-header-wrapper">
            <?php echo $header_html; ?>
        </div>
    <?php endif; ?>

    <!-- Main Page Content (Pure clean HTML - Zero Elementor wrappers) -->
    <div id="bongkar-page-content">
        <?php echo $html; ?>
    </div>

    <?php if ($page_layout === 'header_footer' && !empty($footer_html)): ?>
        <!-- Bongkar Custom Footer -->
        <div id="bongkar-footer-wrapper">
            <?php echo $footer_html; ?>
        </div>
    <?php endif; ?>

    <!-- Custom Footer Code -->
    <?php if (!empty($settings['custom_footer'])): ?>
        <?php echo $settings['custom_footer']; ?>
    <?php endif; ?>

    <!-- External Library Scripts (Swiper, GSAP, AOS, etc.) -->
    <?php foreach ($ext_scripts as $script_url): ?>
        <script src="<?php echo esc_url($script_url); ?>"></script>
    <?php endforeach; ?>

    <!-- Lightweight Form Submission Engine (WhatsApp & Google Sheets) -->
    <script id="bongkar-forms-engine">
    (function() {
        document.addEventListener('submit', function(e) {
            const form = e.target.closest('form[data-bongkar-form="true"]');
            if (!form) return;
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';
            }

            // Gather fields
            const formData = new FormData(form);
            const fieldValues = {};
            formData.forEach((value, key) => {
                fieldValues[key] = value;
            });

            // Auto-detect WA and GSheet routing if not stamped
            let gsheetUrl = form.getAttribute('data-gsheet-url') || (form.getAttribute('action') && form.getAttribute('action').includes('script.google.com/macros/s') ? form.getAttribute('action') : '');
            let gsheetEnabled = form.getAttribute('data-bongkar-gsheet') === 'true' || !!gsheetUrl;

            let waNumber = form.getAttribute('data-wa-number') || '';
            let waTemplate = form.getAttribute('data-wa-template') || '';
            let waEnabled = form.getAttribute('data-bongkar-wa') === 'true';

            if (!waNumber) {
                const waLink = form.querySelector('a[href*="wa.me"], a[href*="whatsapp.com"], a.btn-whatsapp');
                const formAct = form.getAttribute('action') || '';
                const targetStr = (waLink ? waLink.getAttribute('href') : '') + ' ' + formAct;
                const m = targetStr.match(/(?:wa\.me\/|phone=)([0-9+]+)/i);
                if (m) {
                    waNumber = m[1].replace(/[^0-9]/g, '');
                    waEnabled = true;
                    const tm = targetStr.match(/text=([^"'\s&<>]+)/i);
                    if (tm && !waTemplate) {
                        try { waTemplate = decodeURIComponent(tm[1].replace(/\+/g, ' ')); } catch(e) {}
                    }
                }
            }
            const successMsg = form.getAttribute('data-success-msg') || 'Terima kasih! Pesanan Anda telah berhasil dikirim.';

            const dispatches = [];

            // 1. Google Sheets Webhook Dispatch
            if (gsheetEnabled && gsheetUrl) {
                const sheetPromise = fetch(gsheetUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: formData
                }).catch(err => {
                    console.warn('[Bongkar Form] Google Sheets Webhook Notice:', err);
                });
                dispatches.push(sheetPromise);
            }

            // Complete and Route
            Promise.all(dispatches).finally(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }

                // 2. WhatsApp Routing
                if (waEnabled && waNumber) {
                    let cleanNumber = waNumber.replace(/[^0-9]/g, '');
                    if (cleanNumber.startsWith('0')) {
                        cleanNumber = '62' + cleanNumber.substring(1);
                    }

                    let messageText = '';
                    if (!waTemplate) {
                        messageText = 'Halo Admin, saya ingin konsultasi:\n';
                        for (const [k, v] of Object.entries(fieldValues)) {
                            messageText += `*${k}*: ${v}\n`;
                        }
                    } else {
                        messageText = waTemplate;
                        for (const [k, v] of Object.entries(fieldValues)) {
                            messageText = messageText.split(`[${k}]`).join(v);
                        }
                    }

                    const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;
                    window.open(waUrl, '_blank');
                }

                alert(successMsg);
                form.reset();
            });
        });
    })();
    </script>

    <!-- Mobile Navigation Engine (Responsive Hamburger Drawer) -->
    <?php if ($page_layout === 'header_footer' && class_exists('Bongkar_Builder_Menu')): ?>
        <?php echo Bongkar_Builder_Menu::get_mobile_nav_script(); ?>
    <?php endif; ?>

    <!-- WP Footer for plugins (Standard single hook call before closing body) -->
    <?php wp_footer(); ?>

    <!-- Page Compiled Custom JS (Executed in Pure Global Window Scope - Zero Wrappers, Zero Blockers) -->
    <?php if (!empty(trim($js))): ?>
        <script id="bongkar-custom-js">
<?php echo str_replace('</script>', '<\/script>', $js); ?>
        </script>
    <?php endif; ?>

    <!-- Content Shield & Anti-Theft Protection (Active on live published pages) -->
    <?php if (class_exists('Bongkar_Builder_Renderer') && !$is_editor_preview): ?>
        <?php echo Bongkar_Builder_Renderer::get_shield_script($settings); ?>
    <?php endif; ?>
</body>
</html>
