import React, { useState, useEffect } from "react";
import "../Festivals/festivals.css";
import "./blog.css";
import { getBlogs, createBlog, updateBlog, deleteBlog } from "../../services/api";
import ImageUploader, { resolveImageUrls, urlsToValue } from "../Common/ImageUploader";

const categoryOptions = [
  "Temple History",
  "Travel Guide",
  "Spiritual Practices",
  "Pilgrimage",
  "Festivals",
  "General",
];

const emptyForm = {
  title: "",
  category: "Temple History",
  author: "",
  excerpt: "",
  content: "",
  tags: "",
  isPublished: true,
};

const Blog = () => {
  const [form, setForm]   = useState(emptyForm);
  const [images, setImages] = useState([]); // thumbnail via ImageUploader (cover = first image)

  const [status, setStatus] = useState({ state: "idle", message: "" });

  const [blogs, setBlogs]     = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Edit mode ──
  const [editingId, setEditingId] = useState(null);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await getBlogs("?all=true&limit=100");
      setBlogs(res.blogs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImages([]);
    setEditingId(null);
  };

  // ── Load a blog into the form for editing ──
  const handleEdit = (b) => {
    setEditingId(b._id);
    setForm({
      title:       b.title || "",
      category:    b.category || "Temple History",
      author:      b.author || "",
      excerpt:     b.excerpt || "",
      content:     b.content || "",
      tags:        (b.tags || []).join(", "),
      isPublished: b.isPublished !== false,
    });
    setImages(urlsToValue(b.thumbnail ? [b.thumbnail] : []));
    setStatus({ state: "idle", message: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    resetForm();
    setStatus({ state: "idle", message: "" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this blog post? This cannot be undone.")) return;
    try {
      await deleteBlog(id);
      setBlogs((prev) => prev.filter((b) => b._id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      alert(err.message || "Failed to delete blog");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ state: "loading", message: editingId ? "Updating blog..." : "Saving blog..." });

    try {
      let thumbnailUrl = "";

      if (images.length > 0) {
        setStatus({ state: "loading", message: "Uploading image..." });
        const urls = await resolveImageUrls(images, "tirthsthal/blogs");
        thumbnailUrl = urls[0] || "";
      }

      const payload = {
        title:       form.title,
        category:    form.category,
        author:      form.author,
        excerpt:     form.excerpt,
        content:     form.content,
        tags: form.tags
          ? form.tags.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        isPublished: form.isPublished,
      };

      // Sirf naya image select hua ho tabhi thumbnail update karo
      if (thumbnailUrl) payload.thumbnail = thumbnailUrl;

      setStatus({ state: "loading", message: "Saving to database..." });

      if (editingId) {
        const res = await updateBlog(editingId, payload);
        setBlogs((prev) => prev.map((b) => (b._id === editingId ? res.blog : b)));
        setStatus({ state: "success", message: "✓ Blog updated successfully!" });
      } else {
        const res = await createBlog(payload);
        setBlogs((prev) => [res.blog, ...prev]);
        setStatus({ state: "success", message: "✓ Blog published successfully!" });
      }

      resetForm();
    } catch (err) {
      setStatus({ state: "error", message: err.message || "Failed to save blog" });
    } finally {
      setTimeout(() => setStatus({ state: "idle", message: "" }), 4000);
    }
  };

  return (
    <div className="form-page">
      <div className="form-header">
        <div className="form-header-icon">📝</div>
        <div>
          <h1 className="form-title">{editingId ? "Edit Blog Post" : "Add Blog Post"}</h1>
          <p className="form-subtitle">
            {editingId
              ? "Update an existing article on the temple website"
              : "Publish a new article to the temple website"}
          </p>
        </div>
        {editingId && (
          <button type="button" className="blog-cancel-edit" onClick={handleCancelEdit}>
            ✕ Cancel Edit
          </button>
        )}
      </div>

      <form className="temple-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2 className="section-title">Basic Information</h2>
          <div className="form-grid-2">
            <div className="field">
              <label>Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. The Divine Legacy of Kedarnath Temple"
                required
              />
            </div>
            <div className="field">
              <label>Category *</label>
              <select name="category" value={form.category} onChange={handleChange} required>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="field">
              <label>Author *</label>
              <input
                name="author"
                value={form.author}
                onChange={handleChange}
                placeholder="e.g. Ananya Sharma"
                required
              />
            </div>
            <div className="field">
              <label>Tags (comma separated)</label>
              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="e.g. Kedarnath, Jyotirlinga, Shiva"
              />
            </div>
          </div>

          <div className="field">
            <label>Excerpt *</label>
            <textarea
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              rows={2}
              placeholder="A short summary shown on the blog listing card..."
              required
            />
          </div>

          <div className="field">
            <label>Content *</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={10}
              placeholder="Write the full article here..."
              required
            />
          </div>

          <label className="blog-publish-toggle">
            <input
              type="checkbox"
              name="isPublished"
              checked={form.isPublished}
              onChange={handleChange}
            />
            <span>Published (visible on the website)</span>
          </label>
        </div>

        <div className="form-section">
          <h2 className="section-title">
            Cover Image
            <span style={{ fontSize: 13, fontWeight: 400, color: "#6b7280", marginLeft: 8 }}>
              ({images.length ? "1 selected" : "none"})
            </span>
          </h2>
          <ImageUploader value={images} onChange={setImages} folder="tirthsthal/blogs" />
        </div>

        {status.message && (
          <div className={`form-status ${status.state}`}>{status.message}</div>
        )}

        <button
          type="submit"
          className={`submit-btn ${status.state === "success" ? "success" : ""}`}
          disabled={status.state === "loading"}
        >
          {status.state === "loading"
            ? "Saving..."
            : status.state === "success"
            ? "✓ Saved!"
            : editingId
            ? "Update Blog"
            : "Publish Blog"}
        </button>
      </form>

      {/* Existing Blogs Table */}
      <div className="form-section" style={{ marginTop: 32 }}>
        <h2 className="section-title">Existing Blog Posts ({blogs.length})</h2>

        {loading ? (
          <p>Loading...</p>
        ) : blogs.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No blog posts added yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="blog-table">
              <thead>
                <tr>
                  <th>Cover</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((b) => (
                  <tr key={b._id} className={editingId === b._id ? "blog-table__row-active" : ""}>
                    <td>
                      <img
                        src={b.thumbnail || "https://via.placeholder.com/50"}
                        alt={b.title}
                        className="blog-table__thumb"
                      />
                    </td>
                    <td>
                      <strong>{b.title}</strong>
                      <div className="blog-table__slug">{b.slug || "no-slug"}</div>
                    </td>
                    <td>{b.category || "—"}</td>
                    <td>{b.author || "—"}</td>
                    <td>
                      <span className={`blog-table__status ${b.isPublished !== false ? "published" : "draft"}`}>
                        {b.isPublished !== false ? "● Published" : "○ Draft"}
                      </span>
                    </td>
                    <td>{b.views ?? 0}</td>
                    <td className="blog-table__actions">
                      <button className="blog-table__edit" onClick={() => handleEdit(b)}>
                        Edit
                      </button>
                      <button className="districts-table__delete" onClick={() => handleDelete(b._id)}>
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

export default Blog;