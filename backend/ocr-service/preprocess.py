import cv2
import numpy as np

def preprocess_image(image_bytes: bytes):
    # Convert bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)

    if img is None:
        raise ValueError("Invalid image bytes")

    #Denoising – removes camera noise & paper texture
    denoised = cv2.fastNlMeansDenoising(
        img,
        None,
        h=30,
        templateWindowSize=7,
        searchWindowSize=21
    )

    # handles uneven lighting
    thresh = cv2.adaptiveThreshold(
        denoised,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        11,
        2
    )

    return thresh
