import { NextResponse } from 'next/server';

// This endpoint returns the current world state
// In production, this would connect to the SimulatedWorld backend

export async function GET() {
  try {
    // For now, return mock data
    const state = {
      organization: {
        id: 'org-1',
        name: 'Ada',
        domain: 'ada.cx',
        teams: [],
      },
      users: [
        {
          id: 'mike',
          name: 'Mike',
          email: 'mike@ada.cx',
          role: 'CEO & Co-founder',
          timezone: 'America/Toronto',
          status: 'active',
          color: '#611f69',
        },
        {
          id: 'goz',
          name: 'Goz',
          email: 'goz@ada.cx',
          role: 'CPTO (Chief Product & Technology Officer)',
          timezone: 'America/New_York',
          status: 'active',
          color: '#0084ff',
        },
        {
          id: 'jason',
          name: 'Jason',
          email: 'jason@ada.cx',
          role: 'Account Executive (Sales)',
          timezone: 'America/Los_Angeles',
          status: 'active',
          color: '#31a24c',
        },
        {
          id: 'judy',
          name: 'Judy',
          email: 'judy@ada.cx',
          role: 'Executive Assistant',
          timezone: 'America/Toronto',
          status: 'active',
          color: '#e01e5a',
        },
        {
          id: 'long',
          name: 'Long',
          email: 'long@ada.cx',
          role: 'Chief Financial Officer (CFO)',
          timezone: 'America/New_York',
          status: 'active',
          color: '#ffa500',
        },
      ],
      teams: [
        {
          id: 'team-1',
          name: 'Engineering',
          members: ['user-1', 'user-2'],
        },
      ],
      slackChannels: [
        {
          id: 'channel-1',
          name: 'general',
          isPrivate: false,
          isDM: false,
          isGroupDM: false,
          members: ['user-1', 'user-2', 'user-3'],
          createdAt: new Date(),
          unreadCount: 0,
        },
        {
          id: 'channel-2',
          name: 'engineering',
          isPrivate: false,
          isDM: false,
          isGroupDM: false,
          members: ['user-1', 'user-2'],
          createdAt: new Date(),
          unreadCount: 3,
        },
        {
          id: 'dm-1',
          name: 'Alice Johnson',
          isPrivate: true,
          isDM: true,
          isGroupDM: false,
          members: ['user-1'],
          createdAt: new Date(),
        },
      ],
      slackMessages: [],
      calendarEvents: [
        {
          id: 'event-1',
          title: 'Team Standup',
          startTime: new Date(Date.now() + 3600000),
          endTime: new Date(Date.now() + 5400000),
          attendees: ['user-1', 'user-2'],
          organizer: 'user-1',
          timezone: 'America/Toronto',
          status: 'confirmed',
        },
      ],
      gmailMessages: [],
      traces: [],
      mutations: [],
    };

    return NextResponse.json(state);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch state' },
      { status: 500 }
    );
  }
}
