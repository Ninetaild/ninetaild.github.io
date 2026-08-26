#!/usr/init/env python3
"""
Build/extend data/symbols.json from Yahoo Finance with incremental saving
and intermediate Git commits when new data reaches a threshold.
"""

from __future__ import annotations

import json
import logging
import re
import subprocess
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

QUOTE_TYPES = ("EQUITY", "ETF")
BATCH_COMMIT_THRESHOLD = 10000  # 새로운 데이터가 1만 개 쌓이면 중간 커밋 실행

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
log = logging.getLogger("update-symbols")


def normalize(value: Any) -> str:
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


def git_commit_and_push(message: str) -> None:
    """Commit and push changes directly from Python when threshold is reached."""
    try:
        subprocess.run(["git", "config", "user.name", "github-actions[bot]"], check=True)
        subprocess.run(["git", "config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"], check=True)
        subprocess.run(["git", "add", "data/"], check=True)
        
        # 변경 사항이 있는지 확인
        diff = subprocess.run(["git", "diff", "--cached", "--quiet"])
        if diff.returncode != 0:
            subprocess.run(["git", "commit", "-m", message], check=True)
            subprocess.run(["git", "push"], check=True)
            log.info(">>> Intermediate Git commit & push completed successfully. Message: %s", message)
    except Exception as exc:
        log.warning("Failed to run intermediate git commit/push: %s", exc)


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

    names = [
        quote.get("shortName"),
        quote.get("longName"),
        quote.get("displayName"),
        quote.get("name"),
    ]

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


def main() -> int:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    aliases = load_aliases()

    log.info("Starting incremental symbol sync with batch commit threshold...")

    session_new_count = 0

    for market_name, region in MARKETS.items():
        for quote_type in QUOTE_TYPES:
            try:
                log.info("--- Processing %s [%s] ---", market_name, quote_type)
                records = fetch_market(region, quote_type)
                if not records:
                    continue

                existing = load_existing()
                by_symbol: dict[str, dict[str, Any]] = {}
                order: list[str] = []

                for item in existing:
                    symbol = item["symbol"]
                    if symbol not in by_symbol:
                        by_symbol[symbol] = item
                        order.append(symbol)

                block_new_count = 0

                for quote in records:
                    record = make_record(quote, aliases)
                    if record is None:
                        continue

                    symbol = record["symbol"]

                    if symbol in by_symbol:
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
                        block_new_count += 1
                        session_new_count += 1

                # 결과 저장
                result = [by_symbol[symbol] for symbol in order]
                save_json(SYMBOLS_FILE, result)
                log.info("Saved progress: %s %s (+%d new this block, session total new: %d)", market_name, quote_type, block_new_count, session_new_count)

                # 새로운 데이터가 1만 개 이상 쌓였다면 중간 커밋 수행
                if session_new_count >= BATCH_COMMIT_THRESHOLD:
                    git_commit_and_push(f"chore: batch update symbols (+{session_new_count} new records)")
                    session_new_count = 0  # 카운터 리셋

            except Exception as exc:
                log.exception("Failed to fetch %s %s: %s", market_name, quote_type, exc)

    # 남은 변경 사항 최종 커밋
    git_commit_and_push("chore: update Yahoo Finance symbols final batch")
    log.info("All fetch steps finished successfully.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
