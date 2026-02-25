"use client";
import Image from "next/image";
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div>
      <h1 className={styles.title}>
        クイズ大会
      </h1>
      <Image
        src="/QR.png"
        alt="QR"
        width={300}
        height={300}
      />
      </div>
    </main>
  );
}