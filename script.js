let pcData = [];
let currentPage = 1;
let filteredData = [];
let currentSection = 'all';
let currentSearchKeyword = '';
const cardsPerPage = 20;

const texts = ["PC COLLECTION", "BIAS GALLERY", "K-POP UNIVERSE"];
let typingCount = 0;
let typingIndex = 0;

async function loadData() {
    try {
        const response = await fetch('data.json');
        pcData = await response.json();
        document.getElementById('total-stats').textContent = `${pcData.length} Cards Loaded`;
        showSection('all');
        type();
    } catch (error) {
        console.error("Gagal memuat data JSON:", error);
    }
}

function type() {
    if (typingCount === texts.length) typingCount = 0;
    const currentText = texts[typingCount];
    const letter = currentText.slice(0, ++typingIndex);
    document.querySelector(".typing-text").textContent = letter;

    if (letter.length === currentText.length) {
        typingCount++;
        typingIndex = 0;
        setTimeout(type, 2000);
    } else {
        setTimeout(type, 150);
    }
}

function renderCards(data) {
    const container = document.getElementById('pc-container');
    container.innerHTML = '';

    if (data.length === 0) {
        const isSearching = currentSearchKeyword && currentSearchKeyword.length > 0;
        if (isSearching) {
            container.classList.add('empty-state');
            container.innerHTML = `
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-title">Tidak ada kartu ditemukan</div>
                <div class="empty-state-sub">Coba kata kunci lain atau hapus filter yang aktif</div>
                <button class="empty-state-btn" onclick="clearSearch()">✕ Hapus Pencarian</button>
            `;
        } else {
            container.classList.remove('empty-state');
            container.innerHTML = `
                <p style="grid-column:1/-1; text-align:center; opacity:0.5; padding:60px 0;">
                    ${currentSection === 'wishlist'
                        ? '💝 Wishlist kamu masih kosong.<br><small>Tambahkan card dari Database!</small>'
                        : 'Belum ada kartu di sini.'}
                </p>`;
        }
        return;
    }

    container.classList.remove('empty-state');
    data.forEach(item => {
        const isFav = myFavorites.some(f => f.id_unique === item.id_unique);
        const isWish = isWishlisted(item.id_unique);

        let rarityClass = item.rarityClass || '';
        if (!rarityClass) {
            const base = item.rarity ? item.rarity.replace(/\s+/g, '').toLowerCase() : 'common';
            rarityClass = `rank-${base}`;
            if (["ULTRA RARE", "SECRET"].includes(item.rarity)) rarityClass += " card-shiny card-holo";
            else if (["RARE", "SUPER RARE"].includes(item.rarity)) rarityClass += " card-shiny";
        }

        const card = document.createElement('div');
        card.className = `pc-card ${rarityClass}`;
        card.innerHTML = `
        <div class="card-inner">
            <button class="fav-btn ${isFav ? 'is-fav' : ''}"
                onclick="event.stopPropagation(); toggleFavorite('${item.id_unique}')">
                ${isFav ? '❤️' : '♡'}
            </button>
            <button class="wish-btn ${isWish ? 'is-wish' : ''}"
                onclick="event.stopPropagation(); toggleWishlist('${item.id_unique}')">
                ${isWish ? '💝' : '🤍'}
            </button>

            <div class="card-back" onclick="showDetail('${item.id_unique}')">
                <img src="${item.logo}" class="card-group-logo" alt="logo" onerror="this.style.display='none'">
            </div>

            <div class="card-front" onclick="showDetail('${item.id_unique}')">
                <img src="${item.image}" alt="${item.member}">
            </div>
        </div>
    `;
        container.appendChild(card);
    });

    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".pc-card"), {
            max: 15,
            speed: 400,
            glare: true,
            "max-glare": 0.3,
            perspective: 1000
        });
    }
}

// 🌟 ENCHANTED FIX: Mengubah showSection menjadi async agar renderProfileSection() dari user.js termuat mulus
async function showSection(section) {
    currentSection = section;
    currentPage = 1;

    const container = document.getElementById('pc-container');
    const statsText = document.getElementById('total-stats');
    const paginationEl = document.getElementById('pagination-container');
    const startBtn = document.getElementById('start-collecting-btn');
    const pityTracker = document.getElementById('pity-tracker');
    const progressPanel = document.getElementById('collection-progress-panel');
    const profileContainer = document.getElementById('profile-container');
    const gachaPremiumRow = document.querySelector('.gacha-premium-row');

    document.querySelectorAll('.main-nav .filter-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.main-nav .filter-btn[onclick*="${section}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    if (progressPanel) progressPanel.remove();
    if (pityTracker) pityTracker.style.display = 'none';
    if (profileContainer) profileContainer.style.display = 'none';

    if (gachaPremiumRow) {
        gachaPremiumRow.style.setProperty('display', 'none', 'important');
    }

    container.style.display = 'grid';

    if (section === 'gacha') {
        if (startBtn) startBtn.style.display = 'none';
        if (paginationEl) paginationEl.style.display = 'none';

        const searchBox = document.querySelector('.search-container');
        const agencyBox = document.querySelector('.filter-container');
        const sortBox = document.querySelector('.filter-sort-wrapper');

        if (searchBox) searchBox.style.display = 'none';
        if (agencyBox) agencyBox.style.display = 'none';
        if (sortBox) sortBox.style.display = 'none';

        if (gachaPremiumRow) gachaPremiumRow.style.setProperty('display', 'flex', 'important');
        const currentPity = document.getElementById('pity-tracker');
        if (currentPity) {
            currentPity.style.display = 'block';
        } else {
            setTimeout(injectPityUI, 50);
        }

        container.innerHTML = `
            <div class="gacha-area" style="grid-column:1/-1; text-align:center; padding:40px 20px;">
                <div class="gacha-box-visual" style="font-size: 60px; filter: drop-shadow(0 0 15px rgba(0, 242, 255, 0.6)); animation: pack-float 3s ease-in-out infinite;">💎</div>
                <h2 style="color:#fff; margin-top:20px; font-weight:800; letter-spacing:1px;">Gacha Room</h2>
                <p style="opacity:0.6; font-size:14px;">Ready to test your luck?</p>
            </div>`;

        statsText.textContent = "Good Luck!";
        setTimeout(updatePityDisplay, 60);

    } else if (section === 'profile') {
        if (startBtn) startBtn.style.display = 'none';
        if (paginationEl) paginationEl.style.display = 'none';
        container.style.display = 'none';

        const searchBox = document.querySelector('.search-container');
        const agencyBox = document.querySelector('.filter-container');
        const sortBox = document.querySelector('.filter-sort-wrapper');

        if (searchBox) searchBox.style.display = 'none';
        if (agencyBox) agencyBox.style.display = 'none';
        if (sortBox) sortBox.style.display = 'none';

        if (profileContainer) {
            profileContainer.style.display = 'block';
            await renderProfileSection(); // Memanggil fungsi milik user.js secara asinkron
        }
        statsText.textContent = "Welcome back, Collector!";

    } else {
        if (startBtn) startBtn.style.display = 'block';
        if (paginationEl) paginationEl.style.display = '';

        const searchBox = document.querySelector('.search-container');
        const agencyBox = document.querySelector('.filter-container');
        const sortBox = document.querySelector('.filter-sort-wrapper');

        if (searchBox) searchBox.style.display = 'block';
        if (agencyBox) agencyBox.style.display = 'block';
        if (sortBox) sortBox.style.display = 'flex';

        if (section === 'all') {
            statsText.textContent = `${pcData.length} Cards in Database`;
            applyCurrentFilter();
        } else if (section === 'collection') {
            statsText.textContent = `${myCollection.length} Cards Collected`;
            filteredData = [...myCollection];
            updateDisplay();
            setTimeout(injectProgressUI, 50);
        } else if (section === 'favorite') {
            statsText.textContent = `${myFavorites.length} Favorites`;
            filteredData = [...myFavorites];
            updateDisplay();
        } else if (section === 'wishlist') {
            statsText.textContent = `${myWishlist.length} in Wishlist`;
            filteredData = [...myWishlist];
            updateDisplay();
        }
    }
}

function updateDisplay() {
    const start = (currentPage - 1) * cardsPerPage;
    renderCards(filteredData.slice(start, start + cardsPerPage));
    renderPagination();
    if (currentPage > 1) {
        document.getElementById('pc-container').scrollIntoView({ behavior: 'smooth' });
    }
}

function renderPagination() {
    const container = document.getElementById('pagination-container');
    container.innerHTML = '';

    const totalPages = Math.ceil(filteredData.length / cardsPerPage);
    if (totalPages <= 1) return;

    const delta = 2,
        range = [],
        rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
            range.push(i);
        }
    }
    for (let i of range) {
        if (l) {
            if (i - l === 2) rangeWithDots.push(l + 1);
            else if (i - l !== 1) rangeWithDots.push('...');
        }
        rangeWithDots.push(i);
        l = i;
    }

    container.innerHTML += `<button onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Prev</button>`;
    rangeWithDots.forEach(page => {
        container.innerHTML += page === '...' ?
            `<span class="paging-dots">...</span>` :
            `<button class="${page === currentPage ? 'active' : ''}" onclick="goToPage(${page})">${page}</button>`;
    });
    container.innerHTML += `<button onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
}

function goToPage(page) {
    currentPage = page;
    updateDisplay();
}

function showDetail(idUnique) {
    const item = pcData.find(d => d.id_unique === idUnique) ||
        myCollection.find(d => d.id_unique === idUnique) ||
        myFavorites.find(d => d.id_unique === idUnique) ||
        myWishlist.find(d => d.id_unique === idUnique);

    if (!item) return;

    playCardSound(item.rarity);

    let rarityClass = item.rarityClass || '';
    if (!rarityClass) {
        const base = item.rarity.replace(/\s+/g, '').toLowerCase();
        rarityClass = `rank-${base}`;
        if (["ULTRA RARE", "SECRET"].includes(item.rarity)) rarityClass += " card-shiny card-holo";
        else if (["RARE", "SUPER RARE"].includes(item.rarity)) rarityClass += " card-shiny";
    }

    const isFav = myFavorites.some(f => f.id_unique === item.id_unique);
    const isWish = isWishlisted(item.id_unique);

    const memberTotal = pcData.filter(c => c.member === item.member && c.group === item.group).length;
    const memberOwned = myCollection.filter(c => c.member === item.member && c.group === item.group).length;

    const rarityColorMap = {
        'SECRET': '#ff007a',
        'LIMITED': '#c906bf',
        'ULTRA RARE': '#b70404',
        'SUPER RARE': '#d0cd1e',
        'RARE': '#00f2ff',
        'UNCOMMON': '#2ecc71',
        'COMMON': '#888'
    };
    const rarityColor = rarityColorMap[item.rarity] || '#fff';

    const flagMap = {
        'korean': '🇰🇷',
        'japan': '🇯🇵',
        'china': '🇨🇳',
        'taiwan': '🇹🇼',
        'thailand': '🇹🇭',
        'vietnam': '🇻🇳',
        'indonesia': '🇮🇩',
        'malaysia': '🇲🇾',
        'philippines': '🇵🇭',
        'singapore': '🇸🇬',
        'brunei': '🇧🇳',
        'cambodia': '🇰🇭',
        'laos': '🇱🇦',
        'myanmar': '🇲🇲',
        'east_timor': '🇹🇱',
        'india': '🇮🇳',
        'pakistan': '🇵🇰',
        'bangladesh': '🇧🇩',
        'sri_lanka': '🇱🇰',
        'maldives': '🇲🇻',
        'nepal': '🇳🇵',
        'bhutan': '🇧🇹',
        'mongolia': '🇲🇳',
        'kazakhstan': '🇰🇿',
        'uzbekistan': '🇺🇿',
        'turkmenistan': '🇹🇲',
        'kyrgyzstan': '🇰🇬',
        'tajikistan': '🇹🇯',
        'afghanistan': '🇦🇫',
        'saudi_arabia': '🇸🇦',
        'uae': '🇦🇪',
        'qatar': '🇶🇦',
        'kuwait': '🇰🇼',
        'bahrain': '🇧🇭',
        'oman': '🇴🇲',
        'yemen': '🇾🇪',
        'turkey': '🇹🇷',
        'iran': '🇮🇷',
        'iraq': '🇮🇶',
        'israel': '🇮🇱',
        'palestine': '🇵🇸',
        'jordan': '🇯🇴',
        'lebanon': '🇱🇧',
        'syria': '🇸🇾',
        'cyprus': '🇨🇾',
        'armenia': '🇦🇲',
        'azerbaijan': '🇦🇿',
        'georgia': '🇬🇪',
        'usa': '🇺🇸',
        'canada': '🇨🇦',
        'mexico': '🇲🇽',
        'cuba': '🇨🇺',
        'jamaica': '🇯🇲',
        'haiti': '🇭🇹',
        'dominican_republic': '🇩🇴',
        'guatemala': '🇬🇹',
        'honduras': '🇭🇳',
        'el_salvador': '🇸🇻',
        'nicaragua': '🇳🇮',
        'costa_rica': '🇨🇷',
        'panama': '🇵🇦',
        'bahamas': '🇧🇸',
        'barbados': '🇧🇧',
        'trinidad_tobago': '🇹🇹',
        'brazil': '🇧🇷',
        'argentina': '🇦🇷',
        'colombia': '🇨🇴',
        'peru': '🇵🇪',
        'chile': '🇨🇱',
        'venezuela': '🇻🇪',
        'ecuador': '🇪🇨',
        'bolivia': '🇧🇴',
        'paraguay': '🇵🇾',
        'uruguay': '🇺🇾',
        'guyana': '🇬🇾',
        'suriname': '🇸🇷',
        'uk': '🇬🇧',
        'france': '🇫🇷',
        'germany': '🇩🇪',
        'italy': '🇮🇹',
        'spain': '🇪🇸',
        'netherlands': '🇳🇱',
        'belgium': '🇧🇪',
        'switzerland': '🇨🇭',
        'ireland': '🇮🇪',
        'luxembourg': '🇱🇺',
        'monaco': '🇲🇨',
        'sweden': '🇸🇪',
        'norway': '🇳🇴',
        'denmark': '🇩🇰',
        'finland': '🇫🇮',
        'iceland': '🇮🇸',
        'estonia': '🇪🇪',
        'latvia': '🇱🇻',
        'lithuania': '🇱🇹',
        'russia': '🇷🇺',
        'ukraine': '🇺🇦',
        'poland': '🇵🇱',
        'czech_republic': '🇨🇿',
        'slovakia': '🇸🇰',
        'hungary': '🇭🇺',
        'romania': '🇷🇴',
        'bulgaria': '🇧🇬',
        'greece': '🇬🇷',
        'portugal': '🇵🇹',
        'austria': '🇦🇹',
        'belarus': '🇧🇾',
        'moldova': '🇲🇩',
        'albania': '🇦🇱',
        'north_macedonia': '🇲🇰',
        'serbia': '🇷🇸',
        'croatia': '🇭🇷',
        'slovenia': '🇸🇮',
        'bosnia': '🇧🇦',
        'montenegro': '🇲🇪',
        'kosovo': '🇽🇰',
        'malta': '🇲🇹',
        'san_marino': '🇸🇲',
        'vatican': '🇻🇦',
        'andorra': '🇦🇩',
        'liechtenstein': '🇱🇮',
        'egypt': '🇪🇬',
        'south_africa': '🇿🇦',
        'nigeria': '🇳🇬',
        'kenya': '🇰🇪',
        'morocco': '🇲🇦',
        'algeria': '🇩🇿',
        'tunisia': '🇹🇳',
        'libya': '🇱🇾',
        'sudan': '🇸🇩',
        'ethiopia': '🇪🇹',
        'ghana': '🇬🇭',
        'ivory_coast': '🇨🇮',
        'cameroon': '🇨🇲',
        'senegal': '🇸🇳',
        'uganda': '🇺🇬',
        'tanzania': '🇹🇿',
        'zambia': '🇿🇲',
        'zimbabwe': '🇿🇼',
        'angola': '🇦🇴',
        'mozambique': '🇲🇿',
        'madagascar': '🇲🇬',
        'mauritius': '🇲🇺',
        'seychelles': '🇸🇨',
        'cape_verde': '🇨🇻',
        'dr_congo': '🇨🇩',
        'congo': '🇨🇬',
        'gabon': '🇬🇦',
        'mali': '🇲🇱',
        'niger': '🇳🇪',
        'chad': '🇹🇩',
        'sudan_south': '🇸🇸',
        'somalia': '🇸🇴',
        'djibouti': '🇩🇯',
        'eritrea': '🇪🇷',
        'rwanda': '🇷🇼',
        'burundi': '🇧🇮',
        'malawi': '🇲🇼',
        'namibia': '🇳🇦',
        'botswana': '🇧🇼',
        'lesotho': '🇱🇸',
        'eswatini': '🇸🇿',
        'gambia': '🇬🇲',
        'guinea': '🇬🇳',
        'guinea_bissau': '🇬🇼',
        'sierra_leone': '🇸🇱',
        'liberia': '🇱🇷',
        'burkina_faso': '🇧🇫',
        'togo': '🇹🇬',
        'benin': '🇧JIM',
        'equatorial_guinea': '🇬🇶',
        'sao_tome': '🇸🇹',
        'central_african_republic': '🇨🇫',
        'mauritania': '🇲🇷',
        'comoros': '🇰🇲',
        'australia': '🇦🇺',
        'new_zealand': '🇳🇿',
        'papua_new_guinea': '🇵🇬',
        'fiji': '🇫🇯',
        'solomon_islands': '🇸🇧',
        'vanuatu': '🇻🇺',
        'samoa': '🇼🇸',
        'tonga': '🇹🇴',
        'kiribati': '🇰🇮',
        'tuvalu': '🇹🇻',
        'nauru': '🇳🇷',
        'palau': '🇵🇼',
        'micronesia': '🇫🇲',
        'marshall_islands': '🇲🇭'
    };

    let flagEmojiHTML = '';
    let countriesArray = item.origin_country || item.nation || ['korean'];

    if (!Array.isArray(countriesArray)) {
        countriesArray = [countriesArray];
    }

    countriesArray.forEach(country => {
        if (typeof country === 'string') {
            const flag = flagMap[country.toLowerCase().trim()] || '🌐';
            flagEmojiHTML += `<span class="member-flag-icon" title="Origin: ${country}">${flag}</span>`;
        }
    });

    let positionBadgesHTML = '';
    if (item.lines && Array.isArray(item.lines)) {
        positionBadgesHTML = item.lines.map(line => {
            const cleanLineName = line.replace('_', ' ');
            return `<span class="badge-line line-${line.toLowerCase()}">${cleanLineName.toUpperCase()}</span>`;
        }).join('');
    }

    const modal = document.getElementById('pc-modal');
    modal.innerHTML = `
        <div class="modal-content-horizontal" id="modal-content-area">

            <div class="modal-left ${rarityClass}">
                <img src="${item.image}" alt="${item.member}">
                <div class="modal-left-overlay"></div>
                <div class="modal-left-actions">
                    <button class="modal-action-icon ${isFav ? 'is-fav' : ''}"
                        onclick="event.stopPropagation(); toggleFavorite('${item.id_unique}'); this.classList.toggle('is-fav')"
                        title="Favorite">
                        ${isFav ? '❤️' : '♡'}
                    </button>
                    <button class="modal-action-icon ${isWish ? 'is-wish' : ''}"
                        onclick="event.stopPropagation(); toggleWishlist('${item.id_unique}'); this.classList.toggle('is-wish')"
                        title="Wishlist">
                        ${isWish ? '💝' : '🤍'}
                    </button>
                </div>
            </div>

            <div class="modal-right">
                <button class="modal-close-btn" onclick="closeModal()">✕</button>

                <div class="modal-logo-wrap">
                    <img src="${item.logo}" alt="${item.group}" class="modal-group-logo">
                </div>

                <div class="modal-rarity-pill" style="background:${rarityColor}22;border-color:${rarityColor}66;color:${rarityColor}">
                    ✦ ${item.rarity}
                </div>

                <h2 class="member-name">${item.member} ${flagEmojiHTML}</h2>
                <p class="group-name">${item.group} <span class="group-dot">·</span> Official Collection</p>

                <div class="member-position-wrapper">
                    ${positionBadgesHTML}
                </div>

                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Era</span>
                        <strong class="detail-value">${item.era}</strong>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Style</span>
                        <strong class="detail-value">${item.style}</strong>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Agency</span>
                        <strong class="detail-value">${item.agency}</strong>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Serial</span>
                        <strong class="detail-value">#${item.id_unique.toString().slice(-6)}</strong>
                    </div>
                </div>

                <div class="modal-member-stat">
                    <div class="modal-member-stat-label">
                        <span>Cards of ${item.member}</span>
                        <span>${memberOwned} owned · ${memberTotal} total</span>
                    </div>
                    <div class="modal-member-stat-bar">
                        <div class="modal-member-stat-fill" style="width:${memberTotal > 0 ? Math.round((memberOwned/memberTotal)*100) : 0}%;background:${rarityColor}"></div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button class="btn-download" onclick="downloadCard('${item.id_unique}')">
                        <span>⬇</span> Download
                    </button>
                    <button class="btn-screenshot" onclick="toggleScreenshotMode()">
                        <span>📸</span> Screenshot
                    </button>
                    <button class="btn-share-modal" onclick="shareCard('${item.id_unique}')" title="Share">
                        <span>↗</span>
                    </button>
                </div>
            </div>

        </div>
        <div class="screenshot-hint">📸 Klik di mana saja untuk keluar</div>
    `;
    modal.style.display = "flex";

    setTimeout(() => {
        const fill = modal.querySelector('.modal-member-stat-fill');
        if (fill) {
            const target = fill.style.width;
            fill.style.width = '0%';
            setTimeout(() => { fill.style.width = target; }, 60);
        }
    }, 100);
}

function closeModal() {
    const modal = document.getElementById('pc-modal');
    if (modal) {
        modal.style.display = "none";
        modal.innerHTML = '';
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('pc-modal');
    if (event.target == modal) closeModal();
};

function toggleScreenshotMode() {
    const modalContent = document.querySelector('.modal-content-horizontal');
    if (!modalContent) return;
    modalContent.classList.add('screenshot-active');
    const exit = () => {
        modalContent.classList.remove('screenshot-active');
        window.removeEventListener('click', exit);
    };
    setTimeout(() => window.addEventListener('click', exit), 100);
}

function downloadCard(idUnique) {
    const element = document.querySelector('.modal-left');
    const btn = document.querySelector('.btn-download');
    btn.innerText = "Processing...";
    html2canvas(element, { useCORS: true, backgroundColor: null }).then(canvas => {
        const link = document.createElement('a');
        link.download = `KPhotoCard-${idUnique}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        btn.innerText = "Download Card";
    });
}

function shareCard(idUnique) {
    const item = myCollection.find(d => d.id_unique == idUnique) ||
        pcData.find(d => d.id_unique == idUnique);
    if (!item) return;
    const text = `✨ ${item.member} (${item.group}) — ${item.rarity} photocard!\n#KPhotoCard #KPop #${item.group.replace(/\s/g,'')}`;
    if (navigator.share) {
        navigator.share({ title: 'K-PhotoCard', text }).catch(() => {});
    } else {
        navigator.clipboard.writeText(text).then(() => showToast('📋 Copied to clipboard!'));
    }
}

function playCardSound(rarity) {
    const audio = new Audio();
    audio.src = ["ULTRA RARE", "SECRET"].includes(rarity) ?
        'https://www.soundjay.com/misc/sounds/magic-chime-01.mp3' :
        'https://www.soundjay.com/buttons/sounds/button-50.mp3';
    audio.volume = 0.3;
    audio.play().catch(() => {});
}

let lastSparkle = 0;
document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastSparkle < 30) return;
    lastSparkle = now;
    const spark = document.createElement('div');
    spark.className = 'sparkle-trail';
    spark.style.left = e.pageX + 'px';
    spark.style.top = e.pageY + 'px';
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 800);
});

const acvTitleMap = {
    "acv_total_1": "🐣 First Step",
    "acv_total_10": "📦 Newbie Collector",
    "acv_total_30": "🎵 K-POP Fans",
    "acv_total_50": "✨ Stan Account",
    "acv_total_100": "💎 Elite Collector",
    "acv_total_300": "🔥 PC Addict",
    "acv_total_500": "👑 God Collector",
    "acv_total_all": "🌌 Tuan Tanah Kwangya",
    "acv_sm_10": "pink-blood SM Stan",
    "acv_sm_25": "🏢 Pemegang Saham SM",
    "acv_sm_all": "🏛️ Penguasa Gedung SM",
    "acv_yg_10": "👑 YG Stan",
    "acv_yg_15": "🎤 Hip-Hop Dynasty",
    "acv_yg_all": "💎 YG Dungeon Escape",
    "acv_jyp_10": "🕺 JYP Stan",
    "acv_jyp_25": "🌊 Organic Wave",
    "acv_jyp_all": "🎧 JYP Organic Kitchen",
    "acv_hybe_10": "🎪 HYBE Stan",
    "acv_hybe_25": "🚀 Corporate Monopoly",
    "acv_hybe_all": "🎯 We Believe In Music",
    "acv_other_10": "💎 Nugu Supporter",
    "acv_other_25": "🌱 Hidden Gem Protector",
    "acv_other_all": "🚀 Indie Pride",
    "acv_rare_common_10": "📸 Selca Enjoyer",
    "acv_rare_common_20": "🖼️ Galeri Selfie",
    "acv_rare_common_all": "📁 Raja Selca Khazanah",
    "acv_rare_uncommon_10": "🌿 Rookie Era",
    "acv_rare_uncommon_20": "🎵 Bersemi di Panggung",
    "acv_rare_uncommon_all": "🍀 Master of Debut",
    "acv_rare_rare_10": "💎 Rare Hunter",
    "acv_rare_rare_20": "💠 Koleksi Berkilau",
    "acv_rare_rare_all": "🛸 Rare Overload",
    "acv_rare_sr_10": "🔮 Super Rare Specialist",
    "acv_rare_sr_20": "✨ Aura Premium",
    "acv_rare_sr_all": "🌟 Dinasti Super Rare",
    "acv_rare_ur_first": "🔥 Pecah Telur Hoki",
    "acv_rare_ur_10": "⚡ Ultra Rare Magnet",
    "acv_rare_ur_20": "💥 Flexing Rarity",
    "acv_rare_ur_all": "☄️ Penguasa Angkasa UR",
    "acv_rare_lim_first": "🌌 Tiket Terbatas",
    "acv_rare_lim_10": "🪐 Limited Edition",
    "acv_rare_lim_20": "🛡️ Benteng Keberuntungan",
    "acv_rare_lim_all": "⌛ Kolektor Garis Langka",
    "acv_rare_sec_first": "👁️ Menembus Mitos",
    "acv_rare_sec_10": "🔮 Penjaga Rahasia",
    "acv_rare_sec_20": "🧿 Iluminati Gacha",
    "acv_rare_sec_all": "👁️‍🗨️ Master of Mystical Rate",
    "acv_line_japan": "🌸 Japan Line Complete",
    "acv_line_global": "🌏 Passport Squad",
    "acv_line_korean": "🇰🇷 Hallyu Wave Royalty",
    "acv_complete_g1": "🎤 OT Complete!",
    "acv_complete_g5": "🗂️ Multi-Fandom Stan",
    "acv_complete_g10": "🎼 K-POP Mastermind",
    "acv_line_visual": "✨ Visual Attack!",
    "acv_line_vocal": "🎤 The Golden Voice",
    "acv_line_maknae": "🍼 Bontot Kesayangan",
    "acv_line_leader": "⚔️ Captain of the Ship",
    "acv_line_rapper": "🔥 Spitfire Verse",
    "acv_line_center": "🎯 Center of Attention",
    "acv_line_dancer_all": "👑 Main Dancer Synergy",
    "acv_pull_rainbow": "🌈 The Rainbow Pull",
    "acv_pull_lucky5": "🍀 Lucky Five",
    "sec_dup_jamaah": "🤡 Duplikat Berjamaah",
    "sec_lucky_gacha": "🎰 Wonyoung Blessing",
    "sec_unlucky_gacha": "💀 Korban Sakit Hati",
    "sec_multipull_sr5": "👑 Kesurupan Dewa Gacha",
    "sec_single_believer": "🛐 Single Pull Believer",
    "sec_bias_loyal": "❤️ Setia pada Bias",
    "sec_identity_crisis": "🎭 Krisis Identitas",
    "sec_first_print": "🥇 The First Print"
};

function triggerAchievementPopup(id) {
    const title = acvTitleMap[id] || "🏆 Pencapaian Baru!";

    const popup = document.createElement('div');
    popup.className = 'achievement-popup-box';
    popup.innerHTML = `
        <div class="acv-icon-wrap">🏆</div>
        <div class="acv-text-wrap">
            <h4>Achievement Unlocked!</h4>
            <p>${title}</p>
        </div>
    `;

    document.body.appendChild(popup);
    setTimeout(() => popup.classList.add('slide-in'), 100);

    setTimeout(() => {
        popup.classList.remove('slide-in');
        setTimeout(() => popup.remove(), 600);
    }, 4000);
}

loadData();