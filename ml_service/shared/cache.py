"""
ml_service.shared.cache

In-Memory Thread-Safe Cache for Models and Extracted Features.
"""

import threading
from typing import Any, Optional


class MLCache:
    """Thread-safe singleton memory cache."""
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
                cls._instance._store = {}
                cls._instance._mtimes = {}
        return cls._instance

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            return self._store.get(key)

    def set(self, key: str, value: Any, mtime: Optional[float] = None) -> None:
        with self._lock:
            self._store[key] = value
            if mtime is not None:
                self._mtimes[key] = mtime

    def is_fresh(self, key: str, current_mtime: float) -> bool:
        with self._lock:
            return key in self._store and self._mtimes.get(key) == current_mtime

    def clear(self) -> None:
        with self._lock:
            self._store.clear()
            self._mtimes.clear()
