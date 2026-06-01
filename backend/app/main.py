import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.database import engine, Base
from app.routers import products, customers, orders
from app import models  # noqa: F401 — needed so SQLAlchemy registers all models before create_all

load_dotenv()

# Create tables on startup (fine for this project scope)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory & Order Management API", version="1.0.0")

# Allow the frontend origin — configured via env var so it works both locally and deployed
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tightened via env in production if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)


@app.get("/")
def root():
    return {"message": "Inventory & Order Management API is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


# Dashboard stats endpoint
from sqlalchemy.orm import Session
from fastapi import Depends
from app.database import get_db
from app.models import Product, Customer, Order
from app.schemas import DashboardStats


@app.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_products = db.query(Product).count()
    total_customers = db.query(Customer).count()
    total_orders = db.query(Order).count()

    # Low stock = quantity under 10
    low_stock = db.query(Product).filter(Product.quantity < 10).order_by(Product.quantity).all()

    return DashboardStats(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_products=low_stock,
    )
