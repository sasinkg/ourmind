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
  Checkbox,
  CheckboxGroup,
  Stack,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { getTodayQuestion } from "../utils/questionBank";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const toast = useToast();
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        const groupSnap = await getDocs(collection(db, "groups"));
        const userGroups = groupSnap.docs.filter((g) => {
          const members = g.data().members || [];
          return members.includes(firebaseUser.uid);
        });
        setGroups(userGroups.map((g) => ({ id: g.id, name: g.data().name })));

        const docId = `${firebaseUser.uid}_${today}`;
        const docRef = doc(db, "answers", docId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setHasSubmitted(true);
          setAnswer(snapshot.data().answer);
          setSelectedGroupIds(snapshot.data().groupIds || []);
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
      const payload: any = {
        userId: user.uid,
        date: today,
        question,
        answer,
        groupIds: selectedGroupIds || [],
      };

      if (selectedGroupIds.length > 0) {
        payload.groupIds = selectedGroupIds;
      } else {
        payload.groupIds = [];
      }

      await setDoc(docRef, payload, { merge: true });

      toast({
        title: hasSubmitted ? "Answer updated!" : "Answer submitted!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setHasSubmitted(true);
      setIsEditing(false);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message,
        status: "error",
      });
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
            <MenuButton>
              <Avatar name={user.email || "User"} size="sm" />
            </MenuButton>
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

            {groups.length > 0 && (
              <>
                <Text fontWeight="bold" mt={4}>Update groups to post to:</Text>
                <CheckboxGroup
                  value={selectedGroupIds}
                  onChange={(values) => setSelectedGroupIds(values as string[])}
                >
                  <Stack spacing={2}>
                    {groups.map((group) => (
                      <Checkbox key={group.id} value={group.id}>
                        {group.name}
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </>
            )}

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
          <Box
            p={4}
            bg="gray.700"
            borderRadius="md"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
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
        )
      ) : (
        <VStack spacing={4} align="stretch">
          <Input
            placeholder="Write your answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />

          {groups.length > 0 && (
            <>
              <Text fontWeight="bold">Post to Groups:</Text>
              <CheckboxGroup
                value={selectedGroupIds}
                onChange={(values) => setSelectedGroupIds(values as string[])}
              >
                <Stack spacing={2}>
                  {groups.map((group) => (
                    <Checkbox key={group.id} value={group.id}>
                      {group.name}
                    </Checkbox>
                  ))}
                </Stack>
              </CheckboxGroup>
            </>
          )}

          <Button colorScheme="teal" onClick={handleSubmit}>
            Submit Answer
          </Button>
        </VStack>
      )}
    </Box>
  );
}
