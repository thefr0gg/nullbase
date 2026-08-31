import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrderingExercise from "./OrderingExercise";

describe("OrderingExercise", () => {
  it("reports incorrect when submitted out of order, then correct once reordered", async () => {
    const user = userEvent.setup();
    render(
      <OrderingExercise
        prompt="Put these in order."
        items={[
          { id: "b", label: "B" },
          { id: "a", label: "A" },
        ]}
        correctOrder={["a", "b"]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText("Not quite.")).toBeInTheDocument();

    // Move "A" (currently second) up one position to match the correct order.
    const moveUpButtons = screen.getAllByLabelText("Move up");
    await user.click(moveUpButtons[1]);

    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText("Correct!")).toBeInTheDocument();
  });

  it("retry resets to the original order and clears the result", async () => {
    const user = userEvent.setup();
    render(
      <OrderingExercise
        prompt="Put these in order."
        items={[
          { id: "b", label: "B" },
          { id: "a", label: "A" },
        ]}
        correctOrder={["a", "b"]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText("Not quite.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.queryByText("Not quite.")).not.toBeInTheDocument();
  });

  it("reveals the correct order on request", async () => {
    const user = userEvent.setup();
    render(
      <OrderingExercise
        prompt="Put these in order."
        items={[
          { id: "b", label: "B" },
          { id: "a", label: "A" },
        ]}
        correctOrder={["a", "b"]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Show answer" }));
    expect(screen.getByText("Correct order")).toBeInTheDocument();
  });
});
