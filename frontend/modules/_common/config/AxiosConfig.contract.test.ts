import axios, {AxiosHeaders, InternalAxiosRequestConfig} from "axios";
import {describe, expect, it} from "vitest";
import {configureAxios} from "./AxiosConfig";

describe("shared Axios JSON naming contract", () => {
  it("sends and receives camelCase JSON without key conversion", async () => {
    let requestBody: Record<string, unknown> | undefined;
    const client = configureAxios(axios.create({
      adapter: async (config: InternalAxiosRequestConfig) => {
        requestBody = JSON.parse(config.data as string) as Record<string, unknown>;
        return {
          data: {userId: "user-uuid", fileSize: 5},
          status: 200,
          statusText: "OK",
          headers: new AxiosHeaders(),
          config,
        };
      },
    }));

    const response = await client.post("/documents", {userId: "user-uuid", fileSize: 5});

    expect(requestBody).toEqual({userId: "user-uuid", fileSize: 5});
    expect(requestBody).not.toHaveProperty("user_id");
    expect(response.data).toEqual({userId: "user-uuid", fileSize: 5});
  });
});
