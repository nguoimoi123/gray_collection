import json
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from typing import Any

from api.models.product import Product
from api.models.productdetail import ProductDetail
from api.models.productvariant import ProductVariant


DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "gift_sets.json"


def _ensure_data_file() -> None:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not DATA_FILE.exists():
        DATA_FILE.write_text("[]", encoding="utf-8")


def _read_raw_gift_sets() -> list[dict[str, Any]]:
    _ensure_data_file()
    try:
        content = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        content = []
    return content if isinstance(content, list) else []


def _write_raw_gift_sets(gift_sets: list[dict[str, Any]]) -> None:
    _ensure_data_file()
    DATA_FILE.write_text(json.dumps(gift_sets, ensure_ascii=False, indent=2), encoding="utf-8")


def _slugify(value: str) -> str:
    normalized = "".join(ch.lower() if ch.isalnum() else "-" for ch in (value or "").strip())
    compact = "-".join(part for part in normalized.split("-") if part)
    return compact or f"gift-set-{uuid.uuid4().hex[:8]}"


def _decimal_to_number(value: Any) -> float:
    if value is None:
        return 0
    if isinstance(value, Decimal):
        return float(value)
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0


def _serialize_variant(variant: ProductVariant | None) -> dict[str, Any] | None:
    if not variant:
        return None
    return {
        "id": str(variant.id),
        "size_ml": variant.size_ml,
        "price": _decimal_to_number(variant.price),
        "stock_quantity": variant.stock_quantity,
        "is_default": bool(variant.is_default),
        "is_active": bool(getattr(variant, "is_active", True)),
    }


def _product_summary(product: Product) -> dict[str, Any]:
    detail = ProductDetail.objects(product=product).first()
    variants = list(ProductVariant.objects(product=product, is_active=True).order_by("size_ml"))
    default_variant = next((variant for variant in variants if variant.is_default), None) or (variants[0] if variants else None)
    return {
        "id": str(product.id),
        "slug": product.slug or str(product.id),
        "name": product.name,
        "brand": product.brand,
        "image": product.main_image or product.image,
        "short_description": product.short_description,
        "category": product.category,
        "detail": {
            "subtitle": detail.subtitle if detail else "",
            "occasion": detail.occasion if detail else [],
        },
        "default_variant": _serialize_variant(default_variant),
        "variants": [_serialize_variant(variant) for variant in variants if variant],
    }


def _find_variant(product: Product, size_ml: int | None) -> ProductVariant | None:
    if size_ml:
        exact = ProductVariant.objects(product=product, size_ml=size_ml, is_active=True).first()
        if exact:
            return exact
    return (
        ProductVariant.objects(product=product, is_default=True).first()
        or ProductVariant.objects(product=product, is_active=True).order_by("size_ml").first()
    )


def _enrich_item(item: dict[str, Any]) -> dict[str, Any]:
    product_id = str(item.get("product_id") or "").strip()
    size_ml = int(item.get("variant_size_ml") or 0) or None
    quantity = max(1, int(item.get("quantity") or 1))
    bonus_gift = str(item.get("bonus_gift") or "").strip()

    product = Product.objects(id=product_id, is_active=True).first()
    if not product:
        return {
            "product_id": product_id,
            "variant_size_ml": size_ml,
            "quantity": quantity,
            "bonus_gift": bonus_gift,
            "product": None,
            "variant": None,
            "unit_price": 0,
            "line_total": 0,
            "in_stock": False,
            "missing_product": True,
        }

    variant = _find_variant(product, size_ml)
    unit_price = _decimal_to_number(variant.price if variant else product.price)
    stock_quantity = int(variant.stock_quantity) if variant else 0
    return {
        "product_id": product_id,
        "variant_size_ml": int(variant.size_ml) if variant else size_ml,
        "quantity": quantity,
        "bonus_gift": bonus_gift,
        "product": _product_summary(product),
        "variant": _serialize_variant(variant),
        "unit_price": unit_price,
        "line_total": unit_price * quantity,
        "in_stock": stock_quantity >= quantity if variant else False,
        "missing_product": False,
    }


def _enrich_gift_set(payload: dict[str, Any]) -> dict[str, Any]:
    items = [_enrich_item(item) for item in payload.get("items", [])]
    total_price = sum(item["line_total"] for item in items)
    return {
        **payload,
        "items": items,
        "product_count": len(items),
        "total_price": total_price,
        "has_stock_issues": any(not item["in_stock"] for item in items),
    }


def list_gift_sets(active_only: bool = False) -> list[dict[str, Any]]:
    gift_sets = _read_raw_gift_sets()
    if active_only:
        gift_sets = [gift_set for gift_set in gift_sets if gift_set.get("is_active", True)]
    return [_enrich_gift_set(gift_set) for gift_set in gift_sets]


def get_gift_set(identifier: str) -> dict[str, Any] | None:
    for gift_set in _read_raw_gift_sets():
        if gift_set.get("id") == identifier or gift_set.get("slug") == identifier:
            return _enrich_gift_set(gift_set)
    return None


def _normalize_payload(payload: dict[str, Any], existing_id: str | None = None) -> dict[str, Any]:
    title = str(payload.get("title") or "").strip()
    if not title:
        raise ValueError("Gift set title is required.")

    items = payload.get("items") or []
    if not isinstance(items, list) or not items:
        raise ValueError("Gift set must include at least one product.")

    normalized_items = []
    for item in items:
        product_id = str(item.get("product_id") or "").strip()
        if not product_id:
            raise ValueError("Each gift set item must include a product_id.")
        normalized_items.append(
            {
                "product_id": product_id,
                "variant_size_ml": int(item.get("variant_size_ml") or 0) or None,
                "quantity": max(1, int(item.get("quantity") or 1)),
                "bonus_gift": str(item.get("bonus_gift") or "").strip(),
            }
        )

    now = datetime.now(timezone.utc).isoformat()
    return {
        "id": existing_id or uuid.uuid4().hex,
        "slug": _slugify(str(payload.get("slug") or title)),
        "title": title,
        "occasion_label": str(payload.get("occasion_label") or "").strip(),
        "campaign_label": str(payload.get("campaign_label") or "").strip(),
        "description": str(payload.get("description") or "").strip(),
        "gift_note": str(payload.get("gift_note") or "").strip(),
        "cover_image": str(payload.get("cover_image") or "").strip(),
        "bonus_gift": str(payload.get("bonus_gift") or "").strip(),
        "is_active": bool(payload.get("is_active", True)),
        "items": normalized_items,
        "updated_at": now,
    }


def create_gift_set(payload: dict[str, Any]) -> dict[str, Any]:
    gift_sets = _read_raw_gift_sets()
    normalized = _normalize_payload(payload)
    normalized["created_at"] = normalized["updated_at"]
    gift_sets.insert(0, normalized)
    _write_raw_gift_sets(gift_sets)
    return _enrich_gift_set(normalized)


def update_gift_set(identifier: str, payload: dict[str, Any]) -> dict[str, Any] | None:
    gift_sets = _read_raw_gift_sets()
    for index, gift_set in enumerate(gift_sets):
        if gift_set.get("id") != identifier:
            continue
        normalized = _normalize_payload(payload, existing_id=gift_set["id"])
        normalized["created_at"] = gift_set.get("created_at") or normalized["updated_at"]
        gift_sets[index] = normalized
        _write_raw_gift_sets(gift_sets)
        return _enrich_gift_set(normalized)
    return None


def delete_gift_set(identifier: str) -> bool:
    gift_sets = _read_raw_gift_sets()
    next_gift_sets = [gift_set for gift_set in gift_sets if gift_set.get("id") != identifier]
    if len(next_gift_sets) == len(gift_sets):
        return False
    _write_raw_gift_sets(next_gift_sets)
    return True
