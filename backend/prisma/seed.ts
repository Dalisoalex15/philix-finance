import {
  PrismaClient, UserRole, UserStatus, ClientType, ClientStatus, RiskRating,
  LoanStatus, RepaymentFrequency, CollateralStatus, CollateralType, CollateralCondition,
  PaymentStatus, TaskStatus, TaskPriority, ExpenseCategory, ExpenseStatus,
  InvestorStatus, AuditAction, RecoveryStatus, NotificationType, NotificationChannel,
  CollectionStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Philix Finance database...");

  // ─── Branches ─────────────────────────────────────────────────────────────
  const branch = await prisma.branch.upsert({
    where: { code: "LUS-MAIN" },
    update: {},
    create: {
      name: "Lusaka Main Branch",
      code: "LUS-MAIN",
      address: "Plot 5432, Cairo Road, Lusaka",
      city: "Lusaka",
      province: "Lusaka",
      phone: "+260 211 123456",
      email: "lusaka@philixfinance.com",
      isActive: true,
    },
  });

  await prisma.branch.upsert({
    where: { code: "NDO-MAIN" },
    update: {},
    create: {
      name: "Ndola Branch",
      code: "NDO-MAIN",
      address: "Shop 12, Broadway, Ndola",
      city: "Ndola",
      province: "Copperbelt",
      phone: "+260 212 987654",
      email: "ndola@philixfinance.com",
      isActive: true,
    },
  });

  console.log("✅ Branches created");

  // ─── Users ────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("admin1234", 12);
  const staffHash = await bcrypt.hash("staff1234", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "daliso@philixfinance.com" },
    update: {},
    create: {
      employeeId: "PHX-001",
      email: "daliso@philixfinance.com",
      passwordHash: adminHash,
      firstName: "Daliso",
      lastName: "Phiri",
      phone: "+260 977 100001",
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      branchId: branch.id,
      lastLoginAt: new Date(),
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "chanda@philixfinance.com" },
    update: {},
    create: {
      employeeId: "PHX-002",
      email: "chanda@philixfinance.com",
      passwordHash: staffHash,
      firstName: "Chanda",
      lastName: "Mwale",
      phone: "+260 977 100002",
      role: UserRole.MANAGER,
      status: UserStatus.ACTIVE,
      branchId: branch.id,
    },
  });

  const officer1 = await prisma.user.upsert({
    where: { email: "kaputo@philixfinance.com" },
    update: {},
    create: {
      employeeId: "PHX-003",
      email: "kaputo@philixfinance.com",
      passwordHash: staffHash,
      firstName: "Kaputo",
      lastName: "Banda",
      phone: "+260 977 100003",
      role: UserRole.LOAN_OFFICER,
      status: UserStatus.ACTIVE,
      branchId: branch.id,
    },
  });

  const officer2 = await prisma.user.upsert({
    where: { email: "mutale@philixfinance.com" },
    update: {},
    create: {
      employeeId: "PHX-004",
      email: "mutale@philixfinance.com",
      passwordHash: staffHash,
      firstName: "Mutale",
      lastName: "Musonda",
      phone: "+260 977 100004",
      role: UserRole.LOAN_OFFICER,
      status: UserStatus.ACTIVE,
      branchId: branch.id,
    },
  });

  const collectionsOfficer = await prisma.user.upsert({
    where: { email: "grace@philixfinance.com" },
    update: {},
    create: {
      employeeId: "PHX-005",
      email: "grace@philixfinance.com",
      passwordHash: staffHash,
      firstName: "Grace",
      lastName: "Tembo",
      phone: "+260 977 100005",
      role: UserRole.COLLECTIONS_OFFICER,
      status: UserStatus.ACTIVE,
      branchId: branch.id,
    },
  });

  const accountant = await prisma.user.upsert({
    where: { email: "mwanza@philixfinance.com" },
    update: {},
    create: {
      employeeId: "PHX-006",
      email: "mwanza@philixfinance.com",
      passwordHash: staffHash,
      firstName: "Mwanza",
      lastName: "Chikwanda",
      phone: "+260 977 100006",
      role: UserRole.ACCOUNTANT,
      status: UserStatus.ACTIVE,
      branchId: branch.id,
    },
  });

  console.log("✅ Users created");

  // ─── Clients ──────────────────────────────────────────────────────────────
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { nrcNumber: "123456/78/1" },
      update: {},
      create: {
        clientNumber: "PHX-C-0001",
        firstName: "James",
        lastName: "Mulenga",
        nrcNumber: "123456/78/1",
        dateOfBirth: new Date("1995-03-15"),
        gender: "MALE",
        phone: "+260 977 201001",
        whatsapp: "+260 977 201001",
        email: "james.mulenga@gmail.com",
        address: "House 23, Kaunda Square, Lusaka",
        city: "Lusaka",
        province: "Lusaka",
        type: ClientType.STUDENT,
        status: ClientStatus.ACTIVE,
        riskRating: RiskRating.LOW,
        internalScore: 78,
        university: "University of Zambia",
        course: "Bachelor of Commerce",
        yearOfStudy: 3,
        studentId: "16003421",
        branchId: branch.id,
        loanOfficerId: officer1.id,
        createdAt: new Date("2024-01-10"),
      },
    }),
    prisma.client.upsert({
      where: { nrcNumber: "234567/89/2" },
      update: {},
      create: {
        clientNumber: "PHX-C-0002",
        firstName: "Natasha",
        lastName: "Phiri",
        nrcNumber: "234567/89/2",
        dateOfBirth: new Date("1988-07-22"),
        gender: "FEMALE",
        phone: "+260 977 202002",
        email: "natasha.phiri@zra.org.zm",
        address: "Plot 78, Woodlands, Lusaka",
        city: "Lusaka",
        province: "Lusaka",
        type: ClientType.CIVIL_SERVANT,
        status: ClientStatus.ACTIVE,
        riskRating: RiskRating.LOW,
        internalScore: 85,
        employer: "Zambia Revenue Authority",
        jobTitle: "Tax Inspector",
        monthlySalary: 8500,
        payDate: 25,
        branchId: branch.id,
        loanOfficerId: officer1.id,
        createdAt: new Date("2024-01-15"),
      },
    }),
    prisma.client.upsert({
      where: { nrcNumber: "345678/90/3" },
      update: {},
      create: {
        clientNumber: "PHX-C-0003",
        firstName: "Bwalya",
        lastName: "Nkonde",
        nrcNumber: "345678/90/3",
        dateOfBirth: new Date("1982-11-08"),
        gender: "MALE",
        phone: "+260 977 203003",
        address: "Stand 124, Matero, Lusaka",
        city: "Lusaka",
        province: "Lusaka",
        type: ClientType.BUSINESS_OWNER,
        status: ClientStatus.ACTIVE,
        riskRating: RiskRating.MEDIUM,
        internalScore: 62,
        businessName: "Nkonde Electronics",
        businessType: "Electronics Retail",
        marketLocation: "Kamwala Market, Lusaka",
        monthlyRevenue: 25000,
        yearsOperating: 7,
        branchId: branch.id,
        loanOfficerId: officer2.id,
        createdAt: new Date("2024-02-01"),
      },
    }),
    prisma.client.upsert({
      where: { nrcNumber: "456789/01/4" },
      update: {},
      create: {
        clientNumber: "PHX-C-0004",
        firstName: "Charity",
        lastName: "Lungu",
        nrcNumber: "456789/01/4",
        dateOfBirth: new Date("1990-05-14"),
        gender: "FEMALE",
        phone: "+260 977 204004",
        email: "charity.lungu@justice.gov.zm",
        address: "Flat 3B, Longacres, Lusaka",
        city: "Lusaka",
        province: "Lusaka",
        type: ClientType.CIVIL_SERVANT,
        status: ClientStatus.ACTIVE,
        riskRating: RiskRating.LOW,
        internalScore: 91,
        employer: "Ministry of Justice",
        jobTitle: "Senior State Advocate",
        monthlySalary: 14200,
        payDate: 28,
        branchId: branch.id,
        loanOfficerId: officer1.id,
        createdAt: new Date("2024-02-10"),
      },
    }),
    prisma.client.upsert({
      where: { nrcNumber: "567890/12/5" },
      update: {},
      create: {
        clientNumber: "PHX-C-0005",
        firstName: "Emmanuel",
        lastName: "Zulu",
        nrcNumber: "567890/12/5",
        dateOfBirth: new Date("1978-09-30"),
        gender: "MALE",
        phone: "+260 977 205005",
        address: "House 55, Chawama, Lusaka",
        city: "Lusaka",
        province: "Lusaka",
        type: ClientType.MARKET_TRADER,
        status: ClientStatus.ACTIVE,
        riskRating: RiskRating.HIGH,
        internalScore: 41,
        businessName: "Zulu General Dealers",
        marketLocation: "Soweto Market, Lusaka",
        monthlyRevenue: 9000,
        yearsOperating: 3,
        branchId: branch.id,
        loanOfficerId: officer2.id,
        createdAt: new Date("2024-03-01"),
      },
    }),
    prisma.client.upsert({
      where: { nrcNumber: "678901/23/6" },
      update: {},
      create: {
        clientNumber: "PHX-C-0006",
        firstName: "Miriam",
        lastName: "Sichone",
        nrcNumber: "678901/23/6",
        dateOfBirth: new Date("1985-12-20"),
        gender: "FEMALE",
        phone: "+260 977 206006",
        address: "Plot 901, Kalingalinga, Lusaka",
        city: "Lusaka",
        province: "Lusaka",
        type: ClientType.ENTREPRENEUR,
        status: ClientStatus.BLACKLISTED,
        riskRating: RiskRating.CRITICAL,
        internalScore: 18,
        defaultCount: 1,
        businessName: "Sichone Poultry Farm",
        monthlyRevenue: 12000,
        yearsOperating: 2,
        branchId: branch.id,
        loanOfficerId: officer2.id,
        createdAt: new Date("2023-10-15"),
      },
    }),
    prisma.client.upsert({
      where: { nrcNumber: "789012/34/7" },
      update: {},
      create: {
        clientNumber: "PHX-C-0007",
        firstName: "Patrick",
        lastName: "Ngosa",
        nrcNumber: "789012/34/7",
        dateOfBirth: new Date("1993-04-12"),
        gender: "MALE",
        phone: "+260 977 207007",
        address: "Stand 304, Chelstone, Lusaka",
        city: "Lusaka",
        province: "Lusaka",
        type: ClientType.STUDENT,
        status: ClientStatus.ACTIVE,
        riskRating: RiskRating.MEDIUM,
        internalScore: 55,
        university: "Copperbelt University",
        course: "Bachelor of Engineering",
        yearOfStudy: 4,
        studentId: "18004521",
        branchId: branch.id,
        loanOfficerId: officer1.id,
        createdAt: new Date("2024-04-01"),
      },
    }),
    prisma.client.upsert({
      where: { nrcNumber: "890123/45/8" },
      update: {},
      create: {
        clientNumber: "PHX-C-0008",
        firstName: "Agnes",
        lastName: "Chibuye",
        nrcNumber: "890123/45/8",
        dateOfBirth: new Date("1975-08-03"),
        gender: "FEMALE",
        phone: "+260 977 208008",
        email: "agnes.chibuye@moh.gov.zm",
        address: "House 12, Emmasdale, Lusaka",
        city: "Lusaka",
        province: "Lusaka",
        type: ClientType.CIVIL_SERVANT,
        status: ClientStatus.ACTIVE,
        riskRating: RiskRating.LOW,
        internalScore: 88,
        employer: "Ministry of Health",
        jobTitle: "Senior Nurse",
        monthlySalary: 6800,
        payDate: 20,
        branchId: branch.id,
        loanOfficerId: officer2.id,
        createdAt: new Date("2024-04-15"),
      },
    }),
  ]);

  console.log(`✅ ${clients.length} clients created`);

  // ─── Collateral ───────────────────────────────────────────────────────────
  const collaterals = await Promise.all([
    prisma.collateral.create({
      data: {
        vaultId: "PHX-V-0001",
        clientId: clients[0].id,
        type: CollateralType.LAPTOP,
        brand: "Apple",
        model: "MacBook Air M2",
        serialNumber: "C02XK1JGJGH5",
        color: "Silver",
        ageYears: 1,
        condition: CollateralCondition.EXCELLENT,
        hasCharger: true,
        hasBox: true,
        batteryHealth: 97,
        marketValue: 18000,
        forcedSaleValue: 14400,
        maxLoanAmount: 10800,
        loanToValue: 75,
        status: CollateralStatus.HELD,
        shelfNumber: "A1",
        vaultPosition: "01",
        receivedAt: new Date("2024-05-10"),
        branchId: branch.id,
        assessedBy: officer1.id,
        assessedAt: new Date("2024-05-10"),
      },
    }),
    prisma.collateral.create({
      data: {
        vaultId: "PHX-V-0002",
        clientId: clients[1].id,
        type: CollateralType.SMARTPHONE,
        brand: "Samsung",
        model: "Galaxy S24 Ultra",
        serialNumber: "R5CXB0K3YZP",
        color: "Titanium Black",
        ageYears: 0,
        condition: CollateralCondition.EXCELLENT,
        hasCharger: true,
        hasBox: true,
        batteryHealth: 100,
        marketValue: 12000,
        forcedSaleValue: 9600,
        maxLoanAmount: 7200,
        loanToValue: 75,
        status: CollateralStatus.HELD,
        shelfNumber: "A2",
        vaultPosition: "01",
        receivedAt: new Date("2024-05-15"),
        branchId: branch.id,
        assessedBy: officer1.id,
        assessedAt: new Date("2024-05-15"),
      },
    }),
    prisma.collateral.create({
      data: {
        vaultId: "PHX-V-0003",
        clientId: clients[2].id,
        type: CollateralType.SMARTPHONE,
        brand: "Apple",
        model: "iPhone 15 Pro",
        serialNumber: "F17LM9N3XXZK",
        color: "Natural Titanium",
        ageYears: 1,
        condition: CollateralCondition.GOOD,
        hasCharger: true,
        hasBox: false,
        batteryHealth: 88,
        marketValue: 10500,
        forcedSaleValue: 8400,
        maxLoanAmount: 6300,
        loanToValue: 75,
        status: CollateralStatus.HELD,
        shelfNumber: "B1",
        vaultPosition: "01",
        receivedAt: new Date("2024-06-01"),
        branchId: branch.id,
        assessedBy: officer2.id,
        assessedAt: new Date("2024-06-01"),
      },
    }),
    prisma.collateral.create({
      data: {
        vaultId: "PHX-V-0004",
        clientId: clients[3].id,
        type: CollateralType.TABLET,
        brand: "Apple",
        model: "iPad Pro 12.9 M2",
        serialNumber: "DLXNJ9GMPPQR",
        color: "Space Grey",
        ageYears: 2,
        condition: CollateralCondition.GOOD,
        hasCharger: true,
        hasBox: true,
        marketValue: 9000,
        forcedSaleValue: 7200,
        maxLoanAmount: 5400,
        loanToValue: 75,
        status: CollateralStatus.HELD,
        shelfNumber: "B2",
        vaultPosition: "01",
        receivedAt: new Date("2024-06-10"),
        branchId: branch.id,
        assessedBy: officer1.id,
        assessedAt: new Date("2024-06-10"),
      },
    }),
    prisma.collateral.create({
      data: {
        vaultId: "PHX-V-0005",
        clientId: clients[5].id,
        type: CollateralType.LAPTOP,
        brand: "Dell",
        model: "XPS 15 9530",
        serialNumber: "DE8XK441M2",
        color: "Platinum Silver",
        ageYears: 2,
        condition: CollateralCondition.FAIR,
        hasCharger: true,
        hasBox: false,
        batteryHealth: 71,
        marketValue: 9500,
        forcedSaleValue: 6650,
        maxLoanAmount: 4987,
        loanToValue: 75,
        status: CollateralStatus.UNDER_REVIEW,  // repossessed/under review
        shelfNumber: "C1",
        vaultPosition: "01",
        receivedAt: new Date("2023-10-20"),
        branchId: branch.id,
        assessedBy: officer2.id,
        assessedAt: new Date("2023-10-20"),
      },
    }),
    prisma.collateral.create({
      data: {
        vaultId: "PHX-V-0006",
        clientId: clients[6].id,
        type: CollateralType.GAMING_CONSOLE,
        brand: "Sony",
        model: "PlayStation 5",
        serialNumber: "PS5CF1234XYZ",
        color: "White",
        ageYears: 1,
        condition: CollateralCondition.EXCELLENT,
        hasBox: true,
        marketValue: 6500,
        forcedSaleValue: 5200,
        maxLoanAmount: 3900,
        loanToValue: 75,
        status: CollateralStatus.HELD,
        shelfNumber: "C2",
        vaultPosition: "01",
        receivedAt: new Date("2024-07-01"),
        branchId: branch.id,
        assessedBy: officer1.id,
        assessedAt: new Date("2024-07-01"),
      },
    }),
    prisma.collateral.create({
      data: {
        vaultId: "PHX-V-0007",
        clientId: clients[7].id,
        type: CollateralType.SMARTPHONE,
        brand: "Samsung",
        model: "Galaxy A54",
        serialNumber: "R5CT400ABCDE",
        color: "Awesome Violet",
        ageYears: 1,
        condition: CollateralCondition.GOOD,
        hasCharger: true,
        hasBox: false,
        batteryHealth: 91,
        marketValue: 3800,
        forcedSaleValue: 3040,
        maxLoanAmount: 2280,
        loanToValue: 75,
        status: CollateralStatus.HELD,
        shelfNumber: "A3",
        vaultPosition: "01",
        receivedAt: new Date("2024-07-15"),
        branchId: branch.id,
        assessedBy: officer2.id,
        assessedAt: new Date("2024-07-15"),
      },
    }),
  ]);

  console.log(`✅ ${collaterals.length} collateral items created`);

  // ─── Loans ────────────────────────────────────────────────────────────────
  const loan1 = await prisma.loan.create({
    data: {
      loanNumber: "PHX-L-0001",
      clientId: clients[0].id,
      loanOfficerId: officer1.id,
      branchId: branch.id,
      collateralId: collaterals[0].id,
      loanType: "PERSONAL",
      principal: 8000,
      interestRate: 24,
      processingFee: 2,
      processingFeeAmount: 160,
      totalInterest: 1920,
      totalDue: 9920,
      outstandingBalance: 3968,
      totalPaid: 5952,
      installmentAmount: 826.67,
      repaymentFrequency: RepaymentFrequency.MONTHLY,
      totalInstallments: 12,
      status: LoanStatus.ACTIVE,
      disbursementDate: new Date("2024-05-15"),
      firstPaymentDate: new Date("2024-06-15"),
      maturityDate: new Date("2025-05-15"),
      purpose: "University tuition and accommodation fees",
      collectionStatus: CollectionStatus.CURRENT,
    },
  });

  const loan2 = await prisma.loan.create({
    data: {
      loanNumber: "PHX-L-0002",
      clientId: clients[1].id,
      loanOfficerId: officer1.id,
      branchId: branch.id,
      collateralId: collaterals[1].id,
      loanType: "PERSONAL",
      principal: 5000,
      interestRate: 20,
      processingFee: 2,
      processingFeeAmount: 100,
      totalInterest: 1000,
      totalDue: 6000,
      outstandingBalance: 500,
      totalPaid: 5500,
      installmentAmount: 500,
      repaymentFrequency: RepaymentFrequency.MONTHLY,
      totalInstallments: 12,
      status: LoanStatus.ACTIVE,
      disbursementDate: new Date("2024-01-20"),
      firstPaymentDate: new Date("2024-02-20"),
      maturityDate: new Date("2025-01-20"),
      purpose: "Home renovation — roof replacement",
      collectionStatus: CollectionStatus.CURRENT,
    },
  });

  const loan3 = await prisma.loan.create({
    data: {
      loanNumber: "PHX-L-0003",
      clientId: clients[5].id,
      loanOfficerId: officer2.id,
      branchId: branch.id,
      collateralId: collaterals[4].id,
      loanType: "BUSINESS",
      principal: 4000,
      interestRate: 30,
      processingFee: 3,
      processingFeeAmount: 120,
      totalInterest: 1200,
      totalDue: 5200,
      outstandingBalance: 5200,
      totalPaid: 0,
      installmentAmount: 433.33,
      repaymentFrequency: RepaymentFrequency.MONTHLY,
      totalInstallments: 12,
      status: LoanStatus.DEFAULTED,
      disbursementDate: new Date("2023-10-20"),
      firstPaymentDate: new Date("2023-11-20"),
      maturityDate: new Date("2024-10-20"),
      daysLate: 180,
      purpose: "Poultry farm expansion — purchasing 500 chicks",
      collectionStatus: CollectionStatus.DEFAULT,
    },
  });

  const loan4 = await prisma.loan.create({
    data: {
      loanNumber: "PHX-L-0004",
      clientId: clients[3].id,
      loanOfficerId: officer1.id,
      branchId: branch.id,
      collateralId: collaterals[3].id,
      loanType: "PERSONAL",
      principal: 4500,
      interestRate: 18,
      processingFee: 2,
      processingFeeAmount: 81,
      totalInterest: 810,
      totalDue: 5310,
      outstandingBalance: 2655,
      totalPaid: 2655,
      installmentAmount: 442.5,
      repaymentFrequency: RepaymentFrequency.MONTHLY,
      totalInstallments: 12,
      status: LoanStatus.ACTIVE,
      disbursementDate: new Date("2024-06-15"),
      firstPaymentDate: new Date("2024-07-15"),
      maturityDate: new Date("2025-06-15"),
      purpose: "Vehicle repair and maintenance",
      collectionStatus: CollectionStatus.CURRENT,
    },
  });

  const loan5 = await prisma.loan.create({
    data: {
      loanNumber: "PHX-L-0005",
      clientId: clients[4].id,
      loanOfficerId: officer2.id,
      branchId: branch.id,
      collateralId: collaterals[4].id,
      loanType: "BUSINESS",
      principal: 3500,
      interestRate: 28,
      processingFee: 3,
      processingFeeAmount: 98,
      totalInterest: 980,
      totalDue: 4480,
      outstandingBalance: 3136,
      totalPaid: 1344,
      installmentAmount: 373.33,
      repaymentFrequency: RepaymentFrequency.MONTHLY,
      totalInstallments: 12,
      status: LoanStatus.OVERDUE,
      disbursementDate: new Date("2024-03-10"),
      firstPaymentDate: new Date("2024-04-10"),
      maturityDate: new Date("2025-03-10"),
      daysLate: 47,
      purpose: "Stock purchase for general trading business",
      collectionStatus: CollectionStatus.DAYS_60,
    },
  });

  const loan6 = await prisma.loan.create({
    data: {
      loanNumber: "PHX-L-0006",
      clientId: clients[6].id,
      loanOfficerId: officer1.id,
      branchId: branch.id,
      collateralId: collaterals[5].id,
      loanType: "PERSONAL",
      principal: 3000,
      interestRate: 22,
      processingFee: 2,
      processingFeeAmount: 66,
      totalInterest: 660,
      totalDue: 3660,
      outstandingBalance: 3660,
      totalPaid: 0,
      installmentAmount: 305,
      repaymentFrequency: RepaymentFrequency.MONTHLY,
      totalInstallments: 12,
      status: LoanStatus.PENDING_APPROVAL,
      purpose: "Final year engineering project equipment",
      collectionStatus: CollectionStatus.CURRENT,
    },
  });

  const loan7 = await prisma.loan.create({
    data: {
      loanNumber: "PHX-L-0007",
      clientId: clients[7].id,
      loanOfficerId: officer2.id,
      branchId: branch.id,
      collateralId: collaterals[6].id,
      loanType: "PERSONAL",
      principal: 2000,
      interestRate: 18,
      processingFee: 2,
      processingFeeAmount: 40,
      totalInterest: 360,
      totalDue: 2360,
      outstandingBalance: 2360,
      totalPaid: 0,
      installmentAmount: 196.67,
      repaymentFrequency: RepaymentFrequency.MONTHLY,
      totalInstallments: 12,
      status: LoanStatus.APPROVED,
      purpose: "Medical equipment for nursing duties",
      collectionStatus: CollectionStatus.CURRENT,
    },
  });

  console.log("✅ Loans created");

  // ─── Loan Schedules ───────────────────────────────────────────────────────
  for (let i = 1; i <= 12; i++) {
    const d = new Date("2024-06-15");
    d.setMonth(d.getMonth() + i - 1);
    const paid = i <= 7;
    await prisma.loanSchedule.create({
      data: {
        loanId: loan1.id,
        installmentNo: i,
        dueDate: d,
        principalDue: 666.67,
        interestDue: 160,
        totalDue: 826.67,
        principalPaid: paid ? 666.67 : 0,
        interestPaid: paid ? 160 : 0,
        totalPaid: paid ? 826.67 : 0,
        status: paid ? PaymentStatus.PAID : PaymentStatus.PENDING,
        paidAt: paid ? new Date(d.getTime() - 2 * 86400000) : null,
      },
    });
  }

  // ─── Payments ─────────────────────────────────────────────────────────────
  // Loan 1 — 7 payments
  for (let i = 1; i <= 7; i++) {
    const d = new Date("2024-06-13");
    d.setMonth(d.getMonth() + i - 1);
    await prisma.payment.create({
      data: {
        paymentNumber: `PMT-${loan1.loanNumber}-${String(i).padStart(3, "0")}`,
        loanId: loan1.id,
        recordedById: officer1.id,
        amount: 826.67,
        principalAmount: 666.67,
        interestAmount: 160,
        method: "CASH",
        reference: `REC-00${i}`,
        paymentDate: d,
      },
    });
  }

  // Loan 2 — 11 payments
  for (let i = 1; i <= 11; i++) {
    const d = new Date("2024-02-20");
    d.setMonth(d.getMonth() + i - 1);
    await prisma.payment.create({
      data: {
        paymentNumber: `PMT-${loan2.loanNumber}-${String(i).padStart(3, "0")}`,
        loanId: loan2.id,
        recordedById: officer1.id,
        amount: 500,
        principalAmount: 416.67,
        interestAmount: 83.33,
        method: "BANK_TRANSFER",
        reference: `ZRA-BT-${String(i).padStart(4, "0")}`,
        paymentDate: d,
      },
    });
  }

  // Loan 4 — 6 payments
  for (let i = 1; i <= 6; i++) {
    const d = new Date("2024-07-15");
    d.setMonth(d.getMonth() + i - 1);
    await prisma.payment.create({
      data: {
        paymentNumber: `PMT-${loan4.loanNumber}-${String(i).padStart(3, "0")}`,
        loanId: loan4.id,
        recordedById: officer1.id,
        amount: 442.5,
        principalAmount: 375,
        interestAmount: 67.5,
        method: "MOBILE_MONEY",
        reference: `AIRTEL-${String(i).padStart(6, "0")}`,
        paymentDate: d,
      },
    });
  }

  // Loan 5 — 3 partial payments then stopped
  for (let i = 1; i <= 3; i++) {
    const d = new Date("2024-04-10");
    d.setMonth(d.getMonth() + i - 1);
    await prisma.payment.create({
      data: {
        paymentNumber: `PMT-${loan5.loanNumber}-${String(i).padStart(3, "0")}`,
        loanId: loan5.id,
        recordedById: officer2.id,
        amount: 448,
        principalAmount: 291.67,
        interestAmount: 81.67,
        penaltyAmount: 74.66,
        method: "CASH",
        paymentDate: d,
      },
    });
  }

  console.log("✅ Loan schedules and payments created");

  // ─── Collection Logs ──────────────────────────────────────────────────────
  await prisma.collectionLog.createMany({
    data: [
      {
        loanId: loan5.id,
        officerId: collectionsOfficer.id,
        type: "CALL",
        notes: "Client answered. Claims business had a bad month. Promised to pay K1,000 by end of week.",
        promiseAmount: 1000,
        promiseDate: new Date("2024-11-15"),
        outcome: "PROMISE_TO_PAY",
        createdAt: new Date("2024-11-10"),
      },
      {
        loanId: loan5.id,
        officerId: collectionsOfficer.id,
        type: "VISIT",
        notes: "Visited market stall at Soweto Market. Client not present. Left notice with business partner.",
        outcome: "NO_RESPONSE",
        createdAt: new Date("2024-11-05"),
      },
      {
        loanId: loan3.id,
        officerId: collectionsOfficer.id,
        type: "CALL",
        notes: "Number not reachable. Client appears to have changed phone number.",
        outcome: "NO_RESPONSE",
        createdAt: new Date("2024-10-20"),
      },
    ],
  });

  // ─── Tasks ────────────────────────────────────────────────────────────────
  await prisma.task.createMany({
    data: [
      {
        title: "Follow up with Emmanuel Zulu on overdue payments",
        description: "Client is 47 days overdue on PHX-L-0005. Second physical visit required.",
        assigneeId: collectionsOfficer.id,
        createdById: manager.id,
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: new Date("2024-11-20"),
        loanId: loan5.id,
        clientId: clients[4].id,
      },
      {
        title: "Process Agnes Chibuye loan disbursement",
        description: "Loan PHX-L-0007 approved — arrange funds disbursement via bank transfer.",
        assigneeId: accountant.id,
        createdById: manager.id,
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        dueDate: new Date("2024-11-18"),
        loanId: loan7.id,
        clientId: clients[7].id,
      },
      {
        title: "Review and approve Patrick Ngosa loan application",
        description: "PHX-L-0006 pending approval. Collateral assessed. Awaiting manager sign-off.",
        assigneeId: manager.id,
        createdById: superAdmin.id,
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date("2024-11-16"),
        loanId: loan6.id,
      },
      {
        title: "Prepare monthly portfolio report for November",
        description: "Generate PAR analysis, collection rate, and disbursement summary for board.",
        assigneeId: accountant.id,
        createdById: superAdmin.id,
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date("2024-11-30"),
      },
      {
        title: "Initiate recovery proceedings — Miriam Sichone default",
        description: "Begin formal legal recovery. Dell XPS laptop (PHX-V-0005) to be auctioned.",
        assigneeId: manager.id,
        createdById: superAdmin.id,
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.URGENT,
        dueDate: new Date("2024-11-22"),
        loanId: loan3.id,
        clientId: clients[5].id,
      },
    ],
  });

  console.log("✅ Tasks created");

  // ─── Expenses ─────────────────────────────────────────────────────────────
  await prisma.expense.createMany({
    data: [
      {
        category: ExpenseCategory.RENT,
        description: "Office rent — Lusaka Main Branch November 2024",
        amount: 8500,
        vendorName: "Kwacha Properties Ltd",
        date: new Date("2024-11-01"),
        submittedById: accountant.id,
        status: ExpenseStatus.APPROVED,
        approvedById: manager.id,
        approvedAt: new Date("2024-11-01"),
        branchId: branch.id,
      },
      {
        category: ExpenseCategory.SALARY,
        description: "Staff salaries — November 2024 payroll",
        amount: 42000,
        vendorName: "Internal Payroll",
        date: new Date("2024-11-25"),
        submittedById: accountant.id,
        status: ExpenseStatus.APPROVED,
        approvedById: superAdmin.id,
        approvedAt: new Date("2024-11-25"),
        branchId: branch.id,
      },
      {
        category: ExpenseCategory.UTILITIES,
        description: "ZESCO electricity — October/November billing",
        amount: 1200,
        vendorName: "Zesco Limited",
        date: new Date("2024-11-05"),
        submittedById: accountant.id,
        status: ExpenseStatus.APPROVED,
        approvedById: manager.id,
        approvedAt: new Date("2024-11-05"),
        branchId: branch.id,
      },
      {
        category: ExpenseCategory.FUEL,
        description: "Fuel for collections officers — November",
        amount: 2400,
        vendorName: "Total Energies Zambia",
        date: new Date("2024-11-10"),
        submittedById: collectionsOfficer.id,
        status: ExpenseStatus.APPROVED,
        approvedById: manager.id,
        branchId: branch.id,
      },
      {
        category: ExpenseCategory.STATIONERY,
        description: "Loan forms, receipts and branding materials",
        amount: 680,
        vendorName: "Printmaster Zambia",
        date: new Date("2024-11-08"),
        submittedById: officer1.id,
        status: ExpenseStatus.PENDING,
        branchId: branch.id,
      },
      {
        category: ExpenseCategory.OTHER,
        description: "Legal fees — demand letters for defaulters",
        amount: 3500,
        vendorName: "Mwale & Associates Legal Practitioners",
        date: new Date("2024-11-12"),
        submittedById: manager.id,
        status: ExpenseStatus.APPROVED,
        approvedById: superAdmin.id,
        branchId: branch.id,
      },
    ],
  });

  console.log("✅ Expenses created");

  // ─── Investors ────────────────────────────────────────────────────────────
  const investors = await Promise.all([
    prisma.investor.create({
      data: {
        investorNumber: "PHX-INV-001",
        fullName: "Robert Phiri",
        email: "robert.phiri@gmail.com",
        phone: "+260 977 300001",
        nationalId: "111111/00/1",
        status: InvestorStatus.ACTIVE,
        totalInvested: 150000,
        currentBalance: 150000,
        returnRate: 42,
        contractStart: new Date("2023-01-10"),
      },
    }),
    prisma.investor.create({
      data: {
        investorNumber: "PHX-INV-002",
        fullName: "Catherine Banda",
        email: "catherine.banda@outlook.com",
        phone: "+260 977 300002",
        nationalId: "222222/00/2",
        status: InvestorStatus.ACTIVE,
        totalInvested: 100000,
        currentBalance: 100000,
        returnRate: 42,
        contractStart: new Date("2023-03-15"),
      },
    }),
    prisma.investor.create({
      data: {
        investorNumber: "PHX-INV-003",
        fullName: "Silas Mwamba",
        email: "silas.mwamba@copper.zm",
        phone: "+260 977 300003",
        nationalId: "333333/00/3",
        status: InvestorStatus.ACTIVE,
        totalInvested: 75000,
        currentBalance: 75000,
        returnRate: 42,
        contractStart: new Date("2023-06-20"),
      },
    }),
    prisma.investor.create({
      data: {
        investorNumber: "PHX-INV-004",
        fullName: "Janet Chiluba",
        email: "janet.chiluba@zacl.zm",
        phone: "+260 977 300004",
        nationalId: "444444/00/4",
        status: InvestorStatus.ACTIVE,
        totalInvested: 50000,
        currentBalance: 50000,
        returnRate: 42,
        contractStart: new Date("2024-01-05"),
      },
    }),
  ]);

  for (const inv of investors) {
    await prisma.investment.create({
      data: {
        investorId: inv.id,
        amount: inv.totalInvested,
        date: inv.contractStart,
        notes: "12-month fixed-term investment at 3.5% monthly (42% p.a.)",
      },
    });
  }

  console.log(`✅ ${investors.length} investors created`);

  // ─── Announcements ────────────────────────────────────────────────────────
  await prisma.announcement.createMany({
    data: [
      {
        title: "November Collections Target: K450,000",
        content: "Team, our target for November is K450,000 in loan collections. This is a 12% increase from October. Focus on PAR 30+ accounts. — Daliso",
        authorId: superAdmin.id,
        isPinned: true,
        expiresAt: new Date("2024-11-30"),
      },
      {
        title: "New Collateral Assessment Form (Effective Nov 10)",
        content: "Effective immediately, all collateral assessments must use Form PHX-CA-2024. Old forms will no longer be accepted. Collect copies from the manager's office.",
        authorId: manager.id,
        isPinned: true,
        expiresAt: new Date("2024-12-31"),
      },
      {
        title: "Staff Performance Review — December 2024",
        content: "Annual performance reviews will run from 2nd to 6th December. Ensure all loan collection reports are up to date before this date.",
        authorId: superAdmin.id,
        isPinned: false,
        expiresAt: new Date("2024-12-06"),
      },
    ],
  });

  // ─── Wiki Pages ───────────────────────────────────────────────────────────
  await prisma.wikiPage.createMany({
    data: [
      {
        title: "Loan Application Process — Step by Step",
        slug: "loan-application-process",
        content: "# Loan Application Process\n\n## Step 1 — Client Verification\nVerify NRC, phone, address. Check blacklist.\n\n## Step 2 — Collateral Assessment\nPhysically inspect and photograph the item. Use Form PHX-CA-2024.\n\n## Step 3 — Loan Calculation\nUse the Philix Calculator. PMT formula for installments.\n\n## Step 4 — Manager Approval\nAll loans above K5,000 require manager sign-off.\n\n## Step 5 — Disbursement\nCash or bank transfer. Record immediately in system.",
        authorId: manager.id,
        category: "PROCEDURES",
        viewCount: 47,
      },
      {
        title: "Collateral Acceptance Policy",
        slug: "collateral-acceptance-policy",
        content: "# Collateral Policy\n\nPhilix accepts: Smartphones (min K1,500), Laptops (min K3,000), Tablets (min K2,000), Gaming Consoles (min K3,000).\n\n## LTV: 75% of forced sale value.\n\nCondition: EXCELLENT=100%, GOOD=90%, FAIR=70%, POOR=not accepted.",
        authorId: superAdmin.id,
        category: "POLICIES",
        viewCount: 89,
      },
      {
        title: "Collections Escalation Procedure",
        slug: "collections-escalation",
        content: "# Collections Escalation\n\nPAR 1-7: Automated reminder.\nPAR 8-30: Officer call + log.\nPAR 31-60: Collections Officer physical visit + demand letter.\nPAR 60+: Manager involvement, legal proceedings.\nPAR 90+: Default declared, repossession authorized by CEO.",
        authorId: manager.id,
        category: "PROCEDURES",
        viewCount: 62,
      },
      {
        title: "Zambian Microfinance Regulations — Overview",
        slug: "zambia-microfinance-regulations",
        content: "# Zambian Microfinance Regulations\n\nRegulated by Bank of Zambia (BoZ) under the Banking and Financial Services Act.\n\nClient data protected under Data Protection Act 2021. Loan disclosure forms required before signing.",
        authorId: superAdmin.id,
        category: "REGULATIONS",
        viewCount: 34,
      },
    ],
  });

  // ─── Recovery Record ──────────────────────────────────────────────────────
  await prisma.recoveryRecord.create({
    data: {
      loanId: loan3.id,
      collateralId: collaterals[4].id,
      status: RecoveryStatus.LISTED_FOR_AUCTION,
      auctionDate: new Date("2024-12-05"),
      auctioneer: "Philix Finance / In-house",
      notes: "Dell XPS 15 repossessed. Reserve price K6,000. Auction scheduled.",
      recoveredById: manager.id,
    },
  });

  // ─── Notifications ────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: superAdmin.id,
        type: NotificationType.PAYMENT_OVERDUE,
        channel: NotificationChannel.IN_APP,
        title: "5 Loans Crossed PAR 30",
        message: "5 loans have crossed the 30-day overdue threshold. Immediate collections action required.",
        isRead: false,
      },
      {
        userId: superAdmin.id,
        type: NotificationType.PAYMENT_REMINDER,
        channel: NotificationChannel.IN_APP,
        title: "Payment Received — James Mulenga",
        message: "K826.67 installment received for loan PHX-L-0001. Balance: K3,968.",
        isRead: true,
      },
      {
        userId: manager.id,
        type: NotificationType.LOAN_APPROVED,
        channel: NotificationChannel.IN_APP,
        title: "Loan Pending Approval — Patrick Ngosa",
        message: "Loan PHX-L-0006 (K3,000) is awaiting your approval. Collateral: Sony PS5.",
        isRead: false,
      },
      {
        userId: officer1.id,
        type: NotificationType.TASK_ASSIGNED,
        channel: NotificationChannel.IN_APP,
        title: "Task Assigned",
        message: "You have been assigned to process disbursement for loan PHX-L-0007.",
        isRead: false,
      },
    ],
  });

  // ─── Audit Logs ───────────────────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      {
        userId: superAdmin.id,
        action: AuditAction.LOGIN,
        entity: "User",
        entityId: superAdmin.id,
        description: "User logged in",
        ipAddress: "197.215.100.1",
        userAgent: "Mozilla/5.0 Chrome/120.0",
      },
      {
        userId: officer1.id,
        action: AuditAction.CREATE,
        entity: "Loan",
        entityId: loan1.id,
        description: "Created loan PHX-L-0001 for K8,000",
        newValue: { loanNumber: "PHX-L-0001", amount: 8000 },
        ipAddress: "197.215.100.2",
        userAgent: "Mozilla/5.0 Chrome/120.0",
      },
      {
        userId: manager.id,
        action: AuditAction.APPROVE,
        entity: "Loan",
        entityId: loan1.id,
        description: "Approved loan PHX-L-0001",
        ipAddress: "197.215.100.3",
        userAgent: "Mozilla/5.0 Firefox/120.0",
      },
      {
        userId: officer2.id,
        action: AuditAction.CREATE,
        entity: "Collateral",
        entityId: collaterals[2].id,
        description: "Registered collateral PHX-V-0003 (iPhone 15 Pro)",
        newValue: { vaultId: "PHX-V-0003", brand: "Apple", model: "iPhone 15 Pro" },
        ipAddress: "197.215.100.2",
        userAgent: "Mozilla/5.0 Chrome/120.0",
      },
      {
        userId: superAdmin.id,
        action: AuditAction.UPDATE,
        entity: "Client",
        entityId: clients[5].id,
        description: "Blacklisted client PHX-C-0006 — Miriam Sichone",
        oldValue: { status: "ACTIVE" },
        newValue: { status: "BLACKLISTED" },
        ipAddress: "197.215.100.1",
        userAgent: "Mozilla/5.0 Chrome/120.0",
      },
      {
        userId: officer1.id,
        action: AuditAction.PAYMENT,
        entity: "Payment",
        entityId: loan1.id,
        description: "Recorded payment K826.67 for PHX-L-0001",
        newValue: { amount: 826.67, method: "CASH" },
        ipAddress: "197.215.100.2",
        userAgent: "Mozilla/5.0 Chrome/120.0",
      },
    ],
  });

  // ─── Portfolio Snapshot ───────────────────────────────────────────────────
  await prisma.portfolioSnapshot.create({
    data: {
      date: new Date("2024-11-01"),
      totalLoans: 320,
      activeLoans: 287,
      overdueLoans: 34,
      defaultedLoans: 8,
      paidLoans: 25,
      totalDisbursed: 2400000,
      totalOutstanding: 1847500,
      totalCollected: 552500,
      par1: 8.3,
      par7: 6.1,
      par30: 4.2,
      par60: 2.8,
      par90: 1.5,
      defaultRate: 0.9,
      recoveryRate: 41.2,
    },
  });

  console.log("✅ Wiki, announcements, notifications, audit logs, portfolio snapshot created");

  // ─── Client Portal Accounts ───────────────────────────────────────────────
  const clientPortalHash = await bcrypt.hash("Client@123", 12);
  const clientPortalHash2 = await bcrypt.hash("Client@456", 12);

  await prisma.clientPortalAccount.upsert({
    where: { email: "mwansa.tembo@email.com" },
    update: {},
    create: {
      clientNumber: "PHX-C-0001",
      email: "mwansa.tembo@email.com",
      passwordHash: clientPortalHash,
      firstName: "Mwansa",
      lastName: "Tembo",
      phone: "+260 97 456 7890",
      dateOfBirth: new Date("1998-03-15"),
      gender: "MALE",
      address: "House 12, Plot 45, Kabwata",
      city: "Lusaka",
      occupation: "Student",
      employer: "University of Zambia",
      monthlyIncome: 2500,
      nrcNumber: "123456/78/1",
      kycStatus: "VERIFIED",
      kycSubmittedAt: new Date("2024-02-20"),
      kycVerifiedAt: new Date("2024-02-22"),
      status: "ACTIVE",
      notifications: {
        create: [
          {
            subject: "Welcome to Philix Finance!",
            body: "Dear Mwansa,\n\nWelcome to Philix Finance! We are excited to have you as a client.\n\nYour client number is PHX-C-0001.\n\nPhilix Finance Ltd",
            category: "ACCOUNT",
            isRead: true,
            sentViaEmail: true,
          },
          {
            subject: "Loan Application Approved — PHX-L-2024-0034",
            body: "Dear Mwansa,\n\nYour loan application has been APPROVED.\n\nLoan Reference: PHX-L-2024-0034\nProduct: Salary Advance\nAmount: K5,000\nTerm: 5 months\nMonthly Payment: K1,080\n\nPhilix Finance Ltd",
            category: "LOAN",
            isRead: false,
            sentViaEmail: true,
          },
          {
            subject: "Payment Receipt — K1,080 received",
            body: "Dear Mwansa,\n\nWe confirm receipt of K1,080 on 15 June 2025.\n\nReceipt No: RCP-20250615-001\nLoan: PHX-L-2024-0034\nOutstanding: K2,160\n\nPhilix Finance Ltd",
            category: "PAYMENT",
            isRead: false,
            sentViaEmail: true,
          },
        ],
      },
    },
  });

  await prisma.clientPortalAccount.upsert({
    where: { email: "grace.mwale@email.com" },
    update: {},
    create: {
      clientNumber: "PHX-C-0002",
      email: "grace.mwale@email.com",
      passwordHash: clientPortalHash2,
      firstName: "Grace",
      lastName: "Mwale",
      phone: "+260 96 789 0123",
      dateOfBirth: new Date("1990-07-22"),
      gender: "FEMALE",
      address: "Flat 3, Lusaka Housing, Roma",
      city: "Lusaka",
      occupation: "Civil Servant",
      employer: "Ministry of Health",
      monthlyIncome: 8500,
      nrcNumber: "234567/89/2",
      kycStatus: "VERIFIED",
      kycSubmittedAt: new Date("2024-03-05"),
      kycVerifiedAt: new Date("2024-03-07"),
      status: "ACTIVE",
      notifications: {
        create: [
          {
            subject: "Welcome to Philix Finance!",
            body: "Dear Grace,\n\nWelcome to Philix Finance! Your account is ready.\n\nClient Number: PHX-C-0002\n\nPhilix Finance Ltd",
            category: "ACCOUNT",
            isRead: true,
            sentViaEmail: true,
          },
          {
            subject: "Identity Verification Complete",
            body: "Dear Grace,\n\nYour KYC identity verification has been successfully completed.\n\nStatus: VERIFIED\nVerified On: 07 March 2024\n\nPhilix Finance Ltd",
            category: "KYC",
            isRead: true,
            sentViaEmail: true,
          },
        ],
      },
    },
  });

  console.log("✅ Client portal accounts created");
  console.log("\n✨ Seed complete! Philix Finance is ready.\n");
  console.log("Staff Login credentials:");
  console.log("  CEO:              daliso@philixfinance.com  / admin1234");
  console.log("  Manager:          chanda@philixfinance.com  / staff1234");
  console.log("  Loan Officer:     kaputo@philixfinance.com  / staff1234");
  console.log("  Collections:       grace@philixfinance.com  / staff1234");
  console.log("  Accountant:       mwanza@philixfinance.com  / staff1234");
  console.log("\nClient Portal credentials:");
  console.log("  Client 1:  mwansa.tembo@email.com  / Client@123");
  console.log("  Client 2:  grace.mwale@email.com   / Client@456");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
