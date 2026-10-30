"use client";

import { createStore } from "./localStore";

export const logProgress = createStore("shiftlab.logs.v1", { solved: [] as string[] });
