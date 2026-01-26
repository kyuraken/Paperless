import React, { useEffect, useMemo, useState } from "react";
import Container from "../helpers/container/Container";
import Heading from "../helpers/heading/Heading";
import styled from "./Share.module.css";
import { useSelector } from "react-redux";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { auth, database } from "../firebase/firebase-config";
import { toast } from "react-toastify";

const Share = () => {
  const share = { position: "relative", top: "10vh" };
  const { library } = useSelector((state) => state.bookStore);
  const { user } = useSelector((state) => state.auth);
  const [comment, setComment] = useState("");
  const [selectedBookId, setSelectedBookId] = useState("");
  const [posts, setPosts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPostId, setEditingPostId] = useState("");
  const [editingComment, setEditingComment] = useState("");
  const [savingPostId, setSavingPostId] = useState("");

  const readingBooks = useMemo(() => {
    return library.filter((item) => item.category === "In Progress");
  }, [library]);

  const selectedBook = useMemo(() => {
    return readingBooks.find((item) => item.bookData.id === selectedBookId);
  }, [readingBooks, selectedBookId]);

  useEffect(() => {
    const postsQuery = query(
      collection(database, "sharePosts"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      postsQuery,
      (snap) => {
        const data = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setPosts(data);
      },
      (error) => {
        toast.error(error?.message || "Failed to load posts.", {
          autoClose: 5000,
        });
      }
    );

    return () => unsub();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = comment.trim();
    if (!selectedBook || trimmed.length === 0) return;

    const currentUser = auth.currentUser;
    const { bookData } = selectedBook;

    setIsSubmitting(true);
    try {
      await addDoc(collection(database, "sharePosts"), {
        userId: user,
        userName: currentUser?.displayName || "Anonymous",
        userPhoto: currentUser?.photoURL || "",
        comment: trimmed,
        bookData: {
          id: bookData.id,
          title: bookData.title,
          authors: bookData.authors,
          imageLinks: bookData.imageLinks,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      setComment("");
      setSelectedBookId("");
    } catch (error) {
      toast.error(error?.message || "Failed to share your post.", {
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (post) => {
    setEditingPostId(post.id);
    setEditingComment(post.comment || "");
  };

  const cancelEdit = () => {
    setEditingPostId("");
    setEditingComment("");
  };

  const saveEdit = async (postId) => {
    const trimmed = editingComment.trim();
    if (trimmed.length === 0) return;

    setSavingPostId(postId);
    try {
      await updateDoc(doc(database, "sharePosts", postId), {
        comment: trimmed,
        updatedAt: Date.now(),
      });
      cancelEdit();
    } catch (error) {
      toast.error(error?.message || "Failed to update your post.", {
        autoClose: 5000,
      });
    } finally {
      setSavingPostId("");
    }
  };

  const formatDate = (value) => {
    if (!value) return "";
    if (typeof value === "number") {
      return new Date(value).toLocaleDateString();
    }
    if (value?.seconds) {
      return new Date(value.seconds * 1000).toLocaleDateString();
    }
    return "";
  };

  return (
    <div style={share}>
      <Container>
        <section className={styled.share}>
          <Heading className="heading-md" text="Share" />
          <p className="para">
            Share your shelves and recommendations with friends in one place.
          </p>

          <form className={styled.form} onSubmit={handleSubmit}>
            <label className={styled.label} htmlFor="reading-book">
              Select a book you're reading
            </label>
            <select
              id="reading-book"
              className={styled.select}
              value={selectedBookId}
              onChange={(event) => setSelectedBookId(event.target.value)}
            >
              <option value="">Choose a book</option>
              {readingBooks.map((item) => (
                <option key={item.bookData.id} value={item.bookData.id}>
                  {item.bookData.title}
                </option>
              ))}
            </select>

            {readingBooks.length === 0 && (
              <p className={styled.helper}>
                You have no books marked as "In Progress" yet.
              </p>
            )}

            <label className={styled.label} htmlFor="share-comment">
              Add a comment
            </label>
            <textarea
              id="share-comment"
              className={styled.textarea}
              rows="4"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Why are you enjoying this book?"
            />

            <button
              className={styled.submit}
              type="submit"
              disabled={isSubmitting || !selectedBook || comment.trim() === ""}
            >
              {isSubmitting ? "Sharing..." : "Share Post"}
            </button>
          </form>

          <section className={styled.posts}>
            <h2 className={styled.heading}>Community Posts</h2>
            {posts.length === 0 ? (
              <p className={styled.helper}>No posts yet. Be the first!</p>
            ) : (
              posts.map((post) => {
                const canEdit = post.userId === user;
                const postBook = post.bookData || {};
                const cover =
                  postBook.imageLinks?.smallThumbnail ||
                  postBook.imageLinks?.thumbnail;
                return (
                  <article key={post.id} className={styled.post}>
                    <div className={styled.postHeader}>
                      <div className={styled.postMeta}>
                        <span className={styled.postAuthor}>
                          {post.userName || "Reader"}
                        </span>
                        <span className={styled.postDate}>
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                      {canEdit && (
                        <button
                          type="button"
                          className={styled.edit}
                          onClick={() => startEdit(post)}
                        >
                          Edit
                        </button>
                      )}
                    </div>

                    <div className={styled.postContent}>
                      {cover && (
                        <img
                          className={styled.cover}
                          src={cover}
                          alt={postBook.title || "Book cover"}
                        />
                      )}
                      <div>
                        <h3 className={styled.bookTitle}>
                          {postBook.title || "Untitled"}
                        </h3>
                        {postBook.authors && (
                          <p className={styled.bookAuthor}>
                            {postBook.authors.join(", ")}
                          </p>
                        )}
                        {editingPostId === post.id ? (
                          <>
                            <textarea
                              className={styled.textarea}
                              rows="3"
                              value={editingComment}
                              onChange={(event) =>
                                setEditingComment(event.target.value)
                              }
                            />
                            <div className={styled.actions}>
                              <button
                                type="button"
                                className={styled.save}
                                onClick={() => saveEdit(post.id)}
                                disabled={
                                  savingPostId === post.id ||
                                  editingComment.trim() === ""
                                }
                              >
                                {savingPostId === post.id ? "Saving..." : "Save"}
                              </button>
                              <button
                                type="button"
                                className={styled.cancel}
                                onClick={cancelEdit}
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        ) : (
                          <p className={styled.comment}>{post.comment}</p>
                        )}
                      </div>
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

export default Share;
