import styles from "./App.module.css";
import NavBar from "./components/NavBar";
import Container from "react-bootstrap/Container";
import { Route, Switch } from "react-router-dom";
import "./api/axiosDefaults";
import RegistrationForm from "./pages/auth/RegistrationForm";
import LogInForm from "./pages/auth/LogInForm";
import RecipeCreateForm from "./pages/recipes/RecipeCreateForm";

function App() {
  return (
    <div className={styles.App}>
      <NavBar />
      <Container className={styles.Main}>
        <Switch>
          <Route exact path="/" render={() => <h1>Home Page</h1>} />
          <Route exact path="/login" render={() => <LogInForm />} />
          <Route exact path="/register" render={() => <RegistrationForm />} />
          <Route
            exact
            path="/recipes/create"
            render={() => <RecipeCreateForm />}
          />
          <Route render={() => <p>Page not found!</p>} />
        </Switch>
      </Container>
    </div>
  );
}

export default App;
