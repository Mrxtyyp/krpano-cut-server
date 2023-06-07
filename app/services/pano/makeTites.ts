/**
 * @description 生成多分辨率瓦图
 * @author xt
 * @Date 2023-03-24
 */

import { spawn, Thread, Worker } from "threads";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import configPath from "../../config";
import { existsMkdirFolder, formatNumToStr } from "../../utils/common";
import { queue } from "async";
import { Canvas, Image, ImageData } from "canvas";
import { imageToCanvas } from "./canvas";
import path from "path";
import { generatePanoXml } from "../file/xml";

export interface ILevelConfig {
    row: number; // 行
    col: number; // 列
    size: number; // 分辨率
}

interface ILimitTask {
    path: string;
    buf: Buffer;
}

export interface ITiles {
    path: string;
    sx: number;
    sy: number;
    sw: number;
    sh: number;
    scaleWidth: number;
}

/**
 * 生成多分辨率瓦图
 */
export default class MakeTiles {
    public levelConfig: ILevelConfig[] = [];
    readonly maxTileSize = 512;

    private imageData: ImageData;

    public imageName: string
    public imagePath: string
    public imageSavePath: string

    constructor(imagePath: string, imageSavePath: string = configPath.SCENE_PATH) {
        this.imagePath = imagePath;
        this.imageName = path.basename(imagePath, '.jpg')
        this.imageSavePath = imageSavePath
    }

    public async generate() {

        const canvas = await imageToCanvas(this.imagePath)
        const imageData = canvas
            .getContext("2d")
            .getImageData(0, 0, canvas.width, canvas.height);
        this.imageData = imageData;

        const tilesGenerate = await spawn(new Worker("../workers/tilesGenerate"));

        console.time("analyzeImagesLevel");
        this.levelConfig = await tilesGenerate.analyzeImagesLevel(
            this.imageData.width
        );
        console.timeEnd("analyzeImagesLevel");

        await Thread.terminate(tilesGenerate);

        await this.generateTiles(this.levelConfig, this.imageData, this.imageName, this.maxTileSize, this.imageSavePath)

        this.generatePreviewDemo()
    }

    /**
     * 生成预览demo
     */
    async generatePreviewDemo() {
        const multires = this.levelConfig.reverse().reduce((prev, cur) => {
            return prev += `,${cur.size}x${cur.size / 2}`
        }, '512')

        console.info('multires===', multires);

        await generatePanoXml(this.imageName, multires)
    }

    /**
     * 生成瓦图
     * @param level 
     * @param imageData 
     * @param imageName 
     * @param maxTileSize 
     * @param imageSavePath 
     * @returns 
     */
    async generateTiles(
        level: ILevelConfig[] = [],
        imageData: ImageData,
        imageName: string,
        maxTileSize: number,
        imageSavePath: string
    ) {

        return new Promise((resolve, reject) => {
            const sourceCanvas = new Canvas(imageData.width, imageData.height);
            const sourceCtx = sourceCanvas.getContext("2d");
            sourceCtx.putImageData(imageData, 0, 0);

            const tempCanvas = new Canvas(imageData.width, imageData.height);
            const tempCtx = tempCanvas.getContext("2d");

            const tilesCanvas = new Canvas(0, 0);
            const tilesCtx = tilesCanvas.getContext("2d");

            console.info("开始处理");
            const queueArr = queue(createLimitFile, 5);
            queueArr.drain(() => {
                console.log("all done");
                resolve(true)
            });
            queueArr.error((err) => {
                reject(err)
            })

            for (let i = 0; i < level.length; i++) {
                const nowLevel = level[i];

                tempCanvas.width = nowLevel.size;
                tempCanvas.height = nowLevel.size / 2;
                tempCtx.drawImage(sourceCanvas, 0, 0, tempCanvas.width, tempCanvas.height);


                const sourceImg = tempCanvas.toBuffer("image/jpeg", { quality: 0.92 });

                queueArr.push({
                    path: `${imageSavePath}/tiles/${imageName}/l${level.length - i}/l${level.length - i}.jpg`,
                    buf: sourceImg,
                });

                // 最后一列宽
                const lastRowWidth = nowLevel.size % maxTileSize;
                // 最后一行高
                const lastColHeight = (nowLevel.size / 2) % maxTileSize;

                for (let j = 0; j < nowLevel.col; j++) {
                    for (let k = 0; k < nowLevel.row; k++) {
                        const nowIsLastX = lastRowWidth && j === nowLevel.col - 1;
                        const nowIsLastY = lastColHeight && k === nowLevel.row - 1;
                        const sx = j * maxTileSize;
                        const sy = k * maxTileSize;
                        const sw = nowIsLastX ? lastRowWidth : maxTileSize;
                        const sh = nowIsLastY ? lastColHeight : maxTileSize;
                        const tilesImageData = tempCtx.getImageData(sx, sy, sw, sh);
                        tilesCanvas.width = sw;
                        tilesCanvas.height = sh;
                        tilesCtx.putImageData(tilesImageData, 0, 0, 0, 0, sw, sh);

                        const buf = tilesCanvas.toBuffer("image/jpeg", { quality: 0.92 });

                        queueArr.push({
                            path: `${imageSavePath}/tiles/${imageName}/l${level.length - i}/${formatNumToStr(
                                k + 1
                            )}/l${level.length - i}_${formatNumToStr(k + 1)}_${formatNumToStr(
                                j + 1
                            )}.jpg`,
                            buf
                        });

                    }
                }
            }

            const bufPreview = this.generateThumb(imageData, 1024, 512)

            queueArr.push({
                path: `${imageSavePath}/tiles/${imageName}/preview.jpg`,
                buf: bufPreview,
            });

            const bufThumb = this.generateThumb(imageData, 240, 240)

            queueArr.push({
                path: `${imageSavePath}/tiles/${imageName}/thumb.jpg`,
                buf: bufThumb,
            });
        })

    }

    /**
     * 生成图片
     * @param imageData 
     * @param width 
     * @param height 
     * @returns 
     */
    generateThumb(imageData: ImageData, width: number, height: number) {
        const tempCanvas = new Canvas(imageData.width, imageData.height);
        const tempCtx = tempCanvas.getContext("2d");
        tempCtx.putImageData(imageData, 0, 0);
        const tilesCanvas = new Canvas(width, height);
        const tilesCtx = tilesCanvas.getContext("2d");
        tilesCtx.drawImage(tempCanvas, 0, 0, width, height);

        return tilesCanvas.toBuffer("image/jpeg", { quality: 0.92 });
    }
}

function createLimitFile(limitFile: ILimitTask, callback: Function) {
    // 判断文件夹是否存在,文件夹不存在，创建文件夹
    existsMkdirFolder(limitFile.path)

    const ws = createWriteStream(limitFile.path);
    ws.on("error", (e: Error) => {
        callback(e);
    });
    ws.on("finish", () => {
        callback(true);
    });
    ws.write(limitFile.buf);
    ws.end();
}