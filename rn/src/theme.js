// Visual tokens — small palette + helpers.
export const T = {
  ink:     "#140a2e",
  ink2:    "#1f0f42",
  accent:  "#ff2d6f",
  gold:    "#ffd23f",
  cyan:    "#29e3ff",
  purple:  "#7b2cff",
  green:   "#3ba329",
  textDim: "rgba(255,255,255,0.82)",
  glass:   "rgba(20,10,46,0.55)",
  glassBorder: "rgba(255,255,255,0.14)",
  shadow:  "#000",
};

// Lightweight shared shadow style (RN).
export const shadow = (y = 8, blur = 18, op = 0.35) => ({
  shadowColor: "#000",
  shadowOpacity: op,
  shadowRadius: blur,
  shadowOffset: { width: 0, height: y },
  elevation: Math.max(2, Math.round(y)),
});
