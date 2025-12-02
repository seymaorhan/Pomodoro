import React, { useMemo, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PieChart } from "react-native-chart-kit";

import { Session, useSessions } from "../../hooks/useSessions";
import { useTheme } from "../../hooks/useTheme";
import { categoryColors } from "../colors";

const screenWidth = Dimensions.get("window").width;

// dakika formatlama
function formatMinutes(min: number) {
  if (min <= 0) return "0 dk";
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m} dk`;
  if (m === 0) return `${h} saat`;
  return `${h} saat ${m} dk`;
}

export default function ReportsScreen() {
  const { sessions } = useSessions();
  const { theme } = useTheme();

  const [mode, setMode] = useState<"daily" | "weekly" | "monthly">("weekly");
  const now = new Date();

  // -------------------------------------------
  // FİLTRELENMİŞ SESSIONS
  // -------------------------------------------
  const filtered = useMemo(() => {
    return sessions.filter((s: Session) => {
      const d = new Date(s.date);

      if (mode === "daily") {
        return (
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }

      if (mode === "weekly") {
        const diff =
          (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 7 && diff >= 0;
      }

      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    });
  }, [sessions, mode]);

  // -------------------------------------------
  // TOPLAM SÜRE VE DAĞINIKLIK
  // -------------------------------------------
  const totalMinutes = filtered.reduce(
    (sum, s) => sum + Math.round(s.duration / 60),
    0
  );

  const totalDistractions = filtered.reduce(
    (sum, s) => sum + s.distractions,
    0
  );

  // -------------------------------------------
  // KATEGORİ DAĞILIMI
  // -------------------------------------------
  const categoryTotals: Record<string, number> = {};
  filtered.forEach((s) => {
    const minutes = Math.round(s.duration / 60);
    categoryTotals[s.category] =
      (categoryTotals[s.category] || 0) + minutes;
  });

  // -------------------------------------------
  // PIE DATA
  // -------------------------------------------
  const pieData = useMemo(() => {
    if (totalMinutes === 0) return [];

    return Object.keys(categoryTotals).map((cat) => {
      const val = categoryTotals[cat];
      const pct = Math.round((val / totalMinutes) * 100);

      return {
        name: cat,
        pct,
        population: val,
        color: categoryColors[cat],
        legendFontColor: theme.text,
        legendFontSize: 14,
      };
    });
  }, [categoryTotals, totalMinutes]);

  // -------------------------------------------
  // EN VERİMLİ GÜN & SAAT
  // -------------------------------------------
  let bestDay = "-";
  let bestHour = "-";

  if (filtered.length > 0) {
    const dayMap: Record<number, number> = {};
    const dayNames = [
      "Pazar",
      "Pazartesi",
      "Salı",
      "Çarşamba",
      "Perşembe",
      "Cuma",
      "Cumartesi",
    ];

    filtered.forEach((s) => {
      const d = new Date(s.date);
      const idx = d.getDay();
      const minutes = Math.round(s.duration / 60);
      dayMap[idx] = (dayMap[idx] || 0) + minutes;
    });

    let bestVal = 0;
    Object.entries(dayMap).forEach(([k, v]) => {
      if (v > bestVal) {
        bestVal = v;
        bestDay = dayNames[Number(k)];
      }
    });

    const hourMap: Record<number, number> = {};
    filtered.forEach((s) => {
      const d = new Date(s.date);
      const minutes = Math.round(s.duration / 60);
      hourMap[d.getHours()] =
        (hourMap[d.getHours()] || 0) + minutes;
    });

    let bestHr = -1;
    let bestHrVal = 0;

    Object.entries(hourMap).forEach(([h, v]) => {
      if (v > bestHrVal) {
        bestHrVal = v;
        bestHr = Number(h);
      }
    });

    if (bestHr >= 0) {
      const pad = (n: number) => String(n).padStart(2, "0");
      bestHour = `${pad(bestHr)}:00 – ${pad(bestHr + 1)}:00`;
    }
  }

  // -------------------------------------------
  // ODAK SKORU
  // -------------------------------------------
  let focusScore = 0;
  if (totalMinutes > 0) {
    const raw = (totalMinutes / (totalDistractions + 1)) * 2;
    focusScore = Math.max(0, Math.min(100, Math.round(raw)));
  }

  const modeLabel =
    mode === "daily" ? "Günlük" : mode === "weekly" ? "Haftalık" : "Aylık";

  // -------------------------------------------
  // RENDER
  // -------------------------------------------
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      {/* SEKMEYİ AŞAĞI ALDIK */}
      <View style={{ height: 50 }} />

      <View style={styles.modeTabs}>
        {(["daily", "weekly", "monthly"] as const).map((key) => (
          <TouchableOpacity
            key={key}
            onPress={() => setMode(key)}
            style={[
              styles.modeTab,
              { backgroundColor: mode === key ? theme.text : theme.card },
            ]}
          >
            <Text
              style={{
                color: mode === key ? theme.background : theme.text,
                fontWeight: "700",
              }}
            >
              {key === "daily"
                ? "Günlük"
                : key === "weekly"
                ? "Haftalık"
                : "Aylık"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

     {/* KATEGORİ DAĞILIMI */}
<View style={[styles.card, { backgroundColor: theme.card }]}>
  <Text style={[styles.cardTitle, { color: theme.text }]}>
    Kategori Dağılımı ({modeLabel})
  </Text>

  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
    }}
  >
    {/* --- Pie Chart --- */}
    <PieChart
      data={pieData.map((p) => ({
        name: p.name,
        population: p.population,
        color: p.color,
        legendFontColor: theme.text,
        legendFontSize: 12,
      }))}
      width={screenWidth * 0.50}   // biraz büyütüldü
      height={210}
      accessor="population"
      backgroundColor="transparent"
      paddingLeft="40"              // sola yapışmıyor artık
      hasLegend={false}
      chartConfig={{
        backgroundGradientFrom: "transparent",
        backgroundGradientTo: "transparent",
        color: () => theme.text,
        labelColor: () => theme.text,
      }}
      style={{
        marginLeft: 0,              // kesilmeyi kaldıran ayar
      }}
    />

    {/* --- Sağdaki Yüzdelik Liste + Yuvarlak Renk Noktası --- */}
    <View
      style={{
        marginLeft: 15,
        minWidth: screenWidth * 0.33,
        paddingRight: 8,
      }}
    >
      {pieData.map((item) => (
        <View
          key={item.name}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          {/* Renkli Nokta */}
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: item.color,
              marginRight: 8,
            }}
          />

          {/* Yüzdelik + kategori adı */}
          <Text
            style={{
              color: theme.text,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            %{item.pct} {item.name}
          </Text>
        </View>
      ))}
    </View>
  </View>
</View>


      {/* ANALİZ KARTI */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          {modeLabel} Analiz
        </Text>

        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.subtext }]}>
            ⭐ En Verimli Gün
          </Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {bestDay}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.subtext }]}>
            🕓 Toplam Süre
          </Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {formatMinutes(totalMinutes)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.subtext }]}>
            🔥 En Yoğun Saat
          </Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {bestHour}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.subtext }]}>
            😵 Dikkat Dağınıklığı
          </Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {totalDistractions} kez
          </Text>
        </View>

        <Text
          style={[
            { marginTop: 12, marginBottom: 4 },
            { color: theme.subtext, fontSize: 14 },
          ]}
        >
          🎯 Odak Kalitesi
        </Text>

        <View style={[styles.focusBar, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.focusFill,
              {
                width: `${focusScore}%`,
                backgroundColor:
                  focusScore >= 70
                    ? "#2ecc71"
                    : focusScore >= 40
                    ? "#f1c40f"
                    : "#e74c3c",
              },
            ]}
          />
        </View>

        <Text
          style={{
            color: theme.text,
            textAlign: "right",
            marginTop: 4,
            fontWeight: "600",
          }}
        >
          {focusScore} / 100
        </Text>
      </View>

      {/* KATEGORİ SÜRELERİ */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          Kategori Bazlı Süreler
        </Text>

        {Object.keys(categoryTotals).map((cat) => (
          <View key={cat} style={styles.categoryRow}>
            <View
              style={[
                styles.categoryDot,
                { backgroundColor: categoryColors[cat] },
              ]}
            />
            <Text style={[styles.categoryName, { color: theme.text }]}>
              {cat}
            </Text>
            <Text
              style={[styles.categoryTime, { color: theme.subtext }]}
            >
              {formatMinutes(categoryTotals[cat])}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  modeTabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  label: {
    fontSize: 15,
  },
  value: {
    fontSize: 15,
    fontWeight: "700",
  },
  focusBar: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
  },
  focusFill: {
    height: "100%",
    borderRadius: 999,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "600",
  },
  categoryTime: {
    marginLeft: "auto",
    fontSize: 15,
  },
});
