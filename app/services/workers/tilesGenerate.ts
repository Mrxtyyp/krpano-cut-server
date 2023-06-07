import { formatNumToStr } from "../../utils/common";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import { expose } from "threads/worker";
import path from "path";

interface ITiles {
    path: string;
    sx: number;
    sy: number;
    sw: number;
    sh: number;
    scaleWidth: number;
}

interface ILevelConfig {
    row: number; // 行
    col: number; // 列
    size: number; // 分辨率
}

/**
 * 生成多分辨率瓦图
 * @param level 分辨率层级level
 * @param imageWidth 源图像宽度
 * @param maxTileSize 瓦图尺寸
 */
const generateTiles = async (
    level: ILevelConfig[] = [],
    imageWidth: number,
    maxTileSize: number
) => {
    console.info("开始处理");
    const tilesArr: ITiles[] = [];

    for (let i = 0; i < level.length; i++) {
        const nowLevel = level[i];

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

                // console.info(`第${i}层 , 第${j + 1}列，第${k + 1}行==`, sx, sy, sw, sh);

                tilesArr.push({
                    path: path.join(
                        __dirname +
                        `../../../../images/tiles/l${level.length - i}/${formatNumToStr(
                            k + 1
                        )}/l${level.length - i}_${formatNumToStr(k + 1)}_${formatNumToStr(
                            j + 1
                        )}.jpg`
                    ),
                    sx,
                    sy,
                    sw,
                    sh,
                    scaleWidth: nowLevel.size,
                });
            }
        }
    }

    return tilesArr;
};

/**
 * 离某数字最近的64倍数数字
 * @param n
 * @returns
 */
export function nearestNumber(n: number) {
    return Math.round(n / 128) * 128;
}

/**
 * 测试计算层级算法
 * @param levelConfig
 * @param panoWidth
 * @returns
 */
export function analyzeImagesLevel(
    panoWidth: number,
    levelConfig: ILevelConfig[] = []
) {
    let levelSize = nearestNumber(panoWidth);
    // if (levelConfig.length === 0) {
    //     levelSize = nearestNumber(panoWidth);
    // } else {
    //     levelSize = panoWidth
    // }

    levelConfig.push({
        row: Math.ceil(levelSize / 2 / 512),
        col: Math.ceil(levelSize / 512),
        size: levelSize,
    });
    if (levelSize / 2 <= 1024) {
        console.info(levelConfig);
        return levelConfig;
    }
    return analyzeImagesLevel(panoWidth / 2, levelConfig);
}

expose({
    generateTiles,
    analyzeImagesLevel,
});
