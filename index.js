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
        const salt = crypto.randomBytes(16).toString('hex');
        const key = crypto.pbkdf2Sync(this.password, salt, 100000, 32, 'sha256');
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(text, 'utf-8', 'hex');
        encrypted += cipher.final('hex');
        return salt + iv.toString('hex') + encrypted;
    }
    
    #decrypt(ciphertext) {
        const salt = ciphertext.substring(0, 32);
        const iv = Buffer.from(ciphertext.substring(32, 64), 'hex');
        const encrypted = ciphertext.substring(64);
        const key = crypto.pbkdf2Sync(this.password, salt, 100000, 32, 'sha256');
    
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
    
        return decrypted;
    }
    
}
