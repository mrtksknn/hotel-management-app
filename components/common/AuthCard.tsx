"use client";

import { Box, Heading, VStack } from "@chakra-ui/react";
import { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  children: ReactNode;
}

export default function AuthCard({ title, children }: AuthCardProps) {
  return (
    <Box
      bg="white"
      p={8}
      rounded="xl"
      shadow="md"
      w="96"
    >
      <Heading mb={6} textAlign="center" color="blue.600">
        {title}
      </Heading>
      <VStack>{children}</VStack>
    </Box>
  );
}
