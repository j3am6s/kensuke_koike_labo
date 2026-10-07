const upload = document.getElementById('upload-original');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let originalImage;

const shiftXInput = document.getElementById('shift-x');
const shiftYInput = document.getElementById('shift-y');
const COPY_OPACITY = 0.4;

function showPixels(input, readoutId) {
    document.getElementById(readoutId).textContent = input.value + ' px / ' + input.max + ' px';
}

function updateReadouts() {
    showPixels(shiftXInput, 'shift-x-readout');
    showPixels(shiftYInput, 'shift-y-readout');
}

updateReadouts();

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

            shiftXInput.max = img.width;
            shiftYInput.min = -img.height;
            shiftYInput.max = img.height;
            shiftXInput.value = Math.min(parseInt(shiftXInput.value, 10), img.width);
            shiftYInput.value = Math.max(-img.height, Math.min(parseInt(shiftYInput.value, 10), img.height));

            updateReadouts();
            updateCanvas();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
});

function updateCanvas() {
    if (!originalImage) {
        return;
    }

    const shiftX = parseInt(shiftXInput.value, 10);
    const shiftY = parseInt(shiftYInput.value, 10);
    const width = originalImage.width;
    const height = originalImage.height;

    canvas.width = width;
    canvas.height = height;

    ctx.globalAlpha = 1;
    ctx.drawImage(originalImage, 0, 0);

    ctx.globalAlpha = COPY_OPACITY;
    ctx.drawImage(originalImage, -shiftX, shiftY);
    ctx.drawImage(originalImage, shiftX, shiftY);
    ctx.globalAlpha = 1;
}

shiftXInput.addEventListener('input', function () {
    updateReadouts();
    updateCanvas();
});
shiftYInput.addEventListener('input', function () {
    updateReadouts();
    updateCanvas();
});
