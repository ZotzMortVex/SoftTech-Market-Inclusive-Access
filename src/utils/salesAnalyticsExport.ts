import type { SalesAnalytics } from "../types";

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function getReportRows(analytics: SalesAnalytics): string[][] {
  const period = analytics.selectedMonth
    ? `${MONTH_NAMES[analytics.selectedMonth - 1]} ${analytics.selectedYear}`
    : `Año ${analytics.selectedYear}`;
  return [
    ["Informe de ventas", period],
    ["Ventas totales (COP)", String(analytics.totalSales)],
    ["Pedidos", String(analytics.totalOrders)],
    ["Ticket promedio (COP)", String(analytics.averageTicket)],
    [],
    ["Mes", "Número de mes", "Año", "Ventas (COP)", "Pedidos"],
    ...analytics.monthlySales.map((item) => [
      MONTH_NAMES[item.month - 1],
      String(item.month),
      String(analytics.selectedYear),
      String(item.totalSales),
      String(item.orders),
    ]),
  ];
}

function downloadReport(
  filename: string,
  content: string,
  type: string,
): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function safeFilename(analytics: SalesAnalytics): string {
  const monthSuffix = analytics.selectedMonth
    ? `-${MONTH_NAMES[analytics.selectedMonth - 1].toLocaleLowerCase("es")}`
    : "";
  return `softtech-ventas-${analytics.selectedYear}${monthSuffix}`;
}

export function downloadSalesReportCsv(analytics: SalesAnalytics): void {
  const csv = getReportRows(analytics)
    .map((row) =>
      row
        .map((cell) => `"${cell.replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\r\n");
  downloadReport(
    `${safeFilename(analytics)}.csv`,
    `\uFEFF${csv}`,
    "text/csv;charset=utf-8",
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function downloadSalesReportExcel(analytics: SalesAnalytics): void {
  const html = `<table>${getReportRows(analytics)
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`,
    )
    .join("")}</table>`;
  downloadReport(
    `${safeFilename(analytics)}.xls`,
    `\uFEFF${html}`,
    "application/vnd.ms-excel;charset=utf-8",
  );
}
