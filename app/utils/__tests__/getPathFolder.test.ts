import { getPathFolder } from "../common"


describe('test getPathFolder common function', () => {
    it('shoulder get path', () => {
        const folder = getPathFolder('https://nanpub-1259055249.file.myqcloud.com/def_material/15753865111316oj.png')
        expect(folder).toEqual('/def_material')
    })
})