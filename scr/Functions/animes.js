const fetch = require('node-fetch');

class ClassOtaku {
    constructor() {
        this.urlBase = 'https://api.jikan.moe/v4'
    }

    async fetchUrl(param) {
        return await fetch(param).then(response => response.json())
    }

    async getRandomManga() {
        const data = await this.fetchUrl(this.urlBase + '/random/manga')
        if (!data.data) throw new Error('Not Found')
        return data.data
    }

    async getNextSeason() {
        const data = await this.fetchUrl(this.urlBase + '/seasons/upcoming')
        if (!data.data) throw new Error('Not Found')
        return data.data
    }

    async getRandomAnime() {
        const data = await this.fetchUrl(this.urlBase + '/random/anime')
        if (!data.data) throw new Error('Not Found')
        return data.data
    }

    async getTopAnimes() {
        const data = await this.fetchUrl(this.urlBase + '/top/anime')
        if (!data.data) throw new Error('Not Found')
        return data.data
    }

    async getSeasonNow() {
        const data = await this.fetchUrl(this.urlBase + '/seasons/now')
        if (!data.data) throw new Error('Not Found')
        return data.data
    }
}

const Otaku = new ClassOtaku()

module.exports = Otaku