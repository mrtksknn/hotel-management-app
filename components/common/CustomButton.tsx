"use client";

import { Button, ButtonProps } from "@chakra-ui/react";
import React from "react";

type Props = ButtonProps & {
  bg?: string;        // arka plan rengi (ör. "#d4af37")
  color?: string;     // yazı rengi (ör. "black" veya "#000")
};

export default function CustomButton({
  children,
  bg,
  color,
  _hover,
  ...props
}: Props) {
  // Eğer bg verilmemişse ve colorScheme verilmişse Chakra kendi colorScheme'ini kullanır.
  // Ancak kullanıcı colorScheme yerine manuel renk vermek isterse bg kullan.
  const computedBg = bg ?? undefined;
  const computedColor = color ?? (computedBg ? "white" : undefined);

  return (
    <Button
      {...props}
      bg={computedBg}
      color={computedColor}
      _hover={_hover ?? (computedBg ? { filter: "brightness(0.95)" } : { opacity: 0.9 })}
    >
      {children}
    </Button>
  );
}
