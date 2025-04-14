
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
  Text,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";
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
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";

const pastelColors = [
  "#6B8AD7", "#BE95DC", "#EFA2D2", "#FCB5B5", "#F9C6AB", "#F8E3BC"
];
const pastelLightOverrides: Record<string, string> = {
  "#6B8AD7": "#5a77bd", "#BE95DC": "#a177c3", "#EFA2D2": "#db7fb9",
  "#FCB5B5": "#e29898", "#F9C6AB": "#e3aa8f", "#F8E3BC": "#e7d1a9",
};

function generate4DigitCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export default function Groups() {
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isJoinOpen,
    onOpen: onJoinOpen,
    onClose: onJoinClose,
  } = useDisclosure();
  const {
    isOpen: isInfoOpen,
    onOpen: openInfoModal,
    onClose: closeInfoModal,
  } = useDisclosure();

  const [groupName, setGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const q = query(
          collection(db, "groups"),
          where("members", "array-contains", firebaseUser.uid),
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

    const code = generate4DigitCode();

    const newGroup = {
      name: groupName.trim(),
      color,
      code,
      ownerId: user.uid,
      members: [user.uid],
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "groups"), newGroup);
    setGroups([...groups, { ...newGroup, id: docRef.id }]);
    setGroupName("");
    onClose();

    toast({
      title: "Group Created",
      description: `Your group code is ${code}`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim() || !user) return;

    const q = query(collection(db, "groups"), where("code", "==", joinCode.trim()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      toast({
        title: "Invalid Code",
        description: "No group found with that code.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const groupDoc = snapshot.docs[0];
    const groupData = groupDoc.data();

    if (groupData.members?.includes(user.uid)) {
      toast({
        title: "Already a Member",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    await updateDoc(groupDoc.ref, {
      members: [...(groupData.members || []), user.uid],
    });

    setGroups([...groups, { ...groupData, id: groupDoc.id }]);
    toast({
      title: "Joined Group",
      description: `You joined "${groupData.name}"`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    onJoinClose();
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
                position="relative"
              >
                <IconButton
                  icon={<InfoIcon />}
                  aria-label="Group Info"
                  size="sm"
                  variant="ghost"
                  position="absolute"
                  top={2}
                  right={2}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGroup(group);
                    openInfoModal();
                  }}
                />
                <Heading fontSize="lg" color="black" textAlign="left">
                  {group.name}
                </Heading>
              </Box>
            );
          })}
          <Button colorScheme="teal" onClick={onOpen}>
            + Create Group
          </Button>
          <Button variant="outline" onClick={onJoinOpen}>
            Join Group with Code
          </Button>
        </VStack>
      )}

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

      <Modal isOpen={isJoinOpen} onClose={onJoinClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Join a group</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Enter 4-digit group code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              maxLength={4}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleJoinGroup}>
              Join
            </Button>
            <Button onClick={onJoinClose} variant="ghost">
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isInfoOpen} onClose={closeInfoModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Group Info</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedGroup && (
              <>
                <Text><strong>Name:</strong> {selectedGroup.name}</Text>
                <Text><strong>Code:</strong> {selectedGroup.code}</Text>
                <Text mt={2}><strong>Members:</strong></Text>
                {selectedGroup.members?.map((m: string, i: number) => (
                  <Text key={i} fontSize="sm" ml={2}>• {m}</Text>
                ))}
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}