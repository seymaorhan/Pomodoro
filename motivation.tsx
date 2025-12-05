import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
    Animated,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";

const CARDS = [
  "Bildirimleri kapatmak odak verimini artırır.",
  "Küçük adımlar büyük kapılar açar.",
  "Odak, tekrar eden küçük alışkanlıklarla güçlenir.",
  "20 dakikalık çalışma blokları en verimli sürelerden biridir.",
  "Bugün 1 seansı bölünmeden bitirmeyi deneyebilirsin.",
  "Her gün %1 gelişim, bir ayda güçlü bir dönüşümdür.",
  "Tek göreve odaklanmak verimi %40 artırır.",
  "Başlamak bitirmenin yarısıdır.",
  "Zaman değil, dikkat yönetimi gerçek oyundur.",
  "Kendine 25 dakika hediye et. Sonrası hep daha kolay gelir.",
];

export default function MotivationScreen() {
  const { theme } = useTheme();
  const [quote, setQuote] = useState(
    CARDS[Math.floor(Math.random() * CARDS.length)]
  );

  const refreshQuote = () => {
    let newQuote = quote;
    while (newQuote === quote) {
      newQuote = CARDS[Math.floor(Math.random() * CARDS.length)];
    }
    setQuote(newQuote);
  };

  // ------------------------------
  // 🔵 Nefes Modal State
  // ------------------------------
  const [showBreath, setShowBreath] = useState(false);
  const [phase, setPhase] = useState("Hazır mısın?");
  const [loopCount, setLoopCount] = useState(0); // 2 döngü için

  const bubbleAnim = useRef(new Animated.Value(120)).current; // width-height animasyonu

  const startBreathing = () => {
    setShowBreath(true);
    setLoopCount(0);
    runBreathCycle();
  };

  const runBreathCycle = () => {
    if (loopCount >= 2) return; // 2 döngü tamam

    // 1) Nefes Al
    setPhase("Nefes Al");
    Animated.timing(bubbleAnim, {
      toValue: 220,
      duration: 4000,
      useNativeDriver: false,
    }).start(() => {
      // 2) Tut
      setPhase("Tut");
      Animated.timing(bubbleAnim, {
        toValue: 220,
        duration: 2000,
        useNativeDriver: false,
      }).start(() => {
        // 3) Nefes Ver
        setPhase("Nefes Ver");
        Animated.timing(bubbleAnim, {
          toValue: 130,
          duration: 4000,
          useNativeDriver: false,
        }).start(() => {
          setLoopCount((c) => c + 1);
          setTimeout(runBreathCycle, 500);
        });
      });
    });
  };

  const closeModal = () => {
    setShowBreath(false);
    bubbleAnim.setValue(120);
    setPhase("Hazır mısın?");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      {/* Sayfa Başlığı */}
      <Text style={[styles.title, { color: theme.text }]}>Motivasyon</Text>

      {/* Kart */}
      <View
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      >
        <MaterialCommunityIcons
          name="lightbulb-on-outline"
          size={36}
          color={theme.text}
        />
        <Text style={[styles.quote, { color: theme.text }]}>{quote}</Text>
      </View>

      {/* Yeni Kart Butonu */}
      <TouchableOpacity
        onPress={refreshQuote}
        style={[styles.btn, { backgroundColor: theme.text }]}
      >
        <Text style={[styles.btnText, { color: theme.background }]}>
          Yeni İlham Kartı
        </Text>
      </TouchableOpacity>

      {/* Mini nefes egzersizi */}
      <TouchableOpacity
        onPress={startBreathing}
        style={[styles.breathBtn, { borderColor: theme.text }]}
      >
        <MaterialCommunityIcons
          name="meditation"
          size={22}
          color={theme.text}
        />
        <Text style={[styles.breathText, { color: theme.text }]}>
          Mini Nefes Egzersizi
        </Text>
      </TouchableOpacity>

      {/* ----------------------- */}
      {/* 🔵 Nefes Modal */}
      {/* ----------------------- */}
      <Modal visible={showBreath} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Animated.View
              style={[
                styles.breathCircle,
                {
                  width: bubbleAnim,
                  height: bubbleAnim,
                  borderRadius: Animated.divide(bubbleAnim, 2),
                },
              ]}
            >
              <LinearGradient
                colors={["#7f5af0", "#2cb67d"]}
                style={styles.gradientCircle}
              >
                <Text style={styles.phaseText}>{phase}</Text>
              </LinearGradient>
            </Animated.View>

            <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
              <Text style={styles.closeText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: "800", marginBottom: 16 },
  card: {
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 20,
  },
  quote: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 26,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    marginBottom: 20,
  },
  btnText: { fontSize: 16, fontWeight: "700" },

  breathBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  breathText: { fontSize: 16, fontWeight: "600" },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "80%",
    paddingVertical: 30,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  breathCircle: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  gradientCircle: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  phaseText: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
  },
  closeBtn: {
    backgroundColor: "#e63946",
    paddingVertical: 10,
    paddingHorizontal: 26,
    borderRadius: 12,
  },
  closeText: { color: "white", fontSize: 16, fontWeight: "700" },
});
