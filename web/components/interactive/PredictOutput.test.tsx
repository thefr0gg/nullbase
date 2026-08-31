import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PredictOutput from "./PredictOutput";

describe("PredictOutput", () => {
  const props = {
    code: "console.log(1 + 1);",
    options: ["2", "11", "Error"],
    correctIndex: 0,
    explanation: "Numeric addition.",
    actualOutput: "2",
  };

  it("disables submit until an option is chosen", () => {
    render(<PredictOutput {...props} />);
    expect(screen.getByRole("button", { name: "Check answer" })).toBeDisabled();
  });

  it("shows correct feedback and the explanation for the right answer", async () => {
    const user = userEvent.setup();
    render(<PredictOutput {...props} />);

    await user.click(screen.getByRole("radio", { name: "2" }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));

    expect(screen.getByText("Correct!")).toBeInTheDocument();
    expect(screen.getByText("Numeric addition.")).toBeInTheDocument();
  });

  it("shows incorrect feedback for the wrong answer, and retry clears it", async () => {
    const user = userEvent.setup();
    render(<PredictOutput {...props} />);

    await user.click(screen.getByRole("radio", { name: "11" }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText("Not quite.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.queryByText("Not quite.")).not.toBeInTheDocument();
  });
});
