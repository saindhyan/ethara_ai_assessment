from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, EmailStr, field_validator



class ProductCreate(BaseModel):
    name: str
    sku: str
    price: Decimal
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_must_not_be_negative(cls, v):
        if v < 0:
            raise ValueError("Quantity cannot be negative")
        return v

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Price must be greater than zero")
        return v


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[Decimal] = None
    quantity: Optional[int] = None

    @field_validator("quantity")
    @classmethod
    def quantity_must_not_be_negative(cls, v):
        if v is not None and v < 0:
            raise ValueError("Quantity cannot be negative")
        return v


class ProductResponse(BaseModel):
    id: int
    name: str
    sku: str
    price: Decimal
    quantity: int
    created_at: datetime

    model_config = {"from_attributes": True}



class CustomerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str


class CustomerResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    created_at: datetime

    model_config = {"from_attributes": True}



class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Order quantity must be at least 1")
        return v


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate]


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    product: ProductResponse

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    total_amount: Decimal
    status: str
    created_at: datetime
    customer: CustomerResponse
    items: List[OrderItemResponse]

    model_config = {"from_attributes": True}



class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: List[ProductResponse]
