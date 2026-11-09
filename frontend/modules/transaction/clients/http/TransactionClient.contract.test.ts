import {beforeEach, describe, expect, it, vi} from "vitest";

const {axiosClient} = vi.hoisted(() => ({
  axiosClient: {get: vi.fn()},
}));

vi.mock("@identity/auth/services/AuthService.ts", () => ({
  default: {createAuthenticatedClientInstance: () => axiosClient},
}));

import TransactionClient from "./TransactionClient";

describe("transaction statistics HTTP JSON contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axiosClient.get.mockResolvedValue({data: {all: 8, completed: 5, incomplete: 3}});
  });

  it("reads camelCase statistics returned by the transaction controller", async () => {
    const response = await TransactionClient.getFilterStatistics();

    expect(axiosClient.get).toHaveBeenCalledWith("/statistics");
    expect(response.data).toEqual({all: 8, completed: 5, incomplete: 3});
    expect(response.data).not.toHaveProperty("COMPLETED");
  });
});
