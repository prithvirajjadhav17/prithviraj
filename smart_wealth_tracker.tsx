import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Download,
  PlusCircle,
  Trash2,
  Search,
  Calculator,
  Split,
  Landmark,
  Target,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const STORAGE_KEYS = {
  TRANSACTIONS: 'smart_wealth_tracker_tx_v1',
  CURRENCY: 'smart_wealth_tracker_currency_v1',
  BUDGET: 'smart_wealth_tracker_budget_v1',
};

const CURRENCIES = {
  INR: { code: 'INR', symbol: '₹', locale: 'en-IN', name: 'Indian Rupee' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB', name: 'British Pound' },
  JPY: { code: 'JPY', symbol: '¥', locale: 'ja-JP', name: 'Japanese Yen' },
};

const CATEGORIES = {
  'Housing': { icon: '🏠', color: '#818cf8' },
  'Food': { icon: '🍔', color: '#00f3ff' },
  'Transport': { icon: '🚇', color: '#ffbe0b' },
  'Utilities': { icon: '⚡', color: '#fb923c' },
  'Education / Shopping': { icon: '📚', color: '#ff2a6d' },
  'Entertainment': { icon: '🎬', color: '#a855f7' },
  'Health': { icon: '💊', color: '#38bdf8' },
  'Salary / Freelance': { icon: '💼', color: '#00e676' },
  'Other': { icon: '📦', color: '#94a3b8' },
};

const QUICK_PRESETS = [
  { label: 'Lunch', title: 'Daily Lunch', amount: 250, type: 'expense', category: 'Food' },
  { label: 'Metro/Cab', title: 'Metro & Cab Ride', amount: 180, type: 'expense', category: 'Transport' },
  { label: 'Groceries', title: 'Fresh Groceries', amount: 1200, type: 'expense', category: 'Food' },
  { label: 'Coffee/Snacks', title: 'Coffee & Snacks', amount: 150, type: 'expense', category: 'Food' },
  { label: 'Freelance', title: 'Freelance Milestone', amount: 10000, type: 'income', category: 'Salary / Freelance' },
];

const getTodayISO = () => new Date().toISOString().split('T')[0];

const getInitialSampleTransactions = () => {
  const daysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  };

  return [
    { id: 'swt-1', title: 'Monthly Stipend / Salary Income', amount: 45000, type: 'income', category: 'Salary / Freelance', date: daysAgo(14) },
    { id: 'swt-2', title: 'Hostel / Apartment Rent', amount: 14500, type: 'expense', category: 'Housing', date: daysAgo(12) },
    { id: 'swt-3', title: 'Freelance Web Project', amount: 18000, type: 'income', category: 'Salary / Freelance', date: daysAgo(9) },
    { id: 'swt-4', title: 'Groceries & Fresh Produce', amount: 4200, type: 'expense', category: 'Food', date: daysAgo(7) },
    { id: 'swt-5', title: 'Metro Card & Fuel', amount: 2150, type: 'expense', category: 'Transport', date: daysAgo(5) },
    { id: 'swt-6', title: 'Broadband & Mobile Plan', amount: 1299, type: 'expense', category: 'Utilities', date: daysAgo(4) },
    { id: 'swt-7', title: 'Online Course & Books', amount: 2800, type: 'expense', category: 'Education / Shopping', date: daysAgo(3) },
    { id: 'swt-8', title: 'Weekend Dinner & Movies', amount: 1850, type: 'expense', category: 'Entertainment', date: daysAgo(1) },
    { id: 'swt-9', title: 'Gym & Pharmacy', amount: 1600, type: 'expense', category: 'Health', date: daysAgo(0) },
  ];
};

// ============================================================================
// MAIN REACT APPLICATION COMPONENT
// ============================================================================

export default function App() {
  // --------------------------------------------------------------------------
  // 1. PERSISTENT APPLICATION STATE
  // --------------------------------------------------------------------------
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : getInitialSampleTransactions();
    } catch {
      return getInitialSampleTransactions();
    }
  });

  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
    return saved && CURRENCIES[saved] ? saved : 'INR';
  });

  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUDGET);
    const parsed = parseFloat(saved);
    return !isNaN(parsed) && parsed > 0 ? parsed : 60000;
  });

  // --------------------------------------------------------------------------
  // 2. UI & FORM STATE
  // --------------------------------------------------------------------------
  const [txType, setTxType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(getTodayISO);

  // Filters & Interactive Chart State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Quick Money Math Calculators State
  const [activeCalcTab, setActiveCalcTab] = useState('split');
  // Tab A: Bill Split & Tip
  const [splitBill, setSplitBill] = useState('2400');
  const [splitTip, setSplitTip] = useState('10');
  const [splitPeople, setSplitPeople] = useState('4');
  // Tab B: Loan EMI
  const [emiPrincipal, setEmiPrincipal] = useState('120000');
  const [emiRate, setEmiRate] = useState('9.5');
  const [emiMonths, setEmiMonths] = useState('12');
  // Tab C: Savings Goal
  const [goalTarget, setGoalTarget] = useState('200000');
  const [goalCurrent, setGoalCurrent] = useState('35000');
  const [goalMonthly, setGoalMonthly] = useState('15000');

  // Toast & Custom Confirmation Modal State
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null });

  // --------------------------------------------------------------------------
  // 3. DOCUMENT TITLE & LOCALSTORAGE SYNCHRONIZATION
  // --------------------------------------------------------------------------
  useEffect(() => {
    document.title = 'SMART WEALTH TRACKER — Personal Cashflow & Budget Planner';
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (err) {
      console.error('Failed to save transactions:', err);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
    } catch (err) {
      console.error('Failed to save currency:', err);
    }
  }, [currency]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGET, String(monthlyBudget));
    } catch (err) {
      console.error('Failed to save budget:', err);
    }
  }, [monthlyBudget]);

  // Helper: Trigger subtle toast notification
  const triggerToast = (message, tone = 'cyan') => {
    setToast({ id: Date.now(), message, tone });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  // --------------------------------------------------------------------------
  // 4. CURRENCY FORMATTER (Intl.NumberFormat)
  // --------------------------------------------------------------------------
  const formatCurrency = useMemo(() => {
    const cfg = CURRENCIES[currency] || CURRENCIES.INR;
    const isZeroDecimal = currency === 'JPY';
    const formatter = new Intl.NumberFormat(cfg.locale, {
      style: 'currency',
      currency: cfg.code,
      minimumFractionDigits: isZeroDecimal ? 0 : 2,
      maximumFractionDigits: isZeroDecimal ? 0 : 2,
    });
    return (val) => formatter.format(Number.isFinite(val) ? val : 0);
  }, [currency]);

  const currencySymbol = (CURRENCIES[currency] || CURRENCIES.INR).symbol;

  // --------------------------------------------------------------------------
  // 5. DERIVED FINANCIAL METRICS & CATEGORY ANALYTICS (useMemo)
  // --------------------------------------------------------------------------
  const metrics = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    for (const tx of transactions) {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
        incomeCount++;
      } else {
        totalExpense += tx.amount;
        expenseCount++;
      }
    }

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;
    const budgetUtilization = monthlyBudget > 0 ? (totalExpense / monthlyBudget) * 100 : 0;
    const isOverBudget = monthlyBudget > 0 && totalExpense > monthlyBudget;

    let healthStatus = { label: 'Healthy', badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' };
    if (totalIncome === 0 && totalExpense === 0) {
      healthStatus = { label: 'No Activity', badgeClass: 'bg-slate-800 text-slate-400 border-slate-700' };
    } else if (netBalance < 0) {
      healthStatus = { label: 'Deficit', badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30' };
    } else if (savingsRate >= 35) {
      healthStatus = { label: 'Excellent', badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
    } else if (savingsRate >= 15) {
      healthStatus = { label: 'Healthy', badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' };
    } else {
      healthStatus = { label: 'Low', badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
    }

    return {
      totalIncome,
      totalExpense,
      incomeCount,
      expenseCount,
      netBalance,
      savingsRate,
      budgetUtilization,
      isOverBudget,
      healthStatus,
    };
  }, [transactions, monthlyBudget]);

  // Expense Category Breakdown & Interactive SVG Donut Arcs
  const categoryBreakdown = useMemo(() => {
    const totals = {};
    let totalSpent = 0;

    for (const tx of transactions) {
      if (tx.type === 'expense') {
        totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
        totalSpent += tx.amount;
      }
    }

    const items = Object.entries(totals)
      .map(([cat, amt]) => ({
        category: cat,
        amount: amt,
        percentage: totalSpent > 0 ? (amt / totalSpent) * 100 : 0,
        color: (CATEGORIES[cat] || CATEGORIES.Other).color,
        icon: (CATEGORIES[cat] || CATEGORIES.Other).icon,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Precompute SVG stroke-dasharray / stroke-dashoffset segments
    const radius = 74;
    const circumference = 2 * Math.PI * radius;
    let cumulativeFraction = 0;

    const slices = items.map((item) => {
      const fraction = totalSpent > 0 ? item.amount / totalSpent : 0;
      const gap = items.length > 1 ? 3.5 : 0;
      const strokeLength = Math.max(0, fraction * circumference - gap);
      const strokeOffset = -cumulativeFraction * circumference;
      cumulativeFraction += fraction;

      return {
        ...item,
        radius,
        circumference,
        strokeLength,
        strokeOffset,
      };
    });

    return { items, slices, totalSpent, topCategory: items[0] || null };
  }, [transactions]);

  // Filtered Transaction History
  const filteredTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return transactions
      .filter((tx) => {
        const matchesQuery =
          !q || tx.title.toLowerCase().includes(q) || tx.category.toLowerCase().includes(q);
        const matchesType = filterType === 'all' || tx.type === filterType;
        const matchesCat = filterCategory === 'all' || tx.category === filterCategory;
        return matchesQuery && matchesType && matchesCat;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, searchQuery, filterType, filterCategory]);

  // --------------------------------------------------------------------------
  // 6. QUICK MONEY MATH CALCULATORS (useMemo)
  // --------------------------------------------------------------------------
  const splitResults = useMemo(() => {
    const bill = Math.max(0, parseFloat(splitBill) || 0);
    const tipPct = Math.max(0, parseFloat(splitTip) || 0);
    const people = Math.max(1, parseInt(splitPeople, 10) || 1);
    const tipAmount = bill * (tipPct / 100);
    const totalWithTip = bill + tipAmount;
    const perPerson = totalWithTip / people;
    return { tipAmount, totalWithTip, perPerson };
  }, [splitBill, splitTip, splitPeople]);

  const emiResults = useMemo(() => {
    const P = Math.max(0, parseFloat(emiPrincipal) || 0);
    const annualRate = Math.max(0, parseFloat(emiRate) || 0);
    const N = Math.max(1, parseInt(emiMonths, 10) || 1);

    let monthlyEmi = 0;
    if (annualRate === 0) {
      monthlyEmi = P / N;
    } else {
      const r = annualRate / 12 / 100;
      const factor = Math.pow(1 + r, N);
      monthlyEmi = (P * r * factor) / (factor - 1);
    }

    const totalPayment = monthlyEmi * N;
    const totalInterest = Math.max(0, totalPayment - P);
    return { monthlyEmi, totalInterest, totalPayment };
  }, [emiPrincipal, emiRate, emiMonths]);

  const goalResults = useMemo(() => {
    const target = Math.max(0, parseFloat(goalTarget) || 0);
    const current = Math.max(0, parseFloat(goalCurrent) || 0);
    const monthly = Math.max(1, parseFloat(goalMonthly) || 1);

    const remaining = Math.max(0, target - current);
    const monthsNeeded = remaining === 0 ? 0 : Math.ceil(remaining / monthly);

    const completionDate = new Date();
    completionDate.setMonth(completionDate.getMonth() + monthsNeeded);
    const formattedDate = completionDate.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });

    return { remaining, monthsNeeded, formattedDate };
  }, [goalTarget, goalCurrent, goalMonthly]);

  // --------------------------------------------------------------------------
  // 7. EVENT HANDLERS
  // --------------------------------------------------------------------------
  const handleSwitchType = (nextType) => {
    setTxType(nextType);
    if (nextType === 'income' && category !== 'Salary / Freelance') {
      setCategory('Salary / Freelance');
    } else if (nextType === 'expense' && category === 'Salary / Freelance') {
      setCategory('Food');
    }
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    const numericAmount = parseFloat(amount);

    if (!cleanTitle || isNaN(numericAmount) || numericAmount <= 0) {
      triggerToast('Please enter a valid title and positive amount.', 'rose');
      return;
    }

    const newTx = {
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: cleanTitle,
      amount: numericAmount,
      type: txType,
      category,
      date: date || getTodayISO(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    setTitle('');
    setAmount('');
    triggerToast(
      `${txType === 'income' ? 'Income' : 'Expense'} logged: ${formatCurrency(numericAmount)}`,
      txType === 'income' ? 'emerald' : 'cyan'
    );
  };

  const handleApplyPreset = (preset) => {
    setTxType(preset.type);
    setTitle(preset.title);
    setAmount(String(preset.amount));
    setCategory(preset.category);
    setDate(getTodayISO());
    triggerToast(`Preset "${preset.label}" loaded into form`, 'cyan');
  };

  const handlePrefillExpenseFromCalc = (calcTitle, calcAmount, calcCategory) => {
    if (!calcAmount || calcAmount <= 0) return;
    setTxType('expense');
    setTitle(calcTitle);
    setAmount(calcAmount.toFixed(2));
    setCategory(calcCategory);
    setDate(getTodayISO());
    triggerToast(`Prefilled "${calcTitle}" in transaction form`, 'cyan');
  };

  const handleDeleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
    triggerToast('Transaction deleted', 'rose');
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      triggerToast('No transactions to export.', 'rose');
      return;
    }

    const headers = ['Date', 'Title', 'Type', 'Category', `Amount (${currency})`];
    const rows = transactions.map((tx) => [
      tx.date,
      `"${tx.title.replace(/"/g, '""')}"`,
      tx.type.toUpperCase(),
      `"${tx.category}"`,
      tx.type === 'expense' ? -tx.amount : tx.amount,
    ]);

    const csvString = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'smart-wealth-tracker-report.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    triggerToast('Exported smart-wealth-tracker-report.csv', 'emerald');
  };

  const requestClearAll = () => {
    setConfirmDialog({
      open: true,
      title: 'Clear All Transactions?',
      message: 'This will remove all income and expense entries from your browser storage.',
      onConfirm: () => {
        setTransactions([]);
        setConfirmDialog({ open: false, title: '', message: '', onConfirm: null });
        triggerToast('All transactions cleared', 'rose');
      },
    });
  };

  const requestResetDemo = () => {
    setConfirmDialog({
      open: true,
      title: 'Reset to Demo Data?',
      message: 'Replace your current transaction list with sample realistic income and expense records?',
      onConfirm: () => {
        setTransactions(getInitialSampleTransactions());
        setConfirmDialog({ open: false, title: '', message: '', onConfirm: null });
        triggerToast('Demo dataset restored', 'emerald');
      },
    });
  };

  // Active center display for interactive SVG Donut
  const activeSlice = useMemo(() => {
    if (!hoveredCategory) return null;
    return categoryBreakdown.items.find((item) => item.category === hoveredCategory) || null;
  }, [hoveredCategory, categoryBreakdown.items]);

  // --------------------------------------------------------------------------
  // 8. RENDER UI
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      {/* Ambient Cyber-Fintech Background Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 shadow-2xl shadow-cyan-950/50 text-sm font-medium text-white animate-bounce">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              toast.tone === 'emerald'
                ? 'bg-emerald-400 shadow-[0_0_8px_#00e676]'
                : toast.tone === 'rose'
                ? 'bg-rose-400 shadow-[0_0_8px_#ff2a6d]'
                : 'bg-cyan-400 shadow-[0_0_8px_#00f3ff]'
            }`}
          />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0d1324] border border-slate-700/80 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">{confirmDialog.title}</h3>
            </div>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDialog({ open: false, title: '', message: '', onConfirm: null })}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-lg shadow-rose-600/25 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ==================================================================
            HEADER BAR
        ================================================================== */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 shrink-0">
              <Wallet className="w-6 h-6 text-slate-950 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  SMART WEALTH TRACKER
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  PRO
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Personal Cashflow & Budget Planner
              </p>
            </div>
          </div>

          {/* Header Controls: Monthly Budget Input, Currency Selector, CSV Export */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Editable Monthly Budget Limit */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 focus-within:border-cyan-400 rounded-xl px-3 py-2 transition">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                Budget ({currencySymbol}):
              </span>
              <input
                type="number"
                min="0"
                step="100"
                aria-label="Monthly Budget Limit"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-24 sm:w-28 bg-transparent font-mono text-sm font-bold text-cyan-300 focus:outline-none"
              />
            </div>

            {/* Multi-Currency Selector */}
            <select
              aria-label="Select Currency"
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                triggerToast(`Currency switched to ${e.target.value}`, 'cyan');
              }}
              className="bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/50 text-slate-100 text-sm font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition cursor-pointer"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-sm font-semibold transition shadow-lg shadow-cyan-950/30"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </header>

        {/* ==================================================================
            LIVE KPI SUMMARY DASHBOARD CARDS (4-Card Grid)
        ================================================================== */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {/* Card 1: Net Balance / Savings */}
          <div className="rounded-2xl bg-[#0d1324]/85 backdrop-blur-md border border-slate-800/90 hover:border-cyan-500/30 p-5 shadow-xl transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Net Balance / Savings
              </span>
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div
              className={`font-mono text-2xl font-extrabold tracking-tight truncate ${
                metrics.netBalance >= 0 ? 'text-white' : 'text-rose-400'
              }`}
            >
              {formatCurrency(metrics.netBalance)}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {metrics.netBalance >= 0 ? 'Surplus after all expenses' : 'Expenses exceed income'}
            </p>
          </div>

          {/* Card 2: Total Income */}
          <div className="rounded-2xl bg-[#0d1324]/85 backdrop-blur-md border border-slate-800/90 hover:border-emerald-500/30 p-5 shadow-xl transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Income
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="font-mono text-2xl font-extrabold text-emerald-400 tracking-tight truncate">
              {formatCurrency(metrics.totalIncome)}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Across <span className="font-mono text-slate-200">{metrics.incomeCount}</span> income{' '}
              {metrics.incomeCount === 1 ? 'entry' : 'entries'}
            </p>
          </div>

          {/* Card 3: Total Expenses + Budget Utilization Alert */}
          <div
            className={`rounded-2xl bg-[#0d1324]/85 backdrop-blur-md border p-5 shadow-xl transition ${
              metrics.isOverBudget
                ? 'border-rose-500/60 shadow-rose-950/30'
                : 'border-slate-800/90 hover:border-rose-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Expenses
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
                  metrics.isOverBudget
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {Math.round(metrics.budgetUtilization)}% Budget
              </span>
            </div>
            <div className="font-mono text-2xl font-extrabold text-rose-400 tracking-tight truncate">
              {formatCurrency(metrics.totalExpense)}
            </div>
            {metrics.isOverBudget ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 mt-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                <span>Over budget by {formatCurrency(metrics.totalExpense - monthlyBudget)}!</span>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-2">
                {formatCurrency(Math.max(0, monthlyBudget - metrics.totalExpense))} remaining of budget
              </p>
            )}
          </div>

          {/* Card 4: Savings Rate % + Animated Progress Bar + Health Badge */}
          <div className="rounded-2xl bg-[#0d1324]/85 backdrop-blur-md border border-slate-800/90 hover:border-purple-500/30 p-5 shadow-xl transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Savings Rate
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${metrics.healthStatus.badgeClass}`}
              >
                {metrics.healthStatus.label}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-2xl font-extrabold text-cyan-300">
                {metrics.savingsRate.toFixed(1)}%
              </span>
              <PiggyBank className="w-4 h-4 text-slate-400" />
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  metrics.savingsRate < 0
                    ? 'bg-rose-500'
                    : 'bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, metrics.savingsRate))}%` }}
              />
            </div>
          </div>
        </section>

        {/* ==================================================================
            MAIN WORKSPACE GRID (Left 5 Cols / Right 7 Cols)
        ================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Transaction Entry Form + Quick Money Math Calculators */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* 1. TRANSACTION ENTRY FORM */}
            <div className="rounded-2xl bg-[#0d1324]/85 backdrop-blur-md border border-slate-800/90 p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-cyan-400" />
                  <span>New Transaction</span>
                </h2>
                <span className="text-[11px] font-medium text-slate-400">Auto-saved to browser</span>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-4">
                {/* Expense / Income Toggle */}
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleSwitchType('expense')}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition ${
                      txType === 'expense'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    <span>Expense</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchType('income')}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition ${
                      txType === 'income'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Income</span>
                  </button>
                </div>

                {/* Title & Amount */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-7">
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Title / Description
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Dinner, Rent, Bonus"
                      className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Amount ({currencySymbol})
                    </label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="any"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition"
                    />
                  </div>
                </div>

                {/* Category & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-7">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition"
                    >
                      {Object.entries(CATEGORIES).map(([catName, meta]) => (
                        <option key={catName} value={catName}>
                          {meta.icon} {catName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* One-Click Quick Preset Pills */}
                <div>
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mb-2">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Quick Presets (Click to populate):</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                          preset.type === 'income'
                            ? 'bg-emerald-950/50 hover:bg-emerald-900/60 border-emerald-700/40 text-emerald-300'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                        }`}
                      >
                        {preset.label}{' '}
                        <span className="font-mono opacity-80">
                          {preset.type === 'income' ? '+' : ''}
                          {currencySymbol}
                          {preset.amount.toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition active:scale-[0.99]"
                >
                  + RECORD {txType.toUpperCase()}
                </button>
              </form>
            </div>

            {/* 2. BUILT-IN QUICK MONEY MATH CALCULATORS */}
            <div className="rounded-2xl bg-[#0d1324]/85 backdrop-blur-md border border-slate-800/90 p-5 sm:p-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-amber-400" />
                  <span>Money Math Tools</span>
                </h2>

                {/* Calculator Tabs */}
                <div className="flex bg-slate-950/90 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveCalcTab('split')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                      activeCalcTab === 'split'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Split className="w-3 h-3" />
                    <span>Split</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCalcTab('emi')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                      activeCalcTab === 'emi'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Landmark className="w-3 h-3" />
                    <span>EMI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCalcTab('goal')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                      activeCalcTab === 'goal'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Target className="w-3 h-3" />
                    <span>Goal</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: BILL SPLIT & TIP CALCULATOR */}
              {activeCalcTab === 'split' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Total Bill ({currencySymbol})
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={splitBill}
                        onChange={(e) => setSplitBill(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Tip %</label>
                      <input
                        type="number"
                        min="0"
                        max="200"
                        value={splitTip}
                        onChange={(e) => setSplitTip(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">People</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={splitPeople}
                        onChange={(e) => setSplitPeople(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-slate-400">
                        Per-Person Share
                      </div>
                      <div className="font-mono text-xl font-extrabold text-cyan-400">
                        {formatCurrency(splitResults.perPerson)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Tip: {formatCurrency(splitResults.tipAmount)} • Total:{' '}
                        {formatCurrency(splitResults.totalWithTip)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handlePrefillExpenseFromCalc(
                          'Split Bill Share',
                          splitResults.perPerson,
                          'Food'
                        )
                      }
                      className="px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition shrink-0"
                    >
                      Log Expense
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: LOAN EMI CALCULATOR */}
              {activeCalcTab === 'emi' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Principal ({currencySymbol})
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={emiPrincipal}
                        onChange={(e) => setEmiPrincipal(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Rate (% p.a)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={emiRate}
                        onChange={(e) => setEmiRate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Tenure (Mo)</label>
                      <input
                        type="number"
                        min="1"
                        max="360"
                        value={emiMonths}
                        onChange={(e) => setEmiMonths(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-slate-400">
                        Monthly EMI
                      </div>
                      <div className="font-mono text-xl font-extrabold text-amber-400">
                        {formatCurrency(emiResults.monthlyEmi)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Interest: {formatCurrency(emiResults.totalInterest)} • Total:{' '}
                        {formatCurrency(emiResults.totalPayment)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handlePrefillExpenseFromCalc(
                          'Monthly Loan EMI',
                          emiResults.monthlyEmi,
                          'Utilities'
                        )
                      }
                      className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition shrink-0"
                    >
                      Log EMI
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: SAVINGS GOAL PROJECTOR */}
              {activeCalcTab === 'goal' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Target ({currencySymbol})
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={goalTarget}
                        onChange={(e) => setGoalTarget(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Saved ({currencySymbol})
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={goalCurrent}
                        onChange={(e) => setGoalCurrent(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Monthly ({currencySymbol})
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={goalMonthly}
                        onChange={(e) => setGoalMonthly(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-slate-400">
                        Estimated Timeline
                      </div>
                      <div className="font-mono text-xl font-extrabold text-emerald-400">
                        {goalResults.monthsNeeded === 0
                          ? 'Goal Reached!'
                          : `${goalResults.monthsNeeded} ${
                              goalResults.monthsNeeded === 1 ? 'Month' : 'Months'
                            }`}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Remaining: {formatCurrency(goalResults.remaining)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center justify-end gap-1">
                        <Calendar className="w-3 h-3 text-emerald-400" />
                        <span>Target Date</span>
                      </div>
                      <div className="font-mono text-sm font-bold text-white mt-0.5">
                        {goalResults.formattedDate}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive SVG Donut Breakdown + Transaction History */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* 1. INTERACTIVE SVG DONUT CHART & CATEGORY LEGEND */}
            <div className="rounded-2xl bg-[#0d1324]/85 backdrop-blur-md border border-slate-800/90 p-5 sm:p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f3ff]" />
                    <span>Expense Category Breakdown</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Hover over chart slices or categories to inspect spending share
                  </p>
                </div>

                {categoryBreakdown.topCategory && (
                  <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-200">
                    Top: {categoryBreakdown.topCategory.icon}{' '}
                    {categoryBreakdown.topCategory.category} (
                    {categoryBreakdown.topCategory.percentage.toFixed(0)}%)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Interactive React SVG Donut */}
                <div className="md:col-span-5 relative flex items-center justify-center">
                  <svg
                    viewBox="0 0 200 200"
                    className="w-48 h-48 sm:w-52 sm:h-52 -rotate-90 overflow-visible"
                    aria-label="Expense Breakdown Donut Chart"
                  >
                    {/* Base Track Ring */}
                    <circle
                      cx="100"
                      cy="100"
                      r="74"
                      fill="transparent"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="22"
                    />

                    {/* Dynamic Category Slices */}
                    {categoryBreakdown.slices.map((slice) => {
                      const isHovered = hoveredCategory === slice.category;
                      return (
                        <circle
                          key={slice.category}
                          cx="100"
                          cy="100"
                          r={slice.radius}
                          fill="transparent"
                          stroke={slice.color}
                          strokeWidth={isHovered ? 26 : 22}
                          strokeDasharray={`${slice.strokeLength} ${slice.circumference}`}
                          strokeDashoffset={slice.strokeOffset}
                          strokeLinecap="round"
                          onMouseEnter={() => setHoveredCategory(slice.category)}
                          onMouseLeave={() => setHoveredCategory(null)}
                          style={{
                            filter: isHovered ? `drop-shadow(0 0 8px ${slice.color})` : 'none',
                            opacity:
                              hoveredCategory && !isHovered ? 0.45 : 1,
                          }}
                          className="cursor-pointer transition-all duration-200"
                        />
                      );
                    })}
                  </svg>

                  {/* Center Readout */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-6">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate max-w-[125px]">
                      {activeSlice ? activeSlice.category : 'Total Spent'}
                    </span>
                    <span className="font-mono text-base sm:text-lg font-extrabold text-white mt-0.5 truncate max-w-[130px]">
                      {formatCurrency(
                        activeSlice ? activeSlice.amount : categoryBreakdown.totalSpent
                      )}
                    </span>
                    {activeSlice && (
                      <span
                        className="font-mono text-xs font-bold mt-0.5"
                        style={{ color: activeSlice.color }}
                      >
                        {activeSlice.percentage.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Synchronized Legend List */}
                <div className="md:col-span-7 space-y-2 max-h-60 overflow-y-auto pr-1">
                  {categoryBreakdown.items.length === 0 ? (
                    <div className="text-center py-8 px-4 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-sm text-slate-400">
                      No expenses recorded yet. Add an expense to visualize category distribution.
                    </div>
                  ) : (
                    categoryBreakdown.items.map((item) => {
                      const isHovered = hoveredCategory === item.category;
                      return (
                        <div
                          key={item.category}
                          onMouseEnter={() => setHoveredCategory(item.category)}
                          onMouseLeave={() => setHoveredCategory(null)}
                          className={`p-2.5 rounded-xl border transition cursor-pointer ${
                            isHovered
                              ? 'bg-slate-800/90 border-slate-600'
                              : 'bg-slate-950/50 border-transparent hover:bg-slate-900/80'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-semibold text-slate-200 flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{
                                  backgroundColor: item.color,
                                  boxShadow: `0 0 8px ${item.color}`,
                                }}
                              />
                              <span>
                                {item.icon} {item.category}
                              </span>
                            </span>
                            <span className="font-mono font-bold text-slate-200">
                              {formatCurrency(item.amount)}{' '}
                              <span className="text-slate-400 font-normal">
                                ({item.percentage.toFixed(1)}%)
                              </span>
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${item.percentage}%`,
                                backgroundColor: item.color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* 2. TRANSACTION HISTORY LEDGER */}
            <div className="rounded-2xl bg-[#0d1324]/85 backdrop-blur-md border border-slate-800/90 p-5 sm:p-6 shadow-xl flex-1 flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Transaction History</span>
                  </h2>
                  <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-md bg-slate-800 text-cyan-300">
                    {filteredTransactions.length}
                  </span>
                </div>

                {/* Reset Demo Data & Clear All Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={requestResetDemo}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Reset Demo</span>
                  </button>
                  <button
                    type="button"
                    onClick={requestClearAll}
                    disabled={transactions.length === 0}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-40 border border-rose-500/30 text-xs font-semibold text-rose-300 transition"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Search & Filter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 mb-4">
                <div className="sm:col-span-5 relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search title or category..."
                    className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition"
                  />
                </div>
                <div className="sm:col-span-3">
                  <select
                    aria-label="Filter by Type"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none transition"
                  >
                    <option value="all">All Types</option>
                    <option value="income">Income (+)</option>
                    <option value="expense">Expense (−)</option>
                  </select>
                </div>
                <div className="sm:col-span-4">
                  <select
                    aria-label="Filter by Category"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none transition"
                  >
                    <option value="all">All Categories</option>
                    {Object.keys(CATEGORIES).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Transaction List */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-10 px-4 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800">
                    <p className="text-sm font-semibold text-slate-300 mb-1">
                      No matching transactions
                    </p>
                    <p className="text-xs text-slate-500">
                      Clear search filters or add a new income/expense entry on the left.
                    </p>
                  </div>
                ) : (
                  filteredTransactions.map((tx) => {
                    const meta = CATEGORIES[tx.category] || CATEGORIES.Other;
                    const isIncome = tx.type === 'income';
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/70 hover:bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border border-white/10"
                            style={{ backgroundColor: `${meta.color}1A` }}
                          >
                            {meta.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white truncate">
                              {tx.title}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                              <span className="truncate">{tx.category}</span>
                              <span>•</span>
                              <span className="font-mono text-[11px] text-slate-500">
                                {tx.date}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`font-mono text-sm sm:text-base font-bold ${
                              isIncome ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isIncome ? '+' : '−'}
                            {formatCurrency(tx.amount)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteTransaction(tx.id)}
                            aria-label={`Delete ${tx.title}`}
                            className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/15 transition"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}