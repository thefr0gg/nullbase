import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** A service worker's install -> activate -> fetch -> update lifecycle —
 *  colocated per the interactive system's authoring convention. */
export const serviceWorkerLifecycleSteps: StepFlowStep[] = [
  {
    actor: "Page",
    title: "Enregistrement",
    description:
      "Le propre JavaScript de la page enregistre un script séparé comme son service worker. Le navigateur le télécharge et commence à l'installer en arrière-plan — la page qui l'a enregistré continue de fonctionner sans être affectée.",
    detail: "navigator.serviceWorker.register(\"/sw.js\");",
  },
  {
    actor: "Service worker",
    title: "Install",
    description:
      "L'événement install se déclenche une seule fois. C'est typiquement là qu'un service worker pré-met en cache les ressources qu'il souhaite disponibles hors ligne, via la Cache API.",
    detail: 'self.addEventListener("install", (e) => {\n  e.waitUntil(caches.open("v1").then((c) => c.addAll(["/", "/app.js", "/app.css"])));\n});',
  },
  {
    actor: "Service worker",
    title: "Waiting",
    description:
      "Si une ancienne version du service worker contrôle déjà des pages ouvertes, la nouvelle attend ici plutôt que de prendre immédiatement le relais — par défaut, elle ne s'active qu'une fois que chaque page contrôlée par l'ancienne version a été fermée, afin qu'un utilisateur n'ait jamais deux versions incompatibles s'exécutant contre le même onglet ouvert.",
  },
  {
    actor: "Service worker",
    title: "Activate",
    description:
      "Une fois que plus rien n'utilise l'ancienne version, activate se déclenche — un bon endroit pour nettoyer les caches d'une version précédente qui ne sont plus nécessaires.",
    detail: 'self.addEventListener("activate", (e) => {\n  e.waitUntil(caches.delete("v0")); // drop the old cache\n});',
  },
  {
    actor: "Service worker",
    title: "Intercepter les requêtes",
    description:
      "À partir de maintenant, le service worker se place entre la page et le réseau — chaque requête que la page effectue déclenche un événement fetch que le worker peut intercepter, et auquel répondre depuis le cache, depuis le réseau, ou un mélange des deux (par exemple cache-first, avec repli sur le réseau).",
    detail: 'self.addEventListener("fetch", (e) => {\n  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));\n});',
  },
  {
    actor: "Navigateur",
    title: "Vérifier les mises à jour",
    description:
      "Le navigateur re-télécharge périodiquement le script du service worker et le compare octet par octet à la version installée. Un seul octet modifié est traité comme une nouvelle version, redémarrant tout ce cycle de vie pour le nouveau script — ce qui explique pourquoi une version en cache périmée peut sembler « bloquée » jusqu'à la fermeture de chaque ancien onglet.",
  },
];
