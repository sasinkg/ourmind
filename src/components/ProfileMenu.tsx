
import {
    Avatar,
    Box,
    Button,
    Divider,
    HStack,
    Input,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Spinner,
    Text,
    VStack,
    useToast,
  } from "@chakra-ui/react";
  import { ChevronDownIcon } from "@chakra-ui/icons";
  import { useAuthState } from "react-firebase-hooks/auth";
  import { auth, db } from "../lib/firebase";
  import { doc, getDoc, setDoc } from "firebase/firestore";
  import { useEffect, useState } from "react";
  
  export default function ProfileMenu() {
    const [user] = useAuthState(auth);
    const [preferredName, setPreferredName] = useState("");
    const [loading, setLoading] = useState(true);
    const [tempName, setTempName] = useState("");
    const toast = useToast();
  
    useEffect(() => {
      const fetchPreferredName = async () => {
        if (user) {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setPreferredName(docSnap.data().preferredName || "");
          }
          setLoading(false);
        }
      };
      fetchPreferredName();
    }, [user]);
  
    const savePreferredName = async () => {
      if (!user) return;
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, { preferredName: tempName }, { merge: true });
      setPreferredName(tempName);
      toast({
        title: "Name updated",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    };
  
    if (!user || loading) return <Spinner size="sm" />;
  
    return (
      <Menu>
        <MenuButton
        as={Button}
        variant="ghost"
        rightIcon={<ChevronDownIcon />}
        _hover={{ bg: "gray.100" }}
        _active={{ bg: "gray.200" }}
        >
        <HStack spacing={2}>
            <Avatar size="sm" name={preferredName || user.displayName || user.email || ""} src={user.photoURL || ""} />
            <Text fontSize="sm">{preferredName || user.displayName || user.email}</Text>
        </HStack>
        </MenuButton>

        <MenuList>
          <VStack align="start" px={4} py={2}>
            <Text fontWeight="bold">
              {preferredName || user.displayName || "Unnamed"}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {user.email}
            </Text>
          </VStack>
          <Divider />
          <Box px={4} py={2}>
            <Input
              size="sm"
              placeholder="Preferred name"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
            />
            <Button size="sm" mt={2} colorScheme="teal" onClick={savePreferredName}>
              Save Name
            </Button>
          </Box>
        </MenuList>
      </Menu>
    );
  }