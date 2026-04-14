from mongoengine import CASCADE, Document, fields


class ProductVariant(Document):
    """
    Sellable decant size for a perfume product.

    Example:
    - Delina / 5ml
    - Delina / 10ml
    - Baccarat 540 / 20ml
    """

    meta = {
        "collection": "productvariants",
        "indexes": [
            "product",
            "sku",
            ("product", "size_ml"),
            "is_default",
        ],
    }

    product = fields.ReferenceField("Product", required=True, reverse_delete_rule=CASCADE)
    size_ml = fields.IntField(required=True, min_value=1, verbose_name="Dung tich chiet")
    price = fields.DecimalField(required=True, precision=2, force_string=True, verbose_name="Gia ban")
    original_price = fields.DecimalField(precision=2, force_string=True, verbose_name="Gia goc")
    stock_quantity = fields.IntField(default=0, min_value=0, verbose_name="Ton kho")
    sku = fields.StringField(unique=True, sparse=True, verbose_name="Ma bien the")
    is_default = fields.BooleanField(default=False, verbose_name="Bien the mac dinh")
    is_active = fields.BooleanField(default=True, verbose_name="Dang ban")

    def __str__(self):
        return f"<ProductVariant: {self.product.name} - {self.size_ml}ml>"
