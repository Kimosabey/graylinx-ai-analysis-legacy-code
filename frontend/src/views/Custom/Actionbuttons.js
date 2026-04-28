import React, { useState, useRef, useEffect } from "react";

/* ─── Download Button ─── */
const DownloadButton = ({ onDownload }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const formats = ["CSV", "Excel"];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 18px",
          border: "1px solid #c8cdd2",
          borderRadius: "6px",
          background: "#ffffff",
          color: "#3a4150",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "500",
          transition: "background 0.15s, border-color 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f4f6f8";
          e.currentTarget.style.borderColor = "#a8b2bc";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#ffffff";
          e.currentTarget.style.borderColor = "#c8cdd2";
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M8 1v9M8 10l-3-3M8 10l3-3" stroke="#3a4150" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 13h12" stroke="#3a4150" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        Download
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          style={{ transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M2 4l4 4 4-4" stroke="#3a4150" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            background: "#fff",
            border: "1px solid #e0e3e7",
            borderRadius: "8px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
            minWidth: "130px",
            zIndex: 50,
            overflow: "hidden",
          }}
        >
          {formats.map((fmt) => (
            <button
              key={fmt}
              onClick={() => {
                if (onDownload) onDownload(fmt);
                setIsOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%",
                textAlign: "left",
                padding: "9px 16px",
                border: "none",
                background: "transparent",
                color: "#3a4150",
                cursor: "pointer",
                fontSize: "13px",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f3f7")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {fmt === "Excel" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="3" width="20" height="18" rx="2" fill="#217346" />
                  <path d="M7 8l3 4-3 4M12 8h5M12 12h4M12 16h5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" fill="#2563eb" />
                  <path d="M7 9h10M7 12h10M7 15h6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
              {fmt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Email Button ─── */
const EmailButton = ({ onEmail }) => {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowModal(false);
        setMessage("");
      }
    };
    if (showModal) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showModal]);

  const handleSend = async () => {
    if (!email || !email.includes("@")) {
      setMessage("Please enter a valid email address");
      return;
    }
    setIsSending(true);
    setMessage("");
    try {
      if (onEmail) {
        await onEmail(email);
        setMessage("Email sent successfully!");
        setTimeout(() => {
          setEmail("");
          setShowModal(false);
          setMessage("");
        }, 2000);
      }
    } catch (error) {
      setMessage("Failed to send email. Please try again.");
      setIsSending(false);
    }
  };

  return (
    <div ref={modalRef} style={{ position: "relative" }}>
      <button
        onClick={() => setShowModal(!showModal)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 18px",
          border: "1px solid #c8cdd2",
          borderRadius: "6px",
          background: "#ffffff",
          color: "#3a4150",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "500",
          transition: "background 0.15s, border-color 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f4f6f8";
          e.currentTarget.style.borderColor = "#a8b2bc";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#ffffff";
          e.currentTarget.style.borderColor = "#c8cdd2";
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="3" width="14" height="10" rx="2" stroke="#3a4150" strokeWidth="1.5" />
          <path d="M1 4l7 5 7-5" stroke="#3a4150" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Email
      </button>

      {showModal && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            padding: "18px",
            zIndex: 50,
            width: "260px",
          }}
        >
          <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: "600", color: "#3a4150" }}>
            Email Report
          </p>
          <input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSending}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "13px",
              boxSizing: "border-box",
              outline: "none",
              marginBottom: "12px",
              opacity: isSending ? 0.6 : 1,
            }}
          />
          {message && (
            <p style={{
              margin: "0 0 12px",
              fontSize: "12px",
              color: message.includes("success") ? "#43a047" : "#e53935"
            }}>
              {message}
            </p>
          )}
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button
              onClick={() => { setShowModal(false); setMessage(""); setEmail(""); }}
              disabled={isSending}
              style={{
                padding: "6px 14px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                background: "#fff",
                color: "#6b7280",
                cursor: isSending ? "not-allowed" : "pointer",
                fontSize: "13px",
                opacity: isSending ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isSending}
              style={{
                padding: "6px 14px",
                border: "none",
                borderRadius: "6px",
                background: isSending ? "#6b7280" : "#0123B4",
                color: "#fff",
                cursor: isSending ? "not-allowed" : "pointer",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export { DownloadButton, EmailButton };