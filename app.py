from flask import Flask, render_template, jsonify, request
from memory_manager import MemoryManager
from process import Process
from config import PAGE_TABLE_SIZE

app = Flask(__name__)

memory_manager = MemoryManager(algorithm_name="FIFO")  
process = Process(memory_manager)


@app.route("/")
def index():
    return render_template(
        "index.html",
        page_table_size=PAGE_TABLE_SIZE,
        current_algorithm=memory_manager.algorithm_name
    )


@app.route("/access", methods=["POST"])
def access_page():
    data = request.get_json()
    page = data.get("page")

    if page is None:
        return jsonify({"error": "Missing 'page' value"}), 400

    state = memory_manager.access_page(page)

    return jsonify({
        **state,
        "last_accessed": page
    })


@app.route("/set_algorithm", methods=["POST"])
def set_algorithm():
    data = request.get_json()
    algorithm = data.get("algorithm", "").upper()
    reference_string = data.get("reference_string")

    try:
        memory_manager.set_algorithm(algorithm, reference_string=reference_string)
        return jsonify({
            "status": "ok",
            "message": f"Algorithm switched to {algorithm}.",
            "algorithm": algorithm,
            "metrics": memory_manager.get_state()
        })
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@app.route("/simulate", methods=["POST"])
def simulate_sequence():
    data = request.get_json()
    sequence = data.get("sequence")

    if not isinstance(sequence, list):
        return jsonify({"error": "Missing or invalid 'sequence' list"}), 400

    total_faults = process.simulate(sequence)

    return jsonify({
        "total_faults": total_faults,
        "final_state": memory_manager.get_state(),
        "sequence": sequence
    })


if __name__ == "__main__":
    app.run(debug=True)
