#!/usr/bin/env python3
import argparse
import json
import sys
import urllib.parse
import urllib.request

API_URL = "https://www.googleapis.com/books/v1/volumes"


def read_titles(file_path, titles):
    if file_path:
        with open(file_path, "r", encoding="utf-8") as handle:
            raw = handle.read().splitlines()
    elif titles:
        raw = titles
    else:
        raw = sys.stdin.read().splitlines()

    cleaned = []
    for line in raw:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        cleaned.append(line)
    return cleaned


def fetch_book_data(title, max_results, api_key):
    query = f'intitle:"{title}"'
    params = {"q": query, "maxResults": max_results}
    if api_key:
        params["key"] = api_key
    url = f"{API_URL}?{urllib.parse.urlencode(params)}"
    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            return json.load(response)
    except Exception as exc:
        print(f"Error: {title}: {exc}", file=sys.stderr)
        return {}


def pick_best_match(payload):
    items = payload.get("items") or []
    if not items:
        return None, None, None

    best = items[0]
    book_id = best.get("id")
    volume = best.get("volumeInfo") or {}
    matched_title = volume.get("title")
    authors = volume.get("authors") or []
    return book_id, matched_title, authors


def main():
    parser = argparse.ArgumentParser(
        description="Look up Google Books volume IDs from a list of titles."
    )
    parser.add_argument(
        "titles",
        nargs="*",
        help="Book titles. If omitted, pass --file or pipe titles via stdin.",
    )
    parser.add_argument(
        "--file",
        "-f",
        help="Path to a newline-delimited list of titles.",
    )
    parser.add_argument(
        "--max-results",
        "-m",
        type=int,
        default=3,
        help="Number of results to fetch per title (default: 3).",
    )
    parser.add_argument(
        "--api-key",
        help="Optional Google Books API key.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output JSON instead of tab-delimited text.",
    )
    args = parser.parse_args()

    titles = read_titles(args.file, args.titles)
    if not titles:
        print("No titles provided.", file=sys.stderr)
        return 1

    results = []
    for title in titles:
        payload = fetch_book_data(title, args.max_results, args.api_key)
        book_id, matched_title, authors = pick_best_match(payload)
        results.append(
            {
                "input_title": title,
                "id": book_id,
                "matched_title": matched_title,
                "authors": authors,
            }
        )

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        for item in results:
            authors = ", ".join(item["authors"] or [])
            line = [
                item["input_title"] or "",
                item["id"] or "",
                item["matched_title"] or "",
                authors,
            ]
            print("\t".join(line))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
