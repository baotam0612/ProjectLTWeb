import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "./ui/table";
import { Button } from "./ui/button";
export function DataTable({
  columns,
  data,
  pagination,
  emptyMessage = "Kh\xF4ng c\xF3 d\u1EEF li\u1EC7u"
}) {
  return <div aria-busy={pagination?.loading} className="min-w-0 max-w-full rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              {columns.map((column, index) => <TableHead key={index} className={column.className}>
                  {column.header}
                </TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <svg
    className="w-12 h-12 text-gray-300"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
                      <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
  />
                    </svg>
                    <p role={pagination?.error ? "alert" : "status"}>{pagination?.error || (pagination?.loading ? "Đang tải dữ liệu..." : emptyMessage)}</p>
                    {pagination?.error && <Button variant="outline" onClick={pagination.reload}>Thử lại</Button>}
                  </div>
                </TableCell>
              </TableRow> : data.map((row) => <TableRow key={row.id} className="hover:bg-gray-50">
                  {columns.map((column, colIndex) => {
    const value = typeof column.accessor === "function" ? column.accessor(row) : row[column.accessor];
    return <TableCell key={colIndex} className={column.className}>
                        {value}
                      </TableCell>;
  })}
                </TableRow>)}
          </TableBody>
        </Table>
      </div>
      {pagination && <nav aria-label="Phân trang bảng dữ liệu" className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 p-3 text-sm">
        <p aria-live="polite" className="text-gray-600">
          {data.length ? pagination.page * pagination.size + 1 : 0}–{data.length ? pagination.page * pagination.size + data.length : 0} / {pagination.totalElements} bản ghi
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2">
            Số dòng
            <select aria-label="Số dòng mỗi trang" value={pagination.size} disabled={pagination.loading}
              onChange={event => pagination.onSizeChange(Number(event.target.value))} className="rounded border border-gray-300 p-1.5">
              {[10, 20, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
            </select>
          </label>
          <Button size="sm" variant="outline" disabled={pagination.loading || pagination.page === 0}
            onClick={() => pagination.onPageChange(pagination.page - 1)}>Trước</Button>
          <span>Trang {pagination.page + 1} / {Math.max(1, pagination.totalPages)}</span>
          <Button size="sm" variant="outline" disabled={pagination.loading || pagination.page + 1 >= pagination.totalPages}
            onClick={() => pagination.onPageChange(pagination.page + 1)}>Sau</Button>
        </div>
      </nav>}
    </div>;
}
