import React, { useEffect, useState } from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";

import Recipe from "./Recipe";
import LoadError from "../../components/LoadError";
import Asset from "../../components/Asset";

import appStyles from "../../App.module.css";
import styles from "../../styles/RecipesPage.module.css";
import { useLocation } from "react-router";
import { axiosReq } from "../../api/axiosDefaults";

import NoResults from "../../assets/no-results.png";
import InfiniteScroll from "react-infinite-scroll-component";
import { fetchMoreData } from "../../utils/utils";
import PopularProfiles from "../profiles/PopularProfiles";
import { useCurrentUser } from "../../contexts/CurrentUserContext";

function RecipesPage({ message, filter = "" }) {
  const [recipes, setRecipes] = useState({ results: [] });
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);
  const { pathname } = useLocation();
  const currentUser = useCurrentUser();

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = [
    "All",
    "Vegetarian",
    "Vegan",
    "Dairy-free",
    "Gluten-free",
    "Healthy Meals",
    "Quick and Easy",
  ];

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const fetchRecipes = async () => {
      try {
        const params = new URLSearchParams(filter);
        params.set("search", query);
        if (selectedCategory && selectedCategory !== "All") params.set("category", selectedCategory);
        const { data } = await axiosReq.get("/recipes/", { params, signal: controller.signal });
        if (!active) return;
        setRecipes(data);
        setHasLoaded(true);
      } catch {
        if (active) setLoadError("Could not load recipes. Please try again.");
      }
    };

    setHasLoaded(false);
    setLoadError("");
    const timer = setTimeout(() => {
      fetchRecipes();
    }, 1000);
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [filter, query, selectedCategory, pathname, currentUser, retry]);

  return (
    <Row className="h-100">
      <Col className="py-2 p-0 p-lg-2" lg={8}>
        <PopularProfiles mobile />
        <i className={`fas fa-search ${styles.SearchIcon}`} />
        <Form
          className={styles.SearchBar}
          onSubmit={(event) => event.preventDefault()}
        >
          <Form.Control
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="text"
            className="mr-sm-2"
            placeholder="Search recipes"
          />
        </Form>

        {/* Category Filter Pills */}
        <div
          className="d-flex flex-wrap justify-content-center my-3"
          style={{ gap: "6px" }}
        >
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={
                (cat === "All" && !selectedCategory) ||
                selectedCategory === cat
                  ? "primary"
                  : "outline-secondary"
              }
              className="rounded-pill px-3"
              onClick={() => setSelectedCategory(cat === "All" ? "" : cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
        {loadError ? <LoadError message={loadError} onRetry={() => setRetry((value) => value + 1)} /> : hasLoaded ? (
          <>
            {recipes.results.length ? (
              <InfiniteScroll
                children={recipes.results.map((recipe) => (
                  <Recipe key={recipe.id} {...recipe} setRecipes={setRecipes} />
                ))}
                dataLength={recipes.results.length}
                loader={<Asset spinner />}
                hasMore={!!recipes.next}
                next={() => fetchMoreData(recipes, setRecipes, setLoadError)}
              />
            ) : (
              <Container className={appStyles.Content}>
                <Asset src={NoResults} message={message} />
              </Container>
            )}
          </>
        ) : (
          <Container className={appStyles.Content}>
            <Asset spinner />
          </Container>
        )}
      </Col>
      <Col md={4} className="d-none d-lg-block p-0 p-lg-2">
        <PopularProfiles />
      </Col>
    </Row>
  );
}

export default RecipesPage;
