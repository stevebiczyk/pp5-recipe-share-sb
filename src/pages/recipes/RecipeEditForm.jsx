import React, { useEffect, useRef, useState } from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";

import styles from "../../styles/RecipeCreateEditForm.module.css";
import appStyles from "../../App.module.css";
import btnStyles from "../../styles/Button.module.css";
import Alert from "react-bootstrap/Alert";
import RecipeImage from "../../components/RecipeImage";
import RecipeFormFields from "../../components/RecipeFormFields";
import { useNavigate, useParams } from "react-router-dom";
import { axiosReq } from "../../api/axiosDefaults";
import { formErrors } from "../../utils/errors";
import { validateRecipe, buildRecipeFormData } from "../../utils/recipeForm";
import {
  useAuthLoading,
  useCurrentUser,
} from "../../contexts/CurrentUserContext";
import { useRedirect } from "../../hooks/useRedirect";
import Asset from "../../components/Asset";
import LoadError from "../../components/LoadError";

function RecipeEditForm() {
  useRedirect("loggedOut");
  const authLoading = useAuthLoading();
  const currentUser = useCurrentUser();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);

  const [recipeData, setRecipeData] = useState({
    title: "",
    ingredients: "",
    instructions: "",
    cooking_time: "",
    image: "",
    difficulty_level: "",
    category: "",
  });
  const { title, image } = recipeData;

  const imageInput = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (authLoading || !currentUser) return;
    const controller = new AbortController();
    let active = true;
    setHasLoaded(false);
    setLoadError("");
    const handleMount = async () => {
      try {
        const { data } = await axiosReq.get(`/recipes/${id}/`, {
          signal: controller.signal,
        });
        if (!active) return;
        const {
          title,
          ingredients,
          instructions,
          cooking_time,
          image,
          difficulty_level,
          category,
          is_owner,
        } = data;

        is_owner
          ? setRecipeData({
              title,
              ingredients,
              instructions,
              cooking_time: cooking_time ?? "",
              image: image || "",
              difficulty_level: difficulty_level || "",
              category: category || "",
            })
          : navigate("/", { replace: true });
      } catch (err) {
        if (active)
          setLoadError(
            err.response?.status === 404
              ? "Recipe not found."
              : "Could not load this recipe. Please try again.",
          );
      } finally {
        if (active) setHasLoaded(true);
      }
    };

    handleMount();
    return () => {
      active = false;
      controller.abort();
    };
  }, [authLoading, currentUser, navigate, id, retry]);

  useEffect(
    () => () => {
      if (image?.startsWith("blob:")) URL.revokeObjectURL(image);
    },
    [image],
  );

  const handleChange = (event) => {
    setRecipeData({
      ...recipeData,
      [event.target.name]: event.target.value,
    });
  };

  const handleChangeImage = (event) => {
    if (event.target.files.length) {
      URL.revokeObjectURL(image);
      setRecipeData({
        ...recipeData,
        image: URL.createObjectURL(event.target.files[0]),
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Prevent duplicate submissions.
    if (submittingRef.current) return;

    const validationErrors = validateRecipe(recipeData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setErrors({});

    try {
      const formData = buildRecipeFormData(
        recipeData,
        imageInput.current?.files?.[0],
      );

      await axiosReq.put(`/recipes/${id}/`, formData);

      navigate(`/recipes/${id}`);
    } catch (err) {
      setErrors(formErrors(err));
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  //   const formData = new FormData();

  //   formData.append("title", title);
  //   formData.append("ingredients", ingredients);
  //   formData.append("instructions", instructions);
  //   formData.append("cooking_time", cooking_time);
  //   formData.append("difficulty_level", difficulty_level);
  //   formData.append("category", category);

  //   if (imageInput?.current?.files?.[0]) {
  //     formData.append("image", imageInput.current.files[0]);
  //   }

  //   try {
  //     await axiosReq.put(`/recipes/${id}/`, formData);
  //     navigate(`/recipes/${id}`);
  //   } catch (err) {
  //     console.log(err);
  //     if (err.response?.status !== 401) {
  //       setErrors(formErrors(err));
  //     }
  //   }
  // };

  // const textFields = (
  //   <div className="text-center">
  //     <Form.Group>
  //       <Form.Label>Title</Form.Label>
  //       <Form.Control
  //         type="text"
  //         name="title"
  //         value={title}
  //         onChange={handleChange}
  //       />
  //     </Form.Group>
  //     {errors?.title?.map((message, idx) => (
  //       <Alert variant="warning" key={idx}>
  //         {message}
  //       </Alert>
  //     ))}

  //     <Form.Group>
  //       <Form.Label>Ingredients</Form.Label>
  //       <Form.Control
  //         as="textarea"
  //         rows={6}
  //         name="ingredients"
  //         value={ingredients}
  //         onChange={handleChange}
  //       />
  //     </Form.Group>
  //     {errors?.ingredients?.map((message, idx) => (
  //       <Alert variant="warning" key={idx}>
  //         {message}
  //       </Alert>
  //     ))}

  //     <Form.Group>
  //       <Form.Label>Instructions</Form.Label>
  //       <Form.Control
  //         as="textarea"
  //         rows={6}
  //         name="instructions"
  //         value={instructions}
  //         onChange={handleChange}
  //       />
  //     </Form.Group>
  //     {errors?.instructions?.map((message, idx) => (
  //       <Alert variant="warning" key={idx}>
  //         {message}
  //       </Alert>
  //     ))}

  //     <Form.Group>
  //       <Form.Label>Cooking Time (minutes, optional)</Form.Label>
  //       <Form.Control
  //         type="number"
  //         name="cooking_time"
  //         value={cooking_time}
  //         min={1}
  //         step={1}
  //         onChange={handleChange}
  //       />
  //     </Form.Group>
  //     {errors?.cooking_time?.map((message, idx) => (
  //       <Alert variant="warning" key={idx}>
  //         {message}
  //       </Alert>
  //     ))}
  //     <Form.Group>
  //       <Form.Label>Difficulty Level</Form.Label>
  //       <Form.Select
  //         name="difficulty_level"
  //         value={difficulty_level}
  //         onChange={handleChange}
  //       >
  //         <option value="">Select</option>
  //         <option value="Easy">Easy</option>
  //         <option value="Medium">Medium</option>
  //         <option value="Hard">Hard</option>
  //       </Form.Select>
  //     </Form.Group>
  //     {errors?.difficulty_level?.map((message, idx) => (
  //       <Alert variant="warning" key={idx}>
  //         {message}
  //       </Alert>
  //     ))}

  //     <Form.Group>
  //       <Form.Label>Category</Form.Label>
  //       <Form.Select name="category" value={category} onChange={handleChange}>
  //         <option value="">Select Category</option>
  //         <option value="Vegetarian">Vegetarian</option>
  //         <option value="Vegan">Vegan</option>
  //         <option value="Dairy-free">Dairy-free</option>
  //         <option value="Gluten-free">Gluten-free</option>
  //         <option value="Healthy Meals">Healthy Meals</option>
  //         <option value="Quick and Easy">Quick and Easy</option>
  //       </Form.Select>
  //     </Form.Group>
  //     {errors?.category?.map((message, idx) => (
  //       <Alert variant="warning" key={idx}>
  //         {message}
  //       </Alert>
  //     ))}

  //     <Button
  //       type="button"
  //       className={`${btnStyles.Button} ${btnStyles.Blue}`}
  //       onClick={() => navigate(-1)}
  //       disabled={isSubmitting}
  //     >
  //       Cancel
  //     </Button>
  //     <Button
  //       type="submit"
  //       className={`${btnStyles.Button} ${btnStyles.Blue}`}
  //       disabled={isSubmitting}
  //     >
  //       {isSubmitting ? "Saving..." : "Save"}
  //     </Button>
  //   </div>
  // );

  const formActions = (
    <div className="d-flex flex-wrap gap-2 mt-4">
      <Button
        type="button"
        className={`${btnStyles.Button} ${btnStyles.Blue}`}
        onClick={() => navigate(-1)}
        disabled={isSubmitting}
      >
        Cancel
      </Button>

      <Button
        type="submit"
        className={`${btnStyles.Button} ${btnStyles.Blue}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : "Save"}
      </Button>
    </div>
  );

  if (loadError)
    return (
      <LoadError
        message={loadError}
        onRetry={() => setRetry((value) => value + 1)}
      />
    );
  if (authLoading || !hasLoaded) return <Asset spinner />;
  return (
    <Form noValidate onSubmit={handleSubmit}>
      {errors.non_field_errors?.map((message, idx) => (
        <Alert key={idx} variant="warning">
          {message}
        </Alert>
      ))}
      <Row>
        <Col className="py-2 p-0 p-md-2" md={7} lg={8}>
          <Container
            className={`${appStyles.Content} ${styles.Container} d-flex flex-column justify-content-center`}
          >
            <Form.Group className="text-center">
              <figure>
                <RecipeImage
                  src={image}
                  alt={title || "recipe preview"}
                  className={`${appStyles.Image} rounded`}
                  loading="eager"
                />
              </figure>
              <div>
                <Form.Label
                  className={`${btnStyles.Button} ${btnStyles.Blue} btn`}
                  htmlFor="image-upload"
                >
                  Change the image
                </Form.Label>
              </div>
              <Form.Control
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleChangeImage}
                ref={imageInput}
              />
            </Form.Group>
            {errors?.image?.map((message, idx) => (
              <Alert variant="warning" key={idx}>
                {message}
              </Alert>
            ))}

            {/* <div className="d-md-none">{textFields}</div> */}
          </Container>
        </Col>
        {/* <Col md={5} lg={4} className="d-none d-md-block p-0 p-md-2">
          <Container className={appStyles.Content}>{textFields}</Container>
        </Col> */}

        <Col md={5} lg={4} className="p-0 p-md-2">
          <Container className={`${appStyles.Content} p-3`}>
            <RecipeFormFields
              recipeData={recipeData}
              errors={errors}
              onChange={handleChange}
              disabled={isSubmitting}
            />

            {formActions}
          </Container>
        </Col>
      </Row>
    </Form>
  );
}

export default RecipeEditForm;
