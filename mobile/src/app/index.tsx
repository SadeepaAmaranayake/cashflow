import { Text } from "react-native";
import { useAuth } from "@/context/auth";

export default function IndexScreen() {
  const {
    user,
    isLoading,
    isAuthenticated,
  } = useAuth();

  if (isLoading) {
    return <Text>Checking session...</Text>;
  }

  return (
    <Text>
      {isAuthenticated
        ? `Logged in as ${user?.email}`
        : "Not logged in"}
    </Text>
  );
}