/**
* 任务数据
*/
export interface ITaskData {
    download_data: {
        scene_img: string[]
        other: string[]
    }
    update_data: {
        [p: string]: any
    },
    // 国内还是海外环境
    websit: 'mainland' | 'oversea',
    works_download_id: number,
    // 接口地址环境
    url: string
}