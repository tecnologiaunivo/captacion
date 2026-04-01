// app.js

// URL DE TU HOJA DE CÁLCULO PUBLICADA EN LA WEB (Formato CSV)
// PASOS: 1. Abre tu Google Sheet > 2. Archivo > 3. Compartir > 4. Publicar en la Web.
// 5. Elige "Toda el documento" o una hoja en específico, y selecciona "Valores separados por comas (.csv)"
// 6. Copia y pega el enlace generado en esta variable:
//const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTYT3mNO3cA3yZt9N6R4ii-zNDvHMMw3o2lQ9Alm5YUAtyhOrGj2BhJjaXwN9TmGzHllxTapCPMDN1O/pub?output=csv"; 
//const GOOGLE_SHEET_CSV_URL = "https://script.google.com/macros/s/AKfycbxjf6sJCha1DPTSr5g-9ih4eOPiKPPezS08QOopa3842ZXWNPRtzouBhYdNpH2uyRdi/exec"
//const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTYT3mNO3cA3yZt9N6R4ii-zNDvHMMw3o2lQ9Alm5YUAtyhOrGj2BhJjaXwN9TmGzHllxTapCPMDN1O/pub?output=csv"
// DUMMY DATA: Si no completas la URL de arriba, usaremos esta información local para que veas que funciona.
const localMockData = [
    { ID: "L-1001", Nombre: "María Fernanda López", Telefono: "+503 7123-4567", Email: "maria.l@gmail.com", Programa: "Lic. en Enfermería", Origen: "Meta Ads", Estado: "Nuevo", Asesor: "Carlos R.", Fecha: "24 Mar 2026" },
    { ID: "L-1002", Nombre: "José Carlos Martínez", Telefono: "+503 7654-3210", Email: "jcmartinez@gmail.com", Programa: "Ing. en Sistemas", Origen: "Google", Estado: "Contactado", Asesor: "Ana P.", Fecha: "23 Mar 2026" },
    { ID: "L-1003", Nombre: "Andrea V. Santos", Telefono: "+503 7890-1234", Email: "andreav.s@hotmail.com", Programa: "Lic. en Diseño Gráfico", Origen: "Orgánico", Estado: "Evaluación", Asesor: "Luis M.", Fecha: "22 Mar 2026" },
    { ID: "L-1004", Nombre: "Kevin J. Ramírez", Telefono: "+503 7234-5678", Email: "k.ramirez99@outlook.com", Programa: "Lic. en Administración", Origen: "Meta Ads", Estado: "Matriculado", Asesor: "Ana P.", Fecha: "20 Mar 2026" },
    { ID: "L-1005", Nombre: "Sofía M. Hernández", Telefono: "+503 7567-8901", Email: "sofi_hern@gmail.com", Programa: "Arquitectura", Origen: "Referido", Estado: "Nuevo", Asesor: "Carlos R.", Fecha: "25 Mar 2026" },
    { ID: "L-1006", Nombre: "Diego E. Castro", Telefono: "+503 7777-8888", Email: "diego.castro@gmail.com", Programa: "Ing. Industrial", Origen: "Feria Escolar", Estado: "Contactado", Asesor: "Luis M.", Fecha: "18 Mar 2026" },
    { ID: "L-1007", Nombre: "Valeria N. Gómez", Telefono: "+503 7111-2222", Email: "val.gomez@gmail.com", Programa: "Lic. en Comunicaciones", Origen: "Meta Ads", Estado: "Matriculado", Asesor: "Carlos R.", Fecha: "15 Mar 2026" },
    { ID: "L-1008", Nombre: "Héctor J. Palacios", Telefono: "+503 7999-0000", Email: "hector.palacios@hotmail.com", Programa: "Derecho", Origen: "Instagram", Estado: "Nuevo", Asesor: "Ana P.", Fecha: "26 Mar 2026" },
    { ID: "L-1009", Nombre: "Gabriela S. Torres", Telefono: "+503 7333-4444", Email: "gaby.torres@gmail.com", Programa: "Lic. en Idiomas", Origen: "Google", Estado: "Evaluación", Asesor: "Luis M.", Fecha: "21 Mar 2026" }
];

let leadsData = [];
let sourceChartInstance = null;
let previousTotal = -1; // Variables para Auto-Polling

// Helpers
function showDashboardToast() {
    const toast = document.getElementById('dashboardToast');
    if(toast) {
        toast.classList.add('show');
        // Sonido de alerta sutil opcional (Requiere interacción previa del usuario)
        // new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play().catch(e => {}); 
        setTimeout(() => toast.classList.remove('show'), 5000);
    }
}

function getStatusBadgeClass(status) {
    if(!status) return '';
    const st = status.toLowerCase();
    if(st.includes('nuevo')) return 'badge-nuevo';
    if(st.includes('contactado')) return 'badge-contactado';
    if(st.includes('evalua')) return 'badge-eval';
    if(st.includes('matriculado')) return 'badge-matriculado';
    return '';
}

// Global Variables
const tableBody = document.getElementById('tableBody');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');


// Pega exclusivamente la URL final de Apps Script (La que termina en /exec)
// const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxjf6sJCha1DPTSr5g-9ih4eOPiKPPezS08QOopa3842ZXWNPRtzouBhYdNpH2uyRdi/exec";
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxzOIE0P-_lrejk5Zm9F63E-rI895ccc6zWWKHNN2ObU_F0DNkQNDPandNacOcqr9tB/exec";
// Carga de datos DIRECTA en tiempo real (0 retraso)
async function fetchSheetData() {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        const data = await response.json();
        
        // Limpiamos los resultados
        leadsData = data.filter(row => row.Nombre || row.ID); 
        
        // ¡Magia! Dispara la campanita si hay nuevos capturados
        if (previousTotal !== -1 && leadsData.length > previousTotal) {
            showDashboardToast();
        }
        previousTotal = leadsData.length;
        
        processData(leadsData);
        
    } catch(err) {
        console.warn("Fallo conectando al servidor en vivo:", err);
    }
}


// Fetching Remote CSV Data
// Reemplazo por problema CORS
//async function fetchSheetData() {
  //  if (!GOOGLE_SHEET_CSV_URL || !GOOGLE_SHEET_CSV_URL.startsWith('http')) {
  //      console.warn("No hay URL de Google Sheets detectada. Se usarán datos de simulación.");
  //      leadsData = localMockData;
  //      processData(leadsData);
  //      return;
  //  }

  //  let fetchUrl = GOOGLE_SHEET_CSV_URL;
    // Correccion definitiva CORS: Forzar evitar cache y usar proxy como fallback
  //  const noCacheUrl = fetchUrl + (fetchUrl.includes('?') ? '&' : '?') + 'nocache=' + new Date().getTime();

  //  const processCSVText = (csvText) => {
  //      Papa.parse(csvText, {
  //          header: true,
  //          skipEmptyLines: true,
  //          transformHeader: function(h) {
  //              // Elimina espacios o caracteres extranos (BOM) en los titulos
  //              return h.replace(/^\uFEFF/, '').trim();
  //          },
  //          complete: function(results) {
  //              leadsData = results.data.filter(row => row.Nombre || row.ID); 
                
                // Logica de Deteccion (Nuevos Registros)
    //            if (previousTotal !== -1 && leadsData.length > previousTotal) {
    //                showDashboardToast();
    //            }
    //            previousTotal = leadsData.length;
                
    //            processData(leadsData);
    //        }
    //    });
    //};

    //try {
    //    // 1er Intento: Peticion directa
    //    const response = await fetch(noCacheUrl, {
    //        method: 'GET',
    //        mode: 'cors'
    //    });
        
    //    if (!response.ok) throw new Error("CORS o error de red en peticion web principal");
        
    //    const csvText = await response.text();
    //    processCSVText(csvText);

    //} catch (err) {
    //    console.warn("Intento directo fallido. Ejecutando conexion usando Proxy de respaldo...", err);
    //    try {
    //        // 2do Intento: Utilizar un proxy Publico de CORS (allOrigins)
    //        const proxyUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(noCacheUrl);
    //        const proxyResponse = await fetch(proxyUrl);
            
    //        if (!proxyResponse.ok) throw new Error("El sistema proxy no pudo recuperar el documento.");
            
    //        const proxyText = await proxyResponse.text();
    //        processCSVText(proxyText);
    //    } catch (proxyError) {
    //        console.error("Fallaron ambas conexiones:", proxyError);
    //        alert("No fue posible cargar los datos desde Google Sheets.\nError CORS detectado incluso en backup.\nVerifica que la hoja sea 'Publica en la web'.");
    //    }
    //}
//}  Reemplazo por problema CORS

// Fetching Remote CSV Data (Nativo)
//function fetchSheetData() {
//    if (!GOOGLE_SHEET_CSV_URL || !GOOGLE_SHEET_CSV_URL.startsWith('http')) {
//        console.warn("No hay URL web de Google Sheets. Se usarán datos locales.");
//        leadsData = localMockData;
//        processData(leadsData);
//        return;
//    }

    // Le pedimos a PapaParse que descargue directamente el CSV, evitando problemas de CORS en modo local
//    Papa.parse(GOOGLE_SHEET_CSV_URL, {
//        download: true, // Esto hace la magia transparente
//        header: true,
//        skipEmptyLines: true,
//        transformHeader: function(h) {
//            return h.replace(/^\uFEFF/, '').trim(); // Limpia caracteres invisibles
//        },
//        complete: function(results) {
//            // Filtramos las filas vacías
//            leadsData = results.data.filter(row => row.Nombre || row.ID); 
//            
//            // Logica de Alerta Toast solo si hay prospectos nuevos
//            if (previousTotal !== -1 && leadsData.length > previousTotal) {
//                showDashboardToast();
//            }
//            previousTotal = leadsData.length;
            
            // Enviamos la data a la vista!
//            processData(leadsData);
//        },
//        error: function(err) {
//            console.warn("PapaParse no pudo conectarse. Google requiere hasta 5 minutos a veces tras publicar por 1ra vez.", err);
//        }
//    });
//}



// Master Procesamiento de Datos
function processData(data) {
    renderTable(data);
    updateKPIs(data);
    updateDynamicCharts(data);
}

// Renderizar Tabla
function renderTable(data) {
    if(!tableBody) return;
    tableBody.innerHTML = '';
    
    if(!data || data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No se encontraron prospectos</td></tr>`;
        return;
    }

    data.forEach(lead => {
        // Fallback robusto en caso de que alguna columna falte
        const id = lead.ID || '--';
        const name = lead.Nombre || '--';
        const phone = lead.Telefono || '--';
        const email = lead.Email || '--';
        const program = lead.Programa || '--';
        const source = lead.Origen || '--';
        const status = lead.Estado || '--';
        const assigned = lead.Asesor || '--';
        const date = lead.Fecha || '--';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${id}</strong></td>
            <td>${name}</td>
            <td class="cell-contact">
                <span>${phone}</span>
                <span class="email">${email}</span>
            </td>
            <td>${program}</td>
            <td>${source}</td>
            <td><span class="badge ${getStatusBadgeClass(status)}">${status}</span></td>
            <td>${assigned}</td>
            <td>${date}</td>
        `;
        tableBody.appendChild(tr);
    });
}

// Calcular y Renovar KPIs
function updateKPIs(data) {
    if (!data) return;
    const totalLeads = data.length;
    let enrolled = 0;
    let activeFollowUp = 0;

    data.forEach(l => {
        const st = (l.Estado || '').toLowerCase();
        if(st.includes('matriculado')) enrolled++;
        if(st.includes('contactado') || st.includes('evalua')) activeFollowUp++;
    });

    const conversionRate = totalLeads > 0 ? ((enrolled / totalLeads) * 100).toFixed(1) : 0;

    // Elementos DOM
    if(document.getElementById('kpi-total')) document.getElementById('kpi-total').innerText = totalLeads.toLocaleString();
    if(document.getElementById('kpi-active')) document.getElementById('kpi-active').innerText = activeFollowUp.toLocaleString();
    if(document.getElementById('kpi-enrolled')) document.getElementById('kpi-enrolled').innerText = enrolled.toLocaleString();
    if(document.getElementById('kpi-conversion')) document.getElementById('kpi-conversion').innerText = conversionRate + "%";
}

// Busqueda en tiempo real
function applyFilters() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const filterStatus = statusFilter ? statusFilter.value : 'all';

    const filtered = leadsData.filter(lead => {
        const name = (lead.Nombre || '').toLowerCase();
        const email = (lead.Email || '').toLowerCase();
        const phone = (lead.Telefono || '').toLowerCase();
        const st = (lead.Estado || '');
        
        const matchesSearch = name.includes(searchTerm) || email.includes(searchTerm) || phone.includes(searchTerm);
        
        let matchesStatus = false;
        if(filterStatus === 'all') {
            matchesStatus = true;
        } else {
            // Evaluacion contra filtro estricto
            matchesStatus = st.toLowerCase().includes(filterStatus.toLowerCase()) || 
                            filterStatus.toLowerCase().includes(st.toLowerCase());
        }
        
        return matchesSearch && matchesStatus;
    });

    renderTable(filtered);
    // Opcional: Descomentar si deseas que los KPIs cambien al filtrar
    // updateKPIs(filtered); 
    // updateDynamicCharts(filtered);
}

if(searchInput) searchInput.addEventListener('input', applyFilters);
if(statusFilter) statusFilter.addEventListener('change', applyFilters);

// Setup Visual Analytics Dinámico
function updateDynamicCharts(data) {
    const primary = '#4A148C';
    const primaryLight = '#7B1FA2';
    const accent = '#FFC107'; 
    const secondaryBlue = '#3b82f6';

    // 1. Chart Origenes Dinámico (Doughnut)
    // Extraer origenes unicos y agrupar cantidades
    const sourceCounts = {};
    data.forEach(l => {
        const src = l.Origen || 'Otro';
        sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });

    const sourceLabels = Object.keys(sourceCounts);
    const sourceValues = Object.values(sourceCounts);

    // Colores rotativos infinitos en caso de existir muchos origenes
    const dynamicColors = [primary, primaryLight, accent, secondaryBlue, '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const finalColors = sourceLabels.map((_, i) => dynamicColors[i % dynamicColors.length]);

    const sourceCanvas = document.getElementById('sourceChart');
    if(sourceCanvas) {
        if(sourceChartInstance) {
            // Destruir grafico anterior para insertar nuevo con data fresca
            sourceChartInstance.destroy();
        }

        const ctxSource = sourceCanvas.getContext('2d');
        sourceChartInstance = new Chart(ctxSource, {
            type: 'doughnut',
            data: {
                labels: sourceLabels.length > 0 ? sourceLabels : ['Sin Datos'],
                datasets: [{
                    data: sourceValues.length > 0 ? sourceValues : [1],
                    backgroundColor: sourceValues.length > 0 ? finalColors : ['#e2e8f0'],
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { 
                        position: 'bottom',
                        labels: { font: { family: "'Outfit', sans-serif" }, padding: 20, usePointStyle: true }
                    },
                    tooltip: {
                        backgroundColor: '#1e293b', padding: 12,
                        titleFont: { family: "'Outfit', sans-serif", size: 14 },
                        bodyFont: { family: "'Outfit', sans-serif", size: 13 }
                    }
                }
            }
        });
    }
}

// Inicializar el Line Chart Estadico al cargar DOM
document.addEventListener('DOMContentLoaded', () => {
    // Trend Chart (Line) se deja como visualizacion constante o asume valores por mes si existiese fecha parsing complejo
    const primary = '#4A148C';
    const primaryLight = '#7B1FA2';
    
    const trendCanvas = document.getElementById('trendChart');
    if(trendCanvas) {
        const ctxTrend = trendCanvas.getContext('2d');
        new Chart(ctxTrend, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [{
                    label: 'Nuevos Prospectos',
                    data: [150, 230, 210, 290, 310, 420],
                    borderColor: primary,
                    backgroundColor: 'rgba(74, 20, 140, 0.05)',
                    borderWidth: 3, tension: 0.4, fill: true,
                    pointBackgroundColor: primaryLight, pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { borderDash: [5, 5], color: '#e2e8f0' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // FIRE DATAFETCH O CARGA LOCAL
    fetchSheetData();

    // Auto-Polling Integrado (Consulta cada 10 segundos)
    setInterval(fetchSheetData, 30000);
});
