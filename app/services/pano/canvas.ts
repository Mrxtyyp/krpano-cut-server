
import { Canvas, Image } from "canvas";

/**
 * 图片绘制到canvas
 * @param image
 * @returns
 */
export const imageToCanvas = function (image: string | Buffer) {
    return new Promise<Canvas>((resolve, reject) => {
        let img = new Image();
        img.onload = () => {
            let canvas = new Canvas(img.width, img.height);
            let ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, img.width, img.height);
            resolve(canvas)
        }
        img.onerror = (err) => {
            console.info(err);
            reject(err)
        }
        img.src = image;
    })
};