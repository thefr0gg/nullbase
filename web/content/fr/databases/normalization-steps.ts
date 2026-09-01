import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** Normaliser une seule table de commandes dénormalisée à travers 1NF, 2NF et
 *  3NF — colocalisé selon la convention du système interactif. */
export const normalizationSteps: StepFlowStep[] = [
  {
    title: "Départ : une seule table plate, dénormalisée",
    description:
      "Chaque commande répète les détails complets du client et les détails complets du produit sur chaque ligne. Mettez à jour l'email d'un client, et il faut maintenant le changer dans chaque ligne que ce client a jamais commandée — en oublier une, et les données se contredisent silencieusement.",
    detail:
      "orders\n" +
      "id | customer_name | customer_email      | product_name | product_price | quantity\n" +
      "1  | Ada Lovelace   | ada@example.com     | Widget       | 9.99          | 3\n" +
      "2  | Ada Lovelace   | ada@example.com     | Gadget       | 19.99         | 1\n" +
      "3  | Alan Turing    | alan@example.com    | Widget       | 9.99          | 2",
  },
  {
    actor: "1FN",
    title: "Première forme normale : valeurs atomiques, pas de groupes répétitifs",
    description:
      "La 1FN exige que chaque colonne contienne une seule valeur indivisible — pas de liste de produits séparée par des virgules entassée dans une seule cellule, pas de colonnes répétitives product_1/product_2/product_3. La table ci-dessus satisfait déjà cela (chaque ligne est une ligne de commande, une valeur par cellule) — une violation courante serait une seule colonne « products » contenant « Widget, Gadget ».",
  },
  {
    actor: "2FN",
    title: "Deuxième forme normale : pas de dépendance partielle sur une partie de la clé",
    description:
      "La 2FN s'applique quand une table a une clé composite — chaque colonne non-clé doit dépendre de la clé ENTIÈRE, pas seulement d'une partie. product_price ne dépend que du produit concerné, pas de la ligne de commande spécifique à laquelle il est rattaché, donc il est extrait dans sa propre table products, indexée par le produit seul.",
    detail:
      "products\n" +
      "id | name   | price\n" +
      "1  | Widget | 9.99\n" +
      "2  | Gadget | 19.99",
  },
  {
    actor: "3FN",
    title: "Troisième forme normale : pas de dépendance transitive",
    description:
      "La 3FN supprime les colonnes qui dépendent d'une autre colonne NON-clé plutôt que de la clé elle-même. customer_email dépend du client concerné, pas de la commande — donc les clients obtiennent aussi leur propre table, référencée depuis orders par id au lieu de répéter leurs détails sur chaque ligne.",
    detail:
      "customers\n" +
      "id | name         | email\n" +
      "1  | Ada Lovelace | ada@example.com\n" +
      "2  | Alan Turing  | alan@example.com",
  },
  {
    title: "Arrivée : trois tables normalisées, jointes au besoin",
    description:
      "orders ne fait plus que référencer customer_id et product_id. Mettre à jour l'email d'un client, c'est une seule ligne dans une seule table. La vue plate d'origine n'est jamais perdue — elle est reconstruite à la demande avec un JOIN, le même JOIN couvert sur la page SQL — la normalisation échange un peu de complexité de requête contre l'élimination de toute une classe de bugs de cohérence des mises à jour.",
    detail:
      "orders\n" +
      "id | customer_id | product_id | quantity\n" +
      "1  | 1           | 1          | 3\n" +
      "2  | 1           | 2          | 1\n" +
      "3  | 2           | 1          | 2",
  },
];
