/**
 * Font Awesome 6 Icon Picker Module
 * Clean vector icons, search, category filter, instant insert/replace
 */

window.BongkarIconPicker = (function () {
    let customSelectCallback = null;

    const iconsList = [
        // Brand / Social
        { class: 'fa-brands fa-whatsapp', name: 'whatsapp social chat' },
        { class: 'fa-brands fa-instagram', name: 'instagram social photo' },
        { class: 'fa-brands fa-facebook', name: 'facebook social' },
        { class: 'fa-brands fa-tiktok', name: 'tiktok video social' },
        { class: 'fa-brands fa-youtube', name: 'youtube video play' },
        { class: 'fa-brands fa-twitter', name: 'twitter x social' },
        { class: 'fa-brands fa-telegram', name: 'telegram chat messenger' },
        { class: 'fa-brands fa-linkedin', name: 'linkedin job professional' },
        { class: 'fa-brands fa-google', name: 'google search' },
        { class: 'fa-brands fa-apple', name: 'apple mac ios' },

        // Contact & Location
        { class: 'fa-solid fa-phone', name: 'phone call telephone' },
        { class: 'fa-solid fa-phone-volume', name: 'phone ring call' },
        { class: 'fa-solid fa-envelope', name: 'envelope mail email message' },
        { class: 'fa-solid fa-location-dot', name: 'location map pin gps address' },
        { class: 'fa-solid fa-map-location-dot', name: 'map navigation directions' },
        { class: 'fa-solid fa-comment-dots', name: 'chat message talk' },
        { class: 'fa-solid fa-headset', name: 'headset support call center cs' },

        // Actions & UI
        { class: 'fa-solid fa-check', name: 'check verify ok yes' },
        { class: 'fa-solid fa-circle-check', name: 'check circle verified ok' },
        { class: 'fa-solid fa-star', name: 'star rating favorite review' },
        { class: 'fa-solid fa-arrow-right', name: 'arrow right next continue' },
        { class: 'fa-solid fa-arrow-left', name: 'arrow left back' },
        { class: 'fa-solid fa-chevron-right', name: 'chevron right next' },
        { class: 'fa-solid fa-magnifying-glass', name: 'search find' },
        { class: 'fa-solid fa-house', name: 'home house building property' },
        { class: 'fa-solid fa-user', name: 'user profile person account' },
        { class: 'fa-solid fa-users', name: 'users team community' },
        { class: 'fa-solid fa-shield-halved', name: 'shield security secure protection' },
        { class: 'fa-solid fa-lock', name: 'lock password secure' },
        { class: 'fa-solid fa-clock', name: 'clock time hour watch' },
        { class: 'fa-solid fa-calendar-days', name: 'calendar schedule date' },

        // Business & Features
        { class: 'fa-solid fa-bolt', name: 'bolt lightning fast speed quick' },
        { class: 'fa-solid fa-fire', name: 'fire hot trending popular' },
        { class: 'fa-solid fa-rocket', name: 'rocket launch fast growth' },
        { class: 'fa-solid fa-award', name: 'award prize trophy ribbon' },
        { class: 'fa-solid fa-crown', name: 'crown vip premium king' },
        { class: 'fa-solid fa-medal', name: 'medal badge winner' },
        { class: 'fa-solid fa-heart', name: 'heart like love' },
        { class: 'fa-solid fa-thumbs-up', name: 'thumbs up like good approve' },
        { class: 'fa-solid fa-certificate', name: 'certificate guarantee badge' },
        { class: 'fa-solid fa-handshake', name: 'handshake deal partnership deal' },
        { class: 'fa-solid fa-chart-line', name: 'chart analytics growth graph' },
        { class: 'fa-solid fa-gem', name: 'gem diamond luxury crystal' },
        { class: 'fa-solid fa-bullhorn', name: 'bullhorn announcement promo megaphone' },
        { class: 'fa-solid fa-lightbulb', name: 'lightbulb idea solution innovation' },
        { class: 'fa-solid fa-gift', name: 'gift present promo bonus' },
        { class: 'fa-solid fa-wand-magic-sparkles', name: 'magic sparkles ai clean' },
        { class: 'fa-solid fa-circle-question', name: 'question faq help info' },

        // Commerce & Real Estate
        { class: 'fa-solid fa-cart-shopping', name: 'cart buy shop store ecommerce' },
        { class: 'fa-solid fa-bag-shopping', name: 'bag shopping buy' },
        { class: 'fa-solid fa-tag', name: 'tag price discount' },
        { class: 'fa-solid fa-tags', name: 'tags pricing plans' },
        { class: 'fa-solid fa-credit-card', name: 'credit card payment checkout' },
        { class: 'fa-solid fa-money-bill-wave', name: 'money cash payment bill' },
        { class: 'fa-solid fa-building', name: 'building apartment office property' },
        { class: 'fa-solid fa-car', name: 'car vehicle garage transport' },
        { class: 'fa-solid fa-key', name: 'key access room house property' },
        { class: 'fa-solid fa-bath', name: 'bath bathroom plumbing' },
        { class: 'fa-solid fa-bed', name: 'bed bedroom sleep room' },
    ];

    function init() {
        const gridContainer = document.getElementById('sidebar-icon-grid');
        const searchInput = document.getElementById('icon-search-input');

        if (!gridContainer) return;

        renderIcons(iconsList, gridContainer);

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                const filtered = iconsList.filter(item => item.name.includes(query) || item.class.includes(query));
                renderIcons(filtered, gridContainer);
            });
        }
    }

    function renderIcons(list, container) {
        container.innerHTML = '';
        if (list.length === 0) {
            container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 20px;">Ikon tidak ditemukan</div>`;
            return;
        }

        list.forEach(item => {
            const card = document.createElement('div');
            card.className = 'icon-item';
            const shortName = item.class.split('fa-').pop();
            card.innerHTML = `<i class="${item.class}"></i><span>${shortName}</span>`;

            card.addEventListener('click', () => {
                onIconSelected(item.class);
            });

            container.appendChild(card);
        });
    }

    function openPickerForCallback(callback) {
        customSelectCallback = callback;
        const iconTabBtn = document.querySelector('.sidebar-tab-btn[data-tab="icons"]');
        if (iconTabBtn) iconTabBtn.click();
        const searchInput = document.getElementById('icon-search-input');
        if (searchInput) {
            setTimeout(() => {
                searchInput.focus();
                searchInput.select();
            }, 100);
        }
    }

    function onIconSelected(iconClass) {
        // 1. If opened via callback (e.g. Inspector "Ganti Icon...")
        if (typeof customSelectCallback === 'function') {
            const cb = customSelectCallback;
            customSelectCallback = null;
            cb(iconClass);
            const inspectorTabBtn = document.querySelector('.sidebar-tab-btn[data-tab="inspector"]');
            if (inspectorTabBtn) inspectorTabBtn.click();
            return;
        }

        const iframe = document.getElementById('bongkar-iframe-canvas');
        if (!iframe || !iframe.contentWindow) return;

        // 2. Check if selected element in canvas is currently an icon
        const currentData = window.BongkarInspector && window.BongkarInspector.getCurrentElementData ? window.BongkarInspector.getCurrentElementData() : null;

        if (currentData && currentData.isIcon) {
            iframe.contentWindow.postMessage({
                type: 'BONGKAR_UPDATE_ICON',
                iconClass: iconClass
            }, '*');
        } else {
            // 3. Otherwise insert new icon element
            iframe.contentWindow.postMessage({
                type: 'BONGKAR_INSERT_HTML',
                html: `<i class="${iconClass}" style="font-size: 28px; color: #f59e0b; margin: 8px;"></i>`
            }, '*');
        }

        // Switch back to Inspector tab
        const inspectorTabBtn = document.querySelector('.sidebar-tab-btn[data-tab="inspector"]');
        if (inspectorTabBtn) inspectorTabBtn.click();
    }

    return {
        init: init,
        openPickerForCallback: openPickerForCallback,
        iconsList: iconsList
    };
})();
