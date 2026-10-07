const upload = document.getElementById('upload-original');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cursorLayer = document.getElementById('cursor-layer');
const cursorCtx = cursorLayer.getContext('2d');
const sizeInput = document.getElementById('block-size');
const originalContainer = document.getElementById('original-container');

let originalImage = null;
let placed = [];
let lockedSize = null;

function updateReadout() {
    document.getElementById('size-readout').textContent = sizeInput.value + ' px / ' + sizeInput.max + ' px';
}

function blockSize() {
    return lockedSize || parseInt(sizeInput.value, 10);
}

function layout(size) {
    const s = Math.max(8, Math.round(size));
    const cheekW = s;
    const cheekH = Math.round(s * 1.65);
    const mouth = s;
    const triW = Math.round(s * 1.9);
    const triH = Math.round(s * 1.05);
    const circleD = Math.round(s * 1.25);
    const noseBase = Math.round(s * 1.2);
    const noseH = Math.round(s * 1.4);
    const margin = Math.max(18, Math.round(s * 0.4));
    const contentW = triW + cheekW + mouth + cheekW + triW;
    const contentH = cheekH + circleD;
    const baseline = margin + contentH;
    const mouthX = margin + triW + cheekW;
    const mouthY = baseline - mouth;
    const leftCheekX = mouthX - cheekW;
    const rightCheekX = mouthX + mouth;
    const rightInner = rightCheekX + cheekW;
    const radius = circleD / 2;
    const noseMid = mouthX + mouth / 2;

    return {
        width: contentW + margin * 2,
        height: contentH + margin * 2,
        pieces: [
            {
                kind: 'polygon',
                points: [
                    [leftCheekX - triW, baseline],
                    [leftCheekX, baseline],
                    [leftCheekX, baseline - triH]
                ]
            },
            {
                kind: 'polygon',
                points: [
                    [rightInner, baseline - triH],
                    [rightInner, baseline],
                    [rightInner + triW, baseline]
                ]
            },
            { kind: 'rect', x: leftCheekX, y: baseline - cheekH, w: cheekW, h: cheekH },
            { kind: 'rect', x: rightCheekX, y: baseline - cheekH, w: cheekW, h: cheekH },
            { kind: 'rect', x: mouthX, y: mouthY, w: mouth, h: mouth },
            {
                kind: 'polygon',
                points: [
                    [noseMid, mouthY - noseH],
                    [noseMid - noseBase / 2, mouthY],
                    [noseMid + noseBase / 2, mouthY]
                ]
            },
            { kind: 'circle', cx: leftCheekX + cheekW / 2, cy: baseline - cheekH - radius, r: radius },
            { kind: 'circle', cx: rightCheekX + cheekW / 2, cy: baseline - cheekH - radius, r: radius }
        ]
    };
}

function traceShape(context, piece) {
    context.beginPath();
    if (piece.kind === 'circle') {
        context.arc(piece.cx, piece.cy, piece.r, 0, Math.PI * 2);
    } else if (piece.kind === 'rect') {
        context.rect(piece.x, piece.y, piece.w, piece.h);
    } else {
        piece.points.forEach(function (point, index) {
            if (index === 0) {
                context.moveTo(point[0], point[1]);
            } else {
                context.lineTo(point[0], point[1]);
            }
        });
        context.closePath();
    }
}

function boundsOf(piece) {
    if (piece.kind === 'rect') {
        return { x: piece.x, y: piece.y, w: piece.w, h: piece.h };
    }
    if (piece.kind === 'circle') {
        return { x: piece.cx - piece.r, y: piece.cy - piece.r, w: piece.r * 2, h: piece.r * 2 };
    }
    const xs = piece.points.map(function (point) { return point[0]; });
    const ys = piece.points.map(function (point) { return point[1]; });
    const minX = Math.min.apply(null, xs);
    const maxX = Math.max.apply(null, xs);
    const minY = Math.min.apply(null, ys);
    const maxY = Math.max.apply(null, ys);
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function renderOutput() {
    const plan = layout(blockSize());
    canvas.width = plan.width;
    canvas.height = plan.height;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, plan.width, plan.height);
    placed.forEach(function (hit) {
        const piece = plan.pieces[hit.index];
        const box = boundsOf(piece);
        const pieceCx = box.x + box.w / 2;
        const pieceCy = box.y + box.h / 2;
        ctx.save();
        traceShape(ctx, piece);
        ctx.clip();
        ctx.drawImage(originalImage, pieceCx - hit.x, pieceCy - hit.y);
        ctx.restore();
    });
}

function imageMetrics() {
    const rect = cursorLayer.getBoundingClientRect();
    const viewW = rect.width || originalContainer.clientWidth;
    const viewH = rect.height || originalContainer.clientHeight;
    const scaleToBitmapX = viewW ? cursorLayer.width / viewW : 1;
    const scaleToBitmapY = viewH ? cursorLayer.height / viewH : 1;
    const fit = Math.min(viewW / originalImage.width, viewH / originalImage.height);
    const dispW = originalImage.width * fit;
    const dispH = originalImage.height * fit;
    return {
        left: ((viewW - dispW) / 2) * scaleToBitmapX,
        top: ((viewH - dispH) / 2) * scaleToBitmapY,
        scaleX: fit * scaleToBitmapX,
        scaleY: fit * scaleToBitmapY
    };
}

function pointerOnLayer(event) {
    const rect = cursorLayer.getBoundingClientRect();
    return {
        x: (event.clientX - rect.left) * (cursorLayer.width / rect.width),
        y: (event.clientY - rect.top) * (cursorLayer.height / rect.height)
    };
}

function resizeCursorLayer() {
    const rect = originalContainer.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    if (cursorLayer.width !== width || cursorLayer.height !== height) {
        cursorLayer.width = width;
        cursorLayer.height = height;
    }
}

function clearCursor() {
    resizeCursorLayer();
    cursorCtx.clearRect(0, 0, cursorLayer.width, cursorLayer.height);
}

function drawCursor(pointX, pointY) {
    clearCursor();
    if (!originalImage || placed.length >= 8) {
        return;
    }
    const metrics = imageMetrics();
    const imageX = (pointX - metrics.left) / metrics.scaleX;
    const imageY = (pointY - metrics.top) / metrics.scaleY;
    if (imageX < 0 || imageY < 0 || imageX > originalImage.width || imageY > originalImage.height) {
        return;
    }
    const piece = layout(blockSize()).pieces[placed.length];
    const box = boundsOf(piece);
    cursorCtx.save();
    cursorCtx.translate(pointX, pointY);
    cursorCtx.scale(metrics.scaleX, metrics.scaleY);
    cursorCtx.translate(-(box.x + box.w / 2), -(box.y + box.h / 2));
    traceShape(cursorCtx, piece);
    cursorCtx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    cursorCtx.fill();
    cursorCtx.lineWidth = 1.5 / metrics.scaleX;
    cursorCtx.strokeStyle = '#111';
    cursorCtx.stroke();
    cursorCtx.lineWidth = 1 / metrics.scaleX;
    cursorCtx.strokeStyle = '#fff';
    cursorCtx.stroke();
    cursorCtx.restore();
}

function placeAt(imageX, imageY) {
    if (!originalImage || placed.length >= 8) {
        return;
    }
    if (imageX < 0 || imageY < 0 || imageX > originalImage.width || imageY > originalImage.height) {
        return;
    }
    if (!lockedSize) {
        lockedSize = blockSize();
        sizeInput.disabled = true;
    }
    placed.push({ index: placed.length, x: imageX, y: imageY });
    renderOutput();
    if (placed.length >= 8) {
        originalContainer.classList.remove('placing');
        clearCursor();
    }
}

function syncPlacementMode() {
    const placing = originalImage && placed.length < 8;
    originalContainer.classList.toggle('placing', placing);
    if (placing) {
        requestAnimationFrame(resizeCursorLayer);
    } else {
        clearCursor();
    }
}

window.addEventListener('resize', function () {
    if (!originalImage) {
        return;
    }
    resizeCursorLayer();
});

updateReadout();

upload.addEventListener('change', function (e) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            originalImage = img;
            placed = [];
            lockedSize = null;
            sizeInput.disabled = false;
            const limit = Math.max(12, Math.floor(Math.min(img.width, img.height) / 2.1));
            sizeInput.max = String(limit);
            if (parseInt(sizeInput.value, 10) > limit) {
                sizeInput.value = String(limit);
            }
            updateReadout();
            document.getElementById('original-image').src = event.target.result;
            document.getElementById('original-image').style.display = 'block';
            originalContainer.classList.add('image-uploaded');
            document.getElementById('result-container').classList.add('image-uploaded');
            syncPlacementMode();
            renderOutput();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
});

sizeInput.addEventListener('input', function () {
    updateReadout();
    if (originalImage && !lockedSize) {
        renderOutput();
    }
});

cursorLayer.addEventListener('mousemove', function (event) {
    resizeCursorLayer();
    const point = pointerOnLayer(event);
    drawCursor(point.x, point.y);
});

cursorLayer.addEventListener('mouseleave', function () {
    clearCursor();
});

cursorLayer.addEventListener('click', function (event) {
    if (!originalImage) {
        return;
    }
    resizeCursorLayer();
    const point = pointerOnLayer(event);
    const metrics = imageMetrics();
    placeAt((point.x - metrics.left) / metrics.scaleX, (point.y - metrics.top) / metrics.scaleY);
});
