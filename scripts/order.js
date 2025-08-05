import { db } from "./firebase-config.js";
import {
  ref,
  push,
  onValue,
  get,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { createElement, clearElement } from "../utils/dom.js";

const user = JSON.parse(localStorage.getItem("user"));
const ordersList = document.getElementById("ordersList");


