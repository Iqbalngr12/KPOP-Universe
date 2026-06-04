let myCollection = JSON.parse(localStorage.getItem('myCollection')) || [];
let myFavorites = JSON.parse(localStorage.getItem('myFavorites')) || [];
let myWishlist = JSON.parse(localStorage.getItem('myWishlist')) || [];

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

function injectProgressUI() {
    if (document.getElementById('collection-progress-panel')) return;

    const container = document.getElementById('pc-container');
    if (!container) return;

    const ownedKeys = new Set(myCollection.map(c => c.group + '|' + c.member + '|' + c.style));
    const totalUnique = new Set(pcData.map(c => c.group + '|' + c.member + '|' + c.style)).size;
    const overallPct = totalUnique > 0 ? Math.round((ownedKeys.size / totalUnique) * 100) : 0;

    const groups = pcData.reduce((acc, card) => {
        if (!acc[card.group]) {
            acc[card.group] = { total: 0, owned: 0, logo: card.logo, agency: card.agency };
        }
        acc[card.group].total++;
        if (ownedKeys.has(`${card.group}|${card.member}|${card.style}`)) {
            acc[card.group].owned++;
        }
        return acc;
    }, {});

    const sortedGroups = Object.entries(groups).sort(function(a, b) {
        const pctA = a[1].total > 0 ? a[1].owned / a[1].total : 0;
        const pctB = b[1].total > 0 ? b[1].owned / b[1].total : 0;
        return pctB - pctA;
    });

    const rarities = ["SECRET", "LIMITED", "ULTRA RARE", "SUPER RARE", "RARE", "UNCOMMON", "COMMON"];
    const rarityColors = {
        "SECRET": "#ff007a",
        "LIMITED": "#c906bf",
        "ULTRA RARE": "#b70404",
        "SUPER RARE": "#d0cd1e",
        "RARE": "#00f2ff",
        "UNCOMMON": "#2ecc71",
        "COMMON": "#888"
    };
    const rarityIcons = {
        "SECRET": "💎",
        "LIMITED": "🌸",
        "ULTRA RARE": "🔴",
        "SUPER RARE": "⭐",
        "RARE": "💙",
        "UNCOMMON": "🟢",
        "COMMON": "⬜"
    };

    const rarityProgress = {};
    rarities.forEach(function(r) {
        const total = pcData.filter(function(c) { return c.rarity === r; }).length;
        const owned = new Set(
            myCollection.filter(function(c) {
                const cardRarity = c.rankLabel || c.rarity;
                return cardRarity === r;
            }).map(function(c) { return c.group + '|' + c.member + '|' + c.style; })
        ).size;
        rarityProgress[r] = { total: total, owned: Math.min(owned, total) };
    });

    const panel = document.createElement('div');
    panel.id = 'collection-progress-panel';
    panel.className = 'collection-progress-panel';

    const header = document.createElement('div');
    header.className = 'progress-header-bar';
    header.innerHTML = `
        <div class="progress-header-left">
            <span class="progress-header-icon">📊</span>
            <div>
                <div class="progress-header-title">Collection Analytics Dashboard</div>
                <div class="progress-header-sub">${ownedKeys.size} dari ${totalUnique} unique cards · ${overallPct}% complete</div>
            </div>
        </div>
        <div class="progress-header-right">
            <div class="progress-overall-ring" style="--pct:${overallPct}">
                <svg viewBox="0 0 36 36">
                    <circle class="ring-bg" cx="18" cy="18" r="15.9"/>
                    <circle class="ring-fill" cx="18" cy="18" r="15.9" style="stroke-dasharray:${overallPct} 100"/>
                </svg>
                <span class="ring-label">${overallPct}%</span>
            </div>
            <button class="progress-toggle-btn" onclick="toggleProgressPanel()" id="progress-toggle-btn">▼</button>
        </div>`;
    panel.appendChild(header);

    const body = document.createElement('div');
    body.className = 'progress-panel-body';
    body.id = 'progress-panel-body';

    // 🌟 MENAMBAHKAN TAB BARU: BY ADVANCED STATS
    body.innerHTML = `
        <div class="progress-tabs">
            <button class="progress-tab active" onclick="switchProgressTab('rarity', this)">By Rarity</button>
            <button class="progress-tab" onclick="switchProgressTab('group', this)">By Group</button>
            <button class="progress-tab" onclick="switchProgressTab('advanced_stats', this)">✨ Advanced Stats</button>
            <button class="progress-tab" onclick="switchProgressTab('analytics', this)">📊 Analytics Chart</button>
        </div>
        <div id="progress-tab-rarity" class="progress-tab-content active">
            ${buildRarityRows(rarities, rarityProgress, rarityColors, rarityIcons)}
        </div>
        <div id="progress-tab-group" class="progress-tab-content">
            ${buildGroupCards(sortedGroups)}
        </div>
        <div id="progress-tab-advanced_stats" class="progress-tab-content">
            ${buildAdvancedStatsRows(ownedKeys)}
        </div>
        <div id="progress-tab-analytics" class="progress-tab-content">
            <div class="chart-wrapper" style="max-width:340px; margin:20px auto; position:relative; height:340px;">
                <canvas id="collectionChart"></canvas>
            </div>
        </div>`;

    panel.appendChild(body);
    container.parentNode.insertBefore(panel, container);

    requestAnimationFrame(function() {
        setTimeout(function() {
            panel.querySelectorAll('.progress-bar-fill').forEach(function(bar) {
                bar.style.width = bar.dataset.width;
            });
            panel.querySelectorAll('.ring-fill').forEach(function(ring) {
                ring.style.strokeDasharray = ring.dataset.pct + ' 100';
            });
        }, 80);
    });
}

function buildRarityRows(rarities, rarityProgress, rarityColors, rarityIcons) {
    let html = '<div class="rarity-progress-grid">';
    rarities.forEach(function(r) {
        const total = rarityProgress[r].total;
        const owned = rarityProgress[r].owned;
        const pct = total > 0 ? Math.round((owned / total) * 100) : 0;
        const color = rarityColors[r];
        const icon = rarityIcons[r] || '✦';
        html += '<div class="rarity-progress-item" style="--rarity-color:' + color + '">';
        html += '<div class="rarity-progress-left"><span class="rarity-icon">' + icon + '</span><span class="rarity-name" style="color:' + color + '">' + r + '</span></div>';
        html += '<div class="rarity-progress-bar-wrap"><div class="progress-bar-bg"><div class="progress-bar-fill" data-width="' + pct + '%" style="width:0%;background:' + color + '"></div></div></div>';
        html += '<div class="rarity-progress-stat"><span class="rarity-stat-owned">' + owned + '</span><span class="rarity-stat-sep">/</span><span class="rarity-stat-total">' + total + '</span></div>';
        html += '</div>';
    });
    html += '</div>';
    return html;
}

function buildGroupCards(sortedGroups) {
    let html = '<div class="group-progress-grid">';
    sortedGroups.forEach(function(entry) {
        const grp = entry[0];
        const data = entry[1];
        const pct = data.total > 0 ? Math.round((data.owned / data.total) * 100) : 0;
        const isComplete = pct === 100;
        html += '<div class="group-progress-card' + (isComplete ? ' group-complete' : '') + '">';
        html += '<div class="group-progress-header">';
        html += '<div class="group-logo-wrap"><img src="' + data.logo + '" alt="' + grp + '" class="group-logo-sm"></div>';
        html += '<div class="group-progress-info"><span class="group-progress-name">' + grp + '</span><span class="group-progress-agency">' + (data.agency || '') + '</span></div>';
        html += '<span class="group-progress-pct' + (isComplete ? ' pct-complete' : '') + '">' + pct + '%</span>';
        html += '</div>';
        html += '<div class="progress-bar-bg"><div class="progress-bar-fill" data-width="' + pct + '%" style="width:0%;background:linear-gradient(90deg,var(--primary),var(--secondary))"></div></div>';
        html += '<div class="group-progress-foot"><span>' + data.owned + ' / ' + data.total + ' cards</span>';
        if (isComplete) html += '<span class="group-complete-badge">✓ COMPLETE</span>';
        html += '</div></div>';
    });
    html += '</div>';
    return html;
}

// 🌟 FUNGSI BARU: MENGAL KULASI STATISTIK LANJUTAN BERDASARKAN GENDER, NEGARA, DAN POSITION LINE
function buildAdvancedStatsRows(ownedKeys) {
    // Kumpulkan data ke dalam kategori terpisah
    const stats = {
        gender: { girlgroup: { t: 0, o: 0 }, boygroup: { t: 0, o: 0 } },
        nation: {},
        position: {}
    };

    pcData.forEach(card => {
        const cardKey = `${card.group}|${card.member}|${card.style}`;
        const isOwned = ownedKeys.has(cardKey);

        // 1. Hitung Gender Type
        const genType = card.girlgroup || card.boygroup || card.type || '';
        if (genType.toLowerCase().includes('girl')) {
            stats.gender.girlgroup.t++;
            if (isOwned) stats.gender.girlgroup.o++;
        } else if (genType.toLowerCase().includes('boy')) {
            stats.gender.boygroup.t++;
            if (isOwned) stats.gender.boygroup.o++;
        }

        // 2. Hitung Negara (Nationality)
        let nationsArr = card.origin_country || card.nation || ['korean'];
        if (!Array.isArray(nationsArr)) nationsArr = [nationsArr];
        nationsArr.forEach(nat => {
            const n = nat.toLowerCase().trim();
            if (!stats.nation[n]) stats.nation[n] = { t: 0, o: 0 };
            stats.nation[n].t++;
            if (isOwned) stats.nation[n].o++;
        });

        // 3. Hitung Posisi Lines
        const posLines = card.lines || [];
        posLines.forEach(line => {
            const l = line.toLowerCase().trim();
            if (!stats.position[l]) stats.position[l] = { t: 0, o: 0 };
            stats.position[l].t++;
            if (isOwned) stats.position[l].o++;
        });
    });

    let html = '<div class="rarity-progress-grid" style="gap:20px; padding:10px 5px;">';

    // Cetak Sub-Seksi Gender
    html += '<div style="grid-column:1/-1; font-size:12px; font-weight:800; color:var(--primary); margin-bottom:-10px;">✦ BY GROUP GENDER SYSTEM</div>';
    Object.entries(stats.gender).forEach(([k, val]) => {
        const pct = val.t > 0 ? Math.round((val.o / val.t) * 100) : 0;
        html += renderRowHTML(`👥 ${k.toUpperCase()}`, pct, val.o, val.t, 'var(--primary)');
    });

    // Cetak Sub-Seksi Negara
    html += '<div style="grid-column:1/-1; font-size:12px; font-weight:800; color:#ffd700; margin-top:10px; margin-bottom:-10px;">✦ BY NATIONALITY ORIGIN</div>';
    Object.entries(stats.nation).sort((a, b) => b[1].t - a[1].t).forEach(([k, val]) => {
        const pct = val.t > 0 ? Math.round((val.o / val.t) * 100) : 0;
        html += renderRowHTML(`🌍 ${k.toUpperCase()}`, pct, val.o, val.t, '#ffd700');
    });

    // Cetak Sub-Seksi Posisi Line
    html += '<div style="grid-column:1/-1; font-size:12px; font-weight:800; color:var(--secondary); margin-top:10px; margin-bottom:-10px;">✦ BY MEMBER POSITION LINE</div>';
    Object.entries(stats.position).sort((a, b) => b[1].t - a[1].t).forEach(([k, val]) => {
        const pct = val.t > 0 ? Math.round((val.o / val.t) * 100) : 0;
        html += renderRowHTML(`🎤 ${k.replace('_',' ').toUpperCase()}`, pct, val.o, val.t, 'var(--secondary)');
    });

    html += '</div>';
    return html;
}

function renderRowHTML(name, pct, owned, total, color) {
    return `
        <div class="rarity-progress-item" style="--rarity-color:${color}; margin-bottom: -5px;">
            <div class="rarity-progress-left" style="width:140px;"><span class="rarity-name" style="color:#fff; font-size:12px;">${name}</span></div>
            <div class="rarity-progress-bar-wrap"><div class="progress-bar-bg"><div class="progress-bar-fill" data-width="${pct}%" style="width:0%; background:${color}"></div></div></div>
            <div class="rarity-progress-stat"><span class="rarity-stat-owned" style="color:${color}">${owned}</span><span class="rarity-stat-sep">/</span><span class="rarity-stat-total">${total}</span></div>
        </div>
    `;
}

function switchProgressTab(tab, btn) {
    document.querySelectorAll('.progress-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.progress-tab-content').forEach(function(c) { c.classList.remove('active'); });
    btn.classList.add('active');
    var content = document.getElementById('progress-tab-' + tab);
    if (content) {
        content.classList.add('active');
        content.querySelectorAll('.progress-bar-fill').forEach(function(bar) {
            bar.style.width = '0%';
            setTimeout(function() { bar.style.width = bar.dataset.width; }, 50);
        });
        if (tab === 'analytics') {
            setTimeout(renderCollectionChart, 50);
        }
    }
}

function toggleProgressPanel() {
    const body = document.getElementById('progress-panel-body');
    const btn = document.getElementById('progress-toggle-btn');
    if (!body) return;
    const isOpen = body.style.maxHeight !== '0px' && body.style.maxHeight !== '';
    if (isOpen) {
        body.style.maxHeight = '0px';
        body.style.opacity = '0';
        if (btn) btn.textContent = '▶';
    } else {
        body.style.maxHeight = body.scrollHeight + 'px';
        body.style.opacity = '1';
        if (btn) btn.textContent = '▼';
        body.querySelectorAll('.progress-bar-fill').forEach(function(bar) {
            bar.style.width = '0%';
            setTimeout(function() { bar.style.width = bar.dataset.width; }, 60);
        });
    }
}

function showToast(msg) {
    const existing = document.querySelector('.kpcu-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'kpcu-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(() => toast.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

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

let myChartInstance = null;

function renderCollectionChart() {
    const ctx = document.getElementById('collectionChart');
    if (!ctx) return;

    const groupCounts = {};
    myCollection.forEach(card => {
        groupCounts[card.group] = (groupCounts[card.group] || 0) + 1;
    });

    const labels = Object.keys(groupCounts);
    const dataValues = Object.values(groupCounts);

    if (labels.length === 0) {
        labels.push("Belum ada kartu");
        dataValues.push(1);
    }

    if (myChartInstance) {
        myChartInstance.destroy();
    }

    const neonColors = [
        '#ff007a', '#00f2ff', '#9b59b6', '#ffd700',
        '#2ecc71', '#ff8c00', '#3498db', '#e74c3c'
    ];

    myChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: labels[0] === "Belum ada kartu" ? ['rgba(255,255,255,0.08)'] : neonColors,
                borderColor: '#141414',
                borderWidth: 3,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: { family: 'Poppins', size: 11 },
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.label === "Belum ada kartu") return " Yuk mulai gacha!";
                            return ` ${context.label}: ${context.parsed} Kartu`;
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });
}