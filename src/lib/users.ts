import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export interface User {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
}

// In-memory user store (can be replaced with database later)
const users: Map<string, User> = new Map();
const usersByEmail: Map<string, User> = new Map();
const usersByUsername: Map<string, User> = new Map();

export async function createUser(
    username: string,
    email: string,
    password: string
): Promise<User> {
    // Check if username or email already exists
    if (usersByUsername.has(username.toLowerCase())) {
        throw new Error("Username already exists");
    }
    if (usersByEmail.has(email.toLowerCase())) {
        throw new Error("Email already exists");
    }

    const id = randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    const user: User = {
        id,
        username,
        email,
        passwordHash,
    };

    users.set(id, user);
    usersByUsername.set(username.toLowerCase(), user);
    usersByEmail.set(email.toLowerCase(), user);

    return user;
}

export async function verifyUser(
    username: string,
    password: string
): Promise<User | null> {
    const user = usersByUsername.get(username.toLowerCase());
    if (!user) {
        return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
}

export function getUserById(id: string): User | null {
    return users.get(id) || null;
}
