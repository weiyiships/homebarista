import type { FinishedOrderStatus } from "@/lib/domain/history";
import type { OrderOptions } from "@/lib/domain/queue";
import type { HistoryOrderDto } from "@/lib/schemas/barista";

/**
 * History row view model. Lives outside the client components so server
 * components can build it too.
 */
export interface HistoryOrder {
  id: string;
  guestName: string;
  drinkName: string;
  status: FinishedOrderStatus;
  /** ISO timestamp of when the order arrived. */
  createdAt: string;
  /** ISO timestamp of when the order was picked up or cancelled. */
  finishedAt: string;
  options: OrderOptions;
}

export function toHistoryOrder(dto: HistoryOrderDto): HistoryOrder {
  return {
    id: dto.id,
    guestName: dto.guest_name,
    drinkName: dto.drink_name,
    status: dto.status,
    createdAt: dto.created_at,
    finishedAt: dto.finished_at,
    options: dto.options,
  };
}
