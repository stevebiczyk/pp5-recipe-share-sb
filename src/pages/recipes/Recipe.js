// import React from "react";
// import styles from "../../styles/Recipe.module.css";
// import { useCurrentUser } from "../../contexts/CurrentUserContext";
// import { Card, Media, OverlayTrigger, Tooltip } from "react-bootstrap";
// import { Link } from "react-router-dom";
// import Avatar from "../../components/Avatar";
// import { axiosRes } from "../../api/axiosDefaults";

// const Recipe = (props) => {
//   const {
//     id,
//     owner,
//     profile_id,
//     profile_image,
//     comments_count,
//     likes_count,
//     like_id,
//     dislike_id,
//     title,
//     // ingredients,
//     instructions,
//     // difficulty_level,
//     image,
//     updated_at,
//     recipePage,
//     setRecipes,
//   } = props;

//   const currentUser = useCurrentUser();
//   const is_owner = currentUser?.username === owner;

//   const handleLike = async () => {
//     try {
//       if (dislike_id) {
//         await axiosRes.delete(`/dislikes/${dislike_id}/`);
//       }

//       const { data } = await axiosRes.post("/likes/", { recipe: id });
//       setRecipes((prevRecipes) => ({
//         ...prevRecipes,
//         results: prevRecipes.results.map((recipe) => {
//           return recipe.id === id
//             ? {
//                 ...recipe,
//                 likes_count: recipe.likes_count + 1,
//                 like_id: data.id,
//                 dislike_id: null,
//               }
//             : recipe;
//         }),
//       }));
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const handleDislike = async () => {
//     try {
//       if (like_id) {
//         await axiosRes.delete(`/likes/${like_id}/`);
//       }

//       const { data } = await axiosRes.post("/dislikes/", { recipe: id });
//       setRecipes((prevRecipes) => ({
//         ...prevRecipes,
//         results: prevRecipes.results.map((recipe) => {
//           return recipe.id === id
//             ? {
//                 ...recipe,
//                 likes_count: recipe.likes_count - 1,
//                 like_id: null,
//                 dislike_id: data.id,
//               }
//             : recipe;
//         }),
//       }));
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const handleUnlike = async () => {
//     try {
//       if (like_id) {
//         await axiosRes.delete(`/likes/${like_id}/`);
//       } else if (dislike_id) {
//         await axiosRes.delete(`/dislikes/${dislike_id}/`);
//       }

//       setRecipes((prevRecipes) => ({
//         ...prevRecipes,
//         results: prevRecipes.results.map((recipe) => {
//           return recipe.id === id
//             ? {
//                 ...recipe,
//                 likes_count: recipe.likes_count - 1,
//                 like_id: null,
//                 dislike_id: null,
//               }
//             : recipe;
//         }),
//       }));
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   return (
//     <Card className={styles.Recipe}>
//       <Card.Body>
//         <Media className="align-items-center justify-content-between">
//           <Link to={`/profiles/${profile_id}`}>
//             <Avatar src={profile_image} height={55} />
//             {owner}
//           </Link>
//           <div className="d-flex align-items-center">
//             <span>{updated_at}</span>
//             {is_owner && recipePage && "..."}
//           </div>
//         </Media>
//       </Card.Body>
//       <Link to={`/recipes/${id}`}>
//         <Card.Img src={image} alt={title} />
//       </Link>
//       <Card.Body>
//         {title && <Card.Title className="text-center">{title}</Card.Title>}
//         {instructions && <Card.Text>{instructions}</Card.Text>}
//         <div className={styles.RecipeBar}>
//           {is_owner ? (
//             <OverlayTrigger
//               placement="top"
//               overlay={<Tooltip>You can't like your own recipe!</Tooltip>}
//             >
//               <i className="far fa-thumbs-up" />
//             </OverlayTrigger>
//           ) : dislike_id ? (
//             <span onClick={handleUnlike}>
//               <i className={`far fa-thumbs-down ${styles.Dislike}`} />
//             </span>
//           ) : like_id ? (
//             <span onClick={handleUnlike}>
//               <i className={`far fa-thumbs-up ${styles.Like}`} />
//             </span>
//           ) : (
//             <>
//               <span onClick={handleLike}>
//                 <i className={`far fa-thumbs-up ${styles.LikeOutline}`} />
//               </span>
//               <span onClick={handleDislike}>
//                 <i className={`far fa-thumbs-down ${styles.DislikeOutline}`} />
//               </span>
//             </>
//           )}
//           {likes_count}
//           <Link to={`/recipes/${id}`}>
//             <i className="far fa-comments" />
//           </Link>
//           {comments_count}
//         </div>
//       </Card.Body>
//     </Card>
//   );
// };

// export default Recipe;
import React from "react";
import styles from "../../styles/Recipe.module.css";
import { useCurrentUser } from "../../contexts/CurrentUserContext";
import { Card, Media, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router-dom";
import Avatar from "../../components/Avatar";
import { axiosRes } from "../../api/axiosDefaults";

const Recipe = (props) => {
  const {
    id,
    owner,
    profile_id,
    profile_image,
    comments_count,
    likes_count,
    like_id,
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

  const handleLike = async () => {
    try {
      const { data } = await axiosRes.post("/likes/", { recipe: id });
      setRecipes((prevRecipes) => ({
        ...prevRecipes,
        results: prevRecipes.results.map((recipe) => {
          return recipe.id === id
            ? {
                ...recipe,
                likes_count: recipe.likes_count + 1,
                like_id: data.id,
              }
            : recipe;
        }),
      }));
    } catch (err) {
      console.log(err);
    }
  };
  const handleUnlike = async () => {
    try {
      await axiosRes.delete(`/likes/${like_id}/`);
      setRecipes((prevRecipes) => ({
        ...prevRecipes,
        results: prevRecipes.results.map((recipe) => {
          return recipe.id === id
            ? { ...recipe, likes_count: recipe.likes_count - 1, like_id: null }
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
            {is_owner && recipePage && "..."}
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
                <Tooltip>You can't like or dislike your own recipe!</Tooltip>
              }
            >
              {/* <i className="far fa-thumbs-up" /> */}
              <i className="far fa-thumbs-down" />
            </OverlayTrigger>
          ) : (
            <>
              {like_id ? (
                <span onClick={handleUnlike}>
                  <i className={`fas fa-thumbs-down ${styles.ThumbsDown}`} />
                </span>
              ) : (
                <span onClick={handleLike}>
                  <i className={`far fa-thumbs-up ${styles.ThumbsUp}`} />
                </span>
              )}
              {currentUser ? (
                <>
                  {like_id ? (
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Remove your dislike</Tooltip>}
                    >
                      <i className="far fa-thumbs-down" />
                    </OverlayTrigger>
                  ) : (
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Like this recipe</Tooltip>}
                    >
                      <i className="far fa-thumbs-up" />
                    </OverlayTrigger>
                  )}
                </>
              ) : (
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Log in to like recipes!</Tooltip>}
                >
                  <i className="far fa-thumbs-up" />
                </OverlayTrigger>
              )}
            </>
          )}
          {likes_count}
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