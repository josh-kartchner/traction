import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/task/status-badge";

describe("StatusBadge", () => {
  it("renders not_started status", () => {
    render(<StatusBadge status="not_started" />);
    expect(screen.getByText("Not Started")).toBeInTheDocument();
  });

  it("renders in_progress status", () => {
    render(<StatusBadge status="in_progress" />);
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("renders on_hold status", () => {
    render(<StatusBadge status="on_hold" />);
    expect(screen.getByText("On Hold")).toBeInTheDocument();
  });

  it("renders completed status", () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("hides dot when showDot is false", () => {
    const { container } = render(
      <StatusBadge status="not_started" showDot={false} />
    );
    // The dot should not be present
    const dots = container.querySelectorAll(".rounded-full.h-1\\.5");
    expect(dots.length).toBe(0);
  });

  it("applies custom className", () => {
    const { container } = render(
      <StatusBadge status="not_started" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
