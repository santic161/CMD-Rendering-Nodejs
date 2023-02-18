var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var cp = require("child_process");
var cluster = require("cluster");
var fs = require("fs");
var Jimp = require("jimp");
var extract = require("metadata-extract");
var FIFO = require("fifo-buffer");
var readline = require("readline");
var sleep = function (ms) {
    if (ms === void 0) { ms = 1000; }
    return new Promise(function (resolve) {
        setTimeout(function () { return (sleepFlag = true); }, ms);
    });
};
var sleepFlag = false;
var convertFramesToAscii = function (width, height) { return __awaiter(_this, void 0, void 0, function () {
    var files, brightnessLevels, frame, color, avg, result, audioMeta, audioDuration, audio, time, buffer, framePercent, audioPercent, frameIndex, start, j, k;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                files = fs.readdirSync("./tmp/frames");
                brightnessLevels = " .-+*wGHM#&%";
                return [4 /*yield*/, extract("./tmp/audio.wav")];
            case 1:
                audioMeta = _a.sent();
                audioDuration = audioMeta["music-metadata"].duration;
                audio = cp.spawn("ffplay", [
                    "-i",
                    "./tmp/audio.wav",
                    "-nodisp",
                    "-autoexit",
                ]);
                time = 0;
                audio.stderr.on("data", function (data) {
                    time = parseFloat(data.toString().trim().split(" ")[0]);
                });
                buffer = new FIFO();
                start = true;
                _a.label = 2;
            case 2:
                if (!start) return [3 /*break*/, 4];
                isNaN(time) ? (time = 0) : null;
                console.clear();
                readline.cursorTo(process.stdout, 0, null);
                frameIndex = Math.floor((time / audioDuration) * files.length);
                return [4 /*yield*/, Jimp.read("tmp/frames/".concat(frameIndex < 1 ? 1 : frameIndex, ".bmp"))];
            case 3:
                frame = _a.sent();
                for (j = 0; j < frame.bitmap.height; j++) {
                    for (k = 0; k < frame.bitmap.width; k++) {
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
                if (frameIndex == files.length)
                    [(start = false)];
                return [3 /*break*/, 2];
            case 4: return [2 /*return*/];
        }
    });
}); };
var getFrames = function (width, height, videoPath) {
    cp.spawn("ffmpeg", [
        "-i",
        videoPath,
        "-vf",
        "scale=".concat(width, ":").concat(height),
        "tmp\\frames\\%0d.bmp",
    ]);
    cp.spawn("ffmpeg", ["-i", videoPath, "tmp\\audio.wav"]);
    //"ffmpeg.exe -loglevel panic -i ./" + videoName + ".mp4  tmp\\audio.wav"
    //"ffmpeg.exe -loglevel panic -i ./" + videoName + ".mp4 -vf scale=" + width + ":" + height + " tmp\\frames\\%0d.bmp "
    convertFramesToAscii(width, height);
};
var main = function () { return __awaiter(_this, void 0, void 0, function () {
    var video, width, height;
    return __generator(this, function (_a) {
        video = "./Bad_Apple.mp4";
        width = process.stdout.columns;
        height = process.stdout.rows;
        getFrames(width, height, video);
        return [2 /*return*/];
    });
}); };
if (cluster.isWorker) {
    process.on("message", function (msg) {
        if (msg.message === "startRendering") {
            process.stdout.write(msg.frame);
        }
    });
}
else {
    cluster.fork();
    main();
}
