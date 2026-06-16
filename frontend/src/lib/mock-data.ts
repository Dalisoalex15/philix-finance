// Philix Finance — Complete Mock Data
// Used for frontend development without a live backend

export const mockUser = {
  id: "usr-001",
  employeeId: "EMP-2024-0001",
  firstName: "Daliso",
  lastName: "Phiri",
  email: "daliso@philixfinance.com",
  phone: "+260 97 123 4567",
  role: "SUPER_ADMIN",
  branch: { id: "br-001", name: "Lusaka Main", code: "LUS-MAIN" },
  mfaEnabled: false,
  avatarUrl: null,
};

export const mockKPIs = {
  activeLoans: 287,
  overdueLoans: 34,
  defaultedLoans: 8,
  todayLoans: 6,
  monthLoans: 52,
  pendingApprovals: 11,
  totalCollateral: 312,
  totalOutstanding: 1_847_500,
  totalDisbursed: 4_250_000,
  totalCollected: 2_402_500,
  next7DaysCollections: 245_800,
  upcomingCount: 67,
  defaultRate: 2.8,
  recoveryRate: 71.4,
};

export const mockLoanStatusChart = [
  { status: "ACTIVE", count: 287, fill: "#6366f1" },
  { status: "OVERDUE", count: 34, fill: "#f59e0b" },
  { status: "PAID", count: 421, fill: "#10b981" },
  { status: "DEFAULTED", count: 8, fill: "#ef4444" },
  { status: "PENDING", count: 11, fill: "#64748b" },
];

export const mockMonthlyDisbursements = [
  { month: "Jul 2024", amount: 245000, count: 28 },
  { month: "Aug 2024", amount: 312000, count: 35 },
  { month: "Sep 2024", amount: 287000, count: 31 },
  { month: "Oct 2024", amount: 341000, count: 38 },
  { month: "Nov 2024", amount: 298000, count: 33 },
  { month: "Dec 2024", amount: 267000, count: 29 },
  { month: "Jan 2025", amount: 389000, count: 44 },
  { month: "Feb 2025", amount: 356000, count: 40 },
  { month: "Mar 2025", amount: 412000, count: 47 },
  { month: "Apr 2025", amount: 378000, count: 42 },
  { month: "May 2025", amount: 445000, count: 51 },
  { month: "Jun 2025", amount: 521000, count: 58 },
];

export const mockRepaymentTrend = [
  { week: "W1", amount: 87400, count: 42 },
  { week: "W2", amount: 95200, count: 48 },
  { week: "W3", amount: 78600, count: 38 },
  { week: "W4", amount: 112300, count: 57 },
  { week: "W5", amount: 98700, count: 49 },
  { week: "W6", amount: 134500, count: 66 },
  { week: "W7", amount: 121000, count: 59 },
  { week: "W8", amount: 145600, count: 71 },
  { week: "W9", amount: 108900, count: 53 },
  { week: "W10", amount: 167800, count: 82 },
  { week: "W11", amount: 143200, count: 70 },
  { week: "W12", amount: 189400, count: 93 },
];

export const mockPAR = [
  { days: 1, amount: 284500, percentage: 15.4, count: 34 },
  { days: 7, amount: 198200, percentage: 10.7, count: 24 },
  { days: 30, amount: 134600, percentage: 7.3, count: 16 },
  { days: 60, amount: 87400, percentage: 4.7, count: 10 },
  { days: 90, amount: 52300, percentage: 2.8, count: 8 },
];

export const mockCapitalUtilization = {
  totalCapital: 2_500_000,
  capitalLoaned: 1_847_500,
  availableCapital: 652_500,
  utilizationPct: 73.9,
};

export const mockClients = [
  {
    id: "clt-001", clientNumber: "CLT-2024-10023", firstName: "Mwansa", lastName: "Tembo",
    phone: "+260 97 456 7890", email: "mwansa.tembo@email.com", type: "STUDENT",
    status: "ACTIVE", riskRating: "LOW", internalScore: 78, city: "Lusaka",
    university: "University of Zambia", createdAt: "2024-02-15T10:30:00Z",
    _count: { loans: 2 },
  },
  {
    id: "clt-002", clientNumber: "CLT-2024-10024", firstName: "Grace", lastName: "Mwale",
    phone: "+260 96 789 0123", email: "grace.mwale@email.com", type: "CIVIL_SERVANT",
    status: "ACTIVE", riskRating: "LOW", internalScore: 82, city: "Lusaka",
    employer: "Ministry of Health", createdAt: "2024-03-01T09:00:00Z",
    _count: { loans: 3 },
  },
  {
    id: "clt-003", clientNumber: "CLT-2024-10025", firstName: "Bwalya", lastName: "Mutale",
    phone: "+260 95 012 3456", email: null, type: "BUSINESS_OWNER",
    status: "ACTIVE", riskRating: "MEDIUM", internalScore: 61, city: "Kitwe",
    businessName: "Mutale Electronics", createdAt: "2024-03-15T14:00:00Z",
    _count: { loans: 1 },
  },
  {
    id: "clt-004", clientNumber: "CLT-2024-10026", firstName: "Chanda", lastName: "Ng'ona",
    phone: "+260 97 234 5678", email: null, type: "MARKET_TRADER",
    status: "ACTIVE", riskRating: "HIGH", internalScore: 44, city: "Lusaka",
    businessName: "Ng'ona Market Stall", createdAt: "2024-04-01T11:00:00Z",
    _count: { loans: 2 },
  },
  {
    id: "clt-005", clientNumber: "CLT-2024-10027", firstName: "Namukolo", lastName: "Phiri",
    phone: "+260 96 345 6789", email: "namukolo@email.com", type: "STUDENT",
    status: "ACTIVE", riskRating: "LOW", internalScore: 75, city: "Ndola",
    university: "Copperbelt University", createdAt: "2024-04-10T08:00:00Z",
    _count: { loans: 1 },
  },
  {
    id: "clt-006", clientNumber: "CLT-2024-10028", firstName: "Mulenga", lastName: "Banda",
    phone: "+260 95 456 7890", email: null, type: "ENTREPRENEUR",
    status: "ACTIVE", riskRating: "MEDIUM", internalScore: 58, city: "Livingstone",
    businessName: "Banda Tech Services", createdAt: "2024-04-20T16:00:00Z",
    _count: { loans: 1 },
  },
  {
    id: "clt-007", clientNumber: "CLT-2024-10029", firstName: "Kapembwa", lastName: "Sakala",
    phone: "+260 97 567 8901", email: null, type: "CIVIL_SERVANT",
    status: "BLACKLISTED", riskRating: "CRITICAL", internalScore: 18, city: "Lusaka",
    employer: "Zambia Police Service", createdAt: "2024-01-15T10:00:00Z",
    _count: { loans: 3 },
  },
  {
    id: "clt-008", clientNumber: "CLT-2025-10001", firstName: "Mwila", lastName: "Chileshe",
    phone: "+260 96 678 9012", email: "mwila.c@email.com", type: "STUDENT",
    status: "ACTIVE", riskRating: "LOW", internalScore: 71, city: "Lusaka",
    university: "Mulungushi University", createdAt: "2025-01-05T09:00:00Z",
    _count: { loans: 1 },
  },
];

export const mockLoans = [
  {
    id: "loan-001", loanNumber: "PF-2024-1001", clientId: "clt-001",
    client: { firstName: "Mwansa", lastName: "Tembo", clientNumber: "CLT-2024-10023", phone: "+260 97 456 7890" },
    loanOfficer: { firstName: "Lubuto", lastName: "Mwamba" },
    collateral: { vaultId: "VLT-2024-100023", type: "LAPTOP", brand: "HP", model: "EliteBook 840" },
    status: "ACTIVE", loanType: "Student Loan", principal: 8000,
    interestRate: 15, totalDue: 9800, totalPaid: 4200,
    outstandingBalance: 5600, installmentAmount: 2450,
    repaymentFrequency: "MONTHLY", totalInstallments: 4, daysLate: 0,
    disbursementDate: "2024-09-01T00:00:00Z", maturityDate: "2025-01-01T00:00:00Z",
    collectionStatus: "CURRENT", createdAt: "2024-08-28T10:30:00Z",
    _count: { payments: 2 },
  },
  {
    id: "loan-002", loanNumber: "PF-2024-1002", clientId: "clt-002",
    client: { firstName: "Grace", lastName: "Mwale", clientNumber: "CLT-2024-10024", phone: "+260 96 789 0123" },
    loanOfficer: { firstName: "Mwamba", lastName: "Kasonde" },
    collateral: { vaultId: "VLT-2024-100024", type: "SMARTPHONE", brand: "Samsung", model: "Galaxy S22" },
    status: "ACTIVE", loanType: "Civil Servant Loan", principal: 5000,
    interestRate: 12, totalDue: 5900, totalPaid: 2950,
    outstandingBalance: 2950, installmentAmount: 1475,
    repaymentFrequency: "BIWEEKLY", totalInstallments: 4, daysLate: 0,
    disbursementDate: "2024-10-15T00:00:00Z", maturityDate: "2024-12-15T00:00:00Z",
    collectionStatus: "CURRENT", createdAt: "2024-10-10T09:00:00Z",
    _count: { payments: 2 },
  },
  {
    id: "loan-003", loanNumber: "PF-2024-1003", clientId: "clt-003",
    client: { firstName: "Bwalya", lastName: "Mutale", clientNumber: "CLT-2024-10025", phone: "+260 95 012 3456" },
    loanOfficer: { firstName: "Lubuto", lastName: "Mwamba" },
    collateral: { vaultId: "VLT-2024-100025", type: "LAPTOP", brand: "Lenovo", model: "ThinkPad X1" },
    status: "OVERDUE", loanType: "Business Loan", principal: 12000,
    interestRate: 18, totalDue: 14800, totalPaid: 3700,
    outstandingBalance: 11100, installmentAmount: 3700,
    repaymentFrequency: "MONTHLY", totalInstallments: 4, daysLate: 23,
    disbursementDate: "2024-08-01T00:00:00Z", maturityDate: "2024-12-01T00:00:00Z",
    collectionStatus: "DAYS_30", createdAt: "2024-07-28T14:00:00Z",
    _count: { payments: 1 },
  },
  {
    id: "loan-004", loanNumber: "PF-2024-1004", clientId: "clt-005",
    client: { firstName: "Namukolo", lastName: "Phiri", clientNumber: "CLT-2024-10027", phone: "+260 96 345 6789" },
    loanOfficer: { firstName: "Mwamba", lastName: "Kasonde" },
    collateral: { vaultId: "VLT-2024-100027", type: "TABLET", brand: "iPad", model: "iPad Air 5" },
    status: "ACTIVE", loanType: "Student Loan", principal: 6500,
    interestRate: 14, totalDue: 7800, totalPaid: 1950,
    outstandingBalance: 5850, installmentAmount: 1950,
    repaymentFrequency: "MONTHLY", totalInstallments: 4, daysLate: 0,
    disbursementDate: "2024-11-01T00:00:00Z", maturityDate: "2025-03-01T00:00:00Z",
    collectionStatus: "CURRENT", createdAt: "2024-10-28T08:00:00Z",
    _count: { payments: 1 },
  },
  {
    id: "loan-005", loanNumber: "PF-2024-1005", clientId: "clt-004",
    client: { firstName: "Chanda", lastName: "Ng'ona", clientNumber: "CLT-2024-10026", phone: "+260 97 234 5678" },
    loanOfficer: { firstName: "Lubuto", lastName: "Mwamba" },
    collateral: { vaultId: "VLT-2024-100026", type: "SMARTPHONE", brand: "iPhone", model: "iPhone 13" },
    status: "DEFAULTED", loanType: "Short-term Loan", principal: 3000,
    interestRate: 20, totalDue: 3800, totalPaid: 800,
    outstandingBalance: 3000, installmentAmount: 950,
    repaymentFrequency: "WEEKLY", totalInstallments: 4, daysLate: 87,
    disbursementDate: "2024-07-15T00:00:00Z", maturityDate: "2024-08-12T00:00:00Z",
    collectionStatus: "DEFAULT", createdAt: "2024-07-12T11:00:00Z",
    _count: { payments: 1 },
  },
];

export const mockCollateral = [
  {
    id: "col-001", vaultId: "VLT-2024-100023", type: "LAPTOP", status: "HELD",
    brand: "HP", model: "EliteBook 840 G9", serialNumber: "HP2024X12345",
    color: "Silver", condition: "EXCELLENT", batteryHealth: 94,
    marketValue: 9500, forcedSaleValue: 6650, maxLoanAmount: 4987, loanToValue: 70,
    shelfNumber: "A-03", vaultPosition: "A-03-05", lockerNumber: null,
    hasCharger: true, hasBox: true, ageYears: 0.8,
    client: { firstName: "Mwansa", lastName: "Tembo", clientNumber: "CLT-2024-10023" },
    receivedAt: "2024-08-28T10:00:00Z",
  },
  {
    id: "col-002", vaultId: "VLT-2024-100024", type: "SMARTPHONE", status: "HELD",
    brand: "Samsung", model: "Galaxy S22 Ultra", serialNumber: null, imei: "352099001761481",
    color: "Phantom Black", condition: "GOOD", batteryHealth: 87,
    marketValue: 5800, forcedSaleValue: 4060, maxLoanAmount: 3045, loanToValue: 75,
    shelfNumber: "B-01", vaultPosition: "B-01-12", lockerNumber: "L-004",
    hasCharger: true, hasBox: false, ageYears: 1.5,
    client: { firstName: "Grace", lastName: "Mwale", clientNumber: "CLT-2024-10024" },
    receivedAt: "2024-10-10T09:00:00Z",
  },
  {
    id: "col-003", vaultId: "VLT-2024-100025", type: "LAPTOP", status: "HELD",
    brand: "Lenovo", model: "ThinkPad X1 Carbon", serialNumber: "LNV2023T98765",
    color: "Black", condition: "GOOD", batteryHealth: 81,
    marketValue: 11200, forcedSaleValue: 7840, maxLoanAmount: 5880, loanToValue: 75,
    shelfNumber: "A-01", vaultPosition: "A-01-08", lockerNumber: null,
    hasCharger: true, hasBox: true, ageYears: 1.2,
    client: { firstName: "Bwalya", lastName: "Mutale", clientNumber: "CLT-2024-10025" },
    receivedAt: "2024-07-28T14:00:00Z",
  },
  {
    id: "col-004", vaultId: "VLT-2024-100026", type: "SMARTPHONE", status: "AUCTIONED",
    brand: "Apple", model: "iPhone 13 Pro", serialNumber: null, imei: "358765043021567",
    color: "Sierra Blue", condition: "FAIR", batteryHealth: 76,
    marketValue: 6200, forcedSaleValue: 4340, maxLoanAmount: 3255, loanToValue: 75,
    shelfNumber: null, vaultPosition: null, lockerNumber: null,
    hasCharger: false, hasBox: false, ageYears: 2.0,
    client: { firstName: "Chanda", lastName: "Ng'ona", clientNumber: "CLT-2024-10026" },
    receivedAt: "2024-07-12T11:00:00Z",
  },
  {
    id: "col-005", vaultId: "VLT-2024-100027", type: "TABLET", status: "HELD",
    brand: "Apple", model: "iPad Air 5th Gen", serialNumber: "IPAD2024A11111",
    color: "Space Gray", condition: "EXCELLENT", batteryHealth: 98,
    marketValue: 7800, forcedSaleValue: 5460, maxLoanAmount: 4095, loanToValue: 75,
    shelfNumber: "C-02", vaultPosition: "C-02-03", lockerNumber: null,
    hasCharger: true, hasBox: true, ageYears: 0.5,
    client: { firstName: "Namukolo", lastName: "Phiri", clientNumber: "CLT-2024-10027" },
    receivedAt: "2024-10-28T08:00:00Z",
  },
  {
    id: "col-006", vaultId: "VLT-2024-100028", type: "GAMING_CONSOLE", status: "HELD",
    brand: "Sony", model: "PlayStation 5", serialNumber: "PS5ZA20240099",
    color: "White", condition: "GOOD", batteryHealth: null,
    marketValue: 8500, forcedSaleValue: 5950, maxLoanAmount: 4462, loanToValue: 75,
    shelfNumber: "D-01", vaultPosition: "D-01-01", lockerNumber: null,
    hasCharger: true, hasBox: true, ageYears: 1.0,
    client: { firstName: "Mulenga", lastName: "Banda", clientNumber: "CLT-2024-10028" },
    receivedAt: "2024-04-20T16:00:00Z",
  },
];

// Campus performance breakdown (§5.8 Campus Performance — UNZA, CBU, UNILUS)
export const mockCampusPerformance = [
  { campus: "UNZA",   clients: 142, activeLoans: 118, totalDisbursed: 1_890_000, totalOutstanding: 845_200, totalCollected: 1_044_800, overdueLoans: 14, collectionRate: 91.4, par30: 5.8 },
  { campus: "CBU",    clients:  97, activeLoans:  89, totalDisbursed: 1_340_000, totalOutstanding: 612_300, totalCollected:   727_700, overdueLoans: 12, collectionRate: 88.7, par30: 8.2 },
  { campus: "UNILUS", clients:  48, activeLoans:  43, totalDisbursed:   620_000, totalOutstanding: 267_400, totalCollected:   352_600, overdueLoans:  8, collectionRate: 93.1, par30: 4.1 },
];

export const mockTopOfficers = [
  { id: "usr-002", name: "Lubuto Mwamba", role: "LOAN_OFFICER", loansIssued: 89, activeLoans: 54, collectionRate: 94.2, totalCollected: 678900 },
  { id: "usr-003", name: "Mwamba Kasonde", role: "LOAN_OFFICER", loansIssued: 76, activeLoans: 48, collectionRate: 91.8, totalCollected: 542100 },
  { id: "usr-004", name: "Chanda Mwila", role: "LOAN_OFFICER", loansIssued: 67, activeLoans: 42, collectionRate: 88.5, totalCollected: 489700 },
  { id: "usr-005", name: "Inonge Nkole", role: "MANAGER", loansIssued: 54, activeLoans: 33, collectionRate: 96.1, totalCollected: 412300 },
  { id: "usr-006", name: "Tembo Sitali", role: "LOAN_OFFICER", loansIssued: 45, activeLoans: 28, collectionRate: 85.3, totalCollected: 315600 },
];

export const mockUpcomingCollections = [
  {
    id: "sch-001", dueDate: new Date(Date.now() + 1 * 86400000).toISOString(),
    totalDue: 2450, totalPaid: 0, status: "PENDING",
    loan: {
      loanNumber: "PF-2024-1001",
      client: { firstName: "Mwansa", lastName: "Tembo", phone: "+260 97 456 7890" },
    },
  },
  {
    id: "sch-002", dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    totalDue: 1475, totalPaid: 0, status: "PENDING",
    loan: {
      loanNumber: "PF-2024-1002",
      client: { firstName: "Grace", lastName: "Mwale", phone: "+260 96 789 0123" },
    },
  },
  {
    id: "sch-003", dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    totalDue: 3700, totalPaid: 0, status: "OVERDUE",
    loan: {
      loanNumber: "PF-2024-1003",
      client: { firstName: "Bwalya", lastName: "Mutale", phone: "+260 95 012 3456" },
    },
  },
  {
    id: "sch-004", dueDate: new Date(Date.now() + 4 * 86400000).toISOString(),
    totalDue: 1950, totalPaid: 0, status: "PENDING",
    loan: {
      loanNumber: "PF-2024-1004",
      client: { firstName: "Namukolo", lastName: "Phiri", phone: "+260 96 345 6789" },
    },
  },
  {
    id: "sch-005", dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    totalDue: 4200, totalPaid: 0, status: "PENDING",
    loan: {
      loanNumber: "PF-2024-1007",
      client: { firstName: "Mwila", lastName: "Chileshe", phone: "+260 96 678 9012" },
    },
  },
];

export const mockAnnouncements = [
  {
    id: "ann-001",
    title: "Monthly Target Review — June 2025",
    content: "All loan officers are reminded that our monthly disbursement target is K600,000. As of today we are at 86% completion. Please push remaining applications through by end of business Friday. Manager sign-offs will be expedited.",
    author: { firstName: "Daliso", lastName: "Phiri" },
    isPinned: true,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "ann-002",
    title: "Updated Collateral Assessment Guidelines",
    content: "Effective immediately, all smartphones must have IMEI recorded at intake. Laptops require serial number photo before they can be logged into the vault. Please refer to the Wiki for the updated assessment checklist.",
    author: { firstName: "Inonge", lastName: "Nkole" },
    isPinned: false,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "ann-003",
    title: "Staff Meeting — Thursday 10:00 AM",
    content: "Mandatory all-staff meeting this Thursday at 10:00 AM in the main conference room. Agenda: Q2 performance review, new loan product rollout, system training session. Attendance is compulsory.",
    author: { firstName: "Daliso", lastName: "Phiri" },
    isPinned: true,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

export const mockTasks = [
  {
    id: "task-001", title: "Call Bwalya Mutale — Overdue Loan PF-2024-1003",
    description: "Loan is 23 days overdue. Call to discuss repayment plan. Loan officer note: client experienced business slowdown.",
    status: "PENDING", priority: "URGENT",
    dueDate: new Date(Date.now() + 1 * 86400000).toISOString(),
    assignee: { firstName: "Lubuto", lastName: "Mwamba" },
    createdBy: { firstName: "Inonge", lastName: "Nkole" },
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "task-002", title: "Verify collateral — iPad Air VLT-2024-100027",
    description: "Physical check of iPad condition after 90 days in vault. Document any changes in condition.",
    status: "IN_PROGRESS", priority: "MEDIUM",
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    assignee: { firstName: "Mwamba", lastName: "Kasonde" },
    createdBy: { firstName: "Daliso", lastName: "Phiri" },
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "task-003", title: "Process loan application — Mwila Chileshe",
    description: "Complete NRC verification and collateral assessment for new student loan application. Client is at UNZA.",
    status: "PENDING", priority: "HIGH",
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    assignee: { firstName: "Chanda", lastName: "Mwila" },
    createdBy: { firstName: "Lubuto", lastName: "Mwamba" },
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "task-004", title: "Generate monthly investor report — May 2025",
    description: "Prepare PDF statement for all 4 active investors. Include capital balance, interest earned, and portfolio quality metrics.",
    status: "COMPLETED", priority: "HIGH",
    dueDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    completedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    assignee: { firstName: "Daliso", lastName: "Phiri" },
    createdBy: { firstName: "Daliso", lastName: "Phiri" },
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: "task-005", title: "Follow up — Chanda Ng'ona repossession",
    description: "iPhone 13 Pro needs to be listed for auction. Contact 3 potential buyers identified last week.",
    status: "IN_PROGRESS", priority: "URGENT",
    dueDate: new Date(Date.now() + 0 * 86400000).toISOString(),
    assignee: { firstName: "Inonge", lastName: "Nkole" },
    createdBy: { firstName: "Inonge", lastName: "Nkole" },
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export const mockInvestors = [
  {
    id: "inv-001", investorNumber: "INV-2023-0001", fullName: "Richard Banda",
    phone: "+260 97 111 2222", email: "rbanda@email.com",
    status: "ACTIVE", totalInvested: 500000, currentBalance: 512500,
    returnRate: 18, contractStart: "2023-01-01T00:00:00Z",
    _count: { investments: 3, payouts: 12 },
  },
  {
    id: "inv-002", investorNumber: "INV-2023-0002", fullName: "Josephine Mwansa",
    phone: "+260 96 333 4444", email: null,
    status: "ACTIVE", totalInvested: 300000, currentBalance: 307800,
    returnRate: 15, contractStart: "2023-06-01T00:00:00Z",
    _count: { investments: 1, payouts: 6 },
  },
  {
    id: "inv-003", investorNumber: "INV-2024-0001", fullName: "Patrick Chisanga",
    phone: "+260 95 555 6666", email: "p.chisanga@email.com",
    status: "ACTIVE", totalInvested: 750000, currentBalance: 781250,
    returnRate: 20, contractStart: "2024-01-15T00:00:00Z",
    _count: { investments: 2, payouts: 5 },
  },
  {
    id: "inv-004", investorNumber: "INV-2024-0002", fullName: "Fatima Daka",
    phone: "+260 97 777 8888", email: "fatima.d@email.com",
    status: "ACTIVE", totalInvested: 200000, currentBalance: 203500,
    returnRate: 14, contractStart: "2024-03-01T00:00:00Z",
    _count: { investments: 1, payouts: 3 },
  },
];

export const mockExpenses = [
  {
    id: "exp-001", category: "SALARY", description: "June 2025 Staff Salaries",
    amount: 48000, date: "2025-06-01T00:00:00Z", status: "APPROVED",
    vendorName: null, submittedBy: { firstName: "Daliso", lastName: "Phiri" },
  },
  {
    id: "exp-002", category: "RENT", description: "Office Rent — June 2025",
    amount: 8500, date: "2025-06-01T00:00:00Z", status: "APPROVED",
    vendorName: "Lusaka Property Holdings", submittedBy: { firstName: "Daliso", lastName: "Phiri" },
  },
  {
    id: "exp-003", category: "INTERNET", description: "Fibre Internet — June 2025",
    amount: 750, date: "2025-06-01T00:00:00Z", status: "APPROVED",
    vendorName: "Liquid Intelligent Technologies", submittedBy: { firstName: "Daliso", lastName: "Phiri" },
  },
  {
    id: "exp-004", category: "FUEL", description: "Fuel for client visits — Week 1",
    amount: 420, date: "2025-06-05T00:00:00Z", status: "APPROVED",
    vendorName: null, submittedBy: { firstName: "Lubuto", lastName: "Mwamba" },
  },
  {
    id: "exp-005", category: "AIRTIME", description: "Staff airtime bundle — June",
    amount: 300, date: "2025-06-01T00:00:00Z", status: "APPROVED",
    vendorName: null, submittedBy: { firstName: "Daliso", lastName: "Phiri" },
  },
  {
    id: "exp-006", category: "MARKETING", description: "Facebook/WhatsApp flyers printing",
    amount: 850, date: "2025-06-08T00:00:00Z", status: "PENDING",
    vendorName: "Lusaka Print Works", submittedBy: { firstName: "Chanda", lastName: "Mwila" },
  },
];

export const mockUsers = [
  {
    id: "usr-001", employeeId: "EMP-2023-0001", firstName: "Daliso", lastName: "Phiri",
    email: "daliso@philixfinance.com", phone: "+260 97 123 4567",
    role: "SUPER_ADMIN", status: "ACTIVE",
    branch: { name: "Lusaka Main" }, lastLoginAt: new Date().toISOString(),
    _count: { loansCreated: 0 },
  },
  {
    id: "usr-002", employeeId: "EMP-2023-0002", firstName: "Lubuto", lastName: "Mwamba",
    email: "lubuto@philixfinance.com", phone: "+260 97 234 5678",
    role: "LOAN_OFFICER", status: "ACTIVE",
    branch: { name: "Lusaka Main" }, lastLoginAt: new Date(Date.now() - 3600000).toISOString(),
    _count: { loansCreated: 89 },
  },
  {
    id: "usr-003", employeeId: "EMP-2023-0003", firstName: "Mwamba", lastName: "Kasonde",
    email: "kasonde@philixfinance.com", phone: "+260 96 345 6789",
    role: "LOAN_OFFICER", status: "ACTIVE",
    branch: { name: "Lusaka Main" }, lastLoginAt: new Date(Date.now() - 7200000).toISOString(),
    _count: { loansCreated: 76 },
  },
  {
    id: "usr-004", employeeId: "EMP-2024-0001", firstName: "Chanda", lastName: "Mwila",
    email: "cmwila@philixfinance.com", phone: "+260 95 456 7890",
    role: "LOAN_OFFICER", status: "ACTIVE",
    branch: { name: "Lusaka Main" }, lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
    _count: { loansCreated: 67 },
  },
  {
    id: "usr-005", employeeId: "EMP-2024-0002", firstName: "Inonge", lastName: "Nkole",
    email: "inokole@philixfinance.com", phone: "+260 97 567 8901",
    role: "MANAGER", status: "ACTIVE",
    branch: { name: "Lusaka Main" }, lastLoginAt: new Date(Date.now() - 1800000).toISOString(),
    _count: { loansCreated: 54 },
  },
  {
    id: "usr-006", employeeId: "EMP-2024-0003", firstName: "Tembo", lastName: "Sitali",
    email: "tsitali@philixfinance.com", phone: "+260 96 678 9012",
    role: "COLLECTIONS_OFFICER", status: "ACTIVE",
    branch: { name: "Lusaka Main" }, lastLoginAt: new Date(Date.now() - 14400000).toISOString(),
    _count: { loansCreated: 0 },
  },
  {
    id: "usr-007", employeeId: "EMP-2025-0001", firstName: "Mwila", lastName: "Banda",
    email: "mbanda@philixfinance.com", phone: "+260 95 789 0123",
    role: "ACCOUNTANT", status: "ACTIVE",
    branch: { name: "Lusaka Main" }, lastLoginAt: new Date(Date.now() - 28800000).toISOString(),
    _count: { loansCreated: 0 },
  },
];

export const mockWikiPages = [
  {
    id: "wiki-001", title: "Loan Application Procedure", slug: "loan-application-procedure",
    category: "Procedures", viewCount: 87, updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    author: { firstName: "Daliso", lastName: "Phiri" },
    content: `# Loan Application Procedure\n\n## Step 1: Client Registration\nVerify NRC and collect all required documents...\n\n## Step 2: Collateral Assessment\nPhysically inspect the item and complete the assessment form...\n\n## Step 3: Loan Offer\nCalculate maximum loan amount based on 75% of forced sale value...`,
  },
  {
    id: "wiki-002", title: "Collateral Assessment Guide", slug: "collateral-assessment-guide",
    category: "Guidelines", viewCount: 124, updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    author: { firstName: "Inonge", lastName: "Nkole" },
    content: `# Collateral Assessment Guide\n\nThis guide covers how to assess electronic devices...`,
  },
  {
    id: "wiki-003", title: "Collections Policy", slug: "collections-policy",
    category: "Policies", viewCount: 65, updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    author: { firstName: "Daliso", lastName: "Phiri" },
    content: `# Collections Policy\n\n## Overdue Classification\n- 1-7 days: Yellow (At Risk)\n- 8-30 days: Orange (Collections)\n- 31-90 days: Red (Default Warning)\n- 90+ days: Default`,
  },
  {
    id: "wiki-004", title: "Staff Code of Conduct", slug: "staff-code-of-conduct",
    category: "HR & Policy", viewCount: 43, updatedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    author: { firstName: "Daliso", lastName: "Phiri" },
    content: `# Staff Code of Conduct\n\nAll staff must maintain professional conduct...`,
  },
];

export const mockAuditLogs = [
  {
    id: "aud-001", action: "APPROVE", entity: "Loan", entityId: "loan-004",
    description: "Approved loan PF-2024-1004 for Namukolo Phiri — K6,500",
    ipAddress: "196.50.10.23", createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    user: { firstName: "Inonge", lastName: "Nkole", role: "MANAGER" },
  },
  {
    id: "aud-002", action: "CREATE", entity: "Client", entityId: "clt-008",
    description: "Registered new client Mwila Chileshe (CLT-2025-10001)",
    ipAddress: "196.50.10.24", createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    user: { firstName: "Lubuto", lastName: "Mwamba", role: "LOAN_OFFICER" },
  },
  {
    id: "aud-003", action: "PAYMENT", entity: "Payment", entityId: "pay-007",
    description: "Recorded payment of K2,450 on loan PF-2024-1001",
    ipAddress: "196.50.10.24", createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    user: { firstName: "Mwamba", lastName: "Kasonde", role: "LOAN_OFFICER" },
  },
  {
    id: "aud-004", action: "DISBURSE", entity: "Loan", entityId: "loan-006",
    description: "Disbursed loan PF-2024-1006 — K10,000",
    ipAddress: "196.50.10.23", createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    user: { firstName: "Inonge", lastName: "Nkole", role: "MANAGER" },
  },
  {
    id: "aud-005", action: "LOGIN", entity: "User", entityId: "usr-002",
    description: "Lubuto Mwamba logged in",
    ipAddress: "196.50.10.25", createdAt: new Date(Date.now() - 14 * 3600000).toISOString(),
    user: { firstName: "Lubuto", lastName: "Mwamba", role: "LOAN_OFFICER" },
  },
  {
    id: "aud-006", action: "RELEASE_COLLATERAL", entity: "Collateral", entityId: "col-007",
    description: "Released collateral VLT-2024-100020 (Samsung Galaxy S21) to Grace Mwale",
    ipAddress: "196.50.10.23", createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    user: { firstName: "Inonge", lastName: "Nkole", role: "MANAGER" },
  },
];

export const mockPerformance = [
  { id: "usr-002", name: "Lubuto Mwamba", role: "LOAN_OFFICER", loansIssued: 89, activeLoans: 54, defaults: 2, collectionRate: 94.2, totalCollected: 678900, totalDisbursed: 712000 },
  { id: "usr-003", name: "Mwamba Kasonde", role: "LOAN_OFFICER", loansIssued: 76, activeLoans: 48, defaults: 4, collectionRate: 91.8, totalCollected: 542100, totalDisbursed: 590000 },
  { id: "usr-004", name: "Chanda Mwila", role: "LOAN_OFFICER", loansIssued: 67, activeLoans: 42, defaults: 1, collectionRate: 88.5, totalCollected: 489700, totalDisbursed: 553000 },
  { id: "usr-005", name: "Inonge Nkole", role: "MANAGER", loansIssued: 54, activeLoans: 33, defaults: 0, collectionRate: 96.1, totalCollected: 412300, totalDisbursed: 429000 },
  { id: "usr-006", name: "Tembo Sitali", role: "LOAN_OFFICER", loansIssued: 45, activeLoans: 28, defaults: 1, collectionRate: 85.3, totalCollected: 315600, totalDisbursed: 370000 },
];

export const mockCollectionsDashboard = {
  current: 253,
  atRisk: 19,
  days30: 9,
  days60: 4,
  days90: 3,
  defaulted: 8,
  totalOverdueAmount: 284500,
  totalPenalties: 14200,
};

// ─── PHASE 3 MOCK DATA ────────────────────────────────────────────────────────

export interface LoanProductRate {
  id: string;
  durationValue: number;
  durationUnit: "weeks" | "months";
  interestRate: number;
  displayLabel: string;
  isActive: boolean;
  displayOrder: number;
}

export interface LoanProduct {
  id: string;
  slug: string;
  name: string;
  productType: string;
  targetBorrower: string;
  isActive: boolean;
  description: string;
  interestType: "flat" | "reducing";
  // Amounts
  minAmount: number;
  maxAmount: number;
  // Fees
  processingFeeType: "percentage" | "fixed";
  processingFee: number;
  // Penalties
  penaltyRate: number;
  penaltyPeriod: "per_day" | "per_week" | "per_month";
  gracePeriodDays: number;
  // Collateral & LTV
  collateralRequired: boolean;
  ltvMode: "condition_based" | "product_override";
  ltvOverrideValue: number | null;
  // Requirements
  eligibleCampuses: string[];
  requiredDocuments: string[];
  autoRenewal: boolean;
  displayOrder: number;
  // Eligibility rules (for loyalty/premium tiers)
  eligibilityRules: {
    minRepaidLoans?: number;
    maxDefaultCount?: number;
    minCollateralCondition?: string;
  } | null;
  // Rate tiers
  rates: LoanProductRate[];
  // Audit log
  auditLog: { action: string; field: string; oldValue: string; newValue: string; changedBy: string; changedAt: string; reason?: string }[];
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export const mockLtvConditionScale = [
  { condition: "excellent", label: "Excellent", maxLtvRatio: 70, description: "Like new, fully functional, no visible wear" },
  { condition: "good",      label: "Good",      maxLtvRatio: 60, description: "Lightly used, minor cosmetic wear, fully functional" },
  { condition: "fair",      label: "Fair",      maxLtvRatio: 50, description: "Visible wear, functioning with minor issues" },
  { condition: "poor",      label: "Poor",      maxLtvRatio: 40, description: "Heavy wear, significant issues, reduced functionality" },
];

export const mockLoanProducts: LoanProduct[] = [
  // ── Product 1: Student Emergency Loan ─────────────────────────────────────
  {
    id: "prod-001",
    slug: "student-emergency-loan",
    name: "Student Emergency Loan",
    productType: "STUDENT",
    targetBorrower: "Full-time students at UNZA, CBU, and UNILUS campuses",
    isActive: true,
    description: "Short-term collateral-backed emergency loans for enrolled university students. Core product representing the majority of Philix Finance's current loan book.",
    interestType: "flat",
    minAmount: 300,
    maxAmount: 10000,
    processingFeeType: "percentage",
    processingFee: 0,
    penaltyRate: 5,
    penaltyPeriod: "per_week",
    gracePeriodDays: 3,
    collateralRequired: true,
    ltvMode: "condition_based",
    ltvOverrideValue: null,
    eligibleCampuses: ["UNZA", "CBU", "UNILUS"],
    requiredDocuments: ["NRC", "Student ID"],
    autoRenewal: false,
    displayOrder: 1,
    eligibilityRules: null,
    rates: [
      { id: "r001-1", durationValue: 1, durationUnit: "weeks", interestRate: 10, displayLabel: "1 Week",  isActive: true, displayOrder: 1 },
      { id: "r001-2", durationValue: 2, durationUnit: "weeks", interestRate: 20, displayLabel: "2 Weeks", isActive: true, displayOrder: 2 },
      { id: "r001-3", durationValue: 3, durationUnit: "weeks", interestRate: 30, displayLabel: "3 Weeks", isActive: true, displayOrder: 3 },
      { id: "r001-4", durationValue: 4, durationUnit: "weeks", interestRate: 35, displayLabel: "4 Weeks", isActive: true, displayOrder: 4 },
    ],
    auditLog: [
      { action: "created", field: "product", oldValue: "", newValue: "Student Emergency Loan", changedBy: "Daliso (CEO)", changedAt: "2024-01-15T09:00:00Z" },
    ],
    createdAt: "2024-01-15",
    updatedAt: "2026-06-16",
  },
  // ── Product 2: Salary Advance Loan ────────────────────────────────────────
  {
    id: "prod-002",
    slug: "salary-advance-loan",
    name: "Salary Advance Loan",
    productType: "SALARY_ADVANCE",
    targetBorrower: "Employed individuals with verifiable monthly salary income",
    isActive: true,
    description: "Short-term advance against next salary for formally employed borrowers. Competitive rates reflect the lower-risk, income-verified profile.",
    interestType: "flat",
    minAmount: 500,
    maxAmount: 20000,
    processingFeeType: "percentage",
    processingFee: 0,
    penaltyRate: 5,
    penaltyPeriod: "per_week",
    gracePeriodDays: 3,
    collateralRequired: true,
    ltvMode: "condition_based",
    ltvOverrideValue: null,
    eligibleCampuses: [],
    requiredDocuments: ["NRC", "Payslip", "Employment Letter"],
    autoRenewal: true,
    displayOrder: 2,
    eligibilityRules: null,
    rates: [
      { id: "r002-1", durationValue: 1, durationUnit: "weeks", interestRate: 10, displayLabel: "1 Week",  isActive: true, displayOrder: 1 },
      { id: "r002-2", durationValue: 2, durationUnit: "weeks", interestRate: 20, displayLabel: "2 Weeks", isActive: true, displayOrder: 2 },
      { id: "r002-3", durationValue: 3, durationUnit: "weeks", interestRate: 30, displayLabel: "3 Weeks", isActive: true, displayOrder: 3 },
      { id: "r002-4", durationValue: 4, durationUnit: "weeks", interestRate: 35, displayLabel: "4 Weeks", isActive: true, displayOrder: 4 },
    ],
    auditLog: [
      { action: "created", field: "product", oldValue: "", newValue: "Salary Advance Loan", changedBy: "Daliso (CEO)", changedAt: "2024-01-15T09:00:00Z" },
    ],
    createdAt: "2024-01-15",
    updatedAt: "2026-06-16",
  },
  // ── Product 3: Business Working Capital Loan ───────────────────────────────
  {
    id: "prod-003",
    slug: "business-working-capital-loan",
    name: "Business Working Capital Loan",
    productType: "BUSINESS",
    targetBorrower: "Micro and small enterprise owners, market traders, self-employed individuals",
    isActive: true,
    description: "Short-term working capital loans for registered or witnessed informal businesses. Enables stock purchase and business operations.",
    interestType: "flat",
    minAmount: 1000,
    maxAmount: 50000,
    processingFeeType: "percentage",
    processingFee: 0,
    penaltyRate: 5,
    penaltyPeriod: "per_week",
    gracePeriodDays: 3,
    collateralRequired: true,
    ltvMode: "condition_based",
    ltvOverrideValue: null,
    eligibleCampuses: [],
    requiredDocuments: ["NRC", "Trade Licence or Witness Letter"],
    autoRenewal: true,
    displayOrder: 3,
    eligibilityRules: null,
    rates: [
      { id: "r003-1", durationValue: 1, durationUnit: "weeks", interestRate: 10, displayLabel: "1 Week",  isActive: true, displayOrder: 1 },
      { id: "r003-2", durationValue: 2, durationUnit: "weeks", interestRate: 20, displayLabel: "2 Weeks", isActive: true, displayOrder: 2 },
      { id: "r003-3", durationValue: 3, durationUnit: "weeks", interestRate: 30, displayLabel: "3 Weeks", isActive: true, displayOrder: 3 },
      { id: "r003-4", durationValue: 4, durationUnit: "weeks", interestRate: 35, displayLabel: "4 Weeks", isActive: true, displayOrder: 4 },
    ],
    auditLog: [
      { action: "created", field: "product", oldValue: "", newValue: "Business Working Capital Loan", changedBy: "Daliso (CEO)", changedAt: "2024-01-15T09:00:00Z" },
    ],
    createdAt: "2024-01-15",
    updatedAt: "2026-06-16",
  },
  // ── Product 4: Electronics Equity Loan ────────────────────────────────────
  {
    id: "prod-004",
    slug: "electronics-equity-loan",
    name: "Electronics Equity Loan",
    productType: "ELECTRONICS_EQUITY",
    targetBorrower: "Any individual using a smartphone, laptop, or electronics as collateral",
    isActive: true,
    description: "Loans secured against electronics. LTV is fixed at 60% of market value regardless of condition, protecting against rapid depreciation.",
    interestType: "flat",
    minAmount: 500,
    maxAmount: 100000,
    processingFeeType: "percentage",
    processingFee: 0,
    penaltyRate: 5,
    penaltyPeriod: "per_week",
    gracePeriodDays: 3,
    collateralRequired: true,
    ltvMode: "product_override",
    ltvOverrideValue: 60,
    eligibleCampuses: [],
    requiredDocuments: ["NRC", "Purchase Receipt or Proof of Ownership"],
    autoRenewal: true,
    displayOrder: 4,
    eligibilityRules: null,
    rates: [
      { id: "r004-1", durationValue: 1, durationUnit: "weeks", interestRate: 10, displayLabel: "1 Week",  isActive: true, displayOrder: 1 },
      { id: "r004-2", durationValue: 2, durationUnit: "weeks", interestRate: 20, displayLabel: "2 Weeks", isActive: true, displayOrder: 2 },
      { id: "r004-3", durationValue: 3, durationUnit: "weeks", interestRate: 30, displayLabel: "3 Weeks", isActive: true, displayOrder: 3 },
      { id: "r004-4", durationValue: 4, durationUnit: "weeks", interestRate: 35, displayLabel: "4 Weeks", isActive: true, displayOrder: 4 },
    ],
    auditLog: [
      { action: "created", field: "product", oldValue: "", newValue: "Electronics Equity Loan", changedBy: "Daliso (CEO)", changedAt: "2024-01-15T09:00:00Z" },
    ],
    createdAt: "2024-01-15",
    updatedAt: "2026-06-16",
  },
  // ── Product 5: Repeat Customer Loyalty Loan ────────────────────────────────
  {
    id: "prod-005",
    slug: "repeat-customer-loyalty-loan",
    name: "Repeat Customer Loyalty Loan",
    productType: "LOYALTY",
    targetBorrower: "Existing clients with 2+ fully repaid loans and zero defaults",
    isActive: true,
    description: "Preferential rate product for repeat customers who have demonstrated reliable repayment history. Discount applied on base product rates.",
    interestType: "flat",
    minAmount: 300,
    maxAmount: 50000,
    processingFeeType: "percentage",
    processingFee: 0,
    penaltyRate: 5,
    penaltyPeriod: "per_week",
    gracePeriodDays: 3,
    collateralRequired: true,
    ltvMode: "condition_based",
    ltvOverrideValue: null,
    eligibleCampuses: [],
    requiredDocuments: ["NRC"],
    autoRenewal: true,
    displayOrder: 5,
    eligibilityRules: { minRepaidLoans: 2, maxDefaultCount: 0 },
    rates: [
      { id: "r005-1", durationValue: 1, durationUnit: "weeks", interestRate: 8,  displayLabel: "1 Week",  isActive: true, displayOrder: 1 },
      { id: "r005-2", durationValue: 2, durationUnit: "weeks", interestRate: 16, displayLabel: "2 Weeks", isActive: true, displayOrder: 2 },
      { id: "r005-3", durationValue: 3, durationUnit: "weeks", interestRate: 24, displayLabel: "3 Weeks", isActive: true, displayOrder: 3 },
      { id: "r005-4", durationValue: 4, durationUnit: "weeks", interestRate: 30, displayLabel: "4 Weeks", isActive: true, displayOrder: 4 },
    ],
    auditLog: [
      { action: "created", field: "product", oldValue: "", newValue: "Repeat Customer Loyalty Loan", changedBy: "Daliso (CEO)", changedAt: "2024-01-15T09:00:00Z" },
    ],
    createdAt: "2024-01-15",
    updatedAt: "2026-06-16",
  },
  // ── Product 6: Premium Client Loan ────────────────────────────────────────
  {
    id: "prod-006",
    slug: "premium-client-loan",
    name: "Premium Client Loan",
    productType: "PREMIUM",
    targetBorrower: "Elite clients with 5+ repaid loans, zero defaults, and good/excellent collateral condition",
    isActive: true,
    description: "Best-in-portfolio rates for Philix Finance's most trusted clients. Requires 5+ successful loans, zero defaults, and good or excellent collateral.",
    interestType: "flat",
    minAmount: 300,
    maxAmount: 50000,
    processingFeeType: "percentage",
    processingFee: 0,
    penaltyRate: 5,
    penaltyPeriod: "per_week",
    gracePeriodDays: 3,
    collateralRequired: true,
    ltvMode: "condition_based",
    ltvOverrideValue: null,
    eligibleCampuses: [],
    requiredDocuments: ["NRC"],
    autoRenewal: true,
    displayOrder: 6,
    eligibilityRules: { minRepaidLoans: 5, maxDefaultCount: 0, minCollateralCondition: "good" },
    rates: [
      { id: "r006-1", durationValue: 1, durationUnit: "weeks", interestRate: 7,  displayLabel: "1 Week",  isActive: true, displayOrder: 1 },
      { id: "r006-2", durationValue: 2, durationUnit: "weeks", interestRate: 14, displayLabel: "2 Weeks", isActive: true, displayOrder: 2 },
      { id: "r006-3", durationValue: 3, durationUnit: "weeks", interestRate: 21, displayLabel: "3 Weeks", isActive: true, displayOrder: 3 },
      { id: "r006-4", durationValue: 4, durationUnit: "weeks", interestRate: 28, displayLabel: "4 Weeks", isActive: true, displayOrder: 4 },
    ],
    auditLog: [
      { action: "created", field: "product", oldValue: "", newValue: "Premium Client Loan", changedBy: "Daliso (CEO)", changedAt: "2024-01-15T09:00:00Z" },
    ],
    createdAt: "2024-01-15",
    updatedAt: "2026-06-16",
  },
];

export const mockChartOfAccounts = [
  // ASSETS
  { id: "acc-001", code: "1000", name: "Cash in Hand", type: "ASSET", subType: "CURRENT_ASSET", balance: 245000, parentId: null },
  { id: "acc-002", code: "1100", name: "Bank — Zanaco Main", type: "ASSET", subType: "CURRENT_ASSET", balance: 812000, parentId: null },
  { id: "acc-003", code: "1200", name: "Loan Portfolio", type: "ASSET", subType: "CURRENT_ASSET", balance: 1847500, parentId: null },
  { id: "acc-004", code: "1300", name: "Interest Receivable", type: "ASSET", subType: "CURRENT_ASSET", balance: 124300, parentId: null },
  { id: "acc-005", code: "1400", name: "Bad Debt Provision", type: "ASSET", subType: "CURRENT_ASSET", balance: -87400, parentId: null },
  { id: "acc-006", code: "1500", name: "Office Equipment", type: "ASSET", subType: "FIXED_ASSET", balance: 145000, parentId: null },
  // LIABILITIES
  { id: "acc-007", code: "2000", name: "Investor Capital — Richard Banda", type: "LIABILITY", subType: "INVESTOR_FUNDS", balance: 512500, parentId: null },
  { id: "acc-008", code: "2001", name: "Investor Capital — Josephine Mwansa", type: "LIABILITY", subType: "INVESTOR_FUNDS", balance: 307800, parentId: null },
  { id: "acc-009", code: "2002", name: "Investor Capital — Patrick Chisanga", type: "LIABILITY", subType: "INVESTOR_FUNDS", balance: 781250, parentId: null },
  { id: "acc-010", code: "2003", name: "Investor Capital — Fatima Daka", type: "LIABILITY", subType: "INVESTOR_FUNDS", balance: 203500, parentId: null },
  { id: "acc-011", code: "2100", name: "Accrued Interest Payable", type: "LIABILITY", subType: "CURRENT_LIABILITY", balance: 42300, parentId: null },
  // EQUITY
  { id: "acc-012", code: "3000", name: "Owner's Capital", type: "EQUITY", subType: null, balance: 400000, parentId: null },
  { id: "acc-013", code: "3100", name: "Retained Earnings", type: "EQUITY", subType: null, balance: 736050, parentId: null },
  // REVENUE
  { id: "acc-014", code: "4000", name: "Interest Income", type: "REVENUE", subType: null, balance: 487200, parentId: null },
  { id: "acc-015", code: "4100", name: "Processing Fee Income", type: "REVENUE", subType: null, balance: 38400, parentId: null },
  { id: "acc-016", code: "4200", name: "Penalty Income", type: "REVENUE", subType: null, balance: 14200, parentId: null },
  // EXPENSES
  { id: "acc-017", code: "5000", name: "Staff Salaries", type: "EXPENSE", subType: null, balance: 288000, parentId: null },
  { id: "acc-018", code: "5100", name: "Office Rent", type: "EXPENSE", subType: null, balance: 51000, parentId: null },
  { id: "acc-019", code: "5200", name: "Utilities & Internet", type: "EXPENSE", subType: null, balance: 8700, parentId: null },
  { id: "acc-020", code: "5300", name: "Transport & Fuel", type: "EXPENSE", subType: null, balance: 14400, parentId: null },
  { id: "acc-021", code: "5400", name: "Marketing & Advertising", type: "EXPENSE", subType: null, balance: 5100, parentId: null },
  { id: "acc-022", code: "5500", name: "Investor Interest Expense", type: "EXPENSE", subType: null, balance: 142800, parentId: null },
  { id: "acc-023", code: "5600", name: "Bad Debt Expense", type: "EXPENSE", subType: null, balance: 87400, parentId: null },
];

export const mockJournalEntries = [
  {
    id: "je-001", reference: "JE-2025-0001", date: new Date(Date.now() - 2 * 86400000).toISOString(),
    description: "Loan disbursement — CLT-2024-10023 — K8,000 student loan",
    totalAmount: 8000, status: "POSTED",
    lines: [
      { debitAccount: "Loan Portfolio", creditAccount: "Cash in Hand", amount: 8000 },
    ],
  },
  {
    id: "je-002", reference: "JE-2025-0002", date: new Date(Date.now() - 3 * 86400000).toISOString(),
    description: "Interest income recognition — June 2025",
    totalAmount: 42600, status: "POSTED",
    lines: [
      { debitAccount: "Interest Receivable", creditAccount: "Interest Income", amount: 42600 },
    ],
  },
  {
    id: "je-003", reference: "JE-2025-0003", date: new Date(Date.now() - 5 * 86400000).toISOString(),
    description: "Payroll — June 2025 salaries",
    totalAmount: 48000, status: "POSTED",
    lines: [
      { debitAccount: "Staff Salaries", creditAccount: "Bank — Zanaco Main", amount: 48000 },
    ],
  },
  {
    id: "je-004", reference: "JE-2025-0004", date: new Date(Date.now() - 1 * 86400000).toISOString(),
    description: "Investor interest payment — Richard Banda",
    totalAmount: 7500, status: "POSTED",
    lines: [
      { debitAccount: "Investor Interest Expense", creditAccount: "Bank — Zanaco Main", amount: 7500 },
    ],
  },
  {
    id: "je-005", reference: "JE-2025-0005", date: new Date().toISOString(),
    description: "Payment collection — PF-2024-1001 — K2,450",
    totalAmount: 2450, status: "POSTED",
    lines: [
      { debitAccount: "Cash in Hand", creditAccount: "Loan Portfolio", amount: 2000 },
      { debitAccount: "Cash in Hand", creditAccount: "Interest Income", amount: 450 },
    ],
  },
];

export const mockCashbook = [
  { id: "cb-001", date: new Date().toISOString(), type: "RECEIPT", category: "LOAN_REPAYMENT", description: "Mwansa Tembo — PHX-L-0001 installment", amount: 2450, balance: 245000, reference: "RCP-001" },
  { id: "cb-002", date: new Date().toISOString(), type: "RECEIPT", category: "LOAN_REPAYMENT", description: "Grace Mwale — PHX-L-0002 installment", amount: 1800, balance: 243200, reference: "RCP-002" },
  { id: "cb-003", date: new Date(Date.now() - 86400000).toISOString(), type: "PAYMENT", category: "SALARY", description: "June salary advance — Lubuto Mwamba", amount: 5000, balance: 241400, reference: "PMT-001" },
  { id: "cb-004", date: new Date(Date.now() - 86400000).toISOString(), type: "PAYMENT", category: "FUEL", description: "Fuel — client visits batch", amount: 420, balance: 246400, reference: "PMT-002" },
  { id: "cb-005", date: new Date(Date.now() - 86400000).toISOString(), type: "RECEIPT", category: "LOAN_REPAYMENT", description: "Bwalya Mutale — penalty payment", amount: 750, balance: 246820, reference: "RCP-003" },
  { id: "cb-006", date: new Date(Date.now() - 2 * 86400000).toISOString(), type: "PAYMENT", category: "LOAN_DISBURSEMENT", description: "Disbursement — PHX-L-0006 (K3,000)", amount: 3000, balance: 246070, reference: "DISB-006" },
  { id: "cb-007", date: new Date(Date.now() - 2 * 86400000).toISOString(), type: "RECEIPT", category: "PROCESSING_FEE", description: "Processing fees collected — 3 loans", amount: 320, balance: 249070, reference: "RCP-004" },
  { id: "cb-008", date: new Date(Date.now() - 3 * 86400000).toISOString(), type: "PAYMENT", category: "RENT", description: "Office rent — June 2025", amount: 8500, balance: 248750, reference: "PMT-003" },
];

export const mockBankReconciliation = [
  {
    id: "br-001", bankName: "Zanaco Bank", accountNumber: "7890-1234-5678",
    statementDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    statementBalance: 810500, bookBalance: 812000, difference: -1500,
    status: "DRAFT", notes: "K1,500 difference under investigation — likely 2 uncleared cheques",
  },
];

export const mockLoanRestructures = [
  {
    id: "rst-001", type: "ROLLOVER",
    loan: { loanNumber: "PHX-L-0003", client: { firstName: "Bwalya", lastName: "Mutale" } },
    oldPrincipal: 5000, newPrincipal: 5800, oldRate: 20, newRate: 22,
    oldMaturity: new Date(Date.now() - 30 * 86400000).toISOString(),
    newMaturity: new Date(Date.now() + 60 * 86400000).toISOString(),
    additionalFee: 116, reason: "Client requested 2-month extension due to medical emergency",
    approvedAt: new Date(Date.now() - 28 * 86400000).toISOString(),
  },
  {
    id: "rst-002", type: "RESTRUCTURE",
    loan: { loanNumber: "PHX-L-0005", client: { firstName: "Emmanuel", lastName: "Zulu" } },
    oldPrincipal: 3500, newPrincipal: 3200, oldRate: 28, newRate: 24,
    oldMaturity: new Date(Date.now() - 60 * 86400000).toISOString(),
    newMaturity: new Date(Date.now() + 90 * 86400000).toISOString(),
    additionalFee: 64, reason: "Debt restructuring to avoid default — reduced rate as incentive",
    approvedAt: new Date(Date.now() - 47 * 86400000).toISOString(),
  },
];

export const mockWriteOffs = [
  {
    id: "wo-001", amount: 5200,
    loan: { loanNumber: "PHX-L-0003", client: { firstName: "Miriam", lastName: "Sichone" } },
    reason: "Client deceased. No collateral proceeds were sufficient to cover balance. Balance of K5,200 written off after K2,100 auction recovery.",
    approvedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    approvedBy: { firstName: "Daliso", lastName: "Phiri" },
  },
];

export const mockProvisionings = [
  {
    id: "prov-001",
    periodDate: new Date("2025-06-01").toISOString(),
    par30Amount: 134600, par60Amount: 87400, par90Amount: 52300, defaultAmount: 48100,
    rate30: 0.25, rate60: 0.50, rate90: 0.75, rateDefault: 1.0,
    provision30: 33650, provision60: 43700, provision90: 39225, provisionDefault: 48100,
    totalProvision: 164675,
  },
];

export const mockPenalties = [
  { id: "pen-001", loan: { loanNumber: "PHX-L-0005", client: { firstName: "Emmanuel", lastName: "Zulu" } }, amount: 8575, daysLate: 47, waived: false, createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: "pen-002", loan: { loanNumber: "PHX-L-0007", client: { firstName: "Bwalya", lastName: "Mutale" } }, amount: 2400, daysLate: 18, waived: true, waivedReason: "First-time offender — waived as goodwill", createdAt: new Date(Date.now() - 20 * 86400000).toISOString() },
  { id: "pen-003", loan: { loanNumber: "PHX-L-0003", client: { firstName: "Miriam", lastName: "Sichone" } }, amount: 15600, daysLate: 180, waived: false, createdAt: new Date(Date.now() - 180 * 86400000).toISOString() },
];

export const mockAuctions = [
  {
    id: "auc-001", status: "SOLD",
    collateral: { vaultId: "PHX-V-0005", brand: "Dell", model: "XPS 15 9530" },
    loan: { loanNumber: "PHX-L-0003" },
    reservePrice: 6000, listingDate: new Date(Date.now() - 30 * 86400000).toISOString(),
    auctionDate: new Date(Date.now() - 10 * 86400000).toISOString(),
    soldPrice: 6800, buyerName: "Tech Zone Lusaka", buyerContact: "+260 97 555 1234",
    notes: "Sold above reserve price.",
  },
  {
    id: "auc-002", status: "LISTED",
    collateral: { vaultId: "PHX-V-0008", brand: "Apple", model: "iPhone 13 Pro" },
    loan: { loanNumber: "PHX-L-0008" },
    reservePrice: 5500, listingDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    auctionDate: new Date(Date.now() + 10 * 86400000).toISOString(),
    soldPrice: null, buyerName: null, buyerContact: null,
    notes: "Awaiting auction date. 3 interested buyers contacted.",
  },
];

export const mockOnlineApplications = [
  {
    id: "app-001", applicationRef: "APP-2025-0001", status: "UNDER_REVIEW",
    firstName: "Chanda", lastName: "Tembo", email: "chanda.t@gmail.com",
    phone: "+260 97 111 2233", nrcNumber: "123456/10/1", clientType: "STUDENT",
    loanAmount: 3000, loanPurpose: "Tuition fees for semester 2",
    collateralType: "SMARTPHONE", collateralBrand: "Samsung", collateralModel: "Galaxy S23",
    submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    photos: [
      { photoType: "FRONT", url: null }, { photoType: "BACK", url: null },
      { photoType: "SERIAL", url: null },
    ],
  },
  {
    id: "app-002", applicationRef: "APP-2025-0002", status: "SUBMITTED",
    firstName: "Moses", lastName: "Phiri", email: "m.phiri@outlook.com",
    phone: "+260 96 444 5566", nrcNumber: "234567/11/2", clientType: "MARKET_TRADER",
    loanAmount: 5000, loanPurpose: "Stock purchase for Soweto Market stall",
    collateralType: "LAPTOP", collateralBrand: "Lenovo", collateralModel: "IdeaPad 5",
    submittedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    photos: [],
  },
  {
    id: "app-003", applicationRef: "APP-2025-0003", status: "INFO_REQUIRED",
    firstName: "Nkole", lastName: "Banda", email: "nkole.b@email.com",
    phone: "+260 95 777 8899", nrcNumber: "345678/12/3", clientType: "CIVIL_SERVANT",
    loanAmount: 8000, loanPurpose: "Home renovation",
    collateralType: "TABLET", collateralBrand: "Apple", collateralModel: "iPad Pro",
    submittedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    photos: [],
    reviewNotes: "Missing NRC back photo and proof of employment. Please resubmit.",
  },
  {
    id: "app-004", applicationRef: "APP-2025-0004", status: "APPROVED",
    firstName: "Mutale", lastName: "Zulu", email: null,
    phone: "+260 97 222 3344", nrcNumber: "456789/13/4", clientType: "STUDENT",
    loanAmount: 2500, loanPurpose: "Books and accommodation deposit",
    collateralType: "SMARTPHONE", collateralBrand: "iPhone", collateralModel: "iPhone 14",
    submittedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    reviewedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    photos: [],
  },
];

export const mockKYCRecords = [
  { id: "kyc-001", client: { firstName: "Mwansa", lastName: "Tembo", nrcNumber: "123456/78/1" }, nrcVerified: true, phoneVerified: true, addressVerified: true, employmentVerified: false, photoIdVerified: true, riskScore: 22, status: "IN_REVIEW", submittedAt: new Date(Date.now() - 31 * 86400000).toISOString(), verifiedAt: null, expiresAt: new Date(Date.now() + 335 * 86400000).toISOString(), reviewedBy: { firstName: "Inonge", lastName: "Nkole" }, notes: "Employment verification pending — needs payslip" },
  { id: "kyc-002", client: { firstName: "Grace", lastName: "Mwale", nrcNumber: "234567/89/2" }, nrcVerified: true, phoneVerified: true, addressVerified: true, employmentVerified: true, photoIdVerified: true, riskScore: 18, status: "VERIFIED", submittedAt: new Date(Date.now() - 25 * 86400000).toISOString(), verifiedAt: new Date(Date.now() - 20 * 86400000).toISOString(), expiresAt: new Date(Date.now() + 345 * 86400000).toISOString(), reviewedBy: { firstName: "Inonge", lastName: "Nkole" }, notes: null },
  { id: "kyc-003", client: { firstName: "Bwalya", lastName: "Mutale", nrcNumber: "345678/90/3" }, nrcVerified: true, phoneVerified: true, addressVerified: false, employmentVerified: false, photoIdVerified: false, riskScore: 58, status: "PENDING", submittedAt: new Date(Date.now() - 5 * 86400000).toISOString(), verifiedAt: null, expiresAt: null, reviewedBy: null, notes: null },
  { id: "kyc-004", client: { firstName: "Namukolo", lastName: "Phiri", nrcNumber: "456789/01/4" }, nrcVerified: true, phoneVerified: true, addressVerified: true, employmentVerified: true, photoIdVerified: true, riskScore: 12, status: "VERIFIED", submittedAt: new Date(Date.now() - 15 * 86400000).toISOString(), verifiedAt: new Date(Date.now() - 10 * 86400000).toISOString(), expiresAt: new Date(Date.now() + 355 * 86400000).toISOString(), reviewedBy: { firstName: "Daliso", lastName: "Phiri" }, notes: null },
];

export const mockClientTimeline = [
  { id: "evt-001", clientId: "clt-001", type: "LOAN_APPLIED", description: "Applied for K8,000 student loan. Collateral: MacBook Air M2 (PHX-V-0001).", amount: 8000, occurredAt: new Date(Date.now() - 60 * 86400000).toISOString(), performedBy: { firstName: "Patricia", lastName: "Mwanza" } },
  { id: "evt-002", clientId: "clt-001", type: "KYC_VERIFIED", description: "Identity verified. NRC, face match, and address confirmed.", amount: null, occurredAt: new Date(Date.now() - 59 * 86400000).toISOString(), performedBy: { firstName: "Inonge", lastName: "Nkole" } },
  { id: "evt-003", clientId: "clt-001", type: "LOAN_APPROVED", description: "Loan PHX-L-0001 approved by Manager. K8,000 approved.", amount: 8000, occurredAt: new Date(Date.now() - 58 * 86400000).toISOString(), performedBy: { firstName: "Chileshe", lastName: "Mutale" } },
  { id: "evt-004", clientId: "clt-001", type: "LOAN_DISBURSED", description: "K8,000 disbursed via cash. Receipt issued.", amount: 8000, occurredAt: new Date(Date.now() - 57 * 86400000).toISOString(), performedBy: { firstName: "Patricia", lastName: "Mwanza" } },
  { id: "evt-005", clientId: "clt-001", type: "PAYMENT_RECEIVED", description: "Installment 1 of 12 received. K826.67 paid via cash.", amount: 826.67, occurredAt: new Date(Date.now() - 45 * 86400000).toISOString(), performedBy: { firstName: "Patricia", lastName: "Mwanza" } },
  { id: "evt-006", clientId: "clt-001", type: "PAYMENT_RECEIVED", description: "Installment 2 of 12 received. K826.67 paid via mobile money.", amount: 826.67, occurredAt: new Date(Date.now() - 30 * 86400000).toISOString(), performedBy: { firstName: "Patricia", lastName: "Mwanza" } },
  { id: "evt-007", clientId: "clt-001", type: "COLLECTION_CALL", description: "Client confirmed payment due this Friday. Very cooperative.", amount: null, occurredAt: new Date(Date.now() - 15 * 86400000).toISOString(), performedBy: { firstName: "Inonge", lastName: "Nkole" } },
  { id: "evt-008", clientId: "clt-001", type: "PAYMENT_RECEIVED", description: "Installment 3 of 12. K826.67 paid on time.", amount: 826.67, occurredAt: new Date(Date.now() - 14 * 86400000).toISOString(), performedBy: { firstName: "Patricia", lastName: "Mwanza" } },
  { id: "evt-009", clientId: "clt-002", type: "LOAN_APPLIED", description: "Applied for K5,000 business loan.", amount: 5000, occurredAt: new Date(Date.now() - 25 * 86400000).toISOString(), performedBy: { firstName: "Lubuto", lastName: "Mwamba" } },
  { id: "evt-010", clientId: "clt-002", type: "LOAN_APPROVED", description: "Loan PHX-L-0002 approved.", amount: 5000, occurredAt: new Date(Date.now() - 24 * 86400000).toISOString(), performedBy: { firstName: "Chileshe", lastName: "Mutale" } },
  { id: "evt-011", clientId: "clt-002", type: "COLLATERAL_SUBMITTED", description: "iPhone 14 Pro submitted as collateral. PHX-V-0002.", amount: null, occurredAt: new Date(Date.now() - 25 * 86400000).toISOString(), performedBy: { firstName: "Lubuto", lastName: "Mwamba" } },
];

export const mockDocumentExpiry = [
  { id: "de-001", client: { firstName: "Mwansa", lastName: "Tembo", clientRef: "PHX-C-0001" }, documentType: "NRC / National ID", documentNumber: "123456/78/1", expiresAt: new Date(Date.now() + 28 * 86400000).toISOString(), issuedAt: new Date(Date.now() - 337 * 86400000).toISOString(), loan: { loanNumber: "PHX-L-0001" } },
  { id: "de-002", client: { firstName: "Grace", lastName: "Mwale", clientRef: "PHX-C-0002" }, documentType: "Student ID Card", documentNumber: "UNZA-2023-4521", expiresAt: new Date(Date.now() + 180 * 86400000).toISOString(), issuedAt: new Date(Date.now() - 185 * 86400000).toISOString(), loan: { loanNumber: "PHX-L-0002" } },
  { id: "de-003", client: { firstName: "Bwalya", lastName: "Mutale", clientRef: "PHX-C-0003" }, documentType: "NRC / National ID", documentNumber: "345678/90/3", expiresAt: new Date(Date.now() - 15 * 86400000).toISOString(), issuedAt: new Date(Date.now() - 745 * 86400000).toISOString(), loan: { loanNumber: "PHX-L-0003" } },
  { id: "de-004", client: { firstName: "Namukolo", lastName: "Phiri", clientRef: "PHX-C-0004" }, documentType: "Employment Letter", documentNumber: "HR-2025-0441", expiresAt: new Date(Date.now() + 60 * 86400000).toISOString(), issuedAt: new Date(Date.now() - 120 * 86400000).toISOString(), loan: null },
  { id: "de-005", client: { firstName: "Chanda", lastName: "Ng'ona", clientRef: "PHX-C-0005" }, documentType: "Business License", documentNumber: "ZRA-BL-88234", expiresAt: new Date(Date.now() + 6 * 86400000).toISOString(), issuedAt: new Date(Date.now() - 359 * 86400000).toISOString(), loan: { loanNumber: "PHX-L-0007" } },
];

export const mockPromises = [
  { id: "ptp-001", loan: { loanNumber: "PHX-L-0005" }, client: { firstName: "Emmanuel", lastName: "Zulu" }, amount: 1000, promisedDate: new Date(Date.now() + 3 * 86400000).toISOString(), fulfilled: false, broken: false, notes: "Client promised K1,000 by Friday from market sales" },
  { id: "ptp-002", loan: { loanNumber: "PHX-L-0007" }, client: { firstName: "Bwalya", lastName: "Mutale" }, amount: 5000, promisedDate: new Date(Date.now() - 5 * 86400000).toISOString(), fulfilled: false, broken: true, notes: "Client did not honour promise. Follow-up required." },
];

export const mockBudgets = [
  { id: "bud-001", month: 6, year: 2025, category: "SALARY", budgeted: 48000, actual: 48000, variance: 0 },
  { id: "bud-002", month: 6, year: 2025, category: "RENT", budgeted: 8500, actual: 8500, variance: 0 },
  { id: "bud-003", month: 6, year: 2025, category: "UTILITIES", budgeted: 1500, actual: 1200, variance: 300 },
  { id: "bud-004", month: 6, year: 2025, category: "FUEL", budgeted: 2000, actual: 2400, variance: -400 },
  { id: "bud-005", month: 6, year: 2025, category: "MARKETING", budgeted: 1500, actual: 850, variance: 650 },
  { id: "bud-006", month: 6, year: 2025, category: "STATIONERY", budgeted: 500, actual: 300, variance: 200 },
  { id: "bud-007", month: 6, year: 2025, category: "AIRTIME", budgeted: 400, actual: 300, variance: 100 },
  { id: "bud-008", month: 6, year: 2025, category: "OTHER", budgeted: 2000, actual: 3500, variance: -1500 },
];

export const mockForecasts = [
  { id: "fc-001", month: "Jul 2025", projectedCollections: 545000, projectedDisbursements: 480000, actualCollections: 522000, actualDisbursements: 495000 },
  { id: "fc-002", month: "Aug 2025", projectedCollections: 578000, projectedDisbursements: 510000, actualCollections: 561000, actualDisbursements: 508000 },
  { id: "fc-003", month: "Sep 2025", projectedCollections: 612000, projectedDisbursements: 540000, actualCollections: null, actualDisbursements: null },
  { id: "fc-004", month: "Oct 2025", projectedCollections: 645000, projectedDisbursements: 570000, actualCollections: null, actualDisbursements: null },
  { id: "fc-005", month: "Nov 2025", projectedCollections: 680000, projectedDisbursements: 600000, actualCollections: null, actualDisbursements: null },
  { id: "fc-006", month: "Dec 2025", projectedCollections: 720000, projectedDisbursements: 630000, actualCollections: null, actualDisbursements: null },
];

export const mockAssets = [
  { id: "ast-001", assetNumber: "AST-001", name: "Office Desk Set (5 units)", category: "FURNITURE", purchasedAt: "2023-01-15T00:00:00Z", purchasePrice: 25000, currentValue: 20000, condition: "GOOD", location: "Lusaka Main Office", notes: null },
  { id: "ast-002", assetNumber: "AST-002", name: "Dell Laptop — CEO", category: "ELECTRONICS", purchasedAt: "2023-03-10T00:00:00Z", purchasePrice: 18000, currentValue: 13500, condition: "GOOD", location: "CEO Office", notes: null },
  { id: "ast-003", assetNumber: "AST-003", name: "HP LaserJet Printer", category: "EQUIPMENT", purchasedAt: "2023-03-10T00:00:00Z", purchasePrice: 8500, currentValue: 6000, condition: "FAIR", location: "Main Office", notes: "Needs toner cartridge replacement" },
  { id: "ast-004", assetNumber: "AST-004", name: "Electronic Vault / Safe", category: "EQUIPMENT", purchasedAt: "2023-05-01T00:00:00Z", purchasePrice: 35000, currentValue: 32000, condition: "GOOD", location: "Collateral Vault Room", notes: null },
  { id: "ast-005", assetNumber: "AST-005", name: "Toyota Hilux — Collections", category: "VEHICLE", purchasedAt: "2022-08-20T00:00:00Z", purchasePrice: 285000, currentValue: 230000, condition: "GOOD", location: "Company Garage", notes: "Next service due at 80,000km" },
  { id: "ast-006", assetNumber: "AST-006", name: "Air Conditioner Units (3)", category: "EQUIPMENT", purchasedAt: "2023-06-15T00:00:00Z", purchasePrice: 18000, currentValue: 14400, condition: "GOOD", location: "Main Office", notes: null },
];

export const mockLeaveRequests = [
  { id: "lv-001", staff: { firstName: "Lubuto", lastName: "Mwamba", role: "LOAN_OFFICER" }, leaveType: "ANNUAL", startDate: new Date(Date.now() + 14 * 86400000).toISOString(), endDate: new Date(Date.now() + 21 * 86400000).toISOString(), daysRequested: 5, reason: "Family vacation", status: "APPROVED" },
  { id: "lv-002", staff: { firstName: "Chanda", lastName: "Mwila", role: "ACCOUNTANT" }, leaveType: "SICK", startDate: new Date(Date.now() - 2 * 86400000).toISOString(), endDate: new Date(Date.now() + 1 * 86400000).toISOString(), daysRequested: 3, reason: "Medical treatment — hospital admission", status: "APPROVED" },
  { id: "lv-003", staff: { firstName: "Tembo", lastName: "Sitali", role: "COLLECTIONS_OFFICER" }, leaveType: "ANNUAL", startDate: new Date(Date.now() + 30 * 86400000).toISOString(), endDate: new Date(Date.now() + 35 * 86400000).toISOString(), daysRequested: 5, reason: "Personal reasons", status: "PENDING" },
  { id: "lv-004", staff: { firstName: "Mwila", lastName: "Banda", role: "LOAN_OFFICER" }, leaveType: "MATERNITY", startDate: new Date(Date.now() + 60 * 86400000).toISOString(), endDate: new Date(Date.now() + 144 * 86400000).toISOString(), daysRequested: 84, reason: "Maternity leave — baby due August 2025", status: "PENDING" },
];

export const mockMeetings = [
  {
    id: "mtg-001", title: "June 2025 Management Review", meetingType: "MANAGEMENT",
    meetingDate: new Date(Date.now() - 7 * 86400000).toISOString(),
    venue: "Boardroom — Lusaka Main",
    attendees: ["Daliso Phiri", "Inonge Nkole", "Lubuto Mwamba", "Mwila Banda"],
    chairperson: { firstName: "Daliso", lastName: "Phiri" },
    agenda: "1. Portfolio performance review\n2. Collections update\n3. Investor update\n4. New loan product rates discussion\n5. Staff welfare",
    minutes: "The meeting opened at 09:00hrs. Portfolio performance was discussed. The team noted a 3.2% improvement in PAR 30 compared to last month. Collections team exceeded target by 8%. Investor payouts confirmed for end of month. New rates for Student Loan product were approved: 10%/20%/30%/35% per week. Meeting closed 10:45hrs.",
    actionItems: ["Prepare investor statements — Mwila Banda by 30 Jun", "Update loan product rates in system — Daliso Phiri by 20 Jun"],
  },
  {
    id: "mtg-002", title: "Collections Strategy Session", meetingType: "STAFF",
    meetingDate: new Date(Date.now() - 3 * 86400000).toISOString(),
    venue: "Lusaka Main — Conference Room",
    attendees: ["Inonge Nkole", "Tembo Sitali", "Lubuto Mwamba"],
    chairperson: { firstName: "Inonge", lastName: "Nkole" },
    agenda: "1. PAR 60+ accounts review\n2. Visit schedule\n3. Legal action cases",
    minutes: "Focus on 4 PAR 60+ cases. Physical visit schedule agreed. Legal letters to be sent to 2 non-responsive clients this week.",
    actionItems: ["Visit Emmanuel Zulu at Soweto Market — Tembo Sitali by 18 Jun", "Send demand letters to 2 defaulters — Inonge Nkole by 20 Jun"],
  },
];

export const mockCompliance = [
  { id: "comp-001", requirementName: "Microfinance Operating License (BoZ Tier 2)", category: "LICENSING", dueDate: new Date("2025-12-31").toISOString(), status: "COMPLIANT", notes: "Annual renewal of BoZ Tier 2 microfinance license — submitted and approved", reviewedAt: new Date(Date.now() - 90 * 86400000).toISOString(), responsiblePerson: { firstName: "Daliso", lastName: "Phiri" } },
  { id: "comp-002", requirementName: "ZRA Tax Returns — Q2 2025", category: "REGULATORY", dueDate: new Date(Date.now() + 30 * 86400000).toISOString(), status: "UNDER_REVIEW", notes: "Quarterly corporate tax return due end of July 2025. Accountant preparing.", reviewedAt: null, responsiblePerson: { firstName: "Chanda", lastName: "Mwila" } },
  { id: "comp-003", requirementName: "BoZ Quarterly MFI Portfolio Report", category: "REGULATORY", dueDate: new Date(Date.now() + 20 * 86400000).toISOString(), status: "PENDING", notes: "Submit microfinance portfolio statistics to Bank of Zambia", reviewedAt: null, responsiblePerson: { firstName: "Daliso", lastName: "Phiri" } },
  { id: "comp-004", requirementName: "Annual External Audit 2024", category: "INTERNAL_POLICY", dueDate: new Date(Date.now() - 30 * 86400000).toISOString(), status: "COMPLIANT", notes: "Annual financial audit completed and signed off by Deloitte Zambia", reviewedAt: new Date(Date.now() - 30 * 86400000).toISOString(), responsiblePerson: { firstName: "Daliso", lastName: "Phiri" } },
];

export const mockProcurement = [
  { id: "prc-001", itemName: "Office chairs (5 units)", category: "FURNITURE", estimatedCost: 15000, vendorName: "Zambia Office Supplies Ltd", priority: "MEDIUM", justification: "Current chairs are worn out and causing ergonomic complaints", status: "APPROVED", requestedBy: { firstName: "Daliso", lastName: "Phiri" }, requestedAt: new Date(Date.now() - 10 * 86400000).toISOString(), neededBy: new Date(Date.now() + 14 * 86400000).toISOString() },
  { id: "prc-002", itemName: "Vault security upgrade — CCTV installation", category: "EQUIPMENT", estimatedCost: 22000, vendorName: "SecureZam Technologies", priority: "HIGH", justification: "Compliance requirement from BoZ for enhanced vault security", status: "PENDING_APPROVAL", requestedBy: { firstName: "Inonge", lastName: "Nkole" }, requestedAt: new Date(Date.now() - 3 * 86400000).toISOString(), neededBy: new Date(Date.now() + 30 * 86400000).toISOString() },
  { id: "prc-003", itemName: "Branded stationery & client forms (Q3 2025)", category: "OFFICE_SUPPLIES", estimatedCost: 3500, vendorName: "Printmaster Zambia", priority: "LOW", justification: "Quarterly restock of loan application forms and receipts", status: "ORDERED", requestedBy: { firstName: "Chanda", lastName: "Mwila" }, requestedAt: new Date(Date.now() - 5 * 86400000).toISOString(), neededBy: new Date(Date.now() + 7 * 86400000).toISOString() },
];

export const mockEmailLogs = [
  { id: "em-001", recipientEmail: "mwansa.tembo@email.com", recipientName: "Mwansa Tembo", subject: "Payment Reminder — PHX-L-0001", trigger: "PAYMENT_REMINDER", status: "SENT", sentAt: new Date(Date.now() - 1 * 86400000).toISOString(), errorMessage: null },
  { id: "em-002", recipientEmail: "grace.mwale@email.com", recipientName: "Grace Mwale", subject: "Loan Approved — PHX-L-0002", trigger: "LOAN_APPROVED", status: "SENT", sentAt: new Date(Date.now() - 3 * 86400000).toISOString(), errorMessage: null },
  { id: "em-003", recipientEmail: "old-email@invalid.com", recipientName: "Bwalya Mutale", subject: "Overdue Notice — PHX-L-0003", trigger: "PAYMENT_OVERDUE", status: "FAILED", sentAt: null, errorMessage: "Mailbox does not exist: 550 5.1.1 SMTP error" },
  { id: "em-004", recipientEmail: "rbanda@email.com", recipientName: "Richard Banda", subject: "Monthly Investor Statement — June 2025", trigger: "LOAN_APPROVED", status: "SENT", sentAt: new Date(Date.now() - 2 * 86400000).toISOString(), errorMessage: null },
  { id: "em-005", recipientEmail: "p.chisanga@email.com", recipientName: "Patrick Chisanga", subject: "Monthly Investor Statement — June 2025", trigger: "LOAN_APPROVED", status: "SENT", sentAt: new Date(Date.now() - 2 * 86400000).toISOString(), errorMessage: null },
  { id: "em-006", recipientEmail: "chanda.t@gmail.com", recipientName: "Chanda Tembo", subject: "Application Received — APP-2025-0001", trigger: "LOAN_DISBURSED", status: "SENT", sentAt: new Date(Date.now() - 2 * 86400000).toISOString(), errorMessage: null },
];

export const mockBranchProfitability = [
  {
    branch: "Lusaka Main", month: "Jun 2025",
    totalDisbursed: 521000, totalCollected: 489000, interestIncome: 96400, processingFees: 10420,
    penaltyIncome: 4200, totalRevenue: 111020,
    salaries: 48000, rent: 8500, utilities: 1950, transport: 2400, marketing: 850,
    investorInterest: 27300, provisions: 12000, other: 3500, totalExpenses: 104500,
    netProfit: 6520, profitMargin: 5.9, loanCount: 58,
  },
];

export const mockPortfolioProfitability = [
  { id: "pp-001", principal: 8000, interestEarned: 5760, feesEarned: 160, penaltiesEarned: 0, totalRevenue: 5920, totalCost: 4480, netProfit: 1440, roi: 18.0, loan: { loanNumber: "PHX-L-0001", status: "ACTIVE", client: { firstName: "Mwansa", lastName: "Tembo" } } },
  { id: "pp-002", principal: 5000, interestEarned: 3600, feesEarned: 100, penaltiesEarned: 0, totalRevenue: 3700, totalCost: 2800, netProfit: 900, roi: 18.0, loan: { loanNumber: "PHX-L-0002", status: "ACTIVE", client: { firstName: "Grace", lastName: "Mwale" } } },
  { id: "pp-003", principal: 4000, interestEarned: 0, feesEarned: 120, penaltiesEarned: 15600, totalRevenue: 15720, totalCost: 2240, netProfit: -7480, roi: -186.9, loan: { loanNumber: "PHX-L-0003", status: "DEFAULTED", client: { firstName: "Miriam", lastName: "Sichone" } } },
  { id: "pp-004", principal: 4500, interestEarned: 2916, feesEarned: 81, penaltiesEarned: 0, totalRevenue: 2997, totalCost: 2520, netProfit: 477, roi: 10.6, loan: { loanNumber: "PHX-L-0004", status: "ACTIVE", client: { firstName: "Charity", lastName: "Lungu" } } },
  { id: "pp-005", principal: 3500, interestEarned: 1344, feesEarned: 98, penaltiesEarned: 8575, totalRevenue: 10017, totalCost: 1960, netProfit: 8057, roi: 230.2, loan: { loanNumber: "PHX-L-0005", status: "OVERDUE", client: { firstName: "Emmanuel", lastName: "Zulu" } } },
];

export const mockInvestorStatements = mockInvestors.map((inv, i) => ({
  ...inv,
  capitalAmount: inv.totalInvested,
  investorType: i % 2 === 0 ? "INDIVIDUAL" : "CORPORATE",
  contractEnd: null as string | null,
  totalPaid: Math.round(inv.totalInvested * inv.returnRate / 100 / 12 * (3 + i)),
  pendingReturns: Math.round(inv.totalInvested * inv.returnRate / 100 / 12),
  transactions: [
    { id: `tx-${inv.id}-1`, date: new Date(Date.now() - 90 * 86400000).toISOString(), type: "CAPITAL_IN", amount: inv.totalInvested * 0.5, reference: "TRF-001", notes: "Initial capital contribution" },
    { id: `tx-${inv.id}-2`, date: new Date(Date.now() - 60 * 86400000).toISOString(), type: "RETURN_PAYMENT", amount: Math.round(inv.totalInvested * inv.returnRate / 100 / 12), reference: "RET-APR", notes: "Monthly return — April 2025" },
    { id: `tx-${inv.id}-3`, date: new Date(Date.now() - 30 * 86400000).toISOString(), type: "RETURN_PAYMENT", amount: Math.round(inv.totalInvested * inv.returnRate / 100 / 12), reference: "RET-MAY", notes: "Monthly return — May 2025" },
    { id: `tx-${inv.id}-4`, date: new Date().toISOString(), type: "RETURN_PAYMENT", amount: Math.round(inv.totalInvested * inv.returnRate / 100 / 12), reference: "RET-JUN", notes: "Monthly return — June 2025" },
  ],
}));

export const mockImportLogs = [
  { id: "imp-001", importType: "CLIENTS", fileName: "clients_may2025.xlsx", status: "SUCCESS", recordsImported: 45, recordsSkipped: 2, createdAt: new Date(Date.now() - 20 * 86400000).toISOString() },
  { id: "imp-002", importType: "LOANS", fileName: "legacy_loans_2024.xlsx", status: "PARTIAL", recordsImported: 120, recordsSkipped: 8, createdAt: new Date(Date.now() - 35 * 86400000).toISOString() },
  { id: "imp-003", importType: "PAYMENTS", fileName: "payments_q1_2025.xlsx", status: "SUCCESS", recordsImported: 312, recordsSkipped: 0, createdAt: new Date(Date.now() - 60 * 86400000).toISOString() },
];

export const formatKwacha = (amount: number) =>
  `K${amount.toLocaleString("en-ZM", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-ZM", { day: "2-digit", month: "short", year: "numeric" });

export const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    ACTIVE: "badge-green", CURRENT: "badge-green", PAID: "badge-green", COMPLETED: "badge-green", APPROVED: "badge-green",
    OVERDUE: "badge-yellow", AT_RISK: "badge-yellow", PENDING: "badge-yellow", IN_PROGRESS: "badge-blue",
    DEFAULTED: "badge-red", BLACKLISTED: "badge-red", CANCELLED: "badge-red", REJECTED: "badge-red",
    HELD: "badge-blue", AUCTIONED: "badge-red", RELEASED: "badge-gray",
    LOW: "badge-green", MEDIUM: "badge-yellow", HIGH: "badge-red", CRITICAL: "badge-red",
    SUPER_ADMIN: "badge-blue", MANAGER: "badge-blue", LOAN_OFFICER: "badge-gray",
    COLLECTIONS_OFFICER: "badge-yellow", ACCOUNTANT: "badge-gray",
  };
  return map[status] || "badge-gray";
};
