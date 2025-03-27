import {
    Box,
    Button,
    Heading,
    Input,
    VStack,
    Text,
    useToast,
    Textarea,
    Spinner,
  } from "@chakra-ui/react";
  import { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import {
    auth,
    db,
    googleProvider,
  } from "../lib/firebase";
  import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    User,
  } from "firebase/auth";
  import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
  } from "firebase/firestore";
  
  const questionBank = [
    "What made you smile today?",
    "What's something you're grateful for?",
    "What moment from today do you want to remember?",
    "Did anything surprise you today?",
    "How did you take care of yourself today?",
    "What’s a small win you had today?",
  ];
  
  function getTodaysQuestion() {
    const today = new Date().toISOString().split("T")[0];
    const hash = today.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return questionBank[hash % questionBank.length];
  }
  
  export default function Home() {
    const [user, setUser] = useState<User | null>(null);
    const [answer, setAnswer] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const toast = useToast();
    const navigate = useNavigate();
  
    const question = getTodaysQuestion();
    const today = new Date().toISOString().split("T")[0];
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
  
          const docId = `${firebaseUser.uid}_${today}`;
          const docRef = doc(db, "answers", docId);
          const docSnap = await getDoc(docRef);
  
          if (docSnap.exists()) {
            setAnswer(docSnap.data().answer);
            setSubmitted(true);
          }
        }
        setLoading(false);
      });
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
        timestamp: serverTimestamp(),
      });
  
      toast({
        title: "Answer submitted!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
  
      setSubmitted(true);
    };
  
    const handleEmailAuth = async (isSignup: boolean) => {
      try {
        if (isSignup) {
          await createUserWithEmailAndPassword(auth, email, password);
        } else {
          await signInWithEmailAndPassword(auth, email, password);
        }
        toast({
          title: "Signed in successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (err: any) {
        toast({
          title: "Authentication Error",
          description: err.message,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    };
  
    const handleGoogleLogin = async () => {
      try {
        await signInWithPopup(auth, googleProvider);
        toast({
          title: "Signed in with Google.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (err: any) {
        toast({
          title: "Google sign-in failed.",
          description: err.message,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    };
  
    if (loading) return <Spinner size="xl" mt={20} />;
  
    if (!user) {
      return (
        <Box maxW="md" mx="auto" mt={20} p={6} borderWidth={1} borderRadius="lg">
          <Heading size="lg" mb={4} textAlign="center">Welcome to OurMind</Heading>
          <VStack spacing={4}>
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
            <Input
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />
            <Button colorScheme="teal" w="100%" onClick={() => handleEmailAuth(false)}>
              Sign In
            </Button>
            <Button variant="outline" w="100%" onClick={() => handleEmailAuth(true)}>
              Create Account
            </Button>
            <Text>or</Text>
            <Button colorScheme="red" w="100%" onClick={handleGoogleLogin}>
              Continue with Google
            </Button>
          </VStack>
        </Box>
      );
    }
  
    return (
      <Box maxW="lg" mx="auto" mt={20} p={6}>
        <Heading size="md" mb={4}>Today's Question</Heading>
        <Text fontSize="xl" mb={6} fontWeight="semibold">{question}</Text>
  
        {submitted ? (
          <Box>
            <Text mb={2}>Your answer:</Text>
            <Box p={4} bg="gray.100" _dark={{ bg: "gray.700" }} borderRadius="md">
              <Text>{answer}</Text>
            </Box>
          </Box>
        ) : (
          <VStack spacing={4}>
            <Textarea
              placeholder="Type your answer..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={5}
            />
            <Button colorScheme="teal" onClick={handleSubmit}>
              Submit Answer
            </Button>
          </VStack>
        )}
      </Box>
    );
  }
  