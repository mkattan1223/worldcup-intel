import os
import sys

import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"[run.py] Starting uvicorn on 0.0.0.0:{port}", flush=True)
    print(f"[run.py] ENV vars present: PORT={port}", flush=True)

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
        access_log=True,
    )
