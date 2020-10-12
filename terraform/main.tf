module "sns-topics" {
  source  = "devops-workflow/sns-topics/aws"
  version = "0.1.3"
  names = [
    "testing-sns-topic-1",
    "testing-sns-topic-2",
    "testing-sns-topic-3"
  ]
  environment = var.environment
}
