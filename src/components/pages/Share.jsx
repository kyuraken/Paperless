import React from "react";
import Container from "../helpers/container/Container";
import Heading from "../helpers/heading/Heading";
import styled from "./Share.module.css";

const Share = () => {
  const share = { position: "relative", top: "10vh" };

  return (
    <div style={share}>
      <Container>
        <section className={styled.share}>
          <Heading className="heading-md" text="Share" />
          <p className="para">
            Share your shelves and recommendations with friends in one place.
          </p>
        </section>
      </Container>
    </div>
  );
};

export default Share;
