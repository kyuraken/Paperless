import React, { useEffect, useMemo, useState } from "react";
import Container from "../helpers/container/Container";
import Heading from "../helpers/heading/Heading";
import styled from "./Share.module.css";
import { useSelector } from "react-redux";
import Modal from "../helpers/modal/Modal";
import bookmark from "../../images/bookmark.png";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
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
  const [isAnonymous, setIsAnonymous] = useState(() => {
    return localStorage.getItem("shareAnonymous") === "true";
  });
  const [hideLikes, setHideLikes] = useState(() => {
    return localStorage.getItem("shareHideLikes") === "true";
  });
  const [customName, setCustomName] = useState(() => {
    return localStorage.getItem("shareCustomName") || "";
  });
  const [editingPostId, setEditingPostId] = useState("");
  const [editingComment, setEditingComment] = useState("");
  const [savingPostId, setSavingPostId] = useState("");
  const [deletingPostId, setDeletingPostId] = useState("");
  const [likingPostId, setLikingPostId] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState("");
  const [profile, setProfile] = useState({ name: "", photo: "" });

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

  useEffect(() => {
    localStorage.setItem("shareAnonymous", String(isAnonymous));
  }, [isAnonymous]);

  useEffect(() => {
    localStorage.setItem("shareHideLikes", String(hideLikes));
  }, [hideLikes]);

  useEffect(() => {
    localStorage.setItem("shareCustomName", customName);
  }, [customName]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setProfile({
        name: firebaseUser?.displayName || "",
        photo: firebaseUser?.photoURL || "",
      });
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = comment.trim();
    if (!selectedBook || trimmed.length === 0) return;

    const { bookData } = selectedBook;
    const displayName = customName.trim() || profile.name || "Anonymous";
    const photoUrl = profile.photo || "";

    setIsSubmitting(true);
    try {
      await addDoc(collection(database, "sharePosts"), {
        userId: user,
        userName: isAnonymous ? "Anonymous" : displayName,
        userPhoto: isAnonymous ? "" : photoUrl,
        isAnonymous,
        hideLikes,
        likes: [],
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

  const deletePost = async (postId) => {
    setDeletingPostId(postId);
    try {
      await deleteDoc(doc(database, "sharePosts", postId));
      if (editingPostId === postId) cancelEdit();
    } catch (error) {
      toast.error(error?.message || "Failed to delete your post.", {
        autoClose: 5000,
      });
    } finally {
      setDeletingPostId("");
    }
  };

  const toggleLike = async (post) => {
    if (!user || post.hideLikes) return;
    const likes = Array.isArray(post.likes) ? post.likes : [];
    const hasLiked = likes.includes(user);

    setLikingPostId(post.id);
    try {
      await updateDoc(doc(database, "sharePosts", post.id), {
        likes: hasLiked ? arrayRemove(user) : arrayUnion(user),
        updatedAt: Date.now(),
      });
    } catch (error) {
      toast.error(error?.message || "Failed to update likes.", {
        autoClose: 5000,
      });
    } finally {
      setLikingPostId("");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    await deletePost(deleteTargetId);
    setDeleteTargetId("");
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

            <label className={styled.toggle}>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(event) => setIsAnonymous(event.target.checked)}
              />
              <span>Post anonymously</span>
            </label>
            <p className={styled.helper}>
              Your name will be hidden on new posts.
            </p>
            <label className={styled.toggle}>
              <input
                type="checkbox"
                checked={hideLikes}
                onChange={(event) => setHideLikes(event.target.checked)}
              />
              <span>Hide likes on my posts</span>
            </label>
            <p className={styled.helper}>
              When enabled, likes are disabled on new posts.
            </p>
            <label className={styled.label} htmlFor="custom-name">
              Custom name
            </label>
            <input
              id="custom-name"
              className={styled.input}
              type="text"
              value={customName}
              onChange={(event) => setCustomName(event.target.value)}
              placeholder="Display name for posts"
              disabled={isAnonymous}
            />
            <p className={styled.helper}>
              Leave blank to use your Google profile name.
            </p>

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
                const displayName = post.isAnonymous
                  ? "Anonymous"
                  : post.userName || "Reader";
                const avatarUrl = post.isAnonymous
                  ? ""
                  : post.userPhoto || (canEdit ? profile.photo : "") || "";
                const likes = Array.isArray(post.likes) ? post.likes : [];
                const likeCount = likes.length;
                const hasLiked = likes.includes(user);
                const likesHidden = post.hideLikes === true;
                return (
                  <article key={post.id} className={styled.post}>
                    <div className={styled.postHeader}>
                      <div className={styled.postIdentity}>
                        {avatarUrl ? (
                          <img
                            className={styled.avatar}
                            src={avatarUrl}
                            alt={displayName}
                          />
                        ) : (
                          <img
                            className={styled.avatarFallback}
                            src={bookmark}
                            alt="Default avatar"
                          />
                        )}
                        <div className={styled.postMeta}>
                          <span className={styled.postAuthor}>
                            {displayName}
                          </span>
                          <span className={styled.postDate}>
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                      </div>
                      {canEdit && (
                        <div className={styled.postActions}>
                          <button
                            type="button"
                            className={styled.edit}
                            onClick={() => startEdit(post)}
                            disabled={deletingPostId === post.id}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className={styled.delete}
                            onClick={() => setDeleteTargetId(post.id)}
                            disabled={deletingPostId === post.id}
                          >
                            {deletingPostId === post.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
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
                        {!likesHidden ? (
                          <div className={styled.likeRow}>
                            <button
                              type="button"
                              className={styled.likeButton}
                              onClick={() => toggleLike(post)}
                              disabled={likingPostId === post.id}
                            >
                              {hasLiked ? "Unlike" : "Like"}
                            </button>
                            <span className={styled.likeCount}>
                              {likeCount} {likeCount === 1 ? "like" : "likes"}
                            </span>
                          </div>
                        ) : (
                          <p className={styled.likesHidden}>
                            Likes disabled by author.
                          </p>
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
      {deleteTargetId && (
        <Modal
          setOpenModal={() => setDeleteTargetId("")}
          openModal={deleteTargetId !== ""}
        >
          <section className={styled.confirm}>
            <h3 className={styled.confirmTitle}>Delete post?</h3>
            <p className={styled.confirmText}>
              This action can't be undone.
            </p>
            <div className={styled.confirmActions}>
              <button
                type="button"
                className={styled.confirmCancel}
                onClick={() => setDeleteTargetId("")}
                disabled={deletingPostId === deleteTargetId}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styled.confirmDelete}
                onClick={confirmDelete}
                disabled={deletingPostId === deleteTargetId}
              >
                {deletingPostId === deleteTargetId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </section>
        </Modal>
      )}
    </div>
  );
};

export default Share;
