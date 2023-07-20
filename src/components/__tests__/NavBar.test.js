import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "../NavBar";
import { BrowserRouter as Router } from "react-router-dom";
import { CurrentUserProvider } from "../../contexts/CurrentUserContext";

test("renders NavBar", () => {
  render(
    <Router>
      <Navbar />
    </Router>
  );

  screen.debug();
  const LogInLink = screen.getByRole("link", { name: "Log in" });
  expect(LogInLink).toBeInTheDocument();
});

test("renders link to the user profile for a logged in user", async () => {
  render(
    <Router>
      <CurrentUserProvider>
        <Navbar />
      </CurrentUserProvider>
    </Router>
  );
  const profileAvatar = await screen.findByText("Profile");
  expect(profileAvatar).toBeInTheDocument();
});

test("renders Sign in and Sign up buttons again on log out", async () => {
  render(
    <Router>
      <CurrentUserProvider>
        <Navbar />
      </CurrentUserProvider>
    </Router>
  );

  const signOutLink = await screen.findByRole("link", { name: "Sign out" });
  fireEvent.click(signOutLink);

  const LogInLink = await screen.findByRole("link", { name: "Log in" });
  const RegisterLink = await screen.findByRole("link", { name: "Register" });

  expect(LogInLink).toBeInTheDocument();
  expect(RegisterLink).toBeInTheDocument();
});
