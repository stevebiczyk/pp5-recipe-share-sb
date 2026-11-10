import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse, delay } from "msw";
import { api, axiosReq, axiosRes } from "../api/axiosDefaults";
import { server } from "../mocks/server";
import { CurrentUserProvider, useAuthLoading, useCurrentUser } from "./CurrentUserContext";

function SessionProbe() {
  const user = useCurrentUser();
  const loading = useAuthLoading();
  const [result, setResult] = useState("");
  return <>
    <p>{loading ? "Restoring session" : user?.username || "Signed out"}</p>
    <button onClick={() => Promise.all([axiosReq.get("/one/"), axiosRes.get("/two/")]).then(() => setResult("Both loaded")).catch(() => setResult("Request failed"))}>Load both</button>
    <p>{result}</p>
  </>;
}

test("exports separate clients and bootstraps CSRF for authentication writes", async () => {
  expect(api).not.toBe(axiosReq);
  expect(api).not.toBe(axiosRes);
  let csrfHeader;
  server.use(http.post("*/dj-rest-auth/login/", ({ request }) => {
    csrfHeader = request.headers.get("X-CSRFToken");
    return HttpResponse.json({ user: { username: "reader" } });
  }));
  await api.post("/dj-rest-auth/login/", { username: "reader", password: "password" });
  expect(csrfHeader).toBe("test-csrf-token");
});

test("session restoration refreshes an expired access token before finishing", async () => {
  let refreshed = false;
  server.use(
    http.get("*/dj-rest-auth/user/", () => refreshed ? HttpResponse.json({ username: "restored" }) : new HttpResponse(null, { status: 401 })),
    http.post("*/dj-rest-auth/token/refresh/", () => { refreshed = true; return HttpResponse.json({}); }),
  );
  render(<CurrentUserProvider><SessionProbe /></CurrentUserProvider>);
  expect(screen.getByText("Restoring session")).toBeInTheDocument();
  expect(await screen.findByText("restored")).toBeInTheDocument();
});

test("concurrent 401 responses share one refresh and both retry", async () => {
  let refreshes = 0;
  let refreshed = false;
  const response = () => refreshed ? HttpResponse.json({}) : new HttpResponse(null, { status: 401 });
  server.use(
    http.get("*/one/", response), http.get("*/two/", response),
    http.post("*/dj-rest-auth/token/refresh/", async () => { refreshes++; await delay(40); refreshed = true; return HttpResponse.json({}); }),
  );
  render(<CurrentUserProvider><SessionProbe /></CurrentUserProvider>);
  await screen.findByText("sbadmin");
  await userEvent.click(screen.getByRole("button", { name: "Load both" }));
  expect(await screen.findByText("Both loaded")).toBeInTheDocument();
  expect(refreshes).toBe(1);
});

test("a failed refresh signs out without recursive requests", async () => {
  let refreshes = 0;
  server.use(
    http.get("*/dj-rest-auth/user/", () => new HttpResponse(null, { status: 401 })),
    http.post("*/dj-rest-auth/token/refresh/", () => { refreshes++; return new HttpResponse(null, { status: 401 }); }),
  );
  render(<CurrentUserProvider><SessionProbe /></CurrentUserProvider>);
  expect(await screen.findByText("Signed out")).toBeInTheDocument();
  expect(refreshes).toBe(1);
});
