from collections import deque

class FIFOPageReplacement:
    def __init__(self, frame_count):
        self.frames = deque()
        self.frame_count = frame_count

    def replace(self, page_number):
        if page_number in self.frames:
            return False
        if len(self.frames) >= self.frame_count:
            self.frames.popleft()
        self.frames.append(page_number)
        return True

    def get_frames(self):
        return list(self.frames)


class LRUPageReplacement:
    def __init__(self, frame_count):
        self.frames = []
        self.frame_count = frame_count
        self.usage_order = []

    def replace(self, page_number):
        if page_number in self.frames:
            self.usage_order.remove(page_number)
            self.usage_order.append(page_number)
            return False
        if len(self.frames) < self.frame_count:
            self.frames.append(page_number)
        else:
            lru = self.usage_order.pop(0)
            self.frames.remove(lru)
            self.frames.append(page_number)
        self.usage_order.append(page_number)
        return True

    def get_frames(self):
        return list(self.frames)


class MRUPageReplacement:
    def __init__(self, frame_count):
        self.frames = []
        self.frame_count = frame_count
        self.usage_order = []

    def replace(self, page_number):
        if page_number in self.frames:
            self.usage_order.remove(page_number)
            self.usage_order.append(page_number)
            return False
        if len(self.frames) < self.frame_count:
            self.frames.append(page_number)
        else:
            mru = self.usage_order.pop(-1)
            self.frames.remove(mru)
            self.frames.append(page_number)
        self.usage_order.append(page_number)
        return True

    def get_frames(self):
        return list(self.frames)


class OptimalPageReplacement:
    def __init__(self, frame_count, reference_string=None):
        self.frames = []
        self.frame_count = frame_count
        self.reference_string = reference_string or []
        self.current_index = 0

    def replace(self, page_number):
        if page_number in self.frames:
            self.current_index += 1
            return False
        if len(self.frames) < self.frame_count:
            self.frames.append(page_number)
        else:
            future = self.reference_string[self.current_index + 1:]
            indices = []
            for f in self.frames:
                if f in future:
                    indices.append(future.index(f))
                else:
                    indices.append(float('inf'))
            victim_index = indices.index(max(indices))
            self.frames[victim_index] = page_number
        self.current_index += 1
        return True

    def get_frames(self):
        return list(self.frames)

    def reset(self):
        self.frames.clear()
        self.current_index = 0


def get_algorithm(name, frame_count, reference_string=None):
    name = name.upper()
    if name == "FIFO":
        return FIFOPageReplacement(frame_count)
    elif name == "LRU":
        return LRUPageReplacement(frame_count)
    elif name == "MRU":
        return MRUPageReplacement(frame_count)
    elif name == "OPTIMAL":
        return OptimalPageReplacement(frame_count, reference_string)
    else:
        raise ValueError(f"Unknown replacement algorithm: {name}")
