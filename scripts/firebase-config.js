import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCHd4O_PIujq1fxjoP9_Tc3faV-EJsyVh4",
  authDomain: "e-commerce-102e6.firebaseapp.com",
  databaseURL: "https://e-commerce-102e6-default-rtdb.firebaseio.com",
  projectId: "e-commerce-102e6",
  storageBucket: "e-commerce-102e6.appspot.com",
  messagingSenderId: "102081327353",
  appId: "1:102081327353:web:7110346a5d3b598064b228",
  measurementId: "G-5YTV0FS0CQ",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
