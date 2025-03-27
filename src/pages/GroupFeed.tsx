
import {
  Box,
  Heading,
  Text,
  VStack,
  Badge,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import PageWrapper from "../components/PageWrapper";
import { getTodayQuestion } from "../utils/questionBank";

const mockAnswers = [
  { name: "Alex", answer: "Seeing my dog run around", likes: 12, dislikes: 1 },
  { name: "Jamie", answer: "Finished a great book", likes: 9, dislikes: 0 },
  { name: "Sam", answer: "A really kind compliment today", likes: 15, dislikes: 2 },
];

export default function GroupFeed() {
  const { groupId } = useParams();
  const [groupName, setGroupName] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState<string | null>(null);

  const toast = useToast();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && groupId) {
        setUser(firebaseUser);
        const groupRef = doc(db, "groups", groupId);
        const groupSnap = await getDoc(groupRef);

        if (groupSnap.exists()) {
          const groupData = groupSnap.data();
          setGroupName(groupData.name);

          if (!groupData.members?.includes(firebaseUser.uid)) {
            await updateDoc(groupRef, {
              members: arrayUnion(firebaseUser.uid),
            });

            toast({
              title: "Joined group!",
              description: `You've been added to ${groupData.name}`,
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          }
        }

        const q = await getTodayQuestion();
        setQuestion(q);

        // Fetch user's answer
        const docId = firebaseUser.uid + "_" + today;
        const answerRef = doc(db, "answers", docId);
        const answerSnap = await getDoc(answerRef);
        if (answerSnap.exists()) {
          setUserAnswer(answerSnap.data().answer);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId]);

  return (
    <PageWrapper>
      {loading ? (
        <Spinner size="xl" />
      ) : (
        <Box p={6}>
          <Heading mb={4}>{groupName || "Group"}</Heading>
          <Text fontSize="lg" mb={4}>{question}</Text>

          {userAnswer && (
            <Box p={4} mb={6} bg="gray.700" borderRadius="lg">
              <Text fontWeight="bold" mb={2}>Your Answer:</Text>
              <Text>{userAnswer}</Text>
            </Box>
          )}

          <VStack spacing={4} align="stretch">
            {mockAnswers.map((entry, idx) => (
              <Box
                key={idx}
                bg="gray.800"
                color="whiteAlpha.900"
                p={4}
                borderRadius="xl"
                _dark={{ bg: "gray.800", color: "whiteAlpha.900" }}
              >
                <Text fontWeight="bold">{entry.name}</Text>
                <Text mb={2}>{entry.answer}</Text>
                <Badge colorScheme="green" mr={2}>👍 {entry.likes}</Badge>
                <Badge colorScheme="red">👎 {entry.dislikes}</Badge>
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </PageWrapper>
  );
}