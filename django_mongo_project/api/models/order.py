# api/models/order.py
from datetime import datetime
from typing import Any

from mongoengine import Document, EmbeddedDocument, fields

from api.models.customer import Customer


class OrderItem(EmbeddedDocument):
    product_id = fields.StringField(required=False)
    product_name = fields.StringField(required=False)
    product_image = fields.URLField(required=False)
    variant_size_ml = fields.IntField(required=False, min_value=1)
    variant_label = fields.StringField(required=False)
    quantity = fields.IntField(required=True, min_value=1)
    unit_price = fields.DecimalField(required=False, precision=2, force_string=True)
    meta = {"strict": False}


class Order(Document):
    STATUS_CHOICES = ["Cho Xac Nhan", "Dang Xu Ly", "Cho Thanh Toan", "Dang Van Chuyen", "Da Giao", "Da Huy"]
    PAYMENT_METHOD_CHOICES = ["cod", "momo", "vnpay"]
    PAYMENT_STATUS_CHOICES = ["pending", "paid", "failed"]

    customer = fields.ReferenceField(Customer, required=True)
    items = fields.ListField(fields.EmbeddedDocumentField(OrderItem))
    total_price = fields.DecimalField(required=True, precision=2)
    status = fields.StringField(required=True, choices=STATUS_CHOICES, default="Cho Xac Nhan")
    payment_method = fields.StringField(required=True, choices=PAYMENT_METHOD_CHOICES, default="cod")
    payment_status = fields.StringField(choices=PAYMENT_STATUS_CHOICES, default="pending")
    shipping_address = fields.StringField(required=True)
    city = fields.StringField(required=True)
    province = fields.StringField(required=True)
    postal_code = fields.StringField(required=True)
    phone = fields.StringField(required=True)
    stock_deducted = fields.BooleanField(default=False)
    created_at = fields.DateTimeField(default=datetime.utcnow, required=True)
    updated_at = fields.DateTimeField(default=datetime.utcnow, required=True)

    meta = {
        "collection": "orders",
        "indexes": [
            "customer",
            "payment_status",
            "payment_method",
            "stock_deducted",
        ],
    }

    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)

    def __str__(self):
        order_id = getattr(self, "id", None) or getattr(self, "pk", "Unknown")
        customer_obj: Any = getattr(self, "customer", None)
        customer_email = getattr(customer_obj, "email", "Unknown")
        return f"Order {order_id} by {customer_email}"
