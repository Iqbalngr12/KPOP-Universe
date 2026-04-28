# 💎 K-PhotoCard Universe v2.0

[![Status](https://img.shields.io/badge/Status-Beta--v2.0-blueviolet?style=for-the-badge)](https://github.com/Iqbalngr12)
[![Tech](https://img.shields.io/badge/Tech-Vanilla--JS-yellow?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Major](https://img.shields.io/badge/Program-TMD--PNJ-orange?style=for-the-badge)](https://tik.pnj.ac.id)

**K-PhotoCard Universe** adalah platform koleksi digital photocard K-Pop interaktif yang menggabungkan manajemen database besar dengan pengalaman simulasi gacha yang imersif. Project ini dikembangkan sebagai bagian dari studi di Teknik Multimedia Digital (TMD), Politeknik Negeri Jakarta.

---

## 🌟 Fitur Unggulan

### 1. 🎲 Gacha Simulator Pro
Sistem penarikan kartu berbasis probabilitas real-time dengan animasi unboxing:
- **Smart Probability**: Algoritma distribusi kartu berdasarkan rarity (Common - Secret).
- **Dynamic Reward**: Kartu yang didapat otomatis masuk ke `My Collection` menggunakan LocalStorage.
- **Audio Immersive**: Sound effect berbeda berdasarkan tingkat kelangkaan kartu yang didapat.

### 2. 🏛️ Premium Database (600+ Cards)
Optimasi performa untuk menangani ribuan data tanpa lag:
- **Smart Pagination**: Sistem navigasi halaman hemat ruang (sliding window) yang membatasi maksimal 5 pagination aktif.
- **Multi-Filter System**: Filter berdasarkan Agency (SM, YG, JYP, HYBE) dan kategori "Other".
- **Live Search**: Pencarian instan berdasarkan nama member atau grup.
- **Advanced Sorting**: Urutan berdasarkan Abjad (A-Z), Terbaru, hingga Rarity tertinggi.

### 3. 🖼️ Premium Card Display
Layout modal horizontal mewah dengan fitur:
- **Visual Effects**: Efek *Shiny* dan *Holographic* untuk kartu kategori Rare ke atas.
- **Screenshot Mode**: Menghilangkan UI yang mengganggu untuk hasil tangkapan layar koleksi yang bersih.
- **Direct Download**: Export tampilan kartu ke format PNG menggunakan library `html2canvas`.

---

## 🛠️ Detail Teknis

### Tech Stack
- **Frontend:** HTML5, CSS3 (Modern Flexbox & Grid, CSS Variables)
- **Scripting:** Vanilla JavaScript ES6+
- **Data Handling:** JSON (External Database), LocalStorage (User Data Persistence)
- **Library:** [html2canvas](https://html2canvas.hertzen.com/) untuk pengolahan gambar.

### Probabilitas Rarity (Gacha)
| Rank | Rate | Visual Effect |
| :--- | :--- | :--- |
| **SECRET** | 1% | Gold Glow + Holo + Magic Sound |
| **LIMITED** | 4% | Pink Glow + Holo |
| **ULTRA RARE** | 5% | Blue Glow + Holo |
| **SUPER RARE** | 15% | Purple Glow + Shiny |
| **RARE** | 20% | Green Glow + Shiny |
| **UNCOMMON** | 25% | Standard Layout |
| **COMMON** | 30% | Standard Layout |

---

Project by: [Iqbal Adhi Nugraha](https://github.com/Iqbalngr12)