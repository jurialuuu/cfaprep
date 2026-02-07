
import { CFATopic, Flashcard, Question } from './types';

export const CFA_TOPICS: CFATopic[] = [
  {
    id: 'ethics',
    name: 'Ethics and Professional Standards',
    weightMin: 15,
    weightMax: 20,
    description: 'The foundation of the CFA program. Covers the Code of Ethics and Standards of Professional Conduct.',
    difficulty: 'High',
    estimatedHours: 40
  },
  {
    id: 'quant',
    name: 'Quantitative Methods',
    weightMin: 6,
    weightMax: 9,
    description: 'Time value of money, probability, statistics, and hypothesis testing.',
    difficulty: 'Medium',
    estimatedHours: 35
  },
  {
    id: 'econ',
    name: 'Economics',
    weightMin: 6,
    weightMax: 9,
    description: 'Microeconomics, Macroeconomics, and Monetary/Fiscal Policy.',
    difficulty: 'Medium',
    estimatedHours: 30
  },
  {
    id: 'fra',
    name: 'Financial Statement Analysis',
    weightMin: 11,
    weightMax: 14,
    description: 'Balance sheets, income statements, cash flow, and financial reporting standards.',
    difficulty: 'High',
    estimatedHours: 55
  },
  {
    id: 'corp',
    name: 'Corporate Issuers',
    weightMin: 6,
    weightMax: 9,
    description: 'Corporate governance, capital structure, and investment decisions.',
    difficulty: 'Low',
    estimatedHours: 25
  },
  {
    id: 'equity',
    name: 'Equity Investments',
    weightMin: 11,
    weightMax: 14,
    description: 'Market structure, indexes, and equity valuation techniques.',
    difficulty: 'Medium',
    estimatedHours: 35
  },
  {
    id: 'fixed',
    name: 'Fixed Income',
    weightMin: 11,
    weightMax: 14,
    description: 'Bond features, yields, valuation, and risk management.',
    difficulty: 'High',
    estimatedHours: 45
  },
  {
    id: 'deriv',
    name: 'Derivatives',
    weightMin: 5,
    weightMax: 8,
    description: 'Forwards, futures, options, and swaps.',
    difficulty: 'High',
    estimatedHours: 25
  },
  {
    id: 'alt',
    name: 'Alternative Investments',
    weightMin: 7,
    weightMax: 10,
    description: 'Real estate, private equity, hedge funds, and commodities.',
    difficulty: 'Low',
    estimatedHours: 20
  },
  {
    id: 'port',
    name: 'Portfolio Management',
    weightMin: 8,
    weightMax: 12,
    description: 'Portfolio construction, asset allocation, and risk management.',
    difficulty: 'Medium',
    estimatedHours: 30
  }
];

// Target November 2026 Exam (Estimated Window Start)
export const TARGET_EXAM_DATE = '2026-11-17';

// Registration Deadlines for November 2026 (Estimated)
export const REGISTRATION_DEADLINES = {
  earlyBird: '2026-05-12',
  standard: '2026-08-11'
};

export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 'q1',
    topicId: 'ethics',
    text: "According to the Code of Ethics, a CFA Institute member shall:",
    options: [
      "Always prioritize the interests of the employer over the client.",
      "Place the integrity of the investment profession and the interests of clients above their own personal interests.",
      "Guarantee a minimum investment return to clients in writing."
    ],
    correctIndex: 1,
    explanation: "Standard I(A) and the Code of Ethics emphasize that the integrity of the profession and client interests come first."
  },
  {
    id: 'q2',
    topicId: 'quant',
    text: "An analyst calculates the mean return of a portfolio to be 10% with a standard deviation of 5%. What is the coefficient of variation?",
    options: ["0.5", "2.0", "50%"],
    correctIndex: 0,
    explanation: "Coefficient of Variation (CV) = Standard Deviation / Mean = 5% / 10% = 0.5."
  },
  {
    id: 'q3',
    topicId: 'fra',
    text: "Under IFRS, which of the following is most likely classified as an operating activity on the Statement of Cash Flows?",
    options: [
      "Dividends paid.",
      "Taxes paid.",
      "Proceeds from the issuance of debt."
    ],
    correctIndex: 1,
    explanation: "Taxes paid are generally operating activities. Dividends paid can be operating or financing under IFRS, but taxes are the most 'likely' operating answer."
  }
];

export const SAMPLE_FLASHCARDS: Flashcard[] = [
  {
    id: 'f1',
    topicId: 'ethics',
    front: "Standard I(A): Knowledge of the Law",
    back: "Members must understand and comply with all applicable laws. In the event of conflict, comply with the more strict law/regulation."
  },
  {
    id: 'f2',
    topicId: 'quant',
    front: "Bayes' Formula",
    back: "P(A|B) = [P(B|A) / P(B)] * P(A). Used to update probabilities based on new information."
  },
  {
    id: 'f3',
    topicId: 'econ',
    front: "Normal Good vs. Inferior Good",
    back: "Normal Good: Demand increases as income increases. Inferior Good: Demand decreases as income increases."
  },
  {
    id: 'f4',
    topicId: 'fra',
    front: "LIFO vs. FIFO (Rising Prices)",
    back: "LIFO: Higher COGS, Lower Net Income, Lower Taxes, Lower Inventory. FIFO: Lower COGS, Higher Net Income, Higher Inventory."
  }
];
