#!/bin/bash
# 可复用的合并冲突解决脚本：agent-log.md 保留双方条目
cd "D:\Study\ai-from-scratch"
python - <<'EOF'
import re
p = 'logs/agent-log.md'
s = open(p, encoding='utf-8').read()
def resolve(m):
    ours, theirs = m.group(1), m.group(2)
    return ours + "\n" + theirs
resolved = re.sub(r'<<<<<<< HEAD\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n', resolve, s, flags=re.DOTALL)
open(p, 'w', encoding='utf-8').write(resolved)
print("resolved:", '<<<<<<<' not in resolved)
EOF
git add logs/agent-log.md
git commit --no-edit | tail -1
