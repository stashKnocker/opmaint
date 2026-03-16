import os
import json
import requests

api_key = os.getenv("WEBFLOW_API_KEY")
blog_collection_id = os.getenv("WEBFLOW_BLOG_COLLECTION_ID")

if not api_key or not blog_collection_id:
    raise SystemExit("WEBFLOW_API_KEY or WEBFLOW_BLOG_COLLECTION_ID not set in environment.")

url = f"https://api.webflow.com/v2/collections/{blog_collection_id}/items?limit=1"
headers = {
    "Authorization": f"Bearer {api_key}",
    "accept": "application/json",
}

resp = requests.get(url, headers=headers)
resp.raise_for_status()
data = resp.json()
items = data.get("items") or []
item = items[0] if items else None

print("FIELDDATA ONLY:")
print(json.dumps((item or {}).get("fieldData", {}), indent=2))

