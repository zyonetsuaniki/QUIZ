"use client";

import Head from 'next/head';
import styles from './page.module.css';
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

type ScreenMode = "entry" | "question" | "ranking" | "final";

export default function ScreenPage() {
  const [screenMode, setScreenMode] = useState<ScreenMode>("question");
  const [currentQuestion, setCurrentQuestion] = useState<number>(1);
  const [question, setQuestion] = useState("");
  const [scores, setScores] = useState<any>({});
  const [roundScores, setRoundScores] = useState<any>({});
  const [users, setUsers] = useState<any>({});
  const [inputName, setInputName] = useState("");
  const [isClosed, setIsClosed] = useState(false);

  // 🔥 すべてフラットに監視
  useEffect(() => {
    onValue(ref(db, "screenMode"), (snap) => {
      setScreenMode(snap.val() || "question");
    });

    onValue(ref(db, "currentQuestion"), (snap) => {
      setCurrentQuestion(snap.val() || 1);
    });

    onValue(ref(db, "users"), (snap) => {
      setUsers(snap.val() || {});
    });

    onValue(ref(db, "scores"), (snap) => {
      setScores(snap.val() || {});
    });

    onValue(ref(db, "roundScores"), (snap) => {
      setRoundScores(snap.val() || {});
    });

    onValue(ref(db, "inputName"), (snap) => {
      setInputName(snap.val() || {});
    });

    onValue(ref(db, "isClosed"), (snap) => {
      setIsClosed(!!snap.val());
    });
  }, []);

  // 問題テキストは currentQuestion が変わったときだけ取得
  useEffect(() => {
    onValue(ref(db, `questions/${currentQuestion}`), (snap) => {
      setQuestion(snap.val()?.text || "");
    });
  }, [currentQuestion]);

  const sorted = Object.entries(scores).sort(
    (a: any, b: any) => b[1] - a[1]
  );

  return (
    <html  className={styles.html}>

      {screenMode === "entry" && (
        <EntryView inputName={inputName} />
      )}

      {screenMode === "question" && (
        <QuestionView
          number={currentQuestion}
          question={question}
          isClosed={isClosed}
        />
      )}

      {screenMode === "ranking" && (
        <RankingView
          sorted={sorted}
          users={users}
          roundScores={roundScores}
          currentQuestion={currentQuestion}
        />
      )}

      {screenMode === "final" && (
        <FinalView
          sorted={sorted}
          users={users}
        />
      )}

    </html>
  );
}


/* ===============================
   参加者確認画面
================================ */

function EntryView({ inputName }: any) {
  const userList = Object.values(inputName || {});

  return (
    <>

      <Head>
        <title>クイズ大会</title>
        <meta name="description" content="クイズ大会" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <body>

        {/* ===== メインエリア ===== */}
        <main className={styles.main}>

          {/* ===== 左：QR（1/3） ===== */}

          <div className={styles.body_left}>
            <p className={styles.text3}>
              参加者数：{userList.length}人
            </p>
            <img src="/QR.png" alt="QR" />

          </div>

          {/* ===== 右：参加者確認（2/3） ===== */}
          <div className={styles.body_right}>

            <div className={styles.text}>
              参加者確認
            </div>

            <div className={styles.text2}>
              {userList.map((u: any, index) => (
                <div
                  key={index}
                  className={styles.text2_1}
                >
                  {u.name}
                </div>
              ))}
            </div>
          </div>



        </main>
      </body>
    </>
  );
}

/* ===============================
   🟦 問題表示
================================ */

function QuestionView({
  number,
  question,
  isClosed,
}: any) {
  return (
    <>
       <body>
        <main className={styles.main}>
          <div className={styles.question}>
            <p className={styles.text4}>第{number}問</p>
            <br></br>
            <p className={styles.text5}>{question}</p>
            {isClosed && <p className={styles.text6}>回答締切</p>}          
          </div>
        </main>
      </body>
    </>
  );
}

/* ===============================
   🟨 ランキング表示
================================ */

function RankingView({
  sorted,
  users,
  roundScores,
  currentQuestion,
}: any) {
  return (
    <>
      <body>
        <main className={styles.main}>
          <div className={styles.text7}>🏆 現在の順位 🏆</div>
          <div className={styles.text8}>
            {sorted.map(([user, totalScore]: any, index: number) => (
              <div
                key={user}
                className={styles.text9}
              >
                <div className={styles.text10}>
                  {index + 1}位：{users?.[user]?.name ?? user}
                </div>

                <div className={styles.text11}>
                  今回：
                  {roundScores?.[currentQuestion]?.[user] ?? 0}
                  点　
                  総合：{totalScore}点
                </div>
              </div>
            ))}
          </div>
        </main>
      </body>
    </>
  );
}

/* ===============================
   🏆 最終結果表示
================================ */

function FinalView({ sorted, users }: any) {
  return (
    <>
      <body>
        <main className={styles.main}>
          <div className={styles.text7}>🏆 最終結果 🏆</div>

          <div className={styles.text8}>
            {sorted.map(([user, totalScore]: any, index: number) => (
              <div
                key={user}
                className={styles.text9}
              >
                <div className={styles.text10}>
                  {index + 1}位：{users?.[user]?.name ?? user}
                </div>
                <div className={styles.text11}>{totalScore}点</div>
              </div>
            ))}
          </div>
        </main>
      </body>
    </>
  );
}