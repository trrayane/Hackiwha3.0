import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger(__name__)

_BASE_TEMPLATE = """\
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;padding:32px;">
            <tr>
              <td>
                <h2 style="color:#111827;margin:0 0 16px 0;">{heading}</h2>
                <p style="color:#374151;font-size:15px;line-height:22px;margin:0 0 24px 0;">{body}</p>
                {code_block}
                <p style="color:#9ca3af;font-size:13px;line-height:20px;margin:0;">
                  If you did not request this, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
"""


def _send_email(to_email: str, subject: str, text_body: str, html_body: str) -> None:
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
    message["To"] = to_email
    message.set_content(text_body)
    message.add_alternative(html_body, subtype="html")

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
            if settings.smtp_use_tls:
                server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(message)
    except (smtplib.SMTPException, OSError):
        logger.exception("failed to send email to %s", to_email)


def send_password_reset_email(to_email: str, name: str, reset_link: str) -> None:
    body = (
        f"Hi {name}, click the link below to reset your password. "
        f"This link expires in {settings.reset_token_expire_minutes} minutes."
    )
    html_body = _BASE_TEMPLATE.format(
        heading="Reset your password",
        body=body,
        code_block=(
            f'<div style="text-align:center;margin-bottom:24px;">'
            f'<a href="{reset_link}" style="background-color:#111827;color:#ffffff;'
            f'padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;">'
            f"Reset password</a></div>"
        ),
    )
    text_body = f"{body}\n\nLink: {reset_link}"
    _send_email(to_email, "Reset your password", text_body, html_body)
