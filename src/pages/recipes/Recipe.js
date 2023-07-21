import React from "react";
import styles from "../../styles/Recipe.module.css";
import { useCurrentUser } from "../../contexts/CurrentUserContext";
import Card from "react-bootstrap/Card";
import Media from "react-bootstrap/Media";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { Link, useHistory } from "react-router-dom";
import Avatar from "../../components/Avatar";
import { axiosRes } from "../../api/axiosDefaults";
import { MoreDropdown } from "../../components/MoreDropdown";

const Recipe = (props) => {
  const {
    id,
    owner,
    profile_id,
    profile_image,
    comments_count,
    votes_count,
    vote_id,
    title,
    // ingredients,
    instructions,
    // difficulty_level,
    image,
    updated_at,
    recipePage,
    setRecipes,
  } = props;

  const currentUser = useCurrentUser();
  const is_owner = currentUser?.username === owner;
  const history = useHistory();

  const handleEdit = () => {
    history.push(`/recipes/${id}/edit`);
  };
  const handleDelete = async () => {
    try {
      await axiosRes.delete(`/recipes/${id}/`);
      history.goBack();
    } catch (err) {
      console.log(err);
    }
  };

  const handleVote = async () => {
    try {
      const { data } = await axiosRes.post("/votes/", { recipe: id });
      setRecipes((prevRecipes) => ({
        ...prevRecipes,
        results: prevRecipes.results.map((recipe) => {
          return recipe.id === id
            ? {
                ...recipe,
                votes_count: recipe.votes_count + 1,
                vote_id: data.id,
              }
            : recipe;
        }),
      }));
    } catch (err) {
      console.log(err);
    }
  };
  const handleUnVote = async () => {
    try {
      await axiosRes.delete(`/votes/${vote_id}/`);
      setRecipes((prevRecipes) => ({
        ...prevRecipes,
        results: prevRecipes.results.map((recipe) => {
          return recipe.id === id
            ? { ...recipe, votes_count: recipe.votes_count - 1, vote_id: null }
            : recipe;
        }),
      }));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Card className={styles.Recipe}>
      <Card.Body>
        <Media className="align-items-center justify-content-between">
          <Link to={`/profiles/${profile_id}`}>
            <Avatar src={profile_image} height={55} />
            {owner}
          </Link>
          <div className="d-flex align-items-center">
            <span>{updated_at}</span>
            {is_owner && recipePage && (
              <MoreDropdown
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            )}
          </div>
        </Media>
      </Card.Body>
      <Link to={`/recipes/${id}`}>
        <Card.Img src={image} alt={title} />
      </Link>
      <Card.Body>
        {title && <Card.Title className="text-center">{title}</Card.Title>}
        {instructions && <Card.Text>{instructions}</Card.Text>}
        <div className={styles.RecipeBar}>
          {is_owner ? (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip>You can't upvote or downvote your own recipe!</Tooltip>
              }
            >
              {/* <i className="far fa-thumbs-up" /> */}
              <i className="far fa-thumbs-down" />
            </OverlayTrigger>
          ) : (
            <>
              {vote_id ? (
                <span onClick={handleUnVote}>
                  <i className={`fas fa-thumbs-down ${styles.ThumbsDown}`} />
                </span>
              ) : (
                <span onClick={handleVote}>
                  <i className={`far fa-thumbs-up ${styles.ThumbsUp}`} />
                </span>
              )}
              {currentUser ? (
                <>
                  {vote_id ? (
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Remove your vote</Tooltip>}
                    >
                      <i className="far fa-thumbs-down" />
                    </OverlayTrigger>
                  ) : (
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Vote for this recipe</Tooltip>}
                    >
                      <i className="far fa-thumbs-up" />
                    </OverlayTrigger>
                  )}
                </>
              ) : (
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Log in to vote for recipes!</Tooltip>}
                >
                  <i className="far fa-thumbs-up" />
                </OverlayTrigger>
              )}
            </>
          )}
          {votes_count}
          <Link to={`/recipes/${id}`}>
            <i className="far fa-comments" />
          </Link>
          {comments_count}
        </div>
      </Card.Body>
    </Card>
  );
};

export default Recipe;
