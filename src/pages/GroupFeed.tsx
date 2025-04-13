import {
  Box,
  Heading,
  Text,
  VStack,
  Badge,
  Spinner,
  useToast,
  useColorModeValue,
  Tooltip,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  query,
  collection,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import PageWrapper from "../components/PageWrapper";
import { getTodayQuestion } from "../utils/questionBank";

interface GroupAnswer {
  userId: string;
  answer: string;
  likes?: number;
  dislikes?: number;
  likedBy?: string[];
  dislikedBy?: string[];
}

export default function GroupFeed() {
  const { groupId } = useParams();
  const [groupName, setGroupName] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [groupAnswers, setGroupAnswers] = useState<GroupAnswer[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});

  const toast = useToast();
  const today = new Date().toISOString().split("T")[0];

  const cardBg = useColorModeValue("gray.100", "gray.800");
  const yourAnswerBg = useColorModeValue("gray.300", "gray.700");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && groupId) {
        setUser(firebaseUser);

        const groupRef = doc(db, "groups", groupId);
        const groupSnap = await getDoc(groupRef);
        if (groupSnap.exists()) {
          const groupData = groupSnap.data();
          setGroupName(groupData.name);
        }

        const q = await getTodayQuestion();
        setQuestion(q);

        const docId = `${firebaseUser.uid}_${today}`;
        const answerRef = doc(db, "answers", docId);
        const answerSnap = await getDoc(answerRef);
        if (answerSnap.exists()) {
          setUserAnswer(answerSnap.data().answer);
        }

        const answersQuery = query(
          collection(db, "answers"),
          where("groupIds", "array-contains", groupId),
          where("date", "==", today)
        );
        const snapshot = await getDocs(answersQuery);
        const fetchedAnswers = snapshot.docs.map(doc => doc.data() as GroupAnswer);
        setGroupAnswers(fetchedAnswers);

        const userIds = new Set<string>();
        for (const ans of fetchedAnswers) {
          userIds.add(ans.userId);
          ans.likedBy?.forEach(uid => userIds.add(uid));
          ans.dislikedBy?.forEach(uid => userIds.add(uid));
        }

        const nameMap: Record<string, string> = {};
        for (const uid of Array.from(userIds)) {
          const userRef = doc(db, "users", uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            nameMap[uid] = data.preferredName || data.email || uid;
          } else {
            nameMap[uid] = uid;
          }
        }        
        setNames(nameMap);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId]);

  const handleReaction = async (entry: GroupAnswer, type: "like" | "dislike") => {
    if (!user) return;
  
    const docId = `${entry.userId}_${today}`;
    const answerRef = doc(db, "answers", docId);
  
    const field = type === "like" ? "likedBy" : "dislikedBy";
    const oppositeField = type === "like" ? "dislikedBy" : "likedBy";
  
    const hasReacted = entry[field]?.includes(user.uid);
    const updates: any = {};
  
    if (hasReacted) {
      // User already liked/disliked → remove
      updates[field] = arrayRemove(user.uid);
    } else {
      // User hasn't → add and remove from opposite if needed
      updates[field] = arrayUnion(user.uid);
      updates[oppositeField] = arrayRemove(user.uid);
    }
  
    await updateDoc(answerRef, updates);
  
    toast({
      title: hasReacted
        ? `Removed your ${type}`
        : `You ${type === "like" ? "liked" : "disliked"} this answer.`,
      status: type === "like" ? "success" : "warning",
      duration: 2000,
      isClosable: true,
    });
  
    const snapshot = await getDocs(
      query(
        collection(db, "answers"),
        where("groupIds", "array-contains", groupId),
        where("date", "==", today)
      )
    );
    const updatedAnswers = snapshot.docs.map((doc) => doc.data() as GroupAnswer);
    setGroupAnswers(updatedAnswers);
  };
  

  return (
    <PageWrapper>
      {loading ? (
        <Spinner size="xl" />
      ) : (
        <Box p={6}>
          <Heading mb={4}>{groupName || "Group"}</Heading>
          <Text fontSize="lg" mb={4}>{question}</Text>

          {userAnswer && (
            <Box p={4} mb={6} bg={yourAnswerBg} color={textColor} borderRadius="lg">
              <Text fontWeight="bold" mb={2}>Your Answer:</Text>
              <Text>{userAnswer}</Text>
            </Box>
          )}

          <VStack spacing={4} align="stretch">
            {groupAnswers.map((entry, idx) => (
              <Box
                key={idx}
                bg={cardBg}
                color={textColor}
                p={4}
                borderRadius="xl"
              >
                <Text fontWeight="bold">{names[entry.userId]}</Text>
                <Text mb={2}>{entry.answer}</Text>
                <Box display="flex" gap={3}>
                  <Tooltip
                    label={`Liked by: ${entry.likedBy?.map(id => names[id] || id).join(", ") || "No one yet"}`}
                    hasArrow
                  >
                    <Badge
                      colorScheme="green"
                      cursor="pointer"
                      onClick={() => handleReaction(entry, "like")}
                    >
                      👍 {entry.likedBy?.length ?? 0}
                    </Badge>
                  </Tooltip>

                  <Tooltip
                    label={`Disliked by: ${entry.dislikedBy?.map(id => names[id] || id).join(", ") || "No one yet"}`}
                    hasArrow
                  >
                    <Badge
                      colorScheme="red"
                      cursor="pointer"
                      onClick={() => handleReaction(entry, "dislike")}
                    >
                      👎 {entry.dislikedBy?.length ?? 0}
                    </Badge>
                  </Tooltip>
                </Box>
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </PageWrapper>
  );
}
