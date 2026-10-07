const upload = document.getElementById('upload-original');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let originalImage;

const centerXInput = document.getElementById('center-x');
const centerYInput = document.getElementById('center-y');
const sizeInput = document.getElementById('diamond-size');

function showPixels(input, readoutId) {
    document.getElementById(readoutId).textContent = input.value + ' px / ' + input.max + ' px';
}

function updateReadouts() {
    showPixels(centerXInput, 'center-x-readout');
    showPixels(centerYInput, 'center-y-readout');
    showPixels(sizeInput, 'diamond-size-readout');
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
            sizeInput.max = Math.max(img.width, img.height);
            centerXInput.value = Math.round(img.width / 2);
            centerYInput.value = Math.round(img.height / 2);
            sizeInput.value = Math.round(Math.min(img.width, img.height) / 4);

            updateReadouts();
            updateCanvas();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
});

const VERTICAL_RATIO = 1.5;

function diamondRadii(size) {
    return {
        horizontal: size,
        vertical: Math.max(size, Math.round(size * VERTICAL_RATIO))
    };
}

function littleDiamond(dx, dy, horizontal, vertical) {
    if (Math.abs(dx) / horizontal + Math.abs(dy) / vertical > 1) {
        return null;
    }

    const halfH = horizontal / 2;
    const halfV = vertical / 2;
    const distances = {
        top: Math.abs(dx) / horizontal + Math.abs(dy + halfV) / vertical,
        bottom: Math.abs(dx) / horizontal + Math.abs(dy - halfV) / vertical,
        left: Math.abs(dx + halfH) / horizontal + Math.abs(dy) / vertical,
        right: Math.abs(dx - halfH) / horizontal + Math.abs(dy) / vertical
    };

    let region = 'top';
    let best = distances.top;
    for (const name of ['bottom', 'left', 'right']) {
        if (distances[name] < best) {
            best = distances[name];
            region = name;
        }
    }
    return region;
}

function updateCanvas() {
    if (!originalImage) {
        return;
    }

    const cx = parseInt(centerXInput.value, 10);
    const cy = parseInt(centerYInput.value, 10);
    const size = parseInt(sizeInput.value, 10);
    const { horizontal, vertical } = diamondRadii(size);
    const width = originalImage.width;
    const height = originalImage.height;

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(originalImage, 0, 0);

    const src = ctx.getImageData(0, 0, width, height);
    const dst = ctx.getImageData(0, 0, width, height);
    const source = src.data;
    const output = dst.data;

    const x0 = Math.max(0, cx - horizontal);
    const x1 = Math.min(width - 1, cx + horizontal);
    const y0 = Math.max(0, cy - vertical);
    const y1 = Math.min(height - 1, cy + vertical);

    for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
            const dx = x - cx;
            const dy = y - cy;
            const region = littleDiamond(dx, dy, horizontal, vertical);
            if (region !== 'top' && region !== 'left') {
                continue;
            }

            const sx = region === 'top' ? x : x + horizontal;
            const sy = region === 'top' ? y + vertical : y;
            if (sx < 0 || sy < 0 || sx >= width || sy >= height) {
                continue;
            }

            const partner = littleDiamond(sx - cx, sy - cy, horizontal, vertical);
            if (partner !== (region === 'top' ? 'bottom' : 'right')) {
                continue;
            }

            const di = (y * width + x) * 4;
            const si = (sy * width + sx) * 4;
            output[di] = source[si];
            output[di + 1] = source[si + 1];
            output[di + 2] = source[si + 2];
            output[di + 3] = source[si + 3];
            output[si] = source[di];
            output[si + 1] = source[di + 1];
            output[si + 2] = source[di + 2];
            output[si + 3] = source[di + 3];
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
sizeInput.addEventListener('input', function () {
    updateReadouts();
    updateCanvas();
});
