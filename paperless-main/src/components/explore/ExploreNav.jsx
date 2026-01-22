import React, { useState } from "react";
import styled from "./ExploreNav.module.css";
import { HashLink as Link } from "react-router-hash-link";

const ourPicksLinks = [
  { linkName: "All", link: "all" },
  { linkName: "Easy Reads", link: "easy-reads" },
  { linkName: "Manga", link: "manga" },
  { linkName: "Fiction", link: "fiction" },
  { linkName: "Romance", link: "romance" },
  { linkName: "Fantasy", link: "fantasy" },
];

const exploreOtherLinks = [
  { linkName: "BookTok Sensations", link: "booktok" },
  { linkName: "Spicy Book Recs", link: "spice" },
];

const ExploreNav = ({ activeGroup, setActiveGroup }) => {
  const [activeCategory, setActiveCategory] = useState("all");

  const activeLinks =
    activeGroup === "our-picks" ? ourPicksLinks : exploreOtherLinks;

  const links = activeLinks.map(({ linkName, link }) => {
    return (
      <li key={linkName}>
        <Link
          to={`#${link}`}
          scroll={(el) =>
            el.scrollIntoView({ behavior: "smooth", block: "center" })
          }
          className={`${styled["category-button"]} ${
            activeCategory === link ? styled["category-button-active"] : ""
          }`}
          onClick={() => setActiveCategory(link)}
        >
          {linkName}
        </Link>
      </li>
    );
  });

  return (
    <nav className={styled["explore-nav"]}>
      <h2 className={styled.title}>Categories</h2>
      <div className={styled["group-buttons"]}>
        <button
          type="button"
          className={`${styled["group-button"]} ${
            activeGroup === "our-picks" ? styled["group-button-active"] : ""
          }`}
          onClick={() => {
            setActiveGroup("our-picks");
            setActiveCategory("all");
          }}
        >
          Our Picks
        </button>
        <button
          type="button"
          className={`${styled["group-button"]} ${
            activeGroup === "explore-others"
              ? styled["group-button-active"]
              : ""
          }`}
          onClick={() => {
            setActiveGroup("explore-others");
            setActiveCategory("booktok");
          }}
        >
          Explore Others
        </button>
      </div>
      <ul className={styled.links}>{links}</ul>
    </nav>
  );
};

export default ExploreNav;
