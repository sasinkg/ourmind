import { Box, Heading, Text, VStack, Badge, useColorMode } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";

const mockAnswers = [
  { name: "Alex", answer: "Seeing my dog run around", likes: 12, dislikes: 1 },
  { name: "Jamie", answer: "Finished a great book", likes: 9, dislikes: 0 },
  { name: "Sam", answer: "A really kind compliment today", likes: 15, dislikes: 2 },
];

const pastelColors: Record<string, string> = {
  "1": "#6B8AD7",
  "2": "#BE95DC",
  "3": "#EFA2D2",
  "4": "#FCB5B5",
  "5": "#F9C6AB",
  "6": "#F8E3BC",
};

const pastelLightOverrides: Record<string, string> = {
  "#6B8AD7": "#5a77bd",
  "#BE95DC": "#a177c3",
  "#EFA2D2": "#db7fb9",
  "#FCB5B5": "#e29898",
  "#F9C6AB": "#e3aa8f",
  "#F8E3BC": "#e7d1a9",
};

export default function GroupFeed() {
  const { groupId } = useParams();
  const { colorMode } = useColorMode();

  const groupNameMap: Record<string, string> = {
    "1": "Close Friends",
    "2": "Family",
    "3": "Work Crew",
    "4": "Gym Buddies",
    "5": "Book Club",
    "6": "Travel Gang",
  };

  const groupName = groupNameMap[groupId || ""] || "Your Group";
  const colorHex = pastelColors[groupId || ""] || "#EFA2D2";
  const bgColor = colorMode === "light" ? pastelLightOverrides[colorHex] ?? colorHex : colorHex;

  return (
    <PageWrapper>
      <Box p={6}>
        <Heading mb={4}>{groupName}</Heading>
        <Text fontSize="lg" mb={6}>What made you smile today?</Text>

        <VStack spacing={4} align="stretch">
          {mockAnswers.map((entry, idx) => (
            <Box
              key={idx}
              p={4}
              px={6}
              borderRadius="lg"
              bg={bgColor}
              color="black"
              transition="all 0.3s ease"
            >
              <Text fontWeight="bold">{entry.name}</Text>
              <Text mb={2}>{entry.answer}</Text>
              <Badge colorScheme="green" mr={2}>👍 {entry.likes}</Badge>
              <Badge colorScheme="red">👎 {entry.dislikes}</Badge>
            </Box>
          ))}
        </VStack>
      </Box>
    </PageWrapper>
  );
}
