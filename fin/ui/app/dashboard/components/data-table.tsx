"use client"

import * as React from "react"
import { Badge } from "@/fin/ui/components/ui/badge"
import { Button } from "@/fin/ui/components/ui/button"
import { ChartConfig } from "@/fin/ui/components/ui/chart"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/fin/ui/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/fin/ui/components/ui/dropdown-menu"
import { Input } from "@/fin/ui/components/ui/input"
import { Label } from "@/fin/ui/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/fin/ui/components/ui/select"
import { Separator } from "@/fin/ui/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/fin/ui/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/fin/ui/components/ui/tabs"
import {
  IconArrowDown,
  IconArrowUp,
  IconCar,
  IconCash,
  IconChartLine,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconCoin,
  IconDotsVertical,
  IconHeart,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconShoppingCart,
  IconTools,
  IconTransfer,
  IconTrendingUp,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"

export const schema = z.object({
  id: z.string(),
  date: z.string(),
  description: z.string(),
  amount: z.number(),
  currency: z.string(),
  type: z.string(),
  status: z.string(),
  operation_type: z.string(),
  account_name: z.string(),
  category: z.string(),
})

// Operation mapping function
function getOperationName(operation: string) {
  const operationMap: Record<string, string> = {
    PIX: "PIX",
    TED: "TED",
    DOC: "DOC",
    PAYMENT: "PAGAMENTO",
    DEPOSIT: "DEPÓSITO",
    WITHDRAWAL: "SAQUE",
    TRANSFER: "TRANSFERÊNCIA",
  }

  return operationMap[operation] || operation
}

// Category mapping function
function getCategoryInfo(category: string) {
  const categoryMap: Record<string, { name: string; icon: React.ReactNode }> = {
    Food: {
      name: "Alimentação",
      icon: <IconTools className="size-3 text-orange-600" />,
    },
    Transport: {
      name: "Transporte",
      icon: <IconCar className="size-3 text-blue-600" />,
    },
    Health: {
      name: "Saúde",
      icon: <IconHeart className="size-3 text-red-600" />,
    },
    Income: {
      name: "Receita",
      icon: <IconTrendingUp className="size-3 text-green-600" />,
    },
    Transfer: {
      name: "Transferência",
      icon: <IconTransfer className="size-3 text-purple-600" />,
    },
    Cash: {
      name: "Dinheiro",
      icon: <IconCash className="size-3 text-yellow-600" />,
    },
    Savings: {
      name: "Poupança",
      icon: <IconCoin className="size-3 text-indigo-600" />,
    },
    Investment: {
      name: "Investimento",
      icon: <IconChartLine className="size-3 text-emerald-600" />,
    },
    Shopping: {
      name: "Compras",
      icon: <IconShoppingCart className="size-3 text-pink-600" />,
    },
  }

  return (
    categoryMap[category] || {
      name: category,
      icon: <IconShoppingCart className="size-3 text-gray-600" />,
    }
  )
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    accessorKey: "date",
    header: "Data",
    cell: ({ row }) => {
      const date = new Date(row.original.date)
      return <div className="text-sm">{date.toLocaleDateString("pt-BR")}</div>
    },
    enableHiding: false,
  },
  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />
    },
    enableHiding: false,
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row }) => {
      const categoryInfo = getCategoryInfo(row.original.category)
      return (
        <div className="inline-block">
          <div className="rounded-lg border px-2 py-1">
            <span className="text-muted-foreground text-sm">
              {categoryInfo.name}
            </span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "operation_type",
    header: "Operação",
    cell: ({ row }) => (
      <div className="inline-block">
        <div className="rounded-lg border px-2 py-1">
          <span className="text-muted-foreground text-sm uppercase">
            {getOperationName(row.original.operation_type)}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "account_name",
    header: "Conta",
    cell: ({ row }) => (
      <div className="text-muted-foreground text-sm">
        {row.original.account_name}
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: () => <div className="w-full text-right">Valor</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <div className="flex items-center justify-end gap-1">
          <span className={`font-medium`}>
            R$ {row.original.amount.toFixed(2)}
          </span>
          {row.original.type === "OUTFLOW" ? (
            <IconArrowDown className="size-4 text-red-600" />
          ) : (
            <IconArrowUp className="text-primary size-4" />
          )}
        </div>
      </div>
    ),
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>View Details</DropdownMenuItem>
          <DropdownMenuItem>Export</DropdownMenuItem>
          <DropdownMenuItem>Categorize</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Flag</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [activeCategory, setActiveCategory] = React.useState<string>("all")

  // Get unique categories from data
  const categories = React.useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(initialData.map((item) => item.category))
    )
    return uniqueCategories.sort()
  }, [initialData])

  // Filter data based on active category
  const filteredData = React.useMemo(() => {
    if (activeCategory === "all") {
      return data
    }
    return data.filter((item) => item.category === activeCategory)
  }, [data, activeCategory])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <Tabs
      defaultValue="all"
      value={activeCategory}
      onValueChange={setActiveCategory}
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select value={activeCategory} onValueChange={setActiveCategory}>
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {categories.map((category) => {
              const categoryInfo = getCategoryInfo(category)
              const count = initialData.filter(
                (item) => item.category === category
              ).length
              return (
                <SelectItem key={category} value={category}>
                  {categoryInfo.name} ({count})
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map((category) => {
            const categoryInfo = getCategoryInfo(category)
            const count = initialData.filter(
              (item) => item.category === category
            ).length
            return (
              <TabsTrigger key={category} value={category}>
                {categoryInfo.name} <Badge variant="secondary">{count}</Badge>
              </TabsTrigger>
            )
          })}
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
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
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <IconPlus />
            <span className="hidden lg:inline">Add Transaction</span>
          </Button>
        </div>
      </div>
      <TabsContent
        value="all"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className="!px-4 !py-3"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="!px-4 !py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            Showing {table.getFilteredRowModel().rows.length} transactions
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      {categories.map((category) => (
        <TabsContent
          key={category}
          value={category}
          className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
        >
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                          className="!px-4 !py-3"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="!px-4 !py-3">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between px-4">
            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
              Showing {table.getFilteredRowModel().rows.length} transactions
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Rows per page
                </Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value))
                  }}
                >
                  <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <IconChevronsLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <IconChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <IconChevronRight />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <IconChevronsRight />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile()

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.description}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Transaction Details</DrawerTitle>
          <DrawerDescription>{item.description}</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <div className="flex items-center gap-1">
                <span
                  className={`font-medium ${item.type === "OUTFLOW" ? "text-red-600" : "text-green-600"}`}
                >
                  R$ {item.amount.toFixed(2)} {item.currency}
                </span>
                {item.type === "OUTFLOW" ? (
                  <IconArrowDown className="size-4 text-red-600" />
                ) : (
                  <IconArrowUp className="size-4 text-green-600" />
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span>{new Date(item.date).toLocaleDateString("pt-BR")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Type:</span>
              <Badge variant="outline">{item.type}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Operation:</span>
              <Badge variant="secondary">{item.operation_type}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="outline">
                {item.status === "PROCESSED" ? (
                  <IconCircleCheckFilled className="mr-1 fill-green-500 dark:fill-green-400" />
                ) : (
                  <IconLoader className="mr-1" />
                )}
                {item.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Account:</span>
              <span>{item.account_name}</span>
            </div>
          </div>
          <Separator />
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="description">Description</Label>
              <Input id="description" defaultValue={item.description} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="type">Type</Label>
                <Select defaultValue={item.type}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INFLOW">Inflow</SelectItem>
                    <SelectItem value="OUTFLOW">Outflow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue={item.status}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROCESSED">Processed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" defaultValue={item.amount.toString()} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="operation_type">Operation Type</Label>
                <Select defaultValue={item.operation_type}>
                  <SelectTrigger id="operation_type" className="w-full">
                    <SelectValue placeholder="Select operation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="TED">TED</SelectItem>
                    <SelectItem value="DOC">DOC</SelectItem>
                    <SelectItem value="TRANSFER">Transfer</SelectItem>
                    <SelectItem value="PAYMENT">Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button>Save Changes</Button>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
