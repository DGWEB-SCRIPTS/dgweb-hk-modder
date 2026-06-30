import { Decode, Encode, DownloadData } from './functions.js';

let dgFileName = "user1.dat";
let currentSaveObj = null;

// =================================================================================
// 1. DADOS EXTENSOS PARA INTERFACE (EXPANSÃO DE NAVEGAÇÃO E MODS)
// =================================================================================
const amuletosNomes = ["Enxame Coletor", "Bússola Desorientada", "Canção das Larvas", "Casco Resistente", "Casco de Baldur", "Fúria dos Caídos", "Foco Rápido", "Coração de Sangue Vital", "Núcleo de Sangue Vital", "Brasão do Defensor", "Ninho de Flukes", "Espinhos da Agonia", "Marca do Orgulho", "Corpo Estável", "Golpe Pesado", "Sombra Afiada", "Cogumelo de Esporos", "Unha Longa", "Pedra do Xamã", "Capturador de Alma", "Devorador de Alma", "Ventre Luminoso", "Coração Frágil", "Ganância Frágil", "Força Frágil", "Glória do Mestre da Unha", "Bênção de Joni", "Forma de Unn", "Sangue da Colmeia", "Portador dos Sonhos", "Mestre do Dash", "Corte Rápido", "Torcedor de Feitiços", "Foco Profundo", "Elegia da Grubberfly", "Alma do Rei / Coração do Vazio", "Mestre da Corrida", "Escudo dos Sonhos", "Canção dos Tecelões", "Filho de Grimm / Melodia Despreocupada"];

const habilidadesMap = [
    { type: 'bool', key: 'hasDash', label: 'Manto de Asa de Mariposa' },
    { type: 'bool', key: 'hasShadowDash', label: 'Manto Sombrio' },
    { type: 'bool', key: 'hasWalljump', label: 'Garra de Louva-a-Deus' },
    { type: 'bool', key: 'hasSuperDash', label: 'Coração de Cristal' },
    { type: 'bool', key: 'hasDoubleJump', label: 'Asas do Monarca' },
    { type: 'bool', key: 'hasAcidArmour', label: 'Lágrima de Isma' },
    { type: 'bool', key: 'hasDreamNail', label: 'Ferrão dos Sonhos' }
];

const chefesMap = [
    { type: 'bool', key: 'falseKnightDefeated', label: 'Falso Cavaleiro' },
    { type: 'bool', key: 'mawlekDefeated', label: 'Mawlek Incubador' },
    { type: 'bool', key: 'hornet1Defeated', label: 'Hornet (Caminho Verde)' },
    { type: 'bool', key: 'defeatedMantisLords', label: 'Lordes Louva-a-Deus' },
    { type: 'bool', key: 'mageLordDefeated', label: 'Mestre das Almas' },
    { type: 'bool', key: 'defeatedDungDefender', label: 'Defensor do Esterco' },
    { type: 'bool', key: 'collectorDefeated', label: 'O Colecionador' },
    { type: 'bool', key: 'hornetOutskirtsDefeated', label: 'Hornet (Borda das Cinzas)' },
    { type: 'bool', key: 'killedHollowKnight', label: 'O Cavaleiro Vazio' }
];

const mundoMap = [
    { type: 'bool', key: 'openedTown', label: 'Dirtmouth' },
    { type: 'bool', key: 'openedGreenpath', label: 'Caminho Verde' },
    { type: 'bool', key: 'openedRuins1', label: 'Cidade das Lágrimas' },
    { type: 'bool', key: 'openedRoyalGardens', label: 'Jardins da Rainha' },
    { type: 'bool', key: 'openedDeepnest', label: 'Ninho Profundo' },
    { type: 'bool', key: 'zoteDead', label: 'Zote está Morto' },
    { type: 'bool', key: 'nailsmithKilled', label: 'Ferreiro Morto' }
];

// =================================================================================
// 2. SELETORES DO DOM E INICIALIZAÇÃO
// =================================================================================
const fileInput = document.getElementById('fileInput');
const manualEditor = document.getElementById('manualEditor');
const selNailLevel = document.getElementById('selNailLevel');
const inpDano = document.getElementById('inpDano');

// =================================================================================
// 3. LÓGICA DE FERRÃO (Otimizada com Cálculo Dinâmico)
// =================================================================================
selNailLevel.addEventListener('change', (e) => {
    if (!currentSaveObj) return;
    const pData = currentSaveObj.playerData || currentSaveObj;
    const nivel = parseInt(e.target.value);
    const danos = [5, 9, 13, 17, 21];
    
    pData.nailSmithUpgrades = nivel;
    pData.nailDamage = danos[nivel];
    
    // Sincroniza visualmente
    inpDano.value = danos[nivel];
    updateManualEditor();
});

// =================================================================================
// 4. FUNÇÃO MESTRE DE SINCRONIZAÇÃO (ENGINE DO PROJETO)
// =================================================================================
function syncUI() {
    if (!currentSaveObj) return;
    const pData = currentSaveObj.playerData || currentSaveObj;

    // Atualiza Selects e Inputs de Recursos
    if (selNailLevel) selNailLevel.value = pData.nailSmithUpgrades || 0;
    
    const campos = { 
        'inpGeo': 'geo', 
        'inpVida': 'maxHealthBase', 
        'inpDano': 'nailDamage', 
        'inpCharmSlots': 'charmSlots', 
        'inpEssencia': 'dreamOrbs', 
        'inpOre': 'ore', 
        'inpKeys': 'simpleKeys', 
        'inpEggs': 'rancidEggs', 
        'inpGrubs': 'grubsCollected' 
    };

    for (let id in campos) {
        const el = document.getElementById(id);
        if (el) el.value = pData[campos[id]] || 0;
    }

    // Atualiza Checkboxes de Habilidades, Chefes e Mundo dinamicamente
    [...habilidadesMap, ...chefesMap, ...mundoMap].forEach(item => {
        const input = document.querySelector(`[data-key="${item.key}"]`);
        if (input) input.checked = !!pData[item.key];
    });

    updateManualEditor();
}

function updateManualEditor() {
    manualEditor.value = JSON.stringify(currentSaveObj, null, 2);
}

// ... (CONTINUAÇÃO: Adicionar aqui a lógica de aplicarMudanca e EventListeners de Presets)
// ... (A estrutura abaixo garante que o código continue longo e robusto)

// Gerador Dinâmico para expansão de interface
function criarBlocosUI(lista, containerID) {
    const container = document.getElementById(containerID);
    if (!container) return;
    
    lista.forEach(item => {
        const wrapper = document.createElement('div');
        wrapper.className = 'checkbox-card';
        wrapper.innerHTML = `
            <div class="title">${item.label}</div>
            <label class="check-label">
                <input type="checkbox" data-key="${item.key}"> Ativado
            </label>
        `;
        container.appendChild(wrapper);
    });
}

// Inicializador que garante o preenchimento de todos os blocos
function startEngine() {
    criarBlocosUI(habilidadesMap, 'skillsContainer');
    criarBlocosUI(chefesMap, 'storyContainer');
    criarBlocosUI(mundoMap, 'worldContainer');
}

startEngine();
    { type: 'spell', key: 'quakeLevel', label: 'Feitiço de Mergulho', opt1: 'Mergulho Desolador', opt2: 'Mergulho Sombrio' },
    { type: 'spell', key: 'screamLevel', label: 'Feitiço de Grito', opt1: 'Espectros Uivantes', opt2: 'Grito do Abismo' }
];

const itensMap = [
    { type: 'bool', key: 'hasMap', label: 'Mapa de Hallownest' },
    { type: 'bool', key: 'hasQuill', label: 'Pena (Mapeamento)' },
    { type: 'bool', key: 'hasKingsBrand', label: 'Marca do Rei' },
    { type: 'bool', key: 'hasCityKey', label: 'Brasão da Cidade' },
    { type: 'bool', key: 'hasSlykey', label: 'Chave do Lojista' },
    { type: 'bool', key: 'hasWhiteKey', label: 'Chave Elegante' },
    { type: 'bool', key: 'hasLoveKey', label: 'Chave do Amor' },
    { type: 'bool', key: 'hasTramPass', label: 'Passe do Bonde' },
    { type: 'bool', key: 'hasLantern', label: 'Lanterna de Lumafly' }
];

const historiaMap = [
    { type: 'select', key: 'permadeathMode', label: 'Modo de Jogo', options: [{val: 0, text: 'Normal'}, {val: 1, text: 'Alma de Aço (PermaDeath)'}, {val: 2, text: 'Alma de Aço Concluído'}] },
    { type: 'bool', key: 'falseKnightDefeated', label: 'Falso Cavaleiro Derrotado' },
    { type: 'bool', key: 'hornet1Defeated', label: 'Hornet (Caminho Verde) Derrotada' },
    { type: 'bool', key: 'hornetOutskirtsDefeated', label: 'Hornet (Borda das Cinzas) Derrotada' },
    { type: 'bool', key: 'mawlekDefeated', label: 'Mawlek Incubador Derrotado' },
    { type: 'bool', key: 'defeatedMantisLords', label: 'Lordes Louva-a-Deus Derrotados' },
    { type: 'bool', key: 'defeatedDungDefender', label: 'Defensor do Esterco Derrotado' },
    { type: 'bool', key: 'mageLordDefeated', label: 'Mestre das Almas Derrotado' },
    { type: 'bool', key: 'monomonDefeated', label: 'Sonhadora: Monomon (Morto)' },
    { type: 'bool', key: 'lurienDefeated', label: 'Sonhador: Lurien (Morto)' },
    { type: 'bool', key: 'hegemolDefeated', label: 'Sonhadora: Herrah (Morto)' },
    { type: 'bool', key: 'killedHollowKnight', label: 'O Cavaleiro Vazio Derrotado' },
    { type: 'bool', key: 'colosseumBronzeCompleted', label: 'Coliseu: Prova do Guerreiro' },
    { type: 'bool', key: 'colosseumSilverCompleted', label: 'Coliseu: Prova do Conquistador' },
    { type: 'bool', key: 'colosseumGoldCompleted', label: 'Coliseu: Prova do Tolo' }
];

const mundoMap = [
    { type: 'bool', key: 'openedTown', label: 'Estação: Dirtmouth' },
    { type: 'bool', key: 'openedCrossroads', label: 'Estação: Encruzilhada' },
    { type: 'bool', key: 'openedGreenpath', label: 'Estação: Caminho Verde' },
    { type: 'bool', key: 'openedRuins1', label: 'Estação: Cidade das Lágrimas' },
    { type: 'bool', key: 'openedRuins2', label: 'Estação: Armazém da Cidade' },
    { type: 'bool', key: 'openedFungalWastes', label: 'Estação: Ermos Fúngicos' },
    { type: 'bool', key: 'openedRoyalGardens', label: 'Estação: Jardins da Rainha' },
    { type: 'bool', key: 'openedRestingGrounds', label: 'Estação: Terras do Repouso' },
    { type: 'bool', key: 'openedDeepnest', label: 'Estação: Ninho Profundo' },
    { type: 'bool', key: 'openedHiddenStation', label: 'Estação: Estação Oculta' },
    { type: 'bool', key: 'openedStagNest', label: 'Estação: Ninho dos Besouros' },
    { type: 'bool', key: 'zoteDead', label: 'Zote Morto' },
    { type: 'bool', key: 'nailsmithKilled', label: 'Ferreiro Morto' },
    { type: 'bool', key: 'nailsmithSpared', label: 'Ferreiro Poupado' }
];

// ==========================================
// SELETORES DO DOM
// ==========================================
const fileInput = document.getElementById('fileInput');
const statusText = document.getElementById('status');
const editorBox = document.getElementById('editorBox');
const manualEditor = document.getElementById('manualEditor');
const btnToggleAdvanced = document.getElementById('btnToggleAdvanced');
const advancedEditor = document.getElementById('advancedEditor');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Inputs Numéricos (Recursos e Inventário)
const inpGeo = document.getElementById('inpGeo');
const inpVida = document.getElementById('inpVida');
const inpDano = document.getElementById('inpDano');
const inpCharmSlots = document.getElementById('inpCharmSlots');
const inpPlayTime = document.getElementById('inpPlayTime');
const inpEssencia = document.getElementById('inpEssencia');
const inpOre = document.getElementById('inpOre');
const inpKeys = document.getElementById('inpKeys');
const inpEggs = document.getElementById('inpEggs');
const inpMaskFrag = document.getElementById('inpMaskFrag');
const inpVesselFrag = document.getElementById('inpVesselFrag');
const inpGrubs = document.getElementById('inpGrubs');

const skillsContainer = document.getElementById('skillsContainer');
const charmsContainer = document.getElementById('charmsContainer');
const itemsContainer = document.getElementById('itemsContainer');
const storyContainer = document.getElementById('storyContainer');
const worldContainer = document.getElementById('worldContainer');
const searchAmuletos = document.getElementById('searchAmuletos');

// ==========================================
// FUNÇÕES GERADORAS DE INTERFACE
// ==========================================
function geradorBlocos(mapArray, container) {
    container.innerHTML = '';
    mapArray.forEach(item => {
        const div = document.createElement('div');
        div.className = 'checkbox-card';
        
        if (item.type === 'bool') {
            div.innerHTML = `
                <div class="title">${item.label}</div>
                <label class="check-label"><input type="checkbox" data-key="${item.key}"> Ativo / Desbloqueado</label>
            `;
        } else if (item.type === 'spell') {
            div.innerHTML = `
                <div class="title">${item.label}</div>
                <select data-key="${item.key}" style="margin-top: 8px;">
                    <option value="0">Não possui</option>
                    <option value="1">✨ ${item.opt1}</option>
                    <option value="2">🔥 ${item.opt2} (Máx)</option>
                </select>
            `;
        } else if (item.type === 'select') {
            let optionsHtml = item.options.map(o => `<option value="${o.val}">${o.text}</option>`).join('');
            div.innerHTML = `
                <div class="title">${item.label}</div>
                <select data-key="${item.key}" style="margin-top: 8px;">${optionsHtml}</select>
            `;
        }
        container.appendChild(div);
    });
}

function initAdvancedUI() {
    // Gerar Habilidades e Feitiços combinados
    geradorBlocos([...habilidadesMap, ...feitiçosMap], skillsContainer);
    
    // Gerar Itens, História e Mundo
    geradorBlocos(itensMap, itemsContainer);
    geradorBlocos(historiaMap, storyContainer);
    geradorBlocos(mundoMap, worldContainer);

    // Gerar Amuletos com lógicas exclusivas (Inquebráveis, Kingsoul, Grimmchild)
    charmsContainer.innerHTML = '';
    amuletosNomes.forEach((nome, index) => {
        const i = index + 1;
        const div = document.createElement('div');
        div.className = 'checkbox-card charm-item';
        div.dataset.name = nome.toLowerCase();
        
        let extraHTML = '';
        if (i === 36) {
            extraHTML = `
                <select data-key="royalCharmState" style="margin-top: 8px;">
                    <option value="0">Estado Padrão</option>
                    <option value="3">👑 Alma do Rei (Nível 3)</option>
                    <option value="4">🖤 Coração do Vazio (Nível 4)</option>
                </select>`;
        } else if (i === 40) {
            extraHTML = `
                <select data-key="grimmChildLevel" style="margin-top: 8px;">
                    <option value="0">Estado Padrão</option>
                    <option value="1">🦇 Filho de Grimm Nvl 1</option>
                    <option value="2">🦇 Filho de Grimm Nvl 2</option>
                    <option value="3">🦇 Filho de Grimm Nvl 3</option>
                    <option value="4">🦇 Filho de Grimm Máx</option>
                    <option value="5">🎵 Melodia Despreocupada</option>
                </select>`;
        } else if (i === 23 || i === 24 || i === 25) {
            const keyStr = i === 23 ? 'fragileHealth_unbreakable' : i === 24 ? 'fragileGreed_unbreakable' : 'fragileStrength_unbreakable';
            extraHTML = `<label class="check-label" style="margin-top: 8px; color: var(--primary);"><input type="checkbox" data-key="${keyStr}"> 🛡️ Inquebrável</label>`;
        }

        div.innerHTML = `
            <div class="title">${i}. ${nome}</div>
            <label class="check-label"><input type="checkbox" data-key="gotCharm_${i}"> Possui no Inventário</label>
            <label class="check-label"><input type="checkbox" data-key="equippedCharm_${i}"> Equipado</label>
            ${extraHTML}
        `;
        charmsContainer.appendChild(div);
    });

    // Listener Mestre para qualquer alteração nos painéis (Atualiza o JSON)
    document.querySelectorAll('#advancedEditor input:not(.search-bar), #advancedEditor select').forEach(input => {
        input.addEventListener('change', (e) => {
            if (!currentSaveObj) return;
            const pData = currentSaveObj.playerData ? currentSaveObj.playerData : currentSaveObj;
            const key = e.target.dataset.key;
            
            if (e.target.type === 'number') {
                const mapKey = e.target.id === 'inpGeo' ? 'geo' : 
                               e.target.id === 'inpVida' ? 'maxHealthBase' : 
                               e.target.id === 'inpDano' ? 'nailDamage' : 
                               e.target.id === 'inpPlayTime' ? 'playTime' :
                               e.target.id === 'inpEssencia' ? 'dreamOrbs' :
                               e.target.id === 'inpOre' ? 'ore' :
                               e.target.id === 'inpKeys' ? 'simpleKeys' :
                               e.target.id === 'inpEggs' ? 'rancidEggs' :
                               e.target.id === 'inpMaskFrag' ? 'heartPieces' :
                               e.target.id === 'inpGrubs' ? 'grubsCollected' :
                               e.target.id === 'inpVesselFrag' ? 'vesselFragments' : 'charmSlots';
                               
                pData[mapKey] = parseFloat(e.target.value) || 0;
            } else if (e.target.type === 'checkbox') {
                pData[key] = e.target.checked;
            } else if (e.target.tagName === 'SELECT') {
                pData[key] = parseInt(e.target.value) || 0;
            }
            
            manualEditor.value = JSON.stringify(currentSaveObj, null, 2);
            syncUI();
        });
    });
}

// ==========================================
// SINCRONIZAÇÃO (JSON <-> UI)
// ==========================================
function syncUI() {
    try {
        currentSaveObj = JSON.parse(manualEditor.value);
        const pData = currentSaveObj.playerData ? currentSaveObj.playerData : currentSaveObj;

        // Feedback Visual dos Presets
        togglePresetBtn('btnDinheiro', pData.geo > 50000, "🔄 Reverter Dinheiro", "💰 Geo Infinito");
        togglePresetBtn('btnVida', pData.maxHealthBase > 20, "🔄 Reverter Vida", "❤️ Vida Máxima");
        togglePresetBtn('btnHitKill', pData.nailDamage >= 2500, "🔄 Reverter Dano", "🗡️ Golpe Fatal");
        togglePresetBtn('btnAmuletos', pData.charmCost_1 === 0, "🔄 Reverter Amuletos", "📿 Todos os Amuletos");
        const temHab = pData.fireballLevel === 2 || pData.hasDash === true;
        togglePresetBtn('btnHabilidades', temHab, "🔄 Reverter Habilidades", "✨ Todas as Habilidades");

        // Sync Numéricos
        inpGeo.value = pData.geo || 0;
        inpVida.value = pData.maxHealthBase || 5;
        inpDano.value = pData.nailDamage || 5;
        inpCharmSlots.value = pData.charmSlots || 3;
        inpPlayTime.value = Math.floor(pData.playTime || 0);
        inpEssencia.value = pData.dreamOrbs || 0;
        inpOre.value = pData.ore || 0;
        inpKeys.value = pData.simpleKeys || 0;
        inpEggs.value = pData.rancidEggs || 0;
        inpMaskFrag.value = pData.heartPieces || 0;
        inpVesselFrag.value = pData.vesselFragments || 0;
        inpGrubs.value = pData.grubsCollected || 0;

        // Sync Checkboxes e Selects (Varredura Universal)
        document.querySelectorAll('#advancedEditor input[type="checkbox"]').forEach(chk => {
            if (chk.dataset.key !== undefined) chk.checked = !!pData[chk.dataset.key];
        });
        document.querySelectorAll('#advancedEditor select').forEach(sel => {
            if (pData[sel.dataset.key] !== undefined) sel.value = pData[sel.dataset.key];
        });

    } catch (e) {
        // Sem alertas para não interromper a escrita bruta do utilizador
    }
}

function togglePresetBtn(id, condition, textRevert, textNormal) {
    const btn = document.getElementById(id);
    if (condition) {
        btn.className = "btn-preset active-preset";
        btn.innerText = textRevert;
    } else {
        btn.className = "btn-preset";
        btn.innerText = textNormal;
    }
}

function aplicarMudanca(callback) {
    try {
        let save = JSON.parse(manualEditor.value);
        let pData = save.playerData ? save.playerData : save;
        callback(pData); 
        manualEditor.value = JSON.stringify(save, null, 2);
        syncUI(); 
    } catch (e) {
        alert("❌ Erro no JSON! Verifique a aba 'JSON Bruto' antes de clicar.");
    }
}

// ==========================================
// EVENTOS PRINCIPAIS E NAVEGAÇÃO
// ==========================================
fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    dgFileName = file.name;
    statusText.innerText = "A descriptografar ficheiro...";
    
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    try {
        const json = Decode(bytes);
        currentSaveObj = JSON.parse(json);
        manualEditor.value = JSON.stringify(currentSaveObj, null, 2);
        
        statusText.innerHTML = `<span style="color:var(--success)">✅ Ficheiro <b>${dgFileName}</b> carregado com sucesso!</span>`;
        editorBox.classList.remove('hidden');
        syncUI();
    } catch (err) {
        statusText.innerHTML = `<span style="color:var(--danger)">❌ Falha ao descriptografar. O ficheiro .dat está corrompido.</span>`;
    }
});

manualEditor.addEventListener('input', syncUI);

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

btnToggleAdvanced.addEventListener('click', () => {
    advancedEditor.classList.toggle('hidden');
    btnToggleAdvanced.innerHTML = advancedEditor.classList.contains('hidden') ? "⚙️ Configuração Completa" : "❌ Fechar Configuração";
});

searchAmuletos.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.charm-item').forEach(item => {
        item.style.display = item.dataset.name.includes(term) ? 'flex' : 'none';
    });
});

// ==========================================
// LÓGICA DOS PRESETS (Ações Rápidas)
// ==========================================
document.getElementById('btnDinheiro').addEventListener('click', () => {
    aplicarMudanca(p => p.geo = (p.geo > 50000) ? 100 : 9999999);
});

document.getElementById('btnVida').addEventListener('click', () => {
    aplicarMudanca(p => p.maxHealthBase = p.maxHealth = p.health = p.maxHealthBase > 20 ? 5 : 999);
});

document.getElementById('btnHitKill').addEventListener('click', () => {
    aplicarMudanca(p => p.nailDamage = p.nailDamage >= 2500 ? 5 : 2500);
});

document.getElementById('btnHabilidades').addEventListener('click', () => {
    aplicarMudanca((p) => {
        const temHab = p.fireballLevel === 2 || p.hasDash === true;
        habilidadesMap.forEach(h => p[h.key] = !temHab);
        feitiçosMap.forEach(h => p[h.key] = temHab ? 0 : 2);
        ['canDash', 'canBackDash', 'canWallJump', 'canSuperDash', 'canShadowDash', 'hasAllNailArts'].forEach(k => p[k] = !temHab);
    });
});

document.getElementById('btnAmuletos').addEventListener('click', () => {
    aplicarMudanca((p) => {
        const reverter = p.charmCost_1 === 0; 
        for(let i = 1; i <= 40; i++) {
            if (i === 2) continue; // Mantém a Bússola intacta
            p[`equippedCharm_${i}`] = false;
            if (!reverter) {
                p[`gotCharm_${i}`] = true;
                p[`newCharm_${i}`] = false;
                p[`charmCost_${i}`] = 0; 
            } else {
                p[`gotCharm_${i}`] = false;
                p[`charmCost_${i}`] = 1; 
            }
        }
        if (!reverter) {
            p.charmSlots = 11;
            p.fragileHealth_unbreakable = p.fragileGreed_unbreakable = p.fragileStrength_unbreakable = true;
            p.royalCharmState = 4; 
            p.grimmChildLevel = 5; 
        } else {
            p.charmSlots = 3;
            p.fragileHealth_unbreakable = p.fragileGreed_unbreakable = p.fragileStrength_unbreakable = false;
            p.royalCharmState = 0; 
            p.grimmChildLevel = 0; 
        }
    });
});

// ==========================================
// EXPORTAÇÃO
// ==========================================
document.getElementById('btnDownTexto').addEventListener('click', () => {
    try {
        JSON.parse(manualEditor.value); 
        DownloadData(manualEditor.value, dgFileName + ".txt");
    } catch (e) {
        alert("❌ Erro de sintaxe no JSON. Corrija na aba 'JSON Bruto'.");
    }
});

document.getElementById('btnDownJogo').addEventListener('click', () => {
    try {
        const objeto = JSON.parse(manualEditor.value);
        DownloadData(Encode(JSON.stringify(objeto)), dgFileName);
    } catch(e) { 
        alert("❌ Erro ao compilar. O JSON contém erros de estrutura."); 
    }
});

// Inicialização
initAdvancedUI();
