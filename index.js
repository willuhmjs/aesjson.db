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
        // generate a random initialization vector and salt
        const iv = crypto.randomBytes(16);
        const salt = crypto.randomBytes(16).toString('hex');
        // use salt to derive a key from the password
        const key = crypto.pbkdf2Sync(this.password, salt, 100000, 32, 'sha256');
        // encrypt the text using the key and iv
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(text, 'utf-8', 'hex');
        encrypted += cipher.final('hex');
        // return the ciphertext as salt + iv + encrypted text
        return salt + iv.toString('hex') + encrypted;
    }
    
    #decrypt(ciphertext) {
        // derive the salt, iv, and encrypted text from the ciphertext
        const salt = ciphertext.substring(0, 32);
        const iv = Buffer.from(ciphertext.substring(32, 64), 'hex');
        const encrypted = ciphertext.substring(64);
        // use salt to derive a key from the password
        const key = crypto.pbkdf2Sync(this.password, salt, 100000, 32, 'sha256');
        
        // decrypt the text using the key and iv
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
        
        // return the decrypted plaintext
        return decrypted;
    }
    
}
