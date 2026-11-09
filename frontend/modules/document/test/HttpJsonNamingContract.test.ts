import {describe, expect, it} from "vitest";
import {assertModuleJsonNamingContract} from "../../_common/config/moduleJsonNamingContract";

describe("document HTTP JSON naming contract", () => {
  it("uses camelCase across its clients and contract properties", () => {
    expect(() => assertModuleJsonNamingContract("document")).not.toThrow();
  });
});
