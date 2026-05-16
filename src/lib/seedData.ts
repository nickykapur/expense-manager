// Seeds localStorage with initial data on first load.
// Only runs if stores are empty (never overwrites existing data).

const NOW = new Date().toISOString()

function seed(key: string, data: unknown) {
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify(data))
  }
}

export function seedIfEmpty() {

  // ── Paychecks ────────────────────────────────────────────────────────
  seed('em-paychecks', {
    state: {
      paychecks: [
        // May 15 — already received, archived
        {
          id: 'pc-may15',
          amount: 1800,
          date: '2026-05-15',
          label: 'May 15 paycheck',
          isArchived: true,
          notes: 'Received. Covered May 22 rent + savings top-up.',
          allocations: [
            {
              id: 'al-may15-rent',
              name: 'May Rent',
              amount: 700,
              category: 'rent',
              dueDate: '2026-05-22',
              isPaid: true,
            },
            {
              id: 'al-may15-save',
              name: 'Savings (emergency buffer)',
              amount: 700,
              category: 'savings',
              isPaid: true,
              note: 'Current savings balance: €700 — target €1,000',
            },
            {
              id: 'al-may15-buf',
              name: 'Living buffer',
              amount: 400,
              category: 'living',
              isPaid: true,
            },
          ],
        },

        // May 29 — next paycheck
        {
          id: 'pc-may29',
          amount: 1800,
          date: '2026-05-29',
          label: 'May 29 paycheck',
          isArchived: false,
          notes: 'CC statement cut May 16 — payment due June 12. Rent due June 22.',
          allocations: [
            {
              id: 'al-may29-loan1',
              name: 'Personal Loan — Banistmo',
              amount: 203.24,
              category: 'loan',
              dueDate: '2026-06-01',
              isPaid: false,
              note: '13% interest · $5,031 balance · 31 payments left · ends Jan 2029',
            },
            {
              id: 'al-may29-loan2',
              name: 'Student Loan',
              amount: 239,
              category: 'loan',
              dueDate: '2026-06-01',
              isPaid: false,
              note: '15yr term · lowest interest rate · strategy: pay last',
            },
            {
              id: 'al-may29-crypto',
              name: 'Crypto investment (10%)',
              amount: 390,
              category: 'investment',
              isPaid: false,
              note: 'Keep at 10% — position up from €6,800 → €8,000. Don\'t reduce.',
            },
            {
              id: 'al-may29-cc',
              name: 'CC installments reserve',
              amount: 533,
              category: 'cc',
              dueDate: '2026-06-12',
              isPaid: false,
              note: '6183: $395.06 (Compra Extra) + $104.77 (Intra) · 5585: $33.33 (Intra 56mo) · Plus May statement new charges on top',
            },
            {
              id: 'al-may29-save',
              name: 'Savings top-up',
              amount: 300,
              category: 'savings',
              isPaid: false,
              note: 'Brings emergency buffer to €1,000. Crypto €8,000 is secondary safety net.',
            },
            {
              id: 'al-may29-buf',
              name: 'Living buffer',
              amount: 134.76,
              category: 'living',
              isPaid: false,
              note: 'Use CC for daily spending — this is cash reserve only',
            },
          ],
        },

        // June 12 — preview
        {
          id: 'pc-jun12',
          amount: 1800,
          date: '2026-06-12',
          label: 'June 12 paycheck',
          isArchived: false,
          notes: 'CC payment due TODAY (Jun 12). Rent due Jun 22. Tight paycheck — stay disciplined.',
          allocations: [
            {
              id: 'al-jun12-cc',
              name: 'CC payment — both cards',
              amount: 533,
              category: 'cc',
              dueDate: '2026-06-12',
              isPaid: false,
              note: 'Fixed installments $533 + May statement new charges. Check Kuara app for exact total.',
            },
            {
              id: 'al-jun12-rent',
              name: 'June Rent',
              amount: 700,
              category: 'rent',
              dueDate: '2026-06-22',
              isPaid: false,
            },
            {
              id: 'al-jun12-save',
              name: 'Savings',
              amount: 200,
              category: 'savings',
              isPaid: false,
              note: 'Brings buffer toward €1,200',
            },
            {
              id: 'al-jun12-buf',
              name: 'Living buffer',
              amount: 367,
              category: 'living',
              isPaid: false,
            },
          ],
        },

        // June 26 — preview
        {
          id: 'pc-jun26',
          amount: 1800,
          date: '2026-06-26',
          label: 'June 26 paycheck',
          isArchived: false,
          notes: 'Last paycheck before July rent increase to €1,200.',
          allocations: [
            {
              id: 'al-jun26-loan1',
              name: 'Personal Loan — Banistmo',
              amount: 203.24,
              category: 'loan',
              dueDate: '2026-07-01',
              isPaid: false,
              note: '13% · ~30 payments left after this',
            },
            {
              id: 'al-jun26-loan2',
              name: 'Student Loan',
              amount: 239,
              category: 'loan',
              dueDate: '2026-07-01',
              isPaid: false,
            },
            {
              id: 'al-jun26-crypto',
              name: 'Crypto (10%)',
              amount: 390,
              category: 'investment',
              isPaid: false,
            },
            {
              id: 'al-jun26-cc',
              name: 'CC installments reserve',
              amount: 533,
              category: 'cc',
              dueDate: '2026-07-12',
              isPaid: false,
              note: 'For July 12 CC payment',
            },
            {
              id: 'al-jun26-buf',
              name: 'Living buffer',
              amount: 434.76,
              category: 'living',
              isPaid: false,
              note: 'Enjoy some breathing room before July rent hits',
            },
          ],
        },

        // July 10 — first paycheck with new rent
        {
          id: 'pc-jul10',
          amount: 1800,
          date: '2026-07-10',
          label: 'July 10 paycheck',
          isArchived: false,
          notes: '⚠ July rent increases to €1,200. This paycheck is tight.',
          allocations: [
            {
              id: 'al-jul10-rent',
              name: 'July Rent — INCREASED',
              amount: 1200,
              category: 'rent',
              dueDate: '2026-07-22',
              isPaid: false,
              note: '€500 more than before — budget tightens from here',
            },
            {
              id: 'al-jul10-crypto',
              name: 'Crypto (10%)',
              amount: 390,
              category: 'investment',
              isPaid: false,
            },
            {
              id: 'al-jul10-buf',
              name: 'Living buffer',
              amount: 210,
              category: 'living',
              isPaid: false,
            },
          ],
        },
      ],
    },
    version: 1,
  })

  // ── Current month recurring expenses ─────────────────────────────────
  seed('em-expenses', {
    state: {
      expenses: [
        {
          id: 'exp-rent',
          name: 'Rent',
          amount: 700,
          category: 'housing',
          isRecurring: true,
          createdAt: NOW,
          note: '⚠ Increases to €1,200 in July 2026 — €500/mo more',
        },
        {
          id: 'exp-loan-banistmo',
          name: 'Personal Loan — Banistmo',
          amount: 203.24,
          category: 'other',
          isRecurring: true,
          createdAt: NOW,
          note: '13% interest · Balance $5,031 · 31 payments left · Payoff ~Jan 2029',
        },
        {
          id: 'exp-student',
          name: 'Student Loan',
          amount: 239,
          category: 'other',
          isRecurring: true,
          createdAt: NOW,
          note: '15yr term · Lowest interest rate · Strategy: let it run, pay last',
        },
        {
          id: 'exp-cc-6183a',
          name: 'CC 6183 — Compra Extra Manual',
          amount: 395.06,
          category: 'other',
          isRecurring: true,
          createdAt: NOW,
          note: 'Balance $3,708 · 10 months left · Ends ~Mar 2027 · 19.95%',
        },
        {
          id: 'exp-cc-6183b',
          name: 'CC 6183 — Intra Compra de Saldo',
          amount: 104.77,
          category: 'other',
          isRecurring: true,
          createdAt: NOW,
          note: 'Balance $1,050 · 12 months left · Ends ~May 2027',
        },
        {
          id: 'exp-cc-5585',
          name: 'CC 5585 — Intra Compra de Saldo',
          amount: 33.33,
          category: 'other',
          isRecurring: true,
          createdAt: NOW,
          note: 'Balance $1,867 · 56 months left · Ends ~Jan 2031 · Attack Oct 2027 with freed $500',
        },
      ],
    },
    version: 1,
  })

  // ── Upcoming obligations ──────────────────────────────────────────────
  seed('em-upcoming', {
    state: {
      upcoming: [
        {
          id: 'up-cc-jun12',
          name: 'CC payment — Kuara both cards',
          amount: 533,
          dueDate: '2026-06-12',
          category: 'other',
          priority: 'high',
          createdAt: NOW,
          note: 'Fixed installments: 6183 ($395.06 + $104.77) + 5585 ($33.33) = $533.16 · PLUS new charges from May 1–16 statement',
        },
        {
          id: 'up-rent-jun',
          name: 'June Rent',
          amount: 700,
          dueDate: '2026-06-22',
          category: 'housing',
          priority: 'high',
          createdAt: NOW,
          note: 'Last month at €700 — July goes to €1,200',
        },
        {
          id: 'up-cc-jul12',
          name: 'CC payment — Kuara both cards',
          amount: 533,
          dueDate: '2026-07-12',
          category: 'other',
          priority: 'high',
          createdAt: NOW,
          note: 'Same installments + June statement new charges',
        },
        {
          id: 'up-rent-jul',
          name: 'July Rent — INCREASED',
          amount: 1200,
          dueDate: '2026-07-22',
          category: 'housing',
          priority: 'high',
          createdAt: NOW,
          note: '⚠ €500 jump from June. Budget tightens significantly from here.',
        },
        {
          id: 'up-banistmo-jun',
          name: 'Personal Loan — Banistmo',
          amount: 203.24,
          dueDate: '2026-06-01',
          category: 'other',
          priority: 'high',
          createdAt: NOW,
          note: 'Monthly installment · 13% · $5,031 remaining',
        },
      ],
    },
    version: 1,
  })

  // ── Crypto holdings ───────────────────────────────────────────────────
  seed('em-crypto', {
    state: {
      holdings: [
        {
          id: 'crypto-main',
          symbol: '???',
          name: 'Sign-on bonus investment',
          amountHeld: 0,
          costBasisPerUnit: 0,
          currentPricePerUnit: 0,
          walletLabel: 'Update with your holdings',
          notes: 'Invested €6,800 (sign-on bonus) · Now worth ~€8,000 · UP €1,200 · DO NOT TOUCH — strategy: hold and add 10%/month (€390)',
          createdAt: NOW,
          lastUpdated: NOW,
        },
      ],
    },
    version: 1,
  })
}
