/**
 * @ada/simulated-world
 * Complete simulation framework for testing integrations with Piper
 */

// Core
export { SimulatedWorld } from './core/world';
export { TimeEngine } from './core/time';
export { EventBus } from './core/events';
export type {
  User,
  Team,
  Organization,
  IntegrationConfig,
  OrgSettings,
  APIRequest,
  APIResponse,
  Mutation,
  Trace,
  WorldSnapshot,
  WorldConfig,
  EventListener,
  ScheduledHook,
} from './core/types';

export type { HTTPClient } from './core/world';

// Integrations
export {
  SlackIntegration,
  CalendarIntegration,
  GmailIntegration,
  LinearIntegration,
  GitHubIntegration,
  SalesforceIntegration,
  DocsIntegration,
  GranolaIntegration,
  TodoistIntegration,
  FeedbinIntegration,
  OuraIntegration,
  StravaIntegration,
  TwitterIntegration,
  BaseIntegration,
} from './integrations';

export type {
  SlackUser,
  SlackChannel,
  SlackMessage,
  CalendarEvent,
  GmailMessage,
  LinearIssue,
  GoogleDoc,
  DocContent,
  GranolaNote,
  GranolaPanel,
  TodoistTask,
  TodoistProject,
  FeedbinEntry,
  FeedbinFeed,
  OuraSleepData,
  OuraActivityData,
  OuraReadinessData,
  StravaActivity,
  StravaAthlete,
  Tweet,
  TwitterUser,
} from './integrations';

// HTTP Interception
export { HTTPInterceptor } from './http/interceptor';

// Observability
export { MutationLog } from './observability/mutations';
export { Tracer } from './observability/tracer';

// Scenarios
export { ScenarioBuilder, type TurnResult } from './scenarios/builder';
export { MultiTurnSession, type Turn } from './scenarios/session';
export { ScenarioExecutor, type ScenarioDefinition, type ExecutionResult } from './scenarios/executor';

// Piper Adapter
export {
  SimulatedHTTPClient,
  ScenarioRunner,
  EvaluationRubric,
  type PiperAction,
  type ActionResult,
  type TargetExperience,
  type EvaluationCriterion,
  type EvaluationScore,
} from './piper-adapter';
