import { useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import JsBarcode from "jsbarcode";
import { formatRwf } from "@/lib/utils";
import type { Product } from "@/types";

/** Canonical scannable code for a product (SKU preferred). */
export function productScanCode(product: Pick<Product, "sku" | "manufacturerCode" | "productId">): string {
  return (product.sku || product.manufacturerCode || `BI-${String(product.productId).padStart(4, "0")}`).toUpperCase();
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
        <QRCodeSVG value={code} size={compact ? 64 : 96} level="M" includeMargin className="shrink-0" />
      </div>
      {!compact && (
        <p className="text-center font-mono text-xs tracking-wide text-slate-600">
          Scan code: <span className="font-semibold text-slate-900">{code}</span>
        </p>
      )}
    </div>
  );
}

export function PrintableProductLabel({ product }: { product: Product }) {
  const code = productScanCode(product);
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
        <p className="text-xs">Shelf: <strong>{product.shelfLocation}</strong></p>
      )}
      <p className="text-sm font-semibold">{formatRwf(product.unitPrice)}</p>
      <div className="flex items-center justify-center gap-3 pt-1">
        <BarcodeSvg value={code} height={44} />
        <QRCodeSVG value={code} size={80} level="M" includeMargin />
      </div>
      <p className="font-mono text-xs">{code}</p>
    </div>
  );
}
