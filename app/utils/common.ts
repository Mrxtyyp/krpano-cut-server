import { existsSync, mkdirSync } from "fs";
import url from "url";
import path from 'path'
import dayjs from 'dayjs'

/**
 * 数字转化，小于10的加上0
 * @param n
 * @returns
 */
export function formatNumToStr(n: number) {
    return n < 10 ? "0" + n : n;
}


/**
 * 判断文件夹是否存在，文件夹不存在，创建文件夹
 * @param path 文件路径
 */
export function existsMkdirFolder(path: string) {
    if (!path) return
    const folder = path.substring(0, path.lastIndexOf("/"));
    // 判断文件夹是否存在
    if (!existsSync(folder)) {
        // 文件夹不存在，创建文件夹
        mkdirSync(folder, { recursive: true });
    }
}

/**
 * 获取路径中的文件夹名
 * @param path 
 */
export function getPathFolder(pathstr: string) {
    const filepath = url.parse(pathstr).pathname
    if (!filepath) return ''

    return path.dirname(filepath)
}

/**
 * 获取路径文件夹及文件名
 * @param pathstr 
 * @returns 
 */
export function getPathName(pathstr: string) {
    return url.parse(pathstr).pathname
}

/**
 * 截取文件名
 * @param path 
 */
export function splitFilePath(path: string) {
    const pathname = path.replace('//', '')
    return pathname.substr(pathname.indexOf("/", 1));
}

/**
 * 截取uuid
 * @param path 
 */
export function getUuidBySplitFilePath(path: string) {
    const pathname = path.split('/')
    const filename = pathname[pathname.length - 1]
    return filename.split('.')[0]
}

/**
 * 获取当前时间年月日时分秒
 * @returns 年月日时分秒字符串
 */
export function getNowDate() {
    return dayjs(new Date()).format('YYYY/MM/DD-HH:mm:ss')
}