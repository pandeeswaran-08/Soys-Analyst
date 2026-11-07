with open("frontend/lib/api.ts", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # Skip the line inside fetchWithTimeout
    if "return await fetch(url," in line:
        new_lines.append(line)
    elif "await fetch(" in line:
        new_lines.append(line.replace("await fetch(", "await fetchWithTimeout("))
    else:
        new_lines.append(line)

with open("frontend/lib/api.ts", "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Replaced all fetch with fetchWithTimeout!")

