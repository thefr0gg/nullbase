import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ItemExplorer from "./ItemExplorer";

describe("ItemExplorer table layout", () => {
  it("expands and collapses a row's detail on click", async () => {
    const user = userEvent.setup();
    render(
      <ItemExplorer
        layout="table"
        tableColumns={[{ key: "a", label: "A" }]}
        items={[{ id: "x", label: "X", columns: { a: "1" }, detail: "More about X" }]}
      />,
    );

    const toggle = screen.getByRole("button", { name: "X" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("renders a row without a toggle when it has no detail", () => {
    render(
      <ItemExplorer
        layout="table"
        tableColumns={[{ key: "a", label: "A" }]}
        items={[{ id: "x", label: "X", columns: { a: "1" } }]}
      />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
