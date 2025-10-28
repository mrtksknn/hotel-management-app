"use client";

import { Button, ButtonProps } from "@chakra-ui/react";

export default function CustomButton(props: ButtonProps) {
  return (
    <Button
      colorScheme="blue"
      w="full"
      rounded="lg"
      fontWeight="semibold"
      {...props}
    />
  );
}
