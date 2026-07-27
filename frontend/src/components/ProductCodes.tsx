import { useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import JsBarcode from "jsbarcode";
import { formatRwf } from "@/lib/utils";
import type { Product } from "@/types";

/** Canonical product code (SKU preferred). */
export function productScanCode(product: Pick<Product, "sku" | "manufacturerCode" | "productId">): string {
  return (product.sku || product.manufacturerCode || `BI-${String(product.productId).padStart(4, "0")}`).toUpperCase();
}

/** Public web origin used inside QR codes (phone camera opens this URL). */
export function appPublicOrigin(): string {
  const fromEnv = import.meta.env.VITE_PUBLIC_APP_URL as string | undefined;
  if (fromEnv && fromEnv.trim()) {
    return fromEnv.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:3000";
}

/** Full product card URL encoded in QR codes. */
export function productPublicUrl(productOrCode: Product | string): string {
  const code =
    typeof productOrCode === "string"
      ? productOrCode.trim().toUpperCase()
      : productScanCode(productOrCode);
  return `${appPublicOrigin()}/p/${encodeURIComponent(code)}`;
}

/**
 * Accepts raw scanner input: plain SKU, manufacturer code, or a product card URL.
 * Returns the product code to look up, or null if empty.
 */
export function extractProductCode(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const url = new URL(trimmed);
      const match = url.pathname.match(/\/p\/([^/]+)\/?$/i);
      if (match?.[1]) {
        return decodeURIComponent(match[1]).trim().toUpperCase();
      }
    }
  } catch {
    // not a URL
  }

  const pathMatch = trimmed.match(/\/p\/([^/?#]+)/i);
  if (pathMatch?.[1]) {
    return decodeURIComponent(pathMatch[1]).trim().toUpperCase();
  }

  return trimmed.toUpperCase();
}

function BarcodeSvg({ value, height = 48 }: { value: string; height?: number }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || !value) return;
    try {
      JsBarcode(ref.current, value, {
        format: "CODE128",
        displayValue: true,
        fontSize: 12,
        height,
        margin: 4,
        background: "#ffffff",
        lineColor: "#0f172a",
      });
    } catch {
      // Invalid barcode characters — leave empty
    }
  }, [value, height]);

  return <svg ref={ref} className="max-w-full" />;
}

export function ProductCodeLabel({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const code = productScanCode(product);
  const qrValue = productPublicUrl(product);

  return (
    <div className={`rounded-lg border border-slate-200 bg-white p-3 text-slate-900 ${compact ? "" : "space-y-3"}`}>
      {!compact && (
        <div>
          <p className="text-sm font-semibold leading-tight">{product.productName}</p>
          <p className="text-xs text-slate-500">{product.category} · {formatRwf(product.unitPrice)}</p>
        </div>
      )}
      <div className={`flex items-center ${compact ? "gap-2" : "justify-between gap-4"}`}>
        <div className="min-w-0 flex-1 overflow-hidden">
          <BarcodeSvg value={code} height={compact ? 36 : 52} />
        </div>
        <QRCodeSVG value={qrValue} size={compact ? 64 : 96} level="M" includeMargin className="shrink-0" />
      </div>
      {!compact && (
        <p className="text-center font-mono text-xs tracking-wide text-slate-600">
          Scan QR opens product card · code <span className="font-semibold text-slate-900">{code}</span>
        </p>
      )}
    </div>
  );
}

export function PrintableProductLabel({ product }: { product: Product }) {
  const code = productScanCode(product);
  const qrValue = productPublicUrl(product);
  return (
    <div className="mx-auto w-[320px] space-y-2 rounded border border-slate-300 bg-white p-4 text-center text-slate-900 print:border-black">
      <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Built In Hardware</p>
      <p className="text-base font-bold leading-tight">{product.productName}</p>
      <p className="text-xs text-slate-600">
        {product.brand ? `${product.brand} · ` : ""}
        {product.category}
        {product.unit ? ` · ${product.unit}` : ""}
      </p>
      {product.shelfLocation && (
        <p className="text-xs">
          Shelf: <strong>{product.shelfLocation}</strong>
        </p>
      )}
      <p className="text-sm font-semibold">{formatRwf(product.unitPrice)}</p>
      <div className="flex items-center justify-center gap-3 pt-1">
        <BarcodeSvg value={code} height={44} />
        <QRCodeSVG value={qrValue} size={80} level="M" includeMargin />
      </div>
      <p className="font-mono text-xs">{code}</p>
    </div>
  );
}
