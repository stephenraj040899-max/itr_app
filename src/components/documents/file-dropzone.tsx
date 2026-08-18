"use client";

import { useId, useRef, useState } from "react";
import { FileCheck2, FileText, Trash2, UploadCloud } from "lucide-react";

type SelectedFile = { id: string; name: string; size: number };
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

function readableSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileDropzone({ title, description, compact = false }: { title: string; description: string; compact?: boolean }) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  function selectFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    const invalid = incoming.find((file) => !allowedTypes.has(file.type) || file.size > MAX_FILE_SIZE);
    if (invalid) {
      setError(`${invalid.name} must be a PDF, JPG, PNG or WEBP under 10 MB.`);
      return;
    }
    setError("");
    setFiles((current) => [
      ...current,
      ...incoming
        .filter((file) => !current.some((item) => item.name === file.name && item.size === file.size))
        .map((file) => ({ id: `${file.name}-${file.size}-${file.lastModified}`, name: file.name, size: file.size })),
    ]);
  }

  return <div className="file-picker">
    <div className={`upload-zone ${compact ? "compact" : ""} ${dragging ? "dragging" : ""}`}
      onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => { event.preventDefault(); setDragging(false); selectFiles(event.dataTransfer.files); }}>
      <div>
        <div className="upload-icon"><UploadCloud aria-hidden="true" /></div>
        <h3>{title}</h3><p className="fine">{description}</p>
        <input ref={inputRef} className="visually-hidden" id={inputId} type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" multiple
          onChange={(event) => { selectFiles(event.target.files); event.target.value = ""; }} />
        <button className="button secondary" type="button" onClick={() => inputRef.current?.click()}>Choose files</button>
      </div>
    </div>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    {files.length ? <div className="selected-files" aria-live="polite">{files.map((file) => <div className="selected-file" key={file.id}>
      <span className="doc-badge"><FileText aria-hidden="true" /></span>
      <span><strong>{file.name}</strong><small>{readableSize(file.size)} · selected on this device</small></span>
      <span className="status ready"><FileCheck2 size={14} aria-hidden="true" />Ready</span>
      <button className="icon-button" type="button" aria-label={`Remove ${file.name}`} onClick={() => setFiles((current) => current.filter((item) => item.id !== file.id))}><Trash2 size={17} aria-hidden="true" /></button>
    </div>)}</div> : null}
  </div>;
}
