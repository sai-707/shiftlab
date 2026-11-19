"use client";

import { createStore } from "./localStore";
import type { Track } from "./roadmapRows";

// Same key as before accounts, so ticks made earlier in this browser are kept. sync.ts saves it to the account as "roadmap".
// shortcut: merging two devices is grow-only, so a topic un-ticked on one device while another still has it ticked comes back. Fine for a checklist.
export const roadmapProgress = createStore("shiftlab.roadmap.v1", {
  track: "soc" as Track,
  sel: "",
  done: {} as Record<string, true>,
  ticks: {} as Record<string, true>,
});
