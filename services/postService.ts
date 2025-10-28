import { collection, addDoc, query, getDocs, orderBy } from "firebase/firestore";
import { db } from "../lib/firebaseClient";

const postsCol = collection(db, "posts");

export const createPost = async (data: { title: string; body: string; authorId: string }) => {
  return await addDoc(postsCol, { ...data, createdAt: new Date() });
};

export const getPosts = async () => {
  const q = query(postsCol, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
