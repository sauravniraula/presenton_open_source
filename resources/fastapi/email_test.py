import smtplib
import dns.resolver

def verify_email(email):
    domain = email.split('@')[-1]
    
    try:
        # Get MX record
        mx_records = dns.resolver.resolve(domain, 'MX')
        mx_host = str(mx_records[0].exchange)
        
        # Connect to SMTP server
        server = smtplib.SMTP()
        server.set_debuglevel(0)
        server.connect(mx_host)
        server.helo(server.local_hostname)
        server.mail('you@example.com')
        code, message = server.rcpt(email)
        server.quit()
        
        return code == 250
    except Exception as e:
        return False

print(verify_email("suraj@microagents.io"))