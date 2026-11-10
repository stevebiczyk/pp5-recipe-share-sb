import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";

import { axiosReq } from "../../api/axiosDefaults";
import { formErrors } from "../../utils/errors";
import Asset from "../../components/Asset";
import LoadError from "../../components/LoadError";
import {
  useCurrentUser,
  useAuthLoading,
  useSetCurrentUser,
} from "../../contexts/CurrentUserContext";

import btnStyles from "../../styles/Button.module.css";
import appStyles from "../../App.module.css";

const ProfileEditForm = () => {
  const currentUser = useCurrentUser();
  const authLoading = useAuthLoading();
  const setCurrentUser = useSetCurrentUser();
  const { id } = useParams();
  const navigate = useNavigate();
  const imageFile = useRef();

  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    avatar: "",
  });
  const { name, bio, avatar } = profileData;

  const [errors, setErrors] = useState({});
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    const controller = new AbortController();
    let active = true;
    setHasLoaded(false);
    setLoadError("");
    const handleMount = async () => {
      if (currentUser?.profile_id?.toString() === id) {
        try {
          const { data } = await axiosReq.get(`/profiles/${id}/`, { signal: controller.signal });
          if (!active) return;
          const { name, bio, avatar } = data;
          setProfileData({ name, bio, avatar });
        } catch (err) {
          if (active) setLoadError(err.response?.status === 404 ? "Profile not found." : "Could not load this profile. Please try again.");
        } finally {
          if (active) setHasLoaded(true);
        }
      } else {
        navigate("/", { replace: true });
      }
    };

    handleMount();
    return () => { active = false; controller.abort(); };
  }, [authLoading, currentUser, navigate, id, retry]);

  useEffect(() => () => {
    if (avatar?.startsWith("blob:")) URL.revokeObjectURL(avatar);
  }, [avatar]);

  const handleChange = (event) => {
    setProfileData({
      ...profileData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("bio", bio);

    if (imageFile?.current?.files[0]) {
      formData.append("avatar", imageFile?.current?.files[0]);
    }

    try {
      const { data } = await axiosReq.put(`/profiles/${id}/`, formData);
      setCurrentUser((currentUser) => ({
        ...currentUser,
        profile_avatar: data.avatar,
        profile_image: data.avatar,
      }));
      navigate(-1);
    } catch (err) {
      console.log(err);
      setErrors(formErrors(err));
    }
  };

  const textFields = (
    <>
      <Form.Group>
        <Form.Label>Bio</Form.Label>
        <Form.Control
          as="textarea"
          value={bio}
          onChange={handleChange}
          name="bio"
          rows={7}
        />
      </Form.Group>

      {errors?.bio?.map((message, idx) => (
        <Alert variant="warning" key={idx}>
          {message}
        </Alert>
      ))}
      <Button
        className={`${btnStyles.Button} ${btnStyles.Blue}`}
        onClick={() => navigate(-1)}
      >
        cancel
      </Button>
      <Button className={`${btnStyles.Button} ${btnStyles.Blue}`} type="submit">
        save
      </Button>
    </>
  );

  if (loadError) return <LoadError message={loadError} onRetry={() => setRetry((value) => value + 1)} />;
  if (authLoading || !hasLoaded) return <Asset spinner />;

  return (
    <Form onSubmit={handleSubmit}>
      {errors.non_field_errors?.map((message, idx) => <Alert key={idx} variant="warning">{message}</Alert>)}
      <Row>
        <Col className="py-2 p-0 p-md-2 text-center" md={7} lg={6}>
          <Container className={appStyles.Content}>
            <Form.Group>
              {avatar && (
                <figure>
                  <Image src={avatar} fluid />
                </figure>
              )}
              {errors?.avatar?.map((message, idx) => (
                <Alert variant="warning" key={idx}>
                  {message}
                </Alert>
              ))}
              <div>
                <Form.Label
                  className={`${btnStyles.Button} ${btnStyles.Blue} btn my-auto`}
                  htmlFor="image-upload"
                >
                  Change the image
                </Form.Label>
              </div>
              <Form.Control
                type="file"
                id="image-upload"
                ref={imageFile}
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files.length) {
                    setProfileData({
                      ...profileData,
                      avatar: URL.createObjectURL(e.target.files[0]),
                    });
                  }
                }}
              />
            </Form.Group>
            <div className="d-md-none">{textFields}</div>
          </Container>
        </Col>
        <Col md={5} lg={6} className="d-none d-md-block p-0 p-md-2 text-center">
          <Container className={appStyles.Content}>{textFields}</Container>
        </Col>
      </Row>
    </Form>
  );
};

export default ProfileEditForm;
