import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server";
import { CurrentUserContext } from "../../contexts/CurrentUserContext";
import Recipe from "./Recipe";

test("voting displays authoritative signed scores when switching and removing", async () => {
  const initial = { id: 1, title: "Soup", owner: "author", profile_id: 1, votes_count: 0, vote_id: null, vote_type: null };
  let saved = { ...initial };
  server.use(
    http.post("*/votes/", async ({ request }) => { const { vote_type } = await request.json(); saved = { ...initial, vote_id: 7, vote_type, votes_count: vote_type === "upvote" ? 1 : -1 }; return HttpResponse.json({ id: 7 }); }),
    http.delete("*/votes/7/", () => { saved = { ...initial }; return new HttpResponse(null, { status: 204 }); }),
    http.get("*/recipes/1/", () => HttpResponse.json(saved)),
  );
  function Feed() {
    const [recipes, setRecipes] = useState({ results: [initial] });
    return <Recipe {...recipes.results[0]} setRecipes={setRecipes} />;
  }
  render(<MemoryRouter><CurrentUserContext.Provider value={{ username: "reader" }}><Feed /></CurrentUserContext.Provider></MemoryRouter>);
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Downvote this recipe" }));
  expect(await screen.findByRole("button", { name: "Remove downvote" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByLabelText("Net vote score")).toHaveTextContent("-1");
  await user.click(screen.getByRole("button", { name: "Upvote this recipe" }));
  await screen.findByRole("button", { name: "Remove upvote" });
  expect(screen.getByLabelText("Net vote score")).toHaveTextContent("1");
  await user.click(screen.getByRole("button", { name: "Remove upvote" }));
  await screen.findByRole("button", { name: "Upvote this recipe" });
  expect(screen.getByLabelText("Net vote score")).toHaveTextContent("0");
});
