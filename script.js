// js/script.js (CORRECTED with Charting Logic)

let frames = [];
let pageTableSize = 16;
let frameCount = 4;
let pageFaults = 0;
let totalAccesses = 0;
let currentAlgorithm = "FIFO";

// Charting variables
let performanceChart;
let performanceData = []; // To store history of fault rates

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
    // Initialize the chart and the backend state
    initializeChart();
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

// --- CHARTING FUNCTIONS (NEW) ---

function initializeChart() {
    const ctx = document.getElementById('performanceChart');
    
    if (performanceChart) {
        performanceChart.destroy();
    }

    performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], 
            datasets: [{
                label: 'Fault Rate (%)',
                data: [], 
                borderColor: '#e74c3c', // Red/Error color
                backgroundColor: 'rgba(231, 76, 60, 0.2)',
                tension: 0.2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Fault Rate (%)'
                    }
                }
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

// --- CORE SIMULATION FUNCTIONS (Updated) ---

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

        // NEW: Update the chart after getting fresh metrics
        updatePerformanceChart(faultRate); 

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

async function setAlgorithm(algorithm, frame_count) {
    try {
        const response = await fetch("/set_algorithm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ algorithm, frame_count })
        });

        const data = await response.json();

        if (data.error) throw new Error(data.error);

        console.log(`✅ Switched to ${data.algorithm} algorithm with ${frame_count} frames`);
        resetSimulation(data.metrics.frames); 

    } catch (err) {
        console.error("Set algorithm error:", err);
        alert("Error changing algorithm: " + err.message);
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

    // NEW: Reset the performance history and re-initialize the chart
    performanceData = [];
    initializeChart();
}
