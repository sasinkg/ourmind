import {
    Box,
    Heading,
    VStack,
    Button,
    useColorMode,
    useDisclosure,
    Input,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Spinner,
  } from "@chakra-ui/react";
  import { useNavigate } from "react-router-dom";
  import { useState, useEffect } from "react";
  import { db } from "../lib/firebase";
  import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    where,
    serverTimestamp,
  } from "firebase/firestore";
  import { onAuthStateChanged, User } from "firebase/auth";
  import { auth } from "../lib/firebase";
  
  // 🎨 Color palette
  const pastelColors = [
    "#6B8AD7", "#BE95DC", "#EFA2D2", "#FCB5B5", "#F9C6AB", "#F8E3BC"
  ];
  const pastelLightOverrides: Record<string, string> = {
    "#6B8AD7": "#5a77bd", "#BE95DC": "#a177c3", "#EFA2D2": "#db7fb9",
    "#FCB5B5": "#e29898", "#F9C6AB": "#e3aa8f", "#F8E3BC": "#e7d1a9",
  };
  
  export default function Groups() {
    const navigate = useNavigate();
    const { colorMode } = useColorMode();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupName, setGroupName] = useState("");
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          const q = query(
            collection(db, "groups"),
            where("ownerId", "==", firebaseUser.uid),
            orderBy("createdAt")
          );
          const snapshot = await getDocs(q);
          const fetchedGroups = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setGroups(fetchedGroups);
        }
        setLoading(false);
      });
  
      return () => unsubscribe();
    }, []);
  
    const usedColors = groups.map((g) => g.color);
    const remainingColors = pastelColors.filter((c) => !usedColors.includes(c));
  
    const handleCreateGroup = async () => {
      if (!groupName.trim() || !user) return;
  
      const color =
        remainingColors.length > 0
          ? remainingColors[Math.floor(Math.random() * remainingColors.length)]
          : pastelColors[Math.floor(Math.random() * pastelColors.length)];
  
      const newGroup = {
        name: groupName.trim(),
        color,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      };
  
      const docRef = await addDoc(collection(db, "groups"), newGroup);
      setGroups([...groups, { ...newGroup, id: docRef.id }]);
      setGroupName("");
      onClose();
    };
  
    return (
      <Box p={6}>
        <Heading mb={6}>Your Groups</Heading>
  
        {loading ? (
          <Spinner size="xl" />
        ) : (
          <VStack spacing={4}>
            {groups.map((group) => {
              const bgColor =
                colorMode === "light"
                  ? pastelLightOverrides[group.color] ?? group.color
                  : group.color;
  
              return (
                <Box
                  key={group.id}
                  onClick={() => navigate(`/groups/${group.id}`)}
                  bg={bgColor}
                  p={5}
                  w="100%"
                  borderRadius="xl"
                  cursor="pointer"
                  transition="all 0.2s ease"
                  _hover={{ opacity: 0.9 }}
                  boxShadow="md"
                >
                  <Heading fontSize="lg" color="black" textAlign="left">
                    {group.name}
                  </Heading>
                </Box>
              );
            })}
            <Button colorScheme="teal" onClick={onOpen}>
              + Create Group
            </Button>
          </VStack>
        )}
  
        {/* Modal */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create a new group</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="teal" mr={3} onClick={handleCreateGroup}>
                Create
              </Button>
              <Button onClick={onClose} variant="ghost">
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    );
  }