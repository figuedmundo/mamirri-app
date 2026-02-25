import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface SendInvitationEmailParams {
  to: string;
  clinicName: string;
  inviteUrl: string;
  role: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null = null;
  private readonly apiKey: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (this.apiKey) {
      this.resend = new Resend(this.apiKey);
    }
  }

  async sendInvitationEmail(params: SendInvitationEmailParams): Promise<void> {
    const { to, clinicName, inviteUrl, role } = params;

    if (!this.resend) {
      this.logger.log(
        `[Email] Would send invitation: to=${to}, clinicName=${clinicName}, inviteUrl=${inviteUrl}, role=${role}`,
      );
      return;
    }

    const roleDisplay = this.formatRole(role);
    const text = `Has sido invitado a unirte a ${clinicName} como ${roleDisplay}. Acepta tu invitación aquí: ${inviteUrl}. Este enlace expira en 24 horas.`;

    try {
      await this.resend.emails.send({
        from: 'Mamirri <noreply@resend.dev>',
        to,
        subject: `Invitación a ${clinicName}`,
        text,
      });
      this.logger.log(`Invitation email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send invitation email to ${to}:`, error);
      throw error;
    }
  }

  private formatRole(role: string): string {
    const roleMap: Record<string, string> = {
      THERAPIST: 'Fisioterapeuta',
      CLINIC_OWNER: 'Propietario de Clínica',
      ADMIN: 'Administrador',
    };
    return roleMap[role] || role;
  }
}
