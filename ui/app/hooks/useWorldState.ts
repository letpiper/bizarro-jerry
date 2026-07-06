import { create } from 'zustand';
import type {
  User,
  Team,
  Organization,
  SlackChannel,
  SlackMessage,
  CalendarEvent,
  GmailMessage,
  Trace,
  Mutation,
} from '../../types';

interface WorldState {
  // Organization data
  organization: Organization | null;
  users: User[];
  teams: Team[];

  // Persona / User context
  currentUserPersona: User | null;
  masterViewMode: boolean; // Master view sees everything, persona view is filtered

  // Slack data
  slackChannels: SlackChannel[];
  slackMessages: SlackMessage[];
  slackSelectedChannelId: string | null;

  // Calendar data
  calendarEvents: CalendarEvent[];

  // Gmail data
  gmailMessages: GmailMessage[];

  // Observability data
  traces: Trace[];
  mutations: Mutation[];

  // Filters
  traceFilter: string;
  mutationFilter: string;
  timeRangeStart: number | null;
  timeRangeEnd: number | null;

  // UI state
  currentView: 'slack' | 'calendar' | 'gmail' | 'trace-log' | 'mutation-log' | 'state-inspector' | 'scenarios' | 'metrics';
  rightSidebarExpanded: boolean;
  selectedTrace: Trace | null;
  selectedMutation: Mutation | null;

  // Actions
  setOrganization: (org: Organization) => void;
  setUsers: (users: User[]) => void;
  setTeams: (teams: Team[]) => void;
  setSlackChannels: (channels: SlackChannel[]) => void;
  addSlackMessage: (message: SlackMessage) => void;
  setSlackMessages: (messages: SlackMessage[]) => void;
  setSlackSelectedChannel: (channelId: string) => void;
  setCalendarEvents: (events: CalendarEvent[]) => void;
  addCalendarEvent: (event: CalendarEvent) => void;
  setGmailMessages: (messages: GmailMessage[]) => void;
  addGmailMessage: (message: GmailMessage) => void;
  addTrace: (trace: Trace) => void;
  setTraces: (traces: Trace[]) => void;
  addMutation: (mutation: Mutation) => void;
  setMutations: (mutations: Mutation[]) => void;
  setTraceFilter: (filter: string) => void;
  setMutationFilter: (filter: string) => void;
  setTimeRange: (start: number, end: number) => void;
  setCurrentView: (view: WorldState['currentView']) => void;
  toggleRightSidebar: () => void;
  setSelectedTrace: (trace: Trace | null) => void;
  setSelectedMutation: (mutation: Mutation | null) => void;
  setCurrentUserPersona: (user: User | null) => void;
  setMasterViewMode: (enabled: boolean) => void;
  reset: () => void;
}

export const useWorldState = create<WorldState>((set) => ({
  organization: null,
  users: [],
  teams: [],
  currentUserPersona: null,
  masterViewMode: true,
  slackChannels: [],
  slackMessages: [],
  slackSelectedChannelId: null,
  calendarEvents: [],
  gmailMessages: [],
  traces: [],
  mutations: [],
  traceFilter: '',
  mutationFilter: '',
  timeRangeStart: null,
  timeRangeEnd: null,
  currentView: 'slack',
  rightSidebarExpanded: true,
  selectedTrace: null,
  selectedMutation: null,

  setOrganization: (org) => set({ organization: org }),
  setUsers: (users) => set({ users }),
  setTeams: (teams) => set({ teams }),
  setSlackChannels: (channels) => set({ slackChannels: channels }),
  addSlackMessage: (message) =>
    set((state) => ({
      slackMessages: [...state.slackMessages, message],
    })),
  setSlackMessages: (messages) => set({ slackMessages: messages }),
  setSlackSelectedChannel: (channelId) =>
    set({ slackSelectedChannelId: channelId }),
  setCalendarEvents: (events) => set({ calendarEvents: events }),
  addCalendarEvent: (event) =>
    set((state) => ({
      calendarEvents: [...state.calendarEvents, event],
    })),
  setGmailMessages: (messages) => set({ gmailMessages: messages }),
  addGmailMessage: (message) =>
    set((state) => ({
      gmailMessages: [...state.gmailMessages, message],
    })),
  addTrace: (trace) =>
    set((state) => ({
      traces: [...state.traces, trace],
    })),
  setTraces: (traces) => set({ traces }),
  addMutation: (mutation) =>
    set((state) => ({
      mutations: [...state.mutations, mutation],
    })),
  setMutations: (mutations) => set({ mutations }),
  setTraceFilter: (filter) => set({ traceFilter: filter }),
  setMutationFilter: (filter) => set({ mutationFilter: filter }),
  setTimeRange: (start, end) =>
    set({ timeRangeStart: start, timeRangeEnd: end }),
  setCurrentView: (view) => set({ currentView: view }),
  toggleRightSidebar: () =>
    set((state) => ({ rightSidebarExpanded: !state.rightSidebarExpanded })),
  setSelectedTrace: (trace) => set({ selectedTrace: trace }),
  setSelectedMutation: (mutation) => set({ selectedMutation: mutation }),
  setCurrentUserPersona: (user) => set({ currentUserPersona: user, masterViewMode: user === null }),
  setMasterViewMode: (enabled) => set({ masterViewMode: enabled, currentUserPersona: enabled ? null : null }),
  reset: () =>
    set({
      organization: null,
      users: [],
      teams: [],
      currentUserPersona: null,
      masterViewMode: true,
      slackChannels: [],
      slackMessages: [],
      slackSelectedChannelId: null,
      calendarEvents: [],
      gmailMessages: [],
      traces: [],
      mutations: [],
    }),
}));
