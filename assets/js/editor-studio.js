/**
 * Bongkar Studio Master Controller
 * Handles application lifecycle, tabs, device switcher, save/publish,
 * history stack (undo/redo), and canvas iframe messaging.
 */

(function () {
    let currentCanvasHTML = (window.bongkarStudioConfig && window.bongkarStudioConfig.initialHtml) ? window.bongkarStudioConfig.initialHtml : '';
    let isDirty = false;
    let historyStack = [];
    let historyIndex = -1;
    const MAX_HISTORY = 30;

    function init() {
        initTabs();
        initDeviceSwitcher();
        initInteractionModeSwitcher();
        initSidebarCollapse();
        initSaveSystem();
        initHistory();
        initCanvasMessaging();
        initSubmodules();
        initSettingsLiveSync();
        initIdentityMediaPickers();
        initShortcuts();
        initCanvasContextBridge();
    }

    /**
     * Bridge right-click context menu from parent viewport wrapper to canvas
     */
    function initCanvasContextBridge() {
        const canvasViewport = document.getElementById('canvas-viewport');
        if (canvasViewport) {
            canvasViewport.addEventListener('contextmenu', (e) => {
                const iframe = document.getElementById('bongkar-iframe-canvas');
                if (iframe && iframe.contentWindow && e.target !== iframe) {
                    e.preventDefault();
                    const rect = iframe.getBoundingClientRect();
                    const relativeX = e.clientX - rect.left;
                    const relativeY = e.clientY - rect.top;
                    iframe.contentWindow.postMessage({
                        type: 'BONGKAR_TRIGGER_CONTEXT_MENU',
                        clientX: relativeX > 0 ? relativeX : 50,
                        clientY: relativeY > 0 ? relativeY : 50
                    }, '*');
                }
            });
        }
    }

    /**
     * Sidebar Collapse / Expand (Elementor Style)
     */
    function initSidebarCollapse() {
        const btnToggle = document.getElementById('btn-toggle-sidebar');
        const sidebar = document.getElementById('studio-sidebar');
        if (!btnToggle || !sidebar) return;

        btnToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            window.dispatchEvent(new Event('resize'));
        });

        // Keyboard Shortcut: Ctrl + \ to toggle sidebar
        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
                sidebar.classList.toggle('collapsed');
                window.dispatchEvent(new Event('resize'));
                e.preventDefault();
            }
        });
    }

    /**
     * Canvas Mode Switcher: Mode Desain vs Mode Interaktif (Live Testing)
     */
    function initInteractionModeSwitcher() {
        const btnDesign = document.getElementById('btn-mode-design');
        const btnInteractive = document.getElementById('btn-mode-interactive');
        const toast = document.getElementById('canvas-interactive-toast');
        const btnExitToast = document.getElementById('btn-exit-interactive-mode');
        const iframe = document.getElementById('bongkar-iframe-canvas');

        function setMode(mode) {
            const isInteractive = (mode === 'interactive');
            if (btnDesign) btnDesign.classList.toggle('active', !isInteractive);
            if (btnInteractive) btnInteractive.classList.toggle('active', isInteractive);
            if (toast) toast.style.display = isInteractive ? 'flex' : 'none';

            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'BONGKAR_SET_INTERACTION_MODE',
                    mode: mode
                }, '*');
            }

            if (window.BongkarScriptManager && typeof window.BongkarScriptManager.logToConsole === 'function') {
                if (isInteractive) {
                    window.BongkarScriptManager.logToConsole('[Mode Interaktif] Live Testing aktif: Slider, kalkulator, accordion, popup & form berjalan 100% seperti website asli.');
                } else {
                    window.BongkarScriptManager.logToConsole('[Mode Desain] Edit aktif: Klik elemen untuk mengedit style dan script.');
                }
            }
        }

        if (btnDesign) {
            btnDesign.addEventListener('click', () => setMode('design'));
        }
        if (btnInteractive) {
            btnInteractive.addEventListener('click', () => setMode('interactive'));
        }
        if (btnExitToast) {
            btnExitToast.addEventListener('click', () => setMode('design'));
        }

        // Toggle Modal / Pop-up Editing Mode
        const btnToggleModal = document.getElementById('btn-toggle-modal-edit');
        if (btnToggleModal) {
            btnToggleModal.addEventListener('click', () => {
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage({
                        type: 'BONGKAR_TOGGLE_MODAL_EDIT'
                    }, '*');
                }
            });
        }

        // Keyboard Shortcut: Ctrl + I or Alt + I to toggle interactive mode
        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i' && !e.shiftKey) {
                const isCurrentlyInteractive = btnInteractive && btnInteractive.classList.contains('active');
                setMode(isCurrentlyInteractive ? 'design' : 'interactive');
                e.preventDefault();
            }
        });
    }

    /**
     * Initialize submodules
     */
    function initSubmodules() {
        if (window.BongkarInspector) window.BongkarInspector.init();
        if (window.BongkarSectionManager) window.BongkarSectionManager.init();
        if (window.BongkarIconPicker) window.BongkarIconPicker.init();
        if (window.BongkarScriptManager) window.BongkarScriptManager.init();
        if (window.BongkarSEOAudit) window.BongkarSEOAudit.init();
        if (window.BongkarImporter) window.BongkarImporter.init();

        // Bind quick navigation buttons from Inspector to Elements (Widgets) panel
        document.querySelectorAll('.btn-go-widgets, #btn-back-to-widgets').forEach(btn => {
            btn.addEventListener('click', () => {
                const elementsTab = document.querySelector('.sidebar-tab-btn[data-tab="elements"]');
                if (elementsTab) elementsTab.click();
            });
        });
    }

    /**
     * Sidebar tab navigation
     */
    function initTabs() {
        const tabButtons = document.querySelectorAll('.sidebar-tab-btn');
        const panels = document.querySelectorAll('.sidebar-panel');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');

                tabButtons.forEach(b => b.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));

                btn.classList.add('active');
                const panel = document.getElementById(`tab-${targetTab}`);
                if (panel) panel.classList.add('active');
            });
        });
    }

    /**
     * Device switcher (Desktop, Tablet, Mobile)
     */
    function initDeviceSwitcher() {
        const deviceButtons = document.querySelectorAll('.device-btn');
        const viewport = document.getElementById('canvas-viewport');

        deviceButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const device = btn.getAttribute('data-device');
                deviceButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                viewport.classList.remove('mode-desktop', 'mode-tablet', 'mode-mobile');
                viewport.classList.add(`mode-${device}`);
            });
        });
    }

    /**
     * History (Undo / Redo) Manager
     */
    function initHistory() {
        const btnUndo = document.getElementById('btn-undo');
        const btnRedo = document.getElementById('btn-redo');

        btnUndo.addEventListener('click', undo);
        btnRedo.addEventListener('click', redo);

        updateHistoryButtons();
    }

    function pushHistorySnapshot(html) {
        if (!html || html === historyStack[historyIndex]) return;

        // Truncate future branch if user made changes after an undo
        if (historyIndex < historyStack.length - 1) {
            historyStack = historyStack.slice(0, historyIndex + 1);
        }

        historyStack.push(html);
        if (historyStack.length > MAX_HISTORY) {
            historyStack.shift();
        } else {
            historyIndex++;
        }

        updateHistoryButtons();
    }

    function undo() {
        if (historyIndex > 0) {
            historyIndex--;
            applyHistoryState(historyStack[historyIndex]);
        }
    }

    function redo() {
        if (historyIndex < historyStack.length - 1) {
            historyIndex++;
            applyHistoryState(historyStack[historyIndex]);
        }
    }

    function applyHistoryState(html) {
        const iframe = document.getElementById('bongkar-iframe-canvas');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'BONGKAR_REPLACE_ENTIRE_HTML',
                html: html
            }, '*');
            currentCanvasHTML = html;
            markDirty(true);
            updateHistoryButtons();
        }
    }

    function updateHistoryButtons() {
        const btnUndo = document.getElementById('btn-undo');
        const btnRedo = document.getElementById('btn-redo');

        btnUndo.style.opacity = historyIndex > 0 ? '1' : '0.4';
        btnUndo.style.pointerEvents = historyIndex > 0 ? 'auto' : 'none';

        btnRedo.style.opacity = historyIndex < historyStack.length - 1 ? '1' : '0.4';
        btnRedo.style.pointerEvents = historyIndex < historyStack.length - 1 ? 'auto' : 'none';
    }

    /**
     * Deep Auto-Detection for Page Meta SEO, Tracking & Analytics
     * Automatically tracks Google Tag ID, Meta Pixel ID, Microsoft Clarity ID,
     * SEO Meta Title, Meta Description, Focus Keyword, OG Image, Favicon, and Custom Head.
     */
    function autoDetectPageMetaAndTracking(canvasHtml, fullDocHtml, customScript, forceUpdate = false) {
        const docStr = (fullDocHtml || '') + '\n' + (canvasHtml || '');
        const scriptStr = (customScript || '') + '\n' + (document.getElementById('algo-code-editor')?.value || '') + '\n' + (document.getElementById('setting-custom-head')?.value || '') + '\n' + (document.getElementById('setting-custom-footer')?.value || '');
        const combined = docStr + '\n' + scriptStr;

        if (!combined.trim()) return;

        // 1. Google Tag ID (GA4 / GTM / Google Ads / Universal Analytics)
        const gtagEl = document.getElementById('setting-gtag-id');
        if (gtagEl && (!gtagEl.value.trim() || forceUpdate)) {
            let detectedGtag = '';
            const m1 = combined.match(/googletagmanager\.com\/gtag\/js\?id=([a-zA-Z0-9_-]+)/i);
            const m2 = combined.match(/googletagmanager\.com\/gtm\.js\?id=([a-zA-Z0-9_-]+)/i);
            const m3 = combined.match(/gtag\(\s*['"]config['"]\s*,\s*['"]([a-zA-Z0-9_-]+)['"]/i);
            const m4 = combined.match(/['"](G-[A-Za-z0-9_-]{5,20}|GTM-[A-Za-z0-9_-]{5,20}|AW-[0-9]{6,15}|UA-[0-9]{5,12}-[0-9]{1,3})['"]/i);
            if (m1) detectedGtag = m1[1];
            else if (m2) detectedGtag = m2[1];
            else if (m3) detectedGtag = m3[1];
            else if (m4) detectedGtag = m4[1];

            if (detectedGtag && detectedGtag !== gtagEl.value) {
                gtagEl.value = detectedGtag;
                gtagEl.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }

        // 2. Meta (Facebook) Pixel ID
        const pixelEl = document.getElementById('setting-meta-pixel-id');
        if (pixelEl && (!pixelEl.value.trim() || forceUpdate)) {
            let detectedPixel = '';
            const p1 = combined.match(/fbq\(\s*['"]init['"]\s*,\s*['"]([0-9]{8,25})['"]/i);
            const p2 = combined.match(/connect\.facebook\.net\/[^"']+\/fbevents\.js.*?id=([0-9]{8,25})/i);
            if (p1) detectedPixel = p1[1];
            else if (p2) detectedPixel = p2[1];

            if (detectedPixel && detectedPixel !== pixelEl.value) {
                pixelEl.value = detectedPixel;
                pixelEl.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }

        // 3. Microsoft Clarity Project ID
        const clarityEl = document.getElementById('setting-clarity-id');
        if (clarityEl && (!clarityEl.value.trim() || forceUpdate)) {
            let detectedClarity = '';
            const c1 = combined.match(/clarity\.ms\/tag\/([a-zA-Z0-9_-]+)/i);
            const c2 = combined.match(/clarity\(\s*['"](?:init|tag)['"]\s*,\s*['"]([a-zA-Z0-9_-]+)['"]/i);
            const c3 = combined.match(/\(window,\s*document,\s*['"]clarity['"],\s*['"]script['"],\s*['"]([a-zA-Z0-9_-]+)['"]\)/i);
            if (c1) detectedClarity = c1[1];
            else if (c2) detectedClarity = c2[1];
            else if (c3) detectedClarity = c3[1];

            if (detectedClarity && detectedClarity !== clarityEl.value) {
                clarityEl.value = detectedClarity;
                clarityEl.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }

        // 4. Meta Title
        const titleEl = document.getElementById('setting-meta-title');
        if (titleEl && (!titleEl.value.trim() || forceUpdate)) {
            let detectedTitle = '';
            const t1 = docStr.match(/<title\b[^>]*>(.*?)<\/title>/i);
            const t2 = docStr.match(/<meta\b[^>]*property=['"]og:title['"][^>]*content=['"]([^'"]*)['"]/i) || docStr.match(/<meta\b[^>]*content=['"]([^'"]*)['"][^>]*property=['"]og:title['"]/i);
            const t3 = docStr.match(/<meta\b[^>]*name=['"]twitter:title['"][^>]*content=['"]([^'"]*)['"]/i) || docStr.match(/<meta\b[^>]*content=['"]([^'"]*)['"][^>]*name=['"]twitter:title['"]/i);
            if (t1) detectedTitle = t1[1].trim();
            else if (t2) detectedTitle = t2[1].trim();
            else if (t3) detectedTitle = t3[1].trim();

            if (detectedTitle && !detectedTitle.startsWith('Canvas Frame -') && !detectedTitle.startsWith('Bongkar Studio -') && detectedTitle !== titleEl.value) {
                titleEl.value = detectedTitle;
                titleEl.dispatchEvent(new Event('input', { bubbles: true }));
                const waPreviewTitle = document.getElementById('whatsapp-preview-title');
                if (waPreviewTitle) waPreviewTitle.innerText = detectedTitle;
            }
        }

        // 5. Meta Description
        const descEl = document.getElementById('setting-meta-desc');
        if (descEl && (!descEl.value.trim() || forceUpdate)) {
            let detectedDesc = '';
            const d1 = docStr.match(/<meta\b[^>]*name=['"]description['"][^>]*content=['"]([^'"]*)['"]/i) || docStr.match(/<meta\b[^>]*content=['"]([^'"]*)['"][^>]*name=['"]description['"]/i);
            const d2 = docStr.match(/<meta\b[^>]*property=['"]og:description['"][^>]*content=['"]([^'"]*)['"]/i) || docStr.match(/<meta\b[^>]*content=['"]([^'"]*)['"][^>]*property=['"]og:description['"]/i);
            const d3 = docStr.match(/<meta\b[^>]*name=['"]twitter:description['"][^>]*content=['"]([^'"]*)['"]/i) || docStr.match(/<meta\b[^>]*content=['"]([^'"]*)['"][^>]*name=['"]twitter:description['"]/i);
            if (d1) detectedDesc = d1[1].trim();
            else if (d2) detectedDesc = d2[1].trim();
            else if (d3) detectedDesc = d3[1].trim();

            if (detectedDesc && detectedDesc !== descEl.value) {
                descEl.value = detectedDesc;
                descEl.dispatchEvent(new Event('input', { bubbles: true }));
                const waPreviewDesc = document.getElementById('whatsapp-preview-desc');
                if (waPreviewDesc) waPreviewDesc.innerText = detectedDesc;
            }
        }

        // 6. Focus Keyword
        const kwEl = document.getElementById('seo-focus-keyword');
        if (kwEl && (!kwEl.value.trim() || forceUpdate)) {
            let detectedKw = '';
            const k1 = docStr.match(/<meta\b[^>]*name=['"]keywords['"][^>]*content=['"]([^'"]*)['"]/i) || docStr.match(/<meta\b[^>]*content=['"]([^'"]*)['"][^>]*name=['"]keywords['"]/i);
            if (k1) detectedKw = k1[1].trim();
            if (detectedKw && detectedKw !== kwEl.value) {
                kwEl.value = detectedKw;
                kwEl.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }

        // 7. Social Share Thumbnail (OG Image)
        const ogInput = document.getElementById('setting-og-image-url');
        if (ogInput && (!ogInput.value.trim() || forceUpdate)) {
            let detectedOg = '';
            const o1 = docStr.match(/<meta\b[^>]*property=['"]og:image['"][^>]*content=['"]([^'"]*)['"]/i) || docStr.match(/<meta\b[^>]*content=['"]([^'"]*)['"][^>]*property=['"]og:image['"]/i);
            const o2 = docStr.match(/<meta\b[^>]*name=['"]twitter:image['"][^>]*content=['"]([^'"]*)['"]/i) || docStr.match(/<meta\b[^>]*content=['"]([^'"]*)['"][^>]*name=['"]twitter:image['"]/i);
            if (o1) detectedOg = o1[1].trim();
            else if (o2) detectedOg = o2[1].trim();

            if (detectedOg && detectedOg !== ogInput.value) {
                ogInput.value = detectedOg;
                ogInput.dispatchEvent(new Event('input', { bubbles: true }));
                const waImg = document.getElementById('whatsapp-preview-img');
                if (waImg) waImg.src = detectedOg;
                const ogThumb = document.getElementById('og-image-thumb');
                if (ogThumb) ogThumb.src = detectedOg;
            }
        }

        // 8. Favicon
        const favInput = document.getElementById('setting-favicon-url');
        if (favInput && (!favInput.value.trim() || forceUpdate)) {
            let detectedFav = '';
            const f1 = docStr.match(/<link\b[^>]*rel=['"](?:shortcut )?icon['"][^>]*href=['"]([^'"]*)['"]/i) || docStr.match(/<link\b[^>]*href=['"]([^'"]*)['"][^>]*rel=['"](?:shortcut )?icon['"]/i);
            if (f1) detectedFav = f1[1].trim();
            if (detectedFav && detectedFav !== favInput.value) {
                favInput.value = detectedFav;
                favInput.dispatchEvent(new Event('input', { bubbles: true }));
                const favThumb = document.getElementById('favicon-thumb');
                if (favThumb) favThumb.src = detectedFav;
            }
        }

        // 9. Custom Verification Head Tags
        const verifMatches = docStr.match(/<meta\b[^>]*name=['"](?:google-site-verification|facebook-domain-verification|msvalidate\.01|yandex-verification)['"][^>]*>/gi);
        if (verifMatches && verifMatches.length > 0) {
            const headEl = document.getElementById('setting-custom-head');
            if (headEl) {
                verifMatches.forEach(tag => {
                    if (!headEl.value.includes(tag.trim())) {
                        headEl.value = (headEl.value.trim() ? headEl.value.trim() + '\n' : '') + tag.trim();
                        headEl.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                });
            }
        }
    }

    /**
     * Canvas Iframe Message Listener
     */
    function initCanvasMessaging() {
        window.addEventListener('message', (event) => {
            const data = event.data;
            if (!data || !data.type) return;

            switch (data.type) {
                case 'BONGKAR_CANVAS_READY':
                    currentCanvasHTML = data.html;
                    pushHistorySnapshot(data.html);
                    autoDetectPageMetaAndTracking(data.html, data.fullDocument, data.customScript);
                    if (window.BongkarScriptManager) {
                        window.BongkarScriptManager.detectAlgorithms();
                    }
                    if (window.BongkarSEOAudit) {
                        window.BongkarSEOAudit.runAudit();
                    }
                    break;

                case 'BONGKAR_CONTENT_CHANGED':
                    currentCanvasHTML = data.html;
                    pushHistorySnapshot(data.html);
                    markDirty(true);
                    autoDetectPageMetaAndTracking(data.html, data.fullDocument, data.customScript);
                    if (window.BongkarScriptManager) {
                        window.BongkarScriptManager.detectAlgorithms();
                    }
                    if (window.BongkarSEOAudit) {
                        window.BongkarSEOAudit.runAudit();
                    }
                    break;

                case 'BONGKAR_JS_STATUS':
                    if (window.BongkarScriptManager) {
                        window.BongkarScriptManager.handleStatus(data);
                    }
                    break;

                case 'BONGKAR_ELEMENT_SELECTED':
                    if (window.BongkarInspector) {
                        window.BongkarInspector.onElementSelected(data);
                    }
                    // Auto switch to Inspector tab if not already there
                    const inspectorTab = document.querySelector('.sidebar-tab-btn[data-tab="inspector"]');
                    if (inspectorTab && !inspectorTab.classList.contains('active')) {
                        inspectorTab.click();
                    }
                    break;

                case 'BONGKAR_ELEMENT_DESELECTED':
                    if (window.BongkarInspector) {
                        window.BongkarInspector.onElementDeselected();
                    }
                    break;

                case 'BONGKAR_REQUEST_ADD_SECTION':
                    if (window.BongkarSectionManager) {
                        window.BongkarSectionManager.setPendingInsertIndex(data.insertIndex, data.targetInfo);
                    }
                    break;

                case 'BONGKAR_REQUEST_DIRECT_LAYOUT':
                    if (window.BongkarSectionManager && data.layout) {
                        if (typeof data.insertIndex === 'number') {
                            window.BongkarSectionManager.setPendingInsertIndex(data.insertIndex);
                        }
                        window.BongkarSectionManager.insertComponent(data.layout);
                    }
                    break;

                case 'BONGKAR_DIRECT_LAYOUT_INSERTED': {
                    const inspectorTabBtn = document.querySelector('.sidebar-tab-btn[data-tab="inspector"]');
                    if (inspectorTabBtn) inspectorTabBtn.click();
                    break;
                }

                case 'BONGKAR_OPEN_IMPORTER':
                    if (window.BongkarImporter && typeof window.BongkarImporter.openModal === 'function') {
                        window.BongkarImporter.openModal();
                    } else {
                        const importerModal = document.getElementById('modal-importer');
                        if (importerModal) importerModal.classList.add('active');
                    }
                    break;

                case 'BONGKAR_CLIPBOARD_SYNC':
                    if (data.text && navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(data.text).catch(() => {});
                    }
                    break;

                case 'BONGKAR_OPEN_MEDIA_PICKER':
                    // Auto switch to Inspector tab if not already active
                    const inspectorTabMedia = document.querySelector('.sidebar-tab-btn[data-tab="inspector"]');
                    if (inspectorTabMedia && !inspectorTabMedia.classList.contains('active')) {
                        inspectorTabMedia.click();
                    }
                    if (window.BongkarInspector && typeof window.BongkarInspector.switchSubTab === 'function') {
                        window.BongkarInspector.switchSubTab('content');
                    }
                    // Trigger WP Media Library picker button
                    const btnWpMedia = document.getElementById('btn-wp-media-picker');
                    if (btnWpMedia) {
                        btnWpMedia.click();
                    }
                    break;

                case 'BONGKAR_MODAL_EDIT_STATE': {
                    const btnModalToggle = document.getElementById('btn-toggle-modal-edit');
                    if (btnModalToggle) {
                        btnModalToggle.classList.toggle('active', !!data.active);
                    }
                    break;
                }
            }
        });
    }

    /**
     * Live sync of Page Settings (Custom CSS & JS)
     */
    function initSettingsLiveSync() {
        const cssInput = document.getElementById('setting-custom-css');
        if (cssInput) {
            cssInput.addEventListener('input', () => {
                const iframe = document.getElementById('bongkar-iframe-canvas');
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage({
                        type: 'BONGKAR_UPDATE_PAGE_CSS',
                        css: cssInput.value
                    }, '*');
                }
                markDirty(true);
            });
        }

        // Live Layout & Header/Footer template selection switcher
        const pageLayoutSelect = document.getElementById('setting-page-layout');
        const hfOptionsWrap = document.getElementById('setting-hf-options-wrap');
        const headerIdSelect = document.getElementById('setting-header-id');
        const footerIdSelect = document.getElementById('setting-footer-id');

        function triggerLayoutUpdate() {
            markDirty(true);
            saveDraft(false);
            const iframe = document.getElementById('bongkar-iframe-canvas');
            if (iframe) {
                setTimeout(() => {
                    iframe.src = iframe.src;
                }, 350);
            }
        }

        if (pageLayoutSelect) {
            pageLayoutSelect.addEventListener('change', () => {
                if (hfOptionsWrap) {
                    hfOptionsWrap.style.display = pageLayoutSelect.value === 'header_footer' ? 'block' : 'none';
                }
                triggerLayoutUpdate();
            });
        }
        if (headerIdSelect) {
            headerIdSelect.addEventListener('change', triggerLayoutUpdate);
        }
        if (footerIdSelect) {
            footerIdSelect.addEventListener('change', triggerLayoutUpdate);
        }

        // Live Content Shield toggler
        const shieldToggle = document.getElementById('setting-content-shield');
        const shieldWrap = document.getElementById('setting-shield-options-wrap');
        if (shieldToggle && shieldWrap) {
            shieldToggle.addEventListener('change', () => {
                shieldWrap.style.display = shieldToggle.checked ? 'block' : 'none';
                markDirty(true);
            });
        }
        ['setting-shield-copy-mode', 'setting-shield-anti-inspect', 'setting-shield-watermark'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', () => markDirty(true));
                el.addEventListener('input', () => markDirty(true));
            }
        });
    }

    /**
     * Favicon & Social Share (WhatsApp) Media Pickers
     */
    function initIdentityMediaPickers() {
        let ogMediaFrame = null;
        let faviconMediaFrame = null;

        const defaultThumb = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect width="100%25" height="100%25" fill="%23334155"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="12" fill="%2394a3b8" dominant-baseline="middle" text-anchor="middle"%3EIMG%3C/text%3E%3C/svg%3E';
        const defaultWaImg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="160" viewBox="0 0 300 160"%3E%3Crect width="100%25" height="100%25" fill="%231f2c34"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="12" fill="%238696a0" dominant-baseline="middle" text-anchor="middle"%3EBelum Ada Thumbnail Share%3C/text%3E%3C/svg%3E';
        const defaultFavicon = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"%3E%3Ccircle cx="18" cy="18" r="16" fill="%236366f1"/%3E%3Ctext x="18" y="23" font-size="16" fill="white" font-family="Arial" font-weight="bold" text-anchor="middle"%3EB%3C/text%3E%3C/svg%3E';

        // 1. WhatsApp / OG Image
        const ogInput = document.getElementById('setting-og-image-url');
        const ogThumb = document.getElementById('og-image-thumb');
        const waImg = document.getElementById('whatsapp-preview-img');
        const btnUploadOg = document.getElementById('btn-upload-og-image');
        const btnRemoveOg = document.getElementById('btn-remove-og-image');

        function updateOgPreview(url) {
            if (ogThumb) ogThumb.src = url || defaultThumb;
            if (waImg) waImg.src = url || defaultWaImg;
            if (ogInput && ogInput.value !== url) ogInput.value = url;
            if (window.BongkarSEOAudit && typeof window.BongkarSEOAudit.runAudit === 'function') {
                window.BongkarSEOAudit.runAudit();
            }
        }

        if (btnUploadOg) {
            btnUploadOg.addEventListener('click', (e) => {
                e.preventDefault();
                if (ogMediaFrame) {
                    ogMediaFrame.open();
                    return;
                }
                ogMediaFrame = wp.media({
                    title: 'Pilih Gambar Thumbnail Share (WhatsApp / Facebook / Twitter)',
                    button: { text: 'Gunakan Gambar Ini' },
                    library: { type: 'image' },
                    multiple: false
                });
                ogMediaFrame.on('select', () => {
                    const attachment = ogMediaFrame.state().get('selection').first().toJSON();
                    updateOgPreview(attachment.url);
                    markDirty(true);
                });
                ogMediaFrame.open();
            });
        }

        if (btnRemoveOg) {
            btnRemoveOg.addEventListener('click', () => {
                updateOgPreview('');
                markDirty(true);
            });
        }

        if (ogInput) {
            ogInput.addEventListener('input', () => {
                updateOgPreview(ogInput.value.trim());
                markDirty(true);
            });
        }

        // 2. Favicon & Browser Tab Icon
        const faviconInput = document.getElementById('setting-favicon-url');
        const faviconThumb = document.getElementById('favicon-preview-thumb');
        const tabFaviconImg = document.getElementById('browser-tab-favicon-img');
        const btnUploadFavicon = document.getElementById('btn-upload-favicon');
        const btnRemoveFavicon = document.getElementById('btn-remove-favicon');

        function updateFaviconPreview(url) {
            const displayUrl = url || window.bongkarStudioConfig.defaultSiteIconUrl || defaultFavicon;
            if (faviconThumb) faviconThumb.src = displayUrl;
            if (tabFaviconImg) tabFaviconImg.src = displayUrl;
            if (faviconInput && faviconInput.value !== url) faviconInput.value = url;
        }

        if (btnUploadFavicon) {
            btnUploadFavicon.addEventListener('click', (e) => {
                e.preventDefault();
                if (faviconMediaFrame) {
                    faviconMediaFrame.open();
                    return;
                }
                faviconMediaFrame = wp.media({
                    title: 'Pilih Favicon Browser Tab (Bulat / Kotak)',
                    button: { text: 'Gunakan Favicon Ini' },
                    library: { type: 'image' },
                    multiple: false
                });
                faviconMediaFrame.on('select', () => {
                    const attachment = faviconMediaFrame.state().get('selection').first().toJSON();
                    updateFaviconPreview(attachment.url);
                    markDirty(true);
                });
                faviconMediaFrame.open();
            });
        }

        if (btnRemoveFavicon) {
            btnRemoveFavicon.addEventListener('click', () => {
                const defaultUrl = window.bongkarStudioConfig.defaultSiteIconUrl || '';
                updateFaviconPreview(defaultUrl);
                if (faviconInput) faviconInput.value = '';
                markDirty(true);
            });
        }

        if (faviconInput) {
            faviconInput.addEventListener('input', () => {
                updateFaviconPreview(faviconInput.value.trim());
                markDirty(true);
            });
        }
    }

    /**
     * Elementor-Style Autosave & Publish System
     */
    let isSaving = false;
    let autosaveDebounceTimer = null;
    let autosaveInterval = null;

    function initSaveSystem() {
        const btnPublish = document.getElementById('btn-save-page');
        const btnSaveDraft = document.getElementById('btn-save-draft');

        if (btnPublish) {
            btnPublish.addEventListener('click', () => publishPage());
        }

        if (btnSaveDraft) {
            btnSaveDraft.addEventListener('click', () => saveDraft(true));
        }

        const btnPreview = document.getElementById('btn-preview-link');
        if (btnPreview) {
            btnPreview.addEventListener('click', () => {
                if (isDirty) {
                    saveDraft(false);
                }
            });
        }

        // Elementor-style Background Autosave Ticker (Every 30 seconds if dirty)
        autosaveInterval = setInterval(() => {
            if (isDirty && !isSaving) {
                saveDraft(false);
            }
        }, 30000);
    }

    function buildFormData(actionName) {
        const css = document.getElementById('setting-custom-css') ? document.getElementById('setting-custom-css').value : '';
        const js = window.BongkarScriptManager ? window.BongkarScriptManager.getScript() : (document.getElementById('algo-code-editor') ? document.getElementById('algo-code-editor').value : '');
        const extScripts = window.BongkarScriptManager ? window.BongkarScriptManager.getExternalScripts() : [];
        const extStyles = window.BongkarScriptManager ? window.BongkarScriptManager.getExternalStyles() : [];
        const metaTitle = document.getElementById('setting-meta-title') ? document.getElementById('setting-meta-title').value : '';
        const metaDesc = document.getElementById('setting-meta-desc') ? document.getElementById('setting-meta-desc').value : '';
        const focusKeyword = document.getElementById('seo-focus-keyword') ? document.getElementById('seo-focus-keyword').value : '';
        const seoScore = window.BongkarSEOAudit ? window.BongkarSEOAudit.getScore() : 0;
        const gtagId = document.getElementById('setting-gtag-id') ? document.getElementById('setting-gtag-id').value.trim() : '';
        const metaPixelId = document.getElementById('setting-meta-pixel-id') ? document.getElementById('setting-meta-pixel-id').value.trim() : '';
        const clarityId = document.getElementById('setting-clarity-id') ? document.getElementById('setting-clarity-id').value.trim() : '';
        const customHead = document.getElementById('setting-custom-head') ? document.getElementById('setting-custom-head').value : '';
        const customFooter = document.getElementById('setting-custom-footer') ? document.getElementById('setting-custom-footer').value : '';
        const faviconUrl = document.getElementById('setting-favicon-url') ? document.getElementById('setting-favicon-url').value.trim() : '';
        const ogImageUrl = document.getElementById('setting-og-image-url') ? document.getElementById('setting-og-image-url').value.trim() : '';
        const fonts = window.BongkarInspector ? window.BongkarInspector.getActiveGoogleFonts() : [];

        // Content Shield & Anti-Theft Settings
        const contentShield = document.getElementById('setting-content-shield') ? document.getElementById('setting-content-shield').checked : false;
        const shieldAntiInspect = document.getElementById('setting-shield-anti-inspect') ? document.getElementById('setting-shield-anti-inspect').checked : false;
        const shieldCopyMode = document.getElementById('setting-shield-copy-mode') ? document.getElementById('setting-shield-copy-mode').value : 'smart_watermark';
        const shieldWatermark = document.getElementById('setting-shield-watermark') ? document.getElementById('setting-shield-watermark').value.trim() : '';

        // Fail-safe: Always ensure we have the latest canvas HTML and never send empty string
        let htmlToSend = currentCanvasHTML;
        if (!htmlToSend || !htmlToSend.trim()) {
            const iframe = document.getElementById('bongkar-iframe-canvas');
            if (iframe && iframe.contentDocument) {
                const root = iframe.contentDocument.getElementById('bongkar-canvas-root') || iframe.contentDocument.body;
                if (root && root.innerHTML && root.innerHTML.trim()) {
                    htmlToSend = root.innerHTML.trim();
                    currentCanvasHTML = htmlToSend;
                }
            }
        }
        if (!htmlToSend || !htmlToSend.trim()) {
            htmlToSend = (window.bongkarStudioConfig && window.bongkarStudioConfig.initialHtml) ? window.bongkarStudioConfig.initialHtml : '';
            currentCanvasHTML = htmlToSend;
        }

        const pageLayoutSelect = document.getElementById('setting-page-layout');
        const headerIdSelect   = document.getElementById('setting-header-id');
        const footerIdSelect   = document.getElementById('setting-footer-id');

        const pageLayout = pageLayoutSelect ? pageLayoutSelect.value : (window.bongkarStudioConfig.initialPageLayout || 'canvas');
        const headerId   = headerIdSelect ? headerIdSelect.value : (window.bongkarStudioConfig.initialHeaderId || 0);
        const footerId   = footerIdSelect ? footerIdSelect.value : (window.bongkarStudioConfig.initialFooterId || 0);

        const formData = new FormData();
        formData.append('action', actionName);
        formData.append('nonce', window.bongkarStudioConfig.nonce);
        formData.append('post_id', window.bongkarStudioConfig.postId);
        formData.append('page_layout', pageLayout);
        formData.append('header_template_id', headerId);
        formData.append('footer_template_id', footerId);
        formData.append('html', htmlToSend);
        formData.append('css', css);
        formData.append('js', js);
        formData.append('external_scripts', JSON.stringify(extScripts));
        formData.append('external_styles', JSON.stringify(extStyles));
        formData.append('google_fonts', JSON.stringify(fonts));
        formData.append('page_settings', JSON.stringify({
            meta_title: metaTitle,
            meta_description: metaDesc,
            focus_keyword: focusKeyword,
            seo_score: seoScore,
            favicon_url: faviconUrl,
            og_image_url: ogImageUrl,
            gtag_id: gtagId,
            meta_pixel_id: metaPixelId,
            clarity_id: clarityId,
            custom_head: customHead,
            custom_footer: customFooter,
            content_shield: contentShield,
            shield_anti_inspect: shieldAntiInspect,
            shield_copy_mode: shieldCopyMode,
            shield_watermark_text: shieldWatermark
        }));

        return formData;
    }

    /**
     * Publish Page (Elementor-Style Publish / Update)
     * Commits all changes to the live visitor-facing canvas and synchronizes draft.
     */
    function publishPage() {
        if (isSaving) return;
        isSaving = true;

        if (autosaveDebounceTimer) {
            clearTimeout(autosaveDebounceTimer);
            autosaveDebounceTimer = null;
        }

        const btnPublish = document.getElementById('btn-save-page');
        const btnLabel = document.getElementById('btn-save-page-label');
        const statusEl = document.getElementById('bongkar-save-status');

        if (btnPublish) btnPublish.disabled = true;
        if (btnLabel) btnLabel.innerHTML = 'Mempublikasikan...';

        if (statusEl) {
            statusEl.className = 'save-status loading';
            statusEl.innerHTML = '<span class="status-dot"></span> <span class="status-text">Mempublikasikan...</span>';
        }

        const formData = buildFormData('bongkar_builder_save');

        fetch(window.bongkarStudioConfig.ajaxUrl, {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            isSaving = false;
            if (btnPublish) btnPublish.disabled = false;

            if (data.success) {
                markDirty(false);
                if (btnLabel) btnLabel.textContent = 'Perbarui';
                if (btnPublish) btnPublish.classList.remove('has-unsaved');

                if (statusEl) {
                    statusEl.className = 'save-status saved';
                    statusEl.innerHTML = `<span class="status-dot"></span> <span class="status-text">Terpublikasi (${data.data.updated_at || ''})</span>`;
                }
            } else {
                if (btnLabel) btnLabel.textContent = 'Publish';
                alert(data.data.message || 'Gagal mempublikasikan halaman.');
            }
        })
        .catch(err => {
            isSaving = false;
            if (btnPublish) btnPublish.disabled = false;
            if (btnLabel) btnLabel.textContent = 'Publish';
            console.error(err);
            alert('Terjadi kesalahan koneksi saat mempublikasikan.');
        });
    }

    /**
     * Autosave Page to Draft (Elementor-Style Draft Storage)
     * Stores edits safely in draft postmeta without affecting live visitors.
     */
    function saveDraft(manual = false) {
        if (isSaving) return;
        isSaving = true;

        const btnDraft = document.getElementById('btn-save-draft');
        const statusEl = document.getElementById('bongkar-save-status');

        if (manual && btnDraft) {
            btnDraft.disabled = true;
            btnDraft.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Menyimpan...</span>';
        }

        if (statusEl) {
            statusEl.className = 'save-status loading';
            statusEl.innerHTML = `<span class="status-dot"></span> <span class="status-text">${manual ? 'Menyimpan draft...' : 'Menyimpan otomatis...'}</span>`;
        }

        const formData = buildFormData('bongkar_builder_autosave');

        fetch(window.bongkarStudioConfig.ajaxUrl, {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            isSaving = false;
            if (manual && btnDraft) {
                btnDraft.disabled = false;
                btnDraft.innerHTML = '<i class="fa-solid fa-check" style="color: #22c55e;"></i> <span>Draft Tersimpan!</span>';
                setTimeout(() => {
                    btnDraft.innerHTML = '<i class="fa-solid fa-file-pen"></i> <span>Simpan Draft</span>';
                }, 1500);
            }

            if (data.success) {
                if (statusEl) {
                    statusEl.className = 'save-status unsaved';
                    statusEl.innerHTML = `<span class="status-dot"></span> <span class="status-text">Draft tersimpan (${data.data.draft_time || ''})</span>`;
                }

                const btnPublish = document.getElementById('btn-save-page');
                if (btnPublish) {
                    btnPublish.classList.add('has-unsaved');
                }
            }
        })
        .catch(err => {
            isSaving = false;
            if (manual && btnDraft) {
                btnDraft.disabled = false;
                btnDraft.innerHTML = '<i class="fa-solid fa-file-pen"></i> <span>Simpan Draft</span>';
            }
            console.warn('[Bongkar Autosave Notice]:', err);
        });
    }

    function markDirty(dirty) {
        isDirty = dirty;
        const statusEl = document.getElementById('bongkar-save-status');
        const btnPublish = document.getElementById('btn-save-page');

        if (dirty) {
            if (btnPublish) btnPublish.classList.add('has-unsaved');
            if (statusEl && !statusEl.classList.contains('loading')) {
                statusEl.className = 'save-status unsaved';
                statusEl.innerHTML = '<span class="status-dot"></span> <span class="status-text">Perubahan belum dipublikasikan</span>';
            }

            // Debounced autosave after 4 seconds of idle editing
            if (autosaveDebounceTimer) clearTimeout(autosaveDebounceTimer);
            autosaveDebounceTimer = setTimeout(() => {
                if (isDirty && !isSaving) {
                    saveDraft(false);
                }
            }, 4000);
        } else {
            if (btnPublish) btnPublish.classList.remove('has-unsaved');
            if (autosaveDebounceTimer) {
                clearTimeout(autosaveDebounceTimer);
                autosaveDebounceTimer = null;
            }
        }
    }

    /**
     * Keyboard Shortcuts
     */
    function initShortcuts() {
        window.addEventListener('keydown', (e) => {
            // Ctrl+S or Cmd+S -> Publish / Update
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                publishPage();
            }

            // Ctrl+Z
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    undo();
                }
            }

            // Ctrl+Y or Ctrl+Shift+Z
            if (((e.ctrlKey || e.metaKey) && e.key === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
                if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    redo();
                }
            }

            // Universal Element Clipboard & Duplicate Shortcuts (Cross-Window Forwarding)
            const isTyping = document.activeElement && (
                ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) ||
                document.activeElement.isContentEditable
            );

            if (!isTyping) {
                const iframe = document.getElementById('bongkar-iframe-canvas');
                if (iframe && iframe.contentWindow) {
                    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && !e.shiftKey) {
                        e.preventDefault();
                        iframe.contentWindow.postMessage({ type: 'BONGKAR_SHORTCUT', action: 'copy' }, '*');
                    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
                        e.preventDefault();
                        iframe.contentWindow.postMessage({ type: 'BONGKAR_SHORTCUT', action: 'cut' }, '*');
                    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
                        e.preventDefault();
                        // Try reading from parent navigator clipboard first with fallback
                        if (navigator.clipboard && navigator.clipboard.readText) {
                            navigator.clipboard.readText().then(text => {
                                iframe.contentWindow.postMessage({ type: 'BONGKAR_SHORTCUT', action: 'paste', clipboardText: text }, '*');
                            }).catch(() => {
                                iframe.contentWindow.postMessage({ type: 'BONGKAR_SHORTCUT', action: 'paste' }, '*');
                            });
                        } else {
                            iframe.contentWindow.postMessage({ type: 'BONGKAR_SHORTCUT', action: 'paste' }, '*');
                        }
                    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
                        e.preventDefault();
                        iframe.contentWindow.postMessage({ type: 'BONGKAR_SHORTCUT', action: 'duplicate' }, '*');
                    } else if (e.key === 'Delete') {
                        e.preventDefault();
                        iframe.contentWindow.postMessage({ type: 'BONGKAR_SHORTCUT', action: 'delete' }, '*');
                    }
                }
            }
        });
    }

    // Expose Studio API for submodules & exporter
    window.BongkarStudio = {
        getCanvasHTML: function() { return currentCanvasHTML; },
        setCanvasHTML: function(html) { currentCanvasHTML = html; },
        publishPage: publishPage,
        saveDraft: saveDraft,
        savePage: publishPage,
        undo: undo,
        redo: redo,
        markDirty: markDirty,
        autoDetectPageMetaAndTracking: autoDetectPageMetaAndTracking
    };

    // Initialize on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
