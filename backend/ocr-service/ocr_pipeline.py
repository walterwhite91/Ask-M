from preprocess import preprocess_image
from ocr import extract_text_from_image
from pdf_to_image import pdf_bytes_to_images
import cv2
import numpy as np

def ocr_from_image_bytes(image_bytes: bytes) -> str:
    processed = preprocess_image(image_bytes)
    return extract_text_from_image(processed)


def ocr_from_pdf_bytes(pdf_bytes: bytes) -> str:
    pages = pdf_bytes_to_images(pdf_bytes)

    full_text = []

    for page_num, page_img in enumerate(pages, start=1):
        # Page image is already grayscale numpy array
        denoised = cv2.fastNlMeansDenoising(
            page_img,
            None,
            h=30,
            templateWindowSize=7,
            searchWindowSize=21
        )

        thresh = cv2.adaptiveThreshold(
            denoised,
            255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            11,
            2
        )

        page_text = extract_text_from_image(thresh)

        full_text.append(f"\n--- Page {page_num} ---\n{page_text}")

    return "\n".join(full_text)

def run_ocr(file_bytes: bytes, filename: str) -> str:
    if filename.lower().endswith(".pdf"):
        return ocr_from_pdf_bytes(file_bytes)
    else:
        return ocr_from_image_bytes(file_bytes)
