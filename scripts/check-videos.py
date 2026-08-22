#!/usr/bin/env python3
"""视频链接健康检查（宪章第三十六章：持续维护）

检查 3B1B 伴学板块引用的所有外部视频链接是否存活：
- B 站合集 BV1BzNLzzExg 的 P1-P4 是否存在、分 P 数量是否足够
- YouTube 原版链接是否可达（仅 HEAD 检查，不解析内容）
- 官网课程页是否可达

用法：
    python scripts/check-videos.py            # 检查全部
    python scripts/check-videos.py --quiet    # 只输出失败项

退出码：0 = 全部正常；1 = 有失效链接（供 CI 或人工排查）
"""

import io
import json
import ssl
import sys
import urllib.request

# Windows 控制台 GBK 编码兜底：强制 UTF-8 输出
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# ---------- 配置：所有需要巡检的链接集中在这里，换源只改这一处 ----------

BILI_BVID = "BV1BzNLzzExg"  # 外影译坊中文配音版合集
BILI_REQUIRED_PARTS = 4    # NN 系列需要的最少分 P 数

YOUTUBE_IDS = {
    "B1": "aircAruvnKk",
    "B2": "IHZwWFHWa-w",
    "B3": "Ilg3gGewQ5U",
    "B4": "tIeHLnjs5U8",
}

OFFICIAL_PAGES = [
    ("系列总目录", "https://www.3blue1brown.com/topics/neural-networks"),
    ("B1 课程页", "https://www.3blue1brown.com/lessons/neural-networks"),
    ("B2 课程页", "https://www.3blue1brown.com/lessons/gradient-descent"),
    ("B3 课程页", "https://www.3blue1brown.com/lessons/backpropagation"),
    ("B4 课程页", "https://www.3blue1brown.com/lessons/backpropagation-calculus"),
]

# --------------------------------------------------------------------------

CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120"}

failures: list[str] = []


def fetch(url: str, headers: dict | None = None, timeout: int = 20):
    req = urllib.request.Request(url, headers={**UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        return r.status, r.read()


def check_bilibili(quiet: bool) -> None:
    label = f"B站合集 {BILI_BVID}"
    try:
        status, body = fetch(
            f"https://api.bilibili.com/x/web-interface/view?bvid={BILI_BVID}",
            headers={"Referer": "https://www.bilibili.com/"},
        )
        data = json.load(open_dev_null(body))
        if data.get("code") != 0:
            raise RuntimeError(f"API 返回 code={data.get('code')}")
        info = data["data"]
        pages = info.get("pages", [])
        ok = len(pages) >= BILI_REQUIRED_PARTS
        msg = f"{label}: OK — 「{info.get('title')}」共 {len(pages)} 个分P，UP主 {info['owner']['name']}"
        report(ok, msg, quiet)
        if not ok:
            failures.append(f"{label}: 分P数不足（{len(pages)} < {BILI_REQUIRED_PARTS}）")
    except Exception as e:
        failures.append(f"{label}: 无法访问或解析失败 — {e}")
        report(False, f"{label}: FAILED — {e}", quiet)


def open_dev_null(body: bytes):
    import io

    return io.BytesIO(body)


def check_youtube(quiet: bool) -> None:
    # YouTube oEmbed 是官方提供的公开端点，返回 200=视频在，404=已删除
    for ep, vid in YOUTUBE_IDS.items():
        label = f"YouTube {ep} ({vid})"
        try:
            status, body = fetch(
                f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json",
                timeout=15,
            )
            ok = status == 200
            title = json.loads(body).get("title", "")[:50]
            report(ok, f"{label}: {'OK — ' + title if ok else 'NOT FOUND'}", quiet)
            if not ok:
                failures.append(f"{label}: 视频不存在或已下架")
        except urllib.error.HTTPError as e:
            failures.append(f"{label}: HTTP {e.code}")
            report(False, f"{label}: HTTP {e.code}", quiet)
        except Exception as e:
            failures.append(f"{label}: {e}")
            report(False, f"{label}: FAILED — {e}", quiet)


def check_official(quiet: bool) -> None:
    for name, url in OFFICIAL_PAGES:
        label = f"官网 {name}"
        try:
            status, _ = fetch(url, timeout=15)
            ok = status == 200
            report(ok, f"{label}: OK" if ok else f"{label}: HTTP {status}", quiet)
            if not ok:
                failures.append(f"{label}: HTTP {status}")
        except Exception as e:
            failures.append(f"{label}: {e}")
            report(False, f"{label}: FAILED — {e}", quiet)


def report(ok: bool, msg: str, quiet: bool) -> None:
    if not quiet or not ok:
        print(("✓ " if ok else "✗ ") + msg)


def main() -> int:
    quiet = "--quiet" in sys.argv
    print("== 视频链接健康检查 ==")
    check_bilibili(quiet)
    check_youtube(quiet)
    check_official(quiet)

    print()
    if failures:
        print(f"结果：{len(failures)} 项失败")
        for f in failures:
            print("  -", f)
        print("\n处理建议：到 content/ai/nn/3blue1brown/index.md 更新「在哪里看视频」区块，")
        print("并在 scripts/check-videos.py 顶部的配置区替换新链接。")
        return 1
    print("结果：全部链接正常")
    return 0


if __name__ == "__main__":
    sys.exit(main())
