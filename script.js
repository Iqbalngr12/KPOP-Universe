let pcData = [];
let favorites = JSON.parse(localStorage.getItem('kpopFavs')) || [];
let currentActiveFilter = 'all';
let currentSearchKeyword = '';
const texts = ["PC COLLECTION", "BIAS GALLERY", "K-POP UNIVERSE"];
let count = 0;
let index = 0;
let currentText = "";
let letter = "";

async function loadData() {
    try {
        const response = await fetch('data.json');
        pcData = await response.json();

        // Update stats di button hero
        document.getElementById('total-stats').textContent = `${pcData.length} Cards Loaded`;

        renderCards(pcData);
        type(); // Jalankan animasi ngetik setelah data load
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
        container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:50px; opacity:0.5;">
            <p>Tidak ada photocard yang ditemukan.</p>
        </div>`;
        return;
    }

    data.forEach((item, index) => {
        const isFav = favorites.includes(item.member);
        const card = document.createElement('div');
        card.className = 'pc-card';
        card.style.animationDelay = `${index * 0.05}s`;

        card.innerHTML = `
            <div class="card-inner">
                <div class="card-back">
                    <img src="${item.logo}" alt="Logo">
                </div>
                <div class="card-front" onclick="showDetail('${item.member}')">
                    <button class="fav-btn ${isFav ? 'is-fav' : ''}" 
                            onclick="toggleFav(event, '${item.member}')">❤</button>
                    <img src="${item.image}" alt="${item.member}">
                    <div class="info">
                        <h3>${item.member}</h3>
                        <p>${item.group}</p>
                    </div>
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
    const big4 = ['SM', 'YG', 'JYP', 'HYBE'];
    let dataToRender;

    if (currentActiveFilter === 'favorites') {
        dataToRender = pcData.filter(item => favorites.includes(item.member));
    } else if (currentActiveFilter === 'other') {
        dataToRender = pcData.filter(item => !big4.includes(item.agency.toUpperCase()));
    } else if (currentActiveFilter === 'all') {
        dataToRender = pcData;
    } else {
        dataToRender = pcData.filter(item => item.agency.toUpperCase() === currentActiveFilter.toUpperCase());
    }

    if (currentSearchKeyword !== '') {
        dataToRender = dataToRender.filter(item =>
            item.member.toLowerCase().includes(currentSearchKeyword) ||
            item.group.toLowerCase().includes(currentSearchKeyword)
        );
    }

    renderCards(dataToRender);
}

function toggleFav(event, name) {
    event.stopPropagation();

    if (favorites.includes(name)) {
        favorites = favorites.filter(fav => fav !== name);
    } else {
        favorites.push(name);
    }

    localStorage.setItem('kpopFavs', JSON.stringify(favorites));

    applyCurrentFilter();
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    if (btn.id === 'show-favs') return;

    btn.addEventListener('click', (e) => {
        const button = e.currentTarget;

        const currentActiveBtn = document.querySelector('.filter-btn.active');
        if (currentActiveBtn) currentActiveBtn.classList.remove('active');
        button.classList.add('active');

        currentActiveFilter = button.dataset.agency;
        applyCurrentFilter();
    });
});

document.getElementById('show-favs').addEventListener('click', (e) => {
    const currentActiveBtn = document.querySelector('.filter-btn.active');
    if (currentActiveBtn) currentActiveBtn.classList.remove('active');
    e.target.classList.add('active');

    currentActiveFilter = 'favorites';
    applyCurrentFilter();
});

function showDetail(name) {

    const item = pcData.find(d => d.member === name);
    const modal = document.getElementById('pc-modal');

    document.getElementById('modal-body').innerHTML = `
        <img src="${item.image}" style="width:100%; border-radius:15px; box-shadow: 0 0 20px var(--primary);">
        <h2 style="margin-top:20px; letter-spacing: 2px;">${item.member}</h2>
        <p style="color:var(--secondary); font-weight: bold;">${item.group} | ${item.agency}</p>
        <hr style="margin: 15px 0; border: 0; border-top: 1px solid #333;">
        <p style="font-size:14px; opacity:0.8;">Era Comeback: <strong>${item.era || 'Latest Release'}</strong></p>
    `;

    modal.style.display = "block";
}

loadData();

document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('pc-modal').style.display = "none";
});

window.addEventListener('click', (event) => {
    const modal = document.getElementById('pc-modal');
    if (event.target === modal) {
        modal.style.display = "none";
    }
});