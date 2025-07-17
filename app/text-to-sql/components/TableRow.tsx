"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { z } from "zod";
import { tableSchema } from "../../api/text-to-sql/shared";

interface TableRowProps {
  table: z.infer<typeof tableSchema>;
}

const ColumnBadge = ({ children }: { children: React.ReactNode }) => (
  <span className="text-blue-600 dark:text-blue-400">{children}</span>
);

const Column = ({
  column,
}: {
  column: TableRowProps["table"]["columns"][string];
}) => (
  <div
    key={column.column_name}
    className="bg-gray-50 dark:bg-gray-800 p-3 rounded"
  >
    <div className="flex items-center gap-2 text-sm font-mono mb-2">
      <span className="font-medium">{column.column_name}</span>
      <ColumnBadge>{column.data_type}</ColumnBadge>
      {!column.is_nullable && <ColumnBadge>NOT NULL</ColumnBadge>}
    </div>

    {/* Foreign key relationship (below badges, above default) */}
    {column.foreignKey && (
      <div className="text-sm rounded mb-2">
        <span className="font-medium text-purple-700 dark:text-purple-300">
          Foreign key:
        </span>{" "}
        <span className="font-mono">
          {column.foreignKey.foreign_table_name}.
          {column.foreignKey.foreign_column_name}
        </span>
      </div>
    )}

    {/* Default value (below everything else) */}
    {column.column_default && (
      <div className="text-sm rounded">
        <span className="font-medium">Default:</span>{" "}
        <code className="font-mono text-xs bg-white dark:bg-gray-800 px-1 py-0.5 rounded">
          {column.column_default}
        </code>
      </div>
    )}
  </div>
);

export function TableRow({ table }: TableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg p-4">
      <div
        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <h4 className="font-semibold text-lg">{table.name}</h4>
        <span className="text-sm text-gray-500">
          ({Object.keys(table.columns).length} columns)
        </span>
      </div>

      {isExpanded && (
        <div className="mt-4">
          <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
            Columns:
          </h5>
          <div className="space-y-3">
            {Object.values(table.columns).map((column) => (
              <Column key={column.column_name} column={column} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
