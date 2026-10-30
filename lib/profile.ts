"use client";

import { createStore } from "./localStore";

// Guests keep their name and photo in this browser (photo is a small JPEG data URL). Signed-in people save them to
// their account instead (profiles table, see app/profile-actions.ts), so this store is only used while signed out.
export const profileStore = createStore("shiftlab.profile.v1", { name: "", avatar: "" });

/** Centre-crops a picture to a 160px square JPEG. Drawing it on a canvas also strips metadata and any SVG content. */
export function resizeAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const size = 160;
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx || side === 0) return reject(new Error("unreadable"));
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("unreadable"));
    };
    img.src = url;
  });
}
