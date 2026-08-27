import FinanceDataReader as fdr
import json

stock_alias_map = {}

# 1. 코스피 & 코스닥 일반 주식 가져오기
df_krx = fdr.StockListing('KRX')
for _, row in df_krx.iterrows():
    code = str(row['Code']).zfill(6)
    name = str(row['Name'])
    market = str(row['Market'])
    
    if market == 'KOSPI':
        ticker = f"{code}.KS"
    elif market == 'KOSDAQ':
        ticker = f"{code}.KQ"
    else:
        continue
    
    aliases = list(dict.fromkeys([name, name.replace(" ", "")]))
    stock_alias_map[ticker] = aliases

# 2. 국내 상장 ETF 가져오기 (야후 파이낸스 ETF 규격: .KS)
df_etf = fdr.StockListing('ETF/KR')
for _, row in df_etf.iterrows():
    code = str(row['Symbol']).zfill(6)
    name = str(row['Name'])
    ticker = f"{code}.KS"
    
    aliases = list(dict.fromkeys([name, name.replace(" ", "")]))
    stock_alias_map[ticker] = aliases

# JSON 파일 저장
with open("krx_symbols_v2.json", "w", encoding="utf-8") as f:
    json.dump(stock_alias_map, f, ensure_ascii=False, indent=2)

print(f"총 {len(stock_alias_map)}개 종목 및 ETF 추출 완료!")