import React, { useState, useRef, useEffect } from "react";

const TopTabBar = ({
  tabs = [],
  activeTab,
  onTabChange,
  dropdownTabs = [],
  dropdownOptions = {},
  selectedDropdown = {},
  onDropdownSelect,
}) => {
  /* which dropdown is open – only one at a time */
  const [openDropdown, setOpenDropdown] = useState(null);
  const wrapRef = useRef(null);

  /* close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* close dropdown whenever the active tab changes away */
  useEffect(() => {
    setOpenDropdown(null);
  }, [activeTab]);

  return (
    <div ref={wrapRef} style={{ display: "flex", gap: "2px" }}>
      {tabs.map((tab) => {
        const isActive   = tab === activeTab;
        const hasDropdown = dropdownTabs.includes(tab);
        const isOpen     = openDropdown === tab;
        const options    = dropdownOptions[tab] || [];

        return (
          <div key={tab} style={{ position: "relative" }}>
            {/* ── tab button ── */}
            <button
              onClick={() => {
                onTabChange(tab);                          // always switch tab
                if (hasDropdown) setOpenDropdown(isOpen ? null : tab); // toggle dropdown
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 22px",
                border: isActive ? "none" : "1px solid #c8cdd2",
                borderRadius: "6px",
                background: isActive ? "#0123B4" : "#ffffff",
                color: isActive ? "#ffffff" : "#3a4150",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: isActive ? "600" : "500",
                transition: "background 0.15s, color 0.15s, border-color 0.15s",
                outline: "none",
                position: "relative",
                zIndex: isOpen ? 2 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "#f0f3f7";
                  e.currentTarget.style.borderColor = "#a8b2bc";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.borderColor = "#c8cdd2";
                }
              }}
            >
              {tab}
              {hasDropdown && (
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 12 12" 
                  fill="none"
                  style={{
                    transition: "transform 0.2s ease",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <path 
                    d="M2 4l4 4 4-4" 
                    stroke={isActive ? "#ffffff" : "#3a4150"} 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                </svg>
              )}
            </button>

            {/* ── dropdown panel (only for tabs that have one, only when open) ── */}
            {hasDropdown && isOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#fff",
                  border: "1px solid #e0e3e7",
                  borderRadius: "8px",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.13)",
                  minWidth: "150px",
                  zIndex: 50,
                  overflow: "hidden",
                }}
              >
                {options.map((opt) => {
                  const isSelected = selectedDropdown[tab] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        onDropdownSelect && onDropdownSelect(tab, opt);
                        setOpenDropdown(null);            // close after pick
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "9px 18px",
                        border: "none",
                        background: isSelected ? "#eef1f9" : "transparent",
                        color: isSelected ? "#0123B4" : "#3a4150",
                        fontWeight: isSelected ? "600" : "500",
                        cursor: "pointer",
                        fontSize: "13px",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "#f4f6f8";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isSelected ? "#eef1f9" : "transparent";
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TopTabBar;