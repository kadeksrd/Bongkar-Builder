/**
 * Inspector & Typography Controller
 * Manages element properties, tag switching, Google Fonts dynamic loading,
 * WP Media Library image replacement, and CSS spacing/colors.
 */

window.BongkarInspector = (function () {
    let currentElementData = null;
    let activeGoogleFonts = new Set();
    let wpMediaFrame = null;

    let currentActiveSubTab = 'content';
    let currentDevice = 'desktop'; // 'desktop' | 'tablet' | 'mobile'

    function setDeviceMode(device) {
        currentDevice = device || 'desktop';
        updateDeviceSyncBadges();
        if (currentElementData) {
            onElementSelected(currentElementData);
        }
    }

    function updateDeviceSyncBadges() {
        const iconClass = (currentDevice === 'mobile') 
            ? 'fa-mobile-screen' 
            : ((currentDevice === 'tablet') ? 'fa-tablet-screen-button' : 'fa-desktop');

        document.querySelectorAll('.device-sync-badge').forEach(badge => {
            badge.className = `device-sync-badge mode-${currentDevice}`;
            badge.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
            badge.title = `Sedang mengatur untuk tampilan ${currentDevice.toUpperCase()}`;

            if (currentElementData && currentElementData.responsiveOverrides && currentElementData.responsiveOverrides[currentDevice]) {
                const overrides = currentElementData.responsiveOverrides[currentDevice];
                const prop = badge.getAttribute('data-sync-prop');
                if (prop && overrides[prop] !== undefined && overrides[prop] !== '') {
                    badge.classList.add('has-override');
                    badge.title = `Pengaturan ${currentDevice.toUpperCase()} Kustom Aktif (${overrides[prop]})`;
                }
            }
        });
    }

    function init() {
        bindSubTabs();
        bindTagSwitcher();
        bindTextContent();
        bindTypography();
        bindGoogleFonts();
        bindDimensions();
        bindFlexLayoutControls();
        bindSpacing();
        bindBackgroundAndBorder();
        bindImageControls();
        bindLinkControls();
        bindVideoControls();
        bindIconControls();
        bindSpacerControls();
        bindRatingControls();
        bindFormControls();
        bindEmbedControls();
        bindPostGridControls();
        bindParentSelect();
    }

    /**
     * Called when canvas notifies an element was selected
     */
    function onElementSelected(data) {
        currentElementData = data;

        document.getElementById('inspector-empty-state').style.display = 'none';
        document.getElementById('inspector-active-content').style.display = 'block';

        // Element Badge
        const badge = document.getElementById('selected-element-badge');
        const badgeHeader = document.getElementById('selected-element-badge-header');
        const classSnippet = data.className ? '.' + data.className.split(' ')[0] : '';
        const badgeText = `${data.tag.toUpperCase()}${classSnippet}`;
        if (badge) badge.textContent = badgeText;
        if (badgeHeader) badgeHeader.textContent = badgeText;

        // Update Semantic Role Pill & Guide Hints (Color-Coded Hierarchy)
        const role = data.elementRole || (data.isColumn ? 'layout' : 'text');
        const rolePill = document.getElementById('inspector-role-pill');
        const roleIcon = document.getElementById('inspector-role-icon');
        const roleText = document.getElementById('inspector-role-text');
        const roleHint = document.getElementById('inspector-role-hint');
        const dimTextGuide = document.getElementById('dim-text-guide-box');
        const dimLayoutGuide = document.getElementById('dim-layout-guide-box');

        if (rolePill && roleIcon && roleText) {
            if (role === 'layout-outer') {
                rolePill.style.background = 'rgba(99, 102, 241, 0.2)';
                rolePill.style.color = '#c7d2fe';
                rolePill.style.borderColor = 'rgba(129, 140, 248, 0.6)';
                roleIcon.className = 'fa-solid fa-layer-group';
                roleText.textContent = data.elementRoleLabel || 'Section (Div Luar)';
                if (roleHint) roleHint.textContent = 'Fokus Div Luar: Mengatur batas section luar, latar belakang (background/foto), padding vertikal, dan struktur baris.';
                if (dimTextGuide) dimTextGuide.style.display = 'none';
                if (dimLayoutGuide) dimLayoutGuide.style.display = 'block';
                if (badge) badge.style.color = '#a5b4fc';
            } else if (role === 'layout-row') {
                rolePill.style.background = 'rgba(6, 182, 212, 0.2)';
                rolePill.style.color = '#a5f3fc';
                rolePill.style.borderColor = 'rgba(6, 182, 212, 0.6)';
                roleIcon.className = 'fa-solid fa-table-columns';
                roleText.textContent = data.elementRoleLabel || 'Baris Kolom (Kanan-Kiri)';
                if (roleHint) roleHint.textContent = 'Fokus Baris Kolom: Mengatur proporsi lebar kolom kiri dan kanan (50:50, 60:40) dan jarak antar kolom (gap).';
                if (dimTextGuide) dimTextGuide.style.display = 'none';
                if (dimLayoutGuide) dimLayoutGuide.style.display = 'block';
                if (badge) badge.style.color = '#22d3ee';
            } else if (role === 'layout-col') {
                rolePill.style.background = 'rgba(139, 92, 246, 0.2)';
                rolePill.style.color = '#ddd6fe';
                rolePill.style.borderColor = 'rgba(139, 92, 246, 0.6)';
                roleIcon.className = 'fa-solid fa-columns';
                roleText.textContent = data.elementRoleLabel || 'Kolom (Div Dalam)';
                if (roleHint) roleHint.textContent = 'Fokus Kolom: Mengatur isi kolom ini, lebar kolom, atau ubah proporsi baris kiri-kanan.';
                if (dimTextGuide) dimTextGuide.style.display = 'none';
                if (dimLayoutGuide) dimLayoutGuide.style.display = 'block';
                if (badge) badge.style.color = '#a78bfa';
            } else if (role === 'layout-form') {
                rolePill.style.background = 'rgba(16, 185, 129, 0.2)';
                rolePill.style.color = '#a7f3d0';
                rolePill.style.borderColor = 'rgba(16, 185, 129, 0.6)';
                roleIcon.className = 'fa-solid fa-rectangle-list';
                roleText.textContent = data.elementRoleLabel || 'Pembungkus Form (Card Formulir)';
                if (roleHint) roleHint.textContent = 'Fokus Card Form: Mengatur kotak kartu formulir, background, padding, border, dan integrasi WhatsApp / Google Sheets.';
                if (dimTextGuide) dimTextGuide.style.display = 'none';
                if (dimLayoutGuide) dimLayoutGuide.style.display = 'block';
                if (badge) badge.style.color = '#34d399';
            } else if (role === 'layout-card') {
                rolePill.style.background = 'rgba(59, 130, 246, 0.2)';
                rolePill.style.color = '#bfdbfe';
                rolePill.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                roleIcon.className = 'fa-solid fa-clone';
                roleText.textContent = data.elementRoleLabel || 'Card / Kotak Konten';
                if (roleHint) roleHint.textContent = 'Fokus Card: Mengatur kotak kartu, background, padding, bayangan (shadow), dan border radius.';
                if (dimTextGuide) dimTextGuide.style.display = 'none';
                if (dimLayoutGuide) dimLayoutGuide.style.display = 'block';
                if (badge) badge.style.color = '#60a5fa';
            } else if (role === 'layout-inner' || role === 'layout') {
                rolePill.style.background = 'rgba(2, 132, 199, 0.2)';
                rolePill.style.color = '#bae6fd';
                rolePill.style.borderColor = 'rgba(56, 189, 248, 0.6)';
                roleIcon.className = 'fa-solid fa-cube';
                roleText.textContent = data.elementRoleLabel || 'Div Kontainer';
                if (roleHint) roleHint.textContent = 'Fokus Div Dalam: Mengatur lebar kolom, arah tata letak (samping / atas-bawah), dan jarak antar elemen (gap).';
                if (dimTextGuide) dimTextGuide.style.display = 'none';
                if (dimLayoutGuide) dimLayoutGuide.style.display = 'block';
                if (badge) badge.style.color = '#38bdf8';
            } else if (role === 'text') {
                rolePill.style.background = 'rgba(217, 119, 6, 0.2)';
                rolePill.style.color = '#fde68a';
                rolePill.style.borderColor = 'rgba(251, 191, 36, 0.6)';
                roleIcon.className = 'fa-solid ' + (data.elementRoleIcon || 'fa-font');
                roleText.textContent = data.elementRoleLabel || 'Elemen Teks (Tipografi)';
                if (roleHint) roleHint.textContent = 'Fokus Teks: Mengatur jenis font Google, ukuran teks, ketebalan, warna, dan perataan.';
                if (dimTextGuide) dimTextGuide.style.display = 'block';
                if (dimLayoutGuide) dimLayoutGuide.style.display = 'none';
                if (badge) badge.style.color = '#fbbf24';
            } else if (role === 'action') {
                rolePill.style.background = 'rgba(5, 150, 105, 0.2)';
                rolePill.style.color = '#a7f3d0';
                rolePill.style.borderColor = 'rgba(52, 211, 153, 0.6)';
                roleIcon.className = 'fa-solid ' + (data.elementRoleIcon || 'fa-hand-pointer');
                roleText.textContent = data.elementRoleLabel || 'Tombol / Interaktif';
                if (roleHint) roleHint.textContent = 'Fokus Interaksi: Mengatur tujuan link/URL, pesan WhatsApp, integrasi Google Sheets, dan aksi tombol.';
                if (dimTextGuide) dimTextGuide.style.display = 'none';
                if (dimLayoutGuide) dimLayoutGuide.style.display = 'none';
                if (badge) badge.style.color = '#34d399';
            } else if (role === 'media') {
                rolePill.style.background = 'rgba(219, 39, 119, 0.2)';
                rolePill.style.color = '#fbcfe8';
                rolePill.style.borderColor = 'rgba(244, 114, 182, 0.6)';
                roleIcon.className = 'fa-solid ' + (data.elementRoleIcon || 'fa-image');
                roleText.textContent = data.elementRoleLabel || 'Gambar / Media';
                if (roleHint) roleHint.textContent = 'Fokus Media: Ganti dari Media Library WP, atur Alt text SEO, dan rasio aspek.';
                if (dimTextGuide) dimTextGuide.style.display = 'none';
                if (dimLayoutGuide) dimLayoutGuide.style.display = 'none';
                if (badge) badge.style.color = '#f472b6';
            } else if (role === 'feed') {
                rolePill.style.background = 'rgba(124, 58, 237, 0.2)';
                rolePill.style.color = '#ddd6fe';
                rolePill.style.borderColor = 'rgba(167, 139, 250, 0.6)';
                roleIcon.className = 'fa-solid fa-newspaper';
                roleText.textContent = 'Mode Feed Blog';
                if (roleHint) roleHint.textContent = 'Fokus Feed: Atur kategori artikel, jumlah post, dan kolom feed.';
                if (dimTextGuide) dimTextGuide.style.display = 'none';
                if (dimLayoutGuide) dimLayoutGuide.style.display = 'none';
                if (badge) badge.style.color = '#a78bfa';
            }
        }

        // Render Interactive Breadcrumbs Hierarchy Trail
        const trailContainer = document.getElementById('inspector-breadcrumb-trail');
        if (trailContainer) {
            trailContainer.innerHTML = '';
            if (data.breadcrumbs && Array.isArray(data.breadcrumbs) && data.breadcrumbs.length > 0) {
                data.breadcrumbs.forEach((node, idx) => {
                    if (idx > 0) {
                        const sep = document.createElement('span');
                        sep.className = 'breadcrumb-separator';
                        sep.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
                        trailContainer.appendChild(sep);
                    }
                    const pill = document.createElement('button');
                    pill.type = 'button';
                    pill.className = `breadcrumb-node-pill role-${node.role} ${node.isCurrent ? 'active' : ''}`;
                    pill.setAttribute('data-ancestor-index', node.ancestorIndex);
                    pill.title = `Pilih ${node.label} (${node.selector})`;
                    pill.innerHTML = `<i class="fa-solid ${node.icon}"></i> <span>${node.selector}</span>`;
                    trailContainer.appendChild(pill);
                });
            }
        }

        // Child Count Indicator Badge
        const childBadge = document.getElementById('inspector-child-count-badge');
        const childCount = data.childCount || 0;
        if (childBadge) {
            if (data.isContainer && childCount > 0) {
                childBadge.style.display = 'inline-block';
                childBadge.textContent = `${childCount} Elemen Anak`;
            } else {
                childBadge.style.display = 'none';
            }
        }

        // Parent Select Button State
        const btnParent = document.getElementById('btn-parent-select');
        if (btnParent) {
            btnParent.style.opacity = data.hasParent ? '1' : '0.4';
            btnParent.style.pointerEvents = data.hasParent ? 'auto' : 'none';
        }

        // Tag Switcher
        const tagSelect = document.getElementById('ctrl-tag-switcher');
        tagSelect.value = data.tag.toLowerCase();

        // Text Content
        const textRow = document.getElementById('row-text-content');
        const textInput = document.getElementById('ctrl-text-content');
        if (data.isImage) {
            textRow.style.display = 'none';
        } else {
            textRow.style.display = 'flex';
            textInput.value = data.textContent || '';
        }

        // Image Controls (Direct IMG, wrapped IMG, or CSS background-image)
        const imgGroup = document.getElementById('group-image-controls');
        if (data.isImage || data.hasBgImg || (data.styles && data.styles.backgroundImage && data.styles.backgroundImage.includes('url'))) {
            imgGroup.style.display = 'block';
            document.getElementById('ctrl-img-src').value = data.imgSrc || '';
            document.getElementById('ctrl-img-alt').value = data.imgAlt || '';
            document.getElementById('ctrl-img-fit').value = data.imgFit || '';
        } else {
            imgGroup.style.display = 'none';
        }

        // Link Controls
        const linkGroup = document.getElementById('group-link-controls');
        if (data.isLink) {
            linkGroup.style.display = 'block';
            document.getElementById('ctrl-link-href').value = data.linkHref || '';
            document.getElementById('ctrl-link-blank').checked = data.linkTarget === '_blank';
        } else {
            linkGroup.style.display = 'none';
        }

        // Modal / Pop-up Quick Trigger Control
        const modalTriggerGroup = document.getElementById('group-modal-trigger-controls');
        if (modalTriggerGroup) {
            modalTriggerGroup.style.display = data.triggersModal ? 'block' : 'none';
        }

        // Video Controls
        const videoGroup = document.getElementById('group-video-controls');
        if (videoGroup) {
            if (data.isVideo) {
                videoGroup.style.display = 'block';
                const videoInput = document.getElementById('ctrl-video-url');
                if (videoInput) videoInput.value = data.videoSrc || '';
                const ratioSelect = document.getElementById('ctrl-video-ratio');
                if (ratioSelect) ratioSelect.value = data.videoRatio || '16:9';
                const autoCheck = document.getElementById('ctrl-video-autoplay');
                if (autoCheck) autoCheck.checked = !!data.videoAutoplay;
                const muteCheck = document.getElementById('ctrl-video-mute');
                if (muteCheck) muteCheck.checked = !!data.videoMute;
                const loopCheck = document.getElementById('ctrl-video-loop');
                if (loopCheck) loopCheck.checked = !!data.videoLoop;
            } else {
                videoGroup.style.display = 'none';
            }
        }

        // Icon Controls
        const iconGroup = document.getElementById('group-icon-controls');
        if (iconGroup) {
            if (data.isIcon) {
                iconGroup.style.display = 'block';
                const iconClass = data.iconClass || 'fa-solid fa-star';
                const previewI = document.getElementById('ctrl-icon-preview-i');
                if (previewI) previewI.className = iconClass;
                const classLabel = document.getElementById('ctrl-icon-class-label');
                if (classLabel) classLabel.textContent = iconClass;

                const iconSize = parseInt(data.styles.fontSize) || 28;
                const sizeSlider = document.getElementById('ctrl-icon-size-slider');
                const sizeNum = document.getElementById('ctrl-icon-size-num');
                if (sizeSlider) sizeSlider.value = iconSize;
                if (sizeNum) sizeNum.value = iconSize;

                const iconColor = data.styles.color || '#f59e0b';
                const colorHex = document.getElementById('ctrl-icon-color-hex');
                const colorPicker = document.getElementById('ctrl-icon-color-picker');
                if (colorHex) colorHex.value = iconColor;
                if (colorPicker && iconColor.startsWith('#')) {
                    colorPicker.value = iconColor;
                }
            } else {
                iconGroup.style.display = 'none';
            }
        }

        // Spacer Controls
        const spacerGroup = document.getElementById('group-spacer-controls');
        if (spacerGroup) {
            if (data.isSpacer) {
                spacerGroup.style.display = 'block';
                const height = data.spacerHeight || 40;
                const heightSlider = document.getElementById('ctrl-spacer-height-slider');
                const heightNum = document.getElementById('ctrl-spacer-height-num');
                if (heightSlider) heightSlider.value = height;
                if (heightNum) heightNum.value = height;
            } else {
                spacerGroup.style.display = 'none';
            }
        }

        // Rating Controls
        const ratingGroup = document.getElementById('group-rating-controls');
        if (ratingGroup) {
            if (data.isRating) {
                ratingGroup.style.display = 'block';
                const ratingSelect = document.getElementById('ctrl-rating-stars');
                if (ratingSelect) ratingSelect.value = String(data.ratingStars || 5);
                const ratingLabel = document.getElementById('ctrl-rating-label');
                if (ratingLabel) ratingLabel.value = data.ratingLabel || '';
            } else {
                ratingGroup.style.display = 'none';
            }
        }

        // Form Integration Controls (Auto-detected WhatsApp & Google Sheets Webhook)
        const formGroup = document.getElementById('group-form-controls');
        if (formGroup) {
            if (data.isForm || data.formWaEnabled || data.formGsheetEnabled) {
                formGroup.style.display = 'block';
                const waCheckbox = document.getElementById('ctrl-form-wa-enable');
                const waRow = document.getElementById('row-form-wa-fields');
                const gsheetCheckbox = document.getElementById('ctrl-form-gsheet-enable');
                const gsheetRow = document.getElementById('row-form-gsheet-fields');

                if (waCheckbox) waCheckbox.checked = !!data.formWaEnabled;
                if (waRow) waRow.style.display = data.formWaEnabled ? 'flex' : 'none';
                if (document.getElementById('ctrl-form-wa-number')) document.getElementById('ctrl-form-wa-number').value = data.formWaNumber || '';
                if (document.getElementById('ctrl-form-wa-template')) document.getElementById('ctrl-form-wa-template').value = data.formWaTemplate || '';

                if (gsheetCheckbox) gsheetCheckbox.checked = !!data.formGsheetEnabled;
                if (gsheetRow) gsheetRow.style.display = data.formGsheetEnabled ? 'flex' : 'none';
                if (document.getElementById('ctrl-form-gsheet-url')) document.getElementById('ctrl-form-gsheet-url').value = data.formGsheetUrl || '';
                if (document.getElementById('ctrl-form-success-msg')) document.getElementById('ctrl-form-success-msg').value = data.formSuccessMsg || '';
            } else {
                formGroup.style.display = 'none';
            }
        }

        // Custom Embed Controls
        const embedGroup = document.getElementById('group-embed-controls');
        if (embedGroup) {
            if (data.isEmbed) {
                embedGroup.style.display = 'block';
                const embedTextarea = document.getElementById('ctrl-embed-html');
                if (embedTextarea) embedTextarea.value = data.embedHtml || '';
            } else {
                embedGroup.style.display = 'none';
            }
        }

        // Dynamic Post Grid Controls
        const postgridGroup = document.getElementById('group-postgrid-controls');
        if (postgridGroup) {
            if (data.isPostGrid) {
                postgridGroup.style.display = 'block';
                const filterSelect = document.getElementById('ctrl-postgrid-filter');
                const catSelect = document.getElementById('ctrl-postgrid-category');
                const idsInput = document.getElementById('ctrl-postgrid-ids');
                const countInput = document.getElementById('ctrl-postgrid-count');
                const colsSelect = document.getElementById('ctrl-postgrid-cols');

                if (filterSelect) filterSelect.value = data.postFilter || 'recent';
                if (catSelect) catSelect.value = data.postCategory || '0';
                if (idsInput) idsInput.value = data.postIds || '';
                if (countInput) countInput.value = data.postCount || '6';
                if (colsSelect) colsSelect.value = data.postCols || '3';

                const rowCat = document.getElementById('row-postgrid-category');
                const rowIds = document.getElementById('row-postgrid-handpicked');
                if (rowCat) rowCat.style.display = (data.postFilter === 'category') ? 'block' : 'none';
                if (rowIds) rowIds.style.display = (data.postFilter === 'handpicked') ? 'block' : 'none';
            } else {
                postgridGroup.style.display = 'none';
            }
        }

        const devOverrides = (data.responsiveOverrides && data.responsiveOverrides[currentDevice]) ? data.responsiveOverrides[currentDevice] : {};

        // Flexbox Container Controls (Elementor Style: Saling Samping / Atas-Bawah)
        const flexGroup = document.getElementById('group-flex-direction-controls');
        if (flexGroup) {
            const isContainer = data.isContainer || role === 'layout-outer' || role === 'layout-inner';
            if (isContainer) {
                flexGroup.style.display = 'block';

                // Direction toggle active state
                const isRow = devOverrides.flexDirection ? (devOverrides.flexDirection === 'row') : (data.flexDirection === 'row');
                const btnRow = document.getElementById('btn-flex-dir-row');
                const btnCol = document.getElementById('btn-flex-dir-col');
                if (btnRow && btnCol) {
                    btnRow.classList.toggle('active', isRow);
                    btnCol.classList.toggle('active', !isRow);
                }

                // Gap slider & number input
                const gapVal = devOverrides.gap !== undefined ? parseInt(devOverrides.gap) : ((data.flexGap !== undefined) ? parseInt(data.flexGap) : 16);
                const gapSlider = document.getElementById('ctrl-flex-gap-slider');
                const gapNum = document.getElementById('ctrl-flex-gap-num');
                if (gapSlider) gapSlider.value = gapVal;
                if (gapNum) gapNum.value = gapVal;

                // Gap preset buttons
                document.querySelectorAll('.btn-gap-preset').forEach(btn => {
                    const presetVal = parseInt(btn.getAttribute('data-gap'));
                    btn.classList.toggle('active', presetVal === gapVal);
                });

                // Align items
                const currentAlign = devOverrides.alignItems || data.flexAlignItems || 'stretch';
                document.querySelectorAll('.btn-align-item').forEach(btn => {
                    btn.classList.toggle('active', btn.getAttribute('data-align') === currentAlign);
                });

                // Justify content
                const currentJustify = devOverrides.justifyContent || data.flexJustifyContent || 'flex-start';
                document.querySelectorAll('.btn-justify-item').forEach(btn => {
                    btn.classList.toggle('active', btn.getAttribute('data-justify') === currentJustify);
                });

                // Wrap checkbox
                const wrapCheck = document.getElementById('ctrl-flex-wrap');
                if (wrapCheck) {
                    wrapCheck.checked = devOverrides.flexWrap ? (devOverrides.flexWrap !== 'nowrap') : (data.flexWrap !== 'nowrap');
                }

                // Master Child Proportions row
                const rowChildProportions = document.getElementById('row-child-col-proportions');
                const childColCountText = document.getElementById('child-col-count-text');
                const childColTitle = document.getElementById('child-col-prop-title');
                const childColDesc = document.getElementById('child-col-prop-desc');

                if (rowChildProportions) {
                    if (data.isMultiColRow) {
                        rowChildProportions.style.display = 'block';
                        if (childColCountText) childColCountText.textContent = `${childCount} Kolom`;
                        if (childColTitle) childColTitle.textContent = 'Proporsi Kolom Anak (Master):';
                        if (childColDesc) childColDesc.textContent = 'Terapkan pembagian lebar langsung dari pembungkus utama ini ke semua kolom di dalamnya:';
                    } else if (data.hasParentRow) {
                        rowChildProportions.style.display = 'block';
                        if (childColCountText) childColCountText.textContent = 'Baris Induk';
                        if (childColTitle) childColTitle.textContent = 'Proporsi Baris Kolom (Kiri - Kanan):';
                        if (childColDesc) childColDesc.textContent = `Atur pembagian lebar kolom kiri dan kanan pada baris pembungkus (${data.parentRowLabel || 'Induk'}):`;
                    } else if (data.isContainer && childCount >= 2 && !['layout-form', 'layout-card', 'layout-col'].includes(role)) {
                        rowChildProportions.style.display = 'block';
                        if (childColCountText) childColCountText.textContent = `${childCount} Kolom`;
                        if (childColTitle) childColTitle.textContent = 'Proporsi Kolom Anak:';
                        if (childColDesc) childColDesc.textContent = 'Terapkan pembagian lebar ke elemen di dalamnya:';
                    } else {
                        rowChildProportions.style.display = 'none';
                    }
                }
            } else {
                flexGroup.style.display = 'none';
            }
        }

        // Notify Script Manager about selected element
        if (window.BongkarScriptManager && window.BongkarScriptManager.onElementSelected) {
            window.BongkarScriptManager.onElementSelected(data);
        }

        // Typography Styles
        const fontSelect = document.getElementById('ctrl-font-family');
        const cleanFont = (data.styles.fontFamily || '').split(',')[0].trim();
        let matchedOption = false;
        Array.from(fontSelect.options).forEach(opt => {
            if (opt.value.toLowerCase() === cleanFont.toLowerCase()) {
                fontSelect.value = opt.value;
                matchedOption = true;
            }
        });
        if (!matchedOption && cleanFont) {
            fontSelect.value = '__custom__';
            document.getElementById('row-custom-google-font').style.display = 'flex';
            document.getElementById('ctrl-custom-font-input').value = cleanFont;
        } else if (matchedOption) {
            document.getElementById('row-custom-google-font').style.display = 'none';
        }

        // Font Size
        const fontSizeSlider = document.getElementById('ctrl-font-size-slider');
        const fontSizeNum = document.getElementById('ctrl-font-size-num');
        const activeFontSize = devOverrides.fontSize ? parseInt(devOverrides.fontSize) : (data.styles.fontSize || 16);
        fontSizeSlider.value = activeFontSize;
        fontSizeNum.value = activeFontSize;

        // Font Weight
        document.getElementById('ctrl-font-weight').value = data.styles.fontWeight || '400';

        // Text Color
        const textColorHex = document.getElementById('ctrl-text-color-hex');
        const textColorPicker = document.getElementById('ctrl-text-color-picker');
        textColorHex.value = data.styles.color || '';
        if (data.styles.color && data.styles.color.startsWith('#')) {
            textColorPicker.value = data.styles.color;
        }

        // Alignment active state
        const activeAlign = devOverrides.textAlign || data.styles.textAlign;
        document.querySelectorAll('.btn-align').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-align') === activeAlign);
        });

        // Dimensions & Column Width
        const widthVal = devOverrides.width || data.width || data.styles.width || '';
        let detectedWidthUnit = '%';
        if (widthVal === 'auto') {
            detectedWidthUnit = 'auto';
        } else if (widthVal.includes('px')) {
            detectedWidthUnit = 'px';
        } else if (widthVal.includes('em')) {
            detectedWidthUnit = 'em';
        } else if (widthVal.includes('%')) {
            detectedWidthUnit = '%';
        }
        setWidthUnit(detectedWidthUnit);

        const rawWidthNum = parseFloat(widthVal) || '';
        const widthSlider = document.getElementById('ctrl-elem-width-slider');
        const widthNum = document.getElementById('ctrl-elem-width-num');
        if (widthSlider) widthSlider.value = rawWidthNum || (detectedWidthUnit === '%' ? 100 : 300);
        if (widthNum) widthNum.value = rawWidthNum;

        // Dimensions & Element Height (Universal)
        const heightVal = devOverrides.height || data.height || (data.styles && data.styles.height) || '';
        const minHeightVal = devOverrides.minHeight || data.minHeight || (data.styles && data.styles.minHeight) || '';
        const isMinHeight = !heightVal && !!minHeightVal;
        const effectiveHeightVal = heightVal || minHeightVal || '';

        let detectedHeightUnit = 'px';
        if (effectiveHeightVal === 'auto') {
            detectedHeightUnit = 'auto';
        } else if (effectiveHeightVal.includes('vh')) {
            detectedHeightUnit = 'vh';
        } else if (effectiveHeightVal.includes('%')) {
            detectedHeightUnit = '%';
        } else if (effectiveHeightVal.includes('px')) {
            detectedHeightUnit = 'px';
        }
        setHeightUnit(detectedHeightUnit);

        const rawHeightNum = parseFloat(effectiveHeightVal) || '';
        const heightSlider = document.getElementById('ctrl-elem-height-slider');
        const heightNum = document.getElementById('ctrl-elem-height-num');
        const minHeightCheck = document.getElementById('ctrl-elem-min-height');
        if (heightSlider) heightSlider.value = rawHeightNum || 0;
        if (heightNum) heightNum.value = rawHeightNum ? rawHeightNum : '';
        if (minHeightCheck) minHeightCheck.checked = isMinHeight;

        // Spacing: Padding & Margin (Elementor Style)
        let detectedPadUnit = 'px';
        if (data.inlinePadding) {
            const anyInline = (data.inlinePadding.top || '') + (data.inlinePadding.right || '') + (data.inlinePadding.bottom || '') + (data.inlinePadding.left || '');
            if (anyInline.includes('%')) detectedPadUnit = '%';
            else if (anyInline.includes('em')) detectedPadUnit = 'em';
        }
        setPadUnit(detectedPadUnit);

        document.getElementById('ctrl-pad-top').value = (devOverrides.paddingTop !== undefined) ? extractUnitValue(devOverrides.paddingTop) : (extractUnitValue(data.inlinePadding && data.inlinePadding.top) || data.styles.paddingTop || '');
        document.getElementById('ctrl-pad-right').value = (devOverrides.paddingRight !== undefined) ? extractUnitValue(devOverrides.paddingRight) : (extractUnitValue(data.inlinePadding && data.inlinePadding.right) || data.styles.paddingRight || '');
        document.getElementById('ctrl-pad-bottom').value = (devOverrides.paddingBottom !== undefined) ? extractUnitValue(devOverrides.paddingBottom) : (extractUnitValue(data.inlinePadding && data.inlinePadding.bottom) || data.styles.paddingBottom || '');
        document.getElementById('ctrl-pad-left').value = (devOverrides.paddingLeft !== undefined) ? extractUnitValue(devOverrides.paddingLeft) : (extractUnitValue(data.inlinePadding && data.inlinePadding.left) || data.styles.paddingLeft || '');

        let detectedMarUnit = 'px';
        if (data.inlineMargin) {
            const anyInline = (data.inlineMargin.top || '') + (data.inlineMargin.right || '') + (data.inlineMargin.bottom || '') + (data.inlineMargin.left || '');
            if (anyInline.includes('%')) detectedMarUnit = '%';
            else if (anyInline.includes('em')) detectedMarUnit = 'em';
        }
        setMarUnit(detectedMarUnit);

        document.getElementById('ctrl-mar-top').value = (devOverrides.marginTop !== undefined) ? extractUnitValue(devOverrides.marginTop) : (extractUnitValue(data.inlineMargin && data.inlineMargin.top) || data.styles.marginTop || '');
        document.getElementById('ctrl-mar-right').value = (devOverrides.marginRight !== undefined) ? extractUnitValue(devOverrides.marginRight) : (extractUnitValue(data.inlineMargin && data.inlineMargin.right) || data.styles.marginRight || '');
        document.getElementById('ctrl-mar-bottom').value = (devOverrides.marginBottom !== undefined) ? extractUnitValue(devOverrides.marginBottom) : (extractUnitValue(data.inlineMargin && data.inlineMargin.bottom) || data.styles.marginBottom || '');
        document.getElementById('ctrl-mar-left').value = (devOverrides.marginLeft !== undefined) ? extractUnitValue(devOverrides.marginLeft) : (extractUnitValue(data.inlineMargin && data.inlineMargin.left) || data.styles.marginLeft || '');

        // Background & Border
        const bgColorHex = document.getElementById('ctrl-bg-color-hex');
        const bgColorPicker = document.getElementById('ctrl-bg-color-picker');
        bgColorHex.value = data.styles.backgroundColor || '';
        if (data.styles.backgroundColor && data.styles.backgroundColor.startsWith('#')) {
            bgColorPicker.value = data.styles.backgroundColor;
        }

        const radiusSlider = document.getElementById('ctrl-border-radius-slider');
        const radiusNum = document.getElementById('ctrl-border-radius-num');
        radiusSlider.value = data.styles.borderRadius || 0;
        radiusNum.value = data.styles.borderRadius || 0;

        document.getElementById('ctrl-border-width').value = data.styles.borderWidth || '';
        document.getElementById('ctrl-border-style').value = data.styles.borderStyle || 'none';
        if (data.styles.borderColor && data.styles.borderColor.startsWith('#')) {
            document.getElementById('ctrl-border-color').value = data.styles.borderColor;
        }

        // Auto-focus specified field if requested by SEO Audit
        if (data.focusField) {
            focusField(data.focusField);
        }

        // Synchronize Responsive Device Badges
        updateDeviceSyncBadges();
    }

    /**
     * Called when canvas notifies element was deselected
     */
    function onElementDeselected() {
        currentElementData = null;
        document.getElementById('inspector-empty-state').style.display = 'block';
        document.getElementById('inspector-active-content').style.display = 'none';

        if (window.BongkarScriptManager && window.BongkarScriptManager.onElementDeselected) {
            window.BongkarScriptManager.onElementDeselected();
        }
    }

    /**
     * Send style to iframe canvas
     */
    function applyStyle(property, value) {
        const iframe = document.getElementById('bongkar-iframe-canvas');
        if (!iframe || !iframe.contentWindow) return;

        iframe.contentWindow.postMessage({
            type: 'BONGKAR_APPLY_STYLE',
            device: currentDevice,
            property: property,
            value: value
        }, '*');

        if (currentElementData && currentDevice !== 'desktop') {
            if (!currentElementData.responsiveOverrides) currentElementData.responsiveOverrides = { mobile: {}, tablet: {} };
            if (!currentElementData.responsiveOverrides[currentDevice]) currentElementData.responsiveOverrides[currentDevice] = {};
            currentElementData.responsiveOverrides[currentDevice][property] = value;
            updateDeviceSyncBadges();
        }
    }

    /**
     * Bind Tag Switcher
     */
    function bindTagSwitcher() {
        const tagSelect = document.getElementById('ctrl-tag-switcher');
        tagSelect.addEventListener('change', () => {
            const iframe = document.getElementById('bongkar-iframe-canvas');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'BONGKAR_UPDATE_TAG',
                    tag: tagSelect.value
                }, '*');
            }
        });
    }

    /**
     * Bind Text Content Input
     */
    function bindTextContent() {
        const textInput = document.getElementById('ctrl-text-content');
        textInput.addEventListener('input', () => {
            const iframe = document.getElementById('bongkar-iframe-canvas');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'BONGKAR_UPDATE_TEXT',
                    text: textInput.value
                }, '*');
            }
        });
    }

    /**
     * Bind Typography & Sliders
     */
    function bindTypography() {
        // Font Size Sync Slider & Number Input
        const slider = document.getElementById('ctrl-font-size-slider');
        const num = document.getElementById('ctrl-font-size-num');

        slider.addEventListener('input', () => {
            num.value = slider.value;
            applyStyle('fontSize', `${slider.value}px`);
        });

        num.addEventListener('input', () => {
            slider.value = num.value;
            applyStyle('fontSize', `${num.value}px`);
        });

        // Font Weight
        document.getElementById('ctrl-font-weight').addEventListener('change', (e) => {
            applyStyle('fontWeight', e.target.value);
        });

        // Color Picker & Hex Sync
        const colorPicker = document.getElementById('ctrl-text-color-picker');
        const colorHex = document.getElementById('ctrl-text-color-hex');

        colorPicker.addEventListener('input', () => {
            colorHex.value = colorPicker.value;
            applyStyle('color', colorPicker.value);
        });

        colorHex.addEventListener('input', () => {
            applyStyle('color', colorHex.value);
            if (colorHex.value.startsWith('#') && colorHex.value.length === 7) {
                colorPicker.value = colorHex.value;
            }
        });

        // Text Align
        document.querySelectorAll('.btn-align').forEach(btn => {
            btn.addEventListener('click', () => {
                const align = btn.getAttribute('data-align');
                document.querySelectorAll('.btn-align').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                applyStyle('textAlign', align);
            });
        });
    }

    /**
     * Bind Google Fonts dropdown & custom input
     */
    function bindGoogleFonts() {
        const fontSelect = document.getElementById('ctrl-font-family');
        const customRow = document.getElementById('row-custom-google-font');
        const customInput = document.getElementById('ctrl-custom-font-input');
        const applyCustomBtn = document.getElementById('btn-apply-custom-font');

        fontSelect.addEventListener('change', () => {
            if (fontSelect.value === '__custom__') {
                customRow.style.display = 'flex';
                customInput.focus();
            } else {
                customRow.style.display = 'none';
                if (fontSelect.value) {
                    loadAndApplyGoogleFont(fontSelect.value);
                } else {
                    applyStyle('fontFamily', 'inherit');
                }
            }
        });

        applyCustomBtn.addEventListener('click', () => {
            const customName = customInput.value.trim();
            if (customName) {
                loadAndApplyGoogleFont(customName);
            }
        });
    }

    /**
     * Load Google Font and apply to canvas
     */
    function loadAndApplyGoogleFont(fontName) {
        activeGoogleFonts.add(fontName);

        // Build Google Fonts URL
        const fontList = Array.from(activeGoogleFonts);
        const fontQueries = fontList.map(f => 'family=' + encodeURIComponent(f.replace(/ /g, '+')) + ':wght@300;400;500;600;700;800;900');
        const url = 'https://fonts.googleapis.com/css2?' + fontQueries.join('&') + '&display=swap';

        // Update iframe link
        const iframe = document.getElementById('bongkar-iframe-canvas');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'BONGKAR_UPDATE_GOOGLE_FONTS_LINK',
                url: url
            }, '*');
        }

        applyStyle('fontFamily', `'${fontName}', sans-serif`);
    }

    /**
     * Helper to extract leading number from string (e.g. "20px" -> "20", "50%" -> "50")
     */
    function extractUnitValue(str) {
        if (!str && str !== 0) return '';
        const match = String(str).match(/^(-?\d+(\.\d+)?)/);
        return match ? match[1] : '';
    }

    /**
     * Inspector 4 Sub-Tabs Switching (Content, Style, Layout, Logic)
     */
    function bindSubTabs() {
        document.querySelectorAll('.inspector-subtab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tabKey = btn.getAttribute('data-subtab');
                switchSubTab(tabKey);
            });
        });
    }

    function switchSubTab(tabKey) {
        if (!tabKey) return;
        currentActiveSubTab = tabKey;
        document.querySelectorAll('.inspector-subtab-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-subtab') === tabKey);
        });
        document.querySelectorAll('.inspector-subtab-panel').forEach(p => {
            p.classList.toggle('active', p.id === `subtab-panel-${tabKey}`);
        });
    }

    let currentWidthUnit = '%';
    let currentHeightUnit = 'px';

    function setHeightUnit(unit) {
        currentHeightUnit = unit;
        document.querySelectorAll('#height-unit-switcher .unit-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-unit') === unit);
        });
        const unitDisplay = document.getElementById('height-unit-display');
        if (unitDisplay) {
            unitDisplay.textContent = unit === 'auto' ? '' : unit;
        }
        const heightSlider = document.getElementById('ctrl-elem-height-slider');
        const heightNum = document.getElementById('ctrl-elem-height-num');
        if (unit === 'auto') {
            if (heightSlider) heightSlider.style.display = 'none';
            if (heightNum) {
                heightNum.value = '';
                heightNum.placeholder = 'auto';
                heightNum.disabled = true;
            }
        } else {
            if (heightSlider) heightSlider.style.display = 'block';
            if (heightNum) {
                heightNum.placeholder = unit === 'px' ? '300' : '50';
                heightNum.disabled = false;
            }
            if (unit === 'vh' || unit === '%') {
                if (heightSlider) {
                    heightSlider.min = 5;
                    heightSlider.max = 100;
                    heightSlider.step = 1;
                }
            } else if (unit === 'px') {
                if (heightSlider) {
                    heightSlider.min = 20;
                    heightSlider.max = 1200;
                    heightSlider.step = 10;
                }
            }
        }
    }

    function setWidthUnit(unit) {
        currentWidthUnit = unit;
        document.querySelectorAll('#width-unit-switcher .unit-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-unit') === unit);
        });
        const unitDisplay = document.getElementById('width-unit-display');
        if (unitDisplay) {
            unitDisplay.textContent = unit === 'auto' ? '' : unit;
        }
        const widthSlider = document.getElementById('ctrl-elem-width-slider');
        const widthNum = document.getElementById('ctrl-elem-width-num');
        if (unit === 'auto') {
            if (widthSlider) widthSlider.style.display = 'none';
            if (widthNum) {
                widthNum.value = '';
                widthNum.placeholder = 'auto';
                widthNum.disabled = true;
            }
        } else {
            if (widthSlider) widthSlider.style.display = 'block';
            if (widthNum) {
                widthNum.placeholder = unit === '%' ? '100' : '400';
                widthNum.disabled = false;
            }
            if (unit === '%') {
                if (widthSlider) {
                    widthSlider.min = 10;
                    widthSlider.max = 100;
                    widthSlider.step = 1;
                }
            } else if (unit === 'px') {
                if (widthSlider) {
                    widthSlider.min = 50;
                    widthSlider.max = 1400;
                    widthSlider.step = 10;
                }
            } else if (unit === 'em') {
                if (widthSlider) {
                    widthSlider.min = 1;
                    widthSlider.max = 80;
                    widthSlider.step = 0.5;
                }
            }
        }
    }

    /**
     * Bind Dimensions & Column Width Controls (Elementor Style)
     */
    function bindDimensions() {
        // Unit Switcher
        document.querySelectorAll('#width-unit-switcher .unit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const unit = btn.getAttribute('data-unit');
                setWidthUnit(unit);
                if (unit === 'auto') {
                    applyStyle('width', 'auto');
                } else {
                    const widthNum = document.getElementById('ctrl-elem-width-num');
                    const val = widthNum && widthNum.value ? widthNum.value : (unit === '%' ? '100' : '300');
                    if (widthNum) widthNum.value = val;
                    applyStyle('width', `${val}${unit}`);
                }
            });
        });

        const widthSlider = document.getElementById('ctrl-elem-width-slider');
        const widthNum = document.getElementById('ctrl-elem-width-num');

        if (widthSlider && widthNum) {
            widthSlider.addEventListener('input', (e) => {
                widthNum.value = e.target.value;
                if (currentWidthUnit !== 'auto') {
                    applyStyle('width', `${e.target.value}${currentWidthUnit}`);
                }
            });

            widthNum.addEventListener('input', (e) => {
                const val = e.target.value;
                if (val && widthSlider) widthSlider.value = val;
                if (currentWidthUnit !== 'auto') {
                    const applyVal = val ? `${val}${currentWidthUnit}` : '';
                    applyStyle('width', applyVal);
                }
            });
        }

        // Column Proportion Presets (Elementor Style)
        document.querySelectorAll('.btn-col-preset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.btn-col-preset').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const preset = btn.getAttribute('data-preset');
                let leftPct = 100;
                let rightPct = 100;

                if (preset === '50-50') { leftPct = 50; rightPct = 50; }
                else if (preset === '60-40') { leftPct = 60; rightPct = 40; }
                else if (preset === '70-30') { leftPct = 70; rightPct = 30; }
                else if (preset === '33-66') { leftPct = 33.33; rightPct = 66.67; }
                else if (preset === '100') { leftPct = 100; rightPct = 100; }

                setWidthUnit('%');
                if (widthSlider) widthSlider.value = Math.round(leftPct);
                if (widthNum) widthNum.value = Math.round(leftPct);

                const iframe = document.getElementById('bongkar-iframe-canvas');
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage({
                        type: 'BONGKAR_UPDATE_COLUMN_PROPORTION',
                        preset: preset,
                        leftPct: leftPct,
                        rightPct: rightPct
                    }, '*');
                }
            });
        });

        // Height Unit Switcher
        document.querySelectorAll('#height-unit-switcher .unit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const unit = btn.getAttribute('data-unit');
                setHeightUnit(unit);
                const minHeightCheck = document.getElementById('ctrl-elem-min-height');
                const prop = (minHeightCheck && minHeightCheck.checked) ? 'minHeight' : 'height';
                if (unit === 'auto') {
                    applyStyle('height', 'auto');
                    applyStyle('minHeight', '');
                } else {
                    const heightNum = document.getElementById('ctrl-elem-height-num');
                    const val = heightNum && heightNum.value ? heightNum.value : (unit === 'px' ? '200' : '50');
                    if (heightNum) heightNum.value = val;
                    applyStyle(prop, `${val}${unit}`);
                }
            });
        });

        const heightSlider = document.getElementById('ctrl-elem-height-slider');
        const heightNum = document.getElementById('ctrl-elem-height-num');
        const minHeightCheck = document.getElementById('ctrl-elem-min-height');

        function applyCurrentHeight(val) {
            const prop = (minHeightCheck && minHeightCheck.checked) ? 'minHeight' : 'height';
            if (currentHeightUnit === 'auto') {
                applyStyle('height', 'auto');
                applyStyle('minHeight', '');
            } else {
                const formatted = val ? `${val}${currentHeightUnit}` : '';
                applyStyle(prop, formatted);
                if (prop === 'minHeight') {
                    applyStyle('height', '');
                } else {
                    applyStyle('minHeight', '');
                }
            }
        }

        if (heightSlider && heightNum) {
            heightSlider.addEventListener('input', (e) => {
                heightNum.value = e.target.value;
                applyCurrentHeight(e.target.value);
            });

            heightNum.addEventListener('input', (e) => {
                const val = e.target.value;
                if (val && heightSlider) heightSlider.value = val;
                applyCurrentHeight(val);
            });
        }

        if (minHeightCheck) {
            minHeightCheck.addEventListener('change', () => {
                const val = heightNum ? heightNum.value : '';
                if (val) {
                    applyCurrentHeight(val);
                }
            });
        }
    }

    /**
     * Bind Flexbox Container Controls (Elementor Style: Saling Samping / Atas-Bawah)
     */
    function bindFlexLayoutControls() {
        const sendFlexCommand = (payload) => {
            const iframe = document.getElementById('bongkar-iframe-canvas');
            if (!iframe || !iframe.contentWindow) return;

            iframe.contentWindow.postMessage({
                type: 'BONGKAR_SET_FLEX_LAYOUT',
                device: currentDevice,
                ...payload
            }, '*');

            if (currentElementData && currentDevice !== 'desktop') {
                if (!currentElementData.responsiveOverrides) currentElementData.responsiveOverrides = { mobile: {}, tablet: {} };
                if (!currentElementData.responsiveOverrides[currentDevice]) currentElementData.responsiveOverrides[currentDevice] = {};
                Object.assign(currentElementData.responsiveOverrides[currentDevice], payload);
                updateDeviceSyncBadges();
            }

            if (window.BongkarStudio && window.BongkarStudio.markDirty) {
                window.BongkarStudio.markDirty(true);
            }
        };

        const btnRow = document.getElementById('btn-flex-dir-row');
        const btnCol = document.getElementById('btn-flex-dir-col');
        const wrapCheck = document.getElementById('ctrl-flex-wrap');
        const gapSlider = document.getElementById('ctrl-flex-gap-slider');
        const gapNum = document.getElementById('ctrl-flex-gap-num');

        if (btnRow) {
            btnRow.addEventListener('click', () => {
                if (btnCol) btnCol.classList.remove('active');
                btnRow.classList.add('active');
                sendFlexCommand({
                    direction: 'row',
                    wrap: wrapCheck ? wrapCheck.checked : true
                });
            });
        }

        if (btnCol) {
            btnCol.addEventListener('click', () => {
                if (btnRow) btnRow.classList.remove('active');
                btnCol.classList.add('active');
                sendFlexCommand({
                    direction: 'column'
                });
            });
        }

        if (gapSlider && gapNum) {
            gapSlider.addEventListener('input', () => {
                const val = parseInt(gapSlider.value) || 0;
                gapNum.value = val;
                document.querySelectorAll('.btn-gap-preset').forEach(btn => {
                    btn.classList.toggle('active', parseInt(btn.getAttribute('data-gap')) === val);
                });
                sendFlexCommand({ gap: val });
            });

            gapNum.addEventListener('input', () => {
                const val = parseInt(gapNum.value) || 0;
                gapSlider.value = val;
                document.querySelectorAll('.btn-gap-preset').forEach(btn => {
                    btn.classList.toggle('active', parseInt(btn.getAttribute('data-gap')) === val);
                });
                sendFlexCommand({ gap: val });
            });
        }

        document.querySelectorAll('.btn-gap-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = parseInt(btn.getAttribute('data-gap')) || 0;
                document.querySelectorAll('.btn-gap-preset').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (gapSlider) gapSlider.value = val;
                if (gapNum) gapNum.value = val;
                sendFlexCommand({ gap: val });
            });
        });

        document.querySelectorAll('.btn-align-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const alignVal = btn.getAttribute('data-align');
                document.querySelectorAll('.btn-align-item').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                sendFlexCommand({ alignItems: alignVal });
            });
        });

        document.querySelectorAll('.btn-justify-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const justifyVal = btn.getAttribute('data-justify');
                document.querySelectorAll('.btn-justify-item').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                sendFlexCommand({ justifyContent: justifyVal });
            });
        });

        if (wrapCheck) {
            wrapCheck.addEventListener('change', () => {
                sendFlexCommand({ wrap: wrapCheck.checked });
            });
        }

        // Master Child Column Proportions Presets
        document.querySelectorAll('.btn-child-col-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.getAttribute('data-preset');
                document.querySelectorAll('.btn-child-col-preset').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const iframe = document.getElementById('bongkar-iframe-canvas');
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage({
                        type: 'BONGKAR_APPLY_CHILD_PROPORTIONS',
                        preset: preset
                    }, '*');
                }
                if (window.BongkarStudio && window.BongkarStudio.markDirty) {
                    window.BongkarStudio.markDirty(true);
                }
            });
        });
    }

    let currentPadUnit = 'px';
    let isPadLinked = true;
    let currentMarUnit = 'px';
    let isMarLinked = false;

    function setPadUnit(unit) {
        currentPadUnit = unit;
        document.querySelectorAll('#pad-unit-switcher .unit-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-unit') === unit);
        });
    }

    function setMarUnit(unit) {
        currentMarUnit = unit;
        document.querySelectorAll('#mar-unit-switcher .unit-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-unit') === unit);
        });
    }

    /**
     * Bind Margin & Padding Spacing (Elementor Style 4-Box Row with Link & Units)
     */
    function bindSpacing() {
        const padInputs = {
            paddingTop: document.getElementById('ctrl-pad-top'),
            paddingRight: document.getElementById('ctrl-pad-right'),
            paddingBottom: document.getElementById('ctrl-pad-bottom'),
            paddingLeft: document.getElementById('ctrl-pad-left')
        };

        const marInputs = {
            marginTop: document.getElementById('ctrl-mar-top'),
            marginRight: document.getElementById('ctrl-mar-right'),
            marginBottom: document.getElementById('ctrl-mar-bottom'),
            marginLeft: document.getElementById('ctrl-mar-left')
        };

        // Padding Unit Switcher
        document.querySelectorAll('#pad-unit-switcher .unit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const unit = btn.getAttribute('data-unit');
                setPadUnit(unit);
                // Re-apply existing input values with new unit
                Object.keys(padInputs).forEach(prop => {
                    const input = padInputs[prop];
                    if (input && input.value !== '') {
                        applyStyle(prop, `${input.value}${currentPadUnit}`);
                    }
                });
            });
        });

        // Margin Unit Switcher
        document.querySelectorAll('#mar-unit-switcher .unit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const unit = btn.getAttribute('data-unit');
                setMarUnit(unit);
                // Re-apply existing input values with new unit
                Object.keys(marInputs).forEach(prop => {
                    const input = marInputs[prop];
                    if (input && input.value !== '') {
                        applyStyle(prop, `${input.value}${currentMarUnit}`);
                    }
                });
            });
        });

        // Padding Link Toggle
        const btnPadLink = document.getElementById('btn-pad-link');
        if (btnPadLink) {
            btnPadLink.addEventListener('click', (e) => {
                e.preventDefault();
                isPadLinked = !isPadLinked;
                btnPadLink.classList.toggle('active', isPadLinked);
                btnPadLink.innerHTML = isPadLinked ? '<i class="fa-solid fa-link"></i>' : '<i class="fa-solid fa-link-slash"></i>';
                btnPadLink.title = isPadLinked ? 'Tautkan nilai (semua sisi bersamaan)' : 'Pisahkan nilai (atur tiap sisi bebas)';
            });
        }

        // Margin Link Toggle
        const btnMarLink = document.getElementById('btn-mar-link');
        if (btnMarLink) {
            btnMarLink.addEventListener('click', (e) => {
                e.preventDefault();
                isMarLinked = !isMarLinked;
                btnMarLink.classList.toggle('active', isMarLinked);
                btnMarLink.innerHTML = isMarLinked ? '<i class="fa-solid fa-link"></i>' : '<i class="fa-solid fa-link-slash"></i>';
                btnMarLink.title = isMarLinked ? 'Tautkan nilai (semua sisi bersamaan)' : 'Pisahkan nilai (atur tiap sisi bebas)';
            });
        }

        // Padding Inputs
        Object.keys(padInputs).forEach(prop => {
            const input = padInputs[prop];
            if (!input) return;
            input.addEventListener('input', (e) => {
                const rawVal = e.target.value.trim();
                const val = rawVal ? `${rawVal}${currentPadUnit}` : '';

                if (isPadLinked) {
                    Object.keys(padInputs).forEach(p => {
                        if (padInputs[p]) padInputs[p].value = rawVal;
                        applyStyle(p, val);
                    });
                } else {
                    applyStyle(prop, val);
                }
            });
        });

        // Margin Inputs
        Object.keys(marInputs).forEach(prop => {
            const input = marInputs[prop];
            if (!input) return;
            input.addEventListener('input', (e) => {
                const rawVal = e.target.value.trim();
                const val = rawVal ? `${rawVal}${currentMarUnit}` : '';

                if (isMarLinked) {
                    Object.keys(marInputs).forEach(p => {
                        if (marInputs[p]) marInputs[p].value = rawVal;
                        applyStyle(p, val);
                    });
                } else {
                    applyStyle(prop, val);
                }
            });
        });
    }

    /**
     * Bind Background & Border Controls
     */
    function bindBackgroundAndBorder() {
        // Background Color
        const bgPicker = document.getElementById('ctrl-bg-color-picker');
        const bgHex = document.getElementById('ctrl-bg-color-hex');

        bgPicker.addEventListener('input', () => {
            bgHex.value = bgPicker.value;
            applyStyle('backgroundColor', bgPicker.value);
        });

        bgHex.addEventListener('input', () => {
            applyStyle('backgroundColor', bgHex.value);
            if (bgHex.value.startsWith('#') && bgHex.value.length === 7) {
                bgPicker.value = bgHex.value;
            }
        });

        // Border Radius
        const radiusSlider = document.getElementById('ctrl-border-radius-slider');
        const radiusNum = document.getElementById('ctrl-border-radius-num');

        radiusSlider.addEventListener('input', () => {
            radiusNum.value = radiusSlider.value;
            applyStyle('borderRadius', `${radiusSlider.value}px`);
        });

        radiusNum.addEventListener('input', () => {
            radiusSlider.value = radiusNum.value;
            applyStyle('borderRadius', `${radiusNum.value}px`);
        });

        // Border Width, Style, Color
        const bWidth = document.getElementById('ctrl-border-width');
        const bStyle = document.getElementById('ctrl-border-style');
        const bColor = document.getElementById('ctrl-border-color');

        const updateBorder = () => {
            if (bWidth.value && bStyle.value !== 'none') {
                applyStyle('border', `${bWidth.value}px ${bStyle.value} ${bColor.value}`);
            } else if (bStyle.value === 'none') {
                applyStyle('border', 'none');
            }
        };

        bWidth.addEventListener('input', updateBorder);
        bStyle.addEventListener('change', updateBorder);
        bColor.addEventListener('input', updateBorder);
    }

    /**
     * Bind Image Controls with WordPress Media Library (wp.media)
     */
    function bindImageControls() {
        const btnMedia = document.getElementById('btn-wp-media-picker');
        const srcInput = document.getElementById('ctrl-img-src');
        const altInput = document.getElementById('ctrl-img-alt');
        const fitSelect = document.getElementById('ctrl-img-fit');
        const btnQuickOpenModal = document.getElementById('btn-quick-open-modal-edit');

        if (btnQuickOpenModal) {
            btnQuickOpenModal.addEventListener('click', (e) => {
                e.preventDefault();
                const iframe = document.getElementById('bongkar-iframe-canvas');
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage({
                        type: 'BONGKAR_TOGGLE_MODAL_EDIT',
                        forceState: true
                    }, '*');
                }
            });
        }

        if (btnMedia) {
            btnMedia.addEventListener('click', (e) => {
                e.preventDefault();

                if (typeof wp === 'undefined' || !wp.media) {
                    console.warn('[Bongkar] wp.media is not available.');
                    return;
                }

                // If media frame already exists, dispose to avoid stale closures
                if (wpMediaFrame) {
                    try {
                        wpMediaFrame.dispose();
                    } catch (err) {}
                    wpMediaFrame = null;
                }

                // Create a fresh media frame
                wpMediaFrame = wp.media({
                    title: 'Pilih atau Upload Gambar',
                    button: { text: 'Gunakan Gambar Ini' },
                    multiple: false
                });

                // When an image is selected in the media frame...
                wpMediaFrame.on('select', () => {
                    const attachment = wpMediaFrame.state().get('selection').first().toJSON();
                    if (!attachment || !attachment.url) return;

                    let finalUrl = (attachment.url || '').trim();
                    if (window.location.protocol === 'https:' && finalUrl.startsWith('http://')) {
                        finalUrl = finalUrl.replace(/^http:\/\//i, 'https://');
                    }

                    if (srcInput) {
                        srcInput.value = finalUrl;
                    }
                    if (altInput && attachment.alt) {
                        altInput.value = attachment.alt;
                    }

                    // Send to canvas
                    const iframe = document.getElementById('bongkar-iframe-canvas');
                    if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage({
                            type: 'BONGKAR_UPDATE_IMAGE',
                            src: finalUrl,
                            alt: altInput ? altInput.value : ''
                        }, '*');
                    }
                });

                wpMediaFrame.open();
            });
        }

        const sendImageUpdate = () => {
            const iframe = document.getElementById('bongkar-iframe-canvas');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'BONGKAR_UPDATE_IMAGE',
                    src: srcInput ? srcInput.value : '',
                    alt: altInput ? altInput.value : ''
                }, '*');
            }
        };

        if (srcInput) {
            srcInput.addEventListener('input', sendImageUpdate);
            srcInput.addEventListener('change', sendImageUpdate);
        }

        if (altInput) {
            altInput.addEventListener('input', sendImageUpdate);
            altInput.addEventListener('change', sendImageUpdate);
        }

        if (fitSelect) {
            fitSelect.addEventListener('change', () => {
                const iframe = document.getElementById('bongkar-iframe-canvas');
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage({
                        type: 'BONGKAR_UPDATE_IMAGE',
                        fit: fitSelect.value
                    }, '*');
                }
            });
        }
    }

    /**
     * Bind Link Controls
     */
    function bindLinkControls() {
        const hrefInput = document.getElementById('ctrl-link-href');
        const blankCheckbox = document.getElementById('ctrl-link-blank');

        hrefInput.addEventListener('input', () => {
            const iframe = document.getElementById('bongkar-iframe-canvas');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'BONGKAR_UPDATE_LINK',
                    href: hrefInput.value,
                    target: blankCheckbox.checked ? '_blank' : '_self'
                }, '*');
            }
        });

        blankCheckbox.addEventListener('change', () => {
            const iframe = document.getElementById('bongkar-iframe-canvas');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'BONGKAR_UPDATE_LINK',
                    target: blankCheckbox.checked ? '_blank' : '_self'
                }, '*');
            }
        });
    }

    /**
     * Bind Parent Select, Breadcrumb Navigation & Wrap in Container buttons
     */
    function bindParentSelect() {
        const triggerParent = () => {
            const iframe = document.getElementById('bongkar-iframe-canvas');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'BONGKAR_SELECT_PARENT'
                }, '*');
            }
        };

        const btnParent = document.getElementById('btn-parent-select');
        if (btnParent) btnParent.addEventListener('click', triggerParent);

        const btnParentDim = document.getElementById('btn-select-parent-col-dim');
        if (btnParentDim) btnParentDim.addEventListener('click', triggerParent);

        const triggerWrap = () => {
            const iframe = document.getElementById('bongkar-iframe-canvas');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'BONGKAR_WRAP_ELEMENT'
                }, '*');
            }
        };

        const btnWrap = document.getElementById('btn-wrap-in-container');
        if (btnWrap) btnWrap.addEventListener('click', triggerWrap);

        document.querySelectorAll('.btn-wrap-current-element').forEach(btn => {
            btn.addEventListener('click', triggerWrap);
        });

        // Interactive Breadcrumb Trail Delegation
        const trailContainer = document.getElementById('inspector-breadcrumb-trail');
        if (trailContainer) {
            trailContainer.addEventListener('click', (e) => {
                const pill = e.target.closest('.breadcrumb-node-pill');
                if (!pill) return;
                const ancestorIdx = parseInt(pill.getAttribute('data-ancestor-index'));
                if (isNaN(ancestorIdx)) return;
                const iframe = document.getElementById('bongkar-iframe-canvas');
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage({
                        type: 'BONGKAR_SELECT_ANCESTOR',
                        ancestorIndex: ancestorIdx
                    }, '*');
                }
            });
        }
    }

    /**
     * Bind Form Integration Controls
     */
    function bindFormControls() {
        const waCheckbox = document.getElementById('ctrl-form-wa-enable');
        const waRow = document.getElementById('row-form-wa-fields');
        const waNum = document.getElementById('ctrl-form-wa-number');
        const waTpl = document.getElementById('ctrl-form-wa-template');

        const gsheetCheckbox = document.getElementById('ctrl-form-gsheet-enable');
        const gsheetRow = document.getElementById('row-form-gsheet-fields');
        const gsheetUrl = document.getElementById('ctrl-form-gsheet-url');
        const successMsg = document.getElementById('ctrl-form-success-msg');

        function updateFormInCanvas() {
            const iframe = document.getElementById('bongkar-iframe-canvas');
            if (!iframe || !iframe.contentWindow) return;

            iframe.contentWindow.postMessage({
                type: 'BONGKAR_UPDATE_FORM_SETTINGS',
                waEnabled: waCheckbox ? waCheckbox.checked : false,
                waNumber: waNum ? waNum.value.trim() : '',
                waTemplate: waTpl ? waTpl.value : '',
                gsheetEnabled: gsheetCheckbox ? gsheetCheckbox.checked : false,
                gsheetUrl: gsheetUrl ? gsheetUrl.value.trim() : '',
                successMsg: successMsg ? successMsg.value : ''
            }, '*');
        }

        if (waCheckbox) {
            waCheckbox.addEventListener('change', () => {
                if (waRow) waRow.style.display = waCheckbox.checked ? 'flex' : 'none';
                updateFormInCanvas();
            });
        }
        if (waNum) waNum.addEventListener('input', updateFormInCanvas);
        if (waTpl) waTpl.addEventListener('input', updateFormInCanvas);

        if (gsheetCheckbox) {
            gsheetCheckbox.addEventListener('change', () => {
                if (gsheetRow) gsheetRow.style.display = gsheetCheckbox.checked ? 'flex' : 'none';
                updateFormInCanvas();
            });
        }
        if (gsheetUrl) gsheetUrl.addEventListener('input', updateFormInCanvas);
        if (successMsg) successMsg.addEventListener('input', updateFormInCanvas);
    }

    /**
     * Bind Custom HTML / Script Embed Controls
     */
    function bindEmbedControls() {
        const btnApply = document.getElementById('btn-apply-embed-html');
        const embedTextarea = document.getElementById('ctrl-embed-html');

        if (btnApply && embedTextarea) {
            btnApply.addEventListener('click', () => {
                const iframe = document.getElementById('bongkar-iframe-canvas');
                if (!iframe || !iframe.contentWindow) return;

                iframe.contentWindow.postMessage({
                    type: 'BONGKAR_UPDATE_EMBED_HTML',
                    html: embedTextarea.value
                }, '*');

                btnApply.innerHTML = '<i class="fa-solid fa-check"></i> Kode Diterapkan!';
                setTimeout(() => {
                    btnApply.innerHTML = '<i class="fa-solid fa-check"></i> Terapkan Kode HTML';
                }, 1500);
            });
        }
    }

    /**
     * Bind Dynamic Post Grid Feed Controls
     */
    function bindPostGridControls() {
        const filterSelect = document.getElementById('ctrl-postgrid-filter');
        const catSelect = document.getElementById('ctrl-postgrid-category');
        const idsInput = document.getElementById('ctrl-postgrid-ids');
        const countInput = document.getElementById('ctrl-postgrid-count');
        const colsSelect = document.getElementById('ctrl-postgrid-cols');
        const btnApply = document.getElementById('btn-apply-postgrid-settings');

        const rowCat = document.getElementById('row-postgrid-category');
        const rowIds = document.getElementById('row-postgrid-handpicked');

        if (filterSelect) {
            filterSelect.addEventListener('change', () => {
                const val = filterSelect.value;
                if (rowCat) rowCat.style.display = (val === 'category') ? 'block' : 'none';
                if (rowIds) rowIds.style.display = (val === 'handpicked') ? 'block' : 'none';
            });
        }

        if (btnApply) {
            btnApply.addEventListener('click', () => {
                const iframe = document.getElementById('bongkar-iframe-canvas');
                if (!iframe || !iframe.contentWindow) return;

                const filter = filterSelect ? filterSelect.value : 'recent';
                const category = catSelect ? catSelect.value : '0';
                const postIds = idsInput ? idsInput.value.trim() : '';
                const count = countInput ? countInput.value : '6';
                const cols = colsSelect ? colsSelect.value : '3';

                iframe.contentWindow.postMessage({
                    type: 'BONGKAR_UPDATE_POST_GRID',
                    filter: filter,
                    category: category,
                    postIds: postIds,
                    count: count,
                    cols: cols
                }, '*');

                if (window.BongkarStudio && window.BongkarStudio.markDirty) {
                    window.BongkarStudio.markDirty(true);
                }

                btnApply.innerHTML = '<i class="fa-solid fa-check"></i> Feed Diperbarui!';
                setTimeout(() => {
                    btnApply.innerHTML = '<i class="fa-solid fa-rotate"></i> Terapkan Pengaturan Feed';
                }, 1500);
            });
        }
    }

    /**
     * Parse raw video URL into embed URL with appropriate query parameters
     */
    function formatEmbedVideoUrl(rawUrl, options = {}) {
        if (!rawUrl) return '';
        let url = rawUrl.trim();

        // 1. YouTube regex match (watch?v=, youtu.be/, shorts/, embed/)
        const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);

        // 2. Vimeo regex match (vimeo.com/<id>)
        const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/i);

        let embedBase = url;
        let videoId = '';

        if (ytMatch && ytMatch[1]) {
            videoId = ytMatch[1];
            embedBase = `https://www.youtube.com/embed/${videoId}`;
        } else if (vimeoMatch && vimeoMatch[1]) {
            videoId = vimeoMatch[1];
            embedBase = `https://player.vimeo.com/video/${videoId}`;
        }

        // Build query params
        const params = [];
        if (videoId && ytMatch) {
            if (options.autoplay) {
                params.push('autoplay=1');
                params.push('mute=1'); // Autoplay requires mute in modern browsers
            } else if (options.mute) {
                params.push('mute=1');
            }
            if (options.loop) {
                params.push('loop=1');
                params.push(`playlist=${videoId}`);
            }
        } else if (videoId && vimeoMatch) {
            if (options.autoplay) {
                params.push('autoplay=1');
                params.push('muted=1');
            } else if (options.mute) {
                params.push('muted=1');
            }
            if (options.loop) {
                params.push('loop=1');
            }
        }

        if (params.length > 0) {
            embedBase += (embedBase.includes('?') ? '&' : '?') + params.join('&');
        }

        return embedBase;
    }

    /**
     * Bind Video Controls
     */
    function bindVideoControls() {
        const btnApply = document.getElementById('btn-apply-video');
        const urlInput = document.getElementById('ctrl-video-url');
        const ratioSelect = document.getElementById('ctrl-video-ratio');
        const autoCheck = document.getElementById('ctrl-video-autoplay');
        const muteCheck = document.getElementById('ctrl-video-mute');
        const loopCheck = document.getElementById('ctrl-video-loop');

        function applyVideoChanges() {
            const iframe = document.getElementById('bongkar-iframe-canvas');
            if (!iframe || !iframe.contentWindow) return;

            const rawUrl = urlInput ? urlInput.value.trim() : '';
            const ratio = ratioSelect ? ratioSelect.value : '16:9';
            const autoplay = autoCheck ? autoCheck.checked : false;
            const mute = muteCheck ? muteCheck.checked : false;
            const loop = loopCheck ? loopCheck.checked : false;

            const finalSrc = formatEmbedVideoUrl(rawUrl, {
                autoplay: autoplay,
                mute: mute,
                loop: loop
            });

            iframe.contentWindow.postMessage({
                type: 'BONGKAR_UPDATE_VIDEO',
                src: finalSrc || rawUrl,
                ratio: ratio
            }, '*');

            if (btnApply) {
                btnApply.innerHTML = '<i class="fa-solid fa-check"></i> Video Diperbarui!';
                setTimeout(() => {
                    btnApply.innerHTML = '<i class="fa-solid fa-check"></i> Perbarui Video';
                }, 1500);
            }
        }

        if (btnApply) {
            btnApply.addEventListener('click', applyVideoChanges);
        }

        if (ratioSelect) {
            ratioSelect.addEventListener('change', applyVideoChanges);
        }

        if (autoCheck) {
            autoCheck.addEventListener('change', () => {
                if (autoCheck.checked && muteCheck) {
                    muteCheck.checked = true; // browser requires mute for autoplay
                }
                applyVideoChanges();
            });
        }

        if (muteCheck) muteCheck.addEventListener('change', applyVideoChanges);
        if (loopCheck) loopCheck.addEventListener('change', applyVideoChanges);

        if (urlInput) {
            urlInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    applyVideoChanges();
                }
            });
        }
    }

    /**
     * Bind Icon Controls
     */
    function bindIconControls() {
        const btnChange = document.getElementById('btn-open-icon-picker-inspector');
        const sizeSlider = document.getElementById('ctrl-icon-size-slider');
        const sizeNum = document.getElementById('ctrl-icon-size-num');
        const colorPicker = document.getElementById('ctrl-icon-color-picker');
        const colorHex = document.getElementById('ctrl-icon-color-hex');

        if (btnChange) {
            btnChange.addEventListener('click', () => {
                if (window.BongkarIconPicker && window.BongkarIconPicker.openPickerForCallback) {
                    window.BongkarIconPicker.openPickerForCallback((newIconClass) => {
                        const previewI = document.getElementById('ctrl-icon-preview-i');
                        if (previewI) previewI.className = newIconClass;
                        const classLabel = document.getElementById('ctrl-icon-class-label');
                        if (classLabel) classLabel.textContent = newIconClass;

                        const iframe = document.getElementById('bongkar-iframe-canvas');
                        if (iframe && iframe.contentWindow) {
                            iframe.contentWindow.postMessage({
                                type: 'BONGKAR_UPDATE_ICON',
                                iconClass: newIconClass
                            }, '*');
                        }
                    });
                } else {
                    const iconTab = document.querySelector('.sidebar-tab-btn[data-tab="icons"]');
                    if (iconTab) iconTab.click();
                }
            });
        }

        if (sizeSlider && sizeNum) {
            sizeSlider.addEventListener('input', () => {
                sizeNum.value = sizeSlider.value;
                applyStyle('fontSize', `${sizeSlider.value}px`);
            });
            sizeNum.addEventListener('input', () => {
                sizeSlider.value = sizeNum.value;
                applyStyle('fontSize', `${sizeNum.value}px`);
            });
        }

        if (colorPicker && colorHex) {
            colorPicker.addEventListener('input', () => {
                colorHex.value = colorPicker.value;
                applyStyle('color', colorPicker.value);
            });
            colorHex.addEventListener('input', () => {
                applyStyle('color', colorHex.value);
                if (colorHex.value.startsWith('#') && colorHex.value.length === 7) {
                    colorPicker.value = colorHex.value;
                }
            });
        }
    }

    /**
     * Bind Spacer Controls
     */
    function bindSpacerControls() {
        const slider = document.getElementById('ctrl-spacer-height-slider');
        const num = document.getElementById('ctrl-spacer-height-num');

        function updateSpacerHeight(height) {
            const iframe = document.getElementById('bongkar-iframe-canvas');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'BONGKAR_UPDATE_SPACER',
                    height: parseInt(height) || 40
                }, '*');
            }
        }

        if (slider && num) {
            slider.addEventListener('input', () => {
                num.value = slider.value;
                updateSpacerHeight(slider.value);
            });
            num.addEventListener('input', () => {
                slider.value = num.value;
                updateSpacerHeight(num.value);
            });
        }
    }

    /**
     * Bind Rating Controls
     */
    function bindRatingControls() {
        const btnApply = document.getElementById('btn-apply-rating');
        const starsSelect = document.getElementById('ctrl-rating-stars');
        const labelInput = document.getElementById('ctrl-rating-label');

        function applyRating() {
            const iframe = document.getElementById('bongkar-iframe-canvas');
            if (!iframe || !iframe.contentWindow) return;

            const stars = starsSelect ? parseFloat(starsSelect.value) : 5;
            const label = labelInput ? labelInput.value : '';

            iframe.contentWindow.postMessage({
                type: 'BONGKAR_UPDATE_RATING',
                stars: stars,
                label: label
            }, '*');

            if (btnApply) {
                btnApply.innerHTML = '<i class="fa-solid fa-check"></i> Rating Diperbarui!';
                setTimeout(() => {
                    btnApply.innerHTML = '<i class="fa-solid fa-check"></i> Perbarui Rating';
                }, 1500);
            }
        }

        if (btnApply) {
            btnApply.addEventListener('click', applyRating);
        }

        if (starsSelect) {
            starsSelect.addEventListener('change', applyRating);
        }

        if (labelInput) {
            labelInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    applyRating();
                }
            });
        }
    }

    /**
     * Focus specific control field (e.g. for SEO Fix guidance)
     */
    function focusField(fieldName) {
        if (fieldName === 'alt' || fieldName === 'href' || fieldName === 'tag' || fieldName === 'text') {
            switchSubTab('content');
        } else if (fieldName === 'color' || fieldName === 'font') {
            switchSubTab('style');
        } else if (fieldName === 'dimension' || fieldName === 'width' || fieldName === 'height' || fieldName === 'spacing') {
            switchSubTab('layout');
        } else if (fieldName === 'script') {
            switchSubTab('logic');
        }

        let el = null;
        if (fieldName === 'alt') el = document.getElementById('ctrl-img-alt');
        else if (fieldName === 'href') el = document.getElementById('ctrl-link-href');
        else if (fieldName === 'tag') el = document.getElementById('ctrl-tag-switcher');
        else if (fieldName === 'text') el = document.getElementById('ctrl-text-content');

        if (el) {
            setTimeout(() => {
                el.focus();
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.style.outline = '2px solid #818cf8';
                el.style.boxShadow = '0 0 10px rgba(129, 140, 248, 0.6)';
                setTimeout(() => {
                    el.style.outline = '';
                    el.style.boxShadow = '';
                }, 3000);
            }, 200);
        }
    }

    return {
        init: init,
        onElementSelected: onElementSelected,
        onElementDeselected: onElementDeselected,
        switchSubTab: switchSubTab,
        focusField: focusField,
        setDeviceMode: setDeviceMode,
        getDeviceMode: () => currentDevice,
        getCurrentElementData: () => currentElementData,
        getActiveGoogleFonts: () => Array.from(activeGoogleFonts),
        setActiveGoogleFonts: (fonts) => {
            activeGoogleFonts = new Set(fonts);
        }
    };
})();
window.BongkarInspectorTypography = window.BongkarInspector;
