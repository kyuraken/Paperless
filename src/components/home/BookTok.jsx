import React from "react";
import styled from "./Booktok.module.css";
import booktok from "../../images/booktok2.jpg";
import Container from "../helpers/container/Container";
import Heading from "../helpers/heading/Heading";
import Button from "../button/Button";
import { useNavigate } from "react-router-dom";

const Booktok = () => {
  const navigate = useNavigate();

  const handleClick = () => navigate("/explore");

  // props for heading component
  const heading = (
    <>
      Share what others are <span>currently reading</span>
    </>
  );

  return (
    <>
      <section className={styled.booktok}>
        <figure className={styled.bookmark}>
          <img src={booktok} alt="books banner from tubefilter.com" />
        </figure>
        <Container>
          <article className={styled["booktok-info"]}>
            <Heading className="heading-md" text={heading} />

            <p className="para">
              Share your post of what you are currently reading with others.
              Add a comment, publish your post, and see what the community is
              reading right now.
            </p>
            <Button onClick={handleClick}>Explore</Button>
          </article>
        </Container>
      </section>
    </>
  );
};

export default Booktok;
