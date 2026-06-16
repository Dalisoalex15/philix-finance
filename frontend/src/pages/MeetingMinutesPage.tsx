import { useState } from "react";
import { Users, Plus, ChevronDown, ChevronUp, CheckSquare } from "lucide-react";
import { mockMeetings, formatDate } from "../lib/mock-data";

export default function MeetingMinutesPage() {
  const [meetings] = useState(mockMeetings);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const typeColors: Record<string, string> = {
    MANAGEMENT: "badge-blue",
    BOARD: "badge-purple",
    STAFF: "badge-gray",
    CLIENT: "badge-yellow",
    CREDIT_COMMITTEE: "badge-red",
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Meeting Minutes</h1>
          <p className="page-subtitle">Record and archive all staff, management, and board meeting minutes</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-xs py-1.5">
          <Plus size={12} /> New Minutes
        </button>
      </div>

      {showForm && (
        <div className="philix-card p-5 animate-fade-in">
          <h3 className="section-title mb-4">Record Meeting Minutes</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Meeting Title *</label>
              <input className="input-base" placeholder="e.g. Weekly Credit Committee" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Type</label>
              <select className="input-base">
                {["MANAGEMENT","BOARD","STAFF","CLIENT","CREDIT_COMMITTEE"].map(t => (
                  <option key={t}>{t.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Meeting Date</label>
              <input type="date" className="input-base" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Venue / Location</label>
              <input className="input-base" placeholder="Head Office, Boardroom..." />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Chairperson</label>
              <select className="input-base">
                <option>Daliso Phiri</option>
                <option>Chileshe Mutale</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Attendees</label>
              <input className="input-base" placeholder="Comma-separated names..." />
            </div>
            <div className="lg:col-span-3">
              <label className="text-xs text-slate-400 mb-1 block">Agenda Items</label>
              <textarea className="input-base" rows={3} placeholder="1. Review portfolio...\n2. Approve disbursements...\n3. AOB" />
            </div>
            <div className="lg:col-span-3">
              <label className="text-xs text-slate-400 mb-1 block">Minutes / Discussion</label>
              <textarea className="input-base" rows={5} placeholder="Record the discussion, decisions, and action items..." />
            </div>
            <div className="lg:col-span-3">
              <label className="text-xs text-slate-400 mb-1 block">Action Items (one per line)</label>
              <textarea className="input-base" rows={3} placeholder="1. Daliso to review PAR report by Friday\n2. Patricia to follow up with overdue clients..." />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="btn-primary">Save Minutes</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {meetings.map(meeting => (
          <div key={meeting.id} className="philix-card overflow-hidden">
            <button onClick={() => setExpanded(expanded === meeting.id ? null : meeting.id)}
              className="w-full p-4 flex items-center gap-4 text-left hover:bg-slate-800/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                <Users size={16} className="text-indigo-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-200">{meeting.title}</span>
                  <span className={typeColors[meeting.meetingType] || "badge-gray"}>{meeting.meetingType.replace("_", " ")}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {formatDate(meeting.meetingDate)} · {meeting.venue} · Chaired by {meeting.chairperson.firstName} {meeting.chairperson.lastName}
                </div>
              </div>
              <div className="text-right mr-2">
                <div className="text-xs text-slate-500">{meeting.attendees?.length || 0} attendees</div>
              </div>
              {expanded === meeting.id ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
            </button>

            {expanded === meeting.id && (
              <div className="border-t border-slate-800 p-4 space-y-4">
                {meeting.agenda && (
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Agenda</div>
                    <div className="text-sm text-slate-300 whitespace-pre-line">{meeting.agenda}</div>
                  </div>
                )}
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Minutes</div>
                  <div className="text-sm text-slate-300 whitespace-pre-line">{meeting.minutes}</div>
                </div>
                {meeting.actionItems && meeting.actionItems.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Action Items</div>
                    <div className="space-y-1">
                      {meeting.actionItems.map((item: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                          <CheckSquare size={12} className="text-indigo-400 flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button className="btn-secondary text-xs py-1.5">Edit</button>
                  <button className="btn-secondary text-xs py-1.5">Export PDF</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
