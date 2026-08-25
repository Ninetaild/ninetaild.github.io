# Yahoo Finance Market Symbol Updater

미국(US), 일본(JP), 한국(KR)의 Yahoo Finance 종목을 주 1회 조회하여
`data/symbols.json`을 생성/확장하는 GitHub Actions 프로젝트입니다.

## 동작

### 첫 실행

`data/symbols.json`이 없거나 `[]`이면:

```text
Yahoo Finance
  ├─ US equities
  ├─ US ETFs
  ├─ JP equities
  ├─ JP ETFs
  ├─ KR equities
  └─ KR ETFs
       ↓
data/symbols.json 생성
```

### 이후 실행

기존 `symbol`을 기준으로 중복을 제거하고 **새로 발견된 symbol만 마지막에 추가**합니다.

기존 행의 순서와 사용자 수정 내용은 유지합니다.

## 파일

- `data/symbols.json`: 실제 종목 마스터
- `data/aliases.json`: 한글명/축약어/사용자 검색어를 직접 추가하는 곳
- `scripts/update_symbols.py`: Yahoo Finance 조회 및 병합
- `.github/workflows/update-symbols.yml`: 매주 월요일 자동 실행
- `requirements.txt`: Python 의존성

## 검색 키워드

각 종목의 `searchKeywords`에는 최소한 다음이 들어갑니다.

- Yahoo Finance symbol
- 국내/일본 티커의 suffix를 제거한 번호
- Yahoo가 반환하는 shortName
- Yahoo가 반환하는 longName
- Yahoo가 반환하는 displayName/name
- `data/aliases.json`의 사용자 지정 키워드

모든 키워드는 소문자와 공백 정규화를 거칩니다.

예:

```json
{
  "symbol": "005930.KS",
  "searchKeywords": [
    "005930.ks",
    "005930",
    "samsung electronics co., ltd.",
    "삼성전자",
    "삼성"
  ]
}
```

## 한글 검색어

Yahoo Finance의 종목명 응답이 항상 한국어 번역명을 제공한다고 보장할 수는 없습니다.
따라서 한국어 이름/축약어는 `data/aliases.json`에서 보완하도록 설계했습니다.

예:

```json
{
  "005930.KS": ["삼성전자", "삼성"],
  "AAPL": ["애플"],
  "VOO": ["뱅가드 s&p 500", "뱅가드 s&p500"]
}
```

aliases를 수정하면 다음 실행 때 기존 종목에도 해당 검색어가 합쳐집니다.

## 수동 실행

GitHub의 Actions 탭에서:

`Update Yahoo Finance symbols` → `Run workflow`

로 즉시 실행할 수 있습니다.

로컬에서는:

```bash
pip install -r requirements.txt
python scripts/update_symbols.py
```

## 주의

Yahoo Finance의 screener는 한 번에 최대 250개를 반환하므로 스크립트가
offset을 사용해 페이지를 계속 조회합니다.

Yahoo Finance/yfinance의 데이터는 개인적/연구 목적 사용에 관한 제한이 있을 수
있으므로 실제 서비스에 사용할 경우 Yahoo Finance의 이용약관을 확인하세요.
