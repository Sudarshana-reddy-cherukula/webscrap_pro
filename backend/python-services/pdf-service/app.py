from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
from pdf2image import convert_from_path
from PIL import Image
import io
import os
import tempfile
import logging
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'success': True,
        'message': 'PDF service is healthy',
        'service': 'pdf-service'
    })

@app.route('/process', methods=['POST'])
def process_pdf():
    try:
        if 'pdf' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No PDF file provided'
            }), 400
        
        pdf_file = request.files['pdf']
        operation = request.form.get('operation')
        options = json.loads(request.form.get('options', '{}'))
        
        if not operation:
            return jsonify({
                'success': False,
                'message': 'Operation is required'
            }), 400
        
        logger.info(f"Starting PDF operation: {operation}")
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_pdf:
            pdf_file.save(temp_pdf.name)
            temp_pdf_path = temp_pdf.name
        
        try:
            if operation == 'extract-text':
                result = extract_text(temp_pdf_path, options)
            elif operation == 'extract-images':
                result = extract_images(temp_pdf_path, options)
            elif operation == 'metadata':
                result = extract_metadata(temp_pdf_path, options)
            elif operation == 'convert-to-word':
                result = convert_to_word(temp_pdf_path, options)
            elif operation == 'convert-to-images':
                result = convert_to_images(temp_pdf_path, options)
            else:
                return jsonify({
                    'success': False,
                    'message': f'Unsupported operation: {operation}'
                }), 400
            
            logger.info(f"PDF operation completed: {operation}")
            
            return jsonify({
                'success': True,
                'data': result
            })
            
        finally:
            os.unlink(temp_pdf_path)
            
    except Exception as e:
        logger.error(f"PDF processing error: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

def extract_text(pdf_path, options):
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ""
        
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text += page.extract_text() + "\n"
    
    return {
        'text': text.strip(),
        'pageCount': len(pdf_reader.pages)
    }

def extract_images(pdf_path, options):
    images = []
    quality = options.get('imageQuality', 300)
    
    try:
        pdf_images = convert_from_path(pdf_path, dpi=quality)
        
        for i, image in enumerate(pdf_images):
            with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_img:
                image.save(temp_img.name, 'PNG')
                
                with open(temp_img.name, 'rb') as img_file:
                    img_data = img_file.read()
                
                images.append({
                    'filename': f'page_{i+1}.png',
                    'page': i + 1,
                    'data': img_data.tolist() if hasattr(img_data, 'tolist') else list(img_data),
                    'size': len(img_data)
                })
                
                os.unlink(temp_img.name)
    
    except Exception as e:
        logger.warning(f"Image extraction failed: {str(e)}")
        return {'images': [], 'error': str(e)}
    
    return {
        'images': images,
        'count': len(images)
    }

def extract_metadata(pdf_path, options):
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        
        metadata = {
            'title': '',
            'author': '',
            'subject': '',
            'creator': '',
            'producer': '',
            'creationDate': None,
            'modificationDate': None,
            'pageCount': len(pdf_reader.pages)
        }
        
        if pdf_reader.metadata:
            metadata.update({
                'title': pdf_reader.metadata.get('/Title', ''),
                'author': pdf_reader.metadata.get('/Author', ''),
                'subject': pdf_reader.metadata.get('/Subject', ''),
                'creator': pdf_reader.metadata.get('/Creator', ''),
                'producer': pdf_reader.metadata.get('/Producer', ''),
                'creationDate': pdf_reader.metadata.get('/CreationDate', ''),
                'modificationDate': pdf_reader.metadata.get('/ModDate', '')
            })
        
        first_page = pdf_reader.pages[0] if len(pdf_reader.pages) > 0 else None
        if first_page:
            media_box = first_page.mediabox
            metadata['pageSize'] = f"{media_box.width} x {media_box.height}"
        
        return metadata

def convert_to_word(pdf_path, options):
    try:
        from docx import Document
        
        doc = Document()
        
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                
                if text.strip():
                    doc.add_paragraph(text)
                    doc.add_page_break()
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.docx') as temp_doc:
            doc.save(temp_doc.name)
            
            with open(temp_doc.name, 'rb') as doc_file:
                doc_data = doc_file.read()
            
            return {
                'outputFile': {
                    'filename': f'converted_{datetime.now().strftime("%Y%m%d_%H%M%S")}.docx',
                    'data': doc_data.tolist() if hasattr(doc_data, 'tolist') else list(doc_data),
                    'size': len(doc_data)
                }
            }
            
    except ImportError:
        return {
            'error': 'python-docx not available for Word conversion'
        }
    except Exception as e:
        return {
            'error': f'Word conversion failed: {str(e)}'
        }

def convert_to_images(pdf_path, options):
    quality = options.get('imageQuality', 300)
    format_type = options.get('format', 'PNG')
    
    try:
        pdf_images = convert_from_path(pdf_path, dpi=quality)
        
        image_files = []
        
        for i, image in enumerate(pdf_images):
            with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{format_type.lower()}') as temp_img:
                image.save(temp_img.name, format_type)
                
                with open(temp_img.name, 'rb') as img_file:
                    img_data = img_file.read()
                
                image_files.append({
                    'filename': f'page_{i+1}.{format_type.lower()}',
                    'page': i + 1,
                    'data': img_data.tolist() if hasattr(img_data, 'tolist') else list(img_data),
                    'size': len(img_data)
                })
                
                os.unlink(temp_img.name)
        
        return {
            'images': image_files,
            'count': len(image_files),
            'format': format_type
        }
        
    except Exception as e:
        logger.error(f"Image conversion failed: {str(e)}")
        return {
            'error': f'Image conversion failed: {str(e)}'
        }

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8002))
    app.run(host='0.0.0.0', port=port, debug=True)
