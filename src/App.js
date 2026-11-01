import styles from "./App.module.css";
import NavBar from "./components/NavBar";
import Container from "react-bootstrap/Container";
import { Route, Routes } from "react-router-dom";
import "./api/axiosDefaults";
import RegistrationForm from "./pages/auth/RegistrationForm";
import LogInForm from "./pages/auth/LogInForm";
import RecipeCreateForm from "./pages/recipes/RecipeCreateForm";
import RecipeEditForm from "./pages/recipes/RecipeEditForm";
import RecipePage from "./pages/recipes/RecipePage";
import RecipesPage from "./pages/recipes/RecipesPage";
import { useCurrentUser } from "./contexts/CurrentUserContext";
import ProfilePage from "./pages/profiles/ProfilePage";
import UsernameForm from "./pages/profiles/UsernameForm";
import UserPasswordForm from "./pages/profiles/UserPasswordForm";
import ProfileEditForm from "./pages/profiles/ProfileEditForm";
import NotFound from "./components/NotFound";

function App() {
  const currentUser = useCurrentUser();
  const profile_id = currentUser?.profile_id || "";

  return (
    <div className={styles.App}>
      <NavBar />
      <Container className={styles.Main}>
        <Routes>
          <Route
            path="/"
            element={
              <RecipesPage message="No results found. Adjust the search keyword." />
            }
          />
          <Route
            path="/feed"
            element={
              <RecipesPage
                message="No results found. Adjust the search keyword or follow a user."
                filter={`owner__followed__owner__profile=${profile_id}&`}
              />
            }
          />
          <Route
            path="/voted"
            element={
              <RecipesPage
                message="No results found. Adjust the search keyword or vote for a recipe."
                filter={`votes__owner__profile=${profile_id}&ordering=-votes__created_at&`}
              />
            }
          />
          <Route path="/login" element={<LogInForm />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/recipes/create" element={<RecipeCreateForm />} />
          <Route path="/recipes/:id" element={<RecipePage />} />
          <Route path="/recipes/:id/edit" element={<RecipeEditForm />} />
          <Route path="/profiles/:id" element={<ProfilePage />} />
          <Route
            path="/profiles/:id/edit/username"
            element={<UsernameForm />}
          />
          <Route
            path="/profiles/:id/edit/password"
            element={<UserPasswordForm />}
          />
          <Route path="/profiles/:id/edit" element={<ProfileEditForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>
    </div>
  );
}

export default App;
