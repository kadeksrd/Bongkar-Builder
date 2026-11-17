/**
 * Bongkar SEO Intelligence & Audit Manager (Google 2026 Standards)
 * Analyzes semantic headings, image alt texts, meta tags, SERP snippets,
 * broken/empty links, keyword relevancy, and provides direct jump-to-fix guidance.
 */

window.BongkarSEOAudit = (function () {
    let currentScore = 0;
    let focusKeywordInput = null;
    let metaTitleInput = null;
    let metaDescInput = null;
    let scoreDisplay = null;
    let scoreGauge = null;
    let verdictTitle = null;
    let verdictDesc = null;
    let checklistContainer = null;
    let counterTitle = null;
    let counterDesc = null;
    let topbarBadge = null;
    let topbarScoreNum = null;
    let serpTitle = null;
    let serpDesc = null;

    function __t(key, fallback = '', replacements = {}) {
        let str = (window.BongkarI18n && typeof window.BongkarI18n.t === 'function') 
            ? window.BongkarI18n.t(key, fallback) 
            : fallback;
        if (replacements && typeof replacements === 'object') {
            for (const [k, v] of Object.entries(replacements)) {
                str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
            }
        }
        return str;
    }

    function init() {
        cacheDom();
        bindEvents();

        // Run initial audit after canvas is loaded
        setTimeout(() => {
            runAudit();
        }, 1500);
    }

    function cacheDom() {
        focusKeywordInput = document.getElementById('seo-focus-keyword');
        metaTitleInput = document.getElementById('setting-meta-title');
        metaDescInput = document.getElementById('setting-meta-desc');
        scoreDisplay = document.getElementById('seo-score-display');
        scoreGauge = document.getElementById('seo-score-gauge');
        verdictTitle = document.getElementById('seo-verdict-title');
        verdictDesc = document.getElementById('seo-verdict-desc');
        checklistContainer = document.getElementById('seo-audit-checklist');
        counterTitle = document.getElementById('counter-meta-title');
        counterDesc = document.getElementById('counter-meta-desc');
        topbarBadge = document.getElementById('topbar-seo-badge');
        topbarScoreNum = document.getElementById('topbar-seo-score-num');
        serpTitle = document.getElementById('serp-preview-title');
        serpDesc = document.getElementById('serp-preview-desc');
    }

    function bindEvents() {
        if (metaTitleInput) {
            metaTitleInput.addEventListener('input', () => {
                updateCharacterCounters();
                updateSerpPreview();
                runAudit();
                markStudioDirty();
            });
        }

        if (metaDescInput) {
            metaDescInput.addEventListener('input', () => {
                updateCharacterCounters();
                updateSerpPreview();
                runAudit();
                markStudioDirty();
            });
        }

        if (focusKeywordInput) {
            focusKeywordInput.addEventListener('input', () => {
                runAudit();
                markStudioDirty();
            });
        }

        const btnRescan = document.getElementById('btn-rescan-seo');
        if (btnRescan) {
            btnRescan.addEventListener('click', () => {
                runAudit();
            });
        }

        if (topbarBadge) {
            topbarBadge.addEventListener('click', () => {
                const seoTab = document.querySelector('.sidebar-tab-btn[data-tab="seo"]');
                if (seoTab) seoTab.click();
            });
        }

        // Live re-audit when studio language is switched
        window.addEventListener('bongkar_lang_changed', () => {
            runAudit();
        });
    }

    /**
     * Run full Google 2026 Audit on Canvas & Metadata
     */
    function runAudit() {
        updateCharacterCounters();
        updateSerpPreview();

        const title = metaTitleInput ? metaTitleInput.value.trim() : '';
        const desc = metaDescInput ? metaDescInput.value.trim() : '';
        const keyword = focusKeywordInput ? focusKeywordInput.value.trim().toLowerCase() : '';

        const iframe = document.getElementById('bongkar-iframe-canvas');
        if (!iframe || !iframe.contentDocument) {
            return;
        }

        const iframeDoc = iframe.contentDocument;
        const root = iframeDoc.getElementById('bongkar-canvas-root') || iframeDoc.body;

        const h1Elements = Array.from(root.querySelectorAll('h1'));
        const h2Elements = Array.from(root.querySelectorAll('h2'));
        const imgElements = Array.from(root.querySelectorAll('img'));
        const linkElements = Array.from(root.querySelectorAll('a'));
        const allText = (root.innerText || '').trim();
        const words = allText.split(/\s+/).filter(Boolean);
        const wordCount = words.length;

        let totalScore = 0;
        const auditItems = [];

        // 1. Heading H1 Check (Bobot: 20 pts)
        if (h1Elements.length === 1) {
            totalScore += 20;
            const h1Snippet = truncateText(h1Elements[0].innerText, 45);
            auditItems.push({
                status: 'pass',
                title: __t('seo.item_h1_pass_title', 'Heading 1 (H1) Ideal'),
                desc: __t('seo.item_h1_pass_desc', 'Tepat 1 tag H1 ditemukan: "<strong>{h1}</strong>". Memenuhi standar struktur Google 2026.', { h1: escapeHtml(h1Snippet) }),
                action: {
                    label: __t('seo.item_h1_action_highlight', 'Sorot H1'),
                    icon: 'fa-solid fa-crosshairs',
                    handler: () => jumpToElement(getElementSelector(h1Elements[0]))
                }
            });
        } else if (h1Elements.length === 0) {
            auditItems.push({
                status: 'fail',
                title: __t('seo.item_h1_fail_title', 'Heading 1 (H1) Tidak Ditemukan'),
                desc: __t('seo.item_h1_fail_desc', 'Google 2026 mewajibkan tepat 1 tag &lt;h1&gt; sebagai topik utama halaman. Gunakan tombol di samping untuk menetapkan judul utama.'),
                action: {
                    label: __t('seo.item_h1_action_fix', 'Perbaiki & Jadikan H1'),
                    icon: 'fa-solid fa-wand-magic-sparkles',
                    handler: () => {
                        const firstHeading = root.querySelector('h2, h3, .hero-title, [class*="title"]') || root.querySelector('p');
                        if (firstHeading) {
                            jumpToElement(getElementSelector(firstHeading), 'tag');
                        }
                    }
                }
            });
        } else {
            totalScore += 10;
            auditItems.push({
                status: 'warn',
                title: __t('seo.item_h1_warn_title', `Terlalu Banyak Tag H1 (${h1Elements.length} H1 Ditemukan)`, { count: h1Elements.length }),
                desc: __t('seo.item_h1_warn_desc', 'Ditemukan lebih dari 1 tag H1. Disarankan hanya 1 H1 per halaman, turunkan judul lainnya menjadi H2.'),
                action: {
                    label: __t('seo.item_h1_action_inspect', 'Periksa H1 Tambahan'),
                    icon: 'fa-solid fa-crosshairs',
                    handler: () => jumpToElement(getElementSelector(h1Elements[1]), 'tag')
                }
            });
        }

        // 2. SEO Meta Title Check (Bobot: 15 pts)
        const titleLen = title.length;
        if (titleLen >= 40 && titleLen <= 60) {
            totalScore += 15;
            auditItems.push({
                status: 'pass',
                title: __t('seo.item_title_pass_title', 'Panjang Meta Title Ideal'),
                desc: __t('seo.item_title_pass_desc', `${titleLen} karakter (Ideal Google: 40–60 karakter). Tidak akan terpotong pada hasil pencarian desktop & mobile.`, { len: titleLen })
            });
        } else if (titleLen > 0) {
            totalScore += 8;
            auditItems.push({
                status: 'warn',
                title: titleLen < 40 ? __t('seo.item_title_short', 'Meta Title Terlalu Pendek') : __t('seo.item_title_long', 'Meta Title Terlalu Panjang'),
                desc: __t('seo.item_title_warn_desc', `${titleLen} karakter. Disarankan antara 40–60 karakter agar relevan dan tidak terpotong di Google.`, { len: titleLen }),
                action: {
                    label: __t('seo.item_title_action_edit', 'Edit Judul'),
                    icon: 'fa-solid fa-pen',
                    handler: () => focusInputField(metaTitleInput)
                }
            });
        } else {
            auditItems.push({
                status: 'fail',
                title: __t('seo.item_title_empty_title', 'Meta Title Masih Kosong'),
                desc: __t('seo.item_title_empty_desc', 'Meta title adalah faktor penentu peringkat tertinggi di Google Search.'),
                action: {
                    label: __t('seo.item_title_action_write', 'Tulis Judul'),
                    icon: 'fa-solid fa-pen',
                    handler: () => focusInputField(metaTitleInput)
                }
            });
        }

        // 3. SEO Meta Description Check (Bobot: 15 pts)
        const descLen = desc.length;
        if (descLen >= 120 && descLen <= 160) {
            totalScore += 15;
            auditItems.push({
                status: 'pass',
                title: __t('seo.item_desc_pass_title', 'Panjang Meta Description Sempurna'),
                desc: __t('seo.item_desc_pass_desc', `${descLen} karakter (Ideal Google: 120–160 karakter). Memberikan ringkasan yang menarik klik (CTR).`, { len: descLen })
            });
        } else if (descLen > 0) {
            totalScore += 8;
            auditItems.push({
                status: 'warn',
                title: descLen < 120 ? __t('seo.item_desc_short', 'Meta Description Terlalu Pendek') : __t('seo.item_desc_long', 'Meta Description Terlalu Panjang'),
                desc: __t('seo.item_desc_warn_desc', `${descLen} karakter. Disarankan 120–160 karakter agar informatif dan tidak terpotong di Google.`, { len: descLen }),
                action: {
                    label: __t('seo.item_desc_action_edit', 'Edit Deskripsi'),
                    icon: 'fa-solid fa-pen',
                    handler: () => focusInputField(metaDescInput)
                }
            });
        } else {
            auditItems.push({
                status: 'fail',
                title: __t('seo.item_desc_empty_title', 'Meta Description Masih Kosong'),
                desc: __t('seo.item_desc_empty_desc', 'Tambahkan ringkasan menarik agar Google tidak menampilkan cuplikan teks acak.'),
                action: {
                    label: __t('seo.item_desc_action_write', 'Tulis Deskripsi'),
                    icon: 'fa-solid fa-pen',
                    handler: () => focusInputField(metaDescInput)
                }
            });
        }

        // 4. Focus Keyword Relevancy (Bobot: 20 pts)
        if (keyword.length > 0) {
            let kwScore = 0;
            const inTitle = title.toLowerCase().includes(keyword);
            const inDesc = desc.toLowerCase().includes(keyword);
            const inH1 = h1Elements.length > 0 && h1Elements[0].innerText.toLowerCase().includes(keyword);
            const inBody = allText.toLowerCase().includes(keyword);

            if (inTitle) kwScore += 5;
            if (inDesc) kwScore += 5;
            if (inH1) kwScore += 5;
            if (inBody) kwScore += 5;

            totalScore += kwScore;

            const kwBadges = [
                inTitle ? '<span style="color:#4ade80;"><i class="fa-solid fa-check"></i> ' + __t('seo.preview_title_tag', 'Judul') + '</span>' : '<span style="color:#f87171;"><i class="fa-solid fa-xmark"></i> ' + __t('seo.preview_title_tag', 'Judul') + '</span>',
                inDesc ? '<span style="color:#4ade80;"><i class="fa-solid fa-check"></i> ' + __t('seo.preview_desc_tag', 'Deskripsi') + '</span>' : '<span style="color:#f87171;"><i class="fa-solid fa-xmark"></i> ' + __t('seo.preview_desc_tag', 'Deskripsi') + '</span>',
                inH1 ? '<span style="color:#4ade80;"><i class="fa-solid fa-check"></i> H1</span>' : '<span style="color:#f87171;"><i class="fa-solid fa-xmark"></i> H1</span>',
                inBody ? '<span style="color:#4ade80;"><i class="fa-solid fa-check"></i> ' + __t('seo.preview_content_tag', 'Konten') + '</span>' : '<span style="color:#f87171;"><i class="fa-solid fa-xmark"></i> ' + __t('seo.preview_content_tag', 'Konten') + '</span>'
            ].join(' | ');

            auditItems.push({
                status: kwScore >= 15 ? 'pass' : (kwScore >= 10 ? 'warn' : 'fail'),
                title: __t('seo.item_kw_found_title', `Kehadiran Keyword: "${escapeHtml(keyword)}"`, { kw: escapeHtml(keyword) }),
                desc: __t('seo.item_kw_found_desc', `Sebaran kata kunci target: [ {badges} ]. Membantu Google mengindeks topik utama landing page Anda.`, { badges: kwBadges })
            });
        } else {
            totalScore += 12; // neutral default
            auditItems.push({
                status: 'warn',
                title: __t('seo.item_kw_empty_title', 'Belum Menentukan Kata Kunci Target'),
                desc: __t('seo.item_kw_empty_desc', 'Tuliskan kata kunci target di kotak atas (misal: "Jasa Website Murah") untuk audit akurasi keyword Google.'),
                action: {
                    label: __t('seo.item_kw_action_set', 'Isi Keyword'),
                    icon: 'fa-solid fa-key',
                    handler: () => focusInputField(focusKeywordInput)
                }
            });
        }

        // 5. Image Alt Text Audit (Bobot: 15 pts)
        const missingAltImages = [];
        imgElements.forEach((img, idx) => {
            const alt = (img.getAttribute('alt') || '').trim();
            if (!alt) {
                missingAltImages.push({
                    idx: idx,
                    selector: getElementSelector(img),
                    src: img.getAttribute('src') || ''
                });
            }
        });

        if (imgElements.length === 0) {
            totalScore += 15;
            auditItems.push({
                status: 'pass',
                title: __t('seo.item_img_none_title', 'Audit Gambar Bersih'),
                desc: __t('seo.item_img_none_desc', 'Halaman tidak memiliki gambar atau semua aset berbentuk vektor murni (Font Awesome).')
            });
        } else if (missingAltImages.length === 0) {
            totalScore += 15;
            auditItems.push({
                status: 'pass',
                title: __t('seo.item_img_pass_title', 'Semua Gambar Memiliki Alt Text'),
                desc: __t('seo.item_img_pass_desc', `${imgElements.length} gambar memiliki deskripsi teks (Alt) yang siap terindeks di Google Images & ramah aksesibilitas.`, { count: imgElements.length })
            });
        } else {
            const deduction = Math.min(15, missingAltImages.length * 4);
            totalScore += (15 - deduction);
            auditItems.push({
                status: 'fail',
                title: __t('seo.item_img_fail_title', `${missingAltImages.length} Gambar Tidak Memiliki Alt Text`, { count: missingAltImages.length }),
                desc: __t('seo.item_img_fail_desc', 'Google tidak dapat memahami isi gambar tanpa atribut Alt. Klik tombol di bawah untuk langsung menuju gambar dan mengisinya di Inspector:'),
                subItems: missingAltImages.map((m, i) => ({
                    label: __t('seo.item_img_chip', `Gambar #${i + 1}`, { num: i + 1 }),
                    icon: 'fa-solid fa-image',
                    handler: () => jumpToElement(m.selector, 'alt')
                }))
            });
        }

        // 6. Link Health Audit (Bobot: 10 pts)
        const placeholderLinks = [];
        linkElements.forEach((link, idx) => {
            const href = (link.getAttribute('href') || '').trim();
            if (!href || href === '#' || href === 'javascript:void(0)' || href === 'javascript:;') {
                placeholderLinks.push({
                    idx: idx,
                    selector: getElementSelector(link),
                    text: truncateText(link.innerText || 'Tombol / Link', 24)
                });
            }
        });

        if (placeholderLinks.length === 0) {
            totalScore += 10;
            auditItems.push({
                status: 'pass',
                title: __t('seo.item_links_pass_title', 'Semua Tautan Mengarah ke URL Valid'),
                desc: __t('seo.item_links_pass_desc', `${linkElements.length} link anchor memiliki target href yang valid (Tidak ada tautan kosong/mati).`, { count: linkElements.length })
            });
        } else {
            totalScore += Math.max(3, 10 - (placeholderLinks.length * 2));
            auditItems.push({
                status: 'warn',
                title: __t('seo.item_links_warn_title', `${placeholderLinks.length} Tautan Placeholder (href='#')`, { count: placeholderLinks.length }),
                desc: __t('seo.item_links_warn_desc', 'Ditemukan tombol atau link yang belum diisi URL target. Klik tautan untuk melengkapi URL di Inspector:'),
                subItems: placeholderLinks.map(p => ({
                    label: `Link: "${p.text}"`,
                    icon: 'fa-solid fa-link',
                    handler: () => jumpToElement(p.selector, 'href')
                }))
            });
        }

        // 7. Word Count & Readability (Bobot: 5 pts)
        if (wordCount >= 300) {
            totalScore += 5;
            auditItems.push({
                status: 'pass',
                title: __t('seo.item_words_ideal_title', `Kedalaman Konten Ideal (${wordCount} Kata)`, { count: wordCount }),
                desc: __t('seo.item_words_ideal_desc', 'Memenuhi standar Google 2026 untuk landing page yang berbobot dan bernilai tinggi bagi pengunjung.')
            });
        } else if (wordCount >= 150) {
            totalScore += 3;
            auditItems.push({
                status: 'warn',
                title: __t('seo.item_words_ok_title', `Panjang Konten Cukup (${wordCount} Kata)`, { count: wordCount }),
                desc: __t('seo.item_words_ok_desc', 'Disarankan minimal 300 kata (misal dengan menambahkan section FAQ atau penjelasan fitur) untuk meningkatkan otoritas SEO.')
            });
        } else {
            totalScore += 1;
            auditItems.push({
                status: 'warn',
                title: __t('seo.item_words_short_title', `Konten Terlalu Singkat (${wordCount} Kata)`, { count: wordCount }),
                desc: __t('seo.item_words_short_desc', 'Google cenderung memprioritaskan halaman dengan konten informatif lengkap di atas 300 kata.')
            });
        }

        // 8. Open Graph & WhatsApp Social Share Image
        const ogImageInput = document.getElementById('setting-og-image-url');
        const hasOgImage = ogImageInput && ogImageInput.value.trim().length > 0;
        if (hasOgImage) {
            auditItems.push({
                status: 'pass',
                title: __t('seo.item_og_pass_title', 'Thumbnail Share WhatsApp & Medsos Siap'),
                desc: __t('seo.item_og_pass_desc', 'Tautan Anda akan menampilkan kartu visual saat dibagikan ke WhatsApp, Telegram, Facebook, dan Twitter.')
            });
        } else {
            auditItems.push({
                status: 'warn',
                title: __t('seo.item_og_warn_title', 'Belum Ada Thumbnail Share WhatsApp'),
                desc: __t('seo.item_og_warn_desc', 'Sebaiknya pasang thumbnail share (1200x630 px) agar link yang dibagikan memiliki preview kartu gambar di WhatsApp.'),
                action: {
                    label: __t('seo.choose_image', 'Pilih Gambar'),
                    icon: 'fa-brands fa-whatsapp',
                    handler: () => {
                        const btnUpload = document.getElementById('btn-upload-og-image');
                        if (btnUpload) btnUpload.click();
                    }
                }
            });
        }

        currentScore = Math.min(100, Math.max(0, Math.round(totalScore)));

        renderAuditResults(currentScore, auditItems);
    }

    /**
     * Render the score, gauge, and categorized checklist
     */
    function renderAuditResults(score, items) {
        if (scoreDisplay) scoreDisplay.textContent = score;

        // Color coding
        let scoreColor = '#22c55e';
        let badgeClass = 'badge-good';
        let verdict = __t('seo.verdict_good', 'Optimal (Siap Peringkat Google 2026)');
        let desc = __t('seo.verdict_good_desc', 'Halaman telah memenuhi standar teknis SEO Google 2026. Lolos uji semantik dan relevansi.');

        if (score < 50) {
            scoreColor = '#ef4444';
            badgeClass = 'badge-danger';
            verdict = __t('seo.verdict_danger', 'Kritis (Perlu Perbaikan Segera)');
            desc = __t('seo.verdict_danger_desc', 'Ditemukan masalah mendasar seperti Heading H1 kosong atau Meta Tag yang belum diisi.');
        } else if (score < 80) {
            scoreColor = '#f59e0b';
            badgeClass = 'badge-warning';
            verdict = __t('seo.verdict_warn', 'Cukup Baik (Ada Rekomendasi)');
            desc = __t('seo.verdict_warn_desc', 'Struktur halaman cukup baik, namun masih ada ruang peningkatan seperti Alt gambar atau panjang teks.');
        }

        if (scoreGauge) {
            scoreGauge.style.setProperty('--seo-score', score);
            scoreGauge.style.background = `conic-gradient(${scoreColor} ${score * 3.6}deg, rgba(255, 255, 255, 0.08) 0deg)`;
            scoreGauge.style.boxShadow = `0 0 16px ${scoreColor}40`;
        }

        if (verdictTitle) verdictTitle.textContent = verdict;
        if (verdictDesc) verdictDesc.textContent = desc;

        // Topbar Pill Badge
        if (topbarBadge && topbarScoreNum) {
            topbarScoreNum.textContent = `${score}`;
            topbarBadge.className = `topbar-seo-badge ${badgeClass}`;
        }

        // Render Checklist
        if (checklistContainer) {
            let html = '';
            items.forEach((item, index) => {
                let iconHtml = '<i class="fa-solid fa-circle-check seo-audit-icon status-pass"></i>';
                if (item.status === 'warn') {
                    iconHtml = '<i class="fa-solid fa-triangle-exclamation seo-audit-icon status-warn"></i>';
                } else if (item.status === 'fail') {
                    iconHtml = '<i class="fa-solid fa-circle-xmark seo-audit-icon status-fail"></i>';
                }

                html += `
                    <div class="seo-audit-item" id="seo-item-${index}">
                        ${iconHtml}
                        <div class="seo-audit-content">
                            <div class="seo-audit-title">${item.title}</div>
                            <div class="seo-audit-desc">${item.desc}</div>
                `;

                if (item.action) {
                    html += `
                        <button type="button" class="seo-fix-btn" data-item-idx="${index}">
                            <i class="${item.action.icon || 'fa-solid fa-bolt'}"></i> ${item.action.label}
                        </button>
                    `;
                }

                if (item.subItems && item.subItems.length > 0) {
                    html += '<div style="margin-top: 6px;">';
                    item.subItems.forEach((sub, subIdx) => {
                        html += `
                            <button type="button" class="seo-subitem-chip" data-item-idx="${index}" data-sub-idx="${subIdx}">
                                <i class="${sub.icon}"></i> ${escapeHtml(sub.label)}
                            </button>
                        `;
                    });
                    html += '</div>';
                }

                html += `
                        </div>
                    </div>
                `;
            });

            checklistContainer.innerHTML = html;

            // Bind Action Clicks
            items.forEach((item, index) => {
                if (item.action && item.action.handler) {
                    const btn = checklistContainer.querySelector(`.seo-fix-btn[data-item-idx="${index}"]`);
                    if (btn) {
                        btn.addEventListener('click', item.action.handler);
                    }
                }

                if (item.subItems && item.subItems.length > 0) {
                    item.subItems.forEach((sub, subIdx) => {
                        const subBtn = checklistContainer.querySelector(`.seo-subitem-chip[data-item-idx="${index}"][data-sub-idx="${subIdx}"]`);
                        if (subBtn && sub.handler) {
                            subBtn.addEventListener('click', sub.handler);
                        }
                    });
                }
            });
        }
    }

    /**
     * Live character counter updates with color indicator
     */
    function updateCharacterCounters() {
        if (counterTitle && metaTitleInput) {
            const count = metaTitleInput.value.length;
            counterTitle.textContent = `${count}/60`;
            counterTitle.className = 'char-counter ' + (count >= 40 && count <= 60 ? 'counter-good' : (count > 0 ? 'counter-warning' : 'counter-danger'));
        }

        if (counterDesc && metaDescInput) {
            const count = metaDescInput.value.length;
            counterDesc.textContent = `${count}/160`;
            counterDesc.className = 'char-counter ' + (count >= 120 && count <= 160 ? 'counter-good' : (count > 0 ? 'counter-warning' : 'counter-danger'));
        }
    }

    /**
     * Live Google Search Result Snippet Simulation & Social Share Preview Sync
     */
    function updateSerpPreview() {
        const titleVal = metaTitleInput ? (metaTitleInput.value.trim() || 'Judul Halaman Anda | Website Brand') : '';
        const descVal = metaDescInput ? (metaDescInput.value.trim() || 'Tambahkan deskripsi meta ringkas dan menarik untuk melihat bagaimana halaman ini akan tampil di Google Search 2026.') : '';

        if (serpTitle) {
            serpTitle.textContent = titleVal;
        }

        if (serpDesc) {
            serpDesc.textContent = descVal;
        }

        // Live sync WhatsApp preview
        const waTitle = document.getElementById('whatsapp-preview-title');
        const waDesc = document.getElementById('whatsapp-preview-desc');
        if (waTitle) waTitle.textContent = titleVal;
        if (waDesc) waDesc.textContent = descVal;

        // Live sync Browser Tab mockup
        const tabTitle = document.getElementById('browser-tab-title-text');
        if (tabTitle) tabTitle.textContent = titleVal;
    }

    /**
     * Jump and highlight element in canvas iframe + auto focus Inspector input
     */
    function jumpToElement(selector, focusField = null) {
        const iframe = document.getElementById('bongkar-iframe-canvas');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'BONGKAR_HIGHLIGHT_ELEMENT',
                selector: selector,
                focusField: focusField
            }, '*');

            // Switch to Inspector tab if focusing on an element attribute
            if (focusField) {
                const inspectorTab = document.querySelector('.sidebar-tab-btn[data-tab="inspector"]');
                if (inspectorTab) {
                    inspectorTab.click();
                    if (window.BongkarInspector && typeof window.BongkarInspector.focusField === 'function') {
                        window.BongkarInspector.focusField(focusField);
                    }
                }
            }
        }
    }

    /**
     * Focus specific sidebar input field with pulsating outline
     */
    function focusInputField(inputEl) {
        if (!inputEl) return;
        inputEl.focus();
        inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        inputEl.style.outline = '2px solid #818cf8';
        inputEl.style.boxShadow = '0 0 10px rgba(129, 140, 248, 0.6)';
        setTimeout(() => {
            inputEl.style.outline = '';
            inputEl.style.boxShadow = '';
        }, 3000);
    }

    function getElementSelector(el) {
        if (!el || el.nodeType !== Node.ELEMENT_NODE) return '';
        if (el.id) return '#' + el.id;

        let selector = el.tagName.toLowerCase();
        if (el.classList && el.classList.length > 0) {
            const classes = Array.from(el.classList).filter(c => !c.startsWith('bongkar-'));
            if (classes.length > 0) {
                selector += '.' + classes[0];
            }
        }
        return selector;
    }

    function truncateText(str, max) {
        if (!str) return '';
        str = str.replace(/\s+/g, ' ').trim();
        return str.length > max ? str.substring(0, max) + '...' : str;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function markStudioDirty() {
        const statusEl = document.getElementById('bongkar-save-status');
        if (statusEl) {
            statusEl.className = 'save-status unsaved';
            statusEl.innerHTML = '<span class="status-dot"></span> <span class="status-text">Belum disimpan</span>';
        }
    }

    return {
        init: init,
        runAudit: runAudit,
        getScore: () => currentScore
    };
})();
