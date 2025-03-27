import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";

export default function Home() {
  const navigate = useNavigate();
  const todayQuestion = "What made you smile today?";

  return (
    <PageWrapper>
      <Box p={6}>
        <Heading mb={4}>Today's Question</Heading>
        <Text fontSize="xl" mb={6}>{todayQuestion}</Text>
        <Button onClick={() => navigate("/groups")}>View Groups</Button>
      </Box>
    </PageWrapper>
  );
}
