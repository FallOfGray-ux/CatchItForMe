import React, { useState } from "react";
import { View, Text, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { supabase, isConfigured } from "../supabase";
import Btn from "../components/Btn";
import { T, shadow } from "../theme";

/**
 * Email + password sign-in / sign-up screen.
 * Called when no active session exists.
 */
export default function AuthScreen() {
  const [mode,  setMode]  = useState("signin");
  const [email, setEmail] = useState("");
  const [pwd,   setPwd]   = useState("");
  const [busy,  setBusy]  = useState(false);
  const [err,   setErr]   = useState("");
  const [info,  setInfo]  = useState("");

  const submit = async () => {
    setErr(""); setInfo("");
    if (!isConfigured) {
      setErr("Supabase not configured. Paste keys in src/supabase.js.");
      return;
    }
    if (!email.trim() || pwd.length < 6) {
      setErr("Enter a valid email and a password of 6+ characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password: pwd });
        if (error) throw error;
        // Try instant login (works when email confirmation is off).
        const { error: e2 } = await supabase.auth.signInWithPassword({ email, password: pwd });
        if (e2) setInfo("Account created. Check your inbox to confirm, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
        if (error) throw error;
      }
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 18 }}
    >
      <Text style={{
        fontSize: 42, fontWeight: "900", color: T.gold,
        textShadowColor: "rgba(0,0,0,0.3)", textShadowRadius: 6, textShadowOffset: { width: 3, height: 3 },
        textAlign: "center",
      }}>
        Catch It For Me
      </Text>
      <Text style={{ color: T.textDim, textAlign: "center", fontWeight: "600", fontSize: 15, lineHeight: 20 }}>
        {mode === "signup"
          ? "Make an account to save your coins, skins, and streaks to the cloud."
          : "Welcome back, bestie."}
      </Text>

      <View style={[{
        backgroundColor: T.glass, borderColor: T.glassBorder, borderWidth: 1,
        padding: 22, borderRadius: 22, width: "100%", maxWidth: 380, gap: 12,
      }, shadow(10, 26, 0.4)]}>
        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "900", textAlign: "center" }}>
          {mode === "signup" ? "Sign up" : "Sign in"}
        </Text>

        <Field label="Email">
          <TextInput
            value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
            placeholder="you@example.com" placeholderTextColor="rgba(255,255,255,0.4)"
            style={input}
          />
        </Field>
        <Field label="Password">
          <TextInput
            value={pwd} onChangeText={setPwd}
            secureTextEntry placeholder="at least 6 characters"
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={input}
          />
        </Field>

        {err  ? <Msg kind="err">{err}</Msg>   : null}
        {info ? <Msg kind="ok">{info}</Msg>   : null}

        <Btn
          title={busy ? "…" : mode === "signup" ? "Create account" : "Sign in"}
          onPress={submit}
          disabled={busy}
        />

        <Text
          style={{ color: T.cyan, fontWeight: "800", textAlign: "center", paddingVertical: 6 }}
          onPress={() => { setMode(m => m === "signup" ? "signin" : "signup"); setErr(""); setInfo(""); }}
        >
          {mode === "signup" ? "Already have an account? Sign in" : "New here? Sign up"}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.9)" }}>{label}</Text>
      {children}
    </View>
  );
}
const input = {
  padding: 14, borderRadius: 14,
  borderWidth: 1, borderColor: "rgba(255,255,255,0.18)",
  backgroundColor: "rgba(255,255,255,0.08)",
  color: "#fff", fontSize: 16, fontWeight: "600",
};

function Msg({ kind, children }) {
  return (
    <View style={{
      padding: 10, borderRadius: 12,
      backgroundColor: kind === "err" ? "rgba(255,45,111,0.2)" : "rgba(122,226,94,0.2)",
      borderColor:     kind === "err" ? "rgba(255,45,111,0.4)" : "rgba(122,226,94,0.4)",
      borderWidth: 1,
    }}>
      <Text style={{ color: "#fff", fontSize: 13.5, fontWeight: "700" }}>{children}</Text>
    </View>
  );
}
