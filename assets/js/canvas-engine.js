/**
 * Bongkar Canvas Engine
 * Operates inside the iframe sandbox to manage element selection,
 * inline editing, floating action toolbar, and live DOM mutations.
 */

(function () {
    let selectedElement = null;
    let hoveredElement = null;
    let floatingToolbar = null;
    let tagBadge = null;
    let contextMenu = null;
    let canvasToast = null;
    let toastTimeout = null;
    let isInteractiveMode = false;

    // Initialize Canvas Engine once DOM is ready
    function init() {
        createUIHelpers();
        createContextMenu();
        attachEventListeners();
        attachKeyboardShortcuts();
        injectSectionInsertBars();
        injectColumnDropzones();
        initCanvasDragAndDrop();
        notifyParentReady();
    }

    /**
     * Bongkar Universal Element Clipboard System
     * Supports cross-page, cross-domain & cross-site copy/cut/paste
     */
    const BongkarClipboard = {
        STORAGE_KEY: 'bongkar_builder_clipboard',
        PREFIX: '<!-- BONGKAR_BUILDER_CLIPBOARD_V1:',
        SUFFIX: ' -->',

        /**
         * Get clean HTML of an element without editor helpers
         */
        getCleanElementHTML: function (el) {
            if (!el) return '';
            const clone = el.cloneNode(true);
            clone.querySelectorAll('#bongkar-canvas-badge, #bongkar-floating-toolbar, #bongkar-context-menu, #bongkar-canvas-toast, .bongkar-section-insert-bar, .bongkar-bottom-add-zone, .bongkar-column-dropzone').forEach(e => e.remove());
            clone.querySelectorAll('.bongkar-hover-target, .bongkar-selected-target, [class*="bongkar-type-"], [class*="bongkar-hover-"]').forEach(e => {
                e.classList.remove(
                    'bongkar-hover-target', 'bongkar-selected-target',
                    'bongkar-type-layout-outer', 'bongkar-type-layout-inner', 'bongkar-type-layout', 'bongkar-type-text', 'bongkar-type-action', 'bongkar-type-media', 'bongkar-type-feed',
                    'bongkar-hover-layout-outer', 'bongkar-hover-layout-inner', 'bongkar-hover-layout', 'bongkar-hover-text', 'bongkar-hover-action', 'bongkar-hover-media', 'bongkar-hover-feed'
                );
                if (e.getAttribute('class') === '') e.removeAttribute('class');
            });
            clone.querySelectorAll('[contenteditable]').forEach(e => e.removeAttribute('contenteditable'));
            clone.removeAttribute('contenteditable');
            return clone.outerHTML.trim();
        },

        /**
         * Copy element to local storage, internal memory, and system clipboard
         */
        copy: async function (el, isCut = false) {
            if (!el) return;
            const html = this.getCleanElementHTML(el);
            if (!html) return;

            const label = getFriendlyElementLabel(el);
            const isSection = el.tagName === 'SECTION' || el.classList.contains('bongkar-section');
            const payload = {
                app: 'bongkar-builder',
                version: '1.1.0',
                label: label,
                tagName: el.tagName,
                isSection: isSection,
                html: html,
                timestamp: Date.now()
            };

            const serializedPayload = JSON.stringify(payload);
            const clipboardText = `${this.PREFIX}${serializedPayload}${this.SUFFIX}\n${html}`;

            // Save in internal window memory
            window.__bongkarClipboardMemory = {
                payload: payload,
                clipboardText: clipboardText,
                html: html
            };

            // 1. Save to localStorage for instant same-browser / multi-tab support
            try {
                localStorage.setItem(this.STORAGE_KEY, serializedPayload);
            } catch (err) {
                console.warn('[Bongkar] LocalStorage write failed:', err);
            }

            // 2. Write to system clipboard with standard recognizable header for cross-site pasting
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(clipboardText);
                }
            } catch (err) {
                console.warn('[Bongkar] System clipboard writeText fallback to localStorage/memory:', err);
            }

            // 3. Notify parent studio window to also store in parent system clipboard
            if (window.parent && window.parent.postMessage) {
                window.parent.postMessage({
                    type: 'BONGKAR_CLIPBOARD_SYNC',
                    text: clipboardText,
                    label: label
                }, '*');
            }

            if (isCut) {
                showCanvasToast(`Elemen "${label}" dipotong ke clipboard`, 'info');
            } else {
                showCanvasToast(`Elemen "${label}" disalin! Siap ditempel (Ctrl+V) di mana saja.`, 'success');
            }
        },

        /**
         * Cut element
         */
        cut: async function (el) {
            if (!el) return;
            await this.copy(el, true);
            el.remove();
            deselectElement();
            injectSectionInsertBars();
            injectColumnDropzones();
            notifyContentChanged();
        },

        /**
         * Duplicate element
         */
        duplicate: function (el) {
            if (!el) return;
            const clone = el.cloneNode(true);
            clone.classList.remove('bongkar-selected-target', 'bongkar-hover-target');
            if (el.parentNode) {
                el.parentNode.insertBefore(clone, el.nextElementSibling);
                injectSectionInsertBars();
                injectColumnDropzones();
                selectElement(clone);
                notifyContentChanged();
                showCanvasToast('Elemen berhasil diduplikasi', 'success');
            }
        },

        /**
         * Paste element from direct payload, internal memory, system clipboard, or localStorage
         */
        paste: async function (targetEl = null, directClipboardText = null) {
            let htmlToPaste = '';
            let meta = null;

            // 1. Direct text passed from parent window or shortcut
            if (directClipboardText && typeof directClipboardText === 'string') {
                const text = directClipboardText;
                if (text.includes(this.PREFIX)) {
                    const start = text.indexOf(this.PREFIX) + this.PREFIX.length;
                    const end = text.indexOf(this.SUFFIX, start);
                    if (start > -1 && end > -1) {
                        try {
                            meta = JSON.parse(text.substring(start, end));
                            if (meta && meta.html) htmlToPaste = meta.html;
                        } catch (e) { }
                    }
                } else if (text.trim().startsWith('<') && text.trim().endsWith('>')) {
                    htmlToPaste = text.trim();
                }
            }

            // 2. Try internal memory clipboard
            if (!htmlToPaste && window.__bongkarClipboardMemory && window.__bongkarClipboardMemory.html) {
                htmlToPaste = window.__bongkarClipboardMemory.html;
                meta = window.__bongkarClipboardMemory.payload;
            }

            // 3. Try reading from system clipboard (if permitted)
            if (!htmlToPaste) {
                try {
                    if (navigator.clipboard && navigator.clipboard.readText) {
                        const text = (await navigator.clipboard.readText()) || '';
                        if (text.includes(this.PREFIX)) {
                            const start = text.indexOf(this.PREFIX) + this.PREFIX.length;
                            const end = text.indexOf(this.SUFFIX, start);
                            if (start > -1 && end > -1) {
                                const rawJson = text.substring(start, end);
                                meta = JSON.parse(rawJson);
                                if (meta && meta.html) {
                                    htmlToPaste = meta.html;
                                }
                            }
                        } else if (text.trim().startsWith('<') && text.trim().endsWith('>')) {
                            htmlToPaste = text.trim();
                        }
                    }
                } catch (err) {
                    // silently proceed to localStorage fallback
                }
            }

            // 4. Fallback to localStorage
            if (!htmlToPaste) {
                try {
                    const stored = localStorage.getItem(this.STORAGE_KEY);
                    if (stored) {
                        meta = JSON.parse(stored);
                        if (meta && meta.html) {
                            htmlToPaste = meta.html;
                        }
                    }
                } catch (err) {
                    console.warn('[Bongkar] LocalStorage read failed:', err);
                }
            }

            if (!htmlToPaste) {
                showCanvasToast('Clipboard masih kosong. Salin (Ctrl+C) elemen terlebih dahulu.', 'warning');
                return;
            }

            // Parse HTML and insert contextually
            const root = document.getElementById('bongkar-canvas-root') || document.body;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlToPaste.trim();
            const newElem = tempDiv.firstElementChild || tempDiv;
            const isNewSection = newElem.tagName === 'SECTION' || newElem.classList.contains('bongkar-section');

            let inserted = false;
            let target = targetEl || selectedElement || hoveredElement;

            if (target && !root.contains(target)) {
                target = null;
            }

            if (target && !isNewSection) {
                if (isContainerElement(target)) {
                    target.querySelectorAll('.bongkar-column-dropzone').forEach(dz => dz.remove());
                    target.appendChild(newElem);
                    inserted = true;
                } else if (target.parentNode) {
                    target.parentNode.insertBefore(newElem, target.nextElementSibling);
                    inserted = true;
                }
            } else if (target && isNewSection) {
                const closestSec = target.closest('.bongkar-section, section');
                if (closestSec && closestSec.parentNode) {
                    closestSec.parentNode.insertBefore(newElem, closestSec.nextElementSibling);
                    inserted = true;
                }
            }

            if (!inserted) {
                const bottomZone = root.querySelector('.bongkar-bottom-add-zone');
                if (bottomZone) {
                    root.insertBefore(newElem, bottomZone);
                } else {
                    root.appendChild(newElem);
                }
            }

            injectSectionInsertBars();
            injectColumnDropzones();
            selectElement(newElem);
            notifyContentChanged();
            showCanvasToast(`Elemen "${meta && meta.label ? meta.label : 'Komponen'}" berhasil ditempel!`, 'success');
        },

        /**
         * Check if clipboard has data
         */
        hasClipboardData: function () {
            try {
                return !!localStorage.getItem(this.STORAGE_KEY);
            } catch (e) {
                return false;
            }
        }
    };

    /**
     * Create floating UI elements (Toolbar & Badge)
     */
    function createUIHelpers() {
        // Pulse highlight styles for algorithm jumping
        if (!document.getElementById('bongkar-algo-glow-style')) {
            const glowStyle = document.createElement('style');
            glowStyle.id = 'bongkar-algo-glow-style';
            glowStyle.textContent = `
                @keyframes bongkarAlgoPulse {
                    0% { outline: 3px solid #6366f1; box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
                    50% { outline: 4px solid #a855f7; box-shadow: 0 0 25px 8px rgba(168, 85, 247, 0.6); }
                    100% { outline: 3px solid #6366f1; box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
                }
                .bongkar-algo-glow-target {
                    animation: bongkarAlgoPulse 1.2s ease-in-out 3 !important;
                    position: relative;
                    z-index: 9999;
                }
            `;
            document.head.appendChild(glowStyle);
        }

        // Tag Badge
        tagBadge = document.createElement('div');
        tagBadge.id = 'bongkar-canvas-badge';
        tagBadge.style.display = 'none';
        document.body.appendChild(tagBadge);

        // Floating Action Toolbar (Elementor Style Hover & Selection Bar)
        floatingToolbar = document.createElement('div');
        floatingToolbar.id = 'bongkar-floating-toolbar';
        floatingToolbar.style.display = 'none';
        floatingToolbar.innerHTML = `
            <div class="toolbar-elem-tag" id="toolbar-elem-tag">ELEMEN</div>
            <button type="button" id="act-select-parent" title="Pilih Pembungkus Induk (Parent Container)" style="display: none;"><i class="fa-solid fa-arrow-turn-up"></i></button>
            <button type="button" id="act-wrap-container" title="Bungkus Elemen ke Kontainer Baru"><i class="fa-solid fa-box-archive"></i></button>
            <div class="toolbar-divider"></div>
            <button type="button" id="act-copy" title="Salin / Copy (Ctrl+C)"><i class="fa-solid fa-copy"></i></button>
            <button type="button" id="act-cut" title="Potong / Cut (Ctrl+X)"><i class="fa-solid fa-scissors"></i></button>
            <button type="button" id="act-paste" title="Tempel / Paste (Ctrl+V)"><i class="fa-solid fa-paste"></i></button>
            <button type="button" id="act-duplicate" title="Duplikasi (Ctrl+D)"><i class="fa-solid fa-clone"></i></button>
            <div class="toolbar-divider"></div>
            <button type="button" id="act-toggle-flex-dir" title="Ubah Arah Kontainer: Saling Samping / Atas-Bawah" style="display: none;"><i class="fa-solid fa-arrows-left-right"></i></button>
            <button type="button" id="act-add-widget" title="Tambah Widget di Sini (+)"><i class="fa-solid fa-plus"></i></button>
            <button type="button" id="act-edit-text" title="Edit Teks Langsung"><i class="fa-solid fa-pen"></i></button>
            <button type="button" id="act-move-up" title="Geser ke Atas"><i class="fa-solid fa-arrow-up"></i></button>
            <button type="button" id="act-move-down" title="Geser ke Bawah"><i class="fa-solid fa-arrow-down"></i></button>
            <div class="toolbar-divider"></div>
            <button type="button" id="act-delete" class="btn-danger" title="Hapus (Del)"><i class="fa-solid fa-trash"></i></button>
            <button type="button" id="act-deselect" title="Batal Pilih / Tutup Toolbar (Esc)"><i class="fa-solid fa-xmark"></i></button>
        `;
        document.body.appendChild(floatingToolbar);

        // Helper to get active target element (selected or hovered)
        function getActiveActionTarget() {
            return selectedElement || hoveredElement;
        }

        // Toolbar action events
        document.getElementById('act-copy').addEventListener('click', (e) => {
            e.stopPropagation();
            const target = getActiveActionTarget();
            if (target) {
                selectElement(target);
                BongkarClipboard.copy(target);
            } else {
                showCanvasToast('Arahkan mouse atau klik elemen yang ingin disalin.', 'warning');
            }
        });

        document.getElementById('act-cut').addEventListener('click', (e) => {
            e.stopPropagation();
            const target = getActiveActionTarget();
            if (target) {
                selectElement(target);
                BongkarClipboard.cut(target);
            } else {
                showCanvasToast('Arahkan mouse atau klik elemen yang ingin dipotong.', 'warning');
            }
        });

        document.getElementById('act-paste').addEventListener('click', (e) => {
            e.stopPropagation();
            const target = getActiveActionTarget();
            BongkarClipboard.paste(target);
        });

        document.getElementById('act-duplicate').addEventListener('click', (e) => {
            e.stopPropagation();
            const target = getActiveActionTarget();
            if (target) {
                selectElement(target);
                BongkarClipboard.duplicate(target);
            }
        });

        const actSelectParent = document.getElementById('act-select-parent');
        if (actSelectParent) {
            actSelectParent.addEventListener('click', (e) => {
                e.stopPropagation();
                const target = getActiveActionTarget();
                const root = document.getElementById('bongkar-canvas-root') || document.body;
                if (target && target.parentElement && target.parentElement !== root && target.parentElement.tagName !== 'BODY') {
                    selectElement(target.parentElement);
                    showCanvasToast(`Memilih pembungkus: ${getFriendlyElementLabel(target.parentElement)}`, 'info');
                } else {
                    showCanvasToast('Elemen sudah berada di tingkat terluar (Section / Root).', 'info');
                }
            });
        }

        const actWrapContainer = document.getElementById('act-wrap-container');
        if (actWrapContainer) {
            actWrapContainer.addEventListener('click', (e) => {
                e.stopPropagation();
                const target = getActiveActionTarget();
                if (target) {
                    selectElement(target);
                    wrapElementInContainer(target);
                }
            });
        }

        const actToggleFlex = document.getElementById('act-toggle-flex-dir');
        if (actToggleFlex) {
            actToggleFlex.addEventListener('click', (e) => {
                e.stopPropagation();
                const target = getActiveActionTarget();
                if (!target) return;

                selectElement(target);
                const currentComputed = window.getComputedStyle(target);
                const isRow = (target.style.flexDirection === 'row') || (currentComputed.display === 'flex' && currentComputed.flexDirection === 'row');

                if (isRow) {
                    target.style.display = 'flex';
                    target.style.flexDirection = 'column';
                    showCanvasToast('Arah Kontainer: Atas - Bawah (Menumpuk)', 'info');
                } else {
                    target.style.display = 'flex';
                    target.style.flexDirection = 'row';
                    target.style.flexWrap = 'wrap';
                    if (!target.style.gap && currentComputed.gap === 'normal') {
                        target.style.gap = '16px';
                    }
                    showCanvasToast('Arah Kontainer: Saling Samping (Kanan - Kiri)', 'info');
                }

                updateFloatingPositions(target);
                notifyContentChanged();
                sendElementInfoToParent(target);
            });
        }

        document.getElementById('act-add-widget').addEventListener('click', (e) => {
            e.stopPropagation();
            const target = getActiveActionTarget();
            if (target) {
                selectElement(target);
                const label = getFriendlyElementLabel(target);
                const root = document.getElementById('bongkar-canvas-root') || document.body;
                const closestSec = target.closest('.bongkar-section, section') || (target.parentElement === root ? target : null);
                
                // If clicked on a section, expand the in-place insert bar right above it!
                if (target === closestSec && closestSec) {
                    const insertBar = closestSec.previousElementSibling;
                    if (insertBar && insertBar.classList.contains('bongkar-section-insert-bar')) {
                        const btnAdd = insertBar.querySelector('.btn-add-section');
                        if (btnAdd) {
                            btnAdd.click();
                            return;
                        }
                    }
                }

                const sections = Array.from(root.children).filter(c => 
                    !c.classList.contains('bongkar-section-insert-bar') && 
                    !c.classList.contains('bongkar-bottom-add-zone') &&
                    !c.id.startsWith('bongkar-')
                );
                const secIndex = closestSec ? sections.indexOf(closestSec) : -1;
                window.parent.postMessage({
                    type: 'BONGKAR_REQUEST_ADD_SECTION',
                    insertIndex: secIndex >= 0 ? secIndex : -1,
                    targetInfo: {
                        label: label,
                        tagName: target.tagName,
                        isContainer: isContainerElement(target)
                    }
                }, '*');
            }
        });

        document.getElementById('act-edit-text').addEventListener('click', (e) => {
            e.stopPropagation();
            const target = getActiveActionTarget();
            if (target) {
                selectElement(target);
                if (target.tagName === 'IMG') {
                    window.parent.postMessage({
                        type: 'BONGKAR_OPEN_MEDIA_PICKER',
                        targetTag: 'img'
                    }, '*');
                } else {
                    enableInlineEdit(target);
                }
            }
        });

        const btnDeselect = document.getElementById('act-deselect');
        if (btnDeselect) {
            btnDeselect.addEventListener('click', (e) => {
                e.stopPropagation();
                deselectElement();
            });
        }

        document.getElementById('act-move-up').addEventListener('click', (e) => {
            e.stopPropagation();
            const target = getActiveActionTarget();
            if (target && target.previousElementSibling) {
                target.parentNode.insertBefore(target, target.previousElementSibling);
                updateFloatingPositions(target);
                notifyContentChanged();
            }
        });

        document.getElementById('act-move-down').addEventListener('click', (e) => {
            e.stopPropagation();
            const target = getActiveActionTarget();
            if (target && target.nextElementSibling) {
                target.parentNode.insertBefore(target.nextElementSibling, target);
                updateFloatingPositions(target);
                notifyContentChanged();
            }
        });

        document.getElementById('act-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            const target = getActiveActionTarget();
            if (target && confirm(`Hapus elemen "${getFriendlyElementLabel(target)}"?`)) {
                target.remove();
                deselectElement();
                injectSectionInsertBars();
                injectColumnDropzones();
                notifyContentChanged();
                showCanvasToast('Elemen berhasil dihapus', 'info');
            }
        });
    }

    /**
     * Create Context Menu for Canvas (Elementor Style)
     */
    let menuOpenTimestamp = 0;

    function createContextMenu() {
        if (contextMenu) return;
        contextMenu = document.createElement('div');
        contextMenu.id = 'bongkar-context-menu';
        contextMenu.style.display = 'none';
        document.body.appendChild(contextMenu);

        // Click outside closes context menu (grace period to avoid closing right after right-click mouseup)
        document.addEventListener('pointerdown', (e) => {
            if (Date.now() - menuOpenTimestamp < 150) return;
            if (contextMenu && !contextMenu.contains(e.target)) {
                hideContextMenu();
            }
        });

        // Hide on Escape key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') hideContextMenu();
        });
    }

    function showContextMenu(clientX, clientY, targetEl) {
        if (!contextMenu) createContextMenu();
        menuOpenTimestamp = Date.now();

        const isEditable = targetEl && isTextEditable(targetEl);
        const label = targetEl ? getFriendlyElementLabel(targetEl) : 'Kanvas';

        contextMenu.innerHTML = `
            <div class="cmenu-header">
                <i class="fa-solid fa-cube"></i>
                <span>${label}</span>
            </div>
            ${isEditable ? `
            <button type="button" class="cmenu-item" id="cmenu-edit">
                <i class="fa-solid fa-pen"></i>
                <span>Edit Teks</span>
                <kbd>DblClick</kbd>
            </button>` : ''}
            <button type="button" class="cmenu-item" id="cmenu-add">
                <i class="fa-solid fa-plus-circle"></i>
                <span>Tambah Widget di Sini</span>
                <kbd>+</kbd>
            </button>
            <div class="cmenu-divider"></div>
            ${(targetEl && targetEl.parentElement && targetEl.parentElement.id !== 'bongkar-canvas-root' && targetEl.parentElement.tagName !== 'BODY') ? `
            <button type="button" class="cmenu-item" id="cmenu-parent">
                <i class="fa-solid fa-arrow-turn-up"></i>
                <span>Pilih Induk (Parent)</span>
                <kbd>Alt+Up</kbd>
            </button>` : ''}
            <button type="button" class="cmenu-item" id="cmenu-wrap" ${!targetEl ? 'disabled style="opacity:0.4; pointer-events:none;"' : ''}>
                <i class="fa-solid fa-box-archive"></i>
                <span>Bungkus dalam Kontainer Baru</span>
            </button>
            <div class="cmenu-divider"></div>
            <button type="button" class="cmenu-item" id="cmenu-copy" ${!targetEl ? 'disabled style="opacity:0.4; pointer-events:none;"' : ''}>
                <i class="fa-solid fa-copy"></i>
                <span>Salin (Copy)</span>
                <kbd>Ctrl+C</kbd>
            </button>
            <button type="button" class="cmenu-item" id="cmenu-cut" ${!targetEl ? 'disabled style="opacity:0.4; pointer-events:none;"' : ''}>
                <i class="fa-solid fa-scissors"></i>
                <span>Potong (Cut)</span>
                <kbd>Ctrl+X</kbd>
            </button>
            <button type="button" class="cmenu-item" id="cmenu-paste">
                <i class="fa-solid fa-paste"></i>
                <span>Tempel (Paste)</span>
                <kbd>Ctrl+V</kbd>
            </button>
            <button type="button" class="cmenu-item" id="cmenu-duplicate" ${!targetEl ? 'disabled style="opacity:0.4; pointer-events:none;"' : ''}>
                <i class="fa-solid fa-clone"></i>
                <span>Duplikasi</span>
                <kbd>Ctrl+D</kbd>
            </button>
            <div class="cmenu-divider"></div>
            <button type="button" class="cmenu-item btn-danger" id="cmenu-delete" ${!targetEl ? 'disabled style="opacity:0.4; pointer-events:none;"' : ''}>
                <i class="fa-solid fa-trash"></i>
                <span>Hapus Elemen</span>
                <kbd>Del</kbd>
            </button>
        `;

        const btnEdit = contextMenu.querySelector('#cmenu-edit');
        if (btnEdit) {
            btnEdit.addEventListener('click', (e) => {
                e.stopPropagation();
                hideContextMenu();
                if (targetEl) enableInlineEdit(targetEl);
            });
        }

        const btnAdd = contextMenu.querySelector('#cmenu-add');
        if (btnAdd) {
            btnAdd.addEventListener('click', (e) => {
                e.stopPropagation();
                hideContextMenu();
                const info = targetEl ? {
                    label: getFriendlyElementLabel(targetEl),
                    tagName: targetEl.tagName,
                    isContainer: isContainerElement(targetEl)
                } : null;
                window.parent.postMessage({
                    type: 'BONGKAR_REQUEST_ADD_SECTION',
                    insertIndex: -1,
                    targetInfo: info
                }, '*');
            });
        }

        const btnParent = contextMenu.querySelector('#cmenu-parent');
        if (btnParent) {
            btnParent.addEventListener('click', (e) => {
                e.stopPropagation();
                hideContextMenu();
                if (targetEl && targetEl.parentElement && targetEl.parentElement.id !== 'bongkar-canvas-root' && targetEl.parentElement.tagName !== 'BODY') {
                    selectElement(targetEl.parentElement);
                    showCanvasToast(`Memilih pembungkus: ${getFriendlyElementLabel(targetEl.parentElement)}`, 'info');
                }
            });
        }

        const btnWrap = contextMenu.querySelector('#cmenu-wrap');
        if (btnWrap) {
            btnWrap.addEventListener('click', (e) => {
                e.stopPropagation();
                hideContextMenu();
                if (targetEl) wrapElementInContainer(targetEl);
            });
        }

        const btnCopy = contextMenu.querySelector('#cmenu-copy');
        if (btnCopy) {
            btnCopy.addEventListener('click', (e) => {
                e.stopPropagation();
                hideContextMenu();
                if (targetEl) BongkarClipboard.copy(targetEl);
            });
        }

        const btnCut = contextMenu.querySelector('#cmenu-cut');
        if (btnCut) {
            btnCut.addEventListener('click', (e) => {
                e.stopPropagation();
                hideContextMenu();
                if (targetEl) BongkarClipboard.cut(targetEl);
            });
        }

        const btnPaste = contextMenu.querySelector('#cmenu-paste');
        if (btnPaste) {
            btnPaste.addEventListener('click', (e) => {
                e.stopPropagation();
                hideContextMenu();
                BongkarClipboard.paste(targetEl);
            });
        }

        const btnDuplicate = contextMenu.querySelector('#cmenu-duplicate');
        if (btnDuplicate) {
            btnDuplicate.addEventListener('click', (e) => {
                e.stopPropagation();
                hideContextMenu();
                if (targetEl) BongkarClipboard.duplicate(targetEl);
            });
        }

        const btnDelete = contextMenu.querySelector('#cmenu-delete');
        if (btnDelete) {
            btnDelete.addEventListener('click', (e) => {
                e.stopPropagation();
                hideContextMenu();
                if (targetEl && confirm(`Hapus elemen "${getFriendlyElementLabel(targetEl)}"?`)) {
                    targetEl.remove();
                    deselectElement();
                    injectSectionInsertBars();
                    injectColumnDropzones();
                    notifyContentChanged();
                    showCanvasToast('Elemen berhasil dihapus', 'info');
                }
            });
        }

        // Display fixed inside viewport with edge clamping
        contextMenu.style.position = 'fixed';
        contextMenu.style.display = 'flex';
        const menuWidth = contextMenu.offsetWidth || 220;
        const menuHeight = contextMenu.offsetHeight || 280;
        const maxLeft = window.innerWidth - menuWidth - 10;
        const maxTop = window.innerHeight - menuHeight - 10;

        contextMenu.style.left = `${Math.max(10, Math.min(clientX, maxLeft))}px`;
        contextMenu.style.top = `${Math.max(10, Math.min(clientY, maxTop))}px`;
    }

    function hideContextMenu() {
        if (contextMenu) contextMenu.style.display = 'none';
    }

    /**
     * Show non-intrusive floating toast notification on canvas
     */
    function showCanvasToast(message, type = 'success') {
        if (!canvasToast) {
            canvasToast = document.createElement('div');
            canvasToast.id = 'bongkar-canvas-toast';
            document.body.appendChild(canvasToast);
        }

        let icon = '<i class="fa-solid fa-circle-check" style="color: #34d399;"></i>';
        if (type === 'info') icon = '<i class="fa-solid fa-circle-info" style="color: #60a5fa;"></i>';
        if (type === 'warning') icon = '<i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b;"></i>';

        canvasToast.innerHTML = `
            <div class="canvas-toast-body">
                ${icon}
                <span>${message}</span>
            </div>
        `;
        canvasToast.className = `bongkar-toast-active toast-${type}`;
        canvasToast.style.display = 'flex';

        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            if (canvasToast) {
                canvasToast.classList.remove('bongkar-toast-active');
                setTimeout(() => { if (canvasToast) canvasToast.style.display = 'none'; }, 250);
            }
        }, 2800);
    }

    /**
     * Keyboard Shortcuts inside Canvas (Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+D, Del)
     */
    function attachKeyboardShortcuts() {
        window.addEventListener('keydown', (e) => {
            if (isInteractiveMode) return;

            const active = document.activeElement;
            const isEditing = active && (
                ['INPUT', 'TEXTAREA'].includes(active.tagName) ||
                active.isContentEditable ||
                active.getAttribute('contenteditable') === 'true'
            );
            if (isEditing) return;

            const targetEl = selectedElement || hoveredElement;

            // Ctrl+C / Cmd+C: Copy
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && !e.shiftKey) {
                e.preventDefault();
                if (targetEl) {
                    selectElement(targetEl);
                    BongkarClipboard.copy(targetEl);
                } else {
                    showCanvasToast('Arahkan mouse atau klik elemen yang ingin disalin.', 'warning');
                }
            }

            // Ctrl+X / Cmd+X: Cut
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
                e.preventDefault();
                if (targetEl) {
                    selectElement(targetEl);
                    BongkarClipboard.cut(targetEl);
                } else {
                    showCanvasToast('Arahkan mouse atau klik elemen yang ingin dipotong.', 'warning');
                }
            }

            // Ctrl+V / Cmd+V: Paste
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
                e.preventDefault();
                BongkarClipboard.paste(targetEl);
            }

            // Ctrl+D / Cmd+D: Duplicate
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
                e.preventDefault();
                if (targetEl) {
                    selectElement(targetEl);
                    BongkarClipboard.duplicate(targetEl);
                } else {
                    showCanvasToast('Arahkan mouse atau klik elemen yang ingin diduplikasi.', 'warning');
                }
            }

            // Delete / Backspace: Delete selected element
            if (e.key === 'Delete' || (e.key === 'Backspace' && !isEditing)) {
                if (targetEl) {
                    e.preventDefault();
                    if (confirm(`Hapus elemen "${getFriendlyElementLabel(targetEl)}"?`)) {
                        targetEl.remove();
                        deselectElement();
                        injectSectionInsertBars();
                        injectColumnDropzones();
                        notifyContentChanged();
                        showCanvasToast('Elemen berhasil dihapus', 'info');
                    }
                }
            }

            // Escape: Deselect & close menu
            if (e.key === 'Escape') {
                deselectElement();
                hideContextMenu();
            }

            // Alt+ArrowUp: Select Parent Wrapper (Pembungkus Induk)
            if (e.altKey && e.key === 'ArrowUp') {
                if (targetEl && targetEl.parentElement && targetEl.parentElement.id !== 'bongkar-canvas-root' && targetEl.parentElement.tagName !== 'BODY') {
                    e.preventDefault();
                    selectElement(targetEl.parentElement);
                    showCanvasToast(`Memilih pembungkus: ${getFriendlyElementLabel(targetEl.parentElement)}`, 'info');
                }
            }
        });
    }

    /**
     * Determine semantic role & category of an element:
     * - 'layout-outer': Sections, top-level containers, headers, footers (Deep Purple #6366f1)
     * - 'layout-inner': Columns, inner boxes, cards, flex child containers (Cyan #0284c7)
     * - 'text': Headings, paragraphs, spans, and DIVs that are pure text leaves (Amber #f59e0b)
     * - 'action': Buttons, links, forms (Emerald #10b981)
     * - 'media': Images, videos, iframes (Rose #ec4899)
     * - 'feed': Dynamic WordPress post grid (Purple #8b5cf6)
     */
    function getElementSemanticRole(el) {
        if (!el) return { role: 'layout-inner', label: 'Elemen', icon: 'fa-cube', color: '#0284c7' };

        // 1. Dynamic Post Grid Feed
        if (el.classList.contains('bongkar-dynamic-posts-grid') || el.closest('.bongkar-dynamic-posts-grid')) {
            return {
                role: 'feed',
                label: 'Feed Blog',
                icon: 'fa-newspaper',
                color: '#8b5cf6'
            };
        }

        // 2. Media Elements
        const tag = el.tagName.toUpperCase();
        if (tag === 'IMG' || tag === 'PICTURE' || tag === 'SVG' || tag === 'VIDEO' || tag === 'IFRAME' || el.classList.contains('bongkar-video-wrapper') || el.classList.contains('bongkar-image')) {
            return {
                role: 'media',
                label: tag === 'IMG' ? 'Gambar' : (tag === 'VIDEO' ? 'Video' : 'Media'),
                icon: tag === 'IMG' ? 'fa-image' : (tag === 'VIDEO' ? 'fa-film' : 'fa-photo-film'),
                color: '#ec4899'
            };
        }

        // 3. Interactive Action Elements (Buttons, Inputs, Forms)
        if (tag === 'BUTTON' || (tag === 'A' && (el.classList.contains('btn') || el.classList.contains('button') || el.getAttribute('role') === 'button')) || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') {
            return {
                role: 'action',
                label: tag === 'BUTTON' || tag === 'A' ? 'Tombol / Link' : 'Input Form',
                icon: 'fa-hand-pointer',
                color: '#10b981'
            };
        }

        // 4. Text Elements: Check if it's standard text tag OR a "Text Leaf" DIV
        const textTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'STRONG', 'EM', 'B', 'I', 'SMALL', 'BLOCKQUOTE', 'LI', 'LABEL'];
        const isHeading = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(tag);

        // Smart Text Leaf Detection: Even if tag is DIV, if it has no block children and has text, it's TEXT!
        let isTextLeaf = false;
        const textContent = (el.innerText || el.textContent || '').trim();
        if (textContent.length > 0) {
            if (textTags.includes(tag)) {
                isTextLeaf = true;
            } else if (tag === 'A' && !el.classList.contains('btn') && !el.classList.contains('button')) {
                isTextLeaf = true;
            } else if (tag === 'DIV') {
                const blockTags = ['DIV', 'SECTION', 'ARTICLE', 'ASIDE', 'MAIN', 'NAV', 'HEADER', 'FOOTER', 'FORM', 'TABLE', 'UL', 'OL', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
                let hasBlockChild = false;
                for (let i = 0; i < el.children.length; i++) {
                    if (blockTags.includes(el.children[i].tagName.toUpperCase())) {
                        hasBlockChild = true;
                        break;
                    }
                }
                if (!hasBlockChild) {
                    isTextLeaf = true;
                }
            }
        }

        if (isTextLeaf) {
            return {
                role: 'text',
                label: isHeading ? `Judul (${tag})` : (tag === 'P' ? 'Paragraf' : (tag === 'DIV' ? 'Teks (DIV)' : `Teks (${tag})`)),
                icon: 'fa-font',
                color: '#f59e0b' // Amber / Warm Orange
            };
        }

        // 5. Layout Elements: Distinguish Div Luar (Section), Baris Kolom, Card Form, dan Kolom
        const root = document.getElementById('bongkar-canvas-root') || document.body;
        const layoutOuterTags = ['SECTION', 'HEADER', 'FOOTER', 'NAV', 'MAIN', 'ARTICLE'];
        const isDirectRootChild = (el.parentElement === root);
        const isExplicitSection = el.classList.contains('bongkar-section') || el.classList.contains('section') || layoutOuterTags.includes(tag) || isDirectRootChild;

        if (isExplicitSection) {
            return {
                role: 'layout-outer',
                label: tag === 'SECTION' ? 'Section (Div Luar)' : `${tag} (Div Luar)`,
                icon: 'fa-layer-group',
                color: '#6366f1' // Deep Purple / Indigo
            };
        }

        // 5A. Multi-Column Row / Grid (Pembungkus Baris Kanan - Kiri)
        const comp = window.getComputedStyle(el);
        const isGrid = comp.display.includes('grid');
        const isRowFlex = comp.display.includes('flex') && (comp.flexDirection === 'row' || el.style.flexDirection === 'row');
        const validChildren = Array.from(el.children).filter(c => 
            !c.classList.contains('bongkar-section-insert-bar') && 
            !c.classList.contains('bongkar-bottom-add-zone') &&
            !c.classList.contains('bongkar-column-dropzone')
        );
        const classNameStr = (typeof el.className === 'string') ? el.className.toLowerCase() : '';
        const isNamedRowOrGrid = classNameStr.includes('grid') || classNameStr.includes('row') || classNameStr.includes('columns') || el.classList.contains('hero-grid');

        if ((isGrid || isRowFlex || isNamedRowOrGrid) && validChildren.length >= 2) {
            return {
                role: 'layout-row',
                label: `Baris Kolom (${validChildren.length} Kolom Kanan-Kiri)`,
                icon: 'fa-table-columns',
                color: '#06b6d4' // Cyan / Teal
            };
        }

        // 5B. Card Form Container (Form Box, Lead Box, dsb)
        const isFormCard = (tag === 'FORM') || 
                           el.classList.contains('hero-lead-box') || 
                           el.classList.contains('form-box') || 
                           el.classList.contains('lead-form-box') || 
                           el.classList.contains('contact-form') || 
                           (el.children.length > 0 && Array.from(el.children).some(c => c.tagName === 'FORM')) ||
                           el.hasAttribute('data-bongkar-wa') || 
                           el.hasAttribute('data-bongkar-gsheet');
        if (isFormCard) {
            return {
                role: 'layout-form',
                label: tag === 'FORM' ? 'Formulir (Form)' : 'Pembungkus Form (Card Formulir)',
                icon: 'fa-rectangle-list',
                color: '#10b981' // Emerald
            };
        }

        // 5C. Individual Column (Anak dari Baris / Grid)
        if (el.parentElement && el.parentElement !== root && el.parentElement.tagName !== 'BODY') {
            const p = el.parentElement;
            const pComp = window.getComputedStyle(p);
            const pIsGrid = pComp.display.includes('grid');
            const pIsRow = pComp.display.includes('flex') && (pComp.flexDirection === 'row' || p.style.flexDirection === 'row');
            const pClassName = (typeof p.className === 'string') ? p.className.toLowerCase() : '';
            const pIsNamedRow = pClassName.includes('grid') || pClassName.includes('row') || pClassName.includes('columns') || p.classList.contains('hero-grid');
            const pCols = Array.from(p.children).filter(c => 
                !c.classList.contains('bongkar-section-insert-bar') && 
                !c.classList.contains('bongkar-bottom-add-zone') &&
                !c.classList.contains('bongkar-column-dropzone')
            );
            if ((pIsGrid || pIsRow || pIsNamedRow) && pCols.length >= 2) {
                const colIdx = pCols.indexOf(el);
                let colPosLabel = 'Kolom';
                if (pCols.length === 2) {
                    colPosLabel = (colIdx === 0) ? 'Kolom Kiri' : 'Kolom Kanan';
                } else if (colIdx >= 0) {
                    colPosLabel = `Kolom ${colIdx + 1}`;
                }
                return {
                    role: 'layout-col',
                    label: `${colPosLabel} (Div Dalam)`,
                    icon: 'fa-columns',
                    color: '#8b5cf6' // Violet
                };
            }
        }

        // 5D. Card / Box Konten
        const hasCardLook = comp.backgroundColor !== 'rgba(0, 0, 0, 0)' || comp.borderWidth !== '0px' || comp.borderRadius !== '0px' || classNameStr.includes('card') || classNameStr.includes('box');
        if (hasCardLook) {
            return {
                role: 'layout-card',
                label: 'Card / Kotak Konten',
                icon: 'fa-clone',
                color: '#3b82f6' // Blue
            };
        }

        // Fallback Div Dalam
        const isCol = el.classList.contains('bongkar-column') || el.classList.contains('col') || (typeof el.className === 'string' && el.className.includes('col-'));
        return {
            role: 'layout-inner',
            label: isCol ? 'Kolom (Div Dalam)' : 'Div Kontainer',
            icon: 'fa-cube',
            color: '#64748b'
        };
    }

    /**
     * Helper to test if element is a container for holding widgets
     */
    function isContainerElement(el) {
        if (!el) return false;
        const semantic = getElementSemanticRole(el);
        return semantic.role === 'layout-outer' || semantic.role === 'layout-inner';
    }

    /**
     * Helper to get clean human-friendly label for target banner
     */
    function getFriendlyElementLabel(el) {
        if (!el) return 'Elemen';
        if (el.classList.contains('bongkar-column')) return 'Kolom';
        if (el.classList.contains('bongkar-section') || el.tagName === 'SECTION') return 'Section';
        if (el.tagName === 'FORM' || el.closest('form')) return 'Formulir';
        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        const firstClass = (el.classList.length > 0 && !el.classList[0].startsWith('bongkar-')) ? `.${el.classList[0]}` : '';
        return `${tag}${id || firstClass}`;
    }

    /**
     * Apply proportional column width preset (e.g. 50:50, 60:40, 70:30, 33:66, 100)
     */
    function applyColumnProportion(el, preset, leftPct, rightPct) {
        if (!el) return;

        if (preset === '100') {
            el.style.width = '100%';
            el.style.maxWidth = '100%';
            if (el.parentElement && el.parentElement.style.gridTemplateColumns) {
                el.parentElement.style.gridTemplateColumns = '1fr';
            }
            return;
        }

        const container = findTargetRowContainer(el);
        if (!container) return;

        const validKids = Array.from(container.children).filter(c => 
            !c.classList.contains('bongkar-section-insert-bar') && 
            !c.classList.contains('bongkar-bottom-add-zone') && 
            !c.classList.contains('bongkar-column-dropzone')
        );

        if (validKids.length >= 2) {
            const col1 = validKids[0];
            const col2 = validKids[1];
            const comp = window.getComputedStyle(container);
            const isGrid = comp.display.includes('grid') || (container.style.display && container.style.display.includes('grid'));

            validKids.forEach(c => { c.style.maxWidth = ''; c.style.boxSizing = 'border-box'; });

            if (isGrid) {
                container.style.gridTemplateColumns = `${leftPct}fr ${rightPct}fr`;
                col1.style.width = '100%';
                col1.style.flex = '';
                col2.style.width = '100%';
                col2.style.flex = '';
            } else {
                container.style.display = 'flex';
                container.style.flexDirection = 'row';
                container.style.flexWrap = 'wrap';
                const gapPx = parseInt(comp.gap || container.style.gap) || 0;
                const w1 = gapPx > 0 ? `calc(${leftPct}% - ${gapPx * (1 - leftPct/100)}px)` : `${leftPct}%`;
                const w2 = gapPx > 0 ? `calc(${rightPct}% - ${gapPx * (1 - rightPct/100)}px)` : `${rightPct}%`;
                col1.style.width = w1;
                col1.style.flex = `0 0 ${w1}`;
                col2.style.width = w2;
                col2.style.flex = `0 0 ${w2}`;
            }
        } else if (el) {
            el.style.width = `${leftPct}%`;
        }
    }

    /**
     * Wrap an element into a new responsive flexbox container wrapper
     */
    function wrapElementInContainer(el) {
        if (!el || !el.parentElement) return;
        const parent = el.parentElement;
        const wrapper = document.createElement('div');
        wrapper.className = 'bongkar-column bongkar-container-wrapper';
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.gap = '16px';
        wrapper.style.width = '100%';
        wrapper.style.boxSizing = 'border-box';

        parent.insertBefore(wrapper, el);
        wrapper.appendChild(el);

        injectSectionInsertBars();
        injectColumnDropzones();
        notifyContentChanged();
        selectElement(wrapper);
        showCanvasToast('Elemen berhasil dibungkus ke dalam Kontainer baru', 'success');
    }

    /**
     * Helper to find the appropriate Row / Grid container when an element or column is targeted
     */
    function findTargetRowContainer(el) {
        if (!el) return null;
        const root = document.getElementById('bongkar-canvas-root') || document.body;

        // Helper: check if a node is genuinely a multi-column row/grid container
        function isMultiColRow(node) {
            if (!node || node === root || node.tagName === 'BODY') return false;
            const comp = window.getComputedStyle(node);
            const isGrid = comp.display.includes('grid') || (node.style.display && node.style.display.includes('grid'));
            const isFlexRow = (comp.display.includes('flex') || (node.style.display && node.style.display.includes('flex'))) && 
                              (comp.flexDirection === 'row' || node.style.flexDirection === 'row');
            const cName = (typeof node.className === 'string') ? node.className.toLowerCase() : '';
            const isNamed = cName.includes('grid') || cName.includes('row') || cName.includes('columns') || node.classList.contains('hero-grid');
            const validKids = Array.from(node.children).filter(c => 
                !c.classList.contains('bongkar-section-insert-bar') && 
                !c.classList.contains('bongkar-bottom-add-zone') && 
                !c.classList.contains('bongkar-column-dropzone')
            );
            return (isGrid || isFlexRow || isNamed) && validKids.length >= 2;
        }

        // Rule 1: If el's direct parent is a multi-column row/grid, the row container is ALWAYS the parent!
        // This handles: layout-col (Kolom Kiri/Kanan), layout-form (heroLeadFormBox), layout-card, or widgets.
        if (el.parentElement && isMultiColRow(el.parentElement)) {
            return el.parentElement;
        }

        // Rule 2: If el itself is a multi-column row/grid container (e.g. user selected hero-grid directly)
        if (isMultiColRow(el)) {
            return el;
        }

        // Rule 3: Search further up ancestors (e.g. widget deep inside a column)
        let ancestor = el.parentElement;
        while (ancestor && ancestor !== root && ancestor.tagName !== 'BODY') {
            if (isMultiColRow(ancestor)) {
                return ancestor;
            }
            ancestor = ancestor.parentElement;
        }

        return el;
    }

    /**
     * Apply master column proportions to direct children of a container wrapper
     * Uses Anti-Drop formula and native CSS Grid tracks so columns NEVER wrap to next line!
     */
    function applyMasterChildProportions(targetEl, preset) {
        if (!targetEl) return;
        const container = findTargetRowContainer(targetEl);
        if (!container) return;

        const validChildren = Array.from(container.children).filter(c => 
            !c.classList.contains('bongkar-section-insert-bar') && 
            !c.classList.contains('bongkar-bottom-add-zone') &&
            !c.classList.contains('bongkar-column-dropzone')
        );
        if (validChildren.length === 0) {
            showCanvasToast('Tidak ada elemen anak di dalam kontainer ini.', 'warning');
            return;
        }

        const comp = window.getComputedStyle(container);
        const isGrid = comp.display.includes('grid') || (container.style.display && container.style.display.includes('grid'));
        const gapPx = parseInt(comp.gap || container.style.gap) || 0;

        // Clear any previous restrictive max-width / inline constraints on children
        validChildren.forEach(child => {
            child.style.maxWidth = '';
            child.style.boxSizing = 'border-box';
        });

        if (isGrid) {
            // Native CSS Grid handles gap automatically with fractional units (fr)
            if (preset === '100') {
                container.style.gridTemplateColumns = '1fr';
            } else if (preset === '50-50') {
                container.style.gridTemplateColumns = '1fr 1fr';
            } else if (preset === '60-40') {
                container.style.gridTemplateColumns = '1.5fr 1fr';
            } else if (preset === '70-30') {
                container.style.gridTemplateColumns = '2.33fr 1fr';
            } else if (preset === '40-60') {
                container.style.gridTemplateColumns = '1fr 1.5fr';
            } else if (preset === '33-33-33') {
                container.style.gridTemplateColumns = '1fr 1fr 1fr';
            }
            validChildren.forEach(child => {
                child.style.width = '100%';
                child.style.flex = '';
            });
        } else {
            // Flexbox Container
            container.style.display = 'flex';
            container.style.boxSizing = 'border-box';

            if (preset === '100') {
                container.style.flexDirection = 'column';
                container.style.flexWrap = 'nowrap';
                validChildren.forEach(child => {
                    child.style.width = '100%';
                    child.style.flex = '0 0 100%';
                });
            } else {
                container.style.flexDirection = 'row';
                container.style.flexWrap = 'wrap';

                // Anti-Drop Math: Subtract gap share so sum of widths + gap === exactly 100%!
                if (preset === '50-50') {
                    const w = gapPx > 0 ? `calc(50% - ${gapPx / 2}px)` : '50%';
                    validChildren.forEach(child => {
                        child.style.width = w;
                        child.style.flex = `0 0 ${w}`;
                    });
                } else if (preset === '60-40') {
                    const w1 = gapPx > 0 ? `calc(60% - ${gapPx * 0.4}px)` : '60%';
                    const w2 = gapPx > 0 ? `calc(40% - ${gapPx * 0.6}px)` : '40%';
                    if (validChildren[0]) {
                        validChildren[0].style.width = w1;
                        validChildren[0].style.flex = `0 0 ${w1}`;
                    }
                    if (validChildren[1]) {
                        validChildren[1].style.width = w2;
                        validChildren[1].style.flex = `0 0 ${w2}`;
                    }
                    for (let i = 2; i < validChildren.length; i++) {
                        const wRem = gapPx > 0 ? `calc(50% - ${gapPx / 2}px)` : '50%';
                        validChildren[i].style.width = wRem;
                        validChildren[i].style.flex = `0 0 ${wRem}`;
                    }
                } else if (preset === '70-30') {
                    const w1 = gapPx > 0 ? `calc(70% - ${gapPx * 0.3}px)` : '70%';
                    const w2 = gapPx > 0 ? `calc(30% - ${gapPx * 0.7}px)` : '30%';
                    if (validChildren[0]) {
                        validChildren[0].style.width = w1;
                        validChildren[0].style.flex = `0 0 ${w1}`;
                    }
                    if (validChildren[1]) {
                        validChildren[1].style.width = w2;
                        validChildren[1].style.flex = `0 0 ${w2}`;
                    }
                    for (let i = 2; i < validChildren.length; i++) {
                        const wRem = gapPx > 0 ? `calc(50% - ${gapPx / 2}px)` : '50%';
                        validChildren[i].style.width = wRem;
                        validChildren[i].style.flex = `0 0 ${wRem}`;
                    }
                } else if (preset === '40-60') {
                    const w1 = gapPx > 0 ? `calc(40% - ${gapPx * 0.6}px)` : '40%';
                    const w2 = gapPx > 0 ? `calc(60% - ${gapPx * 0.4}px)` : '60%';
                    if (validChildren[0]) {
                        validChildren[0].style.width = w1;
                        validChildren[0].style.flex = `0 0 ${w1}`;
                    }
                    if (validChildren[1]) {
                        validChildren[1].style.width = w2;
                        validChildren[1].style.flex = `0 0 ${w2}`;
                    }
                    for (let i = 2; i < validChildren.length; i++) {
                        const wRem = gapPx > 0 ? `calc(50% - ${gapPx / 2}px)` : '50%';
                        validChildren[i].style.width = wRem;
                        validChildren[i].style.flex = `0 0 ${wRem}`;
                    }
                } else if (preset === '33-33-33') {
                    const w = gapPx > 0 ? `calc(33.333% - ${(gapPx * 2) / 3}px)` : '33.333%';
                    validChildren.forEach(child => {
                        child.style.width = w;
                        child.style.flex = `0 0 ${w}`;
                    });
                }
            }
        }

        updateFloatingPositions(container);
        notifyContentChanged();
        sendElementInfoToParent(selectedElement || container);
        showCanvasToast(`Proporsi kolom ${preset} berhasil diterapkan (${getFriendlyElementLabel(container)})`, 'success');
    }

    /**
     * Modal & Pop-up Detection and Dedicated Editing Engine
     */
    let isModalEditActive = false;
    let activeModalElements = [];

    function findModalsInCanvas() {
        const root = document.getElementById('bongkar-canvas-root') || document.body;
        const allCandidates = root.querySelectorAll(
            'dialog, .modal-backdrop, .modal, .popup, .lightbox, ' +
            'div[id*="modal" i], div[id*="popup" i], section[id*="modal" i], aside[id*="modal" i], ' +
            'div[class*="modal" i], div[class*="popup" i]'
        );
        const modals = [];
        allCandidates.forEach(el => {
            if (el.closest('#bongkar-floating-toolbar') || el.closest('#bongkar-context-menu') || el.closest('#bongkar-modal-edit-banner')) return;
            
            // Exclude non-modal containers (buttons, close icons, titles, inputs, etc.)
            const tag = el.tagName.toUpperCase();
            if (['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'SPAN', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LABEL', 'IMG', 'SVG', 'PATH'].includes(tag)) {
                return;
            }

            const idClassStr = ((el.id || '') + ' ' + (el.className || '')).toLowerCase();
            if (/\b(?:btn|button|trigger|close|icon|title|sub|desc|body|footer|header)\b/.test(idClassStr) && !idClassStr.includes('backdrop') && !idClassStr.includes('wrapper') && !idClassStr.includes('container') && !idClassStr.includes('dialog')) {
                return;
            }

            // Only top-level modal containers (if parent modal is already in list, skip child)
            if (!modals.some(m => m.contains(el))) {
                modals.push(el);
            }
        });
        return modals;
    }

    function toggleModalEditMode(forceState) {
        const root = document.getElementById('bongkar-canvas-root') || document.body;
        const nextState = (typeof forceState === 'boolean') ? forceState : !isModalEditActive;
        isModalEditActive = nextState;

        const modals = findModalsInCanvas();

        if (isModalEditActive) {
            if (modals.length === 0) {
                showCanvasToast('Tidak ditemukan elemen Pop-up / Modal di halaman ini', 'info');
                isModalEditActive = false;
                window.parent.postMessage({ type: 'BONGKAR_MODAL_EDIT_STATE', active: false }, '*');
                return;
            }

            activeModalElements = modals;
            modals.forEach(m => {
                m.classList.add('bongkar-modal-edit-active');
                m.classList.add('active'); // in case modal styling uses .active
                m.setAttribute('aria-hidden', 'false');
                m.querySelectorAll('.modal-container, .modal-dialog, .modal-content, [class*="modal-dialog"], [class*="modal-content"]').forEach(child => {
                    child.classList.add('bongkar-modal-dialog-active');
                });
            });

            // Inject floating banner at top of canvas
            let banner = document.getElementById('bongkar-modal-edit-banner');
            if (!banner) {
                banner = document.createElement('div');
                banner.id = 'bongkar-modal-edit-banner';
                banner.className = 'bongkar-modal-edit-banner';
                banner.innerHTML = `
                    <div class="modal-banner-pill">
                        <i class="fa-solid fa-window-restore"></i>
                        <span>Mode Edit Pop-up / Modal Aktif (Klik elemen di dalam pop-up untuk diedit)</span>
                        <button type="button" id="btn-exit-modal-edit" class="btn-exit-modal-banner">
                            <i class="fa-solid fa-circle-check"></i> Selesai Edit Pop-up
                        </button>
                    </div>
                `;
                document.body.appendChild(banner);
                banner.querySelector('#btn-exit-modal-edit').addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleModalEditMode(false);
                });
            }

            // Auto-select first editable element in modal
            const firstEditable = modals[0].querySelector('h1, h2, h3, h4, img, p, button') || modals[0];
            selectElement(firstEditable);

            showCanvasToast('Mode Edit Pop-up Aktif: Klik elemen apa saja di dalam pop-up untuk mengedit', 'success');
            window.parent.postMessage({ type: 'BONGKAR_MODAL_EDIT_STATE', active: true }, '*');
        } else {
            activeModalElements.forEach(m => {
                m.classList.remove('bongkar-modal-edit-active');
                m.classList.remove('active');
                m.setAttribute('aria-hidden', 'true');
                m.querySelectorAll('.bongkar-modal-edit-active, .bongkar-modal-dialog-active').forEach(child => {
                    child.classList.remove('bongkar-modal-edit-active', 'bongkar-modal-dialog-active');
                });
            });
            activeModalElements = [];

            const banner = document.getElementById('bongkar-modal-edit-banner');
            if (banner) banner.remove();

            deselectElement();
            showCanvasToast('Mode Edit Pop-up ditutup', 'info');
            window.parent.postMessage({ type: 'BONGKAR_MODAL_EDIT_STATE', active: false }, '*');
        }
    }

    /**
     * Attach canvas event listeners
     */
    function attachEventListeners() {
        const root = document.getElementById('bongkar-canvas-root') || document.body;
        let hoverHideTimeout = null;

        // Hover effect: highlight hovered element cleanly without blocking cursor
        root.addEventListener('mouseover', (e) => {
            if (isInteractiveMode) return;
            const target = e.target.closest('#bongkar-canvas-root *');
            if (!target || target === floatingToolbar || target.closest('#bongkar-floating-toolbar') || target === tagBadge || target === contextMenu || target.closest('#bongkar-context-menu')) return;

            if (hoverHideTimeout) {
                clearTimeout(hoverHideTimeout);
                hoverHideTimeout = null;
            }

            if (hoveredElement && hoveredElement !== target) {
                hoveredElement.classList.remove(
                    'bongkar-hover-target',
                    'bongkar-hover-layout-outer', 'bongkar-hover-layout-inner', 'bongkar-hover-layout', 'bongkar-hover-text', 'bongkar-hover-action', 'bongkar-hover-media', 'bongkar-hover-feed'
                );
            }
            hoveredElement = target;
            if (hoveredElement !== selectedElement) {
                const semantic = getElementSemanticRole(hoveredElement);
                hoveredElement.classList.add('bongkar-hover-target', `bongkar-hover-${semantic.role}`);
            }
        });

        root.addEventListener('mouseout', (e) => {
            if (isInteractiveMode) return;
            const related = e.relatedTarget;
            if (related && (related === floatingToolbar || (floatingToolbar && floatingToolbar.contains(related)))) {
                return;
            }

            if (hoveredElement) {
                hoveredElement.classList.remove(
                    'bongkar-hover-target',
                    'bongkar-hover-layout-outer', 'bongkar-hover-layout-inner', 'bongkar-hover-layout', 'bongkar-hover-text', 'bongkar-hover-action', 'bongkar-hover-media', 'bongkar-hover-feed'
                );
                hoveredElement = null;
            }
        });

        // Keep toolbar open when mouse is interacting inside toolbar
        floatingToolbar.addEventListener('mouseenter', () => {
            if (hoverHideTimeout) {
                clearTimeout(hoverHideTimeout);
                hoverHideTimeout = null;
            }
        });

        floatingToolbar.addEventListener('mouseleave', () => {
            if (!selectedElement) {
                hoverHideTimeout = setTimeout(() => {
                    if (!hoveredElement && !selectedElement && floatingToolbar) {
                        floatingToolbar.style.display = 'none';
                        tagBadge.style.display = 'none';
                    }
                }, 300);
            }
        });

        // Click to Select or Interact (Captured on document to prevent inline onclick scripts from hijacking in Design Mode)
        document.addEventListener('click', (e) => {
            // In Interactive Mode, allow all native clicks (buttons, sliders, tabs, accordions, modals)!
            if (isInteractiveMode) {
                return;
            }

            // Allow clicks inside editor helper UI elements
            if (e.target.closest('#bongkar-floating-toolbar') || 
                e.target.closest('#bongkar-context-menu') || 
                e.target.closest('.bongkar-section-insert-bar') ||
                e.target.closest('.bongkar-modal-edit-banner') ||
                e.target.closest('#bongkar-canvas-toast')) {
                return;
            }

            // Quick interaction bypass in Design Mode: hold Alt, Ctrl, or Cmd to trigger interactive click directly!
            if (e.altKey || e.ctrlKey || e.metaKey) {
                return;
            }

            // PREVENT inline onclick, link navigation, form submission, and modal auto-closing in Design Mode!
            e.preventDefault();
            e.stopPropagation();

            hideContextMenu();

            // Close any open inline section pickers when clicking elsewhere on canvas
            root.querySelectorAll('.bongkar-section-insert-bar.is-expanded').forEach(b => {
                b.classList.remove('is-expanded');
                b.querySelectorAll('.bongkar-inline-section-picker').forEach(p => p.remove());
            });

            // If clicking inside canvas or active modal, select the target!
            const target = e.target.closest('#bongkar-canvas-root *') || (e.target.closest('.bongkar-modal-edit-active') ? e.target : null);
            if (target && target !== root && target !== document.body) {
                selectElement(target);
            } else {
                deselectElement();
            }
        }, true); // useCapture = true ensures events are caught before element inline onclick!

        // Right-click context menu (Elementor Style)
        document.addEventListener('contextmenu', (e) => {
            if (isInteractiveMode) return;

            // Allow native right-click inside editable text
            if (document.activeElement && (document.activeElement.isContentEditable || ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName))) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            const target = e.target.closest('#bongkar-canvas-root *') || hoveredElement || selectedElement;
            if (target && target !== floatingToolbar && !target.closest('#bongkar-floating-toolbar') && target !== tagBadge) {
                selectElement(target);
                showContextMenu(e.clientX, e.clientY, target);
            } else {
                showContextMenu(e.clientX, e.clientY, selectedElement || null);
            }
        }, true);

        // Double click: image opens media picker, text enables inline edit
        root.addEventListener('dblclick', (e) => {
            const target = e.target.closest('#bongkar-canvas-root *');
            if (!target) return;

            if (target.tagName === 'IMG') {
                e.preventDefault();
                e.stopPropagation();
                selectElement(target);
                window.parent.postMessage({
                    type: 'BONGKAR_OPEN_MEDIA_PICKER',
                    targetTag: 'img'
                }, '*');
                return;
            }

            if (isTextEditable(target)) {
                e.preventDefault();
                e.stopPropagation();
                enableInlineEdit(target);
            }
        });

        // Reposition toolbar on scroll or resize (capture: true catches scroll in modals/overflow containers)
        window.addEventListener('scroll', () => {
            if (selectedElement) updateFloatingPositions(selectedElement);
        }, true);
        window.addEventListener('resize', () => {
            if (selectedElement) updateFloatingPositions(selectedElement);
        });
    }

    /**
     * Helper to test if element is text editable
     */
    function isTextEditable(el) {
        if (!el) return false;
        if (['IMG', 'VIDEO', 'IFRAME', 'INPUT', 'SELECT', 'TEXTAREA', 'HR', 'BR'].includes(el.tagName)) {
            return false;
        }
        const tags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'A', 'BUTTON', 'LI', 'LABEL'];
        return tags.includes(el.tagName) || (el.children.length === 0 && (el.innerText || '').trim().length > 0);
    }

    /**
     * Enable ContentEditable on an element
     */
    function enableInlineEdit(el) {
        el.setAttribute('contenteditable', 'true');
        el.focus();

        const onBlur = () => {
            el.removeAttribute('contenteditable');
            el.removeEventListener('blur', onBlur);
            notifyContentChanged();
            if (selectedElement === el) {
                sendElementInfoToParent(el);
            }
        };

        el.addEventListener('blur', onBlur);
    }

    /**
     * Select an element in the canvas
     */
    function selectElement(el, focusField = null) {
        if (selectedElement && selectedElement !== el) {
            selectedElement.classList.remove(
                'bongkar-selected-target',
                'bongkar-type-layout-outer', 'bongkar-type-layout-inner', 'bongkar-type-layout', 'bongkar-type-text', 'bongkar-type-action', 'bongkar-type-media', 'bongkar-type-feed'
            );
            if (selectedElement.hasAttribute('contenteditable')) {
                selectedElement.removeAttribute('contenteditable');
            }
        }

        selectedElement = el;
        const semantic = getElementSemanticRole(el);
        selectedElement.classList.add('bongkar-selected-target', `bongkar-type-${semantic.role}`);
        if (hoveredElement) {
            hoveredElement.classList.remove(
                'bongkar-hover-target',
                'bongkar-hover-layout-outer', 'bongkar-hover-layout-inner', 'bongkar-hover-layout', 'bongkar-hover-text', 'bongkar-hover-action', 'bongkar-hover-media', 'bongkar-hover-feed'
            );
        }

        updateFloatingPositions(el);
        sendElementInfoToParent(el, focusField);
    }

    /**
     * Deselect element
     */
    function deselectElement() {
        if (selectedElement) {
            selectedElement.classList.remove(
                'bongkar-selected-target',
                'bongkar-type-layout-outer', 'bongkar-type-layout-inner', 'bongkar-type-layout', 'bongkar-type-text', 'bongkar-type-action', 'bongkar-type-media', 'bongkar-type-feed'
            );
            if (selectedElement.hasAttribute('contenteditable')) {
                selectedElement.removeAttribute('contenteditable');
            }
            selectedElement = null;
        }
        floatingToolbar.style.display = 'none';
        tagBadge.style.display = 'none';

        // Notify parent
        window.parent.postMessage({
            type: 'BONGKAR_ELEMENT_DESELECTED'
        }, '*');
    }

    /**
     * Update Toolbar and Badge positions (supports Hover & Selection modes)
     */
    function updateFloatingPositions(el, isHoverMode = false) {
        if (!el || !document.body.contains(el)) {
            floatingToolbar.style.display = 'none';
            tagBadge.style.display = 'none';
            return;
        }

        const rect = el.getBoundingClientRect();
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;
        const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
        const viewportHeight = document.documentElement.clientHeight || window.innerHeight;

        // Position Badge with viewport edge clamping
        const tag = el.tagName.toLowerCase();
        const className = (el.className && typeof el.className === 'string') ? '.' + el.className.replace(/bongkar-[a-z\-]+/g, '').trim().split(' ')[0] : '';
        const labelText = `${tag}${className}`.replace(/\.+$/, '') || tag;

        const semantic = getElementSemanticRole(el);

        // Update tag badge inside toolbar with color-coded label and icon
        const toolbarTag = document.getElementById('toolbar-elem-tag');
        if (toolbarTag) {
            toolbarTag.innerHTML = `<i class="fa-solid ${semantic.icon}"></i> ${semantic.label}`;
            toolbarTag.title = `${semantic.label} (${labelText})`;
        }

        // Apply role classes to floatingToolbar
        floatingToolbar.classList.remove('toolbar-type-layout-outer', 'toolbar-type-layout-row', 'toolbar-type-layout-col', 'toolbar-type-layout-form', 'toolbar-type-layout-card', 'toolbar-type-layout-inner', 'toolbar-type-layout', 'toolbar-type-text', 'toolbar-type-action', 'toolbar-type-media', 'toolbar-type-feed');
        floatingToolbar.classList.add(`toolbar-type-${semantic.role}`);

        // Parent selector button visibility in floating toolbar
        const rootNode = document.getElementById('bongkar-canvas-root') || document.body;
        const selectParentBtn = document.getElementById('act-select-parent');
        if (selectParentBtn) {
            const hasParent = el && el.parentElement && el.parentElement !== rootNode && el.parentElement.tagName !== 'BODY';
            selectParentBtn.style.display = hasParent ? 'inline-flex' : 'none';
            if (hasParent) {
                const parentSem = getElementSemanticRole(el.parentElement);
                selectParentBtn.title = `Pilih Pembungkus Induk: ${parentSem.label}`;
            }
        }

        // Wrap into container button
        const wrapContainerBtn = document.getElementById('act-wrap-container');
        if (wrapContainerBtn) {
            wrapContainerBtn.style.display = 'inline-flex';
            wrapContainerBtn.title = 'Bungkus Elemen ke Kontainer Baru (Flexbox)';
        }

        // Floating Toolbar Flex Direction Toggle button visibility & icon
        const toggleFlexBtn = document.getElementById('act-toggle-flex-dir');
        if (toggleFlexBtn) {
            const isContainer = ['layout-outer', 'layout-row', 'layout-col', 'layout-form', 'layout-card', 'layout-inner'].includes(semantic.role);
            if (isContainer) {
                toggleFlexBtn.style.display = 'inline-flex';
                const computedStyle = window.getComputedStyle(el);
                const isRow = (el.style.flexDirection === 'row') || (computedStyle.display === 'flex' && computedStyle.flexDirection === 'row');
                if (isRow) {
                    toggleFlexBtn.innerHTML = '<i class="fa-solid fa-arrows-up-down"></i>';
                    toggleFlexBtn.title = 'Ubah ke Atas - Bawah (Menumpuk)';
                } else {
                    toggleFlexBtn.innerHTML = '<i class="fa-solid fa-arrows-left-right"></i>';
                    toggleFlexBtn.title = 'Ubah ke Saling Samping (Kanan - Kiri)';
                }
            } else {
                toggleFlexBtn.style.display = 'none';
            }
        }

        // Adaptive edit button in toolbar (image vs text)
        const editBtn = document.getElementById('act-edit-text');
        if (editBtn) {
            if (el.tagName === 'IMG') {
                editBtn.innerHTML = '<i class="fa-solid fa-image"></i>';
                editBtn.title = 'Ganti Gambar (Buka Media Library)';
            } else {
                editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
                editBtn.title = 'Edit Teks Langsung';
            }
        }

        // Hide standalone badge when toolbar is visible to avoid double overlapping badges
        tagBadge.style.display = 'none';

        // Position Floating Toolbar with viewport edge clamping
        floatingToolbar.style.display = 'flex';
        floatingToolbar.classList.toggle('is-hover-state', !!isHoverMode);

        const toolbarWidth = floatingToolbar.offsetWidth || 370;
        const toolbarHeight = floatingToolbar.offsetHeight || 36;
        const maxToolbarLeft = Math.max(4, viewportWidth - toolbarWidth - 8);
        const safeToolbarLeft = Math.max(4, Math.min(rect.left + scrollX, maxToolbarLeft));
        floatingToolbar.style.left = `${safeToolbarLeft}px`;

        // Smart Vertical Positioning:
        // Priority 1: Place ABOVE if there is room and element is not tiny
        // Priority 2: Place BELOW if near top edge or element is small (anti-covering)
        // Priority 3: Safe fallback viewport clamping
        const spaceAbove = rect.top;
        const spaceBelow = viewportHeight - rect.bottom;
        const isSmallElement = rect.height <= toolbarHeight + 14;

        let topPos;
        if (spaceAbove >= toolbarHeight + 10 && !isSmallElement) {
            // Room above and element not tiny: place directly above
            topPos = rect.top + scrollY - toolbarHeight - 6;
        } else if (spaceBelow >= toolbarHeight + 10) {
            // Not enough room above OR element is small near top: place directly below
            topPos = rect.bottom + scrollY + 6;
        } else if (spaceAbove >= toolbarHeight + 10) {
            // Small element with room above: place above
            topPos = rect.top + scrollY - toolbarHeight - 6;
        } else {
            // Squeezed both above and below: if tall, place inside top; if small, place below
            if (rect.height > toolbarHeight * 2) {
                topPos = Math.max(scrollY + 4, rect.top + scrollY + 4);
            } else {
                topPos = rect.bottom + scrollY + 6;
            }
        }
        floatingToolbar.style.top = `${topPos}px`;
    }

    /**
     * Send selected element details to parent Studio
     */
    function sendElementInfoToParent(el, focusField = null) {
        const computed = window.getComputedStyle(el);
        const tag = el.tagName.toLowerCase();
        const textContent = el.innerText || '';
        const isImg = tag === 'img';
        const childImg = !isImg ? el.querySelector('img') : null;
        const effectiveImg = isImg ? el : childImg;
        const isImage = isImg || !!childImg;

        // Background image detection
        const hasBgImg = computed.backgroundImage && computed.backgroundImage !== 'none' && computed.backgroundImage.includes('url');
        let bgImgUrl = '';
        if (hasBgImg) {
            const bgMatch = computed.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/i);
            if (bgMatch && bgMatch[1]) bgImgUrl = bgMatch[1];
        }

        const imgSrc = effectiveImg ? (effectiveImg.getAttribute('src') || effectiveImg.src || '') : (hasBgImg ? bgImgUrl : '');
        const imgAlt = effectiveImg ? (effectiveImg.getAttribute('alt') || '') : '';
        const imgFit = effectiveImg ? (effectiveImg.style.objectFit || window.getComputedStyle(effectiveImg).objectFit || '') : (hasBgImg ? (el.style.backgroundSize || 'cover') : '');

        // Modal triggers & container detection
        const closestClickable = el.closest('[onclick], button, a, [data-modal-target], [data-target]');
        const clickCode = closestClickable ? (closestClickable.getAttribute('onclick') || '').toLowerCase() : '';
        const dataTarget = closestClickable ? (closestClickable.getAttribute('data-target') || closestClickable.getAttribute('data-modal-target') || '').toLowerCase() : '';
        const triggersModal = clickCode.includes('modal') || clickCode.includes('popup') || dataTarget.includes('modal') || dataTarget.includes('popup');
        const isInsideModal = !!el.closest('.modal-backdrop, .modal, .popup, .lightbox, dialog, [id*="modal" i], [class*="modal" i]');
        const isLink = tag === 'a' || el.tagName === 'BUTTON';

        // Video detection
        const videoWrapper = el.classList.contains('bongkar-video-wrapper') ? el : el.closest('.bongkar-video-wrapper');
        const iframeEl = videoWrapper ? videoWrapper.querySelector('iframe') : (tag === 'iframe' ? el : null);
        const html5VideoEl = videoWrapper ? videoWrapper.querySelector('video') : (tag === 'video' ? el : null);
        const isVideo = !!(videoWrapper || iframeEl || html5VideoEl);
        const videoSrc = iframeEl ? (iframeEl.getAttribute('src') || '') : (html5VideoEl ? (html5VideoEl.getAttribute('src') || '') : '');
        let videoRatio = '16:9';
        if (videoWrapper) {
            if (videoWrapper.getAttribute('data-video-ratio')) {
                videoRatio = videoWrapper.getAttribute('data-video-ratio');
            } else if (videoWrapper.style.paddingBottom === '75%') {
                videoRatio = '4:3';
            } else if (videoWrapper.style.paddingBottom === '100%') {
                videoRatio = '1:1';
            } else if (videoWrapper.style.paddingBottom === '177.77%' || videoWrapper.style.paddingBottom === '177.78%') {
                videoRatio = '9:16';
            }
        }
        const isVideoAutoplay = videoSrc.includes('autoplay=1');
        const isVideoMute = videoSrc.includes('mute=1') || videoSrc.includes('muted=1');
        const isVideoLoop = videoSrc.includes('loop=1');

        // Icon detection
        const isIcon = tag === 'i' || (el.className && typeof el.className === 'string' && !!el.className.match(/fa-[a-z0-9\-]+/i));
        const iconClass = isIcon ? el.className.replace(/bongkar-[a-z\-]+/g, '').trim() : '';

        // Rating detection
        const ratingWrapper = el.classList.contains('bongkar-rating-widget') ? el : el.closest('.bongkar-rating-widget');
        const isRating = !!ratingWrapper;
        let ratingStars = 5;
        let ratingLabel = '';
        if (ratingWrapper) {
            const fullStars = ratingWrapper.querySelectorAll('i.fa-star').length;
            const halfStars = ratingWrapper.querySelectorAll('i.fa-star-half-stroke').length;
            ratingStars = fullStars + (halfStars ? 0.5 : 0);
            const labelSpan = ratingWrapper.querySelector('span');
            ratingLabel = labelSpan ? labelSpan.innerText : '';
        }

        // Spacer detection
        const spacerEl = el.classList.contains('bongkar-spacer') ? el : el.closest('.bongkar-spacer');
        const isSpacer = !!spacerEl;
        const spacerHeight = isSpacer ? (parseInt(spacerEl.style.height || computed.height) || 40) : 0;

        // Deep Auto-Detection for WhatsApp & Google Sheets (Forms, Buttons, Links, Actions)
        const formEl = tag === 'form' ? el : el.closest('form');
        const isStandaloneCta = tag === 'a' || tag === 'button' || el.classList.contains('btn') || el.classList.contains('button') || el.classList.contains('btn-whatsapp');

        let detectedWa = false;
        let detectedWaNumber = '';
        let detectedWaTemplate = '';
        let detectedGsheet = false;
        let detectedGsheetUrl = '';
        let detectedSuccessMsg = '';

        // 1. Check explicit attributes on formEl or selected element
        if (formEl) {
            if (formEl.getAttribute('data-bongkar-wa') === 'true') detectedWa = true;
            if (formEl.getAttribute('data-wa-number')) detectedWaNumber = formEl.getAttribute('data-wa-number');
            if (formEl.getAttribute('data-wa-template')) detectedWaTemplate = formEl.getAttribute('data-wa-template');
            if (formEl.getAttribute('data-bongkar-gsheet') === 'true') detectedGsheet = true;
            if (formEl.getAttribute('data-gsheet-url')) detectedGsheetUrl = formEl.getAttribute('data-gsheet-url');
            if (formEl.getAttribute('data-success-msg')) detectedSuccessMsg = formEl.getAttribute('data-success-msg');
        }
        if (el.getAttribute('data-bongkar-wa') === 'true') detectedWa = true;
        if (el.getAttribute('data-wa-number')) detectedWaNumber = detectedWaNumber || el.getAttribute('data-wa-number');
        if (el.getAttribute('data-wa-template')) detectedWaTemplate = detectedWaTemplate || el.getAttribute('data-wa-template');
        if (el.getAttribute('data-bongkar-gsheet') === 'true') detectedGsheet = true;
        if (el.getAttribute('data-gsheet-url')) detectedGsheetUrl = detectedGsheetUrl || el.getAttribute('data-gsheet-url');
        if (el.getAttribute('data-success-msg')) detectedSuccessMsg = detectedSuccessMsg || el.getAttribute('data-success-msg');

        // 2. Scan URLs and actions from href, action, onsubmit, onclick across element and form container
        const scanTargets = [el];
        if (formEl && formEl !== el) scanTargets.push(formEl);

        const candidateStrings = [];
        scanTargets.forEach(target => {
            if (target.getAttribute('href')) candidateStrings.push(target.getAttribute('href'));
            if (target.getAttribute('action')) candidateStrings.push(target.getAttribute('action'));
            if (target.getAttribute('onclick')) candidateStrings.push(target.getAttribute('onclick'));
            if (target.getAttribute('onsubmit')) candidateStrings.push(target.getAttribute('onsubmit'));
            if (target.getAttribute('data-phone')) candidateStrings.push('phone=' + target.getAttribute('data-phone'));
            if (target.getAttribute('data-action')) candidateStrings.push(target.getAttribute('data-action'));
        });

        // Scan any child links, buttons or inputs inside form container or selected element
        const containerElem = formEl || el;
        const subLinks = containerElem.querySelectorAll('a[href], button[onclick], form[action], input[value*="script.google.com"], input[value*="wa.me"]');
        subLinks.forEach(sub => {
            if (sub.getAttribute('href')) candidateStrings.push(sub.getAttribute('href'));
            if (sub.getAttribute('action')) candidateStrings.push(sub.getAttribute('action'));
            if (sub.getAttribute('onclick')) candidateStrings.push(sub.getAttribute('onclick'));
            if (sub.value && sub.value.includes('script.google.com')) candidateStrings.push(sub.value);
        });

        // Also inspect outerHTML snippets
        candidateStrings.push(containerElem.outerHTML.substring(0, 3000));

        // Detect WhatsApp (wa.me, api.whatsapp.com, whatsapp://send)
        for (const str of candidateStrings) {
            if (!str) continue;
            const waMatch1 = str.match(/(?:https?:\/\/)?(?:wa\.me|api\.whatsapp\.com\/send\/?\?(?:[^"'\s<>]*&)?phone=)\/?([0-9+]+)(?:[?&](?:amp;)?text=([^"'\s&<>]+))?/i);
            const waMatch2 = str.match(/(?:https?:\/\/)?api\.whatsapp\.com\/send\/?\?(?:[^"'\s<>]*&)?text=([^"'\s&<>]+)(?:&(?:amp;)?phone=([0-9+]+))?/i);
            const waMatch3 = str.match(/whatsapp:\/\/send\?(?:[^"'\s<>]*&)?phone=([0-9+]+)(?:&(?:amp;)?text=([^"'\s&<>]+))?/i);
            const waMatchDirect = str.match(/wa\.me\/([0-9+]+)/i);

            if (waMatch1) {
                detectedWa = true;
                if (!detectedWaNumber && waMatch1[1]) detectedWaNumber = waMatch1[1].replace(/[^0-9]/g, '');
                if (!detectedWaTemplate && waMatch1[2]) {
                    try { detectedWaTemplate = decodeURIComponent(waMatch1[2].replace(/\+/g, ' ')); } catch (e) { detectedWaTemplate = waMatch1[2]; }
                }
                break;
            } else if (waMatch2) {
                detectedWa = true;
                if (!detectedWaNumber && waMatch2[2]) detectedWaNumber = waMatch2[2].replace(/[^0-9]/g, '');
                if (!detectedWaTemplate && waMatch2[1]) {
                    try { detectedWaTemplate = decodeURIComponent(waMatch2[1].replace(/\+/g, ' ')); } catch (e) { detectedWaTemplate = waMatch2[1]; }
                }
                break;
            } else if (waMatch3) {
                detectedWa = true;
                if (!detectedWaNumber && waMatch3[1]) detectedWaNumber = waMatch3[1].replace(/[^0-9]/g, '');
                if (!detectedWaTemplate && waMatch3[2]) {
                    try { detectedWaTemplate = decodeURIComponent(waMatch3[2].replace(/\+/g, ' ')); } catch (e) { detectedWaTemplate = waMatch3[2]; }
                }
                break;
            } else if (waMatchDirect) {
                detectedWa = true;
                if (!detectedWaNumber && waMatchDirect[1]) detectedWaNumber = waMatchDirect[1].replace(/[^0-9]/g, '');
                break;
            }
        }

        // Detect Google Sheets Webhook (script.google.com/macros/s/.../exec)
        for (const str of candidateStrings) {
            if (!str) continue;
            const gsheetMatch = str.match(/https:\/\/script\.google\.com\/macros\/s\/([a-zA-Z0-9_-]+)\/exec/i);
            if (gsheetMatch) {
                detectedGsheet = true;
                if (!detectedGsheetUrl) detectedGsheetUrl = gsheetMatch[0];
                break;
            }
        }

        // Check global script code for Google Sheets if form is present
        if (formEl && !detectedGsheet && window.__currentScriptCode) {
            const scriptGsheetMatch = window.__currentScriptCode.match(/https:\/\/script\.google\.com\/macros\/s\/([a-zA-Z0-9_-]+)\/exec/i);
            if (scriptGsheetMatch) {
                detectedGsheet = true;
                detectedGsheetUrl = scriptGsheetMatch[0];
            }
        }

        // Mark form integration active if form exists OR if WA / GSheet is present on the selected element
        const isForm = !!(formEl || detectedWa || detectedGsheet || (isStandaloneCta && (detectedWa || detectedGsheet)));
        const formWaEnabled = detectedWa;
        const formWaNumber = detectedWaNumber;
        const formWaTemplate = detectedWaTemplate;
        const formGsheetEnabled = detectedGsheet;
        const formGsheetUrl = detectedGsheetUrl;
        const formSuccessMsg = detectedSuccessMsg || 'Terima kasih! Pesanan Anda telah berhasil dikirim.';

        // Custom Embed widget detection
        const embedEl = el.hasAttribute('data-bongkar-embed') ? el : el.closest('[data-bongkar-embed="true"]');
        const isEmbed = !!embedEl;
        const embedHtml = isEmbed ? embedEl.innerHTML : '';

        // Algorithm & Script detection on or surrounding element
        const isSwiper = !!(el.classList.contains('swiper') || el.closest('.swiper, .swiper-container'));
        const isAccordion = !!(el.classList.contains('faq-item') || el.closest('.accordion, .faq-item, details'));
        const isCountdown = !!(el.classList.contains('countdown') || el.closest('.countdown, [id*="timer"], [class*="timer"]'));
        const isMobileMenu = !!(el.classList.contains('hamburger') || el.closest('.hamburger, .menu-toggle, .mobile-menu'));

        let algoType = 'standard';
        if (isSwiper) algoType = 'swiper';
        else if (isAccordion) algoType = 'accordion';
        else if (isCountdown) algoType = 'countdown';
        else if (isMobileMenu) algoType = 'mobile-menu';
        else if (isEmbed) algoType = 'embed';
        else if (isForm) algoType = 'form';

        // Extract inline event handlers (onclick, oninput, onchange, onsubmit)
        const inlineOnClick = el.getAttribute('onclick') || '';
        const inlineOnInput = el.getAttribute('oninput') || '';
        const inlineOnChange = el.getAttribute('onchange') || '';
        const inlineOnSubmit = el.getAttribute('onsubmit') || '';
        const parentWithClick = el.closest('[onclick]');
        const effectiveOnClick = inlineOnClick || (parentWithClick ? parentWithClick.getAttribute('onclick') : '');

        // Width, Spacing & Column inspection
        const inlineWidth = el.style.width || '';
        const computedWidth = parseInt(computed.width) || 0;
        const inlineHeight = el.style.height || '';
        const inlineMinHeight = el.style.minHeight || '';
        const computedHeight = parseInt(computed.height) || 0;
        const inlinePadTop = el.style.paddingTop || '';
        const inlinePadRight = el.style.paddingRight || '';
        const inlinePadBottom = el.style.paddingBottom || '';
        const inlinePadLeft = el.style.paddingLeft || '';
        const inlineMarTop = el.style.marginTop || '';
        const inlineMarRight = el.style.marginRight || '';
        const inlineMarBottom = el.style.marginBottom || '';
        const inlineMarLeft = el.style.marginLeft || '';
        const isCol = el.classList.contains('bongkar-column') || !!el.closest('.bongkar-column');

        // Dynamic Post Grid Feed Detection
        const postGridEl = el.classList.contains('bongkar-dynamic-posts-grid') ? el : el.closest('.bongkar-dynamic-posts-grid');
        const isPostGrid = !!postGridEl;
        const postFilter = isPostGrid ? (postGridEl.getAttribute('data-post-filter') || 'recent') : 'recent';
        const postCategory = isPostGrid ? (postGridEl.getAttribute('data-category-id') || '0') : '0';
        const postCount = isPostGrid ? (postGridEl.getAttribute('data-post-count') || '6') : '6';
        const postCols = isPostGrid ? (postGridEl.getAttribute('data-post-cols') || '3') : '3';
        const postIds = isPostGrid ? (postGridEl.getAttribute('data-post-ids') || '') : '';

        // Determine Semantic Element Role
        const semanticRole = getElementSemanticRole(el);

        // Build ancestor chain for Interactive Breadcrumbs
        const rootCanvas = document.getElementById('bongkar-canvas-root') || document.body;
        window.__bongkarCurrentAncestors = [];
        let walkEl = el;
        while (walkEl && walkEl !== rootCanvas && walkEl.tagName !== 'BODY') {
            window.__bongkarCurrentAncestors.push(walkEl);
            walkEl = walkEl.parentElement;
        }

        const breadcrumbs = [];
        for (let i = window.__bongkarCurrentAncestors.length - 1; i >= 0; i--) {
            const node = window.__bongkarCurrentAncestors[i];
            const sem = getElementSemanticRole(node);
            const tagStr = node.tagName.toLowerCase();
            const classSnippet = (node.className && typeof node.className === 'string') ? '.' + node.className.replace(/bongkar-[a-z\-]+/g, '').trim().split(' ')[0] : '';
            const cleanSnippet = (classSnippet && classSnippet !== '.') ? classSnippet : '';
            breadcrumbs.push({
                ancestorIndex: i,
                tag: tagStr,
                selector: `${tagStr}${cleanSnippet}`,
                label: sem.label,
                role: sem.role,
                icon: sem.icon,
                color: sem.color,
                isCurrent: (i === 0)
            });
        }

        // Count direct valid children for Master Container Proportions
        const validChildCount = el.children ? Array.from(el.children).filter(c => 
            !c.classList.contains('bongkar-section-insert-bar') && 
            !c.classList.contains('bongkar-bottom-add-zone') &&
            !c.classList.contains('bongkar-column-dropzone')
        ).length : 0;
        const hasParent = window.__bongkarCurrentAncestors.length > 1;

        // Detect parent row container if el is a column or card inside a row
        const parentRow = findTargetRowContainer(el);
        const hasParentRow = !!(parentRow && parentRow !== el);
        const parentRowLabel = hasParentRow ? getFriendlyElementLabel(parentRow) : '';

        const data = {
            type: 'BONGKAR_ELEMENT_SELECTED',
            focusField: focusField || '',
            tag: tag,
            id: el.id || '',
            className: el.className ? el.className.replace(/bongkar-[a-z\-]+/g, '').trim() : '',
            textContent: textContent,
            elementRole: semanticRole.role,
            elementRoleLabel: semanticRole.label,
            elementRoleIcon: semanticRole.icon,
            elementRoleColor: semanticRole.color,
            breadcrumbs: breadcrumbs,
            childCount: validChildCount,
            hasParent: hasParent,
            hasParentRow: hasParentRow,
            parentRowLabel: parentRowLabel,
            isMultiColRow: semanticRole.role === 'layout-row',
            isContainer: ['layout-outer', 'layout-row', 'layout-col', 'layout-form', 'layout-card', 'layout-inner'].includes(semanticRole.role),
            isOuterLayout: semanticRole.role === 'layout-outer',
            isInnerLayout: ['layout-row', 'layout-col', 'layout-form', 'layout-card', 'layout-inner'].includes(semanticRole.role),
            flexDirection: el.style.flexDirection || (computed.display === 'flex' ? computed.flexDirection : 'column'),
            isFlex: computed.display === 'flex' || computed.display === 'inline-flex',
            flexGap: parseInt(el.style.gap || (computed.gap !== 'normal' ? computed.gap : '16')) || 16,
            flexAlignItems: el.style.alignItems || computed.alignItems || 'stretch',
            flexJustifyContent: el.style.justifyContent || computed.justifyContent || 'flex-start',
            flexWrap: el.style.flexWrap || computed.flexWrap || 'wrap',
            isPostGrid: isPostGrid,
            postFilter: postFilter,
            postCategory: postCategory,
            postCount: postCount,
            postCols: postCols,
            postIds: postIds,
            isImage: isImage || hasBgImg,
            hasChildImg: !!childImg,
            hasBgImg: hasBgImg,
            triggersModal: triggersModal,
            isInsideModal: isInsideModal,
            isLink: isLink,
            imgSrc: imgSrc,
            imgAlt: imgAlt,
            imgFit: imgFit,
            linkHref: isLink ? el.getAttribute('href') || '' : '',
            linkTarget: isLink ? el.getAttribute('target') || '_self' : '_self',
            isVideo: isVideo,
            videoSrc: videoSrc,
            videoRatio: videoRatio,
            videoAutoplay: isVideoAutoplay,
            videoMute: isVideoMute,
            videoLoop: isVideoLoop,
            isIcon: isIcon,
            iconClass: iconClass,
            isRating: isRating,
            ratingStars: ratingStars,
            ratingLabel: ratingLabel,
            isSpacer: isSpacer,
            spacerHeight: spacerHeight,
            isForm: isForm,
            formWaEnabled: formWaEnabled,
            formWaNumber: formWaNumber,
            formWaTemplate: formWaTemplate,
            formGsheetEnabled: formGsheetEnabled,
            formGsheetUrl: formGsheetUrl,
            formSuccessMsg: formSuccessMsg,
            isEmbed: isEmbed,
            embedHtml: embedHtml,
            algoType: algoType,
            inlineOnClick: inlineOnClick,
            inlineOnInput: inlineOnInput,
            inlineOnChange: inlineOnChange,
            inlineOnSubmit: inlineOnSubmit,
            effectiveOnClick: effectiveOnClick,
            isColumn: isCol,
            width: inlineWidth || (computedWidth ? `${computedWidth}px` : ''),
            height: inlineHeight || (computedHeight ? `${computedHeight}px` : ''),
            minHeight: inlineMinHeight,
            inlinePadding: {
                top: inlinePadTop,
                right: inlinePadRight,
                bottom: inlinePadBottom,
                left: inlinePadLeft
            },
            inlineMargin: {
                top: inlineMarTop,
                right: inlineMarRight,
                bottom: inlineMarBottom,
                left: inlineMarLeft
            },
            styles: {
                width: inlineWidth || (computedWidth ? `${computedWidth}px` : ''),
                height: inlineHeight || (computedHeight ? `${computedHeight}px` : ''),
                minHeight: inlineMinHeight,
                fontFamily: computed.fontFamily.replace(/['"]/g, ''),
                fontSize: parseInt(computed.fontSize) || 16,
                fontWeight: computed.fontWeight || '400',
                color: rgbToHex(computed.color),
                textAlign: computed.textAlign || 'left',
                lineHeight: computed.lineHeight,
                backgroundColor: rgbToHex(computed.backgroundColor),
                borderRadius: parseInt(computed.borderRadius) || 0,
                borderWidth: parseInt(computed.borderWidth) || 0,
                borderStyle: computed.borderStyle || 'none',
                borderColor: rgbToHex(computed.borderColor),
                paddingTop: parseInt(computed.paddingTop) || 0,
                paddingRight: parseInt(computed.paddingRight) || 0,
                paddingBottom: parseInt(computed.paddingBottom) || 0,
                paddingLeft: parseInt(computed.paddingLeft) || 0,
                marginTop: parseInt(computed.marginTop) || 0,
                marginRight: parseInt(computed.marginRight) || 0,
                marginBottom: parseInt(computed.marginBottom) || 0,
                marginLeft: parseInt(computed.marginLeft) || 0,
            }
        };

        window.parent.postMessage(data, '*');
    }

    /**
     * RGB to Hex Helper
     */
    function rgbToHex(rgb) {
        if (!rgb || rgb === 'transparent' || rgb.startsWith('rgba(0, 0, 0, 0)')) return '';
        const rgbValues = rgb.match(/\d+/g);
        if (!rgbValues || rgbValues.length < 3) return rgb;
        return '#' + ((1 << 24) + (parseInt(rgbValues[0]) << 16) + (parseInt(rgbValues[1]) << 8) + parseInt(rgbValues[2])).toString(16).slice(1);
    }

    /**
     * Direct Layout Insertion (In-Place or Bottom Zone)
     */
    function insertDirectLayoutAt(layout, insertIndex, targetChild) {
        deselectElement();
        const root = document.getElementById('bongkar-canvas-root') || document.body;
        let templateHtml = null;
        try {
            if (window.parent && window.parent.BongkarSectionManager && typeof window.parent.BongkarSectionManager.getTemplates === 'function') {
                const templates = window.parent.BongkarSectionManager.getTemplates();
                if (templates && templates[layout]) {
                    templateHtml = templates[layout];
                }
            }
        } catch (err) {
            // cross-origin fallback
        }

        if (templateHtml) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = templateHtml.trim();
            const newElem = tempDiv.firstElementChild || tempDiv;

            if (targetChild && targetChild.parentNode === root) {
                root.insertBefore(newElem, targetChild);
            } else {
                const children = Array.from(root.children).filter(el =>
                    !el.classList.contains('bongkar-section-insert-bar') &&
                    !el.classList.contains('bongkar-bottom-add-zone') &&
                    !el.id.startsWith('bongkar-')
                );
                if (typeof insertIndex === 'number' && insertIndex >= 0 && children[insertIndex]) {
                    root.insertBefore(newElem, children[insertIndex]);
                } else {
                    const bottomZone = root.querySelector('.bongkar-bottom-add-zone');
                    if (bottomZone) {
                        root.insertBefore(newElem, bottomZone);
                    } else {
                        root.appendChild(newElem);
                    }
                }
            }

            injectSectionInsertBars();
            injectColumnDropzones();
            selectElement(newElem);
            notifyContentChanged();

            window.parent.postMessage({
                type: 'BONGKAR_DIRECT_LAYOUT_INSERTED',
                layout: layout
            }, '*');

            showCanvasToast('Section berhasil disisipkan di posisi ini', 'success');
        } else {
            window.parent.postMessage({
                type: 'BONGKAR_REQUEST_DIRECT_LAYOUT',
                layout: layout,
                insertIndex: insertIndex
            }, '*');
        }
    }

    /**
     * Create In-Place Expandable Structure Picker (Elementor Style)
     */
    function createInlineStructurePicker(insertIndex, targetChild, parentBar) {
        const picker = document.createElement('div');
        picker.className = 'bongkar-inline-section-picker';
        picker.innerHTML = `
            <div class="bongkar-inline-picker-header">
                <div class="inline-picker-title">
                    <i class="fa-solid fa-table-columns"></i> Pilih Struktur Kolom Section
                </div>
                <button type="button" class="btn-close-inline-picker" title="Tutup">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="bongkar-picker-grids">
                <button type="button" class="btn-picker-layout" data-layout="layout-1col" title="1 Kolom Penuh (100%)">
                    <div class="picker-col-preview col-1"><span></span></div>
                    <span class="picker-col-label">1 Kolom</span>
                </button>
                <button type="button" class="btn-picker-layout" data-layout="layout-2col" title="2 Kolom Sejajar (50:50)">
                    <div class="picker-col-preview col-2"><span></span><span></span></div>
                    <span class="picker-col-label">2 Kolom (50:50)</span>
                </button>
                <button type="button" class="btn-picker-layout" data-layout="layout-2col-asym-left" title="2 Kolom Asimetris (66:33 Konten + Sidebar)">
                    <div class="picker-col-preview col-2-asym-left"><span></span><span></span></div>
                    <span class="picker-col-label">2 Kolom (66:33)</span>
                </button>
                <button type="button" class="btn-picker-layout" data-layout="layout-3col" title="3 Kolom Sejajar (33:33:33)">
                    <div class="picker-col-preview col-3"><span></span><span></span><span></span></div>
                    <span class="picker-col-label">3 Kolom</span>
                </button>
                <button type="button" class="btn-picker-layout" data-layout="layout-4col" title="4 Kolom Sejajar (25:25:25:25)">
                    <div class="picker-col-preview col-4"><span></span><span></span><span></span><span></span></div>
                    <span class="picker-col-label">4 Kolom</span>
                </button>
            </div>
            <div class="bongkar-inline-picker-actions">
                <button type="button" class="btn-inline-open-widgets" title="Buka Panel Widget & Section Lengkap">
                    <i class="fa-solid fa-shapes"></i> Buka Panel Widget
                </button>
                <button type="button" class="btn-inline-paste" title="Tempel Elemen dari Clipboard (Ctrl+V)">
                    <i class="fa-solid fa-paste"></i> Tempel Elemen
                </button>
            </div>
        `;

        // Close button
        picker.querySelector('.btn-close-inline-picker').addEventListener('click', (e) => {
            e.stopPropagation();
            parentBar.classList.remove('is-expanded');
            picker.remove();
        });

        // Layout choices
        picker.querySelectorAll('.btn-picker-layout').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const layout = btn.getAttribute('data-layout');
                insertDirectLayoutAt(layout, insertIndex, targetChild);
            });
        });

        // Open widgets panel
        picker.querySelector('.btn-inline-open-widgets').addEventListener('click', (e) => {
            e.stopPropagation();
            deselectElement();
            window.parent.postMessage({
                type: 'BONGKAR_REQUEST_ADD_SECTION',
                insertIndex: insertIndex
            }, '*');
        });

        // Paste element
        picker.querySelector('.btn-inline-paste').addEventListener('click', (e) => {
            e.stopPropagation();
            parentBar.classList.remove('is-expanded');
            picker.remove();
            BongkarClipboard.paste(targetChild);
        });

        return picker;
    }

    /**
     * Inject "+ Add Section" bars between top-level sections
     */
    function injectSectionInsertBars() {
        const root = document.getElementById('bongkar-canvas-root') || document.body;
        // Remove existing insert bars
        root.querySelectorAll('.bongkar-section-insert-bar, .bongkar-bottom-add-zone').forEach(el => el.remove());

        const children = Array.from(root.children);
        children.forEach((child, index) => {
            if (child.classList.contains('bongkar-section-insert-bar') || child.classList.contains('bongkar-bottom-add-zone')) return;

            const bar = document.createElement('div');
            bar.className = 'bongkar-section-insert-bar';
            bar.innerHTML = `<button type="button" class="btn-add-section" data-insert-index="${index}"><i class="fa-solid fa-plus"></i> Tambah Section</button>`;

            bar.querySelector('.btn-add-section').addEventListener('click', (e) => {
                e.stopPropagation();
                // Close any other open inline pickers
                root.querySelectorAll('.bongkar-section-insert-bar.is-expanded').forEach(otherBar => {
                    otherBar.classList.remove('is-expanded');
                    otherBar.querySelectorAll('.bongkar-inline-section-picker').forEach(p => p.remove());
                });

                // Expand this bar with the inline picker right at this position!
                bar.classList.add('is-expanded');
                const picker = createInlineStructurePicker(index, child, bar);
                bar.appendChild(picker);
            });

            root.insertBefore(bar, child);
        });

        // Bottom Add Section Zone (Elementor-style Dropzone & Importer)
        const isCanvasEmpty = children.filter(c => !c.classList.contains('bongkar-section-insert-bar') && !c.classList.contains('bongkar-bottom-add-zone')).length === 0;
        const bottomZone = document.createElement('div');
        bottomZone.className = 'bongkar-bottom-add-zone' + (isCanvasEmpty ? ' is-empty-canvas' : '');

        let zoneContent = '';
        if (isCanvasEmpty) {
            zoneContent = `
                <div style="font-size: 36px; color: #6366f1; margin-bottom: 8px;"><i class="fa-solid fa-layer-group"></i></div>
                <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">Kanvas Masih Kosong</div>
                <div style="font-size: 13px; color: #64748b; margin-bottom: 20px; max-width: 480px; margin-left: auto; margin-right: auto; line-height: 1.5;">
                    Mulai rancang halaman dengan memilih struktur kolom section di bawah, membuka panel widget, atau impor kode HTML/AI:
                </div>
            `;
        }

        // Elementor-style visual structure selector
        zoneContent += `
            <div class="bongkar-structure-picker-box">
                <div class="bongkar-picker-title"><i class="fa-solid fa-table-columns"></i> ${isCanvasEmpty ? 'Pilih Struktur Kolom Section' : 'Tambah Struktur Kolom Baru'}</div>
                <div class="bongkar-picker-grids">
                    <button type="button" class="btn-picker-layout" data-layout="layout-1col" title="1 Kolom Penuh (100%)">
                        <div class="picker-col-preview col-1"><span></span></div>
                        <span class="picker-col-label">1 Kolom</span>
                    </button>
                    <button type="button" class="btn-picker-layout" data-layout="layout-2col" title="2 Kolom Sejajar (50:50)">
                        <div class="picker-col-preview col-2"><span></span><span></span></div>
                        <span class="picker-col-label">2 Kolom (50:50)</span>
                    </button>
                    <button type="button" class="btn-picker-layout" data-layout="layout-2col-asym-left" title="2 Kolom Asimetris (66:33 Konten + Sidebar)">
                        <div class="picker-col-preview col-2-asym-left"><span></span><span></span></div>
                        <span class="picker-col-label">2 Kolom (66:33)</span>
                    </button>
                    <button type="button" class="btn-picker-layout" data-layout="layout-3col" title="3 Kolom Sejajar (33:33:33)">
                        <div class="picker-col-preview col-3"><span></span><span></span><span></span></div>
                        <span class="picker-col-label">3 Kolom</span>
                    </button>
                    <button type="button" class="btn-picker-layout" data-layout="layout-4col" title="4 Kolom Sejajar (25:25:25:25)">
                        <div class="picker-col-preview col-4"><span></span><span></span><span></span><span></span></div>
                        <span class="picker-col-label">4 Kolom</span>
                    </button>
                </div>
            </div>

            <div class="bongkar-bottom-actions-row">
                <button type="button" class="btn-bottom-add" title="Buka Panel Widget & Section Lengkap">
                    <i class="fa-solid fa-shapes"></i> Buka Panel Widget
                </button>
                <button type="button" class="btn-bottom-paste" title="Tempel Elemen dari Clipboard (Ctrl+V)">
                    <i class="fa-solid fa-paste"></i> Tempel Elemen
                </button>
                <button type="button" class="btn-bottom-import" title="Impor Desain HTML / AI / Figma">
                    <i class="fa-solid fa-wand-magic-sparkles"></i> Impor AI / HTML
                </button>
            </div>
        `;

        bottomZone.innerHTML = zoneContent;

        // Attach click listeners to direct structure picker buttons
        bottomZone.querySelectorAll('.btn-picker-layout').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const layout = btn.getAttribute('data-layout');
                insertDirectLayoutAt(layout, -1, null);
            });
        });

        const addBtn = bottomZone.querySelector('.btn-bottom-add');
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.parent.postMessage({
                    type: 'BONGKAR_REQUEST_ADD_SECTION',
                    insertIndex: -1 // append at end
                }, '*');
            });
        }

        const pasteBtn = bottomZone.querySelector('.btn-bottom-paste');
        if (pasteBtn) {
            pasteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                BongkarClipboard.paste(null);
            });
        }

        const importBtn = bottomZone.querySelector('.btn-bottom-import');
        if (importBtn) {
            importBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.parent.postMessage({
                    type: 'BONGKAR_OPEN_IMPORTER'
                }, '*');
            });
        }

        root.appendChild(bottomZone);
        injectColumnDropzones();
    }

    /**
     * Inject visual dropzones into empty columns
     */
    function injectColumnDropzones() {
        const root = document.getElementById('bongkar-canvas-root') || document.body;
        const columns = root.querySelectorAll('.bongkar-column, section > div > div, .bongkar-section > div > div');

        columns.forEach(col => {
            if (col.closest('.bongkar-bottom-add-zone') || col.closest('.bongkar-section-insert-bar')) return;

            const existingDropzone = col.querySelector('.bongkar-column-dropzone');
            const contentChildren = Array.from(col.children).filter(child => !child.classList.contains('bongkar-column-dropzone'));

            if (contentChildren.length === 0 && col.innerText.trim() === '') {
                if (!existingDropzone) {
                    const dropzone = document.createElement('div');
                    dropzone.className = 'bongkar-column-dropzone';
                    dropzone.innerHTML = `
                        <div class="column-dropzone-inner">
                            <i class="fa-solid fa-circle-plus"></i>
                            <span>Tambah Widget</span>
                        </div>
                    `;
                    dropzone.addEventListener('click', (e) => {
                        e.stopPropagation();
                        selectElement(col);
                        window.parent.postMessage({
                            type: 'BONGKAR_REQUEST_ADD_SECTION',
                            insertIndex: -1,
                            targetInfo: {
                                label: 'Kolom Kosong',
                                tagName: col.tagName,
                                isContainer: true
                            }
                        }, '*');
                    });
                    col.appendChild(dropzone);
                }
            } else {
                if (existingDropzone) {
                    existingDropzone.remove();
                }
            }
        });
    }

    /**
     * Notify parent window that content has changed
     */
    function notifyContentChanged() {
        window.parent.postMessage({
            type: 'BONGKAR_CONTENT_CHANGED',
            html: getCleanHTML(),
            fullDocument: document.documentElement ? document.documentElement.outerHTML : '',
            customScript: window.__currentScriptCode || ''
        }, '*');
    }

    /**
     * Get clean HTML without editor helper classes/elements
     */
    function getCleanHTML() {
        const root = document.getElementById('bongkar-canvas-root') || document.body;
        const clone = root.cloneNode(true);

        // Strip helper UI elements
        clone.querySelectorAll('#bongkar-canvas-badge, #bongkar-floating-toolbar, #bongkar-context-menu, #bongkar-canvas-toast, #bongkar-drop-line-indicator, .bongkar-section-insert-bar, .bongkar-bottom-add-zone, .bongkar-column-dropzone').forEach(el => el.remove());
        clone.querySelectorAll('.bongkar-hover-target, .bongkar-selected-target, [class*="bongkar-type-"], [class*="bongkar-hover-"]').forEach(el => {
            el.classList.remove(
                'bongkar-hover-target', 'bongkar-selected-target',
                'bongkar-type-layout-outer', 'bongkar-type-layout-inner', 'bongkar-type-layout', 'bongkar-type-text', 'bongkar-type-action', 'bongkar-type-media', 'bongkar-type-feed',
                'bongkar-hover-layout-outer', 'bongkar-hover-layout-inner', 'bongkar-hover-layout', 'bongkar-hover-text', 'bongkar-hover-action', 'bongkar-hover-media', 'bongkar-hover-feed'
            );
            if (el.getAttribute('class') === '') el.removeAttribute('class');
        });
        clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));

        return clone.innerHTML.trim();
    }

    /**
     * Canvas Drag & Drop System (Elementor Style Visual Drop Indicator)
     */
    function initCanvasDragAndDrop() {
        let dropIndicator = document.getElementById('bongkar-drop-line-indicator');
        if (!dropIndicator) {
            dropIndicator = document.createElement('div');
            dropIndicator.id = 'bongkar-drop-line-indicator';
            document.body.appendChild(dropIndicator);
        }

        let currentDropTarget = null;
        let currentDropPosition = 'after'; // 'before' | 'after' | 'inside'

        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = 'copy';
            }

            dropIndicator.style.display = 'none';
            const hit = document.elementFromPoint(e.clientX, e.clientY);
            if (!hit) return;

            // Ignore editor chrome & overlays
            if (hit.closest('#bongkar-floating-toolbar') || 
                hit.closest('#bongkar-context-menu') || 
                hit.closest('#bongkar-canvas-toast') ||
                hit.closest('.bongkar-section-insert-bar')) {
                return;
            }

            const root = document.getElementById('bongkar-canvas-root') || document.body;

            // Handle empty column dropzone
            if (hit.classList.contains('bongkar-column-dropzone')) {
                const parentCol = hit.parentElement;
                currentDropTarget = parentCol;
                currentDropPosition = 'inside';
                const rect = hit.getBoundingClientRect();
                dropIndicator.style.top = `${rect.top + window.scrollY + (rect.height / 2)}px`;
                dropIndicator.style.left = `${rect.left + window.scrollX}px`;
                dropIndicator.style.width = `${rect.width}px`;
                dropIndicator.style.display = 'block';
                return;
            }

            let targetEl = hit;
            // Traverse up to find meaningful editable element inside root
            while (targetEl && targetEl.parentElement && targetEl.parentElement !== root && !targetEl.classList.contains('bongkar-column')) {
                if (targetEl.tagName === 'P' || targetEl.tagName.match(/^H[1-6]$/) || targetEl.tagName === 'A' || targetEl.tagName === 'BUTTON' || targetEl.tagName === 'IMG' || targetEl.classList.contains('bongkar-column') || targetEl.classList.contains('bongkar-section') || targetEl.tagName === 'SECTION') {
                    break;
                }
                targetEl = targetEl.parentElement;
            }

            if (!targetEl || targetEl === document.body || targetEl === root) {
                currentDropTarget = null;
                return;
            }

            currentDropTarget = targetEl;
            const rect = targetEl.getBoundingClientRect();
            const relY = e.clientY - rect.top;
            const isTop = relY < (rect.height / 2);

            currentDropPosition = isTop ? 'before' : 'after';
            const topPos = isTop ? (rect.top + window.scrollY) : (rect.bottom + window.scrollY);

            dropIndicator.style.top = `${topPos}px`;
            dropIndicator.style.left = `${rect.left + window.scrollX}px`;
            dropIndicator.style.width = `${Math.max(rect.width, 80)}px`;
            dropIndicator.style.display = 'block';
        });

        document.addEventListener('dragleave', (e) => {
            if (!e.relatedTarget || e.relatedTarget.nodeName === 'HTML') {
                dropIndicator.style.display = 'none';
                currentDropTarget = null;
            }
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            dropIndicator.style.display = 'none';

            let widgetType = '';
            try {
                widgetType = e.dataTransfer.getData('bongkar/widget') || e.dataTransfer.getData('text/plain');
            } catch (err) {}

            if (!widgetType && window.parent && window.parent.__bongkarCurrentDraggedWidget) {
                widgetType = window.parent.__bongkarCurrentDraggedWidget;
            }

            if (!widgetType) return;

            const templates = (window.parent && window.parent.BongkarSectionManager) ? window.parent.BongkarSectionManager.getTemplates() : {};
            const html = templates[widgetType];
            if (!html) return;

            const root = document.getElementById('bongkar-canvas-root') || document.body;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html.trim();
            const newElem = tempDiv.firstElementChild || tempDiv;

            if (currentDropTarget && currentDropTarget.parentNode) {
                if (currentDropPosition === 'inside') {
                    currentDropTarget.querySelectorAll('.bongkar-column-dropzone').forEach(dz => dz.remove());
                    currentDropTarget.appendChild(newElem);
                } else if (currentDropPosition === 'before') {
                    currentDropTarget.parentNode.insertBefore(newElem, currentDropTarget);
                } else {
                    currentDropTarget.parentNode.insertBefore(newElem, currentDropTarget.nextElementSibling);
                }
            } else {
                root.appendChild(newElem);
            }

            selectElement(newElem);
            injectSectionInsertBars();
            injectColumnDropzones();
            notifyContentChanged();
            showCanvasToast('Widget berhasil ditambahkan ke kanvas', 'success');

            if (window.parent && window.parent.BongkarSectionManager) {
                window.parent.BongkarSectionManager.clearPendingTarget();
            }
        });
    }

    /**
     * Notify parent window on initialization
     */
    function notifyParentReady() {
        window.parent.postMessage({
            type: 'BONGKAR_CANVAS_READY',
            html: getCleanHTML(),
            fullDocument: document.documentElement ? document.documentElement.outerHTML : '',
            customScript: window.__currentScriptCode || ''
        }, '*');
    }

    /**
     * Listen for commands from Studio Parent Window
     */
    window.addEventListener('message', (event) => {
        const data = event.data;
        if (!data || !data.type) return;

        switch (data.type) {
            case 'BONGKAR_APPLY_STYLE':
                if (selectedElement) {
                    if (data.property === 'width' && data.value && data.value !== 'auto') {
                        const comp = window.getComputedStyle(selectedElement);
                        if (comp.display === 'inline') {
                            selectedElement.style.display = 'inline-block';
                        }
                        selectedElement.style.maxWidth = '100%';
                        selectedElement.style.boxSizing = 'border-box';
                    }
                    if ((data.property === 'height' || data.property === 'minHeight') && data.value && data.value !== 'auto') {
                        const comp = window.getComputedStyle(selectedElement);
                        if (comp.display === 'inline') {
                            selectedElement.style.display = 'inline-block';
                        }
                        selectedElement.style.boxSizing = 'border-box';
                    }
                    selectedElement.style[data.property] = data.value;
                    if (data.property === 'width' && selectedElement.classList.contains('bongkar-column')) {
                        selectedElement.style.flex = data.value ? `0 0 ${data.value}` : '';
                    }
                    updateFloatingPositions(selectedElement);
                    notifyContentChanged();
                }
                break;

            case 'BONGKAR_UPDATE_COLUMN_PROPORTION':
                if (selectedElement) {
                    applyColumnProportion(selectedElement, data.preset, data.leftPct, data.rightPct);
                    updateFloatingPositions(selectedElement);
                    notifyContentChanged();
                }
                break;

            case 'BONGKAR_SET_FLEX_LAYOUT':
                if (selectedElement) {
                    selectedElement.style.display = 'flex';
                    if (data.direction) {
                        selectedElement.style.flexDirection = data.direction;
                        if (data.direction === 'row') {
                            selectedElement.style.flexWrap = (data.wrap !== undefined) ? (data.wrap ? 'wrap' : 'nowrap') : 'wrap';
                        } else {
                            // Column direction (Atas - Bawah): ensure items stack vertically without multi-column wrap
                            selectedElement.style.flexWrap = data.wrap ? 'wrap' : 'nowrap';
                            Array.from(selectedElement.children).forEach(child => {
                                if (child.style.flex && child.style.flex.startsWith('0 0 ')) {
                                    child.style.flex = '';
                                }
                                if (child.style.width === '50%' || (child.style.width && child.style.width.includes('calc('))) {
                                    child.style.width = '100%';
                                }
                            });
                        }
                    }
                    if (data.gap !== undefined) {
                        selectedElement.style.gap = `${data.gap}px`;
                    }
                    if (data.alignItems) {
                        selectedElement.style.alignItems = data.alignItems;
                    }
                    if (data.justifyContent) {
                        selectedElement.style.justifyContent = data.justifyContent;
                    }
                    if (data.wrap !== undefined) {
                        selectedElement.style.flexWrap = data.wrap ? 'wrap' : 'nowrap';
                    }
                    updateFloatingPositions(selectedElement);
                    notifyContentChanged();
                    sendElementInfoToParent(selectedElement);
                }
                break;

            case 'BONGKAR_UPDATE_TAG':
                if (selectedElement) {
                    const newTag = data.tag.toLowerCase();
                    if (selectedElement.tagName.toLowerCase() !== newTag) {
                        const newElement = document.createElement(newTag);
                        // Copy attributes
                        Array.from(selectedElement.attributes).forEach(attr => {
                            newElement.setAttribute(attr.name, attr.value);
                        });
                        // Copy children / content
                        newElement.innerHTML = selectedElement.innerHTML;
                        selectedElement.parentNode.replaceChild(newElement, selectedElement);
                        selectElement(newElement);
                        notifyContentChanged();
                    }
                }
                break;

            case 'BONGKAR_UPDATE_TEXT':
                if (selectedElement) {
                    selectedElement.innerText = data.text;
                    updateFloatingPositions(selectedElement);
                    notifyContentChanged();
                }
                break;

            case 'BONGKAR_UPDATE_IMAGE':
                if (selectedElement) {
                    let imgEl = selectedElement.tagName === 'IMG' ? selectedElement : selectedElement.querySelector('img');
                    if (imgEl) {
                        if (typeof data.src === 'string') {
                            imgEl.setAttribute('src', data.src);
                            imgEl.src = data.src; // Direct assignment forces immediate browser image reload
                            imgEl.removeAttribute('srcset');
                            imgEl.removeAttribute('sizes');
                            imgEl.removeAttribute('data-src');
                            imgEl.removeAttribute('data-srcset');
                            const pictureParent = imgEl.closest('picture');
                            if (pictureParent) {
                                pictureParent.querySelectorAll('source').forEach(s => s.remove());
                            }
                        }
                        if (data.alt !== undefined) imgEl.setAttribute('alt', data.alt);
                        if (data.fit) imgEl.style.objectFit = data.fit;
                    } else {
                        // Background image on container / div / section
                        if (typeof data.src === 'string') {
                            if (data.src) {
                                selectedElement.style.backgroundImage = `url('${data.src}')`;
                                selectedElement.style.backgroundSize = data.fit || 'cover';
                                selectedElement.style.backgroundPosition = 'center';
                            } else {
                                selectedElement.style.backgroundImage = '';
                            }
                        }
                    }
                    updateFloatingPositions(selectedElement);
                    notifyContentChanged();
                }
                break;

            case 'BONGKAR_TOGGLE_MODAL_EDIT':
                toggleModalEditMode(data.forceState);
                break;

            case 'BONGKAR_UPDATE_LINK':
                if (selectedElement) {
                    if (data.href !== undefined) selectedElement.setAttribute('href', data.href);
                    if (data.target) selectedElement.setAttribute('target', data.target);
                    notifyContentChanged();
                }
                break;

            case 'BONGKAR_UPDATE_VIDEO':
                if (selectedElement) {
                    const videoWrapper = selectedElement.classList.contains('bongkar-video-wrapper') ? selectedElement : selectedElement.closest('.bongkar-video-wrapper');
                    const iframeEl = videoWrapper ? videoWrapper.querySelector('iframe') : (selectedElement.tagName.toLowerCase() === 'iframe' ? selectedElement : null);
                    const html5VideoEl = videoWrapper ? videoWrapper.querySelector('video') : (selectedElement.tagName.toLowerCase() === 'video' ? selectedElement : null);

                    if (data.src) {
                        const isDirectVideo = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(data.src);
                        if (isDirectVideo) {
                            if (html5VideoEl) {
                                html5VideoEl.setAttribute('src', data.src);
                            } else if (videoWrapper) {
                                videoWrapper.innerHTML = `<video src="${data.src}" controls style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; object-fit: cover;"></video>`;
                            }
                        } else {
                            if (iframeEl) {
                                iframeEl.setAttribute('src', data.src);
                            } else if (videoWrapper) {
                                videoWrapper.innerHTML = `<iframe src="${data.src}" title="Video Player" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                            }
                        }
                    }

                    if (videoWrapper && data.ratio) {
                        videoWrapper.setAttribute('data-video-ratio', data.ratio);
                        if (data.ratio === '16:9') videoWrapper.style.paddingBottom = '56.25%';
                        else if (data.ratio === '9:16') videoWrapper.style.paddingBottom = '177.77%';
                        else if (data.ratio === '4:3') videoWrapper.style.paddingBottom = '75%';
                        else if (data.ratio === '1:1') videoWrapper.style.paddingBottom = '100%';
                    }
                    updateFloatingPositions(videoWrapper || selectedElement);
                    notifyContentChanged();
                }
                break;

            case 'BONGKAR_UPDATE_ICON':
                if (selectedElement) {
                    const iconEl = (selectedElement.tagName.toLowerCase() === 'i' || (selectedElement.className && selectedElement.className.match(/fa-[a-z0-9\-]+/i))) ? selectedElement : selectedElement.querySelector('i');
                    if (iconEl && data.iconClass) {
                        iconEl.className = data.iconClass;
                        updateFloatingPositions(iconEl);
                        notifyContentChanged();
                    }
                }
                break;

            case 'BONGKAR_UPDATE_RATING':
                if (selectedElement) {
                    const ratingWrapper = selectedElement.classList.contains('bongkar-rating-widget') ? selectedElement : selectedElement.closest('.bongkar-rating-widget');
                    if (ratingWrapper) {
                        if (data.stars !== undefined) {
                            const starsBox = ratingWrapper.querySelector('div');
                            if (starsBox) {
                                let starsHtml = '';
                                const fullStars = Math.floor(data.stars);
                                const hasHalf = (data.stars - fullStars) >= 0.5;
                                for (let i = 0; i < fullStars; i++) {
                                    starsHtml += '<i class="fa-solid fa-star"></i>';
                                }
                                if (hasHalf) {
                                    starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
                                }
                                const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
                                for (let i = 0; i < emptyStars; i++) {
                                    starsHtml += '<i class="fa-regular fa-star"></i>';
                                }
                                starsBox.innerHTML = starsHtml;
                            }
                        }
                        if (data.label !== undefined) {
                            const labelSpan = ratingWrapper.querySelector('span');
                            if (labelSpan) labelSpan.innerText = data.label;
                        }
                        updateFloatingPositions(ratingWrapper);
                        notifyContentChanged();
                    }
                }
                break;

            case 'BONGKAR_UPDATE_SPACER':
                if (selectedElement) {
                    const spacer = selectedElement.classList.contains('bongkar-spacer') ? selectedElement : selectedElement.closest('.bongkar-spacer');
                    if (spacer && data.height) {
                        spacer.style.height = `${data.height}px`;
                        updateFloatingPositions(spacer);
                        notifyContentChanged();
                    }
                }
                break;

            case 'BONGKAR_UPDATE_FORM_SETTINGS':
                if (selectedElement) {
                    const targetForm = selectedElement.tagName.toLowerCase() === 'form' ? selectedElement : selectedElement.closest('form');
                    if (targetForm) {
                        if (data.waEnabled !== undefined) targetForm.setAttribute('data-bongkar-wa', data.waEnabled ? 'true' : 'false');
                        if (data.waNumber !== undefined) targetForm.setAttribute('data-wa-number', data.waNumber);
                        if (data.waTemplate !== undefined) targetForm.setAttribute('data-wa-template', data.waTemplate);
                        if (data.gsheetEnabled !== undefined) targetForm.setAttribute('data-bongkar-gsheet', data.gsheetEnabled ? 'true' : 'false');
                        if (data.gsheetUrl !== undefined) targetForm.setAttribute('data-gsheet-url', data.gsheetUrl);
                        if (data.successMsg !== undefined) targetForm.setAttribute('data-success-msg', data.successMsg);

                        // If Gsheet webhook is enabled and url provided, update form action
                        if (data.gsheetEnabled && data.gsheetUrl) {
                            targetForm.setAttribute('action', data.gsheetUrl);
                            targetForm.setAttribute('method', 'POST');
                        }

                        // If WA is enabled and number provided, update any WA link or CTA inside form
                        if (data.waEnabled && data.waNumber) {
                            const cleanPhone = data.waNumber.replace(/[^0-9]/g, '');
                            let waHref = 'https://wa.me/' + cleanPhone;
                            if (data.waTemplate) {
                                waHref += '?text=' + encodeURIComponent(data.waTemplate);
                            }
                            const waLinkInside = targetForm.querySelector('a[href*="wa.me"], a[href*="whatsapp.com"], a.btn-whatsapp');
                            if (waLinkInside) {
                                waLinkInside.setAttribute('href', waHref);
                            }
                        }
                        notifyContentChanged();
                    } else if (selectedElement.tagName.toLowerCase() === 'a' || selectedElement.tagName.toLowerCase() === 'button' || selectedElement.classList.contains('btn') || selectedElement.classList.contains('button')) {
                        // Direct CTA link or button
                        if (data.waEnabled !== undefined) selectedElement.setAttribute('data-bongkar-wa', data.waEnabled ? 'true' : 'false');
                        if (data.waNumber !== undefined) selectedElement.setAttribute('data-wa-number', data.waNumber);
                        if (data.waTemplate !== undefined) selectedElement.setAttribute('data-wa-template', data.waTemplate);
                        if (data.gsheetEnabled !== undefined) selectedElement.setAttribute('data-bongkar-gsheet', data.gsheetEnabled ? 'true' : 'false');
                        if (data.gsheetUrl !== undefined) selectedElement.setAttribute('data-gsheet-url', data.gsheetUrl);
                        if (data.successMsg !== undefined) selectedElement.setAttribute('data-success-msg', data.successMsg);

                        if (data.waEnabled && data.waNumber && selectedElement.tagName.toLowerCase() === 'a') {
                            const cleanPhone = data.waNumber.replace(/[^0-9]/g, '');
                            let waHref = 'https://wa.me/' + cleanPhone;
                            if (data.waTemplate) {
                                waHref += '?text=' + encodeURIComponent(data.waTemplate);
                            }
                            selectedElement.setAttribute('href', waHref);
                        }
                        notifyContentChanged();
                    }
                }
                break;

            case 'BONGKAR_UPDATE_EMBED_HTML':
                if (selectedElement) {
                    const targetEmbed = selectedElement.hasAttribute('data-bongkar-embed') ? selectedElement : selectedElement.closest('[data-bongkar-embed="true"]');
                    if (targetEmbed) {
                        targetEmbed.innerHTML = data.html;
                        notifyContentChanged();
                        updateFloatingPositions(targetEmbed);
                    }
                }
                break;

            case 'BONGKAR_UPDATE_POST_GRID':
                if (selectedElement) {
                    const targetGrid = selectedElement.classList.contains('bongkar-dynamic-posts-grid') ? selectedElement : selectedElement.closest('.bongkar-dynamic-posts-grid');
                    if (targetGrid) {
                        targetGrid.setAttribute('data-post-filter', data.filter || 'recent');
                        targetGrid.setAttribute('data-category-id', data.category || '0');
                        targetGrid.setAttribute('data-post-count', data.count || '6');
                        targetGrid.setAttribute('data-post-cols', data.cols || '3');
                        targetGrid.setAttribute('data-post-ids', data.postIds || '');
                        targetGrid.style.gridTemplateColumns = `repeat(${data.cols || 3}, minmax(0, 1fr))`;

                        // Refresh dynamic live preview via AJAX
                        if (window.parent && window.parent.bongkarStudioConfig) {
                            const cfg = window.parent.bongkarStudioConfig;
                            const fd = new FormData();
                            fd.append('action', 'bongkar_builder_get_posts');
                            fd.append('nonce', cfg.nonce);
                            fd.append('filter_type', data.filter || 'recent');
                            fd.append('category_id', data.category || '0');
                            fd.append('count', data.count || '6');
                            fd.append('post_ids', data.postIds || '');

                            fetch(cfg.ajaxUrl, { method: 'POST', body: fd })
                                .then(res => res.json())
                                .then(resData => {
                                    if (resData.success && resData.data.posts && resData.data.posts.length > 0) {
                                        let cardsHtml = '';
                                        resData.data.posts.forEach(p => {
                                            cardsHtml += `
                                        <article class="bongkar-blog-card">
                                            <div class="bongkar-blog-thumb-wrap">
                                                <a href="${p.permalink}" tabindex="-1" aria-hidden="true">
                                                    <img src="${p.thumbnail_url}" alt="${p.title}" class="bongkar-blog-thumb" loading="lazy" />
                                                </a>
                                                <span class="bongkar-blog-cat-badge">${p.category}</span>
                                            </div>
                                            <div class="bongkar-blog-content">
                                                <div class="bongkar-blog-meta">
                                                    <span><i class="fa-regular fa-calendar"></i> ${p.date}</span>
                                                    <span><i class="fa-regular fa-user"></i> ${p.author}</span>
                                                </div>
                                                <h3 class="bongkar-blog-title">
                                                    <a href="${p.permalink}">${p.title}</a>
                                                </h3>
                                                <p class="bongkar-blog-excerpt">${p.excerpt}</p>
                                                <a href="${p.permalink}" class="bongkar-blog-readmore">
                                                    Baca Selengkapnya <i class="fa-solid fa-arrow-right"></i>
                                                </a>
                                            </div>
                                        </article>`;
                                        });
                                        targetGrid.innerHTML = cardsHtml;
                                    }
                                    notifyContentChanged();
                                    updateFloatingPositions(targetGrid);
                                })
                                .catch(() => {
                                    notifyContentChanged();
                                    updateFloatingPositions(targetGrid);
                                });
                        } else {
                            notifyContentChanged();
                            updateFloatingPositions(targetGrid);
                        }
                    }
                }
                break;

            case 'BONGKAR_INSERT_HTML': {
                const root = document.getElementById('bongkar-canvas-root') || document.body;
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = data.html.trim();
                const newElem = tempDiv.firstElementChild || tempDiv;
                const isNewSection = newElem.tagName === 'SECTION' || newElem.classList.contains('bongkar-section');

                let inserted = false;
                let target = selectedElement;

                // Validate target is still in DOM
                if (target && !root.contains(target)) {
                    target = null;
                }

                // 1. If explicit insertIndex is provided, prioritize requested position
                if (typeof data.insertIndex === 'number' && data.insertIndex >= 0) {
                    const children = Array.from(root.children).filter(el => !el.classList.contains('bongkar-section-insert-bar') && !el.classList.contains('bongkar-bottom-add-zone') && !el.id.startsWith('bongkar-'));
                    if (children[data.insertIndex]) {
                        root.insertBefore(newElem, children[data.insertIndex]);
                        inserted = true;
                    }
                }

                // 2. Smart Contextual Insertion
                if (!inserted && target && !isNewSection) {
                    if (isContainerElement(target)) {
                        // Remove empty dropzone inside this container if any
                        target.querySelectorAll('.bongkar-column-dropzone').forEach(dz => dz.remove());
                        target.appendChild(newElem);
                        inserted = true;
                    } else if (target.parentNode) {
                        // Leaf element: insert immediately after it
                        target.parentNode.insertBefore(newElem, target.nextElementSibling);
                        inserted = true;
                    }
                } else if (!inserted && target && isNewSection) {
                    // Inserting a whole section: insert directly at the clicked section (in-place bypass)
                    const closestSec = target.closest('.bongkar-section, section') || (target.parentElement === root ? target : null);
                    if (closestSec && closestSec.parentNode) {
                        closestSec.parentNode.insertBefore(newElem, closestSec);
                        inserted = true;
                    }
                }

                // 3. Fallback to bottom zone
                if (!inserted) {
                    const bottomZone = root.querySelector('.bongkar-bottom-add-zone');
                    if (bottomZone) {
                        root.insertBefore(newElem, bottomZone);
                    } else {
                        root.appendChild(newElem);
                    }
                }
                injectSectionInsertBars();
                injectColumnDropzones();
                selectElement(newElem);
                notifyContentChanged();
                break;
            }

            case 'BONGKAR_SET_INTERACTION_MODE':
                isInteractiveMode = (data.mode === 'interactive');
                if (isInteractiveMode) {
                    deselectElement();
                    document.body.classList.add('bongkar-interactive-mode-active');
                } else {
                    document.body.classList.remove('bongkar-interactive-mode-active');
                }
                break;

            case 'BONGKAR_REPLACE_ENTIRE_HTML':
                const canvasRoot = document.getElementById('bongkar-canvas-root') || document.body;
                canvasRoot.innerHTML = data.html;
                injectSectionInsertBars();
                deselectElement();
                notifyContentChanged();
                if (typeof window.__runBongkarAlgorithms === 'function') {
                    setTimeout(() => {
                        window.__runBongkarAlgorithms();
                    }, 100);
                }
                break;

            case 'BONGKAR_UPDATE_PAGE_CSS':
                let cssTag = document.getElementById('bongkar-page-css');
                if (!cssTag) {
                    cssTag = document.createElement('style');
                    cssTag.id = 'bongkar-page-css';
                    document.head.appendChild(cssTag);
                }
                cssTag.textContent = data.css;
                if (selectedElement) updateFloatingPositions(selectedElement);
                break;

            case 'BONGKAR_UPDATE_GOOGLE_FONTS_LINK':
                let fontLink = document.getElementById('bongkar-google-fonts-link');
                if (!fontLink) {
                    fontLink = document.createElement('link');
                    fontLink.id = 'bongkar-google-fonts-link';
                    fontLink.rel = 'stylesheet';
                    document.head.appendChild(fontLink);
                }
                fontLink.href = data.url;
                break;

            case 'BONGKAR_SELECT_PARENT':
                if (selectedElement && selectedElement.parentElement && selectedElement.parentElement.id !== 'bongkar-canvas-root' && selectedElement.parentElement.tagName !== 'BODY') {
                    selectElement(selectedElement.parentElement);
                }
                break;

            case 'BONGKAR_SELECT_ANCESTOR':
                if (window.__bongkarCurrentAncestors && typeof data.ancestorIndex === 'number') {
                    const targetAncestor = window.__bongkarCurrentAncestors[data.ancestorIndex];
                    if (targetAncestor && targetAncestor.id !== 'bongkar-canvas-root' && targetAncestor.tagName !== 'BODY') {
                        selectElement(targetAncestor);
                    }
                }
                break;

            case 'BONGKAR_WRAP_ELEMENT':
                if (selectedElement) {
                    wrapElementInContainer(selectedElement);
                }
                break;

            case 'BONGKAR_APPLY_CHILD_PROPORTIONS':
                if (selectedElement) {
                    applyMasterChildProportions(selectedElement, data.preset);
                }
                break;

            case 'BONGKAR_RERUN_SCRIPTS':
                if (typeof window.__runBongkarAlgorithms === 'function') {
                    window.__runBongkarAlgorithms(data.code);
                }
                break;

            case 'BONGKAR_HIGHLIGHT_ELEMENT':
                const rootEl = document.getElementById('bongkar-canvas-root') || document.body;
                let target = null;
                if (data.selector) {
                    try {
                        target = rootEl.querySelector(data.selector);
                    } catch (e) {
                        console.warn('[Bongkar] Invalid selector:', data.selector);
                    }
                }
                if (target) {
                    document.querySelectorAll('.bongkar-algo-glow-target').forEach(el => el.classList.remove('bongkar-algo-glow-target'));
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    target.classList.add('bongkar-algo-glow-target');
                    selectElement(target, data.focusField || null);
                    setTimeout(() => {
                        target.classList.remove('bongkar-algo-glow-target');
                    }, 3600);
                }
                break;

            case 'BONGKAR_SHORTCUT': {
                const target = selectedElement || hoveredElement;
                if (data.action === 'copy') {
                    if (target) {
                        selectElement(target);
                        BongkarClipboard.copy(target);
                    } else {
                        showCanvasToast('Arahkan mouse atau klik elemen yang ingin disalin.', 'warning');
                    }
                } else if (data.action === 'cut') {
                    if (target) {
                        selectElement(target);
                        BongkarClipboard.cut(target);
                    } else {
                        showCanvasToast('Arahkan mouse atau klik elemen yang ingin dipotong.', 'warning');
                    }
                } else if (data.action === 'paste') {
                    BongkarClipboard.paste(target, data.clipboardText);
                } else if (data.action === 'duplicate') {
                    if (target) {
                        selectElement(target);
                        BongkarClipboard.duplicate(target);
                    }
                } else if (data.action === 'delete') {
                    if (target && confirm(`Hapus elemen "${getFriendlyElementLabel(target)}"?`)) {
                        target.remove();
                        deselectElement();
                        injectSectionInsertBars();
                        injectColumnDropzones();
                        notifyContentChanged();
                        showCanvasToast('Elemen berhasil dihapus', 'info');
                    }
                }
                break;
            }

            case 'BONGKAR_TRIGGER_CONTEXT_MENU': {
                const clientX = data.clientX || (window.innerWidth / 2);
                const clientY = data.clientY || 150;
                showContextMenu(clientX, clientY, selectedElement || hoveredElement || null);
                break;
            }

            case 'BONGKAR_INJECT_ASSETS':
                if (data.styles && Array.isArray(data.styles)) {
                    data.styles.forEach(href => {
                        if (!document.querySelector(`link[href="${href}"]`)) {
                            const link = document.createElement('link');
                            link.rel = 'stylesheet';
                            link.href = href;
                            document.head.appendChild(link);
                        }
                    });
                }
                if (data.scripts && Array.isArray(data.scripts)) {
                    data.scripts.forEach(src => {
                        if (!document.querySelector(`script[src="${src}"]`)) {
                            const s = document.createElement('script');
                            s.src = src;
                            document.body.appendChild(s);
                        }
                    });
                }
                break;
        }
    });

    // Start on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
