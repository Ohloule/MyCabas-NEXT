import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendPasswordResetEmail(
  email: string,
  token: string
) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"MyCabas" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: "Réinitialisation de votre mot de passe - MyCabas",
    html: `
      <div style="font-family: Nunito, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F5FEFB;">
        <div style="text-align: center; margin-bottom: 0;">
          <img src="https://hmpnzwrmrgugtrwmslpx.supabase.co/storage/v1/object/public/mycabaspublic/name.png" alt="MyCabas" style="height: 48px; width: auto;" />
        </div>
        <p style="text-align: center; color: #7A9E96; font-size: 14px; margin-top: 4px;">Vos marchés locaux en ligne</p>
        <hr style="border: none; border-top: 2px solid #AECFC8; margin: 20px 0;" />
        <h2 style="color: #0A2B26;">Réinitialisation de mot de passe</h2>
        <p style="color: #3D5751; line-height: 1.6;">
          Vous avez demandé la réinitialisation de votre mot de passe.
          Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
             style="background-color: #0E7A6A; color: #F5FEFB; padding: 14px 36px;
                    text-decoration: none; border-radius: 10px; font-weight: bold;
                    display: inline-block; font-size: 16px;">
            Réinitialiser mon mot de passe
          </a>
        </div>
        <p style="color: #7A9E96; font-size: 14px; line-height: 1.6;">
          Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas demandé
          cette réinitialisation, vous pouvez ignorer cet email.
        </p>
        <hr style="border: none; border-top: 2px solid #AECFC8; margin: 20px 0;" />
        <p style="color: #7A9E96; font-size: 12px; text-align: center;">
          &copy; ${new Date().getFullYear()} MyCabas - Vos marchés locaux en ligne
        </p>
      </div>
    `,
  });
}
