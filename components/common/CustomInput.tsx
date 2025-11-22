"use client";

import { Input, InputProps } from "@chakra-ui/react";

export default function CustomInput(props: InputProps) {
  return (
    <Input
      size="lg"
      rounded="lg"
      mb={4}
      borderColor="neutral.200"
      _hover={{ borderColor: "brand.300" }}
      _focus={{
        borderColor: "brand.500",
        boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)"
      }}
      {...props}
    />
  );
}
