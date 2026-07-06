// Barrel export for all integrations
export { SlackIntegration } from './slack';
export type { SlackUser, SlackChannel, SlackMessage } from './slack/types';

export { CalendarIntegration } from './calendar';
export type { CalendarEvent } from './calendar';

export { GmailIntegration } from './gmail';
export type { GmailMessage } from './gmail';

export { LinearIntegration } from './linear';
export type { LinearIssue } from './linear';

export { GitHubIntegration } from './github';
export { SalesforceIntegration } from './salesforce';

export { DocsIntegration } from './docs';
export type { GoogleDoc, DocContent } from './docs';

export { GranolaIntegration } from './granola';
export type { GranolaNote, GranolaPanel } from './granola';

export { TodoistIntegration } from './todoist';
export type { TodoistTask, TodoistProject } from './todoist';

export { FeedbinIntegration } from './feedbin';
export type { FeedbinEntry, FeedbinFeed } from './feedbin';

export { OuraIntegration } from './oura';
export type { OuraSleepData, OuraActivityData, OuraReadinessData } from './oura';

export { StravaIntegration } from './strava';
export type { StravaActivity, StravaAthlete } from './strava';

export { TwitterIntegration } from './twitter';
export type { Tweet, TwitterUser } from './twitter';

export { BaseIntegration } from './base';
