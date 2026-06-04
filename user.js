let userData = JSON.parse(localStorage.getItem('kphotocard_user')) || {
    name: "K-Collector",
    avatar: "👤",
    favGroup: "all",
    topBias: ["all", "all", "all", "all", "all"]
};

let isEditMode = false;

// 🌟 INTEGRASI ENCHANTED: Menggabungkan Pengaturan Profil, Level, dan Showcase Piala RPG
async function renderProfileSection() {
    autoCheckAchievements()
    const container = document.getElementById('profile-container');
    if (!container) return;

    const totalOwned = myCollection.length;
    const totalXP = totalOwned * 10;
    let currentLevel = Math.floor(Math.sqrt(totalOwned / 2)) + 1;
    let nextLevelTarget = Math.pow(currentLevel, 2) * 2;
    let prevLevelTarget = Math.pow(currentLevel - 1, 2) * 2;
    let xpInLevel = totalOwned === 0 ? 0 : ((totalOwned - prevLevelTarget) / (nextLevelTarget - prevLevelTarget)) * 100;

    if (currentLevel > 50) {
        currentLevel = 50;
        xpInLevel = 100;
    }

    let badgesHTML = `<span class="badge-item newbie-badge">🐣 Newbie</span>`;

    if (currentLevel >= 50) {
        badgesHTML = `<span class="badge-item crown-badge">👑 God Collector</span>`;
    } else if (currentLevel >= 40) {
        badgesHTML = `<span class="badge-item addict-badge">🔥 PC Addict</span>`;
    } else if (currentLevel >= 30) {
        badgesHTML = `<span class="badge-item elite-badge">💎 Elite Collector</span>`;
    } else if (currentLevel >= 20) {
        badgesHTML = `<span class="badge-item stan-badge">✨ Stan Account</span>`;
    } else if (currentLevel >= 10) {
        badgesHTML = `<span class="badge-item fans-badge">🎵 KPOP Fans</span>`;
    }

    const uniqueGroups = [...new Set(pcData.map(item => item.group))].sort();
    const totalFavs = myFavorites.length;
    const totalWish = myWishlist.length;

    const groupCounts = myCollection.reduce((acc, card) => {
        acc[card.group] = (acc[card.group] || 0) + 1;
        return acc;
    }, {});

    let topGroup = "Belum Ada";
    let maxCount = 0;
    Object.entries(groupCounts).forEach(([grp, count]) => {
        if (count > maxCount) {
            maxCount = count;
            topGroup = grp;
        }
    });

    const isImage = userData.avatar.startsWith('data:image');
    const avatarHTML = isImage ? `<img src="${userData.avatar}" alt="avatar">` : userData.avatar;

    if (isEditMode) {
        // --- 1. MODE EDIT PROFIL (Panel Piala Disembunyikan Agar Rapi) ---
        container.innerHTML = `
            <div class="profile-card-header">
                <div class="profile-avatar-wrap" id="profile-avatar" onclick="triggerAvatarUpload()" title="Klik untuk upload foto">
                    ${avatarHTML}
                </div>
                <div class="profile-info-inputs">
                    <div class="profile-input-group">
                        <label>Collector Name</label>
                        <input type="text" id="user-name-input" value="${userData.name}" placeholder="Masukkan namamu...">
                    </div>
                    <div class="profile-input-group">
                        <label>Favorite Group</label>
                        <select id="user-group-select">
                            <option value="all" ${userData.favGroup === 'all' ? 'selected' : ''}>-- Pilih Grup Favorit --</option>
                            ${uniqueGroups.map(g => `<option value="${g}" ${userData.favGroup === g ? 'selected' : ''}>${g}</option>`).join('')}
                        </select>
                    </div>
                    <div class="profile-input-group">
                        <label>🏆 Top 5 Bias (Edit Mode)</label>
                        <div class="bias-inputs-list">
                            ${[1, 2, 3, 4, 5].map(num => `
                                <select class="user-bias-rank-select" data-rank="${num-1}">
                                    <option value="all">Rank ${num} Bias</option>
                                </select>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            ${renderStatsGridHTML(totalOwned, totalFavs, totalWish, topGroup)}

            <div style="display:flex; gap:10px;">
                <button class="btn-edit-profile-toggle" style="border-color: #888; color: #aaa; margin-top: 25px;" onclick="toggleEditMode(false)">❌ CANCEL</button>
                <button class="btn-save-profile" onclick="saveUserProfile()">💾 SAVE CHANGES</button>
            </div>
        `;
        updateAllBiasDropdowns(userData.topBias);

    } else {
        // --- 2. MODE PREVIEW UTAMA (Suntik Skuad Piala & Progress Bar Trophy Dinamis) ---
        let allAchievements = [];
        try {
            const res = await fetch('achievements.json');
            allAchievements = await res.json();
        } catch (err) {
            console.error("Gagal mengambil data list piala:", err);
        }

        const unlockedList = JSON.parse(localStorage.getItem('unlocked_achievements')) || [];
        const totalAcvCount = allAchievements.length;
        const unlockedAcvCount = unlockedList.length;
        const acvPercent = totalAcvCount > 0 ? Math.round((unlockedAcvCount / totalAcvCount) * 100) : 0;

        let achievementGridHTML = '';
        allAchievements.forEach(acv => {
            const isUnlocked = unlockedList.includes(acv.id);
            const isSecret = acv.secret === true;
            
            let statusClass = isUnlocked ? 'acv-card-unlocked' : 'acv-card-locked';
            let tierClass = `tier-${acv.tier.toLowerCase().replace(/\s+/g, '')}`;
            
            let displayTitle = (isSecret && !isUnlocked) ? "🔒 Secret Achievement" : acv.title;
            let displayDesc = (isSecret && !isUnlocked) ? "Misi ini masih misterius. Teruslah bermain gacha untuk memecahkannya!" : acv.description;

            achievementGridHTML += `
                <div class="profile-acv-card ${statusClass} ${tierClass}">
                    <div class="acv-card-header-inner">
                        <span class="acv-badge-tier">${acv.tier}</span>
                        <span class="acv-status-icon">${isUnlocked ? '✅' : '🔒'}</span>
                    </div>
                    <h4 class="acv-card-title">${displayTitle}</h4>
                    <p class="acv-card-desc">${displayDesc}</p>
                </div>
            `;
        });

        const showcaseCards = myFavorites.length > 0 ? myFavorites.slice(0, 3) : myCollection.slice(0, 3);
        let showcaseHTML = '';

        if (showcaseCards.length === 0) {
            showcaseHTML = `
                <div class="showcase-empty" style="grid-column: span 3; text-align: center; padding: 25px; border: 1px dashed rgba(255,255,255,0.1); border-radius: 8px; opacity: 0.5; font-size: 12px;">
                    Belum ada kartu untuk dipajang. Yuk, gacha atau tandai kartu favoritmu dulu!
                </div>
            `;
        } else {
            showcaseHTML = showcaseCards.map(card => `
                <div class="profile-showcase-card" onclick="showDetail('${card.id_unique}')" title="Klik untuk lihat detail kartu">
                    <img src="${card.image}" alt="${card.member}" onerror="this.style.display='none'">
                    <div class="showcase-card-badge">${card.rarity || 'COLLECTION'}</div>
                    <div class="showcase-card-name">${card.member}</div>
                </div>
            `).join('');
        }

        container.innerHTML = `
            <div class="profile-card-header">
                <div class="profile-avatar-wrap" style="cursor: default; border-style: solid;">
                    ${avatarHTML}
                </div>
                <div class="profile-info-inputs">
                    <div style="display:flex; justify-content:space-between; align-items:center; width: 100%; flex-wrap: wrap; gap: 10px;">
                        <div>
                            <label>Collector Name</label>
                            <div style="font-size: 24px; font-weight: 800; color: #fff; padding: 2px 0;">${userData.name}</div>
                        </div>
                        <div class="profile-badge-container" style="display: flex; gap: 8px; align-items: center;">
                            ${badgesHTML}
                            <span class="badge-item" style="background: rgba(255,255,255,0.08);">Lv. ${currentLevel}</span>
                        </div>
                    </div>
                    
                    <div class="profile-level-wrap" style="margin-top: 15px;">
                        <div class="level-info" style="display: flex; justify-content: space-between; font-size: 11px; color: var(--secondary); margin-bottom: 5px; font-weight: 600;">
                            <span>Progress Level</span>
                            <span>${totalOwned} / ${nextLevelTarget} Cards</span>
                        </div>
                        <div class="progress-bar-bg" style="height:8px; width:100%; background: rgba(255,255,255,0.05); border-radius:10px; overflow:hidden;">
                            <div class="progress-bar-fill" style="width: ${xpInLevel}%; height:100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); box-shadow: 0 0 8px var(--primary); transition: width 0.4s ease;"></div>
                        </div>
                    </div>

                    <div class="profile-input-group" style="margin-top: 15px;">
                        <label>Favorite Group</label>
                        <div style="font-size: 15px; font-weight: 600; color: var(--secondary); padding: 2px 0;">
                            ${userData.favGroup === 'all' ? 'Belum memilih grup' : userData.favGroup}
                        </div>
                    </div>
                    <div class="profile-input-group">
                        <label>🏆 Top 5 Bias (Klik nama untuk melihat koleksi)</label>
                        <div class="bias-display-badge-list">
                            ${userData.topBias.map((bias, idx) => `
                                <div class="bias-badge-item" ${bias !== 'all' ? 'onclick="clickBiasToFilter(\''+bias+'\')"' : ''}>
                                    Rank ${idx + 1}: <strong>${bias === 'all' ? '-' : bias}</strong>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            ${renderStatsGridHTML(totalOwned, totalFavs, totalWish, topGroup)}

            <div class="profile-showcase-container" style="margin-top: 25px;">
                <h3 style="font-size: 11px; font-weight: 700; letter-spacing: 1px; color: var(--secondary); opacity: 0.8; margin-bottom: 12px; text-transform: uppercase;">✨ My Valuable Showcase</h3>
                <div class="showcase-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; justify-items: center;">
                    ${showcaseHTML}
                </div>
            </div>

            <!-- 🏆 SEKSI INJEKSI: PROGRESS BAR PIALA DIGITAL -->
            <div class="profile-acv-progress-panel">
                <div class="acv-progress-label-row">
                    <span>🏆 Trophy Room Completion</span>
                    <strong>${acvPercent}%</strong>
                </div>
                <div class="acv-progress-bar-bg">
                    <div class="acv-progress-bar-fill" style="width: ${acvPercent}%"></div>
                </div>
            </div>

            <!-- 🏆 SEKSI INJEKSI: CABINET TROPHY GRID SHOWCASE ROOM -->
            <h3 style="font-size: 11px; font-weight: 700; letter-spacing: 1px; color: var(--secondary); opacity: 0.8; margin: 30px 0 12px 0; text-transform: uppercase; border-left: 3px solid var(--primary); padding-left: 8px;">🏅 Cabinet Trophy Showcase</h3>
            <div class="profile-achievements-grid">
                ${achievementGridHTML}
            </div>

            <button class="btn-edit-profile-toggle" onclick="toggleEditMode(true)" style="margin-top:30px;">✏️ EDIT PROFILE DATA</button>
        `;
    }
    updateTopWidgetDisplay();
}

function renderStatsGridHTML(owned, favs, wish, top) {
    return `
        <div class="profile-stats-grid">
            <div class="profile-stat-box"> <div class="profile-stat-num">${owned}</div> <div class="profile-stat-label">Total Cards</div> </div>
            <div class="profile-stat-box"> <div class="profile-stat-num">${favs}</div> <div class="profile-stat-label">Favorites ❤️</div> </div>
            <div class="profile-stat-box"> <div class="profile-stat-num">${wish}</div> <div class="profile-stat-label">Wishlist 💝</div> </div>
            <div class="profile-stat-box"> <div class="profile-stat-num" style="font-size: 14px; padding-top: 5px;">${top}</div> <div class="profile-stat-label">Top Collection</div> </div>
        </div>
    `;
}

function toggleEditMode(modeActive) {
    isEditMode = modeActive;
    renderProfileSection();
}

function triggerAvatarUpload() { document.getElementById('avatar-file-input').click(); }

function handleAvatarUpload(input) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { showToast("⚠️ Ukuran foto maksimal 1MB!"); return; }

    const reader = new FileReader();
    reader.onload = function (e) {
        const base64URL = e.target.result;
        const avatarWrap = document.getElementById('profile-avatar');
        if (avatarWrap) avatarWrap.innerHTML = `<img src="${base64URL}" alt="avatar">`;
        window._tempAvatarData = base64URL;
    };
    reader.readAsDataURL(file);
}

function updateAllBiasDropdowns(savedBiasArray = ["all", "all", "all", "all", "all"]) {
    const dropdowns = document.querySelectorAll('.user-bias-rank-select');
    
    const allKpopMembers = [];
    const seenMembers = new Set();

    pcData.forEach(item => {
        const uniqueKey = `${item.member} (${item.group})`;
        if (!seenMembers.has(uniqueKey)) {
            seenMembers.add(uniqueKey);
            allKpopMembers.push({
                valName: item.member,
                displayName: uniqueKey
            });
        }
    });

    allKpopMembers.sort((a, b) => a.displayName.localeCompare(b.displayName));

    dropdowns.forEach(select => {
        const index = parseInt(select.dataset.rank);
        const currentSavedValue = savedBiasArray[index] || "all";
        
        select.innerHTML = `<option value="all">Rank ${index + 1} Bias</option>`;
        
        allKpopMembers.forEach(m => {
            const option = document.createElement('option');
            option.value = m.valName;
            option.textContent = m.displayName;
            if (m.valName === currentSavedValue) option.selected = true;
            select.appendChild(option);
        });
    });
}

function updateTopWidgetDisplay() {
    const widgetImg = document.getElementById('widget-avatar-img');
    const widgetName = document.getElementById('widget-username');
    if (widgetName) widgetName.textContent = userData.name;
    if (widgetImg) {
        if (userData.avatar.startsWith('data:image')) {
            widgetImg.innerHTML = `<img src="${userData.avatar}" alt="user-pfp">`;
        } else { widgetImg.textContent = userData.avatar; }
    }
}

function saveUserProfile() {
    const nameInput = document.getElementById('user-name-input').value.trim();
    const groupSelect = document.getElementById('user-group-select').value;
    
    if (!nameInput) { showToast("⚠️ Nama tidak boleh kosong!"); return; }

    const biasDropdowns = document.querySelectorAll('.user-bias-rank-select');
    const newTopBiasArray = [];
    biasDropdowns.forEach(select => { newTopBiasArray.push(select.value); });

    const finalAvatar = window._tempAvatarData || userData.avatar;

    userData = {
        name: nameInput,
        avatar: finalAvatar,
        favGroup: groupSelect,
        topBias: newTopBiasArray
    };

    localStorage.setItem('kphotocard_user', JSON.stringify(userData));
    window._tempAvatarData = null;
    isEditMode = false;
    
    showToast("💾 Profile updated successfully!");
    renderProfileSection();
}

function clickBiasToFilter(biasName) {
    if (!biasName || biasName === 'all') return;

    showSection('collection');

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = biasName;
        currentSearchKeyword = biasName.toLowerCase();
        
        if (typeof updateClearBtn === 'function') updateClearBtn();
        if (typeof updateChips === 'function') updateChips();
    }

    filteredData = myCollection.filter(item =>
        item.member.toLowerCase().includes(currentSearchKeyword)
    );
    
    if (typeof updateDisplay === 'function') {
        updateDisplay();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(updateTopWidgetDisplay, 200);
});

function autoCheckAchievements() {
    let unlockedList = JSON.parse(localStorage.getItem('unlocked_achievements')) || [];
    const totalOwned = myCollection.length;
    
    if (totalOwned >= 1 && !unlockedList.includes('acv_total_1')) unlockedList.push('acv_total_1');
    if (totalOwned >= 10 && !unlockedList.includes('acv_total_10')) unlockedList.push('acv_total_10');
    if (totalOwned >= 30 && !unlockedList.includes('acv_total_30')) unlockedList.push('acv_total_30');
    if (totalOwned >= 50 && !unlockedList.includes('acv_total_50')) unlockedList.push('acv_total_50');
    if (totalOwned >= 100 && !unlockedList.includes('acv_total_100')) unlockedList.push('acv_total_100');
    if (totalOwned >= 300 && !unlockedList.includes('acv_total_300')) unlockedList.push('acv_total_300');
    if (totalOwned >= 500 && !unlockedList.includes('acv_total_500')) unlockedList.push('acv_total_500');

    localStorage.setItem('unlocked_achievements', JSON.stringify(unlockedList));
}