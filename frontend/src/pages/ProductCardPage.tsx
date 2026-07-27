import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { api, ApiClientError, getAuth } from "@/lib/api";
import { formatRwf } from "@/lib/utils";
import { can } from "@/lib/permissions";
import type { Product } from "@/types";
import { productPublicUrl, productScanCode } from "@/components/ProductCodes";
import { Button } from "@/components/ui/button";

/**
 * Public product card shown after scanning a QR code.
 * Layout matches the Built In Hardware label design.
 */
export default function ProductCardPage() {
  const { code = "" } = useParams();
  const auth = getAuth();
  const canSell = can(auth, "createSale");

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product-card", code],
    queryFn: () => api.get<Product>(`/products/lookup?code=${encodeURIComponent(code)}`),
    enabled: Boolean(code),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <p className="text-slate-500">Loading product…</p>
      </div>
    );
  }

  if (error || !product) {
    const message =
      error instanceof ApiClientError ? error.message : "Product not found for this code.";
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Built In Hardware</p>
          <p className="mt-4 text-lg font-semibold text-slate-800">Product not found</p>
          <p className="mt-2 text-sm text-slate-500">{message}</p>
          <p className="mt-2 font-mono text-xs text-slate-400">{code}</p>
        </div>
        <Button asChild variant="outline">
          <Link to={auth ? "/inventory" : "/"}>Back</Link>
        </Button>
      </div>
    );
  }

  const sku = productScanCode(product);
  const meta = [product.brand || "Built In", product.category, product.unit || "PCS"]
    .filter(Boolean)
    .join(" · ");
  const qrValue = productPublicUrl(product);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 py-10">
      <article className="w-full max-w-[360px] rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm">
        <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-orange-600">
          Built In Hardware
        </p>

        <h1 className="mt-4 text-[1.65rem] font-bold leading-tight text-slate-900">
          {product.productName}
        </h1>

        <p className="mt-2 text-sm text-slate-500">{meta}</p>

        {product.shelfLocation && (
          <p className="mt-3 text-sm text-slate-500">
            Shelf: <span className="font-semibold text-slate-800">{product.shelfLocation}</span>
          </p>
        )}

        <p className="mt-4 text-xl font-bold text-slate-900">{formatRwf(product.unitPrice)}</p>

        <div className="mt-6 flex justify-center">
          <QRCodeSVG value={qrValue} size={168} level="M" includeMargin={false} />
        </div>

        <p className="mt-4 font-mono text-base font-semibold tracking-wide text-slate-900">{sku}</p>

        {product.description?.trim() && (
          <p className="mt-5 text-left text-sm leading-relaxed text-slate-500">
            {product.description}
          </p>
        )}

        <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 text-left text-xs">
          <div>
            <dt className="text-slate-400">In stock</dt>
            <dd className="mt-0.5 font-semibold text-slate-800">{product.quantityInStock ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Status</dt>
            <dd className={`mt-0.5 font-semibold ${product.lowStock ? "text-red-600" : "text-emerald-700"}`}>
              {product.lowStock ? "Low stock" : "Available"}
            </dd>
          </div>
        </dl>
      </article>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {auth && (
          <Button asChild variant="outline">
            <Link to="/inventory">Back to inventory</Link>
          </Button>
        )}
        {canSell && (
          <Button asChild>
            <Link to="/sales/new" state={{ addProductId: product.productId }}>
              Add to sale
            </Link>
          </Button>
        )}
        {!auth && (
          <Button asChild variant="outline">
            <Link to="/">Home</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
