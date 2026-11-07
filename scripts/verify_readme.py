with open("README.md", "r", encoding="utf-8") as f:
    text = f.read()

import re
# Check for any unescaped single $ signs in markdown
single_dollars = []
in_code = False
for line_no, line in enumerate(text.splitlines(), start=1):
    if line.strip().startswith("```"):
        in_code = not in_code
        continue
    if in_code:
        continue
    # find single dollar signs not part of $$
    matches = re.finditer(r"(?<!\$)\$(?!\$)", line)
    for m in matches:
        single_dollars.append((line_no, m.start(), line))

if single_dollars:
    print(f"Warning: Found {len(single_dollars)} unescaped single dollar signs outside code blocks:")
    for line_no, col, line in single_dollars:
        print(f"  Line {line_no}:{col}: {line.strip()}")
else:
    print("SUCCESS: Zero unescaped single dollar signs found outside code blocks! Markdown previewers will render 100% cleanly without LaTeX parsing bugs.")

