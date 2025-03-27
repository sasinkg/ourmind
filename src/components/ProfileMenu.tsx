import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Button,
  Text,
  VStack,
} from "@chakra-ui/react";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useNavigate } from "react-router-dom";

export default function ProfileMenu({ user }: { user: any }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <Menu>
      <MenuButton as={Button} variant="ghost" p={0} _hover={{ bg: "transparent" }}>
        <Avatar size="sm" name={user.displayName || user.email} />
      </MenuButton>
      <MenuList>
        <VStack align="start" spacing={1} p={3}>
          <Text fontWeight="bold">{user.displayName || "No Name"}</Text>
          <Text fontSize="sm" color="gray.500">{user.email}</Text>
        </VStack>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </MenuList>
    </Menu>
  );
}
