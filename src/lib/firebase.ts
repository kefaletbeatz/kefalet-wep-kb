import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyIZBkBOOZ4UbaEla-F6bYRdocmjmYGaONhypQ",
  authDomain: "kefalet-store.firebaseapp.com",
  databaseURL: "https://kefalet-store-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "kefalet-store",
  storageBucket: "kefalet-store.firebasestorage.app",
  messagingSenderId: "394603792093",
  appId: "1:394603792093:web:a23567c78992448b233d34",
  measurementId: "GTV11WLVSQL"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getDatabase(app);
