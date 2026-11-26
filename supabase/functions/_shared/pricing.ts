export type PlanInterval = "month" | "quarter" | "semester" | "year";

export interface PlanDefinition {
  interval: PlanInterval;
  days: number;
  regularUsd: number;
  promoUsd: number;
  labelEs: string;
  labelEn: string;
}

export const PROMO_END_MS = Date.parse("2026-12-06T23:59:59+01:00");

export const PLAN_CATALOG: Record<PlanInterval, PlanDefinition> = {
  month: {
    interval: "month",
    days: 30,
    regularUsd: 25,
    promoUsd: 20,
    labelEs: "1 Mes",
    labelEn: "1 Month",
  },
  quarter: {
    interval: "quarter",
    days: 90,
    regularUsd: 70,
    promoUsd: 56,
    labelEs: "3 Meses",
    labelEn: "3 Months",
  },
  semester: {
    interval: "semester",
    days: 180,
    regularUsd: 135,
    promoUsd: 108,
    labelEs: "6 Meses",
    labelEn: "6 Months",
  },
  year: {
    interval: "year",
    days: 365,
    regularUsd: 250,
    promoUsd: 200,
    labelEs: "12 Meses",
    labelEn: "12 Months",
  },
};

export function isPlanInterval(value: unknown): value is PlanInterval {
  return typeof value === "string" && value in PLAN_CATALOG;
}

export function isLaunchPromoActive(nowMs = Date.now()): boolean {
  return nowMs <= PROMO_END_MS;
}

export interface SubscriptionRow {
  status?: string | null;
  trial_ends_at?: string | null;
  current_period_end?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
}

/**
 * Computes unused free trial days (capped at 7 days) so early adopters keep their
 * remaining trial time when subscribing before expiration.
 */
export function computeRemainingTrialDays(sub: SubscriptionRow | null, nowMs = Date.now()): number {
  if (!sub || sub.status !== "trialing" || !sub.trial_ends_at) return 0;
  const trialEndMs = Date.parse(sub.trial_ends_at);
  if (!Number.isFinite(trialEndMs) || trialEndMs <= nowMs) return 0;
  const diffDays = Math.ceil((trialEndMs - nowMs) / 86_400_000);
  return Math.max(0, Math.min(7, diffDays));
}

export function computeExtendedPeriodEndIso(
  existingSub: SubscriptionRow | null,
  planDays: number,
  nowMs = Date.now()
): string {
  let baseMs = nowMs;

  if (existingSub?.status === "active" && existingSub.current_period_end) {
    const activeEndMs = Date.parse(existingSub.current_period_end);
    if (Number.isFinite(activeEndMs) && activeEndMs > baseMs) {
      baseMs = activeEndMs;
    }
  } else {
    const bonusDays = computeRemainingTrialDays(existingSub, nowMs);
    baseMs += bonusDays * 86_400_000;
  }

  return new Date(baseMs + planDays * 86_400_000).toISOString();
}
