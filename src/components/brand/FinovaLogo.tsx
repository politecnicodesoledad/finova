import hexAsset from "@/assets/finova-hexagon.png.asset.json";
import fullAsset from "@/assets/finova-logo-full.png.asset.json";

/** Official FINOVA hexagon (transparent background), for headers and small spaces. */
export function FinovaHexagon({ size = 38, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src={hexAsset.url}
      width={size}
      height={size}
      alt="FINOVA"
      className={`shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}

/** Full official logo: hexagon + FINOVA + "Finanzas inteligentes" + motto. Use on dark surfaces. */
export function FinovaFullLogo({ className = "" }: { className?: string }) {
  return (
    <img
      src={fullAsset.url}
      alt="FINOVA · Finanzas inteligentes · Tu dinero. Tus metas. Nuestro plan."
      className={`block h-auto ${className}`}
      draggable={false}
    />
  );
}
