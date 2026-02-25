"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

export default function RankingPage() {
  const [scores, setScores] = useState<any>({});

  useEffect(() => {
    onValue(ref(db, "scores"), (snap) => {
      setScores(snap.val() || {});
    });
  }, []);

  const sorted = Object.entries(scores).sort((a: any, b: any) => b[1] - a[1]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">総合ランキング</h1>
      <ul>
        {sorted.map(([user, score]: any, index) => (
          <li key={user}>
            {index + 1}位：{user} - {score}点
          </li>
        ))}
      </ul>
    </div>
  );
}