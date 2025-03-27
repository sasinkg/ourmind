
import {
  Box,
  HStack,
  IconButton,
  useColorMode,
  useBreakpointValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
} from "@chakra-ui/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { SettingsIcon, MoonIcon, HamburgerIcon } from "@chakra-ui/icons";
import { FaPen, FaUsers, FaSignOutAlt } from "react-icons/fa";
import PrivateRoute from "./components/PrivateRoute";
import ProfileMenu from "./components/ProfileMenu";

import Groups from "./pages/Groups";
import GroupFeed from "./pages/GroupFeed";
import Settings from "./pages/Settings";
import Home from "./pages/Home";

import { auth } from "./lib/firebase";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";

function TopNav() {
  const navigate = useNavigate();
  const { toggleColorMode } = useColorMode();
  const [user, setUser] = useState<User | null>(null);
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const MotionMenuItem = motion(MenuItem);

  return (
    <HStack position="fixed" top={4} right={4} spacing={2} zIndex={1000}>
      <IconButton
        aria-label="Daily Question"
        icon={<FaPen />}
        onClick={() => navigate("/")}
        variant="ghost"
      />
      <IconButton
        aria-label="Groups"
        icon={<FaUsers />}
        onClick={() => navigate("/groups")}
        variant="ghost"
      />
      {isMobile ? (
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<HamburgerIcon />}
            variant="ghost"
            aria-label="Menu"
          />
          <MenuList p={2} minW="auto" bg="gray.800">
            <Flex flexDir="column" gap={2}>
              <MotionMenuItem
                icon={<SettingsIcon />}
                onClick={() => navigate("/settings")}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                bg="gray.700"
                borderRadius="md"
                _hover={{ bg: "gray.600" }}
              />
              <MotionMenuItem
                icon={<MoonIcon />}
                onClick={toggleColorMode}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                bg="gray.700"
                borderRadius="md"
                _hover={{ bg: "gray.600" }}
              />
              <MotionMenuItem
                icon={<FaSignOutAlt />}
                onClick={handleLogout}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                bg="gray.700"
                borderRadius="md"
                _hover={{ bg: "red.500" }}
              />
            </Flex>
          </MenuList>
        </Menu>
      ) : (
        <>
          <IconButton
            aria-label="Settings"
            icon={<SettingsIcon />}
            onClick={() => navigate("/settings")}
            variant="ghost"
          />
          <IconButton
            aria-label="Toggle color mode"
            icon={<MoonIcon />}
            onClick={toggleColorMode}
            variant="ghost"
          />
          {user && <ProfileMenu />}
        </>
      )}
    </HStack>
  );
}

function AppContent() {
  const location = useLocation();
  const { colorMode } = useColorMode();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={colorMode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box
          minH="100vh"
          transition="background-color 0.3s ease, color 0.3s ease"
          bg="gray.50"
          color="gray.900"
          _dark={{ bg: "gray.900", color: "whiteAlpha.900" }}
        >
          <TopNav />
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/groups" element={<PrivateRoute element={<Groups />} />} />
              <Route path="/groups/:groupId" element={<PrivateRoute element={<GroupFeed />} />} />
              <Route path="/settings" element={<PrivateRoute element={<Settings />} />} />
            </Routes>
          </AnimatePresence>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}