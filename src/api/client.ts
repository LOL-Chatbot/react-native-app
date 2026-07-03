import { ApiResponse, BuildData, ChatData, Position, TierListData } from "../types/api";
import { env } from "../config/env";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });
  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !body.success) {
    throw new Error(body.error?.message ?? "요청 처리 중 오류가 발생했습니다.");
  }

  if (body.data === undefined) {
    throw new Error("응답 데이터가 비어 있습니다.");
  }

  return body.data;
}

export const apiClient = {
  health: () => request<Record<string, unknown>>("/health"),
  sendChat: (message: string) =>
    request<ChatData>("/chat/messages", {
      method: "POST",
      body: JSON.stringify({ message })
    }),
  getChampionBuild: (championId: string, position: Position) =>
    request<BuildData>("/recommendations/champion-build", {
      method: "POST",
      body: JSON.stringify({ champion_id: championId, position })
    }),
  getTierList: (position?: Position, query?: string) => {
    const params = new URLSearchParams();
    if (position) params.set("position", position);
    if (query) params.set("query", query);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return request<TierListData>(`/champions/tier-list${suffix}`);
  }
};
