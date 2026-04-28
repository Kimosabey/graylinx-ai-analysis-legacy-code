import React, { useState, useRef, useEffect } from "react";

const DateFilterBar = ({ selectedFilter, onFilterChange, customDates, onCustomDatesChange }) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [startDate, setStartDate] = useState(customDates?.start || "");
  const [endDate, setEndDate] = useState(customDates?.end || "");
  const modalRef = useRef(null);

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowCustomModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filters = ["Day", "Week", "Month", "Custom"]; // Added "Day" for last 24 hours

  const handleFilterClick = (filter) => {
    if (filter === "Custom") {
      setShowCustomModal(true);
    } else {
      onFilterChange(filter);
      setShowCustomModal(false);
    }
  };

  const handleApplyCustom = () => {
    if (startDate && endDate) {
      onCustomDatesChange({ start: startDate, end: endDate });
      onFilterChange("Custom");
      setShowCustomModal(false);
    }
  };

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "4px" }}>
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => handleFilterClick(filter)}
          style={{
            padding: "8px 20px",
            border: "1px solid #c8cdd2",
            background:
              selectedFilter === filter || (filter === "Custom" && showCustomModal)
                ? "#0123B4"
                : "#ffffff",
            color:
              selectedFilter === filter || (filter === "Custom" && showCustomModal)
                ? "#ffffff"
                : "#3a4150",
            borderRadius: filter === "Day" ? "6px 0 0 6px" : filter === "Custom" ? "0 6px 6px 0" : "0",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: selectedFilter === filter ? "600" : "500",
            transition: "all 0.15s ease",
            borderLeft: filter !== "Day" ? "none" : "1px solid #c8cdd2",
          }}
        >
          {filter}
        </button>
      ))}

      {/* Custom Date Picker Modal */}
      {showCustomModal && (
        <div
          ref={modalRef}
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            padding: "20px",
            zIndex: 100,
            width: "280px",
          }}
        >
          <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: "600", color: "#3a4150" }}>
            Select Date Range
          </p>

          <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "13px",
              marginBottom: "12px",
              marginTop: "4px",
              boxSizing: "border-box",
              outline: "none",
            }}
          />

          <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "13px",
              marginBottom: "16px",
              marginTop: "4px",
              boxSizing: "border-box",
              outline: "none",
            }}
          />

          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button
              onClick={() => setShowCustomModal(false)}
              style={{
                padding: "7px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                background: "#fff",
                color: "#6b7280",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleApplyCustom}
              style={{
                padding: "7px 16px",
                border: "none",
                borderRadius: "6px",
                background: "#0123B4",
                color: "#fff",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateFilterBar;