let userData = JSON.parse(localStorage.getItem('kphotocard_user')) || {
    name: "K-Collector",
    avatar: "👤",
    favGroup: "all",
    topBias: ["all", "all", "all", "all", "all"]
};

let isEditMode = false;

function renderProfileSection() {
    const container = document.getElementById('profile-container');
    if (!container) return;

    // Hitung Level & XP
    const totalOwned = myCollection.length;
    const totalXP = totalOwned * 10;
    let currentLevel = Math.floor(Math.sqrt(totalOwned / 2)) + 1;
    let nextLevelTarget = Math.pow(currentLevel, 2) * 2;
    let prevLevelTarget = Math.pow(currentLevel - 1, 2) * 2;
    let xpInLevel = ((totalOwned - prevLevelTarget) / (nextLevelTarget - prevLevelTarget)) * 100;

    if (currentLevel > 50) {
        currentLevel = 50;
        xpInLevel = 100;
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
        container.innerHTML = `
            <div class="profile-card-header">
                <div class="profile-avatar-wrap" style="cursor: default; border-style: solid;">
                    ${avatarHTML}
                </div>
                <div class="profile-info-inputs">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <label>Collector Name</label>
                            <div style="font-size: 22px; font-weight: 700; color: #fff;">${userData.name}</div>
                        </div>
                        <!-- Badge System -->
                        <div class="profile-badge-container">
                            <span class="badge-item">${totalOwned > 50 ? 'Elite Collector' : 'Newbie'}</span>
                            <span class="badge-item">Lv. ${currentLevel}</span>
                        </div>
                    </div>
                    
                    <!-- Level Bar -->
                    <div class="profile-level-wrap">
                        <div class="level-info">
                            <span>Level ${currentLevel}</span>
                            <span>${xpInLevel} / 100 XP</span>
                        </div>
                        <div class="progress-bar-bg" style="height:6px;">
                            <div class="progress-bar-fill" style="width: ${xpInLevel}%; background: var(--primary);"></div>
                        </div>
                    </div>

                    <div class="profile-input-group">
                        <label>🏆 Top 5 Bias</label>
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

            <!-- Showcase Gallery -->
            <div class="profile-showcase">
                <h3 style="font-size: 12px; opacity: 0.5; margin-bottom: 10px;">TOP BIAS SHOWCASE</h3>
                <div class="showcase-grid">
                    ${userData.topBias.slice(0, 3).map(bias => `
                        <div class="showcase-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--primary);">
                            <div style="font-size:10px; text-align:center; padding-top:40px; opacity:0.5;">${bias === 'all' ? 'Empty' : bias}</div>
                        </div>
                    `).join('')}
                </div>
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