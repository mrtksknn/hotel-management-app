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
      p={10}
      rounded="2xl"
      shadow="2xl"
      w="450px"
      maxW="90vw"
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="whiteAlpha.400"
      position="relative"
      zIndex={1}
    >
      <Heading
        mb={8}
        textAlign="center"
        color="brand.600"
        fontSize="3xl"
        fontWeight="bold"
      >
        {title}
      </Heading>
      <VStack spacing={4}>{children}</VStack>
    </Box>
  );
}
