"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  ref,
  onValue,
  set,
  get,
  update,
  remove
} from "firebase/database";

export default function AdminPage() {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [questionText, setQuestionText] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [questions, setQuestions] = useState<any>({});
  const [answers, setAnswers] = useState<any>({});
  const [scores, setScores] = useState<any>({});
  const [isClosed, setIsClosed] = useState(false);
  const [screenMode, setScreenMode] = useState("question");
  const [roundScores, setRoundScores] = useState<any>({});
  const [users, setUsers] = useState<any>({});

  // ===============================
  // 🔥 リアルタイム監視
  // ===============================
  useEffect(() => {
    onValue(ref(db, "currentQuestion"), (snap) => {
      const q = snap.val() || 1;
      setCurrentQuestion(q);

      onValue(ref(db, `questions/${q}`), (qs) => {
        setQuestionText(qs.val()?.text || "");
        setCorrectAnswer(qs.val()?.answer || "");
      });

      onValue(ref(db, `answers/${q}`), (as) => {
        setAnswers(as.val() || {});
      });

      onValue(ref(db, "roundScores"), (snap) => {
        setRoundScores(snap.val() || {});
      });
    
    });

    onValue(ref(db, "questions"), (snap) => {
      setQuestions(snap.val() || {});
    });

    onValue(ref(db, "scores"), (snap) => {
      setScores(snap.val() || {});
    });

    onValue(ref(db, "isClosed"), (snap) => {
      setIsClosed(!!snap.val());
    });

    onValue(ref(db, "screenMode"), (snap) => {
      setScreenMode(snap.val() || "question");
    });

    onValue(ref(db, "inputName"), (snap) => {
      setUsers(snap.val() || {});
    });

  }, []);

  useEffect(() => {
    if (!isClosed) return;

    const sorted = Object.entries(answers).sort(
      (a: any, b: any) =>
        (a[1]?.timestamp || 0) - (b[1]?.timestamp || 0)
    );

    const correctUsers = sorted.filter(
      ([_, value]: any) => value?.answer === correctAnswer
    );

    const tempRound: any = {};

    sorted.forEach(([user]) => {
      tempRound[user] = 0;
    });

    correctUsers.forEach(([user], index) => {
      tempRound[user] = Math.max(10 - index, 1);
    });

    set(ref(db, `roundScores/${currentQuestion}`), tempRound);

  }, [answers, isClosed, correctAnswer]);

  // ===============================
  // 🔥 問題移動
  // ===============================
  const nextQuestion = async () => {
    await set(ref(db, "currentQuestion"), currentQuestion + 1);
    await set(ref(db, "isClosed"), false);
    await set(ref(db, "screenMode"), "question");
  };

  const prevQuestion = async () => {
    if (currentQuestion > 1) {
      await set(ref(db, "currentQuestion"), currentQuestion - 1);
      await set(ref(db, "screenMode"), "question");
    }
  };

  // ===============================
  // 🔥 締切
  // ===============================
  const closeAnswer = async () => {
    await set(ref(db, "isClosed"), true);
  };

  // ===============================
  // 🔥 採点確定
  // ===============================
  const finalizeScore = async () => {
    if (!isClosed) return;

    // ① すでに計算済みの今回得点を取得
    const roundSnap = await get(
      ref(db, `roundScores/${currentQuestion}`)
    );

    const roundResult = roundSnap.val() || {};

    // ② 現在の総合得点を取得
    const scoreSnap = await get(ref(db, "scores"));
    const currentTotals = scoreSnap.val() || {};

    const totalUpdate: any = {};

    // ③ 今回得点を総合に加算
    for (const user in roundResult) {
      totalUpdate[user] =
        (currentTotals[user] || 0) +
        roundResult[user];
    }

    await update(ref(db, "scores"), totalUpdate);

    // ④ 編集ロック + 順位表示
    await set(ref(db, "screenMode"), 
      currentQuestion === 20 ? "final" : "ranking"
    );

    alert("採点完了・順位表示中");
  };

  // ===============================
  // 🔥 得点編集
  // ===============================
  const handleScoreChange = async (
    user: string,
    field: string,
    value: number
  ) => {
    if (!isClosed) return;

    if (field === "round") {
      await set(
        ref(db, `roundScores/${currentQuestion}/${user}`),
        value
      );
    }

    if (field === "total") {
      await set(ref(db, `scores/${user}`), value);
    }
  };

  const handleQuestionChange = (
    id: string,
    field: string,
    value: string
  ) => {
    setQuestions((prev: any) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const resetParticipants = async () => {
    const ok = confirm("参加者データをすべてリセットしますか？");
    if (!ok) return;

    await remove(ref(db, "answers"));
    await remove(ref(db, "scores"));
    await remove(ref(db, "roundScores"));
    await remove(ref(db, "users"));
    await remove(ref(db, "inputName"));

    await set(ref(db, "isClosed"), false);
    await set(ref(db, "rankingVisible"), false);

    alert("参加者データをリセットしました");
  };

  const saveAllQuestions = async () => {
    await update(ref(db, "questions"), questions);
    alert("問題を保存しました！");
  };

  // ===============================
  // 🎨 UI
  // ===============================
  return (
    <div className="p-5 max-h-[100vh-100px]">
      <div className="flex max-h-[50px]">
        <div className="w-1/6">
          <h1 className="text-3xl font-bold">管理画面</h1>
        </div>
        <div className="w-5/6">
          <div className="space-x-2">
            
            <button
              onClick={() =>
                set(ref(db, "screenMode"), "entry")
              }
              className="bg-pink-600 text-white px-4 py-2 rounded"
            >
              参加者確認画面
            </button> 

            <button
              onClick={() =>
                set(ref(db, "screenMode"), "question")
              }
              className="bg-indigo-600 text-white px-4 py-2 rounded"
            >
              問題表示
            </button>

            <button
              onClick={prevQuestion}
              className="bg-gray-600 text-white px-4 py-2 rounded"
            >
              前の問題へ
            </button>

            <button
              onClick={nextQuestion}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              次の問題へ
            </button>

            <button
              onClick={closeAnswer}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              締切
            </button>

            <button
              onClick={finalizeScore}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              採点確定
            </button>

            <button
              onClick={resetParticipants}
              className="bg-black text-white px-4 py-2 rounded"
            >
              参加者リセット
            </button>
          </div>
        </div>
      </div>
      <div className="flex gap-8 max-h-[570px]">

        {/* ================= LEFT ================= */}
        <div className="w-1/2">

          <p className="mt-2 text-red-600 font-bold">
            参加者数：{Object.keys(users).length}人
          </p>

          <p className="text-xl font-bold">
            現在：第{currentQuestion}問
          </p>

          <p className="mt-2 text-lg">
            問題：{questionText}
          </p>

          <p className="mt-2 text-blue-600 font-bold">
            正答：{correctAnswer}
          </p>



          {/* 回答一覧（スクロール対応） */}
          <h2 className="mt-3 text-2xl font-bold">
            回答一覧
          </h2>

          <div className="mt-3 max-h-[385px] overflow-y-auto border p-3 rounded">

            {Object.entries(answers)
              .sort(
                (a: any, b: any) =>
                  (a[1]?.timestamp || 0) -
                  (b[1]?.timestamp || 0)
              )
              .map(([user, value]: any) => {

                const roundScore =
                roundScores?.[currentQuestion]?.[user] || 0;

                return (
                  <div
                    key={user}
                    className="flex justify-between border-b py-2"
                  >
                    <div>
                      <div>
                        {value?.name ?? user}：{value?.answer}
                      </div>

                      <div className="text-xs text-gray-500">
                        {value?.timestamp
                          ? new Date(value.timestamp).toLocaleTimeString()
                          : ""}
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">

                      {/* 今回得点 */}
                      <input
                        type="number"
                        value={roundScores?.[currentQuestion]?.[user] ?? 0}
                        disabled={!isClosed || screenMode !== "question"}
                        onChange={(e) =>
                          handleScoreChange(
                            user,
                            "round",
                            Number(e.target.value)
                          )
                        }
                        className="w-16 border p-1"
                      />

                      {/* 総合得点 */}
                      <input
                        type="number"
                        value={scores[user] || 0}
                        disabled={!isClosed || screenMode !== "question"}
                        onChange={(e) =>
                          handleScoreChange(
                            user,
                            "total",
                            Number(e.target.value)
                          )
                        }
                        className="w-20 border p-1"
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* ========================= */}
        {/* 🔹 右側：問題一括編集 */}
        {/* ========================= */}
        <div className="w-1/2 overflow-y-auto max-h-[80vh]">

          <h2 className="text-2xl font-bold mb-4">
            問題一括編集
          </h2>

          {Object.entries(questions).map(
            ([id, q]: any) => (
              <div
                key={id}
                className="border p-4 mb-4 rounded"
              >
                <p className="font-bold">
                  第{id}問
                </p>

                <input
                  type="text"
                  value={q.text}
                  onChange={(e) =>
                    handleQuestionChange(
                      id,
                      "text",
                      e.target.value
                    )
                  }
                  className="border w-full p-2 my-1"
                  placeholder="問題文"
                />

                <input
                  type="text"
                  value={q.answer}
                  onChange={(e) =>
                    handleQuestionChange(
                      id,
                      "answer",
                      e.target.value
                    )
                  }
                  className="border w-full p-2 my-1"
                  placeholder="正解"
                />
              </div>
            )
          )}

          <button
            onClick={saveAllQuestions}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            すべて保存
          </button>
        </div>
      </div>
    </div>
  );
}