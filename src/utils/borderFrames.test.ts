import {
    DEFAULT_BORDER_FRAME,
    getBorderFrame,
    getBorderImageStyle,
} from "@/utils/borderFrames"

describe("getBorderFrame", () => {
    it("encontra a calibração pelo recurso_visual ou caminho público", () => {
        expect(getBorderFrame("bordas/basica.png")).toBe(
            getBorderFrame("/bordas/basica.png"),
        )
        expect(getBorderFrame("bordas/basica.png")).not.toBe(
            DEFAULT_BORDER_FRAME,
        )
    })

    it("usa o padrão para bordas sem calibração", () => {
        expect(getBorderFrame("/bordas/nova.png")).toBe(DEFAULT_BORDER_FRAME)
    })
})

describe("getBorderImageStyle", () => {
    const parse = (v: string) => Number.parseFloat(v)

    it("centraliza o anel sobre o avatar", () => {
        const frame = {
            centerX: 0.55,
            centerY: 0.45,
            avatarDiameter: 0.8,
            aspectRatio: 0.9,
        }
        const style = getBorderImageStyle(frame)

        // O centro do anel (left + centerX * width) cai no centro do quadro.
        expect(
            parse(style.left) + frame.centerX * parse(style.width),
        ).toBeCloseTo(50)
        expect(
            parse(style.top) + frame.centerY * parse(style.height),
        ).toBeCloseTo(50)
        // O diâmetro do avatar corresponde a 100% do quadro.
        expect(parse(style.width) * frame.avatarDiameter).toBeCloseTo(100)
    })
})
