class PageTable:
    def __init__(self, size):
        self.size = size
        self.entries = [-1] * size

    def is_loaded(self, page_number):
        return 0 <= page_number < self.size and self.entries[page_number] != -1

    def load_page(self, page_number, frame_number):
        if 0 <= page_number < self.size:
            self.entries[page_number] = frame_number

    def unload_page(self, page_number):
        if 0 <= page_number < self.size:
            self.entries[page_number] = -1

    def clear(self):
        self.entries = [-1] * self.size

    def get_entries(self):
        return [
            {"page": i, "frame": frame, "valid": frame != -1}
            for i, frame in enumerate(self.entries)
        ]
