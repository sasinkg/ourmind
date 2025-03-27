
import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getTodayQuestion } from "../utils/questionBank";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const toast = useToast();

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const docId = `${firebaseUser.uid}_${today}`;
        const docRef = doc(db, "answers", docId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setHasSubmitted(true);
        }
      }
    });

    getTodayQuestion().then(setQuestion);

    return () => unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (!user || !answer.trim()) return;

    const docId = `${user.uid}_${today}`;
    const docRef = doc(db, "answers", docId);

    await setDoc(docRef, {
      userId: user.uid,
      date: today,
      question,
      answer,
    });

    toast({
      title: "Answer submitted!",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    setHasSubmitted(true);
  };

  if (!user) {
    return (
      <Box p={8} textAlign="center">
        <Heading mb={4}>Welcome to OurMind</Heading>
        <Text mb={6}>Please sign in to start journaling.</Text>
        <Button onClick={() => window.location.href = "/login"}>
          Go to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Heading mb={4}>Daily Journal</Heading>
      <Text fontSize="lg" mb={4}>{question}</Text>

      {hasSubmitted ? (
        <Text>You’ve already submitted your answer for today. Come back tomorrow!</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          <Input
            placeholder="Write your answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <Button colorScheme="teal" onClick={handleSubmit}>
            Submit Answer
          </Button>
        </VStack>
      )}
    </Box>
  );
}