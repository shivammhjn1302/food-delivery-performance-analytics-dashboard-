import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from pathlib import Path

st.set_page_config(page_title="Food Delivery Analytics", page_icon="🍔", layout="wide")
BASE = Path(__file__).resolve().parents[1]

@st.cache_data
def load_data():
    orders = pd.read_csv(BASE / "data/cleaned/orders_cleaned.csv", parse_dates=["Order_Time", "Delivery_Time"])
    customers = pd.read_csv(BASE / "data/cleaned/customers_cleaned.csv", parse_dates=["Signup_Date"])
    restaurants = pd.read_csv(BASE / "data/cleaned/restaurants_cleaned.csv")
    partners = pd.read_csv(BASE / "data/cleaned/delivery_partners_cleaned.csv")
    return orders, customers, restaurants, partners

orders, customers, restaurants, partners = load_data()

st.markdown("""
<style>
.stApp {background: linear-gradient(135deg,#070712,#10162f); color:#f8fbff;}
[data-testid="stMetricValue"] {color:#00f5ff;}
.block-container {padding-top: 1.5rem;}
</style>
""", unsafe_allow_html=True)

st.title("🍔 Food Delivery Performance & Customer Analytics")
st.caption("Executive analytics dashboard for delivery operations, customer value, revenue, and restaurant performance.")

with st.sidebar:
    st.header("Filters")
    cities = st.multiselect("City", sorted(orders["Delivery_City"].dropna().unique()), default=sorted(orders["Delivery_City"].dropna().unique()))
    statuses = st.multiselect("Order Status", sorted(orders["Order_Status"].dropna().unique()), default=sorted(orders["Order_Status"].dropna().unique()))
    traffic = st.multiselect("Traffic", sorted(orders["Traffic_Level"].dropna().unique()), default=sorted(orders["Traffic_Level"].dropna().unique()))
    date_range = st.date_input("Order date range", [orders.Order_Time.min().date(), orders.Order_Time.max().date()])

filtered = orders[
    orders.Delivery_City.isin(cities) & orders.Order_Status.isin(statuses) & orders.Traffic_Level.isin(traffic)
].copy()
if len(date_range) == 2:
    start, end = pd.to_datetime(date_range[0]), pd.to_datetime(date_range[1])
    filtered = filtered[(filtered.Order_Time.dt.date >= start.date()) & (filtered.Order_Time.dt.date <= end.date())]

k1,k2,k3,k4,k5 = st.columns(5)
k1.metric("Revenue", f"₹{filtered.Final_Price.sum()/1e6:.2f}M")
k2.metric("Orders", f"{len(filtered):,}")
k3.metric("AOV", f"₹{filtered.Final_Price.mean():.0f}")
k4.metric("Avg Delivery", f"{filtered.Delivery_Duration.mean():.1f} min")
k5.metric("Cancel Rate", f"{(filtered.Order_Status.eq('Cancelled').mean()*100):.1f}%")

monthly = filtered.set_index("Order_Time").resample("M").agg(Revenue=("Final_Price","sum"), Orders=("Order_ID","count"), Profit=("Profit","sum")).reset_index()
fig = px.line(monthly, x="Order_Time", y=["Revenue","Profit"], title="Revenue & Profit Trend", template="plotly_dark")
st.plotly_chart(fig, use_container_width=True)

c1,c2 = st.columns(2)
with c1:
    city_perf = filtered.groupby("Delivery_City", as_index=False).agg(Revenue=("Final_Price","sum"), Orders=("Order_ID","count"), Avg_Delivery=("Delivery_Duration","mean"))
    st.plotly_chart(px.bar(city_perf.sort_values("Revenue", ascending=False), x="Delivery_City", y="Revenue", color="Avg_Delivery", title="City Performance", template="plotly_dark"), use_container_width=True)
with c2:
    st.plotly_chart(px.box(filtered, x="Traffic_Level", y="Delivery_Duration", color="Traffic_Level", title="Delivery Duration by Traffic", template="plotly_dark"), use_container_width=True)

orders_rest = filtered.merge(restaurants[["Restaurant_ID","Restaurant_Name","Cuisine"]], on="Restaurant_ID", how="left")
c1,c2 = st.columns(2)
with c1:
    cuisine = orders_rest.groupby("Cuisine", as_index=False).agg(Revenue=("Final_Price","sum"), Orders=("Order_ID","count")).sort_values("Revenue", ascending=False).head(12)
    st.plotly_chart(px.treemap(cuisine, path=["Cuisine"], values="Revenue", color="Orders", title="Cuisine Revenue Mix", template="plotly_dark"), use_container_width=True)
with c2:
    top_rest = orders_rest.groupby("Restaurant_Name", as_index=False).agg(Revenue=("Final_Price","sum"), Orders=("Order_ID","count")).sort_values("Revenue", ascending=False).head(15)
    st.plotly_chart(px.bar(top_rest, x="Revenue", y="Restaurant_Name", orientation="h", title="Top Restaurants", template="plotly_dark"), use_container_width=True)

st.subheader("Customer Analytics")
customer_orders = filtered.groupby("Customer_ID", as_index=False).agg(Orders=("Order_ID","count"), Revenue=("Final_Price","sum"), Avg_Spend=("Final_Price","mean"))
st.plotly_chart(px.histogram(customer_orders, x="Revenue", nbins=40, title="Customer Lifetime Value Distribution", template="plotly_dark"), use_container_width=True)

st.subheader("Download filtered data")
st.download_button("Download CSV", filtered.to_csv(index=False), "filtered_food_delivery_orders.csv", "text/csv")
