import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse, delay } from "msw";
import { server } from "../../mocks/server";
import RecipesPage from "./RecipesPage";

vi.mock("../profiles/PopularProfiles", () => ({ default: () => null }));

test("search preserves ampersands and other query characters", async () => {
  let search;
  server.use(http.get("*/recipes/", ({ request }) => {
    search = new URL(request.url).searchParams.get("search");
    return HttpResponse.json({ results: [], next: null });
  }));
  render(<MemoryRouter><RecipesPage message="Nothing found" /></MemoryRouter>);
  await userEvent.type(screen.getByPlaceholderText("Search recipes"), "salt & pepper + lemon");
  await waitFor(() => expect(search).toBe("salt & pepper + lemon"), { timeout: 3500 });
  expect(await screen.findByText("Nothing found")).toBeInTheDocument();
});

test("a slower old search cannot overwrite a newer result", async () => {
  let oldStarted = false;
  server.use(http.get("*/recipes/", async ({ request }) => {
    const search = new URL(request.url).searchParams.get("search");
    if (search === "old") { oldStarted = true; await delay(1800); }
    return HttpResponse.json({ results: [{ id: 1, title: search === "old" ? "Old recipe" : "New recipe", owner: "author" }], next: null });
  }));
  render(<MemoryRouter><RecipesPage /></MemoryRouter>);
  const user = userEvent.setup();
  const input = screen.getByPlaceholderText("Search recipes");
  await user.type(input, "old");
  await waitFor(() => expect(oldStarted).toBe(true), { timeout: 3500 });
  await user.clear(input);
  await user.type(input, "new");
  expect(await screen.findByText("New recipe", {}, { timeout: 3500 })).toBeInTheDocument();
  await delay(1000);
  expect(screen.queryByText("Old recipe")).not.toBeInTheDocument();
}, 8000);

test("a failed list request offers a working retry", async () => {
  let attempts = 0;
  server.use(http.get("*/recipes/", () => ++attempts === 1 ? new HttpResponse(null, { status: 503 }) : HttpResponse.json({ results: [], next: null })));
  render(<MemoryRouter><RecipesPage message="No recipes" /></MemoryRouter>);
  expect(await screen.findByText(/Could not load recipes/, {}, { timeout: 3500 })).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(await screen.findByText("No recipes", {}, { timeout: 3500 })).toBeInTheDocument();
});
