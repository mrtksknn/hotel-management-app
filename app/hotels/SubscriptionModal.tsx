"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Icon,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { Check, Star } from "lucide-react";
import { PRICING_PLANS } from "@/constants/pricing";
import { CustomButton } from "@/components";
import { updateSubscriptionPlan } from "@/services/userService";
import { useState } from "react";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  userId: string;
  onPlanUpdated: () => void;
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  currentPlan,
  userId,
  onPlanUpdated,
}: SubscriptionModalProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const toast = useToast();

  const handleUpgrade = async (planName: string) => {
    if (planName === currentPlan) return;
    
    setLoadingPlan(planName);
    try {
      await updateSubscriptionPlan(userId, planName);
      toast({
        title: "Paket Güncellendi",
        description: `Başarıyla ${planName} paketine geçiş yaptınız.`,
        status: "success",
        duration: 3000,
      });
      onPlanUpdated();
      onClose();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Plan güncellenirken bir sorun oluştu.",
        status: "error",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" isCentered scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.600" />
      <ModalContent borderRadius="3xl" overflow="hidden" bg="gray.50">
        <ModalHeader textAlign="center" pt={8}>
          <VStack spacing={1}>
            <Heading size="lg">Planınızı Yönetin</Heading>
            <Text fontSize="md" color="gray.500" fontWeight="normal">
              İşletmenizin ihtiyaçlarına en uygun paketi seçin.
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={8}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {PRICING_PLANS.map((plan) => {
              const isCurrent = currentPlan?.toLowerCase() === plan.id.toLowerCase();
              
              return (
                <Box
                  key={plan.id}
                  p={6}
                  bg="white"
                  borderRadius="2xl"
                  border="2px solid"
                  borderColor={isCurrent ? "brand.500" : "transparent"}
                  position="relative"
                  boxShadow={isCurrent ? "xl" : "md"}
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  transition="all 0.2s"
                  _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
                >
                  {isCurrent && (
                    <Badge
                      position="absolute"
                      top="-3"
                      left="50%"
                      transform="translateX(-50%)"
                      colorScheme="brand"
                      borderRadius="full"
                      px={3}
                      py={0.5}
                    >
                      Mevcut Planınız
                    </Badge>
                  )}
                  
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="bold" color="gray.500" fontSize="xs" letterSpacing="widest">
                        {plan.name}
                      </Text>
                      {plan.badge && <Badge colorScheme="green" fontSize="10px">{plan.badge}</Badge>}
                    </HStack>
                    
                    <Heading size="xl" mb={4}>
                      ₺{plan.price}
                      <Text as="span" fontSize="sm" color="gray.500" fontWeight="normal"> /ay</Text>
                    </Heading>
                    
                    <Text fontSize="sm" color="gray.600" mb={6}>
                      {plan.description}
                    </Text>
                    
                    <VStack align="start" spacing={3} mb={8}>
                      {plan.features.map((feature, idx) => (
                        <HStack key={idx} spacing={2} align="start">
                          <Icon as={Check} color="brand.500" boxSize={3} mt={1} />
                          <Text fontSize="xs" color="gray.700">{feature}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                  
                  <CustomButton
                    w="full"
                    colorScheme={isCurrent ? "green" : "brand"}
                    variant={isCurrent ? "subtle" : "solid"}
                    isDisabled={isCurrent}
                    isLoading={loadingPlan === plan.name}
                    onClick={() => handleUpgrade(plan.name)}
                    borderRadius="xl"
                  >
                    {isCurrent ? "Mevcut Plan" : "Yükselt"}
                  </CustomButton>
                </Box>
              );
            })}
          </SimpleGrid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
