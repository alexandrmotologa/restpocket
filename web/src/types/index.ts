export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface RequestParam {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export interface RequestHeader {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export type AuthType = 'none' | 'bearer' | 'basic' | 'apikey';

export interface AuthConfig {
  type: AuthType;
  token?: string;
  username?: string;
  password?: string;
  keyName?: string;
  keyValue?: string;
  addTo?: 'header' | 'query';
}

export type BodyType = 'none' | 'json' | 'urlencoded' | 'raw';

export interface ExecuteResult {
  status: number;
  statusText: string;
  latencyMs: number;
  sizeBytes: number;
  headers: Record<string, string>;
  data: any;
  isBinary: boolean;
  contentType?: string;
}

export interface SavedRequestItem {
  id: number;
  collection_id: number;
  name: string;
  method: HttpMethod;
  url: string;
  headers_json: string;
  body_json: string | null;
  created_at?: string;
}

export interface CollectionItem {
  id: number;
  name: string;
  user_id?: string;
  created_at?: string;
  requests: SavedRequestItem[];
}

export interface HistoryItem {
  id: number;
  user_id?: string;
  method: string;
  url: string;
  status_code: number;
  latency_ms: number;
  size_bytes: number;
  created_at: string;
}

export interface EnvironmentItem {
  id: number;
  name: string;
  variables_json: string;
  is_active: number;
  created_at?: string;
}
