"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/dashboard/section-card";
import { StatePanel } from "@/components/ui/state-panel";

type DocumentRecord = {
  id: string;
  fileName: string;
  subject: string;
  size: number;
  status: string;
  createdAt: string;
};

function formatSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadDocuments() {
    setLoading(true);
    try {
      const response = await fetch("/api/documents");
      const body = (await response.json()) as { documents?: DocumentRecord[]; error?: string };
      if (!response.ok) throw new Error(body.error ?? "Unable to load documents.");
      setDocuments(body.documents ?? []);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load documents.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadDocuments(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("subject", subject);
    try {
      const response = await fetch("/api/documents", { method: "POST", body: formData });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Unable to upload document.");
      setSubject("");
      if (inputRef.current) inputRef.current.value = "";
      await loadDocuments();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload document.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <AppShell title="My Documents" subtitle={loading ? "Loading documents" : `${documents.length} document${documents.length === 1 ? "" : "s"}`}>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Uploaded resources"
          description="Only documents returned by the backend are shown here."
          action={
            <label className="cursor-pointer rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-2 text-sm font-medium text-violet-200">
              {uploading ? "Uploading…" : "+ Upload PDF"}
              <input ref={inputRef} className="sr-only" type="file" accept="application/pdf,.pdf" disabled={uploading} onChange={(event) => void handleUpload(event.target.files?.[0])} />
            </label>
          }
        >
          {error ? <StatePanel variant="error" title="Document service unavailable" message={error} action="Check AWS configuration" /> : null}
          {!error && loading ? <StatePanel variant="loading" title="Loading documents" message="Reading document metadata from the backend." /> : null}
          {!error && !loading && documents.length === 0 ? <StatePanel variant="empty" title="No documents uploaded" message="Upload a PDF to create your first backend-backed study resource." /> : null}
          {!error && !loading && documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <div>
                    <p className="font-medium text-white">{document.fileName}</p>
                    <p className="mt-1 text-sm text-slate-400">{document.subject} • {formatSize(document.size)}</p>
                  </div>
                  <span className="rounded-full bg-sky-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-sky-200">{document.status}</span>
                </div>
              ))}
            </div>
          ) : null}
        </SectionCard>

        <SectionCard title="Secure PDF upload" description="Files are validated and uploaded by the server; browser code never receives AWS credentials.">
          <div className="space-y-3 text-sm text-slate-300">
            <label className="block">
              <span className="mb-2 block text-slate-400">Subject</span>
              <input value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={80} placeholder="e.g. Data Structures" className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-white outline-none focus:border-violet-400" />
            </label>
            <p>PDF files must be no larger than 10 MB and contain extractable text.</p>
            <Link href="/assistant" className="inline-flex text-violet-300 hover:text-violet-200">Ask about uploaded material →</Link>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
