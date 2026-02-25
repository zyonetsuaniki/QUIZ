"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

export default function ScreenPage() {
  const [number, setNumber] = useState(1);
  const [question, setQuestion] = useState("");
  const [scores, setScores] = useState<any>({});
  const [rankingVisible, setRankingVisible] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<number>(1);
  const [roundScores, setRoundScores] = useState<any>({});
  const [isClosed, setIsClosed] = useState(false);
  const [users, setUsers] = useState<any>({});

  useEffect(() => {
    onValue(ref(db, "currentQuestion"), (snap) => {
      const qNum = snap.val() || 1;
      setNumber(qNum);
      setCurrentQuestion(qNum);

      onValue(ref(db, `questions/${qNum}`), (qSnap) => {
        setQuestion(qSnap.val()?.text || "");
      });
    });

    onValue(ref(db, "users"), (snap) => {
      setUsers(snap.val() || {});
    });

    onValue(ref(db, "roundScores"), (snap) => {
      setRoundScores(snap.val() || {});
    });

    onValue(ref(db, "scores"), (snap) => {
      setScores(snap.val() || {});
    });

    onValue(ref(db, "rankingVisible"), (snap) => {
      setRankingVisible(snap.val() || false);
    });

    onValue(ref(db, "isClosed"), (snap) => {
      setIsClosed(!!snap.val());
    });
  }, []);

  const sorted = Object.entries(scores).sort(
    (a: any, b: any) => b[1] - a[1]
  );

  return (
    <div className="flex flex-col items-center justify-center h-screen text-4xl">

      {!rankingVisible ? (
        <>
          <p>第{number}問</p>
          <p className="mt-6">{question}</p>
        </>
      ) : (
        <>
          <h1>
            {currentQuestion === 19
              ? "🏆 最終結果 🏆"
              : "🏆 現在の順位 🏆"}
          </h1>
          
          <div className="w-2/3">
            {sorted.map(([user, totalScore]: any, index) => (
              <div
                key={user}
                className="flex justify-between border-b py-3"
              >
                <div>
                  {index + 1}位：{users?.[user]?.name ?? user}
                </div>

                <div>
                  今回：
                  {roundScores?.[currentQuestion]?.[user] ?? 0}
                  点
                  総合：
                  {totalScore}点
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}