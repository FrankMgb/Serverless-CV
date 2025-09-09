# Serverless CV

This is an initial commit for the Serverless CV project.

Quick link: Learn about the AWS Cloud Resume Challenge at https://cloudresumechallenge.dev

## Project: AWS Cloud Resume Challenge — Structuring Your Version to Fit the Provided Architecture

Based on the attached AWS architecture diagram and relevant insights from Shawn Moore and Ryan Carroll's Cloud Resume Challenge experience, here’s a tailored breakdown to guide your challenge implementation.

### 1. Front-End Deployment
- AWS Services Used:
  - Amazon Route 53: Handles DNS, directing user traffic to the site.
  - Amazon CloudFront: Distributes content globally with caching for performance.
  - Amazon S3: Hosts the static resume website (HTML/CSS/JavaScript).
- Action Steps:
  - Purchase and configure a domain in Route 53.
  - Upload your static site files to an S3 bucket, enable static website hosting.
  - Set up CloudFront as the CDN, ensure SSL certificate for HTTPS.
  - Point Route 53 records to the CloudFront distribution, not the raw S3 endpoint (avoids common misconfigurations).

### 2. Backend Functionality
- AWS Services Used:
  - Amazon API Gateway: Provides a RESTful endpoint for backend logic (e.g., visitor counter).
  - AWS Lambda: Runs code (Python or Node.js) serverlessly for your API logic.
  - Amazon DynamoDB: Stores dynamic site data, such as hit/visitor counts.
- Action Steps:
  - Build a Lambda function to increment and return the visitor count (or any dynamic data).
  - Create a DynamoDB table to store the count.
  - Deploy API Gateway to expose your Lambda function via HTTPS endpoints for frontend interaction.
  - Connect the visitor count in your frontend using JavaScript—demonstrates full-stack, cloud-native integration.

### 3. Infrastructure as Code & Automation
- Tools Highlighted:
  - Terraform: Preferred Infrastructure as Code (IaC) tool for AWS resource creation. Enables OIDC authentication for secure CI/CD without exposing secrets, as shown in the diagram and by Ryan Carroll’s solution.
  - GitHub Actions: Automates deployment for both frontend and backend (CI/CD pipeline).
- Action Steps:
  - Write Terraform scripts to build all AWS resources (S3, CloudFront, API Gateway, Lambda, DynamoDB, IAM roles, etc.).
  - Set up GitHub Actions workflow to deploy infrastructure and code changes automatically.
  - Use OIDC authentication for GitHub Actions to assume IAM roles securely—avoid hardcoding secrets.

### 4. Monitoring & Logging
- Amazon CloudWatch: Track logs and metrics for Lambda functions and API Gateway requests. Link your backend logic to CloudWatch for operational visibility.

### 5. Testing & Troubleshooting
- Implement unit and integration tests for your Lambda code and API.
- Consider tools like Postman for API debugging and Cypress for end-to-end smoke tests, as recommended by Ryan Carroll.
- Use `terraform plan` and `terraform import` to validate infrastructure.

### Additional Insights from Both Authors
- Keep documentation clear: Both recommend blogging about your process and documenting what you learn at each step, helping with knowledge retention for interviews and technical career growth.
- Best practices: Prioritize security (no hardcoded credentials), scalability, and automation.
- Resume website: Link your AWS resume site and GitHub repo for recruiters.

### How Your Architecture Matches the Challenges
Your diagram covers the major skills and components these engineers focused on:

- Full AWS stack (S3, CloudFront, Route 53, API Gateway, Lambda, DynamoDB)
- End-to-end deployment via Terraform (IaC), with OIDC authentication
- CI/CD automation (GitHub Actions)
- Real-time monitoring and metrics (CloudWatch)
- Security best practices (IAM roles, avoiding static secrets)
- Emphasis on testing, troubleshooting, and documentation

---

## Implementation Guide (Minimal, Copy-Paste Friendly)

### Show only one section (About vs Projects)
- The page now has two top tabs in the content header: About and Projects. Only one section is visible at a time.
- JavaScript (initSectionSwitcher in app.js) builds two panes automatically on load:
  - #about-section contains the original intro content.
  - #projects-section contains the Projects hub (filters, list, and details).
- Clicking the tabs hides the other pane and highlights the active tab.

HTML pattern (already in index.html):
<header class="content-header top-tabs">
  <nav class="tabs" role="tablist" aria-label="Primary sections">
    <button class="top-tab active" data-target="#about-section" role="tab" aria-selected="true" aria-controls="about-section">About</button>
    <button class="top-tab" data-target="#projects-section" role="tab" aria-selected="false" aria-controls="projects-section">Projects</button>
  </nav>
</header>

CSS (added in style.css):
- .top-tab.active styles the active tab
- .section-pane with a small opacity transition

No action required if you keep both sections on one page. If you later split pages, remove initSectionSwitcher or adjust selectors accordingly.

### Adding Your Projects to the Projects Section

This site now supports populating the Projects section from a simple configuration object in index.html. You can provide your own projects without editing the HTML list manually.

How to use:
- Open index.html and locate the window.CONFIG block near the end of the file.
- Add a projects array with entries using the schema below.

Schema:
- title (string, required): The project title.
- href (string, required): The link to your project (can be relative like project1.html or absolute https URL). You can also use url instead of href.
- date (string, optional): A date string to display (e.g., 2025-09-01).
- tags (array of strings OR string, optional): Tags will be displayed to the right.

Example:

window.CONFIG = {
  API_URL: null,
  projects: [
    { title: 'Cloud Resume Challenge - Testing, Monitoring, & Mods', href: 'project1.html', date: '2025-07-31', tags: ['#Project', '#AWS', '#Cloud Resume Challenge'] },
    { title: 'Cloud Resume Challenge - Visitor Counter API & Infrastructure', href: 'project2.html', date: '2025-07-26', tags: '#Project #AWS #Cloud Resume Challenge' }
  ]
};

Behavior:
- If window.CONFIG.projects exists and has items, the page will render your list and replace the placeholder/hardcoded items.
- If it is absent or empty, the original hardcoded items remain, so the site looks fine before you add your data.

Accessibility and security:
- Links to external sites automatically open in a new tab with rel="noopener noreferrer".
- Text is safely escaped when rendering to prevent HTML injection.

This repo is frontend-only. Use these snippets to stand up the backend and connect it to the visitor counter in index.html/app.js.

### 1) DynamoDB + Lambda + API Gateway (Terraform)

main.tf (minimal example; adjust region, names)

provider "aws" {
  region = var.aws_region
}

variable "aws_region" { default = "us-east-1" }
variable "project"    { default = "serverless-cv" }

resource "aws_dynamodb_table" "visitors" {
  name         = "${var.project}-visitors"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"

  attribute {
    name = "pk"
    type = "S"
  }
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  source {
    content  = <<EOF
import os
import json
import boto3

table = boto3.resource('dynamodb').Table(os.environ['TABLE_NAME'])
PARTITION_KEY = os.environ.get('PARTITION_KEY', 'VISITORS')

# CORS settings
ALLOWED_ORIGIN = os.environ.get('ALLOWED_ORIGIN', '*')

def _response(status, body):
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
            'Access-Control-Allow-Methods': 'GET,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        },
        'body': json.dumps(body)
    }

def handler(event, context):
    if event.get('httpMethod') == 'OPTIONS':
        return _response(200, {'ok': True})

    # Atomic increment pattern
    resp = table.update_item(
        Key={'pk': PARTITION_KEY},
        UpdateExpression='ADD #c :incr',
        ExpressionAttributeNames={'#c': 'count'},
        ExpressionAttributeValues={':incr': 1},
        ReturnValues='UPDATED_NEW'
    )
    count = int(resp['Attributes'].get('count', 0))
    return _response(200, {'count': count})
EOF
    filename = "index.py"
  }
  output_path = "build/visitor_lambda.zip"
}

resource "aws_iam_role" "lambda_role" {
  name = "${var.project}-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.project}-lambda-policy"
  role = aws_iam_role.lambda_role.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = ["dynamodb:UpdateItem", "dynamodb:PutItem", "dynamodb:GetItem"],
        Resource = aws_dynamodb_table.visitors.arn
      },
      {
        Effect = "Allow",
        Action = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
        Resource = "*"
      }
    ]
  })
}

resource "aws_lambda_function" "visitor" {
  function_name = "${var.project}-visitor"
  filename      = data.archive_file.lambda_zip.output_path
  handler       = "index.handler"
  runtime       = "python3.12"
  role          = aws_iam_role.lambda_role.arn
  timeout       = 5
  environment {
    variables = {
      TABLE_NAME    = aws_dynamodb_table.visitors.name
      PARTITION_KEY = "VISITORS"
      ALLOWED_ORIGIN = var.allowed_origin
    }
  }
}

variable "allowed_origin" {
  description = "Origin allowed for CORS, e.g. https://www.example.com"
  type        = string
}

resource "aws_apigatewayv2_api" "http" {
  name          = "${var.project}-api"
  protocol_type = "HTTP"
  cors_configuration = {
    allow_headers = ["content-type"]
    allow_methods = ["GET", "OPTIONS"]
    allow_origins = [var.allowed_origin]
  }
}

resource "aws_apigatewayv2_integration" "visitor" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.visitor.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "get_visitors" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "GET /visitors"
  target    = "integrations/${aws_apigatewayv2_integration.visitor.id}"
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.visitor.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}

resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.http.id
  name        = "prod"
  auto_deploy = true
}

output "visitor_api_url" {
  value = "${aws_apigatewayv2_stage.prod.invoke_url}/visitors"
}

Notes:
- The Lambda uses atomic UpdateItem to handle concurrency.
- CORS is configured both in API Gateway and Lambda response.
- Copy the output visitor_api_url into index.html window.CONFIG.API_URL.

### 2) Frontend connection

In index.html add before app.js:

<script>
  window.CONFIG = { API_URL: "https://YOURID.execute-api.us-east-1.amazonaws.com/prod/visitors" };
</script>

The included app.js automatically fetches and displays the count in the top-left badge.

### 3) S3 + CloudFront (Terraform outline)

- S3 bucket for website hosting (static, versioning enabled, SSE-S3).
- CloudFront distribution with:
  - Origin Access Control (OAC) or OAI to restrict S3 access.
  - DefaultBehavior: redirect HTTP to HTTPS, cache policy optimized, compression on.
  - ACM certificate in us-east-1 for your domain.
- Route 53 A/AAAA records to CloudFront distribution.

Tip: Point DNS to CloudFront, not S3 website endpoint.

### 4) GitHub Actions with OIDC (examples)

.github/workflows/infra.yml

name: Infra
on:
  push:
    branches: [ main ]
    paths: [ 'infra/**' ]

jobs:
  terraform:
    permissions:
      id-token: write
      contents: read
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - name: Configure AWS credentials via OIDC
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-oidc-terraform
          aws-region: us-east-1
      - run: terraform -chdir=infra init
      - run: terraform -chdir=infra apply -auto-approve

.github/workflows/frontend.yml

name: Frontend
on:
  push:
    branches: [ main ]
    paths: [ 'index.html', 'style.css', 'app.js' ]

jobs:
  deploy:
    permissions:
      id-token: write
      contents: read
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Configure AWS credentials via OIDC
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-oidc-frontend
          aws-region: us-east-1
      - name: Sync to S3
        run: aws s3 sync . s3://your-static-bucket --exclude ".git/*" --delete
      - name: Invalidate CloudFront
        run: aws cloudfront create-invalidation --distribution-id E123ABC456 --paths "/*"

Create two IAM roles trusted for GitHub's OIDC provider and narrowly scoped to the required actions.

### 5) Monitoring & Logging
- Lambda will emit logs to CloudWatch Logs (/aws/lambda/<function>). Add metrics filters or alarms as needed.
- API Gateway HTTP API has execution metrics and can send logs to CloudWatch Logs if enabled.

### 6) Testing
- Unit test Lambda handler (e.g., with pytest). Mock DynamoDB using moto.
- Integration test API using Postman or curl. Expect JSON {"count": <number>}.
- E2E: after deploy, load the site and ensure the badge updates. Verify CORS in browser DevTools.



## Notes on placeholders and avoiding 404s

- Project diagram image: The inline project detail section uses an embedded placeholder image (data URI), so the browser won’t request a non-existent file. To use your own diagram, replace the img src in index.html with a real file you add to the repo, e.g. src="images/architecture.png".
  - Tip: Ensure the file exists at that path before deploying to avoid 404s. If serving via S3/CloudFront, invalidate the cache after uploading new assets.
- Project pages: If you intend to link to a separate project page (e.g., project1.html), create that file in the repository before linking it. Until then, keep internal links as in-page anchors (href="#...") or the “#” placeholder to avoid 404s.
- API_URL: If you configure window.CONFIG.API_URL to your API Gateway endpoint and receive a 404, verify the stage path (e.g., /prod/visitors) and that the resource/method exists and is deployed. Also check CORS if requests fail.
