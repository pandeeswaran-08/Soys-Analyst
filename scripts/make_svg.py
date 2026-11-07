import cv2
import numpy as np

img = cv2.imread('frontend/public/logo-white.png', cv2.IMREAD_UNCHANGED)
alpha = img[:, :, 3]

_, thresh = cv2.threshold(alpha, 127, 255, cv2.THRESH_BINARY)
contours, hierarchy = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_TC89_KCOS)

paths = []
for c in contours:
    epsilon = 0.6
    approx = cv2.approxPolyDP(c, epsilon, True)
    pts = approx.reshape(-1, 2)
    if len(pts) < 3:
        continue
    p_str = 'M ' + ' L '.join(f'{x} {y}' for x, y in pts) + ' Z'
    paths.append(p_str)

d = ' '.join(paths)
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="currentColor">
  <path fill-rule="evenodd" clip-rule="evenodd" d="{d}" />
</svg>'''

with open('frontend/public/logo.svg', 'w', encoding='utf-8') as f:
    f.write(svg)

print('Generated logo.svg successfully, size:', len(svg))

