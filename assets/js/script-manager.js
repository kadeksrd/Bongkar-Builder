/**
 * Bongkar Algoritma & Script JS Manager
 * Detects interactive features (Swiper, Accordion, Mobile Menu, Countdown, Tabs, Modal),
 * provides live code editing, handles CDN dependencies, and allows 1-click jump-to-element.
 */

window.BongkarScriptManager = (function () {
    let algoCodeEditor = null;
    let algoStatusDot = null;
    let algoStatusText = null;
    let algoConsoleLog = null;
    let detectedList = null;
    let libSwiper = null;
    let libGsap = null;
    let libAos = null;
    let ctrlCustomExtScripts = null;

    // Smart Per-Element Inspector State & DOM
    let masterScript = '';
    let currentScope = 'element'; // 'element' | 'all'
    let currentElementData = null;
    let currentExtractedInfo = null;

    let tabScopeElement = null;
    let tabScopeAll = null;
    let boxElementScopeInfo = null;
    let boxAllScopeHelpers = null;
    let elScriptSelectorLabel = null;
    let elScriptMatchIndicator = null;
    let boxQuickEventGenerators = null;
    let algoEditorLabel = null;
    let algoElementBadgeStatus = null;
    let algoElementStatusLabel = null;

    const CDN_MAP = {
        swiper: {
            js: 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js',
            css: 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css'
        },
        gsap: {
            js: 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js',
            css: null
        },
        aos: {
            js: 'https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.js',
            css: 'https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.css'
        }
    };

    const PRESET_SNIPPETS = {
        swiper: `// Inisialisasi Slider Swiper
if (typeof Swiper !== 'undefined') {
    new Swiper('.swiper', {
        loop: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        slidesPerView: 1,
        spaceBetween: 20,
        breakpoints: {
            768: { slidesPerView: 2, spaceBetween: 24 },
            1024: { slidesPerView: 3, spaceBetween: 30 }
        }
    });
}`,

        accordion: `// Inisialisasi FAQ Accordion Interaktif
document.querySelectorAll('.faq-item, .accordion-item').forEach(function(item) {
    const trigger = item.querySelector('.faq-question, .accordion-header, h3, h4');
    const content = item.querySelector('.faq-answer, .accordion-body, p');
    
    if (trigger && content) {
        trigger.style.cursor = 'pointer';
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const isOpen = item.classList.contains('active');
            
            // Tutup item lain jika accordion tunggal
            document.querySelectorAll('.faq-item, .accordion-item').forEach(function(other) {
                other.classList.remove('active');
                const otherContent = other.querySelector('.faq-answer, .accordion-body, p');
                if (otherContent) otherContent.style.display = 'none';
            });

            if (!isOpen) {
                item.classList.add('active');
                content.style.display = 'block';
            }
        });
    }
});`,

        'mobile-menu': `// Inisialisasi Hamburger Mobile Menu
(function() {
    const toggle = document.querySelector('.hamburger, .nav-toggle, #nav-toggle, .menu-toggle');
    const menu = document.querySelector('.mobile-menu, .nav-menu, nav ul');
    
    if (toggle && menu) {
        toggle.style.cursor = 'pointer';
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            menu.classList.toggle('active');
            toggle.classList.toggle('is-open');
            if (menu.classList.contains('active')) {
                menu.style.display = 'flex';
            } else {
                menu.style.display = '';
            }
        });
    }
})();`,

        countdown: `// Inisialisasi Countdown Timer
(function() {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2); // Hitung mundur 2 hari ke depan
    
    function updateTimer() {
        const now = new Date().getTime();
        const diff = targetDate.getTime() - now;
        if (diff <= 0) return;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const dEl = document.querySelector('.countdown-days, #timer-days');
        const hEl = document.querySelector('.countdown-hours, #timer-hours');
        const mEl = document.querySelector('.countdown-minutes, #timer-minutes');
        const sEl = document.querySelector('.countdown-seconds, #timer-seconds');
        
        if (dEl) dEl.textContent = String(days).padStart(2, '0');
        if (hEl) hEl.textContent = String(hours).padStart(2, '0');
        if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
        if (sEl) sEl.textContent = String(seconds).padStart(2, '0');
    }
    
    setInterval(updateTimer, 1000);
    updateTimer();
})();`
    };

    function init() {
        cacheDom();
        syncInitialLibraries();
        attachEvents();

        // Run initial detection after canvas iframe is loaded
        setTimeout(() => {
            detectAlgorithms();
        }, 1200);
    }

    function cacheDom() {
        algoCodeEditor = document.getElementById('algo-code-editor');
        algoStatusDot = document.getElementById('algo-status-dot');
        algoStatusText = document.getElementById('algo-status-text');
        algoConsoleLog = document.getElementById('algo-console-log');
        detectedList = document.getElementById('detected-algorithms-list');
        libSwiper = document.getElementById('lib-swiper');
        libGsap = document.getElementById('lib-gsap');
        libAos = document.getElementById('lib-aos');
        ctrlCustomExtScripts = document.getElementById('ctrl-custom-ext-scripts');

        // Smart Per-Element Inspector DOM Elements
        tabScopeElement = document.getElementById('tab-scope-element');
        tabScopeAll = document.getElementById('tab-scope-all');
        boxElementScopeInfo = document.getElementById('box-element-scope-info');
        boxAllScopeHelpers = document.getElementById('box-all-scope-helpers');
        elScriptSelectorLabel = document.getElementById('el-script-selector-label');
        elScriptMatchIndicator = document.getElementById('el-script-match-indicator');
        boxQuickEventGenerators = document.getElementById('box-quick-event-generators');
        algoEditorLabel = document.getElementById('algo-editor-label');
        algoElementBadgeStatus = document.getElementById('algo-element-badge-status');
        algoElementStatusLabel = document.getElementById('algo-element-status-label');

        if (algoCodeEditor && !masterScript) {
            masterScript = algoCodeEditor.value || '';
        }
    }

    function syncInitialLibraries() {
        const config = window.bongkarStudioConfig || {};
        const extScripts = Array.isArray(config.initialExtScripts) ? config.initialExtScripts : [];

        let customList = [];
        extScripts.forEach(url => {
            if (typeof url !== 'string') return;
            if (url.includes('swiper') && libSwiper) {
                libSwiper.checked = true;
            } else if (url.includes('gsap') && libGsap) {
                libGsap.checked = true;
            } else if (url.includes('aos') && libAos) {
                libAos.checked = true;
            } else {
                customList.push(url);
            }
        });

        if (ctrlCustomExtScripts && customList.length > 0) {
            ctrlCustomExtScripts.value = customList.join(', ');
        }
    }

    function attachEvents() {
        // Scope switcher tabs
        if (tabScopeElement) {
            tabScopeElement.addEventListener('click', () => switchScope('element'));
        }
        if (tabScopeAll) {
            tabScopeAll.addEventListener('click', () => switchScope('all'));
        }

        // Quick Event Generator Buttons
        document.querySelectorAll('.btn-quick-event').forEach(btn => {
            btn.addEventListener('click', () => {
                const eventType = btn.getAttribute('data-event');
                attachQuickEvent(eventType);
            });
        });

        const btnRerun = document.getElementById('btn-rerun-scripts');
        if (btnRerun) {
            btnRerun.addEventListener('click', () => {
                rerunScripts(masterScript);
            });
        }

        const btnApplyRun = document.getElementById('btn-apply-run-algo');
        if (btnApplyRun) {
            btnApplyRun.addEventListener('click', () => {
                applyAndRunCurrentCode();
            });
        }

        const btnRescan = document.getElementById('btn-rescan-algo');
        if (btnRescan) {
            btnRescan.addEventListener('click', () => {
                detectAlgorithms();
            });
        }

        const btnFormat = document.getElementById('btn-format-js');
        if (btnFormat) {
            btnFormat.addEventListener('click', formatCode);
        }

        const btnClear = document.getElementById('btn-clear-js');
        if (btnClear) {
            btnClear.addEventListener('click', () => {
                if (currentScope === 'element') {
                    if (confirm('Hapus script khusus elemen ini?')) {
                        clearElementScript();
                    }
                } else {
                    if (confirm('Kosongkan seluruh script JavaScript halaman?')) {
                        masterScript = '';
                        if (algoCodeEditor) algoCodeEditor.value = '';
                        markStudioDirty();
                        rerunScripts('');
                        updateElementDisplay();
                    }
                }
            });
        }

        // Preset templates
        document.querySelectorAll('.btn-preset-algo').forEach(btn => {
            btn.addEventListener('click', () => {
                const presetKey = btn.getAttribute('data-preset');
                insertPreset(presetKey);
            });
        });

        // CDN toggles
        [libSwiper, libGsap, libAos].forEach(cb => {
            if (cb) {
                cb.addEventListener('change', () => {
                    syncLibrariesToCanvas();
                    markStudioDirty();
                });
            }
        });

        if (ctrlCustomExtScripts) {
            ctrlCustomExtScripts.addEventListener('change', () => {
                syncLibrariesToCanvas();
                markStudioDirty();
            });
        }

        // Live dirty mark when editing code
        if (algoCodeEditor) {
            algoCodeEditor.addEventListener('input', () => {
                markStudioDirty();
            });
        }
    }

    /**
     * Scan the canvas iframe DOM and code to detect running algorithms
     */
    function detectAlgorithms() {
        if (!detectedList) return;

        const iframe = document.getElementById('bongkar-iframe-canvas');
        if (!iframe || !iframe.contentDocument) {
            detectedList.innerHTML = '<div style="text-align: center; color: var(--text-muted); font-size: 12px; padding: 10px;">Kanvas sedang dimuat...</div>';
            return;
        }

        const iframeDoc = iframe.contentDocument;
        const root = iframeDoc.getElementById('bongkar-canvas-root') || iframeDoc.body;
        const currentCode = algoCodeEditor ? algoCodeEditor.value : '';

        const detected = [];

        // 1. Swiper Slider / Carousel
        const swiperEl = root.querySelector('.swiper, .swiper-container');
        if (swiperEl || currentCode.includes('Swiper') || currentCode.includes('swiper')) {
            const slideCount = swiperEl ? swiperEl.querySelectorAll('.swiper-slide').length : 0;
            detected.push({
                type: 'swiper',
                name: 'Swiper Slider / Carousel',
                icon: 'fa-solid fa-film',
                selector: swiperEl ? getElementSelector(swiperEl) : '.swiper',
                desc: swiperEl ? `Slider aktif dengan ${slideCount} slide terpasang.` : 'Logika Swiper terdeteksi di dalam script.',
                needsLibrary: !libSwiper || !libSwiper.checked,
                libraryName: 'Swiper.js 11',
                libraryCb: libSwiper
            });
        }

        // 2. FAQ Accordion / Collapse
        const accordionEl = root.querySelector('.accordion, details, .faq-item, .faq-card, .accordion-item');
        if (accordionEl || currentCode.includes('accordion') || currentCode.includes('faq-')) {
            const itemsCount = root.querySelectorAll('.accordion, details, .faq-item, .faq-card, .accordion-item').length;
            detected.push({
                type: 'accordion',
                name: 'FAQ Accordion Dropdown',
                icon: 'fa-solid fa-circle-question',
                selector: accordionEl ? getElementSelector(accordionEl) : '.faq-item',
                desc: `Ditemukan ${itemsCount} elemen FAQ/Accordion interaktif.`,
                needsLibrary: false
            });
        }

        // 3. Mobile Hamburger Menu
        const mobileNavEl = root.querySelector('.hamburger, .nav-toggle, #nav-toggle, .mobile-menu, .menu-toggle');
        if (mobileNavEl || currentCode.includes('nav-toggle') || currentCode.includes('mobile-menu') || currentCode.includes('hamburger')) {
            detected.push({
                type: 'mobile-menu',
                name: 'Menu Navigasi Mobile',
                icon: 'fa-solid fa-bars',
                selector: mobileNavEl ? getElementSelector(mobileNavEl) : '.hamburger',
                desc: 'Tombol hamburger toggle untuk layar smartphone & tablet.',
                needsLibrary: false
            });
        }

        // 4. Countdown Timer
        const countdownEl = root.querySelector('.countdown, [data-countdown], .timer, .countdown-timer');
        if (countdownEl || currentCode.includes('countdown') || currentCode.includes('timer')) {
            detected.push({
                type: 'countdown',
                name: 'Countdown Timer (Hitung Mundur)',
                icon: 'fa-solid fa-stopwatch',
                selector: countdownEl ? getElementSelector(countdownEl) : '.countdown',
                desc: 'Penghitung mundur waktu promosi / penawaran terbatas.',
                needsLibrary: false
            });
        }

        // 5. Interactive Tabs
        const tabEl = root.querySelector('[data-tab], .tabs, .tab-nav, .tab-item');
        if (tabEl || currentCode.includes('data-tab')) {
            detected.push({
                type: 'tabs',
                name: 'Tab Navigasi Konten',
                icon: 'fa-solid fa-folder-tree',
                selector: tabEl ? getElementSelector(tabEl) : '[data-tab]',
                desc: 'Peralihan konten dinamis antar tab.',
                needsLibrary: false
            });
        }

        // 6. Modal / Popup Dialog
        const modalEl = root.querySelector('[data-modal], .modal, .popup, dialog');
        if (modalEl || currentCode.includes('modal') || currentCode.includes('popup')) {
            detected.push({
                type: 'modal',
                name: 'Popup Modal / Dialog',
                icon: 'fa-solid fa-window-restore',
                selector: modalEl ? getElementSelector(modalEl) : '.modal',
                desc: 'Jendela popup popover interaktif.',
                needsLibrary: false
            });
        }

        // 7. Scroll Animations (AOS / GSAP)
        const aosEl = root.querySelector('[data-aos]');
        if (aosEl || currentCode.includes('AOS') || currentCode.includes('aos')) {
            detected.push({
                type: 'aos',
                name: 'AOS (Animate on Scroll)',
                icon: 'fa-solid fa-wand-magic-sparkles',
                selector: aosEl ? getElementSelector(aosEl) : '[data-aos]',
                desc: 'Efek animasi saat elemen digulir / di-scroll.',
                needsLibrary: !libAos || !libAos.checked,
                libraryName: 'AOS CDN',
                libraryCb: libAos
            });
        }

        // 8. Kalkulator & Estimator Biaya / Slider Interaktif
        const calcEl = root.querySelector('input[type="range"], [class*="calc"], [id*="calc"], [class*="planner"], [id*="planner"], [class*="estimator"]');
        const hasCalcCode = currentCode.includes('calc') || currentCode.includes('estimate') || currentCode.includes('estimator') || currentCode.includes('biaya') || currentCode.includes('RAB') || currentCode.includes('rab') || currentCode.includes('syncArea');
        if (calcEl || hasCalcCode) {
            detected.push({
                type: 'calculator',
                name: 'Kalkulator & Estimator Biaya',
                icon: 'fa-solid fa-calculator',
                selector: calcEl ? getElementSelector(calcEl) : 'input[type="range"]',
                desc: 'Simulasi kalkulasi biaya, range slider interaktif & rincian estimasi otomatis.',
                needsLibrary: false
            });
        }

        // 9. WhatsApp Lead & Webhook Dispatcher
        const hasWaCode = currentCode.includes('whatsapp') || currentCode.includes('wa.me') || currentCode.includes('WA_NUM') || currentCode.includes('sendLead');
        const waLinkEl = root.querySelector('a[href*="wa.me"], a[href*="whatsapp.com"], [onclick*="Wa"], [onclick*="wa"]');
        if (hasWaCode || waLinkEl) {
            detected.push({
                type: 'whatsapp-lead',
                name: 'Integrasi WhatsApp & Webhook Leads',
                icon: 'fa-brands fa-whatsapp',
                selector: waLinkEl ? getElementSelector(waLinkEl) : 'a[href*="wa.me"]',
                desc: 'Pengiriman formulir prospek langsung ke WhatsApp & integrasi Google Sheets.',
                needsLibrary: false
            });
        }

        // Render Cards
        renderDetectedCards(detected);
    }

    /**
     * Render detected algorithm items into sidebar UI
     */
    function renderDetectedCards(detected) {
        if (!detectedList) return;

        if (detected.length === 0) {
            detectedList.innerHTML = `
                <div style="background: rgba(255,255,255,0.03); border: 1px dashed var(--border-light); border-radius: var(--radius-md); padding: 14px; text-align: center;">
                    <i class="fa-solid fa-lightbulb" style="font-size: 20px; color: #facc15; margin-bottom: 8px;"></i>
                    <div style="font-size: 12px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">Belum Ada Algoritma Aktif</div>
                    <p style="font-size: 11px; color: var(--text-muted); line-height: 1.4; margin-bottom: 12px;">
                        Kanvas belum memiliki komponen interaktif. Pilih salah satu template di bawah untuk menambahkannya secara instan:
                    </p>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <button type="button" class="algo-jump-btn btn-quick-add" data-preset="swiper" style="text-align: left; padding: 7px 10px;">
                            <i class="fa-solid fa-film"></i> + Pasang Slider Swiper
                        </button>
                        <button type="button" class="algo-jump-btn btn-quick-add" data-preset="accordion" style="text-align: left; padding: 7px 10px;">
                            <i class="fa-solid fa-circle-question"></i> + Pasang FAQ Accordion
                        </button>
                        <button type="button" class="algo-jump-btn btn-quick-add" data-preset="mobile-menu" style="text-align: left; padding: 7px 10px;">
                            <i class="fa-solid fa-bars"></i> + Pasang Hamburger Menu
                        </button>
                    </div>
                </div>
            `;

            detectedList.querySelectorAll('.btn-quick-add').forEach(btn => {
                btn.addEventListener('click', () => {
                    const preset = btn.getAttribute('data-preset');
                    insertPreset(preset);
                });
            });
            return;
        }

        let html = '';
        detected.forEach((item, index) => {
            const badgeClass = item.needsLibrary ? 'badge-warning' : 'badge-active';
            const badgeText = item.needsLibrary ? 'Perlu CDN' : 'Siap';

            html += `
                <div class="algo-item-card" data-index="${index}">
                    <div class="algo-item-header">
                        <div class="algo-item-title">
                            <i class="${item.icon}"></i>
                            <span>${item.name}</span>
                        </div>
                        <span class="algo-item-badge ${badgeClass}">${badgeText}</span>
                    </div>
                    <div class="algo-item-desc">${item.desc}</div>
                    <div class="algo-item-target">${item.selector}</div>
                    <div class="algo-item-actions">
                        <button type="button" class="algo-jump-btn" data-selector="${item.selector}" title="Arahkan & sorot elemen ini di dalam kanvas">
                            <i class="fa-solid fa-crosshairs"></i> Lompat ke Elemen
                        </button>
                        <button type="button" class="algo-edit-btn" data-type="${item.type}" title="Buka dan edit script untuk fitur ini">
                            <i class="fa-solid fa-code"></i> Edit Script
                        </button>
                    </div>
                </div>
            `;
        });

        detectedList.innerHTML = html;

        // Attach action handlers
        detectedList.querySelectorAll('.algo-jump-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const selector = btn.getAttribute('data-selector');
                jumpToElement(selector);
            });
        });

        detectedList.querySelectorAll('.algo-edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.getAttribute('data-type');
                focusCodeForType(type);
            });
        });
    }

    /**
     * Jump and highlight target element inside iframe
     */
    function jumpToElement(selector) {
        const iframe = document.getElementById('bongkar-iframe-canvas');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'BONGKAR_HIGHLIGHT_ELEMENT',
                selector: selector
            }, '*');
            logToConsole(`[Sorot Elemen] Mengarahkan kanvas ke: ${selector}`);
        }
    }

    /**
     * Focus code editor and insert boilerplate if type not found
     */
    function focusCodeForType(type) {
        if (!algoCodeEditor) return;

        algoCodeEditor.focus();
        algoCodeEditor.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const currentVal = algoCodeEditor.value;
        if (type === 'swiper' && !currentVal.includes('Swiper')) {
            insertPreset('swiper');
        } else if (type === 'accordion' && !currentVal.includes('accordion') && !currentVal.includes('faq')) {
            insertPreset('accordion');
        } else if (type === 'mobile-menu' && !currentVal.includes('nav-toggle') && !currentVal.includes('mobile-menu')) {
            insertPreset('mobile-menu');
        } else if (type === 'countdown' && !currentVal.includes('countdown')) {
            insertPreset('countdown');
        } else if (type === 'calculator') {
            logToConsole('[Editor] Menyorot script Kalkulator & Estimator Biaya');
        } else if (type === 'whatsapp-lead') {
            logToConsole('[Editor] Menyorot script WhatsApp & Webhook Dispatcher');
        } else {
            logToConsole(`[Editor] Menyorot script untuk ${type}`);
        }
    }

    /**
     * Insert boilerplate preset template
     */
    function insertPreset(presetKey) {
        const snippet = PRESET_SNIPPETS[presetKey];
        if (!snippet || !algoCodeEditor) return;

        // Auto-check CDN dependencies
        if (presetKey === 'swiper' && libSwiper) {
            libSwiper.checked = true;
            syncLibrariesToCanvas();
        }

        const currentVal = masterScript.trim();
        if (currentVal.length === 0) {
            masterScript = snippet;
        } else if (!currentVal.includes(snippet.substring(0, 30))) {
            masterScript = currentVal + '\n\n' + snippet;
        }

        if (currentScope === 'all' && algoCodeEditor) {
            algoCodeEditor.value = masterScript;
        }

        markStudioDirty();
        rerunScripts(masterScript);
        detectAlgorithms();
        if (currentElementData) onElementSelected(currentElementData);
        logToConsole(`[Template Ditambahkan] Template '${presetKey}' berhasil dipasang ke script.`);
    }

    /**
     * Synchronize CDN script & style dependencies to canvas iframe
     */
    function syncLibrariesToCanvas() {
        const styles = getExternalStyles();
        const scripts = getExternalScripts();

        const iframe = document.getElementById('bongkar-iframe-canvas');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'BONGKAR_INJECT_ASSETS',
                styles: styles,
                scripts: scripts
            }, '*');
        }

        // Re-run script once CDN is loaded
        setTimeout(() => {
            rerunScripts();
        }, 500);
    }

    /**
     * Re-run current script in canvas iframe
     */
    function rerunScripts(customCode) {
        const code = customCode !== undefined ? customCode : (masterScript || (algoCodeEditor ? algoCodeEditor.value : ''));

        updateStatusDot('loading', 'Menjalankan Algoritma...');

        const iframe = document.getElementById('bongkar-iframe-canvas');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'BONGKAR_RERUN_SCRIPTS',
                code: code
            }, '*');
        }
    }

    /**
     * Handle execution status feedback from iframe
     */
    function handleStatus(data) {
        if (!data || !data.status) return;

        const timeStr = new Date().toLocaleTimeString();

        if (data.status === 'success') {
            updateStatusDot('success', 'Algoritma Aktif & Berjalan Normal');
            logToConsole(`[${timeStr}] [OK] Algoritma JavaScript berhasil dieksekusi tanpa error.`);
        } else if (data.status === 'error') {
            updateStatusDot('error', 'Kesalahan pada Script!');
            logToConsole(`[${timeStr}] [ERROR]: ${data.message || 'Syntax/Runtime Error'}`);
            if (data.stack) {
                logToConsole(`Stack: ${data.stack.split('\n')[0]}`);
            }
        } else if (data.status === 'idle') {
            updateStatusDot('idle', 'Algoritma Standby (Kosong)');
            logToConsole(`[${timeStr}] [INFO] Tidak ada script JavaScript yang berjalan.`);
        }
    }

    function updateStatusDot(state, text) {
        if (!algoStatusDot || !algoStatusText) return;

        algoStatusText.textContent = text;

        if (state === 'success') {
            algoStatusDot.style.background = '#22c55e';
            algoStatusDot.style.boxShadow = '0 0 8px #22c55e';
        } else if (state === 'error') {
            algoStatusDot.style.background = '#ef4444';
            algoStatusDot.style.boxShadow = '0 0 8px #ef4444';
        } else if (state === 'loading') {
            algoStatusDot.style.background = '#f59e0b';
            algoStatusDot.style.boxShadow = '0 0 8px #f59e0b';
        } else {
            algoStatusDot.style.background = '#94a3b8';
            algoStatusDot.style.boxShadow = 'none';
        }
    }

    function logToConsole(message) {
        if (!algoConsoleLog) return;
        const line = document.createElement('div');
        line.style.marginBottom = '4px';
        line.textContent = message;
        algoConsoleLog.appendChild(line);
        algoConsoleLog.scrollTop = algoConsoleLog.scrollHeight;
    }

    function formatCode() {
        if (!algoCodeEditor) return;
        let code = algoCodeEditor.value;
        // Simple beautifier: clean excessive blank lines & standard indent
        code = code.replace(/(\n\s*\n\s*\n)+/g, '\n\n').trim();
        algoCodeEditor.value = code;
        logToConsole('[Format] Kode JavaScript dirapikan.');
    }

    function getElementSelector(el) {
        if (!el || el.nodeType !== Node.ELEMENT_NODE) return '';
        if (el.id) return '#' + el.id;
        
        let selector = el.tagName.toLowerCase();
        if (el.classList && el.classList.length > 0) {
            const classes = Array.from(el.classList).filter(c => !c.startsWith('bongkar-'));
            if (classes.length > 0) {
                selector += '.' + classes.slice(0, 2).join('.');
            }
        }
        return selector;
    }

    function getExternalScripts() {
        const scripts = [];
        if (libSwiper && libSwiper.checked && CDN_MAP.swiper.js) scripts.push(CDN_MAP.swiper.js);
        if (libGsap && libGsap.checked && CDN_MAP.gsap.js) scripts.push(CDN_MAP.gsap.js);
        if (libAos && libAos.checked && CDN_MAP.aos.js) scripts.push(CDN_MAP.aos.js);

        if (ctrlCustomExtScripts && ctrlCustomExtScripts.value.trim()) {
            const customs = ctrlCustomExtScripts.value.split(',').map(s => s.trim()).filter(Boolean);
            customs.forEach(url => {
                if (!scripts.includes(url)) scripts.push(url);
            });
        }
        return scripts;
    }

    function getExternalStyles() {
        const styles = [];
        if (libSwiper && libSwiper.checked && CDN_MAP.swiper.css) styles.push(CDN_MAP.swiper.css);
        if (libAos && libAos.checked && CDN_MAP.aos.css) styles.push(CDN_MAP.aos.css);
        return styles;
    }

    function markStudioDirty() {
        const statusEl = document.getElementById('bongkar-save-status');
        if (statusEl) {
            statusEl.className = 'save-status unsaved';
            statusEl.innerHTML = '<span class="status-dot"></span> <span class="status-text">Belum disimpan</span>';
        }
    }

    function getBestSelector(data) {
        if (!data) return '';
        if (data.id) return '#' + data.id;
        if (data.className) {
            const classes = data.className.split(/\s+/).filter(c => c && !c.startsWith('bongkar-'));
            if (classes.length > 0) return '.' + classes[0];
        }
        return data.tag ? data.tag.toLowerCase() : '';
    }

    /**
     * Parse and extract code block containing target tokens
     */
    function extractAssociatedBlock(fullJs, tokens) {
        if (!fullJs || !tokens || tokens.length === 0) return null;

        let bestMatch = null;
        for (const token of tokens) {
            if (!token || token.length < 2) continue;
            const idx = fullJs.indexOf(token);
            if (idx !== -1) {
                if (bestMatch === null || idx < bestMatch.idx) {
                    bestMatch = { idx, token };
                }
            }
        }

        if (!bestMatch) return null;

        const matchIdx = bestMatch.idx;

        // Scan backwards to find block or statement start
        let start = 0;
        let depth = 0;
        for (let i = matchIdx; i >= 0; i--) {
            const ch = fullJs[i];
            if (depth === 0 && (ch === ';' || ch === '}' || (ch === '\n' && i > 0 && (fullJs[i - 1] === ';' || fullJs[i - 1] === '}')))) {
                start = i + 1;
                break;
            } else if (ch === '}') {
                depth++;
            } else if (ch === '{') {
                if (depth > 0) depth--;
                else {
                    start = i + 1;
                    break;
                }
            }
        }

        // Capture preceding comment lines if any
        while (start > 0) {
            const prevNewline = fullJs.lastIndexOf('\n', start - 2);
            const lineBefore = fullJs.substring(prevNewline + 1, start).trim();
            if (lineBefore.startsWith('//') || lineBefore.startsWith('/*')) {
                start = prevNewline + 1;
            } else {
                break;
            }
        }

        // Scan forwards to find statement or block end
        let end = fullJs.length;
        let braceDepth = 0;
        let foundOpenBrace = false;
        let inSingleQuote = false;
        let inDoubleQuote = false;
        let inBacktick = false;

        for (let i = start; i < fullJs.length; i++) {
            const ch = fullJs[i];
            const prev = i > 0 ? fullJs[i - 1] : '';

            if (ch === "'" && prev !== '\\' && !inDoubleQuote && !inBacktick) inSingleQuote = !inSingleQuote;
            else if (ch === '"' && prev !== '\\' && !inSingleQuote && !inBacktick) inDoubleQuote = !inDoubleQuote;
            else if (ch === '`' && prev !== '\\' && !inSingleQuote && !inDoubleQuote) inBacktick = !inBacktick;

            if (!inSingleQuote && !inDoubleQuote && !inBacktick) {
                if (ch === '{') {
                    braceDepth++;
                    foundOpenBrace = true;
                } else if (ch === '}') {
                    braceDepth--;
                    if (foundOpenBrace && braceDepth <= 0) {
                        let trailing = fullJs.substring(i + 1, i + 5);
                        if (trailing.startsWith(');')) end = i + 3;
                        else if (trailing.startsWith(')')) end = i + 2;
                        else if (trailing.startsWith(';')) end = i + 2;
                        else end = i + 1;
                        break;
                    }
                } else if (!foundOpenBrace && ch === ';') {
                    end = i + 1;
                    break;
                }
            }
        }

        const snippet = fullJs.substring(start, end).trim();
        if (!snippet) return null;

        return {
            snippet: snippet,
            start: start,
            end: end,
            token: bestMatch.token
        };
    }

    /**
     * Extracts a function declaration from JavaScript code matching an inline handler function name
     */
    function extractFunctionDeclaration(fullJs, fnName) {
        if (!fullJs || !fnName) return null;

        const escaped = fnName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp('(?:function\\s+' + escaped + '\\b|(?:const|let|var|window\\.)\\s*' + escaped + '\\s*=\\s*(?:function|\\([^)]*\\)\\s*=>))');
        const match = regex.exec(fullJs);
        if (!match) return null;

        let start = match.index;

        // Capture preceding comment lines if any
        while (start > 0) {
            const prevNewline = fullJs.lastIndexOf('\n', start - 2);
            const lineBefore = fullJs.substring(prevNewline + 1, start).trim();
            if (lineBefore.startsWith('//') || lineBefore.startsWith('/*')) {
                start = prevNewline + 1;
            } else {
                break;
            }
        }

        // Scan forwards to find balanced braces of the function body
        let braceDepth = 0;
        let foundOpenBrace = false;
        let inSingleQuote = false;
        let inDoubleQuote = false;
        let inBacktick = false;
        let end = fullJs.length;

        for (let i = match.index; i < fullJs.length; i++) {
            const ch = fullJs[i];
            const prev = i > 0 ? fullJs[i - 1] : '';

            if (ch === "'" && prev !== '\\' && !inDoubleQuote && !inBacktick) inSingleQuote = !inSingleQuote;
            else if (ch === '"' && prev !== '\\' && !inSingleQuote && !inBacktick) inDoubleQuote = !inDoubleQuote;
            else if (ch === '`' && prev !== '\\' && !inSingleQuote && !inDoubleQuote) inBacktick = !inBacktick;

            if (!inSingleQuote && !inDoubleQuote && !inBacktick) {
                if (ch === '{') {
                    braceDepth++;
                    foundOpenBrace = true;
                } else if (ch === '}') {
                    braceDepth--;
                    if (foundOpenBrace && braceDepth <= 0) {
                        let trailing = fullJs.substring(i + 1, i + 5);
                        if (trailing.startsWith(');')) end = i + 3;
                        else if (trailing.startsWith(')')) end = i + 2;
                        else if (trailing.startsWith(';')) end = i + 2;
                        else end = i + 1;
                        break;
                    }
                }
            }
        }

        const snippet = fullJs.substring(start, end).trim();
        if (!snippet) return null;

        return {
            snippet: snippet,
            start: start,
            end: end,
            token: fnName,
            isFunction: true,
            fnName: fnName
        };
    }

    function scanAndExtractElementScript(data) {
        if (!data) return null;

        // 1. Priority 1: Check inline event handlers (onclick, oninput, onchange, onsubmit)
        const inlineHandlerRaw = data.inlineOnClick || data.effectiveOnClick || data.inlineOnInput || data.inlineOnChange || data.inlineOnSubmit;
        if (inlineHandlerRaw) {
            const fnMatch = inlineHandlerRaw.match(/([a-zA-Z0-9_$]+)\s*\(/);
            if (fnMatch && fnMatch[1]) {
                const fnName = fnMatch[1];
                const fnBlock = extractFunctionDeclaration(masterScript, fnName);
                if (fnBlock) {
                    currentExtractedInfo = fnBlock;
                    return fnBlock;
                }
            }
        }

        // 2. Priority 2: Selector tokens
        const tokens = [];
        if (data.id) {
            tokens.push('#' + data.id);
            tokens.push("'" + data.id + "'");
            tokens.push('"' + data.id + '"');
            tokens.push(data.id);
        }

        if (data.className) {
            const classes = data.className.split(/\s+/).filter(c => c && !c.startsWith('bongkar-'));
            classes.forEach(cls => {
                tokens.push('.' + cls);
                tokens.push("'" + cls + "'");
                tokens.push('"' + cls + '"');
                tokens.push(cls);
            });
        }

        if (['button', 'form', 'select', 'input'].includes(data.tag)) {
            tokens.push("'" + data.tag + "'");
            tokens.push('"' + data.tag + '"');
        }

        const match = extractAssociatedBlock(masterScript, tokens);
        currentExtractedInfo = match;
        return match;
    }

    function updateElementDisplay() {
        if (!currentElementData) return;
        const selector = getBestSelector(currentElementData);

        if (elScriptSelectorLabel) {
            elScriptSelectorLabel.textContent = selector || currentElementData.tag.toUpperCase();
        }

        const match = scanAndExtractElementScript(currentElementData);

        if (match) {
            if (elScriptMatchIndicator) {
                elScriptMatchIndicator.className = 'target-badge-match';
                if (match.isFunction) {
                    elScriptMatchIndicator.innerHTML = `<i class="fa-solid fa-code"></i> Terhubung: ${match.fnName}()`;
                } else {
                    elScriptMatchIndicator.innerHTML = '<i class="fa-solid fa-check"></i> 1 Script Terhubung';
                }
            }
            if (algoElementBadgeStatus) {
                algoElementBadgeStatus.innerHTML = `<span class="status-dot" style="background:#10b981;"></span> <span>${match.isFunction ? 'Fungsi Aktif' : 'Aktif'}</span>`;
            }
            if (boxQuickEventGenerators) {
                boxQuickEventGenerators.style.display = 'none';
            }
            if (currentScope === 'element' && algoCodeEditor) {
                algoCodeEditor.value = match.snippet;
                if (algoEditorLabel) {
                    algoEditorLabel.textContent = match.isFunction ? `Fungsi Elemen: ${match.fnName}() (${selector})` : `Script Elemen: ${selector}`;
                }
            }
        } else {
            if (elScriptMatchIndicator) {
                elScriptMatchIndicator.className = 'target-badge-no-match';
                elScriptMatchIndicator.innerHTML = '<i class="fa-solid fa-circle-question"></i> Belum ada script';
            }
            if (algoElementBadgeStatus) {
                algoElementBadgeStatus.innerHTML = '<span class="status-dot" style="background:#6b7280;"></span> <span>Standby</span>';
            }
            if (boxQuickEventGenerators) {
                boxQuickEventGenerators.style.display = 'block';
            }
            if (currentScope === 'element' && algoCodeEditor) {
                algoCodeEditor.value = `// Belum ada script khusus untuk elemen ${selector}\n// Gunakan tombol "Pasang Interaksi Instan" di atas atau tulis logika Anda di sini.`;
                if (algoEditorLabel) {
                    algoEditorLabel.textContent = 'Script Elemen: ' + selector;
                }
            }
        }
    }

    function onElementSelected(data) {
        currentElementData = data;
        updateElementDisplay();
    }

    function onElementDeselected() {
        currentElementData = null;
        currentExtractedInfo = null;
        if (elScriptSelectorLabel) {
            elScriptSelectorLabel.textContent = '--';
        }
        if (elScriptMatchIndicator) {
            elScriptMatchIndicator.className = 'target-badge-no-match';
            elScriptMatchIndicator.innerHTML = '<i class="fa-solid fa-circle-question"></i> Belum ada script';
        }
        if (algoElementBadgeStatus) {
            algoElementBadgeStatus.innerHTML = '<span class="status-dot" style="background:#6b7280;"></span> <span>Standby</span>';
        }
        if (boxQuickEventGenerators) {
            boxQuickEventGenerators.style.display = 'none';
        }
        if (currentScope === 'element' && algoCodeEditor) {
            algoCodeEditor.value = '// Pilih elemen di kanvas untuk melihat dan mengedit script elemen tersebut.';
            if (algoEditorLabel) algoEditorLabel.textContent = 'Script Elemen:';
        }
    }

    function switchScope(newScope) {
        if (currentScope === 'element' && newScope === 'all') {
            syncElementEditorToMaster();
        }

        currentScope = newScope;

        if (tabScopeElement && tabScopeAll) {
            if (newScope === 'element') {
                tabScopeElement.classList.add('active');
                tabScopeAll.classList.remove('active');
                if (boxElementScopeInfo) boxElementScopeInfo.style.display = 'block';
                if (boxAllScopeHelpers) boxAllScopeHelpers.style.display = 'none';

                if (currentElementData) {
                    updateElementDisplay();
                } else if (algoCodeEditor) {
                    algoCodeEditor.value = '// Pilih elemen di kanvas untuk melihat dan mengedit script elemen tersebut.';
                    if (algoEditorLabel) algoEditorLabel.textContent = 'Script Elemen Terpilih:';
                }
            } else {
                tabScopeElement.classList.remove('active');
                tabScopeAll.classList.add('active');
                if (boxElementScopeInfo) boxElementScopeInfo.style.display = 'none';
                if (boxAllScopeHelpers) boxAllScopeHelpers.style.display = 'block';

                if (algoCodeEditor) {
                    algoCodeEditor.value = masterScript;
                }
                if (algoEditorLabel) {
                    algoEditorLabel.textContent = 'Seluruh Script Halaman (Master JS):';
                }
            }
        }
    }

    function syncElementEditorToMaster() {
        if (!algoCodeEditor || !currentElementData) return;
        const currentVal = algoCodeEditor.value.trim();
        if (currentVal.startsWith('// Belum ada script khusus') || currentVal.startsWith('// Pilih elemen di kanvas')) {
            return;
        }

        const selector = getBestSelector(currentElementData);

        if (currentExtractedInfo) {
            masterScript = masterScript.substring(0, currentExtractedInfo.start) + currentVal + masterScript.substring(currentExtractedInfo.end);
        } else {
            masterScript = (masterScript.trim() ? masterScript.trim() + '\n\n' : '') + `// Logika Interaksi: ${selector}\n` + currentVal;
        }

        scanAndExtractElementScript(currentElementData);
    }

    function applyAndRunCurrentCode() {
        if (!algoCodeEditor) return;

        if (currentScope === 'element') {
            syncElementEditorToMaster();
            rerunScripts(masterScript);
            markStudioDirty();
            const selector = currentElementData ? getBestSelector(currentElementData) : 'Elemen';
            logToConsole(`[Elemen] Script untuk ${selector} berhasil diperbarui dan dijalankan di kanvas.`);
            updateElementDisplay();
        } else {
            masterScript = algoCodeEditor.value;
            rerunScripts(masterScript);
            markStudioDirty();
            logToConsole('[Master JS] Seluruh script halaman berhasil diperbarui dan dijalankan di kanvas.');
            if (currentElementData) scanAndExtractElementScript(currentElementData);
        }
    }

    function attachQuickEvent(eventType) {
        if (!currentElementData) {
            alert('Pilih elemen di kanvas terlebih dahulu.');
            return;
        }

        const selector = getBestSelector(currentElementData);
        let snippet = '';

        if (eventType === 'click') {
            snippet = `// Event Klik untuk ${selector}
document.querySelectorAll('${selector}').forEach(function(el) {
    el.addEventListener('click', function(e) {
        console.log('Klik pada ${selector}:', this);
        // Contoh aksi: toggle status aktif
        this.classList.toggle('active');
    });
});`;
        } else if (eventType === 'input') {
            snippet = `// Event Perubahan Nilai / Slider untuk ${selector}
document.querySelectorAll('${selector}').forEach(function(el) {
    el.addEventListener('input', function(e) {
        console.log('${selector} nilai:', this.value);
    });
});`;
        } else if (eventType === 'toggle') {
            snippet = `// Toggle Sembunyikan / Tampilkan untuk ${selector}
document.querySelectorAll('${selector}').forEach(function(el) {
    el.style.display = (el.style.display === 'none') ? '' : 'none';
});`;
        }

        if (algoCodeEditor) {
            algoCodeEditor.value = snippet;
        }

        applyAndRunCurrentCode();
        logToConsole(`[Interaksi Cepat] Event '${eventType}' berhasil dipasang ke elemen ${selector}.`);
    }

    function clearElementScript() {
        if (!currentExtractedInfo) {
            if (algoCodeEditor) algoCodeEditor.value = '';
            return;
        }

        masterScript = masterScript.substring(0, currentExtractedInfo.start) + masterScript.substring(currentExtractedInfo.end);
        masterScript = masterScript.replace(/(\n\s*\n\s*\n)+/g, '\n\n').trim();
        rerunScripts(masterScript);
        markStudioDirty();
        currentExtractedInfo = null;
        updateElementDisplay();
        logToConsole('[Elemen] Script untuk elemen telah dibersihkan dari halaman.');
    }

    return {
        init: init,
        onElementSelected: onElementSelected,
        onElementDeselected: onElementDeselected,
        detectAlgorithms: detectAlgorithms,
        rerunScripts: rerunScripts,
        handleStatus: handleStatus,
        insertPreset: insertPreset,
        getExternalScripts: getExternalScripts,
        getExternalStyles: getExternalStyles,
        getScript: () => {
            if (currentScope === 'element') {
                syncElementEditorToMaster();
            } else if (algoCodeEditor) {
                masterScript = algoCodeEditor.value;
            }
            return masterScript;
        },
        setScript: (val) => {
            masterScript = val || '';
            if (currentScope === 'all') {
                if (algoCodeEditor) algoCodeEditor.value = masterScript;
            } else if (currentElementData) {
                updateElementDisplay();
            }
            detectAlgorithms();
            rerunScripts(masterScript);
        }
    };
})();
