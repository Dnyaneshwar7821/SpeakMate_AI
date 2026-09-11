import json

target_file = r"C:\Users\hp\.gemini\antigravity-ide\brain\1a1a05a2-e099-4628-9d68-9b3302307e64\.system_generated\logs\transcript_full.jsonl"
with open(target_file, "r", encoding="utf-8") as f, open("out.txt", "w", encoding="utf-8") as out:
    for line in f:
        data = json.loads(line)
        if data.get("type") == "VIEW_FILE":
            content = data.get("content", "")
            if "SchoolTeacherServiceImpl.java" in content:
                for ln in content.split("\n")[:10]:
                    if "Showing lines" in ln or "Total Lines" in ln:
                        out.write(f"Step {data.get('step_index')}: {ln}\n")
