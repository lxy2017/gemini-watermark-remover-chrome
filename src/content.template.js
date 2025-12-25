/**
 * Content Script Template - Edit this file and run build-extension.js
 * Placeholders {{BG_48_DATA}} and {{BG_96_DATA}} will be replaced with base64
 */

(function () {
    'use strict';

    // ============= Alpha Map Calculator =============
    function calculateAlphaMap(bgCaptureImageData) {
        const { width, height, data } = bgCaptureImageData;
        const alphaMap = new Float32Array(width * height);

        for (let i = 0; i < alphaMap.length; i++) {
            const idx = i * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const maxChannel = Math.max(r, g, b);
            alphaMap[i] = maxChannel / 255.0;
        }

        return alphaMap;
    }

    // ============= Blend Modes (Reverse Alpha Blending) =============
    const ALPHA_THRESHOLD = 0.002;
    const MAX_ALPHA = 0.99;
    const LOGO_VALUE = 255;

    function removeWatermark(imageData, alphaMap, position) {
        const { x, y, width, height } = position;

        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const imgIdx = ((y + row) * imageData.width + (x + col)) * 4;
                const alphaIdx = row * width + col;

                let alpha = alphaMap[alphaIdx];

                if (alpha < ALPHA_THRESHOLD) {
                    continue;
                }

                alpha = Math.min(alpha, MAX_ALPHA);
                const oneMinusAlpha = 1.0 - alpha;

                for (let c = 0; c < 3; c++) {
                    const watermarked = imageData.data[imgIdx + c];
                    const original = (watermarked - alpha * LOGO_VALUE) / oneMinusAlpha;
                    imageData.data[imgIdx + c] = Math.max(0, Math.min(255, Math.round(original)));
                }
            }
        }
    }

    // ============= Watermark Config Detection =============
    function detectWatermarkConfig(imageWidth, imageHeight) {
        if (imageWidth > 1024 && imageHeight > 1024) {
            return { logoSize: 96, marginRight: 64, marginBottom: 64 };
        } else {
            return { logoSize: 48, marginRight: 32, marginBottom: 32 };
        }
    }

    function calculateWatermarkPosition(imageWidth, imageHeight, config) {
        const { logoSize, marginRight, marginBottom } = config;
        return {
            x: imageWidth - marginRight - logoSize,
            y: imageHeight - marginBottom - logoSize,
            width: logoSize,
            height: logoSize
        };
    }

    // ============= Watermark Engine =============
    class WatermarkEngine {
        constructor() {
            this.alphaMaps = {};
            this.bgCaptures = {};
        }

        async loadBackgroundImages() {
            // These placeholders are replaced by build-extension.js
            const bg48DataUrl = '{{BG_48_DATA}}';
            const bg96DataUrl = '{{BG_96_DATA}}';

            const loadImg = (src) => new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
            });

            const [bg48, bg96] = await Promise.all([
                loadImg(bg48DataUrl),
                loadImg(bg96DataUrl)
            ]);

            this.bgCaptures = { bg48, bg96 };
        }

        async getAlphaMap(size) {
            if (this.alphaMaps[size]) {
                return this.alphaMaps[size];
            }

            const bgImage = size === 48 ? this.bgCaptures.bg48 : this.bgCaptures.bg96;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(bgImage, 0, 0);

            const imageData = ctx.getImageData(0, 0, size, size);
            const alphaMap = calculateAlphaMap(imageData);
            this.alphaMaps[size] = alphaMap;

            return alphaMap;
        }

        async removeWatermarkFromImage(image) {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const config = detectWatermarkConfig(canvas.width, canvas.height);
            const position = calculateWatermarkPosition(canvas.width, canvas.height, config);
            const alphaMap = await this.getAlphaMap(config.logoSize);

            removeWatermark(imageData, alphaMap, position);
            ctx.putImageData(imageData, 0, 0);

            return canvas;
        }
    }

    // ============= Main Logic =============
    let engine = null;

    const loadImage = (src) => new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });

    const canvasToBlob = (canvas, type = 'image/png') =>
        new Promise(resolve => canvas.toBlob(resolve, type));

    const replaceWithNormalSize = (src) => {
        return src.replace(/=s\d+(?=[-?#]|$)/, '=s0');
    };

    async function processImageBlob(blob) {
        const blobUrl = URL.createObjectURL(blob);
        const img = await loadImage(blobUrl);
        const canvas = await engine.removeWatermarkFromImage(img);
        URL.revokeObjectURL(blobUrl);
        return canvasToBlob(canvas);
    }

    // Only match gemini generated assets (copy & download)
    const GEMINI_URL_PATTERN = /^https:\/\/lh3\.googleusercontent\.com\/rd-gg(?:-dl)?\/.*=s(?!0-d\?).*/;

    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;

        if (GEMINI_URL_PATTERN.test(url)) {
            console.log('[Gemini Watermark Remover] Intercepting:', url);

            const origUrl = replaceWithNormalSize(url);
            if (typeof args[0] === 'string') args[0] = origUrl;
            else if (args[0]?.url) args[0].url = origUrl;

            const response = await originalFetch(...args);
            if (!engine || !response.ok) return response;

            try {
                const processedBlob = await processImageBlob(await response.blob());
                return new Response(processedBlob, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers
                });
            } catch (error) {
                console.warn('[Gemini Watermark Remover] Processing failed:', error);
                return response;
            }
        }

        return originalFetch(...args);
    };

    // Initialize
    (async function init() {
        try {
            console.log('[Gemini Watermark Remover] Initializing...');
            engine = new WatermarkEngine();
            await engine.loadBackgroundImages();
            console.log('[Gemini Watermark Remover] Ready');
        } catch (error) {
            console.error('[Gemini Watermark Remover] Initialization failed:', error);
        }
    })();

})();
