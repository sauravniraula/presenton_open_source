import boto3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError
import logging


def upload_file_to_s3(file_name, bucket_name, object_name=None, expiration=3600):
    """
    Uploads a file to an S3 bucket and generates a signed URL.

    :param file_name: Path to the file to upload
    :param bucket_name: Name of the S3 bucket
    :param object_name: S3 object name. If not specified, file_name is used
    :param expiration: Time in seconds for the presigned URL to remain valid
    :return: Signed URL or None if an error occurred
    """
    # If S3 object_name was not specified, use file_name
    if object_name is None:
        object_name = file_name

    # Initialize S3 client
    s3_client = boto3.client("s3", region_name="ap-south-1")

    try:
        # Upload the file to S3
        s3_client.upload_file(file_name, bucket_name, object_name)
        logging.info(
            f"File '{file_name}' uploaded to bucket '{bucket_name}' as '{object_name}'."
        )

        # Generate a presigned URL for the uploaded object
        signed_url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket_name, "Key": object_name},
            ExpiresIn=expiration,
        )
        logging.info("Generated signed URL.")
        return signed_url

    except FileNotFoundError:
        logging.error("The file was not found.")
    except NoCredentialsError:
        logging.error("Credentials not available.")
    except PartialCredentialsError:
        logging.error("Incomplete credentials provided.")
    except Exception as e:
        logging.error(f"An error occurred: {e}")

    return None


def run_test():
    logging.basicConfig(level=logging.INFO)

    file_to_upload = "temp/output.pptx"
    s3_bucket_name = "pptgen-temporary"

    signed_url = upload_file_to_s3(file_to_upload, s3_bucket_name)
    if signed_url:
        print("Signed URL:", signed_url)
    else:
        print("Failed to upload the file or generate a signed URL.")
