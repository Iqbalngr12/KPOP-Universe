import json
import random

groups = {
    "aespa": {
        "g_code": "AE",
        "agency": "SM Entertainment", 
        "logo": "assets/logos/aespa.png",
        "debut_song": "Black Mamba",
        "members": [
            {"full": "Giselle", "m_code": "GSL"}, 
            {"full": "Karina", "m_code": "KRN"},
            {"full": "Ningning", "m_code": "NNG"},
            {"full": "Winter", "m_code": "WTR"}
        ]
    },
    "BLACKPINK": {
        "g_code": "BP",
        "agency": "YG Entertainment", 
        "logo": "assets/logos/bp.png",
        "debut_song": "Whistle",
        "members": [
            {"full": "Jennie", "m_code": "JNE"}, 
            {"full": "Jisoo", "m_code": "JSO"},
            {"full": "Lisa", "m_code": "LIS"},
            {"full": "Rose", "m_code": "ROS"}
        ]
    },
    "BABYMONSTER": {
        "g_code": "BM",
        "agency": "YG Entertainment", 
        "logo": "assets/logos/bm.png", 
        "debut_song": "SHEESH",
        "members": [
            {"full": "Ahyeon", "m_code": "AHY"}, 
            {"full": "Asa", "m_code": "ASA"},
            {"full": "Chiquita", "m_code": "CHQ"},
            {"full": "Pharita", "m_code": "PHR"},
            {"full": "Rami", "m_code": "RAM"},
            {"full": "Ruka", "m_code": "RUK"},
            {"full": "Rora", "m_code": "ROR"}
        ]
    },
    "EVERGLOW": {
        "g_code": "EVG",
        "agency": "Yuehua Entertainment", 
        "logo": "assets/logos/everglow.png", 
        "debut_song": "Bon Bon Chocolat",
        "members": [
            {"full": "Aisha", "m_code": "AIS"}, 
            {"full": "E:U", "m_code": "EU"},
            {"full": "Mia", "m_code": "MIA"},
            {"full": "Onda", "m_code": "OND"},
            {"full": "Sihyeon", "m_code": "SIH"},
            {"full": "Yiren", "m_code": "YIR"}
        ]
    },
    "GFRIEND": {
        "g_code": "GFR",
        "agency": "Source Music ( HYBE Labels )", 
        "logo": "assets/logos/gfriend.png", 
        "debut_song": "Glass Bead",
        "members": [
            {"full": "Eunha", "m_code": "EUN"}, 
            {"full": "SinB", "m_code": "SIN"},
            {"full": "Sowon", "m_code": "SOW"},
            {"full": "Umji", "m_code": "UMJ"},
            {"full": "Yerin", "m_code": "YER"},
            {"full": "Yuju", "m_code": "YUJ"}
        ]
    },
    "Hearts2Hearts": {
        "g_code": "H2H",
        "agency": "SM Entertainment", 
        "logo": "assets/logos/h2h.png", 
        "debut_song": "The Chase",
        "members": [
            {"full": "A-na", "m_code": "ANA"}, 
            {"full": "Carmen", "m_code": "CRM"},
            {"full": "Ian", "m_code": "IAN"},
            {"full": "Jiwoo", "m_code": "JIW"},
            {"full": "Juun", "m_code": "JUN"},
            {"full": "Stela", "m_code": "STL"},
            {"full": "Ye-on", "m_code": "YON"},
            {"full": "Yuna", "m_code": "YUN"}
        ]
    },
    "ITZY": {
        "g_code": "ITZ",
        "agency": "JYP Entertainment", 
        "logo": "assets/logos/itzy.png", 
        "debut_song": "Dalla Dalla",
        "members": [
            {"full": "Chaeryeong", "m_code": "CRY"}, 
            {"full": "Lia", "m_code": "LIA"},
            {"full": "Ryujin", "m_code": "RYJ"},
            {"full": "Yeji", "m_code": "YEJ"},
            {"full": "Yuna", "m_code": "YUN"}
        ]
    },
    "i-dle": {
        "g_code": "IDLE",
        "agency": "Cube Entertainment", 
        "logo": "assets/logos/idle.png", 
        "debut_song": "LATATA",
        "members": [
            {"full": "Minnie", "m_code": "MIN"}, 
            {"full": "Miyeon", "m_code": "MIY"},
            {"full": "Shuhua", "m_code": "SHU"},
            {"full": "Soojin", "m_code": "SOO"},
            {"full": "Soyeon", "m_code": "SOY"},
            {"full": "Yuqi", "m_code": "YUQ"}
        ]
    },
    "IVE": {
        "g_code": "IVE",
        "agency": "Starship Entertainment", 
        "logo": "assets/logos/ive.png", 
        "debut_song": "ELEVEN",
        "members": [
            {"full": "Gaeul", "m_code": "GAE"}, 
            {"full": "Leeseo", "m_code": "LSO"},
            {"full": "Liz", "m_code": "LIZ"},
            {"full": "Rei", "m_code": "REI"},
            {"full": "Wonyoung", "m_code": "WNY"},
            {"full": "Yujin", "m_code": "YJN"}
        ]
    },
    "ILLIT": {
        "g_code": "ILT",
        "agency": "Belift Lab ( HYBE Labels )", 
        "logo": "assets/logos/illit.png", 
        "debut_song": "Magnetic",
        "members": [
            {"full": "Iroha", "m_code": "IRO"}, 
            {"full": "Minju", "m_code": "MNJ"},
            {"full": "Moka", "m_code": "MOK"},
            {"full": "Wonhee", "m_code": "WNH"},
            {"full": "Yunah", "m_code": "YNH"}
        ]
    },
    "LE SSERAFIM": {
        "g_code": "LSF",
        "agency": "Source Music ( HYBE Labels )", 
        "logo": "assets/logos/ls.png", 
        "debut_song": "FEARLESS",
        "members": [
            {"full": "Chaewon", "m_code": "CHW"}, 
            {"full": "Eunchae", "m_code": "ECH"},
            {"full": "Kazuha", "m_code": "KZH"},
            {"full": "Sakura", "m_code": "SKR"},
            {"full": "Yunjin", "m_code": "YNJ"}
        ]
    },
    "NewJeans": {
        "g_code": "NJ",
        "agency": "ADOR ( HYBE Labels )", 
        "logo": "assets/logos/nj.png", 
        "debut_song": "Attention",
        "members": [
            {"full": "Danielle", "m_code": "DNL"}, 
            {"full": "Haerin", "m_code": "HRN"},
            {"full": "Hanni", "m_code": "HNI"},
            {"full": "Hyein", "m_code": "HYN"},
            {"full": "Minji", "m_code": "MNJ"}
        ]
    },
    "NMIXX": {
        "g_code": "NMX",
        "agency": "JYP Entertainment", 
        "logo": "assets/logos/nmixx.png", 
        "debut_song": "O.O",
        "members": [
            {"full": "Bae", "m_code": "BAE"}, 
            {"full": "Jiwoo", "m_code": "JWO"},
            {"full": "Lily", "m_code": "LLY"},
            {"full": "Haewon", "m_code": "HWN"},
            {"full": "Sullyoon", "m_code": "SLY"}
        ]
    },
    "Red Velvet": {
        "g_code": "RV",
        "agency": "SM Entertainment", 
        "logo": "assets/logos/rv.png",
        "debut_song": "Happiness",
        "members": [
            {"full": "Irene", "m_code": "IRN"}, 
            {"full": "Joy", "m_code": "JOY"},
            {"full": "Seulgi", "m_code": "SLG"},
            {"full": "Wendy", "m_code": "WND"},
            {"full": "Yeri", "m_code": "YRI"}
        ]
    },
    "TWICE": {
        "g_code": "TWC",
        "agency": "JYP Entertainment", 
        "logo": "assets/logos/twice.png", 
        'debut_song': "Like OOH-AHH",
        "members": [
            {"full": "Chaeyoung", "m_code": "CHY"}, 
            {"full": "Dahyun", "m_code": "DHY"},
            {"full": "Jeongyeon", "m_code": "JYJ"},
            {"full": "Jihyo", "m_code": "JHY"},
            {"full": "Mina", "m_code": "MNA"},
            {"full": "Momo", "m_code": "MOM"},
            {"full": "Nayeon", "m_code": "NYN"},
            {"full": "Sana", "m_code": "SNA"},
            {"full": "Tzuyu", "m_code": "TZU"}
        ]
    }
}

award_pool = ["MAMA Awards", "Melon Music Awards", "Asia Artist Awards", "Golden Disc Awards", "Seoul Music Awards", "K-World Dream Awards", "Gaon Chart Music Awards", "KBS Song Festival", "SBS Gayo Daejeon", "MBC Music Festival", "The Fact Music Awards", "Korea Music Awards"]

style_map = {
    "Debut Era": {"rarity": "UNCOMMON", "s_code": "DB"},
    "Airport Fashion": {"rarity": "SUPER RARE", "s_code": "AP"},
    "Award Fashion": {"rarity": "ULTRA RARE", "s_code": "AW"},
    "Selca (Selfie)": {"rarity": "COMMON", "s_code": "SL"},
    "Stage Performance": {"rarity": "RARE", "s_code": "SP"},
    "Concert": {"rarity": "LIMITED", "s_code": "CC"},
    "Fansign": {"rarity": "SECRET", "s_code": "FS"}
}

pc_data = []
counter = 1

for group_name, info in groups.items():
    g_code = info["g_code"]
    debut_song = info["debut_song"]
    
    for m in info["members"]:
        m_name = m["full"]
        m_code = m["m_code"]
        
        for style_name, style_info in style_map.items():
            s_code = style_info["s_code"]
            rarity = style_info["rarity"]

            if style_name == "Debut Era":
                current_era = debut_song
            elif style_name == "Airport Fashion":
                current_era = "Airport Area"
            elif style_name == "Award Fashion":
                current_era = random.choice(award_pool)
            elif style_name == "Selca (Selfie)":
                current_era = "Holiday Special"
            elif style_name == "Stage Performance":
                current_era = "Comeback Stage"
            elif style_name == "Concert":
                current_era = "Tour Concert"
            elif style_name == "Fansign":
                current_era = "Special Event"
            else:
                current_era = "Special Collection"

            id_unique = f"{g_code}-{m_code}-{s_code}-{counter:03}"
            
            item = {
                "id_unique": id_unique,
                "member": m_name,
                "group": group_name,
                "agency": info["agency"],
                "rarity": rarity,
                "era": current_era,
                "style": style_name,
                "image": f"assets/members/{m_name.lower()}_{s_code.lower()}.jpg",
                "logo": info["logo"]
            }
            pc_data.append(item)
            counter += 1

with open('data.json', 'w') as f:
    json.dump(pc_data, f, indent=2)

print(f"✅ Berhasil! {len(pc_data)} data dibuat.")