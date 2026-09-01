import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrderingExercise from "./OrderingExercise";

describe("OrderingExercise", () => {
  it("requires both the right order and a separate line per item to be marked correct", async () => {
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

    // Same line, correct left-to-right order — still wrong, since "alpha"
    // and "beta" are meant to end up on separate lines.
    await user.click(screen.getByRole("button", { name: 'Add "alpha" to your answer' }));
    await user.click(screen.getByRole("button", { name: 'Add "beta" to your answer' }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText("Not quite.")).toBeInTheDocument();

    // Undo, then rebuild across two lines via the "+" button.
    await user.click(screen.getByRole("button", { name: 'Remove "beta" from your answer' }));
    await user.click(screen.getByRole("button", { name: 'Remove "alpha" from your answer' }));

    await user.click(screen.getByRole("button", { name: 'Add "alpha" to your answer' }));
    await user.click(screen.getByRole("button", { name: "Add new line" }));
    await user.click(screen.getByRole("button", { name: 'Add "beta" to your answer' }));

    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText("Correct!")).toBeInTheDocument();
  });

  it("retry clears the answer area, the lines, and the result", async () => {
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
    await user.click(screen.getByRole("button", { name: "Add new line" }));
    await user.click(screen.getByRole("button", { name: 'Add "alpha" to your answer' }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText("Not quite.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.queryByText("Not quite.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: 'Add "beta" to your answer' })).toBeInTheDocument();
    // Back down to a single line.
    expect(screen.getAllByRole("button", { name: "Add new line" })).toHaveLength(1);
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

  it("adds a new numbered line via the + button and removes an empty one via the x button", async () => {
    const user = userEvent.setup();
    render(
      <OrderingExercise
        prompt="Assemble the code."
        items={[{ id: "line", label: "x" }]}
        correctOrder={["line"]}
      />,
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();

    // Fill the first line so only the new (still-empty) second line offers
    // a "Remove this line" button — an empty first line would offer one too.
    await user.click(screen.getByRole("button", { name: 'Add "x" to your answer' }));
    await user.click(screen.getByRole("button", { name: "Add new line" }));
    expect(screen.getByText("2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove this line" }));
    expect(screen.queryByText("2")).not.toBeInTheDocument();
  });
});
