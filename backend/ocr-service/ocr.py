import easyocr

# Initialize the reader
reader = easyocr.Reader(['en'], gpu=False) 

def extract_text_from_image(processed_img):
    """
    Takes the preprocessed OpenCV image and returns extracted text.
    """
    # detail=0 returns just the text strings in a list
    result = reader.readtext(processed_img, detail=0)
    return "\n".join(result)
