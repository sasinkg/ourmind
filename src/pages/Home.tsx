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
import { FaEdit } from "react-icons/fa";
import { IconButton } from "@chakra-ui/react";
import { HStack } from "@chakra-ui/react";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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
          setAnswer(snapshot.data().answer); // show submitted answer
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
  
    try {
      await setDoc(docRef, {
        userId: user.uid,
        date: today,
        question,
        answer,
      }, { merge: true }); // ✅ merge ensures it updates instead of overwrites
  
      toast({
        title: "Answer updated!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
  
      setHasSubmitted(true);
      setIsEditing(false);
    } catch (e) {
    }
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
        isEditing ? (
          <>
            <Input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Edit your answer..."
            />
          <HStack spacing={4} mt={4}>
            <Button colorScheme="teal" onClick={handleSubmit}>
              Update Answer
            </Button>
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </HStack>
          </>
        ) : (
          <>
            <Box p={4} bg="gray.700" borderRadius="md" display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Text fontWeight="bold" mb={2}>Your Answer:</Text>
                <Text>{answer}</Text>
              </Box>
              <IconButton
                aria-label="Edit Answer"
                icon={<FaEdit />}
                onClick={() => setIsEditing(true)}
                variant="ghost"
                colorScheme="teal"
              />
            </Box>
          </>
        )
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
