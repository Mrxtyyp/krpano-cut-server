import { Request, Response } from "express";
import Busboy from 'busboy'
import path from "path";
import { createWriteStream } from 'fs'
import MakeTiles from "../services/pano/makeTites";
import configPath from '../config'


export const cutImageHandler = (req: Request, res: Response) => {
    console.time(`start 接收图片-----`);

    let imageFilename = '', imageFilePath = '', imageFileType = ''
    const busboy = Busboy({ headers: req.headers });
    busboy.on('file', (fieldname, file, fileMsg, encoding, mimetype) => {
        const saveTo = path.join(__dirname, '../../public/images', fileMsg.filename);
        imageFilePath = saveTo
        imageFilename = fileMsg.filename
        imageFileType = fileMsg.mimeType
        file.pipe(createWriteStream(saveTo));
    });

    busboy.on('finish', async function () {

        console.timeEnd(`start 接收图片-----`);

        try {
            const make = new MakeTiles(imageFilePath, configPath.SCENE_PATH);
            await make.generate();

            res.send({
                code: 200,
                data: {
                    filename: imageFilename,
                    type: imageFileType
                }
            });
        } catch (err) {
            res.send({
                code: 500,
                msg: '生成失败'
            });
        }


    });

    return req.pipe(busboy);
};