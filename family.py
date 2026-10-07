from PIL import Image

img = Image.open("Girl_with_a_Pearl_Earring.jpeg")
img.show()

#parameters to be varied
stretch = 1000
select = 700

width, height = img.size
new_img = Image.new('RGB', (width+stretch-1, height), (250,250,250))

cropped_img = img.crop((0, 0, select, height))
new_img.paste(cropped_img, (0, 0))

cropped_img = img.crop((select, 0, select+1, height))
for i in range(stretch):
    new_img.paste(cropped_img, (select+i, 0))

cropped_img = img.crop((select+1, 0, width, height))
new_img.paste(cropped_img, (select+stretch, 0))

new_img.show()
