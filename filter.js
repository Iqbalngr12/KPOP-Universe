let currentActiveFilter = 'all';
let currentGroupFilter = 'all';
let suggestionActive = -1;
let suggestionItems = [];
let currentSortMode = 'newest';

// 🌟 VARIABEL FILTER BARU
let currentGenderFilter = 'all'; // 'all', 'girlgroup', 'boygroup'
let currentNationFilter = 'all'; // 'all', 'korean', 'japan', 'china', dll
let currentPositionFilter = 'all'; // 'all', 'vocal', 'dancer', 'visual', 'leader', dll

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
    searchSuggestions.classList.remove('remove');
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

if (searchClear) {
    searchClear.addEventListener('click', () => {
        clearSearch();
        searchInput.focus();
    });
}

function updateChips() {
    const kw = searchInput.value.trim();
    searchChips.innerHTML = '';

    // Satukan barisan teks informasi filter yang aktif ke dlm chip bunderan kecil
    let chipHTML = '';
    if (kw) {
        const memberMatch = kw.match(/^(.+)\s\((.+)\)$/);
        chipHTML += `<div class="search-chip">🔍 <strong>${memberMatch ? memberMatch[1] : kw}</strong>${memberMatch ? ' <span style="opacity:0.5">· '+memberMatch[2]+'</span>' : ''}<button class="search-chip-remove" onclick="clearSearch()">✕</button></div>`;
    }
    if (currentGenderFilter !== 'all') {
        chipHTML += `<div class="search-chip" style="border-color:var(--primary)">👥 <strong>${currentGenderFilter.toUpperCase()}</strong><button class="search-chip-remove" onclick="setAdvancedFilter('gender','all')">✕</button></div>`;
    }
    if (currentNationFilter !== 'all') {
        chipHTML += `<div class="search-chip" style="border-color:#ffd700">🌍 <strong>${currentNationFilter.toUpperCase()}</strong><button class="search-chip-remove" onclick="setAdvancedFilter('nation','all')">✕</button></div>`;
    }
    if (currentPositionFilter !== 'all') {
        chipHTML += `<div class="search-chip" style="border-color:var(--secondary)">🎤 <strong>${currentPositionFilter.toUpperCase()}</strong><button class="search-chip-remove" onclick="setAdvancedFilter('position','all')">✕</button></div>`;
    }
    searchChips.innerHTML = chipHTML;
}

function clearSearch() {
    searchInput.value = '';
    currentSearchKeyword = '';
    currentGenderFilter = 'all';
    currentNationFilter = 'all';
    currentPositionFilter = 'all';

    updateClearBtn();
    closeSuggestions();
    updateChips();
    updateMeta(null);

    const advBtn = document.getElementById('adv-filter-btn');
    if (advBtn) advBtn.classList.remove('active');

    if (typeof currentSection !== 'undefined') {
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
    } else {
        resetAgencyFilter();
        applyCurrentFilter();
    }
}

function updateMeta(count) {
    if (count === null || (searchInput.value.trim() === '' && currentGenderFilter === 'all' && currentNationFilter === 'all' && currentPositionFilter === 'all')) {
        searchMeta.innerHTML = '';
        return;
    }
    const kw = searchInput.value.trim() || 'Filter Aktif';
    if (count === 0) {
        searchMeta.innerHTML = `Tidak ada hasil untuk kriteria pencarian ini. <span class="meta-clear" onclick="clearSearch()">Hapus Semua Filter</span>`;
    } else {
        searchMeta.innerHTML = `Menampilkan <span class="meta-highlight">${count}</span> kartu sesuai filter <span class="meta-clear" onclick="clearSearch()">Hapus Semua</span>`;
    }
}

function resetAgencyFilter() {
    currentActiveFilter = 'all';
    document.querySelectorAll('.filter-group .filter-btn').forEach(b => b.classList.remove('active'));
    const allBtn = document.querySelector('[data-agency="all"]');
    if (allBtn) allBtn.classList.add('active');
}

// 🌟 MODAL PANEL BARU: MODAL FILTER ADVANCED (GENDER, NEGARA, DAN LINE POSITION)
function openAdvancedFilterModal() {
    if (document.getElementById('adv-filter-modal')) return;

    // Kumpulkan opsi kewarganegaraan & lines secara dinamis dari database
    const nations = [...new Set(pcData.flatMap(c => c.origin_country || c.nation || ['korean']))].filter(Boolean).sort();
    const lines = [...new Set(pcData.flatMap(c => c.lines || []))].filter(Boolean).sort();

    const modal = document.createElement('div');
    modal.id = 'adv-filter-modal';
    modal.className = 'group-filter-modal'; // Menggunakan basis styling modal agar seragam
    modal.innerHTML = `
        <div class="gfm-backdrop" onclick="closeAdvancedFilterModal()"></div>
        <div class="gfm-panel" style="max-width: 420px; padding: 22px;">
            <div class="gfm-header" style="margin-bottom: 20px;">
                <h3 style="color:#fff; font-weight:800; font-size:16px; letter-spacing:0.5px;">⚙️ Advanced Database Filter</h3>
                <button class="gfm-close" onclick="closeAdvancedFilterModal()">×</button>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:16px;">
                <!-- Opsi Filter Jenis Grup -->
                <div>
                    <label style="font-size:11px; text-transform:uppercase; color:var(--secondary); font-weight:700; display:block; margin-bottom:8px;">👥 Group Type / Gender</label>
                    <div style="display:flex; gap:8px;">
                        <button class="filter-btn ${currentGenderFilter === 'all' ? 'active' : ''}" style="flex:1; padding:6px; font-size:12px;" onclick="setAdvancedFilter('gender','all')">All</button>
                        <button class="filter-btn ${currentGenderFilter === 'girlgroup' ? 'active' : ''}" style="flex:1; padding:6px; font-size:12px;" onclick="setAdvancedFilter('gender','girlgroup')">Girlgroup</button>
                        <button class="filter-btn ${currentGenderFilter === 'boygroup' ? 'active' : ''}" style="flex:1; padding:6px; font-size:12px;" onclick="setAdvancedFilter('gender','boygroup')">Boygroup</button>
                    </div>
                </div>

                <!-- Opsi Filter Negara Asal -->
                <div>
                    <label style="font-size:11px; text-transform:uppercase; color:var(--secondary); font-weight:700; display:block; margin-bottom:8px;">🌍 Origin Nationality</label>
                    <select id="adv-nation-select" class="user-bias-rank-select" style="width:100%; max-width:none;" onchange="setAdvancedFilter('nation', this.value)">
                        <option value="all" ${currentNationFilter === 'all' ? 'selected' : ''}>-- Semua Negara --</option>
                        ${nations.map(n => `<option value="${n}" ${currentNationFilter === n ? 'selected' : ''}>${n.toUpperCase()}</option>`).join('')}
                    </select>
                </div>

                <!-- Opsi Filter Posisi / Lines -->
                <div>
                    <label style="font-size:11px; text-transform:uppercase; color:var(--secondary); font-weight:700; display:block; margin-bottom:8px;">🎤 Member Line / Position</label>
                    <select id="adv-position-select" class="user-bias-rank-select" style="width:100%; max-width:none;" onchange="setAdvancedFilter('position', this.value)">
                        <option value="all" ${currentPositionFilter === 'all' ? 'selected' : ''}>-- Semua Opsi Posisi Line --</option>
                        ${lines.map(l => `<option value="${l}" ${currentPositionFilter === l ? 'selected' : ''}>${l.replace('_',' ').toUpperCase()}</option>`).join('')}
                    </select>
                </div>
            </div>

            <button class="btn-save-profile" style="width:100%; margin-top:25px; padding:10px;" onclick="closeAdvancedFilterModal()">APPLY FILTERS</button>
        </div>
    `;
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('active'));
}

function closeAdvancedFilterModal() {
    const modal = document.getElementById('adv-filter-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 250);
    }
}

function setAdvancedFilter(type, value) {
    if (type === 'gender') currentGenderFilter = value;
    if (type === 'nation') currentNationFilter = value;
    if (type === 'position') currentPositionFilter = value;

    const advBtn = document.getElementById('adv-filter-btn');
    if (advBtn) {
        const isFiltering = currentGenderFilter !== 'all' || currentNationFilter !== 'all' || currentPositionFilter !== 'all';
        advBtn.classList.toggle('active', isFiltering);
    }

    applyCurrentFilter();
    updateChips();
    
    // Auto sync pemilih jika komponen modal terbuka dalam layar
    const mGen = document.querySelector(`#adv-filter-modal .filter-btn`);
    if (mGen) {
        closeAdvancedFilterModal();
        openAdvancedFilterModal();
    }
}

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
    const sortBy = currentSortMode; 

    // 1. Filter Berdasarkan Agensi / Perusahaan Utama
    let sourceData = (typeof currentSection !== 'undefined' && currentSection === 'collection') ? [...myCollection] :
                     (typeof currentSection !== 'undefined' && currentSection === 'favorite') ? [...myFavorites] :
                     (typeof currentSection !== 'undefined' && currentSection === 'wishlist') ? [...myWishlist] : [...pcData];

    if (currentActiveFilter === 'all') {
        filteredData = [...sourceData];
    } else if (currentActiveFilter === 'other') {
        filteredData = sourceData.filter(item =>
            !big4.some(key => item.agency.toUpperCase().includes(key))
        );
    } else {
        filteredData = sourceData.filter(item =>
            item.agency.toUpperCase().includes(currentActiveFilter.toUpperCase())
        );
    }

    // 2. Filter Berdasarkan Grup Musik Kesayangan
    if (currentGroupFilter !== 'all') {
        filteredData = filteredData.filter(item => item.group === currentGroupFilter);
    }

    // 3. Filter Berdasarkan Kata Kunci Input Pencarian Text
    if (currentSearchKeyword !== '') {
        filteredData = filteredData.filter(item =>
            item.member.toLowerCase().includes(currentSearchKeyword) ||
            item.group.toLowerCase().includes(currentSearchKeyword)
        );
    }

    // 🌟 4. FILTER BARU: BERDASARKAN GENDER GROUP TYPE (GIRLGROUP / BOYGROUP)
    if (currentGenderFilter !== 'all') {
        filteredData = filteredData.filter(item => {
            const type = item.girlgroup || item.boygroup || item.type || '';
            return type.toLowerCase().includes(currentGenderFilter.toLowerCase());
        });
    }

    // 🌟 5. FILTER BARU: BERDASARKAN NEGARA ASAL (NATIONALITY ORIGIN)
    if (currentNationFilter !== 'all') {
        filteredData = filteredData.filter(item => {
            let countryArr = item.origin_country || item.nation || ['korean'];
            if (!Array.isArray(countryArr)) countryArr = [countryArr];
            return countryArr.some(c => c.toLowerCase().trim() === currentNationFilter.toLowerCase());
        });
    }

    // 🌟 6. FILTER BARU: BERDASARKAN POSISI MEMBER LINES
    if (currentPositionFilter !== 'all') {
        filteredData = filteredData.filter(item => {
            return item.lines && Array.isArray(item.lines) && item.lines.includes(currentPositionFilter);
        });
    }

    const rarityOrder = {
        "SECRET": 7, "LIMITED": 6, "ULTRARARE": 5, "ULTRA RARE": 5,
        "SUPERRARE": 4, "SUPER RARE": 4, "RARE": 3, "UNCOMMON": 2, "COMMON": 1
    };

    filteredData.sort((a, b) => {
        if (sortBy === 'az')          return a.member.localeCompare(b.member);
        if (sortBy === 'za')          return b.member.localeCompare(a.member);
        if (sortBy === 'rarity-high') return rarityOrder[b.rarity.replace(/\s+/g,'')] - rarityOrder[a.rarity.replace(/\s+/g,'')];
        if (sortBy === 'newest')      return b.id_unique.toString().localeCompare(a.id_unique.toString());
        if (sortBy === 'oldest')      return a.id_unique.toString().localeCompare(b.id_unique.toString());
        return 0;
    });

    currentPage = 1;
    updateDisplay();

    const activeFilterCount = filteredData.length;
    if (currentSearchKeyword || currentGenderFilter !== 'all' || currentNationFilter !== 'all' || currentPositionFilter !== 'all') {
        updateMeta(activeFilterCount);
    } else {
        updateMeta(null);
    }
}

// Pasang Event Input Listener & Injeksi Tombol Advanced Filter Baru ke Samping Opsi Sortir
searchInput.addEventListener('input', (e) => {
    currentSearchKeyword = e.target.value.toLowerCase().trim();
    updateClearBtn();
    renderSuggestions(e.target.value.trim());
    applyCurrentFilter();
});

searchInput.addEventListener('focus', () => {
    const val = searchInput.value.trim();
    if (val) renderSuggestions(val);
    else renderPopularSearches();
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) closeSuggestions();
});

const popularSearches = ['aespa', 'NewJeans', 'IVE', 'BTS', 'TWICE', 'Karina', 'Wonyoung', 'Winter'];

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
    applyCurrentFilter();
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

document.addEventListener('DOMContentLoaded', () => {
    const sortWrapper = document.querySelector('.filter-sort-wrapper');
    if (sortWrapper) {
        if (!document.getElementById('group-filter-btn')) {
            const groupBtn = document.createElement('button');
            groupBtn.id = 'group-filter-btn';
            groupBtn.className = 'group-filter-btn';
            groupBtn.textContent = '🎤 All Groups ▾';
            groupBtn.onclick = openGroupFilter;
            sortWrapper.prepend(groupBtn);
        }
        
        // Injeksi Tombol Filter Advanced Tambahan Tepat di Samping Tombol Opsi Grup
        if (!document.getElementById('adv-filter-btn')) {
            const advBtn = document.createElement('button');
            advBtn.id = 'adv-filter-btn';
            advBtn.className = 'group-filter-btn adv-filter-btn';
            advBtn.innerHTML = '⚙️ Advanced ▾';
            advBtn.style.marginLeft = '5px';
            advBtn.onclick = openAdvancedFilterModal;
            sortWrapper.appendChild(advBtn);
        }
    }

    const dropdown = document.getElementById('sort-dropdown');
    if (dropdown) {
        const selected = dropdown.querySelector('.dropdown-selected');
        const selectedText = selected.querySelector('span');
        const options = dropdown.querySelectorAll('.dropdown-opt');

        selected.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });

        options.forEach(opt => {
            opt.addEventListener('click', function(e) {
                e.stopPropagation();
                dropdown.querySelectorAll('.dropdown-opt').forEach(o => o.classList.remove('active'));
                this.classList.add('active');
                selectedText.textContent = this.textContent;
                dropdown.classList.remove('open');
                currentSortMode = this.dataset.value;
                applyCurrentFilter();
            });
        });

        document.addEventListener('click', () => dropdown.classList.remove('open'));
    }
});