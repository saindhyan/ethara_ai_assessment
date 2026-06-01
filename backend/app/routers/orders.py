from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Order, OrderItem, Product, Customer
from app.schemas import OrderCreate, OrderResponse

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    # Make sure the customer exists
    customer = db.query(Customer).filter(Customer.id == order_data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if not order_data.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")

    total_amount = 0
    order_items_to_create = []

    # Validate every item and check stock before touching anything
    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with id {item.product_id} not found")

        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.quantity}, Requested: {item.quantity}"
            )

        total_amount += float(product.price) * item.quantity
        order_items_to_create.append((product, item.quantity, float(product.price)))

    # All checks passed — now create the order and deduct stock
    order = Order(
        customer_id=order_data.customer_id,
        total_amount=round(total_amount, 2)
    )
    db.add(order)
    db.flush()  # get order.id without committing yet

    for product, qty, unit_price in order_items_to_create:
        db.add(OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=qty,
            unit_price=unit_price
        ))
        product.quantity -= qty  # reduce stock

    db.commit()
    db.refresh(order)
    return order


@router.get("", response_model=List[OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    return db.query(Order).order_by(Order.created_at.desc()).all()


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Restore the stock when an order is cancelled
    for item in order.items:
        item.product.quantity += item.quantity

    db.delete(order)
    db.commit()
