"use client";

import styles from './page.module.css';

export default function Home() {

  const openAdminAndScreen1 = () => {
    // adminページを新しいタブで開く
    window.open("/admin", "_blank");
  };
  const openAdminAndScreen2 = () => {
    // screenページを新しいタブで開く
    window.open("/screen", "_blank");
  };
  return (
    <>
       <>
        <main className={styles.main}>
          <div className={styles.topscreen}>
            <button
              onClick={openAdminAndScreen1}
              className={styles.startButton}
            >
              管理画面を開く
            </button>
            <button
              onClick={openAdminAndScreen2}
              className={styles.startButton}
            >
              スクリーンを開く
            </button>
          </div>
        </main>
      </>
    </>
  );
}