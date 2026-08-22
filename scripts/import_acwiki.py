#!/usr/bin/env python3
"""Ac-Wiki → 零基础 AI 学堂 本地镜像导入脚本（Task: QNX-ACWIKI-001）

用法：
    python scripts/import_acwiki.py <Ac-Wiki源docs目录> <输出目录>

示例：
    python scripts/import_acwiki.py /tmp/acwiki-extract/Ac-Wiki-main/docs content/qingnian/ac-wiki

功能（详见 logs/agent-log.md QNX-ACWIKI-001 条目）：
1. 筛选：排除 superpowers/、community-hub/、blog/posts/hello-ac-wiki.md、CNAME、robots.txt
2. 改名：README.md → index.md；"cyber security" → "cyber-security"
3. frontmatter 注入：title（首个 H1）/ description（首段截断）/ last_verified / source；
   博客文保留原有 authors/tags/date，仅补 title/description
4. MkDocs Material 语法转换：
   - 单行 `!!! abstract "..."` 横幅 → Obsidian 风格 `[!tip]` 引用块
   - 多行 `???+ info` / `??? tip "T"` 折叠块 → `[!info]` / `[!tip]- T`
   - HTML 注释（含注释掉的图片）→ `[!note]-` 可见备注（避免 OFM html-embed 崩溃）
   - 删 :material-*: 图标、{ .lg .middle }、grid cards div 包裹
   - 卡片网格降级为「链接 | 说明」表格
   - 去 <br>/<BR>
   - 内链重写：README.md→index.md、%20→-
   - 相对资产引用 → 库根绝对路径（绕开 CrawlLinks 对非 md 资产的重定位）
5. 博客 frontmatter 的嵌套 date 拍平为 ISO 字符串
5. 资产目录整树复制
"""
import re
import sys
import shutil
from pathlib import Path

EXCLUDE_DIRS = {"superpowers", "community-hub"}
EXCLUDE_FILES = {"CNAME", "robots.txt", "hello-ac-wiki.md"}
ASSET_EXTS = {".png", ".jpg", ".jpeg", ".svg", ".gif", ".webp", ".pdf"}

# ── 路径处理 ────────────────────────────────────────────────────────────────


def map_path(src_rel: Path) -> Path:
    """源相对路径 → 目标相对路径（改名规则）"""
    parts = list(src_rel.parts)
    parts = ["cyber-security" if p == "cyber security" else p for p in parts]
    name = parts[-1]
    if name == "README.md":
        name = "index.md"
    return Path(*parts[:-1]) / name


def rewrite_link(link: str) -> str:
    """内链重写：README.md→index.md、%20→-"""
    out = link.replace("%20", "-")
    # 重写指向 README.md 的路径段（./README.md、../xxx/README.md 等）
    if re.search(r"(?:^|/)README\.md$", out):
        out = re.sub(r"README\.md$", "index.md", out)
    return out


# ── frontmatter 生成 ────────────────────────────────────────────────────────


def strip_md(text: str) -> str:
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)  # [t](u) → t
    text = re.sub(r"[*_`~#>|]", "", text)
    text = re.sub(r"<[^>]+>", "", text)
    return re.sub(r"\s+", " ", text).strip()


def first_h1(body: str) -> str | None:
    m = re.search(r"^#\s+(.+?)\s*$", body, flags=re.M)
    if not m:
        return None
    return strip_md(m.group(1)).strip() or None


def first_para_desc(body: str) -> str | None:
    # 跳过代码块/引用/表格/列表，找第一段普通文本
    in_fence = False
    for line in body.splitlines():
        if line.lstrip().startswith("```"):
            in_fence = not in_fence
            continue
        if in_fence or not line.strip():
            continue
        s = line.strip()
        if s.startswith(("#", ">", "|", "-", "*", "!", "?", "<")):
            continue
        desc = strip_md(s)[:100]
        if len(desc) >= 8:
            return desc
    return None


def build_frontmatter(title: str, desc: str, extra_lines: list[str]) -> str:
    def esc(s: str) -> str:
        # YAML 双引号标量：转义反斜杠与双引号
        return s.replace(chr(92), chr(92) * 2).replace('"', "'")
    lines = ["---", f'title: "{esc(title)}"', f'description: "{esc(desc)}"',
             "last_verified: 2026-08-22",
             'source: "Ac-Wiki (https://github.com/Ac-Wiki/Ac-Wiki)，CC BY 4.0"']
    lines += extra_lines + ["---", ""]
    return "\n".join(lines)


# ── MkDocs 语法转换 ─────────────────────────────────────────────────────────


def convert_single_line_admonition(line: str) -> str:
    """`!!! abstract "📌 相关推荐" - [a](b) - [c](d)` → 引用块形式。
    上游这批横幅把列表压在同一行（渲染时被 Material 当纯文本），转换时拆成真正的列表。"""
    m = re.match(r'^!!!\s+\w+\s+"?([^"]*?)"?\s*(.*)$', line)
    if not m:
        return line
    heading = m.group(1).strip() or "相关推荐"
    rest = m.group(2).strip()
    items = re.findall(r"- (\[[^\]]+\]\([^)]+\))", rest)
    out = [f"> [!tip] {heading}", ">"]
    if items:
        out += [f"> - {it}" for it in items]
    else:
        # 无列表内容时保留剩余文本
        rest_clean = rewrite_link(rest)
        out.append(f"> {rest_clean}" if rest_clean else ">")
    return "\n".join(out)


def convert_collapsible_blocks(text: str) -> str:
    """多行 ???/!!! 块 → [!type]- 引用块。逐行扫描，把缩进内容反缩进为引用行。"""
    lines = text.splitlines()
    out = []
    i = 0
    while i < len(lines):
        line = lines[i]
        m = re.match(r'^(\?\?\?\+?|!!!)\s+(\w+)(?:\s+"([^"]*)")?\s*$', line)
        if not m:
            out.append(line)
            i += 1
            continue
        marker, kind, title = m.group(1), m.group(2), m.group(3)
        foldable = marker.startswith("???")
        obs_kind = {"info": "info", "tip": "tip", "note": "note",
                    "warning": "warning", "abstract": "abstract"}.get(kind, "info")
        head = f"> [!{obs_kind}]- {title}" if foldable and title else \
               (f"> [!{obs_kind}]-" if foldable else
                (f"> [!{obs_kind}] {title}" if title else f"> [!{obs_kind}]"))
        out.append(head)
        i += 1
        prev_blank = True
        while i < len(lines):
            cur = lines[i]
            if cur.strip():
                if not cur.startswith(("    ", "\t")) and not cur.startswith("???") \
                        and not cur.startswith("!!!"):
                    break  # 缩进块结束
                if cur.startswith(("???", "!!!")):
                    break
                content = cur[4:] if cur.startswith("    ") else cur.lstrip("\t")
                if content.strip():
                    if prev_blank:
                        out.append("> ")
                    out.append(f"> {content}")
                    prev_blank = False
                else:
                    out.append(">")
                    prev_blank = True
                i += 1
            else:
                # 空行：向后看是否还有缩进内容
                nxt = i + 1
                while nxt < len(lines) and not lines[nxt].strip():
                    nxt += 1
                if nxt < len(lines) and (lines[nxt].startswith("    ")
                                         or lines[nxt].startswith("\t")):
                    out.append(">")
                    prev_blank = True
                    i += 1
                else:
                    break
        out.append("")
    return "\n".join(out)


def degrade_grid_cards(text: str) -> str:
    """Material grid-cards div → 「标题 | 说明」表格。"""
    def card_to_row(card_text: str) -> tuple[str, str] | None:
        lm = re.search(r"\[([^\]]+)\]\(([^)]+)\)", card_text)
        if not lm:
            return None
        label, url = lm.group(1).replace("**", ""), rewrite_link(lm.group(2))
        body = card_text[lm.end():]
        body = re.sub(r":material-[a-z0-9-]+:", "", body)
        body = re.sub(r"\{[^}]*\}", "", body)
        body = re.sub(r"^#{1,6}\s*", "", body, flags=re.M)
        body = re.sub(r"<[^>]+>", "", body)
        body = re.sub(r"\*\*([^*]+)\*\*", r"\1", body)
        desc = strip_md(body.replace("***", "").replace("---", ""))[:80]
        return (f"[**{label}**]({url})", desc)

    out = []
    idx = 0
    pattern = re.compile(r'<div class="grid cards"[^>]*>', re.I)
    while True:
        m = pattern.search(text, idx)
        if not m:
            out.append(text[idx:])
            break
        out.append(text[idx:m.start()])
        depth, j = 1, m.end()
        while j < len(text) and depth > 0:
            nxt_open = text.find("<div", j)
            nxt_close = text.find("</div>", j)
            if nxt_close == -1:
                j = len(text)
                break
            if nxt_open != -1 and nxt_open < nxt_close:
                depth += 1
                j = nxt_open + 4
            else:
                depth -= 1
                j = nxt_close + 6
        block = text[m.end(): j - 6]
        # 按 top-level 列表项切卡片（每卡以 "- " 开头）
        cards, cur = [], []
        for ln in block.splitlines():
            if re.match(r"^- ", ln):
                if cur:
                    cards.append("\n".join(cur))
                cur = [ln]
            elif cur is not None:
                cur.append(ln)
        if cur:
            cards.append("\n".join(cur))
        rows = [r for c in cards if (r := card_to_row(c))]
        if rows:
            out.append("| 入口 | 说明 |\n| --- | --- |\n")
            out += [f"| {a} | {b} |\n" for a, b in rows]
        out.append("\n")
        idx = j
    return "".join(out)


def convert_body(raw: str) -> str:
    text = raw
    # 0) 注释掉的图片会让 OFM 的 html-embed 替换崩溃（null.data），改为可见备注；
    #    `<!-- more -->` 是摘要分隔符保留；含链接/标题/图片的注释转为备注（有信息量），
    #    其余纯文本注释（TODO、损坏图注等）丢弃
    def _comment_to_note(m: re.Match) -> str:
        body = m.group(0)[4:-3].strip()
        if not body:
            return ""
        if body == "more":
            return m.group(0)
        if re.search(r"!\[[^\]]*\]\([^)]*\)|<img\s|\[[^\]]+\]\([^)]+\)|^#{1,6}\s",
                     body, flags=re.M):
            quoted = "\n".join("> " + ln for ln in body.splitlines())
            return f"> [!note]- 上游备注（原文注释）\n>\n{quoted}\n"
        return ""
    text = re.sub(r"<!--[\s\S]*?-->", _comment_to_note, text)

    # 1) 单行 !!! admonition（含同行列表）
    lines = []
    for ln in text.splitlines():
        if re.match(r'^!!!\s+\w+', ln) and ("[" in ln or ln.count('"') >= 2) and "]" in ln:
            lines.append(convert_single_line_admonition(ln))
        else:
            lines.append(ln)
    text = "\n".join(lines)

    # 2) 多行折叠块
    text = convert_collapsible_blocks(text)

    # 3) grid cards 降级
    text = degrade_grid_cards(text)

    # 4) 清理 Material 专属语法
    text = re.sub(r":material-[a-z0-9-]+:\s*", "", text)
    text = re.sub(r"\s*\{ \.lg \.middle \}", "", text)
    text = re.sub(r"</div>\s*", "", text)
    text = re.sub(r"<br\s*/?>|<BR\s*/?>", " ", text)

    # 5) 内链重写
    text = re.sub(
        r"\]\(([^)#\s]+?)(#[^)]*)?\)",
        lambda m: "]({}{})".format(rewrite_link(m.group(1)), m.group(2) or ""),
        text,
    )
    # 6) 已排除页面的兜底：贡献指南指回上游仓库
    text = text.replace(
        "./community-hub/CONTRIBUTING.md",
        "https://github.com/Ac-Wiki/Ac-Wiki/blob/main/docs/community-hub/CONTRIBUTING.md",
    )
    return text


def absolutize_assets(text: str, md_path: Path, mirror_root: Path) -> str:
    """相对资产引用 → 库根绝对路径（Quartz 的 CrawlLinks 会把相对资产路径
    重定位到站点根，导致深层目录下的图片/PDF 404；绝对路径可正确解析）。"""
    asset_exts = (".png", ".jpg", ".jpeg", ".svg", ".gif", ".webp", ".pdf")

    def fix(m: re.Match) -> str:
        pre, target, post = m.group(1), m.group(2), m.group(3)
        p = target.split("#")[0]
        if p.startswith(("http", "mailto:", "/")) or not p.lower().endswith(asset_exts):
            return m.group(0)
        resolved = (md_path.parent / p).resolve()
        try:
            rel = resolved.relative_to(mirror_root.resolve())
        except ValueError:
            return m.group(0)
        return f"{pre}/qingnian/ac-wiki/{rel.as_posix()}{post}"

    text = re.sub(r"(\]\()([^)#\s]+)(\))", fix, text)  # markdown 链接/图片
    text = re.sub(r'((?:src|href)=")([^"#]+)(")', fix, text)  # 内联 HTML 属性
    return text


# ── 主流程 ──────────────────────────────────────────────────────────────────


def process_md(src: Path, dst: Path, mirror_root: Path) -> None:
    raw = src.read_text(encoding="utf-8")

    # 博客文已有 frontmatter：保留 authors/tags，date 拍平为 ISO 字符串
    # （Quartz CreatedModifiedDate 不认 MkDocs 嵌套 date.created 结构）
    extra: list[str] = []
    if raw.startswith("---"):
        end = raw.index("---", 3)
        fm_block = raw[3:end]
        body = raw[end + 3:].lstrip("\n")
        keep = []
        for key in ("authors", "date", "tags"):
            km = re.search(rf"^{key}:.*?(?=^\w+:|\Z)", fm_block, flags=re.M | re.S)
            if km:
                keep.append(km.group(0).rstrip())
        # date: {created: X, updated: Y} → created: X / updated: Y
        flattened: list[str] = []
        for block in keep:
            dm = re.match(r"^date:\s*\n(\s+created:\s*(\S+))\s*\n(?:\s+updated:\s*(\S+)\s*\n?)?",
                          block + "\n")
            if dm:
                flattened.append(f"created: {dm.group(2)}")
                if dm.group(3):
                    flattened.append(f"updated: {dm.group(3)}")
            else:
                flattened.append(block)
        extra = flattened
        merged_title = first_h1(body)
        merged_desc = first_para_desc(body)
    else:
        body = raw
        merged_title = first_h1(body)
        merged_desc = first_para_desc(body)

    converted = convert_body(body)
    converted = absolutize_assets(converted, dst, mirror_root)
    fm = build_frontmatter(merged_title or dst.stem, merged_desc or "（暂无摘要）", extra)

    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(fm + converted.lstrip("\n"), encoding="utf-8")


def main() -> None:
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    src_root = Path(sys.argv[1])
    dst_root = Path(sys.argv[2])

    n_md = n_asset = n_skip = 0
    for src in sorted(src_root.rglob("*")):
        rel = src.relative_to(src_root)
        if rel.parts[0] in EXCLUDE_DIRS or rel.name in EXCLUDE_FILES:
            n_skip += 1
            continue
        mapped = map_path(rel)
        dst = dst_root / mapped
        if src.is_dir():
            continue
        if src.suffix.lower() == ".md":
            process_md(src, dst, dst_root)
            n_md += 1
        elif src.suffix.lower() in ASSET_EXTS:
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
            n_asset += 1
        else:
            n_skip += 1
    print(f"markdown: {n_md}, assets: {n_asset}, skipped: {n_skip}")


if __name__ == "__main__":
    main()
