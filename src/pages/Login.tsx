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
  import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
  } from "firebase/auth";
  import { auth } from "../lib/firebase";
  import { useNavigate } from "react-router-dom";
  
  export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();
  
    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) navigate("/home");
      });
      return () => unsubscribe();
    }, [navigate]);
  
    const handleEmailAuth = async () => {
      try {
        if (isCreatingAccount) {
          await createUserWithEmailAndPassword(auth, email, password);
          toast({ title: "Account created!", status: "success" });
        } else {
          await signInWithEmailAndPassword(auth, email, password);
          toast({ title: "Signed in!", status: "success" });
        }
        navigate("/home");
      } catch (error: any) {
        toast({ title: "Error", description: error.message, status: "error" });
      }
    };
  
    const handleGoogleSignIn = async () => {
      try {
        await signInWithPopup(auth, new GoogleAuthProvider());
        navigate("/home");
      } catch (error: any) {
        toast({ title: "Error", description: error.message, status: "error" });
      }
    };
  
    return (
      <Box maxW="md" mx="auto" mt={10} p={6} borderWidth={1} borderRadius="lg">
        <Heading mb={4}>Sign {isCreatingAccount ? "Up" : "In"}</Heading>
        <VStack spacing={4} align="stretch">
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button colorScheme="teal" onClick={handleEmailAuth}>
            {isCreatingAccount ? "Create Account" : "Login"}
          </Button>
          <Button onClick={handleGoogleSignIn}>Continue with Google</Button>
          <Text
            textAlign="center"
            mt={2}
            fontSize="sm"
            color="gray.500"
            cursor="pointer"
            onClick={() => setIsCreatingAccount((prev) => !prev)}
          >
            {isCreatingAccount
              ? "Already have an account? Log in"
              : "Don't have an account? Create one"}
          </Text>
        </VStack>
      </Box>
    );
  }