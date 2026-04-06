export interface Suppression {
  id: string;
  reason: string;
}

export interface HIPAACheckOptions {
  /** Enable verbose output from cdk-nag Aspects. Default: false. */
  verbose?: boolean;
  /** Known exceptions — will be applied to the entire app node. */
  suppressions?: Suppression[];
}

// Minimal interface stubs for optional peer deps — avoids requiring them at build time.
// The actual types will be validated at runtime when the consumer calls applyHIPAAChecks.
interface CdkNag {
  AwsSolutionsChecks: new (props?: {verbose?: boolean}) => unknown;
  HIPAASecurityChecks: new (props?: {verbose?: boolean}) => unknown;
}

interface CdkApp {
  node: unknown;
}

interface CdkModule {
  Aspects: {
    of: (app: CdkApp) => {add: (aspect: unknown) => void};
  };
  NagSuppressions: {
    addResourceSuppressions: (
      app: CdkApp,
      suppressions: Array<{id: string; reason: string}>,
      applyToChildren: boolean
    ) => void;
  };
}

/**
 * Apply AWS Solutions and HIPAA Security cdk-nag Aspects to a CDK App or Stage.
 *
 * Call this in your `bin/app.ts` AFTER creating all stacks, BEFORE `app.synth()`.
 *
 * @example
 * import { applyHIPAAChecks } from '@sonarmd/star-config/iac/cdk-nag';
 *
 * const app = new cdk.App();
 * // ... create stacks ...
 * applyHIPAAChecks(app);
 * app.synth();
 */
export async function applyHIPAAChecks(
  app: CdkApp,
  options: HIPAACheckOptions = {}
): Promise<void> {
  const {verbose = false, suppressions = []} = options;

  let cdkNag: CdkNag;
  try {
    // @ts-ignore — cdk-nag is an optional peer dependency
    cdkNag = await import('cdk-nag');
  } catch {
    throw new Error(
      '@sonarmd/star-config: cdk-nag is required for HIPAA compliance checks.\n' +
        'Install it: yarn add -D cdk-nag'
    );
  }

  let cdk: CdkModule;
  try {
    // @ts-ignore — aws-cdk-lib is an optional peer dependency
    cdk = await import('aws-cdk-lib');
  } catch {
    throw new Error(
      '@sonarmd/star-config: aws-cdk-lib is required.\n' + 'Install it: yarn add aws-cdk-lib'
    );
  }

  cdk.Aspects.of(app).add(new cdkNag.AwsSolutionsChecks({verbose}));
  cdk.Aspects.of(app).add(new cdkNag.HIPAASecurityChecks({verbose}));

  for (const suppression of suppressions) {
    cdk.NagSuppressions.addResourceSuppressions(
      app,
      [{id: suppression.id, reason: suppression.reason}],
      true
    );
  }
}
