const moment = require('moment-timezone')
moment.locale('pt-br');

class ClassUtils {

    async textToSeconds(minute) {
        async function formatar(numeros) {
            const arrayNumeros = numeros.split(":").map(x => {
                let number = Number(x)
                if (isNaN(number)) throw new Error('Use Horas:Minutos:Segundos.');
                return Math.floor(Math.abs(number))
            })
            for (let x = 0; x < arrayNumeros.length;) {
                if (arrayNumeros[x] === 0) {
                    arrayNumeros.shift()
                } else { break }
            }
            return arrayNumeros
        }
        const tempo = await formatar(minute)
        const quantidade = tempo.length
        const objects = {
            '0': () => {
                return 0
            },
            '1': () => {
                const segundos = tempo[0]
                if (segundos > 59) throw new Error('Número Invalido')
                return segundos
            },
            '2': () => {
                const minutos = tempo[0]
                const segundos = tempo[1]
                if (segundos > 59 || minutos > 59) throw new Error('Número Invalido')
                return minutos * 60 + segundos
            },
            '3': () => {
                const horas = tempo[0]
                const minutos = tempo[1]
                const segundos = tempo[2]
                if (segundos > 59 || minutos > 59 || horas > 23) throw new Error('Número Invalido')
                return horas * 60 * 60 + minutos * 60 + segundos
            }
        }
        if (!objects[quantidade]) throw new Error('Só é permitido , Horas Minutos e Segundos.');
        return objects[quantidade]()
    }

    secondsToText(segundos) {
        let dia = Math.floor(segundos / 86400)
        let restoDia = Math.floor(segundos % 86400)
        let horas = Math.floor(restoDia / 3600)
        let restoHoras = Math.floor(restoDia % 3600)
        let minutos = Math.floor(restoHoras / 60)
        let seconds = restoHoras % 60
        let capsula = [dia, horas, minutos, seconds]

        let capsula2 = capsula.map(item => {
            return item < 10 ? item = `0${item}` : item
        })

        if (capsula2[0] == '00') capsula2.shift();
        if (capsula2[0] == '00') capsula2.shift();
        return capsula2.join(':')
    }

    formatDate(date){
      return String(moment(date).tz('America/Sao_Paulo').format('LLLL'))  
    }
}

const utils = new ClassUtils()

module.exports = utils