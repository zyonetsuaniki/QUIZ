"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, set, onValue, push } from "firebase/database";

export default function Player() {
  const [name, setName] = useState("");
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState<number | null>(null);
  const [isClosed, setIsClosed] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    let id = localStorage.getItem("quizUserId");

    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("quizUserId", id);
    }

    setUserId(id);
  }, []);

  useEffect(() => {
    const questionRef = ref(db, "currentQuestion");
    const closeRef = ref(db, "isClosed");

    const unsubscribeQuestion = onValue(questionRef, (snapshot) => {
      setQuestion(snapshot.val());
    });

    const unsubscribeClose = onValue(closeRef, (snapshot) => {
      setIsClosed(snapshot.val());
    });

    return () => {
      unsubscribeQuestion();
      unsubscribeClose();
    };
  }, []);

  const handleSubmit = async () => {
    if (!name || !answer || !question) {
      alert("初期化中です。少し待ってください。");
      return;
    }

    console.log("userId:", userId);
    console.log("question:", question);

    await set(ref(db, `answers/${question}/${name}`), {
      answer,
      timestamp: Date.now(),
    });

    await set(ref(db, `users/${name}`), {
      name,
    });

    setAnswer("");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">参加者画面</h1>

      <p>現在の問題：{question ? `第 ${question} 問` : "待機中..."}</p>

      <input
        type="text"
        placeholder="名前"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2"
      />

      <input
        type="text"
        placeholder="回答"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className="border p-2"
      />

      <button
        onClick={handleSubmit}
        disabled={isClosed}
        className={`px-4 py-2 rounded text-white ${
            isClosed ? "bg-gray-400" : "bg-green-500"
        }`}
      >
        {isClosed ? "締切済み" : "回答する"}
      </button>
    </main>
  );
}