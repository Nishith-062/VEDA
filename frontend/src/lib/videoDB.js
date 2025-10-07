// lib/videoDB.js
const DB_NAME = "VideoDB";
const STORE_NAME = "videos";
const AudioLectureStore = "audiolecture";
const DB_VERSION = 2;

/* ---------- Open DB with Auto-Recovery ---------- */
export async function openDB() {
  return new Promise((resolve, reject) => {
    let request;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (err) {
      console.error("❌ IndexedDB open() threw an exception:", err);
      indexedDB.deleteDatabase(DB_NAME);
      return reject(err);
    }

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      console.log("🔧 Upgrading/Initializing IndexedDB schema...");

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(AudioLectureStore)) {
        db.createObjectStore(AudioLectureStore, { keyPath: "id" });
      }
    };

    request.onsuccess = (e) => {
      console.log("✅ IndexedDB opened successfully");
      resolve(e.target.result);
    };

    request.onerror = async (e) => {
      console.error("⚠️ IndexedDB open failed:", e.target.error);

      // Attempt to delete corrupted DB and retry once
      try {
        console.warn("🧹 Attempting recovery: deleting corrupted database...");
        await new Promise((res) => {
          const del = indexedDB.deleteDatabase(DB_NAME);
          del.onsuccess = del.onerror = del.onblocked = res;
        });

        console.info("♻️ Retrying to open new clean database...");
        const retryReq = indexedDB.open(DB_NAME, DB_VERSION);
        retryReq.onupgradeneeded = request.onupgradeneeded;
        retryReq.onsuccess = (ev) => resolve(ev.target.result);
        retryReq.onerror = (ev) => reject(ev.target.error);
      } catch (err) {
        reject(err);
      }
    };
  });
}

/* ---------- Helper: Generic Transaction Runner ---------- */
async function runTransaction(storeName, mode, operation) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);

    const request = operation(store);

    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => {
      console.error(`❌ Transaction failed for ${storeName}:`, e.target.error);
      reject(e.target.error);
    };
  });
}

/* ---------- Optional: Check storage usage before large saves ---------- */
export async function checkStorageQuota() {
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const { quota, usage } = await navigator.storage.estimate();
      const percent = ((usage / quota) * 100).toFixed(2);
      console.log(`💾 Storage usage: ${percent}% (${usage} / ${quota} bytes)`);

      if (percent > 90) {
        alert("⚠️ Storage almost full — please delete some downloads to continue.");
        return false;
      }
    } catch (err) {
      console.warn("Unable to check storage quota:", err);
    }
  }
  return true;
}

/* ---------- Video Functions ---------- */
export async function addVideo(video) {
  if (!(await checkStorageQuota())) return false;
  return runTransaction(STORE_NAME, "readwrite", (store) => store.put(video));
}

export async function getAllVideos() {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e.target.error);
    } catch (err) {
      reject(err);
    }
  });
}

/* ---------- Audio Lecture Functions ---------- */
export async function addLecture(lecture) {
  if (!(await checkStorageQuota())) return false;
  return runTransaction(AudioLectureStore, "readwrite", (store) => store.put(lecture));
}

export async function getLectureById(id) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const tx = db.transaction(AudioLectureStore, "readonly");
      const store = tx.objectStore(AudioLectureStore);
      const request = store.get(id);
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e.target.error);
    } catch (err) {
      reject(err);
    }
  });
}

export async function getAllLectures() {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const tx = db.transaction(AudioLectureStore, "readonly");
      const store = tx.objectStore(AudioLectureStore);
      const request = store.getAll();
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e.target.error);
    } catch (err) {
      reject(err);
    }
  });
}
