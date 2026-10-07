from PIL import Image

img = Image.open("Girl_with_a_Pearl_Earring.jpeg")
#img.show()

#parameters to be varied
cuts = 10

width, height = img.size
print(width)
img1 = Image.new('RGB', (width, height), (250,250,250))
img2 = Image.new('RGB', (width, height), (250,250,250))

j = 0
for i in range(0,cuts,2):
    cropped_img = img.crop((i*(width//cuts), 0, (i+1)*(width//cuts), height))
    img1.paste(cropped_img, (j*(width//cuts), 0))
    cropped_img = img.crop(((i+1)*(width//cuts), 0, (i+2)*(width//cuts), height))
    img1.paste(cropped_img, (j*(width//cuts)+ width//2, 0))
    j+=1

img1.show()

j = 0
for i in range(0,cuts,2):
    cropped_img = img1.crop((0, i*(height//cuts), width, (i+1)*(height//cuts)))
    img2.paste(cropped_img, (0, j*(height//cuts)))
    cropped_img = img1.crop((0, (i+1)*(height//cuts), width, (i+2)*(height//cuts)))
    img2.paste(cropped_img, (0, j*(height//cuts) + height//2))
    j+=1

img2.show()

