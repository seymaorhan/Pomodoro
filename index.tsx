import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  AppState,
  AppStateStatus,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

import { useSessions } from "../../hooks/useSessions";
import { useTheme } from "../../hooks/useTheme";
import { categoryIcons } from "../_icons";
import { categoryColors } from "../colors";

const RADIUS = 80;
const STROKE_WIDTH = 12;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const CATEGORIES = ["Kodlama", "Ders", "Proje", "Kitap", "Okuma", "Araştırma"] as const;
type Category = (typeof CATEGORIES)[number];

export default function TimerScreen() {
  const { theme, toggleTheme, themeMode } = useTheme();
  const { saveSession } = useSessions();

  const [targetMinutes, setTargetMinutes] = useState(25);
  const [time, setTime] = useState(targetMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>("Kodlama");
  const [distractions, setDistractions] = useState(0);

  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState({
    category: "",
    minutes: 0,
    distractions: 0,
  });

  const [showPauseModal, setShowPauseModal] = useState(false);

  // ✔ DOĞRU TİP (Expo RN için)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const appState = useRef<AppStateStatus>(AppState.currentState);

  /* Hedef süre değişince sayaç çalışmıyorsa güncelle */
  useEffect(() => {
    if (!isRunning) setTime(targetMinutes * 60);
  }, [targetMinutes]);

  /* Sayaç akışı */
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          endSession(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  /* AppState: Arka plana gidince otomatik duraklat + dikkat dağınıklığı artır */
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      const prev = appState.current;

      if (prev === "active" && nextState !== "active" && isRunning) {
        setDistractions((d) => d + 1);
        pauseTimer(false); // modal açmadan duraklat
      }

      appState.current = nextState;
    });

    return () => sub.remove();
  }, [isRunning]);

  /* Seans bitiş / Kaydet */
  const endSession = (finishedByTimer: boolean) => {
    const spentSeconds = finishedByTimer
      ? targetMinutes * 60
      : targetMinutes * 60 - time;

    if (spentSeconds <= 0) return;

    const minutes = Math.floor(spentSeconds / 60);

    saveSession(spentSeconds, selectedCategory, distractions);

    setSummaryData({
      category: selectedCategory,
      minutes,
      distractions,
    });

    setShowSummary(true);

    setTime(targetMinutes * 60);
    setDistractions(0);
  };

  /* Başlat */
  const startTimer = () => {
    if (time <= 0) setTime(targetMinutes * 60);
    setIsRunning(true);
  };

  /* Duraklat */
  const pauseTimer = (openModal: boolean = true) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);

    if (openModal) setShowPauseModal(true);
  };

  /* Devam et */
  const resumeTimer = () => {
    setShowPauseModal(false);
    setIsRunning(true);
  };

  /* Sıfırla */
  const resetTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setTime(targetMinutes * 60);
    setDistractions(0);
  };

  const progress = time / (targetMinutes * 60);
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const minutes = String(Math.floor(time / 60)).padStart(2, "0");
  const seconds = String(time % 60).padStart(2, "0");

  const activeColor = categoryColors[selectedCategory] || theme.text;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* ÜST BAR */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.text }]}>{selectedCategory}</Text>

        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
          <MaterialCommunityIcons
            name={themeMode === "dark" ? "weather-sunny" : "weather-night"}
            size={26}
            color={theme.text}
          />
        </TouchableOpacity>
      </View>

      {/* KATEGORİLER */}
      <View style={styles.categoryRow}>
        {CATEGORIES.map((cat) => {
          const active = cat === selectedCategory;
          const IconFn = categoryIcons[cat];

          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: active ? activeColor : theme.card,
                  borderColor: active ? activeColor : theme.border,
                },
              ]}
            >
              {IconFn && IconFn(16, active ? "#fff" : theme.text)}
              <Text
                style={[
                  styles.categoryText,
                  { color: active ? "#fff" : theme.text },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ÇEMBER + SAYAÇ */}
      <View style={{ alignSelf: "center", marginTop: 20 }}>
        <Svg height={200} width={200}>
          <Circle
            cx="100"
            cy="100"
            r={RADIUS}
            stroke={theme.card}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          <Circle
            cx="100"
            cy="100"
            r={RADIUS}
            stroke={activeColor}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            rotation="-90"
            origin="100,100"
          />
        </Svg>

        <View style={styles.centerTextWrap}>
          <Text style={[styles.centerText, { color: theme.text }]}>
            {minutes}:{seconds}
          </Text>
        </View>
      </View>

      {/* DİKKAT */}
      <Text style={[styles.distractionText, { color: theme.subtext }]}>
        Dikkat Dağınıklığı: {distractions}
      </Text>

      {/* SÜRE AYARI */}
      <View style={styles.goalRow}>
        <TouchableOpacity
          style={styles.goalBtn}
          onPress={() => setTargetMinutes((m) => Math.max(1, m - 1))}
        >
          <Text style={styles.goalBtnText}>-</Text>
        </TouchableOpacity>

        <Text style={[styles.goalLabel, { color: theme.text }]}>
          Hedef Süre: {targetMinutes} dk
        </Text>

        <TouchableOpacity
          style={styles.goalBtn}
          onPress={() => setTargetMinutes((m) => m + 1)}
        >
          <Text style={styles.goalBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* BUTONLAR */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#2ecc71" }]}
          onPress={startTimer}
        >
          <Text style={styles.buttonText}>Başlat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#e67e22" }]}
          onPress={() => pauseTimer(true)}
        >
          <Text style={styles.buttonText}>Duraklat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#e74c3c" }]}
          onPress={resetTimer}
        >
          <Text style={styles.buttonText}>Sıfırla</Text>
        </TouchableOpacity>
      </View>

      {/* DURAKLAT MODAL */}
      <Modal transparent visible={showPauseModal} animationType="fade">
        <View style={styles.modalBg}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Sayaç Duraklatıldı
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#3498db" }]}
                onPress={resumeTimer}
              >
                <Text style={styles.modalBtnText}>Devam Et</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#2ecc71" }]}
                onPress={() => {
                  setShowPauseModal(false);
                  endSession(false);
                }}
              >
                <Text style={styles.modalBtnText}>Kaydet</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#e74c3c" }]}
                onPress={() => setShowPauseModal(false)}
              >
                <Text style={styles.modalBtnText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ÖZET MODAL */}
      <Modal transparent visible={showSummary} animationType="fade">
        <View style={styles.modalBg}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Seans Özeti
            </Text>

            <Text style={[styles.modalText, { color: theme.text }]}>
              Kategori: {summaryData.category}
            </Text>
            <Text style={[styles.modalText, { color: theme.text }]}>
              Süre: {summaryData.minutes} dk
            </Text>
            <Text style={[styles.modalText, { color: theme.text }]}>
              Dikkat Dağınıklığı: {summaryData.distractions}
            </Text>

            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: "#3498db", marginTop: 10 }]}
              onPress={() => setShowSummary(false)}
            >
              <Text style={styles.modalBtnText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 24 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  title: { fontSize: 24, fontWeight: "700" },

  themeToggle: { padding: 8, borderRadius: 100 },

  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },

  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },

  categoryText: { fontSize: 14, fontWeight: "600" },

  centerTextWrap: {
    position: "absolute",
    top: 75,
    width: "67%",
    alignItems: "center",
  },

  centerText: { fontSize: 40, fontWeight: "800" },

  distractionText: { textAlign: "center", marginVertical: 8 },

  goalRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
    marginBottom: 14,
  },

  goalBtn: {
    width: 36,
    height: 36,
    backgroundColor: "#444",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  goalBtnText: { color: "#fff", fontSize: 20 },

  goalLabel: { fontSize: 16, fontWeight: "600" },

  buttonRow: { flexDirection: "row", gap: 10, marginTop: 10 },

  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },

  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  modalBg: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  modalCard: {
    width: "80%",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },

  modalText: {
    fontSize: 16,
    marginBottom: 4,
    textAlign: "center",
  },

  modalBtnRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },

  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },

  modalBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
});
