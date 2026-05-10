from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import logging
import os
from urllib.parse import urljoin, urlparse

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'success': True,
        'message': 'Scraping service is healthy',
        'service': 'scraping-service'
    })

@app.route('/scrape', methods=['POST'])
def scrape():
    try:
        data = request.get_json()
        url = data.get('url')
        scrape_type = data.get('type', 'static')
        options = data.get('options', {})
        
        if not url:
            return jsonify({
                'success': False,
                'message': 'URL is required'
            }), 400
        
        logger.info(f"Starting {scrape_type} scraping for URL: {url}")
        
        if scrape_type == 'static':
            result = scrape_static(url, options)
        elif scrape_type == 'dynamic':
            result = scrape_dynamic(url, options)
        else:
            return jsonify({
                'success': False,
                'message': f'Unsupported scrape type: {scrape_type}'
            }), 400
        
        logger.info(f"Scraping completed successfully for URL: {url}")
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        logger.error(f"Scraping error: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

def scrape_static(url, options):
    headers = {
        'User-Agent': options.get('userAgent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
    }
    
    if options.get('headers'):
        headers.update(options['headers'])
    
    response = requests.get(url, headers=headers, timeout=options.get('timeout', 30))
    response.raise_for_status()
    
    soup = BeautifulSoup(response.content, 'html.parser')
    result = {}
    
    if options.get('extractText', True):
        result['text'] = soup.get_text(strip=True)
    
    if options.get('extractTables', False):
        result['tables'] = extract_tables(soup)
    
    if options.get('extractImages', False):
        result['images'] = extract_images(soup, url)
    
    if options.get('extractLinks', False):
        result['links'] = extract_links(soup, url)
    
    if options.get('extractMetadata', True):
        result['metadata'] = extract_metadata(soup)
    
    return result

def scrape_dynamic(url, options):
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    
    if options.get('userAgent'):
        chrome_options.add_argument(f'--user-agent={options["userAgent"]}')
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        driver.get(url)
        
        if options.get('waitForSelector'):
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, options['waitForSelector']))
            )
        else:
            time.sleep(3)
        
        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')
        
        result = {}
        
        if options.get('extractText', True):
            result['text'] = soup.get_text(strip=True)
        
        if options.get('extractTables', False):
            result['tables'] = extract_tables(soup)
        
        if options.get('extractImages', False):
            result['images'] = extract_images(soup, url)
        
        if options.get('extractLinks', False):
            result['links'] = extract_links(soup, url)
        
        if options.get('extractMetadata', True):
            result['metadata'] = extract_metadata(soup)
        
        return result
        
    finally:
        driver.quit()

def extract_tables(soup):
    tables = []
    for table in soup.find_all('table'):
        table_data = {
            'headers': [],
            'rows': []
        }
        
        header_row = table.find('tr')
        if header_row:
            headers = [th.get_text(strip=True) for th in header_row.find_all(['th', 'td'])]
            table_data['headers'] = headers
        
        for row in table.find_all('tr')[1:]:
            cells = [td.get_text(strip=True) for td in row.find_all(['td', 'th'])]
            if cells:
                table_data['rows'].append(cells)
        
        if table_data['headers'] or table_data['rows']:
            tables.append(table_data)
    
    return tables

def extract_images(soup, base_url):
    images = []
    for img in soup.find_all('img'):
        src = img.get('src')
        if src:
            full_url = urljoin(base_url, src)
            images.append({
                'url': full_url,
                'alt': img.get('alt', ''),
                'src': src
            })
    return images

def extract_links(soup, base_url):
    links = []
    for a in soup.find_all('a', href=True):
        href = a['href']
        full_url = urljoin(base_url, href)
        links.append({
            'text': a.get_text(strip=True),
            'url': full_url
        })
    return links

def extract_metadata(soup):
    metadata = {}
    
    title_tag = soup.find('title')
    if title_tag:
        metadata['title'] = title_tag.get_text(strip=True)
    
    desc_tag = soup.find('meta', attrs={'name': 'description'})
    if desc_tag:
        metadata['description'] = desc_tag.get('content', '')
    
    keywords_tag = soup.find('meta', attrs={'name': 'keywords'})
    if keywords_tag:
        metadata['keywords'] = keywords_tag.get('content', '')
    
    author_tag = soup.find('meta', attrs={'name': 'author'})
    if author_tag:
        metadata['author'] = author_tag.get('content', '')
    
    return metadata

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8001))
    app.run(host='0.0.0.0', port=port, debug=True)
