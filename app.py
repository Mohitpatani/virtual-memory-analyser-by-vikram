# app.py (MODIFIED SECTIONS)

from flask import Flask, render_template, jsonify, request
from memory_manager import MemoryManager
from process import Process
from config import PAGE_TABLE_SIZE, FRAME_COUNT # Import FRAME_COUNT

app = Flask(__name__)

# Initialize MemoryManager with the default frame count
memory_manager = MemoryManager(algorithm_name="FIFO", frame_count=FRAME_COUNT)
process = Process(memory_manager)

# ... (rest of the file remains the same until set_algorithm) ...

@app.route("/set_algorithm", methods=["POST"])
def set_algorithm():
    data = request.get_json()
    algorithm = data.get("algorithm", "").upper()
    reference_string = data.get("reference_string")
    # Extract frame_count from request data
    frame_count = data.get("frame_count") 

    try:
        # Pass frame_count to memory manager
        memory_manager.set_algorithm(algorithm, frame_count=frame_count, reference_string=reference_string)
        
        return jsonify({
            "status": "ok",
            "message": f"Algorithm switched to {algorithm}.",
            "algorithm": algorithm,
            "metrics": memory_manager.get_state()
        })
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

# ... (rest of app.py remains the same) ...
