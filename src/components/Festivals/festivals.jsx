import React, { useState } from "react";
import "./festivals.css";
import { uploadImages, createFestival } from "../../services/api";

const Festivals = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    significance: "",
    startDate: "",
    endDate: "",
    associatedDeity: "",
    associatedTemple: "",
    associatedFestivals: "",
    famousTemples: "",
    duration: "",
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [status, setStatus] = useState({
    state: "idle",
    message: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    setImages((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setPreviews((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      significance: "",
      startDate: "",
      endDate: "",
      associatedDeity: "",
      associatedTemple: "",
      associatedFestivals: "",
      famousTemples: "",
      duration: "",
    });

    setImages([]);
    setPreviews([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setStatus({
      state: "loading",
      message: "Saving festival...",
    });

    try {
      let imageUrl = "";
      let imageUrls = [];

      if (images.length > 0) {
        setStatus({
          state: "loading",
          message: `Uploading ${images.length} image(s)...`,
        });

        const uploadRes = await uploadImages(
          images,
          "tirthsthal/festivals"
        );

        imageUrls = uploadRes.urls || [];
        imageUrl = imageUrls[0] || "";
      }

      const payload = {
        name: form.name,
        description: form.description,
        importance: form.significance,
        date: form.startDate,
        upcomingDate: form.startDate
          ? new Date(form.startDate)
          : undefined,
        duration: form.duration,
        deity: form.associatedDeity,
        location: form.associatedTemple,

        templesCelebrated: form.famousTemples
          ? form.famousTemples
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],

        image: imageUrl,
        images: imageUrls,
      };

      setStatus({
        state: "loading",
        message: "Saving to database...",
      });

      await createFestival(payload);

      resetForm();

      setStatus({
        state: "success",
        message: "✓ Festival saved successfully!",
      });
    } catch (err) {
      setStatus({
        state: "error",
        message:
          err.message ||
          "Failed to save festival",
      });
    } finally {
      setTimeout(() => {
        setStatus({
          state: "idle",
          message: "",
        });
      }, 4000);
    }
  };

  return (
    <div className="form-page">
      <div className="form-header">
        <div className="form-header-icon">
          ✨
        </div>

        <div>
          <h1 className="form-title">
            Add Festival
          </h1>

          <p className="form-subtitle">
            Publish festival details to the
            temple website
          </p>
        </div>
      </div>

      <form
        className="temple-form"
        onSubmit={handleSubmit}
      >
        <div className="form-section">
          <h2 className="section-title">
            Basic Information
          </h2>

          <div className="form-grid-2">
            <div className="field">
              <label>Festival Name *</label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Maha Shivaratri"
                required
              />
            </div>

            <div className="field">
              <label>Duration</label>

              <input
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="e.g. 1 day, 10 days"
              />
            </div>
          </div>

          <div className="field">
            <label>Description *</label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="field">
            <label>Significance *</label>

            <textarea
              name="significance"
              value={form.significance}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">
            Festival Dates
          </h2>

          <div className="form-grid-2">
            <div className="field">
              <label>Start Date *</label>

              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>End Date</label>

              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">
            Associations
          </h2>

          <div className="form-grid-2">
            <div className="field">
              <label>
                Associated Deity
              </label>

              <input
                name="associatedDeity"
                value={form.associatedDeity}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>
                Associated Temple
              </label>

              <input
                name="associatedTemple"
                value={form.associatedTemple}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="field">
            <label>
              Related Festivals
            </label>

            <input
              name="associatedFestivals"
              value={
                form.associatedFestivals
              }
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label>
              Famous Temples
            </label>

            <textarea
              name="famousTemples"
              value={form.famousTemples}
              onChange={handleChange}
              rows={3}
            />
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">
            Images
            <span
              style={{
                fontSize: 13,
                fontWeight: 400,
                color: "#6b7280",
                marginLeft: 8,
              }}
            >
              ({images.length} selected)
            </span>
          </h2>

          <div className="file-upload-area">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={
                handleImageChange
              }
              id="festival-images"
            />

            <label
              htmlFor="festival-images"
              className="file-label"
            >
              <span className="upload-icon">
                🎆
              </span>

              <span>
                Click to upload
                festival images
              </span>
            </label>
          </div>

          {previews.length > 0 && (
            <div className="image-preview-grid">
              {previews.map(
                (src, index) => (
                  <div
                    key={index}
                    className="image-preview-item"
                  >
                    <img
                      src={src}
                      alt={`preview-${index}`}
                    />

                    {index === 0 && (
                      <span className="image-preview-badge">
                        Cover
                      </span>
                    )}

                    <button
                      type="button"
                      className="image-preview-remove"
                      onClick={() =>
                        removeImage(
                          index
                        )
                      }
                    >
                      ✕
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {status.message && (
          <div
            className={`form-status ${status.state}`}
          >
            {status.message}
          </div>
        )}

        <button
          type="submit"
          className={`submit-btn ${
            status.state === "success"
              ? "success"
              : ""
          }`}
          disabled={
            status.state === "loading"
          }
        >
          {status.state === "loading"
            ? "Saving..."
            : status.state === "success"
            ? "✓ Festival Saved!"
            : "Save Festival"}
        </button>
      </form>
      

      <div className="form-section" style={{ marginTop: 32 }}>
  <h2 className="section-title">
    Existing Festivals ({festivals.length})
  </h2>

  {loading ? (
    <p>Loading...</p>
  ) : festivals.length === 0 ? (
    <p style={{ color: "#6b7280" }}>
      No festivals added yet.
    </p>
  ) : (
    <div style={{ overflowX: "auto" }}>
      <table className="districts-table">
        <thead>
          <tr>
            <th>Cover</th>
            <th>Name</th>
            <th>Date</th>
            <th>Images</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {festivals.map((f) => (
            <tr key={f._id}>
              <td>
                <img
                  src={
                    f.images?.[0] ||
                    f.image ||
                    "https://via.placeholder.com/50"
                  }
                  alt={f.name}
                  style={{
                    width: 50,
                    height: 36,
                    objectFit: "cover",
                    borderRadius: 6,
                  }}
                />
              </td>

              <td>
                <strong>{f.name}</strong>
              </td>

              <td>
                {f.date || "-"}
              </td>

              <td>
                {f.images?.length || 1} photo(s)
              </td>

              <td>
                <button
                  className="districts-table__delete"
                  onClick={() =>
                    handleDelete(f._id)
                  }
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

export default Festivals;
