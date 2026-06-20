import React, { useState } from "react";
import ImageUploader, { resolveImageUrls, urlsToValue } from "../common/ImageUploader";
import "./editTempleModal.css";

const facilityOptions = [
  "Parking", "Prasad Counter", "Dharamshala", "Toilet", "Drinking Water",
  "Medical Aid", "Shoe Stand", "Library", "Guest House", "Annadanam",
];

export default function EditTempleModal({ temple, onSave, onClose }) {
  const [form, setForm] = useState({
    name:        temple.name || "",
    deity:       temple.deity || "",
    type:        temple.type || "",
    description: temple.description || "",
    city:        temple.city || "",
    district:    temple.district || "",
    state:       temple.state || "",
    address:     temple.address || "",
    website:     temple.website || "",
    openTime:    temple.timings?.morning || "",
    closeTime:   temple.timings?.evening || "",
    latitude:    temple.coordinates?.latitude ?? temple.coordinates?.lat ?? "",
    longitude:   temple.coordinates?.longitude ?? temple.coordinates?.lng ?? "",
    facilities:  temple.facilities || [],
    nearbyTemples: (temple.nearbyTemples || []).join(", "),
    isActive:    temple.isActive !== false,
  });
  const [images, setImages] = useState(urlsToValue(temple.images || []));
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleFacility = (f) => {
    setForm((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(f)
        ? prev.facilities.filter((x) => x !== f)
        : [...prev.facilities, f],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ state: "loading", message: "Saving changes…" });
    try {
      const finalImages = await resolveImageUrls(images, "tirthsthal/temples");

      const payload = {
        name: form.name,
        deity: form.deity,
        type: form.type,
        description: form.description,
        city: form.city,
        district: form.district,
        state: form.state,
        address: form.address,
        website: form.website,
        timings: { morning: form.openTime, evening: form.closeTime },
        coordinates: {
          latitude:  parseFloat(form.latitude)  || undefined,
          longitude: parseFloat(form.longitude) || undefined,
        },
        facilities: form.facilities,
        nearbyTemples: form.nearbyTemples
          ? form.nearbyTemples.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        images: finalImages,
        isActive: form.isActive,
      };

      await onSave(temple._id, payload);
      setStatus({ state: "success", message: "✓ Saved!" });
      setTimeout(() => onClose(), 600);
    } catch (err) {
      setStatus({ state: "error", message: err.message || "Failed to save" });
    }
  };

  return (
    <div className="etm-overlay" onClick={onClose}>
      <div className="etm" onClick={(e) => e.stopPropagation()}>
        <div className="etm__header">
          <h2>✏️ Edit Temple</h2>
          <button className="etm__close" onClick={onClose}>✕</button>
        </div>

        <form className="etm__body" onSubmit={handleSubmit}>

          <div className="etm__section">
            <h3>Basic Information</h3>
            <div className="etm__grid-2">
              <div className="etm__field">
                <label>Temple Name *</label>
                <input name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="etm__field">
                <label>Deity *</label>
                <input name="deity" value={form.deity} onChange={handleChange} required />
              </div>
            </div>
            <div className="etm__grid-2">
              <div className="etm__field">
                <label>Type</label>
                <input name="type" value={form.type} onChange={handleChange} />
              </div>
              <div className="etm__field">
                <label>Website</label>
                <input name="website" value={form.website} onChange={handleChange} />
              </div>
            </div>
            <div className="etm__field">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
            </div>
          </div>

          <div className="etm__section">
            <h3>Location</h3>
            <div className="etm__grid-3">
              <div className="etm__field">
                <label>City</label>
                <input name="city" value={form.city} onChange={handleChange} />
              </div>
              <div className="etm__field">
                <label>District *</label>
                <input name="district" value={form.district} onChange={handleChange} required />
              </div>
              <div className="etm__field">
                <label>State *</label>
                <input name="state" value={form.state} onChange={handleChange} required />
              </div>
            </div>
            <div className="etm__field">
              <label>Address</label>
              <input name="address" value={form.address} onChange={handleChange} />
            </div>
            <div className="etm__grid-2">
              <div className="etm__field">
                <label>Latitude</label>
                <input type="number" step="any" name="latitude" value={form.latitude} onChange={handleChange} />
              </div>
              <div className="etm__field">
                <label>Longitude</label>
                <input type="number" step="any" name="longitude" value={form.longitude} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="etm__section">
            <h3>Timings</h3>
            <div className="etm__grid-2">
              <div className="etm__field">
                <label>Opens</label>
                <input type="time" name="openTime" value={form.openTime} onChange={handleChange} />
              </div>
              <div className="etm__field">
                <label>Closes</label>
                <input type="time" name="closeTime" value={form.closeTime} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="etm__section">
            <h3>Facilities</h3>
            <div className="etm__facility-grid">
              {facilityOptions.map((f) => (
                <button type="button" key={f}
                  className={`etm__chip ${form.facilities.includes(f) ? "active" : ""}`}
                  onClick={() => toggleFacility(f)}>
                  {form.facilities.includes(f) ? "✓ " : ""}{f}
                </button>
              ))}
            </div>
          </div>

          <div className="etm__section">
            <h3>Nearby Temples</h3>
            <input name="nearbyTemples" value={form.nearbyTemples} onChange={handleChange}
              placeholder="Comma separated temple names" />
          </div>

          <div className="etm__section">
            <h3>Images</h3>
            <ImageUploader value={images} onChange={setImages} folder="tirthsthal/temples" />
          </div>

          <div className="etm__section">
            <label className="etm__toggle-row">
              <input type="checkbox" checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              <span>Published (visible on website)</span>
            </label>
          </div>

          {status.message && (
            <div className={`etm__status ${status.state}`}>{status.message}</div>
          )}

          <div className="etm__footer">
            <button type="button" className="etm__btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="etm__btn-save" disabled={status.state === "loading"}>
              {status.state === "loading" ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}