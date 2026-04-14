import json
from datetime import datetime
from typing import Any

from api.services.order_service import approve_multiple_orders  # type: ignore
from api.services.order_statistics_service import OrderStatisticsService  # type: ignore
from api.services.product_service import add_product, delete_product, update_product  # type: ignore


def _objects(model: Any) -> Any:
    """
    MongoEngine exposes `objects` dynamically; help Pylance understand this access.
    """
    return model.objects


def _has_pricing_information(payload: dict[str, Any]) -> bool:
    if payload.get("price") not in (None, ""):
        return True

    variants = payload.get("variants")
    if isinstance(variants, list):
        return any(isinstance(item, dict) and item.get("price") not in (None, "") for item in variants)

    return False


def _validate_add_product_payload(payload: dict[str, Any]) -> list[str]:
    missing_fields = []
    if not payload.get("name"):
        missing_fields.append("ten san pham")
    if not payload.get("images"):
        missing_fields.append("hinh anh san pham")
    if not _has_pricing_information(payload):
        missing_fields.append("gia san pham hoac variants")
    return missing_fields


def handle_admin_command(ai_response_string):
    try:
        action_data = json.loads(ai_response_string)
        print(f"[ADMIN JSON] Parsed payload: {action_data}")

        action = action_data.get("action")
        payload = action_data.get("payload", {})

        if action == "add_product":
            missing_fields = _validate_add_product_payload(payload)
            if missing_fields:
                return {
                    "success": False,
                    "action": "add_product",
                    "error": f"De them san pham, vui long cung cap: {', '.join(missing_fields)}.",
                }
            return add_product(payload)

        if action == "update_product":
            return update_product(payload)

        if action == "delete_product":
            product_id = payload.get("product_id")
            if not product_id:
                return {
                    "success": False,
                    "action": "delete_product",
                    "error": "De xoa san pham, vui long cung cap ID, slug hoac ten san pham.",
                }
            return delete_product(product_id)

        if action == "approve_order":
            return approve_multiple_orders(payload.get("order_ids", []))

        if action == "statistics":
            stats_type = payload.get("type", "overview")
            days = payload.get("days", 30)
            format_type = payload.get("format", "json")

            stats_service = OrderStatisticsService()

            if stats_type == "overview":
                stats_data = stats_service.get_overview_statistics()
            elif stats_type == "revenue":
                stats_data = stats_service.get_revenue_statistics(days)
            elif stats_type == "geographical":
                stats_data = stats_service.get_geographical_statistics()
            elif stats_type == "products":
                stats_data = stats_service.get_product_statistics()
            elif stats_type == "customers":
                stats_data = stats_service.get_customer_statistics()
            else:
                return {
                    "success": False,
                    "action": "statistics",
                    "error": f"Loai thong ke khong hop le: {stats_type}",
                }

            if format_type == "summary":
                return {
                    "success": True,
                    "action": "statistics",
                    "answer": create_statistics_summary(stats_type, stats_data),
                }

            return {"success": True, "action": "statistics", "message": stats_data}

        if action == "none":
            message = payload.get("message", "Yeu cau khong ro rang hoac khong phu hop voi nghiep vu admin.")
            return {"success": False, "action": "none", "error": message}

        return {"success": False, "action": "none", "error": f"Hanh dong khong hop le: {action}"}

    except json.JSONDecodeError:
        return {"success": False, "action": "none", "error": "Phan hoi tu AI khong phai JSON hop le."}
    except Exception as exc:
        return {"success": False, "action": "none", "error": f"Da xay ra loi may chu: {exc}"}


def create_statistics_summary(stats_type, stats_data):
    if stats_type == "overview":
        return f"""
        **Tong quan don hang:**
        - Tong so don hang: {stats_data.get('total_orders', 0)}
        - Tong doanh thu: {stats_data.get('total_revenue', 0):,}
        - Gia tri don hang trung binh: {stats_data.get('avg_order_value', 0):,}
        - Don hang hom nay: {stats_data.get('time_periods', {}).get('today', 0)}
        - Don hang tuan nay: {stats_data.get('time_periods', {}).get('this_week', 0)}
        - Don hang thang nay: {stats_data.get('time_periods', {}).get('this_month', 0)}
        """

    if stats_type == "revenue":
        current = stats_data.get("current_period", {})
        previous = stats_data.get("previous_period", {})
        growth = stats_data.get("growth_rate", 0)
        return f"""
        **Thong ke doanh thu {stats_data.get('period', '30 ngay')}:**
        - Doanh thu ky hien tai: {current.get('total_revenue', 0):,}
        - Doanh thu ky truoc: {previous.get('total_revenue', 0):,}
        - Tang truong: {growth:.2f}%
        - So don hang ky hien tai: {current.get('total_orders', 0)}
        - Gia tri don hang trung binh: {current.get('avg_order_value', 0):,}
        """

    if stats_type == "products":
        top_by_quantity = stats_data.get("top_by_quantity", [])
        top_by_revenue = stats_data.get("top_by_revenue", [])

        summary_lines = ["**San pham ban chay:**"]
        for item in top_by_quantity[:3]:
            summary_lines.append(f"- {item.get('name', 'N/A')}: {item.get('quantity', 0)} san pham")

        summary_lines.append("")
        summary_lines.append("**San pham doanh thu cao:**")
        for item in top_by_revenue[:3]:
            summary_lines.append(f"- {item.get('name', 'N/A')}: {item.get('revenue', 0):,}")

        return "\n".join(summary_lines)

    if stats_type == "customers":
        total_customers = stats_data.get("total_customers", 0)
        new_vs_returning = stats_data.get("new_vs_returning", {})
        top_by_revenue = stats_data.get("top_by_revenue", [])

        summary_lines = [
            "**Thong ke khach hang:**",
            f"- Tong so khach hang: {total_customers}",
            f"- Khach hang moi: {new_vs_returning.get('new_customers', 0)} ({new_vs_returning.get('new_percentage', 0):.1f}%)",
            f"- Khach hang quay lai: {new_vs_returning.get('returning_customers', 0)}",
            "",
            "**Khach hang gia tri cao:**",
        ]
        for item in top_by_revenue[:3]:
            summary_lines.append(f"- {item.get('name', 'N/A')}: {item.get('total_revenue', 0):,}")
        return "\n".join(summary_lines)

    return f"Da lay thong ke loai {stats_type} thanh cong."


def execute_tool_call(action, payload):
    try:
        print(f"[EXECUTE TOOL] Action: {action} - Payload: {payload}")

        if action == "add_product":
            missing = _validate_add_product_payload(payload)
            if missing:
                return {
                    "success": False,
                    "action": action,
                    "error": f"Vui long cung cap: {', '.join(missing)}",
                }
            return add_product(payload)

        if action == "update_product":
            if not payload.get("product_id"):
                return {
                    "success": False,
                    "action": action,
                    "error": "Vui long cung cap ID, slug hoac ten san pham can cap nhat.",
                }
            return update_product(payload)

        if action == "delete_product":
            product_id = payload.get("product_id")
            if not product_id:
                return {
                    "success": False,
                    "action": action,
                    "error": "Vui long cung cap ID, slug hoac ten san pham can xoa.",
                }
            return delete_product(product_id)

        if action == "approve_order":
            return approve_multiple_orders(payload.get("order_ids", []))

        if action == "get_statistics":
            stats_type = payload.get("type", "overview")
            days = payload.get("days", 30)
            start_date_str = payload.get("startDate")
            end_date_str = payload.get("endDate")

            kwargs = {}
            if start_date_str or end_date_str:
                if start_date_str:
                    try:
                        kwargs["start_date"] = datetime.strptime(start_date_str, "%Y-%m-%d")
                    except ValueError:
                        pass
                if end_date_str:
                    try:
                        end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
                        kwargs["end_date"] = end_date.replace(hour=23, minute=59, second=59)
                    except ValueError:
                        pass
            else:
                kwargs["days"] = days

            stats_service = OrderStatisticsService()
            if stats_type == "overview":
                stats_data = stats_service.get_overview_statistics()
            elif stats_type == "revenue":
                stats_data = stats_service.get_revenue_statistics(**kwargs)
            elif stats_type == "geographical":
                stats_data = stats_service.get_geographical_statistics()
            elif stats_type == "products":
                stats_data = stats_service.get_product_statistics()
            elif stats_type == "customers":
                stats_data = stats_service.get_customer_statistics()
            else:
                return {"success": False, "action": "statistics", "error": "Invalid type parameter"}

            return {
                "success": True,
                "action": "statistics",
                "answer": create_statistics_summary(stats_type, stats_data),
                "raw_data": stats_data,
            }

        if action == "navigate_page":
            path = payload.get("path")
            return {
                "success": True,
                "action": "navigate",
                "payload": {"path": path},
                "message": f"Dang chuyen huong den {path}",
            }

        if action == "get_orders_list":
            status = payload.get("status")
            limit = payload.get("limit", 10)
            from api.models.order import Order  # type: ignore

            try:
                if status:
                    orders = _objects(Order)(status__iexact=status).order_by("-created_at").limit(limit)
                else:
                    orders = _objects(Order)().order_by("-created_at").limit(limit)

                order_list = []
                for order in orders:
                    customer_name = "Unknown"
                    if order.customer:
                        customer_name = f"{order.customer.first_name} {order.customer.last_name}"

                    order_list.append(
                        {
                            "id": str(order.id),
                            "customerName": customer_name,
                            "phone": order.phone,
                            "status": order.status,
                            "total": str(order.total_price),
                            "paymentMethod": order.payment_method,
                            "date": order.created_at.strftime("%Y-%m-%d %H:%M") if order.created_at else "",
                        }
                    )
                return {
                    "success": True,
                    "action": "get_orders_list",
                    "message": "Da lay danh sach don hang thanh cong",
                    "answer": json.dumps(order_list, ensure_ascii=False),
                }
            except Exception as exc:
                return {"success": False, "action": "get_orders_list", "error": f"Loi truy van: {exc}"}

        if action == "update_order_status":
            order_id = payload.get("order_id")
            new_status = payload.get("new_status")
            if not order_id or not new_status:
                return {
                    "success": False,
                    "action": action,
                    "error": "Thieu ID don hang hoac trang thai moi",
                }

            from api.models.order import Order  # type: ignore

            try:
                order = _objects(Order)(id=order_id).first()
                if not order:
                    return {"success": False, "action": action, "error": f"Khong tim thay don hang {order_id}"}
                order.status = new_status
                order.save()
                return {
                    "success": True,
                    "action": action,
                    "message": f"Da cap nhat don hang {order_id} thanh {new_status}",
                }
            except Exception as exc:
                return {"success": False, "action": action, "error": f"Loi cap nhat: {exc}"}

        if action == "get_users_list":
            from api.models.customer import Customer  # type: ignore

            try:
                users = _objects(Customer)().limit(20)
                user_list = [
                    {
                        "id": str(user.id),
                        "name": f"{user.first_name} {user.last_name}",
                        "email": user.email,
                        "role": "N/A",
                        "phone": getattr(user, "phone", ""),
                    }
                    for user in users
                ]
                return {
                    "success": True,
                    "action": "get_users_list",
                    "message": "Da lay danh sach khach hang",
                    "answer": json.dumps(user_list, ensure_ascii=False),
                }
            except Exception as exc:
                return {"success": False, "action": "get_users_list", "error": f"Loi truy van: {exc}"}

        if action == "update_user_role":
            user_id = payload.get("user_id")
            new_role = payload.get("new_role")
            if not user_id or not new_role:
                return {"success": False, "action": action, "error": "Thieu ID hoac role moi"}

            from api.models.customer import Customer  # type: ignore
            from bson.errors import InvalidId  # type: ignore

            try:
                user = None
                try:
                    user = _objects(Customer)(id=user_id).first()
                except InvalidId:
                    user = _objects(Customer)(email=user_id).first() or _objects(Customer)(first_name__icontains=user_id).first()

                if not user:
                    return {"success": False, "action": action, "error": f"Khong tim thay nguoi dung {user_id}"}

                return {
                    "success": True,
                    "action": action,
                    "message": f"He thong chua luu role rieng cho Customer. Da ghi nhan yeu cau cap quyen {new_role} cho {user.first_name}.",
                }
            except Exception as exc:
                return {"success": False, "action": action, "error": f"Loi cap nhat: {exc}"}

        if action == "update_product_stock":
            product_id = payload.get("product_id")
            in_stock = payload.get("in_stock")
            if not product_id or in_stock is None:
                return {
                    "success": False,
                    "action": action,
                    "error": "Thieu thong tin san pham hoac trang thai ton kho",
                }

            from api.models.product import Product  # type: ignore
            from api.models.productdetail import ProductDetail  # type: ignore
            from bson.errors import InvalidId  # type: ignore

            try:
                product = _objects(Product)(name__iexact=product_id).first() or _objects(Product)(slug=product_id).first()
                if not product:
                    try:
                        product = _objects(Product)(id=product_id).first()
                    except InvalidId:
                        return {"success": False, "action": action, "error": "Khong tim thay san pham"}

                detail = _objects(ProductDetail)(product=product).first()
                if not detail:
                    return {"success": False, "action": action, "error": "San pham nay khong co ban ghi chi tiet"}

                detail.inStock = in_stock
                detail.save()
                status_text = "Con hang" if in_stock else "Het hang"
                return {
                    "success": True,
                    "action": action,
                    "message": f"San pham {product.name} da cap nhat kho thanh: {status_text}",
                }
            except Exception as exc:
                return {"success": False, "action": action, "error": f"Loi cap nhat kho: {exc}"}

        if action == "draw_chart":
            result = {
                "success": True,
                "action": "draw_chart",
                "answer": payload.get("description", "Duoi day la bieu do ban yeu cau:"),
            }
            result.update(payload)
            return result

        return {"success": False, "action": "none", "error": f"Hanh dong khong hop le: {action}"}

    except Exception as exc:
        print(f"[EXECUTE TOOL] Error while executing {action}: {exc}")
        return {"success": False, "action": action, "error": f"Loi thuc thi du lieu may chu: {exc}"}
