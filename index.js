const qrcode = require('qrcode');
const qrReader = require('qrcode-reader');
const canvas = require('canvas');

function createQrcode(data, sizeMultiplier) {
  const cnvs = canvas.createCanvas(1, 1);
  qrcode.toCanvas(
    cnvs,
    data,
    {
      errorCorrectionLevel: 'H',
      margin: 0,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    }
  );
  if (sizeMultiplier > 1) {
    const scale = cnvs.width * Math.floor(sizeMultiplier);
    const bigCnvs = canvas.createCanvas(scale, scale);
    const ctx = bigCnvs.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(cnvs, 0, 0, scale, scale);
    return bigCnvs;
  }
  return cnvs;
}

function addLogo(qr, qrScale, image, imageScale) {
  const scale = qrScale * 4;
  const cnvs = canvas.createCanvas(qr.width, qr.height);
  const ctx = cnvs.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(qr, 0, 0);
  const pixelCount = qr.width / scale;
  const pixelDividerTemp = Math.floor(pixelCount * imageScale);
  const pixelPos = Math.floor((pixelCount - pixelDividerTemp) / 2);
  const pixelWidth = pixelCount - pixelPos * 2;
  const imgWidth = pixelWidth * scale;
  const imgPos = pixelPos * scale;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(image, imgPos, imgPos, imgWidth, imgWidth);
  return cnvs;
}

async function checkQrcode(cnvs, data) {
  return new Promise(resolve => {
    const qr = new qrReader();
    const ctx = cnvs.getContext('2d');
    const img = ctx.getImageData(0, 0, cnvs.width, cnvs.height);
    qr.callback = (err, value) => {
      if (!err) {
        if (value.result == data) {
          resolve(true);
        }
      }
      resolve(false);
    };
    qr.decode(img);
  });
}

/**
 * qrlogo is an all in one function, to generate a QR-Code,
 * scale it with an multiplier, insert a logo, check if it
 * is still valid and if not, resize the logo down until
 * it becomes valid.
 * @param {string} data data which should be put into the qr code
 * @param {canvas.Canvas | canvas.Image | string} [logo=undefined]
 * logo as canvas or path (which will be loaded with canvas.loadImage())
 * @param {number} [sizeMultiplier=1] size multiplier as positive int to scale qr code
 * @param {number} [logoScale=0.4] coefficient of the logo size
 * @param {boolean} [check=true] qr code validator which scales down the logo automatically if qr code is not valid
 * 
 * @return  {canvas.Canvas | undefined}  canvas object with QR-Code and logo
 */
module.exports = async function qrlogo(data, logo, sizeMultiplier, logoScale, check) {
  if (!data) {
    return;
  }
  if (!sizeMultiplier || sizeMultiplier < 1) {
    sizeMultiplier = 1;
  }
  sizeMultiplier = Math.floor(sizeMultiplier);
  const qr = createQrcode(data, sizeMultiplier);
  if (!logo) {
    return qr;
  }
  if (typeof logo === 'string') {
    logo = await canvas.loadImage(logo);
  }
  if (!logoScale) {
    logoScale = 0.4;
  }
  if (check === false) {
    return await addLogo(qr, sizeMultiplier, logo, logoScale);
  }
  for (let i = logoScale; i > 0.04; i = i - 0.05) {
    const qrToCheck = await addLogo(qr, sizeMultiplier, logo, i);
    const check = await checkQrcode(qrToCheck, data);
    if (check) {
      return qrToCheck;
    }
  }
  return qr;
}
