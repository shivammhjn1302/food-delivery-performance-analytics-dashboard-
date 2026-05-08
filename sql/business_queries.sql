-- Query 1: Total revenue, profit, AOV and orders
SELECT COUNT(*) total_orders, SUM(final_price) revenue, SUM(profit) profit, AVG(final_price) aov FROM orders;

-- Query 2: Monthly revenue trend
SELECT DATE_TRUNC('month', order_time) month, COUNT(*) orders, SUM(final_price) revenue FROM orders GROUP BY 1 ORDER BY 1;

-- Query 3: Top 10 cities by revenue
SELECT delivery_city, COUNT(*) orders, SUM(final_price) revenue, AVG(delivery_duration) avg_delivery_time FROM orders GROUP BY delivery_city ORDER BY revenue DESC LIMIT 10;

-- Query 4: Top cuisines by revenue
SELECT r.cuisine, SUM(o.final_price) revenue, COUNT(*) orders FROM orders o JOIN restaurants r ON o.restaurant_id=r.restaurant_id GROUP BY r.cuisine ORDER BY revenue DESC;

-- Query 5: Cancellation rate by city
SELECT delivery_city, AVG(CASE WHEN order_status='Cancelled' THEN 1 ELSE 0 END) cancellation_rate FROM orders GROUP BY delivery_city ORDER BY cancellation_rate DESC;

-- Query 6: Average delivery time by traffic
SELECT traffic_level, AVG(delivery_duration) avg_delivery_time, AVG(delivery_delay) avg_delay FROM orders GROUP BY traffic_level;

-- Query 7: Weather impact on delay
SELECT weather, AVG(delivery_delay) avg_delay, AVG(customer_rating) avg_rating FROM orders GROUP BY weather ORDER BY avg_delay DESC;

-- Query 8: Top 20 restaurants by revenue
SELECT r.restaurant_name, r.cuisine, SUM(o.final_price) revenue FROM orders o JOIN restaurants r ON o.restaurant_id=r.restaurant_id GROUP BY r.restaurant_name,r.cuisine ORDER BY revenue DESC LIMIT 20;

-- Query 9: Restaurant rank within cuisine
WITH cuisine_rev AS (SELECT r.cuisine,r.restaurant_name,SUM(o.final_price) revenue FROM orders o JOIN restaurants r ON o.restaurant_id=r.restaurant_id GROUP BY 1,2) SELECT *, RANK() OVER(PARTITION BY cuisine ORDER BY revenue DESC) cuisine_rank FROM cuisine_rev;

-- Query 10: Customer lifetime value ranking
SELECT c.customer_id,c.city,c.loyalty_status,SUM(o.final_price) clv, NTILE(5) OVER(ORDER BY SUM(o.final_price) DESC) value_quintile FROM customers c JOIN orders o ON c.customer_id=o.customer_id GROUP BY 1,2,3;

-- Query 11: Retention cohort by signup month
WITH first_order AS (SELECT customer_id, MIN(DATE_TRUNC('month', order_time)) cohort_month FROM orders GROUP BY 1), activity AS (SELECT customer_id, DATE_TRUNC('month', order_time) active_month FROM orders GROUP BY 1,2) SELECT cohort_month, active_month, COUNT(*) active_customers FROM first_order f JOIN activity a USING(customer_id) GROUP BY 1,2 ORDER BY 1,2;

-- Query 12: Repeat customer rate
WITH c AS (SELECT customer_id, COUNT(*) orders FROM orders GROUP BY 1) SELECT AVG(CASE WHEN orders>1 THEN 1 ELSE 0 END) repeat_customer_rate FROM c;

-- Query 13: Peak hour order share
SELECT peak_hour_indicator, COUNT(*) orders, SUM(final_price) revenue FROM orders GROUP BY 1;

-- Query 14: Weekend vs weekday AOV
SELECT weekend_indicator, AVG(final_price) aov, COUNT(*) orders FROM orders GROUP BY 1;

-- Query 15: Payment method performance
SELECT payment_method, COUNT(*) orders, SUM(final_price) revenue, AVG(profit_margin) avg_margin FROM orders GROUP BY 1 ORDER BY revenue DESC;

-- Query 16: Delivery partner leaderboard
SELECT delivery_partner_id, COUNT(*) completed_orders, AVG(delivery_duration) avg_time, AVG(customer_rating) avg_rating FROM orders WHERE order_status='Delivered' GROUP BY 1 ORDER BY completed_orders DESC LIMIT 25;

-- Query 17: Low rated delivery partners
SELECT delivery_partner_id, AVG(customer_rating) avg_rating, COUNT(*) orders FROM orders GROUP BY 1 HAVING COUNT(*)>20 AND AVG(customer_rating)<3.5 ORDER BY avg_rating;

-- Query 18: High distance late deliveries
SELECT * FROM orders WHERE distance_km>10 AND delivery_delay>20 ORDER BY delivery_delay DESC;

-- Query 19: Discount impact on profit margin
SELECT CASE WHEN discount=0 THEN 'No Discount' WHEN discount/final_price<.1 THEN 'Low' WHEN discount/final_price<.25 THEN 'Medium' ELSE 'High' END discount_band, AVG(profit_margin) avg_margin, COUNT(*) orders FROM orders GROUP BY 1;

-- Query 20: Revenue bucket mix
SELECT revenue_bucket, COUNT(*) orders, SUM(final_price) revenue FROM orders GROUP BY revenue_bucket ORDER BY revenue DESC;

-- Query 21: City cuisine preference
SELECT delivery_city, r.cuisine, COUNT(*) orders, RANK() OVER(PARTITION BY delivery_city ORDER BY COUNT(*) DESC) cuisine_rank FROM orders o JOIN restaurants r ON o.restaurant_id=r.restaurant_id GROUP BY 1,2;

-- Query 22: Customer rating trend
SELECT DATE_TRUNC('month', order_time) month, AVG(customer_rating) avg_rating FROM orders GROUP BY 1 ORDER BY 1;

-- Query 23: Delayed order root-cause mix
SELECT weather, traffic_level, COUNT(*) delayed_orders FROM orders WHERE delivery_delay>0 GROUP BY 1,2 ORDER BY delayed_orders DESC;

-- Query 24: Profitability by cuisine
SELECT r.cuisine, SUM(o.profit) profit, AVG(o.profit_margin) margin FROM orders o JOIN restaurants r ON o.restaurant_id=r.restaurant_id GROUP BY 1 ORDER BY profit DESC;

-- Query 25: Monthly active customers
SELECT DATE_TRUNC('month', order_time) month, COUNT(DISTINCT customer_id) active_customers FROM orders GROUP BY 1 ORDER BY 1;

-- Query 26: Top customers contributing revenue
WITH rev AS (SELECT customer_id, SUM(final_price) revenue FROM orders GROUP BY 1), total AS (SELECT SUM(revenue) total_revenue FROM rev) SELECT customer_id, revenue, revenue/(SELECT total_revenue FROM total) revenue_share FROM rev ORDER BY revenue DESC LIMIT 100;

-- Query 27: Rolling 7-day revenue
SELECT order_date, revenue, AVG(revenue) OVER(ORDER BY order_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) rolling_7d_revenue FROM (SELECT CAST(order_time AS DATE) order_date, SUM(final_price) revenue FROM orders GROUP BY 1) d;

-- Query 28: Partner vehicle performance
SELECT dp.vehicle_type, COUNT(o.order_id) orders, AVG(o.delivery_duration) avg_time, AVG(o.delivery_efficiency_score) avg_efficiency FROM orders o JOIN delivery_partners dp ON o.delivery_partner_id=dp.partner_id GROUP BY 1;

-- Query 29: Restaurants with high cancellation
SELECT r.restaurant_name, COUNT(*) orders, AVG(CASE WHEN o.order_status='Cancelled' THEN 1 ELSE 0 END) cancel_rate FROM orders o JOIN restaurants r ON o.restaurant_id=r.restaurant_id GROUP BY 1 HAVING COUNT(*)>30 ORDER BY cancel_rate DESC LIMIT 25;

-- Query 30: Customer segmentation CASE WHEN
SELECT customer_id, SUM(final_price) clv, CASE WHEN SUM(final_price)>=5000 THEN 'VIP' WHEN SUM(final_price)>=2000 THEN 'High Value' WHEN COUNT(*)>=3 THEN 'Repeat' ELSE 'New/Low' END customer_segment FROM orders GROUP BY customer_id;
