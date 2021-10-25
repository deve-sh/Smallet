import mainFirebase from "firebase/app";
import firebase from "./index";
import "firebase/firestore";

const db = firebase.firestore();

export default db;
export const firestore = mainFirebase.firestore;
