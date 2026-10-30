"use client";

import { createStore } from "./localStore";

export const handoverNotes = createStore("shiftlab.handover.v1", { watch: "", followups: "" });
