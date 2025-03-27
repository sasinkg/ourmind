import {
    Box,
    Heading,
    VStack,
    Button,
    useColorMode,
  } from "@chakra-ui/react";
  import { useNavigate } from "react-router-dom";
  import { useState } from "react";
import PageWrapper from "../components/PageWrapper";
  
  // 🎨 Pastel color palette (dark mode base)
  const pastelColors = [
    "#6B8AD7", // Periwinkle
    "#BE95DC", // Lilac
    "#EFA2D2", // Orchid
    "#FCB5B5", // Blush
    "#F9C6AB", // Peach
    "#F8E3BC", // Butter
  ];
  
  // 🎨 Slightly darker versions for light mode
  const pastelLightOverrides: Record<string, string> = {
    "#6B8AD7": "#5a77bd",
    "#BE95DC": "#a177c3",
    "#EFA2D2": "#db7fb9",
    "#FCB5B5": "#e29898",
    "#F9C6AB": "#e3aa8f",
    "#F8E3BC": "#e7d1a9",
  };
  
  // 🔄 Dummy groups
  const initialGroups = [
    { id: "1", name: "Close Friends" },
    { id: "2", name: "Family" },
    { id: "3", name: "Work Crew" },
    { id: "4", name: "Gym Buddies" },
    { id: "5", name: "Book Club" },
    { id: "6", name: "Travel Gang" },
  ];
  
  export default function Groups() {
    const navigate = useNavigate();
    const { colorMode } = useColorMode();
  
    // 💡 Assign each group a unique color randomly
    const [groups] = useState(() => {
      const usedColors = new Set<string>();
      const availableColors = [...pastelColors];
  
      return initialGroups.map((group) => {
        let color =
          availableColors.splice(Math.floor(Math.random() * availableColors.length), 1)[0];
  
        // If we've run out of unique colors, start repeating
        if (!color) {
          color = pastelColors[Math.floor(Math.random() * pastelColors.length)];
        }
  
        usedColors.add(color);
        return { ...group, color };
      });
    });
  
    return (
        <PageWrapper>
      <Box p={6}>
        <Heading mb={6}>Your Groups</Heading>
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
          <Button colorScheme="teal" onClick={() => alert("Create Group coming soon!")}>
            + Create Group
          </Button>
        </VStack>
      </Box>
      </PageWrapper>
    );
  }
  