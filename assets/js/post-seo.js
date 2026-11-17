/**
 * Bongkar Post SEO Intelligence & Automation Controller
 * Real-time dynamic analysis for WordPress Articles (Posts) in Gutenberg & Classic Editor.
 */

(function ($) {
    'use strict';

    const PostSEO = {
        score: 0,
        dom: {},
        debounceTimer: null,
        stopWords: [
            // Bahasa Indonesia common stop words
            'yang', 'di', 'dan', 'ini', 'itu', 'untuk', 'dari', 'ke', 'adalah', 'pada',
            'dengan', 'saya', 'kamu', 'dia', 'mereka', 'kita', 'kami', 'bisa', 'akan',
            'karena', 'juga', 'atau', 'dalam', 'tidak', 'ada', 'sudah', 'oleh', 'saat',
            'hanya', 'lebih', 'tentang', 'seperti', 'setelah', 'bila', 'jika', 'namun',
            'banyak', 'sangat', 'secara', 'antara', 'bagi', 'harus', 'dapat', 'serta',
            // English common stop words
            'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of',
            'with', 'as', 'by', 'that', 'this', 'it', 'from', 'or', 'are', 'be', 'was'
        ],

        init: function () {
            this.cacheDom();
            this.bindEvents();
            this.initGutenbergWatcher();
            this.initMediaUploader();

            // Run initial audit after editor stabilizes
            setTimeout(() => {
                this.runAudit();
            }, 1200);
        },

        cacheDom: function () {
            this.dom = {
                wrapper: $('.bp-seo-wrapper'),
                focusKw: $('#bp_seo_focus_kw'),
                title: $('#bp_seo_title'),
                desc: $('#bp_seo_desc'),
                canonical: $('#bp_seo_canonical'),
                hiddenScore: $('#bp_seo_score'),
                badge: $('#bp-seo-badge'),
                scoreNum: $('#bp-seo-score-num'),
                statusPill: $('#bp-seo-status-pill'),
                titleCounter: $('#bp-title-counter'),
                descCounter: $('#bp-desc-counter'),
                titleProgress: $('#bp-title-progress'),
                descProgress: $('#bp-desc-progress'),
                serpBox: $('#bp-google-box'),
                serpTitle: $('#bp-serp-title'),
                serpDesc: $('#bp-serp-desc'),
                serpUrl: $('#bp-serp-url'),
                socialTitle: $('#bp-social-title'),
                socialDesc: $('#bp-social-desc'),
                socialThumb: $('#bp-social-card-img'),
                ogInput: $('#bp_seo_og_image'),
                ogPreviewThumb: $('#bp-og-preview-thumb'),
                btnRemoveOg: $('#bp-btn-remove-og-image'),
                auditChecklist: $('#bp-audit-checklist'),
                auditScoreGauge: $('#bp-audit-score-gauge'),
                auditBadgeLarge: $('.bp-audit-badge-large'),
                auditVerdictTitle: $('#bp-audit-verdict-title'),
                auditVerdictDesc: $('#bp-audit-verdict-desc'),
                recomCount: $('#bp-recom-count'),
                statReadingTime: $('#bp-stat-reading-time'),
                statWordCount: $('#bp-stat-word-count'),
                statKwDensity: $('#bp-stat-kw-density'),
                // Sidebar Elements (Di Samping)
                sideWrapper: $('.bp-seo-side-wrapper'),
                sideFocusKw: $('#bp_seo_side_focus_kw'),
                sideTitle: $('#bp_seo_side_title'),
                sideDesc: $('#bp_seo_side_desc'),
                sideHiddenScore: $('#bp_seo_side_score'),
                sideBadge: $('#bp-side-score-badge'),
                sideScoreNum: $('#bp-side-score-num'),
                sideStatusPill: $('#bp-side-status-pill'),
                sideTitleCounter: $('#bp-side-title-counter'),
                sideDescCounter: $('#bp-side-desc-counter'),
                sideTitleProgress: $('#bp-side-title-progress'),
                sideDescProgress: $('#bp-side-desc-progress'),
                sideChkKw: $('#bp-side-ind-kw'),
                sideChkTitle: $('#bp-side-ind-title'),
                sideChkDesc: $('#bp-side-ind-desc'),
                sideChkWords: $('#bp-side-ind-words'),
            };
        },

        bindEvents: function () {
            const self = this;

            // Tab Switching
            $('.bp-seo-tab-btn').on('click', function () {
                const targetTab = $(this).data('tab');
                $('.bp-seo-tab-btn').removeClass('is-active');
                $(this).addClass('is-active');
                $('.bp-seo-tab-panel').removeClass('is-active');
                $('#bp-tab-' + targetTab).addClass('is-active');
            });

            // Live Input Monitoring & 2-Way Sync (Bottom & Sidebar)
            this.dom.focusKw.on('input', function () {
                if (self.dom.sideFocusKw.length && self.dom.sideFocusKw.val() !== self.dom.focusKw.val()) {
                    self.dom.sideFocusKw.val(self.dom.focusKw.val());
                }
                self.scheduleAudit();
            });

            this.dom.sideFocusKw.on('input', function () {
                if (self.dom.focusKw.length && self.dom.focusKw.val() !== self.dom.sideFocusKw.val()) {
                    self.dom.focusKw.val(self.dom.sideFocusKw.val());
                }
                self.scheduleAudit();
            });

            this.dom.title.on('input', function () {
                if (self.dom.sideTitle.length && self.dom.sideTitle.val() !== self.dom.title.val()) {
                    self.dom.sideTitle.val(self.dom.title.val());
                }
                self.updateCounters();
                self.updatePreviews();
                self.scheduleAudit();
            });

            this.dom.sideTitle.on('input', function () {
                if (self.dom.title.length && self.dom.title.val() !== self.dom.sideTitle.val()) {
                    self.dom.title.val(self.dom.sideTitle.val());
                }
                self.updateCounters();
                self.updatePreviews();
                self.scheduleAudit();
            });

            this.dom.desc.on('input', function () {
                if (self.dom.sideDesc.length && self.dom.sideDesc.val() !== self.dom.desc.val()) {
                    self.dom.sideDesc.val(self.dom.desc.val());
                }
                self.updateCounters();
                self.updatePreviews();
                self.scheduleAudit();
            });

            this.dom.sideDesc.on('input', function () {
                if (self.dom.desc.length && self.dom.desc.val() !== self.dom.sideDesc.val()) {
                    self.dom.desc.val(self.dom.sideDesc.val());
                }
                self.updateCounters();
                self.updatePreviews();
                self.scheduleAudit();
            });

            // Sidebar Quick Automation Buttons
            $('#bp-side-btn-auto-kw').on('click', function () {
                $('#bp-btn-auto-keyword').trigger('click');
            });
            $('#bp-side-btn-auto-title').on('click', function () {
                $('#bp-btn-auto-title').trigger('click');
            });
            $('#bp-side-btn-auto-desc').on('click', function () {
                $('#bp-btn-auto-desc').trigger('click');
            });

            // Sidebar Jump to Main Full Suite Action
            $('#bp-side-btn-jump-main').on('click', function (e) {
                e.preventDefault();
                const $target = $('#bongkar_post_seo_metabox');
                if ($target.length) {
                    if ($target.hasClass('closed')) {
                        $target.removeClass('closed');
                    }
                    $('html, body').animate({
                        scrollTop: $target.offset().top - 40
                    }, 450);
                    $target.css({
                        'box-shadow': '0 0 0 3px #4f46e5',
                        'transition': 'box-shadow 0.3s ease'
                    });
                    setTimeout(() => $target.css('box-shadow', ''), 1400);
                }
            });

            // Mobile vs Desktop SERP toggle
            $('.bp-device-btn').on('click', function () {
                $('.bp-device-btn').removeClass('is-active');
                $(this).addClass('is-active');
                if ($(this).data('device') === 'mobile') {
                    self.dom.serpBox.addClass('is-mobile');
                } else {
                    self.dom.serpBox.removeClass('is-mobile');
                }
            });

            // Manual Rescan Button
            $('#bp-btn-rescan').on('click', function () {
                $(this).addClass('updating');
                self.runAudit();
                setTimeout(() => $(this).removeClass('updating'), 400);
            });

            // ================= AUTOMATION 1: AUTO DETECT KEYWORD =================
            $('#bp-btn-auto-keyword').on('click', function () {
                const title = self.getEditorTitle();
                const content = self.getEditorCleanText();

                if (!content && !title) {
                    alert('Silakan tulis judul atau beberapa paragraf terlebih dahulu untuk mendeteksi kata kunci.');
                    return;
                }

                const suggestedKw = self.detectBestKeyword(title, content);
                if (suggestedKw) {
                    self.dom.focusKw.val(suggestedKw).trigger('input');
                    // Add subtle glow effect
                    self.dom.focusKw.css({ 'border-color': '#22c55e', 'box-shadow': '0 0 0 3px rgba(34, 197, 94, 0.2)' });
                    setTimeout(() => self.dom.focusKw.css({ 'border-color': '', 'box-shadow': '' }), 1000);
                } else {
                    alert('Belum cukup teks unik untuk mendeteksi kata kunci. Coba ketik artikel lebih lengkap.');
                }
            });

            // ================= AUTOMATION 2: AUTO FILL SEO TITLE =================
            $('#bp-btn-auto-title').on('click', function () {
                const postTitle = self.getEditorTitle();
                if (!postTitle) {
                    alert('Judul artikel masih kosong. Tulis judul artikel di atas terlebih dahulu.');
                    return;
                }

                const siteName = (window.bongkarPostSEOData && window.bongkarPostSEOData.siteName) ? window.bongkarPostSEOData.siteName : '';
                let generatedTitle = postTitle;
                if (siteName && !generatedTitle.includes(siteName)) {
                    if ((generatedTitle.length + siteName.length + 3) <= 60) {
                        generatedTitle += ' - ' + siteName;
                    }
                }

                self.dom.title.val(generatedTitle).trigger('input');
            });

            // ================= AUTOMATION 3: AUTO EXTRACT META DESC =================
            $('#bp-btn-auto-desc').on('click', function () {
                const cleanText = self.getEditorCleanText();
                if (!cleanText || cleanText.length < 20) {
                    alert('Belum ada isi artikel yang bisa diekstrak. Tulis paragraf artikel terlebih dahulu.');
                    return;
                }

                // Ambil kalimat atau paragraf pertama hingga ~145-155 karakter
                let snippet = cleanText.substring(0, 160).trim();
                const lastPeriod = snippet.lastIndexOf('.');
                if (lastPeriod > 100) {
                    snippet = snippet.substring(0, lastPeriod + 1);
                } else {
                    const lastSpace = snippet.lastIndexOf(' ');
                    if (lastSpace > 110) {
                        snippet = snippet.substring(0, lastSpace) + '...';
                    }
                }

                self.dom.desc.val(snippet).trigger('input');
            });

            // Classic Editor Title Monitoring
            $('#title').on('input', function () {
                self.scheduleAudit();
            });
            $('#content').on('input', function () {
                self.scheduleAudit();
            });
        },

        initGutenbergWatcher: function () {
            const self = this;
            if (window.wp && wp.data && wp.data.subscribe) {
                let lastContent = '';
                let lastTitle = '';

                wp.data.subscribe(function () {
                    const editor = wp.data.select('core/editor');
                    if (!editor) return;

                    const curContent = editor.getEditedPostContent() || '';
                    const curTitle = editor.getEditedPostAttribute('title') || '';

                    if (curContent !== lastContent || curTitle !== lastTitle) {
                        lastContent = curContent;
                        lastTitle = curTitle;
                        self.scheduleAudit();
                    }
                });
            }

            // Classic TinyMCE watcher
            $(document).on('tinymce-editor-init', function (event, editor) {
                if (editor.id === 'content') {
                    editor.on('keyup change NodeChange', function () {
                        self.scheduleAudit();
                    });
                }
            });
        },

        initMediaUploader: function () {
            const self = this;
            let fileFrame;

            $('#bp-btn-select-og-image').on('click', function (e) {
                e.preventDefault();
                if (fileFrame) {
                    fileFrame.open();
                    return;
                }

                fileFrame = wp.media({
                    title: 'Pilih Gambar untuk Media Sosial (Open Graph)',
                    button: { text: 'Gunakan Gambar Ini' },
                    multiple: false
                });

                fileFrame.on('select', function () {
                    const attachment = fileFrame.state().get('selection').first().toJSON();
                    const imgUrl = attachment.url;

                    self.dom.ogInput.val(imgUrl);
                    self.dom.ogPreviewThumb.html('<img src="' + imgUrl + '" alt="Social Preview">');
                    self.dom.socialThumb.html('<img src="' + imgUrl + '" alt="Social Preview">');
                    self.dom.btnRemoveOg.show();
                    self.runAudit();
                });

                fileFrame.open();
            });

            $('#bp-btn-remove-og-image').on('click', function (e) {
                e.preventDefault();
                self.dom.ogInput.val('');
                self.dom.ogPreviewThumb.html('<span class="bp-no-thumb">Belum ada gambar kustom (menggunakan Featured Image)</span>');
                self.dom.socialThumb.html('<div class="bp-social-img-placeholder"><span>Featured Image Bawaan</span></div>');
                $(this).hide();
                self.runAudit();
            });
        },

        getEditorTitle: function () {
            if (window.wp && wp.data && wp.data.select && wp.data.select('core/editor')) {
                const t = wp.data.select('core/editor').getEditedPostAttribute('title');
                if (t) return t.trim();
            }
            const classicTitle = $('#title').val();
            return classicTitle ? classicTitle.trim() : '';
        },

        getEditorRawContent: function () {
            if (window.wp && wp.data && wp.data.select && wp.data.select('core/editor')) {
                const c = wp.data.select('core/editor').getEditedPostContent();
                if (c) return c;
            }
            if (window.tinymce && tinymce.get('content') && !tinymce.get('content').isHidden()) {
                return tinymce.get('content').getContent();
            }
            return $('#content').val() || '';
        },

        getEditorCleanText: function () {
            const raw = this.getEditorRawContent();
            if (!raw) return '';
            // Strip HTML tags & non-breaking spaces
            const tmp = document.createElement('div');
            tmp.innerHTML = raw;
            return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
        },

        scheduleAudit: function () {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.updateCounters();
                this.updatePreviews();
                this.runAudit();
            }, 300);
        },

        updateCounters: function () {
            const titleVal = this.dom.title.val().trim();
            const descVal = this.dom.desc.val().trim();

            const tLen = titleVal.length;
            const dLen = descVal.length;

            this.dom.titleCounter.text(tLen + ' / 60');
            this.dom.descCounter.text(dLen + ' / 160');

            if (this.dom.sideTitleCounter.length) {
                this.dom.sideTitleCounter.text(tLen + ' / 60');
            }
            if (this.dom.sideDescCounter.length) {
                this.dom.sideDescCounter.text(dLen + ' / 160');
            }

            // Title progress
            const tPct = Math.min(100, Math.round((tLen / 60) * 100));
            this.dom.titleProgress.css('width', tPct + '%');
            this.dom.titleProgress.removeClass('is-perfect is-warning is-danger');
            this.dom.titleCounter.removeClass('is-perfect is-warning is-danger');

            if (this.dom.sideTitleProgress.length) {
                this.dom.sideTitleProgress.css('width', tPct + '%');
                this.dom.sideTitleProgress.removeClass('is-perfect is-warning is-danger');
                this.dom.sideTitleCounter.removeClass('is-perfect is-warning is-danger');
            }

            if (tLen >= 40 && tLen <= 60) {
                this.dom.titleProgress.addClass('is-perfect');
                this.dom.titleCounter.addClass('is-perfect');
                if (this.dom.sideTitleProgress.length) {
                    this.dom.sideTitleProgress.addClass('is-perfect');
                    this.dom.sideTitleCounter.addClass('is-perfect');
                }
            } else if (tLen > 60) {
                this.dom.titleProgress.addClass('is-danger');
                this.dom.titleCounter.addClass('is-danger');
                if (this.dom.sideTitleProgress.length) {
                    this.dom.sideTitleProgress.addClass('is-danger');
                    this.dom.sideTitleCounter.addClass('is-danger');
                }
            } else if (tLen > 0) {
                this.dom.titleProgress.addClass('is-warning');
                this.dom.titleCounter.addClass('is-warning');
                if (this.dom.sideTitleProgress.length) {
                    this.dom.sideTitleProgress.addClass('is-warning');
                    this.dom.sideTitleCounter.addClass('is-warning');
                }
            }

            // Desc progress
            const dPct = Math.min(100, Math.round((dLen / 160) * 100));
            this.dom.descProgress.css('width', dPct + '%');
            this.dom.descProgress.removeClass('is-perfect is-warning is-danger');
            this.dom.descCounter.removeClass('is-perfect is-warning is-danger');

            if (this.dom.sideDescProgress.length) {
                this.dom.sideDescProgress.css('width', dPct + '%');
                this.dom.sideDescProgress.removeClass('is-perfect is-warning is-danger');
                this.dom.sideDescCounter.removeClass('is-perfect is-warning is-danger');
            }

            if (dLen >= 120 && dLen <= 160) {
                this.dom.descProgress.addClass('is-perfect');
                this.dom.descCounter.addClass('is-perfect');
                if (this.dom.sideDescProgress.length) {
                    this.dom.sideDescProgress.addClass('is-perfect');
                    this.dom.sideDescCounter.addClass('is-perfect');
                }
            } else if (dLen > 160) {
                this.dom.descProgress.addClass('is-danger');
                this.dom.descCounter.addClass('is-danger');
                if (this.dom.sideDescProgress.length) {
                    this.dom.sideDescProgress.addClass('is-danger');
                    this.dom.sideDescCounter.addClass('is-danger');
                }
            } else if (dLen > 0) {
                this.dom.descProgress.addClass('is-warning');
                this.dom.descCounter.addClass('is-warning');
                if (this.dom.sideDescProgress.length) {
                    this.dom.sideDescProgress.addClass('is-warning');
                    this.dom.sideDescCounter.addClass('is-warning');
                }
            }
        },

        updatePreviews: function () {
            const rawPostTitle = this.getEditorTitle();
            const seoTitleVal = this.dom.title.val().trim();
            const finalTitle = seoTitleVal || rawPostTitle || 'Judul Artikel Anda';

            const seoDescVal = this.dom.desc.val().trim();
            const finalDesc = seoDescVal || 'Silakan ketik atau ekstrak meta deskripsi agar calon pengunjung tertarik mengklik artikel Anda di Google...';

            this.dom.serpTitle.text(finalTitle);
            this.dom.serpDesc.text(finalDesc);

            this.dom.socialTitle.text(finalTitle);
            this.dom.socialDesc.text(finalDesc);
        },

        /**
         * Comprehensive Dynamic SEO Audit
         */
        runAudit: function () {
            const rawContent = this.getEditorRawContent();
            const cleanText = this.getEditorCleanText();
            const postTitle = this.getEditorTitle();
            const seoTitle = this.dom.title.val().trim() || postTitle;
            const seoDesc = this.dom.desc.val().trim();
            const focusKw = this.dom.focusKw.val().trim().toLowerCase();

            // Word count
            const words = cleanText ? cleanText.split(/\s+/).filter(w => w.length > 0) : [];
            const totalWords = words.length;

            // Reading time
            const readTimeMin = Math.max(1, Math.ceil(totalWords / 200));
            this.dom.statReadingTime.text(readTimeMin + ' menit');
            this.dom.statWordCount.text(totalWords + ' kata');

            // Keyword Density
            let kwCount = 0;
            let densityPct = 0;
            if (focusKw && totalWords > 0) {
                const regex = new RegExp('\\b' + this.escapeRegExp(focusKw) + '\\b', 'gi');
                const matches = cleanText.match(regex);
                kwCount = matches ? matches.length : 0;
                densityPct = ((kwCount / totalWords) * 100).toFixed(1);
            }
            this.dom.statKwDensity.text(densityPct + '% (' + kwCount + 'x)');

            // Checklist Tests
            const checks = [];
            let earnedScore = 0;
            const maxScore = 100;

            // 1. Focus Keyword Present
            if (!focusKw) {
                checks.push({
                    status: 'warning',
                    title: 'Kata Kunci Belum Ditentukan',
                    desc: 'Tentukan kata kunci utama agar artikel terarah untuk pencarian Google tertentu. Klik tombol "Deteksi dari Isi Artikel" untuk bantuan instan.'
                });
            } else {
                checks.push({
                    status: 'good',
                    title: 'Kata Kunci Ditargetkan: "' + focusKw + '"',
                    desc: 'Bagus! Seluruh audit di bawah kini dicocokkan dengan target kata kunci ini.'
                });
                earnedScore += 10;
            }

            // 2. Keyword in SEO Title
            if (focusKw) {
                if (seoTitle.toLowerCase().includes(focusKw)) {
                    checks.push({
                        status: 'good',
                        title: 'Kata Kunci Ada di Judul SEO',
                        desc: 'Judul memuat kata kunci utama. Ini adalah salah satu sinyal peringkat terkuat di Google.'
                    });
                    earnedScore += 15;

                    // 2b. Keyword near beginning of Title
                    if (seoTitle.toLowerCase().indexOf(focusKw) <= 15) {
                        checks.push({
                            status: 'good',
                            title: 'Kata Kunci di Bagian Depan Judul',
                            desc: 'Posisi kata kunci berada di 15 karakter awal judul, memaksimalkan CTR klik pembaca.'
                        });
                        earnedScore += 5;
                    }
                } else {
                    checks.push({
                        status: 'danger',
                        title: 'Kata Kunci Belum Ada di Judul SEO',
                        desc: 'Sisipkan kata kunci "' + focusKw + '" ke dalam Judul SEO agar Google memahaminya.'
                    });
                }
            }

            // 3. Title Length
            const tLen = seoTitle.length;
            if (tLen >= 40 && tLen <= 60) {
                checks.push({
                    status: 'good',
                    title: 'Panjang Judul Sangat Ideal (' + tLen + ' karakter)',
                    desc: 'Judul berada dalam batas aman 40–60 karakter dan tidak akan terpotong elipsis (...) di layar smartphone.'
                });
                earnedScore += 10;
            } else if (tLen > 60) {
                checks.push({
                    status: 'warning',
                    title: 'Judul Terlalu Panjang (' + tLen + ' karakter)',
                    desc: 'Kurangi beberapa kata agar tidak lebih dari 60 karakter agar tetap terbaca penuh di hasil pencarian.'
                });
                earnedScore += 5;
            } else if (tLen > 0) {
                checks.push({
                    status: 'warning',
                    title: 'Judul Kurang Deskriptif (' + tLen + ' karakter)',
                    desc: 'Tambahkan detail kalimat agar mencapai minimal 40 karakter untuk relevansi pencarian yang lebih kuat.'
                });
                earnedScore += 4;
            }

            // 4. Keyword in Meta Description
            if (focusKw) {
                if (seoDesc && seoDesc.toLowerCase().includes(focusKw)) {
                    checks.push({
                        status: 'good',
                        title: 'Kata Kunci Ada di Meta Deskripsi',
                        desc: 'Meta deskripsi Anda menyertakan kata kunci. Kata ini akan ditebalkan (bold) oleh Google saat dicari.'
                    });
                    earnedScore += 10;
                } else {
                    checks.push({
                        status: 'danger',
                        title: 'Kata Kunci Tidak Ada di Meta Deskripsi',
                        desc: 'Pastikan kata kunci "' + focusKw + '" tertulis natural di meta deskripsi Anda.'
                    });
                }
            }

            // 5. Meta Description Length
            const dLen = seoDesc.length;
            if (dLen >= 120 && dLen <= 160) {
                checks.push({
                    status: 'good',
                    title: 'Panjang Meta Deskripsi Pas (' + dLen + ' karakter)',
                    desc: 'Ringkasan artikel Anda berada di rentang emas 120–160 karakter.'
                });
                earnedScore += 10;
            } else if (dLen > 160) {
                checks.push({
                    status: 'warning',
                    title: 'Meta Deskripsi Agak Kepanjangan (' + dLen + ' karakter)',
                    desc: 'Google biasanya hanya menampilkan maksimal 155–160 karakter di hasil penelusuran.'
                });
                earnedScore += 5;
            } else if (dLen > 0) {
                checks.push({
                    status: 'warning',
                    title: 'Meta Deskripsi Terlalu Pendek (' + dLen + ' karakter)',
                    desc: 'Perpanjang sedikit ringkasan agar mencapai minimal 120 karakter untuk menarik perhatian calon pembaca.'
                });
                earnedScore += 4;
            } else {
                checks.push({
                    status: 'danger',
                    title: 'Meta Deskripsi Masih Kosong',
                    desc: 'Klik tombol "Ekstrak dari Paragraf Pertama" untuk mengisi deskripsi secara instan.'
                });
            }

            // 6. Keyword in First 100 Words of Content
            if (focusKw && totalWords > 10) {
                const first100 = words.slice(0, 100).join(' ').toLowerCase();
                if (first100.includes(focusKw)) {
                    checks.push({
                        status: 'good',
                        title: 'Kata Kunci Muncul di Paragraf Pembuka',
                        desc: 'Kata kunci ditemukan dalam 100 kata awal tulisan. Ini mengonfirmasi topik artikel dengan cepat ke Googlebot.'
                    });
                    earnedScore += 10;
                } else {
                    checks.push({
                        status: 'warning',
                        title: 'Kata Kunci Belum Ada di Paragraf Pembuka',
                        desc: 'Sebutkan kata kunci Anda di 1–2 kalimat pertama artikel secara luwes.'
                    });
                }
            }

            // 7. Keyword Density
            if (focusKw && totalWords >= 100) {
                const dFloat = parseFloat(densityPct);
                if (dFloat >= 0.7 && dFloat <= 2.5) {
                    checks.push({
                        status: 'good',
                        title: 'Kepadatan Kata Kunci Proporsional (' + densityPct + '%)',
                        desc: 'Frekuensi kemunculan kata kunci sangat natural, tidak terkesan spam (keyword stuffing).'
                    });
                    earnedScore += 10;
                } else if (dFloat > 2.5) {
                    checks.push({
                        status: 'danger',
                        title: 'Kepadatan Kata Kunci Terlalu Tinggi (' + densityPct + '%)',
                        desc: 'Waspada penalti Keyword Stuffing! Kurangi sedikit pengulangan kata kunci yang berlebihan.'
                    });
                    earnedScore += 3;
                } else {
                    checks.push({
                        status: 'warning',
                        title: 'Kepadatan Kata Kunci Masih Rendah (' + densityPct + '%)',
                        desc: 'Sebutkan kata kunci beberapa kali lagi di badan artikel Anda (target: 1% – 2%).'
                    });
                    earnedScore += 5;
                }
            }

            // 8. Word Count Check
            if (totalWords >= 800) {
                checks.push({
                    status: 'good',
                    title: 'Kedalaman Artikel Sangat Kuat (' + totalWords + ' kata)',
                    desc: 'Panjang artikel memenuhi standar artikel pilar yang disukai Google untuk peringkat 1.'
                });
                earnedScore += 15;
            } else if (totalWords >= 400) {
                checks.push({
                    status: 'good',
                    title: 'Panjang Artikel Cukup Bagus (' + totalWords + ' kata)',
                    desc: 'Artikel sudah melampaui batas minimal 300 kata artikel standar.'
                });
                earnedScore += 10;
            } else if (totalWords > 0) {
                checks.push({
                    status: 'warning',
                    title: 'Artikel Terlalu Pendek (' + totalWords + ' kata)',
                    desc: 'Artikel di bawah 300 kata berisiko dianggap "Thin Content" oleh algoritma Google. Tambahkan pembahasan lebih detail.'
                });
                earnedScore += 4;
            }

            // 9. Heading (H2/H3) & Keyword in Subheading
            const hasH2 = /<h2\b[^>]*>(.*?)<\/h2>/i.test(rawContent);
            const hasH3 = /<h3\b[^>]*>(.*?)<\/h3>/i.test(rawContent);
            if (hasH2 || hasH3) {
                let kwInHeading = false;
                if (focusKw) {
                    const headingMatches = rawContent.match(/<h[2-3]\b[^>]*>(.*?)<\/h[2-3]>/gi) || [];
                    for (let h of headingMatches) {
                        if (h.toLowerCase().includes(focusKw)) {
                            kwInHeading = true;
                            break;
                        }
                    }
                }

                if (kwInHeading) {
                    checks.push({
                        status: 'good',
                        title: 'Sub-Judul (H2/H3) Memuat Kata Kunci',
                        desc: 'Struktur artikel sangat rapi dengan sub-heading yang relevan terhadap kata kunci utama.'
                    });
                    earnedScore += 10;
                } else {
                    checks.push({
                        status: 'good',
                        title: 'Struktur Sub-Judul (H2/H3) Terdeteksi',
                        desc: 'Bagus, artikel sudah memakai heading. Tips: Sisipkan kata kunci utama pada salah satu H2 Anda.'
                    });
                    earnedScore += 7;
                }
            } else if (totalWords > 200) {
                checks.push({
                    status: 'warning',
                    title: 'Belum Ada Sub-Judul (Heading 2 atau 3)',
                    desc: 'Pecah artikel Anda dengan Heading 2 (H2) agar pembaca tidak lelah membaca paragraf panjang.'
                });
            }

            // 10. Images & Alt Attributes
            const imgMatches = rawContent.match(/<img\b[^>]*>/gi);
            if (imgMatches && imgMatches.length > 0) {
                let missingAlt = 0;
                imgMatches.forEach(img => {
                    if (!/alt\s*=\s*['"][^'"]+['"]/i.test(img)) {
                        missingAlt++;
                    }
                });

                if (missingAlt === 0) {
                    checks.push({
                        status: 'good',
                        title: 'Seluruh Gambar Memiliki Teks Alt (' + imgMatches.length + ' gambar)',
                        desc: 'Luar biasa! Gambar Anda siap masuk ke indeks Google Images.'
                    });
                    earnedScore += 5;
                } else {
                    checks.push({
                        status: 'warning',
                        title: missingAlt + ' Gambar Belum Memiliki Alt Teks',
                        desc: 'Tambahkan alt text pada gambar artikel untuk meningkatkan aksesibilitas dan SEO gambar.'
                    });
                    earnedScore += 2;
                }
            }

            // Normalize Final Score (0 - 100)
            const finalScore = Math.min(100, Math.max(0, earnedScore));
            this.score = finalScore;

            // Render Results to DOM
            this.renderScore(finalScore);
            this.renderChecklist(checks);
        },

        renderScore: function (score) {
            this.dom.hiddenScore.val(score);
            this.dom.scoreNum.text(score);
            this.dom.auditScoreGauge.text(score);

            this.dom.badge.removeClass('is-good is-ok is-poor');
            this.dom.statusPill.removeClass('is-good is-ok is-poor');
            this.dom.auditBadgeLarge.removeClass('is-good is-ok is-poor');

            let verdictTitleText = '';
            let verdictDescText = '';
            let statusClass = 'is-poor';
            let pillText = 'Perlu Ditingkatkan';

            if (score >= 80) {
                statusClass = 'is-good';
                pillText = 'Sangat Optimal';
                verdictTitleText = 'Luar Biasa! Artikel Ini Sangat Siap Masuk Halaman 1 Google';
                verdictDescText = 'Semua pilar penting SEO (judul, meta, kepadatan kata kunci, dan keterbacaan) telah dipenuhi dengan sangat baik.';
            } else if (score >= 50) {
                statusClass = 'is-ok';
                pillText = 'Cukup Baik';
                verdictTitleText = 'Kualitas SEO Bagus, Tinggal Sedikit Optimasi Lagi';
                verdictDescText = 'Perhatikan rekomendasi berwarna oranye atau merah di bawah untuk menaikkan skor ke level maksimal.';
            } else {
                statusClass = 'is-poor';
                pillText = 'Perlu Ditingkatkan';
                verdictTitleText = 'Artikel Masih Memerlukan Optimasi SEO Dasar';
                verdictDescText = 'Tentukan kata kunci, lengkapi meta deskripsi, dan pastikan artikel memiliki panjang minimal yang memadai.';
            }

            this.dom.badge.addClass(statusClass);
            this.dom.statusPill.addClass(statusClass).text(pillText);
            this.dom.auditBadgeLarge.addClass(statusClass);
            this.dom.auditVerdictTitle.text(verdictTitleText);
            this.dom.auditVerdictDesc.text(verdictDescText);

            // Update Sidebar Score & Status Pill
            if (this.dom.sideHiddenScore.length) {
                this.dom.sideHiddenScore.val(score);
            }
            if (this.dom.sideScoreNum.length) {
                this.dom.sideScoreNum.text(score);
            }
            if (this.dom.sideBadge.length) {
                this.dom.sideBadge.removeClass('is-good is-ok is-poor').addClass(statusClass);
            }
            if (this.dom.sideStatusPill.length) {
                this.dom.sideStatusPill.removeClass('is-good is-ok is-poor').addClass(statusClass).text(pillText);
            }
        },

        renderChecklist: function (checks) {
            let html = '';
            let recomCount = 0;

            checks.forEach(item => {
                let iconHtml = '<i class="fa-solid fa-check"></i>';
                if (item.status === 'warning') {
                    iconHtml = '<i class="fa-solid fa-triangle-exclamation"></i>';
                    recomCount++;
                } else if (item.status === 'danger') {
                    iconHtml = '<i class="fa-solid fa-xmark"></i>';
                    recomCount++;
                }

                html += `
                    <div class="bp-check-item is-${item.status}">
                        <div class="bp-check-icon">${iconHtml}</div>
                        <div class="bp-check-content">
                            <div class="bp-check-title">${item.title}</div>
                            <p class="bp-check-desc">${item.desc}</p>
                        </div>
                    </div>
                `;
            });

            this.dom.auditChecklist.html(html);
            this.dom.recomCount.text(recomCount);

            // Update Sidebar Mini Indicators Checklist
            if (this.dom.sideWrapper.length) {
                const focusKw = this.dom.focusKw.val().trim();
                const seoTitle = this.dom.title.val().trim() || this.getEditorTitle();
                const seoDesc = this.dom.desc.val().trim();
                const cleanText = this.getEditorCleanText();
                const words = cleanText ? cleanText.split(/\s+/).filter(w => w.length > 0) : [];
                const tLen = seoTitle.length;
                const dLen = seoDesc.length;

                // 1. Focus Keyword Indicator
                if (focusKw) {
                    const kwDisplay = focusKw.length > 13 ? focusKw.substring(0, 11) + '...' : focusKw;
                    this.dom.sideChkKw.removeClass('is-good is-ok is-poor').addClass('is-good').text('"' + kwDisplay + '"');
                } else {
                    this.dom.sideChkKw.removeClass('is-good is-ok is-poor').addClass('is-poor').text('Belum diisi');
                }

                // 2. SEO Title Indicator
                if (tLen >= 40 && tLen <= 60 && (!focusKw || seoTitle.toLowerCase().includes(focusKw.toLowerCase()))) {
                    this.dom.sideChkTitle.removeClass('is-good is-ok is-poor').addClass('is-good').text(tLen + ' char (Ideal)');
                } else if (tLen > 0) {
                    this.dom.sideChkTitle.removeClass('is-good is-ok is-poor').addClass('is-ok').text(tLen + ' char');
                } else {
                    this.dom.sideChkTitle.removeClass('is-good is-ok is-poor').addClass('is-poor').text('Kosong');
                }

                // 3. Meta Description Indicator
                if (dLen >= 120 && dLen <= 160) {
                    this.dom.sideChkDesc.removeClass('is-good is-ok is-poor').addClass('is-good').text(dLen + ' char (Ideal)');
                } else if (dLen > 0) {
                    this.dom.sideChkDesc.removeClass('is-good is-ok is-poor').addClass('is-ok').text(dLen + ' char');
                } else {
                    this.dom.sideChkDesc.removeClass('is-good is-ok is-poor').addClass('is-poor').text('Kosong');
                }

                // 4. Content Words Indicator
                if (words.length >= 400) {
                    this.dom.sideChkWords.removeClass('is-good is-ok is-poor').addClass('is-good').text(words.length + ' kata (Bagus)');
                } else if (words.length > 0) {
                    this.dom.sideChkWords.removeClass('is-good is-ok is-poor').addClass('is-ok').text(words.length + ' kata');
                } else {
                    this.dom.sideChkWords.removeClass('is-good is-ok is-poor').addClass('is-poor').text('0 kata');
                }
            }
        },

        /**
         * Smart Keyword Auto-Detection from Article Text & Title
         */
        detectBestKeyword: function (title, content) {
            const combined = (title + ' ' + content).toLowerCase();
            const words = combined.replace(/[^a-z0-9\s-]/g, ' ')
                .split(/\s+/)
                .filter(w => w.length >= 4 && !this.stopWords.includes(w));

            if (words.length === 0) return '';

            // Count single words
            const freq = {};
            words.forEach(w => {
                freq[w] = (freq[w] || 0) + 1;
            });

            // Find 2-word phrases (bigrams) for more natural SEO keywords
            const bigramFreq = {};
            for (let i = 0; i < words.length - 1; i++) {
                const phrase = words[i] + ' ' + words[i + 1];
                bigramFreq[phrase] = (bigramFreq[phrase] || 0) + 1;
            }

            // Prioritize bigrams if repeated
            let bestPhrase = '';
            let maxBigramCount = 1;
            for (let [ph, count] of Object.entries(bigramFreq)) {
                if (count > maxBigramCount) {
                    maxBigramCount = count;
                    bestPhrase = ph;
                }
            }

            if (bestPhrase) {
                return bestPhrase;
            }

            // Fallback to top single word
            let topWord = '';
            let maxWordCount = 0;
            for (let [w, count] of Object.entries(freq)) {
                if (count > maxWordCount) {
                    maxWordCount = count;
                    topWord = w;
                }
            }

            return topWord;
        },

        escapeRegExp: function (string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
    };

    $(document).ready(function () {
        if ($('.bp-seo-wrapper').length) {
            PostSEO.init();
        }
    });

})(jQuery);
