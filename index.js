// Bot desenvolvido por: ⓑ BAKI
// Todos os direitos reservados © 2026
// Proibida a venda ou revenda desta base sem autorização.
//NAO TIRA OS CRÉDITOS LEIA O README PARA ENTENDER O PORQUE
// Bot oficial: ⓑ Kyara
// Desenvolvedor: ⓑ BAKI
//TikTok: @bakizinho

// Site Oficial
// https://

// Comunidade oficial
// https://chat.whatsapp.com/ClSdOMal1Rc7EbOay45cew

//=============[ COMEÇO DE TUDO ]=============\\

const { menumemb, menubrink, menuRPG } = require("./dono/menus/menu");
const { promoverUser, rebaixarUser } = require('./gzee');
const axios = require('axios');
const { consultarKyara } = require('./src/kyara/auto');
const baileys = require("@systemzero/baileys");
const { NumberDono, prefix, NickDono, NomeBot, SHIZUKU_KEY, SHIZUKU_SITE, sysite, syskey } = require("./dono/dono");
const ytSearch = require('yt-search');
const chalk = require('chalk');
const nexia = require('./nexia-sdk');
const API_KEY = process.env.API_KEY_NEXIA || 'API_KEY_NEXIA';
const crypto = require('crypto')
const { generateWAMessageFromContent, prepareWAMessageMedia, downloadMediaMessage } = require('@systemzero/baileys')
const { searchSite } = require('./database/searchSites');
const API_SPOTIFY = "https://api.vreden.my.id/api";
const yts = require("yt-search");
const { exec } = require('child_process');
const cheerio = require('cheerio');
const bancoPath = './database/banco.json';
const FormData = require("form-data")
const figurinhas = require('./database/figurinhas.json')
const MODEL = "qwen/qwen3-next-80b-a3b-instruct:free";
const OPENROUTER_KEY = process.env.OPENROUTER_KEY || 'API_KEY_ROUTER';
const fs = require("fs");

const selos = require('./database/selos');

const afkPath = './database/afk.json';

function carregarAfk() {
    if (!fs.existsSync(afkPath))
        fs.writeFileSync(afkPath, '{}');

    return JSON.parse(fs.readFileSync(afkPath));
}

function salvarAfk(db) {
    fs.writeFileSync(afkPath, JSON.stringify(db, null, 2));
}

const afk = carregarAfk();

function salvarBanco(db = global.banco){

try {

fs.writeFileSync(
bancoPath,
JSON.stringify(db,null,2)
);

} catch(e){

console.log("❌ Erro ao salvar banco:",e);

}

}