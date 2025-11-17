from replacement_algo import get_algorithm
from page_table import PageTable
from config import FRAME_COUNT, PAGE_TABLE_SIZE


class MemoryManager:
    def __init__(self, algorithm_name="FIFO", reference_string=None):
        self.page_table = PageTable(PAGE_TABLE_SIZE)
        self.replacement = get_algorithm(algorithm_name, FRAME_COUNT, reference_string)
        self.algorithm_name = algorithm_name

        self.frame_map = {}
        self.last_fault = False
        self.total_accesses = 0
        self.total_faults = 0

    def set_algorithm(self, algorithm_name, reference_string=None):
        self.replacement = get_algorithm(algorithm_name, FRAME_COUNT, reference_string)
        self.algorithm_name = algorithm_name

        self.frame_map.clear()
        self.page_table.clear()
        self.last_fault = False
        self.total_accesses = 0
        self.total_faults = 0

    def access_page(self, page_number):
        self.total_accesses += 1
        self.last_fault = False

        if self.page_table.is_loaded(page_number):
            pass
        else:
            self.last_fault = True
            self.total_faults += 1

            fault = self.replacement.replace(page_number)

            for pg in list(self.frame_map.keys()):
                if pg not in self.replacement.get_frames():
                    self.page_table.unload_page(pg)
                    del self.frame_map[pg]
                    break

            frame_number = self.replacement.get_frames().index(page_number)
            self.page_table.load_page(page_number, frame_number)
            self.frame_map[page_number] = frame_number

        return self.get_state()

    def get_state(self):
        page_table_state = {
            i: 1 if self.page_table.is_loaded(i) else 0
            for i in range(PAGE_TABLE_SIZE)
        }

        frame_occupancy = [
            1 if i < len(self.replacement.get_frames()) else 0
            for i in range(FRAME_COUNT)
        ]

        hit_rate = 0
        if self.total_accesses > 0:
            hit_rate = ((self.total_accesses - self.total_faults) / self.total_accesses) * 100

        return {
            "algorithm": self.algorithm_name,
            "page_table": page_table_state,
            "frames": self.replacement.get_frames(),
            "frame_occupancy": frame_occupancy,
            "last_fault": self.last_fault,
            "total_accesses": self.total_accesses,
            "total_faults": self.total_faults,
            "hit_rate": round(hit_rate, 2),
        }
