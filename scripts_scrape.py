import subprocess
import re
import json

urls = [
  ("saada", "https://saada.sa/products/p1346874801?a_aid=gx333hkq2rph5&utm_source=linkaraby&utm_medium=hot-products"),
  ("eyen", "https://eyen.sa/lens-me-soluation/p1339667227?a_aid=gx333hkq2rph5&utm_source=linkaraby&utm_medium=hot-products"),
  ("boygirlhope", "https://boygirlhope-gender.com/products/%D9%85%D9%83%D9%85%D9%84-%D8%AA%D9%88%D9%8A%D9%86%D8%B2%D9%88?a_aid=gx333hkq2rph5&utm_source=linkaraby&utm_medium=hot-products"),
  ("sukon", "https://sukon.sa/products/p252984006?a_aid=gx333hkq2rph5&utm_source=linkaraby&utm_medium=hot-products"),
  ("tricycle", "https://tricycle.sa/products/%D9%85%D8%AC%D9%85%D9%88%D8%B9%D8%A9_%D8%A7%D9%84%D8%AA%D8%A7%D8%B3%D9%8A%D8%B3?a_aid=gx333hkq2rph5&utm_source=linkaraby&utm_medium=hot-products"),
  ("wadihalfa_charcoal", "https://wadihalfa.sa/%D8%A8%D9%88%D9%83%D8%B3-%D9%81%D8%AD%D9%85-%D8%A7%D9%84%D8%A8%D8%AE%D9%88%D8%B1-%D8%A7%D9%84%D8%B0%D9%87%D8%A8%D9%8A-%7C-%D9%85%D8%AA%D8%B9%D8%AF%D8%AF-%D8%A7%D9%84%D8%A3%D8%AD%D8%AC%D8%A7%D9%85/p974191761?a_aid=gx333hkq2rph5&utm_source=linkaraby&utm_medium=hot-products"),
  ("ksabeauty_pearl3", "https://ksabeautycorner.com/products/%D9%83%D8%B1%D9%8A%D9%85-%D8%AA%D9%81%D8%AA%D9%8A%D8%AD-%D8%A7%D9%84%D9%84%D8%A4%D9%84%D8%A4-3-%D8%B9%D9%84%D8%A8?a_aid=gx333hkq2rph5&utm_source=linkaraby&utm_medium=hot-products"),
  ("castle_shemagh", "https://castle-shemagh.com/products/ar-%D8%B4%D9%85%D8%A7%D8%BA-%D9%83%D8%A7%D8%B3%D8%AA%D9%84-%D8%A7%D9%84%D8%B9%D9%82%D9%8A%D9%82-%D8%AF%D9%85-%D8%A7%D9%84%D8%BA%D8%B2%D8%A7%D9%84-%D9%85%D9%82%D8%A7%D8%B3-60?a_aid=gx333hkq2rph5&utm_source=linkaraby&utm_medium=hot-products"),
  ("ksabeauty_combo", "https://ksabeautycorner.com/products/%D8%B9%D8%B1%D8%B6-%D9%83%D8%B1%D9%8A%D9%85-%D8%AA%D9%81%D8%AA%D9%8A%D8%AD-%D8%A7%D9%84%D9%85%D9%86%D8%A7%D8%B7%D9%82-%D8%A7%D9%84%D8%AD%D8%B3%D8%A7%D8%B3%D8%A9-%D9%83%D8%B1%D9%8A%D9%85-%D9%84%D8%AA%D9%81%D8%AA%D9%8A%D8%AD-%D8%A7%D9%84%D9%85%D9%86%D8%A7%D8%B7%D9%82-%D8%A7%D9%84%D8%AE%D8%B4%D9%86%D8%A9-%D8%A7%D9%84%D8%B1%D9%83%D8%A8-%D9%88%D8%A7%D9%84%D8%A7%D9%83%D9%88%D8%A7%D8%B9-%D9%83%D8%B1%D9%8A%D9%85-%D8%AA%D9%81%D8%AA%D9%8A%D8%AD-%D8%A7%D9%84%D9%84%D8%A4%D9%84%D8%A4?a_aid=gx333hkq2rph5&utm_source=linkaraby&utm_medium=hot-products"),
  ("ksabeauty_vit", "https://ksabeautycorner.com/products/%D8%AF%D9%83%D8%AA%D9%88%D8%B1-%D9%81%D9%8A%D8%AA%D8%A7%D9%85%D9%8A%D9%86-%D8%A7%D9%84%D9%84%D9%88%D9%84%D9%88%D9%87?a_aid=gx333hkq2rph5&utm_source=linkaraby&utm_medium=hot-products"),
  ("wadihalfa_gas", "https://wadihalfa.sa/%D8%BA%D8%A7%D8%B2-%D9%84%D8%AA%D8%B9%D8%A8%D8%A6%D8%A9-%D8%A7%D9%84%D9%88%D9%84%D8%A7%D8%B9%D8%A7%D8%AA-250-%D9%85%D9%84/p1184508315?a_aid=gx333hkq2rph5&utm_source=linkaraby&utm_medium=hot-products"),
  ("ashqer", "https://ashqerstore.com/products/p861364541?a_aid=gx333hkq2rph5&utm_source=linkaraby&utm_medium=hot-products"),
  ("ksabeauty_knees", "https://ksabeautycorner.com/products/%D8%B9%D8%B1%D8%B6-2-%D9%83%D8%B1%D9%8A%D9%85-%D9%84%D8%AA%D9%81%D8%AA%D9%8A%D8%AD-%D8%A7%D9%84%D9%85%D9%86%D8%A7%D8%B7%D9%82-%D8%A7%D9%84%D8%AE%D8%B4%D9%86%D8%A9-%D8%A7%D9%84%D8%B1%D9%83%D8%A8-%D9%88%D8%A7%D9%84%D8%A7%D9%83%D9%88%D8%A7%D8%B9-1?a_aid=gx333hkq2rph5&utm_source=linkaraby&utm_medium=hot-products"),
  ("bravo_bottle", "https://bravocenters.com/%D8%B2%D8%AC%D8%A7%D8%AC%D8%A9-%D8%A8%D8%AA%D8%B5%D9%85%D9%8A%D9%85-%D8%AA%D8%B1%D8%A7%D8%AB%D9%8A-%D8%B2%D8%AC%D8%A7%D8%AC-%D8%A8%D8%BA%D8%B7%D8%A7%D8%A1-%D8%AE%D8%B4%D8%A8-%D9%84%D9%88%D9%86-%D8%A7%D8%A8%D9%8A%D8%B6-%D9%88%D8%A7%D8%B3%D9%88%D8%AF-%D8%B1%D9%85%D8%B6%D8%A7%D9%86-2025/p156969363?a_aid=gx333hkq2rph5&utm_source=linkaraby&utm_medium=hot-product")
]

results = []
for tag, url in urls:
    try:
        cmd = ["curl", "-s", "-L", "-m", "10", "-A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", url]
        out = subprocess.check_output(cmd).decode("utf-8", errors="ignore")
        
        # og:title
        m_t = re.search(r'<meta[^>]*property=["\']og:title["\'][^>]*content=["\']([^"\']+)["\']', out, re.I)
        if not m_t:
            m_t = re.search(r'<meta[^>]*content=["\']([^"\']+)["\'][^>]*property=["\']og:title["\']', out, re.I)
        if not m_t:
            m_t = re.search(r'<title>(.*?)</title>', out, re.I)
        title = m_t.group(1).strip() if m_t else ""
        
        # og:image
        m_img = re.search(r'<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']+)["\']', out, re.I)
        if not m_img:
            m_img = re.search(r'<meta[^>]*content=["\']([^"\']+)["\'][^>]*property=["\']og:image["\']', out, re.I)
        img = m_img.group(1).strip() if m_img else ""
        
        # price
        m_price = re.search(r'"price":\s*"?([0-9.]+)"?', out)
        if not m_price:
            m_price = re.search(r'data-price=["\']([0-9.]+)["\']', out)
        if not m_price:
            m_price = re.search(r'([0-9]+(?:\.[0-9]+)?)\s*(?:ر\.س|SAR)', out)
        price = m_price.group(1).strip() if m_price else ""
        
        # og:description
        m_desc = re.search(r'<meta[^>]*property=["\']og:description["\'][^>]*content=["\']([^"\']+)["\']', out, re.I)
        if not m_desc:
            m_desc = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']+)["\']', out, re.I)
        desc = m_desc.group(1).strip() if m_desc else ""

        results.append({"tag": tag, "url": url, "title": title, "image": img, "price": price, "desc": desc[:120]})
    except Exception as e:
        results.append({"tag": tag, "url": url, "error": str(e)})

with open(".data/scraped_products.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("DONE scraping")
