const videoElement = document.querySelector("video");
const canvasElement = document.querySelector("canvas");
const context = canvasElement.getContext("2d", { willReadFrequently: true });
const downloadArea = document.querySelector(".download-area");
const snapSound = document.querySelector("audio");
var timer;

const zoom = document.querySelector("#zoom");
const posX = document.querySelector("#zoom-offset-x")
const posY = document.querySelector("#zoom-offset-y")

function getVideo() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => videoElement.srcObject = stream);
}

function paintToCanvas() {
    let height = videoElement.videoHeight;
    let width = videoElement.videoWidth;
    canvasElement.height = height;
    canvasElement.width = width;

    timer = setInterval(() => {
        context.clearRect(0, 0, width, height);
        context.drawImage(videoElement,
            width * posX.value, height * posY.value, width * (1 - posX.value), height * (1 - posY.value),
            0, 0, width * Number(zoom.value) * (1 - posX.value), height * Number(zoom.value) * (1 - posY.value));


        const image = context.getImageData(0, 0, width, height);
        context.putImageData(filter(image), 0, 0);

    }, 16);


}
function takePhoto() {
    snapSound.play();
    const data = canvasElement.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = data;
    downloadLink.innerHTML = `<img src=${data}>`
    downloadLink.setAttribute("download", "photo.png");
    downloadArea.prepend(downloadLink);
}

videoElement.addEventListener("canplay", paintToCanvas);
document.querySelector(".takePhoto").addEventListener("click", takePhoto);
document.querySelector(".startBtn").addEventListener("click", getVideo);

document.querySelector(".stopBtn").addEventListener("click", () => {
    clearInterval(timer);
    videoElement.srcObject.getTracks().forEach(track => {
        track.stop();
    })
})


const greyScale = document.querySelector("#greyscale");
const blackWhite = document.querySelector("#blackWhite");
const color = document.querySelector("#color");
const rmColor = document.querySelector("#rm-color");
const rmColorLevel = document.querySelector("#rm-color-level");

function greyScaleEffect(pixels) {
    for (let i = 0; i < pixels.data.length; i += 4) {
        const avg = (pixels.data[i] + pixels.data[i + 1] + pixels.data[i + 2]) / 3;
        pixels.data[i] = avg;
        pixels.data[i + 1] = avg;
        pixels.data[i + 2] = avg;
    }
    return pixels;
}
function removeColor(pixels, r, g, b) {
    const level = Number(rmColorLevel.value);
    for (let i = 0; i < pixels.data.length; i += 4) {
        if (
            (pixels.data[i] < (r+level) && pixels.data[i] > (r-level)) 
            && (pixels.data[i+1] < (g + level) && pixels.data[i+1] > (g - level))
            && (pixels.data[i+2] < (b + level) && pixels.data[i+2] > (b -level))
            ) {
                pixels.data[i+3] = 0;
            }
    }
    return pixels;
}
const hexToRgb = hex => hex.replace("#", "").match(/.{2}/g).map(x => parseInt(x, 16));

function filter(pixels) {
    if (rmColor.checked) {

        const [r, g, b] = hexToRgb(color.value);
        pixels = removeColor(pixels, r, g, b);
    }
    if (blackWhite.checked) {
        pixels = blackWhiteEffect(pixels);
    } else if (greyScale.checked) {
        pixels = greyScaleEffect(pixels);
    }
    return pixels;
}

function blackWhiteEffect(pixels) {
    for (let i = 0; i < pixels.data.length; i += 4) {
        let avg = (pixels.data[i] + pixels.data[i + 1] + pixels.data[i + 2]) / 3;
        avg = avg > 128 ? 255 : 0;
        pixels.data[i] = avg;
        pixels.data[i + 1] = avg;
        pixels.data[i + 2] = avg;
    }
    return pixels;
}