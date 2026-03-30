import React, { useEffect, useMemo, useState, useRef } from "react";
import Confetti from "react-confetti";
import Container from "../helpers/container/Container";
import Heading from "../helpers/heading/Heading";
import styled from "./Spotlight.module.css";
import { useSelector } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { auth, database } from "../firebase/firebase-config";
import { toast } from "react-toastify";

const MOCK_RANKINGS = [
  {
    bookData: {
      id: "I9zwDwAAQBAJ",
      title: "Three Days of Happiness",
      authors: ["Sugaru Miaki"],
      imageLinks: {
        smallThumbnail: "http://books.google.com/books/content?id=I9zwDwAAQBAJ&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
        thumbnail: "http://books.google.com/books/content?id=I9zwDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
      },
    },
    count: 153,
  },
  {
    bookData: {
      id: "gquQEAAAQBAJ",
      title: "I Had That Same Dream Again (Light Novel)",
      authors: ["Yoru Sumino"],
      imageLinks: {
        smallThumbnail: "http://books.google.com/books/content?id=gquQEAAAQBAJ&printsec=frontcover&img=1&zoom=5&source=gbs_api",
        thumbnail: "http://books.google.com/books/content?id=gquQEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
      },
    },
    count: 84,
  },
  {
    bookData: {
      id: "CxeCCwAAQBAJ",
      title: "Goodnight Punpun, Vol. 1",
      authors: ["Inio Asano"],
      imageLinks: {
        smallThumbnail: "http://books.google.com/books/content?id=CxeCCwAAQBAJ&printsec=frontcover&img=1&zoom=5&source=gbs_api",
        thumbnail: "http://books.google.com/books/content?id=CxeCCwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
      },
    },
    count: 53,
  },
  {
    bookData: {
      id: "gNwQpoCxe0QC",
      title: "The Hitchhiker's Guide to the Galaxy",
      authors: ["Douglas Adams"],
      imageLinks: {
        smallThumbnail: "http://books.google.com/books/content?id=gNwQpoCxe0QC&printsec=frontcover&img=1&zoom=5&source=gbs_api",
        thumbnail: "http://books.google.com/books/content?id=gNwQpoCxe0QC&printsec=frontcover&img=1&zoom=1&source=gbs_api",
      },
    },
    count: 41,
  },
  {
    bookData: {
      id: "cDpDDwAAQBAJ",
      title: "Convenience Store Woman",
      authors: ["Sayaka Murata"],
      imageLinks: {
        smallThumbnail: "http://books.google.com/books/content?id=cDpDDwAAQBAJ&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
        thumbnail: "http://books.google.com/books/content?id=cDpDDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
      },
    },
    count: 36,
  },
  {
    bookData: {
      id: "ypQHO-JWFKgC",
      title: "Kafka on the Shore",
      authors: ["Haruki Murakami"],
      imageLinks: {
        smallThumbnail: "http://books.google.com/books/content?id=ypQHO-JWFKgC&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
        thumbnail: "http://books.google.com/books/content?id=ypQHO-JWFKgC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
      },
    },
    count: 29,
  },
  {
    bookData: {
      id: "FEL8DlqjYEkC",
      title: "The Alchemist",
      authors: ["Paulo Coelho"],
      imageLinks: {
        smallThumbnail: "http://books.google.com/books/content?id=FEL8DlqjYEkC&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
        thumbnail: "http://books.google.com/books/content?id=FEL8DlqjYEkC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
      },
    },
    count: 22,
  },
  {
    bookData: {
      id: "Tar-EAAAQBAJ",
      title: "The Little Prince",
      authors: ["Antoine de Saint-Exupéry"],
      imageLinks: {
        smallThumbnail: "http://books.google.com/books/content?id=Tar-EAAAQBAJ&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
        thumbnail: "http://books.google.com/books/content?id=Tar-EAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
      },
    },
    count: 17,
  },
  {
    bookData: {
      id: "27KePwAACAAJ",
      title: "Norwegian Wood",
      authors: ["Haruki Murakami"],
      imageLinks: {
        smallThumbnail: "http://books.google.com/books/content?id=27KePwAACAAJ&printsec=frontcover&img=1&zoom=5&source=gbs_api",
        thumbnail: "http://books.google.com/books/content?id=27KePwAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
      },
    },
    count: 11,
  },
  {
    bookData: {
      id: "X0zzDQAAQBAJ",
      title: "A Silent Voice",
      authors: ["Yoshitoki Oima"],
      imageLinks: {
        smallThumbnail: "http://books.google.com/books/content?id=X0zzDQAAQBAJ&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
        thumbnail: "http://books.google.com/books/content?id=X0zzDQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
      },
    },
    count: 7,
  },
];

const Spotlight = () => {
  const spot = { position: "relative", top: "10vh" };
  const { library } = useSelector((state) => state.bookStore);
  const { user } = useSelector((state) => state.auth);
  const [nominations, setNominations] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState({ name: "", photo: "" });
  const [isConfettiActive, setIsConfettiActive] = useState(true);
  const [podiumSize, setPodiumSize] = useState({ width: 0, height: 0 });
  const podiumRef = useRef(null);

  // Current month key e.g. "2026-03"
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthLabel = now.toLocaleString("default", { month: "long", year: "numeric" });

  // All books in user's library for nomination
  const allBooks = useMemo(() => {
    return library.filter((item) => item.bookData);
  }, [library]);

  const selectedBook = useMemo(() => {
    return allBooks.find((item) => item.bookData.id === selectedBookId);
  }, [allBooks, selectedBookId]);

  // Check if user already nominated this month
  const userNomination = useMemo(() => {
    return nominations.find((n) => n.userId === user);
  }, [nominations, user]);

  // Listen for nominations for this month
  useEffect(() => {
    const q = query(
      collection(database, "spotlightNominations"),
      where("monthKey", "==", monthKey),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setNominations(data);
      },
      (error) => {
        toast.error(error?.message || "Failed to load nominations.", {
          autoClose: 5000,
        });
      }
    );

    return () => unsub();
  }, [monthKey]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setProfile({
        name: firebaseUser?.displayName || "",
        photo: firebaseUser?.photoURL || "",
      });
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    // Stop producing new confetti after 5 seconds
    const timer = setTimeout(() => {
      setIsConfettiActive(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Tally votes — group nominations by bookId and count
  const rankings = useMemo(() => {
    const tally = {};
    nominations.forEach((nom) => {
      const bookId = nom.bookData?.id;
      if (!bookId) return;
      if (!tally[bookId]) {
        tally[bookId] = { bookData: nom.bookData, count: 0, voters: [] };
      }
      tally[bookId].count += 1;
      tally[bookId].voters.push({
        name: nom.userName,
        photo: nom.userPhoto,
      });
    });
    const real = Object.values(tally).sort((a, b) => b.count - a.count);
    // Use mock data only when there are no real nominations yet
    return real.length > 0 ? real : MOCK_RANKINGS;
  }, [nominations]);

  // Top 3 for the podium
  const top3 = rankings.slice(0, 3);

  useEffect(() => {
    const updateSize = () => {
      if (podiumRef.current) {
        setPodiumSize({
          width: podiumRef.current.offsetWidth,
          height: podiumRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [top3.length]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedBook) return;

    const { bookData } = selectedBook;

    setIsSubmitting(true);
    try {
      await addDoc(collection(database, "spotlightNominations"), {
        userId: user,
        userName: profile.name || "Anonymous",
        userPhoto: profile.photo || "",
        monthKey,
        bookData: {
          id: bookData.id,
          title: bookData.title,
          authors: bookData.authors,
          imageLinks: bookData.imageLinks,
        },
        createdAt: Date.now(),
      });
      setSelectedBookId("");
      toast.success("Nomination submitted!");
    } catch (error) {
      toast.error(error?.message || "Failed to submit nomination.", {
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveNomination = async () => {
    if (!userNomination) return;
    setIsSubmitting(true);
    try {
      await deleteDoc(doc(database, "spotlightNominations", userNomination.id));
      toast.info("Nomination removed.");
    } catch (error) {
      toast.error(error?.message || "Failed to remove nomination.", {
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Podium ordering: [2nd, 1st, 3rd]
  const podiumOrder = [];
  if (top3[1]) podiumOrder.push({ ...top3[1], place: 2 });
  if (top3[0]) podiumOrder.push({ ...top3[0], place: 1 });
  if (top3[2]) podiumOrder.push({ ...top3[2], place: 3 });

  return (
    <div style={spot}>
      <Container>
        <section className={styled.spotlight}>
          <Heading className="heading-md" text="Spotlight" />
          <p className="para">
            Nominate your book of the month for {monthLabel}. Each reader gets
            one pick — the community decides the winner.
          </p>

          {/* Nomination form */}
          {!user ? (
            <div className={styled.loginPrompt}>
              <p className={styled.loginPromptText}>
                Log in to nominate your book of the month.
              </p>
            </div>
          ) : !userNomination ? (
            <form className={styled.form} onSubmit={handleSubmit}>
              <label className={styled.label} htmlFor="nominate-book">
                Pick your book of the month
              </label>
              <select
                id="nominate-book"
                className={styled.select}
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
              >
                <option value="">Choose from your library</option>
                {allBooks.map((item) => (
                  <option key={item.bookData.id} value={item.bookData.id}>
                    {item.bookData.title}
                  </option>
                ))}
              </select>

              {allBooks.length === 0 && (
                <p className={styled.helper}>
                  Add books to your library first to nominate.
                </p>
              )}

              <button
                className={styled.submit}
                type="submit"
                disabled={isSubmitting || !selectedBook}
              >
                {isSubmitting ? "Nominating..." : "Nominate"}
              </button>
            </form>
          ) : (
            <div className={styled.nominated}>
              <p className={styled.nominatedText}>
                You nominated{" "}
                <strong>{userNomination.bookData?.title}</strong> this month.
              </p>
              <button
                className={styled.removeBtn}
                onClick={handleRemoveNomination}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Removing..." : "Change Nomination"}
              </button>
            </div>
          )}

          {/* Podium */}
          {top3.length > 0 && (
            <section 
              className={styled.podiumSection} 
              style={{ position: "relative" }}
              ref={podiumRef}
            >
              {podiumSize.width > 0 && (
                <Confetti
                  width={podiumSize.width}
              height={podiumSize.height}
                  recycle={isConfettiActive}
                  numberOfPieces={150}
                  gravity={0.15}
              style={{ position: "absolute", top: 30, left: 0, pointerEvents: "none", zIndex: 10 }}
                />
              )}
              <h2 className={styled.sectionHeading}>
                Top Books — {monthLabel}
              </h2>
              <div className={styled.podium}>
                {podiumOrder.map((entry) => {
                  const cover =
                    entry.bookData?.imageLinks?.smallThumbnail ||
                    entry.bookData?.imageLinks?.thumbnail;
                  const placeClass =
                    entry.place === 1
                      ? styled.first
                      : entry.place === 2
                      ? styled.second
                      : styled.third;
                  return (
                    <div
                      key={entry.bookData.id}
                      className={`${styled.podiumItem} ${placeClass}`}
                    >
                      <div className={styled.coverWrapper}>
                        {cover && (
                          <img
                            className={styled.podiumCover}
                            src={cover}
                            alt={entry.bookData.title}
                          />
                        )}
                        {/* SVG ribbon V-shape with medal at bottom */}
                        <svg
                          className={styled.chainSvg}
                          width="80"
                          height="120"
                          viewBox="0 0 80 120"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          
                          <line
                            x1="0" y1="60"
                            x2="40" y2="110"
                            strokeWidth="4"
                            strokeLinecap="round"
                            className={entry.place === 1 ? styled.chainGold : entry.place === 2 ? styled.chainSilver : styled.chainBronze}
                          />
                        
                          <line
                            x1="80" y1="60"
                            x2="40" y2="110"
                            strokeWidth="4"
                            strokeLinecap="round"
                            className={entry.place === 1 ? styled.chainGold : entry.place === 2 ? styled.chainSilver : styled.chainBronze}
                          />
                        </svg>
                        <div className={styled.medal}>
                          <div className={styled.podiumPlace}>{entry.place}</div>
                        </div>
                      </div>
                      <div className={styled.podiumBlock}>
                        <h3 className={styled.podiumTitle}>
                          {entry.bookData.title}
                        </h3>
                        {entry.bookData.authors && (
                          <p className={styled.podiumAuthor}>
                            {entry.bookData.authors.join(", ")}
                          </p>
                        )}
                        <span className={styled.podiumVotes}>
                          {entry.count} {entry.count === 1 ? "vote" : "votes"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Full nominations list */}
          <section className={styled.nominationsList}>
            <h2 className={styled.sectionHeading}>All Nominations</h2>
            {rankings.length === 0 ? (
              <p className={styled.helper}>
                No nominations yet this month. Be the first!
              </p>
            ) : (
              rankings.map((entry, index) => {
                const cover =
                  entry.bookData?.imageLinks?.smallThumbnail ||
                  entry.bookData?.imageLinks?.thumbnail;
                return (
                  <article key={entry.bookData.id} className={styled.nomination}>
                    <span className={styled.rank}>#{index + 1}</span>
                    {cover && (
                      <img
                        className={styled.cover}
                        src={cover}
                        alt={entry.bookData.title}
                      />
                    )}
                    <div className={styled.nominationInfo}>
                      <h3 className={styled.bookTitle}>
                        {entry.bookData.title}
                      </h3>
                      {entry.bookData.authors && (
                        <p className={styled.bookAuthor}>
                          {entry.bookData.authors.join(", ")}
                        </p>
                      )}
                      <span className={styled.voteCount}>
                        {entry.count} {entry.count === 1 ? "vote" : "votes"}
                      </span>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        </section>
      </Container>
    </div>
  );
};

export default Spotlight;
