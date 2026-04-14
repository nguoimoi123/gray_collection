import json
from typing import Any

import cloudinary.uploader
from bson.errors import InvalidId
from mongoengine.errors import NotUniqueError, ValidationError

from api.models.product import Product
from api.models.productdetail import ProductDetail
from api.models.productvariant import ProductVariant
from api.services.inventory_service import sync_product_inventory


def _objects(model: Any) -> Any:
    return model.objects


def _normalize_string_list(value: Any) -> list[str]:
    if value is None:
        return []

    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]

    if isinstance(value, str):
        raw = value.strip()
        if not raw:
            return []
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                return [str(item).strip() for item in parsed if str(item).strip()]
        except Exception:
            pass
        return [item.strip() for item in raw.split(",") if item.strip()]

    return [str(value).strip()] if str(value).strip() else []


def _normalize_specifications(specifications_raw: Any) -> dict[str, str]:
    if specifications_raw is None:
        return {}

    if isinstance(specifications_raw, dict):
        normalized: dict[str, str] = {}
        for k, v in specifications_raw.items():
            key = str(k).strip()
            if key:
                normalized[key] = "" if v is None else str(v).strip()
        return normalized

    if isinstance(specifications_raw, list):
        normalized = {}
        for item in specifications_raw:
            if isinstance(item, dict):
                key = str(item.get("key", "")).strip()
                if key:
                    normalized[key] = str(item.get("value", "")).strip()
            elif isinstance(item, (list, tuple)) and len(item) >= 2:
                key = str(item[0]).strip()
                if key:
                    normalized[key] = "" if item[1] is None else str(item[1]).strip()
        return normalized

    if isinstance(specifications_raw, str):
        raw = specifications_raw.strip()
        if not raw:
            return {}

        try:
            parsed = json.loads(raw)
            return _normalize_specifications(parsed)
        except Exception:
            normalized = {}
            parts = raw.split(",")
            for part in parts:
                if ":" in part:
                    k, v = part.split(":", 1)
                    key = k.strip()
                    if key:
                        normalized[key] = v.strip()
            return normalized

    return {}


def _slugify(text: str) -> str:
    slug = "".join(ch.lower() if ch.isalnum() else "-" for ch in text)
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug.strip("-")


def _normalize_variants(payload: dict[str, Any], fallback_price: Any = None, fallback_original_price: Any = None) -> list[dict[str, Any]]:
    variants = payload.get("variants")
    normalized_variants: list[dict[str, Any]] = []

    if isinstance(variants, str):
        try:
            variants = json.loads(variants)
        except Exception:
            variants = None

    if isinstance(variants, list):
        for idx, item in enumerate(variants):
            if not isinstance(item, dict):
                continue
            size_ml = item.get("size_ml") or item.get("sizeMl") or item.get("size")
            price = item.get("price", fallback_price)
            original_price = item.get("original_price", item.get("originalPrice", fallback_original_price))
            stock_quantity = item.get("stock_quantity", item.get("stockQuantity", 0))
            sku = item.get("sku")
            is_default = bool(item.get("is_default", item.get("isDefault", idx == 0)))

            if size_ml in (None, "") or price in (None, ""):
                continue

            normalized_variants.append(
                {
                    "size_ml": int(size_ml),
                    "price": price,
                    "original_price": original_price,
                    "stock_quantity": int(stock_quantity or 0),
                    "sku": sku,
                    "is_default": is_default,
                }
            )

    if not normalized_variants and fallback_price not in (None, ""):
        default_size = payload.get("default_size_ml") or payload.get("size_ml") or 10
        normalized_variants.append(
            {
                "size_ml": int(default_size),
                "price": fallback_price,
                "original_price": fallback_original_price,
                "stock_quantity": int(payload.get("stock_quantity", 0) or 0),
                "sku": payload.get("sku"),
                "is_default": True,
            }
        )

    if normalized_variants and not any(v["is_default"] for v in normalized_variants):
        normalized_variants[0]["is_default"] = True

    return normalized_variants


def get_public_id_from_cloudinary_url(url: str):
    try:
        after_upload = url.split("/upload/")[-1]
        parts = after_upload.split("/", 1)
        if parts[0].startswith("v") and parts[0][1:].isdigit():
            file_part = parts[1]
        else:
            file_part = after_upload
        return file_part.rsplit(".", 1)[0]
    except Exception:
        return None


def delete_cloudinary_image(url):
    public_id = get_public_id_from_cloudinary_url(url)
    if not public_id:
        return {"success": False, "error": "Khong tach duoc public_id tu URL"}

    try:
        res = cloudinary.uploader.destroy(public_id)
        return {"success": True, "public_id": public_id, "result": res}
    except Exception as e:
        return {"success": False, "public_id": public_id, "error": str(e)}


def _sync_product_variants(product: Product, variants_payload: list[dict[str, Any]]) -> None:
    _objects(ProductVariant)(product=product).delete()

    for idx, variant_data in enumerate(variants_payload):
        sku = variant_data.get("sku") or f"{_slugify(product.name)}-{variant_data['size_ml']}ml"
        variant = ProductVariant(
            product=product,
            size_ml=variant_data["size_ml"],
            price=variant_data["price"],
            original_price=variant_data.get("original_price"),
            stock_quantity=variant_data.get("stock_quantity", 0),
            sku=sku,
            is_default=bool(variant_data.get("is_default", idx == 0)),
            is_active=True,
        )
        variant.save()


def add_product(payload):
    name = payload.get("name")
    try:
        price = payload.get("price")
        original_price = payload.get("originalPrice")
        image_urls = payload.get("images", [])

        if not image_urls:
            return {"success": False, "error": "Vui long cung cap it nhat mot hinh anh cho san pham."}

        if not name:
            return {"success": False, "error": "Vui long cung cap ten san pham."}

        variants_payload = _normalize_variants(payload, price, original_price)
        if not variants_payload:
            return {"success": False, "error": "Vui long cung cap gia hoac danh sach bien the dung tich."}

        main_image_url = payload.get("mainImage") or image_urls[0]
        default_variant = next((v for v in variants_payload if v["is_default"]), variants_payload[0])

        product = Product(
            name=name,
            slug=payload.get("slug") or _slugify(name),
            price=default_variant["price"],
            originalPrice=default_variant.get("original_price"),
            image=main_image_url,
            main_image=main_image_url,
            category=payload.get("category") or "perfume-decant",
            brand=payload.get("brand") or "Unknown",
            rating=payload.get("rating", 4.5),
            isNew=payload.get("isNew", True),
            target_gender=payload.get("target_gender", payload.get("gender", "unisex")),
            olfactory_family=payload.get("olfactory_family"),
            mood_traits=_normalize_string_list(payload.get("mood_traits", payload.get("traits"))),
            short_description=payload.get("short_description") or payload.get("description"),
            is_best_seller=bool(payload.get("is_best_seller", False)),
            is_limited=bool(payload.get("is_limited", False)),
            is_active=bool(payload.get("is_active", True)),
            tags=_normalize_string_list(payload.get("tags")),
        )
        product.save()

        features = _normalize_string_list(payload.get("features"))
        specifications = _normalize_specifications(payload.get("specifications", {}))

        product_detail = ProductDetail(
            product=product,
            images=image_urls,
            rating=payload.get("rating", 4.5),
            reviewCount=payload.get("reviewCount", 0),
            description=payload.get("description"),
            inStock=payload.get("inStock", True),
            subtitle=payload.get("subtitle"),
            story=payload.get("story"),
            top_notes=_normalize_string_list(payload.get("top_notes")),
            heart_notes=_normalize_string_list(payload.get("heart_notes")),
            base_notes=_normalize_string_list(payload.get("base_notes")),
            season=_normalize_string_list(payload.get("season")),
            occasion=_normalize_string_list(payload.get("occasion")),
            longevity=payload.get("longevity"),
            sillage=payload.get("sillage"),
            features=features,
            specifications=specifications,
            hasARView=payload.get("hasARView", False),
        )
        product_detail.save()

        _sync_product_variants(product, variants_payload)
        sync_product_inventory(product)

        return {
            "success": True,
            "action": "add_product",
            "message": f"Da them san pham '{name}' thanh cong.",
            "product_id": str(getattr(product, "id", getattr(product, "pk", ""))),
            "images": image_urls,
            "variants_count": len(variants_payload),
        }

    except ValidationError as e:
        return {"success": False, "error": f"Du lieu khong hop le: {e}"}
    except NotUniqueError:
        return {"success": False, "error": f"San pham voi ten '{name}' da ton tai."}
    except Exception as e:
        return {"success": False, "error": f"Da xay ra loi khong mong muon: {e}"}


def delete_product(product_id):
    product = _objects(Product)(name=product_id).first()
    if not product:
        product = _objects(Product)(id=product_id).first()

    if not product:
        return {"success": False, "error": "Khong tim thay san pham"}

    image_urls = []
    if getattr(product, "image", None):
        image_urls.append(product.image)

    details = _objects(ProductDetail)(product=product)
    for d in details:
        if getattr(d, "images", None):
            image_urls.extend(d.images)

    cloudinary_results = [delete_cloudinary_image(url) for url in image_urls]
    product_name = product.name
    product.delete()

    return {
        "success": True,
        "message": f"Da xoa san pham {product_name} va toan bo anh.",
        "cloudinary_results": cloudinary_results,
    }


def update_product(payload):
    try:
        product_id = payload.get("product_id")
        if not product_id:
            return {"success": False, "action": "update_product", "error": "Vui long cung cap ID hoac ten san pham can cap nhat."}

        product_to_update = _objects(Product)(name=product_id).first()
        if not product_to_update:
            try:
                product_to_update = _objects(Product)(id=product_id).first()
            except InvalidId:
                return {"success": False, "action": "update_product", "error": f"ID san pham '{product_id}' khong hop le."}

        if not product_to_update:
            return {"success": False, "action": "update_product", "error": f"Khong tim thay san pham voi ID hoac ten '{product_id}'."}

        product_detail = _objects(ProductDetail)(product=product_to_update).first()
        if not product_detail:
            product_detail = ProductDetail(product=product_to_update)

        updated_fields = []
        main_image_updated = False

        product_field_map = {
            "name": "name",
            "slug": "slug",
            "price": "price",
            "originalPrice": "originalPrice",
            "category": "category",
            "brand": "brand",
            "rating": "rating",
            "isNew": "isNew",
            "target_gender": "target_gender",
            "olfactory_family": "olfactory_family",
            "short_description": "short_description",
            "is_best_seller": "is_best_seller",
            "is_limited": "is_limited",
            "is_active": "is_active",
        }

        for payload_key, model_attr in product_field_map.items():
            if payload_key in payload:
                setattr(product_to_update, model_attr, payload[payload_key])
                updated_fields.append(payload_key)

        if "mood_traits" in payload:
            product_to_update.mood_traits = _normalize_string_list(payload["mood_traits"])
            updated_fields.append("mood_traits")

        if "tags" in payload:
            product_to_update.tags = _normalize_string_list(payload["tags"])
            updated_fields.append("tags")

        if "image" in payload:
            product_to_update.image = payload["image"]
            product_to_update.main_image = payload["image"]
            main_image_updated = True
            updated_fields.append("image")

        if "mainImage" in payload:
            product_to_update.image = payload["mainImage"]
            product_to_update.main_image = payload["mainImage"]
            main_image_updated = True
            updated_fields.append("mainImage")

        if "images" in payload:
            product_detail.images = payload["images"]
            updated_fields.append("images")

        if "galleryImages" in payload:
            product_detail.images = payload["galleryImages"] if isinstance(payload["galleryImages"], list) else []
            updated_fields.append("galleryImages")

        detail_field_map = {
            "reviewCount": "reviewCount",
            "description": "description",
            "inStock": "inStock",
            "subtitle": "subtitle",
            "story": "story",
            "longevity": "longevity",
            "sillage": "sillage",
            "hasARView": "hasARView",
        }
        for payload_key, model_attr in detail_field_map.items():
            if payload_key in payload:
                setattr(product_detail, model_attr, payload[payload_key])
                updated_fields.append(payload_key)

        if "features" in payload:
            product_detail.features = _normalize_string_list(payload["features"])
            updated_fields.append("features")

        if "specifications" in payload:
            product_detail.specifications = _normalize_specifications(payload["specifications"])
            updated_fields.append("specifications")

        if "top_notes" in payload:
            product_detail.top_notes = _normalize_string_list(payload["top_notes"])
            updated_fields.append("top_notes")

        if "heart_notes" in payload:
            product_detail.heart_notes = _normalize_string_list(payload["heart_notes"])
            updated_fields.append("heart_notes")

        if "base_notes" in payload:
            product_detail.base_notes = _normalize_string_list(payload["base_notes"])
            updated_fields.append("base_notes")

        if "season" in payload:
            product_detail.season = _normalize_string_list(payload["season"])
            updated_fields.append("season")

        if "occasion" in payload:
            product_detail.occasion = _normalize_string_list(payload["occasion"])
            updated_fields.append("occasion")

        if not main_image_updated and not product_to_update.image and product_detail.images:
            product_to_update.image = product_detail.images[0]
            product_to_update.main_image = product_detail.images[0]
            updated_fields.append("auto_main_image_sync")

        if not product_detail.images and product_to_update.image:
            product_detail.images = [product_to_update.image]
            updated_fields.append("auto_gallery_sync")

        if "variants" in payload or "size_ml" in payload or "default_size_ml" in payload:
            variants_payload = _normalize_variants(payload, payload.get("price", product_to_update.price), payload.get("originalPrice", product_to_update.originalPrice))
            if variants_payload:
                _sync_product_variants(product_to_update, variants_payload)
                default_variant = next((v for v in variants_payload if v["is_default"]), variants_payload[0])
                product_to_update.price = default_variant["price"]
                product_to_update.originalPrice = default_variant.get("original_price")
                updated_fields.append("variants")

        product_to_update.save()
        product_detail.save()
        sync_product_inventory(product_to_update)

        if updated_fields:
            return {
                "success": True,
                "action": "update_product",
                "message": f"Da cap nhat thanh cong cac truong: {', '.join(updated_fields)} cho san pham '{product_to_update.name}'.",
                "product_id": str(getattr(product_to_update, "id", getattr(product_to_update, "pk", ""))),
            }

        return {
            "success": False,
            "action": "update_product",
            "error": "Khong co truong nao duoc cap nhat. Vui long cung cap it nhat mot truong can cap nhat.",
        }

    except ValidationError as e:
        return {"success": False, "action": "update_product", "error": f"Du lieu khong hop le: {e}"}
    except Exception as e:
        return {"success": False, "action": "update_product", "error": f"Da xay ra loi khi cap nhat san pham: {e}"}
