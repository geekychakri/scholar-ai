import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/router";

import type { User } from "@supabase/supabase-js";

import { usePapers } from "@/hooks/usePapers";

import { createClient } from "@/utils/supabase/component";
import { useDeleteMutation } from "@supabase-cache-helpers/postgrest-swr";

import { Trash, Filter, Download, Bookmark } from "lucide-react";
import {
  Row,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  // getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import SelectYear from "@/components/SelectYear";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { mkConfig, generateCsv, download } from "export-to-csv";

import { toggleBookmark } from "@/utils/toggleBookmark";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading: boolean;
  csvData: any;
  user?: User; //TODO:
}

//Types
import { PaperType } from "@/types";

function DataTable<TData, TValue>({
  data,
  columns,
  isLoading,
  csvData,
  user,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    year: true,
  });
  const [rowSelection, setRowSelection] = useState({});

  const { papers, mutate, error } = usePapers(user);

  //Supabase
  const supabase = createClient(); //TODO:

  //Router
  const router = useRouter();

  const searchRef = useRef<HTMLInputElement>(null);

  //CSV config
  const csvConfig = mkConfig({
    useKeysAsHeaders: true,
    filename: "scholar-ai",
    showTitle: true,
    title: (router.query?.q || "") as string,
    useBom: true,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // console.log({ columnCount: table.getAllColumns()[2].getIsVisible() });

  //VisibleColumnCount //TODO:
  const columnVisibleCount = table
    .getAllColumns()
    .filter((column) => Boolean(column.getIsVisible())).length;

  // console.log({ columnVisibleCount });

  const skeletons = Array.from({ length: 10 }, (x, i) => i);

  //Add data to supabase DB
  const insertData = async (row: Row<TData>) => {
    console.log("Creating data...");

    const addBookmark = async () => {
      const { data, error } = await supabase
        .from("starred")
        .upsert(row.original, { ignoreDuplicates: true });
      return toggleBookmark(papers, row);
    };

    await mutate(addBookmark, {
      optimisticData: () => {
        return toggleBookmark(papers, row);
      },
      rollbackOnError: true,
      revalidate: false,
      populateCache: true,
    });
  };

  const { trigger: deletePaper } = useDeleteMutation(
    supabase.from("starred"),
    ["paperId"],
    "paperId",
    {
      onSuccess: () => console.log("deleted"),
    }
  );

  const deleteData = async (row: Row<TData>) => {
    console.log("DELETED");
    // const result = await deletePaper({
    //   paperId: (row.original as PaperType)?.paperId,
    // });

    if (router.pathname === "/bookmarks") {
      const result = await deletePaper({
        paperId: (row.original as PaperType)?.paperId,
      });
      return;
    }

    const deleteBookmark = async () => {
      const result = await deletePaper({
        paperId: (row.original as PaperType)?.paperId,
      });
      return toggleBookmark(papers, row);
    };

    await mutate(deleteBookmark, {
      optimisticData: () => {
        return toggleBookmark(papers, row);
      },
      rollbackOnError: true,
      revalidate: false,
      populateCache: true,
    });
    // console.log("DELETED");
  };

  console.log({ error });

  if (error) {
    return <div>Something went wrong!</div>;
  }

  return (
    <div>
      {router.pathname !== "/bookmarks" && (
        <div className="flex items-center mb-4 flex-wrap gap-4">
          <form
            className="flex items-center border w-1/2 max-xl:w-full h-[50px] p-2 gap-2 rounded-md max-sm:w-full"
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              router.push(`/papers?q=${searchRef.current?.value}`, undefined, {
                shallow: true,
              });
            }}
          >
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 256 256"
              >
                <path
                  fill="#96a5b9"
                  d="m229.66 218.34l-50.07-50.06a88.11 88.11 0 1 0-11.31 11.31l50.06 50.07a8 8 0 0 0 11.32-11.32ZM40 112a72 72 0 1 1 72 72a72.08 72.08 0 0 1-72-72Z"
                />
              </svg>
            </span>

            <input
              id="question"
              type="text"
              className="flex-1 min-w-0 outline-none text-md peer/question"
              placeholder="Ask a research question"
              ref={searchRef}
            />
            <button className="bg-[#121212] text-white p-2 py-1 font-medium rounded-md block peer-placeholder-shown/question:hidden">
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-4 xl:ml-auto max-sm:ml-0">
            <SelectYear />
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={async () => {
                const csv = generateCsv(csvConfig)(csvData);
                download(csvConfig)(csv);
              }}
            >
              Export as CSV
              <span>
                <Download size={18} />
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  Filter
                  <span>
                    <Filter size={18} />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  ?.getAllColumns()
                  ?.filter((column) => column.getCanHide())
                  ?.map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      <div>
        <Table>
          <TableHeader>
            {table?.getHeaderGroups()?.map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {!isLoading ? (
              table?.getRowModel()?.rows?.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() =>
                    router.push(
                      `/paper?id=${(row.original as PaperType)?.paperId}`
                    )
                  }
                >
                  {row?.getVisibleCells()?.map((cell, i) => (
                    <TableCell
                      key={cell.id}
                      className={`cursor-pointer text-left border  ${
                        i === 2 ? "text-center" : ""
                      }`} //Add style to cells
                    >
                      {i === 0 ? (
                        <div className="flex items-center gap-3">
                          {router.pathname !== "/bookmarks" ? (
                            <span
                              className="relative p-3"
                              onClick={async (e) => {
                                e.stopPropagation();
                                if ((row.original as PaperType)?.isBookmarked) {
                                  deleteData(row);
                                } else {
                                  insertData(row);
                                }
                              }}
                              title="Bookmark"
                            >
                              <Bookmark
                                size={20}
                                fill={
                                  (row.original as PaperType)?.isBookmarked
                                    ? "#000"
                                    : "transparent"
                                }
                              />
                            </span>
                          ) : (
                            router.pathname === "/bookmarks" && (
                              <span
                                className="p-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteData(row);
                                  // console.log(row.original);
                                }}
                                title="Delete"
                              >
                                <Trash size={20} />
                              </span>
                            )
                          )}
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <>
                {skeletons.map((skeleton, i) => (
                  <TableRow key={i}>
                    {Array.from(
                      { length: columnVisibleCount },
                      (x, i) => i
                    ).map((elm, i) => (
                      <TableCell
                        key={i}
                        className={`cursor-pointer text-left border ${
                          i === 2 ? "w-6" : ""
                        }`}
                      >
                        <Skeleton height={30} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default DataTable;
