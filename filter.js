let currentActiveFilter = 'all';
let currentGroupFilter = 'all';
let suggestionActive = -1;
let suggestionItems = [];

const searchInput = document.getElementById('search-input');
const searchClear = document.getElementById('search-clear');
const searchSuggestions = document.getElementById('search-suggestions');
const searchChips = document.getElementById('search-chips');
const searchMeta = document.getElementById('search-meta');
const searchWrapper = document.querySelector('.search-wrapper');

const rarityColors = {
    'SECRET': '#ff007a',
    'LIMITED': '#d0cd1e',
    'ULTRA RARE': '#00f2ff',
    'SUPER RARE': '#c906bf',
    'RARE': '#7c5cfc',
    'UNCOMMON': '#3bba7c',
    'COMMON': 'rgba(255,255,255,0.35)'
};

function getSuggestions(query) {
    if (!query || query.length < 1) return null;
    const q = query.toLowerCase();

    const seenMembers = new Set();
    const seenGroups = new Set();
    const matchedMembers = [];
    const matchedGroups = [];

    pcData.forEach(card => {
        const memberKey = card.member + '|' + card.group;
        if (!seenMembers.has(memberKey) && card.member.toLowerCase().includes(q)) {
            seenMembers.add(memberKey);
            const count = pcData.filter(c => c.member === card.member && c.group === card.group).length;
            matchedMembers.push({...card, count });
        }
        if (!seenGroups.has(card.group) && card.group.toLowerCase().includes(q)) {
            seenGroups.add(card.group);
            const count = pcData.filter(c => c.group === card.group).length;
            matchedGroups.push({ group: card.group, logo: card.logo, agency: card.agency, count });
        }
    });

    return {
        members: matchedMembers.slice(0, 5),
        groups: matchedGroups.slice(0, 4)
    };
}

function highlight(text, query) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
}

function renderSuggestions(query) {
    suggestionItems = [];
    if (!query || query.trim().length === 0) {
        closeSuggestions();
        return;
    }

    const results = getSuggestions(query.trim());
    const hasResults = results && (results.members.length > 0 || results.groups.length > 0);

    if (!hasResults) {
        searchSuggestions.innerHTML = `<div class="suggestion-empty">✦ Tidak ada hasil untuk "<em>${query}</em>"</div>`;
        searchSuggestions.classList.add('open');
        searchWrapper.classList.remove('no-dropdown');
        return;
    }

    let html = '';

    if (results.groups.length > 0) {
        html += `<div class="suggestion-section-label">✦ Grup</div>`;
        results.groups.forEach((g, i) => {
            html += `
            <div class="suggestion-item" data-index="${suggestionItems.length}" onclick="selectSuggestion('group','${g.group}')">
                <div class="suggestion-item-icon">
                    <img src="${g.logo}" alt="${g.group}" onerror="this.parentElement.textContent='🎤'">
                </div>
                <div class="suggestion-item-text">
                    <div class="suggestion-item-name">${highlight(g.group, query)}</div>
                    <div class="suggestion-item-sub">${g.agency}</div>
                </div>
                <span class="suggestion-count">${g.count} cards</span>
            </div>`;
            suggestionItems.push({ type: 'group', value: g.group });
        });
    }

    if (results.members.length > 0) {
        html += `<div class="suggestion-section-label">✦ Member</div>`;
        results.members.forEach((m, i) => {
            const rarityColor = rarityColors[m.rarity] || 'rgba(255,255,255,0.35)';
            html += `
            <div class="suggestion-item" data-index="${suggestionItems.length}" onclick="selectSuggestion('member','${m.member}','${m.group}')">
                <div class="suggestion-item-icon">
                    <img src="${m.image}" alt="${m.member}" onerror="this.parentElement.textContent='⭐'">
                </div>
                <div class="suggestion-item-text">
                    <div class="suggestion-item-name">${highlight(m.member, query)}</div>
                    <div class="suggestion-item-sub">${m.group}</div>
                </div>
                <span class="suggestion-item-badge" style="background:${rarityColor}22;color:${rarityColor};border:1px solid ${rarityColor}55">${m.rarity}</span>
            </div>`;
            suggestionItems.push({ type: 'member', value: m.member, group: m.group });
        });
    }

    searchSuggestions.innerHTML = html;
    searchSuggestions.classList.add('open');
    searchWrapper.classList.remove('no-dropdown');
    suggestionActive = -1;
}

function closeSuggestions() {
    searchSuggestions.classList.remove('open');
    searchSuggestions.innerHTML = '';
    searchWrapper.classList.add('no-dropdown');
    suggestionActive = -1;
    suggestionItems = [];
}

function selectSuggestion(type, value, group) {
    if (type === 'group') {
        searchInput.value = value;
        currentSearchKeyword = value.toLowerCase();
    } else {
        searchInput.value = group ? `${value} (${group})` : value;
        currentSearchKeyword = value.toLowerCase();
    }
    updateClearBtn();
    closeSuggestions();
    updateChips();
    applyCurrentFilter();
    searchInput.blur();
}

function updateClearBtn() {
    const hasValue = searchInput.value.length > 0;
    searchClear.classList.toggle('visible', hasValue);
}

searchClear.addEventListener('click', () => {
    clearSearch();
    searchInput.focus();
});

function updateChips() {
    const kw = searchInput.value.trim();
    searchChips.innerHTML = '';
    if (!kw) return;

    const chip = document.createElement('div');
    chip.className = 'search-chip';
    const memberMatch = kw.match(/^(.+)\s\((.+)\)$/);
    if (memberMatch) {
        chip.innerHTML = `⭐ <strong>${memberMatch[1]}</strong> <span style="opacity:0.5">· ${memberMatch[2]}</span>
            <button class="search-chip-remove" onclick="clearSearch()" title="Hapus filter">✕</button>`;
    } else {
        chip.innerHTML = `🔍 <strong>${kw}</strong>
            <button class="search-chip-remove" onclick="clearSearch()" title="Hapus filter">✕</button>`;
    }
    searchChips.appendChild(chip);
}

function clearSearch() {
    searchInput.value = '';
    currentSearchKeyword = '';
    updateClearBtn();
    closeSuggestions();
    updateChips();
    updateMeta(null);

    if (currentSection === 'collection') {
        filteredData = [...myCollection];
        updateDisplay();
    } else if (currentSection === 'favorite') {
        filteredData = [...myFavorites];
        updateDisplay();
    } else if (currentSection === 'wishlist') {
        filteredData = [...myWishlist];
        updateDisplay();
    } else {
        resetAgencyFilter();
        applyCurrentFilter();
    }
}

function updateMeta(count) {
    if (count === null || searchInput.value.trim() === '') {
        searchMeta.innerHTML = '';
        return;
    }
    const kw = searchInput.value.trim();
    if (count === 0) {
        searchMeta.innerHTML = `Tidak ada hasil untuk "<span class="meta-highlight">${kw}</span>" <span class="meta-clear" onclick="clearSearch()">Hapus</span>`;
    } else {
        searchMeta.innerHTML = `Menampilkan <span class="meta-highlight">${count}</span> kartu untuk "<span class="meta-highlight">${kw}</span>" <span class="meta-clear" onclick="clearSearch()">Hapus</span>`;
    }
}

function resetAgencyFilter() {
    currentActiveFilter = 'all';
    document.querySelectorAll('.filter-group .filter-btn').forEach(b => b.classList.remove('active'));
    const allBtn = document.querySelector('[data-agency="all"]');
    if (allBtn) allBtn.classList.add('active');
}

searchInput.addEventListener('keydown', (e) => {
    const items = searchSuggestions.querySelectorAll('.suggestion-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        suggestionActive = (suggestionActive + 1) % items.length;
        items.forEach((el, i) => el.classList.toggle('active', i === suggestionActive));
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        suggestionActive = (suggestionActive - 1 + items.length) % items.length;
        items.forEach((el, i) => el.classList.toggle('active', i === suggestionActive));
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (suggestionActive >= 0 && suggestionItems[suggestionActive]) {
            const s = suggestionItems[suggestionActive];
            selectSuggestion(s.type, s.value, s.group);
        } else {
            closeSuggestions();
            updateChips();
            applyCurrentFilter();
        }
    } else if (e.key === 'Escape') {
        closeSuggestions();
        searchInput.blur();
    }
});

document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
    }
});

searchInput.addEventListener('input', (e) => {
    currentSearchKeyword = e.target.value.toLowerCase().trim();
    updateClearBtn();
    renderSuggestions(e.target.value.trim());

    if (currentSection === 'collection') {
        filteredData = myCollection.filter(item => item.member.toLowerCase().includes(currentSearchKeyword));
        currentPage = 1;
        updateDisplay();
    } else if (currentSection === 'favorite') {
        filteredData = myFavorites.filter(item => item.member.toLowerCase().includes(currentSearchKeyword));
        currentPage = 1;
        updateDisplay();
    } else if (currentSection === 'wishlist') {
        filteredData = myWishlist.filter(item => item.member.toLowerCase().includes(currentSearchKeyword));
        currentPage = 1;
        updateDisplay();
    } else if (currentSection === 'all') {
        resetAgencyFilter();
        applyCurrentFilter();
    }
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        closeSuggestions();
    }
});

const popularSearches = ['aespa', 'NewJeans', 'IVE', 'BTS', 'TWICE', 'Karina', 'Wonyoung', 'Winter'];

searchInput.addEventListener('focus', () => {
    const val = searchInput.value.trim();
    if (val) {
        renderSuggestions(val);
    } else {
        renderPopularSearches();
    }
});

function renderPopularSearches() {
    const html = `
        <div class="suggestion-section-label">✦ Populer</div>
        ${popularSearches.map(term => `
            <div class="suggestion-item suggestion-popular" onclick="applyPopularSearch('${term}')">
                <div class="suggestion-item-icon" style="background:rgba(255,0,122,0.08);">
                    <span style="font-size:14px">🔥</span>
                </div>
                <div class="suggestion-item-text">
                    <div class="suggestion-item-name">${term}</div>
                </div>
                <span class="suggestion-count" style="color:rgba(255,0,122,0.5);">trending</span>
            </div>
        `).join('')}
    `;
    searchSuggestions.innerHTML = html;
    searchSuggestions.classList.add('open');
    searchWrapper.classList.remove('no-dropdown');
}

function applyPopularSearch(term) {
    searchInput.value = term;
    currentSearchKeyword = term.toLowerCase();
    updateClearBtn();
    closeSuggestions();
    updateChips();
    if (currentSection === 'all') {
        resetAgencyFilter();
        applyCurrentFilter();
    }
    searchInput.blur();
}

document.querySelectorAll('.filter-group .filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const button = e.currentTarget;
        document.querySelectorAll('.filter-group .filter-btn').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        currentActiveFilter = button.dataset.agency;
        applyCurrentFilter();
    });
});

function openGroupFilter() {
    if (document.getElementById('group-filter-modal')) return;

    const groups = [...new Set(pcData.map(c => c.group))].sort();
    const logoMap = {};
    pcData.forEach(c => { logoMap[c.group] = c.logo; });

    const modal = document.createElement('div');
    modal.id = 'group-filter-modal';
    modal.className = 'group-filter-modal';
    modal.innerHTML = `
        <div class="gfm-backdrop" onclick="closeGroupFilter()"></div>
        <div class="gfm-panel">
            <div class="gfm-header">
                <h3>Filter by Group</h3>
                <button class="gfm-close" onclick="closeGroupFilter()">×</button>
            </div>
            <div class="gfm-grid">
                <div class="gfm-item ${currentGroupFilter === 'all' ? 'active' : ''}" onclick="applyGroupFilter('all')">
                    <div class="gfm-logo-wrap">
                        <span style="font-size:22px">🌐</span>
                    </div>
                    <span class="gfm-name">All Groups</span>
                </div>
                ${groups.map(grp => `
                    <div class="gfm-item ${currentGroupFilter === grp ? 'active' : ''}" onclick="applyGroupFilter('${grp}')">
                        <div class="gfm-logo-wrap">
                            <img src="${logoMap[grp]}" alt="${grp}">
                        </div>
                        <span class="gfm-name">${grp}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('active'));
}

function closeGroupFilter() {
    const modal = document.getElementById('group-filter-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

function applyGroupFilter(group) {
    currentGroupFilter = group;
    closeGroupFilter();

    const btn = document.getElementById('group-filter-btn');
    if (btn) {
        btn.textContent = group === 'all' ? '🎤 All Groups ▾' : `🎤 ${group} ▾`;
        btn.classList.toggle('active', group !== 'all');
    }

    applyCurrentFilter();
}

function applyCurrentFilter() {
    const big4 = ['SM', 'YG', 'JYP', 'HYBE'];
    const sortBy = document.getElementById('sort-pc').value;

    if (currentActiveFilter === 'all') {
        filteredData = [...pcData];
    } else if (currentActiveFilter === 'other') {
        filteredData = pcData.filter(item =>
            !big4.some(key => item.agency.toUpperCase().includes(key))
        );
    } else {
        filteredData = pcData.filter(item =>
            item.agency.toUpperCase().includes(currentActiveFilter.toUpperCase())
        );
    }

    if (currentGroupFilter !== 'all') {
        filteredData = filteredData.filter(item => item.group === currentGroupFilter);
    }

    if (currentSearchKeyword !== '') {
        filteredData = filteredData.filter(item =>
            item.member.toLowerCase().includes(currentSearchKeyword) ||
            item.group.toLowerCase().includes(currentSearchKeyword)
        );
    }

    const rarityOrder = {
        "SECRET": 7, "LIMITED": 6, "ULTRARARE": 5, "ULTRA RARE": 5,
        "SUPERRARE": 4, "SUPER RARE": 4, "RARE": 3, "UNCOMMON": 2, "COMMON": 1
    };

    filteredData.sort((a, b) => {
        if (sortBy === 'az')          return a.member.localeCompare(b.member);
        if (sortBy === 'za')          return b.member.localeCompare(a.member);
        if (sortBy === 'rarity-high') return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        if (sortBy === 'newest')      return b.id_unique.localeCompare(a.id_unique);
        if (sortBy === 'oldest')      return a.id_unique.localeCompare(b.id_unique);
        return 0;
    });

    currentPage = 1;
    updateDisplay();

    if (currentSearchKeyword) {
        updateMeta(filteredData.length);
        updateChips();
    } else {
        updateMeta(null);
        searchChips.innerHTML = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const sortWrapper = document.querySelector('.filter-sort-wrapper');
    if (sortWrapper && !document.getElementById('group-filter-btn')) {
        const groupBtn = document.createElement('button');
        groupBtn.id = 'group-filter-btn';
        groupBtn.className = 'group-filter-btn';
        groupBtn.textContent = '🎤 All Groups ▾';
        groupBtn.onclick = openGroupFilter;
        sortWrapper.prepend(groupBtn);
    }
});