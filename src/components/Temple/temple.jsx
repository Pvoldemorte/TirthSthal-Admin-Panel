import React, { useState, useEffect } from "react";
import "./temple.css";
import { uploadImages, createTemple, getTemples, deleteTemple } from "../../services/api";

const Temple = () => {
  const [form, setForm] = useState({
    name: "", deity: "", type: "", description: "", city: "", district: "", state: "",
    address: "", coordinates: { latitude: "", longitude: "" },
    website: "", openTime: "", closeTime: "",
    facilities: [], nearbyTemples: "", images: [],districtCover: false,
  });
  const [previews, setPreviews] = useState([]);
  const [status,   setStatus]   = useState({ state: "idle", message: "" });
  const [temples,  setTemples]  = useState([]);
  const [loading,  setLoading]  = useState(true);


  const facilityOptions = [
    "Parking", "Prasad Counter", "Dharamshala", "Toilet", "Drinking Water",
    "Medical Aid", "Shoe Stand", "Library", "Guest House", "Annadanam",
  ];

  const fetchTemples = async () => {
    setLoading(true);
    try {
      const res = await getTemples("?limit=100");
      setTemples(res.temples || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemples(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleFacility = (f) => {
    setForm((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(f)
        ? prev.facilities.filter((x) => x !== f)
        : [...prev.facilities, f],
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setForm((prev) => ({ ...prev, images: [...prev.images, ...files] }));
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setForm({
      name: "", deity: "", type: "", description: "", city: "", district: "", state: "",
      address: "", coordinates: { latitude: "", longitude: "" },
      website: "", openTime: "", closeTime: "",
      facilities: [], nearbyTemples: "", images: [],
    });
    setPreviews([]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this temple?")) return;
    try {
      await deleteTemple(id);
      setTemples((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete temple");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ state: "loading", message: "Saving temple..." });

    try {
      let imageUrls = [];
      if (form.images.length > 0) {
        setStatus({ state: "loading", message: `Uploading ${form.images.length} image(s) to Cloudinary...` });
        const uploadRes = await uploadImages(form.images, "tirthsthal/temples");
        imageUrls = uploadRes.urls || [];
      }

      const payload = {
        name:        form.name,
        deity:       form.deity,
        type:        form.type,
        description: form.description,
        city:        form.city,
        district:    form.district,
        state:       form.state,
        address:     form.address,
        coordinates: {
          lat: parseFloat(form.coordinates.latitude)  || undefined,
          lng: parseFloat(form.coordinates.longitude) || undefined,
        },
        website:  form.website,
        timings:  { morning: form.openTime, evening: form.closeTime },
        facilities: form.facilities,
        nearbyTemples: form.nearbyTemples
          ? form.nearbyTemples.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        images: imageUrls,
      };

      setStatus({ state: "loading", message: "Saving to database..." });
      const res = await createTemple(payload);
      setTemples((prev) => [res.temple, ...prev]);

      setStatus({ state: "success", message: "✓ Temple saved successfully!" });
      resetForm();
    } catch (err) {
      setStatus({ state: "error", message: err.message || "Failed to save temple" });
    } finally {
      setTimeout(() => setStatus({ state: "idle", message: "" }), 4000);
    }
  };

  return (
    <div className="form-page">
      <div className="form-header">
        <div className="form-header-icon">🛕</div>
        <div>
          <h1 className="form-title">Add Temple</h1>
          <p className="form-subtitle">Enter temple details to publish on the website</p>
        </div>
      </div>

      <form className="temple-form" onSubmit={handleSubmit}>

        {/* Basic Info */}
        <div className="form-section">
          <h2 className="section-title">Basic Information</h2>
          <div className="form-grid-2">
            <div className="field">
              <label>Temple Name *</label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="e.g. Shri Kashi Vishwanath Temple" required />
            </div>
            <div className="field">
              <label>Presiding Deity *</label>
              <input name="deity" value={form.deity} onChange={handleChange}
                placeholder="e.g. Lord Shiva" required />
            </div>
          </div>
          <div className="form-grid-2">
            <div className="field">
              <label>Temple Type</label>
              <input name="type" value={form.type} onChange={handleChange}
                placeholder="e.g. Jyotirlinga, Shakti Peeth" />
            </div>
            <div className="field">
              <label>Official Website</label>
              <input name="website" value={form.website} onChange={handleChange}
                placeholder="https://example.com" type="url" />
            </div>
          </div>
          <div className="field">
            <label>Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="Describe the temple history, significance, and architecture..."
              rows={4} required />
          </div>
        </div>

        {/* Location */}
        <div className="form-section">
          <h2 className="section-title">Location</h2>
          <div className="form-grid-3">
            <div className="field">
              <label>City *</label>
              <input name="city" value={form.city} onChange={handleChange}
                placeholder="e.g. Varanasi" required />
            </div>
            <div className="field">
              <label>District *</label>
              <input name="district" value={form.district} onChange={handleChange}
                placeholder="e.g. Varanasi" required />
            </div>
             <div className="field">
                                                <label>
                                                  <input
                                                    type="checkbox"
                                                    name="districtCover"
                                                    checked={form.districtCover}
                                                    onChange={(e) =>
                                                      setForm({
                                                        ...form,
                                                        districtCover: e.target.checked,
                                                      })
                                                    }
                                                  />
                                                  Use this temple image as district cover
                                                </label>
                                              </div>

            <div className="field">
              <label>State *</label>
              <input name="state" value={form.state} onChange={handleChange}
                placeholder="e.g. Uttar Pradesh" required />
            </div>

          </div>
          <div className="field">
            <label>Full Address</label>
            <input name="address" value={form.address} onChange={handleChange}
              placeholder="Street, locality, pincode..." />
          </div>
          <div className="form-grid-2">
            <div className="field">
              <label>Latitude</label>
              <input type="number" step="any" placeholder="e.g. 23.1828"
                value={form.coordinates.latitude}
                onChange={(e) => setForm({ ...form, coordinates: { ...form.coordinates, latitude: e.target.value } })} />
            </div>
            <div className="field">
              <label>Longitude</label>
              <input type="number" step="any" placeholder="e.g. 75.7682"
                value={form.coordinates.longitude}
                onChange={(e) => setForm({ ...form, coordinates: { ...form.coordinates, longitude: e.target.value } })} />
            </div>
          </div>
        </div>

        {/* Timings */}
        <div className="form-section">
          <h2 className="section-title">Timings</h2>
          <div className="form-grid-2">
            <div className="field">
              <label>Opening Time *</label>
              <input name="openTime" type="time" value={form.openTime}
                onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Closing Time *</label>
              <input name="closeTime" type="time" value={form.closeTime}
                onChange={handleChange} required />
            </div>
          </div>
        </div>

        {/* Facilities */}
        <div className="form-section">
          <h2 className="section-title">Facilities</h2>
          <div className="facility-grid">
            {facilityOptions.map((f) => (
              <button type="button" key={f}
                className={`facility-chip ${form.facilities.includes(f) ? "active" : ""}`}
                onClick={() => toggleFacility(f)}>
                {form.facilities.includes(f) ? "✓ " : ""}{f}
              </button>
            ))}
          </div>
        </div>

        {/* Nearby Temples */}
        <div className="form-section">
          <h2 className="section-title">Nearby Temples</h2>
          <div className="field">
            <label>Nearby Temples (comma separated)</label>
            <textarea name="nearbyTemples" value={form.nearbyTemples}
              onChange={handleChange}
              placeholder="e.g. Somnath Temple, Kashi Vishwanath..."
              rows={2} />
          </div>
        </div>

        {/* Images */}
        <div className="form-section">
          <h2 className="section-title">
            Images
            <span style={{ fontSize: 13, fontWeight: 400, color: "#6b7280", marginLeft: 8 }}>
              ({form.images.length} selected) — First image will be the cover photo
            </span>
          </h2>

          <div className="file-upload-area">
            <input type="file" multiple accept="image/*"
              onChange={handleImageChange} id="temple-images" />
            <label htmlFor="temple-images" className="file-label">
              <span className="upload-icon">📷</span>
              <span>Click to add images (can select multiple)</span>
            </label>
          </div>

          {/* Image Previews */}
          {previews.length > 0 && (
            <div className="image-preview-grid">
              {previews.map((src, i) => (
                <div key={i} className="image-preview-item">
                  <img src={src} alt={`preview ${i + 1}`} />
                  {i === 0 && <span className="image-preview-badge">Cover</span>}
                  <button type="button" className="image-preview-remove"
                    onClick={() => removeImage(i)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {status.message && (
          <div className={`form-status ${status.state}`}>{status.message}</div>
        )}

        <button type="submit"
          className={`submit-btn ${status.state === "success" ? "success" : ""}`}
          disabled={status.state === "loading"}>
          {status.state === "loading" ? "Saving..." : status.state === "success" ? "✓ Temple Saved!" : "Save Temple"}
        </button>
      </form>

      {/* Existing Temples Table */}
      <div className="form-section" style={{ marginTop: 32 }}>
        <h2 className="section-title">Existing Temples ({temples.length})</h2>
        {loading ? <p>Loading...</p> : temples.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: 14 }}>No temples added yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="districts-table">
              <thead>
                <tr>
                  <th>Cover</th>
                  <th>Name</th>
                  <th>Deity</th>
                  <th>District</th>
                  <th>Images</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {temples.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <img
                        src={t.images?.[0] || "https://via.placeholder.com/50"}
                        alt={t.name}
                        style={{ width: 50, height: 36, objectFit: "cover", borderRadius: 6 }}
                      />
                    </td>
                    <td><strong>{t.name}</strong></td>
                    <td>{t.deity}</td>
                    <td>{t.district}</td>
                    <td>
                      <span style={{
                        background: "#f0f9ff", color: "#0369a1",
                        padding: "2px 8px", borderRadius: 4, fontSize: 12
                      }}>
                        {t.images?.length || 0} photo(s)
                      </span>
                    </td>
                    <td>
                      <span style={{
                        background: t.isActive ? "#d1fae5" : "#fee2e2",
                        color: t.isActive ? "#065f46" : "#b91c1c",
                        padding: "2px 8px", borderRadius: 4, fontSize: 12
                      }}>
                        {t.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button className="districts-table__delete"
                        onClick={() => handleDelete(t._id)}>
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

export default Temple;