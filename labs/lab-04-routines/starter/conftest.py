import sys
from pathlib import Path

# Permet `from routines.lib.idempotence import ...` depuis tests/.
sys.path.insert(0, str(Path(__file__).parent))
