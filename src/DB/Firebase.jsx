// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAOUYry_kG-YWaISa3WBVt-eR60gs8g-bc",
  authDomain: "duniyamart-e69a1.firebaseapp.com",
  databaseURL: "https://duniyamart-e69a1-default-rtdb.firebaseio.com",
  projectId: "duniyamart-e69a1",
  storageBucket: "duniyamart-e69a1.appspot.com",
  messagingSenderId: "600233576888",
  appId: "1:600233576888:web:0df9413be16d57aa3fe74d",
  measurementId: "G-TN4EMCVRS0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database=getDatabase(app)
export { database };