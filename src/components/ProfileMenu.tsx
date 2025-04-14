import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Button,
  Text,
  VStack,
  Input,
  useToast,
} from "@chakra-ui/react";
import { signOut } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function ProfileMenu({ user }: { user: any }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [preferredName, setPreferredName] = useState("");
  const [inputName, setInputName] = useState("");

  // Load user's preferred name
  useEffect(() => {
    const loadPreferredName = async () => {
      if (!user) return;
      const docRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.preferredName) {
          setPreferredName(data.preferredName);
          setInputName(data.preferredName);
        }
      }
    };
    loadPreferredName();
  }, [user]);

  const handleSave = async () => {
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, { preferredName: inputName }, { merge: true });
      setPreferredName(inputName);
      toast({ title: "Name updated!", status: "success", duration: 2000 });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, status: "error" });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <Menu>
      <MenuButton as={Button} variant="ghost" p={0} _hover={{ bg: "transparent" }}>
        <Avatar size="sm" name={preferredName || user.displayName || user.email} />
      </MenuButton>
      <MenuList p={3}>
        <VStack align="start" spacing={3}>
          <Text fontWeight="bold">{preferredName || user.displayName || "No Name"}</Text>
          <Text fontSize="sm" color="gray.500">{user.email}</Text>

          <Input
            placeholder="Enter nickname"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            size="sm"
          />
          <Button size="sm" colorScheme="teal" onClick={handleSave}>
            Save Nickname
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </VStack>
      </MenuList>
    </Menu>
  );
}
