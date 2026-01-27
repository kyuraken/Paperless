import React, { useEffect, useState } from "react";
import styled from "./LibraryNav.module.css";

const links = ["All", "TBR", "In Progress", "Completed", "DNF"];

const LibraryNav = ({ searchParams, setSearchParams }) => {
  const [link, setlink] = useState("");

  //get the category from the url
  let urlParam = searchParams?.get("category");

  const handleLink = (link) => setlink(link);

  //update the search params when the link changes
  useEffect(() => {
    if (link) setSearchParams({ category: link });
  }, [link, setSearchParams]);

  const navLinks = links.map((link, index) => {
    const active =
      urlParam === link || (urlParam === "To Be Read" && link === "TBR");
    return (
      <button
        key={link}
        type="button"
        onClick={() => handleLink(link)}
        className={`${styled.chip} ${active ? styled.active : ""}`}
        style={{ "--i": index }}
      >
        <span className={styled.dot} aria-hidden="true" />
        {link === "TBR" ? "To Be Read" : link}
      </button>
    );
  });

  return (
    <nav className={styled["library-navbar"]}>
      <div className={styled["library-head"]}>
        <div className={styled["library-title"]}>
          <span className={styled.eyebrow}>Library filters</span>
          <span className={styled.title}>Your library</span>
        </div>
      </div>
      <div className={styled["library-links"]}>{navLinks}</div>
    </nav>
  );
};

export default LibraryNav;
