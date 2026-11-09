import {describe, expect, it} from "vitest";
import {assertModuleJsonNamingContract} from "../../_common/config/moduleJsonNamingContract";

describe("payment HTTP JSON naming contract", () => {
  it("uses camelCase across its clients and contract properties", () => {
    expect(() => assertModuleJsonNamingContract("payment")).not.toThrow();
  });
});
