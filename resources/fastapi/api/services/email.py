import os
import resend

resend.api_key = os.environ["RESEND_API_KEY"]

# with open("./download.html", "r") as f:
#     download_html = f.read()

html = """
<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>Email Template</title> <style> body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; } .container { max-width: 600px; margin: 0 auto; padding: 20px; } .logo { text-align: center; padding: 20px 0; } .logo img { height: 80px; } .content-box { background-color: grey !important; border-radius: 8px; padding: 40px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); } .btn { display: inline-block; background-color: #3a0cf7; color: #ffffff !important; /* Force white color with !important */ padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 15px 0; } .message { margin: 20px 0; color: #555; } .footer { margin: 20px 0; padding: 20px 0; text-align: center; width: 100%; } .footer-content { display: inline-block; text-align: center; } .footer img { height: 30px; width: auto; vertical-align: middle; margin-right: 5px; } .footer p { display: inline-block; vertical-align: middle; margin: 0; color: #666; } </style> </head> <body> <div class="container"> <div class="logo"> <img src="https://fonts.happyinsights.io/Presenton%20Logo-07.png" alt="Company Logo"> </div> <div class="content-box" style="background-color: #f4ebfd !important;"> <h2>Your Document Is Ready</h2> <p>A __document_type__ for "__document_name__" is ready.</p> <a href="__document_url__" class="btn" style="color: #ffffff !important; text-decoration: none;"> <span style="color: #ffffff !important;">Download __document_type__</span> </a> <p class="message">Anyone you forward this to will also be able to download your __document_type__.</p> </div> <div class="footer" style="text-align: center; width: 100%;"> <table width="100%" cellpadding="0" cellspacing="0" border="0" style="text-align: center;"> <tr> <td align="center" valign="middle"> <img src="https://pub-c8ffa7132a1b47d3b00ba216fb13a08f.r2.dev/Presenton%20Logo-09.png" alt="Footer Logo" style="height: 30px; width: auto; vertical-align: middle; margin-right: 5px;"> <span style="color: #666; font-size: 12px; vertical-align: middle;">© 2025 Presenton</span> </td> </tr> </table> </div> </div> </body> </html>
"""

def send_email(message: str):
    params: resend.Emails.SendParams = {
        "from": "Presenton <onboarding@resend.dev>",
        "to": [
            # "developmentsuraj@gmail.com",
            # "surajbeston@gmail.com",
            # "developmentsaurav@gmail.com",
            "sauravniraula912@gmail.com",
            # "shivabadu5@gmail.com",
        ],
        "subject": "ISSUE in Presenton",
        "html": f"""<strong>{message}</strong>""",
    }
    resend.Emails.send(params)

def send_document_download_email(document_type: str, document_name: str, document_url: str, email: str):
    download_html = html.replace("__document_type__", document_type)
    download_html = download_html.replace("__document_name__", document_name)
    download_html = download_html.replace("__document_url__", document_url)
    params: resend.Emails.SendParams = {
        "from": "noreply@presenton.ai",
        "to": [email],
        "subject": f"Download {document_type}",
        "html": download_html
    }
    email = resend.Emails.send(params)

if __name__ == "__main__":
    send_document_download_email("PDF", "Global Warming's impact on Nepal", "https://335386f5bbe247fe39c638db874e5c6b.us-east-1.resend-links.com/CL0/https:%2F%2Fpptgen-public-v2.s3.ap-south-1.amazonaws.com%2Fuser-5673fdad-5bd2-4e69-a525-21d9110236b3%2F746fe006-6cb4-4ba4-ae99-eae79978b99d%2Fpresentation.pptx/1/010001954da231cf-f3e70074-177d-48b6-b78d-754b86b79e92-000000/NYVl3iqcIc7NVofHh0fZywqMf7Q1BZ4RrBa3xssa4cY=394", "surajbeston@gmail.com")



