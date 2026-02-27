"use client";

import styles from './page.module.css';

export default function Home() {

  const openAdminAndScreen = () => {
    // adminページを新しいタブで開く
    window.open("/admin", "_blank");

    // screenページを新しいタブで開く
    window.open("/screen", "_blank");
  };

  return (
    <>
       <>
        <main className={styles.main}>
          <div className={styles.topscreen}>
            <button
              onClick={openAdminAndScreen}
              className={styles.startButton}
            >
              管理画面とスクリーンを開く
            </button>
          </div>
        </main>
      </>
    </>
  );
}