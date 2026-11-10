import React, { useEffect, useState } from "react";

import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";

import Asset from "../../components/Asset";
import LoadError from "../../components/LoadError";

import styles from "../../styles/ProfilePage.module.css";
import appStyles from "../../App.module.css";
import btnStyles from "../../styles/Button.module.css";

import PopularProfiles from "./PopularProfiles";
import { useCurrentUser } from "../../contexts/CurrentUserContext";
import { useParams } from "react-router";
import { axiosReq } from "../../api/axiosDefaults";
import {
  useProfileData,
  useSetProfileData,
} from "../../contexts/ProfileDataContext";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import InfiniteScroll from "react-infinite-scroll-component";
import Recipe from "../recipes/Recipe";
import { fetchMoreData } from "../../utils/utils";
import NoResults from "../../assets/no-results.png";
import { ProfileEditDropdown } from "../../components/MoreDropdown";

function ProfilePage() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [profileRecipes, setProfileRecipes] = useState({ results: [] });
  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);

  const currentUser = useCurrentUser();
  const { id } = useParams();

  const { setProfileData, handleFollow, handleUnfollow } = useSetProfileData();
  const { pageProfile } = useProfileData();

  const [profile] = pageProfile.results;
  const is_owner = currentUser?.username === profile?.owner;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setHasLoaded(false);
    setLoadError("");
    const fetchData = async () => {
      try {
        const [{ data: pageProfile }, { data: profileRecipes }] =
          await Promise.all([
            axiosReq.get(`/profiles/${id}/`, { signal: controller.signal }),
            axiosReq.get(`/recipes/?owner__profile=${id}`, { signal: controller.signal }),
          ]);
        if (!active) return;
        setProfileData((prevState) => ({
          ...prevState,
          pageProfile: { results: [pageProfile] },
        }));
        setProfileRecipes(profileRecipes);
        setHasLoaded(true);
      } catch (err) {
        if (active) setLoadError(err.response?.status === 404 ? "Profile not found." : "Could not load this profile. Please try again.");
      }
    };
    fetchData();
    return () => { active = false; controller.abort(); };
  }, [id, setProfileData, currentUser, retry]);

  const mainProfile = (
    <>
      {profile?.is_owner && <ProfileEditDropdown id={profile?.id} />}
      <Row className="g-0 px-3 text-center">
        <Col lg={3} className="text-lg-left">
          <Image
            className={styles.ProfileImage}
            roundedCircle
            src={profile?.image || profile?.avatar || profile?.profile_avatar}
          />
        </Col>
        <Col lg={6}>
          <h3 className="m-2">{profile?.owner}</h3>
          <Row className="justify-content-center g-0">
            <Col xs={3} className="my-2">
              <div>{profile?.recipes_count}</div>
              <div>Recipes</div>
            </Col>
            <Col xs={3} className="my-2">
              <div>{profile?.followers_count}</div>
              <div>followers</div>
            </Col>
            <Col xs={3} className="my-2">
              <div>{profile?.following_count}</div>
              <div>following</div>
            </Col>
          </Row>
        </Col>
        <Col lg={3} className="text-lg-right">
          {currentUser &&
            !is_owner &&
            (profile?.following_id ? (
              <Button
                className={`${btnStyles.Button} ${btnStyles.BlackOutline}`}
                onClick={() => handleUnfollow(profile)}
              >
                Unfollow
              </Button>
            ) : (
              <Button
                className={`${btnStyles.Button} ${btnStyles.Black}`}
                onClick={() => handleFollow(profile)}
              >
                follow
              </Button>
            ))}
        </Col>
        {profile?.bio && <Col className="p-3">{profile.bio}</Col>}
      </Row>
    </>
  );

  const mainProfileRecipes = (
    <>
      <hr />
      <p className="text-center">{profile?.owner}'s recipes</p>
      <hr />
      {profileRecipes.results.length ? (
        <InfiniteScroll
          children={profileRecipes.results.map((recipe) => (
            <Recipe
              key={recipe.id}
              {...recipe}
              setRecipes={setProfileRecipes}
            />
          ))}
          dataLength={profileRecipes.results.length}
          loader={<Asset spinner />}
          hasMore={!!profileRecipes.next}
          next={() => fetchMoreData(profileRecipes, setProfileRecipes, setLoadError)}
        />
      ) : (
        <Asset
          src={NoResults}
          message={`No results found, ${profile?.owner} hasn't posted any recipes yet.`}
        />
      )}
    </>
  );

  return (
    <Row>
      <Col className="py-2 p-0 p-lg-2" lg={8}>
        <PopularProfiles mobile />
        <Container className={appStyles.Content}>
          {loadError ? <LoadError message={loadError} onRetry={() => setRetry((value) => value + 1)} /> : hasLoaded ? (
            <>
              {mainProfile}
              {mainProfileRecipes}
            </>
          ) : (
            <Asset spinner />
          )}
        </Container>
      </Col>
      <Col lg={4} className="d-none d-lg-block p-0 p-lg-2">
        <PopularProfiles />
      </Col>
    </Row>
  );
}

export default ProfilePage;
