import HttpError from "../../utils/HttpError.js";
import * as repo from "./customer.repository.js";

const notFound = () => HttpError.notFound("Customer not found");

export function list() {
    return repo.findAll();
}

export async function get(id) {
    const customer = await repo.findById(id);
    if (!customer) throw notFound();
    return customer;
}

export function create({ customer_name }) {
    return repo.create(customer_name);
}

export async function update(id, { customer_name }) {
    if (!(await repo.update(id, customer_name))) throw notFound();
    return { customer_id: id, customer_name };
}

export async function remove(id) {
    if (!(await repo.remove(id))) throw notFound();
}
