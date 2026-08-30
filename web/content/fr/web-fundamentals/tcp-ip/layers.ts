import type { ItemExplorerItem } from "@/components/interactive/ItemExplorer";

export const tcpIpLayerItems: ItemExplorerItem[] = [
  {
    id: "application",
    label: "Application",
    color: "purple",
    detail: "Où résident vos protocoles : HTTP, DNS, SMTP. C'est généralement la seule couche que le code applicatif touche directement.",
  },
  {
    id: "transport",
    label: "Transport",
    color: "blue",
    detail: "TCP ou UDP. Ajoute les ports (pour que plusieurs applications puissent partager une seule adresse IP) et, pour TCP, la fiabilité — ordonnancement, retransmission, contrôle de flux.",
  },
  {
    id: "internet",
    label: "Internet",
    color: "green",
    detail: "IP. Ajoute l'adressage et le routage — faire passer un paquet d'un réseau à un autre, sans garantie de livraison ni d'ordre à elle seule.",
  },
  {
    id: "link",
    label: "Liaison",
    color: "orange",
    detail: "Ethernet, Wi-Fi. Déplace une trame à travers une seule liaison physique ou locale — la couche saut par saut, pas de bout en bout.",
  },
];
