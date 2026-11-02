import bcrypt from "bcrypt";
import env from "../../config/env.js";
import HttpError from "../../utils/HttpError.js";
import * as repo from "./auth.repository.js";
import { signToken } from "./auth.token.js";

// Compared against when the user doesn't exist, so "unknown user" and
// "wrong password" take the same time and can't be told apart.
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", env.BCRYPT_ROUNDS);

export function hasAnyMember() {
    return repo.hasAnyMember();
}

export async function register({ member_name, member_password }) {
    const hash = await bcrypt.hash(member_password, env.BCRYPT_ROUNDS);

    try {
        return await repo.createMember(member_name, hash);
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            throw HttpError.conflict("Username already exists");
        }
        throw error;
    }
}

export async function login({ member_name, member_password }) {
    const member = await repo.findMemberByName(member_name);
    const passwordOk = await bcrypt.compare(member_password, member?.member_password ?? DUMMY_HASH);

    if (!member || !passwordOk) {
        throw HttpError.unauthorized("Invalid username or password");
    }

    const publicMember = { member_id: member.member_id, member_name: member.member_name };
    return { token: signToken(publicMember), member: publicMember };
}
