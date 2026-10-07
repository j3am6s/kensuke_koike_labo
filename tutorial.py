from PIL import Image, ImageFilter, ImageDraw, ImageFont

#OPENING AND DISPLAYING THE IMAGE
# Location of the image
img = Image.open("Girl_with_a_Pearl_Earring.jpeg")
#original image
img.show()
#save new image
img.save("new.png")
#create new image
width, height = img.size
new_im = Image.new('RGB', (width, height), (250,250,250))
#create a copy of the image
copy_img = img.copy()

#########################################################################################################################

#GETTING INFORMATION ABOUT THE OPENED IMAGE
# size of the image
width, height = img.size
# format of the image
print(img.format)
# mode of the image
"""""
1	1-bit pixels, black and white
L	8-bit pixels, Grayscale
P	8-bit pixels, mapped to any other mode using a color palette
RGB	3×8-bit pixels, true color
RGBA	4×8-bit pixels, true color with transparency mask
"""
print(img.mode)

#########################################################################################################################

#MOVING THE IMAGE
# rotating a image 90 deg counter clockwise
rotated_img = img.rotate(90, resample=0, expand=0)
# flipping the Image
vertical_img = img.transpose(method=Image.FLIP_TOP_BOTTOM)
horizontal_img = img.transpose(method=Image.FLIP_LEFT_RIGHT)

#########################################################################################################################

#CROPPING AND SIZING 
# Setting the points for cropped image
left = 4
top = height / 5
right = 154
bottom = 3 * height / 5
# Cropped image of above dimension
img = img.crop((left, top, right, bottom))
newsize = (300, 300)
img = img.resize(newsize)

#########################################################################################################################

#MERGING 
#splitting and putting back together
r, g, b, = img.split()
img = Image.merge('RGB', (g, b, r))
#merge 4 images in a new image
img_01 = Image.open("digit-number-img-0.jpg")
img_02 = Image.open("digit-number-img-1.jpg")
img_03 = Image.open("digit-number-img-2.jpg")
img_04 = Image.open("digit-number-img-3.jpg")
img_01_size = img_01.size
new_im = Image.new('RGB', (2*img_01_size[0],2*img_01_size[1]), (250,250,250))
new_im.paste(img_01, (0,0))
new_im.paste(img_02, (img_01_size[0],0))
new_im.paste(img_03, (0,img_01_size[1]))
new_im.paste(img_04, (img_01_size[0],img_01_size[1]))

#########################################################################################################################

#FILTER
# Simple blur
img = img.filter(ImageFilter.BLUR)
# Gaussian blur (radius)
img = img.filter(ImageFilter.GaussianBlur(4))
# Box blur
img = img.filter(ImageFilter.BoxBlur(4))

#########################################################################################################################

#ADDING TEXT
# Image is converted into editable form using Draw function and assigned to draw
draw = ImageDraw.Draw(img)
# ("font type",font size)
font = ImageFont.truetype("DroidSans.ttf", 50)
# Decide the text location, color and font 
# (255,255,255)-White color text
draw.text((0, 0), "hi", (255, 255, 255), font=font)

#########################################################################################################################

#DRAWING SHAPES
#line
img = ImageDraw.Draw(img)
img.line([(40, 40), (90, 90)], fill="none", width=0)
#rectangle
img = ImageDraw.Draw(img)
img.rectangle([(40, 40), (90, 90)], fill="#ffff33", outline="red")
#polygon
import math
side = 8
xy = [
    ((math.cos(th) + 1) * 90,
     (math.sin(th) + 1) * 60)
    for th in [i * (2 * math.pi) / side for i in range(side)]
]
img = ImageDraw.Draw(img)
img.polygon(xy, fill="# eeeeff", outline="blue")
