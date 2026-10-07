"""
cut even vertical stripes (as many as desired) and be able to move them up and down with button

https://www.youtube.com/watch?v=f1fXCRtSUWU

"""

from PIL import Image

img = Image.open("Girl_with_a_Pearl_Earring.jpeg")
img.show()

#parameters to be varied
stripes = 100

width, height = img.size
new_img = Image.new('RGB', (width, height*3), (250,250,250))

for i in range(width//stripes):
    cropped_img = img.crop((i*stripes, 0, (i+1)*stripes, height))
    #height should be sequential and adjustable
    new_img.paste(cropped_img, (i*stripes,i*100))

new_img.show()