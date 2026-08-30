import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** Normalizing a single denormalized orders table through 1NF, 2NF, and
 *  3NF — colocated per the interactive system's authoring convention. */
export const normalizationSteps: StepFlowStep[] = [
  {
    title: "Start: one flat, denormalized table",
    description:
      "Every order repeats the customer's full details and the product's full details on every row. Update a customer's email, and it now has to change in every row that customer ever ordered — miss one, and the data quietly disagrees with itself.",
    detail:
      "orders\n" +
      "id | customer_name | customer_email      | product_name | product_price | quantity\n" +
      "1  | Ada Lovelace   | ada@example.com     | Widget       | 9.99          | 3\n" +
      "2  | Ada Lovelace   | ada@example.com     | Gadget       | 19.99         | 1\n" +
      "3  | Alan Turing    | alan@example.com    | Widget       | 9.99          | 2",
  },
  {
    actor: "1NF",
    title: "First Normal Form: atomic values, no repeating groups",
    description:
      "1NF requires every column to hold a single, indivisible value — no comma-separated list of products crammed into one cell, no repeating product_1/product_2/product_3 columns. The table above already satisfies this (each row is one order line, one value per cell) — a common violation would be a single \"products\" column holding \"Widget, Gadget\".",
  },
  {
    actor: "2NF",
    title: "Second Normal Form: no partial dependency on part of the key",
    description:
      "2NF applies when a table has a composite key — every non-key column has to depend on the WHOLE key, not just part of it. product_price only depends on which product it is, not on which specific order line it's attached to, so it's pulled into its own products table, keyed by product alone.",
    detail:
      "products\n" +
      "id | name   | price\n" +
      "1  | Widget | 9.99\n" +
      "2  | Gadget | 19.99",
  },
  {
    actor: "3NF",
    title: "Third Normal Form: no transitive dependency",
    description:
      "3NF removes columns that depend on another NON-key column rather than the key itself. customer_email depends on which customer it is, not on the order — so customers get their own table too, referenced from orders by id instead of repeating their details on every row.",
    detail:
      "customers\n" +
      "id | name         | email\n" +
      "1  | Ada Lovelace | ada@example.com\n" +
      "2  | Alan Turing  | alan@example.com",
  },
  {
    title: "End: three normalized tables, joined when needed",
    description:
      "orders now just references customer_id and product_id. Updating a customer's email is one row in one table. The original flat view is never lost — it's reconstructed on demand with a JOIN, the same JOIN covered on the SQL page — normalization trades a bit of query complexity for eliminating an entire class of update-consistency bugs.",
    detail:
      "orders\n" +
      "id | customer_id | product_id | quantity\n" +
      "1  | 1           | 1          | 3\n" +
      "2  | 1           | 2          | 1\n" +
      "3  | 2           | 1          | 2",
  },
];
