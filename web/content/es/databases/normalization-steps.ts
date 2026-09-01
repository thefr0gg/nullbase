import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** Normalizando una única tabla de pedidos desnormalizada a través de 1NF,
 *  2NF, y 3NF — colocalizado según la convención de autoría del sistema
 *  interactivo. */
export const normalizationSteps: StepFlowStep[] = [
  {
    title: "Inicio: una única tabla plana y desnormalizada",
    description:
      "Cada pedido repite los datos completos del cliente y los datos completos del producto en cada fila. Actualiza el email de un cliente, y ahora tiene que cambiar en cada fila que ese cliente haya pedido alguna vez — te olvidas de una, y los datos se contradicen silenciosamente entre sí.",
    detail:
      "orders\n" +
      "id | customer_name | customer_email      | product_name | product_price | quantity\n" +
      "1  | Ada Lovelace   | ada@example.com     | Widget       | 9.99          | 3\n" +
      "2  | Ada Lovelace   | ada@example.com     | Gadget       | 19.99         | 1\n" +
      "3  | Alan Turing    | alan@example.com    | Widget       | 9.99          | 2",
  },
  {
    actor: "1NF",
    title: "Primera Forma Normal: valores atómicos, sin grupos repetidos",
    description:
      "1NF exige que cada columna contenga un único valor indivisible — nada de una lista de productos separada por comas metida en una sola celda, ni columnas repetidas product_1/product_2/product_3. La tabla de arriba ya cumple esto (cada fila es una línea de pedido, un valor por celda) — una violación común sería una única columna \"products\" con \"Widget, Gadget\".",
  },
  {
    actor: "2NF",
    title: "Segunda Forma Normal: sin dependencia parcial de parte de la clave",
    description:
      "2NF aplica cuando una tabla tiene una clave compuesta — cada columna que no es clave tiene que depender de TODA la clave, no solo de una parte. product_price solo depende de qué producto es, no de a qué línea de pedido específica está adjunto, así que se extrae a su propia tabla products, con clave solo en el producto.",
    detail:
      "products\n" +
      "id | name   | price\n" +
      "1  | Widget | 9.99\n" +
      "2  | Gadget | 19.99",
  },
  {
    actor: "3NF",
    title: "Tercera Forma Normal: sin dependencia transitiva",
    description:
      "3NF elimina columnas que dependen de otra columna que NO es la clave, en lugar de depender de la clave misma. customer_email depende de qué cliente es, no del pedido — así que los clientes también obtienen su propia tabla, referenciada desde orders por id en vez de repetir sus datos en cada fila.",
    detail:
      "customers\n" +
      "id | name         | email\n" +
      "1  | Ada Lovelace | ada@example.com\n" +
      "2  | Alan Turing  | alan@example.com",
  },
  {
    title: "Final: tres tablas normalizadas, unidas con JOIN cuando se necesitan",
    description:
      "orders ahora solo referencia customer_id y product_id. Actualizar el email de un cliente es una fila en una tabla. La vista plana original nunca se pierde — se reconstruye bajo demanda con un JOIN, el mismo JOIN cubierto en la página de SQL — la normalización cambia algo de complejidad en las consultas por eliminar toda una clase de errores de consistencia en las actualizaciones.",
    detail:
      "orders\n" +
      "id | customer_id | product_id | quantity\n" +
      "1  | 1           | 1          | 3\n" +
      "2  | 1           | 2          | 1\n" +
      "3  | 2           | 1          | 2",
  },
];
