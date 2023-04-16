const crypto = require('crypto');
const fs = require("fs");

module.exports = class Database {
    constructor(filename, password) {
        this.filename = filename;
        this.password = password;
        this.data = {};
        this.#load();
    }

    // public database methods
    set(key, value) {
        this.data[key] = value;
        this.#save();
    }

    get(key) {
        return this.data[key];
    }

    delete(key) {
        delete this.data[key];
        this.#save();
    }

    // private database methods
    #load() {
        try {
            const encryptedText = fs.readFileSync(this.filename, "utf-8");
            this.data = JSON.parse(this.#decrypt(encryptedText));
        } catch(e) {
            if (e.code !== "ENOENT") throw e;
            this.data = {};
        }
    }

    #save() {
        const encryptedText = this.#encrypt(JSON.stringify(this.data));
        fs.writeFileSync(this.filename, encryptedText);
    }

    // private cryptography methods
    #encrypt(text) {
        const iv = crypto.randomBytes(16);
        const key = crypto.createHash('sha256').update(this.password).digest("hex").substring(0, 32);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(text, 'utf-8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + encrypted;
    }
    
    #decrypt(ciphertext) {
        const iv = Buffer.from(ciphertext.substring(0, 32), 'hex');
        const encrypted = ciphertext.substring(32);
        const key = crypto.createHash('sha256').update(this.password).digest("hex").substring(0, 32);
    
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
    
        return decrypted;
    }   
}