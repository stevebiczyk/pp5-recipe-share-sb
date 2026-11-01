import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import logo from "../assets/logo.png";
import styles from "../styles/NavBar.module.css";
import { NavLink, useNavigate } from "react-router-dom";
import {
  useCurrentUser,
  useSetCurrentUser,
} from "../contexts/CurrentUserContext";
import Avatar from "./Avatar";
import axios from "axios";
import useClickOutsideToggle from "../hooks/useClickOutsideToggle";
import { removeTokenTimestamp } from "../utils/utils";

const NavBar = () => {
  const currentUser = useCurrentUser();
  const setCurrentUser = useSetCurrentUser();
  const navigate = useNavigate();

  const { expanded, setExpanded, ref } = useClickOutsideToggle();

  const handleSignOut = async () => {
    try {
      await axios.post("/dj-rest-auth/logout/");
      setCurrentUser(null);
      removeTokenTimestamp();
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  const getNavLinkClass = ({ isActive }) =>
    `${styles.NavLink} ${isActive ? styles.Active : ""}`;

  const addPostIcon = (
    <NavLink className={getNavLinkClass} to="/recipes/create">
      <i className="far fa-plus-square"></i>Add recipe
    </NavLink>
  );

  const loggedInIcons = (
    <>
      <NavLink className={getNavLinkClass} to="/feed">
        <i className="fas fa-stream"></i>Feed
      </NavLink>
      <NavLink className={getNavLinkClass} to="/voted">
        <i className="fas fa-heart"></i>Voted
      </NavLink>
      <NavLink className={styles.NavLink} to="/" onClick={handleSignOut}>
        <i className="fas fa-sign-out-alt"></i>Sign out
      </NavLink>
      <NavLink
        className={styles.NavLink}
        to={`/profiles/${currentUser?.profile_id}`}
      >
        <Avatar
          src={currentUser?.profile_image || currentUser?.profile_avatar}
          text="Profile"
          height={40}
        />
      </NavLink>
    </>
  );

  const loggedOutIcons = (
    <>
      <NavLink className={getNavLinkClass} to="/login">
        <i className="fas fa-sign-in-alt"></i>Log in
      </NavLink>
      <NavLink to="/register" className={getNavLinkClass}>
        <i className="fas fa-user-plus"></i>Register
      </NavLink>
    </>
  );

  return (
    <Navbar
      expanded={expanded}
      className={styles.NavBar}
      expand="md"
      fixed="top"
    >
      <Container>
        <NavLink to="/">
          <Navbar.Brand>
            <img src={logo} alt="logo" height="45" />
          </Navbar.Brand>
        </NavLink>
        {currentUser && addPostIcon}
        <Navbar.Toggle
          ref={ref}
          onClick={() => setExpanded(!expanded)}
          aria-controls="basic-navbar-nav"
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto ml-auto text-left">
            <NavLink className={getNavLinkClass} to="/">
              <i className="fas fa-home"></i>Home
            </NavLink>
            {currentUser ? loggedInIcons : loggedOutIcons}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
