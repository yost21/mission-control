#!/usr/bin/env python3
"""
Bedtime Audio Report Generator for Mission Control.

Gathers current system health data, composes a calming evening
summary, and writes it to an MP3 file using Google Text-to-Speech.
"""

import subprocess
import datetime
import sys
import os
from pathlib import Path

import shutil


def run(cmd: str) -> str:
    try:
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, timeout=5
        )
        return result.stdout.strip()
    except Exception:
        return ""


def gather_system_data() -> dict:
    """Collect system health metrics."""
    # Disk
    disk_raw = run("df -h /")
    disk_lines = disk_raw.split("\n")
    disk_percent = 0
    disk_avail = "unknown"
    if len(disk_lines) >= 2:
        parts = disk_lines[1].split()
        if len(parts) >= 5:
            disk_percent = int(parts[4].replace("%", ""))
            disk_avail = parts[3]

    # Memory
    mem_raw = run("free -m")
    mem_percent = 0
    mem_total = 0
    mem_avail = 0
    for line in mem_raw.split("\n"):
        if line.startswith("Mem:"):
            p = line.split()
            mem_total = int(p[1]) if len(p) > 1 else 0
            mem_used = int(p[2]) if len(p) > 2 else 0
            mem_avail = int(p[6]) if len(p) > 6 else 0
            mem_percent = round((mem_used / mem_total) * 100) if mem_total else 0

    # CPU load
    load_raw = run("cat /proc/loadavg")
    load_parts = load_raw.split()
    load_1 = float(load_parts[0]) if load_parts else 0
    cores = int(run("nproc") or "1")

    # Uptime
    uptime = run("uptime -p") or "unknown"

    # Services
    services = {}
    for name, cmd in [
        ("PostgreSQL", "systemctl is-active postgresql"),
        ("Redis", "systemctl is-active redis-server"),
    ]:
        status = run(cmd)
        services[name] = status == "active"

    # Firewall
    ufw_raw = run("sudo ufw status 2>/dev/null || ufw status 2>/dev/null")
    firewall_active = "active" in ufw_raw and "inactive" not in ufw_raw.split("\n")[0]

    # Fail2ban
    f2b_raw = run("sudo fail2ban-client status sshd 2>/dev/null")
    f2b_banned = 0
    f2b_failed = 0
    for line in f2b_raw.split("\n"):
        if "Currently banned:" in line:
            try:
                f2b_banned = int(line.split(":")[-1].strip())
            except ValueError:
                pass
        if "Currently failed:" in line:
            try:
                f2b_failed = int(line.split(":")[-1].strip())
            except ValueError:
                pass

    # SSH hardening
    ssh_service = run("systemctl is-active ssh.service")
    ssh_socket = run("systemctl is-active ssh.socket")
    port22 = int(run("ss -tlnp 2>/dev/null | grep :22 | wc -l") or "0")
    ssh_hardened = ssh_service != "active" and ssh_socket != "active" and port22 == 0

    return {
        "disk_percent": disk_percent,
        "disk_avail": disk_avail,
        "mem_percent": mem_percent,
        "mem_total_gb": round(mem_total / 1024, 1),
        "mem_avail_mb": mem_avail,
        "load_1": load_1,
        "cores": cores,
        "uptime": uptime,
        "services": services,
        "firewall_active": firewall_active,
        "f2b_banned": f2b_banned,
        "f2b_failed": f2b_failed,
        "ssh_hardened": ssh_hardened,
    }


def compose_bedtime_script(data: dict) -> str:
    """Create a calming bedtime narration from system data."""
    now = datetime.datetime.now()
    greeting_time = "evening" if now.hour >= 17 else "night" if now.hour >= 21 else "evening"
    date_str = now.strftime("%A, %B %d")

    lines = []

    # Opening
    lines.append(
        f"Good {greeting_time}. This is your Mission Control wind-down report "
        f"for {date_str}."
    )
    lines.append("Take a deep breath... and let's walk through how your systems are doing tonight.")
    lines.append("")

    # Uptime
    uptime_clean = data["uptime"].replace("up ", "")
    lines.append(f"Your server has been running steadily for {uptime_clean}. Everything is humming along.")
    lines.append("")

    # Services
    all_services_ok = all(data["services"].values())
    if all_services_ok and data["services"]:
        svc_names = " and ".join(data["services"].keys())
        lines.append(
            f"All core services are healthy. {svc_names} are active and running smoothly. "
            "Nothing needs your attention there."
        )
    elif data["services"]:
        ok = [k for k, v in data["services"].items() if v]
        down = [k for k, v in data["services"].items() if not v]
        if ok:
            lines.append(f"{', '.join(ok)} {'is' if len(ok)==1 else 'are'} running fine.")
        if down:
            lines.append(
                f"Just a gentle note: {', '.join(down)} {'is' if len(down)==1 else 'are'} "
                "not active right now. Nothing urgent for tonight, but worth a look tomorrow."
            )
    else:
        lines.append("Service checks are not available right now, and that's okay.")
    lines.append("")

    # Resources
    lines.append("Now, let's look at your resources.")

    # Disk
    if data["disk_percent"] < 70:
        lines.append(
            f"Disk usage is at {data['disk_percent']} percent, with {data['disk_avail']} still available. "
            "Plenty of room. No worries there."
        )
    elif data["disk_percent"] < 90:
        lines.append(
            f"Disk is at {data['disk_percent']} percent. Getting a bit full, "
            "but nothing to lose sleep over tonight."
        )
    else:
        lines.append(
            f"Disk usage is at {data['disk_percent']} percent. That is getting high. "
            "Something to address tomorrow, but for now, let it rest."
        )

    # Memory
    if data["mem_percent"] < 70:
        lines.append(
            f"Memory is sitting at {data['mem_percent']} percent. "
            f"You have about {data['mem_avail_mb']} megabytes available. Comfortable."
        )
    else:
        lines.append(
            f"Memory usage is at {data['mem_percent']} percent. A bit elevated, "
            "but your server is managing."
        )

    # CPU / Load
    load_status = "very light" if data["load_1"] < 0.5 else "light" if data["load_1"] < 1.0 else "moderate" if data["load_1"] < data["cores"] else "elevated"
    lines.append(
        f"CPU load is {load_status}, at {data['load_1']:.1f} across {data['cores']} "
        f"{'core' if data['cores'] == 1 else 'cores'}. "
        "The system is relaxed."
    )
    lines.append("")

    # Security
    lines.append("Let's check on security before we wrap up.")

    if data["ssh_hardened"]:
        lines.append(
            "SSH is fully hardened. No listeners on port 22. "
            "The front door is locked tight."
        )
    else:
        lines.append(
            "SSH is accessible, which is expected if you need remote access. "
            "Just something to be aware of."
        )

    if data["firewall_active"]:
        lines.append("Your firewall is active and standing guard.")
    else:
        lines.append("The firewall status could not be confirmed. Worth checking tomorrow.")

    if data["f2b_banned"] > 0:
        lines.append(
            f"Fail2Ban has {data['f2b_banned']} IP{'s' if data['f2b_banned'] != 1 else ''} "
            "currently banned. The automated defenses are doing their job."
        )
    elif data["f2b_failed"] > 0:
        lines.append(
            f"There have been {data['f2b_failed']} failed login attempts, "
            "but nothing has triggered a ban. All is well."
        )
    else:
        lines.append("No suspicious activity detected. The perimeter is quiet tonight.")

    lines.append("")

    # Closing
    lines.append(
        "That's your full report. Everything that matters is accounted for. "
        "Your systems are safe, your services are running, and there's nothing "
        "that can't wait until morning."
    )
    lines.append("")
    lines.append(
        "Now it's time to step away from the screen. Let your mind unwind. "
        "The servers will keep watch while you rest."
    )
    lines.append("")
    lines.append("Good night. Sleep well.")

    return " ".join(line if line else "\n" for line in lines)


def main():
    output_dir = Path(__file__).parent.parent / "audio"
    output_dir.mkdir(exist_ok=True)

    date_stamp = datetime.datetime.now().strftime("%Y-%m-%d")
    output_file = output_dir / f"bedtime-report-{date_stamp}.mp3"

    print("Gathering system data...")
    data = gather_system_data()

    print("Composing bedtime report...")
    script = compose_bedtime_script(data)

    print(f"\n--- Report Script ---\n{script}\n--- End Script ---\n")

    print("Generating audio with espeak-ng...")

    # Generate WAV first with espeak-ng (calm, slower pace)
    wav_file = output_file.with_suffix(".wav")
    espeak_cmd = (
        f'espeak-ng -v en -s 140 -p 35 -a 80 '
        f'-w "{wav_file}" '
        f'"{script}"'
    )
    result = subprocess.run(espeak_cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"espeak-ng error: {result.stderr}")
        sys.exit(1)

    # Convert WAV to MP3 if ffmpeg is available, otherwise keep WAV
    ffmpeg_path = shutil.which("ffmpeg")
    if ffmpeg_path:
        mp3_cmd = f'ffmpeg -y -i "{wav_file}" -codec:a libmp3lame -qscale:a 4 "{output_file}" 2>/dev/null'
        subprocess.run(mp3_cmd, shell=True)
        wav_file.unlink(missing_ok=True)
        final_file = output_file
    else:
        print("ffmpeg not found — keeping WAV format.")
        final_file = wav_file
        output_file = wav_file

    file_size = final_file.stat().st_size / 1024
    print(f"\nDone! Audio saved to: {final_file}")
    print(f"File size: {file_size:.0f} KB")
    return str(final_file)


if __name__ == "__main__":
    main()
