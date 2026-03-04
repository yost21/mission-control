import { NextResponse } from "next/server";
import { exec as execCb } from "child_process";
import { promisify } from "util";

const exec = promisify(execCb);

async function run(cmd: string): Promise<string> {
  try {
    const { stdout } = await exec(cmd, { timeout: 5000 });
    return stdout.trim();
  } catch (e: unknown) {
    const err = e as { stdout?: string };
    return err?.stdout?.trim?.() ?? "";
  }
}

function parseServiceStatus(output: string): "active" | "inactive" | "failed" | "unknown" {
  const s = output.trim();
  if (s === "active") return "active";
  if (s === "inactive") return "inactive";
  if (s === "failed") return "failed";
  return "unknown";
}

function parseDisk(output: string) {
  const lines = output.split("\n");
  if (lines.length < 2) return { size: "0", used: "0", available: "0", percent: 0, mount: "/" };
  const parts = lines[1].split(/\s+/);
  return {
    size: parts[1] || "0",
    used: parts[2] || "0",
    available: parts[3] || "0",
    percent: parseInt(parts[4]) || 0,
    mount: parts[5] || "/",
  };
}

function parseMemory(output: string) {
  const memLine = output.split("\n").find((l) => l.startsWith("Mem:"));
  if (!memLine) return { total: 0, used: 0, free: 0, available: 0, percent: 0 };
  const parts = memLine.split(/\s+/);
  const total = parseInt(parts[1]) || 1;
  const used = parseInt(parts[2]) || 0;
  const free = parseInt(parts[3]) || 0;
  const available = parseInt(parts[6]) || free;
  return { total, used, free, available, percent: Math.round((used / total) * 100) };
}

function parseCpu(output: string) {
  const cpuLine = output.split("\n").find((l) => l.includes("%Cpu"));
  if (!cpuLine) return 0;
  const idleMatch = cpuLine.match(/([\d.]+)\s*id/);
  return idleMatch ? Math.round(100 - parseFloat(idleMatch[1])) : 0;
}

function parseUfw(output: string) {
  const lines = output.split("\n");
  const active = lines[0]?.includes("active") && !lines[0]?.includes("inactive");
  const rules: Array<{ to: string; action: string; from: string }> = [];
  let inRules = false;
  for (const line of lines) {
    if (line.startsWith("--")) {
      inRules = true;
      continue;
    }
    if (inRules && line.trim()) {
      const parts = line.split(/\s{2,}/);
      if (parts.length >= 3) {
        rules.push({ to: parts[0].trim(), action: parts[1].trim(), from: parts[2].trim() });
      }
    }
  }
  return { active, rules };
}

function parseFail2ban(output: string) {
  const jailMatch = output.match(/Number of jail:\s*(\d+)/);
  const jailListMatch = output.match(/Jail list:\s*(.*)/);
  return {
    jails: parseInt(jailMatch?.[1] ?? "0"),
    jailList: jailListMatch?.[1]?.trim() ?? "",
  };
}

function parseJournal(output: string) {
  if (!output) return [];
  const entries: Array<{ timestamp: string; unit: string; message: string }> = [];
  for (const line of output.split("\n")) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line);
      const timestamp = entry.__REALTIME_TIMESTAMP
        ? new Date(parseInt(entry.__REALTIME_TIMESTAMP) / 1000).toISOString()
        : new Date().toISOString();
      entries.push({
        timestamp,
        unit: entry._SYSTEMD_UNIT || entry.UNIT || "unknown",
        message: entry.MESSAGE || "",
      });
    } catch {
      // skip non-JSON lines
    }
  }
  return entries.reverse();
}

export const dynamic = "force-dynamic";

export async function GET() {
  const services = [
    {
      name: "OpenClaw Gateway",
      unit: "openclaw-gateway",
      check: "XDG_RUNTIME_DIR=/run/user/1000 systemctl --user is-active openclaw-gateway",
    },
    {
      name: "SSM Agent",
      unit: "snap.amazon-ssm-agent.amazon-ssm-agent.service",
      check: "systemctl is-active snap.amazon-ssm-agent.amazon-ssm-agent.service",
    },
    { name: "PostgreSQL", unit: "postgresql", check: "systemctl is-active postgresql" },
    { name: "Redis", unit: "redis-server", check: "systemctl is-active redis-server" },
  ];

  const serviceChecks = Promise.all(
    services.map((s) => run(s.check))
  );

  const [
    serviceStatuses,
    sshServiceStatus,
    sshSocketStatus,
    port22Count,
    diskOutput,
    memOutput,
    cpuOutput,
    loadAvgOutput,
    uptimeOutput,
    ufwOutput,
    f2bOutput,
    f2bSshdOutput,
    journalUserOutput,
    journalSystemOutput,
    nprocOutput,
  ] = await Promise.all([
    serviceChecks,
    run("systemctl is-active ssh.service"),
    run("systemctl is-active ssh.socket"),
    run("ss -tlnp 2>/dev/null | grep :22 | wc -l"),
    run("df -h /"),
    run("free -m"),
    run("top -bn1 | head -5"),
    run("cat /proc/loadavg"),
    run("uptime -p"),
    run("sudo ufw status 2>/dev/null || ufw status 2>/dev/null"),
    run("sudo fail2ban-client status 2>/dev/null"),
    run("sudo fail2ban-client status sshd 2>/dev/null"),
    run(
      "XDG_RUNTIME_DIR=/run/user/1000 journalctl --user-unit openclaw-gateway --no-pager -n 25 --output=json --since '3 days ago' 2>/dev/null"
    ),
    run(
      "journalctl --no-pager -n 25 --output=json -u snap.amazon-ssm-agent.amazon-ssm-agent.service -u postgresql -u redis-server --since '3 days ago' 2>/dev/null"
    ),
    run("nproc"),
  ]);

  const f2bFailedMatch = f2bSshdOutput.match(/Currently failed:\s*(\d+)/);
  const f2bBannedMatch = f2bSshdOutput.match(/Currently banned:\s*(\d+)/);
  const f2bTotalFailedMatch = f2bSshdOutput.match(/Total failed:\s*(\d+)/);
  const f2bTotalBannedMatch = f2bSshdOutput.match(/Total banned:\s*(\d+)/);

  const loadParts = loadAvgOutput
    .split(" ")
    .slice(0, 3)
    .map(Number)
    .filter((n) => !isNaN(n));

  const data = {
    timestamp: new Date().toISOString(),
    services: services.map((s, i) => ({
      name: s.name,
      unit: s.unit,
      status: parseServiceStatus(serviceStatuses[i]),
    })),
    ssh: {
      serviceInactive: sshServiceStatus !== "active",
      socketInactive: sshSocketStatus !== "active",
      port22Listeners: parseInt(port22Count) || 0,
      hardened:
        sshServiceStatus !== "active" &&
        sshSocketStatus !== "active" &&
        (parseInt(port22Count) || 0) === 0,
    },
    resources: {
      disk: parseDisk(diskOutput),
      memory: parseMemory(memOutput),
      cpu: {
        percent: parseCpu(cpuOutput),
        cores: parseInt(nprocOutput) || 1,
        loadAvg: loadParts.length === 3 ? loadParts : [0, 0, 0],
      },
      uptime: uptimeOutput || "unknown",
    },
    firewall: parseUfw(ufwOutput),
    fail2ban: {
      ...parseFail2ban(f2bOutput),
      currentlyFailed: parseInt(f2bFailedMatch?.[1] ?? "0"),
      currentlyBanned: parseInt(f2bBannedMatch?.[1] ?? "0"),
      totalFailed: parseInt(f2bTotalFailedMatch?.[1] ?? "0"),
      totalBanned: parseInt(f2bTotalBannedMatch?.[1] ?? "0"),
    },
    incidents: [
      ...parseJournal(journalUserOutput),
      ...parseJournal(journalSystemOutput),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
  };

  return NextResponse.json(data);
}
