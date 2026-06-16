import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, CheckCircle, GraduationCap, Briefcase, ShoppingBag } from "lucide-react";

const CAMPUSES = ["UNZA", "CBU", "UNILUS", "Other"] as const;

export default function NewClientPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    type: "STUDENT",
    firstName: "", lastName: "", nrcNumber: "",
    dateOfBirth: "", gender: "MALE", phone: "", whatsapp: "", email: "",
    address: "", city: "", province: "Lusaka",
    // Next of kin (from plan §4.2)
    nextOfKinName: "", nextOfKinPhone: "", nextOfKinRelation: "",
    // Student-specific
    campus: "UNZA" as typeof CAMPUSES[number],
    programme: "", yearOfStudy: "",
    studentId: "",
    // Employment
    employer: "", jobTitle: "", monthlySalary: "", payDate: "",
    // Business
    businessName: "", businessType: "", marketLocation: "", monthlyRevenue: "", yearsOperating: "",
    // Notes
    notes: "",
  });

  const f = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => navigate("/clients"), 2000);
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-navy-900 mb-2" style={{ fontFamily: "Fraunces, serif" }}>Client Registered!</h2>
        <p className="text-navy-500">Redirecting to client list...</p>
      </div>
    );
  }

  const clientTypes = [
    { value: "STUDENT",       label: "Student",        icon: GraduationCap },
    { value: "CIVIL_SERVANT", label: "Civil Servant",  icon: Briefcase },
    { value: "BUSINESS_OWNER",label: "Business Owner", icon: ShoppingBag },
    { value: "MARKET_TRADER", label: "Market Trader",  icon: ShoppingBag },
    { value: "ENTREPRENEUR",  label: "Entrepreneur",   icon: Briefcase },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/clients")} className="btn-secondary py-2 px-3">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="page-title">Register New Client</h1>
          <p className="page-subtitle">Complete all required fields to create a borrower profile</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Type */}
        <div className="philix-card p-5">
          <h3 className="section-title mb-4">Client Category</h3>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {clientTypes.map(({ value, label, icon: Icon }) => (
              <button key={value} type="button" onClick={() => setForm(p => ({ ...p, type: value }))}
                className={`p-3 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center gap-2 ${
                  form.type === value
                    ? "border-gold-500 bg-gold-50 text-gold-800 shadow-sm"
                    : "border-warm-200 text-navy-500 hover:border-gold-300 hover:bg-warm-50"
                }`}>
                <Icon size={18} className={form.type === value ? "text-gold-600" : "text-navy-400"} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Personal Information */}
        <div className="philix-card p-5">
          <h3 className="section-title mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="input-label">First Name *</label>
              <input className="input-base" value={form.firstName} onChange={f("firstName")} required placeholder="e.g. Mwansa" />
            </div>
            <div>
              <label className="input-label">Last Name *</label>
              <input className="input-base" value={form.lastName} onChange={f("lastName")} required placeholder="e.g. Tembo" />
            </div>
            <div>
              <label className="input-label">NRC Number *</label>
              <input className="input-base font-mono" placeholder="000000/00/0" value={form.nrcNumber} onChange={f("nrcNumber")} required />
            </div>
            <div>
              <label className="input-label">Date of Birth *</label>
              <input type="date" className="input-base" value={form.dateOfBirth} onChange={f("dateOfBirth")} required />
            </div>
            <div>
              <label className="input-label">Gender</label>
              <select className="input-base" value={form.gender} onChange={f("gender")}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            <div>
              <label className="input-label">Phone *</label>
              <input className="input-base font-mono" placeholder="+260 97X XXX XXX" value={form.phone} onChange={f("phone")} required />
            </div>
            <div>
              <label className="input-label">WhatsApp</label>
              <input className="input-base font-mono" placeholder="Same as phone or different" value={form.whatsapp} onChange={f("whatsapp")} />
            </div>
            <div>
              <label className="input-label">Email Address</label>
              <input type="email" className="input-base" placeholder="client@example.com" value={form.email} onChange={f("email")} />
            </div>
            <div>
              <label className="input-label">City *</label>
              <input className="input-base" value={form.city} onChange={f("city")} required placeholder="e.g. Lusaka" />
            </div>
            <div className="lg:col-span-2">
              <label className="input-label">Home Address / Hostel *</label>
              <input className="input-base" value={form.address} onChange={f("address")} required placeholder="e.g. House 12, Plot 45, Kabwata" />
            </div>
            <div>
              <label className="input-label">Province</label>
              <select className="input-base" value={form.province} onChange={f("province")}>
                {["Lusaka","Copperbelt","Eastern","Northern","Southern","Western","Central","Luapula","North-Western","Muchinga"].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Next of Kin (§4.2 requirement) */}
        <div className="philix-card p-5">
          <h3 className="section-title mb-1">Next of Kin / Emergency Contact</h3>
          <p className="text-xs text-navy-400 mb-4">Required for all client profiles</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="input-label">Full Name *</label>
              <input className="input-base" value={form.nextOfKinName} onChange={f("nextOfKinName")} required placeholder="e.g. Grace Tembo" />
            </div>
            <div>
              <label className="input-label">Phone Number *</label>
              <input className="input-base font-mono" placeholder="+260 97X XXX XXX" value={form.nextOfKinPhone} onChange={f("nextOfKinPhone")} required />
            </div>
            <div>
              <label className="input-label">Relationship</label>
              <select className="input-base" value={form.nextOfKinRelation} onChange={f("nextOfKinRelation")}>
                <option value="">Select...</option>
                <option>Parent</option>
                <option>Spouse</option>
                <option>Sibling</option>
                <option>Guardian</option>
                <option>Friend</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Student Information (§4.2 campus, programme) */}
        {form.type === "STUDENT" && (
          <div className="philix-card p-5">
            <h3 className="section-title mb-4">Student Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Campus *</label>
                <div className="flex gap-2 flex-wrap">
                  {CAMPUSES.map(c => (
                    <button key={c} type="button"
                      onClick={() => setForm(p => ({ ...p, campus: c }))}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                        form.campus === c
                          ? "bg-navy-900 text-white border-navy-900"
                          : "bg-white text-navy-600 border-warm-300 hover:border-navy-400"
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="input-label">Student ID</label>
                <input className="input-base font-mono" placeholder="e.g. 2021012345" value={form.studentId} onChange={f("studentId")} />
              </div>
              <div>
                <label className="input-label">Programme / Degree *</label>
                <input className="input-base" value={form.programme} onChange={f("programme")} required placeholder="e.g. BSc Computer Science" />
              </div>
              <div>
                <label className="input-label">Year of Study</label>
                <select className="input-base" value={form.yearOfStudy} onChange={f("yearOfStudy")}>
                  <option value="">Select year...</option>
                  {["Year 1","Year 2","Year 3","Year 4","Year 5","Masters","PhD"].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Employment */}
        {(form.type === "CIVIL_SERVANT" || form.type === "ENTREPRENEUR") && (
          <div className="philix-card p-5">
            <h3 className="section-title mb-4">Employment Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Employer *</label>
                <input className="input-base" value={form.employer} onChange={f("employer")} required />
              </div>
              <div>
                <label className="input-label">Job Title</label>
                <input className="input-base" value={form.jobTitle} onChange={f("jobTitle")} />
              </div>
              <div>
                <label className="input-label">Monthly Salary (K)</label>
                <input type="number" className="input-base font-mono" value={form.monthlySalary} onChange={f("monthlySalary")} placeholder="e.g. 8500" />
              </div>
              <div>
                <label className="input-label">Pay Date (Day of Month)</label>
                <input type="number" min={1} max={31} className="input-base font-mono" value={form.payDate} onChange={f("payDate")} placeholder="e.g. 25" />
              </div>
            </div>
          </div>
        )}

        {/* Business */}
        {(form.type === "BUSINESS_OWNER" || form.type === "MARKET_TRADER") && (
          <div className="philix-card p-5">
            <h3 className="section-title mb-4">Business Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Business Name *</label>
                <input className="input-base" value={form.businessName} onChange={f("businessName")} required />
              </div>
              <div>
                <label className="input-label">Business Type</label>
                <input className="input-base" value={form.businessType} onChange={f("businessType")} placeholder="e.g. Retail, Food, Services" />
              </div>
              <div>
                <label className="input-label">Market / Location</label>
                <input className="input-base" value={form.marketLocation} onChange={f("marketLocation")} />
              </div>
              <div>
                <label className="input-label">Monthly Revenue (K)</label>
                <input type="number" className="input-base font-mono" value={form.monthlyRevenue} onChange={f("monthlyRevenue")} />
              </div>
              <div>
                <label className="input-label">Years Operating</label>
                <input type="number" className="input-base font-mono" value={form.yearsOperating} onChange={f("yearsOperating")} />
              </div>
            </div>
          </div>
        )}

        {/* Staff Notes */}
        <div className="philix-card p-5">
          <h3 className="section-title mb-4">Staff Notes (Internal)</h3>
          <textarea
            className="input-base resize-none h-20"
            placeholder="Any additional notes about this client (not visible to client)..."
            value={form.notes}
            onChange={f("notes")}
          />
        </div>

        <div className="flex gap-3 pb-6">
          <button type="submit" className="btn-primary">
            <UserPlus size={16} />
            Register Client
          </button>
          <button type="button" onClick={() => navigate("/clients")} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
