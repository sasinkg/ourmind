import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import { Spinner, Center } from "@chakra-ui/react";

type PrivateRouteProps = {
  element: React.ReactElement; // ✅ This is safer and TS-friendly
};


export default function PrivateRoute({ element }: PrivateRouteProps) {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return user ? element : <Navigate to="/" replace />;
}
