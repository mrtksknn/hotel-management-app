import React from "react";
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Box,
    TableContainer,
    Tfoot,
    Flex,
    Icon
} from "@chakra-ui/react";
import { ChevronUp, ChevronDown } from "lucide-react";

export interface Column<T> {
    header: React.ReactNode;
    accessor?: keyof T;
    render?: (item: T) => React.ReactNode;
    textAlign?: "left" | "center" | "right";
    width?: string;
    sortable?: boolean;
    sortKey?: string;
}

export interface SortConfig {
    key: string;
    direction: "asc" | "desc";
}

interface DynamicTableProps<T> {
    columns: Column<T>[];
    data: T[];
    footer?: React.ReactNode;
    variant?: string;
    size?: string;
    onSort?: (key: string) => void;
    sortConfig?: SortConfig | null;
}

const DynamicTable = <T,>({
    columns,
    data,
    footer,
    variant = "simple",
    size = "md",
    onSort,
    sortConfig,
}: DynamicTableProps<T>) => {
    return (
        <TableContainer>
            <Table variant={variant} size={size}>
                <Thead>
                    <Tr>
                        {columns.map((col, index) => {
                            const isSortable = col.sortable;
                            const sortKey = col.sortKey || (col.accessor as string);
                            const isSorted = sortConfig?.key === sortKey;

                            return (
                                <Th
                                    key={index}
                                    textAlign={col.textAlign || "left"}
                                    width={col.width}
                                    cursor={isSortable ? "pointer" : "default"}
                                    onClick={() => isSortable && onSort && sortKey && onSort(sortKey)}
                                    _hover={isSortable ? { bg: "gray.50" } : undefined}
                                    userSelect="none"
                                >
                                    <Flex align="center" gap={1} justify={col.textAlign === "center" ? "center" : "flex-start"}>
                                        {col.header}
                                        {isSortable && (
                                            <Box color={isSorted ? "brand.500" : "gray.300"}>
                                                {isSorted ? (
                                                    sortConfig?.direction === "asc" ? (
                                                        <Icon as={ChevronUp} boxSize={4} />
                                                    ) : (
                                                        <Icon as={ChevronDown} boxSize={4} />
                                                    )
                                                ) : (
                                                    <Icon as={ChevronDown} boxSize={4} opacity={0} />
                                                )}
                                            </Box>
                                        )}
                                    </Flex>
                                </Th>
                            );
                        })}
                    </Tr>
                </Thead>
                <Tbody>
                    {data.map((item, rowIndex) => (
                        <Tr key={rowIndex}>
                            {columns.map((col, colIndex) => (
                                <Td key={colIndex} textAlign={col.textAlign || "left"}>
                                    {col.render
                                        ? col.render(item)
                                        : col.accessor
                                            ? (item[col.accessor] as React.ReactNode)
                                            : null}
                                </Td>
                            ))}
                        </Tr>
                    ))}
                </Tbody>
                {footer && <Tfoot>{footer}</Tfoot>}
            </Table>
        </TableContainer>
    );
};

export default DynamicTable;
