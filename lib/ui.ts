"use client";

import { createStore } from "./localStore";

// shortcut: layout preferences stay in this browser, moved to the account profile in phase 3
export const uiStore = createStore("shiftlab.ui.v1", { collapsed: false });
