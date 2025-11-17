from memory_manager import MemoryManager
from process import Process

def main():
    print("=== 🧠 Virtual Memory Simulator ===\n")

    algorithm = input("Choose page replacement algorithm (FIFO / LRU / MRU / OPTIMAL): ").strip().upper()
    if algorithm not in ["FIFO", "LRU", "MRU", "OPTIMAL"]:
        print("⚠️ Invalid choice, defaulting to FIFO.")
        algorithm = "FIFO"

    access_sequence = [0, 2, 1, 4, 0, 3, 6, 2, 4]

    reference_string = access_sequence if algorithm == "OPTIMAL" else None

    memory_manager = MemoryManager(algorithm_name=algorithm, reference_string=reference_string)
    process = Process(memory_manager)

    print(f"\nAlgorithm in use: {algorithm}")
    print(f"Page access sequence: {access_sequence}\n")

    total_faults = process.simulate(access_sequence)

    print("\n=== Simulation Complete ===")
    print(f"Total page faults: {total_faults}")
    print(f"Frames after simulation: {memory_manager.replacement.get_frames()}")
    print(f"Page table state: {memory_manager.page_table.get_entries()}")

if __name__ == "__main__":
    main()
