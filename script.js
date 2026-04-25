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

        // Start dengan section 'all' secara default
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
        setTimeout(type, 2000); // Tunggu sebelum ganti kata
    } else {
        setTimeout(type, 150); // Kecepatan ngetik
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

        // PERBAIKAN: Gunakan tanda kutip yang benar untuk parameter string
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

    if (currentActiveFilter === 'all') {
        filteredData = pcData;
    } else if (currentActiveFilter === 'other') {
        // Filter kartu yang agensinya TIDAK mengandung kata kunci Big 4
        filteredData = pcData.filter(item =>
            !big4Keywords.some(key => item.agency.toUpperCase().includes(key))
        );
    } else {
        // Filter untuk SM, YG, JYP, atau HYBE
        filteredData = pcData.filter(item =>
            item.agency.toUpperCase().includes(currentActiveFilter.toUpperCase())
        );
    }

    // Gabungkan dengan fitur Search jika ada
    if (currentSearchKeyword !== '') {
        filteredData = filteredData.filter(item =>
            item.member.toLowerCase().includes(currentSearchKeyword) ||
            item.group.toLowerCase().includes(currentSearchKeyword)
        );
    }

    currentPage = 1;
    updateDisplay();
}

function showSection(section) {
    currentSection = section;
    const gachaBtn = document.getElementById('gacha-control');
    const paginationContainer = document.getElementById('pagination-container');
    const agencyFilterGroup = document.querySelector('.filter-group');
    const searchBar = document.querySelector('.search-container');

    // 1. Update status tombol navigasi utama (All, Collection, Favorite)
    document.querySelectorAll('.main-nav .filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Cari tombol yang diklik dan kasih active
    const activeBtn = document.querySelector(`.main-nav .filter-btn[onclick*="${section}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // 2. Logika tampilan per section
    if (section === 'all') {
        // Tampilkan filter agensi, pagination, dan sembunyikan gacha
        if (agencyFilterGroup) agencyFilterGroup.style.display = 'flex';
        if (paginationContainer) paginationContainer.style.display = 'flex';
        if (searchBar) searchBar.style.display = 'block';
        gachaBtn.style.display = 'none';

        applyCurrentFilter(); // Render ulang data dari database global
    } else if (section === 'collection') {
        // Tampilkan gacha, sembunyikan filter agensi & pagination
        if (agencyFilterGroup) agencyFilterGroup.style.display = 'none';
        if (paginationContainer) paginationContainer.style.display = 'none';
        if (searchBar) searchBar.style.display = 'none'; // Gacha biasanya nggak butuh search
        gachaBtn.style.display = 'flex';

        renderCards(myCollection); // Ambil dari hasil gacha
    } else if (section === 'favorite') {
        // Sembunyikan semuanya, tampilkan koleksi love
        if (agencyFilterGroup) agencyFilterGroup.style.display = 'none';
        if (paginationContainer) paginationContainer.style.display = 'none';
        if (searchBar) searchBar.style.display = 'block';
        gachaBtn.style.display = 'none';

        renderCards(myFavorites); // Ambil dari favorit
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
    btn.innerHTML = "🎲 ROLLING...";
    btn.disabled = true;

    setTimeout(() => {
        const rand = Math.random() * 100;
        let rank = "";
        let rankLabel = "";
        let finishEffect = "";

        // Logika Rarity Rank (Probabilitas kamu)
        if (rand <= 1) {
            rank = "rank-secret";
            rankLabel = "SECRET";
        } else if (rand <= 5) {
            rank = "rank-limited";
            rankLabel = "LIMITED";
        } else if (rand <= 10) {
            rank = "rank-ultrarare";
            rankLabel = "ULTRA RARE";
        } else if (rand <= 20) {
            rank = "rank-superrare";
            rankLabel = "SUPER RARE";
        } else if (rand <= 35) {
            rank = "rank-rare";
            rankLabel = "RARE";
        } else if (rand <= 60) {
            rank = "rank-uncommon";
            rankLabel = "UNCOMMON";
        } else {
            rank = "rank-common";
            rankLabel = "COMMON";
        }

        // Finish Effect
        const effectRand = Math.random() * 100;
        if (rankLabel === "SECRET" || rankLabel === "LIMITED") finishEffect = "card-shiny card-holo";
        else if (effectRand <= 20) finishEffect = "card-shiny card-holo";
        else if (effectRand <= 50) finishEffect = "card-holo";
        else if (effectRand <= 80) finishEffect = "card-shiny";

        const randomIndex = Math.floor(Math.random() * pcData.length);

        // Buat ID unik untuk tiap kartu yang didapat (biar bisa punya banyak kartu yang sama)
        const gachaResult = {
            ...pcData[randomIndex],
            id_unique: Date.now(),
            rarityClass: `${rank} ${finishEffect}`,
            displayRank: rankLabel
        };

        // SIMPAN KE MY COLLECTION
        myCollection.unshift(gachaResult);
        localStorage.setItem('myCollection', JSON.stringify(myCollection));

        // Render ulang halaman collection
        showSection('collection');

        // Tampilkan detail
        showDetail(gachaResult.member, gachaResult.displayRank, rank);

        btn.innerHTML = "🎲 LUCKY GACHA";
        btn.disabled = false;
    }, 1200);
}

// Fungsi khusus buat nampilin hasil gacha biar gak ngerusak grid utama
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
    // 1. Cari itemnya (bisa dari koleksi gacha atau database utama)
    const item = myCollection.find(c => c.id_unique === id_unique) ||
        pcData.find(p => p.member === id_unique);

    if (!item) return;

    // 2. Cek apakah sudah ada di favorites (pake id_unique kalau ada, kalau nggak pake member)
    const itemKey = item.id_unique || item.member;
    const index = myFavorites.findIndex(f => (f.id_unique || f.member) === itemKey);

    if (index === -1) {
        myFavorites.push(item);
    } else {
        myFavorites.splice(index, 1);
    }

    localStorage.setItem('myFavorites', JSON.stringify(myFavorites));

    // 3. Refresh tampilan section yang sedang dibuka
    if (currentSection === 'all') {
        updateDisplay();
    } else {
        showSection(currentSection);
    }
}

document.querySelectorAll('.filter-group .filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const button = e.currentTarget;

        // Hanya hapus active di sesama tombol agensi
        document.querySelectorAll('.filter-group .filter-btn').forEach(b => b.classList.remove('active'));
        button.classList.add('active');

        currentActiveFilter = button.dataset.agency;
        applyCurrentFilter();
    });
});

function showDetail(idUnique) {
    // Cari di pcData ATAU myCollection
    const item = pcData.find(d => d.id_unique === idUnique) ||
        myCollection.find(d => d.id_unique === idUnique) ||
        myFavorites.find(d => d.id_unique === idUnique);

    if (!item) {
        console.error("Kartu tidak ditemukan ID:", idUnique);
        return;
    }

    // Tentukan rarityClass untuk modal
    let rarityClass = item.rarityClass || `rank-${item.rarity.replace(/\s+/g, '').toLowerCase()}`;

    // Tambahkan efek jika belum ada di rarityClass (untuk kartu dari pcData)
    if (!item.rarityClass) {
        if (["ULTRA RARE", "SECRET"].includes(item.rarity)) rarityClass += " card-shiny card-holo";
        else if (["RARE", "SUPER RARE"].includes(item.rarity)) rarityClass += " card-shiny";
    }

    const modal = document.getElementById('pc-modal');
    document.getElementById('modal-body').innerHTML = `
        <div class="modal-content-horizontal">
            <span class="close-modal-fixed" onclick="closeModal()">&times;</span>
            <div class="modal-left ${rarityClass}"> 
                <img src="${item.image}" alt="${item.member}">
            </div>
            <div class="modal-right">
                <span class="rarity-badge dynamic ${rarityClass.split(' ')[0]}">✨ ${item.rarity || item.displayRank}</span>
                <h2 class="member-name">${item.member}</h2>
                <p class="group-name">${item.group} • Official Collection</p>
                
                <div class="detail-grid">
                    <div class="detail-item">
                        <span>Era</span>
                        <strong>${item.era || 'Various Era'}</strong>
                    </div>
                    <div class="detail-item">
                        <span>Style</span>
                        <strong>${item.style || 'Original Style'}</strong>
                    </div>
                    <div class="detail-item">
                        <span>Agency</span>
                        <strong>${item.agency}</strong>
                    </div>
                    <div class="detail-item">
                        <span>Serial</span>
                        <strong>#${item.id_unique}</strong>
                    </div>
                </div>
            </div>
        </div>
    `;
    modal.style.display = "block"; // Pastikan modal muncul
}

function closeModal() {
    document.getElementById('pc-modal').style.display = "none";
}

loadData();