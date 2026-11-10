import React, { useEffect, useState } from "react";

import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";

import appStyles from "../../App.module.css";
import { useParams } from "react-router";
import { axiosReq } from "../../api/axiosDefaults";
import Recipe from "./Recipe";
import LoadError from "../../components/LoadError";
import CommentCreateForm from "../comments/CommentCreateForm";
import { useCurrentUser } from "../../contexts/CurrentUserContext";
import Comment from "../comments/Comment";
import PopularProfiles from "../profiles/PopularProfiles";

import InfiniteScroll from "react-infinite-scroll-component";
import Asset from "../../components/Asset";
import { fetchMoreData } from "../../utils/utils";

function RecipePage() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState({ results: [] });

  const currentUser = useCurrentUser();
  const profile_avatar = currentUser?.profile_avatar || currentUser?.profile_image;
  const [comments, setComments] = useState({ results: [] });
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setHasLoaded(false);
    setLoadError("");
    const handleMount = async () => {
      try {
        const [{ data: recipe }, { data: comments }] = await Promise.all([
          axiosReq.get(`/recipes/${id}/`, { signal: controller.signal }),
          axiosReq.get(`/comments/?recipe=${id}`, { signal: controller.signal }),
        ]);
        if (!active) return;
        setRecipe({ results: [recipe] });
        setComments(comments);
        setHasLoaded(true);
      } catch (err) {
        if (active) setLoadError(err.response?.status === 404 ? "Recipe not found." : "Could not load this recipe. Please try again.");
      }
    };

    handleMount();
    return () => { active = false; controller.abort(); };
  }, [id, currentUser, retry]);

  if (loadError) return <LoadError message={loadError} onRetry={() => setRetry((value) => value + 1)} />;
  if (!hasLoaded) return <Asset spinner />;

  return (
    <Row className="h-100">
      <Col className="py-2 p-0 p-lg-2" lg={8}>
        <PopularProfiles mobile />
        <Recipe {...recipe.results[0]} setRecipes={setRecipe} recipePage />
        <Container className={appStyles.Content}>
          {currentUser ? (
            <CommentCreateForm
              profile_id={currentUser.profile_id}
              profile_avatar={profile_avatar}
              profileAvatar={profile_avatar}
              recipe={id}
              setRecipe={setRecipe}
              setComments={setComments}
            />
          ) : comments.results.length ? (
            "Comments"
          ) : null}
          {comments.results.length ? (
            <InfiniteScroll
              children={comments.results.map((comment) => (
                <Comment
                  key={comment.id}
                  {...comment}
                  setRecipe={setRecipe}
                  setComments={setComments}
                />
              ))}
              dataLength={comments.results.length}
              loader={<Asset spinner />}
              hasMore={!!comments.next}
              next={() => fetchMoreData(comments, setComments, setLoadError)}
            />
          ) : currentUser ? (
            <span>No comments yet, be the first to comment!</span>
          ) : (
            <span>No comments... yet</span>
          )}
        </Container>
      </Col>
      <Col lg={4} className="d-none d-lg-block p-0 p-lg-2">
        <PopularProfiles />
      </Col>
    </Row>
  );
}

export default RecipePage;
