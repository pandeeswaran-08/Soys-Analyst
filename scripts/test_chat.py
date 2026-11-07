import requests
import json

url = "http://localhost:8000/chat"

print("--- Testing non-streaming ---")
try:
    r = requests.post(url, json={"message": "Indore spot is 4900, should we buy?", "stream": False}, timeout=10)
    print("Status:", r.status_code)
    print("Response JSON keys:", list(r.json().keys()))
    print("Reply snippet:", r.json().get("reply", "")[:120])
except Exception as e:
    print("Error:", e)

print("\n--- Testing streaming ---")
try:
    r = requests.post(url, json={"message": "Indore spot is 4900, should we buy?", "stream": True}, stream=True, timeout=10)
    print("Status:", r.status_code)
    count = 0
    for line in r.iter_lines():
        if line:
            decoded = line.decode("utf-8")
            if decoded.startswith("data: "):
                data = json.loads(decoded[6:])
                count += 1
                if count <= 5:
                    print("Event sample:", data)
    print(f"Total stream events received: {count}")
except Exception as e:
    print("Error:", e)

