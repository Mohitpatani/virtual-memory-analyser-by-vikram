# memory_manager.py (CORRECTED)

from replacement_algo import get_algorithm
from page_table import PageTable
from config import FRAME_COUNT, PAGE_TABLE_SIZE


class MemoryManager:
    def __init__(self, algorithm_name="FIFO", frame_count=FRAME_COUNT, reference_string=None):
        self.frame_count = frame_count
        self.page_table = PageTable(PAGE_TABLE_SIZE)
        self.replacement = get_algorithm(algorithm_name, self.frame_count, reference_string) 
        self.algorithm_name = algorithm_name

        self.frame_map = {}
        self.last_fault = False
        self.total_accesses = 0
        self.total_faults = 0

    def set_algorithm(self, algorithm_name, frame_count=None, reference_string=None):
        if frame_count is not None:
            self.frame_count = frame_count

        self.replacement = get_algorithm(algorithm_name, self.frame_count, reference_string)
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
            self.replacement.access(page_number)
            pass
        else:
            self.last_fault = True
            self.total_faults += 1
            
            evicted_page = self.replacement.replace(page_number)

            current_frames = self.replacement.get_frames()

            if evicted_page is not None and evicted_page != -1: 
                self.page_table.unload_page(evicted_page)
                del self.frame_map[evicted_page]

            try:
                frame_number = current_frames.index(page_number)
                self.page_table.load_page(page_number, frame_number)
                self.frame_map[page_number] = frame_number
            except ValueError:
                frame_number = [i for i, page in enumerate(current_frames) if page == page_number][0]
                self.page_table.load_page(page_number, frame_number)
                self.frame_map[page_number] = frame_number

        return self.get_state()

    def get_state(self):
        page_table_state = {
            i: 1 if self.page_table.is_loaded(i) else 0
            for i in range(PAGE_TABLE_SIZE)
        }

        frames_array = self.replacement.get_frames()
        frame_occupancy = [
            1 if i < len(frames_array) else 0
            for i in range(self.frame_count) 
        ]

        fault_rate = 0
        if self.total_accesses > 0:
            fault_rate = (self.total_faults / self.total_accesses) * 100

        return {
            "algorithm": self.algorithm_name,
            "page_table": page_table_state,
            "frames": frames_array,
            "frame_occupancy": frame_occupancy,
            "last_fault": self.last_fault,
            "total_accesses": self.total_accesses,
            "total_faults": self.total_faults,
            "fault_rate": round(fault_rate, 2),
        }
