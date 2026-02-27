"use client";

import styles from './page.module.css';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { ref, set, onValue, push } from "firebase/database";

export default function Player() {
  const [name, setName] = useState("");
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState<number | null>(null);
  const [isClosed, setIsClosed] = useState(false);
  const [userId, setUserId] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [screenMode, setScreenMode] = useState("");
  const router = useRouter();

    // ★ 認証チェック
  useEffect(() => {
    const auth = sessionStorage.getItem("auth");
    const storedName = sessionStorage.getItem("playerName");

    if (auth !== "ok" || !storedName) {
      router.replace("/enter");
      return;
    }

    setName(storedName);
  }, [router]);

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
    const screenModeRef = ref(db, "screenMode");

    const unsubscribeQuestion = onValue(questionRef, (snapshot) => {
      setQuestion(snapshot.val());
      setIsAnswered(false);
    });

    const unsubscribeClose = onValue(closeRef, (snapshot) => {
      setIsClosed(snapshot.val());
    });

    const unsubscribeScreenMode = onValue(screenModeRef, (snapshot) => {
      setScreenMode(snapshot.val());
    });

    return () => {
      unsubscribeQuestion();
      unsubscribeClose();
      unsubscribeScreenMode();
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
      name,
      answer,
      timestamp: Date.now(),
    });

    await set(ref(db, `users/${name}`), {
      name,
    });
    setIsAnswered(true);
    setAnswer("");
  };

  return (
    <>
      {screenMode === "entry" && (
        <p className={styles.specialMessage}>
          他の参加者を待っています。<br></br>
          しばらくお待ちください。
        </p>
      )}

      {screenMode === "ranking" && (
        <p className={styles.specialMessage}>
          現在の成績発表中です！<br></br>
          スクリーンをご確認ください。
        </p>
      )}

      {screenMode === "final" && (
        <p className={styles.specialMessage}>
          最終成績発表中です！お疲れさまでした。<br></br>
          そのまま、現在のタブを閉じてください。
        </p>
      )}

      {screenMode === "question" && (
        <>
          <>
            <main className={styles.main}>
              <div className={styles.player}>
              <h1 className={styles.text}>参加者画面</h1>

              <p className={styles.text1}>現在の問題：{question ? `第 ${question} 問` : "待機中..."}</p>

              <p className={styles.cp}>
                {name}
              </p>

              <input
                type="text"
                placeholder="回答"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className={styles.cp_iptxt}
              />

              <button
                onClick={handleSubmit}
                disabled={isClosed || isAnswered}
                className={`${styles.answerButton} ${
                  isClosed
                    ? styles.closed
                    : isAnswered
                    ? styles.answered
                    : styles.active
                }`}
              >
                {isClosed
                  ? "締切済み"
                  : isAnswered
                  ? "回答済み"
                  : "回答する"}
              </button>  
              </div>

            </main>
          </>
        </>
      )}
    </>
  );
}