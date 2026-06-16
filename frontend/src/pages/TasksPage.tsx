import { useState } from "react";
import { Plus, CheckSquare, Clock, AlertTriangle, CheckCircle, User } from "lucide-react";
import { mockTasks, mockUsers, formatDate } from "../lib/mock-data";

const PRIORITIES = { URGENT: "text-red-400 bg-red-900/30", HIGH: "text-orange-400 bg-orange-900/30", MEDIUM: "text-amber-400 bg-amber-900/30", LOW: "text-slate-400 bg-slate-800" };
const STATUS_ICONS = { PENDING: Clock, IN_PROGRESS: AlertTriangle, COMPLETED: CheckCircle, CANCELLED: CheckSquare };

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assignee: { firstName: string; lastName: string };
  createdBy: { firstName: string; lastName: string };
  completedAt?: string;
  createdAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks as Task[]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showNew, setShowNew] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", assigneeId: "", priority: "MEDIUM", dueDate: "" });

  const filtered = tasks.filter((t) => statusFilter === "ALL" || t.status === statusFilter);

  const updateStatus = (id: string, status: string) => {
    setTasks((prev) => prev.map((t) =>
      t.id === id ? { ...t, status, completedAt: status === "COMPLETED" ? new Date().toISOString() : undefined } : t
    ));
  };

  const addTask = () => {
    if (!newTask.title || !newTask.assigneeId) return;
    const assignee = mockUsers.find((u) => u.id === newTask.assigneeId);
    if (!assignee) return;
    const task: Task = {
      id: `task-${Date.now()}`,
      ...newTask,
      status: "PENDING",
      assignee: { firstName: assignee.firstName, lastName: assignee.lastName },
      createdBy: { firstName: "Daliso", lastName: "Phiri" },
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [task, ...prev]);
    setNewTask({ title: "", description: "", assigneeId: "", priority: "MEDIUM", dueDate: "" });
    setShowNew(false);
  };

  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === "PENDING").length,
    inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
    completed: tasks.filter(t => t.status === "COMPLETED").length,
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Task Management</h1>
          <p className="page-subtitle">Assign, track, and complete internal operations tasks</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary">
          <Plus size={16} />
          New Task
        </button>
      </div>

      {/* Stat Pills */}
      <div className="flex gap-3 flex-wrap">
        {[
          { key: "ALL", label: `All (${counts.all})` },
          { key: "PENDING", label: `Pending (${counts.pending})` },
          { key: "IN_PROGRESS", label: `In Progress (${counts.inProgress})` },
          { key: "COMPLETED", label: `Completed (${counts.completed})` },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(s.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              statusFilter === s.key ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* New Task Form */}
      {showNew && (
        <div className="philix-card p-5 border-indigo-800/50 border animate-fade-in">
          <h3 className="section-title mb-4">New Task</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Title *</label>
              <input className="input-base" value={newTask.title} onChange={(e) => setNewTask(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Call client about overdue loan" />
            </div>
            <div className="lg:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Description</label>
              <textarea className="input-base resize-none" rows={2} value={newTask.description} onChange={(e) => setNewTask(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Assign To *</label>
              <select className="input-base" value={newTask.assigneeId} onChange={(e) => setNewTask(p => ({ ...p, assigneeId: e.target.value }))}>
                <option value="">Select staff member</option>
                {mockUsers.filter(u => u.status === "ACTIVE").map(u => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role.replace("_", " ")})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Priority</label>
              <select className="input-base" value={newTask.priority} onChange={(e) => setNewTask(p => ({ ...p, priority: e.target.value }))}>
                {["URGENT", "HIGH", "MEDIUM", "LOW"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Due Date</label>
              <input type="date" className="input-base" value={newTask.dueDate} onChange={(e) => setNewTask(p => ({ ...p, dueDate: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={addTask} className="btn-primary">Create Task</button>
            <button onClick={() => setShowNew(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Task Grid */}
      <div className="space-y-3">
        {filtered.map((task) => {
          const Icon = STATUS_ICONS[task.status as keyof typeof STATUS_ICONS] || Clock;
          const priorityStyle = PRIORITIES[task.priority as keyof typeof PRIORITIES] || PRIORITIES.LOW;
          const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "COMPLETED";

          return (
            <div key={task.id} className={`philix-card p-4 ${task.status === "COMPLETED" ? "opacity-60" : ""}`}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex-shrink-0 ${
                  task.status === "COMPLETED" ? "text-emerald-400" :
                  task.status === "IN_PROGRESS" ? "text-indigo-400" : "text-slate-500"
                }`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className={`text-sm font-medium ${task.status === "COMPLETED" ? "text-slate-400 line-through" : "text-slate-100"}`}>
                      {task.title}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${priorityStyle}`}>
                      {task.priority}
                    </span>
                    {isOverdue && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-red-900/50 text-red-400">OVERDUE</span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User size={11} />
                      {task.assignee.firstName} {task.assignee.lastName}
                    </span>
                    {task.dueDate && (
                      <span className={isOverdue ? "text-red-400" : ""}>
                        Due: {formatDate(task.dueDate)}
                      </span>
                    )}
                    <span>By: {task.createdBy.firstName} {task.createdBy.lastName}</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {task.status !== "COMPLETED" && task.status !== "CANCELLED" && (
                    <div className="flex gap-1">
                      {task.status === "PENDING" && (
                        <button
                          onClick={() => updateStatus(task.id, "IN_PROGRESS")}
                          className="px-2 py-1 text-xs rounded bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40 transition-colors"
                        >
                          Start
                        </button>
                      )}
                      <button
                        onClick={() => updateStatus(task.id, "COMPLETED")}
                        className="px-2 py-1 text-xs rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  )}
                  {task.status === "COMPLETED" && (
                    <span className="text-xs text-emerald-400">✓ Complete</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <CheckSquare size={32} className="mx-auto mb-3 opacity-30" />
            <p>No tasks in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
