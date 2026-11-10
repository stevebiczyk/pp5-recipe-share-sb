import React from "react";
import Container from "react-bootstrap/Container";
import appStyles from "../../App.module.css";
import Asset from "../../components/Asset";
import { useProfileData } from "../../contexts/ProfileDataContext";
import Profile from "./Profile";
import LoadError from "../../components/LoadError";

const PopularProfiles = ({ mobile }) => {
  const { popularProfiles, popularProfilesLoading, popularProfilesError, retryPopularProfiles } = useProfileData();

  return (
    <Container
      className={`${appStyles.Content} ${
        mobile && "d-lg-none text-center mb-3"
      }`}
    >
      {popularProfilesError ? <LoadError message={popularProfilesError} onRetry={retryPopularProfiles} /> : popularProfilesLoading ? <Asset spinner /> : popularProfiles.results.length ? (
        <>
          <p>Most followed profiles.</p>
          {mobile ? (
            <div className="d-flex justify-content-around">
              {popularProfiles.results.slice(0, 4).map((profile) => (
                <Profile key={profile.id} profile={profile} mobile />
              ))}
            </div>
          ) : (
            popularProfiles.results.map((profile) => (
              <Profile key={profile.id} profile={profile} />
            ))
          )}
        </>
      ) : (
        <p>No profiles yet.</p>
      )}
    </Container>
  );
};

export default PopularProfiles;
