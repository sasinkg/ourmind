import {
  Box,
  HStack,
  IconButton,
  useColorMode,
} from "@chakra-ui/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { SettingsIcon, MoonIcon } from "@chakra-ui/icons";
import { FaHome, FaUsers } from "react-icons/fa";
import Groups from "./pages/Groups";
import GroupFeed from "./pages/GroupFeed";
import Settings from "./pages/Settings";
import { AnimatePresence, motion } from "framer-motion";

function TopNav() {
  const navigate = useNavigate();
  const { toggleColorMode } = useColorMode();

  return (
    <HStack position="fixed" top={4} right={4} spacing={2} zIndex={1000}>
      <IconButton
        aria-label="Home"
        icon={<FaHome />}
        onClick={() => navigate("/")}
        variant="ghost"
      />
      <IconButton
        aria-label="Groups"
        icon={<FaUsers />}
        onClick={() => navigate("/groups")}
        variant="ghost"
      />
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
    </HStack>
  );
}

function AppContent() {
  const location = useLocation();
  const { colorMode } = useColorMode();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={colorMode} // ✅ triggers fade on color mode change
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
              <Route path="/" element={<Groups />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/groups/:groupId" element={<GroupFeed />} />
              <Route path="/settings" element={<Settings />} />
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
