import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { http, HttpResponse, delay } from "msw";
import { server } from "../mocks/server";
import { CurrentUserProvider } from "../contexts/CurrentUserContext";
import UsernameForm from "../pages/profiles/UsernameForm";
import { useRedirect } from "./useRedirect";

test("profile editing waits for session restoration", async () => {
  server.use(http.get("*/dj-rest-auth/user/", async () => { await delay(50); return HttpResponse.json({ username: "restored", profile_id: 1 }); }));
  render(<MemoryRouter initialEntries={["/profiles/1/edit/username"]}><CurrentUserProvider><Routes>
    <Route path="/" element={<p>Redirected home</p>} />
    <Route path="/profiles/:id/edit/username" element={<UsernameForm />} />
  </Routes></CurrentUserProvider></MemoryRouter>);
  expect(await screen.findByDisplayValue("restored")).toBeInTheDocument();
  expect(screen.queryByText("Redirected home")).not.toBeInTheDocument();
});

test("a logged-out visitor is redirected from a protected page", async () => {
  server.use(
    http.get("*/dj-rest-auth/user/", () => new HttpResponse(null, { status: 401 })),
    http.post("*/dj-rest-auth/token/refresh/", () => new HttpResponse(null, { status: 401 })),
  );
  function Protected() { useRedirect("loggedOut"); return <p>Protected form</p>; }
  render(<MemoryRouter initialEntries={["/private"]}><CurrentUserProvider><Routes>
    <Route path="/login" element={<p>Please log in</p>} />
    <Route path="/private" element={<Protected />} />
  </Routes></CurrentUserProvider></MemoryRouter>);
  expect(await screen.findByText("Please log in")).toBeInTheDocument();
});
