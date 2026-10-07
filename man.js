const upload = document.getElementById('upload-original');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let originalImage;

const centerXInput = document.getElementById('center-x');
const centerYInput = document.getElementById('center-y');
const diameterInput = document.getElementById('diameter');
const cutsInput = document.getElementById('cuts');
const rotationInput = document.getElementById('rotation');

function showPixels(input, readoutId) {
    document.getElementById(readoutId).textContent = input.value + ' px / ' + input.max + ' px';
}

function updateReadouts() {
    showPixels(centerXInput, 'center-x-readout');
    showPixels(centerYInput, 'center-y-readout');
    showPixels(diameterInput, 'diameter-readout');
    document.getElementById('cuts-readout').textContent = cutsInput.value + ' / ' + cutsInput.max;
    document.getElementById('rotation-readout').textContent = rotationInput.value + '° / ' + rotationInput.max + '°';
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

            centerXInput.max = img.width;
            centerYInput.max = img.height;
            diameterInput.max = Math.max(img.width, img.height);
            centerXInput.value = Math.round(img.width / 2);
            centerYInput.value = Math.round(img.height / 2);
            diameterInput.value = Math.round(Math.min(img.width, img.height) / 2);

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

    const cx = parseInt(centerXInput.value, 10);
    const cy = parseInt(centerYInput.value, 10);
    const diameter = parseInt(diameterInput.value, 10);
    const cuts = parseInt(cutsInput.value, 10);
    const rotationStep = parseInt(rotationInput.value, 10) * Math.PI / 180;
    const radius = diameter / 2;
    const width = originalImage.width;
    const height = originalImage.height;

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(originalImage, 0, 0);

    const src = ctx.getImageData(0, 0, width, height);
    const dst = ctx.getImageData(0, 0, width, height);
    const source = src.data;
    const output = dst.data;
    const ringWidth = radius / cuts;

    const x0 = Math.max(0, Math.floor(cx - radius));
    const x1 = Math.min(width - 1, Math.ceil(cx + radius));
    const y0 = Math.max(0, Math.floor(cy - radius));
    const y1 = Math.min(height - 1, Math.ceil(cy + radius));

    for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
            const dx = x - cx;
            const dy = y - cy;
            const dist = Math.hypot(dx, dy);
            if (dist > radius) {
                continue;
            }

            const ring = Math.min(cuts - 1, Math.floor(dist / ringWidth));
            const angle = Math.atan2(dy, dx) - ring * rotationStep;
            const sx = Math.round(cx + dist * Math.cos(angle));
            const sy = Math.round(cy + dist * Math.sin(angle));
            if (sx < 0 || sy < 0 || sx >= width || sy >= height) {
                continue;
            }

            const di = (y * width + x) * 4;
            const si = (sy * width + sx) * 4;
            output[di] = source[si];
            output[di + 1] = source[si + 1];
            output[di + 2] = source[si + 2];
            output[di + 3] = source[si + 3];
        }
    }

    ctx.putImageData(dst, 0, 0);
}

centerXInput.addEventListener('input', function () {
    updateReadouts();
    updateCanvas();
});
centerYInput.addEventListener('input', function () {
    updateReadouts();
    updateCanvas();
});
diameterInput.addEventListener('input', function () {
    updateReadouts();
    updateCanvas();
});
cutsInput.addEventListener('input', function () {
    updateReadouts();
    updateCanvas();
});
rotationInput.addEventListener('input', function () {
    updateReadouts();
    updateCanvas();
});
