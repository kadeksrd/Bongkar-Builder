/**
 * AI & Code Importer Module
 * Accepts pasted raw HTML/CSS/JS (from Claude, v0, ChatGPT, Figma)
 * or uploaded .html file and injects into live canvas cleanly.
 */

window.BongkarImporter = (function () {
    function init() {
        bindModalTriggers();
        bindFileUpload();
        bindExecuteImport();
    }

    function bindModalTriggers() {
        const modal = document.getElementById('modal-importer');
        const openBtn = document.getElementById('btn-open-importer');

        if (openBtn) {
            openBtn.addEventListener('click', () => {
                openModal();
            });
        }

        document.querySelectorAll('[data-open-modal="importer"], .btn-trigger-importer').forEach(btn => {
            btn.addEventListener('click', () => {
                openModal();
            });
        });

        document.querySelectorAll('[data-close-modal="importer"]').forEach(btn => {
            btn.addEventListener('click', () => {
                closeModal();
            });
        });
    }

    function openModal() {
        const modal = document.getElementById('modal-importer');
        if (modal) modal.classList.add('active');
    }

    function closeModal() {
        const modal = document.getElementById('modal-importer');
        if (modal) modal.classList.remove('active');
    }

    function bindFileUpload() {
        const fileInput = document.getElementById('import-file-input');
        const textarea = document.getElementById('import-raw-textarea');

        if (!fileInput) return;

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                textarea.value = event.target.result;
            };
            reader.readAsText(file);
        });
    }

    function bindExecuteImport() {
        const btnExecute = document.getElementById('btn-execute-import');
        const textarea = document.getElementById('import-raw-textarea');
        const modal = document.getElementById('modal-importer');

        if (!btnExecute) return;

        btnExecute.addEventListener('click', () => {
            const rawCode = textarea.value.trim();
            if (!rawCode) {
                alert('Silakan paste kode HTML atau pilih file terlebih dahulu.');
                return;
            }

            btnExecute.disabled = true;
            btnExecute.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';

            // Send to AJAX importer
            const autoHfInput = document.getElementById('import-auto-extract-hf');
            const autoExtractHf = autoHfInput && autoHfInput.checked ? '1' : '0';

            const formData = new FormData();
            formData.append('action', 'bongkar_builder_import_code');
            formData.append('nonce', window.bongkarStudioConfig.nonce);
            formData.append('raw_code', rawCode);
            formData.append('post_id', window.bongkarStudioConfig.postId);
            formData.append('auto_extract_hf', autoExtractHf);
            if (window.bongkarStudioConfig.templateType) {
                formData.append('context_type', window.bongkarStudioConfig.templateType);
            }

            fetch(window.bongkarStudioConfig.ajaxUrl, {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                btnExecute.disabled = false;
                btnExecute.innerHTML = '<i class="fa-solid fa-bolt"></i> Import ke Canvas';

                if (data.success) {
                    const result = data.data;
                    const iframe = document.getElementById('bongkar-iframe-canvas');

                    if (iframe && iframe.contentWindow) {
                        // 1. Update HTML
                        iframe.contentWindow.postMessage({
                            type: 'BONGKAR_REPLACE_ENTIRE_HTML',
                            html: result.html
                        }, '*');

                        // 2. Update CSS
                        if (result.css) {
                            const cssInput = document.getElementById('setting-custom-css');
                            if (cssInput) cssInput.value = result.css;
                            iframe.contentWindow.postMessage({
                                type: 'BONGKAR_UPDATE_PAGE_CSS',
                                css: result.css
                            }, '*');
                        }

                        // 3. Update External Assets (Swiper, etc.)
                        if ((result.external_scripts && result.external_scripts.length > 0) || (result.external_styles && result.external_styles.length > 0)) {
                            iframe.contentWindow.postMessage({
                                type: 'BONGKAR_INJECT_ASSETS',
                                scripts: result.external_scripts || [],
                                styles: result.external_styles || []
                            }, '*');
                        }

                        // 4. Update JS & Algorithms
                        if (result.js) {
                            const algoInput = document.getElementById('algo-code-editor');
                            if (algoInput) algoInput.value = result.js;
                            if (window.BongkarScriptManager) {
                                window.BongkarScriptManager.setScript(result.js);
                            }
                        } else if (window.BongkarScriptManager) {
                            window.BongkarScriptManager.detectAlgorithms();
                        }

                        // 4b. Preserve JSON-LD structured data in Page Settings <head>
                        if (result.json_ld) {
                            const customHeadInput = document.getElementById('setting-custom-head');
                            if (customHeadInput) {
                                const ldTag = `<script type="application/ld+json">\n${result.json_ld.trim()}\n</script>`;
                                if (!customHeadInput.value.includes('application/ld+json')) {
                                    customHeadInput.value = (customHeadInput.value.trim() ? (customHeadInput.value.trim() + '\n\n') : '') + ldTag;
                                }
                            }
                        }

                        // 5. Update Google Fonts
                        if (result.google_fonts && result.google_fonts.length > 0) {
                            result.google_fonts.forEach(f => window.BongkarInspector.setActiveGoogleFonts(result.google_fonts));
                            const fontQueries = result.google_fonts.map(f => 'family=' + encodeURIComponent(f.replace(/ /g, '+')) + ':wght@300;400;500;600;700;800;900');
                            const url = 'https://fonts.googleapis.com/css2?' + fontQueries.join('&') + '&display=swap';

                            iframe.contentWindow.postMessage({
                                type: 'BONGKAR_UPDATE_GOOGLE_FONTS_LINK',
                                url: url
                            }, '*');
                        }

                        // 5b. Auto-Scrape & Fill SEO and Tracking Tags
                        if (result.scraped_seo) {
                            const seo = result.scraped_seo;
                            const titleEl = document.getElementById('setting-meta-title');
                            if (titleEl && seo.meta_title) {
                                titleEl.value = seo.meta_title;
                                titleEl.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                            const descEl = document.getElementById('setting-meta-desc');
                            if (descEl && seo.meta_description) {
                                descEl.value = seo.meta_description;
                                descEl.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                            const kwEl = document.getElementById('seo-focus-keyword');
                            if (kwEl && seo.focus_keyword) {
                                kwEl.value = seo.focus_keyword;
                                kwEl.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                            const gtagEl = document.getElementById('setting-gtag-id');
                            if (gtagEl && seo.gtag_id) {
                                gtagEl.value = seo.gtag_id;
                                gtagEl.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                            const pixelEl = document.getElementById('setting-meta-pixel-id');
                            if (pixelEl && seo.meta_pixel_id) {
                                pixelEl.value = seo.meta_pixel_id;
                                pixelEl.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                            const clarityEl = document.getElementById('setting-clarity-id');
                            if (clarityEl && seo.clarity_id) {
                                clarityEl.value = seo.clarity_id;
                                clarityEl.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                            if (seo.custom_head) {
                                const headEl = document.getElementById('setting-custom-head');
                                if (headEl && !headEl.value.includes(seo.custom_head.trim())) {
                                    headEl.value = (headEl.value.trim() ? (headEl.value.trim() + '\n\n') : '') + seo.custom_head.trim();
                                    headEl.dispatchEvent(new Event('input', { bubbles: true }));
                                }
                            }
                            if (window.BongkarSEOAudit && typeof window.BongkarSEOAudit.runAudit === 'function') {
                                setTimeout(() => window.BongkarSEOAudit.runAudit(), 150);
                            }
                        }

                        // 5b. Run Deep Tracking & Meta Auto-Detection on raw imported code
                        if (window.BongkarStudio && typeof window.BongkarStudio.autoDetectPageMetaAndTracking === 'function') {
                            window.BongkarStudio.autoDetectPageMetaAndTracking(result.html, rawCode, result.js, true);
                        }

                        // 5c. Synchronize Auto-Created Header & Footer Templates
                        if (result.page_layout === 'header_footer') {
                            const pageLayoutSelect = document.getElementById('setting-page-layout');
                            const hfOptionsWrap = document.getElementById('setting-hf-options-wrap');
                            if (pageLayoutSelect) {
                                pageLayoutSelect.value = 'header_footer';
                                if (hfOptionsWrap) hfOptionsWrap.style.display = 'block';
                            }

                            if (result.created_header_id) {
                                const headerSelect = document.getElementById('setting-header-id');
                                if (headerSelect) {
                                    let opt = headerSelect.querySelector(`option[value="${result.created_header_id}"]`);
                                    if (!opt) {
                                        opt = document.createElement('option');
                                        opt.value = result.created_header_id;
                                        opt.textContent = `Header Baru (ID ${result.created_header_id})`;
                                        headerSelect.appendChild(opt);
                                    }
                                    headerSelect.value = result.created_header_id;
                                }
                            }

                            if (result.created_footer_id) {
                                const footerSelect = document.getElementById('setting-footer-id');
                                if (footerSelect) {
                                    let opt = footerSelect.querySelector(`option[value="${result.created_footer_id}"]`);
                                    if (!opt) {
                                        opt = document.createElement('option');
                                        opt.value = result.created_footer_id;
                                        opt.textContent = `Footer Baru (ID ${result.created_footer_id})`;
                                        footerSelect.appendChild(opt);
                                    }
                                    footerSelect.value = result.created_footer_id;
                                }
                            }

                            // Reload canvas iframe so new header/footer are visible
                            setTimeout(() => {
                                if (iframe) iframe.src = iframe.src;
                            }, 500);
                        }

                        // 6. Mark Studio Dirty & Trigger Immediate Autosave to Draft
                        if (window.BongkarStudio) {
                            if (typeof window.BongkarStudio.markDirty === 'function') {
                                window.BongkarStudio.markDirty(true);
                            }
                            if (typeof window.BongkarStudio.saveDraft === 'function') {
                                setTimeout(() => window.BongkarStudio.saveDraft(false), 300);
                            }
                        }
                    }

                    modal.classList.remove('active');
                    alert(result.message || 'Desain & SEO berhasil diimpor!');
                } else {
                    alert(data.data.message || 'Gagal memproses kode.');
                }
            })
            .catch(err => {
                btnExecute.disabled = false;
                btnExecute.innerHTML = '<i class="fa-solid fa-bolt"></i> Import ke Canvas';
                console.error(err);
                alert('Terjadi kesalahan saat memproses data.');
            });
        });
    }

    return {
        init: init,
        openModal: openModal,
        closeModal: closeModal
    };
})();

/**
 * Standalone Protected Exporter Module
 * Compiles landing page into hardened standalone production HTML
 * with Bongkar Source Shield, Obfuscation, and Anti-Inspect features.
 */
window.BongkarExporter = (function () {
    let currentGeneratedHTML = '';

    function init() {
        bindExportTriggers();
        bindExportActions();
    }

    function bindExportTriggers() {
        const openBtn = document.getElementById('btn-open-exporter');
        if (openBtn) {
            openBtn.addEventListener('click', openModal);
        }

        document.querySelectorAll('[data-open-modal="exporter"]').forEach(btn => {
            btn.addEventListener('click', openModal);
        });

        document.querySelectorAll('[data-close-modal="exporter"]').forEach(btn => {
            btn.addEventListener('click', closeModal);
        });
    }

    function openModal() {
        const modal = document.getElementById('modal-exporter');
        if (modal) {
            modal.classList.add('active');
            refreshExportState();
        }
    }

    function closeModal() {
        const modal = document.getElementById('modal-exporter');
        if (modal) modal.classList.remove('active');
    }

    function getActiveCanvasHTML() {
        // 1. Try real-time cleaned DOM from the iframe canvas
        const iframe = document.getElementById('bongkar-iframe-canvas');
        if (iframe && iframe.contentDocument) {
            const root = iframe.contentDocument.getElementById('bongkar-canvas-root');
            if (root) {
                const clone = root.cloneNode(true);
                // Strip all builder helper elements
                clone.querySelectorAll('#bongkar-canvas-badge, #bongkar-floating-toolbar, .bongkar-section-insert-bar, .bongkar-bottom-add-zone, #bongkar-algo-glow-style').forEach(el => el.remove());
                // Strip all helper classes
                clone.querySelectorAll('.bongkar-hover-target, .bongkar-selected-target, .bongkar-algo-glow-target').forEach(el => {
                    el.classList.remove('bongkar-hover-target', 'bongkar-selected-target', 'bongkar-algo-glow-target');
                    if (el.className && !el.className.trim()) {
                        el.removeAttribute('class');
                    }
                });
                // Remove contenteditable attributes
                clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
                const clean = clone.innerHTML.trim();
                if (clean) return clean;
            }
        }
        // 2. Fallback to BongkarStudio state
        if (window.BongkarStudio && typeof window.BongkarStudio.getCanvasHTML === 'function') {
            const h = window.BongkarStudio.getCanvasHTML();
            if (h && h.trim()) return h.trim();
        }
        // 3. Fallback to initial HTML in config
        if (window.bongkarStudioConfig && window.bongkarStudioConfig.initialHtml) {
            return window.bongkarStudioConfig.initialHtml;
        }
        return '';
    }

    function getExportOptions() {
        return {
            forms: document.getElementById('export-opt-forms')?.checked ?? true,
            shield: document.getElementById('export-opt-shield')?.checked ?? false,
            obfuscate: document.getElementById('export-opt-obfuscate')?.checked ?? false,
            tracking: document.getElementById('export-opt-tracking')?.checked ?? true,
            compact: document.getElementById('export-opt-compact')?.checked ?? true
        };
    }

    function refreshExportState() {
        const opts = getExportOptions();
        currentGeneratedHTML = generateStandaloneHTML(opts);

        // Update stats
        const statsEl = document.getElementById('export-file-stats');
        if (statsEl) {
            const bytes = new Blob([currentGeneratedHTML]).size;
            const kb = (bytes / 1024).toFixed(1);
            statsEl.textContent = `Ukuran: ${kb} KB (${currentGeneratedHTML.length.toLocaleString('id-ID')} karakter)`;
        }

        // Update code preview if visible
        const previewWrap = document.getElementById('export-code-preview-wrap');
        const previewArea = document.getElementById('export-code-preview');
        if (previewWrap && previewArea && previewWrap.style.display !== 'none') {
            previewArea.value = currentGeneratedHTML;
        }
    }

    function generateStandaloneHTML(opts) {
        opts = Object.assign({
            forms: true,
            shield: false,
            obfuscate: false,
            tracking: true,
            compact: true
        }, opts);

        const html = getActiveCanvasHTML();
        const css = (document.getElementById('setting-custom-css')?.value) || '';
        const js = window.BongkarScriptManager ? window.BongkarScriptManager.getScript() : ((document.getElementById('algo-code-editor')?.value) || '');
        let extScripts = window.BongkarScriptManager ? window.BongkarScriptManager.getExternalScripts().slice() : [];
        let extStyles = window.BongkarScriptManager ? window.BongkarScriptManager.getExternalStyles().slice() : [];
        const fonts = window.BongkarInspector ? window.BongkarInspector.getActiveGoogleFonts() : [];

        const metaTitle = (document.getElementById('setting-meta-title')?.value.trim()) || document.title || 'Landing Page';
        const metaDesc = (document.getElementById('setting-meta-desc')?.value.trim()) || '';
        const focusKeyword = (document.getElementById('seo-focus-keyword')?.value.trim()) || '';
        const gtagId = (document.getElementById('setting-gtag-id')?.value.trim()) || '';
        const metaPixelId = (document.getElementById('setting-meta-pixel-id')?.value.trim()) || '';
        const clarityId = (document.getElementById('setting-clarity-id')?.value.trim()) || '';
        const customHead = (document.getElementById('setting-custom-head')?.value.trim()) || '';
        const customFooter = (document.getElementById('setting-custom-footer')?.value.trim()) || '';
        const faviconUrl = (document.getElementById('setting-favicon-url')?.value.trim()) || '';
        const ogImageUrl = (document.getElementById('setting-og-image-url')?.value.trim()) || '';
        const disableCopy = document.getElementById('setting-disable-copy')?.checked || false;

        // Auto-ensure Swiper is loaded if referenced in HTML or JS
        const combinedForAssets = (html || '') + ' ' + (js || '');
        if (/swiper/i.test(combinedForAssets)) {
            if (!extScripts.some(s => /swiper/i.test(s))) {
                extScripts.push('https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js');
            }
            if (!extStyles.some(s => /swiper/i.test(s))) {
                extStyles.push('https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css');
            }
        }
        // Auto-ensure AOS is loaded if referenced in HTML or JS
        if (/data-aos|aos\.init/i.test(combinedForAssets)) {
            if (!extScripts.some(s => /aos/i.test(s))) {
                extScripts.push('https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js');
            }
            if (!extStyles.some(s => /aos/i.test(s))) {
                extStyles.push('https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css');
            }
        }

        // 1. Google Fonts Link
        let googleFontsTag = '';
        if (fonts && fonts.length > 0) {
            const fontQueries = fonts.map(f => 'family=' + encodeURIComponent(f.replace(/ /g, '+')) + ':wght@300;400;500;600;700;800;900');
            const url = 'https://fonts.googleapis.com/css2?' + fontQueries.join('&') + '&display=swap';
            googleFontsTag = `    <link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link href="${url}" rel="stylesheet">`;
        }

        // 2. External Styles
        let extStylesTags = '';
        if (extStyles && extStyles.length > 0) {
            extStylesTags = extStyles.map(s => `    <link rel="stylesheet" href="${s}">`).join('\n');
        }

        // 3. External Scripts
        let extScriptsTags = '';
        if (extScripts && extScripts.length > 0) {
            extScriptsTags = extScripts.map(s => `    <script src="${s}"><\/script>`).join('\n');
        }

        // 4. Source Shield Script (Anti-Inspect & Anti-Theft)
        let sourceShieldScript = '';
        if (opts.shield) {
            sourceShieldScript = `
    <!-- Bongkar Source Shield Runtime -->
    <script>
    (function() {
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });

        document.addEventListener('keydown', function(e) {
            // F12
            if (e.keyCode === 123) { e.preventDefault(); return false; }
            // Ctrl+Shift+I / J / C
            if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
                e.preventDefault(); return false;
            }
            // Ctrl+U (View Source)
            if (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 117)) {
                e.preventDefault(); return false;
            }
            // Ctrl+S (Save Page)
            if (e.ctrlKey && (e.keyCode === 83 || e.keyCode === 115)) {
                e.preventDefault(); return false;
            }
            ${disableCopy ? `
            if (e.ctrlKey && (e.keyCode === 67 || e.keyCode === 65)) {
                e.preventDefault(); return false;
            }` : ''}
        });

        ${disableCopy ? `
        document.addEventListener('copy', function(e) { e.preventDefault(); });
        document.addEventListener('cut', function(e) { e.preventDefault(); });
        document.addEventListener('selectstart', function(e) { e.preventDefault(); });
        document.addEventListener('dragstart', function(e) { e.preventDefault(); });
        ` : ''}

        function checkShield() {
            var threshold = 160;
            if ((window.outerWidth - window.innerWidth > threshold) || (window.outerHeight - window.innerHeight > threshold)) {
                try { console.clear(); } catch(e) {}
                console.log('%c[Bongkar Source Shield Active]', 'color: #ef4444; font-size: 20px; font-weight: bold;');
                console.log('%cSource code dan aset halaman ini terproteksi dari inspeksi dan pembajakan.', 'color: #94a3b8; font-size: 13px;');
            }
        }
        window.addEventListener('resize', checkShield);
        setInterval(checkShield, 2000);
    })();
    <\/script>`;
        }

        // 5. Tracking Scripts & Safe Stubs
        let trackingHead = '';
        let safeTrackingStubs = `
    <!-- Tracking & Analytics Safe Stubs -->
    <script>
        window.fbq = window.fbq || function() {};
        window.gtag = window.gtag || function() {};
        window.clarity = window.clarity || function() {};
        window.dataLayer = window.dataLayer || [];
    <\/script>`;

        if (opts.tracking) {
            if (gtagId) {
                trackingHead += `
    <!-- Google Tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${gtagId}"><\/script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gtagId}');
    <\/script>`;
            }
            if (metaPixelId) {
                trackingHead += `
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
    fbq('init', '${metaPixelId}');
    fbq('track', 'PageView');
    <\/script>
    <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1"/></noscript>`;
            }
            if (clarityId) {
                trackingHead += `
    <!-- Microsoft Clarity -->
    <script type="text/javascript">
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${clarityId}");
    <\/script>`;
            }
            if (customHead) {
                trackingHead += '\n    ' + customHead;
            }
        }

        // 6. Form Engine (WhatsApp & Google Sheets)
        let formEngineScript = '';
        if (opts.forms && (/<form/i.test(html) || /data-bongkar-form/i.test(html) || /data-bongkar-wa/i.test(html) || /data-bongkar-gsheet/i.test(html) || /wa\.me/i.test(html) || /script\.google\.com\/macros\/s/i.test(html))) {
            formEngineScript = `
    <!-- Lightweight Dynamic Form & WhatsApp Engine (Universal Field Harvesting & Anti-Loss WhatsApp Generator) -->
    <script id="bongkar-forms-engine">
    (function() {
        function harvestFormFields(container) {
            var fields = [];
            var elements = container.querySelectorAll('input:not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="hidden"]), select, textarea');

            elements.forEach(function(el, idx) {
                var label = '';
                if (el.id) {
                    var lbl = container.querySelector('label[for="' + el.id + '"]') || document.querySelector('label[for="' + el.id + '"]');
                    if (lbl && lbl.innerText && lbl.innerText.trim()) label = lbl.innerText.trim();
                }
                if (!label) {
                    var parentLbl = el.closest('label');
                    if (parentLbl) {
                        var clone = parentLbl.cloneNode(true);
                        clone.querySelectorAll('input, select, textarea').forEach(function(n) { n.remove(); });
                        if (clone.innerText && clone.innerText.trim()) label = clone.innerText.trim();
                    }
                }
                if (!label) {
                    var prev = el.previousElementSibling;
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
                    label = el.placeholder.replace(/^cth\\.\\s*/i, '').replace(/^contoh:\\s*/i, '').trim();
                }
                if (!label && el.name) {
                    label = el.name.replace(/[-_]/g, ' ').replace(/\\b\\w/g, function(l) { return l.toUpperCase(); });
                }
                if (!label && el.id) {
                    label = el.id.replace(/[-_]/g, ' ').replace(/\\b\\w/g, function(l) { return l.toUpperCase(); });
                }
                if (!label) {
                    label = 'Data ' + (idx + 1);
                }
                label = label.replace(/[:*]+$/, '').trim();

                var val = '';
                if (el.tagName === 'SELECT') {
                    var opt = el.options[el.selectedIndex];
                    val = opt ? (opt.text || opt.value).trim() : '';
                } else if (el.type === 'checkbox') {
                    val = el.checked ? (el.value && el.value !== 'on' ? el.value : 'Ya') : 'Tidak';
                } else if (el.type === 'radio') {
                    if (el.checked) val = el.value || 'Ya';
                    else return;
                } else {
                    val = (el.value || '').trim();
                }

                var key = (el.name || el.id || label).toLowerCase().replace(/[^a-z0-9]/g, '');
                var slug = label.toLowerCase().replace(/[^a-z0-9]/g, '');

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

            var messageText = '';
            var consumedLabels = {};

            if (template && template.trim()) {
                messageText = template;
                fields.forEach(function(f) {
                    if (!f.value) return;
                    var patterns = [
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

                    patterns.forEach(function(pat) {
                        if (pat && messageText.indexOf(pat) !== -1) {
                            messageText = messageText.split(pat).join(f.value);
                            consumedLabels[f.label] = true;
                        }
                    });
                });

                var unconsumed = fields.filter(function(f) {
                    return !consumedLabels[f.label] && f.value;
                });

                if (unconsumed.length > 0) {
                    messageText += '\\n\\n*Informasi Tambahan:*';
                    unconsumed.forEach(function(f) {
                        messageText += '\\n• *' + f.label + '*: ' + f.value;
                    });
                }
            } else {
                messageText = 'Halo Admin, saya ingin pesan/konsultasi:\\n';
                fields.forEach(function(f) {
                    if (f.value) {
                        messageText += '\\n• *' + f.label + '*: ' + f.value;
                    }
                });
            }

            return messageText.trim();
        }

        function extractWhatsAppNumber(container, defaultNum) {
            var waNumber = defaultNum || '';
            if (!waNumber && container) {
                waNumber = container.getAttribute('data-wa-number') || '';
            }
            if (!waNumber && container) {
                var waLink = container.querySelector('a[href*="wa.me"], a[href*="whatsapp.com"], a.btn-whatsapp');
                var formAct = container.getAttribute('action') || '';
                var targetStr = (waLink ? waLink.getAttribute('href') : '') + ' ' + formAct;
                var wm = targetStr.match(/(?:wa\\.me\\/|phone=)([0-9+]+)/i);
                if (wm) {
                    waNumber = wm[1].replace(/[^0-9]/g, '');
                }
            }
            if (waNumber) {
                var clean = waNumber.replace(/[^0-9]/g, '');
                if (clean.indexOf('0') === 0) clean = '62' + clean.substring(1);
                return clean;
            }
            return '';
        }

        document.addEventListener('submit', function(e) {
            var form = e.target.closest('form');
            if (!form) return;
            e.preventDefault();

            var submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
            var originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';
            }

            var fields = harvestFormFields(form);
            var formData = new FormData(form);
            fields.forEach(function(f) {
                if (!f.name && f.label && f.value) {
                    formData.append(f.label, f.value);
                }
            });

            var gsheetUrl = form.getAttribute('data-gsheet-url') || (form.getAttribute('action') && form.getAttribute('action').indexOf('script.google.com/macros/s') !== -1 ? form.getAttribute('action') : '');
            var gsheetEnabled = form.getAttribute('data-bongkar-gsheet') === 'true' || !!gsheetUrl;

            var waNumber = extractWhatsAppNumber(form, form.getAttribute('data-wa-number'));
            var waTemplate = form.getAttribute('data-wa-template') || '';
            var waEnabled = form.getAttribute('data-bongkar-wa') === 'true' || !!waNumber;
            var successMsg = form.getAttribute('data-success-msg') || 'Terima kasih! Pesanan Anda telah berhasil dikirim.';

            var dispatches = [];
            if (gsheetEnabled && gsheetUrl) {
                var sheetPromise = fetch(gsheetUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: formData
                }).catch(function(err) {
                    console.warn('[Bongkar Form] Google Sheets Notice:', err);
                });
                dispatches.push(sheetPromise);
            }

            Promise.all(dispatches).finally(function() {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }

                if (waEnabled && waNumber) {
                    var messageText = buildWhatsAppMessage(fields, waTemplate);
                    var waUrl = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(messageText);
                    window.open(waUrl, '_blank');
                }

                alert(successMsg);
                form.reset();
            });
        });

        document.addEventListener('click', function(e) {
            var btn = e.target.closest('a[href*="wa.me"], a[href*="whatsapp.com"], a.btn-whatsapp, button.btn-whatsapp');
            if (!btn) return;

            var container = btn.closest('form, .bongkar-form, .card, [data-bongkar-form="true"]') || btn.parentElement;
            if (!container) return;

            var fields = harvestFormFields(container);
            var hasValues = fields.some(function(f) { return !!f.value; });
            if (hasValues) {
                var waNumber = extractWhatsAppNumber(container, btn.getAttribute('data-wa-number') || btn.getAttribute('href'));
                if (waNumber) {
                    e.preventDefault();
                    var waTemplate = container.getAttribute('data-wa-template') || '';
                    var messageText = buildWhatsAppMessage(fields, waTemplate);
                    var waUrl = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(messageText);
                    window.open(waUrl, '_blank');
                }
            }
        });
    })();
    <\/script>`;
        }

        // 7. Custom JavaScript & Algoritma
        let jsPayload = '';
        if (js && js.trim()) {
            if (opts.obfuscate) {
                // Unicode-safe Base64 encoding
                const encoded = btoa(encodeURIComponent(js).replace(/%([0-9A-F]{2})/g, function(match, p1) {
                    return String.fromCharCode('0x' + p1);
                }));
                jsPayload = `
    <!-- Bongkar Protected Scripts -->
    <script>
    (function() {
        try {
            setInterval(function(){ (function(){}).constructor("debugger")(); }, 1200);
            var _p = "${encoded}";
            var _c = decodeURIComponent(Array.prototype.map.call(atob(_p), function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            (new Function(_c))();
        } catch(e) {
            console.error('[Script Runtime Error]:', e);
        }
    })();
    <\/script>`;
            } else {
                jsPayload = `
    <!-- Custom Page Script -->
    <script>
    ${js}
    <\/script>`;
            }
        }

        // Detect Header & Footer in live canvas iframe if present
        const iframeEl = document.getElementById('bongkar-iframe-canvas');
        let headerMarkup = '';
        let footerMarkup = '';
        let hfCss = '';
        if (iframeEl && iframeEl.contentDocument) {
            const hEl = iframeEl.contentDocument.querySelector('.bongkar-canvas-preview-header');
            if (hEl) headerMarkup = `\n    <!-- Bongkar Header -->\n    <div id="bongkar-header-wrapper">\n        ${hEl.innerHTML.trim()}\n    </div>`;
            const fEl = iframeEl.contentDocument.querySelector('.bongkar-canvas-preview-footer');
            if (fEl) footerMarkup = `\n    <!-- Bongkar Footer -->\n    <div id="bongkar-footer-wrapper">\n        ${fEl.innerHTML.trim()}\n    </div>`;
            const hfStyleEl = iframeEl.contentDocument.getElementById('bongkar-hf-preview-css');
            if (hfStyleEl) hfCss = hfStyleEl.innerHTML.trim();
        }

        // 8. Assemble Full Document
        let fullDoc = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metaTitle}</title>
    ${metaDesc ? `<meta name="description" content="${metaDesc.replace(/"/g, '&quot;')}">` : ''}
    ${focusKeyword ? `<meta name="keywords" content="${focusKeyword.replace(/"/g, '&quot;')}">` : ''}
    ${faviconUrl ? `<link rel="icon" href="${faviconUrl}" type="image/x-icon">\n    <link rel="apple-touch-icon" href="${faviconUrl}">` : ''}
    <meta property="og:type" content="website">
    <meta property="og:title" content="${metaTitle.replace(/"/g, '&quot;')}">
    ${metaDesc ? `<meta property="og:description" content="${metaDesc.replace(/"/g, '&quot;')}">` : ''}
    ${ogImageUrl ? `<meta property="og:image" content="${ogImageUrl}">\n    <meta property="og:image:width" content="1200">\n    <meta property="og:image:height" content="630">\n    <meta name="twitter:image" content="${ogImageUrl}">` : ''}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${metaTitle.replace(/"/g, '&quot;')}">
    ${metaDesc ? `<meta name="twitter:description" content="${metaDesc.replace(/"/g, '&quot;')}">` : ''}

    <!-- Font Awesome 6 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
${googleFontsTag ? googleFontsTag + '\n' : ''}${extStylesTags ? extStylesTags + '\n' : ''}${safeTrackingStubs ? safeTrackingStubs + '\n' : ''}${trackingHead ? trackingHead + '\n' : ''}${sourceShieldScript ? sourceShieldScript + '\n' : ''}
    <style id="bongkar-page-styles">
        /* Basic clean reset & Theme Isolation */
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

        ${disableCopy ? `body, * { -webkit-user-select: none !important; -moz-user-select: none !important; -ms-user-select: none !important; user-select: none !important; }
        img { -webkit-user-drag: none !important; user-drag: none !important; pointer-events: none !important; }` : ''}
        ${hfCss ? hfCss + '\n' : ''}
        ${css}
    </style>
</head>
<body class="bongkar-page-body">
    ${headerMarkup}
    <!-- Main Page Content -->
    <div id="bongkar-page-content" class="bongkar-canvas-content">
${html}
    </div>
    ${footerMarkup}
${extScriptsTags ? extScriptsTags + '\n' : ''}${formEngineScript ? formEngineScript + '\n' : ''}${jsPayload ? jsPayload + '\n' : ''}${opts.tracking && customFooter ? '    ' + customFooter + '\n' : ''}
</body>
</html>`;

        // 9. Strip comments and compact if requested
        if (opts.compact) {
            fullDoc = fullDoc.replace(/<!--(?!\s*\[if).*?-->/gs, '');
            fullDoc = fullDoc.replace(/\n\s*\n\s*\n/g, '\n\n');
        }

        return fullDoc;
    }

    function bindExportActions() {
        const btnDownload = document.getElementById('btn-export-download');
        const btnCopy = document.getElementById('btn-export-copy');
        const filenameInput = document.getElementById('export-filename');
        const presetClean = document.getElementById('export-preset-clean');
        const presetProtected = document.getElementById('export-preset-protected');
        const togglePreviewBtn = document.getElementById('btn-toggle-export-preview');
        const previewWrap = document.getElementById('export-code-preview-wrap');
        const previewArea = document.getElementById('export-code-preview');
        const previewLabel = document.getElementById('export-preview-toggle-label');

        const optForms = document.getElementById('export-opt-forms');
        const optTracking = document.getElementById('export-opt-tracking');
        const optShield = document.getElementById('export-opt-shield');
        const optObfuscate = document.getElementById('export-opt-obfuscate');
        const optCompact = document.getElementById('export-opt-compact');

        // Preset 1: Clean & Portable
        if (presetClean) {
            presetClean.addEventListener('click', () => {
                presetClean.style.borderColor = '#6366f1';
                presetClean.style.background = 'rgba(99, 102, 241, 0.12)';
                if (presetProtected) {
                    presetProtected.style.borderColor = 'var(--border-color)';
                    presetProtected.style.background = 'var(--bg-surface-elevated)';
                }
                if (optForms) optForms.checked = true;
                if (optTracking) optTracking.checked = true;
                if (optShield) optShield.checked = false;
                if (optObfuscate) optObfuscate.checked = false;
                if (optCompact) optCompact.checked = true;

                if (btnDownload) {
                    btnDownload.style.background = '#4f46e5';
                    btnDownload.style.borderColor = '#4338ca';
                    btnDownload.innerHTML = '<i class="fa-solid fa-download"></i> Download File .html';
                }
                refreshExportState();
            });
        }

        // Preset 2: Protected & Hardened
        if (presetProtected) {
            presetProtected.addEventListener('click', () => {
                presetProtected.style.borderColor = '#22c55e';
                presetProtected.style.background = 'rgba(34, 197, 94, 0.12)';
                if (presetClean) {
                    presetClean.style.borderColor = 'var(--border-color)';
                    presetClean.style.background = 'var(--bg-surface-elevated)';
                }
                if (optForms) optForms.checked = true;
                if (optTracking) optTracking.checked = true;
                if (optShield) optShield.checked = true;
                if (optObfuscate) optObfuscate.checked = true;
                if (optCompact) optCompact.checked = true;

                if (btnDownload) {
                    btnDownload.style.background = '#15803d';
                    btnDownload.style.borderColor = '#166534';
                    btnDownload.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Download Protected .html';
                }
                refreshExportState();
            });
        }

        // Live options change
        [optForms, optTracking, optShield, optObfuscate, optCompact].forEach(cb => {
            if (cb) {
                cb.addEventListener('change', () => {
                    refreshExportState();
                });
            }
        });

        // Toggle code preview box
        if (togglePreviewBtn && previewWrap && previewArea) {
            togglePreviewBtn.addEventListener('click', () => {
                const isHidden = previewWrap.style.display === 'none';
                if (isHidden) {
                    previewWrap.style.display = 'block';
                    previewArea.value = currentGeneratedHTML;
                    if (previewLabel) previewLabel.textContent = 'Sembunyikan Pratinjau';
                } else {
                    previewWrap.style.display = 'none';
                    if (previewLabel) previewLabel.textContent = 'Lihat Pratinjau Kode';
                }
            });
        }

        // Download Action
        if (btnDownload) {
            btnDownload.addEventListener('click', () => {
                const opts = getExportOptions();
                const content = generateStandaloneHTML(opts);
                let filename = filenameInput ? filenameInput.value.trim() : 'landing-page.html';
                if (!filename) filename = 'landing-page.html';
                if (!filename.endsWith('.html')) filename += '.html';

                const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                const originalHtml = btnDownload.innerHTML;
                btnDownload.innerHTML = '<i class="fa-solid fa-check"></i> File Berhasil Didownload!';
                setTimeout(() => {
                    btnDownload.innerHTML = originalHtml;
                    closeModal();
                }, 1400);
            });
        }

        // Copy Action
        if (btnCopy) {
            btnCopy.addEventListener('click', () => {
                const opts = getExportOptions();
                const content = generateStandaloneHTML(opts);
                navigator.clipboard.writeText(content).then(() => {
                    const originalHtml = btnCopy.innerHTML;
                    btnCopy.innerHTML = '<i class="fa-solid fa-check" style="color: #22c55e;"></i> Kode Tersalin!';
                    setTimeout(() => {
                        btnCopy.innerHTML = originalHtml;
                    }, 1500);
                }).catch(err => {
                    console.error('Clipboard copy failed:', err);
                    alert('Gagal menyalin ke clipboard. Silakan gunakan tombol Download atau buka Pratinjau Kode.');
                });
            });
        }
    }

    return {
        init: init,
        openModal: openModal,
        closeModal: closeModal,
        getActiveCanvasHTML: getActiveCanvasHTML,
        generateStandaloneHTML: generateStandaloneHTML,
        refreshExportState: refreshExportState
    };
})();

// Auto-init Exporter on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.BongkarExporter) window.BongkarExporter.init();
    });
} else {
    if (window.BongkarExporter) window.BongkarExporter.init();
}
