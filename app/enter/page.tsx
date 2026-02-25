"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";

export default function EnterPage() {
  const [inputPassword, setInputPassword] = useState("");
  const router = useRouter();

  const checkPassword = async () => {
    const snapshot = await get(ref(db, "settings/access/password"));

    if (!snapshot.exists()) {
      alert("パスワード設定がありません");
      return;
    }

    const correctPassword = snapshot.val();

    if (inputPassword === correctPassword) {
      sessionStorage.setItem("auth", "ok");
      router.push("/player");
    } else {
      alert("パスワードが違います");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-xl font-bold">パスワード入力</h1>

      <input
        type="password"
        value={inputPassword}
        onChange={(e) => setInputPassword(e.target.value)}
        className="border p-2"
      />

      <button
        onClick={checkPassword}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        入室
      </button>
    </main>
  );
}