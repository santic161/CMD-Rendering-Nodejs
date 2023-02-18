const cp = require("child_process");
const cluster = require("cluster");
const fs = require("fs");
const Jimp = require("jimp");
const extract = require("metadata-extract");
const FIFO = require("fifo-buffer");
const readline = require("readline");

const sleep = (ms: number = 1000) => {
    return new Promise((resolve) => {
        setTimeout(() => (sleepFlag = true), ms);
    });
};
let sleepFlag = false;
const convertFramesToAscii = async (
    width: string | number,
    height: string | number
) => {
    let files = fs.readdirSync("./tmp/frames");
    const brightnessLevels: string = " .-+*wGHM#&%";
    let frame: any;
    interface color {
        r: number;
        g: number;
        b: number;
    }
    let color: color;
    let avg: number;
    let result: string;
    const audioMeta = await extract("./tmp/audio.wav");
    const audioDuration = audioMeta["music-metadata"].duration;
    let audio = cp.spawn("ffplay", [
        "-i",
        "./tmp/audio.wav",
        "-nodisp",
        "-autoexit",
    ]);
    let time = 0;

    audio.stderr.on("data", (data: Buffer) => {
        time = parseFloat(data.toString().trim().split(" ")[0]);
    });
    var buffer = new FIFO(); //10 sec buffer ~ 600 frames
    let framePercent: number;
    let audioPercent: number;
    let frameIndex: number;
    let start = true;
    while (start) {
        isNaN(time) ? (time = 0) : null;
        console.clear()
        readline.cursorTo(process.stdout, 0, null);
        frameIndex = Math.floor((time / audioDuration) * files.length);
        frame = await Jimp.read(
            `tmp/frames/${frameIndex < 1 ? 1 : frameIndex}.bmp`
        );
        for (let j = 0; j < frame.bitmap.height; j++) {
            for (let k = 0; k < frame.bitmap.width; k++) {
                color = Jimp.intToRGBA(frame.getPixelColor(k, j));
                avg = (color.r + color.g + color.b) / 3;
                result +=
                    avg <= 23
                        ? brightnessLevels[0]
                        : avg <= 46 && avg > 23
                        ? brightnessLevels[1]
                        : avg <= 69 && avg > 46
                        ? brightnessLevels[2]
                        : avg <= 92 && avg > 69
                        ? brightnessLevels[3]
                        : avg <= 116 && avg > 92
                        ? brightnessLevels[4]
                        : avg <= 139 && avg > 116
                        ? brightnessLevels[5]
                        : avg <= 162 && avg > 139
                        ? brightnessLevels[6]
                        : avg <= 185 && avg > 162
                        ? brightnessLevels[7]
                        : avg <= 208 && avg > 185
                        ? brightnessLevels[8]
                        : avg <= 232 && avg > 208
                        ? brightnessLevels[9]
                        : avg > 232
                        ? brightnessLevels[10]
                        : brightnessLevels[11];
            }
            result += "\n";
        }
        process.stdout.write(result);
        result = "";
        if (frameIndex == files.length) [(start = false)];
        // for (let i = 1; i < files.length; i++) {
        //     frame = await Jimp.read(`tmp/frames/${i}.bmp`);
        //     let framePercent = (i * 100) / files.length;
        //     let audioPercent = (time * audioDuration) / 100;
        //     for (let j = 0; j < frame.bitmap.height; j++) {
        //         for (let k = 0; k < frame.bitmap.width; k++) {
        //             color = Jimp.intToRGBA(frame.getPixelColor(k, j));
        //             avg = (color.r + color.g + color.b) / 3;
        //             result +=
        //                 avg <= 23
        //                     ? brightnessLevels[0]
        //                     : avg <= 46 && avg > 23
        //                     ? brightnessLevels[1]
        //                     : avg <= 69 && avg > 46
        //                     ? brightnessLevels[2]
        //                     : avg <= 92 && avg > 69
        //                     ? brightnessLevels[3]
        //                     : avg <= 116 && avg > 92
        //                     ? brightnessLevels[4]
        //                     : avg <= 139 && avg > 116
        //                     ? brightnessLevels[5]
        //                     : avg <= 162 && avg > 139
        //                     ? brightnessLevels[6]
        //                     : avg <= 185 && avg > 162
        //                     ? brightnessLevels[7]
        //                     : avg <= 208 && avg > 185
        //                     ? brightnessLevels[8]
        //                     : avg <= 232 && avg > 208
        //                     ? brightnessLevels[9]
        //                     : avg > 232
        //                     ? brightnessLevels[10]
        //                     : brightnessLevels[11];
        //         }
        //         result += "\n";
        //     }
        //     if (audioPercent < framePercent && framePercent - audioPercent < 5) {
        //         // buffer.enq(Buffer.from(result));
        //     } else {
        //         sleep((i / 60 - time) * 10000);
        //         if (sleepFlag == true) {
        //             sleepFlag = false;
        //             if (buffer.size > 0) {
        //                 process.stdout.write(
        //                     buffer.deq(Buffer.from(result).byteLength)
        //                 );
        //             } else {
        //                 process.stdout.write(result);
        //             }
        //         }
        //     }
        //     result = "";
        // }
    }
};

const getFrames = (
    width: string | number,
    height: string | number,
    videoPath: string
) => {
    cp.spawn("ffmpeg", [
        "-i",
        videoPath,
        "-vf",
        `scale=${width}:${height}`,
        "tmp\\frames\\%0d.bmp",
    ]);
    cp.spawn("ffmpeg", ["-i", videoPath, "tmp\\audio.wav"]);
    //"ffmpeg.exe -loglevel panic -i ./" + videoName + ".mp4  tmp\\audio.wav"
    //"ffmpeg.exe -loglevel panic -i ./" + videoName + ".mp4 -vf scale=" + width + ":" + height + " tmp\\frames\\%0d.bmp "
    convertFramesToAscii(width, height);
};

const main = async () => {
    const video = "./Bad_Apple.mp4";
    const width = process.stdout.columns;
    const height = process.stdout.rows;

    getFrames(width, height, video);
};

if (cluster.isWorker) {
    interface messages {
        message: string;
        frame: Buffer;
    }

    process.on("message", (msg: messages) => {
        if (msg.message === "startRendering") {
            process.stdout.write(msg.frame);
        }
    });
} else {
    cluster.fork();
    main();
}
