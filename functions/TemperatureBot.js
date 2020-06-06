class TempratureBot {

    constructor() {
        this.pattern = /temp: (-|)[0-9]+(.[0-9]+)?(F|C) to (C|F)$/;
    }

    convert(val, from, to) {
        if (from === 'C') return (val * 9/5) + 32
        return (val - 32) * 5/9
    }

    match(data) {
        if (!this.pattern.test(data.mensagem)) return null

        const [_, from, _, targetUnit] = data.mensagem.split(" ")
        const baseValue = parseFloat(from.substring(0, from.length - 1))
        const baseUnit = from.substr(-1)

        let newValue = baseValue

        if (targetUnit !== baseUnit) {
            newValue = this.convert(newValue, baseUnit, targetUnit)
        }

        return {
            mensagem: newValue + "" + baseUnit,
            usuario: "Temperature Bot",
            avatar: 'https://i.pinimg.com/736x/66/a5/40/66a5401731cbd7a5d0c8c14354bdbc8b.jpg',
        }
    }
}

export default new TempratureBot()

