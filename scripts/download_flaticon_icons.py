#!/usr/bin/env python3
"""Download Flaticon PNG icons listed in scripts/flaticon_map.json."""

from __future__ import annotations

import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAP = ROOT / "scripts" / "flaticon_map.json"
IMG = ROOT / "assets" / "images"
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)


def download(url: str) -> bytes | None:
    if not url.startswith("http"):
        return None
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
    except Exception as exc:  # noqa: BLE001
        print(f"FAIL {url}: {exc}")
        return None
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        print(f"FAIL not png: {url}")
        return None
    return data


def main() -> None:
    mapping = json.loads(MAP.read_text(encoding="utf-8"))
    ok = 0
    for key, meta in mapping.items():
        url = meta.get("url") if isinstance(meta, dict) else None
        if not url or not str(url).startswith("http"):
            print(f"SKIP {key} ({url})")
            continue
        data = download(url)
        if not data:
            continue
        out = IMG / f"{key}.png"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(data)
        ok += 1
        print(f"OK {key}")
    print(f"Downloaded {ok}/{len(mapping)}")


if __name__ == "__main__":
    main()
