import { useEffect, useId, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/api";
import type { Product } from "@/types";
import { extractProductCode } from "@/components/ProductCodes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScanBarcode, Camera, Keyboard } from "lucide-react";

type Props = {
  onProduct: (product: Product) => void;
  /** When true, starts focused for USB barcode scanners (keyboard wedge). */
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
};

export function ProductScanner({
  onProduct,
  autoFocus = true,
  placeholder = "Scan barcode / QR or type SKU then Enter",
  className = "",
}: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const regionId = useId().replace(/:/g, "");
  const lastScanRef = useRef({ code: "", at: 0 });

  const lookup = async (raw: string) => {
    const productCode = extractProductCode(raw);
    if (!productCode) return;

    const now = Date.now();
    if (lastScanRef.current.code === productCode && now - lastScanRef.current.at < 1500) {
      return;
    }
    lastScanRef.current = { code: productCode, at: now };

    setLoading(true);
    try {
      const product = await api.get<Product>(`/products/lookup?code=${encodeURIComponent(productCode)}`);
      onProduct(product);
      setCode("");
      toast.success(`Found: ${product.productName}`);
    } catch (e) {
      toast.error(e instanceof ApiClientError ? e.message : "Product not found for this code");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (!cameraOn) return;

    const scanner = new Html5Qrcode(regionId);
    scannerRef.current = scanner;
    let cancelled = false;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 8, qrbox: { width: 240, height: 240 } },
        (decoded) => {
          if (!cancelled) void lookup(decoded);
        },
        () => undefined
      )
      .catch(() => {
        toast.error("Camera unavailable. Use a USB scanner or type the code.");
        setCameraOn(false);
      });

    return () => {
      cancelled = true;
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => undefined);
      scannerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOn, regionId]);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[220px] flex-1">
          <Label className="flex items-center gap-1.5">
            <ScanBarcode className="h-3.5 w-3.5" />
            Scan product code
          </Label>
          <Input
            ref={inputRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void lookup(code);
              }
            }}
            placeholder={placeholder}
            disabled={loading}
            className="font-mono"
            autoComplete="off"
          />
        </div>
        <Button type="button" onClick={() => void lookup(code)} disabled={loading || !code.trim()}>
          {loading ? "Looking up..." : "Lookup"}
        </Button>
        <Button
          type="button"
          variant={cameraOn ? "default" : "outline"}
          onClick={() => setCameraOn((v) => !v)}
        >
          {cameraOn ? (
            <>
              <Keyboard className="mr-1.5 h-4 w-4" /> Stop camera
            </>
          ) : (
            <>
              <Camera className="mr-1.5 h-4 w-4" /> Camera scan
            </>
          )}
        </Button>
      </div>
      {cameraOn && (
        <div className="overflow-hidden rounded-lg border border-slate-300 bg-black">
          <div id={regionId} className="mx-auto max-w-md" />
          <p className="bg-slate-900 px-3 py-2 text-center text-xs text-slate-300">
            Point the camera at a product barcode or QR code
          </p>
        </div>
      )}
      <p className="text-xs text-slate-500">
        QR opens the product card page. USB scanners, camera, or typing SKU (e.g. BI-0001) all work.
      </p>
    </div>
  );
}
