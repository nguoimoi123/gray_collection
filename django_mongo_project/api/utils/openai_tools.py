from typing import Dict, List


perfume_variant_schema = {
    "type": "object",
    "properties": {
        "size_ml": {
            "type": "number",
            "description": "Dung tich chiet tinh theo ml, vi du 5, 10, 20"
        },
        "price": {
            "type": "number",
            "description": "Gia ban cua dung tich nay"
        },
        "original_price": {
            "type": "number",
            "description": "Gia goc neu co"
        },
        "stock_quantity": {
            "type": "number",
            "description": "So luong ton kho cho bien the nay"
        },
        "sku": {
            "type": "string",
            "description": "Ma SKU cua bien the"
        },
        "is_default": {
            "type": "boolean",
            "description": "Danh dau bien the mac dinh de hien thi gia chinh"
        }
    },
    "required": ["size_ml", "price"]
}


ADMIN_TOOLS: List[Dict] = [
    {
        "type": "function",
        "function": {
            "name": "add_product",
            "description": "Them mot san pham nuoc hoa chiet moi vao he thong Gray Collection",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Ten san pham hoac ten mui huong"},
                    "slug": {"type": "string", "description": "Slug than thien URL"},
                    "price": {"type": "number", "description": "Gia mac dinh neu chua tach bien the"},
                    "originalPrice": {"type": "number", "description": "Gia goc mac dinh neu co"},
                    "images": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Danh sach URL hinh anh cua san pham"
                    },
                    "mainImage": {"type": "string", "description": "Anh dai dien chinh"},
                    "category": {
                        "type": "string",
                        "description": "Loai san pham, vi du perfume-decant, discovery-set, gift-set"
                    },
                    "brand": {"type": "string", "description": "Thuong hieu nuoc hoa"},
                    "target_gender": {
                        "type": "string",
                        "enum": ["female", "male", "unisex"],
                        "description": "Doi tuong huong den cua mui huong"
                    },
                    "olfactory_family": {
                        "type": "string",
                        "description": "Nhom mui, vi du floral, woody, gourmand, fresh, citrus"
                    },
                    "mood_traits": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Tinh chat mui huong, vi du ngot ngao, quyen ru, thanh lich"
                    },
                    "short_description": {
                        "type": "string",
                        "description": "Mo ta ngan hien tren card hoac list"
                    },
                    "subtitle": {
                        "type": "string",
                        "description": "Dong mo ta phu cho trang chi tiet"
                    },
                    "description": {"type": "string", "description": "Mo ta day du ve san pham"},
                    "story": {"type": "string", "description": "Cau chuyen hoac tinh than cua mui huong"},
                    "top_notes": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Danh sach huong dau"
                    },
                    "heart_notes": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Danh sach huong giua"
                    },
                    "base_notes": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Danh sach huong cuoi"
                    },
                    "season": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Mua phu hop, vi du xuan, he, thu, dong"
                    },
                    "occasion": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Dip dung phu hop, vi du di lam, hen ho, tiec toi"
                    },
                    "longevity": {
                        "type": "string",
                        "description": "Do luu huong, vi du 6-8 gio"
                    },
                    "sillage": {
                        "type": "string",
                        "description": "Do toa huong, vi du gan, vua, xa"
                    },
                    "features": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Cac diem noi bat muon hien thi bo sung"
                    },
                    "specifications": {
                        "type": "object",
                        "description": "Thong tin bo sung dang key-value, vi du nong do, xuat xu, nam ra mat",
                        "additionalProperties": {"type": "string"}
                    },
                    "rating": {"type": "number", "description": "Danh gia sao"},
                    "reviewCount": {"type": "number", "description": "So luot danh gia"},
                    "isNew": {"type": "boolean", "description": "Danh dau san pham moi"},
                    "is_best_seller": {"type": "boolean", "description": "Danh dau ban chay"},
                    "is_limited": {"type": "boolean", "description": "Danh dau phien ban gioi han"},
                    "is_active": {"type": "boolean", "description": "San pham dang hoat dong"},
                    "inStock": {"type": "boolean", "description": "Con hang hay khong"},
                    "tags": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Tag bo sung, vi du best seller, new arrival"
                    },
                    "default_size_ml": {
                        "type": "number",
                        "description": "Dung tich mac dinh neu chua co danh sach bien the"
                    },
                    "variants": {
                        "type": "array",
                        "items": perfume_variant_schema,
                        "description": "Danh sach bien the dung tich chiet"
                    }
                },
                "required": ["name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_product",
            "description": "Cap nhat thong tin san pham nuoc hoa chiet da co",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_id": {
                        "type": "string",
                        "description": "ID, slug hoac ten san pham can cap nhat"
                    },
                    "name": {"type": "string"},
                    "slug": {"type": "string"},
                    "price": {"type": "number"},
                    "originalPrice": {"type": "number"},
                    "image": {"type": "string"},
                    "mainImage": {"type": "string"},
                    "images": {"type": "array", "items": {"type": "string"}},
                    "galleryImages": {"type": "array", "items": {"type": "string"}},
                    "category": {"type": "string"},
                    "brand": {"type": "string"},
                    "rating": {"type": "number"},
                    "reviewCount": {"type": "number"},
                    "isNew": {"type": "boolean"},
                    "inStock": {"type": "boolean"},
                    "target_gender": {
                        "type": "string",
                        "enum": ["female", "male", "unisex"]
                    },
                    "olfactory_family": {"type": "string"},
                    "mood_traits": {"type": "array", "items": {"type": "string"}},
                    "short_description": {"type": "string"},
                    "subtitle": {"type": "string"},
                    "description": {"type": "string"},
                    "story": {"type": "string"},
                    "top_notes": {"type": "array", "items": {"type": "string"}},
                    "heart_notes": {"type": "array", "items": {"type": "string"}},
                    "base_notes": {"type": "array", "items": {"type": "string"}},
                    "season": {"type": "array", "items": {"type": "string"}},
                    "occasion": {"type": "array", "items": {"type": "string"}},
                    "longevity": {"type": "string"},
                    "sillage": {"type": "string"},
                    "features": {"type": "array", "items": {"type": "string"}},
                    "specifications": {
                        "type": "object",
                        "additionalProperties": {"type": "string"}
                    },
                    "tags": {"type": "array", "items": {"type": "string"}},
                    "is_best_seller": {"type": "boolean"},
                    "is_limited": {"type": "boolean"},
                    "is_active": {"type": "boolean"},
                    "variants": {
                        "type": "array",
                        "items": perfume_variant_schema
                    }
                },
                "required": ["product_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_product",
            "description": "Xoa mot san pham khoi he thong",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_id": {
                        "type": "string",
                        "description": "ID, slug hoac ten san pham can xoa"
                    }
                },
                "required": ["product_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "approve_order",
            "description": "Duyet mot hoac nhieu don hang",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_ids": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Danh sach ID don can duyet. Truyen [] neu duyet tat ca don dang cho."
                    }
                },
                "required": ["order_ids"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_statistics",
            "description": "Lay thong ke tong quan, doanh thu, san pham va khach hang",
            "parameters": {
                "type": "object",
                "properties": {
                    "type": {
                        "type": "string",
                        "enum": ["overview", "revenue", "geographical", "products", "customers"]
                    },
                    "days": {"type": "number"},
                    "startDate": {"type": "string", "description": "Ngay bat dau YYYY-MM-DD"},
                    "endDate": {"type": "string", "description": "Ngay ket thuc YYYY-MM-DD"}
                },
                "required": ["type"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "navigate_page",
            "description": "Dieu huong giao dien admin sang trang tuong ung",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "enum": ["/", "/products", "/orders", "/users", "/chat"]
                    }
                },
                "required": ["path"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_orders_list",
            "description": "Lay danh sach don hang",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {"type": "string"},
                    "limit": {"type": "number"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_order_status",
            "description": "Cap nhat trang thai don hang",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_id": {"type": "string"},
                    "new_status": {"type": "string"}
                },
                "required": ["order_id", "new_status"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_users_list",
            "description": "Lay danh sach khach hang",
            "parameters": {
                "type": "object",
                "properties": {
                    "role": {"type": "string"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_user_role",
            "description": "Cap nhat quyen cua nguoi dung neu he thong ho tro",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"},
                    "new_role": {"type": "string"}
                },
                "required": ["user_id", "new_role"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_product_stock",
            "description": "Cap nhat nhanh tinh trang con hang cua san pham",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_id": {"type": "string"},
                    "in_stock": {"type": "boolean"}
                },
                "required": ["product_id", "in_stock"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "draw_chart",
            "description": "Ve bieu do tu du lieu thong ke that lay duoc tu tool get_statistics",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "type": {
                        "type": "string",
                        "enum": ["bar", "line", "pie"]
                    },
                    "data": {
                        "type": "array",
                        "items": {"type": "object"}
                    },
                    "xAxisKey": {"type": "string"},
                    "dataKeys": {
                        "type": "array",
                        "items": {"type": "string"}
                    },
                    "description": {"type": "string"}
                },
                "required": ["title", "type", "data", "xAxisKey", "dataKeys"]
            }
        }
    }
]
