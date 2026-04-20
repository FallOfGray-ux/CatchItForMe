/* =============================================================
   Catch It For Me — Main App (React, single file, Babel-in-browser)
   -------------------------------------------------------------
   Sections:
     1. Constants & content (cat lines, skins, backgrounds, sounds)
     2. Sound helper (Web Audio — no asset files required)
     3. <CatCharacter /> — the sarcastic cat + speech bubble
     4. <Mouse /> — the tappable prey
     5. <HomeScreen />  — start + shop
     6. <GameScreen />  — the active round
     7. <ResultScreen /> — win/fail + rewards
     8. <ShopScreen />  — tabs for skins & backgrounds (and sound packs)
     9. <App />         — root, state, persistence
   ============================================================= */

const { useState, useEffect, useRef, useCallback, useMemo } = React;

/* -------------------------------------------------------------
   1. CONSTANTS & CONTENT
   ------------------------------------------------------------- */

// Cat dialogue pools — pick a random one per trigger.
const CAT_LINES = {
  start: [
    "I brought it. You finish the job.",
    "I'm not getting up for this.",
    "Dinner is served. Allegedly.",
    "Your turn, two-legs.",
  ],
  fail: [
    "Wow. That was embarrassing.",
    "It's literally right there.",
    "The mouse is smarter than you.",
    "I've seen houseplants with better reflexes.",
  ],
  win: [
    "Acceptable.",
    "You got lucky.",
    "Don't get used to it.",
    "Fine. I'm mildly impressed.",
  ],
  shop: [
    "Spend those coins. I won't.",
    "That outfit screams 'tries too hard.'",
    "Buy me something nice.",
  ],
  home: [
    "Another mouse already? Ugh, fine.",
    "Ready when you are. Probably.",
    "I'll supervise.",
  ],
};

// Cat skins available in the shop.
// "emoji" is used as a quick placeholder art — swap for <img> any time.
const CAT_SKINS = [
  { id: "default",  name: "Default Cat",  emoji: "🐱", price: 0 },
  { id: "business", name: "Business Cat", emoji: "😼", price: 100 },
  { id: "vampire",  name: "Vampire Cat",  emoji: "🧛", price: 250 },
  { id: "dj",       name: "DJ Cat",       emoji: "🎧", price: 500 },
];

// Background themes.
const BACKGROUNDS = [
  { id: "basic",   name: "Basic Room",   className: "bg-basic",   price: 0 },
  { id: "luxury",  name: "Luxury Room",  className: "bg-luxury",  price: 150 },
  { id: "haunted", name: "Haunted Room", className: "bg-haunted", price: 300 },
  { id: "neon",    name: "Neon Room",    className: "bg-neon",    price: 600 },
];

// Sound pack structure only (switches which synth tone is used).
const SOUND_PACKS = [
  { id: "default", name: "Default SFX", price: 0,   tone: "sine"     },
  { id: "meme",    name: "Meme Pack",   price: 200, tone: "square"   },
  { id: "techno",  name: "Techno Pack", price: 400, tone: "sawtooth" },
];

const STORAGE_KEY = "catch-it-for-me/v1";

/* Helper: pick a random element. */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* Helper: clamp a number. */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* -------------------------------------------------------------
   2. SOUND HELPER
   Uses the Web Audio API so we don't need asset files.
   ------------------------------------------------------------- */
const audioCtxRef = { current: null };
function beep(tone = "sine", freq = 660, dur = 0.08, vol = 0.15) {
  try {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = tone;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.stop(ctx.currentTime + dur);
  } catch (e) { /* ignore — audio is non-critical */ }
}

/* -------------------------------------------------------------
   3. CatCharacter
   Renders the cat emoji (based on skin) and an optional speech bubble.
   ------------------------------------------------------------- */
function CatCharacter({ skinId, message, corner = false }) {
  const skin = CAT_SKINS.find((s) => s.id === skinId) || CAT_SKINS[0];
  return (
    <div style={corner ? { position: "absolute", top: 60, left: 12, zIndex: 6 } : { display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      {message && (
        <div className={`bubble ${corner ? "corner" : ""}`} key={message}>
          {message}
        </div>
      )}
      <div className={`cat ${corner ? "corner" : "idle"}`} style={corner ? { position: "static", fontSize: 56 } : null}>
        {skin.emoji}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   4. Mouse
   A tappable element positioned absolutely. Position updated by parent.
   ------------------------------------------------------------- */
function Mouse({ x, y, rare, onTap }) {
  return (
    <div
      className={`mouse ${rare ? "rare" : ""}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={onTap}
      onTouchStart={(e) => { e.preventDefault(); onTap(); }}
      role="button"
      aria-label="mouse"
    >
      {rare ? "🐭" : "🐁"}
    </div>
  );
}

/* -------------------------------------------------------------
   5. HomeScreen
   ------------------------------------------------------------- */
function HomeScreen({ skinId, onStart, onShop }) {
  const [msg] = useState(() => pick(CAT_LINES.home));
  return (
    <div className="screen">
      <h1 className="bouncy">Catch It For Me</h1>
      <p>Your cat refuses to do its job. Tap the mouse before it escapes.</p>
      <CatCharacter skinId={skinId} message={msg} />
      <div className="home-stack">
        <button className="btn huge" onClick={onStart}>Start Hunt 🐭</button>
        <button className="btn secondary" onClick={onShop}>Shop 🛍️</button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   6. GameScreen
   Handles:
     - round timer (5–10s)
     - mouse repositioning every 500–1200ms (faster as rounds climb)
     - rare-mouse spawn
     - tap detection → win
   ------------------------------------------------------------- */
function GameScreen({ skinId, roundNumber, soundTone, onFinish }) {
  // Random round length between 5-10s.
  const durationMs = useMemo(() => 5000 + Math.random() * 5000, [roundNumber]);

  // Jump interval decreases slightly each round (min 300ms floor).
  const jumpMs = useMemo(
    () => clamp(1100 - roundNumber * 60, 300, 1200) - Math.random() * 200,
    [roundNumber]
  );

  // 12% chance of rare mouse per round.
  const isRare = useMemo(() => Math.random() < 0.12, [roundNumber]);

  const [pos, setPos] = useState({ x: 50, y: 60 });
  const [remaining, setRemaining] = useState(durationMs);
  const [startedAt] = useState(() => performance.now());
  const [coinPop, setCoinPop] = useState(null); // { x, y, text }
  const [startMsg, setStartMsg] = useState(() => pick(CAT_LINES.start));
  const finishedRef = useRef(false);

  // Hide the cat's opening line after 1.8s so it doesn't block the mouse.
  useEffect(() => {
    const t = setTimeout(() => setStartMsg(null), 1800);
    return () => clearTimeout(t);
  }, []);

  // Helper: randomize mouse position (with margins so it never clips edges).
  const reposition = useCallback(() => {
    setPos({
      x: 10 + Math.random() * 80,
      y: 25 + Math.random() * 60,
    });
  }, []);

  // Initial position + jump interval.
  useEffect(() => {
    reposition();
    const jumpTimer = setInterval(reposition, jumpMs);
    return () => clearInterval(jumpTimer);
  }, [jumpMs, reposition]);

  // Countdown / timeout.
  useEffect(() => {
    const tick = setInterval(() => {
      const left = durationMs - (performance.now() - startedAt);
      if (left <= 0) {
        clearInterval(tick);
        if (!finishedRef.current) {
          finishedRef.current = true;
          onFinish({ caught: false, rare: isRare });
        }
      } else {
        setRemaining(left);
      }
    }, 100);
    return () => clearInterval(tick);
  }, [durationMs, startedAt, onFinish, isRare]);

  const handleTap = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    beep(soundTone, isRare ? 1100 : 880, 0.12, 0.2);
    setCoinPop({ x: pos.x, y: pos.y, text: isRare ? "+50" : "+10" });
    // Small delay so the player sees the coin popup before the screen changes.
    setTimeout(() => onFinish({ caught: true, rare: isRare }), 450);
  };

  const secondsLeft = Math.max(0, remaining / 1000);

  return (
    <div className="screen" style={{ justifyContent: "flex-start", paddingTop: 110 }}>
      {/* Corner cat commentary — shows a sarcastic opener for ~2s */}
      <CatCharacter skinId={skinId} message={startMsg} corner />

      {/* Mouse */}
      <Mouse x={pos.x} y={pos.y} rare={isRare} onTap={handleTap} />

      {/* Coin popup */}
      {coinPop && (
        <div
          className="coin-pop"
          style={{ left: `${coinPop.x}%`, top: `${coinPop.y}%` }}
        >
          {coinPop.text} 🪙
        </div>
      )}

      {/* Countdown pill shown via top bar from App; duplicate here for clarity */}
      <div className="top-bar" style={{ top: 58 }}>
        <span />
        <span className={`timer-pill ${secondsLeft < 2 ? "low" : ""}`}>
          {secondsLeft.toFixed(1)}s
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   7. ResultScreen
   ------------------------------------------------------------- */
function ResultScreen({ skinId, won, rare, coinsEarned, streak, onAgain, onHome, onShare }) {
  const [msg] = useState(() => pick(won ? CAT_LINES.win : CAT_LINES.fail));
  return (
    <div className={`screen ${won ? "" : "shake"}`}>
      <h1 className={`result-big ${won ? "win" : "fail"}`}>
        {won ? "CAUGHT!" : "ESCAPED!"}
      </h1>
      <CatCharacter skinId={skinId} message={msg} />
      {won && (
        <div className="reward">
          +{coinsEarned} 🪙
          {rare && <span> (rare bonus!)</span>}
          {streak > 1 && <div style={{ fontSize: 14, marginTop: 4, opacity: 0.9 }}>🔥 Streak x{streak}</div>}
        </div>
      )}
      <div className="home-stack">
        <button className="btn" onClick={onAgain}>Play Again</button>
        <button className="btn secondary" onClick={onHome}>Home</button>
        <button className="btn ghost" onClick={onShare}>Share Result 📤</button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   8. ShopScreen
   Tabs: Skins / Backgrounds / Sounds
   ------------------------------------------------------------- */
function ShopScreen({
  coins,
  skinId, bgId, soundId,
  owned,                  // { skins: Set, backgrounds: Set, sounds: Set }
  onClose, onBuy, onEquip,
}) {
  const [tab, setTab] = useState("skins");

  const catalog = tab === "skins"       ? CAT_SKINS
                : tab === "backgrounds" ? BACKGROUNDS
                :                         SOUND_PACKS;

  const equippedId = tab === "skins" ? skinId : tab === "backgrounds" ? bgId : soundId;
  const ownedSet   = owned[tab];

  return (
    <div className="shop">
      <button className="close-x" onClick={onClose} aria-label="close">✕</button>
      <h2>Shop</h2>
      <div style={{ textAlign: "center", fontWeight: 700 }}>
        Coins: 🪙 {coins}
      </div>

      <div className="tabs">
        {["skins", "backgrounds", "sounds"].map((t) => (
          <button
            key={t}
            className={`tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="shop-grid">
        {catalog.map((item) => {
          const isOwned    = ownedSet.has(item.id);
          const isEquipped = equippedId === item.id;
          const canAfford  = coins >= item.price;
          const cls = isEquipped ? "equipped" : isOwned ? "owned" : "locked";

          // Visual representation per tab type
          const preview =
            tab === "skins" ? item.emoji
            : tab === "backgrounds" ? (
                <div
                  className={item.className}
                  style={{ width: 60, height: 60, borderRadius: 12 }}
                />
              )
            : "🔊";

          return (
            <div className={`shop-item ${cls}`} key={item.id}>
              {isEquipped && <span className="badge">IN USE</span>}
              <div className="emoji">{preview}</div>
              <div className="name">{item.name}</div>
              <div className="price">
                {item.price === 0 ? "Free" : `🪙 ${item.price}`}
              </div>
              {isEquipped ? (
                <button className="btn-sm" disabled>Equipped</button>
              ) : isOwned ? (
                <button className="btn-sm" onClick={() => onEquip(tab, item.id)}>
                  Equip
                </button>
              ) : (
                <button
                  className="btn-sm"
                  disabled={!canAfford}
                  onClick={() => onBuy(tab, item)}
                >
                  {canAfford ? "Buy" : "Locked"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   9. App  (root)
   Global state: screen, coins, selected skin/bg/sound, unlocks, streak, round.
   Persists to localStorage.
   ------------------------------------------------------------- */
function App() {
  // -- Persistent state ------------------------------------------------
  const loadSaved = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      return {
        ...s,
        owned: {
          skins:       new Set(s.owned?.skins       ?? ["default"]),
          backgrounds: new Set(s.owned?.backgrounds ?? ["basic"]),
          sounds:      new Set(s.owned?.sounds      ?? ["default"]),
        },
      };
    } catch { return null; }
  };

  const saved = loadSaved();

  const [screen, setScreen]       = useState("home"); // home | game | result
  const [shopOpen, setShopOpen]   = useState(false);
  const [coins, setCoins]         = useState(saved?.coins ?? 0);
  const [skinId, setSkinId]       = useState(saved?.skinId ?? "default");
  const [bgId, setBgId]           = useState(saved?.bgId ?? "basic");
  const [soundId, setSoundId]     = useState(saved?.soundId ?? "default");
  const [owned, setOwned]         = useState(
    saved?.owned ?? {
      skins:       new Set(["default"]),
      backgrounds: new Set(["basic"]),
      sounds:      new Set(["default"]),
    }
  );

  // -- Transient game state --------------------------------------------
  const [round, setRound]   = useState(1);
  const [streak, setStreak] = useState(0);
  const [lastResult, setLastResult] = useState(null); // { won, rare, coinsEarned }

  // -- Persistence to localStorage -------------------------------------
  useEffect(() => {
    const payload = {
      coins, skinId, bgId, soundId,
      owned: {
        skins:       [...owned.skins],
        backgrounds: [...owned.backgrounds],
        sounds:      [...owned.sounds],
      },
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch {}
  }, [coins, skinId, bgId, soundId, owned]);

  // -- Derived: current sound tone -------------------------------------
  const soundTone = useMemo(() =>
    (SOUND_PACKS.find(s => s.id === soundId) || SOUND_PACKS[0]).tone,
    [soundId]
  );

  // -- Round lifecycle --------------------------------------------------
  const startGame = () => {
    beep(soundTone, 520, 0.08);
    setScreen("game");
  };

  const finishGame = ({ caught, rare }) => {
    let earned = 0;
    let newStreak = streak;
    if (caught) {
      earned = rare ? 50 : 10;
      newStreak = streak + 1;
      // Optional streak bonus — +2 per consecutive win (cap 20).
      if (newStreak > 1) earned += clamp((newStreak - 1) * 2, 0, 20);
      setCoins((c) => c + earned);
      setStreak(newStreak);
      beep(soundTone, 980, 0.15, 0.25);
    } else {
      setStreak(0);
      beep(soundTone, 180, 0.3, 0.2);
    }
    setLastResult({ won: caught, rare, coinsEarned: earned, streakAtTime: newStreak });
    setScreen("result");
  };

  const playAgain = () => {
    setRound((r) => r + 1);
    // Snappy loop per spec — no artificial delay.
    setScreen("game");
  };

  const goHome = () => {
    setScreen("home");
    setStreak(0);  // streak resets when you bail to the menu
  };

  // -- Shop handlers ----------------------------------------------------
  const handleBuy = (tab, item) => {
    if (coins < item.price) return;
    setCoins((c) => c - item.price);
    setOwned((o) => {
      const next = { ...o, [tab]: new Set(o[tab]) };
      next[tab].add(item.id);
      return next;
    });
    beep(soundTone, 700, 0.1);
    // Auto-equip on purchase for a better UX.
    handleEquip(tab, item.id);
  };

  const handleEquip = (tab, id) => {
    if (tab === "skins")       setSkinId(id);
    if (tab === "backgrounds") setBgId(id);
    if (tab === "sounds")      setSoundId(id);
    beep(soundTone, 520, 0.06);
  };

  // -- Share (text-based fallback; uses Web Share API when available) ---
  const handleShare = async () => {
    const text = lastResult?.won
      ? `I just caught the mouse in Catch It For Me 🐭 (+${lastResult.coinsEarned} coins${lastResult.rare ? ", RARE!" : ""}). My cat is unimpressed.`
      : `The mouse escaped in Catch It For Me 🐭. My cat is judging me hard.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Catch It For Me", text });
      } else {
        await navigator.clipboard.writeText(text);
        alert("Copied result to clipboard!");
      }
    } catch { /* user canceled */ }
  };

  // -- Render ----------------------------------------------------------
  const bg = BACKGROUNDS.find(b => b.id === bgId) || BACKGROUNDS[0];

  return (
    <div className={`app ${bg.className}`}>
      {/* Persistent top bar with coin count (hidden on result so it doesn't clutter) */}
      {screen !== "result" && (
        <div className="top-bar">
          <span className="coin-pill">🪙 {coins}</span>
          <span />
        </div>
      )}

      {/* Screens */}
      {screen === "home" && (
        <HomeScreen
          skinId={skinId}
          onStart={startGame}
          onShop={() => setShopOpen(true)}
        />
      )}

      {screen === "game" && (
        <GameScreen
          key={round /* force remount each round */}
          skinId={skinId}
          roundNumber={round}
          soundTone={soundTone}
          onFinish={finishGame}
        />
      )}

      {screen === "result" && lastResult && (
        <ResultScreen
          skinId={skinId}
          won={lastResult.won}
          rare={lastResult.rare}
          coinsEarned={lastResult.coinsEarned}
          streak={lastResult.streakAtTime}
          onAgain={playAgain}
          onHome={goHome}
          onShare={handleShare}
        />
      )}

      {/* Shop overlay */}
      {shopOpen && (
        <ShopScreen
          coins={coins}
          skinId={skinId}
          bgId={bgId}
          soundId={soundId}
          owned={owned}
          onClose={() => setShopOpen(false)}
          onBuy={handleBuy}
          onEquip={handleEquip}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------
   Mount
   ------------------------------------------------------------- */
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
