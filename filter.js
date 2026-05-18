// ============================================================
// FILTER.JS — Filter agency, group, search, sort
// ============================================================

let currentActiveFilter = 'all';
let currentGroupFilter = 'all';

// ============================================================
// SEARCH
// ============================================================

document.getElementById('search-input').addEventListener('input', (e) => {
    currentSearchKeyword = e.target.value.toLowerCase();

    // Reset agency filter ke all saat search
    currentActiveFilter = 'all';
    document.querySelectorAll('.filter-group .filter-btn').forEach(b => b.classList.remove('active'));
    const allBtn = document.querySelector('[data-agency="all"]');
    if (allBtn) allBtn.classList.add('active');

    applyCurrentFilter();
});

// ============================================================
// FILTER BY AGENCY
// ============================================================

document.querySelectorAll('.filter-group .filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const button = e.currentTarget;
        document.querySelectorAll('.filter-group .filter-btn').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        currentActiveFilter = button.dataset.agency;
        applyCurrentFilter();
    });
});

// ============================================================
// FILTER BY GROUP — POPUP MODAL
// ============================================================

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

// ============================================================
// APPLY FILTER + SORT (gabungan agency + group + search + sort)
// ============================================================

function applyCurrentFilter() {
    const big4 = ['SM', 'YG', 'JYP', 'HYBE'];
    const sortBy = document.getElementById('sort-pc').value;

    // Filter by agency
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

    // Filter by group
    if (currentGroupFilter !== 'all') {
        filteredData = filteredData.filter(item => item.group === currentGroupFilter);
    }

    // Filter by search keyword
    if (currentSearchKeyword !== '') {
        filteredData = filteredData.filter(item =>
            item.member.toLowerCase().includes(currentSearchKeyword) ||
            item.group.toLowerCase().includes(currentSearchKeyword)
        );
    }

    // Sort
    const rarityOrder = {
        "SECRET": 7, "LIMITED": 6, "ULTRA RARE": 5,
        "SUPER RARE": 4, "RARE": 3, "UNCOMMON": 2, "COMMON": 1
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
}

// ============================================================
// INJECT TOMBOL GROUP FILTER KE DOM
// ============================================================

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