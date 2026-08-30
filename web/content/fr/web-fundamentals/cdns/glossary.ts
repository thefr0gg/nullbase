import type { ItemExplorerItem } from "@/components/interactive/ItemExplorer";

export const cdnGlossaryItems: ItemExplorerItem[] = [
  { id: "origin", label: "Origin Server", color: "blue", detail: "Votre backend réel — la source de vérité à laquelle le CDN se rabat en cas de Cache Miss." },
  { id: "edge", label: "Edge Server", color: "green", detail: "Un serveur CDN physiquement proche des utilisateurs finaux, qui met en Cache et sert le contenu pour le compte de l'origine." },
  { id: "pop", label: "Point de présence (PoP)", color: "green", detail: "Un emplacement de centre de données physique hébergeant un ou plusieurs Edge Servers." },
  { id: "ttl", label: "Durée de vie (TTL)", color: "purple", detail: "Combien de temps un serveur Edge conserve une copie en Cache avant de la considérer périmée et de la récupérer à nouveau depuis l'origine." },
  { id: "purge", label: "Purge / Invalidation", color: "orange", detail: "Indiquer manuellement à chaque serveur Edge d'abandonner immédiatement une copie en Cache, plutôt que d'attendre l'expiration du TTL — utilisé lorsque le contenu de l'origine change de manière inattendue." },
  { id: "origin-shield", label: "Origin Shield", color: "red", detail: "Une couche de Cache supplémentaire entre les serveurs Edge et l'origine, afin qu'un Cache Miss sur 50 Edges différents ne se transforme pas en 50 requêtes simultanées atteignant l'origine d'un coup." },
];
