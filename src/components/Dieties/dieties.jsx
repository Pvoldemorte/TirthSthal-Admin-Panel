import React, { useState, useEffect } from "react";
import "../Temple/temple.css";
import "./dieties.css";
import { uploadImages, createDeity, getDeities, updateDeity, deleteDeity } from "../../services/api";

const categories = [
  "Shaivism (Shiva)", "Vaishnavism (Vishnu)", "Shaktism (Devi)",
  "Smartism", "Ganapatya (Ganesha)", "Saura (Surya)", "Other",
];

const colorOptions = [
  { label: "Blue",   value: "#3b82f6" },
  { label: "Orange", value: "#f97316" },
  { label: "Pink",   value: "#ec4899" },
  { label: "Red",    value: "#ef4444" },
  { label: "Green",  value: "#10b981" },
  { label: "Yellow", value: "#f59e0b" },
  { label: "Purple", value: "#8b5cf6" },
  { label: "Gray",   value: "#6b7280" },
];

const Dieties = () => {
  const [form, setForm] = useState({
    name: "", alternateNames: "", description: "", origin: "",
    category: "", associatedTemple: "", color: "#f4a261", image: null,
  });
  const [status,   setStatus]   = useState({ state: "idle", message: "" });
  const [deities,  setDeities]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editId,   setEditId]   = useState(null);

  const fetchDeities = async () => {
    setLoading(true);
    try {
      const res = await getDeities();
      setDeities(res.deities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeities(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => setForm({ ...form, image: e.target.files[0] || null });

  const resetForm = () => {
    setForm({
      name: "", alternateNames: "", description: "", origin: "",
      category: "", associatedTemple: "", color: "#f4a261", image: null,
    });
    setEditId(null);
  };

  const handleEdit = (deity) => {
    setForm({
      name:             deity.name,
      alternateNames:   deity.alternateNames || "",
      description:      deity.description,
      origin:           deity.origin || "",
      category:         deity.category || "",
      associatedTemple: deity.associatedTemple || "",
      color:            deity.color || "#f4a261",
      image:            null,
    });
    setEditId(deity._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this deity?")) return;
    try {
      await deleteDeity(id);
      setDeities((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete deity");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ state: "loading", message: editId ? "Updating deity..." : "Saving deity..." });

    try {
      let imageUrl = "";

      if (form.image) {
        setStatus({ state: "loading", message: "Uploading image to Cloudinary..." });
        const uploadRes = await uploadImages([form.image], "tirthsthal/deities");
        imageUrl = uploadRes.urls?.[0] || "";
      }

      const payload = {
        name:             form.name,
        alternateNames:   form.alternateNames,
        description:      form.description,
        origin:           form.origin,
        category:         form.category,
        associatedTemple: form.associatedTemple,
        color:            form.color,
        filterKey:        form.name,
        ...(imageUrl && { image: imageUrl }),
      };

      setStatus({ state: "loading", message: "Saving to database..." });

      if (editId) {
        const res = await updateDeity(editId, payload);
        setDeities((prev) => prev.map((d) => d._id === editId ? res.deity : d));
        setStatus({ state: "success", message: "✓ Deity updated successfully!" });
      } else {
        const res = await createDeity(payload);
        setDeities((prev) => [...prev, res.deity]);
        setStatus({ state: "success", message: "✓ Deity saved successfully!" });
      }

      resetForm();
    } catch (err) {
      setStatus({ state: "error", message: err.message || "Failed to save deity" });
    } finally {
      setTimeout(() => setStatus({ state: "idle", message: "" }), 4000);
    }
  };

  return (
    <div className="form-page">
      <div className="form-header">
        <div className="form-header-icon">ॐ</div>
        <div>
          <h1 className="form-title">{editId ? "Edit Deity" : "Add Deity"}</h1>
          <p className="form-subtitle">Manage deities shown on the homepage Browse by Deity section</p>
        </div>
      </div>

      <form className="temple-form" onSubmit={handleSubmit}>

        {/* Basic Info */}
        <div className="form-section">
          <h2 className="section-title">Basic Information</h2>
          <div className="form-grid-2">
            <div className="field">
              <label>Deity Name *</label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="e.g. Lord Shiva" required />
            </div>
            <div className="field">
              <label>Alternate Names / Titles</label>
              <input name="alternateNames" value={form.alternateNames} onChange={handleChange}
                placeholder="e.g. Mahadeva, Bholenath, Shankar" />
            </div>
          </div>
          <div className="field">
            <label>Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="Describe the deity's significance, mythology and iconography..."
              rows={4} required />
          </div>
          <div className="field">
            <label>Origin / Mythology</label>
            <textarea name="origin" value={form.origin} onChange={handleChange}
              placeholder="Brief origin story or mythological background..."
              rows={3} />
          </div>
        </div>

        {/* Classification */}
        <div className="form-section">
          <h2 className="section-title">Classification</h2>
          <div className="form-grid-2">
            <div className="field">
              <label>Deity Category *</label>
              <select name="category" value={form.category} onChange={handleChange} required>
                <option value="">Select category...</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Associated Temple</label>
              <input name="associatedTemple" value={form.associatedTemple} onChange={handleChange}
                placeholder="e.g. Kashi Vishwanath, Somnath" />
            </div>
          </div>

          {/* Color Picker */}
          <div className="field">
            <label>Card Accent Color</label>
            <div className="deity-color-grid">
              {colorOptions.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  className={`deity-color-btn ${form.color === c.value ? "active" : ""}`}
                  style={{ background: c.value }}
                  onClick={() => setForm({ ...form, color: c.value })}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="form-section">
          <h2 className="section-title">Deity Image</h2>
          <div className="field">
            <label>Upload Image (uploads to Cloudinary)</label>
            <div className="file-upload-area">
              <input type="file" accept="image/*" onChange={handleImage} id="deity-image" />
              <label htmlFor="deity-image" className="file-label">
                <span className="upload-icon">🪔</span>
                <span>{form.image ? form.image.name : "Click to upload deity image"}</span>
              </label>
            </div>
          </div>
        </div>

        {status.message && (
          <div className={`form-status ${status.state}`}>{status.message}</div>
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="submit"
            className={`submit-btn ${status.state === "success" ? "success" : ""}`}
            disabled={status.state === "loading"}
            style={{ flex: 1 }}
          >
            {status.state === "loading" ? "Saving..."
              : status.state === "success" ? "✓ Saved!"
              : editId ? "Update Deity" : "Save Deity"}
          </button>
          {editId && (
            <button type="button" className="submit-btn" onClick={resetForm}
              style={{ flex: 0.4, background: "#f3f4f6", color: "#374151" }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Existing Deities Table */}
      <div className="form-section" style={{ marginTop: 32 }}>
        <h2 className="section-title">Existing Deities ({deities.length})</h2>

        {loading ? <p>Loading...</p> : deities.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: 14 }}>No deities added yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="districts-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Color</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deities.map((d) => (
                  <tr key={d._id}>
                    <td>
                      <img
                        src={d.image || "https://via.placeholder.com/50"}
                        alt={d.name}
                        style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }}
                      />
                    </td>
                    <td>
                      <strong>{d.name}</strong>
                      {d.alternateNames && <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>{d.alternateNames}</p>}
                    </td>
                    <td>{d.category || "—"}</td>
                    <td>
                      <span style={{
                        display: "inline-block", width: 20, height: 20,
                        borderRadius: "50%", background: d.color || "#f4a261"
                      }} />
                    </td>
                    <td style={{ display: "flex", gap: 8, padding: "10px 12px" }}>
                      <button
                        className="sync-btn"
                        onClick={() => handleEdit(d)}
                      >
                        Edit
                      </button>
                      <button
                        className="districts-table__delete"
                        onClick={() => handleDelete(d._id)}
                      >
                        Delete
                      </button>
                    </td>
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

export default Dieties;