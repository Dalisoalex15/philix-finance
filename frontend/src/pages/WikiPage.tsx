import { useState } from "react";
import { BookOpen, Search, Plus, Eye, ChevronRight } from "lucide-react";
import { mockWikiPages, formatDate } from "../lib/mock-data";

const CATEGORIES = ["All", "Procedures", "Guidelines", "Policies", "HR & Policy", "Training"];

export default function WikiPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<typeof mockWikiPages[0] | null>(null);

  const filtered = mockWikiPages.filter((p) => {
    const matchSearch = search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Knowledge Base</h1>
          <p className="page-subtitle">Policies, procedures, training guides, and staff manuals</p>
        </div>
        <button className="btn-primary">
          <Plus size={16} />
          New Article
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="input-base pl-9"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="philix-card p-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Categories</div>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition-colors ${
                  category === cat ? "bg-indigo-600/20 text-indigo-300" : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                {cat}
                <span className="text-xs text-slate-600">
                  {cat === "All" ? mockWikiPages.length : mockWikiPages.filter(p => p.category === cat).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {selected ? (
          <div className="lg:col-span-3 philix-card p-6">
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 mb-4 transition-colors"
            >
              ← Back to list
            </button>
            <div className="mb-4">
              <span className="badge-blue text-[10px] mb-2 inline-block">{selected.category}</span>
              <h2 className="text-2xl font-bold text-slate-100">{selected.title}</h2>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                <span>By {selected.author.firstName} {selected.author.lastName}</span>
                <span>·</span>
                <span>Updated {formatDate(selected.updatedAt)}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Eye size={10} /> {selected.viewCount} views</span>
              </div>
            </div>
            <div className="prose prose-invert max-w-none">
              <div className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
                {selected.content}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-3 space-y-3">
            {filtered.map((page) => (
              <div
                key={page.id}
                className="philix-card p-4 cursor-pointer hover:border-slate-700 transition-colors flex items-center gap-4"
                onClick={() => setSelected(page)}
              >
                <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 flex-shrink-0">
                  <BookOpen size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-200">{page.title}</div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span className="badge-blue text-[10px]">{page.category}</span>
                    <span>By {page.author.firstName} {page.author.lastName}</span>
                    <span>Updated {formatDate(page.updatedAt)}</span>
                    <span className="flex items-center gap-0.5"><Eye size={10} /> {page.viewCount}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-600 flex-shrink-0" />
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
                <p>No articles found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
