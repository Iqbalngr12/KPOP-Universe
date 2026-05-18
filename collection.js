// ============================================================
// COLLECTION.JS — Favorites, Wishlist, Collection Progress
// ============================================================

let myCollection = JSON.parse(localStorage.getItem('myCollection')) || [];
let myFavorites = JSON.parse(localStorage.getItem('myFavorites')) || [];
let myWishlist = JSON.parse(localStorage.getItem('myWishlist')) || [];

// ============================================================
// FAVORITES
// ============================================================

function toggleFavorite(id_unique) {
    const item = myCollection.find(c => c.id_unique == id_unique) ||
        pcData.find(p => p.id_unique == id_unique) ||
        myFavorites.find(f => f.id_unique == id_unique);
    if (!item) return;

    const idx = myFavorites.findIndex(f => f.id_unique == id_unique);
    if (idx === -1) {
        myFavorites.push(item);
        showToast(`❤️ ${item.member} ditambahkan ke Favorites!`);
    } else {
        myFavorites.splice(idx, 1);
        showToast(`💔 ${item.member} dihapus dari Favorites`);
    }

    localStorage.setItem('myFavorites', JSON.stringify(myFavorites));

    if (currentSection === 'favorite') {
        filteredData = [...myFavorites];
        const maxPage = Math.ceil(filteredData.length / cardsPerPage);
        if (currentPage > maxPage && currentPage > 1) currentPage = maxPage;
        updateDisplay();
    } else {
        updateDisplay();
    }
}

// ============================================================
// WISHLIST
// ============================================================

function isWishlisted(id_unique) {
    return myWishlist.some(w => w.id_unique === id_unique);
}

function toggleWishlist(id_unique) {
    const item = pcData.find(p => p.id_unique === id_unique) ||
        myCollection.find(c => c.id_unique === id_unique) ||
        myFavorites.find(f => f.id_unique === id_unique);
    if (!item) return;

    const idx = myWishlist.findIndex(w => w.id_unique === id_unique);
    if (idx === -1) {
        myWishlist.push(item);
        showToast(`💝 ${item.member} ditambahkan ke Wishlist!`);
    } else {
        myWishlist.splice(idx, 1);
        showToast(`🤍 ${item.member} dihapus dari Wishlist`);
    }

    localStorage.setItem('myWishlist', JSON.stringify(myWishlist));

    if (currentSection === 'wishlist') {
        filteredData = [...myWishlist];
        const maxPage = Math.ceil(filteredData.length / cardsPerPage);
        if (currentPage > maxPage && currentPage > 1) currentPage = maxPage;
        updateDisplay();
    } else {
        updateDisplay();
    }
}

// ============================================================
// COLLECTION PROGRESS
// ============================================================

function injectProgressUI() {
    if (document.getElementById('collection-progress-panel')) return;

    const container = document.getElementById('pc-container');
    if (!container) return;

    const ownedKeys = new Set(myCollection.map(c => `${c.group}|${c.member}|${c.style}`));

    // Progress per grup
    const groups = {};
    pcData.forEach(card => {
        if (!groups[card.group]) groups[card.group] = { total: 0, owned: 0, logo: card.logo };
        groups[card.group].total++;
        if (ownedKeys.has(`${card.group}|${card.member}|${card.style}`)) groups[card.group].owned++;
    });

    // Progress per rarity
    const rarities = ["COMMON", "UNCOMMON", "RARE", "SUPER RARE", "ULTRA RARE", "LIMITED", "SECRET"];
    const rarityColors = {
        "COMMON": "#888",
        "UNCOMMON": "#2ecc71",
        "RARE": "#00f2ff",
        "SUPER RARE": "#d0cd1e",
        "ULTRA RARE": "#b70404",
        "LIMITED": "#c906bf",
        "SECRET": "#ff007a"
    };

    const rarityProgress = {};
    rarities.forEach(r => {
        const total = pcData.filter(c => c.rarity === r).length;
        const owned = new Set(myCollection.filter(c => c.rarity === r).map(c => `${c.group}|${c.member}|${c.style}`)).size;
        rarityProgress[r] = { total, owned: Math.min(owned, total) };
    });

    // Build rarity rows — pakai fungsi terpisah supaya Prettier ga rusak
    const rarityRows = buildRarityRows(rarities, rarityProgress, rarityColors);
    const groupCards = buildGroupCards(groups);

    const panel = document.createElement('div');
    panel.id = 'collection-progress-panel';
    panel.className = 'collection-progress-panel';

    // Header toggle
    const toggleBtn = document.createElement('div');
    toggleBtn.className = 'progress-toggle-btn';
    toggleBtn.setAttribute('onclick', 'toggleProgressPanel()');
    toggleBtn.innerHTML =
        '📊 Collection Progress — ' + ownedKeys.size + ' unique cards' +
        '<span class="progress-toggle-icon" id="progress-toggle-icon">▼</span>';

    // Body
    const body = document.createElement('div');
    body.className = 'progress-panel-body';
    body.id = 'progress-panel-body';
    body.innerHTML =
        '<h4 class="progress-subheading">By Rarity</h4>' +
        '<div class="rarity-progress-grid">' + rarityRows + '</div>' +
        '<h4 class="progress-subheading" style="margin-top:20px;">By Group</h4>' +
        '<div class="group-progress-grid">' + groupCards + '</div>';

    panel.appendChild(toggleBtn);
    panel.appendChild(body);

    container.parentNode.insertBefore(panel, container);
}

// Helper: build rarity rows pakai string concat — aman dari Prettier
function buildRarityRows(rarities, rarityProgress, rarityColors) {
    let html = '';
    rarities.forEach(function(r) {
        const total = rarityProgress[r].total;
        const owned = rarityProgress[r].owned;
        const pct = total > 0 ? Math.round((owned / total) * 100) : 0;
        html += '<div class="rarity-progress-item">';
        html += '<div class="rarity-progress-label">';
        html += '<span style="color:' + rarityColors[r] + '">' + r + '</span>';
        html += '<span>' + owned + '/' + total + ' (' + pct + '%)</span>';
        html += '</div>';
        html += '<div class="progress-bar-bg">';
        html += '<div class="progress-bar-fill" style="width:' + pct + '%; background:' + rarityColors[r] + ';"></div>';
        html += '</div>';
        html += '</div>';
    });
    return html;
}

// Helper: build group cards pakai string concat — aman dari Prettier
function buildGroupCards(groups) {
    let html = '';
    Object.entries(groups).forEach(function(entry) {
        const grp = entry[0];
        const data = entry[1];
        const pct = data.total > 0 ? Math.round((data.owned / data.total) * 100) : 0;
        html += '<div class="group-progress-card">';
        html += '<div class="group-progress-header">';
        html += '<img src="' + data.logo + '" alt="' + grp + '" class="group-logo-sm">';
        html += '<span class="group-progress-name">' + grp + '</span>';
        html += '<span class="group-progress-pct">' + pct + '%</span>';
        html += '</div>';
        html += '<div class="progress-bar-bg">';
        html += '<div class="progress-bar-fill" style="width:' + pct + '%; background:linear-gradient(90deg, var(--primary), var(--secondary));"></div>';
        html += '</div>';
        html += '<div class="group-progress-count">' + data.owned + ' / ' + data.total + ' cards</div>';
        html += '</div>';
    });
    return html;
}

function toggleProgressPanel() {
    const body = document.getElementById('progress-panel-body');
    const icon = document.getElementById('progress-toggle-icon');
    if (!body) return;
    const isOpen = body.style.display !== 'none';
    body.style.display = isOpen ? 'none' : 'block';
    icon.textContent = isOpen ? '▶' : '▼';
}

// ============================================================
// TOAST NOTIFICATION
// ============================================================

function showToast(msg) {
    const existing = document.querySelector('.kpcu-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'kpcu-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// ============================================================
// INJECT TOMBOL WISHLIST KE NAV
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.main-nav');
    if (nav && !document.querySelector('[onclick*="wishlist"]')) {
        const wishBtn = document.createElement('button');
        wishBtn.className = 'filter-btn';
        wishBtn.setAttribute('onclick', "showSection('wishlist')");
        wishBtn.textContent = 'Wishlist';
        nav.appendChild(wishBtn);
    }
});