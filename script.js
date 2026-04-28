let pcData = [];
let favorites = JSON.parse(localStorage.getItem('kpopFavs')) || [];
let currentActiveFilter = 'all';
let currentSearchKeyword = '';
const texts = ["PC COLLECTION", "BIAS GALLERY", "K-POP UNIVERSE"];
let count = 0;
let index = 0;
let currentText = "";
let letter = "";
let currentPage = 1;
const cardsPerPage = 20;
let filteredData = [];
let myCollection = JSON.parse(localStorage.getItem('myCollection')) || [];
let myFavorites = JSON.parse(localStorage.getItem('myFavorites')) || [];
let currentSection = 'all';

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
    if (count === texts.length) {
        count = 0;
    }
    currentText = texts[count];
    letter = currentText.slice(0, ++index);

    document.querySelector(".typing-text").textContent = letter;
    if (letter.length === currentText.length) {
        count++;
        index = 0;
        setTimeout(type, 2000);
    } else {
        setTimeout(type, 150);
    }
}

function renderCards(data) {
    const container = document.getElementById('pc-container');
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; opacity: 0.5;">Belum ada kartu di sini.</p>`;
        return;
    }

    data.forEach(item => {
        const isFav = myFavorites.some(f => f.id_unique === item.id_unique);

        const rarityBase = item.rarity ? item.rarity.replace(/\s+/g, '').toLowerCase() : 'common';
        let rarityClass = `rank-${rarityBase}`;

        if (item.rarity === "ULTRA RARE" || item.rarity === "SECRET") {
            rarityClass += " card-shiny card-holo";
        } else if (item.rarity === "RARE" || item.rarity === "SUPER RARE") {
            rarityClass += " card-shiny";
        }

        const card = document.createElement('div');
        card.className = `pc-card ${rarityClass}`;
        card.innerHTML = `
            <div class="card-inner">
                <button class="fav-btn ${isFav ? 'is-fav' : ''}" 
                    onclick="event.stopPropagation(); toggleFavorite('${item.id_unique}')">
                    ${isFav ? '❤️' : '♡'}
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

document.getElementById('search-input').addEventListener('input', (e) => {
    currentSearchKeyword = e.target.value.toLowerCase();

    currentActiveFilter = 'all';

    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-agency="all"]').classList.add('active');

    applyCurrentFilter();
});

function applyCurrentFilter() {
    const big4Keywords = ['SM', 'YG', 'JYP', 'HYBE'];
    const sortBy = document.getElementById('sort-pc').value;

    if (currentActiveFilter === 'all') {
        filteredData = [...pcData];
    } else if (currentActiveFilter === 'other') {
        filteredData = pcData.filter(item =>
            !big4Keywords.some(key => item.agency.toUpperCase().includes(key))
        );
    } else {
        filteredData = pcData.filter(item =>
            item.agency.toUpperCase().includes(currentActiveFilter.toUpperCase())
        );
    }

    if (currentSearchKeyword !== '') {
        filteredData = filteredData.filter(item =>
            item.member.toLowerCase().includes(currentSearchKeyword) ||
            item.group.toLowerCase().includes(currentSearchKeyword)
        );
    }

    const rarityOrder = {
        "SECRET": 7,
        "LIMITED": 6,
        "ULTRA RARE": 5,
        "SUPER RARE": 4,
        "RARE": 3,
        "UNCOMMON": 2,
        "COMMON": 1
    };

    filteredData.sort((a, b) => {
        if (sortBy === 'az') {
            return a.member.localeCompare(b.member);
        } else if (sortBy === 'za') {
            return b.member.localeCompare(a.member);
        } else if (sortBy === 'rarity-high') {
            return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        } else if (sortBy === 'newest') {
            return b.id_unique.localeCompare(a.id_unique);
        } else if (sortBy === 'oldest') {
            return a.id_unique.localeCompare(b.id_unique);
        }
        return 0;
    });

    currentPage = 1;
    updateDisplay();
}

function showSection(section) {
    currentSection = section;
    currentPage = 1;

    const gachaBtn = document.getElementById('gacha-control'); // Tombol "Lucky Gacha"
    const startBtn = document.getElementById('start-collecting-btn'); // Tombol "Start Collecting"
    const paginationContainer = document.getElementById('pagination-container');
    const container = document.getElementById('pc-container');
    const statsText = document.getElementById('total-stats');

    // Reset Navigasi
    document.querySelectorAll('.main-nav .filter-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.main-nav .filter-btn[onclick*="${section}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // --- LOGIKA TOMBOL ---
    if (section === 'gacha') {
        // Di Gacha Room: Sembunyikan tombol "Start Collecting", munculkan tombol "Lucky Gacha"
        if (startBtn) startBtn.style.display = 'none';
        if (gachaBtn) gachaBtn.style.display = 'block';

        container.innerHTML = `
            <div class="gacha-area" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <div class="gacha-box-visual">💎</div>
                <h2 style="color: #fff; margin-top: 20px;">Gacha Room</h2>
                <p style="opacity: 0.6;">Ready to test your luck?</p>
            </div>
        `;
        statsText.textContent = "Good Luck!";
        if (paginationContainer) paginationContainer.style.display = 'none';
    } else {
        // Di section lain: Munculkan lagi tombol "Start Collecting" (sebagai navigasi cepat)
        // Dan sembunyikan tombol gacha utama
        if (startBtn) startBtn.style.display = 'block';
        if (gachaBtn) gachaBtn.style.display = 'none';

        if (section === 'all') {
            statsText.textContent = `${pcData.length} Cards in Database`;
            applyCurrentFilter();
        } else if (section === 'collection') {
            statsText.textContent = `${myCollection.length} Cards Collected`;
            filteredData = [...myCollection];
            updateDisplay();
        } else if (section === 'favorite') {
            statsText.textContent = `${myFavorites.length} Favorites`;
            filteredData = [...myFavorites];
            updateDisplay();
        }
    }
}

function updateDisplay() {
    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const dataToRender = filteredData.slice(startIndex, endIndex);

    renderCards(dataToRender);
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

    container.innerHTML += `<button onclick="goToPage(1)" ${currentPage === 1 ? 'disabled' : ''}>First</button>`;
    container.innerHTML += `<button onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Prev</button>`;

    for (let i = 1; i <= totalPages; i++) {
        container.innerHTML += `
            <button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>
        `;
    }

    container.innerHTML += `<button onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
    container.innerHTML += `<button onclick="goToPage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>Last</button>`;
}

function goToPage(page) {
    currentPage = page;
    updateDisplay();
}

function getGacha() {
    const btn = document.getElementById('gacha-control');
    btn.disabled = true;
    btn.innerHTML = "🎲 ROLLING...";

    let overlay = document.querySelector('.gacha-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'gacha-overlay';
        overlay.innerHTML = '<div class="pack-visual">✨</div>';
        document.body.appendChild(overlay);
    }

    overlay.style.display = 'flex';
    const pack = overlay.querySelector('.pack-visual');
    pack.classList.add('gacha-reveal-anim');

    setTimeout(() => {
        const rand = Math.random() * 100;
        let rankLabel = "";
        let rankClass = "";

        if (rand <= 1) {
            rankLabel = "SECRET";
            rankClass = "rank-secret";
        } else if (rand <= 5) {
            rankLabel = "LIMITED";
            rankClass = "rank-limited";
        } else if (rand <= 10) {
            rankLabel = "ULTRA RARE";
            rankClass = "rank-ultrarare";
        } else if (rand <= 25) {
            rankLabel = "SUPER RARE";
            rankClass = "rank-superrare";
        } else if (rand <= 45) {
            rankLabel = "RARE";
            rankClass = "rank-rare";
        } else if (rand <= 70) {
            rankLabel = "UNCOMMON";
            rankClass = "rank-uncommon";
        } else {
            rankLabel = "COMMON";
            rankClass = "rank-common";
        }

        let finishEffect = "";
        if (["SECRET", "LIMITED", "ULTRA RARE"].includes(rankLabel)) {
            finishEffect = " card-shiny card-holo";
        } else if (["RARE", "SUPER RARE"].includes(rankLabel)) {
            finishEffect = " card-shiny";
        }

        const randomIndex = Math.floor(Math.random() * pcData.length);
        const baseData = pcData[randomIndex];
        const uniqueId = "GACHA-" + Date.now();

        const gachaResult = {
            ...baseData,
            id_unique: uniqueId,
            rarity: rankLabel,
            rarityClass: `${rankClass}${finishEffect}`,
            date_obtained: new Date().toLocaleDateString()
        };

        myCollection.unshift(gachaResult);
        localStorage.setItem('myCollection', JSON.stringify(myCollection));

        const statsText = document.getElementById('total-stats');
        if (currentSection === 'collection') {
            statsText.textContent = `${myCollection.length} Cards Collected`;
        }

        overlay.style.display = 'none';
        pack.classList.remove('gacha-reveal-anim');

        btn.disabled = false;
        btn.innerHTML = "🎲 LUCKY GACHA";

        showDetail(uniqueId);

    }, 2000);
}

function renderGachaResult(item) {
    const container = document.getElementById('pc-container');
    container.innerHTML = '';

    const card = document.createElement('div');
    card.className = `pc-card ${item.rarityClass}`;
    card.innerHTML = `
        <div class="card-inner" onclick="showDetail('${item.member}', '${item.displayRank}', '${item.rarityClass.split(' ')[0]}')">
            <div class="card-back"><img src="${item.logo}" alt="logo"></div>
            <div class="card-front"><img src="${item.image}" alt="${item.member}"></div>
        </div>
    `;
    container.appendChild(card);
}

function toggleFavorite(id_unique) {
    const item = myCollection.find(c => c.id_unique == id_unique) ||
        pcData.find(p => p.id_unique == id_unique) ||
        myFavorites.find(f => f.id_unique == id_unique);

    if (!item) return;

    const index = myFavorites.findIndex(f => f.id_unique == id_unique);

    if (index === -1) {
        myFavorites.push(item);
    } else {
        myFavorites.splice(index, 1);
    }

    localStorage.setItem('myFavorites', JSON.stringify(myFavorites));

    if (currentSection === 'all') {
        updateDisplay();
    } else if (currentSection === 'favorite') {
        filteredData = [...myFavorites];
        const maxPage = Math.ceil(filteredData.length / cardsPerPage);
        if (currentPage > maxPage && currentPage > 1) currentPage = maxPage;
        updateDisplay();
    } else {
        showSection(currentSection);
    }
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

function showDetail(idUnique) {
    const item = myCollection.find(d => d.id_unique == idUnique) ||
        pcData.find(d => d.id_unique == idUnique) ||
        myFavorites.find(d => d.id_unique == idUnique);

    if (!item) return;

    playCardSound(item.rarity);

    let rarityClass = item.rarityClass;
    if (!rarityClass) {
        const base = item.rarity.replace(/\s+/g, '').toLowerCase();
        rarityClass = `rank-${base}`;
        if (["ULTRA RARE", "SECRET"].includes(item.rarity)) rarityClass += " card-shiny card-holo";
        else if (["RARE", "SUPER RARE"].includes(item.rarity)) rarityClass += " card-shiny";
    }

    const modal = document.getElementById('pc-modal');
    // Langsung masukkan konten ke modal, jangan bikin wrapper horizontal double di sini
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
    modal.style.display = "flex"; // Pastikan display-nya flex supaya konten ke tengah
}

function playCardSound(rarity) {
    const audio = new Audio();
    if (["ULTRA RARE", "SECRET"].includes(rarity)) {
        audio.src = 'https://www.soundjay.com/misc/sounds/magic-chime-01.mp3';
    } else {
        audio.src = 'https://www.soundjay.com/buttons/sounds/button-50.mp3';
    }
    audio.volume = 0.3;
    audio.play();
}

function downloadCard(idUnique) {
    const element = document.querySelector('.modal-left');
    const btn = document.querySelector('.btn-download');

    btn.innerText = "Processing...";

    html2canvas(element, {
        useCORS: true,
        backgroundColor: null
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `KPhotoCard-${idUnique}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        btn.innerText = "Download Card";
    });
}

function closeModal() {
    const modal = document.getElementById('pc-modal');
    if (modal) {
        modal.style.display = "none";
        modal.innerHTML = ''; // Kosongkan modal agar tidak berat
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('pc-modal');
    if (event.target == modal) {
        closeModal();
    }
}

function toggleScreenshotMode() {
    const modalContent = document.querySelector('.modal-content-horizontal');
    modalContent.classList.add('screenshot-active');

    if (!document.querySelector('.screenshot-hint')) {
        const hint = document.createElement('div');
        hint.className = 'screenshot-hint';
        hint.innerText = "Click anywhere to exit Screenshot Mode";
        document.body.appendChild(hint);
    }

    const exitScreenshot = () => {
        modalContent.classList.remove('screenshot-active');
        window.removeEventListener('click', exitScreenshot);
    };

    setTimeout(() => {
        window.addEventListener('click', exitScreenshot);
    }, 100);
}

function renderPagination() {
    const container = document.getElementById('pagination-container');
    container.innerHTML = '';

    const totalPages = Math.ceil(filteredData.length / cardsPerPage);
    if (totalPages <= 1) return;

    // Batasan jumlah halaman yang tampil di tengah
    const delta = 2; // Menampilkan 2 halaman ke kiri dan 2 ke kanan dari currentPage
    const range = [];
    const rangeWithDots = [];
    let l;

    // Masukkan halaman 1, halaman terakhir, dan halaman di sekitar currentPage ke array range
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
            range.push(i);
        }
    }

    // Tambahkan titik-titik (...) di antara angka yang jaraknya lebih dari 1
    for (let i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    }

    // Render Tombol Prev
    container.innerHTML += `<button onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Prev</button>`;

    // Render Angka dan Dots
    rangeWithDots.forEach(page => {
        if (page === '...') {
            container.innerHTML += `<span class="paging-dots">...</span>`;
        } else {
            container.innerHTML += `
                <button class="${page === currentPage ? 'active' : ''}" onclick="goToPage(${page})">
                    ${page}
                </button>
            `;
        }
    });

    // Render Tombol Next
    container.innerHTML += `<button onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
}

document.addEventListener('mousemove', (e) => {
    const spark = document.createElement('div');
    spark.className = 'sparkle-trail';
    spark.style.left = e.pageX + 'px';
    spark.style.top = e.pageY + 'px';
    document.body.appendChild(spark);

    setTimeout(() => {
        spark.remove();
    }, 800);
});

loadData();