import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Providers } from "@/components/providers";
import HomePage from "@/pages/HomePage";

describe("HomePage", () => {
  it("renders login options", () => {
    render(
      <MemoryRouter>
        <Providers>
          <HomePage />
        </Providers>
      </MemoryRouter>
    );
    expect(screen.getByText("Built In Hardware")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /admin login/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /staff login/i })).toBeInTheDocument();
  });
});
