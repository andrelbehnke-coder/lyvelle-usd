#!/usr/bin/env python3
"""
Cria o projeto na Vercel e faz o deploy de producao — usando so a API REST
(essa maquina nao tem Node/npm/Vercel CLI).

Token: lido de $VERCEL_TOKEN ou do arquivo ~/.vercel-token
Gere em: https://vercel.com/account/tokens

Uso:  python3 deploy.py [nome-do-projeto]
"""
import hashlib
import json
import os
import sys
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
TEAM_ID = "team_ecA9rxxXw75T1y7yPUiGDF00"  # mesmo time do dyson-eua-sirius
PROJECT = sys.argv[1] if len(sys.argv) > 1 else "lyvelle-usd"
API = "https://api.vercel.com"
SKIP = {".DS_Store", ".textClipping"}


def get_token():
    tok = os.environ.get("VERCEL_TOKEN", "").strip()
    if tok:
        return tok
    path = os.path.expanduser("~/.vercel-token")
    if os.path.exists(path):
        with open(path) as f:
            tok = f.read().strip()
        if tok:
            return tok
    sys.exit(
        "Sem token. Gere em https://vercel.com/account/tokens e rode:\n"
        "  echo 'SEU_TOKEN' > ~/.vercel-token && chmod 600 ~/.vercel-token"
    )


TOKEN = get_token()


def call(method, path, body=None, raw=None, extra_headers=None):
    url = API + path
    url += ("&" if "?" in path else "?") + "teamId=" + TEAM_ID
    headers = {"Authorization": "Bearer " + TOKEN}
    if raw is not None:
        data = raw
        headers["Content-Length"] = str(len(raw))
    elif body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json"
    else:
        data = None
    if extra_headers:
        headers.update(extra_headers)
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            payload = r.read().decode()
            return json.loads(payload) if payload else {}
    except urllib.error.HTTPError as e:
        detail = e.read().decode()
        raise SystemExit("HTTP %s em %s %s\n%s" % (e.code, method, path, detail))


def collect():
    out = []
    for base, dirs, names in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in (".git", "node_modules", ".vercel")]
        for n in names:
            if n in SKIP or n.endswith(".textClipping") or n == os.path.basename(__file__):
                continue
            full = os.path.join(base, n)
            rel = os.path.relpath(full, ROOT)
            with open(full, "rb") as f:
                blob = f.read()
            out.append({"rel": rel, "blob": blob, "sha": hashlib.sha1(blob).hexdigest()})
    return sorted(out, key=lambda x: x["rel"])


def main():
    files = collect()
    total = sum(len(f["blob"]) for f in files)
    print("%d arquivo(s), %.1f MB" % (len(files), total / 1048576.0))

    print("\n1/3  projeto '%s'" % PROJECT)
    existing = None
    try:
        existing = call("GET", "/v9/projects/" + PROJECT)
    except SystemExit:
        pass
    if existing and existing.get("id"):
        print("     ja existe (id %s) — reaproveitando" % existing["id"])
    else:
        created = call("POST", "/v11/projects", {"name": PROJECT, "framework": None})
        print("     criado (id %s)" % created.get("id"))

    print("\n2/3  upload")
    for i, f in enumerate(files, 1):
        call("POST", "/v2/files", raw=f["blob"],
             extra_headers={"x-vercel-digest": f["sha"],
                            "Content-Type": "application/octet-stream"})
        print("     [%2d/%d] %s" % (i, len(files), f["rel"]))

    print("\n3/3  deploy de producao")
    dep = call("POST", "/v13/deployments", {
        "name": PROJECT,
        "project": PROJECT,
        "target": "production",
        "files": [{"file": f["rel"], "sha": f["sha"], "size": len(f["blob"])} for f in files],
        "projectSettings": {"framework": None, "buildCommand": None,
                            "outputDirectory": None, "installCommand": None},
    })

    print("\nOK")
    print("  deploy: https://" + dep.get("url", "?"))
    for alias in dep.get("alias", []) or []:
        print("  alias:  https://" + alias)
    print("  painel: https://vercel.com/%s/%s" % (dep.get("ownerId", ""), PROJECT))


if __name__ == "__main__":
    main()
