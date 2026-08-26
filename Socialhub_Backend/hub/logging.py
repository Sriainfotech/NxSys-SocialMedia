import json
import logging


class JsonFormatter(logging.Formatter):
    """Emit log records as single-line JSON — structured log format for production."""

    def format(self, record):
        log_data = {
            "ts": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        if record.exc_info:
            log_data["exc"] = self.formatException(record.exc_info)
        if record.stack_info:
            log_data["stack"] = self.formatStack(record.stack_info)
        return json.dumps(log_data, ensure_ascii=False)
