import json
from pathlib import Path
from functools import lru_cache

_LOCALE_DIR = Path(__file__).parent
_DEFAULT_LANG = "es"
_SUPPORTED = {"es", "en"}


@lru_cache(maxsize=4)
def _load_locale(lang: str) -> dict:
    lang = lang if lang in _SUPPORTED else _DEFAULT_LANG
    path = _LOCALE_DIR / f"{lang}.json"
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def t(key: str, lang: str = "es", **kwargs) -> str:
    """
    Translate a dot-separated key.
    Example: t("sentiment.rec_stress", "en")
    Supports {placeholder} interpolation via kwargs.
    """
    data = _load_locale(lang)
    parts = key.split(".")
    value = data
    for part in parts:
        if isinstance(value, dict) and part in value:
            value = value[part]
        else:
            # Fallback to Spanish
            value = _load_locale(_DEFAULT_LANG)
            for p in parts:
                if isinstance(value, dict) and p in value:
                    value = value[p]
                else:
                    return key  # key not found
            break

    if isinstance(value, str) and kwargs:
        return value.format(**kwargs)
    return value


def get_dict(key: str, lang: str = "es") -> dict:
    """
    Return a nested dict for a dot-separated key.
    Example: get_dict("profile.archetypes.IMPULSIVO", "en")
    """
    data = _load_locale(lang)
    parts = key.split(".")
    value = data
    for part in parts:
        if isinstance(value, dict) and part in value:
            value = value[part]
        else:
            value = _load_locale(_DEFAULT_LANG)
            for p in parts:
                if isinstance(value, dict) and p in value:
                    value = value[p]
                else:
                    return {}
            break
    return value if isinstance(value, dict) else {}


def get_list(key: str, lang: str = "es") -> list:
    """Return a list for a dot-separated key."""
    data = _load_locale(lang)
    parts = key.split(".")
    value = data
    for part in parts:
        if isinstance(value, dict) and part in value:
            value = value[part]
        else:
            return []
    return value if isinstance(value, list) else []
