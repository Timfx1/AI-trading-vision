import cv2
import numpy as np

def normalize_chart(img_bgr):
    """
    Normalize TradingView chart colors to a stable grayscale version.
    """

    # 1) Convert to grayscale
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # 2) Remove gridlines via morphological opening
    kernel = np.ones((3, 3), np.uint8)
    cleaned = cv2.morphologyEx(gray, cv2.MORPH_OPEN, kernel)

    # 3) Auto-contrast normalize
    norm = cv2.normalize(cleaned, None, 0, 255, cv2.NORM_MINMAX)

    # 4) Very light charts → invert
    if np.mean(norm) > 180:
        norm = 255 - norm

    # 5) Expand to 3-channels
    normalized = cv2.cvtColor(norm, cv2.COLOR_GRAY2BGR)

    return normalized
