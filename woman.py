from PIL import Image

img = Image.open("Girl_with_a_Pearl_Earring.jpeg")
img.show()

#parameters to be varied
square = 300
w = 600
h = 600

width, height = img.size
new_img = Image.new('RGB', (width, height), (250,250,250))
new_img.paste(img, (0, 0))

one = img.crop((w-square, h-square, w, h))
two = img.crop((w, h-square, w+square, h))
three = img.crop((w, h, w+square, h+square))
four = img.crop((w-square, h, w, h+square))

new_img.paste(one, (w, h-square))
new_img.paste(two, (w, h))
new_img.paste(three, (w-square, h))
new_img.paste(four, (w-square, h-square))

new_img.show()
