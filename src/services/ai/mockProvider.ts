// ============================================================
// KEYStone AI Trust Engine — Mock Provider
// Deterministic, keyword-based demo AI. No API key required.
// Safe for offline hackathon demo.
// ============================================================

import type {
  AIProvider,
  AIProjectInput,
  AIAnalysis,
  AIMilestoneSet,
  AIRequirementArea,
  AIRisk,
  AIHealthItem,
  AIScoreBreakdown,
  AIMilestone,
} from './types';

// ---- Heuristic helpers ----

function daysBetween(deadline: string): number {
  const now = new Date();
  const end = new Date(deadline);
  return Math.max(1, Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function budgetPerDay(budget: number, days: number): number {
  return budget / days;
}

function descriptionWords(desc: string): number {
  return desc.trim().split(/\s+/).filter(Boolean).length;
}

function containsAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

// ---- Scoring ----

function computeScores(input: AIProjectInput): AIScoreBreakdown {
  const words = descriptionWords(input.description);
  const days = daysBetween(input.deadline);
  const bpd = budgetPerDay(input.budget, days);
  const skillCount = input.skills.length;
  const hasMilestones = (input.milestones?.length ?? 0) > 0;
  const hasRequirements = (input.requirements?.trim().length ?? 0) > 20;
  const isAI = containsAny(input.description + input.title, ['ai', 'machine learning', 'recommendation', 'nlp', 'llm']);
  const isPayment = containsAny(input.description + input.title, ['payment', 'gateway', 'razorpay', 'stripe', 'upi']);
  const isAdmin = containsAny(input.description + input.title, ['admin', 'dashboard', 'panel']);

  // Scope clarity: based on word count, skill specificity
  let scopeClarity = Math.min(100, (words / 150) * 100);
  if (skillCount < 3) scopeClarity -= 15;
  if (isAI) scopeClarity -= 12;
  scopeClarity = Math.max(10, Math.round(scopeClarity));

  // Budget adequacy: rule of thumb ₹800/day minimum for complex work
  const minBpd = skillCount > 4 ? 1200 : 800;
  let budgetAdequacy = Math.min(100, (bpd / minBpd) * 100);
  if (isPayment) budgetAdequacy -= 8;
  budgetAdequacy = Math.max(10, Math.round(budgetAdequacy));

  // Timeline feasibility
  let timelineFeasibility = Math.min(100, (days / 25) * 100);
  if (skillCount > 4) timelineFeasibility -= 15;
  if (isAI) timelineFeasibility -= 15;
  if (isAdmin) timelineFeasibility -= 8;
  timelineFeasibility = Math.max(10, Math.round(timelineFeasibility));

  // Requirements completeness
  let reqComplete = hasRequirements ? 70 : 30;
  if (isPayment && !hasRequirements) reqComplete -= 10;
  if (isAI && !hasRequirements) reqComplete -= 12;
  reqComplete = Math.max(10, Math.round(reqComplete));

  // Milestone quality
  let milestoneQuality = hasMilestones ? 75 : 25;
  if (hasMilestones && (input.milestones?.length ?? 0) >= 3) milestoneQuality += 15;
  milestoneQuality = Math.min(100, Math.round(milestoneQuality));

  return { scopeClarity, budgetAdequacy, timelineFeasibility, requirementCompleteness: reqComplete, milestoneQuality };
}

function computeRiskScore(scores: AIScoreBreakdown): number {
  const avg = (scores.scopeClarity + scores.budgetAdequacy + scores.timelineFeasibility + scores.requirementCompleteness + scores.milestoneQuality) / 5;
  // Invert: low score = high risk
  return Math.round(100 - avg);
}

function riskLevel(score: number): 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' {
  if (score <= 30) return 'LOW';
  if (score <= 60) return 'MODERATE';
  if (score <= 80) return 'HIGH';
  return 'CRITICAL';
}

function computeConfidence(input: AIProjectInput): number {
  let conf = 40;
  if (descriptionWords(input.description) > 50) conf += 20;
  if (input.skills.length >= 3) conf += 10;
  if ((input.requirements?.trim().length ?? 0) > 20) conf += 15;
  if ((input.milestones?.length ?? 0) > 0) conf += 15;
  return Math.min(98, conf);
}

// ---- Risk Card Generator ----

function buildRisks(input: AIProjectInput, scores: AIScoreBreakdown): AIRisk[] {
  const risks: AIRisk[] = [];
  const days = daysBetween(input.deadline);
  const isAI = containsAny(input.description + input.title, ['ai', 'machine learning', 'recommendation', 'nlp', 'llm']);
  const isPayment = containsAny(input.description + input.title, ['payment', 'gateway', 'razorpay', 'stripe', 'upi']);

  if (scores.timelineFeasibility < 50) {
    risks.push({
      id: 'r_timeline',
      type: 'timeline',
      severity: scores.timelineFeasibility < 30 ? 'critical' : 'high',
      title: 'Timeline Risk',
      description: `${days} days may be aggressive for the requested feature set.`,
      recommendation: `Consider increasing the timeline to ${Math.round(days * 1.8)}–${Math.round(days * 2.2)} days or reducing the initial scope.`,
    });
  }

  if (scores.scopeClarity < 55) {
    risks.push({
      id: 'r_scope',
      type: 'scope',
      severity: scores.scopeClarity < 35 ? 'high' : 'medium',
      title: 'Scope Risk',
      description: 'The project description covers multiple major features without sufficient detail on each.',
      recommendation: 'Break down each major feature into specific deliverables with measurable outcomes.',
    });
  }

  if (scores.budgetAdequacy < 60) {
    risks.push({
      id: 'r_budget',
      type: 'budget',
      severity: scores.budgetAdequacy < 40 ? 'high' : 'medium',
      title: 'Budget Risk',
      description: `₹${input.budget.toLocaleString()} may be insufficient for the requested complexity and timeline.`,
      recommendation: 'Consider increasing the budget or splitting the project into a phased engagement.',
    });
  }

  if (isAI) {
    risks.push({
      id: 'r_ai_reqs',
      type: 'requirements',
      severity: 'medium',
      title: 'AI Feature Ambiguity',
      description: 'AI-powered features are mentioned but the expected behavior, data source, and output format are not defined.',
      recommendation: 'Define what data will power the AI, what output is expected, and what "good" looks like for this feature.',
    });
  }

  if (isPayment && scores.requirementCompleteness < 60) {
    risks.push({
      id: 'r_payment',
      type: 'requirements',
      severity: 'medium',
      title: 'Payment Integration Risk',
      description: 'Payment gateway integration is mentioned without specifying flows, failure handling, or refund logic.',
      recommendation: 'Define payment success/failure states, refund handling, and webhook behavior before work begins.',
    });
  }

  if (scores.requirementCompleteness < 45) {
    risks.push({
      id: 'r_criteria',
      type: 'clarity',
      severity: 'medium',
      title: 'Missing Acceptance Criteria',
      description: 'No clear acceptance criteria are defined for the milestone deliverables.',
      recommendation: 'Define measurable criteria for each feature (e.g., "User can complete checkout in under 3 steps").',
    });
  }

  return risks;
}

// ---- Missing Requirements ----

function buildMissingRequirements(input: AIProjectInput): AIRequirementArea[] {
  const areas: AIRequirementArea[] = [];
  const text = (input.description + ' ' + (input.requirements ?? '') + ' ' + input.title).toLowerCase();

  const checks: { key: string; area: string; question: string; suggestions: string[] }[] = [
    {
      key: 'auth',
      area: 'User Authentication',
      question: 'How should users authenticate?',
      suggestions: ['Email + Password', 'Google / Social OAuth', 'OTP-based login', 'No auth required'],
    },
    {
      key: 'payment',
      area: 'Payment Method',
      question: 'Which payment methods should be supported?',
      suggestions: ['Razorpay (UPI, Cards, Netbanking)', 'Stripe', 'COD only', 'Multiple gateways'],
    },
    {
      key: 'admin',
      area: 'Admin Panel',
      question: 'What admin capabilities are required?',
      suggestions: ['View all orders/users', 'CRUD operations', 'Analytics dashboard', 'No admin panel needed'],
    },
    {
      key: 'notification',
      area: 'Notification System',
      question: 'How should users be notified?',
      suggestions: ['Email notifications', 'Push notifications', 'SMS alerts', 'In-app only'],
    },
    {
      key: 'mobile',
      area: 'Platform / Device Scope',
      question: 'What platforms need to be supported?',
      suggestions: ['Web only (responsive)', 'React Native mobile app', 'Both web and mobile', 'Progressive Web App'],
    },
    {
      key: 'api',
      area: 'Third-Party Integrations',
      question: 'Are any external APIs or services required?',
      suggestions: ['Google Maps / Location', 'SMS gateway (Twilio)', 'Email service (SendGrid)', 'None'],
    },
    {
      key: 'deploy',
      area: 'Deployment & Hosting',
      question: 'Where should the application be deployed?',
      suggestions: ['Vercel / Netlify (frontend)', 'AWS / GCP', 'Client\'s own server', 'Not specified yet'],
    },
  ];

  for (const check of checks) {
    const mentioned = text.includes(check.key) ||
      (check.key === 'auth' && (text.includes('login') || text.includes('register') || text.includes('authentication'))) ||
      (check.key === 'admin' && (text.includes('dashboard') || text.includes('admin'))) ||
      (check.key === 'notification' && (text.includes('notif') || text.includes('alert') || text.includes('email'))) ||
      (check.key === 'mobile' && (text.includes('mobile') || text.includes('responsive') || text.includes('app'))) ||
      (check.key === 'payment' && (text.includes('pay') || text.includes('checkout') || text.includes('cart')));

    if (!mentioned || (input.requirements?.trim().length ?? 0) < 30) {
      areas.push({ id: `req_${check.key}`, area: check.area, question: check.question, suggestions: check.suggestions, resolved: false });
    }
  }

  return areas.slice(0, 6); // Return at most 6
}

// ---- Health Items ----

function buildHealthItems(scores: AIScoreBreakdown): AIHealthItem[] {
  const toStatus = (s: number): 'healthy' | 'warning' | 'critical' =>
    s >= 65 ? 'healthy' : s >= 40 ? 'warning' : 'critical';

  return [
    { label: 'Requirement Clarity', status: toStatus(scores.requirementCompleteness) },
    { label: 'Budget', status: toStatus(scores.budgetAdequacy) },
    { label: 'Timeline', status: toStatus(scores.timelineFeasibility) },
    { label: 'Technical Scope', status: toStatus(scores.scopeClarity) },
  ];
}

// ---- Milestone Generator ----

function generateMilestonesForInput(input: AIProjectInput): AIMilestone[] {
  const days = daysBetween(input.deadline);
  const budget = input.budget;
  const text = (input.description + ' ' + input.title).toLowerCase();
  const isEcom = containsAny(text, ['ecommerce', 'e-commerce', 'shop', 'cart', 'checkout', 'product']);
  const isApp = containsAny(text, ['app', 'mobile', 'ios', 'android']);
  const isSaaS = containsAny(text, ['saas', 'dashboard', 'analytics', 'platform', 'b2b']);
  const isFood = containsAny(text, ['food', 'delivery', 'restaurant', 'order']);

  if (isEcom) {
    const q = Math.round(budget / 4);
    const d = Math.round(days / 4);
    return [
      { id: 'ms_ai_1', title: 'Foundation & Authentication', description: 'Core infrastructure, database setup, and user authentication system.', dayStart: 1, dayEnd: d, suggestedAmount: q, deliverables: ['Authentication system', 'Database schema', 'Base UI components', 'Project scaffolding'], acceptanceCriteria: ['User can register and login with email/password', 'Protected routes redirect unauthenticated users', 'Responsive base layout renders on mobile and desktop'] },
      { id: 'ms_ai_2', title: 'Product Catalog & Core Shopping', description: 'Product listing, search, detail pages, and shopping cart functionality.', dayStart: d + 1, dayEnd: d * 2, suggestedAmount: q, deliverables: ['Product listing page', 'Product detail page', 'Search and filter', 'Shopping cart'], acceptanceCriteria: ['Products display with images and prices', 'User can add/remove items from cart', 'Cart persists across page refreshes', 'Search returns relevant results'] },
      { id: 'ms_ai_3', title: 'Checkout & Payments', description: 'Complete checkout flow with payment gateway integration and order management.', dayStart: d * 2 + 1, dayEnd: d * 3, suggestedAmount: q, deliverables: ['Checkout flow', 'Payment gateway integration', 'Order creation', 'Order history'], acceptanceCriteria: ['User can complete checkout in under 4 steps', 'Payment success creates an order record', 'Order confirmation email is sent', 'User can view past orders'] },
      { id: 'ms_ai_4', title: 'Admin Panel & Final Delivery', description: 'Admin dashboard, testing, bug fixes, and production deployment.', dayStart: d * 3 + 1, dayEnd: days, suggestedAmount: budget - q * 3, deliverables: ['Admin dashboard', 'Product management', 'Order management', 'Production deployment'], acceptanceCriteria: ['Admin can view all orders', 'Admin can add/edit/delete products', 'Application is deployed and accessible via public URL', 'Zero critical errors in production'] },
    ];
  }

  if (isFood) {
    const q = Math.round(budget / 4);
    const d = Math.round(days / 4);
    return [
      { id: 'ms_ai_1', title: 'Platform Setup & Authentication', description: 'Database, API scaffolding, and multi-role authentication.', dayStart: 1, dayEnd: d, suggestedAmount: q, deliverables: ['Multi-role auth (customer, restaurant, admin)', 'Database schema', 'API scaffolding'], acceptanceCriteria: ['Customer can register and login', 'Restaurant can register and login', 'Roles are properly separated and access-controlled'] },
      { id: 'ms_ai_2', title: 'Restaurant & Menu Management', description: 'Restaurant listings, menu management, and item browsing.', dayStart: d + 1, dayEnd: d * 2, suggestedAmount: q, deliverables: ['Restaurant listing', 'Menu management', 'Search and filter'], acceptanceCriteria: ['Customer can browse restaurants and menus', 'Restaurant can add/edit/delete menu items', 'Items display with correct pricing'] },
      { id: 'ms_ai_3', title: 'Order Flow & Payments', description: 'Placing orders, order tracking, and payment integration.', dayStart: d * 2 + 1, dayEnd: d * 3, suggestedAmount: q, deliverables: ['Order placement', 'Order tracking', 'Payment integration', 'Notification system'], acceptanceCriteria: ['Customer can place and pay for an order', 'Order status updates in real-time', 'Restaurant receives order notification', 'Customer receives delivery confirmation'] },
      { id: 'ms_ai_4', title: 'Admin Panel & Deployment', description: 'Governance dashboard and production deployment.', dayStart: d * 3 + 1, dayEnd: days, suggestedAmount: budget - q * 3, deliverables: ['Admin analytics', 'User management', 'Production deployment'], acceptanceCriteria: ['Admin can view platform analytics', 'Admin can manage users and restaurants', 'Platform is live and accessible'] },
    ];
  }

  if (isSaaS) {
    const q = Math.round(budget / 4);
    const d = Math.round(days / 4);
    return [
      { id: 'ms_ai_1', title: 'Infrastructure & Auth', description: 'SaaS foundation with multi-tenant authentication.', dayStart: 1, dayEnd: d, suggestedAmount: q, deliverables: ['Multi-tenant architecture', 'Auth system', 'Base dashboard shell'], acceptanceCriteria: ['Users can register an organization', 'Team members can be invited', 'Role-based access control works'] },
      { id: 'ms_ai_2', title: 'Core Feature Set', description: 'Primary platform features and data models.', dayStart: d + 1, dayEnd: d * 2, suggestedAmount: Math.round(q * 1.2), deliverables: ['Core data models', 'Primary CRUD operations', 'Real-time updates'], acceptanceCriteria: ['Core workflow is completable end-to-end', 'Data persists correctly', 'UI is responsive'] },
      { id: 'ms_ai_3', title: 'Analytics & Reporting', description: 'Dashboard metrics, charts, and data export.', dayStart: d * 2 + 1, dayEnd: d * 3, suggestedAmount: q, deliverables: ['Analytics dashboard', 'Chart components', 'Data export (CSV)'], acceptanceCriteria: ['Key metrics are displayed accurately', 'Charts update with real data', 'Export produces correct CSV'] },
      { id: 'ms_ai_4', title: 'Testing, Polish & Launch', description: 'QA, performance, billing integration, deployment.', dayStart: d * 3 + 1, dayEnd: days, suggestedAmount: budget - q * 3 - Math.round(q * 0.2), deliverables: ['Testing suite', 'Performance optimization', 'Production deployment'], acceptanceCriteria: ['No critical bugs in core workflows', 'Page load under 2 seconds', 'App is production-deployed'] },
    ];
  }

  // Generic fallback
  const third = Math.round(budget / 3);
  const thirdDay = Math.round(days / 3);
  return [
    { id: 'ms_ai_1', title: 'Discovery & Foundation', description: 'Core architecture, authentication, and foundational UI.', dayStart: 1, dayEnd: thirdDay, suggestedAmount: third, deliverables: ['Architecture setup', 'Authentication', 'Base UI', 'Core data models'], acceptanceCriteria: ['Application bootstraps without errors', 'Authentication works correctly', 'Core UI components are in place'] },
    { id: 'ms_ai_2', title: 'Core Feature Development', description: 'Primary feature implementation and integration.', dayStart: thirdDay + 1, dayEnd: thirdDay * 2, suggestedAmount: third, deliverables: ['Primary features', 'API integrations', 'Unit tests'], acceptanceCriteria: ['Core features are functional end-to-end', 'APIs integrate correctly', 'Error states are handled'] },
    { id: 'ms_ai_3', title: 'Delivery & Deployment', description: 'QA, refinement, and production deployment.', dayStart: thirdDay * 2 + 1, dayEnd: days, suggestedAmount: budget - third * 2, deliverables: ['Bug fixes', 'Performance optimization', 'Production deployment', 'Documentation'], acceptanceCriteria: ['No blocking bugs', 'Application is deployed to production', 'Basic documentation is provided'] },
  ];
}

// ---- Summary ----

function buildSummary(input: AIProjectInput, riskScore: number, risks: AIRisk[]): string {
  const level = riskLevel(riskScore);
  const days = daysBetween(input.deadline);
  const criticals = risks.filter((r) => r.severity === 'critical' || r.severity === 'high');

  if (level === 'LOW') {
    return `Your project is well-defined with a realistic budget and timeline. KEYStone AI recommends proceeding to milestone definition.`;
  }
  if (level === 'MODERATE') {
    return `Your project is feasible but has ${criticals.length} areas that need clarification. Addressing these before funding will significantly reduce dispute risk.`;
  }
  if (level === 'HIGH') {
    return `Your project carries ${riskScore}/100 risk. The ${days}-day timeline is aggressive and key requirements are not sufficiently defined. We recommend resolving the identified issues before committing funds.\n\nWe recommend:\n1. ${risks[0]?.recommendation || 'Extend the timeline.'}\n2. ${risks[1]?.recommendation || 'Define acceptance criteria.'}\n3. Split delivery into ${days > 20 ? 4 : 3} milestones.`;
  }
  return `Your project is in a critical risk state. Multiple core parameters (timeline, budget, requirements) need significant revision before work can begin safely.`;
}

function buildRecommendations(risks: AIRisk[]): string[] {
  return risks.map((r) => r.recommendation).slice(0, 5);
}

// ============================================================
// Mock Provider Implementation
// ============================================================

async function simulateDelay(ms: number = 1800): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockProvider: AIProvider = {
  async analyzeProject(input: AIProjectInput): Promise<AIAnalysis> {
    await simulateDelay(2000);

    const scores = computeScores(input);
    const rScore = computeRiskScore(scores);
    const risks = buildRisks(input, scores);
    const missing = buildMissingRequirements(input);
    const health = buildHealthItems(scores);
    const issueCount = risks.filter((r) => r.severity === 'high' || r.severity === 'critical').length + missing.length;
    const overallHealth = rScore <= 40 ? 'ready' : rScore <= 65 ? 'needs_attention' : 'critical';

    return {
      riskScore: rScore,
      riskLevel: riskLevel(rScore),
      confidence: computeConfidence(input),
      analyzedAt: new Date().toISOString(),
      analysisVersion: '1.0.0',
      summary: buildSummary(input, rScore, risks),
      scoreBreakdown: scores,
      risks,
      missingRequirements: missing,
      recommendations: buildRecommendations(risks),
      healthItems: health,
      overallHealth,
      issueCount,
    };
  },

  async generateMilestones(input: AIProjectInput): Promise<AIMilestoneSet> {
    await simulateDelay(1500);
    const milestones = generateMilestonesForInput(input);
    return {
      milestones,
      totalDays: daysBetween(input.deadline),
      totalBudget: input.budget,
      generatedAt: new Date().toISOString(),
    };
  },

  async analyzeRequirements(input: AIProjectInput): Promise<AIRequirementArea[]> {
    await simulateDelay(800);
    return buildMissingRequirements(input);
  },

  async generateRiskSummary(input: AIProjectInput): Promise<string> {
    await simulateDelay(500);
    const scores = computeScores(input);
    const rScore = computeRiskScore(scores);
    const risks = buildRisks(input, scores);
    return buildSummary(input, rScore, risks);
  },
};
