"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, get, update } from "firebase/database";

export default function Result() {
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const calculateResults = async () => {
      const questionSnap = await get(ref(db, "currentQuestion"));
      const question = questionSnap.val();
      if (!question) return;

      const answersSnap = await get(ref(db, `answers/${question}`));
      const correctSnap = await get(ref(db, `correctAnswers/${question}`));

      const correctAnswer = correctSnap.val();
      const answersData = answersSnap.val();
      if (!answersData) return;

      const answersArray = Object.values(answersData) as any[];

      // 提出順
      answersArray.sort((a, b) => a.timestamp - b.timestamp);

      // 正解者のみ
      const correctPlayers = answersArray.filter(
        (a) =>
            String(a.answer).trim().toLowerCase() ===
            String(correctAnswer).trim().toLowerCase()
        );

      const ranked = correctPlayers.map((player, index) => {
        const score = Math.max(10 - index, 1); // 10〜1点

        return {
          rank: index + 1,
          name: player.name,
          score,
        };
      });

      // 🔥 スコアを加算
      for (const player of ranked) {
        const playerRef = ref(db, `scores/${player.name}`);
        const prevSnap = await get(playerRef);
        const prevScore = prevSnap.exists() ? prevSnap.val() : 0;

        await update(ref(db, "scores"), {
          [player.name]: prevScore + player.score,
        });
      }

      setResults(ranked);
    };

    calculateResults();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-3xl font-bold">今回の順位</h1>

      {results.map((r) => (
        <p key={r.rank}>
          {r.rank}位：{r.name}（{r.score}点）
        </p>
      ))}
    </main>
  );
}