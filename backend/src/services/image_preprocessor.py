import cv2
import numpy as np


def preprocess_image_for_ocr(pil_image):

    # PIL -> OpenCV
    image = np.array(pil_image)

    # grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)

    # denoise
    gray = cv2.fastNlMeansDenoising(gray)

    # threshold
    gray = cv2.threshold(
        gray,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )[1]

    # enlarge
    gray = cv2.resize(
        gray,
        None,
        fx=2,
        fy=2,
        interpolation=cv2.INTER_CUBIC
    )

    return gray