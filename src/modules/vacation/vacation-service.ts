import {
  VacationPause,
  CreateVacationInput,
  CreateVacationSchema,
} from "./vacation-schema";

const vacationStore = new Map<string, VacationPause>();

export class VacationService {
  /**
   * Schedules a vacation pause window
   */
  static async createVacation(rawInput: unknown): Promise<VacationPause> {
    const validated = CreateVacationSchema.parse(rawInput);
    const vacationId = `vac_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date().toISOString();

    const vacation: VacationPause = {
      id: vacationId,
      customerId: validated.customerId,
      householdId: validated.householdId,
      startDate: validated.startDate,
      endDate: validated.endDate,
      subscriptionIds: validated.subscriptionIds,
      reason: validated.reason,
      status: "ACTIVE",
      createdAt: now,
    };

    vacationStore.set(vacationId, vacation);
    return vacation;
  }

  /**
   * Determines if a specific subscription is suppressed on a given date due to active vacation
   */
  static isSubscriptionPausedOnDate(
    customerId: string,
    subscriptionId: string,
    serviceDate: string
  ): boolean {
    for (const vac of vacationStore.values()) {
      if (vac.customerId !== customerId || vac.status !== "ACTIVE") {
        continue;
      }

      if (serviceDate >= vac.startDate && serviceDate <= vac.endDate) {
        // Empty subscriptionIds array implies "ALL" subscriptions for this household
        if (vac.subscriptionIds.length === 0 || vac.subscriptionIds.includes(subscriptionId)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Resumes services early before the scheduled end_date
   */
  static async resumeEarly(vacationId: string): Promise<VacationPause> {
    const vac = vacationStore.get(vacationId);
    if (!vac) throw new Error("Vacation not found");

    vac.status = "EARLY_RESUMED";
    vac.resumedAt = new Date().toISOString();
    vacationStore.set(vacationId, vac);
    return vac;
  }

  /**
   * Extends the vacation end date
   */
  static async extendVacation(vacationId: string, newEndDate: string): Promise<VacationPause> {
    const vac = vacationStore.get(vacationId);
    if (!vac) throw new Error("Vacation not found");
    if (newEndDate < vac.startDate) throw new Error("New end date cannot precede start date");

    vac.endDate = newEndDate;
    vacationStore.set(vacationId, vac);
    return vac;
  }

  static listByCustomer(customerId: string): VacationPause[] {
    return Array.from(vacationStore.values()).filter((v) => v.customerId === customerId);
  }

  static clearStore(): void {
    vacationStore.clear();
  }
}
