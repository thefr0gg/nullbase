import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** Ce que la durabilité garantit réellement quand une base de données plante
 *  en cours d'écriture — colocalisé selon la convention du système interactif. */
export const crashRecoverySteps: StepFlowStep[] = [
  {
    actor: "Client",
    title: "Le COMMIT est demandé",
    description:
      "Une transaction a effectué ses changements en mémoire et demande maintenant à la base de données de les rendre permanents.",
  },
  {
    actor: "Base de données",
    title: "Écrire d'abord dans le journal des écritures anticipées",
    description:
      "Avant de toucher aux fichiers de données réels, le moteur ajoute un enregistrement du changement à un journal des écritures anticipées (WAL) sur disque — un simple fichier séquentiel, en ajout uniquement, bien plus rapide à écrire de manière fiable qu'éparpiller les changements dans les structures de données réelles.",
    detail: "WAL entry: UPDATE accounts SET balance=900 WHERE id=1 (was 1000)",
  },
  {
    actor: "Base de données",
    title: "Forcer l'écriture du journal sur stockage durable",
    description:
      "Le moteur appelle fsync (ou équivalent) pour forcer le système d'exploitation à réellement écrire l'entrée du journal sur le disque physique — pas seulement la remettre à un tampon qui pourrait encore être perdu lors d'une coupure de courant. Ce n'est qu'une fois cela réussi que le moteur considère la transaction comme durable.",
  },
  {
    actor: "Base de données",
    title: "Accuser réception du commit",
    description:
      "Ce n'est qu'à ce moment que la base de données indique au client que le COMMIT a réussi. Si un plantage survient à n'importe quel moment avant cette étape, le client n'a jamais reçu de confirmation — de son point de vue, la transaction est encore incertaine, ce qui est le résultat correct et sûr.",
  },
  {
    actor: "Base de données",
    title: "Appliquer les changements aux fichiers de données réels (plus tard)",
    description:
      "Les fichiers de données de table/index réels sont mis à jour à partir du WAL au rythme propre du moteur — cela peut se produire bien après que le commit a été accusé, car l'entrée du WAL suffit à elle seule à reconstruire le changement si nécessaire.",
  },
  {
    actor: "Base de données",
    title: "Plantage — et récupération",
    description:
      "Si le processus plante avant que les fichiers de données ne rattrapent leur retard, le démarrage suivant rejoue le WAL depuis le dernier point confirmé — réappliquant tout changement validé qui n'était pas encore arrivé dans les fichiers de données, et écartant tout ce qui n'a jamais été entièrement écrit dans le journal. C'est exactement ainsi qu'une transaction validée survit à un plantage, même un survenant une fraction de seconde après le retour de COMMIT.",
  },
];
