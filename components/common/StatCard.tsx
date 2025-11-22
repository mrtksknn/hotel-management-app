import { Box, Icon, Text } from "@chakra-ui/react";

interface StatCardProps {
    title: string;
    value: string;
    subValue: string;
    icon: any;
    colorScheme: string;
    variant?: 'normal' | 'compact' | 'veryCompact';
}

const StatCard = ({ title, value, subValue, icon, colorScheme, variant = 'normal' }: StatCardProps) => {
    const isVeryCompact = variant === 'veryCompact';
    const isCompact = variant === 'compact';

    const p = isVeryCompact ? 2 : (isCompact ? 3 : 5);
    const gap = isVeryCompact ? 2 : (isCompact ? 3 : 4);
    const iconP = isVeryCompact ? 1.5 : (isCompact ? 2 : 3);
    const iconSize = isVeryCompact ? 4 : (isCompact ? 5 : 6);
    const titleSize = isVeryCompact ? "10px" : (isCompact ? "xs" : "xs");
    const valueSize = isVeryCompact ? "sm" : (isCompact ? "md" : "lg");
    const subSize = isVeryCompact ? "10px" : (isCompact ? "xs" : "xs");

    return (
        <Box
            p={p}
            borderRadius="xl"
            bg="white"
            border="1px solid"
            borderColor="neutral.100"
            boxShadow="sm"
            transition="all 0.2s"
            _hover={{ transform: "translateY(-2px)", boxShadow: "soft" }}
            display="flex"
            alignItems="center"
            gap={gap}
            h="full"
        >
            <Box
                p={iconP}
                borderRadius="lg"
                bg={`${colorScheme}.50`}
                color={`${colorScheme}.500`}
                display="flex"
                alignItems="center"
                justifyContent="center"
                minW="max-content"
            >
                <Icon as={icon} boxSize={iconSize} />
            </Box>
            <Box overflow="hidden">
                <Text fontSize={titleSize} fontWeight="medium" color="neutral.500" textTransform="uppercase" letterSpacing="wide" isTruncated>
                    {title}
                </Text>
                <Box>
                    <Text fontSize={valueSize} fontWeight="bold" color="neutral.800" isTruncated title={value}>
                        {value}
                    </Text>
                    <Text fontSize={subSize} color="neutral.400" isTruncated>
                        {subValue}
                    </Text>
                </Box>
            </Box>
        </Box>
    );
};

export default StatCard;
