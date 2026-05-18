// ============================================================
// GACHA.JS — Pity system, single pull, multi pull, cinematic
// ============================================================

// --- GACHA STATE ---
let pityData = JSON.parse(localStorage.getItem('pityData')) || {
    pullCount: 0,
    totalPulls: 0,
    lastHighRarity: null
};

let isMultiPulling = false;

const PITY_HARD = 50;
const PITY_SOFT = 35;

// ============================================================
// PITY SYSTEM
// ============================================================

function rollWithPity() {
    const pull = pityData.pullCount;

    // Hard pity
    if (pull >= PITY_HARD) {
        return { rankLabel: "ULTRA RARE", rankClass: "rank-ultrarare", rarityTier: "legendary" };
    }

    let rand = Math.random() * 100;

    // Soft pity — rate naik 3% tiap pull setelah pull ke-35
    if (pull >= PITY_SOFT) {
        const boost = (pull - PITY_SOFT) * 3;
        rand = rand * (1 - boost / 100);
    }

    if (rand <= 1) return { rankLabel: "SECRET", rankClass: "rank-secret", rarityTier: "secret" };
    if (rand <= 5) return { rankLabel: "LIMITED", rankClass: "rank-limited", rarityTier: "legendary" };
    if (rand <= 10) return { rankLabel: "ULTRA RARE", rankClass: "rank-ultrarare", rarityTier: "legendary" };
    if (rand <= 25) return { rankLabel: "SUPER RARE", rankClass: "rank-superrare", rarityTier: "epic" };
    if (rand <= 45) return { rankLabel: "RARE", rankClass: "rank-rare", rarityTier: "rare" };
    if (rand <= 70) return { rankLabel: "UNCOMMON", rankClass: "rank-uncommon", rarityTier: "uncommon" };
    return { rankLabel: "COMMON", rankClass: "rank-common", rarityTier: "common" };
}

function buildCard(rankLabel, rankClass) {
    let finishEffect = "";
    if (["SECRET", "LIMITED", "ULTRA RARE"].includes(rankLabel)) finishEffect = " card-shiny card-holo";
    else if (["RARE", "SUPER RARE"].includes(rankLabel)) finishEffect = " card-shiny";

    const base = pcData[Math.floor(Math.random() * pcData.length)];
    const uniqueId = "GACHA-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);

    return {
        ...base,
        id_unique: uniqueId,
        rarity: rankLabel,
        rarityClass: `${rankClass}${finishEffect}`,
        date_obtained: new Date().toLocaleDateString()
    };
}

function processPull(rankLabel) {
    pityData.pullCount++;
    pityData.totalPulls++;
    if (["ULTRA RARE", "LIMITED", "SECRET"].includes(rankLabel)) {
        pityData.pullCount = 0;
        pityData.lastHighRarity = rankLabel;
    }
}

function savePity() {
    localStorage.setItem('pityData', JSON.stringify(pityData));
    updatePityDisplay();
}

// ============================================================
// SINGLE PULL — dengan cinematic reveal
// ============================================================

function getGacha() {
    if (isMultiPulling) return;

    const btn = document.querySelector('.pull-btn-single');
    if (btn) btn.disabled = true;

    const result = rollWithPity();
    processPull(result.rankLabel);

    const card = buildCard(result.rankLabel, result.rankClass);
    myCollection.unshift(card);
    localStorage.setItem('myCollection', JSON.stringify(myCollection));
    savePity();

    startCinematicReveal(card, result.rarityTier, () => {
        if (btn) btn.disabled = false;
    });
}

// ============================================================
// MULTI PULL — 5 atau 10 sekaligus
// ============================================================

function multiPull(count) {
    if (isMultiPulling) return;
    isMultiPulling = true;

    document.querySelectorAll('.pull-btn').forEach(b => {
        b.disabled = true;
        b.style.opacity = '0.5';
    });

    const results = [];
    for (let i = 0; i < count; i++) {
        const result = rollWithPity();
        processPull(result.rankLabel);
        const card = buildCard(result.rankLabel, result.rankClass);
        result.card = card;
        myCollection.unshift(card);
        results.push(result);
    }

    localStorage.setItem('myCollection', JSON.stringify(myCollection));
    savePity();

    showMultiPullResult(results, () => {
        isMultiPulling = false;
        document.querySelectorAll('.pull-btn').forEach(b => {
            b.disabled = false;
            b.style.opacity = '1';
        });
    });
}

// ============================================================
// MULTI PULL RESULT SCREEN
// ============================================================

function showMultiPullResult(results, onClose) {
    const rarityOrder = { "SECRET": 7, "LIMITED": 6, "ULTRA RARE": 5, "SUPER RARE": 4, "RARE": 3, "UNCOMMON": 2, "COMMON": 1 };
    const sorted = [...results].sort((a, b) => rarityOrder[b.rankLabel] - rarityOrder[a.rankLabel]);

    const overlay = document.createElement('div');
    overlay.className = 'multipull-overlay';
    overlay.innerHTML = `
        <div class="multipull-bg"></div>
        <div class="multipull-content">
            <div class="multipull-header">
                <h2>${results.length} PULL RESULTS</h2>
                <p class="multipull-sub">Tap a card to see detail</p>
            </div>
            <div class="multipull-grid">
                ${sorted.map((r, i) => `
                    <div class="multipull-card ${r.card.rarityClass}"
                         style="animation-delay:${i * 0.08}s"
                         onclick="closeMPAndShowDetail('${r.card.id_unique}')">
                        <div class="mp-card-img">
                            <img src="${r.card.image}" alt="${r.card.member}">
                            ${["SECRET","LIMITED","ULTRA RARE"].includes(r.rankLabel) ? '<div class="mp-holo-overlay"></div>' : ''}
                        </div>
                        <div class="mp-card-info">
                            <span class="mp-rarity" style="color:${getRarityColor(r.rankLabel)}">${r.rankLabel}</span>
                            <span class="mp-name">${r.card.member}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="multipull-actions">
                <button class="mp-close-btn" onclick="closeMultiPull()">CLOSE</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    window._multiPullOverlay  = overlay;
    window._multiPullOnClose  = onClose;
    requestAnimationFrame(() => overlay.classList.add('active'));
}

function closeMultiPull() {
    const overlay = window._multiPullOverlay;
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 400);
    }
    if (window._multiPullOnClose) {
        window._multiPullOnClose();
        window._multiPullOnClose = null;
    }
}

function closeMPAndShowDetail(idUnique) {
    closeMultiPull();
    setTimeout(() => showDetail(idUnique), 300);
}

function getRarityColor(rarity) {
    const colors = {
        "SECRET":"#ff007a", "LIMITED":"#c906bf", "ULTRA RARE":"#b70404",
        "SUPER RARE":"#d0cd1e", "RARE":"#00f2ff", "UNCOMMON":"#2ecc71", "COMMON":"#888"
    };
    return colors[rarity] || "#fff";
}

// ============================================================
// PITY UI
// ============================================================

function updatePityDisplay() {
    const pityBar     = document.getElementById('pity-bar-fill');
    const pityCount   = document.getElementById('pity-count');
    const pityWarning = document.getElementById('pity-warning');
    const pityTotal   = document.getElementById('pity-total');

    if (!pityBar) return;

    const progress = (pityData.pullCount / PITY_HARD) * 100;
    pityBar.style.width = progress + '%';

    if (pityData.pullCount >= PITY_SOFT) {
        pityBar.style.background = 'linear-gradient(90deg, #ffd700, #ff007a)';
        if (pityWarning) pityWarning.style.display = 'block';
    } else {
        pityBar.style.background = 'linear-gradient(90deg, #00f2ff, #9b59b6)';
        if (pityWarning) pityWarning.style.display = 'none';
    }

    if (pityCount) pityCount.textContent = `${pityData.pullCount} / ${PITY_HARD}`;
    if (pityTotal) pityTotal.textContent = pityData.totalPulls;
}

function injectPityUI() {
    if (document.getElementById('pity-tracker')) return;

    const container = document.getElementById('pc-container');
    if (!container) return;

    // Pull buttons row
    const pullRow = document.createElement('div');
    pullRow.className = 'pull-buttons-row';
    pullRow.innerHTML = `
        <button class="pull-btn pull-btn-single" onclick="getGacha()">
            <span class="pull-icon">🎲</span>
            <span class="pull-label">1 PULL</span>
        </button>
        <button class="pull-btn pull-btn-five" onclick="multiPull(5)">
            <span class="pull-icon">✨</span>
            <span class="pull-label">5 PULL</span>
        </button>
        <button class="pull-btn pull-btn-ten" onclick="multiPull(10)">
            <span class="pull-icon">💎</span>
            <span class="pull-label">10 PULL</span>
            <span class="pull-badge">BEST VALUE</span>
        </button>
    `;

    // Pity tracker
    const pityUI = document.createElement('div');
    pityUI.id = 'pity-tracker';
    pityUI.className = 'pity-tracker';
    pityUI.innerHTML = `
        <div class="pity-header">
            <span class="pity-title">⚡ PITY TRACKER</span>
            <span id="pity-count" class="pity-count">${pityData.pullCount} / ${PITY_HARD}</span>
        </div>
        <div class="pity-bar-bg">
            <div class="pity-bar-fill" id="pity-bar-fill"></div>
        </div>
        <div class="pity-labels">
            <span>0</span>
            <span class="soft-marker">Soft ${PITY_SOFT}</span>
            <span>Hard ${PITY_HARD}</span>
        </div>
        <div class="pity-warning" id="pity-warning" style="display:none;">
            🔥 Soft pity aktif! Rate ULTRA RARE+ sedang meningkat!
        </div>
        <div class="pity-stats">
            <span>Total Pulls: <strong id="pity-total">${pityData.totalPulls}</strong></span>
            ${pityData.lastHighRarity ? `<span>Last High: <strong>${pityData.lastHighRarity}</strong></span>` : ''}
        </div>
    `;

    // Insert sebelum gacha area
    container.parentNode.insertBefore(pullRow, container);
    container.parentNode.insertBefore(pityUI, container);

    // Sembunyikan tombol gacha lama
    const oldBtn = document.getElementById('gacha-control');
    if (oldBtn) oldBtn.style.display = 'none';

    updatePityDisplay();
}

// ============================================================
// CINEMATIC REVEAL
// ============================================================

function startCinematicReveal(item, rarityTier, onComplete) {
    const overlay = document.createElement('div');
    overlay.className = `gacha-cinematic-overlay rarity-${rarityTier}`;
    overlay.innerHTML = `
        <div class="cinematic-bg"></div>
        <div class="particle-container" id="particle-container"></div>
        <div class="light-burst" id="light-burst"></div>
        <div class="cinematic-content">
            <div class="rarity-announce" id="rarity-announce">
                <span class="rarity-label">${item.rarity}</span>
            </div>
            <div class="gacha-card-wrapper" id="gacha-card-wrapper">
                <div class="gacha-card-3d ${item.rarityClass}" id="gacha-card-3d">
                    <div class="gacha-card-face gacha-card-back">
                        <img src="${item.logo}" alt="logo">
                        <div class="card-back-shine"></div>
                    </div>
                    <div class="gacha-card-face gacha-card-front">
                        <img src="${item.image}" alt="${item.member}">
                    </div>
                </div>
                <div class="tap-hint" id="tap-hint">TAP TO REVEAL ✨</div>
            </div>
            <div class="card-info-reveal" id="card-info-reveal">
                <h2>${item.member}</h2>
                <p>${item.group}</p>
                <button class="btn-view-detail" onclick="closeCinematicAndShowDetail('${item.id_unique}')">
                    VIEW DETAIL →
                </button>
                <button class="btn-close-cinematic" onclick="closeCinematic()">CLOSE</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    window._currentCinematicOverlay = overlay;
    window._cinematicOnComplete     = onComplete;

    requestAnimationFrame(() => {
        overlay.classList.add('active');
        spawnParticles(rarityTier);

        setTimeout(() => document.getElementById('light-burst')?.classList.add('burst'), 300);
        setTimeout(() => document.getElementById('rarity-announce')?.classList.add('visible'), 600);
        setTimeout(() => {
            document.getElementById('gacha-card-wrapper')?.classList.add('visible');
            document.getElementById('tap-hint')?.classList.add('visible');
        }, 1200);

        setTimeout(() => {
            const card3d  = document.getElementById('gacha-card-3d');
            const tapHint = document.getElementById('tap-hint');
            let flipped   = false;

            card3d?.addEventListener('click', () => {
                if (flipped) return;
                flipped = true;
                tapHint?.classList.remove('visible');
                card3d.classList.add('flipped');
                playCardSound(item.rarity);
                spawnBurstParticles(rarityTier);
                setTimeout(() => document.getElementById('card-info-reveal')?.classList.add('visible'), 600);
            });
        }, 1500);
    });
}

function spawnParticles(rarityTier) {
    const container = document.getElementById('particle-container');
    if (!container) return;

    const colors = {
        secret:    ['#ff007a', '#00f2ff', '#ffffff', '#ffd700'],
        legendary: ['#ffd700', '#ff8c00', '#ffffff', '#ff007a'],
        epic:      ['#9b59b6', '#00f2ff', '#ffffff'],
        rare:      ['#3498db', '#00f2ff', '#ffffff'],
        uncommon:  ['#2ecc71', '#ffffff'],
        common:    ['#888', '#aaa', '#ffffff']
    };

    const palette = colors[rarityTier] || colors.common;
    const count   = rarityTier === 'secret' ? 80 : rarityTier === 'legendary' ? 60 : rarityTier === 'epic' ? 40 : 20;

    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const p = document.createElement('div');
            p.className = 'cin-particle';
            p.style.cssText = `
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                background: ${palette[Math.floor(Math.random() * palette.length)]};
                width: ${Math.random() * 6 + 2}px;
                height: ${Math.random() * 6 + 2}px;
                animation-duration: ${Math.random() * 3 + 2}s;
                animation-delay: ${Math.random() * 0.5}s;
            `;
            container.appendChild(p);
        }, i * 30);
    }
}

function spawnBurstParticles(rarityTier) {
    const container = document.getElementById('particle-container');
    if (!container) return;

    const colors = {
        secret:    ['#ff007a', '#00f2ff', '#ffffff', '#ffd700'],
        legendary: ['#ffd700', '#ff8c00', '#ffffff'],
        epic:      ['#9b59b6', '#ffffff'],
        rare:      ['#3498db', '#ffffff'],
        uncommon:  ['#2ecc71', '#ffffff'],
        common:    ['#aaa', '#ffffff']
    };

    const palette = colors[rarityTier] || colors.common;

    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'cin-particle burst-particle';
        const angle    = (i / 30) * 360;
        const distance = Math.random() * 200 + 100;
        p.style.cssText = `
            left: 50%; top: 45%;
            background: ${palette[Math.floor(Math.random() * palette.length)]};
            width: ${Math.random() * 8 + 3}px;
            height: ${Math.random() * 8 + 3}px;
            --angle: ${angle}deg;
            --distance: ${distance}px;
            animation: burst-fly 1s ease-out forwards;
        `;
        container.appendChild(p);
    }
}

function closeCinematic() {
    const overlay = window._currentCinematicOverlay;
    if (overlay) {
        overlay.classList.add('closing');
        setTimeout(() => overlay.remove(), 500);
        window._currentCinematicOverlay = null;
    }
    if (window._cinematicOnComplete) {
        window._cinematicOnComplete();
        window._cinematicOnComplete = null;
    }
}

function closeCinematicAndShowDetail(idUnique) {
    closeCinematic();
    setTimeout(() => showDetail(idUnique), 300);
}