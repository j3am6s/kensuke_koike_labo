const upload = document.getElementById('upload-original');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let originalImage;
let widths = [];
let shifts = [];

const cutsInput = document.getElementById('cuts');

function updateReadouts() {
    document.getElementById('cuts-readout').textContent = cutsInput.value + ' / ' + cutsInput.max;
}

updateReadouts();

function randomWidths(count, total) {
    const points = new Set();
    while (points.size < count - 1) {
        points.add(1 + Math.floor(Math.random() * (total - 1)));
    }
    const sorted = [0, ...[...points].sort((a, b) => a - b), total];
    const pieces = [];
    for (let i = 0; i < sorted.length - 1; i++) {
        pieces.push(sorted[i + 1] - sorted[i]);
    }
    return pieces;
}

function randomShifts(count, height) {
    const limit = Math.max(1, Math.round(height * 0.08));
    const pieces = [];
    for (let i = 0; i < count; i++) {
        const amount = 1 + Math.floor(Math.random() * limit);
        pieces.push(Math.random() < 0.5 ? -amount : amount);
    }
    return pieces;
}

function prepareCuts() {
    const count = Math.min(parseInt(cutsInput.value, 10), originalImage.width);
    widths = randomWidths(count, originalImage.width);
    shifts = randomShifts(count, originalImage.height);
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

            cutsInput.max = Math.min(100, img.width);
            cutsInput.value = Math.min(parseInt(cutsInput.value, 10), parseInt(cutsInput.max, 10));
            updateReadouts();
            prepareCuts();
            updateCanvas();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
});

function updateCanvas() {
    if (!originalImage || widths.length === 0) {
        return;
    }

    const width = originalImage.width;
    const height = originalImage.height;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    let x = 0;
    for (let i = 0; i < widths.length; i++) {
        const stripWidth = widths[i];
        const shift = ((shifts[i] % height) + height) % height;
        if (shift !== 0) {
            ctx.drawImage(originalImage, x, height - shift, stripWidth, shift, x, 0, stripWidth, shift);
        }
        ctx.drawImage(originalImage, x, 0, stripWidth, height - shift, x, shift, stripWidth, height - shift);
        x += stripWidth;
    }
}

cutsInput.addEventListener('input', function () {
    updateReadouts();
    if (!originalImage) {
        return;
    }
    prepareCuts();
    updateCanvas();
});

document.getElementById('random-widths').addEventListener('click', function () {
    if (!originalImage) {
        return;
    }
    widths = randomWidths(widths.length, originalImage.width);
    updateCanvas();
});

document.getElementById('random-shifts').addEventListener('click', function () {
    if (!originalImage) {
        return;
    }
    shifts = randomShifts(shifts.length, originalImage.height);
    updateCanvas();
});
