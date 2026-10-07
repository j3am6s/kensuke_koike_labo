const upload = document.getElementById('upload-original');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let originalImage = null;
let selectedDigit = null;

function makeMask(digit, targetHeight) {
    const probe = document.createElement('canvas').getContext('2d');
    const font = `400 ${targetHeight}px Didot, "Bodoni 72", "Times New Roman", serif`;
    probe.font = font;
    const metrics = probe.measureText(String(digit));
    const ascent = metrics.actualBoundingBoxAscent || targetHeight * 0.8;
    const descent = metrics.actualBoundingBoxDescent || targetHeight * 0.2;
    const mask = document.createElement('canvas');
    mask.width = Math.max(1, Math.ceil(metrics.width + 8));
    mask.height = Math.max(1, Math.ceil(ascent + descent + 8));
    const maskCtx = mask.getContext('2d');
    maskCtx.font = font;
    maskCtx.fillStyle = '#ffffff';
    maskCtx.textBaseline = 'alphabetic';
    maskCtx.fillText(String(digit), 4, 4 + ascent);
    return mask;
}

function fitMask(digit, image) {
    let height = Math.round(Math.min(image.height * 0.5, image.width * 0.22));
    height = Math.max(20, height);
    let mask = makeMask(digit, height);
    while ((mask.width * 3 > image.width - 16 || mask.height > image.height - 8) && height > 16) {
        height = Math.round(height * 0.85);
        mask = makeMask(digit, height);
    }
    return mask;
}

function cutSprite(image, mask, originX, originY) {
    const sprite = document.createElement('canvas');
    sprite.width = mask.width;
    sprite.height = mask.height;
    const spriteCtx = sprite.getContext('2d');
    spriteCtx.drawImage(image, originX, originY, mask.width, mask.height, 0, 0, mask.width, mask.height);
    spriteCtx.globalCompositeOperation = 'destination-in';
    spriteCtx.drawImage(mask, 0, 0);
    return sprite;
}

function updateCanvas() {
    if (!originalImage) {
        return;
    }

    const width = originalImage.width;
    const height = originalImage.height;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(originalImage, 0, 0);

    if (selectedDigit === null) {
        return;
    }

    const mask = fitMask(selectedDigit, originalImage);
    const centers = [0.2, 0.5, 0.8];
    const originY = Math.max(0, Math.round((height - mask.height) / 2));
    const sprites = centers.map((ratio) => {
        const originX = Math.max(0, Math.min(width - mask.width, Math.round(width * ratio - mask.width / 2)));
        const sprite = cutSprite(originalImage, mask, originX, originY);
        ctx.drawImage(mask, originX, originY);
        return sprite;
    });

    const pad = Math.round(Math.min(width, height) * 0.1);
    ctx.drawImage(sprites[1], pad, pad);
}

upload.addEventListener('change', function (e) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            originalImage = img;
            document.getElementById('original-image').src = event.target.result;
            document.getElementById('original-image').style.display = 'block';
            document.getElementById('original-container').classList.add('image-uploaded');
            document.getElementById('result-container').classList.add('image-uploaded');
            updateCanvas();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
});

document.getElementById('digit-pad').addEventListener('click', function (event) {
    const button = event.target.closest('button');
    if (!button) {
        return;
    }
    selectedDigit = button.dataset.digit;
    document.querySelectorAll('#digit-pad button').forEach(function (item) {
        item.classList.toggle('selected', item === button);
    });
    updateCanvas();
});
