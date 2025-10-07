// lib/videoDB.js
const DB_NAME = "VideoDB";
const STORE_NAME = "videos";
const DB_VERSION = 2;
const AudioLectureStore="audiolecture";
export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" }); 
      }

      if(!db.objectStoreNames.contains(AudioLectureStore)){
        db.createObjectStore(AudioLectureStore,{keyPath:"id"});
      }
    };
      
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function addVideo(video) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(video); // put = add or update by id
    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function getAllVideos() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}


// add audio lecture
export async function addLecture(lecture) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(AudioLectureStore, "readwrite");
    const store = tx.objectStore(AudioLectureStore);
    const request = store.put(lecture);
    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function getLectureById(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(AudioLectureStore, "readonly");
    const store = tx.objectStore(AudioLectureStore);
    const request = store.get(id);
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function getAllLectures() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(AudioLectureStore, "readonly");
    const store = tx.objectStore(AudioLectureStore);
    const request = store.getAll();

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}
