import { ColumnDef } from "@tanstack/react-table";

import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";

import { PaperType } from "@/types";

export const columns: ColumnDef<PaperType>[] = [
  {
    accessorKey: "title",
    header: "Paper title",
    enableHiding: false,
  },
  {
    // accessorKey: "tldr.text",
    accessorFn: (row) =>
      `${
        row.tldr?.text ||
        (row.abstract?.split(".")[0] !== undefined
          ? row.abstract?.split(".")[0] + "."
          : "Abstract not found!")
      }`,
    header: "Abstract summary",
    id: "Abstract summary", //Custom Name
  },
  {
    accessorKey: "year",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Year
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
];
