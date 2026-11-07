import re
import os

FILES_TO_FIX = [
    r"frontend\app\dashboard\agent\page.tsx",
    r"frontend\app\dashboard\audit-logs\page.tsx",
    r"frontend\app\dashboard\basis\page.tsx",
    r"frontend\app\dashboard\crush-margin\page.tsx",
    r"frontend\app\dashboard\documents\page.tsx",
    r"frontend\app\dashboard\forecasting\page.tsx",
    r"frontend\app\dashboard\inventory\page.tsx",
    r"frontend\app\dashboard\landed-cost\page.tsx",
    r"frontend\app\dashboard\risk\page.tsx",
    r"frontend\app\dashboard\stress-test\page.tsx",
    r"frontend\components\dashboard\basis-table.tsx",
    r"frontend\components\dashboard\crush-margin-chart.tsx",
    r"frontend\components\dashboard\monte-carlo-chart.tsx",
    r"frontend\components\layout\terminal-mockup.tsx",
]

REPLACEMENTS = [
    # Slate backgrounds
    (r"\bbg-slate-950/(40|50|60|70|75|80|90)\b", "bg-[var(--surface)]"),
    (r"\bbg-slate-950\b", "bg-[var(--surface)]"),
    (r"\bbg-slate-900/(40|50|60|70|75|80|85|90)\b", "bg-[var(--surface)]"),
    (r"\bbg-slate-900\b", "bg-[var(--surface)]"),
    
    # Hover states
    (r"\bhover:bg-slate-800/(40|50|60|80)\b", "hover:bg-[var(--bg)]"),
    (r"\bhover:bg-slate-800\b", "hover:bg-[var(--bg)]"),
    (r"\bhover:border-slate-700\b", "hover:border-[var(--text-muted)]"),

    # Slate borders
    (r"\bborder-slate-800/(40|50|60|70|80|90)\b", "border-[var(--border)]"),
    (r"\bborder-slate-800\b", "border-[var(--border)]"),
    (r"\bborder-slate-700/(40|50|60|70|80|90)\b", "border-[var(--border)]"),
    (r"\bborder-slate-700\b", "border-[var(--border)]"),

    # Slate texts
    (r"\btext-slate-100\b", "text-[var(--text)]"),
    (r"\btext-slate-200\b", "text-[var(--text)]"),
    (r"\btext-slate-300\b", "text-[var(--text)]"),
    (r"\btext-slate-400\b", "text-[var(--text-muted)]"),
    (r"\btext-slate-500\b", "text-[var(--text-muted)]"),
    (r"\bhover:text-slate-200\b", "hover:text-[var(--text)]"),
    (r"\bplaceholder:text-slate-500\b", "placeholder:text-[var(--text-muted)]"),

    # Emerald to ChatGPT brand #10A37F
    (r"\btext-emerald-400\b", "text-[#10A37F]"),
    (r"\btext-emerald-500\b", "text-[#10A37F]"),
    (r"\btext-emerald-300\b", "text-[#10A37F]"),
    (r"\bbg-emerald-600\b", "bg-[#10A37F]"),
    (r"\bhover:bg-emerald-500\b", "hover:bg-[#0D8A6D]"),
    (r"\bhover:bg-emerald-700\b", "hover:bg-[#0D8A6D]"),
    (r"\bbg-emerald-500/(10|20)\b", "bg-[#10A37F]/10"),
    (r"\bborder-emerald-500/(30|40|50)\b", "border-[#10A37F]/30"),
    (r"\bfocus:border-emerald-500/50\b", "focus:border-[#10A37F]"),

    # Amber to Warning #F5A623
    (r"\btext-amber-400\b", "text-[#F5A623]"),
    (r"\btext-amber-500\b", "text-[#F5A623]"),
    (r"\btext-amber-300\b", "text-[#F5A623]"),
    (r"\bbg-amber-500/(10|20)\b", "bg-[#F5A623]/10"),
    (r"\bborder-amber-500/(30|40)\b", "border-[#F5A623]/30"),

    # Rose / Red to Error #EF4146
    (r"\btext-rose-400\b", "text-[#EF4146]"),
    (r"\btext-rose-500\b", "text-[#EF4146]"),
    (r"\btext-red-400\b", "text-[#EF4146]"),
    (r"\btext-red-500\b", "text-[#EF4146]"),
    (r"\bbg-rose-500/(10|20|40)\b", "bg-[#EF4146]/20"),
    (r"\bborder-rose-500/(30|40)\b", "border-[#EF4146]/30"),

    # Blue / Sky to #10A37F
    (r"\btext-blue-400\b", "text-[#10A37F]"),
    (r"\btext-sky-400\b", "text-[#10A37F]"),
    (r"\bbg-blue-500\b", "bg-[#10A37F]"),
]

def process_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original = content
    for pattern, repl in REPLACEMENTS:
        content = re.sub(pattern, repl, content)

    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated: {filepath}")
    else:
        print(f"No changes needed: {filepath}")

for f in FILES_TO_FIX:
    process_file(f)

print("Theme audit & token replacement complete!")

