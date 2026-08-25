#!/usr/bin/env python3
"""
Build/extend data/symbols.json from Yahoo Finance.

Behavior:
- If symbols.json is missing, invalid, or empty: build the initial universe.
- Otherwise: fetch the current US/JP/KR universe and append only new symbols.
- Existing records are never deleted or reordered.
- searchKeywords contains the Yahoo symbol plus names returned by Yahoo.
- Optional data/aliases.json can add Korean names, translations, abbreviations,
  or any user-defined search terms.

Yahoo Finance's screener currently limits one request to 250 results, so the
script paginates until Yahoo returns fewer than PAGE_SIZE results.
"""

from __future__ import annotations

import json
import logging
import re
import sys
from pathlib import Path
from typing import Any

import yfinance as yf

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
SYMBOLS_FILE = DATA_DIR / "symbols.json"
ALIASES_FILE = DATA_DIR / "aliases.json"

PAGE_SIZE = 250
MARKETS = {
    "US": "us",
    "JP": "jp",
    "KR": "kr",
}

# Keep this true if you want ETFs such as VOO to be discoverable.
QUOTE_TYPES = ("EQUITY", "ETF")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
log = logging.getLogger("update-symbols")


def normalize(value: Any) -> str:
    """Normalize a search keyword to lowercase and collapse whitespace."""
    if value is None:
        return ""
    value = str(value).strip().lower()
    value = re.sub(r"\s+", " ", value)
    return value


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default

    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError) as exc:
        log.warning("Could not read %s: %s", path, exc)
        return default


def save_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")

    with tmp.open("w", encoding="utf-8", newline="\n") as f:
        json.dump(value, f, ensure_ascii=False, indent=2)
        f.write("\n")

    tmp.replace(path)


def load_existing() -> list[dict[str, Any]]:
    data = load_json(SYMBOLS_FILE, [])

    if not isinstance(data, list):
        raise ValueError(f"{SYMBOLS_FILE} must contain a JSON array.")

    cleaned: list[dict[str, Any]] = []
    for item in data:
        if not isinstance(item, dict):
            continue

        symbol = normalize(item.get("symbol"))
        if not symbol:
            continue

        keywords = item.get("searchKeywords", [])
        if not isinstance(keywords, list):
            keywords = []

        cleaned.append(
            {
                **item,
                "symbol": symbol.upper(),
                "searchKeywords": unique_keywords(
                    [symbol, *keywords]
                ),
            }
        )

    return cleaned


def load_aliases() -> dict[str, list[str]]:
    """
    aliases.json format:

    {
      "005930.KS": ["삼성전자", "삼성"],
      "AAPL": ["애플", "애플 주식"],
      "2805.T": ["키코만", "키코만 주식"]
    }
    """
    data = load_json(ALIASES_FILE, {})

    if not isinstance(data, dict):
        log.warning("%s is not an object; ignoring it.", ALIASES_FILE)
        return {}

    aliases: dict[str, list[str]] = {}
    for symbol, values in data.items():
        if isinstance(values, str):
            values = [values]
        if isinstance(values, list):
            aliases[str(symbol).upper()] = [
                str(v) for v in values if str(v).strip()
            ]

    return aliases


def unique_keywords(values: list[Any]) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()

    for value in values:
        keyword = normalize(value)
        if not keyword or keyword in seen:
            continue
        seen.add(keyword)
        result.append(keyword)

    return result


def build_query(quote_type: str, region: str):
    if quote_type == "EQUITY":
        return yf.EquityQuery("eq", ["region", region])
    if quote_type == "ETF":
        return yf.ETFQuery("eq", ["region", region])
    raise ValueError(f"Unsupported quote type: {quote_type}")


def fetch_market(region: str, quote_type: str) -> list[dict[str, Any]]:
    """
    Fetch all Yahoo Finance results for one region/quote type.
    Yahoo's screener API has a maximum page size of 250.
    """
    query = build_query(quote_type, region)
    offset = 0
    records: list[dict[str, Any]] = []

    while True:
        log.info(
            "Fetching region=%s quoteType=%s offset=%d",
            region,
            quote_type,
            offset,
        )

        response = yf.screen(
            query,
            offset=offset,
            size=PAGE_SIZE,
            sortField="ticker",
            sortAsc=True,
        )

        quotes = response.get("quotes", []) if isinstance(response, dict) else []
        if not quotes:
            break

        records.extend(q for q in quotes if isinstance(q, dict))

        log.info("  received %d records", len(quotes))

        if len(quotes) < PAGE_SIZE:
            break

        offset += PAGE_SIZE

    return records


def make_record(
    quote: dict[str, Any],
    aliases: dict[str, list[str]],
) -> dict[str, Any] | None:
    raw_symbol = quote.get("symbol")
    if not raw_symbol:
        return None

    symbol = str(raw_symbol).strip().upper()

    # Yahoo can expose multiple name fields depending on security type.
    names = [
        quote.get("shortName"),
        quote.get("longName"),
        quote.get("displayName"),
        quote.get("name"),
    ]

    # Symbol and its unsuffixed form are both useful in a search box.
    symbol_variants = [symbol]
    if symbol.endswith(".KS") or symbol.endswith(".KQ") or symbol.endswith(".T"):
        symbol_variants.append(symbol.rsplit(".", 1)[0])

    keywords = [
        *symbol_variants,
        *names,
        *aliases.get(symbol, []),
    ]

    return {
        "symbol": symbol,
        "searchKeywords": unique_keywords(keywords),
    }


def merge(
    existing: list[dict[str, Any]],
    fetched: list[dict[str, Any]],
    aliases: dict[str, list[str]],
) -> tuple[list[dict[str, Any]], int]:
    """
    Existing rows are retained in their original order.
    A fetched symbol already in the file is not duplicated.
    New symbols are appended at the end.
    """
    by_symbol: dict[str, dict[str, Any]] = {}
    order: list[str] = []

    for item in existing:
        symbol = item["symbol"]
        if symbol not in by_symbol:
            by_symbol[symbol] = item
            order.append(symbol)

    new_count = 0

    for quote in fetched:
        record = make_record(quote, aliases)
        if record is None:
            continue

        symbol = record["symbol"]

        if symbol in by_symbol:
            # Do not replace the existing record. Only add newly supplied
            # keywords/aliases, so user edits are preserved.
            old = by_symbol[symbol]
            old["searchKeywords"] = unique_keywords(
                [
                    *old.get("searchKeywords", []),
                    *record["searchKeywords"],
                    *aliases.get(symbol, []),
                ]
            )
        else:
            by_symbol[symbol] = record
            order.append(symbol)
            new_count += 1

    return [by_symbol[symbol] for symbol in order], new_count


def main() -> int:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    existing = load_existing()
    aliases = load_aliases()

    is_initial = len(existing) == 0
    log.info(
        "symbols.json status: %s",
        "empty/missing -> initial build" if is_initial else f"{len(existing)} existing symbols",
    )

    fetched: list[dict[str, Any]] = []

    for market_name, region in MARKETS.items():
        for quote_type in QUOTE_TYPES:
            try:
                records = fetch_market(region, quote_type)
                fetched.extend(records)
                log.info(
                    "%s %s: %d records",
                    market_name,
                    quote_type,
                    len(records),
                )
            except Exception as exc:
                # A partial market fetch must never silently delete the
                # existing database. On an initial build, fail loudly.
                log.exception(
                    "Failed to fetch %s %s: %s",
                    market_name,
                    quote_type,
                    exc,
                )
                if is_initial:
                    return 1

    result, new_count = merge(existing, fetched, aliases)

    if not result:
        log.error("No symbols were produced.")
        return 1

    save_json(SYMBOLS_FILE, result)

    log.info(
        "Done: %d total symbols, %d new symbols.",
        len(result),
        new_count,
    )

    return 0


if __name__ == "__main__":
    sys.exit(main())
