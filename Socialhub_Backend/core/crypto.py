"""Symmetric encryption helpers for sensitive database fields (e.g. OAuth1 tokens).

Usage:
    from core.crypto import encrypt_value, decrypt_value

    ciphertext = encrypt_value(plaintext_token)
    original   = decrypt_value(ciphertext)

Generate a key once and store it in FIELD_ENCRYPTION_KEY:
    python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
"""

from django.conf import settings
from cryptography.fernet import Fernet, InvalidToken


def _get_fernet() -> Fernet:
    key = getattr(settings, "FIELD_ENCRYPTION_KEY", "")
    if not key:
        raise ValueError(
            "FIELD_ENCRYPTION_KEY is not set. "
            "Generate one with: python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\""
        )
    return Fernet(key.encode() if isinstance(key, str) else key)


def encrypt_value(plaintext: str) -> str:
    return _get_fernet().encrypt(plaintext.encode()).decode()


def decrypt_value(ciphertext: str) -> str:
    """Decrypt a Fernet token. Returns ciphertext unchanged if it cannot be decrypted
    (backwards-compat for values stored before encryption was introduced)."""
    try:
        return _get_fernet().decrypt(ciphertext.encode()).decode()
    except (InvalidToken, Exception):
        return ciphertext
