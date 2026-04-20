// =============================================================
// Shared game content: cat dialogue, shop catalog, helpers.
// This file is intentionally identical in spirit to the web version
// so the personality feels consistent across platforms.
// =============================================================

export const CAT_LINES = {
  first_ever: [
    "oh. it's you. i've heard... things.",
    "hi bestie. welcome. the mouse is already plotting.",
    "new owner unlocked. let's see if you're mid or elite.",
  ],
  home: [
    "bestie please. the mouse is RIGHT there.",
    "not me bringing you breakfast and you scrolling.",
    "POV: i'm your cat and you're slacking.",
    "tap start. i cannot keep yapping about this.",
    "the mouse isn't gonna catch itself, babe.",
    "i could be napping. i CHOSE this for you.",
    "the longer you wait the more i judge you.",
  ],
  shop_open: [
    "ooh retail therapy. drop the coins.",
    "i need the business fit. it's for my LinkedIn.",
    "buy me something nice. or don't. whatever. 🙄",
    "wallet out bestie, it's a PARADE.",
  ],
  shop_buy: [
    "iconic purchase. absolute slay.",
    "we love spending money we earned poorly.",
    "you in your drip era. proud. ish.",
  ],
  shop_equip: [
    "okay now THAT is a look.",
    "fit check: mid → slightly less mid.",
    "serving. barely. but serving.",
  ],
  shop_cant_afford: [
    "broke behavior. go catch more.",
    "the bank said NO 💀",
    "maybe if you... won sometimes?",
  ],
  round_start: [
    "okay go. i'll be live-tweeting this.",
    "three. two. one. don't embarrass me.",
    "i brought it. i tied a bow. GO.",
    "eyes up, slow-hands.",
    "don't fumble the bag. or the mouse.",
  ],
  round_start_rare: [
    "🚨 RARE MOUSE. do NOT fumble.",
    "the gold one?? if you miss i will unalive.",
    "bestie. this is cinema. do NOT ruin it.",
    "50 coin mouse. i repeat: FIFTY.",
  ],
  mid_round: [
    "tick tock bestie 🕒",
    "are you... okay?",
    "breathe. then tap.",
    "i'm sweating and i have FUR.",
  ],
  time_low: ["BFFR", "you're COOKED", "NOT LIKE THIS", "tap tap tap tap TAP"],
  win: [
    "okay slay 💅",
    "10/10 no notes (jk i have so many)",
    "fine. minimal applause. 👏",
    "chat we are eating GOOD",
    "look at you. employed.",
    "mother. you had it in you.",
    "W secured. barely.",
  ],
  win_streak_2: ["wait. back-to-back??", "two in a row is wild for you.", "okay maybe you DO have hands."],
  win_streak_3: [
    "you're cooking?? in MY kitchen??",
    "girl. i might have to update my rent.",
    "this is a lore moment fr.",
    "the mouse is FILING A COMPLAINT.",
  ],
  win_rare: [
    "MY GOLD ONE. YOU CAUGHT MY GOLD ONE.",
    "sobbing. crying. throwing up.",
    "bestie THIS is the video.",
    "I'M. YELLING.",
  ],
  fail: [
    "it's giving 'slow.'",
    "not the MOUSE escaping 💀",
    "the disrespect was IMMACULATE.",
    "respectfully what was THAT.",
    "bestie we need to TALK.",
    "i'm gonna need a moment.",
    "ooof. skill issue.",
  ],
  fail_streak_2: ["twice?? in a ROW??", "oh. we're not okay.", "calling HR on you."],
  fail_streak_3: [
    "i'm unionizing. you're the worst boss.",
    "new fear unlocked: your reflexes.",
    "go touch some grass. please.",
    "i'm calling my ex. this can't be fixed.",
  ],
  fail_rare: [
    "THE GOLD ONE?? bestie no.",
    "you had 50 coins on a STRING.",
    "i'm blocking you.",
  ],
  idle_too_long: ["still there?", "bestie. please. i'm aging.", "hello?? the mouse is growing old."],
};

export const CAT_SKINS = [
  { id: "default",  name: "Default Cat",  emoji: "🐱", price: 0 },
  { id: "business", name: "Business Cat", emoji: "😼", price: 100 },
  { id: "vampire",  name: "Vampire Cat",  emoji: "🧛", price: 250 },
  { id: "dj",       name: "DJ Cat",       emoji: "🎧", price: 500 },
];

// RN has no CSS; gradients are arrays of colors consumed by LinearGradient.
export const BACKGROUNDS = [
  { id: "basic",   name: "Cozy Pink",  colors: ["#ffb273", "#ff5e8a", "#c23d8e"], price: 0 },
  { id: "luxury",  name: "Gold Suite", colors: ["#ffd93b", "#ff8a00"],            price: 150 },
  { id: "haunted", name: "Haunted",    colors: ["#0e1038", "#1a0933", "#081327"], price: 300 },
  { id: "neon",    name: "Neon Club",  colors: ["#2b0a3d", "#0b0524", "#170645"], price: 600 },
];

export const SOUND_PACKS = [
  { id: "default", name: "Default SFX", price: 0   },
  { id: "meme",    name: "Meme Pack",   price: 200 },
  { id: "techno",  name: "Techno Pack", price: 400 },
];

export const pick  = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// The shape of a fresh cloud profile. Also used as a local fallback.
export const DEFAULT_PROFILE = {
  coins: 0,
  skin_id: "default",
  bg_id: "basic",
  sound_id: "default",
  owned_skins: ["default"],
  owned_backgrounds: ["basic"],
  owned_sounds: ["default"],
  high_streak: 0,
  total_wins: 0,
  total_fails: 0,
};
