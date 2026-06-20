import React, { useState, useRef, useCallback } from "react";
import { uploadImages } from "../../services/api";
import "./imageUploader.css";

export default function ImageUploader({ value = [], onChange, folder = "tirthsthal" }) {
  const [dragOver, setDragOver]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput]   = useState("");
  const fileInputRef = useRef(null);

  const addFiles = useCallback((fileList) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;
    const items = files.map((file) => ({
      type: "file",
      file,
      preview: URL.createObjectURL(file),
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
    }));
    onChange([...value, ...items]);
  }, [value, onChange]);

  const addUrl = (url) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    onChange([...value, { type: "url", src: trimmed, id: `url-${Date.now()}-${Math.random()}` }]);
    setUrlInput("");
  };

  const removeAt = (id) => {
    onChange(value.filter((v) => v.id !== id));
  };

  const handleFileInput = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) {
      addFiles(e.dataTransfer.files);
    } else {
      const text = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
      if (text) addUrl(text);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          addFiles([file]);
          e.preventDefault();
          return;
        }
      }
    }

    const text = e.clipboardData.getData("text");
    if (text && /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(text.trim())) {
      addUrl(text);
      e.preventDefault();
    }
  };

  return (
    <div className="iu">
      <div
        className={`iu__dropzone ${dragOver ? "drag" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onPaste={handlePaste}
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          style={{ display: "none" }}
        />
        <div className="iu__dropzone-icon">📷</div>
        <p className="iu__dropzone-text">
          <strong>Click to browse</strong>, drag & drop, or paste an image
        </p>
        <p className="iu__dropzone-sub">Supports multiple files · JPG, PNG, WEBP</p>
      </div>

      <div className="iu__url-row">
        <input
          type="text"
          placeholder="Or paste an image URL and press Enter…"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(urlInput); } }}
          className="iu__url-input"
        />
        <button type="button" className="iu__url-add" onClick={() => addUrl(urlInput)}>
          Add
        </button>
      </div>

      {value.length > 0 && (
        <div className="iu__grid">
          {value.map((item, i) => (
            <div key={item.id} className="iu__item">
              <img src={item.type === "file" ? item.preview : item.src} alt="" />
              {i === 0 && <span className="iu__badge">Cover</span>}
              <button type="button" className="iu__remove" onClick={() => removeAt(item.id)}>✕</button>
            </div>
          ))}
        </div>
      )}

      {uploading && <p className="iu__uploading">Uploading…</p>}
    </div>
  );
}

export async function resolveImageUrls(value, folder = "tirthsthal") {
  const urls = [];
  const filesToUpload = value.filter((v) => v.type === "file").map((v) => v.file);

  let uploadedUrls = [];
  if (filesToUpload.length > 0) {
    const res = await uploadImages(filesToUpload, folder);
    uploadedUrls = res.urls || [];
  }

  let fileIdx = 0;
  for (const item of value) {
    if (item.type === "url") {
      urls.push(item.src);
    } else {
      urls.push(uploadedUrls[fileIdx] || "");
      fileIdx++;
    }
  }
  return urls.filter(Boolean);
}

export function urlsToValue(urls = []) {
  return urls.map((src, i) => ({ type: "url", src, id: `existing-${i}-${src}` }));
}