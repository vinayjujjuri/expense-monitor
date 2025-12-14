export function validateUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  if (!data.name || data.name.length < 2) {
    throw new Error("Name must be at least 2 characters");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new Error("Invalid email address");
  }

  if (data.password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
}
