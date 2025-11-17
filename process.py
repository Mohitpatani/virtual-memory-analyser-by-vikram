class Process:
    def __init__(self, memory_manager):
        self.memory_manager = memory_manager
        self.page_sequence = []

    def access_pages(self, sequence):
        self.page_sequence = sequence
        print(f"🧩 Process accessing pages: {sequence}")
        for page in sequence:
            self.memory_manager.access_page(page)

    def simulate(self, sequence):
        self.page_sequence = sequence
        page_faults = 0
        print(f"🚀 Starting simulation for sequence: {sequence}")
        for page in sequence:
            self.memory_manager.access_page(page)
            if self.memory_manager.last_fault:
                page_faults += 1
        print(f"✅ Simulation complete. Total page faults: {page_faults}")
        return page_faults
