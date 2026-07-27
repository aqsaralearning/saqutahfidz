// Data 114 surah Al-Qur'an
export interface Surah { no: number; name: string; ayat: number; juzStart: number }

export const SURAHS: Surah[] = [
  { no: 1, name: "Al-Fatihah", ayat: 7, juzStart: 1 },
  { no: 2, name: "Al-Baqarah", ayat: 286, juzStart: 1 },
  { no: 3, name: "Ali 'Imran", ayat: 200, juzStart: 3 },
  { no: 4, name: "An-Nisa'", ayat: 176, juzStart: 4 },
  { no: 5, name: "Al-Ma'idah", ayat: 120, juzStart: 6 },
  { no: 6, name: "Al-An'am", ayat: 165, juzStart: 7 },
  { no: 7, name: "Al-A'raf", ayat: 206, juzStart: 8 },
  { no: 8, name: "Al-Anfal", ayat: 75, juzStart: 9 },
  { no: 9, name: "At-Taubah", ayat: 129, juzStart: 10 },
  { no: 10, name: "Yunus", ayat: 109, juzStart: 11 },
  { no: 11, name: "Hud", ayat: 123, juzStart: 11 },
  { no: 12, name: "Yusuf", ayat: 111, juzStart: 12 },
  { no: 13, name: "Ar-Ra'd", ayat: 43, juzStart: 13 },
  { no: 14, name: "Ibrahim", ayat: 52, juzStart: 13 },
  { no: 15, name: "Al-Hijr", ayat: 99, juzStart: 14 },
  { no: 16, name: "An-Nahl", ayat: 128, juzStart: 14 },
  { no: 17, name: "Al-Isra'", ayat: 111, juzStart: 15 },
  { no: 18, name: "Al-Kahf", ayat: 110, juzStart: 15 },
  { no: 19, name: "Maryam", ayat: 98, juzStart: 16 },
  { no: 20, name: "Ta Ha", ayat: 135, juzStart: 16 },
  { no: 21, name: "Al-Anbiya'", ayat: 112, juzStart: 17 },
  { no: 22, name: "Al-Hajj", ayat: 78, juzStart: 17 },
  { no: 23, name: "Al-Mu'minun", ayat: 118, juzStart: 18 },
  { no: 24, name: "An-Nur", ayat: 64, juzStart: 18 },
  { no: 25, name: "Al-Furqan", ayat: 77, juzStart: 18 },
  { no: 26, name: "Asy-Syu'ara'", ayat: 227, juzStart: 19 },
  { no: 27, name: "An-Naml", ayat: 93, juzStart: 19 },
  { no: 28, name: "Al-Qasas", ayat: 88, juzStart: 20 },
  { no: 29, name: "Al-'Ankabut", ayat: 69, juzStart: 20 },
  { no: 30, name: "Ar-Rum", ayat: 60, juzStart: 21 },
  { no: 31, name: "Luqman", ayat: 34, juzStart: 21 },
  { no: 32, name: "As-Sajdah", ayat: 30, juzStart: 21 },
  { no: 33, name: "Al-Ahzab", ayat: 73, juzStart: 21 },
  { no: 34, name: "Saba'", ayat: 54, juzStart: 22 },
  { no: 35, name: "Fatir", ayat: 45, juzStart: 22 },
  { no: 36, name: "Ya Sin", ayat: 83, juzStart: 22 },
  { no: 37, name: "As-Saffat", ayat: 182, juzStart: 23 },
  { no: 38, name: "Sad", ayat: 88, juzStart: 23 },
  { no: 39, name: "Az-Zumar", ayat: 75, juzStart: 23 },
  { no: 40, name: "Ghafir", ayat: 85, juzStart: 24 },
  { no: 41, name: "Fussilat", ayat: 54, juzStart: 24 },
  { no: 42, name: "Asy-Syura", ayat: 53, juzStart: 25 },
  { no: 43, name: "Az-Zukhruf", ayat: 89, juzStart: 25 },
  { no: 44, name: "Ad-Dukhan", ayat: 59, juzStart: 25 },
  { no: 45, name: "Al-Jasiyah", ayat: 37, juzStart: 25 },
  { no: 46, name: "Al-Ahqaf", ayat: 35, juzStart: 26 },
  { no: 47, name: "Muhammad", ayat: 38, juzStart: 26 },
  { no: 48, name: "Al-Fath", ayat: 29, juzStart: 26 },
  { no: 49, name: "Al-Hujurat", ayat: 18, juzStart: 26 },
  { no: 50, name: "Qaf", ayat: 45, juzStart: 26 },
  { no: 51, name: "Az-Zariyat", ayat: 60, juzStart: 26 },
  { no: 52, name: "At-Tur", ayat: 49, juzStart: 27 },
  { no: 53, name: "An-Najm", ayat: 62, juzStart: 27 },
  { no: 54, name: "Al-Qamar", ayat: 55, juzStart: 27 },
  { no: 55, name: "Ar-Rahman", ayat: 78, juzStart: 27 },
  { no: 56, name: "Al-Waqi'ah", ayat: 96, juzStart: 27 },
  { no: 57, name: "Al-Hadid", ayat: 29, juzStart: 27 },
  { no: 58, name: "Al-Mujadilah", ayat: 22, juzStart: 28 },
  { no: 59, name: "Al-Hasyr", ayat: 24, juzStart: 28 },
  { no: 60, name: "Al-Mumtahanah", ayat: 13, juzStart: 28 },
  { no: 61, name: "As-Saff", ayat: 14, juzStart: 28 },
  { no: 62, name: "Al-Jumu'ah", ayat: 11, juzStart: 28 },
  { no: 63, name: "Al-Munafiqun", ayat: 11, juzStart: 28 },
  { no: 64, name: "At-Tagabun", ayat: 18, juzStart: 28 },
  { no: 65, name: "At-Talaq", ayat: 12, juzStart: 28 },
  { no: 66, name: "At-Tahrim", ayat: 12, juzStart: 28 },
  { no: 67, name: "Al-Mulk", ayat: 30, juzStart: 29 },
  { no: 68, name: "Al-Qalam", ayat: 52, juzStart: 29 },
  { no: 69, name: "Al-Haqqah", ayat: 52, juzStart: 29 },
  { no: 70, name: "Al-Ma'arij", ayat: 44, juzStart: 29 },
  { no: 71, name: "Nuh", ayat: 28, juzStart: 29 },
  { no: 72, name: "Al-Jinn", ayat: 28, juzStart: 29 },
  { no: 73, name: "Al-Muzzammil", ayat: 20, juzStart: 29 },
  { no: 74, name: "Al-Muddassir", ayat: 56, juzStart: 29 },
  { no: 75, name: "Al-Qiyamah", ayat: 40, juzStart: 29 },
  { no: 76, name: "Al-Insan", ayat: 31, juzStart: 29 },
  { no: 77, name: "Al-Mursalat", ayat: 50, juzStart: 29 },
  { no: 78, name: "An-Naba'", ayat: 40, juzStart: 30 },
  { no: 79, name: "An-Nazi'at", ayat: 46, juzStart: 30 },
  { no: 80, name: "'Abasa", ayat: 42, juzStart: 30 },
  { no: 81, name: "At-Takwir", ayat: 29, juzStart: 30 },
  { no: 82, name: "Al-Infitar", ayat: 19, juzStart: 30 },
  { no: 83, name: "Al-Mutaffifin", ayat: 36, juzStart: 30 },
  { no: 84, name: "Al-Insyiqaq", ayat: 25, juzStart: 30 },
  { no: 85, name: "Al-Buruj", ayat: 22, juzStart: 30 },
  { no: 86, name: "At-Tariq", ayat: 17, juzStart: 30 },
  { no: 87, name: "Al-A'la", ayat: 19, juzStart: 30 },
  { no: 88, name: "Al-Gasyiyah", ayat: 26, juzStart: 30 },
  { no: 89, name: "Al-Fajr", ayat: 30, juzStart: 30 },
  { no: 90, name: "Al-Balad", ayat: 20, juzStart: 30 },
  { no: 91, name: "Asy-Syams", ayat: 15, juzStart: 30 },
  { no: 92, name: "Al-Lail", ayat: 21, juzStart: 30 },
  { no: 93, name: "Ad-Duha", ayat: 11, juzStart: 30 },
  { no: 94, name: "Asy-Syarh", ayat: 8, juzStart: 30 },
  { no: 95, name: "At-Tin", ayat: 8, juzStart: 30 },
  { no: 96, name: "Al-'Alaq", ayat: 19, juzStart: 30 },
  { no: 97, name: "Al-Qadr", ayat: 5, juzStart: 30 },
  { no: 98, name: "Al-Bayyinah", ayat: 8, juzStart: 30 },
  { no: 99, name: "Az-Zalzalah", ayat: 8, juzStart: 30 },
  { no: 100, name: "Al-'Adiyat", ayat: 11, juzStart: 30 },
  { no: 101, name: "Al-Qari'ah", ayat: 11, juzStart: 30 },
  { no: 102, name: "At-Takasur", ayat: 8, juzStart: 30 },
  { no: 103, name: "Al-'Asr", ayat: 3, juzStart: 30 },
  { no: 104, name: "Al-Humazah", ayat: 9, juzStart: 30 },
  { no: 105, name: "Al-Fil", ayat: 5, juzStart: 30 },
  { no: 106, name: "Quraisy", ayat: 4, juzStart: 30 },
  { no: 107, name: "Al-Ma'un", ayat: 7, juzStart: 30 },
  { no: 108, name: "Al-Kausar", ayat: 3, juzStart: 30 },
  { no: 109, name: "Al-Kafirun", ayat: 6, juzStart: 30 },
  { no: 110, name: "An-Nasr", ayat: 3, juzStart: 30 },
  { no: 111, name: "Al-Lahab", ayat: 5, juzStart: 30 },
  { no: 112, name: "Al-Ikhlas", ayat: 4, juzStart: 30 },
  { no: 113, name: "Al-Falaq", ayat: 5, juzStart: 30 },
  { no: 114, name: "An-Nas", ayat: 6, juzStart: 30 },
];

/**
 * Halaman mushaf Madinah 15 baris — halaman awal tiap juz.
 * Total 604 halaman; halaman 1-2 = Al-Fatihah + awal Al-Baqarah.
 */
export const JUZ_START_PAGE: Record<number, number> = {
  1: 1, 2: 22, 3: 42, 4: 62, 5: 82, 6: 102, 7: 121, 8: 142, 9: 162, 10: 182,
  11: 201, 12: 222, 13: 242, 14: 262, 15: 282, 16: 302, 17: 322, 18: 342,
  19: 362, 20: 382, 21: 402, 22: 422, 23: 442, 24: 462, 25: 482, 26: 502,
  27: 522, 28: 542, 29: 562, 30: 582,
};

export function juzPageRange(juz: number): [number, number] {
  const start = JUZ_START_PAGE[juz];
  const end = juz === 30 ? 604 : JUZ_START_PAGE[juz + 1] - 1;
  return [start, end];
}

/** Sumber gambar mushaf online — Madani 15 baris (fallback ke teks Uthmani). */
export function mushafPageUrl(page: number): string {
  return `https://www.searchtruth.com/quran/images1/${page}.jpg`;
}

/** API teks halaman Uthmani (alquran.cloud) sebagai fallback dan sumber utuh. */
export function mushafPageTextApi(page: number): string {
  return `https://api.alquran.cloud/v1/page/${page}/quran-uthmani`;
}

/** Daftar surah yang muncul di setiap juz (nomor surah). */
export const JUZ_SURAHS: Record<number, number[]> = {
  1: [1, 2], 2: [2], 3: [2, 3], 4: [3, 4], 5: [4], 6: [4, 5],
  7: [5, 6], 8: [6, 7], 9: [7, 8], 10: [8, 9], 11: [9, 10, 11],
  12: [11, 12], 13: [12, 13, 14], 14: [15, 16], 15: [17, 18],
  16: [18, 19, 20], 17: [21, 22], 18: [23, 24, 25], 19: [25, 26, 27],
  20: [27, 28, 29], 21: [29, 30, 31, 32, 33], 22: [33, 34, 35, 36],
  23: [36, 37, 38, 39], 24: [39, 40, 41], 25: [41, 42, 43, 44, 45],
  26: [46, 47, 48, 49, 50, 51], 27: [51, 52, 53, 54, 55, 56, 57],
  28: [58, 59, 60, 61, 62, 63, 64, 65, 66],
  29: [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77],
  30: [78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95,
       96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110,
       111, 112, 113, 114],
};

export function surahsInJuz(juz: number) {
  return (JUZ_SURAHS[juz] ?? []).map((n) => SURAHS.find((s) => s.no === n)!).filter(Boolean);
}

export function predicateFromScore(score: number): { key: string; label: string } {
  if (score >= 90) return { key: "mumtaz", label: "Mumtaz (Istimewa)" };
  if (score >= 80) return { key: "jayyid_jiddan", label: "Jayyid Jiddan (Sangat Baik)" };
  if (score >= 70) return { key: "jayyid", label: "Jayyid (Baik)" };
  if (score >= 60) return { key: "maqbul", label: "Maqbul (Cukup)" };
  return { key: "belum_lulus", label: "Belum Lulus" };
}
