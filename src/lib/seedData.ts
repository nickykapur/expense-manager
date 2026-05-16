// Seeds localStorage with initial data on first load.
// Only runs if stores are empty (never overwrites existing data).

const NOW = new Date().toISOString()

function seed(key: string, data: unknown) {
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify(data))
  }
}

export function seedIfEmpty() {
  // ── Paycheck: May 29 ────────────────────────────────────────────────
  seed('em-paychecks', {
    state: {
      paychecks: [
        {
          id: 'pc-may29',
          amount: 1800,
          date: '2026-05-29',
          label: 'May 29 paycheck',
          isArchived: false,
          notes: 'Bi-weekly — €1,800 every 2 weeks',
          allocations: [
            {
              id: 'al-loan1',
              name: 'Personal Loan (Banistmo)',
              amount: 203,
              category: 'loan',
              dueDate: '2026-06-01',
              isPaid: false,
              note: '13% · 31 payments left · ends Jan 2029',
            },
            {
              id: 'al-loan2',
              name: 'Student Loan',
              amount: 239,
              category: 'loan',
              dueDate: '2026-06-01',
              isPaid: false,
              note: '15yr term · lowest rate · let it run',
            },
            {
              id: 'al-crypto',
              name: 'Crypto (10%)',
              amount: 390,
              category: 'investment',
              isPaid: false,
              note: 'Monthly 10% — keep growing the position',
            },
            {
              id: 'al-cc',
              name: 'CC Payment Reserve',
              amount: 500,
              category: 'cc',
              dueDate: '2026-06-12',
              isPaid: false,
              note: 'Kuara installments — 6183 ($499) + 5585 ($33) · statement cut May 16',
            },
            {
              id: 'al-save',
              name: 'Savings top-up',
              amount: 300,
              category: 'savings',
              isPaid: false,
              note: 'Building to €1,000 buffer (currently €700)',
            },
            {
              id: 'al-buf',
              name: 'Living buffer',
              amount: 168,
              category: 'living',
              isPaid: false,
            },
          ],
        },
      ],
    },
    version: 1,
  })

  // ── Current month expenses ───────────────────────────────────────────
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
          note: 'Increases to €1,200 in July 2026',
        },
        {
          id: 'exp-loan',
          name: 'Personal Loan (Banistmo)',
          amount: 203.24,
          category: 'other',
          isRecurring: true,
          createdAt: NOW,
          note: '13% interest · $5,031 balance · 31 payments left',
        },
        {
          id: 'exp-student',
          name: 'Student Loan',
          amount: 239,
          category: 'other',
          isRecurring: true,
          createdAt: NOW,
          note: '15yr term · lowest rate · pay last',
        },
      ],
    },
    version: 1,
  })

  // ── Upcoming: CC payments & rent ────────────────────────────────────
  seed('em-upcoming', {
    state: {
      upcoming: [
        {
          id: 'up-cc-jun',
          name: 'CC Payment (both cards)',
          amount: 533,
          dueDate: '2026-06-12',
          category: 'other',
          priority: 'high',
          createdAt: NOW,
          note: '6183: $395 + $105 · 5585: $33 · statement closed May 16',
        },
        {
          id: 'up-rent-jun',
          name: 'June Rent',
          amount: 700,
          dueDate: '2026-06-22',
          category: 'housing',
          priority: 'high',
          createdAt: NOW,
        },
        {
          id: 'up-rent-jul',
          name: 'July Rent (increased)',
          amount: 1200,
          dueDate: '2026-07-22',
          category: 'housing',
          priority: 'high',
          createdAt: NOW,
          note: 'New rent amount from July — €500 increase',
        },
      ],
    },
    version: 1,
  })
}
