"use client";

import styles from './page.module.css';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ref, get, set, push, child  } from "firebase/database";
import { db } from "@/lib/firebase";

export default function EnterPage() {
  const [inputPassword, setInputPassword] = useState("");
  const [inputName, setInputName] = useState("");
  const router = useRouter();

  const checkPassword = async () => {
    const trimmedName = inputName.trim();
    if (!trimmedName) {
      alert("名前を入力してください。\nスクリーンを確認して、同じ名前の人がいる場合は\n避けてください。");
      return;
    }

    // 🔥 追加：同じ名前チェック
    const usersSnapshot = await get(ref(db, "inputName"));

    if (usersSnapshot.exists()) {
      const users = usersSnapshot.val();

      if (users[trimmedName]) {
        alert("その名前はすでに使われています。\n別の名前にしてください。");
        return;
      }
    }

    const snapshot = await get(ref(db, "settings/access/password"));

    if (!snapshot.exists()) {
      alert("パスワード設定がありません");
      return;
    }

    const correctPassword = snapshot.val();

    if (inputPassword === correctPassword) {
      // 🔥 ここを追加
      const newUserRef = push(ref(db, "inputName"));
      await set(newUserRef, {
        name: inputName.trim(),
      });
      sessionStorage.setItem("auth", "ok");
      sessionStorage.setItem("playerName", inputName.trim());
      router.push("/player");
    } else {
      alert("パスワードが違います");
    }
  };

  return (
    <>
        <>
            <main className={styles.main}>
                <div className={styles.enter}>
                    <div className={styles.text}>入室認証</div>

                    <input
                        type="text"
                        placeholder="名前"
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        className={styles.cp_iptxt}
                    />

                    <input
                        type="password"
                        placeholder="パスワード"
                        value={inputPassword}
                        onChange={(e) => setInputPassword(e.target.value)}
                        className={styles.cp_iptxt}
                    />

                    <button
                        onClick={checkPassword}
                        className={styles.btn}
                    >
                        入室
                    </button>
                </div>
            </main>
        </>
    </>
  );
}