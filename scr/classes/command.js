class Command {

    constructor(options){
        this.name = options.name
        this.help = options.help
        this.usage = options.usage
        this.cooldown = options.cooldown || 2
        this.aliase = options.aliase
        this.type = options.type
        this.onlyOwner = options.onlyOwner || false
    }

}

module.exports = Command