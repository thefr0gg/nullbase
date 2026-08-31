import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StateMachine from "./StateMachine";

describe("StateMachine", () => {
  const states = [
    { id: "a", label: "A", detail: "detail-a" },
    { id: "b", label: "B", detail: "detail-b" },
  ];
  const transitions = [{ from: "a", to: "b", label: "go" }];

  it("starts at the initial state and moves to the target when a valid transition fires", async () => {
    const user = userEvent.setup();
    render(<StateMachine states={states} transitions={transitions} initial="a" />);

    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: "B" })).not.toHaveAttribute("aria-current");

    await user.click(screen.getByLabelText("Transition from a to b"));

    expect(screen.getByRole("button", { name: "B" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: "A" })).not.toHaveAttribute("aria-current");
  });

  it("disables a transition that isn't valid from the current state", () => {
    render(<StateMachine states={states} transitions={transitions} initial="b" />);
    expect(screen.getByLabelText("Transition from a to b")).toBeDisabled();
  });

  it("reset returns to the initial state", async () => {
    const user = userEvent.setup();
    render(<StateMachine states={states} transitions={transitions} initial="a" />);

    await user.click(screen.getByLabelText("Transition from a to b"));
    expect(screen.getByRole("button", { name: "B" })).toHaveAttribute("aria-current", "true");

    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("aria-current", "true");
  });
});
