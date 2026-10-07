const upload = document.getElementById('upload-original');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let originalImage;

const distanceInput = document.getElementById('distance');
const sizeInput = document.getElementById('size');

function showPixels(input, readoutId) {
    document.getElementById(readoutId).textContent = input.value + ' px / ' + input.max + ' px';
}

showPixels(distanceInput, 'distance-readout');
showPixels(sizeInput, 'size-readout');

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
            canvas.width = img.width; 
            canvas.height = img.height;
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
});

distanceInput.addEventListener('input', function () {
    if (parseInt(sizeInput.value) > parseInt(distanceInput.value)) {
        sizeInput.value = distanceInput.value;
    }
    showPixels(distanceInput, 'distance-readout');
    showPixels(sizeInput, 'size-readout');
});

sizeInput.addEventListener('input', function () {
    if (parseInt(sizeInput.value) > parseInt(distanceInput.value)) {
        distanceInput.value = sizeInput.value;
    }
    showPixels(distanceInput, 'distance-readout');
    showPixels(sizeInput, 'size-readout');
});

function updateCanvas() {
    if (!originalImage) {
        alert("Please upload an image first.");
        return;
    }

    const distance = parseInt(document.getElementById('distance').value);
    const size = parseInt(document.getElementById('size').value);

    const width = originalImage.width;
    const height = originalImage.height;

    const newWidth = Math.floor(width / distance) * size;
    const newHeight = Math.floor(height / distance) * size;

    canvas.width = newWidth;
    canvas.height = newHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 1; i <= Math.floor(width / distance); i++) {
        for (let j = 0; j < Math.floor(height / distance); j++) {
            ctx.drawImage(
                originalImage,
                i * distance, j * distance, size, size, 
                (i - 1) * size, j * size, size, size  
            );
        }
    }
}

document.getElementById('distance').addEventListener('input', updateCanvas);
document.getElementById('size').addEventListener('input', updateCanvas);


