from mongoengine import Document, fields


class Product(Document):
    """
    Core perfume identity model.

    This model has been refactored for the perfume decant domain while keeping
    a few legacy fields (`originalPrice`, `image`, `category`, `brand`, `isNew`)
    so the current services and serializers do not break during migration.
    """

    meta = {
        "collection": "products",
        "indexes": [
            "slug",
            "brand",
            "category",
            "target_gender",
            "olfactory_family",
            "isNew",
            "is_best_seller",
            "is_active",
        ],
    }

    # Core identity
    name = fields.StringField(required=True, max_length=255, verbose_name="Ten san pham")
    slug = fields.StringField(unique=True, sparse=True, verbose_name="Duong dan than thien")

    # Legacy-compatible list/card fields
    price = fields.DecimalField(required=True, precision=2, force_string=True, verbose_name="Gia mac dinh")
    originalPrice = fields.DecimalField(precision=2, force_string=True, verbose_name="Gia goc mac dinh")
    image = fields.URLField(required=True, verbose_name="Anh dai dien")
    rating = fields.FloatField(min_value=0, max_value=5, default=0, verbose_name="Danh gia trung binh")
    category = fields.StringField(required=True, default="perfume-decant", verbose_name="Loai san pham")
    brand = fields.StringField(required=True, verbose_name="Thuong hieu")
    isNew = fields.BooleanField(default=False, verbose_name="San pham moi")

    # Perfume-specific fields
    target_gender = fields.StringField(
        choices=("female", "male", "unisex"),
        default="unisex",
        verbose_name="Doi tuong su dung",
    )
    olfactory_family = fields.StringField(verbose_name="Nhom mui")
    mood_traits = fields.ListField(fields.StringField(), default=list, verbose_name="Tinh chat mui")
    short_description = fields.StringField(verbose_name="Mo ta ngan")
    main_image = fields.URLField(verbose_name="Anh chinh theo domain moi")
    is_best_seller = fields.BooleanField(default=False, verbose_name="Ban chay")
    is_limited = fields.BooleanField(default=False, verbose_name="Phien ban gioi han")
    is_active = fields.BooleanField(default=True, verbose_name="Dang kinh doanh")
    tags = fields.ListField(fields.StringField(), default=list, verbose_name="Tag hien thi")

    def clean(self):
        # Keep legacy and new image fields in sync during migration.
        if not self.main_image and self.image:
            self.main_image = self.image
        if not self.image and self.main_image:
            self.image = self.main_image

    def save(self, *args, **kwargs):
        self.clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"<Product: {self.name}>"
