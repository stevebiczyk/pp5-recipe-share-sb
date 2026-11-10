import React, { useState } from "react";
import Alert from "react-bootstrap/Alert";
import styles from "../../styles/Recipe.module.css";
import { useCurrentUser } from "../../contexts/CurrentUserContext";
import Card from "react-bootstrap/Card";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "../../components/Avatar";
import { axiosRes } from "../../api/axiosDefaults";
import { MoreDropdown } from "../../components/MoreDropdown";

const Recipe = (props) => {
  const {
    id,
    owner,
    profile_id,
    profile_avatar,
    profile_image,
    comments_count,
    votes_count,
    vote_id,
    vote_type,
    title,
    ingredients,
    instructions,
    cooking_time,
    difficulty_level,
    category,
    image,
    updated_at,
    recipePage,
    setRecipes,
  } = props;

  const currentUser = useCurrentUser();
  const is_owner = currentUser?.username === owner;
  const navigate = useNavigate();
  const [votePending, setVotePending] = useState(false);
  const [voteError, setVoteError] = useState("");

  const handleEdit = () => {
    navigate(`/recipes/${id}/edit`);
  };

  const handleDelete = async () => {
    try {
      await axiosRes.delete(`/recipes/${id}/`);
      navigate(-1);
    } catch (err) {
      console.log(err);
    }
  };

  const changeVote = async (type) => {
    if (votePending) return;
    setVotePending(true);
    setVoteError("");
    try {
      const sameVote = vote_id && (vote_type || "upvote") === type;
      if (sameVote) {
        await axiosRes.delete(`/votes/${vote_id}/`);
      } else {
        await axiosRes.post("/votes/", { recipe: id, vote_type: type });
      }
      const { data } = await axiosRes.get(`/recipes/${id}/`);
      setRecipes((prevRecipes) => ({
        ...prevRecipes,
        results: prevRecipes.results.map((recipe) => recipe.id === id ? data : recipe),
      }));
    } catch {
      setVoteError("Could not update the vote. Please try again.");
    } finally {
      setVotePending(false);
    }
  };

  const isUpvoted = vote_id && (vote_type === "upvote" || !vote_type);
  const isDownvoted = vote_id && vote_type === "downvote";
  const avatarSrc = profile_avatar || profile_image;

  const ingredientsList = ingredients
    ? ingredients
        .split(/\r?\n|;/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  return (
    <Card className={styles.Recipe}>
      <Card.Body>
        <div className="d-flex align-items-center justify-content-between">
          <Link to={`/profiles/${profile_id}`}>
            <Avatar src={avatarSrc} height={55} />
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
        </div>
      </Card.Body>
      <Link to={`/recipes/${id}`}>
        <Card.Img src={image} alt={title} />
      </Link>
      <Card.Body>
        {title && <Card.Title className="text-center">{title}</Card.Title>}

        {/* Recipe Meta Badges */}
        <div className={styles.RecipeMeta}>
          {cooking_time && (
            <span className={styles.Badge}>
              <i className="far fa-clock mr-1" />
              {cooking_time} mins
            </span>
          )}
          {difficulty_level && (
            <span className={styles.Badge}>
              <i className="fas fa-layer-group mr-1" />
              {difficulty_level}
            </span>
          )}
          {category && (
            <span className={styles.Badge}>
              <i className="fas fa-utensils mr-1" />
              {category}
            </span>
          )}
        </div>

        {/* Recipe Page Details: Ingredients and Instructions */}
        {recipePage && (
          <>
            {ingredientsList.length > 0 && (
              <div className={styles.Section}>
                <h5 className={styles.SectionTitle}>Ingredients</h5>
                <ul className={styles.IngredientsList}>
                  {ingredientsList.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {instructions && (
              <div className={styles.Section}>
                <h5 className={styles.SectionTitle}>Instructions</h5>
                <p className={styles.InstructionsText}>{instructions}</p>
              </div>
            )}
          </>
        )}

        {/* Recipe summary on feed/card view */}
        {!recipePage && instructions && (
          <Card.Text className="text-muted mt-2">
            {instructions.length > 120
              ? `${instructions.substring(0, 120)}...`
              : instructions}
          </Card.Text>
        )}

        {/* Interaction Bar: Voting and Comments */}
        <div className={styles.RecipeBar}>
          {is_owner ? (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>You can't vote on your own recipe!</Tooltip>}
            >
              <span>
                <i className="far fa-thumbs-up" />
              </span>
            </OverlayTrigger>
          ) : currentUser ? (
            <div className="d-flex align-items-center">
              {/* Upvote */}
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip>
                    {isUpvoted ? "Remove upvote" : "Upvote this recipe"}
                  </Tooltip>
                }
              >
                <button
                  type="button"
                  className={styles.VoteButton}
                  aria-label={isUpvoted ? "Remove upvote" : "Upvote this recipe"}
                  aria-pressed={!!isUpvoted}
                  disabled={votePending}
                  onClick={() => changeVote("upvote")}
                >
                  <i
                    className={`${
                      isUpvoted ? "fas" : "far"
                    } fa-thumbs-up ${styles.Vote} mr-2`}
                  />
                </button>
              </OverlayTrigger>

              {/* Downvote */}
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip>
                    {isDownvoted ? "Remove downvote" : "Downvote this recipe"}
                  </Tooltip>
                }
              >
                <button
                  type="button"
                  className={styles.VoteButton}
                  aria-label={isDownvoted ? "Remove downvote" : "Downvote this recipe"}
                  aria-pressed={!!isDownvoted}
                  disabled={votePending}
                  onClick={() => changeVote("downvote")}
                >
                  <i
                    className={`${
                      isDownvoted ? "fas" : "far"
                    } fa-thumbs-down ${styles.Vote}`}
                  />
                </button>
              </OverlayTrigger>
            </div>
          ) : (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Log in to vote for recipes!</Tooltip>}
            >
              <span>
                <i className="far fa-thumbs-up mr-2" />
                <i className="far fa-thumbs-down" />
              </span>
            </OverlayTrigger>
          )}

          <span className="fw-bold ms-1" aria-label="Net vote score">{votes_count || 0}</span>

          <Link to={`/recipes/${id}`} className="ml-3">
            <i className="far fa-comments mr-1" />
            {comments_count || 0}
          </Link>
        </div>
        {voteError && <Alert variant="warning">{voteError}</Alert>}
      </Card.Body>
    </Card>
  );
};

export default Recipe;
