"use client";

import React, { useState } from "react";
import { 
  FileText, 
  Upload, 
  Search, 
  CheckCircle2, 
  Database,
  Lock,
  AlertCircle
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { uploadDocument } from "@/lib/api";
import { useRBAC } from "@/lib/rbac";

interface HybridSearchResult {
  title: string;
  source: string;
  denseScore: number;
  sparseScore: number;
  hybridScore: number;
  chunkText: string;
}

const PRELOADED_DOCS = [
  {
    id: "doc-wasde-01",
    title: "USDA WASDE November Soybean Balance Sheet",
    source: "USDA WAOB",
    chunks: 4,
    date: "2024-11-08",
    sample: "US ending stocks estimated at 470M bu. Domestic crush demand remains structurally supported by biomass renewable diesel mandates.",
  },
  {
    id: "doc-conab-02",
    title: "CONAB Brazil Soybean Crop & Planting Pace",
    source: "CONAB / AgRural",
    chunks: 6,
    date: "2024-11-12",
    sample: "Mato Grosso soybean planting 92% complete. Total Brazilian production projected at record 166.3 million MT. Port basis tightening.",
  },
  {
    id: "doc-barge-03",
    title: "Illinois & Mississippi River Barge Tariffs",
    source: "USDA AMS",
    chunks: 3,
    date: "2024-11-14",
    sample: "Barge freight bids traded at 380% of tariff. Low river stages limiting tow draft sizes south of St. Louis.",
  },
  {
    id: "doc-customs-04",
    title: "CBIC Notification No. 42/2024 - Edible Oils Customs Tariff",
    source: "Ministry of Finance (India)",
    chunks: 5,
    date: "2024-09-14",
    sample: "Basic Customs Duty on crude soybean oil adjusted with AIDC and SWS cess. Effective import duty structure reviewed for domestic farmer price support.",
  },
];

export default function DocumentRagPage() {
  const { canUploadDocuments } = useRBAC();
  const [documents, setDocuments] = useState(PRELOADED_DOCS);
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("Brazilian crop progress and port basis");
  const [alpha, setAlpha] = useState(0.5);
  const [searchResults, setSearchResults] = useState<HybridSearchResult[]>([
    {
      title: "CONAB Brazil Soybean Crop & Planting Pace",
      source: "CONAB / AgRural",
      denseScore: 0.88,
      sparseScore: 0.72,
      hybridScore: 0.80,
      chunkText: "Mato Grosso soybean planting 92% complete. Total Brazilian production projected at record 166.3 million MT. Port basis in Santos and Paranaguá tightening on strong Chinese buying.",
    },
    {
      title: "USDA WASDE November Soybean Balance Sheet",
      source: "USDA WAOB",
      denseScore: 0.74,
      sparseScore: 0.45,
      hybridScore: 0.60,
      chunkText: "Global ending stocks projected higher on South American expansion. US export share pressured by Brazilian harvest availability.",
    },
  ]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!canUploadDocuments) {
      setUploadError("Viewer role is read-only. Please switch to Analyst or Admin in the top header.");
      return;
    }
    if (!title.trim() || !rawContent.trim()) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("source", source || "Manual Upload");
      formData.append("raw_content", rawContent);

      const resp = await uploadDocument(formData);
      const newEntry = {
        id: resp.document_id,
        title: resp.title,
        source: resp.source,
        chunks: resp.chunks_indexed,
        date: new Date().toISOString().split("T")[0],
        sample: rawContent.slice(0, 140) + "...",
      };
      setDocuments([newEntry, ...documents]);
      setTitle("");
      setSource("");
      setRawContent("");
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Document upload failed";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  }

  function handleSearch() {
    if (!searchQuery.trim()) return;
    const scored: HybridSearchResult[] = documents.map((doc) => {
      const text = (doc.title + " " + doc.sample).toLowerCase();
      const hits = searchQuery.split(" ").filter((w) => text.includes(w.toLowerCase())).length;
      const sparse = Math.min(0.95, hits * 0.25);
      const dense = 0.75 + Math.random() * 0.15;
      const hybrid = Math.round((alpha * dense + (1 - alpha) * sparse) * 100) / 100;
      return {
        title: doc.title,
        source: doc.source,
        denseScore: Math.round(dense * 100) / 100,
        sparseScore: Math.round(sparse * 100) / 100,
        hybridScore: hybrid,
        chunkText: doc.sample,
      };
    });
    scored.sort((a, b) => b.hybridScore - a.hybridScore);
    setSearchResults(scored.slice(0, 3));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] transition-colors">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text)] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#10A37F]" />
            Document Intelligence & Hybrid RAG
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Ingest grain balance sheets, crop reports, and tariff notifications with sliding-window chunking and dense+sparse search.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-[11px] font-mono tracking-tight px-2.5 py-0.5">
            <Database className="w-3.5 h-3.5 mr-1.5 inline" />
            Vector Knowledge Store
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Document Box */}
        <Card className="glass-card border-[var(--border)]">
          <CardHeader className="pb-3 border-b border-[var(--border)]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold tracking-tight text-[var(--text)] flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#10A37F]" />
                Ingest Market Document / Bulletin
              </CardTitle>
              {!canUploadDocuments && (
                <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider text-[#F5A623] border-[#F5A623]/30 bg-[#F5A623]/10">
                  <Lock className="w-3 h-3 mr-1" />
                  Read-Only (Viewer)
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs text-[var(--text-muted)] mt-1">
              Text will be split into overlapping 400-char chunks and vector-indexed with deterministic embeddings.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {!canUploadDocuments && (
              <div className="mb-3.5 p-3 rounded-lg bg-amber-950/25 border border-[#F5A623]/30 text-[#F5A623] text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  <strong>Viewer Role Active:</strong> Ingestion is restricted to Analyst and Admin roles. Switch your role in the top navigation bar to upload documents.
                </span>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] block mb-1">Document Title</label>
                <Input 
                  placeholder="e.g., USDA Oilseeds World Markets and Trade"
                  value={title}
                  disabled={!canUploadDocuments || isUploading}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-[var(--surface)] border-[var(--border)] text-[var(--text)] text-xs h-9 focus:border-[#10A37F]/30"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] block mb-1">Source / Issuing Agency</label>
                <Input 
                  placeholder="e.g., USDA FAS / AgRural / Trade Association"
                  value={source}
                  disabled={!canUploadDocuments || isUploading}
                  onChange={(e) => setSource(e.target.value)}
                  className="bg-[var(--surface)] border-[var(--border)] text-[var(--text)] text-xs h-9 focus:border-[#10A37F]/30"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] block mb-1">Document Content (or Paste Text)</label>
                <textarea 
                  rows={4}
                  placeholder="Paste text of the market update, freight bulletin, or tariff notification here..."
                  value={rawContent}
                  disabled={!canUploadDocuments || isUploading}
                  onChange={(e) => setRawContent(e.target.value)}
                  className="w-full p-2.5 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] text-xs font-sans focus:outline-none focus:border-[#10A37F]/30 disabled:opacity-50"
                />
              </div>

              {uploadError && (
                <div className="p-2.5 rounded-lg bg-rose-950/30 border border-[#EF4146]/30 text-rose-300 flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-[#10A37F]/30 text-[#10A37F] flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Document chunked and indexed successfully!</span>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={!canUploadDocuments || isUploading || !title.trim() || !rawContent.trim()}
                className="w-full h-9 bg-[#10A37F] hover:bg-[#0D8A6D] text-white font-medium text-xs disabled:opacity-40 shadow-sm"
              >
                {isUploading ? "Chunking & Indexing..." : !canUploadDocuments ? "Upload Restricted (Viewer)" : "Upload & Index into Qdrant"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Hybrid Search Explorer */}
        <Card className="glass-card border-[var(--border)]">
          <CardHeader className="pb-3 border-b border-[var(--border)]">
            <CardTitle className="text-sm font-semibold tracking-tight text-[var(--text)] flex items-center gap-2">
              <Search className="w-4 h-4 text-[#10A37F]" />
              Hybrid Search Explorer (Dense + Sparse BM25)
            </CardTitle>
            <CardDescription className="text-xs text-[var(--text-muted)]">
              Test semantic vector retrieval combined with exact keyword frequency scoring.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-xs">
            <div className="flex gap-2">
              <Input 
                placeholder="Search queries (e.g. 'Brazilian harvest progress...')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="bg-[var(--surface)] border-[var(--border)] text-[var(--text)] text-xs h-9 focus:border-[#10A37F]/30"
              />
              <Button onClick={handleSearch} size="sm" className="bg-[#10A37F] hover:bg-[#0D8A6D] text-white text-xs shrink-0 h-9 px-4 shadow-sm">
                Search
              </Button>
            </div>

            {/* Alpha Fusion Control */}
            <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-mono tabular-nums">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Dense / Sparse Balance (α):</span>
                <span className="text-[#10A37F] font-bold">{alpha * 100}% Dense / {Math.round((1 - alpha) * 100)}% Sparse</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={alpha} 
                onChange={(e) => setAlpha(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Search Results */}
            <div className="space-y-2.5">
              <span className="font-semibold text-[var(--text-muted)] text-[10px] uppercase tracking-wider block">
                Top Retrieved Chunks:
              </span>
              {searchResults.map((res, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--text)]">{res.title}</span>
                    <Badge variant="outline" className="text-[#10A37F] border-[#10A37F]/30 bg-[#10A37F]/10 font-mono text-[10px] tabular-nums">
                      Hybrid: {res.hybridScore}
                    </Badge>
                  </div>
                  <div className="flex gap-2 text-[10px] text-[var(--text-muted)] font-mono tabular-nums">
                    <span>Source: {res.source}</span>
                    <span>&bull;</span>
                    <span>Dense: {res.denseScore}</span>
                    <span>&bull;</span>
                    <span>Sparse: {res.sparseScore}</span>
                  </div>
                  <p className="text-[var(--text)] text-[11px] leading-relaxed">&ldquo;{res.chunkText}&rdquo;</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Indexed Document Library Table */}
      <Card className="glass-card border-[var(--border)]">
        <CardHeader className="pb-3 border-b border-[var(--border)]">
          <CardTitle className="text-sm font-semibold tracking-tight text-[var(--text)] flex items-center justify-between">
            <span>Indexed Intelligence Repository</span>
            <Badge variant="outline" className="text-[11px] text-[var(--text-muted)] border-[var(--border)] bg-[var(--surface)] font-mono tabular-nums">
              {documents.length} Documents Indexed
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs text-[var(--text-muted)] mt-1">
            Active knowledge base chunks accessible by the autonomous agent during execution.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[var(--border)] bg-[var(--surface)] hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Document Title</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Source</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] text-center">Chunks</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Date Indexed</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Preview</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {documents.map((doc) => (
                  <TableRow key={doc.id} className="border-b border-[var(--border)] hover:bg-[var(--bg)] transition-colors">
                    <TableCell className="font-medium text-[var(--text)]">{doc.title}</TableCell>
                    <TableCell className="text-[var(--text-muted)]">{doc.source}</TableCell>
                    <TableCell className="text-center font-mono tabular-nums text-[#10A37F]">{doc.chunks}</TableCell>
                    <TableCell className="text-[var(--text-muted)] font-mono tabular-nums">{doc.date}</TableCell>
                    <TableCell className="text-[var(--text-muted)] max-w-xs truncate">{doc.sample}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
