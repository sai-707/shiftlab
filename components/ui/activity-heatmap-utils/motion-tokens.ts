// Motion values shared by the activity heatmap. Easing curves are the same ones the CSS uses (see the module file next to this one),
// so a hover that animates in CSS and a tooltip that glides in JS feel like one system.
// Times are in seconds because that is what the `motion` library takes.
export const motionTokens = {
  ease: {
    /** Things arriving: fast start, long soft landing. */
    enter: [0.16, 1, 0.3, 1],
    /** Things leaving or recolouring: a little less drama. */
    standard: [0.22, 1, 0.36, 1],
  },
  duration: {
    fast: 0.16,
    base: 0.22,
  },
  /** Blur in px. Text that changes starts soft and sharpens as it settles. */
  blur: {
    subtle: 2,
    soft: 4,
  },
  spring: {
    /** The tooltip gliding between cells: close to critically damped, so it stops without wobbling. */
    snappy: { type: "spring", stiffness: 520, damping: 40, mass: 0.8 },
    /** Widths that follow a changing number or text: a hair of overshoot so it feels alive. */
    morph: { type: "spring", stiffness: 380, damping: 34, mass: 0.9 },
  },
} as const;
