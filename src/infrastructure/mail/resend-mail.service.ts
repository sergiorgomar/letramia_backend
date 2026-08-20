import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppException } from '@/common/exceptions/app.exception';

export interface SendMailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

interface ResendEmailResponse {
  id?: string;
  message?: string;
}

@Injectable()
export class ResendMailService {
  constructor(private readonly config: ConfigService) {}

  async sendRecoverPassword(email: string, resetUrl: string): Promise<string> {
    return this.send({
      to: email,
      subject: 'Recupera tu contraseña',
      text: `Solicitaste recuperar tu contraseña. Restablece tu contraseña aquí: ${resetUrl}\n\nSi no solicitaste este cambio, puedes ignorar este correo.`,
      html: `
        <!doctype html>
        <html lang="es">
          <body style="margin:0; padding:0; background:#F7F4FC; font-family:Arial, sans-serif; color:#303038;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F7F4FC; padding:32px 16px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 8px 30px rgba(89,50,157,.12);">
                    <tr>
                      <td style="background:#ffffff; border-bottom:4px solid #59329D; padding:28px 40px; text-align:center;">
                        <img src="https://letramia.com/logo.png" alt="LetrAmia" width="180" style="display:block; width:180px; max-width:100%; height:auto; margin:0 auto; border:0; outline:none; text-decoration:none;">
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:40px;">
                        <h2 style="margin:0 0 16px; color:#351D5C; font-size:26px; line-height:34px;">Recupera tu contraseña</h2>
                        <p style="margin:0 0 18px; font-size:16px; line-height:25px; color:#5E5D67;">Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
                        <p style="margin:0 0 30px; font-size:16px; line-height:25px; color:#5E5D67;">Haz clic en el siguiente botón para crear una nueva contraseña.</p>
                        <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 32px;">
                          <tr>
                            <td style="border-radius:10px; background:#59329D;">
                              <a href="${resetUrl}" style="display:inline-block; padding:14px 24px; color:#ffffff; text-decoration:none; font-size:16px; font-weight:700;">Restablecer contraseña</a>
                            </td>
                          </tr>
                        </table>
                        <div style="border-left:4px solid #39B56B; background:#F1FBF5; padding:16px 18px; border-radius:8px;">
                          <p style="margin:0; font-size:14px; line-height:22px; color:#215F3B;"><strong>¿No solicitaste este cambio?</strong><br>No te preocupes: puedes ignorar este correo. Tu contraseña seguirá siendo la misma.</p>
                        </div>
                        <p style="margin:30px 0 0; font-size:13px; line-height:20px; color:#777680;">Si el botón no funciona, copia y pega este enlace en tu navegador:<br><a href="${resetUrl}" style="color:#59329D; word-break:break-all;">${resetUrl}</a></p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:22px 40px; background:#F2EFFB; text-align:center;">
                        <p style="margin:0; font-size:12px; line-height:18px; color:#777680;">Este correo fue enviado por LetrAmia. Por seguridad, no compartas este enlace con nadie.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });
  }

  async send({ to, subject, html, text }: SendMailParams): Promise<string> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.getOrThrow<string>('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
        'User-Agent': 'letramia/1.0',
      },
      body: JSON.stringify({
        from: `Letramía <${this.config.getOrThrow<string>('RESEND_FROM')}>`,
        to,
        subject,
        html,
        ...(text ? { text } : {}),
      }),
    });

    // 🔥 cachear bien errores
    const result = (await response
      .json()
      .catch(() => null)) as ResendEmailResponse | null;

    if (!response.ok || !result?.id) {
      throw new AppException(
        'MAIL_SEND_ERROR',
        { status: response.status, resendMessage: result?.message },
        result,
      );
    }

    return result.id;
  }
}
