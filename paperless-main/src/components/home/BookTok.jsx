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
      What side of <span>social media</span> are you on?
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
Social media made me read it! We’re staying up to date with trending book content and making it easy for you to see what’s going viral. 
Add these popular books to your collection and keep up with the latest must-reads.
            </p>
            <Button onClick={handleClick}>Explore</Button>
          </article>
        </Container>
      </section>
    </>
  );
};

export default Booktok;
