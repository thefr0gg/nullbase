import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** La vie d'une migration de schéma, d'un changement local à une base de
 *  données de production synchronisée avec lui — colocalisé selon la
 *  convention du système interactif. */
export const migrationLifecycleSteps: StepFlowStep[] = [
  {
    actor: "Développeur",
    title: "Changer le schéma localement",
    description:
      "Une nouvelle fonctionnalité a besoin d'une nouvelle colonne, table ou index. Au lieu de modifier la base de données locale à la main, le changement est écrit sous forme de fichier de migration — un petit script décrivant exactement ce qu'il faut changer.",
    detail: "0007_add_users_last_login.sql\n\nALTER TABLE users ADD COLUMN last_login_at TEXT;",
  },
  {
    actor: "Outil de migration",
    title: "Suivre quelles migrations ont été exécutées",
    description:
      "L'outil de migration conserve sa propre table dans la base de données (généralement nommée quelque chose comme schema_migrations) enregistrant quels fichiers de migration ont déjà été appliqués — c'est ce qui lui permet de déterminer exactement quelles NOUVELLES migrations doivent s'exécuter, sur n'importe quelle base de données, sans réexécuter celles déjà appliquées.",
    detail: "schema_migrations\nversion\n0005_create_orders\n0006_add_orders_index",
  },
  {
    actor: "Outil de migration",
    title: "Appliquer les nouvelles migrations, dans l'ordre",
    description:
      "Exécuter l'outil localement applique chaque fichier de migration plus récent que la dernière version enregistrée, dans l'ordre du nom de fichier/version — 0007 s'exécute, et la table de suivi reçoit une nouvelle ligne pour elle.",
  },
  {
    actor: "Équipe",
    title: "Committer le fichier de migration avec le code qui en a besoin",
    description:
      "Le fichier de migration est committé dans le contrôle de version aux côtés du code applicatif qui dépend de la nouvelle colonne — c'est ce qui garde les changements de schéma et de code revus et déployés ensemble, au lieu qu'un changement de schéma se produise hors bande et surprenne le prochain déploiement.",
  },
  {
    actor: "CI / processus de déploiement",
    title: "Appliquer la même migration au staging, puis à la production",
    description:
      "Exactement le même fichier de migration — pas un équivalent tapé à la main — s'exécute contre le staging, puis la production, généralement comme une étape automatisée avant ou pendant le déploiement. Chaque environnement converge vers le schéma identique, dans l'ordre identique, parce qu'ils ont tous exécuté les fichiers identiques.",
  },
  {
    actor: "Développeur",
    title: "Écrire aussi une migration descendante, si l'outil le supporte",
    description:
      "De nombreux outils de migration associent chaque migration « up » à une migration « down » qui l'inverse — non pas parce que les rollbacks sont courants, mais parce qu'un déploiement qui doit être annulé a besoin que le schéma soit lui aussi réversible, et écrire la migration descendante pendant que le changement est encore frais est bien plus facile que de la reconstruire sous pression plus tard.",
    detail: "-- up:   ALTER TABLE users ADD COLUMN last_login_at TEXT;\n-- down: ALTER TABLE users DROP COLUMN last_login_at;",
  },
];
