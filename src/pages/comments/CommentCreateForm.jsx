import React, { useState } from "react";
import { Link } from "react-router-dom";

import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Alert from "react-bootstrap/Alert";
import { formErrors } from "../../utils/errors";

import styles from "../../styles/CommentCreateEditForm.module.css";
import Avatar from "../../components/Avatar";
import { axiosRes } from "../../api/axiosDefaults";

function CommentCreateForm(props) {
  const { recipe, setRecipe, setComments, profile_avatar, profileAvatar, profile_id } = props;
  const avatarImage = profile_avatar || profileAvatar;
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setContent(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting || !content.trim()) return;
    setSubmitting(true);
    setErrors({});
    try {
      const { data } = await axiosRes.post("/comments/", {
        content,
        recipe,
      });
      setComments((prevComments) => ({
        ...prevComments,
        results: [data, ...prevComments.results],
      }));
      setRecipe((prevRecipe) => ({
        ...prevRecipe,
        results: [
          {
            ...prevRecipe.results[0],
            comments_count: (prevRecipe.results[0].comments_count || 0) + 1,
          },
        ],
      }));
      setContent("");
    } catch (err) {
      setErrors(formErrors(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form className="mt-2" onSubmit={handleSubmit}>
      <Form.Group>
        <InputGroup>
          <Link to={`/profiles/${profile_id}`}>
            <Avatar src={avatarImage} />
          </Link>
          <Form.Control
            className={styles.Form}
            placeholder="my comment..."
            as="textarea"
            value={content}
            onChange={handleChange}
            rows={2}
            aria-label="Comment"
          />
        </InputGroup>
      </Form.Group>
      {[...(errors.content || []), ...(errors.recipe || []), ...(errors.non_field_errors || [])].map((message, index) => (
        <Alert key={index} variant="warning">{message}</Alert>
      ))}
      <button
        className={`${styles.Button} btn d-block ml-auto`}
        disabled={submitting || !content.trim()}
        type="submit"
      >
        Add comment
      </button>
    </Form>
  );
}

export default CommentCreateForm;
