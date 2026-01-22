import React, { useState } from "react";
import ExploreContent from "../explore/ExploreContent";
import ExploreNav from "../explore/ExploreNav";
import Container from "../helpers/container/Container";
import Footer from "../nav/Footer";
import styles from "./Explore.module.css";

const Explore = () => {
  const explore = { position: "relative", top: "10vh" };
  const [activeGroup, setActiveGroup] = useState("our-picks");

  return (
    <div style={explore}>
      <Container>
        <div className={styles["explore-layout"]}>
          <ExploreNav
            activeGroup={activeGroup}
            setActiveGroup={setActiveGroup}
          />
          <ExploreContent activeGroup={activeGroup} />
        </div>
      </Container>
      <Footer />
    </div>
  );
};

export default Explore;
