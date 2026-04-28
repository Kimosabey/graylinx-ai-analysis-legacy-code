import React, { useState, useEffect } from "react";
import api from "../../api";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import "jspdf-autotable";

/* ── shared toolbar ── */
import TopTabBar from "./Toptabbar";
import { DownloadButton, EmailButton } from "./Actionbuttons";
import DateFilterBar from "./Datefilterbar";

/* ── Summary-only: collapsible groups ── */
import {
  CollapsibleSectionTable,
  SummaryTableHeader,
  SummaryBottomRows,
} from "./Collapsiblesectiontable";

/* ── flat dynamic table ── */
import DynamicTable from "./Dynamictable";

/* ── data and utilities ── */
import {
  SUMMARY_DATA,
  SUMMARY_BOTTOM_ROWS,
  formatSummaryApiData,
  ENERGY_METER_DATA,
  CHILLERS_DROPDOWN_LIST,
  CHILLER_PLANT_DATA,
  formatChillerApiData,
  formatChillerPlantApiData,
  formatBtuMeterApiData,
} from "./Summarydata";

/* ── Excel generator (uses ExcelJS — npm install exceljs file-saver --legacy-peer-deps) ── */
import { generateExcel } from "./ExcelGenerator";

/* ─── tab labels ─── */
const CONTENT_TABS = [
  "Summary",
  "Chiller Plant Energy",
  "Chillers",
  "BTU Meter",
];

/* ─── responsive styles injected once ─── */
const responsiveStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .ns-root {
    min-height: 100vh;
    width: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
  }

  .ns-container {
    background: #fff;
    width: 100%;
    margin: 0;
    padding: 0;
    border-radius: 0;
    box-sizing: border-box;
  }

  .ns-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    border-bottom: 1px solid #eee;
    width: 100%;
    box-sizing: border-box;
    flex-wrap: nowrap;
  }

  .ns-toolbar-spacer {
    flex: 1;
    min-width: 0;
  }

  .ns-toolbar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .ns-table-wrapper {
    width: 100%;
    overflow-x: auto;
    box-sizing: border-box;
    padding: 0 16px;
    -webkit-overflow-scrolling: touch;
  }

  .ns-summary-scroll {
    overflow-y: auto;
    overflow-x: auto;
    max-height: calc(100vh - 140px);
    width: 100%;
    -webkit-overflow-scrolling: touch;
  }

  .ns-loading {
    padding: 40px 20px;
    text-align: center;
    width: 100%;
  }

  .ns-spinner {
    display: inline-block;
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #0123B4;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 10px;
  }

  /* ── Small screens (mobile) ── */
  @media (max-width: 768px) {
    .ns-toolbar {
      flex-wrap: wrap;
      padding: 12px;
      gap: 8px;
    }

    .ns-toolbar-spacer {
      display: none;
    }

    .ns-toolbar-actions {
      width: 100%;
      justify-content: flex-end;
      flex-wrap: wrap;
      gap: 6px;
    }

    .ns-table-wrapper {
      padding: 0 8px;
    }

    .ns-summary-scroll {
      max-height: calc(100vh - 200px);
    }
  }

  /* ── Medium screens (tablet) ── */
  @media (min-width: 769px) and (max-width: 1024px) {
    .ns-toolbar {
      flex-wrap: wrap;
      padding: 14px 16px;
    }

    .ns-toolbar-actions {
      gap: 8px;
    }

    .ns-table-wrapper {
      padding: 0 12px;
    }
  }

  /* ── Large screens (1920px+) ── */
  @media (min-width: 1440px) {
    .ns-toolbar {
      padding: 16px 32px;
    }

    .ns-table-wrapper {
      padding: 0 24px;
    }
  }
`;

const NewSummary = () => {
  /* ── state ── */
  const [activeTab, setActiveTab] = useState("Summary");
  const [dateFilter, setDateFilter] = useState("Day");
  const [customDates, setCustomDates] = useState({ start: "", end: "" });
  const [selectedChiller, setSelectedChiller] = useState(
    CHILLERS_DROPDOWN_LIST[0],
  );

  /* ── API data state ── */
  const [chillerData, setChillerData] = useState({
    columns: [],
    rows: [],
  });
  const [chillerPlantData, setChillerPlantData] = useState({
    columns: [],
    rows: [],
  });
  const [btuMeterData, setBtuMeterData] = useState({
    columns: [],
    rows: [],
  });
  const [summaryData, setSummaryData] = useState({
    sections: SUMMARY_DATA,
    bottomRows: SUMMARY_BOTTOM_ROWS,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  /* ── stores last fetched date range for Excel header ── */
  const [lastDateRange, setLastDateRange] = useState({ start: "", end: "" });

  /* ── reset dropdown when entering Chillers tab ── */
  useEffect(() => {
    if (activeTab === "Chillers") {
      setSelectedChiller(CHILLERS_DROPDOWN_LIST[0]);
    }
  }, [activeTab]);

  /* ── Fetch data ── */
  useEffect(() => {
    if (
      activeTab !== "Chillers" &&
      activeTab !== "Chiller Plant Energy" &&
      activeTab !== "BTU Meter" &&
      activeTab !== "Summary"
    )
      return;

    const timeoutId = setTimeout(() => {
      const fetchData = async () => {
        const startTime = performance.now();
        setIsLoading(true);
        setApiError(null);

        try {
          let startDate, endDate;
          const now = new Date();

          if (dateFilter === "Custom") {
            startDate = customDates.start;
            endDate = customDates.end;
          } else if (dateFilter === "Day") {
            endDate = now.toISOString().split("T")[0];
            const dayAgo = new Date(now);
            dayAgo.setDate(dayAgo.getDate() - 1);
            startDate = dayAgo.toISOString().split("T")[0];
          } else if (dateFilter === "Week") {
            endDate = now.toISOString().split("T")[0];
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            startDate = weekAgo.toISOString().split("T")[0];
          } else if (dateFilter === "Month") {
            endDate = now.toISOString().split("T")[0];
            const monthAgo = new Date(now);
            monthAgo.setDate(monthAgo.getDate() - 30);
            startDate = monthAgo.toISOString().split("T")[0];
          }

          const formattedStart = `${startDate} 00:00:00`;
          const formattedEnd = `${endDate} 23:59:59`;

          /* ── save for Excel header ── */
          setLastDateRange({ start: formattedStart, end: formattedEnd });

          console.log("=".repeat(60));
          console.log(`[API CALL] ${activeTab}`);
          console.log("Start:", formattedStart);
          console.log("End:", formattedEnd);
          console.log("=".repeat(60));

          if (activeTab === "Chillers") {
            const isChiller1 = selectedChiller === "Chiller - 1";
            const isChiller2 = selectedChiller === "Chiller - 2";
            const isChiller3 = selectedChiller === "Chiller - 3";

            if (!isChiller1 && !isChiller2 && !isChiller3) return;

            const response = isChiller1
              ? await api.analytics.chiller1ReportData(
                  formattedStart,
                  formattedEnd,
                )
              : isChiller2
                ? await api.analytics.chiller2ReportData(
                    formattedStart,
                    formattedEnd,
                  )
                : await api.analytics.chiller3ReportData(
                    formattedStart,
                    formattedEnd,
                  );

            console.log("[API RESPONSE - Chillers]", response);

            if (response?.success && response?.data?.length > 0) {
              const formatted = formatChillerApiData(response);
              setChillerData(formatted);
            } else {
              setChillerData({ columns: [], rows: [] });
            }

          } else if (activeTab === "Chiller Plant Energy") {
            const response = await api.analytics.chillerPlantData(
              formattedStart,
              formattedEnd,
            );

            console.log("[API RESPONSE - Chiller Plant]", response);

            // ✅ FIX: API returns response.data as a flat array (not response.data.data)
            // Support both shapes to be safe
            const plantData = Array.isArray(response?.data)
              ? response.data
              : Array.isArray(response?.data?.data)
                ? response.data.data
                : [];

            if (response?.success && plantData.length > 0) {
              const formatted = formatChillerPlantApiData(response);
              setChillerPlantData(formatted);
            } else {
              setChillerPlantData({ columns: [], rows: [] });
            }

          } else if (activeTab === "BTU Meter") {
            const response = await api.analytics.btuMeterData(
              formattedStart,
              formattedEnd,
            );

            console.log("[API RESPONSE - BTU Meter]", response);

            if (response?.success && response?.data?.length > 0) {
              const formatted = formatBtuMeterApiData(response);
              setBtuMeterData(formatted);
            } else {
              setBtuMeterData({ columns: [], rows: [] });
            }

          } else if (activeTab === "Summary") {
            const response = await api.analytics.summaryData(
              formattedStart,
              formattedEnd,
            );

            console.log("[API RESPONSE - Summary]", response);

            if (response?.success && response?.data) {
              const formatted = formatSummaryApiData(response);
              setSummaryData(formatted);
            } else {
              setSummaryData({
                sections: SUMMARY_DATA,
                bottomRows: SUMMARY_BOTTOM_ROWS,
              });
            }
          }
        } catch (err) {
          console.error("[API ERROR]", err);
          setApiError(err.message);
          if (activeTab === "Chillers")
            setChillerData({ columns: [], rows: [] });
          if (activeTab === "Chiller Plant Energy")
            setChillerPlantData({ columns: [], rows: [] });
          if (activeTab === "BTU Meter")
            setBtuMeterData({ columns: [], rows: [] });
          if (activeTab === "Summary")
            setSummaryData({
              sections: SUMMARY_DATA,
              bottomRows: SUMMARY_BOTTOM_ROWS,
            });
        } finally {
          setIsLoading(false);
          const endTime = performance.now();
          console.log(
            `[PERFORMANCE] ${activeTab} loaded in ${(
              endTime - startTime
            ).toFixed(0)}ms`,
          );
        }
      };

      fetchData();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    activeTab,
    dateFilter,
    customDates.start,
    customDates.end,
    selectedChiller,
  ]);

  /* ── placeholder API trigger for other tabs ── */
  useEffect(() => {
    if (
      activeTab === "Chillers" ||
      activeTab === "Chiller Plant Energy" ||
      activeTab === "BTU Meter" ||
      activeTab === "Summary"
    )
      return;

    const params =
      dateFilter === "Custom"
        ? { from: customDates.start, to: customDates.end }
        : { period: dateFilter };

    console.log("[API TRIGGER]", activeTab, params);
  }, [activeTab, dateFilter, customDates.start, customDates.end]);

  /* ── CSV helpers ── */
  const convertToCSV = (columns, rows) => {
    if (!columns || !rows || rows.length === 0) return "";

    const header = columns
      .map((col) => {
        const colStr = String(col);
        if (colStr.includes(",") || colStr.includes('"') || colStr.includes("\n")) {
          return `"${colStr.replace(/"/g, '""')}"`;
        }
        return colStr;
      })
      .join(",");

    const csvRows = rows.map((row) =>
      row
        .map((cell) => {
          const cellStr = String(cell);
          if (
            cellStr.includes(",") ||
            cellStr.includes('"') ||
            cellStr.includes("\n")
          ) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(","),
    );

    return [header, ...csvRows].join("\n");
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ── helpers: report meta for Excel header ── */
  const getReportMeta = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const reportDate =
      `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}, ` +
      `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    return {
      reportDate,
      fromDate: lastDateRange.start || "N/A",
      toDate:   lastDateRange.end   || "N/A",
      location: "Jupiter Hospitals, Dombivali",
    };
  };

  /* ── handlers ── */
  const handleDownload = async (format) => {
    const today = new Date().toISOString().split("T")[0];

    /* ─── CSV (original logic preserved exactly) ─── */
    if (format === "CSV") {
      let csvContent = "";
      let filename = "";

      switch (activeTab) {
        case "Chillers":
          csvContent = convertToCSV(chillerData.columns, chillerData.rows);
          filename = `${selectedChiller}_Report_${
            new Date().toISOString().split("T")[0]
          }.csv`;
          break;
        case "BTU Meter":
          csvContent = convertToCSV(btuMeterData.columns, btuMeterData.rows);
          filename = `BTU_Meter_Report_${
            new Date().toISOString().split("T")[0]
          }.csv`;
          break;
        case "Chiller Plant Energy":
          csvContent = convertToCSV(
            chillerPlantData.columns,
            chillerPlantData.rows,
          );
          filename = `Chiller_Plant_Report_${
            new Date().toISOString().split("T")[0]
          }.csv`;
          break;
        case "Summary":
          const summaryColumns = [
            "DESCRIPTION",
            "RUN HOURS",
            "COMMITTED",
            "ACTUAL",
            "DIFFERENCE",
          ];
          const summaryRows = [];

          summaryData.sections.forEach((section) => {
            summaryRows.push([section.title, "", "", "", ""]);
            section.rows.forEach((row) => {
              summaryRows.push([
                row.description,
                row.runHours,
                row.committedKwh,
                row.actualKwh,
                row.difference,
              ]);
            });
            if (section.totalRow) {
              summaryRows.push([
                section.totalRow.description,
                section.totalRow.runHours,
                section.totalRow.committedKwh,
                section.totalRow.actualKwh,
                section.totalRow.difference,
              ]);
            }
          });

          summaryData.bottomRows.forEach((row) => {
            summaryRows.push([
              row.description,
              row.runHours,
              row.committedKwh,
              row.actualKwh,
              row.difference,
            ]);
          });

          csvContent = convertToCSV(summaryColumns, summaryRows);
          filename = `Summary_Report_${
            new Date().toISOString().split("T")[0]
          }.csv`;
          break;
        default:
          alert("No data available to download");
          return;
      }

      if (csvContent) {
        downloadCSV(csvContent, filename);
      } else {
        alert("No data available to download");
      }
      return;
    }

    /* ─── Excel ─── */
    if (format === "Excel") {
      const meta = getReportMeta();
      try {
        if (activeTab === "Chillers") {
          if (!chillerData.rows.length) { alert("No data available to download"); return; }
          await generateExcel({
            reportTitle: `PERFORMANCE REPORT FOR ${selectedChiller.toUpperCase()}`,
            ...meta,
            tableType: "chiller",
            columns:  chillerData.columns,
            rows:     chillerData.rows,
            filename: `${selectedChiller}_Report_${today}.xlsx`,
          });
        } else if (activeTab === "BTU Meter") {
          if (!btuMeterData.rows.length) { alert("No data available to download"); return; }
          await generateExcel({
            reportTitle: "BTU METER REPORT",
            ...meta,
            tableType: "btu",
            columns:  btuMeterData.columns,
            rows:     btuMeterData.rows,
            filename: `BTU_Meter_Report_${today}.xlsx`,
          });
        } else if (activeTab === "Chiller Plant Energy") {
          if (!chillerPlantData.rows.length) { alert("No data available to download"); return; }
          await generateExcel({
            reportTitle: "CHILLER PLANT ENERGY REPORT",
            ...meta,
            tableType: "plant",
            columns:  chillerPlantData.columns,
            rows:     chillerPlantData.rows,
            filename: `Chiller_Plant_Report_${today}.xlsx`,
          });
        } else if (activeTab === "Summary") {
          await generateExcel({
            reportTitle: "CHILLER PLANT SUMMARY REPORT",
            ...meta,
            sections:   summaryData.sections,
            bottomRows: summaryData.bottomRows,
            filename:   `Summary_Report_${today}.xlsx`,
          });
        } else {
          alert("No data available to download");
        }
      } catch (err) {
        console.error("[Excel Export Error]", err);
        alert("Failed to generate Excel file. Please try again.");
      }
    }
  };

  const handleEmail = async (email) => {
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email address");
    }

    try {
      let startDate, endDate;
      const now = new Date();

      if (dateFilter === "Custom") {
        startDate = customDates.start;
        endDate = customDates.end;
      } else if (dateFilter === "Day") {
        endDate = now.toISOString().split("T")[0];
        const dayAgo = new Date(now);
        dayAgo.setDate(dayAgo.getDate() - 1);
        startDate = dayAgo.toISOString().split("T")[0];
      } else if (dateFilter === "Week") {
        endDate = now.toISOString().split("T")[0];
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        startDate = weekAgo.toISOString().split("T")[0];
      } else if (dateFilter === "Month") {
        endDate = now.toISOString().split("T")[0];
        const monthAgo = new Date(now);
        monthAgo.setDate(monthAgo.getDate() - 30);
        startDate = monthAgo.toISOString().split("T")[0];
      }

      const formattedStart = `${startDate} 00:00:00`;
      const formattedEnd = `${endDate} 23:59:59`;

      let reportType = "";

      switch (activeTab) {
        case "Chillers":
          reportType =
            selectedChiller === "Chiller - 1" ? "chiller1" : selectedChiller === "Chiller - 2" ? "chiller2" : "chiller3";
          break;
        case "BTU Meter":
          reportType = "btuMeter";
          break;
        case "Chiller Plant Energy":
          reportType = "chillerPlant";
          break;
        case "Summary":
          reportType = "summary";
          break;
        default:
          throw new Error("Unknown tab for email");
      }

      console.log("[EMAIL] Sending report:", {
        email,
        reportType,
        startDate: formattedStart,
        endDate: formattedEnd,
      });

      const response = await api.analytics.sendReportEmail({
        email,
        reportType,
        startDate: formattedStart,
        endDate: formattedEnd,
      });

      console.log("[EMAIL] Response:", response);

      if (response?.success) {
        return { success: true };
      } else {
        throw new Error(response?.message || "Failed to send email");
      }
    } catch (error) {
      console.error("[EMAIL] Error:", error);
      throw error;
    }
  };

  const handleDropdownSelect = (tab, option) => {
    if (tab === "Chillers") setSelectedChiller(option);
  };

  /* ── render helpers ── */
  const renderLoadingState = (message) => (
    <div className="ns-loading">
      <div className="ns-spinner"></div>
      <div style={{ fontSize: "14px", color: "#666" }}>{message}</div>
    </div>
  );

  const renderErrorState = () => (
    <div style={{ padding: "40px 20px", color: "red", width: "100%" }}>
      Error loading data: {apiError}
    </div>
  );

  const renderEmptyState = () => (
    <div style={{ padding: "40px 20px", width: "100%" }}>
      No data available for selected date range
    </div>
  );

  const renderSummaryTab = () => (
    <div className="ns-summary-scroll">
      <SummaryTableHeader />
      {summaryData.sections.map((section) => (
        <CollapsibleSectionTable
          key={section.title}
          title={section.title}
          rows={section.rows}
          totalRow={section.totalRow}
          defaultOpen={false}
        />
      ))}
      <SummaryBottomRows rows={summaryData.bottomRows} />
    </div>
  );

  const renderChillersTab = () => {
    if (isLoading) return renderLoadingState("Loading chiller data...");
    if (apiError) return renderErrorState();
    if (!chillerData.rows.length) return renderEmptyState();
    return (
      <DynamicTable columns={chillerData.columns} rows={chillerData.rows} />
    );
  };

  const renderChillerPlantTab = () => {
    if (isLoading) return renderLoadingState("Loading chiller plant data...");
    if (apiError) return renderErrorState();
    if (!chillerPlantData.rows.length) return renderEmptyState();
    return (
      <DynamicTable
        columns={chillerPlantData.columns}
        rows={chillerPlantData.rows}
      />
    );
  };

  const renderBtuMeterTab = () => {
    if (isLoading) return renderLoadingState("Loading BTU meter data...");
    if (apiError) return renderErrorState();
    if (!btuMeterData.rows.length) return renderEmptyState();
    return (
      <DynamicTable columns={btuMeterData.columns} rows={btuMeterData.rows} />
    );
  };

  const renderTableArea = () => {
    switch (activeTab) {
      case "Summary":
        return renderSummaryTab();
      case "Chillers":
        return renderChillersTab();
      case "BTU Meter":
        return renderBtuMeterTab();
      case "Chiller Plant Energy":
        return renderChillerPlantTab();
      default:
        return null;
    }
  };

  return (
    <>
      <style>{responsiveStyles}</style>

      <div className="ns-root">
        <div className="ns-container">
          {/* ── Toolbar ── */}
          <div className="ns-toolbar">
            <TopTabBar
              tabs={CONTENT_TABS}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              dropdownTabs={["Chillers"]}
              dropdownOptions={{ Chillers: CHILLERS_DROPDOWN_LIST }}
              selectedDropdown={{ Chillers: selectedChiller }}
              onDropdownSelect={handleDropdownSelect}
            />

            <div className="ns-toolbar-spacer" />

            <div className="ns-toolbar-actions">
              <DownloadButton onDownload={handleDownload} />
              <EmailButton onEmail={handleEmail} />
            </div>

            <DateFilterBar
              selectedFilter={dateFilter}
              onFilterChange={setDateFilter}
              customDates={customDates}
              onCustomDatesChange={setCustomDates}
            />
          </div>

          {/* ── Table Content ── */}
          <div className="ns-table-wrapper">{renderTableArea()}</div>
        </div>
      </div>
    </>
  );
};

export default NewSummary;