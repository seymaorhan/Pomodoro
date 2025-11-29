// app/theme/colors.ts

export const lightTheme = {
  background: "#ffffff",
  text: "#111111",
  subtext: "#444444",
  card: "#f2f2f2",
  border: "#dddddd",
  accent: "#4A90E2",   // ⭐ Notion tarzı pastel mavi
};

export const darkTheme = {
  background: "#111111",
  text: "#ffffff",
  subtext: "#aaaaaa",
  card: "#1d1d1d",
  border: "#333333",
  accent: "#4A90E2",   // ⭐ Karanlık mod için de aynı
};


// Kategorilere ait renkler
export const categoryColors: Record<string, string> = {
  Kodlama: "#0062ffff",
  Ders: "#00ffaaff",
  Proje: "#ffa200ff",
  Kitap: "#ff0080ff",
};
