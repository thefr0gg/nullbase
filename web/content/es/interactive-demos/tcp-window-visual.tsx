"use client";

import { useSliderValue } from "@/components/interactive/InteractiveSlider";

/**
 * Visualización del control deslizante para `tcp-vs-udp.mdx` — ver la
 * versión en inglés para la justificación del patrón «componente cliente
 * dedicado que lee el valor mediante contexto» en vez de una función pasada
 * como prop.
 */
export default function TcpWindowVisual() {
  const value = useSliderValue();

  return (
    <div>
      <div className="flex gap-0.5">
        {Array.from({ length: 64 }, (_, i) => (
          <span
            key={i}
            className={i < value ? "h-4 flex-1 rounded-sm bg-electric-blue" : "h-4 flex-1 rounded-sm bg-border"}
          />
        ))}
      </div>
      <p className="mt-3 text-sm text-text-secondary">
        Hasta <strong className="text-text-primary">{value} KB</strong> pueden estar en tránsito, sin confirmar,
        antes de que el emisor tenga que pausar. Demasiado pequeño y los enlaces de alta latencia quedan inactivos
        esperando los ACK; demasiado grande y un enlace con pérdidas desperdicia ancho de banda reenviando ráfagas
        grandes.
      </p>
    </div>
  );
}
