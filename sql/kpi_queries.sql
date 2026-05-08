-- KPI Queries for BI Dashboard
SELECT SUM(final_price) AS total_revenue FROM orders;
SELECT SUM(profit) AS total_profit FROM orders;
SELECT COUNT(*) AS total_orders FROM orders;
SELECT AVG(final_price) AS average_order_value FROM orders;
SELECT AVG(delivery_duration) AS average_delivery_time FROM orders;
SELECT AVG(CASE WHEN delivery_delay > 0 THEN 1 ELSE 0 END) AS delayed_order_rate FROM orders;
SELECT AVG(CASE WHEN order_status = 'Cancelled' THEN 1 ELSE 0 END) AS cancellation_rate FROM orders;
SELECT AVG(customer_rating) AS average_customer_rating FROM orders;
SELECT COUNT(DISTINCT customer_id) AS active_customers FROM orders;
SELECT COUNT(DISTINCT restaurant_id) AS active_restaurants FROM orders;
