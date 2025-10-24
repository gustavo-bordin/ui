resource "aws_lambda_function" "webhooks" {
  function_name = var.service_name
  role          = aws_iam_role.lambda.arn

  package_type = "Image"
  image_uri    = "${aws_ecr_repository.main.repository_url}:${var.image_tag}"

  timeout     = 30
  memory_size = var.memory_mb

  environment {
    variables = {
      PORT                       = "8080"
      BELVO_API_URL             = var.belvo_api_url
      SUPABASE_URL              = var.supabase_url
      BELVO_SECRET_ID           = var.belvo_secret_id
      BELVO_SECRET_PASSWORD     = var.belvo_secret_password
      SUPABASE_PUBLISHABLE_KEY  = var.supabase_key
      LOG_LEVEL                 = var.log_level
    }
  }
}

resource "aws_lambda_function_url" "webhooks" {
  function_name      = aws_lambda_function.webhooks.function_name
  authorization_type = "NONE"
}

resource "aws_ecr_repository" "main" {
  name = var.service_name
}

data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    effect = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda" {
  name = "${var.service_name}-lambda"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_ecr" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# Outputs
output "function_url" {
  description = "Lambda Function URL - use this as your webhook endpoint"
  value       = aws_lambda_function_url.webhooks.function_url
}

output "ecr_url" {
  description = "ECR repository URL"
  value       = aws_ecr_repository.main.repository_url
}
