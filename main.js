import { Decode, Encode, DownloadData } from './functions.js';

let dgSaveOriginalTexto = ""; 
let dgFileName = "user1.dat";

const fileInput = document.getElementById('fileInput');
const statusText = document.getElementById('status');
const editorBox = document.getElementById('editorBox');
const manualEditor = document.getElementById('manualEditor');

// 1. LER E DESCRIPTOGRAFAR
fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    dgFileName = file.name;
    statusText.innerText = "Descriptografando o save...";
    statusText.style.color = "#58a6ff";

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    try {
        const jsonPuro = Decode(bytes); 
        const objetoJson = JSON.parse(jsonPuro);
        
        // Joga o JSON bonitinho na telinha
        dgSaveOriginalTexto = JSON.stringify(objetoJson, null, 2); 
        manualEditor.value = dgSaveOriginalTexto;
        
        statusText.innerText = "✅ Save carregado! Edite na tela ou clique nos botões.";
        statusText.style.color = "#7ee787";
        editorBox.style.display = "block"; 
    } catch (erro) {
        statusText.innerText = "❌ Erro ao ler. Arquivo corrompido ou inválido.";
        statusText.style.color = "#ff7b72";
    }
});

// 2. PRESETS BRUTOS (Modificam o texto direto na telinha)

document.getElementById('btnAmuletos').addEventListener('click', () => {
    let texto = manualEditor.value;
    
    // Substitui tudo dos 40 amuletos usando o padrão exato da sua print
    for(let i = 1; i <= 40; i++) {
        texto = texto.replace(new RegExp(`"gotCharm_${i}":\\s*(true|false)`, 'g'), `"gotCharm_${i}": true`);
        texto = texto.replace(new RegExp(`"newCharm_${i}":\\s*(true|false)`, 'g'), `"newCharm_${i}": false`);
        texto = texto.replace(new RegExp(`"charmCost_${i}":\\s*\\d+`, 'g'), `"charmCost_${i}": 0`);
    }
    
    texto = texto.replace(/"charmSlots":\s*\d+/g, '"charmSlots": 11'); // 11 é o máximo seguro
    texto = texto.replace(/"fragileHealth_unbreakable":\s*(true|false)/g, '"fragileHealth_unbreakable": true');
    texto = texto.replace(/"fragileGreed_unbreakable":\s*(true|false)/g, '"fragileGreed_unbreakable": true');
    texto = texto.replace(/"fragileStrength_unbreakable":\s*(true|false)/g, '"fragileStrength_unbreakable": true');
    
    manualEditor.value = texto; // Devolve pra telinha
    alert("Amuletos modificados! Pode conferir no texto.");
});

document.getElementById('btnHitKill').addEventListener('click', () => {
    let texto = manualEditor.value;
    texto = texto.replace(/"nailDamage":\s*\d+/g, '"nailDamage": 9999');
    manualEditor.value = texto;
    alert("Hit Kill ativado! Pode conferir no texto.");
});

document.getElementById('btnVida').addEventListener('click', () => {
    let texto = manualEditor.value;
    texto = texto.replace(/"maxHealthBase":\s*\d+/g, '"maxHealthBase": 99');
    texto = texto.replace(/"maxHealth":\s*\d+/g, '"maxHealth": 99');
    manualEditor.value = texto;
    alert("Vida máxima ativada! Pode conferir no texto.");
});

document.getElementById('btnDinheiro').addEventListener('click', () => {
    let texto = manualEditor.value;
    texto = texto.replace(/"geo":\s*\d+/g, '"geo": 9999999');
    manualEditor.value = texto;
    alert("Geo Infinito ativado! Pode conferir no texto.");
});

// 3. BOTÃO DE RESET
document.getElementById('btnReset').addEventListener('click', () => {
    if(confirm("Tem certeza? Isso vai voltar ao save original.")) {
        manualEditor.value = dgSaveOriginalTexto;
    }
});

// 4. DOWNLOADS
document.getElementById('btnDownTexto').addEventListener('click', () => {
    try {
        JSON.parse(manualEditor.value); // Só testa se não tá quebrado
        DownloadData(manualEditor.value, dgFileName + ".txt");
    } catch (e) {
        alert("❌ Erro de sintaxe. Você apagou aspas ou vírgula sem querer.");
    }
});

document.getElementById('btnDownJogo').addEventListener('click', () => {
    try {
        // Pega o texto da telinha que você viu mudar
        const objetoLimpo = JSON.parse(manualEditor.value); 
        
        // Espreme ele (tira as quebras de linha) porque o jogo é chato com formatação
        const jsonMinificado = JSON.stringify(objetoLimpo); 
        
        // Criptografa e baixa
        const novosBytes = Encode(jsonMinificado); 
        DownloadData(novosBytes, dgFileName);
    } catch (e) {
        alert("❌ Erro de sintaxe no texto. Não dá pra gerar o save.");
    }
});
