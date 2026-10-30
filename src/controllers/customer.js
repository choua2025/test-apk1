import pool from "../configs/db.js";

export const getDataCustomers = async (req, res) => {
  try {
    const result = await pool.query(
        `select c.id, c.name, c.email, o.id as order_id, o.order_date, o.status, p.id as product_id, p.name as product_name, p.price, oi.quantity, p.category 
        from orders o
        join customers c on o.customer_id = c.id 
        join order_items oi on oi.order_id = o.id
        join products p on p.id = oi.product_id
        group by c.id, o.id, p.id, oi.id`    
    );
    res.json(result.rows);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getCustomerList = async (req, res) => {
  try {
    const result = await pool.query("select * from customers order by id");
    res.json(result.rows);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const result = await pool.query("select * from customers where id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { name, email,city} = req.body ?? {};
    if (!name || !email || !city) {
      return res.status(400).json({ error: "name, email, and city are required" });
    }
    const result = await pool.query(
      "insert into customers (name, email, city) values ($1, $2, $3) returning *",
      [name, email, city]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log(error.message);
    if (error.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { name, email, city } = req.body ?? {};
    if (name === undefined && email === undefined && city === undefined) {
      return res.status(400).json({ error: "name, email, or city is required" });
    }
    const result = await pool.query(
      `update customers
       set name = coalesce($1, name), email = coalesce($2, email), city = coalesce($3, city)
       where id = $4 returning *`,
      [name ?? null, email ?? null, city ?? null, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.log(error.message);
    if (error.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const result = await pool.query(
      "delete from customers where id = $1 returning *",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json({ message: "Customer deleted", customer: result.rows[0] });
  } catch (error) {
    console.log(error.message);
    if (error.code === "23503") {
      return res
        .status(409)
        .json({ error: "Customer has orders and cannot be deleted" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getDataOrders = async (req, res) => {
  try {
    const result = await pool.query("select * from orders");
    res.json(result.rows);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getDataOrderItem = async (req, res) => {
  try {
    const result = await pool.query("select * from order_items");
    res.json(result.rows);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


