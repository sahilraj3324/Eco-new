import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAy0Yj6yW8cCsXEAcYafUrTn8Bmh-4llLs",
    authDomain: "senior-5c96a.firebaseapp.com",
    databaseURL: "https://senior-5c96a-default-rtdb.firebaseio.com",
    projectId: "senior-5c96a",
    storageBucket: "senior-5c96a.appspot.com",
    messagingSenderId: "652023010346",
    appId: "1:652023010346:web:fe74365dc105558c155f53",
    measurementId: "G-K75ZVNQTQ6"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };