module "sns-topics" {
  source  = "devops-workflow/sns-topics/aws"
  version = "0.1.3"
  names = [
    "${var.environment_prefix}testing-sns-topic-1",
    "${var.environment_prefix}testing-sns-topic-2",
    "${var.environment_prefix}testing-sns-topic-3"
  ]
  environment = var.environment
}
