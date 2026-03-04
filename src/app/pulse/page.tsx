"use client";

import { useState, useEffect, useCallback } from "react";

interface PulseData {
  timestamp: string;
  services: Array<{ name: string; unit: string; status: string }>;
  ssh: {
    serviceInactive: boolean;
    socketInactive: boolean;
    port22Listeners: number;
    hardened: boolean;
  };
  resources: {
    disk: { size: string; used: string; available: string; percent: number; mount: string };
    memory: { total: number; used: number; free: number; available: number; percent: number };
    cpu: { percent: number; cores: number; loadAvg: number[] };
    uptime: string;
  };
  firewall: {
    active: boolean;
    rules: Array<{ to: string; action: string; from: string }>;
  };
  fail2ban: {
    jails: number;
    jailList: string;
    currentlyFailed: number;
    currentlyBanned: number;
    totalFailed: number;
    totalBanned: number;
  };
  incidents: Array<{ timestamp: string; unit: string; message: string }>;
}

export default function PulsePage() {
  const [data, setData] = useState<PulseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPulse = useCallback(async () => {
    try {
      const res = await fetch("/api/pulse", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setError(null);
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPulse();
    const interval = setInterval(fetchPulse, 10000);
    return () => clearInterval(interval);
  }, [fetchPulse]);

  if (loading) return <LoadingSkeleton />;
  if (error && !data) return <ErrorDisplay message={error} onRetry={fetchPulse} />;

  const downServices = data?.services.filter((s) => s.status !== "active") ?? [];

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {downServices.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-red-400 text-lg">!</span>
            <span className="text-red-400 font-medium">
              {downServices.map((s) => s.name).join(", ")}{" "}
              {downServices.length === 1 ? "is" : "are"} down
            </span>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Updated {data ? new Date(data.timestamp).toLocaleTimeString() : "—"}
        </span>
        <span
          className={`flex items-center gap-1.5 ${error ? "text-red-400" : "text-green-400"}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${error ? "bg-red-400" : "bg-green-400"} animate-pulse`}
          />
          {error ? "Reconnecting" : "Live"}
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Core Services */}
        <Card title="Core Services">
          <div className="space-y-3">
            {data?.services.map((s) => (
              <div key={s.unit} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      s.status === "active" ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span className="text-sm text-slate-300">{s.name}</span>
                </div>
                <span
                  className={`text-xs font-mono ${
                    s.status === "active" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* SSH Hardening */}
        <Card title="SSH Hardening">
          <div className="space-y-3">
            <CheckRow label="ssh.service inactive" ok={data?.ssh.serviceInactive} />
            <CheckRow label="ssh.socket inactive" ok={data?.ssh.socketInactive} />
            <CheckRow
              label="Port 22 listeners"
              ok={data?.ssh.port22Listeners === 0}
              value={String(data?.ssh.port22Listeners ?? "?")}
            />
            <div className="pt-3 border-t border-slate-800">
              <span
                className={`text-sm font-semibold ${
                  data?.ssh.hardened ? "text-green-400" : "text-red-400"
                }`}
              >
                {data?.ssh.hardened ? "HARDENED" : "NOT HARDENED"}
              </span>
            </div>
          </div>
        </Card>

        {/* System Resources */}
        <Card title="System Resources" subtitle={data?.resources.uptime}>
          <div className="space-y-4">
            <ResourceBar
              label="Disk"
              percent={data?.resources.disk.percent ?? 0}
              detail={`${data?.resources.disk.used} / ${data?.resources.disk.size}`}
            />
            <ResourceBar
              label="Memory"
              percent={data?.resources.memory.percent ?? 0}
              detail={`${data?.resources.memory.used}M / ${data?.resources.memory.total}M`}
            />
            <ResourceBar
              label="CPU"
              percent={data?.resources.cpu.percent ?? 0}
              detail={`${data?.resources.cpu.cores} cores`}
            />
            {data?.resources.cpu.loadAvg && (
              <div className="text-xs text-slate-500">
                Load avg: {data.resources.cpu.loadAvg.map((l) => l.toFixed(2)).join("  ")}
              </div>
            )}
          </div>
        </Card>

        {/* Security */}
        <Card title="Security">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Firewall (UFW)</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    data?.firewall.active
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {data?.firewall.active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="space-y-0.5">
                {data?.firewall.rules.map((r, i) => (
                  <div key={i} className="text-xs text-slate-500 font-mono">
                    {r.to} &larr; {r.action} &larr; {r.from}
                  </div>
                ))}
                {(!data?.firewall.rules || data.firewall.rules.length === 0) && (
                  <div className="text-xs text-slate-600">No rules found</div>
                )}
              </div>
            </div>
            <div className="border-t border-slate-800 pt-3">
              <div className="text-sm text-slate-300 mb-2">
                Fail2Ban{" "}
                {data?.fail2ban.jailList && (
                  <span className="text-xs text-slate-500">({data.fail2ban.jailList})</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <StatBox label="Jails" value={data?.fail2ban.jails ?? 0} />
                <StatBox
                  label="Banned"
                  value={data?.fail2ban.currentlyBanned ?? 0}
                  alert={!!data?.fail2ban.currentlyBanned}
                />
                <StatBox label="Total Failed" value={data?.fail2ban.totalFailed ?? 0} />
                <StatBox label="Total Banned" value={data?.fail2ban.totalBanned ?? 0} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Incident Timeline — full width */}
      <Card title="Incident Timeline">
        <div className="max-h-72 overflow-y-auto">
          {(!data?.incidents || data.incidents.length === 0) && (
            <p className="text-sm text-slate-600">No incidents in the last 3 days</p>
          )}
          <div className="space-y-0.5">
            {data?.incidents.map((inc, i) => {
              const prev = i > 0 ? data.incidents[i - 1] : null;
              const date = new Date(inc.timestamp).toLocaleDateString();
              const prevDate = prev ? new Date(prev.timestamp).toLocaleDateString() : null;
              const showDateHeader = date !== prevDate;

              return (
                <div key={i}>
                  {showDateHeader && (
                    <div className="text-xs text-slate-600 font-medium pt-3 pb-1 first:pt-0">
                      {date}
                    </div>
                  )}
                  <div className="flex gap-3 text-xs py-1.5 border-b border-slate-800/50 last:border-0">
                    <span className="text-slate-500 font-mono whitespace-nowrap">
                      {new Date(inc.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-slate-400 font-mono w-36 shrink-0 truncate">
                      {inc.unit}
                    </span>
                    <span className="text-slate-300 truncate">{inc.message}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────── */

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
          {title}
        </h2>
        {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

function CheckRow({ label, ok, value }: { label: string; ok?: boolean; value?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        {value !== undefined && (
          <span className="text-xs font-mono text-slate-500">{value}</span>
        )}
        <span className={ok ? "text-green-400" : "text-red-400"}>{ok ? "✓" : "✗"}</span>
      </div>
    </div>
  );
}

function ResourceBar({
  label,
  percent,
  detail,
}: {
  label: string;
  percent: number;
  detail: string;
}) {
  const color =
    percent > 90 ? "bg-red-500" : percent > 70 ? "bg-yellow-500" : "bg-green-500";
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="text-xs text-slate-500">{detail}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${color}`}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
        <span className="text-xs text-slate-400 font-mono w-8 text-right">{percent}%</span>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  alert,
}: {
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <div className="bg-slate-800/50 rounded-md p-2.5">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-lg font-mono ${alert ? "text-red-400" : "text-slate-200"}`}>
        {value}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-48 bg-slate-800 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-52 bg-slate-800/50 rounded-lg" />
        ))}
      </div>
      <div className="h-40 bg-slate-800/50 rounded-lg" />
    </div>
  );
}

function ErrorDisplay({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <div className="text-4xl mb-4">!</div>
        <h1 className="text-xl font-semibold text-red-400 mb-2">Connection Error</h1>
        <p className="text-slate-400 mb-4">{message}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-md text-sm text-slate-200 transition-colors"
        >
          Retry Now
        </button>
        <p className="text-slate-600 text-xs mt-3">Auto-retrying every 10s</p>
      </div>
    </div>
  );
}
