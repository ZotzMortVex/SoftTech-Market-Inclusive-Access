import nodemailer from "nodemailer";

export function isPasswordResetEmailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_PORT?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS &&
      (process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim()) &&
      (process.env.APP_URL?.trim() || process.env.APP_BASE_URL?.trim()),
  );
}

export async function sendPasswordResetEmail(
  recipient: string,
  resetUrl: string,
): Promise<void> {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM?.trim() || user;

  if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !user || !pass || !from) {
    throw new Error("Password reset email SMTP settings are incomplete.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE?.trim().toLowerCase() === "true",
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: recipient,
    subject: "Restablece tu contraseña de SoftTech Market",
    text: `Recibimos una solicitud para restablecer la contraseña de tu cuenta.\n\nUsa este enlace dentro de los próximos 30 minutos:\n${resetUrl}\n\nSi no solicitaste este cambio, ignora este mensaje.`,
    html: `<p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p><p><a href="${resetUrl}">Crear una nueva contraseña</a></p><p>Este enlace vence en 30 minutos. Si no solicitaste este cambio, ignora este mensaje.</p>`,
  });
}
