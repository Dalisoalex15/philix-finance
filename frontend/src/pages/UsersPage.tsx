import { useState } from "react";
import { Plus, UserCog } from "lucide-react";
import { mockUsers, formatDate, getStatusColor } from "../lib/mock-data";

export default function UsersPage() {
  const [users] = useState(mockUsers);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="page-subtitle">Manage user accounts, roles, and access permissions</p>
        </div>
        <button className="btn-primary"><Plus size={16} /> Add Staff</button>
      </div>

      <div className="philix-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Employee ID</th>
                <th>Role</th>
                <th>Branch</th>
                <th>Loans Issued</th>
                <th>Status</th>
                <th>Last Login</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="table-row-hover">
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-600/30 flex items-center justify-center text-xs font-bold text-indigo-400">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <div className="font-medium text-slate-200">{user.firstName} {user.lastName}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-xs text-slate-400">{user.employeeId}</td>
                  <td><span className={getStatusColor(user.role)}>{user.role.replace(/_/g, " ")}</span></td>
                  <td className="text-slate-400 text-sm">{user.branch?.name || "—"}</td>
                  <td className="text-slate-300">{user._count.loansCreated}</td>
                  <td><span className={getStatusColor(user.status)}>{user.status}</span></td>
                  <td className="text-xs text-slate-500">{user.lastLoginAt ? formatDate(user.lastLoginAt) : "Never"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
