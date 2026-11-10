import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server";
import LogInForm from "./LogInForm";
import RegistrationForm from "./RegistrationForm";

test.each([[LogInForm, "Log In", "/dj-rest-auth/login/"], [RegistrationForm, "Register", "/dj-rest-auth/registration/"]])("auth form shows a network error without crashing", async (Component, label, path) => {
  server.use(http.post(`*${path}`, () => HttpResponse.error()));
  render(<MemoryRouter><Component /></MemoryRouter>);
  await userEvent.type(screen.getByPlaceholderText(/username/i), "reader");
  await userEvent.type(screen.getByPlaceholderText(/^password$/i), "StrongPassword123!");
  if (label === "Register") await userEvent.type(screen.getByPlaceholderText("Confirm Password"), "StrongPassword123!");
  await userEvent.click(screen.getByRole("button", { name: label }));
  expect(await screen.findByText(/check your connection and try again/i)).toBeInTheDocument();
});
