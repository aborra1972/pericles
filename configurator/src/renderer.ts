import type { BackupSummary, LocalConfiguration } from './config/local-store.js';

declare global {
  interface Window {
    pericles: {
      configuration: {
        load(): Promise<LocalConfiguration>;
        save(configuration: LocalConfiguration): Promise<LocalConfiguration>;
        defaults(): Promise<LocalConfiguration>;
        backups: {
          create(): Promise<BackupSummary>;
          list(): Promise<BackupSummary[]>;
          restore(id: string): Promise<LocalConfiguration>;
          delete(id: string): Promise<boolean>;
        };
      };
    };
  }
}

type Page = 'inicio' | 'apariencia' | 'voz' | 'personalidad' | 'ia' | 'privacidad' | 'backups' | 'dispositivo';
const content = document.querySelector<HTMLElement>('#content')!;
const title = document.querySelector<HTMLElement>('#title')!;
const subtitle = document.querySelector<HTMLElement>('#subtitle')!;
const saveBar = document.querySelector<HTMLElement>('#save-bar')!;
let saved!: LocalConfiguration;
let draft!: LocalConfiguration;
let current: Page = 'inicio';

const copy = <T>(value: T): T => structuredClone(value);
const pages: Record<Page, [string, string]> = {
  inicio: ['Inicio', 'Configuración local disponible sin dispositivo conectado.'], apariencia: ['Apariencia', 'Elegí cómo se ve Pericles cuando un dispositivo compatible se vincule.'], voz: ['Voz', 'Preferencias de respuesta guardadas localmente.'], personalidad: ['Personalidad', 'Ajustá el carácter sin modificar conversaciones ni recuerdos.'], ia: ['IA', 'Esta preferencia se aplicará después de vincular un dispositivo.'], privacidad: ['Privacidad', 'Controlá qué se conserva localmente.'], backups: ['Backups', 'Copias locales de configuración; no incluyen secretos, conversaciones, recuerdos ni credenciales.'], dispositivo: ['Dispositivo', 'Estado de integraciones de hardware.'],
};

function dirty(): boolean { return JSON.stringify(saved) !== JSON.stringify(draft); }
function setValue(path: string, value: string | number | boolean): void {
  const [group, field] = path.split('.') as [keyof LocalConfiguration, string];
  Object.assign(draft[group] as object, { [field]: value });
  updateDirty(); render();
}
function updateDirty(): void { saveBar.classList.toggle('visible', dirty()); }
function escape(value: string): string { const node = document.createElement('span'); node.textContent = value; return node.innerHTML; }
function field(label: string, help: string, control: string, error = ''): string { return `<div class="field"><div><label>${label}</label><small>${help}</small></div><div>${control}${error ? `<p class="error">${error}</p>` : ''}</div></div>`; }
function range(path: string, label: string, help: string, value: number, min: number, max: number, step: number, unit = ''): string { return field(label, help, `<div class="range"><input data-value="${path}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"><output>${value}${unit}</output></div>`); }
function check(path: string, label: string, help: string, value: boolean): string { return field(label, help, `<label class="check"><input data-value="${path}" type="checkbox" ${value ? 'checked' : ''}> Activado</label>`); }

function pageHtml(): string {
  if (current === 'inicio') return `<section class="page"><div class="card notice"><h3>Sin dispositivo conectado</h3><p class="help">Podés preparar apariencia, voz, personalidad, IA, privacidad y backups en esta computadora. No hay conexión USB, BLE o Wi‑Fi activa.</p></div><div class="card"><h3>Qué se guarda ahora</h3><p class="help">Solo la configuración local versionada. Se aplicará al dispositivo únicamente cuando exista una integración compatible.</p></div></section>`;
  if (current === 'apariencia') return `<section class="page"><div class="card"><h3>Skin</h3><p class="help">Se guardará para usarla tras la vinculación.</p><div class="skin-list">${['default','minimal','colorful','dark','retro'].map((skin) => `<button class="skin" data-skin="${skin}" aria-pressed="${draft.appearance.skin === skin}">${skin === 'default' ? 'Pericles Default' : skin[0]!.toUpperCase() + skin.slice(1)}</button>`).join('')}</div></div><div class="card"><h3>Pantalla</h3>${range('appearance.brightness','Brillo','0 a 255.',draft.appearance.brightness,0,255,1)}${range('appearance.textSize','Tamaño de texto','8 a 32 px.',draft.appearance.textSize,8,32,1,' px')}<details><summary>Parámetros avanzados</summary>${range('appearance.scrollSpeed','Velocidad de desplazamiento','0,5 a 3 veces la velocidad base.',draft.appearance.scrollSpeed,.5,3,.1,'×')}${check('appearance.highContrast','Alto contraste','Mejora la legibilidad en el dispositivo.',draft.appearance.highContrast)}</details></div></section>`;
  if (current === 'voz') return `<section class="page"><div class="card"><h3>Respuesta</h3>${range('voice.volume','Volumen','0 a 100%.',draft.voice.volume,0,100,1,'%')}${check('voice.muted','Silenciar salida de voz','La preferencia queda lista para el próximo dispositivo vinculado.',draft.voice.muted)}${field('Medio de respuesta','Elegí voz, texto o ambos.',`<select data-value="voice.responseMode">${[['both','Voz y texto'],['voice','Solo voz'],['text','Solo texto']].map(([value,label]) => `<option value="${value}" ${draft.voice.responseMode === value ? 'selected' : ''}>${label}</option>`).join('')}</select>`) }<details><summary>Parámetros avanzados</summary>${range('voice.speed','Velocidad de voz','0,5 a 2 veces la velocidad base.',draft.voice.speed,.5,2,.1,'×')}</details></div></section>`;
  if (current === 'personalidad') { const topics = ['Cocina','Sherlock Holmes','Boca','Música','Cine','Tecnología']; return `<section class="page"><div class="card">${field('Nombre visible','No cambia la activación física.',`<input data-value="personality.name" type="text" maxlength="60" value="${escape(draft.personality.name)}">`)}${field('Tono','Define el estilo de respuesta.',`<select data-value="personality.tone">${[['neutral','Neutro'],['warm','Cálido'],['playful','Juguetón']].map(([value,label]) => `<option value="${value}" ${draft.personality.tone === value ? 'selected' : ''}>${label}</option>`).join('')}</select>`) }${range('personality.sarcasm','Sarcasmo','0 a 10.',draft.personality.sarcasm,0,10,1)}${range('personality.profanity','Groserías','0 a 10.',draft.personality.profanity,0,10,1)}<div class="field"><div><label>Temas permitidos</label><small>Sin selección no se aplican filtros locales.</small></div><div class="chips">${topics.map((topic) => `<button class="chip" data-topic="${topic}" aria-pressed="${draft.personality.topics.includes(topic)}">${topic}</button>`).join('')}</div></div></div></section>`; }
  if (current === 'ia') return `<section class="page"><div class="card notice"><h3>Preferencia guardada, no aplicada todavía</h3><p class="help">La calidad de IA requiere un dispositivo vinculado y su backend configurado. Esta aplicación no inicia ningún servicio ni conexión.</p>${field('Calidad de respuesta','Se enviará al dispositivo compatible después de vincularlo.',`<select data-value="ai.quality">${[['balanced','Equilibrada'],['high','Alta calidad'],['economy','Ahorro']].map(([value,label]) => `<option value="${value}" ${draft.ai.quality === value ? 'selected' : ''}>${label}</option>`).join('')}</select>`)}</div></section>`;
  if (current === 'privacidad') return `<section class="page"><div class="card">${check('privacy.persistLocalSettings','Conservar configuración local','Permite recuperar los ajustes en esta computadora.',draft.privacy.persistLocalSettings)}${check('privacy.anonymousErrorReports','Informes técnicos anónimos','Desactivado por defecto. Esta versión no transmite informes.',draft.privacy.anonymousErrorReports)}</div></section>`;
  if (current === 'backups') return `<section class="page"><div class="card"><h3>Copias de configuración</h3><p class="help">Una copia contiene únicamente los ajustes de esta pantalla.</p><button class="btn primary" id="create-backup">Crear backup local</button></div><div class="card"><h3>Backups disponibles</h3><div id="backup-list"><p class="help">Cargando backups…</p></div></div></section>`;
  return `<section class="page"><div class="card unavailable"><h3>Integraciones no disponibles</h3><p class="help">Esta entrega no implementa detección o comunicación con USB, BLE, Wi‑Fi, backend, flasheo de firmware ni pruebas de micrófono, altavoz, pantalla o botones.</p><p><strong>Dependencia:</strong> se necesita una capa de integración de hardware verificada antes de habilitar controles.</p></div></section>`;
}

function render(): void {
  const [heading, description] = pages[current]; title.textContent = heading; subtitle.textContent = description; content.innerHTML = pageHtml();
  document.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-value]').forEach((input) => input.addEventListener('input', () => {
    const value = input instanceof HTMLInputElement && input.type === 'checkbox' ? input.checked : input instanceof HTMLInputElement && input.type === 'range' ? Number(input.value) : input.value;
    setValue(input.dataset.value!, value);
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-skin]').forEach((button) => button.addEventListener('click', () => setValue('appearance.skin', button.dataset.skin!)));
  document.querySelectorAll<HTMLButtonElement>('[data-topic]').forEach((button) => button.addEventListener('click', () => { const topic = button.dataset.topic!; draft.personality.topics = draft.personality.topics.includes(topic) ? draft.personality.topics.filter((value) => value !== topic) : [...draft.personality.topics, topic]; updateDirty(); render(); }));
  document.querySelector<HTMLButtonElement>('#create-backup')?.addEventListener('click', createBackup);
  if (current === 'backups') void renderBackups();
}
function toast(message: string): void { const element = document.createElement('div'); element.className = 'toast'; element.textContent = message; document.body.append(element); window.setTimeout(() => element.remove(), 3500); }
async function renderBackups(): Promise<void> { const list = document.querySelector('#backup-list'); if (!list) return; const backups = await window.pericles.configuration.backups.list(); list.innerHTML = backups.length ? backups.map((backup) => `<div class="backup"><span>${new Date(backup.createdAt).toLocaleString('es-AR')}</span><span><button class="btn" data-restore="${backup.id}">Restaurar</button> <button class="btn danger" data-delete="${backup.id}">Eliminar</button></span></div>`).join('') : '<p class="help">Todavía no hay backups locales.</p>'; document.querySelectorAll<HTMLButtonElement>('[data-restore]').forEach((button) => button.addEventListener('click', () => void restoreBackup(button.dataset.restore!))); document.querySelectorAll<HTMLButtonElement>('[data-delete]').forEach((button) => button.addEventListener('click', () => void deleteBackup(button.dataset.delete!))); }
async function createBackup(): Promise<void> { if (dirty()) { toast('Guardá o descartá los cambios antes de crear un backup.'); return; } await window.pericles.configuration.backups.create(); toast('Backup local creado.'); void renderBackups(); }
async function restoreBackup(id: string): Promise<void> { if (!window.confirm('¿Restaurar este backup? Reemplazará la configuración guardada actual.')) return; saved = await window.pericles.configuration.backups.restore(id); draft = copy(saved); updateDirty(); render(); toast('Backup restaurado.'); }
async function deleteBackup(id: string): Promise<void> { if (!window.confirm('¿Eliminar este backup local? Esta acción no se puede deshacer.')) return; await window.pericles.configuration.backups.delete(id); toast('Backup eliminado.'); void renderBackups(); }

document.querySelectorAll<HTMLButtonElement>('[data-page]').forEach((button) => button.addEventListener('click', () => { current = button.dataset.page as Page; document.querySelectorAll('[data-page]').forEach((item) => item.removeAttribute('aria-current')); button.setAttribute('aria-current', 'page'); render(); }));
document.querySelector<HTMLButtonElement>('#save')!.addEventListener('click', async () => { try { saved = await window.pericles.configuration.save(draft); draft = copy(saved); updateDirty(); render(); toast('Configuración local guardada.'); } catch { toast('La configuración no es válida y no se guardó.'); } });
document.querySelector<HTMLButtonElement>('#discard')!.addEventListener('click', () => { draft = copy(saved); updateDirty(); render(); });
document.querySelector<HTMLButtonElement>('#defaults')!.addEventListener('click', async () => { if (window.confirm('¿Restaurar los valores predeterminados en el borrador?')) { draft = await window.pericles.configuration.defaults(); updateDirty(); render(); } });

saved = await window.pericles.configuration.load(); draft = copy(saved); document.querySelector<HTMLButtonElement>('[data-page="inicio"]')!.setAttribute('aria-current', 'page'); render();
