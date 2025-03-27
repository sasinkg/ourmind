import { Box, Heading, Text } from "@chakra-ui/react";
import PageWrapper from "../components/PageWrapper";

export default function Settings() {
  return (
    <PageWrapper>
    <Box p={6}>
      <Heading mb={4}>Settings</Heading>
      <Text>Coming soon: notification settings, profile, and more.</Text>
    </Box>
    </PageWrapper>
  );
}
