import { jsPDF } from "jspdf";
import type { SalesAnalytics } from "../types";
import { formatCOP, formatCOPCompact } from "./formatters";

const MONTHS = [
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

type PdfColumn = {
  label: string;
  width: number;
  align?: "left" | "center" | "right";
};

function drawBrandHeader(doc: jsPDF, pageTitle: string, pageNumber: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(3, 35, 54);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setFillColor(2, 132, 199);
  doc.setDrawColor(34, 211, 238);
  doc.setLineWidth(0.8);
  doc.roundedRect(14, 5, 18, 18, 3, 3, "FD");
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.65);
  doc.ellipse(23, 14, 6, 3.2, "S");
  doc.setFillColor(0, 227, 253);
  doc.circle(23, 14, 2, "F");
  doc.setFillColor(255, 255, 255);
  doc.circle(23.7, 13.3, 0.65, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("SoftTech Market", 38, 13);
  doc.setFillColor(187, 247, 208);
  doc.roundedRect(38, 16, 22, 5, 1, 1, "F");
  doc.setTextColor(15, 40, 35);
  doc.setFontSize(7);
  doc.text("INCLUSIVO", 49, 19.5, { align: "center" });
  doc.setTextColor(213, 230, 240);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Acceso 100% Visual · Cero Audio", 64, 19.5);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(pageTitle, pageWidth - 14, 13, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Informe de ventas · Página ${pageNumber}`, pageWidth - 14, 20, {
    align: "right",
  });
}

function drawSectionTitle(doc: jsPDF, title: string, x: number, y: number) {
  doc.setTextColor(16, 40, 58);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(title, x, y);
  doc.setDrawColor(8, 124, 145);
  doc.setLineWidth(0.7);
  doc.line(x, y + 2, x + 45, y + 2);
}

function drawTable(
  doc: jsPDF,
  x: number,
  y: number,
  columns: PdfColumn[],
  rows: string[][],
  options: { rowHeight?: number; fontSize?: number } = {},
): number {
  const rowHeight = options.rowHeight ?? 9;
  const fontSize = options.fontSize ?? 8;
  const tableWidth = columns.reduce((total, column) => total + column.width, 0);
  const headerHeight = 9;

  doc.setFillColor(231, 240, 246);
  doc.roundedRect(x, y, tableWidth, headerHeight, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(fontSize);
  doc.setTextColor(35, 57, 72);
  let columnX = x;
  for (const column of columns) {
    const textX =
      column.align === "right"
        ? columnX + column.width - 2
        : column.align === "center"
          ? columnX + column.width / 2
          : columnX + 2;
    doc.text(column.label, textX, y + 6, { align: column.align ?? "left" });
    columnX += column.width;
  }

  let currentY = y + headerHeight;
  let actualRowsHeight = 0;
  rows.forEach((row, rowIndex) => {
    const preparedCells = row.map((cell, cellIndex) =>
      doc.splitTextToSize(
        cell,
        Math.max(5, columns[cellIndex].width - 4),
      ) as string[],
    );
    const lines = Math.max(1, ...preparedCells.map((cell) => cell.length));
    const currentRowHeight = Math.max(rowHeight, lines * fontSize * 0.42 + 3);
    if (rowIndex % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(247, 250, 252);
    }
    doc.rect(x, currentY, tableWidth, currentRowHeight, "F");
    doc.setDrawColor(224, 232, 238);
    doc.setLineWidth(0.2);
    doc.line(x, currentY + currentRowHeight, x + tableWidth, currentY + currentRowHeight);
    doc.setTextColor(41, 55, 67);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    columnX = x;
    preparedCells.forEach((cellLines, cellIndex) => {
      const column = columns[cellIndex];
      const textX =
        column.align === "right"
          ? columnX + column.width - 2
          : column.align === "center"
            ? columnX + column.width / 2
            : columnX + 2;
      doc.text(cellLines, textX, currentY + 4, {
        align: column.align ?? "left",
        maxWidth: column.width - 4,
      });
      columnX += column.width;
    });
    currentY += currentRowHeight;
    actualRowsHeight += currentRowHeight;
  });

  doc.setDrawColor(203, 216, 226);
  doc.roundedRect(x, y, tableWidth, headerHeight + actualRowsHeight, 1, 1, "S");
  return currentY;
}

function drawMonthlyAreaChart(doc: jsPDF, analytics: SalesAnalytics, x: number, y: number) {
  const width = 267;
  const height = 104;
  const left = x + 23;
  const right = x + width - 4;
  const top = y + 8;
  const bottom = y + height - 15;
  const values = Array.from({ length: 12 }, (_, index) => {
    return analytics.monthlySales.find((entry) => entry.month === index + 1)
      ?.totalSales ?? 0;
  });
  const maximum = Math.max(1, ...values);
  const points = values.map((value, index) => ({
    x: left + (index / 11) * (right - left),
    y: bottom - (value / maximum) * (bottom - top),
  }));

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  for (let tick = 0; tick <= 4; tick += 1) {
    const ratio = tick / 4;
    const lineY = bottom - ratio * (bottom - top);
    doc.setDrawColor(222, 230, 236);
    doc.setLineWidth(0.25);
    doc.line(left, lineY, right, lineY);
    doc.setTextColor(84, 101, 115);
    doc.text(formatCOPCompact(maximum * ratio), left - 2, lineY - 1, {
      align: "right",
    });
  }

  doc.setDrawColor(34, 126, 200);
  doc.setFillColor(207, 231, 247);
  for (let index = 0; index < points.length - 1; index += 1) {
    doc.triangle(
      points[index].x,
      points[index].y,
      points[index + 1].x,
      points[index + 1].y,
      points[index + 1].x,
      bottom,
      "F",
    );
    doc.triangle(
      points[index].x,
      points[index].y,
      points[index + 1].x,
      bottom,
      points[index].x,
      bottom,
      "F",
    );
  }
  doc.setDrawColor(34, 126, 200);
  doc.setLineWidth(1.1);
  for (let index = 0; index < points.length - 1; index += 1) {
    doc.line(
      points[index].x,
      points[index].y,
      points[index + 1].x,
      points[index + 1].y,
    );
  }
  points.forEach((point, index) => {
    doc.setFillColor(34, 126, 200);
    doc.setDrawColor(255, 255, 255);
    doc.circle(point.x, point.y, 1.4, "FD");
    doc.setTextColor(70, 87, 100);
    doc.setFontSize(6.5);
    doc.text(MONTHS[index].slice(0, 3), point.x, bottom + 7, { align: "center" });
  });
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(218, 227, 233);
    doc.line(14, pageHeight - 10, pageWidth - 14, pageHeight - 10);
    doc.setTextColor(100, 116, 128);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(
      `Generado el ${new Intl.DateTimeFormat("es-CO", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date())}`,
      14,
      pageHeight - 5,
    );
    doc.text(`Página ${page} de ${pageCount}`, pageWidth - 14, pageHeight - 5, {
      align: "right",
    });
  }
}

export function downloadSalesReportPdf(analytics: SalesAnalytics): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const usableWidth = pageWidth - 28;
  const reportMonths =
    analytics.selectedMonth === undefined
      ? Array.from({ length: 12 }, (_, index) => index + 1)
      : [analytics.selectedMonth];
  const monthlyRows = reportMonths.map((monthNumber) => {
    const index = monthNumber - 1;
    const month = analytics.monthlySales.find(
      (item) => item.month === monthNumber,
    );
    const previous =
      index > 0
        ? analytics.monthlySales.find((item) => item.month === index)?.totalSales ?? 0
        : 0;
    const change =
      previous > 0 && month
        ? ((month.totalSales - previous) / previous) * 100
        : null;
    return [
      MONTHS[index],
      formatCOP(month?.totalSales ?? 0),
      String(month?.orders ?? 0),
      change === null
        ? "Sin comparación"
        : change === 0
          ? "Sin cambio"
          : `${change > 0 ? "Sube " : "Baja "}${Math.abs(change).toFixed(1)}%`,
    ];
  });
  const comparisonMonth =
    analytics.selectedMonth !== undefined
      ? analytics.selectedMonth - 1
      : analytics.selectedYear === new Date().getFullYear()
        ? new Date().getMonth()
        : 11;
  const monthSales =
    analytics.monthlySales.find((item) => item.month === comparisonMonth + 1)
      ?.totalSales ?? 0;
  const previousMonthSales =
    comparisonMonth > 0
      ? analytics.monthlySales.find((item) => item.month === comparisonMonth)
          ?.totalSales ?? 0
      : 0;
  const monthlyChange =
    previousMonthSales > 0
      ? ((monthSales - previousMonthSales) / previousMonthSales) * 100
      : null;

  drawBrandHeader(doc, "Análisis de ventas", 1);
  doc.setTextColor(16, 40, 58);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  const reportPeriod = analytics.selectedMonth
    ? `${MONTHS[analytics.selectedMonth - 1]} ${analytics.selectedYear}`
    : `Año ${analytics.selectedYear}`;
  doc.text(`Informe de ventas · ${reportPeriod}`, 14, 39);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 96, 109);
  doc.text("Resumen de ventas registradas para el período seleccionado.", 14, 46);

  const metrics = [
    [
      analytics.selectedMonth ? "Ventas del mes" : "Ventas del año",
      formatCOP(analytics.totalSales),
    ],
    [
      analytics.selectedMonth ? "Pedidos del mes" : "Pedidos registrados",
      analytics.totalOrders.toLocaleString("es-CO"),
    ],
    ["Ticket promedio", formatCOP(analytics.averageTicket)],
    [
      "Variación mensual",
      monthlyChange === null
        ? "Sin comparación"
        : `${monthlyChange > 0 ? "+" : ""}${monthlyChange.toFixed(1)}%`,
    ],
  ];
  const cardGap = 5;
  const cardWidth = (usableWidth - cardGap * 3) / 4;
  metrics.forEach(([label, value], index) => {
    const x = 14 + index * (cardWidth + cardGap);
    doc.setFillColor(244, 249, 251);
    doc.setDrawColor(207, 225, 233);
    doc.roundedRect(x, 54, cardWidth, 24, 2, 2, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(75, 93, 106);
    doc.text(label, x + 4, 62);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(8, 96, 116);
    doc.text(doc.splitTextToSize(value, cardWidth - 8)[0], x + 4, 71);
  });

  drawSectionTitle(
    doc,
    analytics.selectedMonth ? "Resumen del mes seleccionado" : "Evolución mensual de ventas",
    14,
    91,
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(83, 100, 113);
  if (analytics.selectedMonth) {
    doc.text(
      `${MONTHS[analytics.selectedMonth - 1]} ${analytics.selectedYear}: ${formatCOP(analytics.totalSales)} · ${analytics.totalOrders} pedidos`,
      14,
      101,
    );
  } else {
    doc.text("Ingresos por mes en pesos colombianos (COP).", 14, 98);
    drawMonthlyAreaChart(doc, analytics, 14, 100);
  }

  doc.addPage();
  drawBrandHeader(doc, "Detalle del período", 2);
  drawSectionTitle(doc, `Detalle mensual · ${reportPeriod}`, 14, 39);
  drawTable(
    doc,
    14,
    45,
    [
      { label: "Mes", width: 48 },
      { label: "Ventas (COP)", width: 75, align: "right" },
      { label: "Pedidos", width: 38, align: "right" },
      { label: "Cambio frente al mes anterior", width: 80, align: "right" },
    ],
    monthlyRows,
    { rowHeight: 8 },
  );
  addFooter(doc);
  const monthSuffix = analytics.selectedMonth
    ? `-${MONTHS[analytics.selectedMonth - 1]}`
    : "";
  doc.save(
    `SoftTech-Market-Informe-Ventas-${analytics.selectedYear}${monthSuffix}.pdf`,
  );
}
