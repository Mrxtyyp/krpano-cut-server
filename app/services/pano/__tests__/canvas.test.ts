import { createCanvas, loadImage } from "canvas"

describe('测试node-canvas图片缩放是否成功', () => {
    it('low image to 1536', async () => {
        const lowPath = '/home/krpano-cut-server/images/low.jpg'
        const canvas = createCanvas(1536, 768); // 创建画布
        const ctx = canvas.getContext('2d'); // 获取画布渲染上下文

        const img = await loadImage(lowPath); // 加载原始图片

        const scaleFactor = 1536 / 1500; // 缩放比例
        ctx.scale(scaleFactor, scaleFactor); // 缩放画布

        const scaledWidth = img.width * scaleFactor;
        const scaledHeight = img.height * scaleFactor;
        ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight); // 在缩放后的画布上重新绘制图片

        expect(canvas.width).toBe(1536)
        expect(canvas.height).toBe(768)

    })
})