import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Flex,
  Spacer,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getTodayQuestion } from "../utils/questionBank";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

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
      } else {
        navigate("/login");
      }
    });

    getTodayQuestion().then(setQuestion);

    return () => unsubscribe();
  }, [navigate, today]);

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

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <Box p={6}>
      <Flex align="center" mb={4}>
        <Heading>Daily Journal</Heading>
        <Spacer />
        {user && (
          <Menu>
            <MenuList>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        )}
      </Flex>

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
