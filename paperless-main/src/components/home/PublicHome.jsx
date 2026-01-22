import React from "react";
import reading_svg from "../../images/reading_svg.png";
import covers from "../../images/covers.png";
import Hero from "./Hero";
import Genre from "./Genre";
import TopPicks from "./TopPicks";
import Booktok from "./BookTok";
import Review from "./Review.jsx";

// props to pass to the genre component
const genreList = [
  "Fiction",
  "Fantasy",
  "Romance",
  "Humour",
  "Horror",
  "New Adult",
  "Non-Fiction",
  "Mystery",
];

const PublicHome = () => {
  //Hero Props
  const heroHeading = (
    <>
      Your <span>reliable</span> bookshelf
    </>
  );

  const heroText =
    "The go-to bookmarking app for book lovers. Build your online bookshelf, add books anytime, anywhere, and keep everything organized with custom shelves—so you never lose track of a book again.";
  const buttonText = "Start Organizing";

  // props to pass to the genre component
  const text = (
    <>
      Organize your books in <span>one</span> place
    </>
  );

  // props to pass to the genre component
  const paragraph =
    "Looking for an easy way to keep track of your favorite books? Paperless brings all your favorites into one place. Create your own bookshelf and save every title you love.";

  // props to pass to the top picks component

  return (
    <section>
      <Hero
        src={covers}
        text={heroText}
        buttonText={buttonText}
        heroHeading={heroHeading}
      />
      <Genre
        genreList={genreList}
        headingClassName="heading-md"
        headingText={text}
        src={reading_svg}
        alt="person reading a book"
        paragraph={paragraph}
      />
      <TopPicks
        text={
          <>
            Top picks of the <span>month</span>
          </>
        }
        paragraph="Each of these books is a great read, perfect for hours of entertainment. Looking for your next book? Any of these titles is a great place to start."
      />
      <Booktok />
      <Review />
    </section>
  );
};

export default PublicHome;
