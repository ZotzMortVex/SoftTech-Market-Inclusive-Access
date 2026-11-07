import {
  useMemo,
  useState,
  isValidElement,
  type ReactNode,
} from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Copy,
  FileDown,
  FileSpreadsheet,
  FileText,
  Search,
} from "lucide-react";
import { normalizeSearchText } from "../../utils/textNormalization";

export interface DataTableColumn<Row> {
  key: string;
  label: string;
  sortValue?: (row: Row) => string | number;
  render: (row: Row) => ReactNode;
  className?: string;
  headerClassName?: string;
}

function getNodeText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).filter(Boolean).join(" ");
  if (isValidElement<{ children?: ReactNode }>(node))
    return getNodeText(node.props.children);
  return "";
}

function downloadTextFile(filename: string, content: string, mimeType: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

interface DataTableProps<Row> {
  caption: string;
  rows: Row[];
  columns: DataTableColumn<Row>[];
  getRowKey: (row: Row) => string;
  getSearchText: (row: Row) => string;
  emptyMessage: string;
  variant?: "light" | "dark";
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  initialPageSize?: number;
  showSearch?: boolean;
}

export function DataTable<Row>({
  caption,
  rows,
  columns,
  getRowKey,
  getSearchText,
  emptyMessage,
  variant = "light",
  searchValue,
  onSearchChange,
  initialPageSize = 10,
  showSearch = true,
}: DataTableProps<Row>) {
  const [internalSearch, setInternalSearch] = useState("");
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(0);
  const [exportError, setExportError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" } | null>(
    null,
  );
  const query = searchValue ?? internalSearch;
  const isDark = variant === "dark";

  const filteredRows = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query.trim());
    const matchingRows = normalizedQuery
      ? rows.filter((row) =>
          normalizeSearchText(getSearchText(row)).includes(normalizedQuery),
        )
      : [...rows];
    if (!sort) return matchingRows;

    const column = columns.find((item) => item.key === sort.key);
    if (!column?.sortValue) return matchingRows;
    return matchingRows.sort((left, right) => {
      const leftValue = column.sortValue?.(left) ?? "";
      const rightValue = column.sortValue?.(right) ?? "";
      const compared =
        typeof leftValue === "number" && typeof rightValue === "number"
          ? leftValue - rightValue
          : String(leftValue).localeCompare(String(rightValue), "es", {
              numeric: true,
              sensitivity: "base",
            });
      return sort.direction === "asc" ? compared : -compared;
    });
  }, [columns, getSearchText, query, rows, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleRows = filteredRows.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );
  const rangeStart = filteredRows.length === 0 ? 0 : currentPage * pageSize + 1;
  const rangeEnd = Math.min((currentPage + 1) * pageSize, filteredRows.length);
  const toolbarClass = isDark
    ? "border-[#003a61] bg-[#00172b] text-slate-200"
    : "border-slate-200 bg-slate-50 text-slate-700";
  const inputClass = isDark
    ? "border-[#315064] bg-[#001324] text-white placeholder:text-slate-400 focus-visible:outline-cyan-300"
    : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 focus-visible:outline-cyan-700";
  const tableClass = isDark
    ? "bg-[#001c33] text-slate-200"
    : "bg-white text-slate-800";
  const headClass = isDark
    ? "border-b border-[#003254] bg-[#001324] text-slate-300"
    : "border-b border-slate-200 bg-slate-100 text-slate-700";
  const rowDividerClass = isDark ? "divide-[#002947]" : "divide-slate-200";
  const buttonClass = isDark
    ? "border-[#315064] bg-[#001324] text-slate-200 hover:bg-[#123d51] disabled:opacity-50"
    : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100 disabled:opacity-50";

  const updateSearch = (value: string) => {
    if (onSearchChange) onSearchChange(value);
    else setInternalSearch(value);
    setPage(0);
  };

  function escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  const changeSort = (column: DataTableColumn<Row>) => {
    if (!column.sortValue) return;
    setSort((current) =>
      current?.key === column.key
        ? {
            key: column.key,
            direction: current.direction === "asc" ? "desc" : "asc",
          }
        : { key: column.key, direction: "asc" },
    );
    setPage(0);
  };

  const exportRows = filteredRows.map((row) =>
    columns.map((column) => getNodeText(column.render(row))),
  );
  const exportMatrix = [columns.map((column) => column.label), ...exportRows];
  const csvContent = `\uFEFF${exportMatrix
    .map((line) =>
      line
        .map((value) => `"${value.replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\r\n")}`;
  const exportBaseName = caption
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const exportButtonClass =
    "inline-flex min-h-8 items-center gap-1 rounded-md border px-2 py-1 text-xs font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const handleCopy = async () => {
    setExportError(null);
    try {
      await navigator.clipboard.writeText(
        exportMatrix.map((line) => line.join("\t")).join("\n"),
      );
      setCopySuccess(true);
      window.setTimeout(() => setCopySuccess(false), 1800);
    } catch (reason) {
      console.error("No se pudo copiar la tabla:", reason);
      setExportError("No se pudo copiar la tabla. Revisa los permisos del navegador.");
    }
  };

  const handlePdfExport = async () => {
    setExportError(null);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "landscape" });
      const lines = exportMatrix.map((line) => line.join("  |  "));
      const pageHeight = doc.internal.pageSize.getHeight();
      let y = 18;
      doc.setFontSize(14);
      doc.text(caption, 14, y);
      doc.setFontSize(8);
      lines.forEach((line) => {
        const wrapped = doc.splitTextToSize(line, 268) as string[];
        if (y + wrapped.length * 5 > pageHeight - 12) {
          doc.addPage();
          y = 14;
        }
        y += y === 18 ? 9 : 0;
        doc.text(wrapped, 14, y);
        y += wrapped.length * 5;
      });
      doc.save(`${exportBaseName || "tabla"}.pdf`);
    } catch (reason) {
      console.error("No se pudo exportar la tabla a PDF:", reason);
      setExportError("No se pudo generar el PDF de la tabla.");
    }
  };

  return (
    <section className="data-table-compact overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className={`flex flex-col gap-2 border-b p-2 text-xs sm:flex-row sm:items-center sm:justify-between ${toolbarClass}`}>
        <label className="flex shrink-0 items-center gap-1.5 text-xs font-semibold">
          <span>Mostrar</span>
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(0);
            }}
            className={`min-h-8 rounded-md border px-2 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${inputClass}`}
          >
            {[5, 10, 25, 50].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span>registros</span>
        </label>
        <div className="flex flex-wrap items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => void handleCopy()}
            className={`${exportButtonClass} border-slate-400 bg-white text-slate-800 hover:bg-slate-100`}
            aria-label={`Copiar ${caption}`}
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            {copySuccess ? "Copiado" : "Copiar"}
          </button>
          <button
            type="button"
            onClick={() =>
              downloadTextFile(
                `${exportBaseName || "tabla"}.xls`,
                `\uFEFF<table><thead><tr>${exportMatrix[0]
                  .map((cell) => `<th>${escapeHtml(cell)}</th>`)
                  .join("")}</tr></thead><tbody>${exportRows
                  .map(
                    (row) =>
                      `<tr>${row.map((cell) => `<td>${cell.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>`).join("")}</tr>`,
                  )
                  .join("")}</tbody></table>`,
                "application/vnd.ms-excel;charset=utf-8",
              )
            }
            className={`${exportButtonClass} border-green-700 bg-green-700 text-white hover:bg-green-800`}
            aria-label={`Exportar ${caption} a Excel`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
            Excel
          </button>
          <button
            type="button"
            onClick={() => void handlePdfExport()}
            className={`${exportButtonClass} border-red-700 bg-red-700 text-white hover:bg-red-800`}
            aria-label={`Exportar ${caption} a PDF`}
          >
            <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
            PDF
          </button>
          <button
            type="button"
            onClick={() =>
              downloadTextFile(
                `${exportBaseName || "tabla"}.csv`,
                csvContent,
                "text/csv;charset=utf-8",
              )
            }
            className={`${exportButtonClass} border-blue-700 bg-blue-700 text-white hover:bg-blue-800`}
            aria-label={`Exportar ${caption} a CSV`}
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            CSV
          </button>
        </div>
        {showSearch ? (
          <label className="relative block w-full sm:max-w-xs">
            <span className="sr-only">Buscar en {caption}</span>
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-70"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder={`Buscar: ${caption.toLocaleLowerCase("es")}`}
              className={`min-h-8 w-full rounded-md border py-1 pl-8 pr-2 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${inputClass}`}
            />
          </label>
        ) : (
          <span className="text-xs font-semibold">{caption}</span>
        )}
      </div>

      {exportError && (
        <p role="alert" className="border-b border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-900">
          {exportError}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className={`w-full text-left text-xs ${tableClass}`}>
          <caption className="sr-only">{caption}</caption>
          <thead className={headClass}>
            <tr>
              {columns.map((column) => {
                const isSorted = sort?.key === column.key;
                const SortIcon = !isSorted
                  ? ChevronsUpDown
                  : sort.direction === "asc"
                    ? ChevronUp
                    : ChevronDown;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={
                      isSorted
                        ? sort.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : column.sortValue
                          ? "none"
                          : undefined
                    }
                    className={`whitespace-nowrap px-2.5 py-2 text-[11px] font-black uppercase tracking-wide ${column.headerClassName ?? ""}`}
                  >
                    {column.sortValue ? (
                      <button
                        type="button"
                        onClick={() => changeSort(column)}
                        className="inline-flex min-h-7 items-center gap-1 rounded text-left hover:text-cyan-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
                      >
                        {column.label}
                        <SortIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className={`divide-y ${rowDividerClass}`}>
            {visibleRows.map((row) => (
              <tr key={getRowKey(row)} className={isDark ? "hover:bg-[#00243e]" : "hover:bg-slate-50"}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-2.5 py-2 ${column.className ?? ""}`}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
            {visibleRows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-6 text-center font-medium text-slate-600"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={`flex flex-col gap-2 border-t p-2 text-xs sm:flex-row sm:items-center sm:justify-between ${toolbarClass}`}>
        <p aria-live="polite">
          Mostrando {rangeStart}–{rangeEnd} de {filteredRows.length} registros
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage === 0}
            onClick={() => setPage((previous) => Math.max(0, previous - 1))}
            className={`min-h-8 rounded-md border px-2.5 font-semibold ${buttonClass}`}
          >
            Anterior
          </button>
          <span className="min-w-20 text-center font-semibold">
            Página {currentPage + 1} de {pageCount}
          </span>
          <button
            type="button"
            disabled={currentPage >= pageCount - 1}
            onClick={() => setPage((previous) => Math.min(pageCount - 1, previous + 1))}
            className={`min-h-8 rounded-md border px-2.5 font-semibold ${buttonClass}`}
          >
            Siguiente
          </button>
        </div>
      </div>
    </section>
  );
}
