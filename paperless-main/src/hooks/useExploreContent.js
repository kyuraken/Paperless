import useExplore from "./useExplore";

const useExploreContent = () => {
  //custom hook to fetch books
  const romance = useExplore("Romance");
  const spice = useExplore("spice");
  const tiktok = useExplore("Tiktok");
  const easyReads = useExplore("Easy Reads");
  const manga = useExplore("Manga");
  const fiction = useExplore("Fiction");
  const fantasy = useExplore("Fantasy");

  //array with results from useExplore hook
  const contents = [
    { title: "Romance", books: romance, link: "romance", group: "our-picks" },
    { title: "Fantasy", books: fantasy, link: "fantasy", group: "our-picks" },
    { title: "Fiction", books: fiction, link: "fiction", group: "our-picks" },
    {
      title: "Read in a day",
      books: easyReads,
      link: "easy-reads",
      group: "our-picks",
    },
    { title: "Manga", books: manga, link: "manga", group: "our-picks" },
    {
      title: "BookTok Sensations",
      books: tiktok,
      link: "booktok",
      group: "explore-others",
    },
    {
      title: "Add a little bit of Spice",
      books: spice,
      link: "spice",
      group: "explore-others",
    },
  ];
  return contents;
};

export default useExploreContent;
