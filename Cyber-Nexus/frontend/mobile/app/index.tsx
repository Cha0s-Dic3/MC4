import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PortfolioBackground } from "@/components/PortfolioBackground";
import { PulseDot } from "@/components/PulseDot";
import { Typewriter } from "@/components/Typewriter";
import { useColors } from "@/hooks/useColors";

const MONO = "SpaceMono_400Regular";
const MONO_BOLD = "SpaceMono_700Bold";
const SANS = "Inter_400Regular";
const SANS_MED = "Inter_500Medium";
const SANS_SEMI = "Inter_600SemiBold";
const SANS_BOLD = "Inter_700Bold";

const NAV_LINKS = ["work", "about", "writing"];
const ROLES = [
  "Full-Stack Engineer",
  "Systems Architect",
  "Open Source Builder",
  "Backend Specialist",
];
const STATS = [
  { value: "5+", label: "YEARS EXP" },
  { value: "32", label: "PROJECTS" },
  { value: "12k", label: "GITHUB STARS" },
  { value: "99", label: "UPTIME %" },
];
const SKILLS: { label: string; tone: "pink" | "purple" }[] = [
  { label: "TypeScript", tone: "pink" },
  { label: "Rust", tone: "purple" },
  { label: "Go", tone: "pink" },
  { label: "React", tone: "purple" },
  { label: "Node.js", tone: "pink" },
  { label: "PostgreSQL", tone: "purple" },
  { label: "Kubernetes", tone: "pink" },
  { label: "AWS", tone: "purple" },
  { label: "GraphQL", tone: "pink" },
  { label: "Docker", tone: "purple" },
];

function GradientText({
  children,
  fontSize,
  fontFamily,
  lineHeight,
  letterSpacing,
}: {
  children?: React.ReactNode;
  fontSize: number;
  fontFamily?: string;
  lineHeight?: number;
  letterSpacing?: number;
}) {
  const colors = useColors();
  const textStyle = {
    fontSize,
    fontFamily,
    lineHeight: lineHeight ?? fontSize * 1.05,
    letterSpacing,
    color: "#000",
    backgroundColor: "transparent" as const,
  };

  if (Platform.OS === "android") {
    // MaskedView is unreliable on Android — fallback to a single accent color.
    return (
      <Text style={[textStyle, { color: colors.pinkLight }]}>{children}</Text>
    );
  }

  return (
    <MaskedView
      maskElement={
        <View style={{ backgroundColor: "transparent" }}>
          <Text style={textStyle}>{children}</Text>
        </View>
      }
    >
      <LinearGradient
        colors={[colors.pinkPale, colors.pink, colors.purpleDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[textStyle, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}

function Nav() {
  const colors = useColors();
  return (
    <View style={[styles.nav, { borderColor: colors.border }]}>
      <View style={styles.navLogo}>
        <Text style={[styles.logoText, { color: colors.pinkLight }]}>
          dev.portfolio
        </Text>
        <Text style={[styles.logoText, { color: colors.pink }]}>_</Text>
      </View>
      <Pressable
        style={({ pressed }: { pressed: boolean }) => [
          styles.hireBtn,
          {
            borderColor: colors.pink,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text style={[styles.hireBtnText, { color: colors.pinkLight }]}>
          hire me
        </Text>
        <Feather name="arrow-up-right" size={12} color={colors.pinkLight} />
      </Pressable>
    </View>
  );
}

function NavLinks() {
  const colors = useColors();
  return (
    <View style={styles.navLinks}>
      {NAV_LINKS.map((l) => (
        <Pressable key={l}>
          {({ pressed }: { pressed: boolean }) => (
            <Text
              style={[
                styles.navLinkText,
                {
                  color: pressed ? colors.pinkLight : colors.purpleMid,
                },
              ]}
            >
              {l}
            </Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}

function StatusBadge() {
  const colors = useColors();
  return (
    <View
      style={[
        styles.badge,
        {
          borderColor: "rgba(52,211,153,0.3)",
          backgroundColor: "rgba(52,211,153,0.08)",
        },
      ]}
    >
      <PulseDot color={colors.green} size={7} />
      <Text style={[styles.badgeText, { color: colors.green }]}>
        available for work
      </Text>
    </View>
  );
}

function Hero() {
  const colors = useColors();
  return (
    <View style={styles.hero}>
      <StatusBadge />
      <Text style={[styles.greet, { color: colors.purple }]}>
        // hello, world
      </Text>
      <View style={{ marginTop: 8 }}>
        <GradientText fontSize={56} fontFamily={SANS_BOLD} letterSpacing={-2}>
          Alex
        </GradientText>
        <GradientText fontSize={56} fontFamily={SANS_BOLD} letterSpacing={-2}>
          Mercer.
        </GradientText>
      </View>
      <View style={styles.typeRow}>
        <Text style={[styles.typePrefix, { color: colors.purpleMuted }]}>
          {"> "}
        </Text>
        <Typewriter
          words={ROLES}
          style={{
            fontSize: 18,
            fontFamily: MONO,
            color: colors.purple,
          }}
          cursorColor={colors.pink}
        />
      </View>
      <Text style={[styles.bio, { color: colors.purpleMuted }]}>
        Building resilient distributed systems and developer tools that ship.
        Based in Berlin, working with teams worldwide on backend infrastructure,
        APIs, and the unglamorous bits that keep products running at 3am.
      </Text>
      <View style={styles.ctaRow}>
        <Pressable
          style={({ pressed }: { pressed: boolean }) => [
            styles.ctaPrimary,
            { opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <LinearGradient
            colors={[colors.pink, colors.purpleDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaPrimaryBg}
          >
            <Text style={[styles.ctaPrimaryText, { color: colors.background }]}>
              view work
            </Text>
            <Feather name="arrow-right" size={14} color={colors.background} />
          </LinearGradient>
        </Pressable>
        <Pressable
          style={({ pressed }: { pressed: boolean }) => [
            styles.ctaGhost,
            {
              borderColor: colors.input,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather name="download" size={14} color={colors.purpleMid} />
          <Text style={[styles.ctaGhostText, { color: colors.purpleMid }]}>
            resume.pdf
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Stats() {
  const colors = useColors();
  return (
    <View style={[styles.statsRow, { borderColor: colors.border }]}>
      {STATS.map((s, i) => (
        <React.Fragment key={s.label}>
          {i > 0 && (
            <View
              style={[styles.statDivider, { backgroundColor: colors.divider }]}
            />
          )}
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.pinkLight }]}>
              {s.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.purpleMuted }]}>
              {s.label}
            </Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

function Skills() {
  const colors = useColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: colors.purple }]}>
        // TECH STACK
      </Text>
      <View style={styles.pillWrap}>
        {SKILLS.map((s) => {
          const isPink = s.tone === "pink";
          return (
            <View
              key={s.label}
              style={[
                styles.pill,
                {
                  backgroundColor: isPink
                    ? colors.pillPinkBg
                    : colors.pillPurpleBg,
                  borderColor: isPink
                    ? colors.pillPinkBorder
                    : colors.pillPurpleBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: isPink ? colors.pink : colors.purple },
                ]}
              >
                {s.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function Terminal() {
  const colors = useColors();
  return (
    <View
      style={[
        styles.terminal,
        {
          backgroundColor: colors.terminalBg,
          borderColor: colors.terminalBorder,
        },
      ]}
    >
      <View style={styles.terminalHeader}>
        <View style={styles.termDots}>
          <View style={[styles.termDot, { backgroundColor: "#ef4444" }]} />
          <View style={[styles.termDot, { backgroundColor: "#eab308" }]} />
          <View style={[styles.termDot, { backgroundColor: "#22c55e" }]} />
        </View>
        <Text style={[styles.termTitle, { color: colors.purpleMuted }]}>
          ~/portfolio
        </Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.terminalBody}>
        <View style={styles.termLine}>
          <Text style={[styles.termPrompt, { color: colors.pink }]}>$ </Text>
          <Text style={[styles.termCmd, { color: colors.pinkOutput }]}>
            whoami
          </Text>
        </View>
        <Text style={[styles.termOut, { color: colors.purple }]}>
          alex.mercer — engineer
        </Text>

        <View style={[styles.termLine, { marginTop: 10 }]}>
          <Text style={[styles.termPrompt, { color: colors.pink }]}>$ </Text>
          <Text style={[styles.termCmd, { color: colors.pinkOutput }]}>
            cat skills.json
          </Text>
        </View>
        <Text style={[styles.termOut, { color: colors.pinkOutput }]}>{"{"}</Text>
        <Text style={[styles.termOut, { color: colors.purple, marginLeft: 12 }]}>
          {'"primary": '}
          <Text style={{ color: colors.pinkOutput }}>
            {'["rust", "go", "ts"]'}
          </Text>
          ,
        </Text>
        <Text style={[styles.termOut, { color: colors.purple, marginLeft: 12 }]}>
          {'"focus": '}
          <Text style={{ color: colors.pinkOutput }}>{'"infra"'}</Text>,
        </Text>
        <Text style={[styles.termOut, { color: colors.purple, marginLeft: 12 }]}>
          {'"coffee": '}
          <Text style={{ color: colors.pinkOutput }}>{'"required"'}</Text>
        </Text>
        <Text style={[styles.termOut, { color: colors.pinkOutput }]}>{"}"}</Text>

        <View style={[styles.termLine, { marginTop: 10 }]}>
          <Text style={[styles.termPrompt, { color: colors.pink }]}>$ </Text>
          <View style={[styles.cursor, { backgroundColor: colors.pink }]} />
        </View>
      </View>
    </View>
  );
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? Math.max(insets.top, 67) : insets.top;
  const bottomInset = isWeb ? Math.max(insets.bottom, 34) : insets.bottom + 24;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <PortfolioBackground />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: topInset + 8,
          paddingBottom: bottomInset,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Nav />
        <NavLinks />
        <Hero />
        <Stats />
        <Skills />
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <Terminal />
        </View>
        <Text style={[styles.footer, { color: colors.purpleMuted }]}>
          // crafted with rust, caffeine & questionable sleep schedules
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  navLogo: { flexDirection: "row", alignItems: "center" },
  logoText: { fontFamily: MONO_BOLD, fontSize: 14 },
  hireBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  hireBtnText: { fontFamily: MONO, fontSize: 12, letterSpacing: 0.5 },
  navLinks: {
    flexDirection: "row",
    gap: 22,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  navLinkText: { fontFamily: MONO, fontSize: 12, letterSpacing: 0.5 },

  hero: { paddingHorizontal: 20, paddingTop: 32 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: { fontFamily: MONO, fontSize: 11, letterSpacing: 0.5 },
  greet: { fontFamily: MONO, fontSize: 13, marginTop: 18 },
  typeRow: { flexDirection: "row", alignItems: "center", marginTop: 14 },
  typePrefix: { fontFamily: MONO, fontSize: 18 },
  bio: {
    fontFamily: SANS,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 18,
  },
  ctaRow: { flexDirection: "row", gap: 12, marginTop: 24 },
  ctaPrimary: { borderRadius: 999, overflow: "hidden" },
  ctaPrimaryBg: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  ctaPrimaryText: { fontFamily: SANS_SEMI, fontSize: 14 },
  ctaGhost: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  ctaGhostText: { fontFamily: MONO, fontSize: 13 },

  statsRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: 36,
    marginHorizontal: 20,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  statItem: { flex: 1, alignItems: "center", justifyContent: "center" },
  statValue: { fontFamily: SANS_BOLD, fontSize: 22, letterSpacing: -0.5 },
  statLabel: {
    fontFamily: MONO,
    fontSize: 9,
    letterSpacing: 0.8,
    marginTop: 4,
  },
  statDivider: { width: 1, marginVertical: 4 },

  section: { paddingHorizontal: 20, marginTop: 28 },
  sectionLabel: {
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  pillWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: { fontFamily: MONO, fontSize: 12 },

  terminal: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  terminalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(217,70,170,0.12)",
  },
  termDots: { flexDirection: "row", gap: 6, width: 40 },
  termDot: { width: 10, height: 10, borderRadius: 5, opacity: 0.7 },
  termTitle: { fontFamily: MONO, fontSize: 11 },
  terminalBody: { padding: 14 },
  termLine: { flexDirection: "row", alignItems: "center" },
  termPrompt: { fontFamily: MONO_BOLD, fontSize: 13 },
  termCmd: { fontFamily: MONO, fontSize: 13 },
  termOut: { fontFamily: MONO, fontSize: 12, lineHeight: 18, marginTop: 2 },
  cursor: { width: 8, height: 14 },

  footer: {
    fontFamily: MONO,
    fontSize: 11,
    textAlign: "center",
    marginTop: 36,
    paddingHorizontal: 20,
  },
});
