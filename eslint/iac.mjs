// @sonarmd/star-config — ESLint: IaC layer
// Auto-included for CDK, CloudFormation, and Ansible repos.
// Enforces HIPAA/SOC2 compliant infrastructure patterns.

/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    name: 'star-config/iac',
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // IaC must use structured logging, not console.log.
      // Use a logger like @aws-lambda-powertools/logger or pino.
      'no-console': 'error',

      'no-restricted-syntax': [
        'error',

        // --- Hardcoded infrastructure identifiers ---
        // These must come from environment, SSM, or CDK references — never literals.
        {
          selector: 'Literal[value=/^arn:aws:/]',
          message: 'Do not hardcode ARNs. Use SSM parameters, Fn.importValue(), or Stack imports.',
        },
        {
          selector: 'Literal[value=/^\\d{12}$/]',
          message:
            'Do not hardcode AWS account IDs. Use Stack.of(this).account or environment config.',
        },
        {
          selector:
            'Literal[value=/^(us|eu|ap|sa|ca|me|af)-(north|south|east|west|central|northeast|southeast)-\\d$/]',
          message: 'Do not hardcode AWS regions. Use Stack.of(this).region or environment config.',
        },

        // --- Dangerous removal policies ---
        // RemovalPolicy.DESTROY on data-storing constructs violates data retention
        // requirements for HIPAA. Use RETAIN or SNAPSHOT.
        // To allow DESTROY in non-prod: wrap with eslint-disable-next-line and a justification.
        {
          selector: "MemberExpression[property.name='DESTROY'][object.name='RemovalPolicy']",
          message:
            'RemovalPolicy.DESTROY is not allowed. Use RETAIN or SNAPSHOT for HIPAA compliance.',
        },
        {
          selector:
            "MemberExpression[property.name='DESTROY'][object.property.name='RemovalPolicy']",
          message:
            'RemovalPolicy.DESTROY is not allowed. Use RETAIN or SNAPSHOT for HIPAA compliance.',
        },

        // --- Overly permissive IAM ---
        // Wildcard actions or resources in IAM policies violate least-privilege.
        // Scope to property names that appear in PolicyStatement and addToPolicy contexts.
        {
          selector:
            "Property[key.name=/^(actions|resources|notActions|notResources)$/] > ArrayExpression > Literal[value='*']",
          message:
            "Wildcard '*' in IAM actions/resources violates least-privilege. Specify exact ARNs and action names.",
        },
      ],
    },
  },
];

export default config;
