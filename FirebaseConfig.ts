import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "auth-recycleroute.firebaseapp.com",
  projectId: "auth-recycleroute",
  storageBucket: "auth-recycleroute.appspot.com",
  messagingSenderId: "424843991912",
  appId: "1:424843991912:web:3830370e4a5361bfdf54dd"
};

const FIREBASE_APP = initializeApp(firebaseConfig);

const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(FIREBASE_APP); 
const auth = getAuth();

export { FIREBASE_APP, FIREBASE_AUTH, db };
