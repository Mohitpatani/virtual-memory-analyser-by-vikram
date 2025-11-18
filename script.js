// js/script.js (CORRECTED with ALL 3 Charts)

let frames = [];
let pageTableSize = 16;
let frameCount = 4;
let pageFaults = 0;
let totalAccesses = 0;
let currentAlgorithm = "FIFO";

// Charting variables
let performanceChart;
let memoryUsageChart; // NEW
let pageTableChart;   // NEW
let performanceData = [];

const frameCountInput = document.getElementById("frame-count");

document.addEventListener("DOMContentLoaded", () => {
    const accessBtn = document.getElementById("access-btn");
    const runBtn = document.getElementById("run-sequence-btn");
    const resetBtn = document.getElementById("reset-btn");
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    const algoSelect = document.getElementById("algo-select");

    pageTableSize = parseInt(document.getElementById("page-table-size").value);
    frameCount = parseInt(frameCountInput.value);

    initPageTable();
    // Initialize all charts and the backend state
    initializeAllCharts();
    setAlgorithm(currentAlgorithm, frameCount); 

    frameCountInput.onchange = async () => {
        const newFrameCount = parseInt(frameCountInput.value);
        if (!isNaN(newFrameCount) && newFrameCount > 0) {
            frameCount = newFrameCount;
            await setAlgorithm(currentAlgorithm, frameCount);
        } else {
            alert("Frame count must be a positive number.");
            frameCountInput.value = frameCount;
        }
    };

    algoSelect.onchange = async () => {
        currentAlgorithm = algoSelect.value;
        await setAlgorithm(currentAlgorithm, frameCount);
    };

    accessBtn.onclick = async () => {
        const page = parseInt(document.getElementById("page-input").value);
        if (!isNaN(page)) {
            await accessPage(page);
        }
    };

    runBtn.onclick = async () => {
        const seqInput = document.getElementById("access-sequence").value;
        const sequence = seqInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        
        await setAlgorithm(currentAlgorithm, frameCount); 
        
        for (let i = 0; i < sequence.length; i++) {
            await new Promise(r => setTimeout(r, 500));
            await accessPage(sequence[i]);
        }
    };

    resetBtn.onclick = resetSimulation;

    darkModeToggle.onchange = () => {
        document.body.classList.toggle("dark-mode");
    };
});


// --- CHART INITIALIZATION AND UPDATE FUNCTIONS ---

function initializeAllCharts() {
    initializePerformanceChart();
    initializeMemoryUsageChart();
    initializePageTableChart();
}


// Performance Chart (Line Chart) - Existing Logic
function initializePerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (performanceChart) performanceChart.destroy();

    performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], 
            datasets: [{
                label: 'Fault Rate (%)',
                data: [], 
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.2)',
                tension: 0.2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 100 }
            }
        }
    });
}

function updatePerformanceChart(currentFaultRate) {
    const accessCount = performanceData.length + 1;
    performanceData.push(currentFaultRate);

    performanceChart.data.labels.push(accessCount);
    performanceChart.data.datasets[0].data.push(currentFaultRate);
    performanceChart.update();
}


// Memory Usage Chart (Bar Chart) - NEW Implementation for simple bar chart
function initializeMemoryUsageChart() {
    const ctx = document.getElementById('memoryUsageChart');
    if (memoryUsageChart) memoryUsageChart.destroy();
    
    // Create labels based on the current frameCount
    const labels = Array.from({ length: frameCount }, (_, i) => `Frame ${i}`); 

    memoryUsageChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Occupied',
                data: Array(frameCount).fill(0), // Start with all empty
                backgroundColor: '#2980b9', // Blue color for memory
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1.0, // Max value is 1 (Occupied)
                    ticks: {
                        stepSize: 0.1,
                        callback: (value) => value === 1 ? 'Occupied' : value === 0 ? 'Free' : ''
                    }
                }
            }
        }
    });
}

function updateMemoryUsageChart(frameOccupancy) {
    // frameOccupancy is an array like [1, 0, 1, 1]
    memoryUsageChart.data.datasets[0].data = frameOccupancy;
    
    // Re-create labels in case frameCount changed during reset
    const newLabels = Array.from({ length: frameCount }, (_, i) => `Frame ${i}`);
    memoryUsageChart.data.labels = newLabels;

    memoryUsageChart.update();
}


// Page Table Status Chart (Bar Chart) - NEW Implementation
function initializePageTableChart() {
    const ctx = document.getElementById('pageTableChart');
    if (pageTableChart) pageTableChart.destroy();
    
    // Create labels based on the global pageTableSize
    const labels = Array.from({ length: pageTableSize }, (_, i) => `Page ${i}`); 

    pageTableChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Loaded (1=yes, 0=no)',
                data: Array(pageTableSize).fill(0),
                backgroundColor: '#27ae60', // Green color for loaded status
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1.0, 
                    ticks: {
                        stepSize: 0.1,
                        callback: (value) => value === 1 ? 'Loaded' : value === 0 ? 'Unloaded' : ''
                    }
                },
                x: {
                    // Optional: Ensures all bars are visible if there are many pages
                    barPercentage: 1.0,
                    categoryPercentage: 0.8
                }
            }
        }
    });
}

function updatePageTableChart(pageTableState) {
    // pageTableState is an object {0: 1, 1: 0, ...}
    const data = Object.values(pageTableState);

    pageTableChart.data.datasets[0].data = data;
    pageTableChart.update();
}


// --- CORE SIMULATION FUNCTIONS (Updated to include new charts) ---

// This function needs to be updated to ensure all charts are initialized on reset.
function resetSimulation(initialFrames = []) {
    frameCount = parseInt(frameCountInput.value) || 4; 
    
    frames = initialFrames;
    pageFaults = 0;
    totalAccesses = 0;
    
    updateStats(0);
    
    updateFramesUI();
    document.getElementById("log-entries").innerHTML = '';
    document.getElementById("last-page").textContent = "-";
    initPageTable();

    // Reset performance data and initialize all charts
    performanceData = [];
    initializeAllCharts(); 
}

// This function needs to be updated to call all chart updates.
async function accessPage(page) {
    totalAccesses++;

    try {
        const response = await fetch("/access", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page })
        });
        const data = await response.json();

        if (data.error) throw new Error(data.error);

        frames = data.frames;
        const isFault = data.last_fault;
        
        pageFaults = data.total_faults; 
        const faultRate = data.fault_rate;

        // NEW: Update all charts with fresh data
        updatePerformanceChart(faultRate);
        updateMemoryUsageChart(data.frame_occupancy);
        updatePageTableChart(data.page_table);
        
        updateFramesUI();
        updateStats(faultRate);
        logAccess(page, isFault);

        document.getElementById("last-page").textContent = page;
        highlightPage(page, isFault);

    } catch (err) {
        console.error("Access error:", err);
        alert("Error accessing page: " + err.message);
    }
}


// --- OTHER AUXILIARY FUNCTIONS ---

function initPageTable() {
    const table = document.getElementById("page-table");
    table.innerHTML = '';
    for (let i = 0; i < pageTableSize; i++) {
        const cell = document.createElement("div");
        cell.id = `page-${i}`;
        cell.textContent = i;
        table.appendChild(cell);
    }
}

function updateFramesUI() {
    const frameDiv = document.getElementById("frames");
    frameDiv.innerHTML = '';
    
    for (let i = 0; i < frameCount; i++) {
        const cell = document.createElement("div");
        const page = frames[i];
        
        cell.textContent = page === null || page === undefined ? "-" : page; 
        
        frameDiv.appendChild(cell);
    }
}

function updateStats(faultRateFromBackend) {
    document.getElementById("total-accesses").textContent = totalAccesses;
    document.getElementById("page-faults").textContent = pageFaults;
    document.getElementById("fault-rate").textContent = `${faultRateFromBackend}%`;
}

function highlightPage(page, isFault) {
    document.querySelectorAll("#page-table .fault").forEach(el => el.classList.remove("fault"));
    const cell = document.getElementById(`page-${page}`);
    if (cell && isFault) {
        cell.classList.add("fault");
    }
}

function logAccess(page, isFault) {
    const log = document.getElementById("log-entries");
    const li = document.createElement("li");
    li.textContent = `Page ${page} ${isFault ? "-> Page Fault" : "-> Hit"} (${currentAlgorithm})`;
    log.appendChild(li);
}
