"use client";

import { useSliderValue } from "@/components/interactive/InteractiveSlider";

/**
 * Visualisation de curseur pour `tcp-vs-udp.mdx` — voir la version anglaise
 * pour la justification du motif « composant client dédié lisant la valeur
 * via le contexte » plutôt qu'une fonction passée en prop.
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
        Jusqu&rsquo;à <strong className="text-text-primary">{value} Ko</strong> peuvent être en transit, sans accusé
        de réception, avant que l&rsquo;émetteur ne doive faire une pause. Trop petit, et les liens à forte latence
        restent inactifs en attendant les ACK ; trop grand, et un lien avec pertes gaspille de la bande passante en
        retransmettant de larges rafales.
      </p>
    </div>
  );
}
