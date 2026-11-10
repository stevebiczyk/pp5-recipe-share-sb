import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server";
import { CurrentUserProvider, useAuthLoading, useCurrentUser } from "../../contexts/CurrentUserContext";
import CommentCreateForm from "./CommentCreateForm";

function RecipeComments() {
  const currentUser = useCurrentUser();
  const authLoading = useAuthLoading();
  const [recipe, setRecipe] = useState({ results: [{ id: 1, comments_count: 0 }] });
  const [comments, setComments] = useState({ results: [] });
  return <>
    <p>{authLoading ? "Restoring session" : currentUser ? `Signed in as ${currentUser.username}` : "Signed out"}</p>
    <p>Comment count: {recipe.results[0].comments_count}</p>
    {comments.results.map((comment) => <p key={comment.id}>{comment.content}</p>)}
    {currentUser && <CommentCreateForm recipe={1} profile_id={1} setRecipe={setRecipe} setComments={setComments} />}
  </>;
}

async function prepareComment() {
  render(<MemoryRouter><CurrentUserProvider><RecipeComments /></CurrentUserProvider></MemoryRouter>);
  await screen.findByText("Signed in as sbadmin");
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText("my comment..."), "QA comment B");
  await user.click(screen.getByRole("button", { name: "Add comment" }));
}

test("posting a comment preserves the session and updates the comment list and count", async () => {
  server.use(http.post("*/comments/", async ({ request }) => {
    expect(request.headers.get("X-CSRFToken")).toBe("test-csrf-token");
    const data = await request.json();
    return HttpResponse.json({ id: 1, content: data.content }, { status: 201 });
  }));
  await prepareComment();
  expect(await screen.findByText("QA comment B")).toBeInTheDocument();
  expect(screen.getByText("Comment count: 1")).toBeInTheDocument();
  expect(screen.getByText("Signed in as sbadmin")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("my comment...")).toHaveValue("");
});

test("an expired access token refreshes and retries the comment without signing out", async () => {
  let attempts = 0;
  let refreshes = 0;
  server.use(
    http.post("*/comments/", () => ++attempts === 1 ? new HttpResponse(null, { status: 401 }) : HttpResponse.json({ id: 1, content: "QA comment B" }, { status: 201 })),
    http.post("*/dj-rest-auth/token/refresh/", () => { refreshes++; return HttpResponse.json({}); }),
  );
  await prepareComment();
  expect(await screen.findByText("QA comment B")).toBeInTheDocument();
  expect(screen.getByText("Signed in as sbadmin")).toBeInTheDocument();
  expect(screen.getByText("Comment count: 1")).toBeInTheDocument();
  expect(attempts).toBe(2);
  expect(refreshes).toBe(1);
});

test.each(["network", "unavailable"])("a temporary %s refresh failure keeps the session and draft for retry", async (failure) => {
  let recovered = false;
  server.use(
    http.post("*/comments/", () => recovered ? HttpResponse.json({ id: 1, content: "QA comment B" }, { status: 201 }) : new HttpResponse(null, { status: 401 })),
    http.post("*/dj-rest-auth/token/refresh/", () => failure === "network" ? HttpResponse.error() : new HttpResponse(null, { status: 503 })),
  );
  await prepareComment();
  expect(await screen.findByRole("alert")).toHaveTextContent(/try again/i);
  expect(screen.getByText("Signed in as sbadmin")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("my comment...")).toHaveValue("QA comment B");
  expect(screen.getByText("Comment count: 0")).toBeInTheDocument();
  recovered = true;
  await userEvent.click(screen.getByRole("button", { name: "Add comment" }));
  expect(await screen.findByText("QA comment B")).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

test("a comment validation error retains the session and draft", async () => {
  server.use(http.post("*/comments/", () => HttpResponse.json({ content: ["This comment could not be saved."] }, { status: 400 })));
  await prepareComment();
  expect(await screen.findByRole("alert")).toHaveTextContent("This comment could not be saved.");
  expect(screen.getByText("Signed in as sbadmin")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("my comment...")).toHaveValue("QA comment B");
});
