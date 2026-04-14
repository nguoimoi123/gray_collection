import os
import sys
import unicodedata
from decimal import Decimal
from pathlib import Path
from urllib.parse import quote


BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

import django  # noqa: E402

django.setup()

from api.data import PERFUME_SEED_DATA  # noqa: E402
from api.models.brand import Brand  # noqa: E402
from api.models.category import Category  # noqa: E402
from api.models.product import Product  # noqa: E402
from api.models.productdetail import ProductDetail  # noqa: E402
from api.models.productvariant import ProductVariant  # noqa: E402


PREMIUM_BRANDS = {
    "Parfums de Marly",
    "Maison Francis Kurkdjian",
    "Kilian",
    "Roja",
    "Tom Ford",
    "Le Labo",
    "Louis Vuitton",
}

DESIGNER_BRANDS = {
    "Chanel",
    "Dior",
    "Gucci",
    "Versace",
    "Yves Saint Laurent",
    "Jean Paul Gaultier",
    "Giorgio Armani",
    "Lancôme",
    "Burberry",
    "Carolina Herrera",
    "Paco Rabanne",
    "Jo Malone",
    "Maison Margiela Replica",
    "Montblanc",
    "Mugler",
    "Narciso Rodriguez",
    "Bvlgari",
    "Armaf",
    "Calvin Klein",
}

BEST_SELLER_NAMES = {
    "Delina",
    "Baccarat 540",
    "Black Opium",
    "YSL Libre",
    "Good Girl",
    "Chanel Chance",
    "Sauvage",
    "Chanel Bleu",
    "Versace Eros",
    "CK One",
    "TF Oud Wood",
}

NEW_ARRIVAL_NAMES = {
    "Marly Palatine",
    "Kilian GG GB",
    "Kilian Extreme",
    "Kilian Rolling In Love",
    "MontBlanc Signature",
    "Dior J'adore",
    "Armaf Club De Nuit",
    "Jo Malone",
    "Narciso Đỏ",
}


def slugify(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    slug = "".join(ch.lower() if ch.isalnum() else "-" for ch in ascii_text)
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug.strip("-")


def category_label(target_gender: str) -> str:
    mapping = {
        "female": "Nước hoa nữ",
        "male": "Nước hoa nam",
        "unisex": "Nước hoa unisex",
    }
    return mapping.get(target_gender, "Nước hoa chiết")


def gender_label(target_gender: str) -> str:
    mapping = {
        "female": "Nữ",
        "male": "Nam",
        "unisex": "Unisex",
    }
    return mapping.get(target_gender, "Unisex")


def image_urls(name: str) -> list[str]:
    encoded_name = quote(name)
    base = "https://placehold.co/900x1100"
    return [
        f"{base}/f5f1ea/1d1d1d?text={encoded_name}",
        f"{base}/ece7df/1d1d1d?text={encoded_name}%20-%20Chi%E1%BA%BFt",
        f"{base}/ddd6cc/1d1d1d?text={encoded_name}%20-%2010ml",
    ]


def infer_olfactory_family(item: dict) -> str:
    notes = " ".join(
        item.get("top_notes", [])
        + item.get("heart_notes", [])
        + item.get("base_notes", [])
        + item.get("main_accords", [])
    ).lower()

    if any(keyword in notes for keyword in ["biển", "nước biển", "muối biển", "aldehyde"]):
        return "Biển"
    if any(keyword in notes for keyword in ["vani", "caramel", "praline", "cà phê", "ca cao", "bỏng ngô", "đậu tonka"]):
        return "Thơm ngọt"
    if any(keyword in notes for keyword in ["hoa", "hoa hồng", "hoa nhài", "mẫu đơn", "hoa cam", "hoa lan", "hoa huệ"]):
        return "Hoa cỏ"
    if any(keyword in notes for keyword in ["cam", "chanh", "bergamot", "bưởi", "yuzu", "quýt", "cam quýt"]):
        return "Cam chanh"
    if any(keyword in notes for keyword in ["gỗ", "oud", "trầm", "đàn hương", "cỏ hương bài", "da thuộc"]):
        return "Gỗ"
    if any(keyword in notes for keyword in ["xạ hương", "cashmeran"]):
        return "Xạ hương"
    if any(keyword in notes for keyword in ["hổ phách", "nhựa"]):
        return "Hổ phách"
    return "Hiện đại"


def infer_season(olfactory_family: str) -> list[str]:
    if olfactory_family in {"Biển", "Cam chanh"}:
        return ["Xuân", "Hè"]
    if olfactory_family in {"Thơm ngọt", "Gỗ", "Hổ phách"}:
        return ["Thu", "Đông"]
    if olfactory_family == "Hoa cỏ":
        return ["Xuân", "Thu"]
    return ["Quanh năm"]


def infer_occasion(mood_traits: list[str], olfactory_family: str) -> list[str]:
    traits = " ".join(mood_traits).lower()
    occasions = []
    if any(keyword in traits for keyword in ["quyến rũ", "gợi cảm", "sexy", "khiêu khích"]):
        occasions.extend(["Hẹn hò", "Tiệc tối"])
    if any(keyword in traits for keyword in ["tươi mát", "thanh lịch", "dễ dùng", "trẻ trung"]):
        occasions.extend(["Đi làm", "Hằng ngày"])
    if any(keyword in traits for keyword in ["sang trọng", "quý phái", "đẳng cấp"]):
        occasions.append("Sự kiện")
    if not occasions:
        if olfactory_family in {"Biển", "Cam chanh"}:
            occasions.extend(["Hằng ngày", "Đi làm"])
        else:
            occasions.extend(["Hằng ngày", "Hẹn hò"])
    return list(dict.fromkeys(occasions))


def infer_longevity(olfactory_family: str) -> str:
    if olfactory_family in {"Thơm ngọt", "Gỗ", "Hổ phách"}:
        return "6-8 giờ"
    if olfactory_family in {"Biển", "Cam chanh"}:
        return "4-6 giờ"
    return "5-7 giờ"


def infer_sillage(olfactory_family: str) -> str:
    if olfactory_family in {"Thơm ngọt", "Hổ phách"}:
        return "Vừa đến xa"
    if olfactory_family in {"Biển", "Cam chanh"}:
        return "Gần đến vừa"
    return "Vừa"


def pricing_tier(brand: str) -> str:
    if brand in PREMIUM_BRANDS:
        return "premium"
    if brand in DESIGNER_BRANDS:
        return "designer"
    return "standard"


def build_variants(brand: str) -> list[dict]:
    if pricing_tier(brand) == "premium":
        prices = [(5, 180000, 210000, 15), (10, 320000, 360000, 12), (20, 580000, 650000, 8)]
    elif pricing_tier(brand) == "designer":
        prices = [(5, 120000, 145000, 18), (10, 220000, 250000, 14), (20, 400000, 450000, 10)]
    else:
        prices = [(5, 100000, 120000, 16), (10, 190000, 220000, 12), (20, 350000, 390000, 8)]

    variants = []
    for index, (size_ml, price, original_price, stock_quantity) in enumerate(prices):
        variants.append(
            {
                "size_ml": size_ml,
                "price": Decimal(str(price)),
                "original_price": Decimal(str(original_price)),
                "stock_quantity": stock_quantity,
                "is_default": index == 1,
            }
        )
    return variants


def build_short_description(name: str, mood_traits: list[str], olfactory_family: str) -> str:
    traits_text = ", ".join(mood_traits[:2]).lower() if mood_traits else "cuốn hút"
    return f"{name} mang tinh thần {traits_text}, phù hợp với người yêu phong cách {olfactory_family.lower()}."


def build_subtitle(target_gender: str, olfactory_family: str, mood_traits: list[str]) -> str:
    traits_text = " - ".join(mood_traits[:3]) if mood_traits else "Tinh tế và cuốn hút"
    return f"{gender_label(target_gender)} | {olfactory_family} | {traits_text}"


def build_description(name: str, item: dict, olfactory_family: str) -> str:
    mood_traits = item.get("mood_traits", [])
    top_notes = item.get("top_notes") or item.get("main_accords") or []
    heart_notes = item.get("heart_notes", [])
    base_notes = item.get("base_notes", [])

    parts = [
        f"{name} là mùi hương {', '.join(mood_traits).lower()} dành cho những ai muốn để lại dấu ấn riêng.",
        f"Nhóm mùi chủ đạo thiên về {olfactory_family.lower()}, mở đầu với {', '.join(top_notes[:3]).lower()}." if top_notes else "",
        f"Tầng hương giữa chuyển mình cùng {', '.join(heart_notes[:3]).lower()}." if heart_notes else "",
        f"Cuối cùng đọng lại với {', '.join(base_notes[:3]).lower()}, tạo cảm giác hài hòa và dễ nhớ." if base_notes else "",
        "Thiết kế phù hợp cho nhu cầu dùng thử mùi, mang theo hằng ngày hoặc tặng quà."
    ]
    return " ".join(part for part in parts if part)


def build_story(name: str, mood_traits: list[str], target_gender: str) -> str:
    persona = {
        "female": "nữ tính, cuốn hút và có gu",
        "male": "lịch lãm, tự tin và có chiều sâu",
        "unisex": "hiện đại, tự do và không bị giới hạn bởi khuôn mẫu",
    }.get(target_gender, "hiện đại và tinh tế")
    traits_text = ", ".join(mood_traits[:3]).lower() if mood_traits else "ấn tượng"
    return f"{name} gợi nên hình ảnh người dùng {persona}. Mùi hương đi theo hướng {traits_text}, dễ tạo thiện cảm ngay từ lần chạm mùi đầu tiên."


def build_tags(item: dict, family: str) -> list[str]:
    tags = ["nước hoa chiết", family.lower(), gender_label(item["target_gender"]).lower()]
    if item["name"] in BEST_SELLER_NAMES:
        tags.append("best seller")
    if item["name"] in NEW_ARRIVAL_NAMES:
        tags.append("mới về")
    return list(dict.fromkeys(tags))


def ensure_reference_data() -> None:
    for category_name in ["Nước hoa nữ", "Nước hoa nam", "Nước hoa unisex", "Nước hoa chiết"]:
        if not Category.objects(name=category_name).first():
            Category(name=category_name).save()

    brand_names = sorted({item["brand"] for item in PERFUME_SEED_DATA if item.get("brand")})
    for brand_name in brand_names:
        if not Brand.objects(name=brand_name).first():
            Brand(name=brand_name).save()


def upsert_perfume(item: dict) -> tuple[str, str]:
    name = item["name"]
    brand = item.get("brand") or "Chưa rõ"
    slug = slugify(name)
    family = infer_olfactory_family(item)
    mood_traits = item.get("mood_traits", [])
    top_notes = item.get("top_notes") or item.get("main_accords") or []
    heart_notes = item.get("heart_notes", [])
    base_notes = item.get("base_notes", [])
    images = image_urls(name)
    variants = build_variants(brand)
    default_variant = next(variant for variant in variants if variant["is_default"])
    is_new = name in NEW_ARRIVAL_NAMES
    is_best_seller = name in BEST_SELLER_NAMES

    product = Product.objects(slug=slug).first()
    status = "updated" if product else "created"
    if not product:
        product = Product(slug=slug)

    product.name = name
    product.price = default_variant["price"]
    product.originalPrice = default_variant["original_price"]
    product.image = images[0]
    product.main_image = images[0]
    product.rating = 4.8 if is_best_seller else 4.6
    product.category = category_label(item["target_gender"])
    product.brand = brand
    product.isNew = is_new
    product.target_gender = item["target_gender"]
    product.olfactory_family = family
    product.mood_traits = mood_traits
    product.short_description = build_short_description(name, mood_traits, family)
    product.is_best_seller = is_best_seller
    product.is_limited = False
    product.is_active = True
    product.tags = build_tags(item, family)
    product.save()

    detail = ProductDetail.objects(product=product).first()
    if not detail:
        detail = ProductDetail(product=product)

    detail.images = images
    detail.rating = product.rating
    detail.reviewCount = 86 if is_best_seller else 24
    detail.description = build_description(name, item, family)
    detail.inStock = True
    detail.subtitle = build_subtitle(item["target_gender"], family, mood_traits)
    detail.story = build_story(name, mood_traits, item["target_gender"])
    detail.top_notes = top_notes
    detail.heart_notes = heart_notes
    detail.base_notes = base_notes
    detail.season = infer_season(family)
    detail.occasion = infer_occasion(mood_traits, family)
    detail.longevity = infer_longevity(family)
    detail.sillage = infer_sillage(family)
    detail.features = [
        "Dạng chiết tiện mang theo mỗi ngày",
        "Phù hợp để test mùi trước khi mua chai lớn",
        "Đóng gói gọn gàng, dễ tặng quà hoặc mang đi du lịch",
    ]
    detail.specifications = {
        "Thương hiệu": brand,
        "Đối tượng": gender_label(item["target_gender"]),
        "Nhóm mùi": family,
        "Hình thức bán": "Nước hoa chiết",
        "Dung tích phổ biến": "5ml / 10ml / 20ml",
    }
    detail.hasARView = False
    detail.save()

    ProductVariant.objects(product=product).delete()
    for variant in variants:
        ProductVariant(
            product=product,
            size_ml=variant["size_ml"],
            price=variant["price"],
            original_price=variant["original_price"],
            stock_quantity=variant["stock_quantity"],
            sku=f"{slug}-{variant['size_ml']}ml",
            is_default=variant["is_default"],
            is_active=True,
        ).save()

    return name, status


def main() -> None:
    ensure_reference_data()

    created_count = 0
    updated_count = 0

    for item in PERFUME_SEED_DATA:
        _, status = upsert_perfume(item)
        if status == "created":
            created_count += 1
        else:
            updated_count += 1

    print(
        f"Da seed xong du lieu nuoc hoa: {len(PERFUME_SEED_DATA)} san pham "
        f"({created_count} moi, {updated_count} cap nhat)."
    )
    print(f"Brands: {Brand.objects.count()} | Categories: {Category.objects.count()}")
    print(f"Products: {Product.objects.count()} | Details: {ProductDetail.objects.count()} | Variants: {ProductVariant.objects.count()}")


if __name__ == "__main__":
    main()

