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
} from "@chakra-ui/react";

export interface Column<T> {
    header: React.ReactNode;
    accessor?: keyof T;
    render?: (item: T) => React.ReactNode;
    textAlign?: "left" | "center" | "right";
    width?: string;
}

interface DynamicTableProps<T> {
    columns: Column<T>[];
    data: T[];
    footer?: React.ReactNode;
    variant?: string;
    size?: string;
}

const DynamicTable = <T,>({
    columns,
    data,
    footer,
    variant = "simple",
    size = "md",
}: DynamicTableProps<T>) => {
    return (
        <TableContainer>
            <Table variant={variant} size={size}>
                <Thead>
                    <Tr>
                        {columns.map((col, index) => (
                            <Th
                                key={index}
                                textAlign={col.textAlign || "left"}
                                width={col.width}
                            >
                                {col.header}
                            </Th>
                        ))}
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
