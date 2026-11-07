import { useEffect, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { SalesAnalytics } from "../../types";
import { formatCOP, formatCOPCompact } from "../../utils/formatters";
import { fetchSalesAnalytics } from "../../utils/salesAnalyticsApi";
import { TechEcommerceBackgroundBanner } from "../TechEcommerceBackgroundBanner";
import {
  downloadSalesReportCsv,
  downloadSalesReportExcel,
} from "../../utils/salesAnalyticsExport";
import { DataTable, type DataTableColumn } from "./DataTable";

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

type AnnualTableRow = SalesAnalytics["annualSales"][number];
type MonthlyTableRow = {
  month: number;
  label: string;
  totalSales: number;
  orders: number;
  change: number | null;
};

const monthlyColumns: DataTableColumn<MonthlyTableRow>[] = [
  {
    key: "month",
    label: "Mes",
    sortValue: (row) => row.month,
    render: (row) => row.label,
  },
  {
    key: "sales",
    label: "Ventas",
    sortValue: (row) => row.totalSales,
    className: "whitespace-nowrap text-right",
    headerClassName: "text-right",
    render: (row) => formatCOP(row.totalSales),
  },
  {
    key: "orders",
    label: "Pedidos",
    sortValue: (row) => row.orders,
    className: "text-right",
    headerClassName: "text-right",
    render: (row) => row.orders.toLocaleString("es-CO"),
  },
  {
    key: "change",
    label: "Cambio vs. mes anterior",
    sortValue: (row) => row.change ?? Number.NEGATIVE_INFINITY,
    className: "whitespace-nowrap text-right font-semibold",
    headerClassName: "text-right",
    render: (row) =>
      row.change === null ? (
        <span className="text-slate-600">Sin comparación</span>
      ) : (
        <span className={row.change < 0 ? "text-red-800" : "text-green-800"}>
          {row.change > 0 ? "Sube " : row.change < 0 ? "Baja " : ""}
          {row.change === 0 ? "Sin cambio" : `${Math.abs(row.change).toFixed(1)}%`}
        </span>
      ),
  },
];

const annualColumns: DataTableColumn<AnnualTableRow>[] = [
  {
    key: "year",
    label: "Año",
    sortValue: (row) => row.year,
    render: (row) => row.year,
  },
  {
    key: "sales",
    label: "Ventas",
    sortValue: (row) => row.totalSales,
    className: "whitespace-nowrap text-right font-semibold",
    headerClassName: "text-right",
    render: (row) => formatCOP(row.totalSales),
  },
  {
    key: "orders",
    label: "Pedidos",
    sortValue: (row) => row.orders,
    className: "text-right",
    headerClassName: "text-right",
    render: (row) => row.orders.toLocaleString("es-CO"),
  },
];

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof CircleDollarSign;
}) {
  return (
    <article className="rounded-2xl border border-[#cbdfea] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-bold text-slate-700">{label}</p>
        <Icon className="h-5 w-5 shrink-0 text-[#087c91]" aria-hidden="true" />
      </div>
      <p className="mt-3 text-2xl font-black text-[#10283a]">{value}</p>
      <p className="mt-1 text-xs text-slate-600">{detail}</p>
    </article>
  );
}

export function SalesAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>();
  const [selectedMonth, setSelectedMonth] = useState<number>();
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    void fetchSalesAnalytics(selectedYear, selectedMonth, controller.signal)
      .then((result) => {
        setAnalytics({ ...result, selectedMonth });
        if (selectedYear === undefined) setSelectedYear(result.selectedYear);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          reason instanceof Error
            ? reason.message
            : "No se pudo consultar el análisis de ventas.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [selectedYear, selectedMonth, refreshCount]);

  const monthlyMax = Math.max(
    1,
    ...(analytics?.monthlySales.map((month) => month.totalSales) ?? []),
  );
  const annualMax = Math.max(
    1,
    ...(analytics?.annualSales.map((year) => year.totalSales) ?? []),
  );
  const topRevenueProducts = analytics?.topRevenueProducts ?? [];
  const topProductRevenueMax = Math.max(
    1,
    ...topRevenueProducts.map((product) => product.totalSales),
  );
  const monthlyData = (selectedMonth === undefined
    ? MONTHS.map((_, index) => index + 1)
    : [selectedMonth]
  ).map((month) => ({
    month,
    totalSales:
      analytics?.monthlySales.find((entry) => entry.month === month)
        ?.totalSales ?? 0,
    orders:
      analytics?.monthlySales.find((entry) => entry.month === month)?.orders ??
      0,
  }));
  const monthlyTableData: MonthlyTableRow[] = monthlyData.map((entry) => {
    const previous = monthlyData.find(
      (month) => month.month === entry.month - 1,
    );
    return {
      ...entry,
      label: MONTHS[entry.month - 1],
      change:
        previous && previous.totalSales > 0
          ? ((entry.totalSales - previous.totalSales) / previous.totalSales) * 100
          : null,
    };
  });

  const chart = { width: 720, height: 300, left: 68, right: 18, top: 20, bottom: 42 };
  const plotWidth = chart.width - chart.left - chart.right;
  const plotHeight = chart.height - chart.top - chart.bottom;
  const monthlyPoints = monthlyData.map((entry, index) => ({
    x:
      chart.left +
      (index / Math.max(monthlyData.length - 1, 1)) * plotWidth,
    y: chart.top + plotHeight - (entry.totalSales / monthlyMax) * plotHeight,
  }));
  const areaPath = [
    `M ${monthlyPoints[0].x} ${chart.top + plotHeight}`,
    ...monthlyPoints.map((point) => `L ${point.x} ${point.y}`),
    `L ${monthlyPoints[monthlyPoints.length - 1].x} ${chart.top + plotHeight}`,
    "Z",
  ].join(" ");
  const linePath = monthlyPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const currentMonthIndex =
    selectedMonth ?? (analytics?.selectedYear === new Date().getFullYear()
      ? new Date().getMonth() + 1
      : 12);
  const currentMonthSales =
    analytics?.monthlySales.find((entry) => entry.month === currentMonthIndex)
      ?.totalSales ?? 0;
  const previousMonthSales =
    currentMonthIndex > 1
      ? analytics?.monthlySales.find(
          (entry) => entry.month === currentMonthIndex - 1,
        )?.totalSales ?? 0
      : 0;
  const monthlyChange =
    selectedMonth === undefined && previousMonthSales > 0
      ? ((currentMonthSales - previousMonthSales) / previousMonthSales) * 100
      : null;
  const selectedPeriodLabel = selectedMonth
    ? `${MONTHS[selectedMonth - 1]} ${selectedYear ?? analytics?.selectedYear ?? ""}`
    : `el año ${selectedYear ?? analytics?.selectedYear ?? ""}`;

  return (
    <section
      aria-labelledby="sales-analytics-title"
      className="relative isolate space-y-6 overflow-hidden rounded-3xl border border-[#d6e5ee] bg-[#f3f8fb] p-4 sm:p-6"
    >
      <TechEcommerceBackgroundBanner className="rounded-3xl" opacity={0.055} />
      <div className="relative z-10 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="sales-analytics-title"
            className="flex items-center gap-2 text-xl font-black text-[#10283a]"
          >
            <BarChart3 className="h-6 w-6 text-[#087c91]" aria-hidden="true" />
            Análisis de ventas
          </h2>
          <p className="mt-1 text-sm text-slate-700">
            Consulta las compras registradas por año o por mes específico.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="sales-analytics-year" className="text-sm font-bold text-slate-700">
            Año
          </label>
          <select
            id="sales-analytics-year"
            value={selectedYear ?? analytics?.selectedYear ?? ""}
            onChange={(event) => setSelectedYear(Number(event.target.value))}
            disabled={!analytics?.years.length}
            className="min-h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
          >
            {(analytics?.years ?? []).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <label htmlFor="sales-analytics-month" className="text-sm font-bold text-slate-700">
            Mes
          </label>
          <select
            id="sales-analytics-month"
            value={selectedMonth ?? ""}
            onChange={(event) =>
              setSelectedMonth(
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
            className="min-h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
          >
            <option value="">Todos los meses</option>
            {MONTHS.map((month, index) => (
              <option key={month} value={index + 1}>{month}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setRefreshCount((count) => count + 1)}
            disabled={isLoading}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-800 hover:bg-slate-100 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            Actualizar
          </button>
          <button
            type="button"
            onClick={() => {
              if (!analytics) return;
              setReportError(null);
              try {
                downloadSalesReportCsv(analytics);
              } catch (reason) {
                console.error("No se pudo exportar el CSV de ventas:", reason);
                setReportError("No se pudo generar el informe CSV.");
              }
            }}
            disabled={!analytics || isLoading}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-blue-700 bg-blue-700 px-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            CSV
          </button>
          <button
            type="button"
            onClick={() => {
              if (!analytics) return;
              setReportError(null);
              try {
                downloadSalesReportExcel(analytics);
              } catch (reason) {
                console.error("No se pudo exportar Excel de ventas:", reason);
                setReportError("No se pudo generar el informe Excel.");
              }
            }}
            disabled={!analytics || isLoading}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-green-700 bg-green-700 px-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
            Excel
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!analytics) return;
              setPdfError(null);
              setIsDownloadingPdf(true);
              try {
                const { downloadSalesReportPdf } = await import(
                  "../../utils/salesReportPdf"
                );
                downloadSalesReportPdf(analytics);
              } catch (reason) {
                console.error("No se pudo generar el informe PDF de ventas:", reason);
                setPdfError(
                  reason instanceof Error
                    ? reason.message
                    : "Ocurrió un error al generar el informe PDF.",
                );
              } finally {
                setIsDownloadingPdf(false);
              }
            }}
            disabled={!analytics || isLoading || isDownloadingPdf}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#087c91] bg-[#087c91] px-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#066579] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {isDownloadingPdf ? "Generando PDF..." : "Descargar informe PDF"}
          </button>
        </div>
      </div>

      {reportError && (
        <div
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-900"
        >
          {reportError}
        </div>
      )}

      {pdfError && (
        <div
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-900"
        >
          No se pudo descargar el PDF: {pdfError}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-900"
        >
          {error} Verifica la conexión con la API y la base de datos, e inténtalo
          de nuevo.
        </div>
      )}

      {isLoading && (
        <p role="status" className="text-sm font-semibold text-slate-700">
          Cargando datos de ventas...
        </p>
      )}

      {analytics && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label={selectedMonth ? "Ventas del mes" : "Ventas del año"}
              value={formatCOP(analytics.totalSales)}
              detail={`Facturación registrada en ${selectedPeriodLabel}`}
              icon={CircleDollarSign}
            />
            <MetricCard
              label={selectedMonth ? "Pedidos del mes" : "Pedidos del año"}
              value={analytics.totalOrders.toLocaleString("es-CO")}
              detail={`Pedidos registrados en ${selectedPeriodLabel}`}
              icon={ShoppingBag}
            />
            <MetricCard
              label="Ticket promedio"
              value={formatCOP(analytics.averageTicket)}
              detail="Venta promedio por pedido"
              icon={TrendingUp}
            />
            <MetricCard
              label="Variación mensual"
              value={
                monthlyChange === null
                  ? "Sin comparación"
                  : `${monthlyChange > 0 ? "+" : ""}${monthlyChange.toFixed(1)}%`
              }
              detail={
                selectedMonth
                  ? `Variación mensual no disponible para el filtro ${selectedPeriodLabel}`
                  : `Mes actual frente al anterior de ${analytics.selectedYear}`
              }
              icon={monthlyChange !== null && monthlyChange < 0 ? TrendingDown : TrendingUp}
            />
          </div>

          {analytics.totalOrders === 0 && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
              Aún no hay compras registradas en la base de datos para este año.
              Los pedidos de demostración guardados en el navegador no se
              contabilizan como ventas reales.
            </div>
          )}

          <div className="grid grid-cols-1 gap-5">
            <article className="rounded-2xl border border-[#cbdfea] bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-base font-black text-[#10283a]">
                <CalendarDays className="h-5 w-5 text-[#087c91]" aria-hidden="true" />
                {selectedMonth
                  ? `Ventas de ${MONTHS[selectedMonth - 1]} ${analytics.selectedYear}`
                  : `Comparativa mensual — ${analytics.selectedYear}`}
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                {selectedMonth
                  ? "Desglose de ventas para el mes seleccionado."
                  : "Evolución de los ingresos mensuales durante el año seleccionado."}
              </p>
              <div
                role="img"
                aria-label={`Gráfico de ventas para ${selectedPeriodLabel}`}
                className="mt-5 w-full overflow-x-auto"
              >
                <svg
                  viewBox={`0 0 ${chart.width} ${chart.height}`}
                  className="min-w-[38rem]"
                  role="presentation"
                >
                  <defs>
                    <linearGradient id="monthly-sales-area" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#2788da" stopOpacity="0.32" />
                      <stop offset="100%" stopColor="#2788da" stopOpacity="0.04" />
                    </linearGradient>
                  </defs>
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                    const y = chart.top + plotHeight - ratio * plotHeight;
                    return (
                      <g key={ratio}>
                        <line
                          x1={chart.left}
                          x2={chart.width - chart.right}
                          y1={y}
                          y2={y}
                          stroke="#dce4eb"
                          strokeDasharray={ratio === 0 ? undefined : "3 4"}
                        />
                        <text
                          x={chart.left - 8}
                          y={y + 4}
                          textAnchor="end"
                          className="fill-slate-600"
                          fontSize="10"
                        >
                          {formatCOPCompact(monthlyMax * ratio)}
                        </text>
                      </g>
                    );
                  })}
                  <path d={areaPath} fill="url(#monthly-sales-area)" />
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#1878c8"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {monthlyPoints.map((point, index) => (
                    <g key={monthlyData[index].month}>
                      <title>
                        {MONTHS[monthlyData[index].month - 1]}: {formatCOP(monthlyData[index].totalSales)} ·{" "}
                        {monthlyData[index].orders} pedidos
                      </title>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="5"
                        fill="#1878c8"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <text
                        x={point.x}
                        y={chart.height - 12}
                        textAnchor="middle"
                        className="fill-slate-700"
                        fontSize="10"
                        fontWeight="600"
                      >
                        {MONTHS[monthlyData[index].month - 1]}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
              <DataTable
                caption="Ventas mensuales"
                rows={monthlyTableData}
                columns={monthlyColumns}
                getRowKey={(row) => String(row.month)}
                getSearchText={(row) =>
                  `${row.label} ${row.month} ${row.totalSales} ${row.orders}`
                }
                emptyMessage="No hay ventas mensuales para mostrar."
                initialPageSize={12}
              />
            </article>

            {selectedMonth === undefined && (
              <article className="rounded-2xl border border-[#cbdfea] bg-white p-5 shadow-sm">
                <h3 className="flex items-center gap-2 text-base font-black text-[#10283a]">
                  <BarChart3 className="h-5 w-5 text-[#087c91]" aria-hidden="true" />
                  Ventas por año
                </h3>
              {analytics.annualSales.length === 0 ? (
                <p className="mt-4 text-sm text-slate-600">No hay ventas para comparar.</p>
              ) : (
                <div className="mt-5 space-y-4">
                  {analytics.annualSales.map((entry) => (
                    <div key={entry.year}>
                      <div className="mb-1 flex justify-between gap-3 text-sm">
                        <span className="font-bold text-slate-800">{entry.year}</span>
                        <span className="font-semibold text-slate-700">
                          {formatCOP(entry.totalSales)} · {entry.orders} pedidos
                        </span>
                      </div>
                      <div
                        className="h-3 overflow-hidden rounded-full bg-slate-100"
                        role="img"
                        aria-label={`Ventas ${entry.year}: ${formatCOP(entry.totalSales)}`}
                      >
                        <div
                          className="h-full rounded-full bg-[#13869a]"
                          style={{
                            width: `${(entry.totalSales / annualMax) * 100}%`,
                            minWidth: entry.totalSales > 0 ? "0.35rem" : "0",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-5">
                <DataTable
                  caption="Ventas por año"
                  rows={analytics.annualSales}
                  columns={annualColumns}
                  getRowKey={(row) => String(row.year)}
                  getSearchText={(row) => `${row.year} ${row.totalSales} ${row.orders}`}
                  emptyMessage="No hay ventas para comparar."
                />
              </div>
              </article>
            )}
          </div>

          {selectedMonth === undefined && (
          <article className="overflow-hidden rounded-2xl border border-[#b9dce5] bg-gradient-to-br from-white via-[#f5fbfc] to-[#e5f5f7] p-5 shadow-md sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-black text-[#10283a]">
                  <ShoppingBag className="h-5 w-5 text-[#087c91]" aria-hidden="true" />
                  Ingresos por producto
                </h3>
                <p className="mt-1 text-sm text-slate-700">
                  Los cinco productos que más facturación generaron en{" "}
                  {selectedPeriodLabel}.
                </p>
              </div>
              <span className="w-fit rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-950">
                Clasificación por ventas totales
              </span>
            </div>

            {topRevenueProducts.length === 0 ? (
              <p className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-center text-sm font-semibold text-slate-600">
                Aún no hay ventas por producto para este año.
              </p>
            ) : (
              <div
                role="img"
                aria-label={`Gráfica de barras de ingresos por producto en ${selectedPeriodLabel}`}
                className="mt-5 w-full overflow-x-auto"
              >
                <svg viewBox="0 0 720 340" className="min-w-[38rem]" role="presentation">
                  <defs>
                    <linearGradient id="product-revenue-bars" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#2584d2" />
                      <stop offset="100%" stopColor="#1261ad" />
                    </linearGradient>
                    <linearGradient id="product-revenue-best" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#f5be32" />
                      <stop offset="100%" stopColor="#e79713" />
                    </linearGradient>
                  </defs>
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                    const y = 250 - ratio * 205;
                    return (
                      <g key={ratio}>
                        <line
                          x1="82"
                          x2="700"
                          y1={y}
                          y2={y}
                          stroke="#dce4eb"
                          strokeDasharray={ratio === 0 ? undefined : "3 4"}
                        />
                        <text
                          x="72"
                          y={y + 4}
                          textAnchor="end"
                          className="fill-slate-600"
                          fontSize="10"
                        >
                          {formatCOPCompact(topProductRevenueMax * ratio)}
                        </text>
                      </g>
                    );
                  })}
                  {topRevenueProducts.map((product, index) => {
                    const slotWidth = 618 / topRevenueProducts.length;
                    const barWidth = Math.min(68, slotWidth * 0.56);
                    const barHeight = (product.totalSales / topProductRevenueMax) * 205;
                    const x = 82 + slotWidth * index + (slotWidth - barWidth) / 2;
                    const y = 250 - barHeight;
                    const label =
                      product.name.length > 18
                        ? `${product.name.slice(0, 16)}…`
                        : product.name;
                    return (
                      <g key={product.productId}>
                        <title>
                          {product.name}: {formatCOP(product.totalSales)} ·{" "}
                          {product.unitsSold} unidades · {product.orders} pedidos
                        </title>
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          rx="5"
                          fill={index === 0 ? "url(#product-revenue-best)" : "url(#product-revenue-bars)"}
                        />
                        <text
                          x={x + barWidth / 2}
                          y={Math.max(34, y - 8)}
                          textAnchor="middle"
                          className="fill-slate-800"
                          fontSize="10"
                          fontWeight="700"
                        >
                          {formatCOPCompact(product.totalSales)}
                        </text>
                        <text
                          x={x + barWidth / 2}
                          y="269"
                          textAnchor="middle"
                          className="fill-slate-700"
                          fontSize="10"
                          fontWeight="700"
                        >
                          <tspan x={x + barWidth / 2}>{label}</tspan>
                          <tspan x={x + barWidth / 2} dy="14" fontWeight="500">
                            {product.unitsSold} unidades
                          </tspan>
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </article>
          )}

        </>
      )}
      </div>
    </section>
  );
}
