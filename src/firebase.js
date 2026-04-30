import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, orderBy, onSnapshot, getDocs, deleteDoc, serverTimestamp, Timestamp, writeBatch, limit } from 'firebase/firestore';

// Firebase configuration - REPLACE with your own config
const firebaseConfig = {
  apiKey: "AIzaSyATYXq3ccp1_YFMqrK6ZfV0rYPCfzl9gw4",
  authDomain: "restoqr-eab8d.firebaseapp.com",
  projectId: "restoqr-eab8d",
  storageBucket: "restoqr-eab8d.firebasestorage.app",
  messagingSenderId: "77432872068",
  appId: "1:77432872068:web:8bf49c90d5dbf3939db6d1",
  measurementId: "G-E989KXKWFZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  auth, db,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged,
  doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, orderBy, onSnapshot, getDocs, deleteDoc, serverTimestamp, Timestamp, writeBatch, limit
};
