"use client";

import { Input, InputProps } from "@chakra-ui/react";

export default function CustomInput(props: InputProps) {
  return (
    <Input
      size="md"
      rounded="md"
      mb={3}
      {...props}
    />
  );
}
