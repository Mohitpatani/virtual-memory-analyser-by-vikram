# replacement_algo.py (CORRECTED)

class PageReplacementAlgorithm:
    def __init__(self, frame_count):
        self.frames = [-1] * frame_count
        self.frame_count = frame_count

    def get_frames(self):
        return [page if page != -1 else None for page in self.frames]

    def access(self, page_number):
        pass

    def replace(self, page_number):
        raise NotImplementedError("Subclass must implement abstract method replace")

class FIFO(PageReplacementAlgorithm):
    def __init__(self, frame_count):
        super().__init__(frame_count)
        self.load_order = [] 

    def replace(self, page_number):
        if page_number in self.frames:
            return None # Page hit

        if -1 in self.frames:
            free_index = self.frames.index(-1)
            self.frames[free_index] = page_number
            self.load_order.append(page_number)
            return -1 # Fault, no eviction (capacity available)

        else:
            evicted_page = self.load_order.pop(0)
            evicted_index = self.frames.index(evicted_page)
            
            self.frames[evicted_index] = page_number
            self.load_order.append(page_number)
            
            return evicted_page # Fault, eviction occurred

class LIFO(PageReplacementAlgorithm):
    def __init__(self, frame_count):
        super().__init__(frame_count)
        self.load_stack = []

    def replace(self, page_number):
        if page_number in self.frames:
            return None # Page hit

        if -1 in self.frames:
            free_index = self.frames.index(-1)
            self.frames[free_index] = page_number
            self.load_stack.append(page_number)
            return -1 # Fault, no eviction

        else:
            evicted_page = self.load_stack.pop()
            evicted_index = self.frames.index(evicted_page)
            
            self.frames[evicted_index] = page_number
            self.load_stack.append(page_number)
            
            return evicted_page # Fault, eviction occurred

def get_algorithm(algorithm_name, frame_count, reference_string=None):
    name = algorithm_name.upper()
    if name == "FIFO":
        return FIFO(frame_count)
    elif name == "LIFO":
        return LIFO(frame_count)
    else:
        raise ValueError(f"Unknown algorithm: {algorithm_name}")
