
output "topic_arns" {
  description = "List of SNS Topic ARNs"
  value = "${aws_sns_topic.this.*.arn}"
}
output "topic_ids" {
  description = "List of SNS Topic IDs"
  value = "${aws_sns_topic.this.*.id}"
}
