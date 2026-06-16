import { useState } from "react";
import { Megaphone, Pin, Plus, Trash2 } from "lucide-react";
import { mockAnnouncements, formatDate } from "../lib/mock-data";

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: { firstName: string; lastName: string };
  isPinned: boolean;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements as Announcement[]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", isPinned: false });

  const add = () => {
    if (!form.title || !form.content) return;
    setAnnouncements(prev => [{
      id: `ann-${Date.now()}`,
      title: form.title,
      content: form.content,
      isPinned: form.isPinned,
      author: { firstName: "Daliso", lastName: "Phiri" },
      createdAt: new Date().toISOString(),
    }, ...prev]);
    setForm({ title: "", content: "", isPinned: false });
    setShowNew(false);
  };

  const remove = (id: string) => setAnnouncements(prev => prev.filter(a => a.id !== id));

  const pinned = announcements.filter(a => a.isPinned);
  const regular = announcements.filter(a => !a.isPinned);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Announcements</h1>
          <p className="page-subtitle">Internal notice board for staff communications</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary">
          <Plus size={16} />
          Post Announcement
        </button>
      </div>

      {showNew && (
        <div className="philix-card p-5 border-indigo-800/50 border animate-fade-in">
          <h3 className="section-title mb-4">New Announcement</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Title *</label>
              <input className="input-base" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Announcement title" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Content *</label>
              <textarea className="input-base resize-none" rows={4} value={form.content} onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Write the announcement..." />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPinned} onChange={(e) => setForm(p => ({ ...p, isPinned: e.target.checked }))} className="accent-indigo-600" />
              <span className="text-sm text-slate-300">Pin to top</span>
            </label>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={add} className="btn-primary">Post</button>
            <button onClick={() => setShowNew(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {pinned.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Pin size={12} /> Pinned
          </h3>
          <div className="space-y-3">
            {pinned.map((ann) => (
              <div key={ann.id} className="philix-card p-5 border-indigo-800/30 border">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Pin size={12} className="text-indigo-400 flex-shrink-0" />
                      <span className="font-semibold text-slate-100">{ann.title}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{ann.content}</p>
                    <div className="text-xs text-slate-500 mt-3">
                      Posted by {ann.author.firstName} {ann.author.lastName} · {formatDate(ann.createdAt)}
                    </div>
                  </div>
                  <button onClick={() => remove(ann.id)} className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {regular.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">All Announcements</h3>
          <div className="space-y-3">
            {regular.map((ann) => (
              <div key={ann.id} className="philix-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-amber-600/20 text-amber-400 flex-shrink-0 mt-0.5">
                      <Megaphone size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-100 mb-1">{ann.title}</div>
                      <p className="text-sm text-slate-300 leading-relaxed">{ann.content}</p>
                      <div className="text-xs text-slate-500 mt-2">
                        {ann.author.firstName} {ann.author.lastName} · {formatDate(ann.createdAt)}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => remove(ann.id)} className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
