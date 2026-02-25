import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDuHgvZVAZ4W5hIwR3h4uSefK69hdBnmK0",
  authDomain: "quiz-241d9.firebaseapp.com",
  databaseURL: "https://quiz-241d9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "quiz-241d9",
  storageBucket: "quiz-241d9.firebasestorage.app",
  messagingSenderId: "701309524062",
  appId: "1:701309524062:web:245ecdac08db0de98d3ccf"
};

// 二重初期化防止
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

export const db = getDatabase(app);