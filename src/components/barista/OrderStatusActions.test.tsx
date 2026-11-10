import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderStatusActions } from "./OrderStatusActions";

const orderId = "11111111-2222-4333-a444-555555555555";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("OrderStatusActions", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it.each([
    ["received", "Start brewing"],
    ["brewing", "Mark ready"],
    ["ready", "Mark picked up"],
  ] as const)("shows the next action for %s", (status, label) => {
    render(
      <OrderStatusActions
        orderId={orderId}
        guestName="Alice"
        status={status}
        onStatusChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
  });

  it("advances with one tap and reports the new status", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ id: orderId, status: "brewing" }),
    );

    render(
      <OrderStatusActions
        orderId={orderId}
        guestName="Alice"
        status="received"
        onStatusChange={onStatusChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Start brewing" }));

    expect(fetchMock).toHaveBeenCalledWith(
      `/api/orders/${orderId}/status`,
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ action: "advance" }),
      }),
    );
    await waitFor(() =>
      expect(onStatusChange).toHaveBeenCalledWith(orderId, "brewing"),
    );
  });

  it("asks for confirmation before cancelling", async () => {
    const user = userEvent.setup();
    render(
      <OrderStatusActions
        orderId={orderId}
        guestName="Alice"
        status="brewing"
        onStatusChange={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent(/cancel alice’s order/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not cancel when the barista keeps the order", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    render(
      <OrderStatusActions
        orderId={orderId}
        guestName="Alice"
        status="brewing"
        onStatusChange={onStatusChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(screen.getByRole("button", { name: "Keep order" }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(onStatusChange).not.toHaveBeenCalled();
  });

  it("cancels after confirmation", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ id: orderId, status: "cancelled" }),
    );
    render(
      <OrderStatusActions
        orderId={orderId}
        guestName="Alice"
        status="received"
        onStatusChange={onStatusChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(screen.getByRole("button", { name: "Cancel order" }));

    expect(fetchMock).toHaveBeenCalledWith(
      `/api/orders/${orderId}/status`,
      expect.objectContaining({ body: JSON.stringify({ action: "cancel" }) }),
    );
    await waitFor(() =>
      expect(onStatusChange).toHaveBeenCalledWith(orderId, "cancelled"),
    );
  });

  it("shows the server error and keeps the status when the update fails", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: "Order is already cancelled" }, 409),
    );
    render(
      <OrderStatusActions
        orderId={orderId}
        guestName="Alice"
        status="ready"
        onStatusChange={onStatusChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Mark picked up" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Order is already cancelled",
    );
    expect(onStatusChange).not.toHaveBeenCalled();
  });

  it("shows a network error when the request throws", async () => {
    const user = userEvent.setup();
    fetchMock.mockRejectedValueOnce(new TypeError("offline"));
    render(
      <OrderStatusActions
        orderId={orderId}
        guestName="Alice"
        status="received"
        onStatusChange={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Start brewing" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /network error/i,
    );
  });

  it("disables both buttons while a request is in flight", async () => {
    const user = userEvent.setup();
    fetchMock.mockReturnValueOnce(new Promise<Response>(() => {}));
    render(
      <OrderStatusActions
        orderId={orderId}
        guestName="Alice"
        status="received"
        onStatusChange={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Start brewing" }));

    expect(screen.getByRole("button", { name: /updating/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  it("renders nothing for finished orders", () => {
    const { container } = render(
      <OrderStatusActions
        orderId={orderId}
        guestName="Alice"
        status="picked_up"
        onStatusChange={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
