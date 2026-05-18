// ============================================================
// SCRIPT.JS — CORE ONLY
// Load data, render cards, pagination, modal, search, sections
// ============================================================

// --- GLOBAL STATE ---
let pcData = [];
let currentPage = 1;
let filteredData = [];
let currentSection = 'all';
let currentSearchKeyword = '';
const cardsPerPage = 20;

// Typing animation state
const texts = ["PC COLLECTION", "BIAS GALLERY", "K-POP UNIVERSE"];
let typingCount = 0;
let typingIndex = 0;

// ============================================================
// LOAD DATA
// ============================================================

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

// ============================================================
// TYPING ANIMATION
// ============================================================

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

// ============================================================
// RENDER CARDS
// ============================================================

function renderCards(data) {
    const container = document.getElementById('pc-container');
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = `
            <p style="grid-column:1/-1; text-align:center; opacity:0.5; padding:60px 0;">
                ${currentSection === 'wishlist'
                    ? '💝 Wishlist kamu masih kosong.<br><small>Tambahkan card dari Database!</small>'
                    : 'Belum ada kartu di sini.'}
            </p>`;
        return;
    }

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
                    <img src="${item.logo}" alt="logo">
                </div>
                <div class="card-front" onclick="showDetail('${item.id_unique}')">
                    <img src="${item.image}" alt="${item.member}">
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// ============================================================
// SECTION SWITCHING
// ============================================================

function showSection(section) {
    currentSection = section;
    currentPage = 1;

    const container = document.getElementById('pc-container');
    const statsText = document.getElementById('total-stats');
    const paginationEl = document.getElementById('pagination-container');
    const startBtn = document.getElementById('start-collecting-btn');
    const pullRow = document.querySelector('.pull-buttons-row');
    const pityTracker = document.getElementById('pity-tracker');
    const progressPanel = document.getElementById('collection-progress-panel');

    // Reset nav
    document.querySelectorAll('.main-nav .filter-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.main-nav .filter-btn[onclick*="${section}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // Bersihkan progress panel tiap ganti section
    if (progressPanel) progressPanel.remove();

    // Sembunyikan elemen gacha
    if (pullRow) pullRow.style.display = 'none';
    if (pityTracker) pityTracker.style.display = 'none';

    if (section === 'gacha') {
        if (startBtn) startBtn.style.display = 'none';
        if (paginationEl) paginationEl.style.display = 'none';

        // Tampilkan pull row (inject kalau belum ada)
        if (pullRow) pullRow.style.display = 'flex';
        else setTimeout(injectPityUI, 50);
        if (pityTracker) pityTracker.style.display = 'block';

        container.innerHTML = `
            <div class="gacha-area" style="grid-column:1/-1; text-align:center; padding:60px 20px;">
                <div class="gacha-box-visual">💎</div>
                <h2 style="color:#fff; margin-top:20px;">Gacha Room</h2>
                <p style="opacity:0.6;">Ready to test your luck?</p>
            </div>`;
        statsText.textContent = "Good Luck!";
        setTimeout(updatePityDisplay, 60);

    } else {
        if (startBtn) startBtn.style.display = 'block';
        if (paginationEl) paginationEl.style.display = '';

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

// ============================================================
// PAGINATION
// ============================================================

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

// ============================================================
// MODAL DETAIL
// ============================================================

function showDetail(idUnique) {
    const item = myCollection.find(d => d.id_unique == idUnique) ||
        pcData.find(d => d.id_unique == idUnique) ||
        myFavorites.find(d => d.id_unique == idUnique) ||
        myWishlist.find(d => d.id_unique == idUnique);
    if (!item) return;

    playCardSound(item.rarity);

    let rarityClass = item.rarityClass || '';
    if (!rarityClass) {
        const base = item.rarity.replace(/\s+/g, '').toLowerCase();
        rarityClass = `rank-${base}`;
        if (["ULTRA RARE", "SECRET"].includes(item.rarity)) rarityClass += " card-shiny card-holo";
        else if (["RARE", "SUPER RARE"].includes(item.rarity)) rarityClass += " card-shiny";
    }

    const modal = document.getElementById('pc-modal');
    modal.innerHTML = `
        <div class="modal-content-horizontal" id="modal-content-area">
            <span class="close-modal-fixed" onclick="closeModal()">&times;</span>
            <div class="modal-left ${rarityClass}">
                <img src="${item.image}" alt="${item.member}">
            </div>
            <div class="modal-right">
                <span class="rarity-badge dynamic ${rarityClass.split(' ')[0]}">✨ ${item.rarity}</span>
                <h2 class="member-name">${item.member}</h2>
                <p class="group-name">${item.group} • Official Collection</p>
                <div class="detail-grid">
                    <div class="detail-item"><span>Era</span><strong>${item.era}</strong></div>
                    <div class="detail-item"><span>Style</span><strong>${item.style}</strong></div>
                    <div class="detail-item"><span>Agency</span><strong>${item.agency}</strong></div>
                    <div class="detail-item"><span>Serial</span><strong>#${item.id_unique.toString().slice(-6)}</strong></div>
                </div>
                <div class="modal-actions">
                    <button class="btn-download" onclick="downloadCard('${item.id_unique}')">Download Card</button>
                    <button class="btn-screenshot" onclick="toggleScreenshotMode()">SCREENSHOT MODE</button>
                </div>
            </div>
        </div>
        <div class="screenshot-hint">📸 Klik di mana saja untuk keluar</div>
    `;
    modal.style.display = "flex";
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

function playCardSound(rarity) {
    const audio = new Audio();
    audio.src = ["ULTRA RARE", "SECRET"].includes(rarity) ?
        'https://www.soundjay.com/misc/sounds/magic-chime-01.mp3' :
        'https://www.soundjay.com/buttons/sounds/button-50.mp3';
    audio.volume = 0.3;
    audio.play().catch(() => {});
}

// ============================================================
// SPARKLE TRAIL
// ============================================================

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

// ============================================================
// INIT
// ============================================================

loadData();