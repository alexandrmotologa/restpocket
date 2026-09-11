import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.js';
import { RequestBar } from './components/RequestBar.js';
import { RequestTabs } from './components/RequestTabs.js';
import { ResponseViewer } from './components/ResponseViewer.js';
import { CollectionsDrawer } from './components/CollectionsDrawer.js';
import { HistoryDrawer } from './components/HistoryDrawer.js';
import { EnvironmentModal } from './components/EnvironmentModal.js';
import { CurlImportModal } from './components/CurlImportModal.js';
import { CodeExportModal } from './components/CodeExportModal.js';
import { WebhookBinDrawer } from './components/WebhookBinDrawer.js';
import { MonitorDrawer } from './components/MonitorDrawer.js';
import { ShareModal } from './components/ShareModal.js';
import { useTelegram } from './hooks/useTelegram.js';
import { interpolateString } from './utils/interpolation.js';
import {
  HttpMethod,
  RequestParam,
  RequestHeader,
  AuthConfig,
  BodyType,
  ExecuteResult,
  CollectionItem,
  HistoryItem,
  EnvironmentItem,
  SavedRequestItem,
} from './types/index.js';

export function App() {
  const { user, initData, triggerHaptic } = useTelegram();

  // Request State
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState<string>('https://httpbin.org/get');
  const [params, setParams] = useState<RequestParam[]>([]);
  const [headers, setHeaders] = useState<RequestHeader[]>([
    { id: '1', key: 'Accept', value: 'application/json', enabled: true },
    { id: '2', key: 'User-Agent', value: 'RestPocket/1.0', enabled: true },
  ]);
  const [auth, setAuth] = useState<AuthConfig>({ type: 'none' });
  const [bodyType, setBodyType] = useState<BodyType>('none');
  const [bodyContent, setBodyContent] = useState<string>('');

  // Execution State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ExecuteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Persistence State
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [environments, setEnvironments] = useState<EnvironmentItem[]>([]);
  const [activeEnv, setActiveEnv] = useState<EnvironmentItem | null>(null);

  // Modal / Drawer Toggles
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [environmentsOpen, setEnvironmentsOpen] = useState(false);
  const [curlImportOpen, setCurlImportOpen] = useState(false);
  const [codeExportOpen, setCodeExportOpen] = useState(false);
  const [webhookBinOpen, setWebhookBinOpen] = useState(false);
  const [monitorsOpen, setMonitorsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Load Collections, History, and Environments
  const loadData = useCallback(async () => {
    try {
      const headersInit: Record<string, string> = {};
      if (initData) headersInit['X-Telegram-Init-Data'] = initData;

      // Collections
      const colRes = await fetch('/api/collections', { headers: headersInit });
      if (colRes.ok) {
        const colData = await colRes.json();
        setCollections(colData);
      }

      // History
      const histRes = await fetch('/api/history', { headers: headersInit });
      if (histRes.ok) {
        const histData = await histRes.json();
        setHistory(histData);
      }

      // Environments
      const envRes = await fetch('/api/environments', { headers: headersInit });
      if (envRes.ok) {
        const envData: EnvironmentItem[] = await envRes.json();
        setEnvironments(envData);
        const active = envData.find((e) => e.is_active === 1) || envData[0] || null;
        setActiveEnv(active);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  }, [initData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Check URL query for shared request: ?req=<base64>
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedReq = urlParams.get('req');
    if (sharedReq) {
      try {
        const decoded = JSON.parse(atob(sharedReq));
        if (decoded.m) setMethod(decoded.m);
        if (decoded.u) setUrl(decoded.u);
      } catch (err) {
        console.error('Failed to parse shared request:', err);
      }
    }
  }, []);

  // Parse active environment variables map
  const activeVars: Record<string, string> = React.useMemo(() => {
    if (!activeEnv) return {};
    try {
      return JSON.parse(activeEnv.variables_json);
    } catch {
      return {};
    }
  }, [activeEnv]);

  // Execute Request Handler
  const handleSend = async () => {
    setIsLoading(true);
    setError(null);
    triggerHaptic('medium');

    try {
      // 1. Interpolate URL and append query parameters
      let finalUrl = interpolateString(url.trim(), activeVars);

      const enabledParams = params.filter((p) => p.enabled && p.key.trim());
      if (enabledParams.length > 0) {
        const urlObj = new URL(finalUrl);
        for (const p of enabledParams) {
          const key = interpolateString(p.key.trim(), activeVars);
          const val = interpolateString(p.value.trim(), activeVars);
          urlObj.searchParams.append(key, val);
        }
        finalUrl = urlObj.toString();
      }

      // 2. Build and interpolate Headers
      const finalHeaders: Record<string, string> = {};
      for (const h of headers) {
        if (h.enabled && h.key.trim()) {
          const key = interpolateString(h.key.trim(), activeVars);
          const val = interpolateString(h.value.trim(), activeVars);
          finalHeaders[key] = val;
        }
      }

      // 3. Apply Auth headers
      if (auth.type === 'bearer' && auth.token) {
        const tokenVal = interpolateString(auth.token.trim(), activeVars);
        finalHeaders['Authorization'] = `Bearer ${tokenVal}`;
      } else if (auth.type === 'basic' && auth.username) {
        const userVal = interpolateString(auth.username.trim(), activeVars);
        const passVal = interpolateString((auth.password || '').trim(), activeVars);
        const b64 = btoa(`${userVal}:${passVal}`);
        finalHeaders['Authorization'] = `Basic ${b64}`;
      } else if (auth.type === 'apikey' && auth.keyName && auth.keyValue) {
        const kName = interpolateString(auth.keyName.trim(), activeVars);
        const kVal = interpolateString(auth.keyValue.trim(), activeVars);
        if (auth.addTo === 'query') {
          const urlObj = new URL(finalUrl);
          urlObj.searchParams.append(kName, kVal);
          finalUrl = urlObj.toString();
        } else {
          finalHeaders[kName] = kVal;
        }
      }

      // 4. Build and interpolate Body
      let finalBody: string | undefined;
      if (bodyType !== 'none' && bodyContent.trim()) {
        finalBody = interpolateString(bodyContent.trim(), activeVars);
        if (bodyType === 'json' && !finalHeaders['Content-Type']) {
          finalHeaders['Content-Type'] = 'application/json';
        } else if (bodyType === 'urlencoded' && !finalHeaders['Content-Type']) {
          finalHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
        }
      }

      // 5. Dispatch via backend proxy
      const reqHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (initData) {
        reqHeaders['X-Telegram-Init-Data'] = initData;
      }

      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify({
          method,
          url: finalUrl,
          headers: finalHeaders,
          body: finalBody,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Request failed');
        setResult(null);
        triggerHaptic('error');
      } else {
        setResult(data);
        // Differentiated haptic feedback
        if (data.status >= 200 && data.status < 300) {
          triggerHaptic('success');
        } else if (data.status >= 400 && data.status < 500) {
          triggerHaptic('warning');
        } else {
          triggerHaptic('error');
        }
      }

      // Refresh history list
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch request');
      setResult(null);
      triggerHaptic('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Response Chaining: Save field to variable
  const handleSaveToVariable = (key: string, value: string) => {
    if (!activeEnv) {
      alert('Please create or select an active environment first.');
      setEnvironmentsOpen(true);
      return;
    }

    const nextVars = { ...activeVars, [key]: value };
    handleSaveEnv(activeEnv.name, nextVars, true);
    triggerHaptic('success');
    alert(`Saved "{{${key}}}" = "${value}" to environment "${activeEnv.name}".`);
  };

  // Environment operations
  const handleSaveEnv = async (name: string, variables: Record<string, string>, isActive: boolean) => {
    try {
      const res = await fetch('/api/environments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, variables, isActive: isActive ? 1 : 0 }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error('Failed to save environment:', err);
    }
  };

  // Collection operations
  const handleCreateCollection = async (name: string) => {
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error('Failed to create collection:', err);
    }
  };

  const handleDeleteCollection = async (id: number) => {
    try {
      await fetch(`/api/collections/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error('Failed to delete collection:', err);
    }
  };

  const handleSaveCurrentRequest = async (collectionId: number, name: string) => {
    try {
      const headersObj: Record<string, string> = {};
      for (const h of headers) {
        if (h.enabled && h.key) headersObj[h.key] = h.value;
      }

      const res = await fetch(`/api/collections/${collectionId}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          method,
          url,
          headers: headersObj,
          body: bodyType !== 'none' ? bodyContent : undefined,
        }),
      });
      if (res.ok) {
        loadData();
        triggerHaptic('success');
      }
    } catch (err) {
      console.error('Failed to save request to collection:', err);
    }
  };

  const handleDeleteRequest = async (id: number) => {
    try {
      await fetch(`/api/saved-requests/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error('Failed to delete request:', err);
    }
  };

  const handleSelectSavedRequest = (req: SavedRequestItem) => {
    setMethod(req.method);
    setUrl(req.url);

    let parsedHeaders: Record<string, string> = {};
    try {
      parsedHeaders = JSON.parse(req.headers_json);
    } catch {
      // Ignored
    }

    setHeaders(
      Object.entries(parsedHeaders).map(([k, v], idx) => ({
        id: String(idx + 1),
        key: k,
        value: v,
        enabled: true,
      }))
    );

    if (req.body_json) {
      setBodyType('json');
      setBodyContent(req.body_json);
    } else {
      setBodyType('none');
      setBodyContent('');
    }
  };

  // cURL & Postman Import Handlers
  const handleImportCurl = async (curlString: string) => {
    const res = await fetch('/api/parse-curl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ curl: curlString }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to parse cURL');
    }

    const data = await res.json();
    setMethod(data.method);
    setUrl(data.url);

    if (data.headers) {
      setHeaders(
        Object.entries(data.headers).map(([k, v], idx) => ({
          id: String(idx + 1),
          key: k,
          value: String(v),
          enabled: true,
        }))
      );
    }

    if (data.body) {
      setBodyType('json');
      setBodyContent(data.body);
    } else {
      setBodyType('none');
      setBodyContent('');
    }

    triggerHaptic('success');
  };

  const handleImportPostman = async (collectionName: string, reqs: any[]) => {
    try {
      // Create collection first
      const colRes = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: collectionName }),
      });
      const colData = await colRes.json();

      // Save each request to the collection
      for (const r of reqs) {
        await fetch(`/api/collections/${colData.id}/requests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(r),
        });
      }

      loadData();
      triggerHaptic('success');
      alert(`Imported "${collectionName}" with ${reqs.length} requests!`);
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    }
  };

  // Compile active headers map for code export
  const activeHeadersMap: Record<string, string> = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const h of headers) {
      if (h.enabled && h.key) map[h.key] = h.value;
    }
    return map;
  }, [headers]);

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        activeEnv={activeEnv}
        userName={user?.username || user?.first_name}
        onOpenEnvironments={() => setEnvironmentsOpen(true)}
        onOpenCollections={() => setCollectionsOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenWebhookBin={() => setWebhookBinOpen(true)}
        onOpenMonitors={() => setMonitorsOpen(true)}
        onOpenCurlImport={() => setCurlImportOpen(true)}
        onOpenCodeExport={() => setCodeExportOpen(true)}
        onOpenShare={() => setShareOpen(true)}
      />

      {/* Main Request Configuration */}
      <main className="flex-1 flex flex-col">
        {/* Request Bar: Method selector, URL bar, Send button */}
        <RequestBar
          method={method}
          url={url}
          isLoading={isLoading}
          onMethodChange={setMethod}
          onUrlChange={setUrl}
          onSend={handleSend}
        />

        {/* Configuration Tabs: Params, Headers, Auth, Body */}
        <RequestTabs
          params={params}
          headers={headers}
          auth={auth}
          bodyType={bodyType}
          bodyContent={bodyContent}
          onParamsChange={setParams}
          onHeadersChange={setHeaders}
          onAuthChange={setAuth}
          onBodyTypeChange={setBodyType}
          onBodyContentChange={setBodyContent}
        />

        {/* Response Viewer */}
        <ResponseViewer
          result={result}
          error={error}
          isLoading={isLoading}
          onSaveToVariable={handleSaveToVariable}
        />
      </main>

      {/* Drawers & Modals */}
      <CollectionsDrawer
        isOpen={collectionsOpen}
        collections={collections}
        currentMethod={method}
        currentUrl={url}
        onClose={() => setCollectionsOpen(false)}
        onSelectRequest={handleSelectSavedRequest}
        onCreateCollection={handleCreateCollection}
        onDeleteCollection={handleDeleteCollection}
        onSaveCurrentRequest={handleSaveCurrentRequest}
        onDeleteRequest={handleDeleteRequest}
      />

      <HistoryDrawer
        isOpen={historyOpen}
        history={history}
        onClose={() => setHistoryOpen(false)}
        onSelectHistoryItem={(m, u) => {
          setMethod(m);
          setUrl(u);
        }}
        onClearHistory={async () => {
          await fetch('/api/history', { method: 'DELETE' });
          loadData();
        }}
      />

      <EnvironmentModal
        isOpen={environmentsOpen}
        environments={environments}
        activeEnv={activeEnv}
        onClose={() => setEnvironmentsOpen(false)}
        onSelectEnv={setActiveEnv}
        onSaveEnv={handleSaveEnv}
      />

      <CurlImportModal
        isOpen={curlImportOpen}
        onClose={() => setCurlImportOpen(false)}
        onImportCurl={handleImportCurl}
        onImportPostman={handleImportPostman}
      />

      <CodeExportModal
        isOpen={codeExportOpen}
        method={method}
        url={url}
        headers={activeHeadersMap}
        body={bodyType !== 'none' ? bodyContent : undefined}
        onClose={() => setCodeExportOpen(false)}
      />

      <WebhookBinDrawer
        isOpen={webhookBinOpen}
        onClose={() => setWebhookBinOpen(false)}
      />

      <MonitorDrawer
        isOpen={monitorsOpen}
        onClose={() => setMonitorsOpen(false)}
        defaultUrl={url}
        defaultMethod={method}
      />

      <ShareModal
        isOpen={shareOpen}
        method={method}
        url={url}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
