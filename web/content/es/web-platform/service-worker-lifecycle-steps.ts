import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** A service worker's install -> activate -> fetch -> update lifecycle —
 *  colocated per the interactive system's authoring convention. */
export const serviceWorkerLifecycleSteps: StepFlowStep[] = [
  {
    actor: "Página",
    title: "Registrar",
    description:
      "El propio JavaScript de la página registra un script separado como su service worker. El navegador lo descarga y comienza a instalarlo en segundo plano — la página que lo registró sigue ejecutándose sin verse afectada.",
    detail: "navigator.serviceWorker.register(\"/sw.js\");",
  },
  {
    actor: "Service worker",
    title: "Instalar",
    description:
      "El evento install se dispara una vez. Aquí es típicamente donde un service worker pre-almacena en caché los recursos que quiere tener disponibles sin conexión, usando la Cache API.",
    detail: 'self.addEventListener("install", (e) => {\n  e.waitUntil(caches.open("v1").then((c) => c.addAll(["/", "/app.js", "/app.css"])));\n});',
  },
  {
    actor: "Service worker",
    title: "Esperando",
    description:
      "Si una versión anterior del service worker ya está controlando páginas abiertas, la nueva espera aquí en lugar de tomar el control de inmediato — por defecto, solo se activa una vez que se han cerrado todas las páginas controladas por la versión anterior, de modo que un usuario nunca tiene dos versiones incompatibles ejecutándose contra la misma pestaña abierta.",
  },
  {
    actor: "Service worker",
    title: "Activar",
    description:
      "Una vez que nada usa la versión anterior, se dispara activate — un buen lugar para limpiar cachés de una versión anterior que ya no se necesitan.",
    detail: 'self.addEventListener("activate", (e) => {\n  e.waitUntil(caches.delete("v0")); // drop the old cache\n});',
  },
  {
    actor: "Service worker",
    title: "Interceptar solicitudes",
    description:
      "A partir de ahora, el service worker se sitúa entre la página y la red — cada solicitud que hace la página dispara un evento fetch que el worker puede interceptar, y responder desde la caché, desde la red, o una combinación de ambas (por ejemplo, caché primero, recurriendo a la red).",
    detail: 'self.addEventListener("fetch", (e) => {\n  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));\n});',
  },
  {
    actor: "Navegador",
    title: "Comprobar actualizaciones",
    description:
      "El navegador vuelve a descargar periódicamente el script del service worker y lo compara byte a byte con la versión instalada. Un solo byte cambiado se trata como una nueva versión, reiniciando todo este ciclo de vida para el nuevo script — razón por la cual una versión en caché obsoleta puede parecer «atascada» hasta que se cierre cada pestaña antigua.",
  },
];
