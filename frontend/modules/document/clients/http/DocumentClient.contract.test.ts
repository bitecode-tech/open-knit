import {beforeEach, describe, expect, it, vi} from "vitest";

const {axiosClient} = vi.hoisted(() => ({
  axiosClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@identity/auth/services/AuthService.ts", () => ({
  default: {
    createAuthenticatedClientInstance: () => axiosClient,
  },
}));

vi.mock("@common/config/AxiosConfig.ts", () => ({
  baseConfig: {baseURL: "/api"},
  adminBaseConfig: {baseURL: "/api/admin"},
}));

import UserDocumentClient from "./UserDocumentClient";
import AdminDocumentClient from "./AdminDocumentClient";

const documentResponse = {
  uuid: "document-uuid",
  userId: "user-uuid",
  filename: "report.pdf",
  checksum: "checksum",
  createdDate: "2026-01-01T00:00:00Z",
  fileSize: 120,
  fileType: "application/pdf",
  storageType: "LOCAL",
};

describe.each([
  ["user", UserDocumentClient],
  ["admin", AdminDocumentClient],
])("%s document client JSON contract", (_scope, client) => {
  beforeEach(() => {
    vi.clearAllMocks();
    axiosClient.get.mockImplementation((path: string) => Promise.resolve({
      data: path === "" ? {content: [documentResponse], page: {size: 1, totalElements: 1, number: 0, totalPages: 1}} : documentResponse,
    }));
    axiosClient.post.mockResolvedValue({data: [documentResponse]});
    axiosClient.delete.mockResolvedValue({data: undefined});
  });

  it("reads paged documents with camelCase response fields", async () => {
    const response = await client.getDocuments({page: {page: 0, size: 10, sort: []}});

    expect(axiosClient.get).toHaveBeenCalledWith("", expect.any(Object));
    expect(response.data.content[0].userId).toBe("user-uuid");
    expect(response.data.content[0].fileSize).toBe(120);
    expect(response.data.content[0]).not.toHaveProperty("user_id");
  });

  it("reads a document with camelCase response fields", async () => {
    const response = await client.getDocument("document-uuid");

    expect(axiosClient.get).toHaveBeenCalledWith("/document-uuid");
    expect(response.data.fileType).toBe("application/pdf");
    expect(response.data.storageType).toBe("LOCAL");
  });

  it("uploads files as multipart and receives camelCase document fields", async () => {
    const response = await client.uploadDocuments([new File(["content"], "report.pdf")]);

    expect(axiosClient.post).toHaveBeenCalledWith("", expect.any(FormData), expect.any(Object));
    expect(response.data[0].userId).toBe("user-uuid");
    expect(response.data[0]).not.toHaveProperty("storage_type");
  });

  it("downloads a document as a blob", async () => {
    await client.downloadDocument("document-uuid");

    expect(axiosClient.get).toHaveBeenCalledWith("/document-uuid/download", {responseType: "blob"});
  });

  it("deletes a document by UUID", async () => {
    await client.deleteDocument("document-uuid");

    expect(axiosClient.delete).toHaveBeenCalledWith("/document-uuid");
  });
});
