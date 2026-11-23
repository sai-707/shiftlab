"use client";

import { CERT_H, CERT_W, FONT_EXPORT } from "@/components/certificates/Certificate";

// Saves the certificate picture as a PNG. The SVG on screen uses the page's web fonts, which an SVG turned into an image
// cannot reach, so a copy of it is made with system fonts first (each text element says which one it wants in data-f).
export async function certificatePng(svg: SVGSVGElement): Promise<Blob> {
  const copy = svg.cloneNode(true) as SVGSVGElement;
  copy.setAttribute("width", String(CERT_W));
  copy.setAttribute("height", String(CERT_H));
  copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  copy.querySelectorAll<SVGElement>("[data-f]").forEach((el) => {
    const f = el.getAttribute("data-f") as keyof typeof FONT_EXPORT;
    if (FONT_EXPORT[f]) el.style.fontFamily = FONT_EXPORT[f];
  });
  const xml = new XMLSerializer().serializeToString(copy);
  const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((ok, bad) => {
      img.onload = () => ok();
      img.onerror = () => bad(new Error("render"));
      img.src = url;
    });
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = CERT_W * scale;
    canvas.height = CERT_H * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((ok, bad) => canvas.toBlob((b) => (b ? ok(b) : bad(new Error("blob"))), "image/png"));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function fileNameFor(id: string): string {
  return `ShiftLab-certificate-${id}.png`;
}

export async function downloadCertificate(svg: SVGSVGElement, id: string) {
  const blob = await certificatePng(svg);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fileNameFor(id);
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
