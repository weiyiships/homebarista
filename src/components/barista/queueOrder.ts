import type { OrderOptions } from "@/lib/domain/queue";
import type { QueueOrderDto } from "@/lib/schemas/barista";
import type { OrderStatus } from "@/lib/schemas/order";

/**
 * Queue card view model. Lives outside the client components so server
 * components can build it too.
 */
export interface QueueOrder {
  id: string;
  guestName: string;
  drinkName: string;
  status: OrderStatus;
  /** ISO timestamp of when the order arrived. */
  createdAt: string;
  options: OrderOptions;
}

export function toQueueOrder(dto: QueueOrderDto): QueueOrder {
  return {
    id: dto.id,
    guestName: dto.guest_name,
    drinkName: dto.drink_name,
    status: dto.status,
    createdAt: dto.created_at,
    options: dto.options,
  };
}
