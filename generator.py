import json
import random
import re

groups = {
    "aespa": {
        "g_code": "AE", "agency": "SM Entertainment", "logo": "aespa.png", "gender": "girlgroups", "debut_song": "Black Mamba",
        "members": [
            {"full": "Giselle", "m_code": "GSL", "origin_country": ["japan", "korean"], "lines": ["main_rapper", "sub_vocal"]}, 
            {"full": "Karina", "m_code": "KRN", "origin_country": ["korean"], "lines": ["leader", "main_dancer", "lead_rapper", "sub_vocal", "visual","fotg", "center"]},
            {"full": "Ningning", "m_code": "NNG", "origin_country": ["china"], "lines": ["main_vocal", "maknae"]},
            {"full": "Winter", "m_code": "WTR", "origin_country": ["korean"], "lines": ["main_vocal", "lead_dancer", "visual"]}
        ]
    },
    "BLACKPINK": {
        "g_code": "BP", "agency": "YG Entertainment", "logo": "bp.png", "gender": "girlgroups", "debut_song": "Whistle",
        "members": [
            {"full": "Jennie", "m_code": "JNE", "origin_country": ["korean"], "lines": ["main_rapper", "lead_vocal"]}, 
            {"full": "Jisoo", "m_code": "JSO", "origin_country": ["korean"], "lines": ["lead_vocal", "visual"]},
            {"full": "Lisa", "m_code": "LIS", "origin_country": ["thailand"], "lines": ["main_dancer", "lead_rapper", "sub_vocal", "maknae"]},
            {"full": "Rose", "m_code": "ROS", "origin_country": ["korean", "new_zealand"], "lines": ["main_vocal", "lead_dancer"]}
        ]
    },
    "BABYMONSTER": {
        "g_code": "BM", "agency": "YG Entertainment", "logo": "bm.png", "gender": "girlgroups", "debut_song": "SHEESH",
        "members": [
            {"full": "Ahyeon", "m_code": "AHY", "origin_country": ["korean"], "lines": ["main_vocal", "rapper", "dancer", "visual", "center"]}, 
            {"full": "Asa", "m_code": "ASA", "origin_country": ["japan"], "lines": ["main_rapper", "vocal","dancer"]},
            {"full": "Chiquita", "m_code": "CHQ", "origin_country": ["thailand"], "lines": ["vocal", "dancer", "rapper", "maknae"]},
            {"full": "Pharita", "m_code": "PHR", "origin_country": ["thailand"], "lines": ["vocal"]},
            {"full": "Rami", "m_code": "RAM", "origin_country": ["korean"], "lines": ["main_vocal"]},
            {"full": "Ruka", "m_code": "RUK", "origin_country": ["japan"], "lines": ["main_dancer", "main_rapper"]},
            {"full": "Rora", "m_code": "ROR", "origin_country": ["korean"], "lines": ["lead_vocal", "visual"]},
        ]
    },
    "EVERGLOW": {
        "g_code": "EVG", "agency": "Yuehua Entertainment", "logo": "everglow.png", "gender": "girlgroups", "debut_song": "Bon Bon Chocolat",
        "members": [
            {"full": "Aisha", "m_code": "AIS", "origin_country": ["korean"], "lines": ["lead_rapper", "lead_dancer", "visual", "fotg", "maknae"]}, 
            {"full": "E:U", "m_code": "EU", "origin_country": ["korean"], "lines": ["main_rapper", "main_dancer"]},
            {"full": "Mia", "m_code": "MIA", "origin_country": ["korean"], "lines": ["main_vocal", "main_dancer"]},
            {"full": "Onda", "m_code": "OND", "origin_country": ["korean"], "lines": ["lead_dancer"]},
            {"full": "Sihyeon", "m_code": "SIH", "origin_country": ["korean"], "lines": ["leader", "lead_vocal", "fotg"]},
            {"full": "Yiren", "m_code": "YIR", "origin_country": ["china"], "lines": ["lead_dancer","visual", "center", "fotg", "maknae"]}
        ]
    },
    "GFRIEND": {
        "g_code": "GFR", "agency": "Source Music ( HYBE Labels )", "logo": "gfriend.png", "gender": "girlgroups", "debut_song": "Glass Bead",
        "members": [
            {"full": "Eunha", "m_code": "EUN", "origin_country": ["korean"], "lines": ["lead_vocal"]}, 
            {"full": "SinB", "m_code": "SIN", "origin_country": ["korean"], "lines": ["main_dancer", "vocal", "center"]},
            {"full": "Sowon", "m_code": "SOW", "origin_country": ["korean"], "lines": ["leader", "vocal", "visual"]},
            {"full": "Umji", "m_code": "UMJ", "origin_country": ["korean"], "lines": ["vocal", "maknae"]},
            {"full": "Yerin", "m_code": "YER", "origin_country": ["korean"], "lines": ["lead_dancer", "vocal", "center", "fotg"]},
            {"full": "Yuju", "m_code": "YUJ", "origin_country": ["korean"], "lines": ["main_vocal"]}
        ]
    },
    "Hearts2Hearts": {
        "g_code": "H2H", "agency": "SM Entertainment", "logo": "h2h.png", "gender": "girlgroups", "debut_song": "The Chase",
        "members": [
            {"full": "A-na", "m_code": "ANA", "origin_country": ["korean"], "lines": ["rapper", "vocal", "visual"]}, 
            {"full": "Carmen", "m_code": "CRM", "origin_country": ["indonesia"], "lines": ["vocal"]},
            {"full": "Ian", "m_code": "IAN", "origin_country": ["korean"], "lines": ["dancer", "vocal", "visual", "center"]},
            {"full": "Jiwoo", "m_code": "JIW", "origin_country": ["korean"], "lines": ["leader", "dancer", "rapper", "vocal", "visual"]},
            {"full": "Juun", "m_code": "JUN", "origin_country": ["korean"], "lines": ["main_dancer", "vocal", "rapper"]},
            {"full": "Stela", "m_code": "STL", "origin_country": ["korean", "canada"], "lines": ["vocal"]},
            {"full": "Ye-on", "m_code": "YON", "origin_country": ["korean"], "lines": ["vocal", "maknae"]},
            {"full": "Yuha", "m_code": "YUH", "origin_country": ["korean"], "lines": ["vocal", "dancer"]}
        ]
    },
    "ITZY": {
        "g_code": "ITZ", "agency": "JYP Entertainment", "logo": "itzy.png", "gender": "girlgroups", "debut_song": "Dalla Dalla",
        "members": [
            {"full": "Chaeryeong", "m_code": "CRY", "origin_country": ["korean"], "lines": ["main_dancer", "sub_vocal", "sub_rapper"]}, 
            {"full": "Lia", "m_code": "LIA", "origin_country": ["korean"], "lines": ["main_vocal", "sub_rapper"]},
            {"full": "Ryujin", "m_code": "RYJ", "origin_country": ["korean"], "lines": ["main_rapper", "lead_dancer", "sub_vocal", "center"]},
            {"full": "Yeji", "m_code": "YEJ", "origin_country": ["korean"], "lines": ["leader", "main_dancer", "lead_vocal", "sub_rapper"]},
            {"full": "Yuna", "m_code": "YUN", "origin_country": ["korean"], "lines": ["lead_rapper", "lead_dancer", "sub_vocal", "visual", "maknae"]}
        ]
    },
    "i-dle": {
        "g_code": "IDLE", "agency": "Cube Entertainment", "logo": "idle.png", "gender": "girlgroups", "debut_song": "LATATA",
        "members": [
            {"full": "Minnie", "m_code": "MIN", "origin_country": ["thailand"], "lines": ["main_vocal"]}, 
            {"full": "Miyeon", "m_code": "MIY", "origin_country": ["korean"], "lines": ["main_vocal", "visual"]},
            {"full": "Shuhua", "m_code": "SHU", "origin_country": ["taiwan"], "lines": ["sub_vocal", "visual", "maknae"]},
            {"full": "Soojin", "m_code": "SOO", "origin_country": ["korean"], "lines": ["main_dancer", "sub_vocal", "sub_rapper"]},
            {"full": "Soyeon", "m_code": "SOY", "origin_country": ["korean"], "lines": ["leader", "main_rapper", "sub_vocal", "center"]},
            {"full": "Yuqi", "m_code": "YUQ", "origin_country": ["china"], "lines": ["main_dancer", "sub_vocal", "sub_rapper", "fotg"]},
        ]
    },
    "IVE": {
        "g_code": "IVE", "agency": "Starship Entertainment", "logo": "ive.png", "gender": "girlgroups", "debut_song": "ELEVEN",
        "members": [
            {"full": "Gaeul", "m_code": "GAE", "origin_country": ["korean"], "lines": ["main_dancer", "lead_rapper", "sub_vocal"]}, 
            {"full": "Leeseo", "m_code": "LSO", "origin_country": ["korean"], "lines": ["sub_vocal", "maknae"]},
            {"full": "Liz", "m_code": "LIZ", "origin_country": ["korean"], "lines": ["main_vocal"]},
            {"full": "Rei", "m_code": "REI", "origin_country": ["japan"], "lines": ["main_rapper", "sub_vocal"]},
            {"full": "Wonyoung", "m_code": "WNY", "origin_country": ["korean"], "lines": ["vocal", "dancer", "visual"]},
            {"full": "Yujin", "m_code": "YJN", "origin_country": ["korean"], "lines": ["leader", "main_vocal", "main_dancer"]}
        ]
    },
    "ILLIT": {
        "g_code": "ILT", "agency": "Belift Lab ( HYBE Labels )", "logo": "illit.png", "gender": "girlgroups", "debut_song": "Magnetic",
        "members": [
            {"full": "Iroha", "m_code": "IRO", "origin_country": ["japan"], "lines": ["main_dancer", "vocal", "maknae"]}, 
            {"full": "Minju", "m_code": "MNJ", "origin_country": ["korean"], "lines": ["main_vocal", "lead_dancer", "fotg"]},
            {"full": "Moka", "m_code": "MOK", "origin_country": ["japan"], "lines": ["sub_vocal", "lead_dancer", "visual"]},
            {"full": "Wonhee", "m_code": "WNH", "origin_country": ["korean"], "lines": ["center", "lead_vocal", "fotg", "visual"]},
            {"full": "Yunah", "m_code": "YNH", "origin_country": ["korean"], "lines": ["leader", "vocal", "lead_dancer"]}
        ]
    },
    "LE SSERAFIM": {
        "g_code": "LSF", "agency": "Source Music ( HYBE Labels )", "logo": "ls.png", "gender": "girlgroups", "debut_song": "FEARLESS",
        "members": [
            {"full": "Chaewon", "m_code": "CHW", "origin_country": ["korean"], "lines": ["leader", "vocal", "dancer"]}, 
            {"full": "Eunchae", "m_code": "ECH", "origin_country": ["korean"], "lines": ["vocal", "lead_dancer", "maknae"]},
            {"full": "Kazuha", "m_code": "KZH", "origin_country": ["japan"], "lines": ["rapper", "sub_vocal", "dancer"]},
            {"full": "Sakura", "m_code": "SKR", "origin_country": ["japan"], "lines": ["vocal", "rapper", "dancer"]},
            {"full": "Yunjin", "m_code": "YNJ", "origin_country": ["korean", "usa"], "lines": ["vocal", "rapper"]}
        ]
    },
    "NewJeans": {
        "g_code": "NJ", "agency": "ADOR ( HYBE Labels )", "logo": "nj.png", "gender": "girlgroups", "debut_song": "Attention",
        "members": [
            {"full": "Danielle", "m_code": "DNL", "origin_country": ["australia", "korean"], "lines": ["vocal", "dancer", "visual"]}, 
            {"full": "Haerin", "m_code": "HRN", "origin_country": ["korean"], "lines": ["lead_vocal", "lead_dancer"]},
            {"full": "Hanni", "m_code": "HNI", "origin_country": ["vietnam", "australia"], "lines": ["vocal", "dancer"]},
            {"full": "Hyein", "m_code": "HYN", "origin_country": ["korean"], "lines": ["vocal", "dancer", "maknae"]},
            {"full": "Minji", "m_code": "MNJ", "origin_country": ["korean"], "lines": ["leader", "vocal", "dancer"]}
        ]
    },
    "NMIXX": {
        "g_code": "NMX", "agency": "JYP Entertainment", "logo": "nmixx.png", "gender": "girlgroups", "debut_song": "O.O",
        "members": [
            {"full": "Bae", "m_code": "BAE", "origin_country": ["korean"], "lines": ["vocal", "dancer"]}, 
            {"full": "Jiwoo", "m_code": "JWO", "origin_country": ["korean"], "lines": ["main_rapper", "dancer", "vocal"]},
            {"full": "Kyujin", "m_code": "KYJ", "origin_country": ["korean"], "lines": ["main_dancer", "rapper", "vocal", "maknae"]},
            {"full": "Lily", "m_code": "LLY", "origin_country": ["australia", "korean"], "lines": ["main_vocal"]},
            {"full": "Haewon", "m_code": "HWN", "origin_country": ["korean"], "lines": ["leader", "main_vocal"]},
            {"full": "Sullyoon", "m_code": "SLY", "origin_country": ["korean"], "lines": ["lead_vocal","dancer", "visual"]},
        ]
    },
    "Red Velvet": {
        "g_code": "RV", "agency": "SM Entertainment", "logo": "rv.png", "gender": "girlgroups", "debut_song": "Happiness",
        "members": [
            {"full": "Irene", "m_code": "IRN", "origin_country": ["korean"], "lines": ["leader", "main_rapper", "lead_dancer", "sub_vocal", "visual", "center"]}, 
            {"full": "Joy", "m_code": "JOY", "origin_country": ["korean"], "lines": ["lead_rapper", "sub_vocal"]},
            {"full": "Seulgi", "m_code": "SLG", "origin_country": ["korean"], "lines": ["main_dancer", "lead_vocal"]},
            {"full": "Wendy", "m_code": "WND", "origin_country": ["korean"], "lines": ["main_vocal"]},
            {"full": "Yeri", "m_code": "YRI", "origin_country": ["korean"], "lines": ["sub_vocal", "sub_rapper", "maknae"]}
        ]
    },
    "TWICE": {
        "g_code": "TWC", "agency": "JYP Entertainment", "logo": "twice.png", "gender": "girlgroups", "debut_song": "Like OOH-AHH",
        "members": [
            {"full": "Chaeyoung", "m_code": "CHY", "origin_country": ["korean"], "lines": ["main_rapper", "sub_vocal"]}, 
            {"full": "Dahyun", "m_code": "DHY", "origin_country": ["korean"], "lines": ["lead_rapper", "sub_vocal"]},
            {"full": "Jeongyeon", "m_code": "JYJ", "origin_country": ["korean"], "lines": ["lead_vocal"]},
            {"full": "Jihyo", "m_code": "JHY", "origin_country": ["korean"], "lines": ["leader", "main_vocal"]},
            {"full": "Mina", "m_code": "MNA", "origin_country": ["japan"], "lines": ["main_dancer", "sub_vocal"]},
            {"full": "Momo", "m_code": "MOM", "origin_country": ["japan"], "lines": ["main_dancer", "sub_vocal", "sub_rapper"]},
            {"full": "Nayeon", "m_code": "NYN", "origin_country": ["korean"], "lines": ["lead_vocal", "lead_dancer", "center", "fotg"]},
            {"full": "Sana", "m_code": "SNA", "origin_country": ["japan"], "lines": ["sub_vocal"]},
            {"full": "Tzuyu", "m_code": "TZU", "origin_country": ["taiwan"], "lines": ["lead_dancer", "sub_vocal", "visual", "maknae"]}
        ]
    }
}

award_pool = ["MAMA Awards", "Melon Music Awards", "Asia Artist Awards", "Golden Disc Awards", "Seoul Music Awards", "K-World Dream Awards", "Gaon Chart Music Awards", "The Fact Music Awards", "Korea Music Awards", "Korea Grand Music Awards"]

style_map = {
    "Debut Era": {"rarity": "UNCOMMON", "s_code": "DB", "folder": "debut-era"},
    "Airport Fashion": {"rarity": "SUPER RARE", "s_code": "AP", "folder": "airport-fashion"},
    "Award Fashion": {"rarity": "ULTRA RARE", "s_code": "AW", "folder": "award-fashion"},
    "Selca (Selfie)": {"rarity": "COMMON", "s_code": "SL", "folder": "selca"},
    "Stage Performance": {"rarity": "RARE", "s_code": "SP", "folder": "stage-performance"},
    "Event Festival": {"rarity": "LIMITED", "s_code": "EV", "folder": "event"},
    "Fansign": {"rarity": "SECRET", "s_code": "FS", "folder": "fansign"}
}

pc_data = []
card_serial = 1

for group_name, info in groups.items():
    g_code = info["g_code"]
    debut_song = info["debut_song"]
    
    subfolder_gender = info.get("gender", "unknown").lower()
    final_logo_path = f"assets/logos/groups/{subfolder_gender}/{info['logo']}"
    
    for m in info["members"]:
        m_name = m["full"]
        m_code = m["m_code"]
        
        raw_countries = m.get("origin_country", ["korean"])
        if isinstance(raw_countries, str):
            raw_countries = [raw_countries]
            
        final_nations = []
        for country in raw_countries:
            c_clean = country.lower().strip() if hasattr(country, 'strip') else country.lower()
            if c_clean in ["korean", "japan"]:
                final_nations.append(c_clean)
            else:
                final_nations.append("global")
                
        final_nations = list(set(final_nations)) 
        m_lines = m.get("lines", ["vocal"])

        for style_name, style_info in style_map.items():
            s_code = style_info["s_code"]
            rarity = style_info["rarity"]
            target_folder = style_info["folder"]

            if style_name == "Debut Era":
                current_era = debut_song
            elif style_name == "Airport Fashion":
                current_era = "Airport Era"
            elif style_name == "Award Fashion":
                current_era = random.choice(award_pool)
            elif style_name == "Selca (Selfie)":
                current_era = "Holiday Special"
            elif style_name == "Stage Performance":
                current_era = "Comeback Stage"
            elif style_name == "Event Festival":
                current_era = "Festival Event"
            elif style_name == "Fansign":
                current_era = "Special Event"
            else:
                current_era = "Special Collection"

            id_unique = f"{g_code}-{m_code}-{s_code}-{card_serial:04}"
            
            clean_name = m_name.lower().replace(":", "")
            safe_name = re.sub(r'[\s\-]+', '_', clean_name)
            safe_group_code = g_code.lower()
            
            item = {
                "id_unique": id_unique,
                "member": m_name,
                "group": group_name,
                "agency": info["agency"],
                "rarity": rarity,
                "era": current_era,
                "style": style_name,
                "image": f"assets/members/{target_folder}/{safe_group_code}_{safe_name}_{s_code.lower()}.jpg",
                "logo": final_logo_path,
                "origin_country": raw_countries,
                "nation": final_nations,
                "lines": m_lines
            }
            pc_data.append(item)
            card_serial += 1

with open('data.json', 'w', encoding='utf-8') as f:
    json.dump(pc_data, f, indent=2, ensure_ascii=False)

print(f"✅ Berhasil di-enchant! {len(pc_data)} data Photocard rapi telah disimpan ke data.json.")