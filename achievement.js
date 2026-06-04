let unlockedAchievements = JSON.parse(localStorage.getItem('unlocked_achievements')) || [];

function trackGachaAchievements(pulledCardsList, isMultiPull, pityCounterBeforeDrop) {
    const myCollection = JSON.parse(localStorage.getItem('myCollection')) || [];
    if (myCollection.length === 0) return;

    // --- KATEGORI TOTAL CARD MILESTONES ---
    if (myCollection.length >= 1) unlock("acv_total_1");
    if (myCollection.length >= 10) unlock("acv_total_10");
    if (myCollection.length >= 30) unlock("acv_total_30");
    if (myCollection.length >= 50) unlock("acv_total_50");
    if (myCollection.length >= 100) unlock("acv_total_100");
    if (myCollection.length >= 300) unlock("acv_total_300");
    if (myCollection.length >= 500) unlock("acv_total_500");
    if (typeof pcData !== 'undefined' && myCollection.length >= pcData.length) unlock("acv_total_all");

    // --- KATEGORI AGENSI ---
    const smCount = myCollection.filter(c => c.agency.includes("SM Entertainment")).length;
    const ygCount = myCollection.filter(c => c.agency.includes("YG Entertainment")).length;
    const jypCount = myCollection.filter(c => c.agency.includes("JYP Entertainment")).length;
    const hybeCount = myCollection.filter(c => c.agency.toUpperCase().includes("HYBE") || ["ADOR", "Source Music", "Belift Lab"].some(k => c.agency.includes(k))).length;
    const otherCount = myCollection.filter(c => !["SM ", "YG ", "JYP ", "HYBE"].some(k => c.agency.toUpperCase().includes(k)) && !["ADOR", "Source Music", "Belift Lab"].some(k => c.agency.includes(k))).length;

    if (smCount >= 10) unlock("acv_sm_10");
    if (smCount >= 25) unlock("acv_sm_25");
    if (ygCount >= 10) unlock("acv_yg_10");
    if (ygCount >= 15) unlock("acv_yg_15");
    if (jypCount >= 10) unlock("acv_jyp_10");
    if (jypCount >= 25) unlock("acv_jyp_25");
    if (hybeCount >= 10) unlock("acv_hybe_10");
    if (hybeCount >= 25) unlock("acv_hybe_25");
    if (otherCount >= 10) unlock("acv_other_10");
    if (otherCount >= 25) unlock("acv_other_25");

    if (typeof pcData !== 'undefined') {
        if (smCount > 0 && smCount === pcData.filter(c => c.agency.includes("SM Entertainment")).length) unlock("acv_sm_all");
        if (ygCount > 0 && ygCount === pcData.filter(c => c.agency.includes("YG Entertainment")).length) unlock("acv_yg_all");
        if (jypCount > 0 && jypCount === pcData.filter(c => c.agency.includes("JYP Entertainment")).length) unlock("acv_jyp_all");
        if (hybeCount > 0 && hybeCount === pcData.filter(c => c.agency.toUpperCase().includes("HYBE") || ["ADOR", "Source Music", "Belift Lab"].some(k => c.agency.includes(k))).length) unlock("acv_hybe_all");
        if (otherCount > 0 && otherCount === pcData.filter(c => !["SM ", "YG ", "JYP ", "HYBE"].some(k => c.agency.toUpperCase().includes(k)) && !["ADOR", "Source Music", "Belift Lab"].some(k => c.agency.includes(k))).length) unlock("acv_other_all");
    }

    // --- KATEGORI RARITY ---
    const countByRar = (rar) => myCollection.filter(c => c.rarity.toUpperCase().replace(/\s+/g, '') === rar.toUpperCase().replace(/\s+/g, '')).length;

    if (countByRar("COMMON") >= 10) unlock("acv_rare_common_10");
    if (countByRar("COMMON") >= 20) unlock("acv_rare_common_20");
    if (countByRar("UNCOMMON") >= 10) unlock("acv_rare_uncommon_10");
    if (countByRar("UNCOMMON") >= 20) unlock("acv_rare_uncommon_20");
    if (countByRar("RARE") >= 10) unlock("acv_rare_rare_10");
    if (countByRar("RARE") >= 20) unlock("acv_rare_rare_20");
    if (countByRar("SUPERRARE") >= 10) unlock("acv_rare_sr_10");
    if (countByRar("SUPERRARE") >= 20) unlock("acv_rare_sr_20");

    if (countByRar("ULTRARARE") >= 1) unlock("acv_rare_ur_first");
    if (countByRar("ULTRARARE") >= 10) unlock("acv_rare_ur_10");
    if (countByRar("ULTRARARE") >= 20) unlock("acv_rare_ur_20");

    if (countByRar("LIMITED") >= 1) unlock("acv_rare_lim_first");
    if (countByRar("LIMITED") >= 10) unlock("acv_rare_lim_10");
    if (countByRar("LIMITED") >= 20) unlock("acv_rare_lim_20");

    if (countByRar("SECRET") >= 1) unlock("acv_rare_sec_first");
    if (countByRar("SECRET") >= 10) unlock("acv_rare_sec_10");
    if (countByRar("SECRET") >= 20) unlock("acv_rare_sec_20");

    if (typeof pcData !== 'undefined') {
        if (countByRar("COMMON") > 0 && countByRar("COMMON") === pcData.filter(c => c.rarity === "COMMON").length) unlock("acv_rare_common_all");
        if (countByRar("UNCOMMON") > 0 && countByRar("UNCOMMON") === pcData.filter(c => c.rarity === "UNCOMMON").length) unlock("acv_rare_uncommon_all");
        if (countByRar("RARE") > 0 && countByRar("RARE") === pcData.filter(c => c.rarity === "RARE").length) unlock("acv_rare_rare_all");
        if (countByRar("SUPERRARE") > 0 && countByRar("SUPERRARE") === pcData.filter(c => c.rarity === "SUPER RARE").length) unlock("acv_rare_sr_all");
        if (countByRar("ULTRARARE") > 0 && countByRar("ULTRARARE") === pcData.filter(c => c.rarity === "ULTRA RARE").length) unlock("acv_rare_ur_all");
        if (countByRar("LIMITED") > 0 && countByRar("LIMITED") === pcData.filter(c => c.rarity === "LIMITED").length) unlock("acv_rare_lim_all");
        if (countByRar("SECRET") > 0 && countByRar("SECRET") === pcData.filter(c => c.rarity === "SECRET").length) unlock("acv_rare_sec_all");
    }

    // --- KATEGORI DINAMIS (NATION, LINES, GROUP COMPLETION) ---
    checkDynamicAchievements(myCollection);

    // --- KATEGORI LIVE PULL & PITY MECHANICALS ---
    if (pulledCardsList && pulledCardsList.length > 0) {
        const hasFirstPrint = pulledCardsList.some(c => c.id_unique.endsWith("-0001"));
        if (hasFirstPrint) unlock("sec_first_print");

        if (isMultiPull && pulledCardsList.length === 10) {
            const raritiesInPull = new Set(pulledCardsList.map(c => c.rarity));
            if (raritiesInPull.size >= 4) unlock("acv_pull_rainbow");

            const highRarityCount = pulledCardsList.filter(c => ["ULTRA RARE", "LIMITED", "SECRET"].includes(c.rarity)).length;
            if (highRarityCount >= 5) unlock("acv_pull_lucky5");

            const srPlusCount = pulledCardsList.filter(c => ["SUPER RARE", "ULTRA RARE", "LIMITED", "SECRET"].includes(c.rarity)).length;
            if (srPlusCount >= 5) unlock("sec_multipull_sr5");
        } else if (!isMultiPull) {
            const lastSingleCard = pulledCardsList[0];
            if (["ULTRA RARE", "SECRET"].includes(lastSingleCard.rarity)) {
                unlock("sec_single_believer");
            }
        }

        const topDrop = pulledCardsList.some(c => ["ULTRA RARE", "SECRET"].includes(c.rarity));
        if (topDrop && pityCounterBeforeDrop <= 20) unlock("sec_lucky_gacha");
        if (topDrop && pityCounterBeforeDrop >= 79) unlock("sec_unlucky_gacha");
    }
}

// 🚀 FUNGSI UTAMA BARU: Mengolah total data secara dinamis murni dari pcData (data.json)
function checkDynamicAchievements(inventory) {
    if (typeof pcData === 'undefined' || pcData.length === 0) return;

    const uniqueOwnedMembers = new Set(inventory.map(c => `${c.group}|${c.member}`));

    // Pelacak rasio Lini Negara & Posisi
    let totalJapanReq = 0,
        ownedJapan = 0;
    let totalGlobalReq = 0,
        ownedGlobal = 0;
    let totalKoreanReq = 0,
        ownedKorean = 0;

    let totalLeader = 0,
        ownedLeader = 0;
    let totalVisual = 0,
        ownedVisual = 0;
    let totalVocal = 0,
        ownedVocal = 0;
    let totalMaknae = 0,
        ownedMaknae = 0;
    let totalRapper = 0,
        ownedRapper = 0;
    let totalCenter = 0,
        ownedCenter = 0;
    let totalDancer = 0,
        ownedDancer = 0;

    let totalMembersPerGroup = {};
    let ownedMembersPerGroup = {};

    const processedMembers = new Set();

    pcData.forEach(card => {
        const groupName = card.group;
        const memberName = card.member;
        const memberKey = `${groupName}|${memberName}`;

        if (!totalMembersPerGroup[groupName]) {
            totalMembersPerGroup[groupName] = new Set();
            ownedMembersPerGroup[groupName] = new Set();
        }
        totalMembersPerGroup[groupName].add(memberName);
        if (uniqueOwnedMembers.has(memberKey)) {
            ownedMembersPerGroup[groupName].add(memberName);
        }

        if (processedMembers.has(memberKey)) return;
        processedMembers.add(memberKey);

        const isOwned = uniqueOwnedMembers.has(memberKey);
        const nations = card.nation || [];
        const lines = card.lines || [];

        // Evaluasi Negara
        if (nations.includes("japan")) { totalJapanReq++; if (isOwned) ownedJapan++; }
        if (nations.includes("global")) { totalGlobalReq++; if (isOwned) ownedGlobal++; }
        if (nations.includes("korean")) { totalKoreanReq++; if (isOwned) ownedKorean++; }

        // Evaluasi Posisi
        if (lines.includes("leader")) { totalLeader++; if (isOwned) ownedLeader++; }
        if (lines.some(l => l.includes("visual") || l === "fotg")) { totalVisual++; if (isOwned) ownedVisual++; }
        if (lines.includes("maknae")) { totalMaknae++; if (isOwned) ownedMaknae++; }
        if (lines.includes("center")) { totalCenter++; if (isOwned) ownedCenter++; }

        if (lines.some(l => l.includes("vocal"))) { totalVocal++; if (isOwned) ownedVocal++; }
        if (lines.some(l => l.includes("rapper"))) { totalRapper++; if (isOwned) ownedRapper++; }
        if (lines.some(l => l.includes("dancer"))) { totalDancer++; if (isOwned) ownedDancer++; }
    });

    // Unlock piala Lini Negara
    if (ownedJapan > 0 && ownedJapan === totalJapanReq) unlock("acv_line_japan");
    if (ownedGlobal > 0 && ownedGlobal === totalGlobalReq) unlock("acv_line_global");
    if (ownedKorean > 0 && ownedKorean === totalKoreanReq) unlock("acv_line_korean");

    // Unlock piala Lini Posisi (Semua murni dinilai pas ALL COLLECTED)
    if (ownedLeader > 0 && ownedLeader === totalLeader) unlock("acv_line_leader");
    if (ownedVisual > 0 && ownedVisual === totalVisual) unlock("acv_line_visual");
    if (ownedVocal > 0 && ownedVocal === totalVocal) unlock("acv_line_vocal");
    if (ownedMaknae > 0 && ownedMaknae === totalMaknae) unlock("acv_line_maknae");
    if (ownedRapper > 0 && ownedRapper === totalRapper) unlock("acv_line_rapper");
    if (ownedCenter > 0 && ownedCenter === totalCenter) unlock("acv_line_center");
    if (ownedDancer > 0 && ownedDancer === totalDancer) unlock("acv_line_dancer"); // Hanya cek versi ALL

    // Evaluasi piala kelengkapan grup
    let completedGroupsCount = 0;
    for (const groupName in totalMembersPerGroup) {
        if (totalMembersPerGroup[groupName].size === ownedMembersPerGroup[groupName].size) {
            completedGroupsCount++;
        }
    }

    if (completedGroupsCount >= 1) unlock("acv_complete_g1");
    if (completedGroupsCount >= 5) unlock("acv_complete_g5");
    if (completedGroupsCount >= 10) unlock("acv_complete_g10");
}

function checkProfileAchievements() {
    const topBiasList = JSON.parse(localStorage.getItem('top_bias_list')) || [];
    if (topBiasList.length === 5 && topBiasList.every(b => b && b !== "-")) {
        unlock("sec_bias_loyal");
    }

    const editCount = parseInt(localStorage.getItem('profile_edit_counter')) || 0;
    if (editCount >= 5) unlock("sec_identity_crisis");
}

function unlock(id) {
    if (unlockedAchievements.includes(id)) return;
    unlockedAchievements.push(id);
    localStorage.setItem('unlocked_achievements', JSON.stringify(unlockedAchievements));

    if (typeof triggerAchievementPopup === 'function') {
        triggerAchievementPopup(id);
    }
}