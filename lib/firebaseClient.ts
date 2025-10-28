import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAu-qYC4JeaNSdVNtD-NgpkDcSVt42vH6M",
  authDomain: "hotel-management-1d5a5.firebaseapp.com",
  projectId: "hotel-management-1d5a5",
  storageBucket: "hotel-management-1d5a5.firebasestorage.app",
  messagingSenderId: "638616553029",
  appId: "1:638616553029:web:7eae4abdb6f90f3a9ec52c",
  measurementId: "G-44FXCCRF3J"
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();