import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signOut } from "firebase/auth";
import { collection, doc, getFirestore, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";

// Firebase project configuration object
// Contains keys and identifiers for your Firebase project
const firebaseConfig = {
  apiKey: "AIzaSyAugRXFvRBsjSUqAMSSW3QIgtLZfH2UDyY",
  authDomain: "paperless-f8d21.firebaseapp.com",
  projectId: "paperless-f8d21",
  storageBucket: "paperless-f8d21.appspot.com",
  messagingSenderId: "218836016328",
  appId: "1:218836016328:web:29087d91ca1ad284a659fd",
  measurementId: "G-80504FBQ9B"
};

// Initialize Firebase app using the configuration above
const app = initializeApp(firebaseConfig);

// Initialize Firestore database instance
export const database = getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Configure Google authentication provider
// Forces the account selection prompt on sign-in
export const provider = new GoogleAuthProvider().setCustomParameters({
  prompt: "select_account",
});

// Reference to the "books" collection in Firestore
export const booksCollection = collection(database, "books");

// Function to add or update book data in Firestore
// id: document ID
// library: array of books
// shelf: object representing shelf data
export const addDataToFirebase = async (id, library, shelf) => {
  if (!id) return;

  // Create a reference to a specific document in "books" collection
  const currentDoc = doc(database, "books", `${id}`);

  // Write data to Firestore
  // merge: true ensures existing fields are not overwritten
  try {
    await setDoc(
      currentDoc,
      { id, library: [...library], shelf: { ...shelf } },
      { merge: true }
    );
  } catch (error) {
    toast.error(error?.message || "Failed to save your data.", {
      autoClose: 5000,
    });
    throw error;
  }
};

// Function to sign the user out
// Also removes user data from local storage
export const signUserOut = async () => {
  await signOut(auth)
    .then(() => localStorage.removeItem("user"))
    .catch((error) => toast.error(error, { autoClose: 5000 }));
};
