import { formatRwf } from "@/lib/utils";
import type { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductCodeLabel, PrintableProductLabel, productPublicUrl, productScanCode } from "@/components/ProductCodes";

type Props = {
  product: Product;
  onClose?: () => void;
  /** Optional POS action */
  onAddToSale?: (product: Product) => void;
  showPrint?: boolean;
};

export function ProductScanDetails({ product, onClose, onAddToSale, showPrint = true }: Props) {
  const handlePrint = () => {
    const w = window.open("", "_blank", "width=420,height=640");
    if (!w) return;
    const code = productScanCode(product);
    const qrUrl = productPublicUrl(product);
    w.document.write(`<!DOCTYPE html><html><head><title>Label ${code}</title>
      <style>
        body{font-family:system-ui,sans-serif;padding:24px;color:#0f172a;background:#f1f5f9}
        .box{width:300px;margin:0 auto;border:1px solid #e2e8f0;border-radius:16px;padding:28px 24px;text-align:center;background:#fff}
        h1{font-size:13px;margin:0;color:#ea580c;text-transform:uppercase;letter-spacing:.08em;font-weight:700}
        h2{font-size:22px;margin:16px 0 8px;color:#0f172a}
        .meta{font-size:13px;color:#64748b;margin:4px 0}
        .price{font-size:20px;font-weight:700;margin:16px 0;color:#0f172a}
        .code{font-family:ui-monospace,monospace;font-size:15px;font-weight:600;margin-top:12px}
        img{margin:16px auto;display:block}
        .desc{font-size:13px;color:#64748b;text-align:left;margin-top:16px}
        @media print{body{padding:0;background:#fff}.box{border:1px solid #cbd5e1}}
      </style></head><body>
      <div class="box">
        <h1>Built In Hardware</h1>
        <h2>${escapeHtml(product.productName)}</h2>
        <p class="meta">${escapeHtml([product.brand || "Built In", product.category, product.unit || "PCS"].filter(Boolean).join(" · "))}</p>
        ${product.shelfLocation ? `<p class="meta">Shelf: <strong>${escapeHtml(product.shelfLocation)}</strong></p>` : ""}
        <p class="price">${formatRwf(product.unitPrice)}</p>
        <img alt="QR" width="160" height="160" src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrUrl)}" />
        <p class="code">${escapeHtml(code)}</p>
        ${product.description ? `<p class="desc">${escapeHtml(product.description)}</p>` : ""}
      </div>
      <script>window.onload=()=>{window.print();}</script>
      </body></html>`);
    w.document.close();
  };

  return (
    <Card className="border-orange-200 shadow-sm dark:border-orange-900">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">{product.productName}</CardTitle>
          <p className="mt-1 text-sm text-slate-500">Scanned product details</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.lowStock && <Badge variant="destructive">Low stock</Badge>}
          {onClose && (
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Detail label="SKU / scan code" value={product.sku || "—"} mono />
          <Detail label="Manufacturer code" value={product.manufacturerCode || "—"} mono />
          <Detail label="Brand" value={product.brand || "—"} />
          <Detail label="Category" value={product.category} />
          <Detail label="Unit" value={product.unit || "PCS"} />
          <Detail label="Shelf / bin" value={product.shelfLocation || "—"} />
          <Detail label="Unit price" value={formatRwf(product.unitPrice)} />
          <Detail
            label="Stock on hand"
            value={`${product.quantityInStock ?? 0}${product.reorderLevel != null ? ` (reorder at ${product.reorderLevel})` : ""}`}
          />
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Description</dt>
            <dd className="mt-1 text-slate-800 dark:text-slate-200">
              {product.description?.trim() || "No description on file."}
            </dd>
          </div>
        </dl>

        <ProductCodeLabel product={product} />

        <div className="flex flex-wrap gap-2">
          {onAddToSale && (
            <Button type="button" onClick={() => onAddToSale(product)}>
              Add to sale
            </Button>
          )}
          {showPrint && (
            <Button type="button" variant="outline" onClick={handlePrint}>
              Print label
            </Button>
          )}
        </div>

        {/* Keep printable React label available for in-page print styles if needed */}
        <div className="hidden print:block">
          <PrintableProductLabel product={product} />
        </div>
      </CardContent>
    </Card>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className={`mt-1 ${mono ? "font-mono text-xs" : "font-medium"}`}>{value}</dd>
    </div>
  );
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
