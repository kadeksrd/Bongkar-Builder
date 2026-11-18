<?php
/**
 * Canvas Iframe Document
 * Rendered inside the editor studio iframe
 */

if (!defined('ABSPATH')) {
    exit;
}

$post_id = isset($_GET['post_id']) ? absint($_GET['post_id']) : 0;
$post_type = get_post_type($post_id);
$is_template_post = ($post_type === 'bongkar_template');
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
    $ext_scripts_raw = get_post_meta($post_id, '_bongkar_draft_external_scripts', true) ?: get_post_meta($post_id, '_bongkar_external_scripts', true);
    $ext_styles_raw  = get_post_meta($post_id, '_bongkar_draft_external_styles', true) ?: get_post_meta($post_id, '_bongkar_external_styles', true);
} else {
    $html            = get_post_meta($post_id, '_bongkar_canvas_html', true);
    $css             = get_post_meta($post_id, '_bongkar_canvas_css', true);
    $js              = get_post_meta($post_id, '_bongkar_canvas_js', true);
    $fonts_raw       = get_post_meta($post_id, '_bongkar_google_fonts', true);
    $ext_scripts_raw = get_post_meta($post_id, '_bongkar_external_scripts', true);
    $ext_styles_raw  = get_post_meta($post_id, '_bongkar_external_styles', true);
}

$fonts = !empty($fonts_raw) ? json_decode($fonts_raw, true) : [];
$ext_scripts = !empty($ext_scripts_raw) ? json_decode($ext_scripts_raw, true) : [];
$ext_styles = !empty($ext_styles_raw) ? json_decode($ext_styles_raw, true) : [];

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

if (empty($html)) {
    $post = get_post($post_id);
    if ($post && !empty($post->post_content)) {
        $html = $post->post_content;
    }
}

$google_fonts_url = Bongkar_Builder_Google_Fonts::build_fonts_url($fonts);
?>
<!DOCTYPE html>
<html lang="<?php echo get_locale(); ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Canvas Frame - <?php echo esc_html(get_the_title($post_id)); ?></title>

    <!-- Font Awesome 6 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />

    <!-- Google Fonts Container -->
    <link id="bongkar-google-fonts-link" rel="stylesheet" href="<?php echo esc_url($google_fonts_url); ?>">

    <!-- External Stylesheets (Swiper, Animate.css, AOS, etc.) -->
    <?php foreach ($ext_styles as $style_url): ?>
        <link rel="stylesheet" href="<?php echo esc_url($style_url); ?>">
    <?php endforeach; ?>

    <!-- Canvas Helper Styles (Hover boxes, selection badges, outline, insertion bars) -->
    <link rel="stylesheet" href="<?php echo esc_url(BONGKAR_BUILDER_URL . 'assets/css/canvas-helper.css?v=' . BONGKAR_BUILDER_VERSION); ?>">

    <!-- Base reset & User Page CSS -->
    <style id="bongkar-base-reset">
        *, *::before, *::after { box-sizing: border-box; }
        html, body { 
            margin: 0; 
            padding: 0; 
            min-height: 100vh; 
            -webkit-font-smoothing: antialiased; 
            overflow-x: hidden;
            word-wrap: break-word;
        }
        #bongkar-canvas-root {
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            overflow-x: clip;
        }
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

        /* Non-editable Preview Header & Footer in Canvas Frame */
        .bongkar-canvas-preview-header, .bongkar-canvas-preview-footer {
            user-select: none;
            position: relative;
            z-index: 998;
            opacity: 0.96;
        }

        /* Modern Slim Overlay Scrollbar (Native Phone Feel) */
        ::-webkit-scrollbar {
            width: 5px;
            height: 5px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: rgba(148, 163, 184, 0.4);
            border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: rgba(99, 102, 241, 0.7);
        }
    </style>
    <style id="bongkar-hf-preview-css">
        <?php echo $header_css; ?>
        <?php echo $footer_css; ?>
    </style>
    <style id="bongkar-page-css">
        <?php echo $css; ?>
    </style>
</head>
<body class="bongkar-canvas-editing-mode">

    <?php if (!$is_template_post && $page_layout === 'header_footer' && !empty($header_html)): ?>
        <!-- Bongkar Studio Live Header Preview -->
        <div class="bongkar-canvas-preview-header" data-bongkar-non-editable="true">
            <?php echo $header_html; ?>
        </div>
    <?php endif; ?>

    <!-- Canvas Root Element -->
    <div id="bongkar-canvas-root">
        <?php if (!empty(trim($html))): ?>
            <?php echo $html; ?>
        <?php endif; ?>
    </div>

    <?php if (!$is_template_post && $page_layout === 'header_footer' && !empty($footer_html)): ?>
        <!-- Bongkar Studio Live Footer Preview -->
        <div class="bongkar-canvas-preview-footer" data-bongkar-non-editable="true">
            <?php echo $footer_html; ?>
        </div>
    <?php endif; ?>

    <?php if (!$is_template_post && $page_layout === 'header_footer' && class_exists('Bongkar_Builder_Menu')): ?>
        <?php echo Bongkar_Builder_Menu::get_mobile_nav_script(); ?>
    <?php endif; ?>

    <!-- External Scripts (Swiper, GSAP, AOS, etc.) -->
    <div id="bongkar-external-scripts-container">
        <?php foreach ($ext_scripts as $script_url): ?>
            <script src="<?php echo esc_url($script_url); ?>"></script>
        <?php endforeach; ?>
    </div>

    <!-- Smart Algoritma Safe Execution Engine (Global Scope & Real DOM Script Injection) -->
    <script>
    // 1. Safe Mocks for Tracking / Analytics (prevents adblockers / missing CDNs from halting page logic)
    window.fbq = window.fbq || function() {};
    window.gtag = window.gtag || function() {};
    window.clarity = window.clarity || function() {};
    window.dataLayer = window.dataLayer || [];

    // 2. Event Listener Shims (guarantees DOMContentLoaded & load callbacks run immediately when injected after load)
    (function() {
        const _origDocAdd = document.addEventListener;
        const _origWinAdd = window.addEventListener;

        document.addEventListener = function(type, listener, options) {
            if (type === 'DOMContentLoaded' && (document.readyState === 'interactive' || document.readyState === 'complete')) {
                setTimeout(function() {
                    try { listener.call(document, new Event('DOMContentLoaded')); } catch(e) { console.warn('[Bongkar DOMContentLoaded]:', e); }
                }, 10);
                return;
            }
            return _origDocAdd.call(document, type, listener, options);
        };

        window.addEventListener = function(type, listener, options) {
            if (type === 'load' && document.readyState === 'complete') {
                setTimeout(function() {
                    try { listener.call(window, new Event('load')); } catch(e) { console.warn('[Bongkar Window Load]:', e); }
                }, 10);
                return;
            }
            return _origWinAdd.call(window, type, listener, options);
        };
    })();

    window.addEventListener('error', function(e) {
        if (window.parent && window.parent.postMessage) {
            window.parent.postMessage({
                type: 'BONGKAR_JS_STATUS',
                status: 'error',
                message: e.message || 'JavaScript runtime error',
                stack: e.error ? e.error.stack : ''
            }, '*');
        }
    });

    window.__currentScriptCode = <?php echo json_encode($js); ?>;

    /**
     * Executes custom page JavaScript in the true GLOBAL window scope.
     * Functions declared with `function name()` are bound to `window.name`,
     * ensuring inline event handlers (onclick, oninput, onsubmit) work 100%.
     */
    window.__runBongkarAlgorithms = function(customCode) {
        const codeToRun = customCode !== undefined ? customCode : window.__currentScriptCode;
        if (!codeToRun || !codeToRun.trim()) {
            if (window.parent && window.parent.postMessage) {
                window.parent.postMessage({ type: 'BONGKAR_JS_STATUS', status: 'idle' }, '*');
            }
            return;
        }

        // Remove old dynamic script if exists
        const prevScript = document.getElementById('bongkar-dynamic-script');
        if (prevScript) {
            prevScript.remove();
        }

        try {
            const scriptEl = document.createElement('script');
            scriptEl.id = 'bongkar-dynamic-script';
            scriptEl.type = 'text/javascript';
            // Pure global execution: Do NOT wrap in try { ... } block!
            // Wrapping in a block causes function declarations to be block-scoped instead of global window properties.
            scriptEl.textContent = codeToRun;
            document.body.appendChild(scriptEl);

            if (window.parent && window.parent.postMessage) {
                window.parent.postMessage({ type: 'BONGKAR_JS_STATUS', status: 'success' }, '*');
            }
        } catch(syntaxErr) {
            console.error('[Bongkar Algoritma Syntax Error]:', syntaxErr);
            if (window.parent && window.parent.postMessage) {
                window.parent.postMessage({
                    type: 'BONGKAR_JS_STATUS',
                    status: 'error',
                    message: syntaxErr.message
                }, '*');
            }
        }
    };

    // Auto-run algorithms when iframe finishes loading
    window.addEventListener('load', function() {
        setTimeout(function() {
            window.__runBongkarAlgorithms();
        }, 100);
    });

    // Form test submit & WhatsApp simulation interceptor for canvas editor mode
    (function() {
        function harvestFormFields(container) {
            const fields = [];
            const elements = container.querySelectorAll('input:not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="hidden"]), select, textarea');

            elements.forEach(function(el, idx) {
                if (el.closest('.bongkar-section-insert-bar, #bongkar-floating-toolbar, #bongkar-context-menu')) return;

                let label = '';
                if (el.id) {
                    const lbl = container.querySelector('label[for="' + el.id + '"]') || document.querySelector('label[for="' + el.id + '"]');
                    if (lbl && lbl.innerText && lbl.innerText.trim()) label = lbl.innerText.trim();
                }
                if (!label) {
                    const parentLbl = el.closest('label');
                    if (parentLbl) {
                        const clone = parentLbl.cloneNode(true);
                        clone.querySelectorAll('input, select, textarea').forEach(function(n) { n.remove(); });
                        if (clone.innerText && clone.innerText.trim()) label = clone.innerText.trim();
                    }
                }
                if (!label) {
                    let prev = el.previousElementSibling;
                    while (prev) {
                        if (prev.matches('label, .form-label, p, span, h4, h5, h6, strong')) {
                            if (prev.innerText && prev.innerText.trim()) {
                                label = prev.innerText.trim();
                                break;
                            }
                        }
                        prev = prev.previousElementSibling;
                    }
                }
                if (!label && el.placeholder) {
                    label = el.placeholder.replace(/^cth\.\s*/i, '').replace(/^contoh:\s*/i, '').trim();
                }
                if (!label && el.name) {
                    label = el.name.replace(/[-_]/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });
                }
                if (!label && el.id) {
                    label = el.id.replace(/[-_]/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });
                }
                if (!label) {
                    label = 'Data ' + (idx + 1);
                }
                label = label.replace(/[:*]+$/, '').trim();

                let val = '';
                if (el.tagName === 'SELECT') {
                    const opt = el.options[el.selectedIndex];
                    val = opt ? (opt.text || opt.value).trim() : '';
                } else if (el.type === 'checkbox') {
                    val = el.checked ? (el.value && el.value !== 'on' ? el.value : 'Ya') : 'Tidak';
                } else if (el.type === 'radio') {
                    if (el.checked) val = el.value || 'Ya';
                    else return;
                } else {
                    val = (el.value || '').trim();
                }

                const key = (el.name || el.id || label).toLowerCase().replace(/[^a-z0-9]/g, '');
                const slug = label.toLowerCase().replace(/[^a-z0-9]/g, '');

                fields.push({
                    el: el,
                    name: el.name || '',
                    id: el.id || '',
                    label: label,
                    value: val,
                    key: key,
                    slug: slug
                });
            });

            return fields;
        }

        function buildWhatsAppMessage(fields, template) {
            if (!fields || !fields.length) return '';

            let messageText = '';
            const consumedLabels = {};

            if (template && template.trim()) {
                messageText = template;
                fields.forEach(function(f) {
                    if (!f.value) return;
                    const patterns = [
                        '[' + f.label + ']',
                        '[' + f.label.toLowerCase() + ']',
                        f.name ? '[' + f.name + ']' : null,
                        f.name ? '[' + f.name.toLowerCase() + ']' : null,
                        f.id ? '[' + f.id + ']' : null,
                        '[' + f.key + ']',
                        '[' + f.slug + ']',
                        '{' + f.label + '}',
                        '{' + f.key + '}',
                        '{{' + f.key + '}}'
                    ];

                    let matched = false;
                    patterns.forEach(function(pat) {
                        if (pat && messageText.indexOf(pat) !== -1) {
                            messageText = messageText.split(pat).join(f.value);
                            matched = true;
                        }
                    });

                    if (matched) {
                        consumedLabels[f.label] = true;
                    }
                });

                const unconsumed = fields.filter(function(f) {
                    return !consumedLabels[f.label] && f.value;
                });

                if (unconsumed.length > 0) {
                    messageText += '\n\n*Informasi Tambahan:*';
                    unconsumed.forEach(function(f) {
                        messageText += '\n• *' + f.label + '*: ' + f.value;
                    });
                }
            } else {
                messageText = 'Halo Admin, saya ingin konsultasi:\n';
                fields.forEach(function(f) {
                    if (f.value) {
                        messageText += '\n• *' + f.label + '*: ' + f.value;
                    }
                });
            }

            return messageText.trim();
        }

        function extractWhatsAppNumber(container, defaultNum) {
            let waNumber = defaultNum || '';
            if (!waNumber && container) {
                waNumber = container.getAttribute('data-wa-number') || '';
            }
            if (!waNumber && container) {
                const waLink = container.querySelector('a[href*="wa.me"], a[href*="whatsapp.com"], a.btn-whatsapp');
                const formAct = container.getAttribute('action') || '';
                const targetStr = (waLink ? waLink.getAttribute('href') : '') + ' ' + formAct;
                const m = targetStr.match(/(?:wa\.me\/|phone=)([0-9+]+)/i);
                if (m) {
                    waNumber = m[1].replace(/[^0-9]/g, '');
                }
            }
            if (waNumber) {
                let clean = waNumber.replace(/[^0-9]/g, '');
                if (clean.startsWith('0')) clean = '62' + clean.substring(1);
                return clean;
            }
            return '';
        }

        document.addEventListener('submit', function(e) {
            const form = e.target.closest('form');
            if (!form) return;
            e.preventDefault();

            const fields = harvestFormFields(form);
            let gsheetUrl = form.getAttribute('data-gsheet-url') || (form.getAttribute('action') && form.getAttribute('action').includes('script.google.com/macros/s') ? form.getAttribute('action') : '');
            let gsheetEnabled = form.getAttribute('data-bongkar-gsheet') === 'true' || !!gsheetUrl;

            let waNumber = extractWhatsAppNumber(form, form.getAttribute('data-wa-number'));
            let waTemplate = form.getAttribute('data-wa-template') || '';
            let waEnabled = form.getAttribute('data-bongkar-wa') === 'true' || !!waNumber;

            const messageText = buildWhatsAppMessage(fields, waTemplate);

            let msg = '[Bongkar Canvas Preview] Simulasi Pengiriman Formulir:\n\n';
            if (waEnabled) {
                msg += '[Aktif] WhatsApp: ' + (waNumber || 'Nomor belum diisi') + '\n';
                msg += '[Hasil Pesan WA]:\n' + messageText + '\n\n';
            }
            if (gsheetEnabled) {
                msg += '[Aktif] Google Sheets: ' + (gsheetUrl || 'URL webhook belum diisi') + '\n\n';
            }
            if (!waEnabled && !gsheetEnabled) {
                msg += '[Info] Belum ada integrasi aktif (Atur di Inspector tab Formulir).\n\n';
                msg += '[Pratinjau Data Input]:\n' + messageText;
            }

            alert(msg);

            // If in Interactive LIVE mode and WhatsApp is configured, open in new tab
            if (document.body.classList.contains('bongkar-interactive-mode-active') && waEnabled && waNumber) {
                const waUrl = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(messageText);
                window.open(waUrl, '_blank');
            }
        });

        // Direct WhatsApp button click simulation in canvas
        document.addEventListener('click', function(e) {
            if (!document.body.classList.contains('bongkar-interactive-mode-active')) return;

            const btn = e.target.closest('a[href*="wa.me"], a[href*="whatsapp.com"], a.btn-whatsapp, button.btn-whatsapp');
            if (!btn) return;

            const container = btn.closest('form, .bongkar-form, .card, [data-bongkar-form="true"]') || btn.parentElement;
            if (!container) return;

            const fields = harvestFormFields(container);
            const hasValues = fields.some(function(f) { return !!f.value; });
            if (hasValues) {
                const waNumber = extractWhatsAppNumber(container, btn.getAttribute('data-wa-number') || btn.getAttribute('href'));
                if (waNumber) {
                    e.preventDefault();
                    const waTemplate = container.getAttribute('data-wa-template') || '';
                    const messageText = buildWhatsAppMessage(fields, waTemplate);
                    const waUrl = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(messageText);
                    window.open(waUrl, '_blank');
                }
            }
        });
    })();
    </script>

    <!-- Canvas Engine Script (Interactions, Inline editing, Hover highlights, Quick Actions) -->
    <script src="<?php echo esc_url(BONGKAR_BUILDER_URL . 'assets/js/canvas-engine.js?v=' . BONGKAR_BUILDER_VERSION); ?>"></script>
</body>
</html>
