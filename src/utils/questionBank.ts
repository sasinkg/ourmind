
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";

// Fetch all questions from Firestore, then pick one for today
export async function getTodayQuestion(): Promise<string> {
  const q = query(collection(db, "questionBank"), orderBy("createdAt"));
  const snapshot = await getDocs(q);
  const questions = snapshot.docs.map((doc) => doc.data().text);

  if (questions.length === 0) return "No question available today.";

  const today = new Date();
  const index = today.getDate() % questions.length;
  return questions[index];
}
