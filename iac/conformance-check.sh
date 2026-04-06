#!/usr/bin/env bash
# AWS Config HIPAA Conformance Pack Compliance Check
#
# Validates the current AWS account against the HIPAA Security conformance pack.
# Outputs a JUnit XML report. Fails the build on critical non-compliant resources.
#
# Requirements:
#   - aws CLI configured with appropriate permissions
#   - jq installed
#   - AWS Config enabled in the target account/region
#   - HIPAA conformance pack deployed (see: Operational-Best-Practices-for-HIPAA-Security)
#
# Usage:
#   ./iac/conformance-check.sh [options]
#
# Options:
#   --pack-name NAME      Conformance pack name (default: Operational-Best-Practices-for-HIPAA-Security)
#   --output FILE         JUnit XML output file (default: conformance-results.xml)
#   --region REGION       AWS region (default: $AWS_DEFAULT_REGION or us-east-1)
#   --help                Show this help

set -euo pipefail

# --- Defaults ---
PACK_NAME="Operational-Best-Practices-for-HIPAA-Security"
OUTPUT_FILE="conformance-results.xml"
REGION="${AWS_DEFAULT_REGION:-us-east-1}"

# --- Argument parsing ---
while [[ $# -gt 0 ]]; do
  case "$1" in
    --pack-name)  PACK_NAME="$2"; shift 2 ;;
    --output)     OUTPUT_FILE="$2"; shift 2 ;;
    --region)     REGION="$2"; shift 2 ;;
    --help)
      grep '^#' "$0" | grep -v '#!/' | sed 's/^# \?//'
      exit 0
      ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

# --- Critical rules that FAIL the build ---
CRITICAL_RULES=(
  "s3-bucket-server-side-encryption-enabled"
  "s3-bucket-public-read-prohibited"
  "s3-bucket-public-write-prohibited"
  "s3-bucket-ssl-requests-only"
  "rds-storage-encrypted"
  "rds-snapshots-public-prohibited"
  "ec2-instance-no-public-ip"
  "lambda-function-public-access-prohibited"
  "iam-policy-no-statements-with-admin-access"
  "restricted-ssh"
  "encrypted-volumes"
  "cloud-trail-encryption-enabled"
)

is_critical() {
  local rule="$1"
  for critical in "${CRITICAL_RULES[@]}"; do
    if [[ "$rule" == "$critical" ]]; then
      return 0
    fi
  done
  return 1
}

echo "=== AWS Config HIPAA Conformance Check ==="
echo "Pack:   $PACK_NAME"
echo "Region: $REGION"
echo "Output: $OUTPUT_FILE"
echo ""

# --- Verify AWS Config is enabled ---
echo "Checking AWS Config status..."
RECORDER_STATUS=$(aws configservice describe-configuration-recorder-status \
  --region "$REGION" \
  --query "ConfigurationRecordersStatus[0].recording" \
  --output text 2>/dev/null || echo "NONE")

if [[ "$RECORDER_STATUS" != "true" ]]; then
  echo "ERROR: AWS Config is not enabled in $REGION. Enable it before running compliance checks." >&2
  exit 1
fi

# --- Verify conformance pack is deployed ---
echo "Checking conformance pack deployment..."
PACK_STATUS=$(aws configservice describe-conformance-packs \
  --region "$REGION" \
  --conformance-pack-names "$PACK_NAME" \
  --query "ConformancePackDetails[0].ConformancePackState" \
  --output text 2>/dev/null || echo "NONE")

if [[ "$PACK_STATUS" != "CREATE_COMPLETE" ]]; then
  echo "ERROR: Conformance pack '$PACK_NAME' is not deployed (status: $PACK_STATUS)." >&2
  echo "Deploy it from AWS Console > Config > Conformance Packs." >&2
  exit 1
fi

# --- Fetch compliance details ---
echo "Fetching compliance details..."
COMPLIANCE_JSON=$(aws configservice get-conformance-pack-compliance-details \
  --region "$REGION" \
  --conformance-pack-name "$PACK_NAME" \
  --filters "ComplianceType=NON_COMPLIANT" \
  --output json 2>/dev/null)

VIOLATIONS=$(echo "$COMPLIANCE_JSON" | jq -r '.ConformancePackRuleComplianceList // []')
TOTAL_VIOLATIONS=$(echo "$VIOLATIONS" | jq 'length')
CRITICAL_FAILURES=0
WARNINGS=0

echo "Found $TOTAL_VIOLATIONS non-compliant rule(s)."
echo ""

# --- Generate JUnit XML ---
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
SUITE_FAILURES=0
SUITE_WARNINGS=0
TEST_CASES=""

while IFS= read -r rule_entry; do
  RULE_NAME=$(echo "$rule_entry" | jq -r '.ConfigRuleName')
  RESOURCE_COUNT=$(echo "$rule_entry" | jq -r '.NonCompliantResources | length')

  while IFS= read -r resource; do
    RESOURCE_ID=$(echo "$resource" | jq -r '.ResourceId')
    RESOURCE_TYPE=$(echo "$resource" | jq -r '.ResourceType')
    ANNOTATION=$(echo "$resource" | jq -r '.Annotation // "No annotation available"')

    if is_critical "$RULE_NAME"; then
      CRITICAL_FAILURES=$((CRITICAL_FAILURES + 1))
      SUITE_FAILURES=$((SUITE_FAILURES + 1))
      TEST_CASES+=$(cat <<XMLCASE
    <testcase name="${RULE_NAME}: ${RESOURCE_ID}" classname="${RESOURCE_TYPE}">
      <failure type="CRITICAL_NON_COMPLIANT" message="${RULE_NAME}">
Resource: ${RESOURCE_ID} (${RESOURCE_TYPE})
Rule: ${RULE_NAME}
Annotation: ${ANNOTATION}
Severity: CRITICAL - This rule is required for HIPAA compliance.
      </failure>
    </testcase>
XMLCASE
)
    else
      WARNINGS=$((WARNINGS + 1))
      SUITE_WARNINGS=$((SUITE_WARNINGS + 1))
      TEST_CASES+=$(cat <<XMLCASE
    <testcase name="${RULE_NAME}: ${RESOURCE_ID}" classname="${RESOURCE_TYPE}">
      <system-out>
WARNING: ${RESOURCE_ID} (${RESOURCE_TYPE}) - ${RULE_NAME}: ${ANNOTATION}
      </system-out>
    </testcase>
XMLCASE
)
    fi
  done < <(echo "$rule_entry" | jq -c '.NonCompliantResources[]?')
done < <(echo "$VIOLATIONS" | jq -c '.[]?')

TOTAL_TESTS=$((SUITE_FAILURES + SUITE_WARNINGS))

cat > "$OUTPUT_FILE" <<XML
<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="AWS Config HIPAA Conformance" tests="${TOTAL_TESTS}" failures="${SUITE_FAILURES}" timestamp="${TIMESTAMP}">
  <testsuite name="${PACK_NAME}" tests="${TOTAL_TESTS}" failures="${SUITE_FAILURES}" warnings="${SUITE_WARNINGS}" timestamp="${TIMESTAMP}">
${TEST_CASES}
  </testsuite>
</testsuites>
XML

# --- Summary ---
echo "=== Results ==="
echo "Critical failures (build-blocking): $CRITICAL_FAILURES"
echo "Warnings (non-blocking):            $WARNINGS"
echo "Report written to: $OUTPUT_FILE"
echo ""

if [[ $CRITICAL_FAILURES -gt 0 ]]; then
  echo "BUILD FAILED: $CRITICAL_FAILURES critical HIPAA compliance violation(s) detected." >&2
  echo "Fix the non-compliant resources listed in $OUTPUT_FILE before merging." >&2
  exit 1
fi

echo "All critical HIPAA compliance checks passed."
exit 0
