import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrderingExercise from "./OrderingExercise";

describe("OrderingExercise", () => {
  it("reports incorrect when submitted out of order, then correct once reassembled", async () => {
    const user = userEvent.setup();
    render(
      <OrderingExercise
        prompt="Put these in order."
        items={[
          { id: "b", label: "beta" },
          { id: "a", label: "alpha" },
        ]}
        correctOrder={["a", "b"]}
      />,
    );

    // Bank starts in the given (shuffled) order: "beta" then "alpha".
    await user.click(screen.getByRole("button", { name: 'Add "beta" to your answer' }));
    await user.click(screen.getByRole("button", { name: 'Add "alpha" to your answer' }));

    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText("Not quite.")).toBeInTheDocument();

    // Undo by removing both placed pieces, then place them in the correct order.
    await user.click(screen.getByRole("button", { name: 'Remove "beta" from your answer' }));
    await user.click(screen.getByRole("button", { name: 'Remove "alpha" from your answer' }));
    await user.click(screen.getByRole("button", { name: 'Add "alpha" to your answer' }));
    await user.click(screen.getByRole("button", { name: 'Add "beta" to your answer' }));

    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText("Correct!")).toBeInTheDocument();
  });

  it("retry clears the answer area and the result", async () => {
    const user = userEvent.setup();
    render(
      <OrderingExercise
        prompt="Put these in order."
        items={[
          { id: "b", label: "beta" },
          { id: "a", label: "alpha" },
        ]}
        correctOrder={["a", "b"]}
      />,
    );

    await user.click(screen.getByRole("button", { name: 'Add "beta" to your answer' }));
    await user.click(screen.getByRole("button", { name: 'Add "alpha" to your answer' }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText("Not quite.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.queryByText("Not quite.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: 'Add "beta" to your answer' })).toBeInTheDocument();
  });

  it("reveals the correct order on request", async () => {
    const user = userEvent.setup();
    render(
      <OrderingExercise
        prompt="Put these in order."
        items={[
          { id: "b", label: "beta" },
          { id: "a", label: "alpha" },
        ]}
        correctOrder={["a", "b"]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Show answer" }));
    expect(screen.getByText("Correct order")).toBeInTheDocument();
  });

  it("tokenizes a real code line into separate keyword/punctuation pieces", () => {
    render(
      <OrderingExercise
        prompt="Assemble the code."
        items={[{ id: "line", label: "int x = 5;" }]}
        correctOrder={["line"]}
      />,
    );

    expect(screen.getByRole("button", { name: 'Add "int" to your answer' })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: 'Add "x" to your answer' })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: 'Add "=" to your answer' })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: 'Add "5" to your answer' })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: 'Add ";" to your answer' })).toBeInTheDocument();
  });
});
