from mongoengine import CASCADE, Document, fields


class ProductDetail(Document):
    """
    Detailed perfume content for the product detail page.

    Legacy fields (`features`, `specifications`, `hasARView`) are kept for
    compatibility with current admin/product services while the project is
    migrating away from the old tech-product domain.
    """

    meta = {
        "collection": "productdetails",
        "indexes": ["product", "inStock"],
    }

    product = fields.ReferenceField("Product", required=True, unique=True, reverse_delete_rule=CASCADE)

    # Gallery / shared detail fields
    images = fields.ListField(fields.URLField(), default=list, verbose_name="Danh sach anh")
    rating = fields.FloatField(min_value=0, max_value=5, default=0.0)
    reviewCount = fields.IntField(min_value=0, default=0)
    description = fields.StringField()
    inStock = fields.BooleanField(default=True, verbose_name="Con hang")

    # Perfume-specific detail fields
    subtitle = fields.StringField(verbose_name="Dong mo ta phu")
    story = fields.StringField(verbose_name="Cau chuyen mui huong")
    top_notes = fields.ListField(fields.StringField(), default=list, verbose_name="Huong dau")
    heart_notes = fields.ListField(fields.StringField(), default=list, verbose_name="Huong giua")
    base_notes = fields.ListField(fields.StringField(), default=list, verbose_name="Huong cuoi")
    season = fields.ListField(fields.StringField(), default=list, verbose_name="Mua phu hop")
    occasion = fields.ListField(fields.StringField(), default=list, verbose_name="Dip phu hop")
    longevity = fields.StringField(verbose_name="Do luu huong")
    sillage = fields.StringField(verbose_name="Do toa huong")

    # Backward-compatible fields from the old domain
    features = fields.ListField(fields.StringField(), default=list, verbose_name="Danh sach dac diem")
    specifications = fields.DictField(field=fields.StringField(), default=dict, verbose_name="Thong so bo sung")
    hasARView = fields.BooleanField(default=False, verbose_name="Legacy field")

    def __str__(self):
        return f"<ProductDetail: {self.product.name}>"
