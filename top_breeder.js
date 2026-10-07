const upload = document.getElementById('upload-original');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let originalImage;

const cutsInput = document.getElementById('cuts');

function showPixels(input, readoutId) {
    document.getElementById(readoutId).textContent = input.value + ' px / ' + input.max + ' px';
}

showPixels(cutsInput, 'cuts-readout');
let img1, img2;
let which = NaN;

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

function performFirstCut() {
    if (!originalImage) {
        alert("Please upload an image first.");
        return;
    }

    which = 1;

    const cuts = parseInt(document.getElementById('cuts').value);
    const width = originalImage.width;
    const height = originalImage.height;

    img1 = document.createElement('canvas');
    img1.width = width;
    img1.height = height;
    const ctx1 = img1.getContext('2d');

    let j = 0;
    for (let i = 0; i < cuts; i += 2) {
        ctx1.drawImage(originalImage, i * (width / cuts), 0, width / cuts, height, j * (width / cuts), 0, width / cuts, height);
        ctx1.drawImage(originalImage, (i + 1) * (width / cuts), 0, width / cuts, height, j * (width / cuts) + width / 2, 0, width / cuts, height);
        j++;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img1, 0, 0);
}

function performSecondCuts() {
    if (!img1) {
        alert("Please perform the first cut first.");
        return;
    }

    which = 2;

    const cuts = parseInt(document.getElementById('cuts').value);
    const width = img1.width;
    const height = img1.height;

    img2 = document.createElement('canvas');
    img2.width = width;
    img2.height = height;
    const ctx2 = img2.getContext('2d');

    let j = 0;
    for (let i = 0; i < cuts; i += 2) {
        ctx2.drawImage(img1, 0, i * (height / cuts), width, height / cuts, 0, j * (height / cuts), width, height / cuts);
        ctx2.drawImage(img1, 0, (i + 1) * (height / cuts), width, height / cuts, 0, j * (height / cuts) + height / 2, width, height / cuts);
        j++;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img2, 0, 0);
}

document.getElementById('first_cut').addEventListener('click', performFirstCut);
document.getElementById('second_cuts').addEventListener('click', performSecondCuts);

cutsInput.addEventListener('input', function () {
    showPixels(cutsInput, 'cuts-readout');
    if (which == 2) {
        performFirstCut()
        performSecondCuts();
    } else if (which == 1) {
        performFirstCut();
    }
});
