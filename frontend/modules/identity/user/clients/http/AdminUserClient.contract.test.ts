import {beforeEach, describe, expect, it, vi} from "vitest";

const {axiosClient} = vi.hoisted(() => ({
  axiosClient: {get: vi.fn()},
}));

vi.mock("@identity/auth/services/AuthService.ts", () => ({
  default: {createAuthenticatedClientInstance: () => axiosClient},
}));

import AdminUserClient from "./AdminUserClient";

describe("identity statistics HTTP JSON contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axiosClient.get.mockResolvedValue({data: {all: 8, registrationCompleted: 5, registrationIncomplete: 3}});
  });

  it("reads camelCase statistics returned by the identity controller", async () => {
    const response = await AdminUserClient.getFilterStatistics();

    expect(axiosClient.get).toHaveBeenCalledWith("/statistics");
    expect(response.data).toEqual({all: 8, registrationCompleted: 5, registrationIncomplete: 3});
    expect(response.data).not.toHaveProperty("REGISTRATION_COMPLETED");
  });
});
