import * as customerService from "./customer.service.js";

export async function list(req, res) {
    res.json({ data: await customerService.list() });
}

export async function get(req, res) {
    res.json({ data: await customerService.get(req.validated.params.id) });
}

export async function create(req, res) {
    const customer = await customerService.create(req.validated.body);
    res.status(201).location(`${req.baseUrl}/${customer.customer_id}`).json({ data: customer });
}

export async function update(req, res) {
    const customer = await customerService.update(req.validated.params.id, req.validated.body);
    res.json({ data: customer });
}

export async function remove(req, res) {
    await customerService.remove(req.validated.params.id);
    res.status(204).end();
}
