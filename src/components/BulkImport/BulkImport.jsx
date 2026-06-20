import React, { useState } from "react";
import { createTemple } from "../../services/api";
import "../Temple/temple.css";
import "./bulkImport.css";

const BulkImport = () => {
  const [status,   setStatus]   = useState({ state: "idle", message: "" });
  const [results,  setResults]  = useState([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [preview,  setPreview]  = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data)) throw new Error("JSON must be an array");
        setPreview(data);
        setStatus({ state: "idle", message: `✓ ${data.length} temples loaded. Ready to import.` });
      } catch (err) {
        setStatus({ state: "error", message: `Invalid JSON: ${err.message}` });
        setPreview([]);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    setProgress({ done: 0, total: preview.length });
    setResults([]);
    setStatus({ state: "loading", message: "Importing temples..." });

    const results = [];
    for (let i = 0; i < preview.length; i++) {
      const temple = preview[i];
      try {
        await createTemple(temple);
        results.push({ name: temple.name, status: "success" });
      } catch (err) {
        results.push({ name: temple.name, status: "error", message: err.message });
      }
      setProgress({ done: i + 1, total: preview.length });
      setResults([...results]);
    }

    const success = results.filter((r) => r.status === "success").length;
    const failed  = results.filter((r) => r.status === "error").length;
    setStatus({
      state: failed === 0 ? "success" : "error",
      message: `Done! ${success} imported${failed > 0 ? `, ${failed} failed` : ""}.`,
    });
    setPreview([]);
  };

  const percent = progress.total > 0
    ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="form-page">
      <div className="form-header">
        <div className="form-header-icon">📦</div>
        <div>
          <h1 className="form-title">Bulk Import Temples</h1>
          <p className="form-subtitle">Upload a JSON file to import multiple temples at once</p>
        </div>
      </div>

      <div className="temple-form">
        <div className="form-section">
          <h2 className="section-title">Step 1 — Upload your JSON file</h2>
          <div className="file-upload-area">
            <input type="file" accept=".json" onChange={handleFileChange} id="bulk-file" />
            <label htmlFor="bulk-file" className="file-label">
              <span className="upload-icon">📄</span>
              <span>Click to upload JSON file</span>
            </label>
          </div>
        </div>

        {preview.length > 0 && (
          <div className="form-section">
            <h2 className="section-title">Step 2 — Preview ({preview.length} temples)</h2>
            <div style={{ overflowX: "auto" }}>
              <table className="districts-table">
                <thead>
                  <tr><th>#</th><th>Name</th><th>Deity</th><th>District</th><th>State</th></tr>
                </thead>
                <tbody>
                  {preview.map((t, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td><strong>{t.name}</strong></td>
                      <td>{t.deity}</td>
                      <td>{t.district}</td>
                      <td>{t.state}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="submit-btn" style={{ marginTop: 16 }}
              onClick={handleImport} disabled={status.state === "loading"}>
              {status.state === "loading"
                ? `Importing... (${progress.done}/${progress.total})`
                : `Import All ${preview.length} Temples`}
            </button>
          </div>
        )}

        {status.state === "loading" && (
          <div className="bulk-progress">
            <div className="bulk-progress__bar">
              <div className="bulk-progress__fill" style={{ width: `${percent}%` }} />
            </div>
            <span>{percent}%</span>
          </div>
        )}

        {status.message && (
          <div className={`form-status ${status.state}`}>{status.message}</div>
        )}

        {results.length > 0 && (
          <div className="form-section" style={{ marginTop: 24 }}>
            <h2 className="section-title">Import Results</h2>
            <table className="districts-table">
              <thead><tr><th>Temple</th><th>Status</th><th>Note</th></tr></thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td>{r.name}</td>
                    <td>
                      <span style={{
                        background: r.status === "success" ? "#d1fae5" : "#fee2e2",
                        color: r.status === "success" ? "#065f46" : "#b91c1c",
                        padding: "2px 8px", borderRadius: 4, fontSize: 12
                      }}>
                        {r.status === "success" ? "✓ Imported" : "✕ Failed"}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "#6b7280" }}>{r.message || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkImport;