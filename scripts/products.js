import { db } from "./firebase-config.js";
import {
  ref,
  set,
  push,
  get,
  onValue,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { validateProduct } from "../utils/validation.js";
import { createElement, clearElement } from "../utils/dom.js";

