"""
Takes an image and cuts evenly spaced out (parametrable) same sized (parametrable) cubes
Makes a new image with the cutout version of the original image

https://www.youtube.com/watch?v=U1KiC0AXhHg&t=1s

"""

from PIL import Image

img = Image.open("Girl_with_a_Pearl_Earring.jpeg")
img.show()

#parameters to be varied
distance = 100
size = 20

width, height = img.size
new_img = img.copy()

for i in range(1, width//distance+1):
    for j in range(height//distance):
        white = Image.new('RGB', (size, size), 'white')
        new_img.paste(white, (i*distance, j*distance))
new_img.show()

