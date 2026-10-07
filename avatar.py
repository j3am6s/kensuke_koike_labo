"""
Takes an image and cuts evenly spaced out (parametrable) same sized (parametrable) cubes
Makes a new image with the cubes, maintaing the order
On simple enough images, this should recreate a smaller (cuter) version of the original image.

https://www.youtube.com/watch?v=U1KiC0AXhHg&t=1s

Ideas to expand this technique:
- make uneven cube sizes but a final image that still fits rectangle proportions
- use circles or other polygons instead of cubes
"""

from PIL import Image

img = Image.open("Girl_with_a_Pearl_Earring.jpeg")
img.show()

#parameters to be varied
distance = 100
size = 20

width, height = img.size
new_img = Image.new('RGB', ((width//distance)*size, (height//distance)*size), (250,250,250))

for i in range(1, width//distance+1):
    for j in range(height//distance):
        cropped_img = img.crop((i*distance, j*distance, i*distance+size, j*distance+size))
        new_img.paste(cropped_img, ((i-1)*size,j*size))

new_img.show()